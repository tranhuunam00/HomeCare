/**
 * Ánh xạ toạ độ màn hình <-> toạ độ pixel ảnh cho khung nhìn có CSS transform:
 *   translate(pan) scale(zoom) rotate(rotation) scaleX(flipH) scaleY(flipV), gốc biến đổi = tâm.
 * layoutW/H = kích thước layout của canvas TRƯỚC transform (offsetWidth/Height),
 * có thể khác tỉ lệ ma trận ảnh (pixel không vuông) -> xử lý riêng từng trục.
 */

/** Màn hình -> ảnh. center = tâm hộp bao canvas trên màn hình (không đổi khi xoay quanh tâm) */
export function screenToImage({ clientX, clientY }, { centerX, centerY, layoutW, layoutH, W, H, zoom = 1, rotation = 0, flipH = false, flipV = false }) {
  const dx = clientX - centerX;
  const dy = clientY - centerY;
  const rad = (-rotation * Math.PI) / 180;
  let ux = dx * Math.cos(rad) - dy * Math.sin(rad);
  let uy = dx * Math.sin(rad) + dy * Math.cos(rad);
  if (flipH) ux = -ux;
  if (flipV) uy = -uy;
  return {
    x: W / 2 + ux * (W / (layoutW * zoom)),
    y: H / 2 + uy * (H / (layoutH * zoom)),
  };
}

/** Ảnh -> màn hình (phép biến đổi xuôi, dùng cho kiểm thử & vẽ overlay) */
export function imageToScreen({ x, y }, { centerX, centerY, layoutW, layoutH, W, H, zoom = 1, rotation = 0, flipH = false, flipV = false }) {
  let ux = (x - W / 2) * ((layoutW * zoom) / W);
  let uy = (y - H / 2) * ((layoutH * zoom) / H);
  if (flipH) ux = -ux;
  if (flipV) uy = -uy;
  const rad = (rotation * Math.PI) / 180;
  return {
    clientX: centerX + ux * Math.cos(rad) - uy * Math.sin(rad),
    clientY: centerY + ux * Math.sin(rad) + uy * Math.cos(rad),
  };
}
