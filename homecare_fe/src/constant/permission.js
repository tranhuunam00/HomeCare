import dayjs from "dayjs";

export const FEATURE_KEYS = {
  TRIAL_1_MONTH: {
    label: "Thời gian dùng thử - 1 tháng",
    description: "Người dùng được sử dụng thử miễn phí trong 1 tháng đầu tiên.",
  },
  CLOUD_12_MONTH: {
    label: "Thời gian lưu kết quả Cloud - 12 tháng",
    description: "Dữ liệu lưu trữ trên Cloud trong 12 tháng.",
  },
  TOOLKIT_15_APP: {
    label: "Tích hợp phần mềm ứng dụng tiện ích - 15 công cụ",
    description:
      "Bao gồm 15 ứng dụng tiện ích giúp đọc và quản lý kết quả chẩn đoán.",
  },
  UNLIMITED_REPORTS: {
    label: "Số lượt sử dụng mẫu không giới hạn",
    description: "Không giới hạn số lượng mẫu kết quả có thể đọc hoặc tạo.",
  },
  SUPPORT_24_7: {
    label: "Hỗ trợ kỹ thuật 24/7 (email, chat, call)",
    description: "Nhận hỗ trợ kỹ thuật liên tục qua email, chat hoặc cuộc gọi.",
  },
  PACS_SUPPORT: {
    label: "Hỗ trợ đọc kết quả từ xa qua PACS (phí tính riêng)",
    description:
      "Cho phép đọc kết quả chẩn đoán từ xa thông qua hệ thống PACS.",
  },
  REPORT_NORMAL_500: {
    label: "Mẫu kết quả bình thường - hơn 500 mẫu",
    description: "Truy cập thư viện hơn 500 mẫu kết quả bình thường.",
  },
  REPORT_ABNORMAL_1000: {
    label: "Mẫu kết quả bất thường - hơn 1000 mẫu",
    description: "Truy cập thư viện hơn 1000 mẫu kết quả bất thường.",
  },
  REPORT_EN_NORMAL_500: {
    label: "Mẫu kết quả tiếng Anh bình thường - hơn 500 mẫu",
    description: "Truy cập mẫu kết quả tiếng Anh bình thường (trên 500 mẫu).",
  },
  REPORT_EN_ABNORMAL_1000: {
    label: "Mẫu kết quả tiếng Anh bất thường - hơn 1000 mẫu",
    description: "Truy cập mẫu kết quả tiếng Anh bất thường (trên 1000 mẫu).",
  },
  MULTI_LANG_30: {
    label: "Tích hợp kết quả đa ngôn ngữ - hơn 30 ngôn ngữ",
    description:
      "Kết quả có thể được hiển thị và xuất báo cáo bằng hơn 30 ngôn ngữ.",
  },
  AI_SUPPORT_EXPERT: {
    label: "AI hỗ trợ tư vấn chuyên môn dựa theo kết luận",
    description: "AI phân tích kết quả và gợi ý tư vấn chuyên môn cho bác sĩ.",
  },
};

export const PACKAGE_FEATURES = {
  BASIC: {
    code: "BASIC",
    name: "DRADS-Basic",
    description: "Gói cơ bản cho cá nhân dùng thử và sử dụng hằng tháng",
    permissions: [
      FEATURE_KEYS.TRIAL_1_MONTH,
      FEATURE_KEYS.CLOUD_12_MONTH,
      FEATURE_KEYS.TOOLKIT_15_APP,
      FEATURE_KEYS.UNLIMITED_REPORTS,
      FEATURE_KEYS.REPORT_NORMAL_500,
    ],
  },

  STANDARD: {
    code: "STANDARD",

    name: "DRADS-Standard",
    description:
      "Gói tiêu chuẩn hỗ trợ PACS, nhiều mẫu hơn, có hỗ trợ kỹ thuật",
    permissions: [
      FEATURE_KEYS.TRIAL_1_MONTH,
      FEATURE_KEYS.CLOUD_12_MONTH,
      FEATURE_KEYS.TOOLKIT_15_APP,
      FEATURE_KEYS.UNLIMITED_REPORTS,
      FEATURE_KEYS.SUPPORT_24_7,
      FEATURE_KEYS.PACS_SUPPORT,
      FEATURE_KEYS.REPORT_NORMAL_500,
      FEATURE_KEYS.REPORT_ABNORMAL_1000,
      FEATURE_KEYS.REPORT_EN_NORMAL_500,
      FEATURE_KEYS.REPORT_EN_ABNORMAL_1000,
    ],
  },

  PREMIUM: {
    code: "PREMIUM",
    name: "DRADS-Premium",
    description:
      "Gói cao cấp cho tổ chức, có AI hỗ trợ chuyên môn và đa ngôn ngữ",
    permissions: [
      FEATURE_KEYS.TRIAL_1_MONTH,
      FEATURE_KEYS.CLOUD_12_MONTH,
      FEATURE_KEYS.TOOLKIT_15_APP,
      FEATURE_KEYS.UNLIMITED_REPORTS,
      FEATURE_KEYS.SUPPORT_24_7,
      FEATURE_KEYS.PACS_SUPPORT,
      FEATURE_KEYS.REPORT_NORMAL_500,
      FEATURE_KEYS.REPORT_ABNORMAL_1000,
      FEATURE_KEYS.REPORT_EN_NORMAL_500,
      FEATURE_KEYS.REPORT_EN_ABNORMAL_1000,
      FEATURE_KEYS.MULTI_LANG_30,
      FEATURE_KEYS.AI_SUPPORT_EXPERT,
    ],
  },
};

export const DURATION_OPTIONS = [
  { value: 1, label: "1 tháng" },
  { value: 3, label: "3 tháng" },
  { value: 6, label: "6 tháng" },
  { value: 12, label: "12 tháng" },
];

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
