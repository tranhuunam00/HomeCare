/**
 * Bộ giải nén DICOM phía trình duyệt (nạp lười - chỉ tải khi gặp đúng Transfer Syntax).
 *
 * Mỗi hàm decode nhận `bytes` (Uint8Array của 1 frame đã nén) + thông tin ảnh,
 * trả về { pixels: TypedArray (giá trị lưu trữ, interleaved), componentCount }.
 * Lỗi giải mã luôn ném Error -> viewer báo "không hiển thị" thay vì vẽ ảnh nhiễu.
 */

export const TRANSFER_SYNTAX = {
  '1.2.840.10008.1.2': { name: 'Implicit VR Little Endian', lossy: false, codec: 'native' },
  '1.2.840.10008.1.2.1': { name: 'Explicit VR Little Endian', lossy: false, codec: 'native' },
  '1.2.840.10008.1.2.2': { name: 'Explicit VR Big Endian', lossy: false, codec: 'native-be' },
  // dicom-parser cần inflater đồng bộ - trình duyệt không có sẵn -> máy chủ vẫn sinh preview, viewer báo chưa hỗ trợ
  '1.2.840.10008.1.2.1.99': { name: 'Deflated Explicit VR Little Endian', lossy: false, codec: 'unsupported' },
  '1.2.840.10008.1.2.5': { name: 'RLE Lossless', lossy: false, codec: 'rle' },
  '1.2.840.10008.1.2.4.50': { name: 'JPEG Baseline (8-bit)', lossy: true, codec: 'jpeg-baseline' },
  '1.2.840.10008.1.2.4.51': { name: 'JPEG Extended (12-bit)', lossy: true, codec: 'unsupported' },
  '1.2.840.10008.1.2.4.57': { name: 'JPEG Lossless', lossy: false, codec: 'jpeg-lossless' },
  '1.2.840.10008.1.2.4.70': { name: 'JPEG Lossless SV1', lossy: false, codec: 'jpeg-lossless' },
  '1.2.840.10008.1.2.4.80': { name: 'JPEG-LS Lossless', lossy: false, codec: 'jpeg-ls' },
  '1.2.840.10008.1.2.4.81': { name: 'JPEG-LS Near-Lossless', lossy: true, codec: 'jpeg-ls' },
  '1.2.840.10008.1.2.4.90': { name: 'JPEG 2000 Lossless', lossy: false, codec: 'j2k' },
  '1.2.840.10008.1.2.4.91': { name: 'JPEG 2000', lossy: true, codec: 'j2k' },
  '1.2.840.10008.1.2.4.201': { name: 'HTJ2K Lossless', lossy: false, codec: 'unsupported' },
  '1.2.840.10008.1.2.4.202': { name: 'HTJ2K Lossless RPCL', lossy: false, codec: 'unsupported' },
  '1.2.840.10008.1.2.4.203': { name: 'HTJ2K', lossy: true, codec: 'unsupported' },
};

export function getTransferSyntaxInfo(uid) {
  return TRANSFER_SYNTAX[uid] || { name: uid || 'Không rõ', lossy: false, codec: 'unsupported' };
}

/* ---------------- RLE Lossless (PS3.5 Annex G) ---------------- */
export function decodeRle(frame, rows, columns, bitsAllocated, samplesPerPixel) {
  const view = new DataView(frame.buffer, frame.byteOffset, frame.byteLength);
  const numSegments = view.getUint32(0, true);
  const bytesPerSample = bitsAllocated / 8;
  const numPixels = rows * columns;
  const out = new Uint8Array(numPixels * samplesPerPixel * bytesPerSample);
  const stride = samplesPerPixel * bytesPerSample;
  for (let s = 0; s < numSegments; s++) {
    const start = view.getUint32(4 + s * 4, true);
    const end = s + 1 < numSegments ? view.getUint32(4 + (s + 1) * 4, true) : frame.length;
    const sample = Math.floor(s / bytesPerSample);
    const byteInSample = bytesPerSample - 1 - (s % bytesPerSample); // MSB segment trước -> output little-endian
    const base = sample * bytesPerSample + byteInSample;
    let outPos = 0;
    let inPos = start;
    while (inPos < end && outPos < numPixels) {
      const n = (frame[inPos++] << 24) >> 24;
      if (n >= 0) {
        for (let i = 0; i <= n && outPos < numPixels; i++) out[base + outPos++ * stride] = frame[inPos++];
      } else if (n !== -128) {
        const val = frame[inPos++];
        for (let i = 0; i < -n + 1 && outPos < numPixels; i++) out[base + outPos++ * stride] = val;
      }
    }
  }
  // Trả về đúng kiểu theo bitsAllocated
  const pixels = bitsAllocated === 16 ? new Uint16Array(out.buffer) : out;
  return { pixels, componentCount: samplesPerPixel };
}

