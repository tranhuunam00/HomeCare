import dayjs from "dayjs";

export const FEATURE_KEYS_PACKAGE = {
  SIEU_AM: {
    label: "Siêu âm",
    description: "Mẫu form kết quả phân hệ siêu âm",
  },
  X_QUANG: {
    label: "X-QUANG",
    description: "Mẫu form kết quả phân hệ X-QUANG",
  },
  MAMMO: {
    label: "Mammo",
    description: "Mẫu form kết quả phân hệ Mammo",
  },
  CAT_LOP_VI_TINH: {
    label: "Cắt lớp vi tính ",
    description: "Mẫu form kết quả phân hệ Cắt lớp vi tính",
  },
  CONG_HUONG_TU: {
    label: "Cộng hưởng từ",
    description: "Mẫu form kết quả phân hệ Cộng hưởng từ",
  },
  THAM_DO_CHUC_NANG: {
    label: "Thăm dò chức năng",
    description: "Mẫu form kết quả phân hệ Thăm dò chức năng",
  },
  NOI_SOI_TIEU_HOA: {
    label: "Nội soi tiêu hóa",
    description: "Mẫu form kết quả phân hệ Nội soi tiêu hóa",
  },
  GIAI_PHAU_BENH: {
    label: "Giải phẫu bệnh",
    description: "Mẫu form kết quả phân hệ Giải phẫu bệnh",
  },
  REPORT_NORMAL_500: {
    label: "Mẫu kết quả bình thường",
    description: "Truy cập thư viện hơn 500 mẫu kết quả bình thường.",
  },

  REPORT_ABNORMAL_1000: {
    label: "Mẫu kết quả bệnh lý",
    description: "Truy cập thư viện hơn 1000 mẫu kết quả bệnh lý bất thường.",
  },
  INTERGATE_FORM_ENGLISH: {
    label: "Tích hợp mẫu kết quả tiếng Anh",
    description:
      "Tích hợp mẫu kết quả tiếng Anh được chuyên gia D-RADS biên soạn sẵn",
  },
  INTERGATE_SERVICE: {
    label: "Tích hợp ứng dụng",
    description: "Tích hợp ứng dụng TIRADS, BIRADS, LungRADS, BoneAge,...",
  },
  ENGLISH_LANG: {
    label: "Tích hợp AI dịch sang tiếng Anh",
    description: "Kết quả có thể được hiển thị và xuất báo cáo bằng tiếng Anh.",
  },
  MULTI_LANG_30: {
    label: "Tích hợp kết quả đa ngôn ngữ",
    description:
      "Kết quả có thể được hiển thị và xuất báo cáo bằng hơn 30 ngôn ngữ.",
  },
  AI_SUPPORT_EXPERT: {
    label: "AI hỗ trợ tư vấn",
    description: "AI phân tích kết quả và gợi ý tư vấn chuyên môn cho bác sĩ.",
  },
  PACS_IMAGE: {
    label: "Tích hợp PACS",
    description: "Tích hợp đồng bộ các tiện ích của PACS",
  },
};

