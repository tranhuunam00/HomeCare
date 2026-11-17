import * as dicomParser from 'dicom-parser';
import {
  getTransferSyntaxInfo,
  decodeRle,
  decodeJpegBaseline,
  decodeJpegLossless,
  decodeJpeg2000,
  decodeJpegLs,
} from './dicomCodecs';

/**
 * LÕI XỬ LÝ ẢNH DICOM CHO BÁC SĨ ĐỌC
 * ------------------------------------------------------------------
 * Nguyên tắc an toàn y tế:
 *  1. Giữ nguyên giá trị lưu trữ gốc (16-bit) -> mọi WW/WL, HU, đo đạc tính trên dữ liệu thật.
 *  2. Định dạng không giải được -> trả decodeInfo.ok = false + lý do, KHÔNG vẽ ảnh đoán bừa.
 *  3. Đo đạc chỉ ra mm khi có nguồn hiệu chuẩn (PixelSpacing / ImagerPixelSpacing / US Region),
 *     ngược lại hiển thị đơn vị pixel kèm cảnh báo.
 */

/* ======================= Đọc header ======================= */

const str = (ds, tag) => {
  try {
    const v = ds?.string(tag);
    return v === undefined || v === null ? '' : String(v).trim();
  } catch {
    return '';
  }
};

const numList = (ds, tag) => {
  const s = str(ds, tag);
  if (!s) return null;
  const parts = s.split('\\').map((p) => parseFloat(p.trim()));
  return parts.length && parts.every((p) => Number.isFinite(p)) ? parts : null;
};

const firstNum = (ds, tag) => {
  const l = numList(ds, tag);
  return l ? l[0] : undefined;
};

const formatDicomDate = (raw) =>
  raw && raw.length === 8 ? `${raw.slice(6, 8)}/${raw.slice(4, 6)}/${raw.slice(0, 4)}` : raw || '';

const formatDicomTime = (raw) =>
  raw && raw.length >= 4 ? `${raw.slice(0, 2)}:${raw.slice(2, 4)}${raw.length >= 6 ? ':' + raw.slice(4, 6) : ''}` : raw || '';

/** Lấy dataset item đầu tiên của 1 sequence (dùng cho Functional Groups / US Regions) */
const seqItem = (ds, tag, index = 0) => ds?.elements?.[tag]?.items?.[index]?.dataSet || null;

function resolvePixelSpacing(ds, frameIndex) {
  // 1. Enhanced multi-frame: Per-frame / Shared Functional Groups -> Pixel Measures Sequence
  const perFrame = seqItem(seqItem(ds, 'x52009230', frameIndex), 'x00289110');
  const shared = seqItem(seqItem(ds, 'x52009229'), 'x00289110');
  for (const fg of [perFrame, shared]) {
    const ps = numList(fg, 'x00280030');
    if (ps && ps.length >= 2 && ps[0] > 0 && ps[1] > 0) {
      return { pixelSpacing: [ps[0], ps[1]], source: 'PixelSpacing', sliceThickness: firstNum(fg, 'x00180050') };
    }
  }
  // 2. Pixel Spacing (khoảng cách trong cơ thể bệnh nhân) - chuẩn cho CT/MR
  const ps = numList(ds, 'x00280030');
  if (ps && ps.length >= 2 && ps[0] > 0 && ps[1] > 0) {
    return { pixelSpacing: [ps[0], ps[1]], source: 'PixelSpacing' };
  }
  // 3. Imager Pixel Spacing (tại mặt phẳng detector) - X-quang CR/DX, có độ phóng đại hình học
  const ips = numList(ds, 'x00181164');
  if (ips && ips.length >= 2 && ips[0] > 0 && ips[1] > 0) {
    return { pixelSpacing: [ips[0], ips[1]], source: 'ImagerPixelSpacing' };
  }
  // 4. Siêu âm: Sequence of Ultrasound Regions, đơn vị cm (3)
  const region = seqItem(ds, 'x00186011');
  if (region) {
    try {
      const unitsX = region.uint16('x00186024');
      const unitsY = region.uint16('x00186026');
      const dx = region.double('x0018602c');
      const dy = region.double('x0018602e');
      if (unitsX === 3 && unitsY === 3 && dx > 0 && dy > 0) {
        return { pixelSpacing: [dy * 10, dx * 10], source: 'UltrasoundRegion' };
      }
    } catch {
      /* ignore */
    }
  }
  return { pixelSpacing: null, source: null };
}

function resolvePlaneGeometry(ds, frameIndex) {
  const perFrame = seqItem(ds, 'x52009230', frameIndex);
  const shared = seqItem(ds, 'x52009229');
  const iop =
    numList(seqItem(perFrame, 'x00209116'), 'x00200037') ||
    numList(seqItem(shared, 'x00209116'), 'x00200037') ||
    numList(ds, 'x00200037');
  const ipp =
    numList(seqItem(perFrame, 'x00209113'), 'x00200032') ||
    numList(ds, 'x00200032');
  return {
    imageOrientationPatient: iop && iop.length === 6 ? iop : null,
    imagePositionPatient: ipp && ipp.length === 3 ? ipp : null,
  };
}

function resolveVoi(ds, frameIndex) {
  const perFrameVoi = seqItem(seqItem(ds, 'x52009230', frameIndex), 'x00289132');
  const sharedVoi = seqItem(seqItem(ds, 'x52009229'), 'x00289132');
  const src = [perFrameVoi, sharedVoi, ds].find((d) => d && numList(d, 'x00281050'));
  const centers = (src && numList(src, 'x00281050')) || [];
  const widths = (src && numList(src, 'x00281051')) || [];
  const explanations = (src ? str(src, 'x00281055') : '').split('\\');
  const presets = centers
    .map((c, i) => ({ center: c, width: widths[i] ?? widths[0], explanation: explanations[i] || '' }))
    .filter((p) => Number.isFinite(p.center) && Number.isFinite(p.width) && p.width >= 1);
  const voiLutFunction = (str(src || ds, 'x00281056') || 'LINEAR').toUpperCase();
  return { presets, voiLutFunction };
}

