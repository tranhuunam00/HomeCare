import { describe, it, expect } from "vitest";
import { calibrationAt, describeCalibration, parseUltrasoundRegions } from "../dicomImageCore";

// Dataset giả lập API dicom-parser cho 1 item của Sequence of Ultrasound Regions
const regionItem = ({ x0, y0, x1, y1, unitsX = 3, unitsY = 3, dx = 0.01, dy = 0.01 }) => {
  const v = {
    x00186018: x0, x0018601a: y0, x0018601c: x1, x0018601e: y1,
    x00186024: unitsX, x00186026: unitsY, x0018602c: dx, x0018602e: dy,
  };
  return { dataSet: { uint32: (t) => v[t], uint16: (t) => v[t], double: (t) => v[t] } };
};
const dsWith = (...regions) => ({ elements: { x00186011: { items: regions.map(regionItem) } } });

describe("parseUltrasoundRegions", () => {
  it("đọc mọi vùng; vùng đơn vị cm có spacing mm/px, vùng Doppler (giây, cm/s) spacing = null", () => {
    const regions = parseUltrasoundRegions(
      dsWith({ x0: 0, y0: 0, x1: 399, y1: 299, dx: 0.02, dy: 0.02 }, { x0: 0, y0: 300, x1: 399, y1: 599, unitsX: 4, unitsY: 7 })
    );
    expect(regions).toHaveLength(2);
    expect(regions[0].spacing).toEqual([0.2, 0.2]);
    expect(regions[1].spacing).toBeNull();
  });

  it("không có sequence -> mảng rỗng", () => {
    expect(parseUltrasoundRegions({ elements: {} })).toEqual([]);
    expect(parseUltrasoundRegions(null)).toEqual([]);
  });
});

describe("calibrationAt", () => {
  const twoPane = {
    pixelSpacing: [0.2, 0.2],
    pixelSpacingSource: "UltrasoundRegion",
    usRegions: [
      { x0: 0, y0: 0, x1: 399, y1: 299, spacing: [0.2, 0.2] },
      { x0: 400, y0: 0, x1: 799, y1: 299, spacing: [0.5, 0.5] },
      { x0: 0, y0: 300, x1: 799, y1: 599, spacing: null }, // phổ Doppler
    ],
  };

  it("đo ở vùng 2 dùng hiệu chuẩn vùng 2 (trước đây dùng nhầm vùng 1)", () => {
    expect(calibrationAt(twoPane, { x: 500, y: 100 })).toEqual({ spacing: [0.5, 0.5], calibrated: true, source: "UltrasoundRegion" });
    expect(calibrationAt(twoPane, { x: 100, y: 100 }).spacing).toEqual([0.2, 0.2]);
  });

  it("đo trong vùng phổ Doppler / ngoài mọi vùng -> px, không hiện mm sai", () => {
    expect(calibrationAt(twoPane, { x: 100, y: 400 })).toEqual({ spacing: null, calibrated: false, source: null });
    expect(calibrationAt(twoPane, { x: 900, y: 900 }).calibrated).toBe(false);
  });

  it("ảnh 1 vùng / CT: giữ hiệu chuẩn chung như trước", () => {
    const ct = { pixelSpacing: [0.7, 0.7], pixelSpacingSource: "PixelSpacing" };
    expect(calibrationAt(ct, { x: 1, y: 1 })).toEqual({ spacing: [0.7, 0.7], calibrated: true, source: "PixelSpacing" });
    expect(calibrationAt({}, { x: 1, y: 1 })).toEqual({ spacing: null, calibrated: false, source: null });
  });

  it("HUD báo hiệu chuẩn theo vùng khi có nhiều vùng", () => {
    expect(describeCalibration(twoPane).label).toContain("3 vùng siêu âm");
  });
});
