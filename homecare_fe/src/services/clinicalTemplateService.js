/**
 * Clinical Template Service for 5-Tier Hierarchical Configuration
 * Maps 100% to HomeCare's:
 * - Tầng 1: template_services (id_template_service)
 * - Tầng 2: exam_parts (id_exam_part)
 * - Tầng 3: Finding Options / Chips
 * - Tầng 4: Classification (TI-RADS, BI-RADS, O-RADS)
 * - Tầng 5: Live Injection Narrative & Conclusion
 * 
 * LƯU TRỮ VÀO DATABASE HOMECARE:
 * - Dùng bảng form_ver3 (cột imageDescription chứa JSON 5 tầng)
 * - Đồng thời hỗ trợ endpoint chuyên biệt /clinical-templates nếu backend có sẵn
 */

import STORAGE from './storage';
import API_CALL from './axiosClient';
import {
  DEFAULT_CLINICAL_TEMPLATES,
  CLASSIFICATION_TYPES,
} from '../pages/formver3/components/FastSonoSelector/fastSono.constants';

const STORAGE_KEY = 'HOMECARE_5TIER_CLINICAL_TEMPLATES_V1';

/**
 * Tự động tạo cấu hình 5 tầng chuẩn y khoa (Tầng 3, 4, 5) cho một exam_part của HomeCare
 * @param {Object} examPart { id, name, code, id_template_service }
 * @param {Object} templateService { id, name, code }
 * @returns {Object} 5-Tier Template
 */
