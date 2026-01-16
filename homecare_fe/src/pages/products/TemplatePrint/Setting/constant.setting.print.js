export const DEFAULT_HEADER_BLOCKS = [
  /* ===== LOGO ===== */
  {
    id: "logo",
    type: "image",
    label: "Logo",
    value: null,
    x: 20,
    y: 0,
    width: 83,
    height: 83,
    visible: true,
    zIndex: 1,
  },

  /* ===== LEFT CONTENT ===== */
  {
    id: "clinic_name",
    type: "text",
    label: "Tên bệnh viện",
    value: "BỆNH VIỆN ĐA KHOA\nMEDLATEC",
    x: 80,
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
    x: 80,
    y: 15,
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
    x: 80,
    y: 30,
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
    x: 250,
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
    x: 250,
    y: 15,
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
    x: 250,
    y: 30,
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