function resolveRescale(ds, frameIndex) {
  const perFrame = seqItem(seqItem(ds, 'x52009230', frameIndex), 'x00289145');
  const shared = seqItem(seqItem(ds, 'x52009229'), 'x00289145');
  const src = [perFrame, shared, ds].find((d) => d && str(d, 'x00281053'));
  const slope = src ? firstNum(src, 'x00281053') : undefined;
  const intercept = src ? firstNum(src, 'x00281052') : undefined;
  return {
    rescaleSlope: Number.isFinite(slope) && slope !== 0 ? slope : 1,
    rescaleIntercept: Number.isFinite(intercept) ? intercept : 0,
    rescaleType: str(src || ds, 'x00281054'),
  };
}

/**
 * Trích xuất toàn bộ metadata phục vụ hiển thị chẩn đoán.
 */
export function extractMeta(ds, frameIndex = 0) {
  const rawSex = str(ds, 'x00100040').toUpperCase();
  const transferSyntaxUid = str(ds, 'x00020010') || '1.2.840.10008.1.2';
  const tsInfo = getTransferSyntaxInfo(transferSyntaxUid);
  const spacing = resolvePixelSpacing(ds, frameIndex);
  const geometry = resolvePlaneGeometry(ds, frameIndex);
  const voi = resolveVoi(ds, frameIndex);
  const rescale = resolveRescale(ds, frameIndex);
  const bitsAllocated = ds.uint16('x00280100') || 16;
  const lossyTag = str(ds, 'x00282110');

  return {
    // Bệnh nhân / ca chụp
    patientName: str(ds, 'x00100010').replace(/\^/g, ' ').trim(),
    patientId: str(ds, 'x00100020'),
    patientBirthDate: formatDicomDate(str(ds, 'x00100030')),
    patientSex: rawSex === 'M' ? 'Nam' : rawSex === 'F' ? 'Nữ' : rawSex === 'O' ? 'Khác' : rawSex,
    patientAge: str(ds, 'x00101010'),
    studyDate: formatDicomDate(str(ds, 'x00080020')),
    studyTime: formatDicomTime(str(ds, 'x00080030')),
    studyDescription: str(ds, 'x00081030'),
    accessionNumber: str(ds, 'x00080050'),
    institutionName: str(ds, 'x00080080'),
    manufacturer: str(ds, 'x00080070'),
    modality: str(ds, 'x00080060'),
    studyInstanceUid: str(ds, 'x0020000d'),
    seriesInstanceUid: str(ds, 'x0020000e'),
    sopInstanceUid: str(ds, 'x00080018'),
    sopClassUid: str(ds, 'x00080016'),
    seriesNumber: firstNum(ds, 'x00200011'),
    seriesDescription: str(ds, 'x0008103e'),
    instanceNumber: firstNum(ds, 'x00200013'),
    bodyPartExamined: str(ds, 'x00180015'),
    laterality: str(ds, 'x00200060') || str(ds, 'x00200062'),
    viewPosition: str(ds, 'x00185101'),
    patientOrientation: str(ds, 'x00200020'),
    // Kỹ thuật chụp
    sliceThickness: spacing.sliceThickness ?? firstNum(ds, 'x00180050'),
    sliceLocation: firstNum(ds, 'x00201041'),
    kvp: firstNum(ds, 'x00180060'),
    exposureMas: firstNum(ds, 'x00181152'),
    repetitionTime: firstNum(ds, 'x00180080'),
    echoTime: firstNum(ds, 'x00180081'),
    magneticFieldStrength: firstNum(ds, 'x00180087'),
    contrastAgent: str(ds, 'x00180010'),
    // Pixel module
    rows: ds.uint16('x00280010') || 0,
    columns: ds.uint16('x00280011') || 0,
    samplesPerPixel: ds.uint16('x00280002') || 1,
    photometricInterpretation: (str(ds, 'x00280004') || 'MONOCHROME2').toUpperCase(),
    planarConfiguration: ds.uint16('x00280006') || 0,
    bitsAllocated,
    bitsStored: ds.uint16('x00280101') || bitsAllocated,
    highBit: ds.uint16('x00280102'),
    pixelRepresentation: ds.uint16('x00280103') || 0,
    numberOfFrames: parseInt(str(ds, 'x00280008') || '1', 10) || 1,
    frameIndex,
    pixelPaddingValue: ds.elements.x00280120 ? (ds.uint16('x00280103') ? ds.int16('x00280120') : ds.uint16('x00280120')) : undefined,
    ...rescale,
    // Hiệu chuẩn đo đạc
    pixelSpacing: spacing.pixelSpacing,
    pixelSpacingSource: spacing.source,
    // Hình học mặt phẳng
    ...geometry,
    // VOI
    windowPresets: voi.presets,
    voiLutFunction: voi.voiLutFunction,
    windowCenter: voi.presets[0]?.center,
    windowWidth: voi.presets[0]?.width,
    windowSource: voi.presets.length ? 'dicom' : 'auto',
    // Nén / chất lượng
    transferSyntaxUid,
    transferSyntaxName: tsInfo.name,
    lossyCompression: lossyTag === '01' || !!tsInfo.lossy,
    lossyCompressionRatio: firstNum(ds, 'x00282112'),
    burnedInAnnotation: str(ds, 'x00280301'),
  };
}

/* ======================= Giải mã pixel ======================= */

