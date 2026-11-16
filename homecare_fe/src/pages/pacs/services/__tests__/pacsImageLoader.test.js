import { describe, it, expect } from 'vitest';
import { buildOrderedInstances, buildLegacyOrderKeys, orderByDistance } from '../pacsImageLoader';
import { migrateAnnotationKeys } from '../../hooks/usePacsPresentationState';

const axial = [1, 0, 0, 0, 1, 0];

describe('Sắp xếp lát cắt theo giải phẫu', () => {
  it('Axial: sắp theo vị trí z giảm dần (đầu -> chân), không theo InstanceNumber lộn xộn', () => {
    const raw = [
      { sopInstanceUid: 'a', seriesInstanceUid: 's1', instanceNumber: 1, imageOrientationPatient: axial, imagePositionPatient: [0, 0, -20] },
      { sopInstanceUid: 'b', seriesInstanceUid: 's1', instanceNumber: 2, imageOrientationPatient: axial, imagePositionPatient: [0, 0, 10] },
      { sopInstanceUid: 'c', seriesInstanceUid: 's1', instanceNumber: 3, imageOrientationPatient: axial, imagePositionPatient: [0, 0, -5] },
    ];
    expect(buildOrderedInstances(raw).map((i) => i.sopInstanceUid)).toEqual(['b', 'c', 'a']);
  });

  it('Thiếu hình học -> theo InstanceNumber; series theo SeriesNumber; Non-DICOM cuối', () => {
    const raw = [
      { sopInstanceUid: 'n1', seriesInstanceUid: 'ndcm', isNonDicom: true, instanceNumber: 1 },
      { sopInstanceUid: 'x2', seriesInstanceUid: 's3', seriesNumber: 3, instanceNumber: 2 },
      { sopInstanceUid: 'y1', seriesInstanceUid: 's2', seriesNumber: 2, instanceNumber: 1 },
      { sopInstanceUid: 'x1', seriesInstanceUid: 's3', seriesNumber: 3, instanceNumber: 1 },
    ];
    expect(buildOrderedInstances(raw).map((i) => i.sopInstanceUid)).toEqual(['y1', 'x1', 'x2', 'n1']);
  });

  it('Ảnh nhiều frame được tách thành từng frame với khoá ổn định', () => {
    const out = buildOrderedInstances([{ sopInstanceUid: 'us', seriesInstanceUid: 's', numberOfFrames: 3 }]);
    expect(out.map((i) => i.key)).toEqual(['us#0', 'us#1', 'us#2']);
  });

  it('Prefetch xen kẽ 2 phía từ lát hiện tại', () => {
    expect(orderByDistance([0, 1, 2, 3, 4, 5], 2)).toEqual([2, 3, 1, 4, 0, 5]);
  });
});

describe('Chuyển số đo cũ (theo index) sang khoá ổn định', () => {
  it('Dựng lại đúng thứ tự cũ -> số đo gắn đúng lát dù thứ tự hiển thị mới khác', () => {
    // Thứ tự cũ: sort toàn bộ theo InstanceNumber (ổn định), lẫn giữa các series
    const raw = [
      { sopInstanceUid: 'lung-2', seriesInstanceUid: 'lung', instanceNumber: 2 },
      { sopInstanceUid: 'med-1', seriesInstanceUid: 'med', instanceNumber: 1 },
      { sopInstanceUid: 'lung-1', seriesInstanceUid: 'lung', instanceNumber: 1 },
    ];
    const legacy = buildLegacyOrderKeys(raw);
    expect(legacy).toEqual(['med-1#0', 'lung-1#0', 'lung-2#0']);
    const saved = { 0: [{ type: 'length', valueText: '12.0 mm' }], 2: [{ type: 'angle' }], 'x#0': [{ type: 'roi_rect' }] };
    const migrated = migrateAnnotationKeys(saved, legacy);
    expect(Object.keys(migrated).sort()).toEqual(['lung-2#0', 'med-1#0', 'x#0']);
    expect(migrated['med-1#0'][0].valueText).toBe('12.0 mm');
  });
});