/* ---------------- JPEG Baseline 8-bit (trình duyệt tự giải mã) ---------------- */
export async function decodeJpegBaseline(frame, rows, columns, samplesPerPixel) {
  if (typeof createImageBitmap !== 'function' || typeof OffscreenCanvas === 'undefined') {
    throw new Error('Trình duyệt không hỗ trợ giải mã JPEG Baseline');
  }
  const bitmap = await createImageBitmap(new Blob([frame], { type: 'image/jpeg' }), {
    colorSpaceConversion: 'none',
    premultiplyAlpha: 'none',
  });
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(bitmap, 0, 0);
  bitmap.close?.();
  const rgba = ctx.getImageData(0, 0, columns, rows).data;
  const n = rows * columns;
  if (samplesPerPixel === 1) {
    const out = new Uint8Array(n);
    for (let i = 0; i < n; i++) out[i] = rgba[i * 4];
    return { pixels: out, componentCount: 1 };
  }
  const out = new Uint8Array(n * 3);
  for (let i = 0; i < n; i++) {
    out[i * 3] = rgba[i * 4];
    out[i * 3 + 1] = rgba[i * 4 + 1];
    out[i * 3 + 2] = rgba[i * 4 + 2];
  }
  return { pixels: out, componentCount: 3, alreadyRgb: true };
}

/* ---------------- JPEG Lossless (Process 14) ---------------- */
let jpegLosslessModule = null;
export async function decodeJpegLossless(frame, bitsAllocated) {
  if (!jpegLosslessModule) jpegLosslessModule = await import('jpeg-lossless-decoder-js');
  const Decoder = jpegLosslessModule.Decoder || jpegLosslessModule.default?.Decoder;
  const decoder = new Decoder();
  const out = decoder.decode(frame.buffer, frame.byteOffset, frame.length, bitsAllocated / 8);
  return { pixels: out, componentCount: decoder.numComp || 1 };
}

/* ---------------- WASM codecs (JPEG 2000 / JPEG-LS) ---------------- */
let openJpegPromise = null;
let charlsPromise = null;
/** Cho phép môi trường ngoài trình duyệt (unit test Node) chỉ định đường dẫn file .wasm */
let wasmLocator = null;
export function configureCodecs({ locateWasm } = {}) {
  wasmLocator = locateWasm || null;
  openJpegPromise = null;
  charlsPromise = null;
}

async function loadOpenJpeg() {
  if (!openJpegPromise) {
    openJpegPromise = (async () => {
      const [{ default: factory }, wasmUrl] = await Promise.all([
        import('@cornerstonejs/codec-openjpeg/decodewasmjs'),
        typeof window !== 'undefined'
          ? import('@cornerstonejs/codec-openjpeg/decodewasm?url').then((m) => m.default)
          : Promise.resolve(undefined),
      ]);
      const url = wasmLocator ? wasmLocator('openjpeg') : wasmUrl;
      return factory(url ? { locateFile: () => url } : {});
    })();
  }
  return openJpegPromise;
}

async function loadCharls() {
  if (!charlsPromise) {
    charlsPromise = (async () => {
      const [{ default: factory }, wasmUrl] = await Promise.all([
        import('@cornerstonejs/codec-charls/decodewasmjs'),
        typeof window !== 'undefined'
          ? import('@cornerstonejs/codec-charls/decodewasm?url').then((m) => m.default)
          : Promise.resolve(undefined),
      ]);
      const url = wasmLocator ? wasmLocator('charls') : wasmUrl;
      return factory(url ? { locateFile: () => url } : {});
    })();
  }
  return charlsPromise;
}

function copyDecoded(decoded, bitsPerSample, isSigned) {
  // Buffer nằm trong bộ nhớ WASM -> phải sao chép ra trước khi decoder bị huỷ
  const copy = new Uint8Array(decoded.length);
  copy.set(decoded);
  if (bitsPerSample > 8) return isSigned ? new Int16Array(copy.buffer) : new Uint16Array(copy.buffer);
  return isSigned ? new Int8Array(copy.buffer) : copy;
}

export async function decodeJpeg2000(frame) {
  const codec = await loadOpenJpeg();
  const decoder = new codec.J2KDecoder();
  try {
    decoder.getEncodedBuffer(frame.length).set(frame);
    decoder.decode();
    const info = decoder.getFrameInfo();
    const pixels = copyDecoded(decoder.getDecodedBuffer(), info.bitsPerSample, info.isSigned);
    return { pixels, componentCount: info.componentCount, width: info.width, height: info.height };
  } finally {
    decoder.delete?.();
  }
}

export async function decodeJpegLs(frame) {
  const codec = await loadCharls();
  const decoder = new codec.JpegLSDecoder();
  try {
    decoder.getEncodedBuffer(frame.length).set(frame);
    decoder.decode();
    const info = decoder.getFrameInfo();
    const pixels = copyDecoded(decoder.getDecodedBuffer(), info.bitsPerSample, info.isSigned);
    return { pixels, componentCount: info.componentCount, width: info.width, height: info.height };
  } finally {
    decoder.delete?.();
  }
}
