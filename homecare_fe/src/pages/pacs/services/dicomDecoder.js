/**
 * Lớp tương thích cho code cũ (MPR, 3D, thumbnails, unit test).
 * Toàn bộ thuật toán nằm ở ./dicomImageCore.js:
 *  - parseDicomBuffer: đồng bộ, chỉ định dạng không nén (định dạng nén -> rawPixels = null, decodeInfo.ok = false)
 *  - decodeDicomBuffer: bất đồng bộ, hỗ trợ đầy đủ codec (JPEG Lossless / Baseline / 2000 / LS, RLE, màu, multi-frame)
 *  - renderDicomToCanvas: VOI LUT chuẩn DICOM qua bảng tra cứu
 */
import { decodeDicom, decodeDicomSync, renderImageToCanvas } from './dicomImageCore';

const EMPTY_META = {
  patientName: '',
  patientId: '',
  patientBirthDate: '',
  patientSex: '',
  patientAge: '',
  studyDate: '',
  studyTime: '',
  modality: '',
  studyInstanceUid: '',
  seriesInstanceUid: '',
  sopInstanceUid: '',
  seriesDescription: '',
  laterality: '',
  viewPosition: '',
  institutionName: '',
  rows: 512,
  columns: 512,
  bitsAllocated: 16,
  bitsStored: 12,
  pixelRepresentation: 0,
  photometricInterpretation: 'MONOCHROME2',
  windowCenter: 40,
  windowWidth: 400,
  rescaleSlope: 1,
  rescaleIntercept: 0,
  pixelSpacing: null,
  pixelSpacingSource: null,
  windowPresets: [],
};

function withFallbackMeta(result) {
  if (result.meta) return result;
  return { ...result, meta: { ...EMPTY_META } };
}

export function parseDicomBuffer(arrayBuffer, frameIndex = 0) {
  return withFallbackMeta(decodeDicomSync(arrayBuffer, frameIndex));
}

export async function decodeDicomBuffer(arrayBuffer, frameIndex = 0) {
  return withFallbackMeta(await decodeDicom(arrayBuffer, frameIndex));
}

export function renderDicomToCanvas(canvas, rawPixels, meta, options = {}) {
  return renderImageToCanvas(canvas, rawPixels, meta, options);
}
