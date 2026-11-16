import { describe, it, expect } from 'vitest';
import { buildVolume, reslicePlane, getPlaneGeometry, mprEventToVoxel, rotateCamera, describeVolume } from '../pacsVolumeEngine';
import { screenToImage, imageToScreen } from '../../utils/viewportMapping';
import { calculateDistance, calculateAngle, calculateEllipseArea, calculateRectArea } from '../../utils/measurement.utils';
import { vectorToLabel } from '../dicomImageCore';

/**
 * Khối giả lập: quả cầu bán kính 40 mm (HU 1000) trong nền -1000 HU.
 * Pixel 0.8 x 0.8 mm, 100 lát cách nhau 1.5 mm (độ dày lát 3 mm - chồng lấp, để chắc chắn engine dùng vị trí thật).
 */
function makeSphereVolume({ cols = 128, rows = 128, n = 100, sx = 0.8, sy = 0.8, sz = 1.5, radius = 40 } = {}) {
  const cxMm = (cols / 2) * sx;
  const cyMm = (rows / 2) * sy;
  const czMm = (n / 2) * sz;
  const slices = [];
  for (let k = 0; k < n; k++) {
    const zPatient = 100 - k * sz; // sắp từ đầu xuống chân (z giảm dần)
    const px = new Int16Array(cols * rows);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const d = Math.hypot(c * sx - cxMm, r * sy - cyMm, k * sz - czMm);
        px[r * cols + c] = (d <= radius ? 1000 : -1000) + 1024; // lưu trữ = HU + 1024
      }
    }
    slices.push({
      rawPixels: px,
      meta: {
        rows,
        columns: cols,
        pixelSpacing: [sy, sx],
        sliceThickness: 3,
        imageOrientationPatient: [1, 0, 0, 0, 1, 0],
        imagePositionPatient: [0, 0, zPatient],
        rescaleSlope: 1,
        rescaleIntercept: -1024,
        windowCenter: 40,
        windowWidth: 400,
        modality: 'CT',
      },
    });
  }
  return slices;
}

/** Đường kính (mm) của vùng HU > 0 dọc 1 hàng / 1 cột của lưới reslice */
function extentAlong(r, fixed, axis) {
  let count = 0;
  if (axis === 'row') {
    for (let c = 0; c < r.W; c++) if (r.hu[fixed * r.W + c] > 0) count++;
  } else {
    for (let y = 0; y < r.H; y++) if (r.hu[y * r.W + fixed] > 0) count++;
  }
  return count * r.mmPerPx;
}

describe('MPR - kích thước vật lý đúng', () => {
  const slices = makeSphereVolume();
  const center = { x: 64, y: 64, z: 50 };

  it('Khoảng cách lát lấy từ vị trí thật (1.5mm), KHÔNG lấy SliceThickness (3mm)', () => {
    const v = describeVolume(slices);
    expect(v.sz).toBeCloseTo(1.5, 6);
    expect(v.spacingSource).toBe('ImagePositionPatient');
    expect(v.irregular).toBe(false);
  });

  it('Canvas Coronal có tỉ lệ vật lý đúng (không bị ép vuông)', () => {
    const vol = buildVolume(slices);
    const g = getPlaneGeometry(vol, 'CORONAL');
    expect(g.W).toBe(128);
    expect(g.H).toBe(Math.round((99 * 1.5) / 0.8) + 1); // 187 px = 148.5 mm
  });

  for (const plane of ['AXIAL', 'CORONAL', 'SAGITTAL']) {
    it(`${plane}: đường kính quả cầu đo được ≈ 80 mm theo cả 2 chiều (sai số ≤ 1 voxel)`, () => {
      const r = reslicePlane(slices, plane, center);
      const midRow = Math.round(r.cross.cy);
      const midCol = Math.round(r.cross.cx);
      const horiz = extentAlong(r, midRow, 'row');
      const vert = extentAlong(r, midCol, 'col');
      expect(Math.abs(horiz - 80)).toBeLessThanOrEqual(1.6);
      expect(Math.abs(vert - 80)).toBeLessThanOrEqual(1.6);
    });
  }

  it('Nhãn hướng MPR suy ra từ DICOM: Axial (A trên, L phải), Coronal (H trên), Sagittal (P phải)', () => {
    expect(reslicePlane(slices, 'AXIAL', center).labels).toMatchObject({ top: 'A', bottom: 'P', left: 'R', right: 'L' });
    expect(reslicePlane(slices, 'CORONAL', center).labels).toMatchObject({ top: 'H', bottom: 'F', right: 'L' });
    expect(reslicePlane(slices, 'SAGITTAL', center).labels).toMatchObject({ top: 'H', right: 'P', left: 'A' });
  });

  it('Click trên canvas có viền (object-fit: contain) -> đúng voxel', () => {
    const vol = buildVolume(slices);
    const { W, H } = getPlaneGeometry(vol, 'CORONAL'); // 128 x 187
    // Phần tử hiển thị 500x500: ảnh co theo chiều cao, viền 2 bên
    const rect = { left: 100, top: 50, width: 500, height: 500 };
    const s = Math.min(rect.width / W, rect.height / H);
    const ox = rect.left + (rect.width - W * s) / 2;
    const el = { width: W, height: H, getBoundingClientRect: () => rect };
    // Click vào cột 32, hàng ứng với lát #50 (z = 75mm từ lát đầu)
    const rowOfSlice50 = (50 * 1.5) / (vol.zExtent / (H - 1));
    const v = mprEventToVoxel({ currentTarget: el, clientX: ox + 32.2 * s, clientY: rect.top + rowOfSlice50 * s }, 'CORONAL', slices);
    expect(v.x).toBe(32);
    expect(v.z).toBe(50);
  });

  it('Camera 3D mặc định nhìn từ phía trước: phải màn hình = L, trên = H (đầu)', () => {
    const cam = rotateCamera(0, 0);
    expect(vectorToLabel(cam.right)).toBe('L');
    expect(vectorToLabel(cam.up)).toBe('H');
    expect(vectorToLabel(cam.forward)).toBe('P'); // nhìn từ trước ra sau
    const side = rotateCamera(0, 90);
    expect(vectorToLabel(side.forward)).toBe('R'); // xoay 90° -> nhìn từ bên trái bệnh nhân
  });
});