function getFrameBytes(ds, byteArray, frameIndex, frameSize) {
  const pe = ds.elements.x7fe00010;
  if (pe.encapsulatedPixelData) {
    const numberOfFrames = parseInt(str(ds, 'x00280008') || '1', 10) || 1;
    if (pe.basicOffsetTable && pe.basicOffsetTable.length) {
      return dicomParser.readEncapsulatedImageFrame(ds, pe, frameIndex);
    }
    if (numberOfFrames === 1) {
      return dicomParser.readEncapsulatedPixelDataFromFragments(ds, pe, 0, pe.fragments.length);
    }
    if (pe.fragments.length === numberOfFrames) {
      return dicomParser.readEncapsulatedPixelDataFromFragments(ds, pe, frameIndex, 1);
    }
    const bot = dicomParser.createJPEGBasicOffsetTable(ds, pe);
    return dicomParser.readEncapsulatedImageFrame(ds, pe, frameIndex, bot);
  }
  // Native: dữ liệu 1-bit chưa hỗ trợ
  const offset = pe.dataOffset + frameIndex * frameSize;
  if (offset + frameSize > byteArray.length + 1) {
    throw new Error(`Thiếu dữ liệu pixel cho frame #${frameIndex + 1}`);
  }
  return byteArray.subarray(offset, Math.min(byteArray.length, offset + frameSize));
}

/** Chuẩn hoá giá trị lưu trữ: cắt theo BitsStored + mở rộng dấu (sign-extend) */
function normalizeStored(source, meta, bigEndian) {
  const n = meta.rows * meta.columns;
  const { bitsAllocated, bitsStored, pixelRepresentation } = meta;
  const signed = pixelRepresentation === 1;
  const mask = bitsStored >= 32 ? 0xffffffff : 2 ** bitsStored - 1;
  const signBit = 2 ** (bitsStored - 1);
  const full = 2 ** bitsStored;
  const out = signed ? (bitsStored <= 8 ? new Int8Array(n) : new Int16Array(n)) : bitsStored <= 8 ? new Uint8Array(n) : new Uint16Array(n);

  if (source instanceof Uint8Array && bitsAllocated === 16) {
    // Byte thô -> đọc 16-bit theo endianness
    const dv = new DataView(source.buffer, source.byteOffset, source.byteLength);
    const limit = Math.min(n, Math.floor(source.byteLength / 2));
    for (let i = 0; i < limit; i++) {
      let v = dv.getUint16(i * 2, !bigEndian) & mask;
      if (signed && v >= signBit) v -= full;
      out[i] = v;
    }
    return out;
  }
  const limit = Math.min(n, source.length);
  for (let i = 0; i < limit; i++) {
    let v = source[i] & mask;
    if (signed && v >= signBit) v -= full;
    out[i] = v;
  }
  return out;
}

function ybrFullToRgba(src, n, planar) {
  const out = new Uint8ClampedArray(n * 4);
  for (let i = 0; i < n; i++) {
    const y = planar ? src[i] : src[i * 3];
    const cb = (planar ? src[i + n] : src[i * 3 + 1]) - 128;
    const cr = (planar ? src[i + 2 * n] : src[i * 3 + 2]) - 128;
    out[i * 4] = y + 1.402 * cr;
    out[i * 4 + 1] = y - 0.344136 * cb - 0.714136 * cr;
    out[i * 4 + 2] = y + 1.772 * cb;
    out[i * 4 + 3] = 255;
  }
  return out;
}

function rgbToRgba(src, n, planar) {
  const out = new Uint8ClampedArray(n * 4);
  for (let i = 0; i < n; i++) {
    out[i * 4] = planar ? src[i] : src[i * 3];
    out[i * 4 + 1] = planar ? src[i + n] : src[i * 3 + 1];
    out[i * 4 + 2] = planar ? src[i + 2 * n] : src[i * 3 + 2];
    out[i * 4 + 3] = 255;
  }
  return out;
}

function paletteToRgba(ds, indices, n) {
  const readLut = (descTag, dataTag) => {
    const desc = ds.elements[descTag];
    const entries = ds.uint16(descTag, 0) || 65536;
    const first = desc && desc.length >= 4 ? (desc.vr === 'SS' ? ds.int16(descTag, 1) : ds.uint16(descTag, 1)) : 0;
    const bits = ds.uint16(descTag, 2) || 16;
    const el = ds.elements[dataTag];
    if (!el) throw new Error('Thiếu Palette Color LUT');
    const data = new Uint16Array(entries);
    for (let i = 0; i < entries; i++) data[i] = ds.uint16(dataTag, i);
    const shift = bits === 16 ? 8 : 0;
    return { entries, first, data, shift };
  };
  const r = readLut('x00281101', 'x00281201');
  const g = readLut('x00281102', 'x00281202');
  const b = readLut('x00281103', 'x00281203');
  const out = new Uint8ClampedArray(n * 4);
  const lookup = (lut, v) => {
    let idx = v - lut.first;
    if (idx < 0) idx = 0;
    else if (idx >= lut.entries) idx = lut.entries - 1;
    return lut.data[idx] >> lut.shift;
  };
  for (let i = 0; i < n; i++) {
    const v = indices[i];
    out[i * 4] = lookup(r, v);
    out[i * 4 + 1] = lookup(g, v);
    out[i * 4 + 2] = lookup(b, v);
    out[i * 4 + 3] = 255;
  }
  return out;
}

/** Min/Max của giá trị lưu trữ (bỏ Pixel Padding) */
function storedMinMax(pixels, padding) {
  let min = Infinity;
  let max = -Infinity;
  for (let i = 0; i < pixels.length; i++) {
    const v = pixels[i];
    if (v === padding) continue;
    if (v < min) min = v;
    if (v > max) max = v;
  }
  if (min === Infinity) {
    min = 0;
    max = 0;
  }
  return { min, max };
}

