import { describe, it, expect } from 'vitest';
import {
  calculateDistance,
  calculateAngle,
  calculateEllipseArea,
  calculateRectArea,
  formatMeasurement,
} from '../measurement.utils';

describe('PACS Measurement Utilities (Unit & Precision Tests)', () => {
  describe('calculateDistance', () => {
    it('should return 0 when points are missing or identical', () => {
      expect(calculateDistance(null, null)).toBe(0);
      expect(calculateDistance({ x: 10, y: 10 }, { x: 10, y: 10 })).toBe(0);
    });

    it('should accurately calculate isotropic Euclidean distance (3-4-5 triangle)', () => {
      const p1 = { x: 0, y: 0 };
      const p2 = { x: 30, y: 40 };
      const dist = calculateDistance(p1, p2, [1.0, 1.0]);
      expect(dist).toBeCloseTo(50, 4);
    });

    it('should accurately handle anisotropic pixel spacing (e.g. CT slice spacing: 0.5 mm x 0.8 mm)', () => {
      const p1 = { x: 10, y: 20 };
      const p2 = { x: 30, y: 50 }; // dx = 20 px, dy = 30 px
      // dxMm = 20 * 0.8 = 16 mm, dyMm = 30 * 0.5 = 15 mm
      // dist = sqrt(16^2 + 15^2) = sqrt(256 + 225) = sqrt(481) = 21.9317 mm
      const dist = calculateDistance(p1, p2, [0.5, 0.8]);
      expect(dist).toBeCloseTo(21.9317, 3);
    });
  });

  describe('calculateAngle', () => {
    it('should return 0 when points are missing or degenerate', () => {
      expect(calculateAngle(null, null, null)).toBe(0);
      expect(calculateAngle({ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 })).toBe(0);
    });

    it('should accurately calculate a 90 degree right angle', () => {
      const p1 = { x: 0, y: 10 };
      const p2 = { x: 0, y: 0 }; // vertex
      const p3 = { x: 10, y: 0 };
      const angle = calculateAngle(p1, p2, p3);
      expect(angle).toBeCloseTo(90.0, 4);
    });

    it('should accurately calculate a 180 degree straight line', () => {
      const p1 = { x: -10, y: 0 };
      const p2 = { x: 0, y: 0 }; // vertex
      const p3 = { x: 10, y: 0 };
      const angle = calculateAngle(p1, p2, p3);
      expect(angle).toBeCloseTo(180.0, 4);
    });

    it('should accurately calculate a 45 degree angle', () => {
      const p1 = { x: 10, y: 10 };
      const p2 = { x: 0, y: 0 }; // vertex
      const p3 = { x: 10, y: 0 };
      const angle = calculateAngle(p1, p2, p3);
      expect(angle).toBeCloseTo(45.0, 4);
    });
  });

  describe('calculateEllipseArea & calculateRectArea', () => {
    it('should return 0 for degenerate or missing coordinates', () => {
      expect(calculateEllipseArea(null, null)).toBe(0);
      expect(calculateRectArea(null, null)).toBe(0);
    });

    it('should calculate rectangle area correctly with pixel spacing', () => {
      const p1 = { x: 0, y: 0 };
      const p2 = { x: 10, y: 20 };
      // dxMm = 10 * 1 = 10, dyMm = 20 * 1 = 20 => area = 200 mm²
      expect(calculateRectArea(p1, p2, [1.0, 1.0])).toBe(200);

      // With anisotropic spacing [2.0, 0.5]: dxMm = 10 * 0.5 = 5, dyMm = 20 * 2.0 = 40 => area = 200 mm²
      expect(calculateRectArea(p1, p2, [2.0, 0.5])).toBe(200);
    });

    it('should calculate ellipse area correctly (pi * rx * ry)', () => {
      const p1 = { x: 0, y: 0 };
      const p2 = { x: 20, y: 40 };
      // rx = 10, ry = 20, area = pi * 10 * 20 = 200 * pi = 628.3185 mm²
      const area = calculateEllipseArea(p1, p2, [1.0, 1.0]);
      expect(area).toBeCloseTo(200 * Math.PI, 4);
    });
  });

  describe('formatMeasurement', () => {
    it('should format length, angle, and ROI with appropriate units', () => {
      expect(formatMeasurement('length', 12.345)).toBe('12.3 mm');
      expect(formatMeasurement('angle', 89.96)).toBe('90.0°');
      expect(formatMeasurement('roi_ellipse', 450.21)).toBe('450.2 mm²');
      expect(formatMeasurement('roi_rect', 100.0)).toBe('100.0 mm²');
      expect(formatMeasurement('other', 5)).toBe('5.0');
      expect(formatMeasurement('length', null)).toBe('');
    });
  });
});
