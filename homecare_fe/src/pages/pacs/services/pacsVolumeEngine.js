import { vectorToLabel, oppositeLabel, voiTransform } from './dicomImageCore';

/**
 * ENGINE MPR & DỰNG HÌNH 3D (CPU)
 * ------------------------------------------------------------------
 * Nguyên tắc chính xác hình học:
 *  - Khối voxel đặt trong HỆ TOẠ ĐỘ BỆNH NHÂN (LPS) từ ImageOrientationPatient + ImagePositionPatient.
 *  - Khoảng cách giữa lát lấy từ VỊ TRÍ THẬT của từng lát (không dùng SliceThickness - có thể chồng lấp).
 *  - MPR giữ đúng tỉ lệ vật lý (1 pixel canvas = sx mm theo mọi chiều), thước tỉ lệ vẽ trong ảnh.
 *  - Ngưỡng 3D tính bằng HU thật (không phải giá trị sau WW/WL).
 */

/* ======================= Dựng khối voxel ======================= */

const volumeCache = new WeakMap();

const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const norm = (a) => {
  const l = Math.hypot(a[0], a[1], a[2]) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];

/**
 * Tạo mô tả khối từ danh sách lát (đã sắp theo giải phẫu). Kết quả được cache theo mảng validSlices.
 */
export function buildVolume(validSlices) {
  if (!validSlices?.length) return null;
  if (volumeCache.has(validSlices)) return volumeCache.get(validSlices);

  const first = validSlices[0].meta || {};
  const cols = first.columns;
  const rows = first.rows;
  const n = validSlices.length;

  const iop = first.imageOrientationPatient?.length === 6 ? first.imageOrientationPatient : [1, 0, 0, 0, 1, 0];
  const rowDir = norm(iop.slice(0, 3)); // hướng tăng chỉ số cột (x)
  const colDir = norm(iop.slice(3, 6)); // hướng tăng chỉ số hàng (y)
  const normal = norm(cross(rowDir, colDir));

  const ps = first.pixelSpacing;
  const calibrated = !!ps;
  const sx = ps ? ps[1] : 1; // khoảng cách giữa các cột (mm)
  const sy = ps ? ps[0] : 1; // khoảng cách giữa các hàng (mm)

  // Vị trí từng lát dọc trục lát (mm) từ IPP
  const ipps = validSlices.map((s) => s.meta?.imagePositionPatient);
  const hasIpp = ipps.every((p) => p && p.length === 3);
  let sliceDir = normal;
  let positions;
  let spacingSource;
  if (hasIpp && n > 1) {
    const span = sub(ipps[n - 1], ipps[0]);
    if (Math.hypot(...span) > 1e-3) sliceDir = norm(span);
    positions = ipps.map((p) => dot(sub(p, ipps[0]), sliceDir));
    spacingSource = 'ImagePositionPatient';
  } else {
    const sz = first.spacingBetweenSlices || first.sliceThickness || sx;
    positions = validSlices.map((_, k) => k * sz);
    spacingSource = first.spacingBetweenSlices ? 'SpacingBetweenSlices' : 'SliceThickness (ước lượng)';
  }
  const zExtent = Math.max(1e-6, positions[n - 1] - positions[0]);
  const sz = n > 1 ? zExtent / (n - 1) : first.sliceThickness || 1;

  // Kiểm tra khoảng cách lát không đều (thiếu lát / gantry tilt)
  let irregular = false;
  for (let k = 1; k < n; k++) {
    const d = positions[k] - positions[k - 1];
    if (Math.abs(d - sz) > sz * 0.2) irregular = true;
  }
  const tilt = Math.abs(dot(sliceDir, normal)) < 0.995; // lát không vuông góc mặt phẳng ảnh

  // Bảng tra giá trị HU nhanh
  const slopes = new Float32Array(n);
  const intercepts = new Float32Array(n);
  validSlices.forEach((s, k) => {
    slopes[k] = s.meta?.rescaleSlope || 1;
    intercepts[k] = s.meta?.rescaleIntercept || 0;
  });

  const vol = {
    validSlices,
    cols,
    rows,
    n,
    sx,
    sy,
    sz,
    zExtent,
    positions,
    rowDir,
    colDir,
    sliceDir,
    calibrated,
    spacingSource,
    irregular,
    tilt,
    slopes,
    intercepts,
    modality: first.modality,
    defaultWindow: { center: first.windowCenter ?? 40, width: first.windowWidth ?? 400 },
    iso: null,
  };
  volumeCache.set(validSlices, vol);
  return vol;
}

