import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
import {
  decodeDicom,
  voiTransform,
  computeRoiStats,
  getOrientationLabels,
  transformOrientationLabels,
  getImagePlane,
  describeCalibration,
  getPixelValue,
} from '../dicomImageCore';
import { configureCodecs } from '../dicomCodecs';

const require = createRequire(import.meta.url);
// Node không có URL ?url của Vite -> chỉ định đường dẫn tuyệt đối tới file .wasm
configureCodecs({
  locateWasm: (name) =>
    name === 'openjpeg'
      ? require.resolve('@cornerstonejs/codec-openjpeg/decodewasm')
      : require.resolve('@cornerstonejs/codec-charls/decodewasm'),
});

/* ---------- Tiện ích tạo file DICOM tối giản ---------- */
function el(tag, vr, value, be = false) {
  const g = parseInt(tag.slice(0, 4), 16);
  const e = parseInt(tag.slice(4), 16);
  let data;
  if (value instanceof Uint8Array) data = value;
  else if (vr === 'US') {
    data = new Uint8Array(2);
    new DataView(data.buffer).setUint16(0, value, !be);
  } else {
    let s = String(value);
    if (s.length % 2) s += vr === 'UI' ? '\0' : ' ';
    data = new TextEncoder().encode(s);
  }
  const long = ['OB', 'OW', 'SQ', 'UN', 'UT'].includes(vr);
  const head = new Uint8Array(long ? 12 : 8);
  const dv = new DataView(head.buffer);
  dv.setUint16(0, g, !be);
  dv.setUint16(2, e, !be);
  head[4] = vr.charCodeAt(0);
  head[5] = vr.charCodeAt(1);
  if (long) dv.setUint32(8, data.length, !be);
  else dv.setUint16(6, data.length, !be);
  return concat([head, data]);
}
function concat(arrs) {
  const total = arrs.reduce((s, a) => s + a.length, 0);
  const out = new Uint8Array(total);
  let o = 0;
  for (const a of arrs) {
    out.set(a, o);
    o += a.length;
  }
  return out;
}
function encapsulated(frames) {
  const item = (buf) => {
    const h = new Uint8Array(8);
    const dv = new DataView(h.buffer);
    dv.setUint16(0, 0xfffe, true);
    dv.setUint16(2, 0xe000, true);
    const padded = buf.length % 2 ? concat([buf, new Uint8Array(1)]) : buf;
    dv.setUint32(4, padded.length, true);
    return concat([h, padded]);
  };
  const end = new Uint8Array(8);
  new DataView(end.buffer).setUint16(0, 0xfffe, true);
  new DataView(end.buffer).setUint16(2, 0xe0dd, true);
  const head = new Uint8Array(12);
  const dv = new DataView(head.buffer);
  dv.setUint16(0, 0x7fe0, true);
  dv.setUint16(2, 0x0010, true);
  head[4] = 'O'.charCodeAt(0);
  head[5] = 'B'.charCodeAt(0);
  dv.setUint32(8, 0xffffffff, true);
  return concat([head, item(new Uint8Array(0)), ...frames.map(item), end]);
}
function makeDicom(o) {
  const ts = o.ts || '1.2.840.10008.1.2.1';
  const be = ts === '1.2.840.10008.1.2.2';
  const meta = concat([el('00020001', 'OB', new Uint8Array([0, 1])), el('00020010', 'UI', ts)]);
  const gl = new Uint8Array(4);
  new DataView(gl.buffer).setUint32(0, meta.length, true);
  const els = [
    ['00080060', 'CS', o.modality || 'OT'],
    ['00280002', 'US', o.spp || 1],
    ['00280004', 'CS', o.photometric || 'MONOCHROME2'],
    ...(o.planar !== undefined ? [['00280006', 'US', o.planar]] : []),
    ...(o.frames ? [['00280008', 'IS', String(o.frames)]] : []),
    ['00280010', 'US', o.rows],
    ['00280011', 'US', o.cols],
    ['00280100', 'US', o.bits],
    ['00280101', 'US', o.stored || o.bits],
    ['00280102', 'US', (o.stored || o.bits) - 1],
    ['00280103', 'US', o.signed ? 1 : 0],
    ...(o.wc !== undefined ? [['00281050', 'DS', String(o.wc)], ['00281051', 'DS', String(o.ww)]] : []),
    ...(o.intercept !== undefined ? [['00281052', 'DS', String(o.intercept)], ['00281053', 'DS', String(o.slope ?? 1)]] : []),
    ...(o.extra || []),
  ].sort((a, b) => a[0].localeCompare(b[0]));
  const body = els.map(([t, vr, v]) => el(t, vr, v, be));
  const pixel = Array.isArray(o.pixel) ? encapsulated(o.pixel) : el('7fe00010', o.bits === 16 ? 'OW' : 'OB', o.pixel, be);
  return concat([new Uint8Array(128), new TextEncoder().encode('DICM'), el('00020000', 'UL', gl), meta, ...body, pixel]).buffer;
}
function rleEncode(native, n, bits, spp) {
  const bps = bits / 8;
  const segs = [];
  for (let s = 0; s < spp; s++)
    for (let b = bps - 1; b >= 0; b--) {
      const seg = new Uint8Array(n);
      for (let i = 0; i < n; i++) seg[i] = native[(i * spp + s) * bps + b];
      const parts = [];
      for (let i = 0; i < n; i += 128) {
        const c = seg.subarray(i, Math.min(n, i + 128));
        parts.push(new Uint8Array([c.length - 1]), c);
      }
      let enc = concat(parts);
      if (enc.length % 2) enc = concat([enc, new Uint8Array([0x80])]);
      segs.push(enc);
    }
  const header = new Uint8Array(64);
  const dv = new DataView(header.buffer);
  dv.setUint32(0, segs.length, true);
  let off = 64;
  segs.forEach((s, i) => {
    dv.setUint32(4 + i * 4, off, true);
    off += s.length;
  });
  return concat([header, ...segs]);
}