export function generateDefault5TierForExamPart(examPart, templateService = {}) {
  if (!examPart) return null;

  const partName = (examPart.name || '').toLowerCase();
  const serviceName = (templateService.name || '').toLowerCase();
  const code = examPart.code || `EP_${examPart.id}`;

  // 1. Phân hệ Tuyến giáp
  if (partName.includes('giáp') || partName.includes('thyroid')) {
    return {
      ...DEFAULT_CLINICAL_TEMPLATES.THYROID_TIRADS,
      code: `TPL_${code}`,
      title: examPart.name,
      id_template_service: examPart.id_template_service,
      id_exam_part: examPart.id,
    };
  }

  // 2. Phân hệ Tuyến vú
  if (partName.includes('vú') || partName.includes('breast')) {
    return {
      ...DEFAULT_CLINICAL_TEMPLATES.BREAST_BIRADS,
      code: `TPL_${code}`,
      title: examPart.name,
      id_template_service: examPart.id_template_service,
      id_exam_part: examPart.id,
    };
  }

  // 3. Phân hệ Siêu âm bụng tổng quát
  if (
    partName.includes('bụng') ||
    partName.includes('abdomen') ||
    partName.includes('tổng quát') ||
    serviceName.includes('siêu âm')
  ) {
    return {
      ...DEFAULT_CLINICAL_TEMPLATES.ABDOMEN,
      code: `TPL_${code}`,
      title: examPart.name,
      id_template_service: examPart.id_template_service,
      id_exam_part: examPart.id,
    };
  }

  // 4. Phân hệ Sản phụ khoa (Tử cung, buồng trứng, tiểu khung)
  if (
    partName.includes('phụ khoa') ||
    partName.includes('tử cung') ||
    partName.includes('buồng trứng') ||
    partName.includes('tiểu khung')
  ) {
    return {
      code: `TPL_${code}`,
      title: examPart.name,
      id_template_service: examPart.id_template_service,
      id_exam_part: examPart.id,
      classificationType: CLASSIFICATION_TYPES.ORADS,
      hasClassification: true,
      organs: [
        {
          key: 'UTERUS',
          label: 'Tử cung',
          defaultNormalText: 'Tử cung tư thế trung gian, kích thước bình thường, nội mạc đều.',
          options: [
            { id: 'NORMAL', label: 'Bình thường', isNormal: true, text: 'Tử cung tư thế trung gian, kích thước bình thường, nội mạc đều, cơ tử cung đồng nhất.', gender: 'FEMALE' },
            { id: 'FIBROID', label: 'U xơ tử cung', isNormal: false, text: 'Cơ tử cung có khối giảm âm d#25x20mm ranh giới rõ.', conclusion: 'U xơ tử cung d#25mm.', gender: 'FEMALE' },
            { id: 'ADENOMYOSIS', label: 'Lạc nội mạc tử cung', isNormal: false, text: 'Thành sau tử cung dày không đều, có nang nhỏ dạng lạc nội mạc.', conclusion: 'Hình ảnh bệnh tuyến cơ tử cung (Adenomyosis).', gender: 'FEMALE' },
            { id: 'ENDOMETRIAL_POLYP', label: 'Polyp nội mạc', isNormal: false, text: 'Lòng tử cung có nốt tăng âm d#8mm nghi ngờ polyp.', conclusion: 'Polyp lòng tử cung d#8mm.', gender: 'FEMALE' },
          ],
        },
        {
          key: 'RIGHT_OVARY',
          label: 'Buồng trứng phải',
          defaultNormalText: 'Buồng trứng phải kích thước bình thường, có vài nang noãn nhỏ.',
          options: [
            { id: 'NORMAL', label: 'Bình thường', isNormal: true, text: 'Buồng trứng phải kích thước bình thường, có vài nang noãn nhỏ đang phát triển.', gender: 'FEMALE' },
            { id: 'RO_CYST_SIMPLE', label: 'Nang đơn thuần', isNormal: false, text: 'Buồng trứng phải có nang trống âm thành mỏng d#30mm.', conclusion: 'Nang đơn thuần buồng trứng phải.', gender: 'FEMALE' },
            { id: 'RO_DERMOID', label: 'Nang bì (Teratoma)', isNormal: false, text: 'Buồng trứng phải có nang hỗn hợp âm kèm bóng cản d#35mm.', conclusion: 'U nang bì buồng trứng phải.', gender: 'FEMALE' },
          ],
        },
        {
          key: 'LEFT_OVARY',
          label: 'Buồng trứng trái',
          defaultNormalText: 'Buồng trứng trái kích thước bình thường, có vài nang noãn nhỏ.',
          options: [
            { id: 'NORMAL', label: 'Bình thường', isNormal: true, text: 'Buồng trứng trái kích thước bình thường, có vài nang noãn nhỏ.', gender: 'FEMALE' },
            { id: 'LO_CYST_SIMPLE', label: 'Nang đơn thuần', isNormal: false, text: 'Buồng trứng trái có nang trống âm thành mỏng d#26mm.', conclusion: 'Nang đơn thuần buồng trứng trái.', gender: 'FEMALE' },
          ],
        },
        {
          key: 'DOUGLAS',
          label: 'Cùng đồ Douglas',
          defaultNormalText: 'Túi cùng Douglas không có dịch tự do.',
          options: [
            { id: 'NORMAL', label: 'Không có dịch', isNormal: true, text: 'Túi cùng Douglas không có dịch tự do.', gender: 'ALL' },
            { id: 'DOUGLAS_FLUID_MILD', label: 'Dịch ít', isNormal: false, text: 'Túi cùng Douglas có lớp dịch mỏng d#10mm.', conclusion: 'Dịch cùng đồ Douglas lượng ít.', gender: 'ALL' },
            { id: 'DOUGLAS_FLUID_MOD', label: 'Dịch vừa', isNormal: false, text: 'Túi cùng Douglas có dịch tự do d#25mm.', conclusion: 'Dịch cùng đồ Douglas lượng vừa.', gender: 'ALL' },
          ],
        },
      ],
    };
  }

  // 5. Tự động sinh theo cấu trúc cơ bản cho các exam_part khác
  return {
    code: `TPL_${code}`,
    title: examPart.name,
    id_template_service: examPart.id_template_service,
    id_exam_part: examPart.id,
    classificationType: CLASSIFICATION_TYPES.NONE,
    hasClassification: false,
    organs: [
      {
        key: `PART_${examPart.id}`,
        label: examPart.name,
        defaultNormalText: `${examPart.name} hình thái, cấu trúc và tín hiệu trên siêu âm trong giới hạn bình thường.`,
        options: [
          {
            id: 'NORMAL',
            label: 'Bình thường',
            isNormal: true,
            text: `${examPart.name} hình thái, cấu trúc và tín hiệu trên siêu âm trong giới hạn bình thường, không thấy khối khu trú bất thường.`,
            gender: 'ALL',
          },
          {
            id: 'ABNORMAL_MILD',
            label: 'Bất thường nhẹ',
            isNormal: false,
            text: `${examPart.name} có hình ảnh dày nhẹ tổ chức, ranh giới rõ.`,
            conclusion: `Theo dõi biến đổi nhẹ tại ${examPart.name}.`,
            gender: 'ALL',
          },
          {
            id: 'ABNORMAL_LESION',
            label: 'Tổn thương khu trú',
            isNormal: false,
            text: `${examPart.name} ghi nhận tổn thương khu trú không đồng nhất, đề nghị kết hợp lâm sàng.`,
            conclusion: `Tổn thương khu trú tại ${examPart.name}.`,
            gender: 'ALL',
          },
        ],
      },
    ],
  };
}