/**
 * Cửa sổ tự động khi DICOM không có WindowCenter/Width:
 * phân vị 0.5% - 99.5% của giá trị Modality (bỏ padding) để ảnh MR/CR/DX không bị trắng xoá/đen kịt.
 */
export function computeAutoWindow(pixels, meta, storedMin, storedMax) {
  const slope = meta.rescaleSlope || 1;
  const intercept = meta.rescaleIntercept || 0;
  if (storedMax <= storedMin) {
    const v = storedMin * slope + intercept;
    return { center: v, width: Math.max(1, Math.abs(slope)) };
  }
  const range = storedMax - storedMin + 1;
  const bins = Math.min(range, 65536);
  const hist = new Uint32Array(bins);
  const scale = (bins - 1) / (storedMax - storedMin);
  let count = 0;
  for (let i = 0; i < pixels.length; i++) {
    const v = pixels[i];
    if (v === meta.pixelPaddingValue || v < storedMin || v > storedMax) continue;
    hist[Math.floor((v - storedMin) * scale)]++;
    count++;
  }
  const findBin = (target) => {
    let acc = 0;
    for (let b = 0; b < bins; b++) {
      acc += hist[b];
      if (acc >= target) return b;
    }
    return bins - 1;
  };
  const lo = storedMin + findBin(count * 0.005) / scale;
  const hi = storedMin + findBin(count * 0.995) / scale;
  const a = lo * slope + intercept;
  const b = hi * slope + intercept;
  const low = Math.min(a, b);
  const width = Math.max(1, Math.abs(b - a));
  return { center: low + width / 2, width };
}

function unsupported(meta, reason) {
  return {
    meta,
    rawPixels: null,
    decodeInfo: {
      ok: false,
      reason,
      transferSyntax: meta?.transferSyntaxName,
      lossy: meta?.lossyCompression,
    },
  };
}

/**
 * Giải mã 1 frame DICOM (async vì có codec WASM / ImageBitmap).
 * @returns {{ meta, rawPixels, decodeInfo }}
 *   - Ảnh xám: rawPixels = TypedArray giá trị lưu trữ đã chuẩn hoá (chưa nhân rescale)
 *   - Ảnh màu: rawPixels = Uint8ClampedArray RGBA, meta.isColor = true
 */
export async function decodeDicom(arrayBuffer, frameIndex = 0, preParsed = null) {
  const byteArray = new Uint8Array(arrayBuffer);
  let ds = preParsed;
  try {
    if (!ds) ds = dicomParser.parseDicom(byteArray);
  } catch (err) {
    return unsupported(null, `File không phải DICOM hợp lệ: ${err.message || err}`);
  }

  const meta = extractMeta(ds, frameIndex);
  const pe = ds.elements.x7fe00010;
  if (!pe || !meta.rows || !meta.columns) {
    return unsupported(meta, 'File DICOM không chứa dữ liệu ảnh (Pixel Data) - có thể là báo cáo SR / PDF nhúng');
  }
  if (frameIndex >= meta.numberOfFrames) {
    return unsupported(meta, `Frame #${frameIndex + 1} vượt quá số frame (${meta.numberOfFrames})`);
  }
  if (![1, 8, 16].includes(meta.bitsAllocated) || meta.bitsAllocated === 1) {
    return unsupported(meta, `BitsAllocated = ${meta.bitsAllocated} chưa được hỗ trợ`);
  }

  const ts = getTransferSyntaxInfo(meta.transferSyntaxUid);
  const n = meta.rows * meta.columns;
  const spp = meta.samplesPerPixel;
  const frameSize = n * spp * (meta.bitsAllocated / 8);

  let frame;
  try {
    frame = getFrameBytes(ds, byteArray, frameIndex, frameSize);
  } catch (err) {
    return unsupported(meta, err.message || 'Không đọc được frame ảnh');
  }

  let samples; // dữ liệu sau giải nén (interleaved nếu đến từ codec)
  let planar = meta.planarConfiguration === 1;
  let bigEndian = false;
  let alreadyRgb = false;
  try {
    switch (ts.codec) {
      case 'native':
        samples = frame;
        break;
      case 'native-be':
        samples = frame;
        bigEndian = true;
        break;
      case 'rle':
        samples = decodeRle(frame, meta.rows, meta.columns, meta.bitsAllocated, spp).pixels;
        planar = false;
        break;
      case 'jpeg-baseline': {
        const r = await decodeJpegBaseline(frame, meta.rows, meta.columns, spp);
        samples = r.pixels;
        alreadyRgb = !!r.alreadyRgb;
        planar = false;
        break;
      }
      case 'jpeg-lossless':
        samples = (await decodeJpegLossless(frame, meta.bitsAllocated)).pixels;
        planar = false;
        break;
      case 'j2k':
        samples = (await decodeJpeg2000(frame)).pixels;
        planar = false;
        break;
      case 'jpeg-ls':
        samples = (await decodeJpegLs(frame)).pixels;
        planar = false;
        break;
      default:
        return unsupported(meta, `Định dạng nén "${ts.name}" chưa được hỗ trợ giải mã`);
    }
  } catch (err) {
    return unsupported(meta, `Lỗi giải nén ${ts.name}: ${err.message || err}`);
  }

  const decodeInfo = {
    ok: true,
    transferSyntax: ts.name,
    codec: ts.codec,
    lossy: meta.lossyCompression,
  };

  const photometric = meta.photometricInterpretation;

  // ---------- Ảnh màu ----------
  if (spp === 3) {
    if (meta.bitsAllocated !== 8) return unsupported(meta, 'Ảnh màu 16-bit chưa được hỗ trợ');
    const src = samples instanceof Uint8Array || samples instanceof Uint8ClampedArray ? samples : new Uint8Array(samples.buffer);
    let rgba;
    if (alreadyRgb) rgba = rgbToRgba(src, n, false);
    else if (photometric === 'RGB') rgba = rgbToRgba(src, n, planar);
    else if (photometric === 'YBR_FULL_422' && (ts.codec === 'native' || ts.codec === 'native-be')) {
      return unsupported(meta, 'YBR_FULL_422 không nén (lấy mẫu màu 4:2:2) chưa được hỗ trợ');
    } else if (photometric === 'YBR_FULL' || photometric === 'YBR_FULL_422') {
      // Codec JPEG/J2K đã tự chuyển màu khi giải nén (YBR_ICT/RCT); native YBR_FULL cần chuyển thủ công
      rgba = ts.codec === 'native' || ts.codec === 'native-be' || ts.codec === 'rle' ? ybrFullToRgba(src, n, planar) : rgbToRgba(src, n, false);
    } else if (photometric === 'YBR_RCT' || photometric === 'YBR_ICT') rgba = rgbToRgba(src, n, false);
    else return unsupported(meta, `Photometric ${photometric} chưa được hỗ trợ`);
    return {
      meta: { ...meta, isColor: true, windowCenter: 127.5, windowWidth: 256, windowSource: 'color' },
      rawPixels: rgba,
      decodeInfo,
    };
  }

  // ---------- Palette Color ----------
  if (photometric === 'PALETTE COLOR') {
    try {
      const indices = normalizeStored(samples, { ...meta, pixelRepresentation: 0 }, bigEndian);
      return {
        meta: { ...meta, isColor: true, windowCenter: 127.5, windowWidth: 256, windowSource: 'color' },
        rawPixels: paletteToRgba(ds, indices, n),
        decodeInfo,
      };
    } catch (err) {
      return unsupported(meta, `Không đọc được Palette Color: ${err.message}`);
    }
  }

  if (photometric !== 'MONOCHROME1' && photometric !== 'MONOCHROME2') {
    return unsupported(meta, `Photometric ${photometric} chưa được hỗ trợ`);
  }

  // ---------- Ảnh xám ----------
  const rawPixels = normalizeStored(samples, meta, bigEndian);
  const { min, max } = storedMinMax(rawPixels, meta.pixelPaddingValue);
  const slope = meta.rescaleSlope;
  const intercept = meta.rescaleIntercept;
  const mv1 = min * slope + intercept;
  const mv2 = max * slope + intercept;
  const finalMeta = {
    ...meta,
    isColor: false,
    minStoredValue: min,
    maxStoredValue: max,
    minPixelValue: Math.min(mv1, mv2),
    maxPixelValue: Math.max(mv1, mv2),
  };
  if (!meta.windowPresets.length) {
    const auto = computeAutoWindow(rawPixels, finalMeta, min, max);
    finalMeta.windowCenter = auto.center;
    finalMeta.windowWidth = auto.width;
    finalMeta.windowSource = 'auto';
  }

  return { meta: finalMeta, rawPixels, decodeInfo };
}

