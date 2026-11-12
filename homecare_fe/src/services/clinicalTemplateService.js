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
 * Chuẩn hóa dữ liệu mẫu 5 tầng từ DB/Cache để đảm bảo organ.label & option.label luôn có giá trị
 */
export function normalizeClinicalTemplate(tpl) {
  if (!tpl || typeof tpl !== 'object') return null;
  const organs = Array.isArray(tpl.organs)
    ? tpl.organs.map((organ, idx) => {
        const resolvedLabel =
          organ.label ||
          organ.name ||
          organ.title ||
          organ.organName ||
          organ.partName ||
          organ.key ||
          `Bộ phận ${idx + 1}`;
        const options = Array.isArray(organ.options)
          ? organ.options.map((opt) => ({
              ...opt,
              label: opt.label || opt.name || opt.title || opt.id || 'Lựa chọn',
            }))
          : [];
        return {
          ...organ,
          key: organ.key || `ORGAN_${idx + 1}`,
          label: resolvedLabel,
          options,
        };
      })
    : [];

  return {
    ...tpl,
    organs,
  };
}

/**
 * Tự động tạo cấu hình 5 tầng chuẩn y khoa (Tầng 3, 4, 5) cho toàn bộ Phân hệ & Bộ phận
 * @param {Object} examPart { id, name, code, id_template_service }
 * @param {Object} templateService { id, name, code }
 * @returns {Object} 5-Tier Template
 */
