export const DEFAULT_HEADER_BLOCKS = [
  /* ===== LOGO ===== */
  {
    id: "logo",
    type: "image",
    label: "Logo",
    value: null,
    x: 60,
    y: 0,
    width: 70,
    height: 70,
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

export const mapHeaderInfoToBlocks = (headerInfo, blocks) => {
  return blocks.map((block) => {
    return {
      ...block,
      value: headerInfo?.[block.id] ?? block.value,
    };
  });
};

export const HEADER_BLOCKS_STORAGE_KEY = "print_header_blocks_draft";