/**
 * Bản đồng bộ (tương thích code cũ & unit test): chỉ giải các định dạng KHÔNG nén.
 * Định dạng nén trả rawPixels = null + decodeInfo.ok = false.
 */
export function decodeDicomSync(arrayBuffer, frameIndex = 0) {
  const byteArray = new Uint8Array(arrayBuffer);
  let ds;
  try {
    ds = dicomParser.parseDicom(byteArray);
  } catch (err) {
    return unsupported(null, `File không phải DICOM hợp lệ: ${err.message || err}`);
  }
  const meta = extractMeta(ds, frameIndex);
  const ts = getTransferSyntaxInfo(meta.transferSyntaxUid);
  if (!ds.elements.x7fe00010 || !meta.rows) return unsupported(meta, 'Không có dữ liệu ảnh');
  if (ts.codec !== 'native' && ts.codec !== 'native-be') {
    return unsupported(meta, `${ts.name} cần giải mã bất đồng bộ`);
  }
  const n = meta.rows * meta.columns;
  const frame = getFrameBytes(ds, byteArray, frameIndex, n * meta.samplesPerPixel * (meta.bitsAllocated / 8));
  if (meta.samplesPerPixel === 3 || meta.photometricInterpretation === 'PALETTE COLOR') {
    return unsupported(meta, 'Ảnh màu cần giải mã bất đồng bộ');
  }
  const rawPixels = normalizeStored(frame, meta, ts.codec === 'native-be');
  const { min, max } = storedMinMax(rawPixels, meta.pixelPaddingValue);
  const finalMeta = { ...meta, isColor: false, minStoredValue: min, maxStoredValue: max };
  if (!meta.windowPresets.length) {
    const auto = computeAutoWindow(rawPixels, finalMeta, min, max);
    finalMeta.windowCenter = auto.center;
    finalMeta.windowWidth = auto.width;
  }
  return { meta: finalMeta, rawPixels, decodeInfo: { ok: true, transferSyntax: ts.name, codec: ts.codec, lossy: meta.lossyCompression } };
}

/* ======================= VOI LUT & hiển thị ======================= */

