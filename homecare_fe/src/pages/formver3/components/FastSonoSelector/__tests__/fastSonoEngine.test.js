import { describe, it, expect } from 'vitest';
import {
  initDefaultSelectedMap,
  toggleFindingOption,
  countTotalAbnormalities,
  filterOptionsByGender,
  generateBulletedNarrative,
  generateConclusionText,
  generateHTMLNarrative,
} from '../fastSonoEngine';
import { DEFAULT_CLINICAL_TEMPLATES, CLASSIFICATION_TYPES } from '../fastSono.constants';

describe('FastSonoEngine - Core Domain Logic & Business Rules (TDD)', () => {
  const abdomenTemplate = DEFAULT_CLINICAL_TEMPLATES.ABDOMEN;
  const liverOrgan = abdomenTemplate.organs.find((o) => o.key === 'LIVER');
  const pelvisOrgan = abdomenTemplate.organs.find((o) => o.key === 'PELVIS');

  describe('1. initDefaultSelectedMap', () => {
    it('phải khởi tạo tất cả các cơ quan về trạng thái NORMAL mặc định', () => {
      const map = initDefaultSelectedMap(abdomenTemplate);
      expect(map).toBeDefined();
      expect(map.LIVER).toEqual(['NORMAL']);
      expect(map.GALLBLADDER).toEqual(['NORMAL']);
      expect(map.KIDNEYS).toEqual(['NORMAL']);
      expect(Object.keys(map).length).toBe(abdomenTemplate.organs.length);
    });

    it('phải xử lý an toàn khi template null hoặc rỗng (Input biên)', () => {
      expect(initDefaultSelectedMap(null)).toEqual({});
      expect(initDefaultSelectedMap({})).toEqual({});
      expect(initDefaultSelectedMap({ organs: [] })).toEqual({});
    });
  });

  describe('2. toggleFindingOption', () => {
    it('khi đang là NORMAL, bấm chọn tổn thương bất thường phải xóa NORMAL và thêm id bất thường', () => {
      const current = ['NORMAL'];
      const next = toggleFindingOption(current, liverOrgan, 'LIVER_FATTY_1');
      expect(next).toEqual(['LIVER_FATTY_1']);
      expect(next).not.toContain('NORMAL');
    });

    it('cho phép chọn nhiều bất thường cùng lúc (multi-select)', () => {
      const current = ['LIVER_FATTY_1'];
      const next = toggleFindingOption(current, liverOrgan, 'LIVER_CYST');
      expect(next).toEqual(['LIVER_FATTY_1', 'LIVER_CYST']);
    });

    it('khi bấm bỏ một tổn thương, nếu còn tổn thương khác thì giữ lại các tổn thương còn lại', () => {
      const current = ['LIVER_FATTY_1', 'LIVER_CYST'];
      const next = toggleFindingOption(current, liverOrgan, 'LIVER_FATTY_1');
      expect(next).toEqual(['LIVER_CYST']);
    });

    it('khi bấm bỏ tổn thương cuối cùng, phải tự động phục hồi về trạng thái NORMAL', () => {
      const current = ['LIVER_CYST'];
      const next = toggleFindingOption(current, liverOrgan, 'LIVER_CYST');
      expect(next).toEqual(['NORMAL']);
    });

    it('khi đang có bất thường, nếu bấm vào nút NORMAL thì phải xóa sạch bất thường và đưa về NORMAL', () => {
      const current = ['LIVER_FATTY_1', 'LIVER_CYST', 'LIVER_HEMA'];
      const next = toggleFindingOption(current, liverOrgan, 'NORMAL');
      expect(next).toEqual(['NORMAL']);
    });

    it('xử lý an toàn khi truyền organ hoặc optionId không hợp lệ', () => {
      expect(toggleFindingOption(['NORMAL'], null, 'UNKNOWN')).toEqual(['NORMAL']);
      expect(toggleFindingOption(['NORMAL'], liverOrgan, null)).toEqual(['NORMAL']);
      expect(toggleFindingOption(['NORMAL'], liverOrgan, 'NON_EXISTENT')).toEqual(['NORMAL']);
    });
  });

  describe('3. countTotalAbnormalities', () => {
    it('khi tất cả các cơ quan đều là NORMAL thì tổng số bất thường phải bằng 0', () => {
      const map = initDefaultSelectedMap(abdomenTemplate);
      expect(countTotalAbnormalities(abdomenTemplate.organs, map)).toBe(0);
    });

    it('đếm chính xác khi có nhiều tổn thương ở nhiều cơ quan khác nhau', () => {
      const map = {
        LIVER: ['LIVER_FATTY_1', 'LIVER_CYST'], // 2
        GALLBLADDER: ['GB_STONE'],              // 1
        KIDNEYS: ['NORMAL'],                    // 0
      };
      expect(countTotalAbnormalities(abdomenTemplate.organs, map)).toBe(3);
    });

    it('xử lý an toàn khi organs null hoặc không phải array', () => {
      expect(countTotalAbnormalities(null, {})).toBe(0);
      expect(countTotalAbnormalities(undefined, {})).toBe(0);
    });
  });

  describe('4. filterOptionsByGender', () => {
    it('lọc chính xác cho bệnh nhân Nam: hiển thị ALL và MALE, ẩn FEMALE', () => {
      const filtered = filterOptionsByGender(pelvisOrgan.options, 'Nam');
      const ids = filtered.map((o) => o.id);
      expect(ids).toContain('NORMAL');
      expect(ids).toContain('PELVIS_PROSTATE_BPH');
      expect(ids).not.toContain('PELVIS_FIBROID');
      expect(ids).not.toContain('PELVIS_OVARY_CYST');
    });

    it('lọc chính xác cho bệnh nhân Nữ: hiển thị ALL và FEMALE, ẩn MALE', () => {
      const filtered = filterOptionsByGender(pelvisOrgan.options, 'Nữ');
      const ids = filtered.map((o) => o.id);
      expect(ids).toContain('NORMAL');
      expect(ids).not.toContain('PELVIS_PROSTATE_BPH');
      expect(ids).toContain('PELVIS_FIBROID');
      expect(ids).toContain('PELVIS_OVARY_CYST');
    });

    it('khi không rõ giới tính thì hiển thị toàn bộ options', () => {
      const filtered = filterOptionsByGender(pelvisOrgan.options, '');
      expect(filtered.length).toBe(pelvisOrgan.options.length);
    });
  });

  describe('5. generateBulletedNarrative', () => {
    it('sinh đúng câu văn mô tả khi tất cả đều bình thường', () => {
      const map = initDefaultSelectedMap(abdomenTemplate);
      const narrative = generateBulletedNarrative(abdomenTemplate.organs, map, 'Nam');
      expect(narrative).toContain('• Gan: Gan không to, bờ đều, nhu mô đồng nhất, không thấy khối khu trú.');
      expect(narrative).toContain('• Túi mật: Túi mật không căng, thành mỏng, lòng không có sỏi.');
      expect(narrative).toContain('• Hai thận: Hai thận kích thước bình thường, phân biệt vỏ tủy rõ, không sỏi, không ứ nước.');
    });

    it('sinh đúng câu văn mô tả khi có bất thường ở một hoặc nhiều cơ quan', () => {
      const map = {
        ...initDefaultSelectedMap(abdomenTemplate),
        LIVER: ['LIVER_FATTY_1', 'LIVER_CYST'],
      };
      const narrative = generateBulletedNarrative(abdomenTemplate.organs, map, 'Nam');
      expect(narrative).toContain('• Gan: Nhu mô gan tăng âm nhẹ, giảm âm vùng sâu nhẹ, cơ hoành và tĩnh mạch cửa còn thấy rõ.; Gan có nốt trống âm d#15mm, thành mỏng đều, tăng âm thành sau.');
      // Các cơ quan khác vẫn bình thường
      expect(narrative).toContain('• Túi mật: Túi mật không căng, thành mỏng, lòng không có sỏi.');
    });
  });

  describe('6. generateConclusionText', () => {
    it('trả về câu mặc định chưa phát hiện bất thường khi tất cả là NORMAL', () => {
      const map = initDefaultSelectedMap(abdomenTemplate);
      const conclusion = generateConclusionText(abdomenTemplate.organs, map);
      expect(conclusion).toBe('Hiện tại chưa phát hiện hình ảnh bất thường trên siêu âm.');
    });

    it('trích xuất đầy đủ các gạch đầu dòng kết luận từ các bất thường đã chọn', () => {
      const map = {
        ...initDefaultSelectedMap(abdomenTemplate),
        LIVER: ['LIVER_FATTY_1'],
        GALLBLADDER: ['GB_STONE'],
      };
      const conclusion = generateConclusionText(abdomenTemplate.organs, map);
      expect(conclusion).toContain('- Hình ảnh gan nhiễm mỡ độ I.');
      expect(conclusion).toContain('- Sỏi túi mật d#10mm.');
    });

    it('kèm theo thang điểm phân loại TI-RADS khi khám Tuyến giáp', () => {
      const thyroidTemplate = DEFAULT_CLINICAL_TEMPLATES.THYROID_TIRADS;
      const map = {
        ...initDefaultSelectedMap(thyroidTemplate),
        THYROID_RIGHT: ['TR_NODULE_HYPO'],
      };
      const conclusion = generateConclusionText(
        thyroidTemplate.organs,
        map,
        CLASSIFICATION_TYPES.TIRADS,
        'TR4'
      );
      expect(conclusion).toContain('- Nhân giảm âm thùy phải tuyến giáp nghi ngờ cao, đề nghị chọc hút FNA.');
      expect(conclusion).toContain('- Đánh giá phân loại: TR4: Nghi ngờ vừa (Theo dõi nếu ≥ 1.0 cm, FNA nếu ≥ 1.5 cm)');
    });
  });

  describe('7. generateHTMLNarrative', () => {
    it('sinh ra các thẻ <p> bọc quanh từng dòng mô tả để in hoặc soạn thảo SunEditor', () => {
      const map = initDefaultSelectedMap(abdomenTemplate);
      const html = generateHTMLNarrative(abdomenTemplate.organs, map, 'Nam');
      expect(html).toMatch(/^<p>• Gan: .*<\/p>/);
      expect(html).toContain('<p>• Túi mật:');
    });
  });
});

