// headerLayout.js
export const DEFAULT_HEADER_BLOCKS = [
  {
    id: "logo",
    type: "image",
    label: "Logo",
    value: null,
    x: 0,
    y: 0,
    width: 120,
    height: 60,
    visible: true,
  },
  {
    id: "clinic_name",
    type: "text",
    label: "Tên phòng khám",
    value: "PHÒNG KHÁM ABC",
    x: 140,
    y: 0,
    width: 400,
    height: 40,
    visible: true,
  },
  {
    id: "specialty",
    type: "text",
    label: "Chuyên khoa",
    value: "Chẩn đoán hình ảnh",
    x: 140,
    y: 45,
    width: 300,
    height: 30,
    visible: true,
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