/** Chỉ số lát thực (thập phân) tại vị trí zmm dọc trục lát */
function sliceIndexAtMm(vol, zmm) {
  const p = vol.positions;
  if (zmm <= p[0]) return 0;
  if (zmm >= p[vol.n - 1]) return vol.n - 1;
  let lo = 0;
  let hi = vol.n - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (p[mid] <= zmm) lo = mid;
    else hi = mid;
  }
  const d = p[hi] - p[lo];
  return lo + (d > 0 ? (zmm - p[lo]) / d : 0);
}

/** HU tại (x, y) liên tục (bilinear) của lát k */
function huBilinear(vol, k, x, y) {
  const px = vol.validSlices[k].rawPixels;
  const { cols, rows } = vol;
  const xc = Math.max(0, Math.min(cols - 1, x));
  const yc = Math.max(0, Math.min(rows - 1, y));
  const x0 = Math.floor(xc);
  const y0 = Math.floor(yc);
  const x1 = Math.min(cols - 1, x0 + 1);
  const y1 = Math.min(rows - 1, y0 + 1);
  const fx = xc - x0;
  const fy = yc - y0;
  const a = px[y0 * cols + x0];
  const b = px[y0 * cols + x1];
  const c = px[y1 * cols + x0];
  const d = px[y1 * cols + x1];
  const raw = (a * (1 - fx) + b * fx) * (1 - fy) + (c * (1 - fx) + d * fx) * fy;
  return raw * vol.slopes[k] + vol.intercepts[k];
}

/** HU tại (x, y, kFloat) - nội suy tuyến tính giữa các lát */
function huAt(vol, x, y, kf) {
  const k0 = Math.floor(kf);
  const k1 = Math.min(vol.n - 1, k0 + 1);
  const t = kf - k0;
  const v0 = huBilinear(vol, k0, x, y);
  if (t < 1e-6 || k1 === k0) return v0;
  return v0 * (1 - t) + huBilinear(vol, k1, x, y) * t;
}

/* ======================= Tiện ích hiển thị ======================= */

function windowToGray(hu, win) {
  const v = voiTransform(hu, win.center, win.width, 'LINEAR');
  return v < 0 ? 0 : v > 255 ? 255 : v | 0;
}

function niceLengthMm(maxMm) {
  const c = [5, 10, 20, 50, 100, 200];
  let best = c[0];
  for (const v of c) if (v <= maxMm) best = v;
  return best;
}

/** Thước tỉ lệ vẽ TRONG ảnh (đơn vị canvas = mmPerPx mm) -> luôn đúng dù hiển thị phóng to/thu nhỏ */
function drawScaleBar(ctx, W, H, mmPerPx) {
  const lenMm = niceLengthMm(W * mmPerPx * 0.25);
  const lenPx = lenMm / mmPerPx;
  const unit = Math.max(1, Math.round(W / 320));
  const x1 = W - 10 * unit;
  const x0 = x1 - lenPx;
  const y = H - 12 * unit;
  ctx.save();
  ctx.strokeStyle = '#e5e7eb';
  ctx.lineWidth = 1.5 * unit;
  ctx.shadowColor = '#000';
  ctx.shadowBlur = 2 * unit;
  ctx.beginPath();
  ctx.moveTo(x0, y - 4 * unit);
  ctx.lineTo(x0, y);
  ctx.lineTo(x1, y);
  ctx.lineTo(x1, y - 4 * unit);
  ctx.stroke();
  ctx.font = `600 ${10 * unit}px Inter, sans-serif`;
  ctx.fillStyle = '#e5e7eb';
  ctx.textAlign = 'center';
  ctx.fillText(lenMm >= 10 ? `${lenMm / 10} cm` : `${lenMm} mm`, (x0 + x1) / 2, y - 6 * unit);
  ctx.restore();
}

