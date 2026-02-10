const CANVAS_WIDTH = 794;
export const PAGE_PADDING_RIGHT = 48;
const COL_WIDTH = 320;

export const DEFAULT_HEADER_BLOCKS = [
  /* ===== LOGO ===== */
  {
    id: "logo",
    type: "image",
    label: "Logo",
    value: null,
    x: (CANVAS_WIDTH - 68 - PAGE_PADDING_RIGHT) / 2,
    y: 0,
    width: 68,
    height: 68,
    visible: true,
    zIndex: 1,
  },

  /* ===== LEFT CONTENT ===== */
  {
    id: "clinic_name",
    type: "text",
    label: "Tên bệnh viện",
    value: "BỆNH VIỆN ĐA KHOA MEDLATEC MEDLATEC ",
    x: 0,
    y: 0,
    width: COL_WIDTH,
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
    x: 0,
    y: 24,
    width: COL_WIDTH,
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
    x: 0,
    y: 48,
    width: COL_WIDTH,
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
    x: 794 - 40 - COL_WIDTH,
    y: 0,
    width: COL_WIDTH,
    height: 22,
    visible: true,
    zIndex: 2,
    style: {
      fontSize: 14,
      textAlign: "right",
    },
  },

  {
    id: "hotline",
    type: "text",
    label: "Hotline",
    value: "Hotline: 09474612000",
    x: 794 - 40 - COL_WIDTH,
    y: 24,
    width: COL_WIDTH,
    height: 22,
    visible: true,
    zIndex: 2,
    style: {
      fontSize: 14,
      textAlign: "right",
    },
  },

  {
    id: "email",
    type: "text",
    label: "Email",
    value: "Email: vinh.daodanh@medlatec.com",
    x: 794 - 40 - COL_WIDTH,
    y: 48,
    width: COL_WIDTH,
    height: 22,
    visible: true,
    zIndex: 2,
    style: {
      fontSize: 14,
      textAlign: "right",
    },
  },
];

export const HEADER_TEMPLATE_2 = [
  /* ===== LEFT CONTENT ===== */
  {
    id: "clinic_name",
    type: "text",
    label: "Tên bệnh viện",
    value: "BỆNH VIỆN ĐA KHOA MEDLATEC MEDLATEC ",
    x: 120,
    y: 0,
    width: COL_WIDTH,
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
    x: 120,
    y: 24,
    width: COL_WIDTH,
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
    x: 120,
    y: 48,
    width: COL_WIDTH,
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
    x: 450,
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
    x: 450,
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
    x: 450,
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

export const HEADER_BLOCKS_STORAGE_KEY = "print_header_blocks_draft";

export const mapHeaderInfoToBlocks = (
  headerInfo = {},
  templateBlocks = DEFAULT_HEADER_BLOCKS,
) => {
  return templateBlocks.map((block) => {
    switch (block.id) {
      case "logo":
        return { ...block, value: headerInfo.logo_url || null };

      case "clinic_name":
        return {
          ...block,
          value: headerInfo.clinic_name || block.value,
          style: block.style,
        };

      case "specialty":
        return {
          ...block,
          value: headerInfo.department_name
            ? `Chuyên khoa: ${headerInfo.department_name}`
            : block.value,
          style: block.style,
        };

      case "address":
        return {
          ...block,
          value: headerInfo.address
            ? `Địa chỉ: ${headerInfo.address}`
            : block.value,
          style: block.style,
        };

      case "website":
        return {
          ...block,
          value: headerInfo.website
            ? `Website: ${headerInfo.website}`
            : block.value,
          style: block.style,
        };

      case "hotline":
        return {
          ...block,
          value: headerInfo.phone
            ? `Hotline: ${headerInfo.phone}`
            : block.value,
          style: block.style,
        };

      case "email":
        return {
          ...block,
          value: headerInfo.email ? `Email: ${headerInfo.email}` : block.value,
          style: block.style,
        };

      default:
        return block;
    }
  });
};

export const HEADER_TEMPLATES = {
  1: DEFAULT_HEADER_BLOCKS, // có logo
  2: HEADER_TEMPLATE_2, // không logo
};

export const getHeaderTemplate = (templateCode = 1) => {
  return HEADER_TEMPLATES[templateCode] || DEFAULT_HEADER_BLOCKS;
};
