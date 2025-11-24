export const TUYEN_GIAP_STRUCTURE_OPTIONS = {
  "Tuyến giáp": {
    status: [
      "Không thấy bất thường",
      "Có nhu mô không đều",
      "Có nhân dạng giảm âm",
      "Có nhân dạng tăng âm",
      "Có nhân đặc đồng âm",
      "Có nhân hỗn hợp",
      "Có nang keo",
      "Có nốt vôi hóa",
    ],
    position: ["Thùy phải", "Thùy trái", "Eo"],
    needSize: [
      "Có nhân dạng giảm âm",
      "Có nhân dạng tăng âm",
      "Có nhân đặc đồng âm",
      "Có nhân hỗn hợp",
      "Có nang keo",
      "Có nốt vôi hóa",
    ],
  },

  "Tuyến dưới hàm": {
    status: [
      "Không thấy bất thường",
      "Có phì đại lan tỏa",
      "Có giãn ống tuyến",
      "Có sỏi",
      "Có hạch",
      "Có khối u",
    ],
    position: [
      "Tuyến dưới hàm phải",
      "Tuyến dưới hàm trái",
      "Tuyến dưới hàm hai bên",
    ],
    needSize: [
      "Có phì đại lan tỏa",
      "Có giãn ống tuyến",
      "Có sỏi",
      "Có hạch",
      "Có khối u",
    ],
  },

  "Tuyến mang tai": {
    status: [
      "Không thấy bất thường",
      "Có phì đại lan tỏa",
      "Có giãn ống tuyến",
      "Có sỏi",
      "Có hạch",
      "Có khối u",
      "Có phì đại lan tỏa",
    ],
    position: [
      "Tuyến mang tai phải",
      "Tuyến mang tai trái",
      "Tuyến mang tai hai bên",
    ],
    needSize: [
      "Có phì đại lan tỏa",
      "Có giãn ống tuyến",
      "Có sỏi",
      "Có hạch",
      "Có khối u",
      "Có phì đại lan tỏa",
    ],
  },

  "Cơ và phần mềm": {
    status: [
      "Không thấy bất thường",
      "Có hạch to",
      "Có khối tổ chức",
      "Có khối dịch",
      "Có dị dạng mạch",
      "Có vôi hóa",
    ],
    position: ["Vùng cổ phải", "Vùng cổ trái", "Vùng cổ hai bên"],
    needSize: [
      "Có hạch to",
      "Có khối tổ chức",
      "Có khối dịch",
      "Có dị dạng mạch",
      "Có vôi hóa",
    ],
  },
};

export const THYROID_ULTRASOUND_TEXT = `
Tuyến giáp
- Thùy phải: kích thước bình thường; cấu trúc đồng nhất; không thấy tổn thương dạng nốt hay khối.
- Thùy trái: kích thước bình thường; cấu trúc đồng nhất; không thấy tổn thương dạng nốt hay khối.
- Eo tuyến: kích thước bình thường; cấu trúc đồng nhất; không thấy tổn thương dạng nốt hay khối.

Tuyến nước bọt dưới hàm hai bên
- Kích thước bình thường.
- Nhu mô đồng nhất, không thấy khối khu trú.
- Ống tuyến không giãn, không có sỏi.

Tuyến nước bọt mang tai hai bên
- Kích thước bình thường.
- Nhu mô đồng nhất, không thấy khối khu trú.
- Ống tuyến không giãn, không có sỏi.

Hạch vùng cổ hai bên
- Có một số hạch nhỏ vùng dưới hàm và dưới cằm hai bên.
- Đường kính trước–sau 4–5 mm.
- Hình dạng và cấu trúc hạch bình thường.

Nhận xét khác
- Cơ vùng cổ hai bên: cấu trúc đồng nhất. Không thấy tụ dịch hay khối bất thường.
- Phần mềm dưới da vùng cổ: cấu trúc đồng nhất. Không thấy tụ dịch hay khối bất thường.
`;
