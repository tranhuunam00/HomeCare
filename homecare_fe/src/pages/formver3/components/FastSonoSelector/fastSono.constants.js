/**
 * Master Clinical Templates 5-Tier Data Constants for Fast Sono Selection
 * Tầng 1: Mẫu chỉ định (code, title, classificationType)
 * Tầng 2: Bộ phận / Cơ quan (key, label, defaultNormalText)
 * Tầng 3: Dạng kết quả / Chips (id, label, isNormal, text, conclusion, gender)
 * Tầng 4: Thang điểm đánh giá (TI-RADS, BI-RADS)
 * Tầng 5: Câu mô tả & Kết luận tự sinh
 */

export const CLASSIFICATION_TYPES = {
  NONE: 'NONE',
  TIRADS: 'TIRADS',
  BIRADS: 'BIRADS',
  ORADS: 'ORADS',
};

export const TIRADS_GRADES = [
  { grade: 'TR1', label: 'TR1: Lành tính', points: '0 điểm', desc: 'Không cần chọc hút tế bào (FNA)' },
  { grade: 'TR2', label: 'TR2: Không nghi ngờ', points: '2 điểm', desc: 'Lành tính, không chỉ định FNA' },
  { grade: 'TR3', label: 'TR3: Nghi ngờ nhẹ', points: '3 điểm', desc: 'Theo dõi nếu ≥ 1.5 cm, FNA nếu ≥ 2.5 cm' },
  { grade: 'TR4', label: 'TR4: Nghi ngờ vừa', points: '4-6 điểm', desc: 'Theo dõi nếu ≥ 1.0 cm, FNA nếu ≥ 1.5 cm' },
  { grade: 'TR5', label: 'TR5: Nghi ngờ cao', points: '≥ 7 điểm', desc: 'Theo dõi nếu ≥ 0.5 cm, FNA nếu ≥ 1.0 cm' },
];

export const BIRADS_GRADES = [
  { grade: '1', label: 'BI-RADS 1: Âm tính', desc: 'Mô tuyến vú bình thường, tầm soát định kỳ' },
  { grade: '2', label: 'BI-RADS 2: Tổn thương lành tính', desc: 'U xơ, nang đơn thuần, tầm soát định kỳ' },
  { grade: '3', label: 'BI-RADS 3: Khả năng lành tính cao (>98%)', desc: 'Theo dõi siêu âm lại sau 6 tháng' },
  { grade: '4A', label: 'BI-RADS 4A: Nghi ngờ thấp (2-10%)', desc: 'Chỉ định sinh thiết / tế bào học' },
  { grade: '4B', label: 'BI-RADS 4B: Nghi ngờ trung bình (10-50%)', desc: 'Chỉ định sinh thiết mô bệnh học' },
  { grade: '4C', label: 'BI-RADS 4C: Nghi ngờ cao (50-95%)', desc: 'Chỉ định sinh thiết mô bệnh học' },
  { grade: '5', label: 'BI-RADS 5: Gợi ý ác tính cao (>95%)', desc: 'Can thiệp ngoại khoa / sinh thiết khẩn' },
  { grade: '6', label: 'BI-RADS 6: Đã xác định ác tính', desc: 'Đã có kết quả sinh thiết, theo dõi điều trị' },
];