/**
 * Lấy toàn bộ danh sách mẫu lâm sàng 5 tầng
 * Ưu tiên: LocalStorage -> Fallback DEFAULT_CLINICAL_TEMPLATES
 * @returns {Array}
 */
export function getAllClinicalTemplates() {
  const cached = STORAGE.get(STORAGE_KEY);
  if (Array.isArray(cached) && cached.length > 0) {
    return cached;
  }

  const initialTemplates = Object.values(DEFAULT_CLINICAL_TEMPLATES);
  STORAGE.set(STORAGE_KEY, initialTemplates);
  return initialTemplates;
}

/**
 * Tải danh sách cấu hình 5 tầng trực tiếp từ Database của HomeCare
 * Gọi API /formVer3 và /clinical-templates
 * @returns {Promise<Array>}
 */
export async function fetchClinicalTemplatesFromDB() {
  try {
    // 1. Thử gọi API chuyên biệt nếu backend đã có
    try {
      const res = await API_CALL.get('/clinical-templates');
      const data = res?.data?.data || res?.data;
      if (Array.isArray(data) && data.length > 0) {
        saveAllClinicalTemplatesLocally(data);
        return data;
      }
    } catch {
      // Backend chưa có endpoint /clinical-templates -> dùng /formVer3
    }

    // 2. Lấy từ bảng formVer3 của HomeCare (nơi lưu các mẫu cấu trúc có sẵn)
    const formVer3Res = await API_CALL.get('/formVer3', { params: { limit: 100 } });
    const items = formVer3Res?.data?.data?.items || formVer3Res?.data?.data || [];
    const dbTemplates = [];

    items.forEach((item) => {
      try {
        const parsed = JSON.parse(item.imageDescription || '{}');
        if (parsed && parsed.is5TierTemplate && Array.isArray(parsed.organs)) {
          dbTemplates.push({
            code: parsed.code || `TPL_EP_${item.id_exam_part}`,
            title: item.name || parsed.title || 'Mẫu siêu âm',
            id_template_service: item.id_template_service,
            id_exam_part: item.id_exam_part,
            classificationType: parsed.classificationType || CLASSIFICATION_TYPES.NONE,
            hasClassification: Boolean(parsed.hasClassification),
            organs: parsed.organs,
          });
        }
      } catch {}
    });

    if (dbTemplates.length > 0) {
      // Merge với cache hiện tại
      const current = getAllClinicalTemplates();
      const mergedMap = new Map();
      current.forEach((t) => mergedMap.set(t.code, t));
      dbTemplates.forEach((t) => mergedMap.set(t.code, t));
      const mergedList = Array.from(mergedMap.values());
      saveAllClinicalTemplatesLocally(mergedList);
      return mergedList;
    }
  } catch (err) {
    console.warn('Could not fetch clinical templates from DB, using cached templates:', err);
  }

  return getAllClinicalTemplates();
}

/**
 * Lưu toàn bộ danh sách mẫu vào LocalStorage
 * @param {Array} templates 
 */
export function saveAllClinicalTemplatesLocally(templates) {
  if (!Array.isArray(templates)) return;
  STORAGE.set(STORAGE_KEY, templates);
}

/**
 * Lưu hoặc cập nhật một mẫu lâm sàng 5 tầng VÀO DATABASE CỦA HOMECARE
 * @param {Object} template 
 * @returns {Promise<Object>}
 */