function drawLabels(ctx, W, H, labels, color) {
  const unit = Math.max(1, Math.round(W / 320));
  ctx.save();
  ctx.font = `800 ${13 * unit}px Inter, sans-serif`;
  ctx.fillStyle = color;
  ctx.shadowColor = '#000';
  ctx.shadowBlur = 3 * unit;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  if (labels.top) ctx.fillText(labels.top, W / 2, 10 * unit);
  if (labels.bottom) ctx.fillText(labels.bottom, W / 2, H - 26 * unit);
  ctx.textAlign = 'left';
  if (labels.left) ctx.fillText(labels.left, 5 * unit, H / 2);
  ctx.textAlign = 'right';
  if (labels.right) ctx.fillText(labels.right, W - 5 * unit, H / 2);
  ctx.restore();
}

function drawCrosshair(ctx, W, H, cx, cy, color) {
  const unit = Math.max(1, Math.round(W / 320));
  ctx.save();
  ctx.strokeStyle = color;
  ctx.globalAlpha = 0.8;
  ctx.lineWidth = unit;
  ctx.setLineDash([4 * unit, 4 * unit]);
  ctx.beginPath();
  ctx.moveTo(cx, 0);
  ctx.lineTo(cx, H);
  ctx.moveTo(0, cy);
  ctx.lineTo(W, cy);
  ctx.stroke();
  ctx.restore();
}

/** Kích thước canvas của từng mặt cắt (đơn vị = sx mm/px -> tỉ lệ vật lý đúng) */
export function getPlaneGeometry(vol, plane) {
  const ratioY = vol.sy / vol.sx;
  const zPx = Math.max(2, Math.round(vol.zExtent / vol.sx) + 1);
  if (plane === 'AXIAL') return { W: vol.cols, H: Math.max(2, Math.round(vol.rows * ratioY)) };
  if (plane === 'CORONAL') return { W: vol.cols, H: zPx };
  return { W: Math.max(2, Math.round(vol.rows * ratioY)), H: zPx }; // SAGITTAL
}

function sliceAxisLabels(vol) {
  // Đầu khối (lát 0) ở trên ảnh MPR dọc
  const bottom = vectorToLabel(vol.sliceDir);
  return { top: oppositeLabel(bottom), bottom };
}

function prepareCanvas(canvas, W, H) {
  if (canvas.width !== W) canvas.width = W;
  if (canvas.height !== H) canvas.height = H;
  const ctx = canvas.getContext('2d');
  return { ctx, img: ctx.createImageData(W, H) };
}

/* ======================= MPR 2D ======================= */

function resolveWindow(vol, opts) {
  return {
    center: opts?.windowCenter ?? vol.defaultWindow.center,
    width: Math.max(1, opts?.windowWidth ?? vol.defaultWindow.width),
  };
}

/**
 * Cắt lại 1 mặt phẳng -> lưới HU (thuần, không phụ thuộc canvas - dùng để kiểm thử hình học).
 * Đơn vị lưới: 1 ô = sx mm theo cả 2 chiều (tỉ lệ vật lý đúng).
 * @returns {{ W, H, hu: Float32Array, cross: {cx, cy}, labels, mmPerPx }}
 */
