import { describe, it, expect, beforeEach } from 'vitest';

// In-memory mock for localStorage in node test environment
let store = {};
const mockLocalStorage = {
  getItem: (key) => store[key] || null,
  setItem: (key, val) => { store[key] = String(val); },
  removeItem: (key) => { delete store[key]; },
  clear: () => { store = {}; },
};
globalThis.localStorage = mockLocalStorage;

const {
  getAllClinicalTemplates,
  saveAllClinicalTemplates,
  resolveClinicalTemplate,
  upsertClinicalTemplate,
  deleteClinicalTemplate,
} = await import('../clinicalTemplateService');
const { default: STORAGE } = await import('../storage');

describe('clinicalTemplateService - 5-Tier Integration with HomeCare Tầng 1 & Tầng 2', () => {
  beforeEach(() => {
    STORAGE.clear();
  });

  it('phải tải danh sách mẫu mặc định ban đầu nếu chưa có trong storage', () => {
    const list = getAllClinicalTemplates();
    expect(Array.isArray(list)).toBe(true);
    expect(list.length).toBeGreaterThanOrEqual(3);
    const codes = list.map((t) => t.code);
    expect(codes).toContain('ABDOMEN');
    expect(codes).toContain('THYROID_TIRADS');
    expect(codes).toContain('BREAST_BIRADS');
  });

  it('phải resolve chính xác theo id_exam_part khi đã được gán', async () => {
    const customTemplate = {
      code: 'CUSTOM_EXAM_PART',
      title: 'Mẫu theo Exam Part 101',
      id_template_service: 1,
      id_exam_part: 101,
      organs: [],
    };
    await upsertClinicalTemplate(customTemplate);

    const resolved = resolveClinicalTemplate({
      idTemplateService: 1,
      idExamPart: 101,
      examPartName: 'Tùy biến',
    });
    expect(resolved).toBeDefined();
    expect(resolved.code).toBe('CUSTOM_EXAM_PART');
  });

  it('trả về null nếu không có mẫu nào khớp với Phân hệ và Bộ phận đang chọn', () => {
    const missing = resolveClinicalTemplate({
      idTemplateService: 999,
      idExamPart: 888,
    });
    expect(missing).toBeNull();

    const missingPart = resolveClinicalTemplate({
      examPartName: 'Chi dưới',
    });
    expect(missingPart).toBeNull();
  });

  it('phải thêm mới hoặc cập nhật mẫu lâm sàng 5 tầng thành công', async () => {
    const newTpl = {
      code: 'TEST_NEW_TPL',
      title: 'Mẫu Test Mới',
      classificationType: 'NONE',
      organs: [{ key: 'ORG_1', label: 'Cơ quan 1', options: [] }],
    };
    await upsertClinicalTemplate(newTpl);

    const all = getAllClinicalTemplates();
    const found = all.find((t) => t.code === 'TEST_NEW_TPL');
    expect(found).toBeDefined();
    expect(found.title).toBe('Mẫu Test Mới');
  });

  it('phải xóa mẫu theo code thành công', async () => {
    const newTpl = {
      code: 'TO_DELETE',
      title: 'Mẫu xóa',
      organs: [],
    };
    await upsertClinicalTemplate(newTpl);
    expect(getAllClinicalTemplates().some((t) => t.code === 'TO_DELETE')).toBe(true);

    deleteClinicalTemplate('TO_DELETE');
    expect(getAllClinicalTemplates().some((t) => t.code === 'TO_DELETE')).toBe(false);
  });
});
