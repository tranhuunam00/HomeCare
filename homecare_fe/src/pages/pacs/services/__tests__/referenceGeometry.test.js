import { describe, it, expect } from 'vitest';
import { getPlaneGeometry, computeReferenceLine, findNearestSlice, planeCenter, patientToImage } from '../../utils/referenceGeometry';

// Axial 512x512, pixel 0.7 mm, gốc (-179.2, -179.2, z)
const axial = (z) => ({
  rows: 512,
  columns: 512,
  pixelSpacing: [0.7, 0.7],
  imageOrientationPatient: [1, 0, 0, 0, 1, 0],
  imagePositionPatient: [-179.2, -179.2, z],
});
// Coronal 512 cột x 300 hàng: x tăng theo cột, z GIẢM theo hàng (đầu ở trên), lát tại y = 10
const coronal = {
  rows: 300,
  columns: 512,
  pixelSpacing: [1, 0.7],
  imageOrientationPatient: [1, 0, 0, 0, 0, -1],
  imagePositionPatient: [-179.2, 10, 100],
};

describe('Đường tham chiếu (reference line)', () => {
  it('Lát Axial z = 40 hiện thành đường NGANG trên ảnh Coronal, đúng hàng tương ứng', () => {
    const line = computeReferenceLine(getPlaneGeometry(axial(40)), getPlaneGeometry(coronal));
    expect(line).not.toBeNull();
    // z = 40 -> cách đỉnh (z = 100) 60 mm -> hàng 60 (spacing hàng 1 mm), cộng 0.5 tâm pixel
    expect(line[0].y).toBeCloseTo(60.5, 6);
    expect(line[1].y).toBeCloseTo(60.5, 6);
    expect(Math.abs(line[0].x - line[1].x)).toBeCloseTo(511, 6); // chạy hết bề ngang ảnh
  });

  it('Lát Coronal y = 10 hiện thành đường ngang trên Axial ở đúng hàng', () => {
    const line = computeReferenceLine(getPlaneGeometry(coronal), getPlaneGeometry(axial(0)));
    const expectedRow = (10 - -179.2) / 0.7 + 0.5;
    expect(line[0].y).toBeCloseTo(expectedRow, 6);
    expect(line[1].y).toBeCloseTo(expectedRow, 6);
  });

  it('Hai mặt phẳng song song -> không vẽ đường', () => {
    expect(computeReferenceLine(getPlaneGeometry(axial(0)), getPlaneGeometry(axial(5)))).toBeNull();
  });

  it('Lát nằm ngoài vùng ảnh đích -> không vẽ', () => {
    expect(computeReferenceLine(getPlaneGeometry(axial(500)), getPlaneGeometry(coronal))).toBeNull();
  });

  it('Ảnh thiếu hình học (X-quang) -> null', () => {
    expect(getPlaneGeometry({ rows: 10, columns: 10, pixelSpacing: [1, 1] })).toBeNull();
  });
});

describe('Đồng bộ cuộn theo vị trí bệnh nhân', () => {
  // Series A: lát 5 mm; series B: lát 1.25 mm, lệch gốc 0.6 mm
  const seriesA = Array.from({ length: 40 }, (_, i) => axial(100 - i * 5));
  const seriesB = Array.from({ length: 160 }, (_, i) => axial(100.6 - i * 1.25));

  it('Lát A ở z = 50 -> lát B gần nhất (z = 50.6 hoặc 49.35), không phải cùng số thứ tự', () => {
    const src = getPlaneGeometry(seriesA[10]); // z = 50
    const hit = findNearestSlice(seriesB, planeCenter(src), src);
    const zHit = seriesB[hit.index].imagePositionPatient[2];
    expect(Math.abs(zHit - 50)).toBeLessThanOrEqual(0.625);
    expect(hit.index).not.toBe(10);
  });

  it('Khác hướng cắt (Axial vs Coronal) -> không đồng bộ vị trí', () => {
    const src = getPlaneGeometry(seriesA[0]);
    expect(findNearestSlice([coronal], planeCenter(src), src)).toBeNull();
  });

  it('patientToImage: IPP là tâm pixel (0,0)', () => {
    const g = getPlaneGeometry(axial(0));
    expect(patientToImage(g, [-179.2, -179.2, 0])).toEqual({ x: 0.5, y: 0.5 });
  });
});
