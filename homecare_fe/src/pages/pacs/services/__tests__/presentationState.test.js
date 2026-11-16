import { describe, it, expect } from 'vitest';
import { pickRestoreState, migrateAnnotationKeys } from '../../hooks/usePacsPresentationState';

describe('Khôi phục số đo: không bao giờ để bản cũ đè bản mới', () => {
  const server = { annotations: { 'A#0': [{ id: 1 }] }, updatedAt: '2026-11-16T10:00:05Z', clientUpdatedAt: '2026-11-16T10:00:00Z' };

  it('Máy chủ là nguồn chính khi bản trong trình duyệt đã đồng bộ', () => {
    const local = { annotations: {}, updatedAt: '2026-11-16T11:00:00Z', synced: true };
    expect(pickRestoreState(server, local).source).toBe('server');
  });

  it('Thay đổi CHƯA đồng bộ và mới hơn (mất mạng / đóng tab) -> dùng bản trình duyệt để gửi lại', () => {
    const local = { annotations: { 'A#0': [{ id: 1 }, { id: 2 }] }, updatedAt: '2026-11-16T10:01:00Z', synced: false };
    expect(pickRestoreState(server, local).source).toBe('local');
  });

  it('Bản chưa đồng bộ nhưng CŨ hơn máy chủ (đã đo tiếp ở máy khác) -> giữ bản máy chủ', () => {
    const local = { annotations: {}, updatedAt: '2026-11-16T09:00:00Z', synced: false };
    expect(pickRestoreState(server, local).source).toBe('server');
  });

  it('Máy chủ chưa có gì -> dùng bản chưa đồng bộ', () => {
    expect(pickRestoreState(null, { annotations: { x: [1] }, updatedAt: '2026-01-01T00:00:00Z', synced: false }).source).toBe('local');
  });

  it('Số đo kiểu cũ (index) chuyển sang khoá SOP#frame, không mất số đo nào', () => {
    const out = migrateAnnotationKeys({ 0: [{ id: 1 }], 1: [{ id: 2 }, { id: 3 }], 'B#0': [{ id: 4 }] }, ['A#0', 'B#0']);
    expect(out['A#0']).toEqual([{ id: 1 }]);
    expect(out['B#0'].map((a) => a.id).sort()).toEqual([2, 3, 4]);
  });
});