const rows = 6;
const cols = 5;
const n = rows * cols;

describe('Giải mã pixel (độ chính xác giá trị gốc)', () => {
  it('12-bit có dấu: cắt bit rác cao + sign-extend theo BitsStored', async () => {
    const vals = Array.from({ length: n }, (_, i) => i * 100 - 1500);
    const native = new Uint8Array(n * 2);
    const dv = new DataView(native.buffer);
    vals.forEach((v, i) => dv.setUint16(i * 2, ((v & 0x0fff) | 0xf000) & 0xffff, true));
    const r = await decodeDicom(makeDicom({ rows, cols, bits: 16, stored: 12, signed: true, pixel: native }));
    expect(r.decodeInfo.ok).toBe(true);
    expect(Array.from(r.rawPixels)).toEqual(vals);
  });

  it('Big Endian + Rescale -> giá trị Modality đúng', async () => {
    const native = new Uint8Array(n * 2);
    const dv = new DataView(native.buffer);
    for (let i = 0; i < n; i++) dv.setUint16(i * 2, i * 37, false);
    const r = await decodeDicom(makeDicom({ ts: '1.2.840.10008.1.2.2', rows, cols, bits: 16, pixel: native, slope: 2, intercept: -10 }));
    expect(r.decodeInfo.ok).toBe(true);
    expect(getPixelValue(r.rawPixels, r.meta, 4, 1).value).toBe(9 * 37 * 2 - 10);
  });

  it('RLE Lossless 16-bit khớp tuyệt đối', async () => {
    const native = new Uint8Array(n * 2);
    const dv = new DataView(native.buffer);
    for (let i = 0; i < n; i++) dv.setUint16(i * 2, (i * 911) % 65535, true);
    const r = await decodeDicom(makeDicom({ ts: '1.2.840.10008.1.2.5', rows, cols, bits: 16, pixel: [rleEncode(native, n, 16, 1)] }));
    expect(Array.from(r.rawPixels)).toEqual(Array.from({ length: n }, (_, i) => (i * 911) % 65535));
  });

  it('RGB planar=1 -> RGBA đúng thứ tự', async () => {
    const inter = new Uint8Array(n * 3).map((_, i) => (i * 7) % 256);
    const planar = new Uint8Array(n * 3);
    for (let i = 0; i < n; i++) for (let c = 0; c < 3; c++) planar[c * n + i] = inter[i * 3 + c];
    const r = await decodeDicom(makeDicom({ rows, cols, bits: 8, spp: 3, photometric: 'RGB', planar: 1, pixel: planar }));
    expect(r.meta.isColor).toBe(true);
    expect([r.rawPixels[4], r.rawPixels[5], r.rawPixels[6], r.rawPixels[7]]).toEqual([inter[3], inter[4], inter[5], 255]);
  });

  it('Multi-frame native: đọc đúng frame thứ 3', async () => {
    const native = new Uint8Array(n * 2 * 4);
    const dv = new DataView(native.buffer);
    for (let f = 0; f < 4; f++) for (let i = 0; i < n; i++) dv.setUint16((f * n + i) * 2, f * 1000 + i, true);
    const r = await decodeDicom(makeDicom({ rows, cols, bits: 16, frames: 4, pixel: native }), 2);
    expect(r.rawPixels[0]).toBe(2000);
    expect(r.meta.numberOfFrames).toBe(4);
  });

  it('Định dạng chưa hỗ trợ -> báo lỗi rõ, không trả pixel', async () => {
    const r = await decodeDicom(makeDicom({ ts: '1.2.840.10008.1.2.4.203', rows, cols, bits: 16, pixel: [new Uint8Array([1, 2, 3, 4])] }));
    expect(r.decodeInfo.ok).toBe(false);
    expect(r.rawPixels).toBeNull();
    expect(r.decodeInfo.reason).toMatch(/HTJ2K/);
  });

  it('Không có WindowCenter -> cửa sổ tự động theo phân vị (không mặc định 40/400)', async () => {
    const native = new Uint8Array(n * 2);
    const dv = new DataView(native.buffer);
    for (let i = 0; i < n; i++) dv.setUint16(i * 2, 1000 + i * 10, true);
    const r = await decodeDicom(makeDicom({ rows, cols, bits: 16, pixel: native, modality: 'MR' }));
    expect(r.meta.windowSource).toBe('auto');
    expect(r.meta.windowCenter).toBeGreaterThan(1000);
    expect(r.meta.windowCenter).toBeLessThan(1300);
  });
});