describe('Viewer 2D - đổi toạ độ chuột chính xác với mọi phép biến đổi', () => {
  const base = { centerX: 700, centerY: 450, W: 512, H: 512, layoutW: 800, layoutH: 800 };
  const cases = [];
  for (const zoom of [0.5, 1, 2.75]) for (const rotation of [0, 90, 180, 270]) for (const flipH of [false, true]) for (const flipV of [false, true]) cases.push({ zoom, rotation, flipH, flipV });

  it(`Ảnh -> màn hình -> ảnh khớp (${cases.length} tổ hợp zoom/xoay/lật)`, () => {
    for (const c of cases) {
      for (const p of [{ x: 0, y: 0 }, { x: 511.5, y: 3.25 }, { x: 200.4, y: 377.9 }]) {
        const scr = imageToScreen(p, { ...base, ...c });
        const back = screenToImage(scr, { ...base, ...c });
        expect(back.x).toBeCloseTo(p.x, 6);
        expect(back.y).toBeCloseTo(p.y, 6);
      }
    }
  });

  it('Pixel không vuông (siêu âm 0.2 x 0.3 mm): hiển thị theo tỉ lệ vật lý, ánh xạ vẫn đúng', () => {
    const cfg = { centerX: 500, centerY: 400, W: 640, H: 480, layoutW: 640 * 0.3 * 2, layoutH: 480 * 0.2 * 2, zoom: 1.3, rotation: 90, flipH: true, flipV: false };
    const p = { x: 123.4, y: 321.9 };
    const back = screenToImage(imageToScreen(p, cfg), cfg);
    expect(back.x).toBeCloseTo(p.x, 6);
    expect(back.y).toBeCloseTo(p.y, 6);
  });
});

describe('Công thức đo theo PixelSpacing [hàng, cột]', () => {
  const ps = [0.5, 0.8]; // 0.5 mm giữa các hàng (dọc), 0.8 mm giữa các cột (ngang)
  it('Khoảng cách ngang dùng spacing cột, dọc dùng spacing hàng', () => {
    expect(calculateDistance({ x: 0, y: 0 }, { x: 100, y: 0 }, ps)).toBeCloseTo(80, 9);
    expect(calculateDistance({ x: 0, y: 0 }, { x: 0, y: 100 }, ps)).toBeCloseTo(50, 9);
    expect(calculateDistance({ x: 0, y: 0 }, { x: 30, y: 40 }, ps)).toBeCloseTo(Math.hypot(24, 20), 9);
  });
  it('Góc tính trong không gian mm: 2 cạnh vuông góc vật lý = 90° dù pixel không vuông', () => {
    // Đường chéo 45° trên lưới pixel không phải 45° thật khi pixel không vuông
    expect(calculateAngle({ x: 100, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 100 }, ps)).toBeCloseTo(90, 9);
    const a = calculateAngle({ x: 100, y: 0 }, { x: 0, y: 0 }, { x: 100, y: 100 }, ps);
    expect(a).toBeCloseTo((Math.atan2(50, 80) * 180) / Math.PI, 6); // 32.0°, không phải 45°
  });
  it('Diện tích elip / chữ nhật', () => {
    expect(calculateRectArea({ x: 0, y: 0 }, { x: 10, y: 20 }, ps)).toBeCloseTo(8 * 10, 9);
    expect(calculateEllipseArea({ x: 0, y: 0 }, { x: 10, y: 20 }, ps)).toBeCloseTo(Math.PI * 4 * 5, 9);
  });
});
