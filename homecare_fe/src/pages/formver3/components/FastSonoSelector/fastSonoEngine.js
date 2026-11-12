/**
 * Fast Sono Selection & Live Injection Engine
 * Domain logic for 5-tier ultrasound clinical templates.
 * Pure business functions - 100% covered by Unit Tests (TDD).
 */

import { CLASSIFICATION_TYPES, TIRADS_GRADES, BIRADS_GRADES } from './fastSono.constants';

/**
 * Khởi tạo map lựa chọn mặc định: Tất cả các cơ quan đều là 'NORMAL'
 * @param {Object} template 
 * @returns {Record<string, string[]>}
 */
export function initDefaultSelectedMap(template) {
  if (!template || !Array.isArray(template.organs)) return {};
  const initial = {};
  template.organs.forEach((organ) => {
    initial[organ.key] = ['NORMAL'];
  });
  return initial;
}

/**
 * Xử lý logic bật/tắt (toggle) một Chip kết quả của một cơ quan
 * - Bấm 'NORMAL': Xóa mọi bất thường, đưa về ['NORMAL'].
 * - Bấm Bất thường: Tự bỏ 'NORMAL', toggle id tương ứng. Nếu không còn bất thường nào thì tự bật lại ['NORMAL'].
 * @param {string[]} currentSelectedIds 
 * @param {Object} organ 
 * @param {string} optionId 
 * @returns {string[]}
 */
export function toggleFindingOption(currentSelectedIds = ['NORMAL'], organ, optionId) {
  if (!organ || !optionId) return currentSelectedIds;

  const targetOption = organ.options?.find((o) => o.id === optionId);
  if (!targetOption) return currentSelectedIds;

  // 1. Nếu bấm vào lựa chọn Bình thường
  if (targetOption.isNormal) {
    return ['NORMAL'];
  }

  // 2. Nếu bấm vào lựa chọn Bất thường
  const withoutNormal = (currentSelectedIds || []).filter((id) => id !== 'NORMAL');
  const exists = withoutNormal.includes(optionId);

  let next;
  if (exists) {
    next = withoutNormal.filter((id) => id !== optionId);
  } else {
    next = [...withoutNormal, optionId];
  }

  // Nếu không còn bất thường nào, tự phục hồi trạng thái Bình thường
  if (next.length === 0) {
    return ['NORMAL'];
  }

  return next;
}

/**
 * Đếm tổng số tổn thương / phát hiện bất thường đang được chọn
 * @param {Array} organs 
 * @param {Record<string, string[]>} selectedMap 
 * @returns {number}
 */
export function countTotalAbnormalities(organs = [], selectedMap = {}) {
  let count = 0;
  if (!Array.isArray(organs)) return 0;

  for (const organ of organs) {
    const selectedIds = selectedMap[organ.key] || ['NORMAL'];
    for (const optId of selectedIds) {
      const opt = organ.options?.find((o) => o.id === optId);
      if (opt && !opt.isNormal) {
        count++;
      }
    }
  }
  return count;
}

/**
 * Lọc danh sách options của cơ quan theo giới tính bệnh nhân
 * @param {Array} options 
 * @param {string} gender 'Nam' | 'Nữ' | 'Male' | 'Female' | any
 * @returns {Array}
 */
export function filterOptionsByGender(options = [], gender) {
  if (!Array.isArray(options)) return [];
  const normalizedGender = (gender || '').trim().toLowerCase();

  return options.filter((opt) => {
    const optGender = (opt.gender || 'ALL').toUpperCase();
    if (optGender === 'ALL') return true;

    if (normalizedGender === 'nam' || normalizedGender === 'male') {
      return optGender === 'MALE';
    }
    if (normalizedGender === 'nữ' || normalizedGender === 'nu' || normalizedGender === 'female') {
      return optGender === 'FEMALE';
    }

    return true;
  });
}

