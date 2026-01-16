export const DEFAULT_HEADER_BLOCKS = [
  /* ===== LOGO ===== */
  {
    id: "logo",
    type: "image",
    label: "Logo",
    value: null,
    x: 60,
    y: 0,
    width: 60,
    height: 60,
    visible: true,
    zIndex: 1,
  },

  /* ===== LEFT CONTENT ===== */
  {
    id: "clinic_name",
    type: "text",
    label: "Tên bệnh viện",
    value: "BỆNH VIỆN ĐA KHOA MEDLATEC MEDLATEC ",
    x: 170,
    y: 0,
    width: 320,
    height: 22,
    visible: true,
    zIndex: 2,
    style: {
      fontSize: 14,
      color: "#1e5bb8",
      whiteSpace: "pre-line", // ⭐ xuống dòng như hình
      lineHeight: 1.2,
    },
  },

  {
    id: "specialty",
    type: "text",
    label: "Chuyên khoa",
    value: "Chuyên khoa: CHẨN ĐOÁN HÌNH ẢNH",
    x: 170,
    y: 24,
    width: 320,
    height: 22,
    visible: true,
    zIndex: 2,
    style: {
      fontSize: 14,
      whiteSpace: "pre-line", // ⭐ wrap 2 dòng
      lineHeight: 1.3,
    },
  },

  {
    id: "address",
    type: "text",
    label: "Địa chỉ",
    value: "Địa chỉ: 42–44 Nghĩa Dũng, Ba Đình",
    x: 170,
    y: 48,
    width: 320,
    height: 22,
    visible: true,
    zIndex: 2,
    style: {
      fontSize: 14,
    },
  },

  /* ===== RIGHT CONTENT ===== */
  {
    id: "website",
    type: "text",
    label: "Website",
    value: "Website: www.medlatec.vn",
    x: 500,
    y: 0,
    width: 280,
    height: 22,
    visible: true,
    zIndex: 2,
    style: {
      fontSize: 14,
    },
  },

  {
    id: "hotline",
    type: "text",
    label: "Hotline",
    value: "Hotline: 09474612000",
    x: 500,
    y: 24,
    width: 280,
    height: 22,
    visible: true,
    zIndex: 2,
    style: {
      fontSize: 14,
    },
  },

  {
    id: "email",
    type: "text",
    label: "Email",
    value: "Email: vinh.daodanh@medlatec.com",
    x: 500,
    y: 48,
    width: 280,
    height: 22,
    visible: true,
    zIndex: 2,
    style: {
      fontSize: 14,
    },
  },
];

export const HEADER_TEMPLATE_2 = [
  /* ===== LEFT CONTENT (NO LOGO) ===== */
  {
    id: "clinic_name",
    type: "text",
    label: "Tên bệnh viện",
    value: "PHÒNG KHÁM BÁC SĨ GIA ĐÌNH HOMECARE",
    x: 40,
    y: 20,
    width: 420,
    height: 26,
    visible: true,
    zIndex: 2,
    style: {
      fontSize: 16,
      fontWeight: 600,
      color: "#1e5bb8",
      whiteSpace: "pre-line",
      lineHeight: 1.3,
    },
  },

  {
    id: "specialty",
    type: "text",
    label: "Chuyên khoa",
    value: "Chuyên khoa: Thần kinh",
    x: 40,
    y: 50,
    width: 420,
    height: 22,
    visible: true,
    zIndex: 2,
    style: {
      fontSize: 14,
      whiteSpace: "pre-line",
    },
  },

  {
    id: "address",
    type: "text",
    label: "Địa chỉ",
    value: "Địa chỉ: số 23 Nguyễn Tuân",
    x: 40,
    y: 74,
    width: 420,
    height: 22,
    visible: true,
    zIndex: 2,
    style: {
      fontSize: 14,
    },
  },

  /* ===== RIGHT CONTENT ===== */
  {
    id: "website",
    type: "text",
    label: "Website",
    value: "Website: https://doctor.home-care.vn/",
    x: 500,
    y: 20,
    width: 280,
    height: 22,
    visible: true,
    zIndex: 2,
    style: { fontSize: 14 },
  },

  {
    id: "hotline",
    type: "text",
    label: "Hotline",
    value: "Hotline: 0339457609",
    x: 500,
    y: 44,
    width: 280,
    height: 22,
    visible: true,
    zIndex: 2,
    style: { fontSize: 14 },
  },

  {
    id: "email",
    type: "text",
    label: "Email",
    value: "Email: tranglt18@gmail.com",
    x: 500,
    y: 68,
    width: 280,
    height: 22,
    visible: true,
    zIndex: 2,
    style: { fontSize: 14 },
  },
];

export const HEADER_BLOCKS_STORAGE_KEY = "print_header_blocks_draft";

export const mapHeaderInfoToBlocks = (headerInfo = {}) => {
  return DEFAULT_HEADER_BLOCKS.map((block) => {
    switch (block.id) {
      case "logo":
        return {
          ...block,
          value: headerInfo.logo_url || null,
        };

      case "clinic_name":
        return {
          ...block,
          value: headerInfo.clinic_name || block.value,
        };

      case "specialty":
        return {
          ...block,
          value: headerInfo.department_name
            ? `Chuyên khoa: ${headerInfo.department_name}`
            : block.value,
        };

      case "address":
        return {
          ...block,
          value: headerInfo.address
            ? `Địa chỉ: ${headerInfo.address}`
            : block.value,
        };

      case "website":
        return {
          ...block,
          value: headerInfo.website
            ? `Website: ${headerInfo.website}`
            : block.value,
        };

      case "hotline":
        return {
          ...block,
          value: headerInfo.phone
            ? `Hotline: ${headerInfo.phone}`
            : block.value,
        };

      case "email":
        return {
          ...block,
          value: headerInfo.email ? `Email: ${headerInfo.email}` : block.value,
        };

      default:
        return block;
    }
  });
};