/** Hàm VOI theo DICOM PS3.3 C.11.2.1.2 -> giá trị hiển thị [0..255] */
export function voiTransform(x, center, width, fn = 'LINEAR') {
  if (fn === 'LINEAR_EXACT') {
    if (x <= center - width / 2) return 0;
    if (x > center + width / 2) return 255;
    return ((x - center) / width + 0.5) * 255;
  }
  if (fn === 'SIGMOID') {
    return 255 / (1 + Math.exp((-4 * (x - center)) / width));
  }
  const w = Math.max(1, width);
  const lower = center - 0.5 - (w - 1) / 2;
  const upper = center - 0.5 + (w - 1) / 2;
  if (x <= lower) return 0;
  if (x > upper) return 255;
  return ((x - (center - 0.5)) / Math.max(1, w - 1) + 0.5) * 255;
}

const PSEUDO_COLOR = {
  rainbow: (i) => {
    if (i < 64) return [0, i * 4, 255];
    if (i < 128) return [0, 255, 255 - (i - 64) * 4];
    if (i < 192) return [(i - 128) * 4, 255, 0];
    return [255, 255 - (i - 192) * 4, 0];
  },
  hot_iron: (i) => [Math.min(255, i * 1.5), Math.min(255, Math.max(0, (i - 85) * 2)), Math.min(255, Math.max(0, (i - 170) * 3))],
};

/**
 * Bảng tra cứu (LUT) giá trị lưu trữ -> RGBA đóng gói Uint32, tính 1 lần cho mỗi WW/WL.
 * Ảnh X-quang 3072x2492 kéo WW/WL vẫn mượt vì vòng lặp chỉ còn 1 phép tra mảng/pixel.
 */
function buildMonoLut(meta, windowCenter, windowWidth, invert, colorLut, threshold = null) {
  const minS = meta.minStoredValue ?? -32768;
  const maxS = meta.maxStoredValue ?? 65535;
  const size = maxS - minS + 1;
  if (size <= 0 || size > 1 << 20) return null;
  const lut = new Uint32Array(size);
  const slope = meta.rescaleSlope || 1;
  const intercept = meta.rescaleIntercept || 0;
  const mono1 = meta.photometricInterpretation === 'MONOCHROME1';
  const doInvert = invert || colorLut === 'inverted';
  const pseudo = PSEUDO_COLOR[colorLut];
  const littleEndian = new Uint8Array(new Uint32Array([1]).buffer)[0] === 1;
  const hasThreshold = threshold && Array.isArray(threshold.color);

  for (let s = 0; s < size; s++) {
    const hu = (s + minS) * slope + intercept;
    if (hasThreshold && hu >= threshold.min && hu <= threshold.max) {
      const tr = threshold.color[0];
      const tg = threshold.color[1];
      const tb = threshold.color[2];
      lut[s] = littleEndian ? (255 << 24) | (tb << 16) | (tg << 8) | tr : (tr << 24) | (tg << 16) | (tb << 8) | 255;
      continue;
    }
    let v = Math.round(voiTransform(hu, windowCenter, windowWidth, meta.voiLutFunction));
    if (v < 0) v = 0;
    else if (v > 255) v = 255;
    if (mono1) v = 255 - v;
    if (doInvert) v = 255 - v;
    let r = v;
    let g = v;
    let b = v;
    if (pseudo) [r, g, b] = pseudo(v).map((c) => Math.round(c));
    lut[s] = littleEndian ? (255 << 24) | (b << 16) | (g << 8) | r : (r << 24) | (g << 16) | (b << 8) | 255;
  }
  return { lut, minS };
}

/**
 * Tái sử dụng ImageData theo từng canvas: ảnh X-quang 3000x2500 = 30MB/lần cấp phát -> GC giật khi kéo WW/WL.
 * putImageData ghi đè toàn bộ nên không cần xoá bộ đệm cũ.
 */
const imageDataByCanvas = new WeakMap();
function getReusableImageData(canvas, ctx, columns, rows) {
  const cached = imageDataByCanvas.get(canvas);
  if (cached && cached.width === columns && cached.height === rows) return cached;
  const img = ctx.createImageData(columns, rows);
  imageDataByCanvas.set(canvas, img);
  return img;
}

/**
 * LUT theo (meta, WW/WL, invert, màu): cuộn qua lát cùng series, lưới 2x2 nhiều ô cùng cửa sổ
 * -> dùng lại LUT thay vì dựng lại (dải 16-bit = 65k phần tử mỗi lần).
 */
const LUT_CACHE_MAX = 24;
const lutCache = new Map();
function getCachedMonoLut(meta, windowCenter, windowWidth, invert, colorLut, threshold = null) {
  const key = [
    meta.minStoredValue,
    meta.maxStoredValue,
    meta.rescaleSlope,
    meta.rescaleIntercept,
    meta.photometricInterpretation,
    meta.voiLutFunction,
    windowCenter,
    windowWidth,
    invert ? 1 : 0,
    colorLut,
    threshold ? `${threshold.key || threshold.min}_${threshold.max}` : 'none',
  ].join('|');
  const hit = lutCache.get(key);
  if (hit !== undefined) {
    lutCache.delete(key);
    lutCache.set(key, hit); // LRU
    return hit;
  }
  const built = buildMonoLut(meta, windowCenter, windowWidth, invert, colorLut, threshold);
  lutCache.set(key, built);
  if (lutCache.size > LUT_CACHE_MAX) lutCache.delete(lutCache.keys().next().value);
  return built;
}

/**
 * Vẽ ảnh DICOM (đã giải mã) lên canvas với WW/WL hiện tại.
 * Canvas luôn có kích thước = ma trận ảnh gốc (1 pixel canvas = 1 pixel DICOM) -> đo đạc chính xác.
 */