export function generateDefault5TierForExamPart(examPart, templateService = {}) {
  if (!examPart) return null;

  const partRaw = examPart.name || 'Bộ phận';
  const partName = partRaw.toLowerCase();
  const serviceRaw = templateService.name || '';
  const serviceName = serviceRaw.toLowerCase();
  const code = examPart.code || `EP_${examPart.id || 'AUTO'}`;

  const isXray =
    serviceName.includes('x quang') ||
    serviceName.includes('x-quang') ||
    serviceName.includes('xray') ||
    partName.includes('x quang') ||
    partName.includes('x-quang');
  const isCT =
    serviceName.includes('cắt lớp') ||
    serviceName.includes('clvt') ||
    /\bct\b/.test(serviceName) ||
    partName.includes('cắt lớp') ||
    /\bct\b/.test(partName);
  const isMRI =
    serviceName.includes('cộng hưởng từ') ||
    serviceName.includes('mri') ||
    serviceName.includes('cht') ||
    partName.includes('cộng hưởng từ') ||
    partName.includes('mri');

  const baseMeta = {
    code: `TPL_${code}`,
    title: serviceRaw ? `${serviceRaw} - ${partRaw}` : partRaw,
    id_template_service: examPart.id_template_service || templateService.id,
    id_exam_part: examPart.id,
    classificationType: CLASSIFICATION_TYPES.NONE,
    hasClassification: false,
  };

  // === A. NHÓM X-QUANG ===
  if (isXray) {
    if (partName.includes('ngực') || partName.includes('phổi') || partName.includes('lồng ngực')) {
      return {
        ...baseMeta,
        organs: [
          {
            key: 'LUNG_PARENCHYMA',
            label: 'Nhu mô phổi',
            defaultNormalText: 'Hai phế trường sáng đều, không thấy tổn thương thâm nhiễm hay nốt mờ khu trú.',
            options: [
              { id: 'NORMAL', label: 'Bình thường', isNormal: true, text: 'Hai phế trường sáng đều, không thấy tổn thương thâm nhiễm hay nốt mờ khu trú.', gender: 'ALL' },
              { id: 'ALVEOLAR_OPACITY', label: 'Đám mờ phế nang', isNormal: false, text: 'Đám mờ không đồng nhất vùng đáy phổi, xóa mờ bờ tim/vòm hoành.', conclusion: 'Theo dõi viêm phổi / tổn thương phế nang.', gender: 'ALL' },
              { id: 'INTERSTITIAL', label: 'Tổn thương mô kẽ', isNormal: false, text: 'Dày tổ chức kẽ dạng lưới - nốt nhỏ lan tỏa hai phế trường.', conclusion: 'Tổn thương mô kẽ hai phổi.', gender: 'ALL' },
              { id: 'NODULE', label: 'Nốt mờ phổi', isNormal: false, text: 'Nốt mờ đơn độc ranh giới khá rõ ở nhu mô phổi.', conclusion: 'Nốt mờ phổi (đề nghị chụp CLVT lồng ngực kiểm tra).', gender: 'ALL' },
              { id: 'FIBROSIS', label: 'Xơ phổi / Dải xơ', isNormal: false, text: 'Dải xơ mờ vùng đỉnh/đáy phổi, kéo nhẹ rốn phổi.', conclusion: 'Dải xơ phổi cũ.', gender: 'ALL' },
            ],
          },
          {
            key: 'PLEURA_MEDIASTINUM',
            label: 'Màng phổi & Trung thất',
            defaultNormalText: 'Góc sườn hoành hai bên nhọn, trung thất cân đối, bóng tim không to.',
            options: [
              { id: 'NORMAL', label: 'Bình thường', isNormal: true, text: 'Góc sườn hoành hai bên nhọn, trung thất cân đối, bóng tim không to.', gender: 'ALL' },
              { id: 'PLEURAL_EFFUSION', label: 'Tràn dịch màng phổi', isNormal: false, text: 'Tù góc sườn hoành kèm hình mờ đồng nhất vùng thấp phổi (đường cong Damoiseau).', conclusion: 'Tràn dịch màng phổi.', gender: 'ALL' },
              { id: 'PNEUMOTHORAX', label: 'Tràn khí màng phổi', isNormal: false, text: 'Khoảng sáng vô mạch ngoại vi, thấy rõ lá tạng màng phổi co cụm.', conclusion: 'Tràn khí màng phổi.', gender: 'ALL' },
              { id: 'CARDIOMEGALY', label: 'Bóng tim to', isNormal: false, text: 'Chỉ số tim/lồng ngực > 0.5, cung thất trái giãn rộng.', conclusion: 'Bóng tim to.', gender: 'ALL' },
            ],
          },
          {
            key: 'THORACIC_CAGE',
            label: 'Khung xương lồng ngực',
            defaultNormalText: 'Các xương sườn, xương đòn và cột sống ngực liên tục, không thấy đường gãy.',
            options: [
              { id: 'NORMAL', label: 'Bình thường', isNormal: true, text: 'Các xương sườn, xương đòn và cột sống ngực liên tục, không thấy đường gãy.', gender: 'ALL' },
              { id: 'RIB_FRACTURE', label: 'Gãy xương sườn', isNormal: false, text: 'Mất liên tục vỏ xương sườn, có đường sáng gãy xương.', conclusion: 'Gãy xương sườn.', gender: 'ALL' },
            ],
          },
        ],
      };
    }

    if (partName.includes('cột sống') || partName.includes('thắt lưng') || partName.includes('cổ')) {
      return {
        ...baseMeta,
        organs: [
          {
            key: 'VERTEBRAE',
            label: 'Thân đốt sống',
            defaultNormalText: `Các thân đốt sống vùng ${partRaw} chiều cao bình thường, đậm độ xương đều, không thấy xẹp hay trượt đốt sống.`,
            options: [
              { id: 'NORMAL', label: 'Bình thường', isNormal: true, text: `Các thân đốt sống vùng ${partRaw} chiều cao bình thường, đậm độ xương đều, không thấy đường gãy hay xẹp đốt sống.`, gender: 'ALL' },
              { id: 'OSTEOPHYTE', label: 'Gai xương thoái hóa', isNormal: false, text: `Mỏ gai xương bờ trước và bờ bên các thân đốt sống ${partRaw}.`, conclusion: `Thoái hóa cột sống ${partRaw}.`, gender: 'ALL' },
              { id: 'COMPRESSION', label: 'Xẹp thân đốt sống', isNormal: false, text: `Giảm chiều cao thân đốt sống (hình chêm), đậm độ xương thay đổi.`, conclusion: `Xẹp thân đốt sống vùng ${partRaw}.`, gender: 'ALL' },
              { id: 'SPONDYLOLISTHESIS', label: 'Trượt đốt sống', isNormal: false, text: `Di lệch thân đốt sống ra trước/sau so với đốt sống kế cận.`, conclusion: `Trượt đốt sống vùng ${partRaw}.`, gender: 'ALL' },
            ],
          },
          {
            key: 'DISC_SPACE',
            label: 'Khe đĩa đệm & Khớp',
            defaultNormalText: 'Các khe liên đốt sống rộng đều, diện khớp liên mấu bình thường.',
            options: [
              { id: 'NORMAL', label: 'Bình thường', isNormal: true, text: 'Các khe liên đốt sống rộng đều, không thấy hẹp khe đĩa đệm rõ rệt.', gender: 'ALL' },
              { id: 'DISC_NARROWING', label: 'Hẹp khe đĩa đệm', isNormal: false, text: 'Hẹp khe liên đốt sống kèm xơ xương dưới sụn.', conclusion: `Hẹp khe đĩa đệm cột sống ${partRaw}.`, gender: 'ALL' },
            ],
          },
          {
            key: 'ALIGNMENT',
            label: 'Trục & Phần mềm',
            defaultNormalText: 'Trục cột sống thẳng, đường cong sinh lý bình thường, phần mềm cạnh sống không sưng nề.',
            options: [
              { id: 'NORMAL', label: 'Bình thường', isNormal: true, text: 'Trục cột sống thẳng, đường cong sinh lý bình thường, phần mềm cạnh sống không thấy bất thường.', gender: 'ALL' },
              { id: 'STRAIGHTENING', label: 'Giảm/Mất ưỡn sinh lý', isNormal: false, text: 'Trục cột sống thẳng đơ, giảm đường cong sinh lý.', conclusion: 'Giảm đường cong sinh lý cột sống (theo dõi co cơ cạnh sống).', gender: 'ALL' },
              { id: 'SCOLIOSIS', label: 'Vẹo cột sống', isNormal: false, text: 'Vẹo trục cột sống sang bên trên phim thẳng.', conclusion: `Vẹo cột sống vùng ${partRaw}.`, gender: 'ALL' },
            ],
          },
        ],
      };
    }

    if (partName.includes('xoang') || partName.includes('sọ') || partName.includes('mũi') || partName.includes('hàm')) {
      return {
        ...baseMeta,
        organs: [
          {
            key: 'SINUSES',
            label: 'Các xoang cạnh mũi',
            defaultNormalText: 'Các xoang hàm, xoang trán và xoang sàng sáng đều, vách mũi thẳng.',
            options: [
              { id: 'NORMAL', label: 'Bình thường', isNormal: true, text: 'Các xoang hàm, xoang trán và xoang sàng sáng đều, thành xoang nhẵn.', gender: 'ALL' },
              { id: 'SINUS_MUCOSA', label: 'Dày niêm mạc xoang', isNormal: false, text: 'Dày niêm mạc thành xoang hàm/trán, giảm độ sáng lòng xoang.', conclusion: 'Viêm dày niêm mạc xoang.', gender: 'ALL' },
              { id: 'SINUS_FLUID', label: 'Mờ xoang / Mức dịch khí', isNormal: false, text: 'Mờ toàn bộ lòng xoang hoặc có mức dịch - khí trong xoang hàm.', conclusion: 'Viêm xoang cấp có dịch.', gender: 'ALL' },
            ],
          },
          {
            key: 'SKULL_BONE',
            label: 'Xương sọ / Hàm mặt',
            defaultNormalText: 'Bản xương sọ và xương hàm mặt liên tục, không thấy đường nứt/gãy xương.',
            options: [
              { id: 'NORMAL', label: 'Bình thường', isNormal: true, text: 'Vòm sọ và khối xương mặt liên tục, không thấy đường nứt hay khuyết xương.', gender: 'ALL' },
              { id: 'FRACTURE', label: 'Đường nứt / Gãy xương', isNormal: false, text: 'Thấy đường sáng mất liên tục bản xương.', conclusion: `Nứt/Gãy xương vùng ${partRaw}.`, gender: 'ALL' },
            ],
          },
        ],
      };
    }

    if (partName.includes('bụng') || partName.includes('tiết niệu') || partName.includes('kub')) {
      return {
        ...baseMeta,
        organs: [
          {
            key: 'BOWEL_GAS',
            label: 'Bóng khí & Quai ruột',
            defaultNormalText: 'Phân bố hơi trong khung đại tràng và ruột non bình thường, không thấy mức nước - hơi hay liềm hơi dưới hoành.',
            options: [
              { id: 'NORMAL', label: 'Bình thường', isNormal: true, text: 'Không thấy hình ảnh mức nước - hơi bệnh lý, không thấy liềm hơi dưới cơ hoành hai bên.', gender: 'ALL' },
              { id: 'AIR_FLUID', label: 'Mức nước - hơi', isNormal: false, text: 'Nhiều quai ruột giãn kèm hình ảnh mức nước - hơi chân rộng/chân hẹp.', conclusion: 'Hình ảnh tắc ruột / bán tắc ruột.', gender: 'ALL' },
              { id: 'FREE_AIR', label: 'Liềm hơi dưới hoành', isNormal: false, text: 'Hình ảnh liềm hơi tự do dưới vòm hoành phải/hai bên.', conclusion: 'Thủng tạng rỗng (liềm hơi dưới hoành).', gender: 'ALL' },
            ],
          },
          {
            key: 'CALCIFICATION',
            label: 'Sỏi cản quang',
            defaultNormalText: 'Không thấy hình cản quang bất thường vùng hệ tiết niệu và hạ sườn phải.',
            options: [
              { id: 'NORMAL', label: 'Không thấy sỏi', isNormal: true, text: 'Không thấy hình cản quang bất thường nghi sỏi trên đường đi hệ tiết niệu và túi mật.', gender: 'ALL' },
              { id: 'RENAL_STONE', label: 'Sỏi cản quang thận/niệu quản', isNormal: false, text: 'Hình cản quang đậm độ vôi vùng hố thận / đường đi niệu quản.', conclusion: 'Hình cản quang nghi sỏi hệ tiết niệu.', gender: 'ALL' },
            ],
          },
        ],
      };
    }

    // X-quang Chi dưới / Chi trên / Khớp / Xương nói chung
    return {
      ...baseMeta,
      organs: [
        {
          key: 'BONE',
          label: 'Xương',
          defaultNormalText: `Các xương vùng ${partRaw} hình dạng bình thường, đậm độ xương đều, vỏ xương liên tục, không thấy đường gãy xương hay ổ khuyết xương.`,
          options: [
            { id: 'NORMAL', label: 'Bình thường', isNormal: true, text: `Các xương vùng ${partRaw} hình dạng bình thường, đậm độ xương đều, vỏ xương liên tục, không thấy đường gãy xương hay ổ khuyết xương.`, gender: 'ALL' },
            { id: 'FRACTURE', label: 'Đường gãy xương', isNormal: false, text: `Mất liên tục vỏ xương vùng ${partRaw}, có đường gãy xương rõ.`, conclusion: `Gãy xương vùng ${partRaw}.`, gender: 'ALL' },
            { id: 'OSTEOPHYTE', label: 'Gai xương thoái hóa', isNormal: false, text: `Mỏ gai xương rìa khớp vùng ${partRaw}, đặc xương dưới sụn.`, conclusion: `Thoái hóa xương khớp vùng ${partRaw}.`, gender: 'ALL' },
            { id: 'LYTIC_LESION', label: 'Ổ khuyết xương / Tiêu xương', isNormal: false, text: `Ghi nhận ổ khuyết xương ranh giới khá rõ vùng ${partRaw}.`, conclusion: `Tổn thương khuyết xương vùng ${partRaw} (đề nghị kiểm tra thêm).`, gender: 'ALL' },
          ],
        },
        {
          key: 'JOINT_SPACE',
          label: 'Khe khớp',
          defaultNormalText: `Khe khớp vùng ${partRaw} rộng đều, các diện khớp cân đối, không thấy trật khớp hay tổn thương dây chằng rõ rệt.`,
          options: [
            { id: 'NORMAL', label: 'Bình thường', isNormal: true, text: `Khe khớp vùng ${partRaw} rộng đều, các diện khớp cân đối, không thấy trật khớp hay hẹp khe khớp.`, gender: 'ALL' },
            { id: 'JOINT_NARROW', label: 'Hẹp khe khớp', isNormal: false, text: `Hẹp không đều khe khớp vùng ${partRaw}, xơ xương dưới sụn.`, conclusion: `Hẹp khe khớp / Thoái hóa khớp vùng ${partRaw}.`, gender: 'ALL' },
            { id: 'DISLOCATION', label: 'Trật khớp / Bán trật', isNormal: false, text: `Mất tương hợp diện khớp vùng ${partRaw}, di lệch đầu xương.`, conclusion: `Trật khớp vùng ${partRaw}.`, gender: 'ALL' },
          ],
        },
        {
          key: 'SOFT_TISSUE',
          label: 'Phần mềm quanh khớp',
          defaultNormalText: `Phần mềm quanh khớp vùng ${partRaw} bình thường, không thấy sưng nề, tụ dịch hay dị vật cản quang.`,
          options: [
            { id: 'NORMAL', label: 'Bình thường', isNormal: true, text: `Phần mềm quanh khớp vùng ${partRaw} bình thường, không thấy sưng nề, tụ dịch hay dị vật cản quang.`, gender: 'ALL' },
            { id: 'SWELLING', label: 'Sưng nề phần mềm', isNormal: false, text: `Dày và tăng đậm độ mô mềm quanh khớp vùng ${partRaw}.`, conclusion: `Sưng nề phần mềm vùng ${partRaw}.`, gender: 'ALL' },
            { id: 'FOREIGN_BODY', label: 'Dị vật cản quang', isNormal: false, text: `Hình ảnh dị vật cản quang nằm trong mô mềm vùng ${partRaw}.`, conclusion: `Dị vật cản quang phần mềm vùng ${partRaw}.`, gender: 'ALL' },
          ],
        },
      ],
    };
  }

  // === B. NHÓM CẮT LỚP VI TÍNH (CT / CLVT) ===
  if (isCT) {
    if (partName.includes('sọ') || partName.includes('não')) {
      return {
        ...baseMeta,
        organs: [
          {
            key: 'BRAIN_PARENCHYMA',
            label: 'Nhu mô não',
            defaultNormalText: 'Nhu mô não trên và dưới lều tỷ trọng đồng nhất, ranh giới chất xám - chất trắng rõ, không thấy ổ xuất huyết hay nhồi máu cấp.',
            options: [
              { id: 'NORMAL', label: 'Bình thường', isNormal: true, text: 'Nhu mô não tỷ trọng đồng nhất, không thấy khối choán chỗ, ổ xuất huyết hay giảm tỷ trọng khu trú.', gender: 'ALL' },
              { id: 'HEMORRHAGE', label: 'Xuất huyết não', isNormal: false, text: 'Ổ tăng tỷ trọng tự nhiên dạng máu tụ trong nhu mô não, có phù não xung quanh.', conclusion: 'Xuất huyết nhu mô não.', gender: 'ALL' },
              { id: 'INFARCT', label: 'Nhồi máu não', isNormal: false, text: 'Vùng giảm tỷ trọng theo khu vực cấp máu động mạch não, xóa mờ rãnh cuộn não.', conclusion: 'Nhồi máu não.', gender: 'ALL' },
            ],
          },
          {
            key: 'VENTRICLES',
            label: 'Não thất & Đường giữa',
            defaultNormalText: 'Hệ thống não thất kích thước bình thường, đường giữa cân đối không di lệch.',
            options: [
              { id: 'NORMAL', label: 'Bình thường', isNormal: true, text: 'Hệ thống não thất đối xứng, các bể nền thông thoáng, đường giữa không lệch.', gender: 'ALL' },
              { id: 'MIDLINE_SHIFT', label: 'Đè đẩy đường giữa', isNormal: false, text: 'Đè ép não thất bên và đẩy lệch đường giữa sang bên đối diện.', conclusion: 'Hiệu ứng choán chỗ gây đè đẩy đường giữa.', gender: 'ALL' },
            ],
          },
          {
            key: 'SKULL_SINUS',
            label: 'Xương sọ & Xoang',
            defaultNormalText: 'Bản xương sọ liên tục, các xoang cạnh mũi và xương chũm thông khí bình thường.',
            options: [
              { id: 'NORMAL', label: 'Bình thường', isNormal: true, text: 'Không thấy đường vỡ xương sọ, các xoang cạnh mũi sáng đều.', gender: 'ALL' },
              { id: 'SKULL_FX', label: 'Vỡ xương sọ', isNormal: false, text: 'Đường mất liên tục bản xương sọ.', conclusion: 'Vỡ xương sọ.', gender: 'ALL' },
            ],
          },
        ],
      };
    }

    return {
      ...baseMeta,
      organs: [
        {
          key: 'MAIN_STRUCTURES',
          label: `Cấu trúc ${partRaw}`,
          defaultNormalText: `Các cấu trúc giải phẫu vùng ${partRaw} trên phim CLVT tỷ trọng bình thường, ranh giới rõ, không thấy khối bất thường.`,
          options: [
            { id: 'NORMAL', label: 'Bình thường', isNormal: true, text: `Các cấu trúc giải phẫu vùng ${partRaw} trên phim cắt lớp vi tính trong giới hạn bình thường, không thấy tổn thương khu trú.`, gender: 'ALL' },
            { id: 'LESION', label: 'Tổn thương khu trú', isNormal: false, text: `Ghi nhận ổ tổn thương thay đổi tỷ trọng vùng ${partRaw}.`, conclusion: `Tổn thương khu trú vùng ${partRaw} trên CLVT.`, gender: 'ALL' },
            { id: 'INFLAMMATION', label: 'Thâm nhiễm / Viêm', isNormal: false, text: `Thâm nhiễm mô mỡ và dày tổ chức vùng ${partRaw}.`, conclusion: `Theo dõi quá trình viêm vùng ${partRaw}.`, gender: 'ALL' },
          ],
        },
        {
          key: 'ADJACENT_TISSUE',
          label: 'Mô lân cận & Hạch',
          defaultNormalText: `Mô mềm và cấu trúc lân cận vùng ${partRaw} bình thường, không thấy hạch to bệnh lý hay dịch tự do.`,
          options: [
            { id: 'NORMAL', label: 'Bình thường', isNormal: true, text: `Không thấy hạch lớn bệnh lý hay tụ dịch bất thường vùng ${partRaw}.`, gender: 'ALL' },
            { id: 'LYMPH_NODE', label: 'Hạch vùng lân cận', isNormal: false, text: `Một vài hạch nhỏ/lớn vùng ${partRaw}.`, conclusion: `Hạch vùng ${partRaw}.`, gender: 'ALL' },
          ],
        },
      ],
    };
  }

  // === C. NHÓM CỘNG HƯỞNG TỪ (MRI / CHT) ===
  if (isMRI) {
    return {
      ...baseMeta,
      organs: [
        {
          key: 'SIGNAL_PARENCHYMA',
          label: `Nhu mô & Tín hiệu ${partRaw}`,
          defaultNormalText: `Cấu trúc giải phẫu vùng ${partRaw} trên các chuỗi xung T1W, T2W, FLAIR/STIR tín hiệu đồng nhất, không thấy ổ tổn thương khu trú.`,
          options: [
            { id: 'NORMAL', label: 'Bình thường', isNormal: true, text: `Hình thái và tín hiệu các cấu trúc vùng ${partRaw} trên phim CHT trong giới hạn bình thường.`, gender: 'ALL' },
            { id: 'EDEMA_SIGNAL', label: 'Tăng tín hiệu T2/STIR (Phù)', isNormal: false, text: `Ổ tăng tín hiệu trên T2W/STIR vùng ${partRaw} gợi ý phù nề / tổn thương.`, conclusion: `Tổn thương tăng tín hiệu vùng ${partRaw} trên CHT.`, gender: 'ALL' },
            { id: 'DISC_HERNIA', label: 'Thoát vị / Lồi tổ chức', isNormal: false, text: `Khối lồi/thoát vị gây chèn ép cấu trúc lân cận vùng ${partRaw}.`, conclusion: `Thoát vị / chèn ép vùng ${partRaw}.`, gender: 'ALL' },
          ],
        },
        {
          key: 'SOFT_LIGAMENT',
          label: 'Mô mềm & Mạch máu',
          defaultNormalText: `Dây chằng, mô mềm và các nhánh mạch máu lớn vùng ${partRaw} liên tục, tín hiệu bình thường.`,
          options: [
            { id: 'NORMAL', label: 'Bình thường', isNormal: true, text: `Các cấu trúc phần mềm và mạch máu vùng ${partRaw} không thấy bất thường.`, gender: 'ALL' },
            { id: 'EFFUSION', label: 'Tụ dịch / Phù phần mềm', isNormal: false, text: `Tăng tín hiệu dịch tụ vùng ${partRaw}.`, conclusion: `Tụ dịch vùng ${partRaw}.`, gender: 'ALL' },
          ],
        },
      ],
    };
  }

  // === D. NHÓM SIÊU ÂM ===
  // 1. Tuyến giáp
  if (partName.includes('giáp') || partName.includes('thyroid')) {
    return {
      ...DEFAULT_CLINICAL_TEMPLATES.THYROID_TIRADS,
      ...baseMeta,
      classificationType: CLASSIFICATION_TYPES.TIRADS,
      hasClassification: true,
    };
  }

  // 2. Tuyến vú
  if (partName.includes('vú') || partName.includes('breast')) {
    return {
      ...DEFAULT_CLINICAL_TEMPLATES.BREAST_BIRADS,
      ...baseMeta,
      classificationType: CLASSIFICATION_TYPES.BIRADS,
      hasClassification: true,
    };
  }

  // 3. Sản phụ khoa
  if (
    partName.includes('phụ khoa') ||
    partName.includes('tử cung') ||
    partName.includes('buồng trứng') ||
    partName.includes('tiểu khung')
  ) {
    return {
      ...baseMeta,
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

  // 4. Bụng tổng quát
  if (partName.includes('bụng') || partName.includes('abdomen') || partName.includes('tổng quát')) {
    return {
      ...DEFAULT_CLINICAL_TEMPLATES.ABDOMEN,
      ...baseMeta,
    };
  }

  // 5. Fallback chung cho các bộ phận Siêu âm khác (Tim, Mạch máu, Phần mềm, Khớp, Hạch...)
  return {
    ...baseMeta,
    organs: [
      {
        key: `PART_${examPart.id || 'MAIN'}`,
        label: partRaw,
        defaultNormalText: `${partRaw} hình thái, cấu trúc âm và tín hiệu Doppler trong giới hạn bình thường.`,
        options: [
          {
            id: 'NORMAL',
            label: 'Bình thường',
            isNormal: true,
            text: `${partRaw} hình thái, cấu trúc âm và tín hiệu trong giới hạn bình thường, không thấy khối khu trú bất thường.`,
            gender: 'ALL',
          },
          {
            id: 'ABNORMAL_MILD',
            label: 'Viêm / Dày nhẹ tổ chức',
            isNormal: false,
            text: `${partRaw} có hình ảnh dày nhẹ tổ chức hoặc tụ dịch lớp mỏng.`,
            conclusion: `Theo dõi biến đổi nhẹ tại ${partRaw}.`,
            gender: 'ALL',
          },
          {
            id: 'ABNORMAL_LESION',
            label: 'Tổn thương khu trú',
            isNormal: false,
            text: `${partRaw} ghi nhận tổn thương khu trú ranh giới rõ/không rõ, đề nghị kết hợp lâm sàng.`,
            conclusion: `Tổn thương khu trú tại ${partRaw}.`,
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
export async function fetchClinicalTemplateByServiceAndPart(
  idTemplateService,
  idExamPart,
  context = {}
) {
  if (!idExamPart) return null;

  const { examPartName = '', serviceName = '' } = context || {};

  try {
    const params = { id_exam_part: idExamPart };
    if (idTemplateService) {
      params.id_template_service = idTemplateService;
    }
    const res = await API_CALL.get('/clinical-templates', { params });
    const data = res?.data?.data || res?.data;
    if (Array.isArray(data) && data.length > 0) {
      return normalizeClinicalTemplate(data[0]);
    }
  } catch {
    // Fallback tìm chính xác trong local cache nếu mất kết nối API
    const cachedMatch = resolveClinicalTemplate({ idTemplateService, idExamPart });
    if (cachedMatch) return normalizeClinicalTemplate(cachedMatch);
  }

  // Fallback tự động sinh cấu hình 5 tầng chuẩn y khoa theo Phân hệ & Bộ phận
  if (examPartName || serviceName) {
    return normalizeClinicalTemplate(
      generateDefault5TierForExamPart(
        { id: idExamPart, name: examPartName || `Bộ phận ${idExamPart}`, id_template_service: idTemplateService },
        { id: idTemplateService, name: serviceName }
      )
    );
  }

  return null;
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