describe('Codec WASM (mã hoá thật -> giải mã -> so từng pixel)', () => {
  const W = 64;
  const H = 48;
  const src = new Int16Array(W * H).map((_, i) => ((i * 37) % 3000) - 1024);

  it('JPEG 2000 Lossless 16-bit có dấu', async () => {
    const factory = require('@cornerstonejs/codec-openjpeg/wasmjs');
    const codec = await factory();
    const enc = new codec.J2KEncoder();
    const decodedBuf = enc.getDecodedBuffer({ width: W, height: H, bitsPerSample: 16, componentCount: 1, isSigned: true, isUsingColorTransform: false });
    decodedBuf.set(new Uint8Array(src.buffer));
    enc.setQuality(true, 0);
    enc.encode();
    const j2k = new Uint8Array(enc.getEncodedBuffer());
    const r = await decodeDicom(makeDicom({ ts: '1.2.840.10008.1.2.4.90', rows: H, cols: W, bits: 16, signed: true, pixel: [j2k], intercept: 0, slope: 1 }));
    expect(r.decodeInfo.reason || 'ok').toBe('ok');
    expect(Array.from(r.rawPixels)).toEqual(Array.from(src));
  });

  it('JPEG-LS Lossless 16-bit có dấu', async () => {
    const factory = require('@cornerstonejs/codec-charls/wasmjs');
    const codec = await factory();
    const enc = new codec.JpegLSEncoder();
    const unsigned = new Uint16Array(src.buffer); // JPEG-LS lưu bit pattern không dấu
    const decodedBuf = enc.getDecodedBuffer({ width: W, height: H, bitsPerSample: 16, componentCount: 1 });
    decodedBuf.set(new Uint8Array(unsigned.buffer));
    enc.encode();
    const jls = new Uint8Array(enc.getEncodedBuffer());
    const r = await decodeDicom(makeDicom({ ts: '1.2.840.10008.1.2.4.80', rows: H, cols: W, bits: 16, signed: true, pixel: [jls] }));
    expect(r.decodeInfo.reason || 'ok').toBe('ok');
    expect(Array.from(r.rawPixels)).toEqual(Array.from(src));
  });
});

