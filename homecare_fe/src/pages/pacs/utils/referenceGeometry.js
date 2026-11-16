/**
 * Hình học mặt phẳng ảnh DICOM (hệ toạ độ bệnh nhân LPS, mm) cho viewer nhiều khung:
 *  - Đường tham chiếu (reference line): giao tuyến của lát đang xem với ảnh ở ô khác.
 *  - Đồng bộ cuộn theo VỊ TRÍ (không theo số thứ tự): chọn lát gần nhất dọc pháp tuyến.
 *
 * Quy ước DICOM: IPP = tâm pixel đầu tiên (hàng 0, cột 0); IOP[0..2] = hướng tăng CỘT (trục x ảnh),
 * IOP[3..5] = hướng tăng HÀNG (trục y ảnh); PixelSpacing = [khoảng cách hàng (dọc), khoảng cách cột (ngang)].
 */

const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const mul = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = (a) => {
  const l = Math.hypot(a[0], a[1], a[2]) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};

const isVec = (v, n) => Array.isArray(v) && v.length >= n && v.slice(0, n).every(Number.isFinite);

/**
 * Mặt phẳng ảnh từ metadata (instance từ máy chủ hoặc meta đã giải mã).
 * Trả null nếu thiếu hình học (ảnh X-quang, siêu âm, ảnh thường...).
 */
export function getPlaneGeometry(m) {
  if (!m) return null;
  const iop = m.imageOrientationPatient;
  const ipp = m.imagePositionPatient;
  const rows = m.rows;
  const cols = m.columns;
  if (!isVec(iop, 6) || !isVec(ipp, 3) || !rows || !cols) return null;
  const sp = m.pixelSpacing;
  if (!isVec(sp, 2) || sp[0] <= 0 || sp[1] <= 0) return null;
  const rowDir = norm(iop.slice(0, 3));
  const colDir = norm(iop.slice(3, 6));
  return {
    origin: ipp.slice(0, 3),
    rowDir, // hướng tăng cột (x)
    colDir, // hướng tăng hàng (y)
    normal: norm(cross(rowDir, colDir)),
    rowSpacing: sp[0],
    colSpacing: sp[1],
    rows,
    cols,
  };
}

/** Tâm ảnh trong toạ độ bệnh nhân */
export function planeCenter(g) {
  return add(add(g.origin, mul(g.rowDir, ((g.cols - 1) / 2) * g.colSpacing)), mul(g.colDir, ((g.rows - 1) / 2) * g.rowSpacing));
}

/** Điểm bệnh nhân -> toạ độ canvas của ảnh g (pixel i nằm trong [i, i+1], tâm ở i + 0.5) */
export function patientToImage(g, p) {
  const d = sub(p, g.origin);
  return { x: dot(d, g.rowDir) / g.colSpacing + 0.5, y: dot(d, g.colDir) / g.rowSpacing + 0.5 };
}

/** Hai mặt phẳng song song (cùng hướng cắt, ví dụ 2 series Axial) */
export function areParallel(a, b, tol = 0.95) {
  return !!a && !!b && Math.abs(dot(a.normal, b.normal)) >= tol;
}

/**
 * Đường tham chiếu: giao tuyến của mặt phẳng `src` (lát đang xem) với ảnh `dst`,
 * cắt theo khung ảnh dst. Trả về 2 điểm toạ độ canvas của dst, hoặc null nếu song song / không cắt.
 */
export function computeReferenceLine(src, dst) {
  if (!src || !dst) return null;
  if (Math.abs(dot(src.normal, dst.normal)) > 0.985) return null; // gần song song: không có giao tuyến ý nghĩa
  const w = (dst.cols - 1) * dst.colSpacing;
  const h = (dst.rows - 1) * dst.rowSpacing;
  const o = dst.origin;
  const corners = [o, add(o, mul(dst.rowDir, w)), add(add(o, mul(dst.rowDir, w)), mul(dst.colDir, h)), add(o, mul(dst.colDir, h))];
  const dist = corners.map((c) => dot(sub(c, src.origin), src.normal));
  const pts = [];
  for (let i = 0; i < 4; i++) {
    const a = corners[i];
    const b = corners[(i + 1) % 4];
    const da = dist[i];
    const db = dist[(i + 1) % 4];
    if (da === 0) pts.push(a);
    if ((da < 0 && db > 0) || (da > 0 && db < 0)) {
      const t = da / (da - db);
      pts.push(add(a, mul(sub(b, a), t)));
    }
  }
  if (pts.length < 2) return null;
  // Lấy 2 điểm xa nhau nhất (loại điểm trùng ở góc)
  let best = null;
  let bestD = -1;
  for (let i = 0; i < pts.length; i++) {
    for (let j = i + 1; j < pts.length; j++) {
      const d = Math.hypot(...sub(pts[i], pts[j]));
      if (d > bestD) {
        bestD = d;
        best = [pts[i], pts[j]];
      }
    }
  }
  if (!best || bestD < 1e-6) return null;
  return [patientToImage(dst, best[0]), patientToImage(dst, best[1])];
}

/**
 * Lát gần vị trí `point` nhất trong danh sách (cùng hướng cắt), đo dọc pháp tuyến của danh sách đích.
 * Trả { index, distanceMm } hoặc null nếu danh sách không có hình học / không song song với `refPlane`.
 */
export function findNearestSlice(instances, point, refPlane) {
  let best = null;
  for (let i = 0; i < instances.length; i++) {
    const g = getPlaneGeometry(instances[i]);
    if (!g) continue;
    if (refPlane && !areParallel(g, refPlane)) return null;
    const d = Math.abs(dot(sub(point, g.origin), g.normal));
    if (!best || d < best.distanceMm) best = { index: i, distanceMm: d };
  }
  return best;
}
