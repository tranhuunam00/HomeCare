/**
 * Radiological & DICOM Measurement Geometrical Utilities
 * Accurate physical calculations based on DICOM PixelSpacing [rowSpacing, colSpacing] (in mm).
 */

/**
 * Calculates real-world distance between two points in millimeters (mm).
 * @param {{x: number, y: number}} p1 Start point in canvas pixels
 * @param {{x: number, y: number}} p2 End point in canvas pixels
 * @param {[number, number]} pixelSpacing [rowSpacing, colSpacing] in mm/pixel. Defaults to [1, 1]
 * @returns {number} Distance in mm
 */
export function calculateDistance(p1, p2, pixelSpacing = [1.0, 1.0]) {
  if (!p1 || !p2) return 0;
  const rowSpacing = pixelSpacing[0] || 1.0;
  const colSpacing = pixelSpacing[1] || 1.0;

  const dxMm = (p2.x - p1.x) * colSpacing;
  const dyMm = (p2.y - p1.y) * rowSpacing;

  return Math.sqrt(dxMm * dxMm + dyMm * dyMm);
}

/**
 * Calculates the interior angle formed by vertex p2 between rays (p2 -> p1) and (p2 -> p3) in degrees.
 * @param {{x: number, y: number}} p1 Ray 1 endpoint
 * @param {{x: number, y: number}} p2 Vertex point
 * @param {{x: number, y: number}} p3 Ray 2 endpoint
 * @returns {number} Angle in degrees [0, 180]
 */
export function calculateAngle(p1, p2, p3, pixelSpacing = [1.0, 1.0]) {
  if (!p1 || !p2 || !p3) return 0;
  // Góc phải tính trong không gian vật lý (mm): ảnh siêu âm / X-quang có thể có pixel không vuông
  const rowSpacing = pixelSpacing?.[0] || 1.0;
  const colSpacing = pixelSpacing?.[1] || 1.0;

  const v1 = { x: (p1.x - p2.x) * colSpacing, y: (p1.y - p2.y) * rowSpacing };
  const v2 = { x: (p3.x - p2.x) * colSpacing, y: (p3.y - p2.y) * rowSpacing };

  const dot = v1.x * v2.x + v1.y * v2.y;
  const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
  const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y);

  if (mag1 === 0 || mag2 === 0) return 0;

  const cosTheta = Math.max(-1.0, Math.min(1.0, dot / (mag1 * mag2)));
  return Math.acos(cosTheta) * (180 / Math.PI);
}

/**
 * Calculates area of an ellipse bounded by corner points p1 and p2 in mm².
 * @param {{x: number, y: number}} p1 Corner 1
 * @param {{x: number, y: number}} p2 Corner 2
 * @param {[number, number]} pixelSpacing [rowSpacing, colSpacing] in mm/pixel
 * @returns {number} Area in mm²
 */
export function calculateEllipseArea(p1, p2, pixelSpacing = [1.0, 1.0]) {
  if (!p1 || !p2) return 0;
  const rowSpacing = pixelSpacing[0] || 1.0;
  const colSpacing = pixelSpacing[1] || 1.0;

  const rxMm = (Math.abs(p2.x - p1.x) / 2) * colSpacing;
  const ryMm = (Math.abs(p2.y - p1.y) / 2) * rowSpacing;

  return Math.PI * rxMm * ryMm;
}

/**
 * Calculates area of a rectangle bounded by corner points p1 and p2 in mm².
 * @param {{x: number, y: number}} p1 Corner 1
 * @param {{x: number, y: number}} p2 Corner 2
 * @param {[number, number]} pixelSpacing [rowSpacing, colSpacing] in mm/pixel
 * @returns {number} Area in mm²
 */
export function calculateRectArea(p1, p2, pixelSpacing = [1.0, 1.0]) {
  if (!p1 || !p2) return 0;
  const rowSpacing = pixelSpacing[0] || 1.0;
  const colSpacing = pixelSpacing[1] || 1.0;

  const wMm = Math.abs(p2.x - p1.x) * colSpacing;
  const hMm = Math.abs(p2.y - p1.y) * rowSpacing;

  return wMm * hMm;
}

/**
 * Formats measurement value and unit string.
 * @param {'length'|'angle'|'roi_ellipse'|'roi_rect'} type
 * @param {number} value
 * @returns {string}
 */
export function formatMeasurement(type, value, calibrated = true) {
  if (value === undefined || value === null || isNaN(value)) return '';
  // Ảnh không có thông tin hiệu chuẩn -> hiển thị đơn vị pixel, KHÔNG giả làm mm
  const unit = calibrated ? 'mm' : 'px';
  switch (type) {
    case 'length':
      return `${value.toFixed(1)} ${unit}`;
    case 'angle':
      return `${value.toFixed(1)}°`;
    case 'roi_ellipse':
    case 'roi_rect':
      return `${value.toFixed(1)} ${unit}²`;
    default:
      return `${value.toFixed(1)}`;
  }
}
