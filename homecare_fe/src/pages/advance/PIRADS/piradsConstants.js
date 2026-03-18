export const YES_NO_OPTIONS = [
  { label: "Có", value: true },
  { label: "Không", value: false },
];

export const DWI_ADC_OPTIONS = [
  {
    value: 1,
    label: "Bình thường trên ADC và DWI b cao",
    image: "/product/pirads/DWI_ADC_OPTIONS/1.png",
  },
  {
    value: 2,
    label:
      "Giảm tín hiệu dạng đường thẳng/hình nêm trên ADC và/hoặc tăng tín hiệu dạng đường thẳng/hình nêm trên DWI b cao",
    image: "/product/pirads/DWI_ADC_OPTIONS/2.png",
  },
  {
    value: 3,
    label:
      "Tổn thương khu trú (rõ ràng, khác biệt mô nền) giảm tín hiệu trên ADC và/hoặc tăng tín hiệu khu trú trên DWI b cao (có thể giảm mạnh trên ADC hoặc tăng mạnh trên DWI b cao, nhưng không đồng thời cả hai)",
    image: "/product/pirads/DWI_ADC_OPTIONS/3.png",
  },
  {
    value: 4,
    label:
      "Tổn thương khu trú giảm tín hiệu rõ trên ADC VÀ tăng tín hiệu rõ trên DWI b cao VÀ kích thước lớn nhất < 1,5 cm",
    image: "/product/pirads/DWI_ADC_OPTIONS/4.png",
  },
  {
    value: 5,
    label:
      "Tổn thương khu trú giảm tín hiệu rõ trên ADC VÀ tăng tín hiệu rõ trên DWI b cao VÀ kích thước lớn nhất ≥ 1,5 cm hoặc có xâm lấn ngoài tuyến tiền liệt rõ ràng",
    image: "/product/pirads/DWI_ADC_OPTIONS/5.png",
  },
];
export const T2w_OPTIONS_WITH_PZ = [
  {
    value: 1,
    label: "Tín hiệu tăng đồng nhất (bình thường)",
    image: "/product/pirads/T2w_OPTIONS_WITH_PZ/1.png",
  },
  {
    value: 2,
    label: "Giảm tín hiệu dạng đường thẳng hoặc hình nêm",
    image: "/product/pirads/T2w_OPTIONS_WITH_PZ/2.png",
  },
  {
    value: 3,
    label: "Giảm tín hiệu lan tỏa mức độ nhẹ",
    image: "/product/pirads/T2w_OPTIONS_WITH_PZ/3.png",
  },
  {
    value: 4,
    label: "Tín hiệu không đồng nhất",
    image: "/product/pirads/T2w_OPTIONS_WITH_PZ/4.png",
  },
  {
    value: 5,
    label: "Giảm tín hiệu mức độ trung bình, dạng tròn, không có ranh giới rõ",
    image: "/product/pirads/T2w_OPTIONS_WITH_PZ/5.png",
  },
  {
    value: 6,
    label:
      "Tổn thương giảm tín hiệu mức độ trung bình, đồng nhất, có ranh giới rõ, khu trú trong tuyến tiền liệt VÀ kích thước < 1,5 cm",
    image: "/product/pirads/T2w_OPTIONS_WITH_PZ/6.png",
  },
  {
    value: 7,
    label:
      "Tổn thương giảm tín hiệu mức độ trung bình, đồng nhất, có ranh giới rõ, khu trú trong tuyến tiền liệt VÀ kích thước ≥ 1,5 cm hoặc có xâm lấn ngoài tuyến rõ ràng",
    image: "/product/pirads/T2w_OPTIONS_WITH_PZ/7.png",
  },
  {
    value: 8,
    label: "Không thuộc các trường hợp trên",
    image: "/product/pirads/none.png",
  },
];

export const DCE_OPTIONS = [
  {
    value: 1,
    label: "Không có ngấm thuốc sớm hoặc ngấm thuốc đồng thời",
    image: "/product/pirads/DCE_OPTIONS/1.png",
  },
  {
    value: 2,
    label:
      "Ngấm thuốc lan tỏa đa ổ KHÔNG tương ứng với tổn thương khu trú trên T2W và/hoặc DWI",
    image: "/product/pirads/DCE_OPTIONS/2.png",
  },
  {
    value: 3,
    label:
      "Ngấm thuốc khu trú tương ứng với tổn thương có đặc điểm của tăng sản lành tính tuyến tiền liệt (BPH) trên T2WI (bao gồm cả BPH lồi vào vùng ngoại vi)",
    image: "/product/pirads/DCE_OPTIONS/3.png",
  },
  {
    value: 4,
    label:
      "Ngấm thuốc khu trú, sớm hơn hoặc đồng thời với mô tuyến tiền liệt bình thường xung quanh VÀ tương ứng với tổn thương nghi ngờ trên T2W và/hoặc DWI",
    image: "/product/pirads/DCE_OPTIONS/4.png",
  },
];