export function reslicePlane(validSlices, plane, crosshair) {
  const vol = buildVolume(validSlices);
  if (!vol) return null;
  const { W, H } = getPlaneGeometry(vol, plane);
  const hu = new Float32Array(W * H);
  const mmPerRowZ = vol.zExtent / Math.max(1, H - 1);
  if (plane === 'AXIAL') {
    const k = Math.max(0, Math.min(vol.n - 1, Math.round(crosshair.z)));
    const yScale = (vol.rows - 1) / Math.max(1, H - 1);
    const px = vol.validSlices[k].rawPixels;
    for (let r = 0; r < H; r++) {
      for (let c = 0; c < W; c++) {
        hu[r * W + c] = H === vol.rows ? px[r * vol.cols + c] * vol.slopes[k] + vol.intercepts[k] : huBilinear(vol, k, c, r * yScale);
      }
    }
    const right = vectorToLabel(vol.rowDir);
    const bottom = vectorToLabel(vol.colDir);
    return {
      W,
      H,
      hu,
      mmPerPx: vol.sx,
      cross: { cx: crosshair.x, cy: crosshair.y / yScale },
      labels: { right, left: oppositeLabel(right), bottom, top: oppositeLabel(bottom) },
    };
  }
  const zRow = (vol.positions[Math.max(0, Math.min(vol.n - 1, Math.round(crosshair.z)))] - vol.positions[0]) / mmPerRowZ;
  if (plane === 'CORONAL') {
    const y = Math.max(0, Math.min(vol.rows - 1, crosshair.y));
    for (let r = 0; r < H; r++) {
      const kf = sliceIndexAtMm(vol, vol.positions[0] + r * mmPerRowZ);
      for (let c = 0; c < W; c++) hu[r * W + c] = huAt(vol, c, y, kf);
    }
    const right = vectorToLabel(vol.rowDir);
    return { W, H, hu, mmPerPx: vol.sx, cross: { cx: crosshair.x, cy: zRow }, labels: { right, left: oppositeLabel(right), ...sliceAxisLabels(vol) } };
  }
  const x = Math.max(0, Math.min(vol.cols - 1, crosshair.x));
  const yScale = (vol.rows - 1) / Math.max(1, W - 1);
  for (let r = 0; r < H; r++) {
    const kf = sliceIndexAtMm(vol, vol.positions[0] + r * mmPerRowZ);
    for (let c = 0; c < W; c++) hu[r * W + c] = huAt(vol, x, c * yScale, kf);
  }
  const right = vectorToLabel(vol.colDir);
  return { W, H, hu, mmPerPx: vol.sx, cross: { cx: crosshair.y / yScale, cy: zRow }, labels: { right, left: oppositeLabel(right), ...sliceAxisLabels(vol) } };
}

const PLANE_COLORS = { AXIAL: ['#38bdf8', '#7dd3fc'], CORONAL: ['#10b981', '#6ee7b7'], SAGITTAL: ['#f59e0b', '#fcd34d'] };

