/* eslint-disable no-restricted-globals */
import { decodeDicom } from '../dicomImageCore';

/**
 * Worker giải mã DICOM: parse + giải nén (JPEG Baseline/Lossless/2000/LS, RLE) + chuẩn hoá pixel
 * chạy ngoài luồng giao diện -> cuộn 250 lát / lưới 2x2 không bị khựng khi prefetch.
 * Nhận ArrayBuffer (transfer), trả rawPixels (transfer lại buffer).
 */
self.onmessage = async (e) => {
  const { id, buffer, frameIndex } = e.data;
  try {
    const decoded = await decodeDicom(buffer, frameIndex || 0);
    const px = decoded?.rawPixels;
    const transfer = px && px.buffer instanceof ArrayBuffer ? [px.buffer] : [];
    self.postMessage({ id, ok: true, decoded }, transfer);
  } catch (err) {
    self.postMessage({ id, ok: false, error: String(err?.message || err) });
  }
};