describe('VOI LUT chuẩn DICOM', () => {
  it('Linear: biên dưới/trên theo PS3.3 C.11.2.1.2', () => {
    expect(voiTransform(-160.5, 40, 400)).toBe(0);
    expect(voiTransform(240, 40, 400)).toBe(255);
    expect(Math.round(voiTransform(40, 40, 400))).toBe(128);
  });
});

describe('Đo đạc & thống kê', () => {
  it('ROI hình chữ nhật: mean/SD/min/max trên giá trị HU', () => {
    const meta = { rows: 2, columns: 2, rescaleSlope: 1, rescaleIntercept: -1024 };
    const px = new Int16Array([1024, 1034, 1044, 1054]); // HU 0,10,20,30
    const s = computeRoiStats(px, meta, 'rect', { x: 0, y: 0 }, { x: 2, y: 2 });
    expect(s.count).toBe(4);
    expect(s.mean).toBe(15);
    expect(s.min).toBe(0);
    expect(s.max).toBe(30);
    expect(s.sd).toBeCloseTo(Math.sqrt(125), 6);
  });

  it('Thiếu Pixel Spacing -> báo chưa hiệu chuẩn', () => {
    expect(describeCalibration({ pixelSpacing: null }).calibrated).toBe(false);
    expect(describeCalibration({ pixelSpacing: [0.14, 0.14], pixelSpacingSource: 'ImagerPixelSpacing' }).warning).toBe(true);
  });
});

describe('Hướng giải phẫu', () => {
  it('CT Axial chuẩn: phải ảnh = L (trái bệnh nhân), trên = A', () => {
    const l = getOrientationLabels({ imageOrientationPatient: [1, 0, 0, 0, 1, 0] });
    expect(l).toMatchObject({ right: 'L', left: 'R', top: 'A', bottom: 'P' });
    expect(getImagePlane({ imageOrientationPatient: [1, 0, 0, 0, 1, 0] })).toBe('Axial');
  });
  it('Lật ngang + xoay 90° cập nhật nhãn đúng', () => {
    const l = getOrientationLabels({ imageOrientationPatient: [1, 0, 0, 0, 1, 0] });
    expect(transformOrientationLabels(l, { flipH: true })).toMatchObject({ left: 'L', right: 'R' });
    expect(transformOrientationLabels(l, { rotation: 90 })).toMatchObject({ top: 'R', right: 'A', bottom: 'L', left: 'P' });
  });
  it('X-quang dùng PatientOrientation', () => {
    expect(getOrientationLabels({ patientOrientation: 'A\\F' })).toMatchObject({ right: 'A', left: 'P', bottom: 'F', top: 'H' });
  });
});

const BE_STORAGE = 'D:/workspace/Homecare_BE/storage/pacs';
const hasRealData = fs.existsSync(path.join(BE_STORAGE, 'study_patient_129.json'));

describe.skipIf(!hasRealData)('Dữ liệu thật', () => {
  it('CT ca 129: HU không khí ≈ -1000, có spacing & orientation', async () => {
    const study = JSON.parse(fs.readFileSync(path.join(BE_STORAGE, 'study_patient_129.json'), 'utf-8'));
    const buf = fs.readFileSync(study.instances[400].filePath);
    const r = await decodeDicom(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
    expect(r.decodeInfo.ok).toBe(true);
    expect(r.meta.pixelSpacingSource).toBe('PixelSpacing');
    expect(getImagePlane(r.meta)).toBe('Axial');
    const corner = getPixelValue(r.rawPixels, r.meta, 260, 20); // vùng không khí phía trước ngực
    expect(corner.value).toBeLessThan(-900);
  });

  it('DX (c+) 3072x2492: ưu tiên PixelSpacing, window từ DICOM', async () => {
    const f = 'D:/workspace/Homecare_BE/c+/00_819392521274/0000/1.3.10001.1.1.dcm';
    if (!fs.existsSync(f)) return;
    const buf = fs.readFileSync(f);
    const r = await decodeDicom(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
    expect(r.decodeInfo.ok).toBe(true);
    expect(r.meta.rows).toBe(3072);
    expect(r.meta.pixelSpacing).toEqual([0.14, 0.14]);
    expect(r.meta.windowCenter).toBe(7664);
    expect(r.meta.bitsStored).toBe(15);
  });
});