export function renderImageToCanvas(canvas, rawPixels, meta, options = {}) {
  const windowCenter = options.windowCenter ?? meta.windowCenter ?? 127.5;
  const windowWidth = options.windowWidth ?? meta.windowWidth ?? 256;
  const invert = !!options.invert;
  const colorLut = options.colorLut || 'default';
  const isSmooth = options.isSmooth !== undefined ? options.isSmooth : true;
  const ctx = canvas.getContext('2d');

  // Ảnh Non-DICOM / Web preview (HTMLImageElement / ImageBitmap)
  if (typeof HTMLImageElement !== 'undefined' && (rawPixels instanceof HTMLImageElement || (typeof ImageBitmap !== 'undefined' && rawPixels instanceof ImageBitmap))) {
    const w = meta.columns || rawPixels.naturalWidth || rawPixels.width;
    const h = meta.rows || rawPixels.naturalHeight || rawPixels.height;
    if (canvas.width !== w) canvas.width = w;
    if (canvas.height !== h) canvas.height = h;
    ctx.imageSmoothingEnabled = isSmooth;
    ctx.drawImage(rawPixels, 0, 0, w, h);
    if (invert) {
      const img = ctx.getImageData(0, 0, w, h);
      const d = img.data;
      for (let j = 0; j < d.length; j += 4) {
        d[j] = 255 - d[j];
        d[j + 1] = 255 - d[j + 1];
        d[j + 2] = 255 - d[j + 2];
      }
      ctx.putImageData(img, 0, 0);
    }
    return;
  }

  const columns = meta.columns || 512;
  const rows = meta.rows || 512;
  if (canvas.width !== columns) canvas.width = columns;
  if (canvas.height !== rows) canvas.height = rows;

  if (!rawPixels || rawPixels.length === 0) {
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, columns, rows);
    return;
  }

  const imageData = getReusableImageData(canvas, ctx, columns, rows);
  const n = rows * columns;

  if (meta.isColor) {
    const out = imageData.data;
    const doInvert = invert || colorLut === 'inverted';
    for (let i = 0; i < n * 4; i += 4) {
      out[i] = doInvert ? 255 - rawPixels[i] : rawPixels[i];
      out[i + 1] = doInvert ? 255 - rawPixels[i + 1] : rawPixels[i + 1];
      out[i + 2] = doInvert ? 255 - rawPixels[i + 2] : rawPixels[i + 2];
      out[i + 3] = 255;
    }
    ctx.putImageData(imageData, 0, 0);
    return;
  }

  const lutInfo = getCachedMonoLut(meta, windowCenter, windowWidth, invert, colorLut, options.threshold);
  const out32 = new Uint32Array(imageData.data.buffer);
  if (lutInfo) {
    const { lut, minS } = lutInfo;
    const maxIdx = lut.length - 1;
    for (let i = 0; i < n; i++) {
      let idx = rawPixels[i] - minS;
      if (idx < 0) idx = 0;
      else if (idx > maxIdx) idx = maxIdx;
      out32[i] = lut[idx];
    }
  } else {
    // Dải giá trị quá lớn cho LUT -> tính trực tiếp (hiếm)
    const out = imageData.data;
    const slope = meta.rescaleSlope || 1;
    const intercept = meta.rescaleIntercept || 0;
    const mono1 = meta.photometricInterpretation === 'MONOCHROME1';
    for (let i = 0; i < n; i++) {
      let v = Math.round(voiTransform(rawPixels[i] * slope + intercept, windowCenter, windowWidth, meta.voiLutFunction));
      v = Math.max(0, Math.min(255, v));
      if (mono1) v = 255 - v;
      if (invert) v = 255 - v;
      out[i * 4] = v;
      out[i * 4 + 1] = v;
      out[i * 4 + 2] = v;
      out[i * 4 + 3] = 255;
    }
  }
  ctx.putImageData(imageData, 0, 0);
}

/* ======================= Giá trị pixel & thống kê ROI ======================= */

/** Giá trị Modality (HU với CT) tại toạ độ ảnh (x, y) */
export function getPixelValue(rawPixels, meta, x, y) {
  if (!rawPixels || !meta) return null;
  const col = Math.floor(x);
  const row = Math.floor(y);
  if (col < 0 || row < 0 || col >= meta.columns || row >= meta.rows) return null;
  const idx = row * meta.columns + col;
  if (meta.isColor) {
    return { rgb: [rawPixels[idx * 4], rawPixels[idx * 4 + 1], rawPixels[idx * 4 + 2]] };
  }
  const stored = rawPixels[idx];
  return { stored, value: stored * (meta.rescaleSlope || 1) + (meta.rescaleIntercept || 0) };
}

/** Đơn vị giá trị pixel theo modality */
export function getPixelValueUnit(meta) {
  if (!meta) return '';
  if (meta.modality === 'CT' && (meta.rescaleType || 'HU').toUpperCase() !== 'US') return 'HU';
  if (meta.rescaleType && meta.rescaleType !== 'US') return meta.rescaleType;
  return '';
}

/**
 * Thống kê ROI trên giá trị Modality: mean, SD, min, max, số pixel.
 * shape: 'ellipse' | 'rect'; p1, p2: góc bao (toạ độ ảnh)
 */
