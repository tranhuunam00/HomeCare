export const BUNG_STRUCTURE_OPTIONS = {
  Gan: {
    status: [
      "Không thấy bất thường",
      "Có thoái hóa mỡ lan tỏa",
      "Có nhu mô thô, không đều",
      "Có u máu",
      "Có nang",
      "Có khối u",
      "Có nốt vôi hóa",
      "Có tổn thương",
    ],
    position: ["Gan phải", "Gan trái", "Gan phải và gan trái"],
    needSize: ["Có u máu", "Có nang", "Có khối u"],
  },

  "Đường mật": {
    status: [
      "Không thấy bất thường",
      "Có sỏi đường mật",
      "Có giãn đường mật",
      "Có viêm đường mật",
    ],
    position: ["Gan phải", "Gan trái", "Gan phải và gan trái"],
    needSize: ["Có sỏi đường mật", "Có giãn đường mật", "Có viêm đường mật"],
  },

  "Túi mật": {
    status: ["Không thấy bất thường", "Có sỏi", "Có polyp", "Có khối u"],
    position: ["Cổ túi mật", "Thân túi mật", "Đáy túi mật"],
    needSize: ["Có sỏi", "Có polyp", "Có khối u"],
  },

  Tụy: {
    status: [
      "Không thấy bất thường",
      "Giãn ống tụy",
      "Vôi hóa tụy",
      "Khối u tụy",
      "Nang tụy",
    ],
    position: ["Đầu tụy", "Thân tụy", "Đuôi tụy"],
    needSize: ["Giãn ống tụy", "Vôi hóa tụy", "Khối u tụy", "Nang tụy"],
  },

  Lách: {
    status: ["Không thấy bất thường", "Có nang", "Có vôi hóa", "Có khối u"],
    position: ["1/3 trên lách", "1/3 giữa lách", "1/3 dưới lách"],
    needSize: ["Có nang", "Có vôi hóa", "Có khối u"],
  },

  "Thận phải": {
    status: [
      "Không thấy bất thường",
      "Có sỏi",
      "Có nang",
      "Có khối u",
      "Có nốt vôi hóa",
      "Giãn đài bể thận",
      "Giãn niệu quản",
    ],
    position: ["1/3 trên thận", "1/3 giữa thận", "1/3 dưới thận"],
    needSize: [
      "Có sỏi",
      "Có nang",
      "Có khối u",
      "Có nốt vôi hóa",
      "Giãn đài bể thận",
      "Giãn niệu quản",
    ],
  },

  "Thận trái": {
    status: [
      "Không thấy bất thường",
      "Có sỏi",
      "Có nang",
      "Có khối u",
      "Có nốt vôi hóa",
      "Giãn đài bể thận",
      "Giãn niệu quản",
    ],
    position: ["1/3 trên thận", "1/3 giữa thận", "1/3 dưới thận"],
    needSize: [
      "Có sỏi",
      "Có nang",
      "Có khối u",
      "Có nốt vôi hóa",
      "Giãn đài bể thận",
      "Giãn niệu quản",
    ],
  },

  "Bàng quang": {
    status: ["Không thấy bất thường", "Có sỏi", "Có polyp", "Có khối u"],
    position: ["Bàng quang"],
    needSize: ["Có sỏi", "Có polyp", "Có khối u"],
  },

  "Hố chậu phải": {
    status: [
      "Không thấy bất thường",
      "Có tụ dịch",
      "Có khối u nang",
      "Có khối u đặc",
    ],
    position: ["Hố chậu phải"],
    needSize: ["Có tụ dịch", "Có khối u nang", "Có khối u đặc"],
  },

  "Hố chậu trái": {
    status: [
      "Không thấy bất thường",
      "Có tụ dịch",
      "Có khối u nang",
      "Có khối u đặc",
    ],
    position: ["Hố chậu trái"],
    needSize: ["Có tụ dịch", "Có khối u nang", "Có khối u đặc"],
  },

  "Tiểu khung": {
    status: [
      "Không thấy bất thường",
      "U xơ tử cung",
      "U nang buồng trứng",
      "Nang cổ tử cung",
      "Phì đại tuyến tiền liệt",
    ],
    position: ["Tiểu khung"],
    needSize: [
      "U xơ tử cung",
      "U nang buồng trứng",
      "Nang cổ tử cung",
      "Phì đại tuyến tiền liệt",
    ],
  },
};

export const SONO_CONTENT = {
  "Tuyến giáp và vùng cổ": `
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
  `,

  "Tuyến vú và hố nách": `
Bên phải
- Nhu mô tuyến: cấu trúc đồng nhất. Không thấy khối bất thường.
- Hệ thống ống tuyến vú: không giãn.
- Mô mỡ trước tuyến: cấu trúc đồng nhất.
- Hệ thống dây chằng Cooper: phân bố đồng nhất, không co kéo.
- Cơ thành ngực: cấu trúc đồng nhất, không thấy hình ảnh bất thường.
- Mô mỡ dưới da: cấu trúc đồng nhất.
- Phần mềm hố nách: không có hạch to; không thấy tuyến vú phụ.

Bên trái
- Nhu mô tuyến: cấu trúc đồng nhất. Không thấy khối bất thường.
- Hệ thống ống tuyến vú: không giãn.
- Mô mỡ trước tuyến: cấu trúc đồng nhất.
- Hệ thống dây chằng Cooper: phân bố đồng nhất, không co kéo.
- Cơ thành ngực: cấu trúc đồng nhất, không thấy hình ảnh bất thường.
- Mô mỡ dưới da: cấu trúc đồng nhất.
- Phần mềm hố nách: không có hạch to; không thấy tuyến vú phụ.
  `,

  "Bụng tổng quát": `
- Gan: kích thước bình thường. Nhu mô đồng nhất, không có khối khu trú.
- Đường mật trong gan: không giãn, thành đều. Không thấy sỏi hay cấu trúc bất thường.
- Đường mật ngoài gan: không giãn, thành đều. Không thấy sỏi hay cấu trúc bất thường.
- Túi mật: không giãn, không có sỏi. Thành đều. Xung quanh không có dịch.
- Tụy: kích thước bình thường. Nhu mô đồng nhất, không có khối khu trú. Ống tụy không giãn, không thấy sỏi. Xung quanh tụy không thấy tụ dịch.
- Lách: kích thước bình thường. Nhu mô đồng nhất.
- Thận phải: kích thước bình thường. Nhu mô đồng nhất. Xung quanh thận không tụ dịch. Đài thận và bể thận không giãn, không có sỏi. Niệu quản không giãn.
- Thận trái: kích thước bình thường. Nhu mô đồng nhất. Xung quanh thận không tụ dịch. Đài thận và bể thận không giãn, không có sỏi. Niệu quản không giãn.
- Bàng quang: nước tiểu trong, thành đều, không có sỏi.
- Tuyến tiền liệt: kích thước trong giới hạn bình thường. Nhu mô đồng nhất, không có khối khu trú.
- Hố chậu hai bên: không thấy hình ảnh bất thường.
- Không thấy dịch tự do ở ổ bụng.
  `,
};

export const SONO_CONTENT_IMAGE = {
  "Tuyến giáp và vùng cổ": ["tuyengiap_trai.png", "tuyengiap_phai.png"],
  "Tuyến vú và hố nách": ["vu_trai.png", "vu_phai.png"],
  "Bụng tổng quát": ["bung_trai.png", "bung_phai.png"],
};