export const T2w_OPTIONS_WITH_TZ = [
  {
    value: 1,
    label: "Vùng chuyển tiếp bình thường",
    image: "/product/pirads/T2w_OPTIONS_WITH_TZ/1.png",
  },
  {
    value: 2,
    label: "Nhân điển hình (tròn, bao rõ hoàn toàn)",
    image: "/product/pirads/T2w_OPTIONS_WITH_TZ/2.png",
  },
  {
    value: 3,
    label:
      "Nhân không điển hình (đồng nhất, có ranh giới rõ nhưng không có bao)",
    image: "/product/pirads/T2w_OPTIONS_WITH_TZ/3.png",
  },
  {
    value: 4,
    label: "Nhân có bao một phần",
    image: "/product/pirads/T2w_OPTIONS_WITH_TZ/4.png",
  },
  {
    value: 5,
    label: "Vùng giảm tín hiệu nhẹ, đồng nhất nằm giữa các nhân",
    image: "/product/pirads/T2w_OPTIONS_WITH_TZ/5.png",
  },
  {
    value: 6,
    label: "Tín hiệu không đồng nhất, bờ không rõ",
    image: "/product/pirads/T2w_OPTIONS_WITH_TZ/6.png",
  },
  {
    value: 7,
    label:
      "Tổn thương dạng thấu kính hoặc không có ranh giới rõ, đồng nhất, giảm tín hiệu mức độ trung bình VÀ kích thước < 1,5 cm",
    image: "/product/pirads/T2w_OPTIONS_WITH_TZ/7.png",
  },
  {
    value: 8,
    label:
      "Như trên nhưng kích thước ≥ 1,5 cm hoặc có xâm lấn ngoài tuyến rõ ràng",
    image: "/product/pirads/T2w_OPTIONS_WITH_TZ/8.png",
  },
  {
    value: 9,
    label: "Không thuộc các trường hợp trên",
    image: "/product/pirads/none.png",
  },
];

export const getPiradsScore = (values) => {
  console.log("values", values);

  const { zone, dwiScore, t2Score_pz, t2Score_tz, dwiAdequate, dceScore } =
    values;

  if (dwiAdequate == true && zone === "pz") {
    return dwiScore;
  }
  if (dwiAdequate == true && zone === "tz") {
    if (dwiScore == 1 || dwiScore == 2 || dwiScore == 3) {
      switch (t2Score_tz) {
        case 1:
          return 1;
        case 2:
          return 1;
        case 3:
          return 2;
        case 4:
          return 2;
        case 5:
          return 2;
        case 6:
          return 3;
        case 7:
          return 4;
        case 8:
          return 5;
        case 9:
          return 3;
      }
    }
    if (dwiScore == 4) {
      switch (t2Score_tz) {
        case 1:
          return 1;
        case 2:
          return 1;
        case 3:
          return 3;
        case 4:
          return 3;
        case 5:
          return 3;
        case 6:
          return 3;
        case 7:
          return 4;
        case 8:
          return 5;
        case 9:
          return 3;
      }
    }
    if (dwiScore == 5) {
      switch (t2Score_tz) {
        case 1:
          return 1;
        case 2:
          return 1;
        case 3:
          return 3;
        case 4:
          return 3;
        case 5:
          return 3;
        case 6:
          return 4;
        case 7:
          return 4;
        case 8:
          return 5;
        case 9:
          return 4;
      }
    }
  }
  if (dwiAdequate == false && zone === "pz") {
    if (dceScore == 1 || dceScore == 2 || dceScore == 3) {
      switch (t2Score_pz) {
        case 1:
          return 1;
        case 2:
          return 2;
        case 3:
          return 2;
        case 4:
          return 3;
        case 5:
          return 3;
        case 6:
          return 4;
        case 7:
          return 5;
        case 8:
          return 3;
      }
    }
    if (dceScore == 4) {
      switch (t2Score_pz) {
        case 1:
          return 1;
        case 2:
          return 2;
        case 3:
          return 2;
        case 4:
          return 4;
        case 5:
          return 4;
        case 6:
          return 4;
        case 7:
          return 5;
        case 8:
          return 4;
      }
    }
  }
  if (dwiAdequate == false && zone === "tz") {
    if (dceScore == 1 || dceScore == 2 || dceScore == 3) {
      switch (t2Score_tz) {
        case 1:
          return 1;
        case 2:
          return 1;
        case 3:
          return 2;
        case 4:
          return 2;
        case 5:
          return 2;
        case 6:
          return 3;
        case 7:
          return 4;
        case 8:
          return 5;
        case 9:
          return 3;
      }
    }
    if (dceScore == 4) {
      switch (t2Score_tz) {
        case 1:
          return 1;
        case 2:
          return 1;
        case 3:
          return 2;
        case 4:
          return 2;
        case 5:
          return 2;
        case 6:
          return 4;
        case 7:
          return 4;
        case 8:
          return 5;
        case 9:
          return 3;
      }
    }
  }
  return null;
};

export const PIRADS_RESULT = {
  1: {
    title: "PI-RADS 1",
    desc: "Rất ít khả năng có ung thư tuyến tiền liệt có ý nghĩa lâm sàng.",
  },
  2: {
    title: "PI-RADS 2",
    desc: "Ít khả năng có ung thư tuyến tiền liệt có ý nghĩa lâm sàng.",
  },
  3: {
    title: "PI-RADS 3",
    desc: "Chưa xác định (không rõ ràng) khả năng có ung thư tuyến tiền liệt có ý nghĩa lâm sàng.",
  },
  4: {
    title: "PI-RADS 4",
    desc: "Có khả năng có ung thư tuyến tiền liệt có ý nghĩa lâm sàng.",
  },
  5: {
    title: "PI-RADS 5",
    desc: "Rất có khả năng có ung thư tuyến tiền liệt có ý nghĩa lâm sàng.",
  },
};