function renderPlane(canvas, validSlices, plane, crosshair, opts) {
  const vol = buildVolume(validSlices);
  if (!canvas || !vol) return;
  const r = reslicePlane(validSlices, plane, crosshair);
  const { ctx, img } = prepareCanvas(canvas, r.W, r.H);
  const win = resolveWindow(vol, opts);
  const out = img.data;
  for (let i = 0; i < r.hu.length; i++) {
    const g = windowToGray(r.hu[i], win);
    out[i * 4] = g;
    out[i * 4 + 1] = g;
    out[i * 4 + 2] = g;
    out[i * 4 + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  const [lineColor, labelColor] = PLANE_COLORS[plane];
  drawCrosshair(ctx, r.W, r.H, r.cross.cx, r.cross.cy, lineColor);
  drawLabels(ctx, r.W, r.H, r.labels, labelColor);
  if (vol.calibrated) drawScaleBar(ctx, r.W, r.H, r.mmPerPx);
}

export function renderAxialCanvas(canvas, validSlices, crosshair, cols, rows, numSlices, _renderRes, opts = {}) {
  renderPlane(canvas, validSlices, 'AXIAL', crosshair, opts);
}

export function renderCoronalCanvas(canvas, validSlices, crosshair, cols, rows, numSlices, _renderRes, opts = {}) {
  renderPlane(canvas, validSlices, 'CORONAL', crosshair, opts);
}

export function renderSagittalCanvas(canvas, validSlices, crosshair, cols, rows, numSlices, _renderRes, opts = {}) {
  renderPlane(canvas, validSlices, 'SAGITTAL', crosshair, opts);
}

/**
 * Chuyển click chuột trên canvas MPR (có object-fit: contain) -> toạ độ voxel {x, y, z}.
 * Trả về chỉ những trục mà mặt cắt đó xác định.
 */
export function mprEventToVoxel(e, plane, validSlices) {
  const vol = buildVolume(validSlices);
  const el = e.currentTarget;
  if (!vol || !el) return {};
  const rect = el.getBoundingClientRect();
  const W = el.width;
  const H = el.height;
  const s = Math.min(rect.width / W, rect.height / H);
  const ox = rect.left + (rect.width - W * s) / 2;
  const oy = rect.top + (rect.height - H * s) / 2;
  const cx = Math.max(0, Math.min(W - 1, (e.clientX - ox) / s));
  const cy = Math.max(0, Math.min(H - 1, (e.clientY - oy) / s));
  const zFromRow = (row) => Math.round(sliceIndexAtMm(vol, vol.positions[0] + row * (vol.zExtent / Math.max(1, H - 1))));
  if (plane === 'AXIAL') {
    return { x: Math.round(cx), y: Math.round(cy * ((vol.rows - 1) / Math.max(1, H - 1))) };
  }
  if (plane === 'CORONAL') return { x: Math.round(cx), z: zFromRow(cy) };
  return { y: Math.round(cx * ((vol.rows - 1) / Math.max(1, W - 1))), z: zFromRow(cy) };
}

/** Mô tả hình học khối để hiển thị/cảnh báo trên giao diện */
export function describeVolume(validSlices) {
  const vol = buildVolume(validSlices);
  if (!vol) return null;
  return {
    sx: vol.sx,
    sy: vol.sy,
    sz: vol.sz,
    n: vol.n,
    calibrated: vol.calibrated,
    spacingSource: vol.spacingSource,
    irregular: vol.irregular,
    tilt: vol.tilt,
    extentMm: [vol.cols * vol.sx, vol.rows * vol.sy, vol.zExtent],
  };
}

/* ======================= 3D: khối đẳng hướng ======================= */

const ISO_TARGET = 224; // số voxel tối đa theo chiều dài nhất (cân bằng chất lượng / tốc độ CPU)

function buildIsoVolume(vol) {
  if (vol.iso) return vol.iso;
  const ex = vol.cols * vol.sx;
  const ey = vol.rows * vol.sy;
  const ez = vol.zExtent + vol.sz;
  const step = Math.max(Math.max(ex, ey, ez) / ISO_TARGET, Math.min(vol.sx, vol.sy, vol.sz));
  const nx = Math.max(2, Math.round(ex / step));
  const ny = Math.max(2, Math.round(ey / step));
  const nz = Math.max(2, Math.round(ez / step));
  const data = new Int16Array(nx * ny * nz);
  let min = Infinity;
  let max = -Infinity;

  // Thu nhỏ trong mặt phẳng: lấy mẫu song tuyến tại ĐÚNG tâm voxel + siêu lấy mẫu 2x2 (lọc chống răng cưa).
  // Tâm mẫu chính xác -> không bị lệch tuần hoàn (nguyên nhân vân gỗ trên bề mặt 3D). Mỗi lát nguồn thu nhỏ 1 lần.
  const sub = [-0.25, 0.25];
  const xs = new Float32Array(nx * 2);
  for (let ix = 0; ix < nx; ix++) for (let a = 0; a < 2; a++) xs[ix * 2 + a] = ((ix + 0.5 + sub[a]) * step) / vol.sx - 0.5;
  const ys = new Float32Array(ny * 2);
  for (let iy = 0; iy < ny; iy++) for (let a = 0; a < 2; a++) ys[iy * 2 + a] = ((iy + 0.5 + sub[a]) * step) / vol.sy - 0.5;
  const downCache = new Map();
  const downSlice = (k) => {
    if (downCache.has(k)) return downCache.get(k);
    const out = new Float32Array(nx * ny);
    for (let iy = 0; iy < ny; iy++) {
      for (let ix = 0; ix < nx; ix++) {
        let sum = 0;
        for (let b = 0; b < 2; b++) for (let a = 0; a < 2; a++) sum += huBilinear(vol, k, xs[ix * 2 + a], ys[iy * 2 + b]);
        out[iy * nx + ix] = sum / 4;
      }
    }
    downCache.set(k, out);
    return out;
  };

  for (let iz = 0; iz < nz; iz++) {
    const kf = sliceIndexAtMm(vol, vol.positions[0] + iz * step);
    const k0 = Math.floor(kf);
    const k1 = Math.min(vol.n - 1, k0 + 1);
    const t = kf - k0;
    const d0 = downSlice(k0);
    const d1 = t > 0 ? downSlice(k1) : d0;
    const outOff = iz * nx * ny;
    for (let i = 0; i < nx * ny; i++) {
      const hu = t > 0 ? d0[i] * (1 - t) + d1[i] * t : d0[i];
      const v = hu < -32768 ? -32768 : hu > 32767 ? 32767 : Math.round(hu);
      data[outOff + i] = v;
      if (v < min) min = v;
      if (v > max) max = v;
    }
    // Giải phóng lát nguồn đã đi qua (khối đi tuần tự theo z)
    for (const key of downCache.keys()) if (key < k0) downCache.delete(key);
  }
  // Bản làm mượt (lọc [1,2,1] tách được theo 3 trục) CHỈ để tính pháp tuyến chiếu sáng.
  // Vị trí bề mặt vẫn tính trên khối gốc -> không làm sai hình học.
  const smooth = new Float32Array(data);
  const tmp = new Float32Array(data.length);
  const blurAxis = (src, dst, stride, len) => {
    for (let i = 0; i < src.length; i++) {
      const pos = Math.floor(i / stride) % len;
      const a = pos > 0 ? src[i - stride] : src[i];
      const b = pos < len - 1 ? src[i + stride] : src[i];
      dst[i] = (a + 2 * src[i] + b) * 0.25;
    }
  };
  blurAxis(smooth, tmp, 1, nx);
  blurAxis(tmp, smooth, nx, ny);
  blurAxis(smooth, tmp, nx * ny, nz);
  vol.iso = { data, nx, ny, nz, step, min, max, smooth: tmp };
  return vol.iso;
}

/** Thống kê giúp chọn ngưỡng mặc định (MR không có HU) */
export function getVolumeValueRange(validSlices) {
  const vol = buildVolume(validSlices);
  if (!vol) return null;
  const iso = buildIsoVolume(vol);
  return { min: iso.min, max: iso.max, modality: vol.modality };
}

function sampleTrilinear(iso, x, y, z, field) {
  const { nx, ny, nz } = iso;
  const data = field || iso.data;
  if (x < 0 || y < 0 || z < 0 || x > nx - 1 || y > ny - 1 || z > nz - 1) return -32768;
  const x0 = x | 0;
  const y0 = y | 0;
  const z0 = z | 0;
  const x1 = x0 + 1 < nx ? x0 + 1 : x0;
  const y1 = y0 + 1 < ny ? y0 + 1 : y0;
  const z1 = z0 + 1 < nz ? z0 + 1 : z0;
  const fx = x - x0;
  const fy = y - y0;
  const fz = z - z0;
  const plane = nx * ny;
  const i000 = z0 * plane + y0 * nx;
  const i001 = z1 * plane + y0 * nx;
  const i010 = z0 * plane + y1 * nx;
  const i011 = z1 * plane + y1 * nx;
  const c00 = data[i000 + x0] * (1 - fx) + data[i000 + x1] * fx;
  const c10 = data[i010 + x0] * (1 - fx) + data[i010 + x1] * fx;
  const c01 = data[i001 + x0] * (1 - fx) + data[i001 + x1] * fx;
  const c11 = data[i011 + x0] * (1 - fx) + data[i011 + x1] * fx;
  return (c00 * (1 - fy) + c10 * fy) * (1 - fz) + (c01 * (1 - fy) + c11 * fy) * fz;
}

export function rotateCamera(angleXDeg, angleYDeg) {
  // Hệ LPS: +x = Trái (L), +y = Sau (P), +z = Đầu (H). Mặc định nhìn từ TRƯỚC ra SAU, đầu hướng lên.
  const ay = (angleYDeg * Math.PI) / 180;
  const ax = (angleXDeg * Math.PI) / 180;
  // Xoay quanh trục đầu-chân (yaw)
  let right = [Math.cos(ay), Math.sin(ay), 0];
  let forward = [-Math.sin(ay), Math.cos(ay), 0];
  let up = [0, 0, 1];
  // Ngửa/cúi quanh trục ngang (pitch)
  const f2 = [forward[0] * Math.cos(ax) + up[0] * Math.sin(ax), forward[1] * Math.cos(ax) + up[1] * Math.sin(ax), forward[2] * Math.cos(ax) + up[2] * Math.sin(ax)];
  const u2 = [up[0] * Math.cos(ax) - forward[0] * Math.sin(ax), up[1] * Math.cos(ax) - forward[1] * Math.sin(ax), up[2] * Math.cos(ax) - forward[2] * Math.sin(ax)];
  forward = f2;
  up = u2;
  right = norm(right);
  return { right, up, forward };
}

const GRAD_OFFSETS = [1];

const MODE_COLORS = {
  bone_shaded: [0.93, 0.87, 0.74],
  vascular: [0.86, 0.22, 0.18],
  soft_tissue: [0.92, 0.72, 0.6],
};

/**
 * Dựng hình 3D bằng ray casting trong hệ toạ độ bệnh nhân.
 * @param threshold3D ngưỡng HU (bề mặt) - với chế độ MIP là HU tối thiểu được hiển thị
 */
export function renderVolume3DCanvas(canvas, validSlices, rot3D, threshold3D, colorMode3D, cols, rows, numSlices, renderRes = 300, isFastDrag = false, opts = {}) {
  const vol = buildVolume(validSlices);
  if (!canvas || !vol) return;
  const iso = buildIsoVolume(vol);
  const res = isFastDrag ? 160 : Math.max(200, Math.min(renderRes || 360, 420));
  if (canvas.width !== res) canvas.width = res;
  if (canvas.height !== res) canvas.height = res;
  const ctx = canvas.getContext('2d');
  const img = ctx.createImageData(res, res);
  const out = img.data;

  const { right, up, forward } = rotateCamera(rot3D?.angleX || 0, rot3D?.angleY || 0);
  // Hướng camera trong toạ độ voxel đẳng hướng (trục voxel = rowDir, colDir, sliceDir)
  const toVox = (v) => [dot(v, vol.rowDir), dot(v, vol.colDir), dot(v, vol.sliceDir)];
  const R = toVox(right);
  const U = toVox(up);
  const F = toVox(forward);
  const { nx, ny, nz } = iso;
  const center = [(nx - 1) / 2, (ny - 1) / 2, (nz - 1) / 2];
  // Bán kính dò tia = nửa đường chéo khối (tia luôn xuất phát NGOÀI khối, không bỏ sót voxel phía trước)
  const radius = 0.5 * Math.hypot(nx, ny, nz); // đơn vị voxel
  // Bán kính khung nhìn: vừa khít khi xoay quanh các trục chính -> vật thể to rõ hơn
  const viewRadius = 0.5 * Math.max(Math.hypot(nx, ny), Math.hypot(ny, nz), Math.hypot(nx, nz)) * 1.02;
  const stepLen = isFastDrag ? 1.2 : 0.6;
  const isMIP = colorMode3D === 'bone' || colorMode3D === 'grayscale' || colorMode3D === 'rainbow';
  const thr = Number.isFinite(threshold3D) ? threshold3D : 300;
  const base = MODE_COLORS[colorMode3D] || MODE_COLORS.bone_shaded;
  const mipWin = colorMode3D === 'bone' ? { center: 400, width: 1800 } : resolveWindow(vol, opts);
  const invF = [1 / (Math.abs(F[0]) < 1e-9 ? 1e-9 : F[0]), 1 / (Math.abs(F[1]) < 1e-9 ? 1e-9 : F[1]), 1 / (Math.abs(F[2]) < 1e-9 ? 1e-9 : F[2])];
  const lim = [nx - 1, ny - 1, nz - 1];

  for (let py = 0; py < res; py++) {
    const v = ((py + 0.5) / res - 0.5) * 2 * viewRadius;
    for (let px = 0; px < res; px++) {
      const u = ((px + 0.5) / res - 0.5) * 2 * viewRadius;
      const o = [
        center[0] + u * R[0] - v * U[0] - radius * F[0],
        center[1] + u * R[1] - v * U[1] - radius * F[1],
        center[2] + u * R[2] - v * U[2] - radius * F[2],
      ];
      // Giao tia với hộp khối
      let tmin = 0;
      let tmax = 2 * radius;
      for (let a = 0; a < 3; a++) {
        const t1 = (0 - o[a]) * invF[a];
        const t2 = (lim[a] - o[a]) * invF[a];
        tmin = Math.max(tmin, Math.min(t1, t2));
        tmax = Math.min(tmax, Math.max(t1, t2));
      }
      const oi = (py * res + px) * 4;
      out[oi + 3] = 255;
      out[oi] = 4;
      out[oi + 1] = 6;
      out[oi + 2] = 12;
      if (tmax <= tmin) continue;

      if (isMIP) {
        let maxV = -32768;
        for (let t = tmin; t <= tmax; t += stepLen) {
          const val = sampleTrilinear(iso, o[0] + t * F[0], o[1] + t * F[1], o[2] + t * F[2]);
          if (val > maxV) maxV = val;
        }
        if (maxV < thr) continue;
        const g = windowToGray(maxV, mipWin);
        if (colorMode3D === 'bone') {
          out[oi] = Math.min(255, g * 1.05);
          out[oi + 1] = Math.min(255, g * 0.94);
          out[oi + 2] = Math.min(255, g * 0.78);
        } else if (colorMode3D === 'rainbow') {
          const nv = g / 255;
          out[oi] = Math.max(0, Math.sin(nv * Math.PI) * 255);
          out[oi + 1] = Math.max(0, Math.sin((nv + 0.33) * Math.PI) * 255);
          out[oi + 2] = Math.max(0, Math.sin((nv + 0.66) * Math.PI) * 255);
        } else {
          out[oi] = g;
          out[oi + 1] = g;
          out[oi + 2] = g;
        }
        continue;
      }

      // Bề mặt đẳng trị (iso-surface)
      let prevT = tmin;
      let prevV = -32768;
      for (let t = tmin; t <= tmax; t += stepLen) {
        const x = o[0] + t * F[0];
        const y = o[1] + t * F[1];
        const z = o[2] + t * F[2];
        const val = sampleTrilinear(iso, x, y, z);
        if (val >= thr) {
          // Tinh chỉnh vị trí bề mặt (nội suy tuyến tính giữa 2 mẫu)
          const frac = prevV > -32768 && val !== prevV ? (thr - prevV) / (val - prevV) : 1;
          const th = prevT + (t - prevT) * Math.max(0, Math.min(1, frac));
          const hx = o[0] + th * F[0];
          const hy = o[1] + th * F[1];
          const hz = o[2] + th * F[2];
          // Pháp tuyến = -gradient (sai phân trung tâm)
          // Sai phân trung tâm 2 tầng (±1 và ±2 voxel) -> pháp tuyến mượt trên ranh giới sắc (da/không khí)
          let gx = 0;
          let gy = 0;
          let gz = 0;
          for (const d of GRAD_OFFSETS) {
            gx += sampleTrilinear(iso, hx + d, hy, hz, iso.smooth) - sampleTrilinear(iso, hx - d, hy, hz, iso.smooth);
            gy += sampleTrilinear(iso, hx, hy + d, hz, iso.smooth) - sampleTrilinear(iso, hx, hy - d, hz, iso.smooth);
            gz += sampleTrilinear(iso, hx, hy, hz + d, iso.smooth) - sampleTrilinear(iso, hx, hy, hz - d, iso.smooth);
          }
          const gl = Math.hypot(gx, gy, gz) || 1;
          gx /= -gl;
          gy /= -gl;
          gz /= -gl;
          // Đèn gắn camera (headlight) + specular
          const ndl = Math.abs(gx * -F[0] + gy * -F[1] + gz * -F[2]);
          const spec = Math.pow(ndl, 24) * 0.35;
          const depth = 1 - 0.35 * ((th - tmin) / Math.max(1, tmax - tmin));
          const shade = (0.18 + 0.82 * ndl) * depth;
          out[oi] = Math.min(255, (base[0] * shade + spec) * 255);
          out[oi + 1] = Math.min(255, (base[1] * shade + spec) * 255);
          out[oi + 2] = Math.min(255, (base[2] * shade + spec) * 255);
          break;
        }
        prevT = t;
        prevV = val;
      }
    }
  }
  ctx.putImageData(img, 0, 0);

  // Nhãn hướng theo camera thực
  const rightLbl = vectorToLabel(right);
  const upLbl = vectorToLabel(up);
  drawLabels(ctx, res, res, { right: rightLbl, left: oppositeLabel(rightLbl), top: upLbl, bottom: oppositeLabel(upLbl) }, '#f8fafc');
  // Thước tỉ lệ 3D (phép chiếu song song -> tỉ lệ đồng nhất)
  if (vol.calibrated) drawScaleBar(ctx, res, res, (2 * viewRadius * iso.step) / res);
}