export const PACKAGE_FEATURES = {
  ECO: {
    code: "ECO",
    name: "ECO",
    description: "Gói cơ bản cho cá nhân và sử dụng hằng tháng",
    permissions: [
      FEATURE_KEYS_PACKAGE.SIEU_AM,
      FEATURE_KEYS_PACKAGE.X_QUANG,
      FEATURE_KEYS_PACKAGE.MAMMO,
      FEATURE_KEYS_PACKAGE.CAT_LOP_VI_TINH,
      FEATURE_KEYS_PACKAGE.CONG_HUONG_TU,
      FEATURE_KEYS_PACKAGE.THAM_DO_CHUC_NANG,
      FEATURE_KEYS_PACKAGE.NOI_SOI_TIEU_HOA,
      FEATURE_KEYS_PACKAGE.GIAI_PHAU_BENH,
      FEATURE_KEYS_PACKAGE.REPORT_NORMAL_500,
    ],
  },

  PRO: {
    code: "PRO",
    name: "PRO",
    description: "Gói cao cấp thích hợp cho cá nhân dùng song ngữ Anh-Việt",
    permissions: [
      FEATURE_KEYS_PACKAGE.SIEU_AM,
      FEATURE_KEYS_PACKAGE.X_QUANG,
      FEATURE_KEYS_PACKAGE.MAMMO,
      FEATURE_KEYS_PACKAGE.CAT_LOP_VI_TINH,
      FEATURE_KEYS_PACKAGE.CONG_HUONG_TU,
      FEATURE_KEYS_PACKAGE.THAM_DO_CHUC_NANG,
      FEATURE_KEYS_PACKAGE.NOI_SOI_TIEU_HOA,
      FEATURE_KEYS_PACKAGE.GIAI_PHAU_BENH,
      FEATURE_KEYS_PACKAGE.REPORT_NORMAL_500,
      FEATURE_KEYS_PACKAGE.REPORT_ABNORMAL_1000,
      FEATURE_KEYS_PACKAGE.INTERGATE_FORM_ENGLISH,
      FEATURE_KEYS_PACKAGE.INTERGATE_SERVICE,
      FEATURE_KEYS_PACKAGE.ENGLISH_LANG,
    ],
  },

  BUSINESS: {
    code: "BUSINESS",
    name: "BUSINESS",
    description:
      "Gói cao cấp cho tổ chức, có AI hỗ trợ chuyên môn và đa ngôn ngữ",
    permissions: [
      FEATURE_KEYS_PACKAGE.SIEU_AM,
      FEATURE_KEYS_PACKAGE.X_QUANG,
      FEATURE_KEYS_PACKAGE.MAMMO,
      FEATURE_KEYS_PACKAGE.CAT_LOP_VI_TINH,
      FEATURE_KEYS_PACKAGE.CONG_HUONG_TU,
      FEATURE_KEYS_PACKAGE.THAM_DO_CHUC_NANG,
      FEATURE_KEYS_PACKAGE.NOI_SOI_TIEU_HOA,
      FEATURE_KEYS_PACKAGE.GIAI_PHAU_BENH,
      FEATURE_KEYS_PACKAGE.REPORT_NORMAL_500,
      FEATURE_KEYS_PACKAGE.REPORT_ABNORMAL_1000,
      FEATURE_KEYS_PACKAGE.INTERGATE_FORM_ENGLISH,
      FEATURE_KEYS_PACKAGE.INTERGATE_SERVICE,
      FEATURE_KEYS_PACKAGE.ENGLISH_LANG,
      FEATURE_KEYS_PACKAGE.MULTI_LANG_30,
      FEATURE_KEYS_PACKAGE.AI_SUPPORT_EXPERT,
      FEATURE_KEYS_PACKAGE.PACS_IMAGE,
    ],
  },
};

export const DURATION_OPTIONS = [
  { value: 1, label: "1 tháng" },
  { value: 3, label: "3 tháng" },
  { value: 12, label: "12 tháng" },
];
export const PACKAGE_FEES = {
  ECO: [
    { value: 1, label: "250.000", saving: 0, qr: "250k.jpg" },
    { value: 3, label: "625.000", saving: 125000, qr: "625k.jpg" },
    { value: 12, label: "2.250.000", saving: 750000, qr: "2250k.jpg" },
  ],
  PRO: [
    { value: 1, label: "450.000", saving: 0, qr: "450k.jpg" },
    { value: 3, label: "1.125.000", saving: 225000, qr: "1125k.jpg" },
    { value: 12, label: "4.050.000", saving: 1350000, qr: "4050k.jpg" },
  ],
  BUSINESS: [
    { value: 1, label: "650.000", saving: 0, qr: "650k.jpg" },
    { value: 3, label: "1.625.000", saving: 325000, qr: "1625k.jpg" },
    { value: 12, label: "5.850.000", saving: 2220000, qr: "5850k.jpg" },
  ],
};

export const getUsablePackageCodes = (packages = []) => {
  return packages
    .filter(
      (pkg) =>
        pkg?.status === "active" &&
        pkg?.end_date &&
        dayjs(pkg.end_date).isAfter(dayjs())
    )
    .map((p) => p.package_code);
};

export const hasProOrBusiness = (userPackages) =>
  userPackages?.some(
    (pkg) =>
      pkg.status === "active" &&
      (pkg.package_code === "PRO" || pkg.package_code === "BUSINESS")
  );