export function computeRoiStats(rawPixels, meta, shape, p1, p2) {
  if (!rawPixels || !meta || meta.isColor) return null;
  const x0 = Math.max(0, Math.floor(Math.min(p1.x, p2.x)));
  const x1 = Math.min(meta.columns - 1, Math.ceil(Math.max(p1.x, p2.x)));
  const y0 = Math.max(0, Math.floor(Math.min(p1.y, p2.y)));
  const y1 = Math.min(meta.rows - 1, Math.ceil(Math.max(p1.y, p2.y)));
  const cx = (p1.x + p2.x) / 2;
  const cy = (p1.y + p2.y) / 2;
  const rx = Math.abs(p2.x - p1.x) / 2;
  const ry = Math.abs(p2.y - p1.y) / 2;
  const slope = meta.rescaleSlope || 1;
  const intercept = meta.rescaleIntercept || 0;
  let sum = 0;
  let sumSq = 0;
  let count = 0;
  let min = Infinity;
  let max = -Infinity;
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      if (shape === 'ellipse') {
        if (rx <= 0 || ry <= 0) continue;
        // Tâm pixel nằm trong ellipse
        const dx = (x + 0.5 - cx) / rx;
        const dy = (y + 0.5 - cy) / ry;
        if (dx * dx + dy * dy > 1) continue;
      }
      const v = rawPixels[y * meta.columns + x] * slope + intercept;
      sum += v;
      sumSq += v * v;
      count++;
      if (v < min) min = v;
      if (v > max) max = v;
    }
  }
  if (!count) return null;
  const mean = sum / count;
  const variance = Math.max(0, sumSq / count - mean * mean);
  return { mean, sd: Math.sqrt(variance), min, max, count };
}

/* ======================= Hướng giải phẫu (Orientation) ======================= */

/** Nhãn hướng giải phẫu (L/R, A/P, H/F) cho 1 vector trong hệ toạ độ bệnh nhân LPS */
export function vectorToLabel(v) {
  if (!v) return '';
  const comps = [
    { axis: 0, val: v[0], pos: 'L', neg: 'R' },
    { axis: 1, val: v[1], pos: 'P', neg: 'A' },
    { axis: 2, val: v[2], pos: 'H', neg: 'F' },
  ]
    .filter((c) => Math.abs(c.val) > 0.25)
    .sort((a, b) => Math.abs(b.val) - Math.abs(a.val));
  return comps
    .slice(0, 2)
    .map((c) => (c.val > 0 ? c.pos : c.neg))
    .join('');
}

const OPPOSITE = { L: 'R', R: 'L', A: 'P', P: 'A', H: 'F', F: 'H', S: 'I', I: 'S' };
export const oppositeLabel = (label) => (label || '').split('').map((c) => OPPOSITE[c] || c).join('');

/**
 * Nhãn hướng 4 cạnh ảnh (chưa xoay/lật) từ ImageOrientationPatient hoặc PatientOrientation.
 * @returns {{top,bottom,left,right,source}|null}
 */
export function getOrientationLabels(meta) {
  if (!meta) return null;
  const iop = meta.imageOrientationPatient;
  if (iop && iop.length === 6) {
    const right = vectorToLabel(iop.slice(0, 3)); // hướng tăng chỉ số cột
    const bottom = vectorToLabel(iop.slice(3, 6)); // hướng tăng chỉ số hàng
    if (right || bottom) {
      return { right, left: oppositeLabel(right), bottom, top: oppositeLabel(bottom), source: 'ImageOrientationPatient' };
    }
  }
  const po = meta.patientOrientation;
  if (po && po.includes('\\')) {
    const [rowDir, colDir] = po.split('\\');
    return { right: rowDir, left: oppositeLabel(rowDir), bottom: colDir, top: oppositeLabel(colDir), source: 'PatientOrientation' };
  }
  return null;
}

/**
 * Áp lật/xoay của khung nhìn lên nhãn hướng (thứ tự CSS: lật trước, xoay sau).
 */
export function transformOrientationLabels(labels, { rotation = 0, flipH = false, flipV = false } = {}) {
  if (!labels) return null;
  let { top, bottom, left, right } = labels;
  if (flipH) [left, right] = [right, left];
  if (flipV) [top, bottom] = [bottom, top];
  const steps = (((Math.round(rotation / 90) % 4) + 4) % 4);
  for (let i = 0; i < steps; i++) {
    // Xoay 90° theo chiều kim đồng hồ: trái -> trên, trên -> phải, phải -> dưới, dưới -> trái
    [top, right, bottom, left] = [left, top, right, bottom];
  }
  return { top, bottom, left, right, source: labels.source };
}

/** Mặt phẳng cắt (Axial / Coronal / Sagittal) từ IOP */
export function getImagePlane(meta) {
  const iop = meta?.imageOrientationPatient;
  if (!iop || iop.length !== 6) return '';
  const r = iop.slice(0, 3);
  const c = iop.slice(3, 6);
  const n = [r[1] * c[2] - r[2] * c[1], r[2] * c[0] - r[0] * c[2], r[0] * c[1] - r[1] * c[0]];
  const ax = n.map(Math.abs);
  const main = ax.indexOf(Math.max(...ax));
  if (ax[main] < 0.8) return 'Oblique';
  return main === 2 ? 'Axial' : main === 1 ? 'Coronal' : 'Sagittal';
}

/* ======================= Đo đạc ======================= */

export const SPACING_SOURCE_LABEL = {
  PixelSpacing: 'Pixel Spacing',
  ImagerPixelSpacing: 'Imager Pixel Spacing (tại detector)',
  UltrasoundRegion: 'Hiệu chuẩn vùng siêu âm',
};

/** Mô tả hiệu chuẩn đo đạc cho HUD / cảnh báo */
export function describeCalibration(meta) {
  if (!meta) return { calibrated: false, label: '' };
  if (!meta.pixelSpacing) {
    return { calibrated: false, label: 'Chưa hiệu chuẩn - số đo tính bằng pixel', warning: true };
  }
  const [r, c] = meta.pixelSpacing;
  const base = `${c.toFixed(3)}×${r.toFixed(3)} mm/px`;
  if (meta.pixelSpacingSource === 'ImagerPixelSpacing') {
    return { calibrated: true, label: `${base} · tại detector (chưa trừ phóng đại)`, warning: true };
  }
  if (meta.pixelSpacingSource === 'UltrasoundRegion') {
    return { calibrated: true, label: `${base} · vùng siêu âm` };
  }
  return { calibrated: true, label: base };
}