/**
 * Tự động sinh văn bản mô tả hình ảnh dạng bullet y khoa chuẩn
 * @param {Array} organs 
 * @param {Record<string, string[]>} selectedMap 
 * @param {string} gender 
 * @returns {string}
 */
export function generateBulletedNarrative(organs = [], selectedMap = {}, gender) {
  if (!Array.isArray(organs) || organs.length === 0) return '';

  const lines = [];

  for (const organ of organs) {
    // Lọc options theo giới tính
    const validOptions = filterOptionsByGender(organ.options || [], gender);
    const validOptionIds = new Set(validOptions.map((o) => o.id));

    const selectedIds = (selectedMap[organ.key] || ['NORMAL']).filter((id) => validOptionIds.has(id));
    const isOnlyNormal = selectedIds.length === 0 || (selectedIds.length === 1 && selectedIds[0] === 'NORMAL');

    if (isOnlyNormal) {
      const normalOpt = organ.options?.find((o) => o.id === 'NORMAL');
      const text = normalOpt?.text || organ.defaultNormalText || 'Không thấy hình ảnh bất thường.';
      lines.push(`• ${organ.label}: ${text}`);
    } else {
      const abnormalTexts = selectedIds
        .map((id) => {
          const opt = organ.options?.find((o) => o.id === id);
          return opt?.text;
        })
        .filter(Boolean);

      if (abnormalTexts.length > 0) {
        lines.push(`• ${organ.label}: ${abnormalTexts.join('; ')}`);
      } else {
        lines.push(`• ${organ.label}: ${organ.defaultNormalText || 'Bình thường.'}`);
      }
    }
  }

  return lines.join('\n\n');
}

/**
 * Tự động sinh văn bản HTML cho vùng mô tả để tương thích với SunEditor và Mẫu in
 * @param {Array} organs 
 * @param {Record<string, string[]>} selectedMap 
 * @param {string} gender 
 * @returns {string}
 */
export function generateHTMLNarrative(organs = [], selectedMap = {}, gender) {
  const plainNarrative = generateBulletedNarrative(organs, selectedMap, gender);
  if (!plainNarrative) return '';

  const bulletLines = plainNarrative.split('\n\n').filter(Boolean);
  return bulletLines.map((line) => `<p>${line}</p>`).join('');
}

/**
 * Tự động sinh nội dung Kết luận chẩn đoán dựa trên các lựa chọn bệnh lý
 * @param {Array} organs 
 * @param {Record<string, string[]>} selectedMap 
 * @param {string} classificationType 
 * @param {string} selectedGrade 
 * @returns {string}
 */
export function generateConclusionText(organs = [], selectedMap = {}, classificationType = CLASSIFICATION_TYPES.NONE, selectedGrade = '') {
  if (!Array.isArray(organs)) return '';

  const conclusions = [];

  for (const organ of organs) {
    const selectedIds = selectedMap[organ.key] || ['NORMAL'];
    for (const optId of selectedIds) {
      const opt = organ.options?.find((o) => o.id === optId);
      if (opt && !opt.isNormal && opt.conclusion) {
        conclusions.push(`- ${opt.conclusion}`);
      }
    }
  }

  // Thêm đánh giá thang điểm nếu có
  if (classificationType === CLASSIFICATION_TYPES.TIRADS && selectedGrade) {
    const tiradInfo = TIRADS_GRADES.find((g) => g.grade === selectedGrade);
    conclusions.push(`- Đánh giá phân loại: ${tiradInfo?.label || selectedGrade} (${tiradInfo?.desc || ''})`);
  } else if (classificationType === CLASSIFICATION_TYPES.BIRADS && selectedGrade) {
    const biradInfo = BIRADS_GRADES.find((g) => g.grade === selectedGrade);
    conclusions.push(`- Đánh giá phân loại: ${biradInfo?.label || selectedGrade} (${biradInfo?.desc || ''})`);
  }

  if (conclusions.length === 0) {
    return 'Hiện tại chưa phát hiện hình ảnh bất thường trên siêu âm.';
  }

  return conclusions.join('\n');
}