export async function upsertClinicalTemplateToDB(template) {
  if (!template || !template.code) throw new Error('Mã mẫu không hợp lệ');

  // 1. Cập nhật vào LocalStorage ngay lập tức để UI mượt mà
  const templates = getAllClinicalTemplates();
  const index = templates.findIndex((t) => t.code === template.code);
  let updatedList;
  if (index >= 0) {
    updatedList = [...templates];
    updatedList[index] = { ...updatedList[index], ...template, updatedAt: new Date().toISOString() };
  } else {
    updatedList = [...templates, { ...template, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }];
  }
  saveAllClinicalTemplatesLocally(updatedList);

  // 2. Gửi API lưu bền vững vào Database của HomeCare
  const payloadToDB = {
    is5TierTemplate: true,
    code: template.code,
    title: template.title,
    classificationType: template.classificationType || CLASSIFICATION_TYPES.NONE,
    hasClassification: Boolean(template.hasClassification),
    organs: template.organs,
  };

  try {
    // 2.1. Thử ghi vào bảng formVer3 tương ứng với id_exam_part & id_template_service
    if (template.id_exam_part) {
      // Kiểm tra xem đã có formVer3 cho exam_part này chưa
      const checkRes = await API_CALL.get(`/formVer3`, {
        params: { id_exam_part: template.id_exam_part, limit: 1 },
      });
      const existing = checkRes?.data?.data?.items?.[0] || checkRes?.data?.data?.[0];

      if (existing?.id) {
        // Cập nhật record có sẵn
        await API_CALL.patch(`/formVer3/${existing.id}`, {
          imageDescription: JSON.stringify(payloadToDB),
        });
      } else {
        // Tạo record mới trong bảng formVer3
        await API_CALL.post('/formVer3', {
          name: template.title,
          id_template_service: template.id_template_service || 1,
          id_exam_part: template.id_exam_part,
          imageDescription: JSON.stringify(payloadToDB),
        });
      }
    }

    // 2.2. Thử gọi thêm endpoint sync nếu backend có hỗ trợ
    await API_CALL.post('/clinical-templates', template).catch(() => {});
  } catch (dbErr) {
    console.warn('Lưu vào Database HomeCare gặp lỗi (dữ liệu đã lưu an toàn vào local cache):', dbErr);
  }

  return template;
}

export const upsertClinicalTemplate = upsertClinicalTemplateToDB;

/**
 * Truy vấn trực tiếp mẫu 5 tầng từ Database theo Phân hệ (Tầng 1) và Bộ phận (Tầng 2)
 * Nếu không có mẫu nào khớp, trả về null (không fallback sang mẫu khác).
 * @param {number|string} idTemplateService
 * @param {number|string} idExamPart
 * @returns {Promise<Object|null>}
 */
export async function fetchClinicalTemplateByServiceAndPart(idTemplateService, idExamPart) {
  if (!idExamPart) return null;

  try {
    const params = { id_exam_part: idExamPart };
    if (idTemplateService) {
      params.id_template_service = idTemplateService;
    }
    const res = await API_CALL.get('/clinical-templates', { params });
    const data = res?.data?.data || res?.data;
    if (Array.isArray(data) && data.length > 0) {
      return data[0];
    }
    // Backend trả rỗng -> không có mẫu trong DB cho Phân hệ & Bộ phận này
    return null;
  } catch {
    // Fallback tìm chính xác trong local cache nếu mất kết nối API
    return resolveClinicalTemplate({ idTemplateService, idExamPart });
  }
}

/**
 * Tìm mẫu 5 tầng khớp chính xác theo id_template_service (Tầng 1) và id_exam_part (Tầng 2) của HomeCare.
 * Nếu không có mẫu nào khớp, trả về null (không hiện mẫu của bộ phận khác).
 * @param {Object} params
 * @param {number|string} params.idTemplateService
 * @param {number|string} params.idExamPart
 * @param {Array} [params.templatesList]
 * @returns {Object|null}
 */
export function resolveClinicalTemplate({ idTemplateService, idExamPart, templatesList }) {
  if (!idExamPart) return null;
  const templates = Array.isArray(templatesList) ? templatesList : getAllClinicalTemplates();

  // 1. Khớp chính xác cả Phân hệ (Tầng 1) và Bộ phận (Tầng 2)
  if (idTemplateService) {
    const exactMatch = templates.find(
      (t) =>
        String(t.id_template_service) === String(idTemplateService) &&
        String(t.id_exam_part) === String(idExamPart),
    );
    if (exactMatch) return exactMatch;
  }

  // 2. Khớp theo id_exam_part (trường hợp template không gắn id_template_service hoặc không truyền idTemplateService)
  const partMatch = templates.find(
    (t) =>
      String(t.id_exam_part) === String(idExamPart) &&
      (!idTemplateService || !t.id_template_service),
  );
  return partMatch || null;
}

/**
 * Xóa một mẫu lâm sàng 5 tầng theo code
 * @param {string} code 
 */
export function deleteClinicalTemplate(code) {
  if (!code) return;
  const templates = getAllClinicalTemplates();
  const filtered = templates.filter((t) => t.code !== code);
  saveAllClinicalTemplatesLocally(filtered);
  try {
    API_CALL.delete(`/clinical-templates/${code}`).catch(() => {});
  } catch {}
}