export const DEFAULT_CLINICAL_TEMPLATES = {
  ABDOMEN: {
    code: 'ABDOMEN',
    title: 'Siêu âm bụng tổng quát',
    classificationType: CLASSIFICATION_TYPES.NONE,
    hasClassification: false,
    organs: [
      {
        key: 'LIVER',
        label: 'Gan',
        defaultNormalText: 'Gan không to, bờ đều, nhu mô đồng nhất, không thấy khối khu trú.',
        options: [
          { id: 'NORMAL', label: 'Bình thường', isNormal: true, text: 'Gan không to, bờ đều, nhu mô đồng nhất, không thấy khối khu trú.' },
          { id: 'LIVER_FATTY_1', label: 'Gan nhiễm mỡ độ I', isNormal: false, text: 'Nhu mô gan tăng âm nhẹ, giảm âm vùng sâu nhẹ, cơ hoành và tĩnh mạch cửa còn thấy rõ.', conclusion: 'Hình ảnh gan nhiễm mỡ độ I.' },
          { id: 'LIVER_FATTY_2', label: 'Gan nhiễm mỡ độ II', isNormal: false, text: 'Nhu mô gan tăng âm vừa, giảm âm vùng sâu vừa, cơ hoành mờ nhẹ.', conclusion: 'Hình ảnh gan nhiễm mỡ độ II.' },
          { id: 'LIVER_CYST', label: 'Nang gan', isNormal: false, text: 'Gan có nốt trống âm d#15mm, thành mỏng đều, tăng âm thành sau.', conclusion: 'Nang gan đơn thuần lành tính.' },
          { id: 'LIVER_HEMA', label: 'U máu gan', isNormal: false, text: 'Nhu mô gan có nốt tăng âm đồng nhất, ranh giới rõ d#18mm.', conclusion: 'U máu gan lành tính d#18mm.' },
          { id: 'LIVER_ENLARGED', label: 'Gan to', isNormal: false, text: 'Gan kích thước to nhẹ, vượt bờ sườn phải.', conclusion: 'Gan to nhẹ.' },
          { id: 'LIVER_COARSE', label: 'Nhu mô thô', isNormal: false, text: 'Nhu mô gan thô rải rác, bờ hơi gồ ghề, tĩnh mạch cửa không giãn.', conclusion: 'Nhu mô gan thô (theo dõi bệnh lý gan mạn tính).' },
          { id: 'LIVER_MASS', label: 'Khối khu trú', isNormal: false, text: 'Nhu mô gan có khối giảm âm không đều, ranh giới không rõ.', conclusion: 'Khối khu trú tại gan nghi ngờ (đề nghị chụp CT/MRI kiểm tra).' },
        ],
      },
      {
        key: 'GALLBLADDER',
        label: 'Túi mật',
        defaultNormalText: 'Túi mật không căng, thành mỏng, lòng không có sỏi.',
        options: [
          { id: 'NORMAL', label: 'Bình thường', isNormal: true, text: 'Túi mật không căng, thành mỏng, lòng không có sỏi.' },
          { id: 'GB_STONE', label: 'Sỏi túi mật', isNormal: false, text: 'Lòng túi mật có nốt tăng âm kèm bóng cản d#10mm, di động theo tư thế.', conclusion: 'Sỏi túi mật d#10mm.' },
          { id: 'GB_POLYP', label: 'Polyp túi mật', isNormal: false, text: 'Thành túi mật có nốt tăng âm d#4mm, không kèm bóng cản, không di động.', conclusion: 'Polyp túi mật d#4mm.' },
          { id: 'GB_THICK', label: 'Dày thành', isNormal: false, text: 'Thành túi mật dày đều d#5mm, dịch mật trong.', conclusion: 'Dày thành túi mật theo dõi viêm.' },
        ],
      },
      {
        key: 'BILE_DUCTS',
        label: 'Đường mật',
        defaultNormalText: 'Đường mật trong và ngoài gan không giãn, không có sỏi.',
        options: [
          { id: 'NORMAL', label: 'Bình thường', isNormal: true, text: 'Đường mật trong và ngoài gan không giãn, không có sỏi.' },
          { id: 'BILE_DILATE', label: 'Giãn ống mật chủ', isNormal: false, text: 'Ống mật chủ giãn nhẹ d#11mm, đoạn thấp khó quan sát do hơi.', conclusion: 'Giãn nhẹ ống mật chủ.' },
          { id: 'BILE_STONE', label: 'Sỏi đường mật', isNormal: false, text: 'Ống mật chủ có nốt tăng âm kèm bóng cản d#8mm, đoạn trên giãn nhẹ.', conclusion: 'Sỏi ống mật chủ.' },
        ],
      },
      {
        key: 'PANCREAS',
        label: 'Tụy',
        defaultNormalText: 'Tụy kích thước bình thường, nhu mô đồng nhất, ống tụy không giãn.',
        options: [
          { id: 'NORMAL', label: 'Bình thường', isNormal: true, text: 'Tụy kích thước bình thường, nhu mô đồng nhất, ống tụy không giãn.' },
          { id: 'PANCREAS_FAT', label: 'Thoái hoá mỡ', isNormal: false, text: 'Nhu mô tụy tăng âm dạng thoái hoá mỡ lan toả theo lứa tuổi.', conclusion: 'Thoái hoá mỡ nhu mô tụy.' },
        ],
      },
      {
        key: 'SPLEEN',
        label: 'Lách',
        defaultNormalText: 'Lách không to, nhu mô đồng nhất, không thấy tổn thương khu trú.',
        options: [
          { id: 'NORMAL', label: 'Bình thường', isNormal: true, text: 'Lách không to, nhu mô đồng nhất, không thấy tổn thương khu trú.' },
          { id: 'SPLEEN_BIG', label: 'Lách to', isNormal: false, text: 'Lách to độ I qua bờ sườn, nhu mô đồng nhất.', conclusion: 'Lách to độ I.' },
        ],
      },
      {
        key: 'KIDNEYS',
        label: 'Hai thận',
        defaultNormalText: 'Hai thận kích thước bình thường, phân biệt vỏ tủy rõ, không sỏi, không ứ nước.',
        options: [
          { id: 'NORMAL', label: 'Bình thường', isNormal: true, text: 'Hai thận kích thước bình thường, phân biệt vỏ tủy rõ, không sỏi, không ứ nước.' },
          { id: 'KIDNEY_STONE_R', label: 'Sỏi thận phải', isNormal: false, text: 'Đài dưới thận phải có nốt tăng âm kèm bóng cản d#5mm, không ứ nước.', conclusion: 'Sỏi đài dưới thận phải d#5mm.' },
          { id: 'KIDNEY_STONE_L', label: 'Sỏi thận trái', isNormal: false, text: 'Đài thận trái có nốt tăng âm kèm bóng cản d#6mm, không ứ nước.', conclusion: 'Sỏi thận trái d#6mm.' },
          { id: 'KIDNEY_CYST', label: 'Nang thận', isNormal: false, text: 'Nang thận cấu trúc trống âm d#14mm, thành mỏng lành tính.', conclusion: 'Nang thận lành tính.' },
          { id: 'KIDNEY_HYDRO', label: 'Thận ứ nước', isNormal: false, text: 'Thận giãn đài bể thận độ I, nhu mô vỏ thận còn bảo tồn tốt.', conclusion: 'Thận ứ nước độ I.' },
        ],
      },
      {
        key: 'BLADDER',
        label: 'Bàng quang',
        defaultNormalText: 'Bàng quang thành mỏng, nước tiểu trong, không sỏi, không u.',
        options: [
          { id: 'NORMAL', label: 'Bình thường', isNormal: true, text: 'Bàng quang thành mỏng, nước tiểu trong, không sỏi, không u.' },
          { id: 'BLADDER_WALL', label: 'Dày thành', isNormal: false, text: 'Thành bàng quang dày nhẹ, nước tiểu trong, không thấy sỏi.', conclusion: 'Dày nhẹ thành bàng quang.' },
          { id: 'BLADDER_STONE', label: 'Sỏi bàng quang', isNormal: false, text: 'Lòng bàng quang có nốt tăng âm d#12mm kèm bóng cản di động.', conclusion: 'Sỏi bàng quang d#12mm.' },
        ],
      },
      {
        key: 'PELVIS',
        label: 'Tiểu khung',
        defaultNormalText: 'Vùng tiểu khung: không thấy khối u bất thường, dịch cùng đồ âm tính.',
        options: [
          { id: 'NORMAL', label: 'Bình thường', isNormal: true, text: 'Vùng tiểu khung: không thấy khối u bất thường, dịch cùng đồ âm tính.', gender: 'ALL' },
          { id: 'PELVIS_PROSTATE_BPH', label: 'Phì đại tiền liệt tuyến', isNormal: false, text: 'Tuyến tiền liệt to, thể tích ước tính V#35ml, nhu mô đồng nhất.', conclusion: 'Phì đại lành tính tuyến tiền liệt.', gender: 'MALE' },
          { id: 'PELVIS_FIBROID', label: 'U xơ tử cung', isNormal: false, text: 'Tử cung có khối giảm âm d#22mm, giới hạn rõ, không hoại tử.', conclusion: 'U xơ tử cung d#22mm.', gender: 'FEMALE' },
          { id: 'PELVIS_OVARY_CYST', label: 'Nang buồng trứng', isNormal: false, text: 'Buồng trứng có nang trống âm thành mỏng d#28mm đơn thuần.', conclusion: 'Nang buồng trứng đơn thuần lành tính.', gender: 'FEMALE' },
        ],
      },
      {
        key: 'PERITONEAL',
        label: 'Ổ bụng',
        defaultNormalText: 'Khoang ổ bụng: không thấy dịch tự do, không thấy quai ruột giãn.',
        options: [
          { id: 'NORMAL', label: 'Bình thường', isNormal: true, text: 'Khoang ổ bụng: không thấy dịch tự do, không thấy quai ruột giãn.' },
          { id: 'PERITONEAL_FLUID', label: 'Dịch ổ bụng ít', isNormal: false, text: 'Khoang màng bụng có lớp dịch tự do mỏng d#10mm.', conclusion: 'Dịch tự do khoang màng bụng lượng ít.' },
          { id: 'PERITONEAL_FLUID_MOD', label: 'Dịch ổ bụng vừa', isNormal: false, text: 'Dịch tự do khoang Morison và cùng đồ Douglas d#22mm.', conclusion: 'Dịch tự do khoang ổ bụng lượng vừa.' },
        ],
      },
    ],
  },

  THYROID_TIRADS: {
    code: 'THYROID_TIRADS',
    title: 'Siêu âm Tuyến giáp (TI-RADS)',
    classificationType: CLASSIFICATION_TYPES.TIRADS,
    hasClassification: true,
    organs: [
      {
        key: 'THYROID_RIGHT',
        label: 'Thùy phải',
        defaultNormalText: 'Thùy phải kích thước bình thường, nhu mô đồng nhất, không thấy nốt khu trú.',
        options: [
          { id: 'NORMAL', label: 'Bình thường', isNormal: true, text: 'Thùy phải kích thước bình thường, nhu mô đồng nhất, không thấy nốt khu trú.' },
          { id: 'TR_CYST', label: 'Nang giáp', isNormal: false, text: 'Thùy phải có nốt trống âm đơn thuần d#6mm, thành mỏng.', conclusion: 'Nang keo thùy phải tuyến giáp lành tính.' },
          { id: 'TR_NODULE_ISO', label: 'Nhân đồng âm', isNormal: false, text: 'Thùy phải có nhân đồng âm d#10x8mm, viền giảm âm mỏng quanh nhân (halo).', conclusion: 'Nhân thùy phải tuyến giáp (nghi ngờ thấp).' },
          { id: 'TR_NODULE_HYPO', label: 'Nhân giảm âm', isNormal: false, text: 'Thùy phải có nhân giảm âm d#12x15mm, bờ không đều, trục đứng > ngang.', conclusion: 'Nhân giảm âm thùy phải tuyến giáp nghi ngờ cao, đề nghị chọc hút FNA.' },
        ],
      },
      {
        key: 'THYROID_LEFT',
        label: 'Thùy trái',
        defaultNormalText: 'Thùy trái kích thước bình thường, nhu mô đồng nhất, không thấy nốt khu trú.',
        options: [
          { id: 'NORMAL', label: 'Bình thường', isNormal: true, text: 'Thùy trái kích thước bình thường, nhu mô đồng nhất, không thấy nốt khu trú.' },
          { id: 'TL_CYST', label: 'Nang giáp', isNormal: false, text: 'Thùy trái có nang keo d#5mm, có đuôi sao chổi nhỏ.', conclusion: 'Nang keo thùy trái tuyến giáp lành tính.' },
          { id: 'TL_NODULE', label: 'Nhân thùy trái', isNormal: false, text: 'Thùy trái có nhân giảm âm nhẹ d#9mm, ranh giới rõ.', conclusion: 'Nhân thùy trái tuyến giáp.' },
        ],
      },
      {
        key: 'THYROID_ISTHMUS',
        label: 'Eo giáp',
        defaultNormalText: 'Eo tuyến giáp mỏng, nhu mô đều, không thấy nhân.',
        options: [
          { id: 'NORMAL', label: 'Bình thường', isNormal: true, text: 'Eo tuyến giáp mỏng, nhu mô đều, không thấy nhân.' },
          { id: 'ISTHMUS_NODULE', label: 'Nhân eo giáp', isNormal: false, text: 'Vùng eo giáp có nhân giảm âm d#7mm, ranh giới rõ.', conclusion: 'Nhân vùng eo tuyến giáp.' },
        ],
      },
      {
        key: 'CERVICAL_LYMPH',
        label: 'Hạch cổ',
        defaultNormalText: 'Vùng cổ 2 bên không thấy hạch to bệnh lý.',
        options: [
          { id: 'NORMAL', label: 'Bình thường', isNormal: true, text: 'Vùng cổ 2 bên không thấy hạch to bệnh lý.' },
          { id: 'LYMPH_REACTIVE', label: 'Hạch viêm phản ứng', isNormal: false, text: 'Vùng góc hàm có hạch xoang rõ d#10x5mm, dạng viêm phản ứng.', conclusion: 'Hạch cổ dạng viêm phản ứng lành tính.' },
          { id: 'LYMPH_SUSPECT', label: 'Hạch nghi ngờ', isNormal: false, text: 'Nhóm hạch cảnh giữa có hạch tròn mất rốn hạch d#14mm.', conclusion: 'Hạch cổ nghi ngờ bệnh lý, đề nghị sinh thiết kiểm tra.' },
        ],
      },
    ],
  },

  BREAST_BIRADS: {
    code: 'BREAST_BIRADS',
    title: 'Siêu âm Tuyến vú 2 bên (BI-RADS)',
    classificationType: CLASSIFICATION_TYPES.BIRADS,
    hasClassification: true,
    organs: [
      {
        key: 'BREAST_RIGHT',
        label: 'Vú phải',
        defaultNormalText: 'Tuyến vú phải cấu trúc sợi tuyến bình thường, không thấy khối u hay vi vôi hóa.',
        options: [
          { id: 'NORMAL', label: 'Bình thường', isNormal: true, text: 'Tuyến vú phải cấu trúc sợi tuyến bình thường, không thấy khối u hay vi vôi hóa.' },
          { id: 'BR_CYST', label: 'Nang tuyến vú', isNormal: false, text: 'Vú phải vị trí 10h cách núm vú 2cm có nang trống âm d#8mm, thành mỏng.', conclusion: 'Nang đơn thuần tuyến vú phải lành tính.' },
          { id: 'BR_FIBRO', label: 'U sợi tuyến (FA)', isNormal: false, text: 'Vú phải vị trí 2h có khối giảm âm đồng nhất, ranh giới rõ d#12x7mm, trục ngang.', conclusion: 'U sợi tuyến vú phải lành tính.' },
          { id: 'BR_MASS_SUSP', label: 'Khối nghi ngờ', isNormal: false, text: 'Vú phải vị trí 9h có khối giảm âm không đều, bờ tua gai d#15x12mm, trục đứng.', conclusion: 'Khối giảm âm vú phải nghi ngờ cao, đề nghị sinh thiết mô bệnh học.' },
        ],
      },
      {
        key: 'BREAST_LEFT',
        label: 'Vú trái',
        defaultNormalText: 'Tuyến vú trái cấu trúc sợi tuyến bình thường, không thấy khối u hay vi vôi hóa.',
        options: [
          { id: 'NORMAL', label: 'Bình thường', isNormal: true, text: 'Tuyến vú trái cấu trúc sợi tuyến bình thường, không thấy khối u hay vi vôi hóa.' },
          { id: 'BL_CYST', label: 'Nang tuyến vú', isNormal: false, text: 'Vú trái vị trí 3h có nang trống âm d#6mm lành tính.', conclusion: 'Nang đơn thuần tuyến vú trái lành tính.' },
          { id: 'BL_FIBRO', label: 'U sợi tuyến (FA)', isNormal: false, text: 'Vú trái vị trí 4h có khối giảm âm ranh giới rõ d#14x8mm.', conclusion: 'U sợi tuyến vú trái lành tính.' },
        ],
      },
      {
        key: 'AXILLARY_LYMPH',
        label: 'Hố nách 2 bên',
        defaultNormalText: 'Hố nách hai bên không thấy hạch to bất thường.',
        options: [
          { id: 'NORMAL', label: 'Bình thường', isNormal: true, text: 'Hố nách hai bên không thấy hạch to bất thường.' },
          { id: 'AX_LYMPH_BIG', label: 'Hạch nách to', isNormal: false, text: 'Hố nách phải có hạch tăng kích thước d#16mm, xoang hạch hẹp.', conclusion: 'Hạch nách phải to nghi ngờ.' },
        ],
      },
    ],
  },
};

