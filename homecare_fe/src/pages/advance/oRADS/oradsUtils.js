// oradsUtils.js
import { RISK_LABEL } from "./oradsConstants";

/**
 * Trả về gói kết quả O-RADS chuẩn hóa
 */
const pack = (orads, risk, ppv, rec) => ({ orads, risk, ppv, rec });
const empty = () => ({ orads: null, risk: "", ppv: "", rec: "" });

/**
 * Tính O-RADS cho cả MRI và US
 * @param {Object} input - toàn bộ state của form
 * @returns {{orads:number|null, risk:string, ppv:string, rec:string}}
 */
export function computeORADS(input = {}) {
  const {
    modality,

    // ===== MRI =====
    peritoneal,
    abnormality,
    cyst_structure,
    cyst_contents,
    cyst_small_premenop,
    multiloc_has_fat,

    // cystic + solid component
    solid_dark_t2dwi, // boolean|null
    dce_curve, // 'low'|'intermediate'|'high'|'not_available'|null
    solid_large_lipid, // boolean|null
    non_dce_30s_enh, // 'lte_myometrium'|'gt_myometrium'|null

    // dilated tube
    tube_wall_thickness, // 'thin'|'thick'|null
    tube_contents, // 'simple_fluid'|'non_simple_fluid'|null

    // ===== US (O-RADS: US) =====
    usAdequate, // boolean|null
    usType, // 'no_lesions'|'physiologic_cyst'|'typical_extraovarian'|'typical_benign_ovarian'|'other_ovarian'|null
    usBenignType, // 'hemorrhagic'|'dermoid'|'endometrioma'|null
    usMaxDiameter, // number (cm) | null

    // US → Other ovarian lesions (cystic WITHOUT solid) – các nhánh bạn yêu cầu
    usOtherComposition, // 'cystic_no_solid'|'cystic_with_solid'|'solid_or_solid_appearing'|null
    usOtherChambers, // 'uni'|'bi'|'multi'|null
    usOtherContour, // 'smooth'|'irregular'|null
    usOtherEchoSept, // 'internal_echoes'|'incomplete_septations'|'both'|'neither'|null
    usOtherMenopause, // 'pre'|'post'|null
    usColorScore, // 1|2|3|4|null
  } = input;

  // =========================
  // ======= MRI FLOW ========
  // =========================
  if (modality === "mri") {
    // 1) Peritoneal/omental nodularity (+/- ascites) → O-RADS 5
    if (peritoneal === true) {
      return pack(
        5,
        RISK_LABEL[5],
        "~90%",
        "Nghi ngờ cao ác tính. Hội chẩn phụ khoa/ung bướu, đánh giá giai đoạn và lập kế hoạch điều trị.",
      );
    }
    if (peritoneal !== false) return empty();

    // 2) Abnormality branches
    if (abnormality === "cystic") {
      // 2.1 Unilocular WITHOUT wall enhancement
      if (cyst_structure === "uni_no_enh") {
        if (["simple", "hemorrhagic"].includes(cyst_contents)) {
          if (cyst_small_premenop === true) {
            return pack(
              1,
              RISK_LABEL[1],
              "Not-applicable",
              "Bình thường. Theo dõi lâm sàng.",
            );
          }
          if (cyst_small_premenop === false) {
            return pack(
              2,
              RISK_LABEL[2],
              "<0.5%",
              "Gần như chắc chắn lành tính. Theo dõi định kỳ theo triệu chứng/kích thước.",
            );
          }
          return empty();
        }
        if (["endometrial", "protein_mucin", "lipid"].includes(cyst_contents)) {
          return pack(
            2,
            RISK_LABEL[2],
            "<0.5%",
            "Gần như chắc chắn lành tính. Theo dõi định kỳ.",
          );
        }
        return empty();
      }

      // 2.2 Unilocular WITH smooth wall enhancement
      if (cyst_structure === "uni_smooth_enh") {
        const map = {
          simple: { orads: 2, ppv: "<0.5%" },
          endometrial: { orads: 2, ppv: "<0.5%" },
          lipid: { orads: 2, ppv: "<0.5%" },
          hemorrhagic: { orads: 3, ppv: "~5%" },
          protein_mucin: { orads: 3, ppv: "~5%" },
        };
        const m = map[cyst_contents];
        if (!m) return empty();
        return pack(
          m.orads,
          RISK_LABEL[m.orads],
          m.ppv,
          m.orads === 2
            ? "Gần như chắc chắn lành tính. Theo dõi định kỳ."
            : "Nguy cơ thấp. Theo dõi sát hoặc cân nhắc can thiệp tùy triệu chứng/kích thước.",
        );
      }

      // 2.3 Multilocular
      if (cyst_structure === "multilocular") {
        if (multiloc_has_fat === true) {
          return pack(
            2,
            RISK_LABEL[2],
            "<0.5%",
            "Có mỡ → nhiều khả năng lành tính. Theo dõi định kỳ.",
          );
        }
        if (multiloc_has_fat === false) {
          return pack(
            3,
            RISK_LABEL[3],
            "~5%",
            "Nguy cơ thấp. Theo dõi sát/đánh giá thêm tuỳ lâm sàng.",
          );
        }
        return empty();
      }
    }

    if (abnormality === "cystic_solid" || abnormality == "solid") {
      // Solid tissue Dark T2 & Dark DWI → O-RADS 2
      if (solid_dark_t2dwi === true) {
        return pack(
          2,
          RISK_LABEL[2],
          "<0.5%",
          "Gần như chắc chắn là lành tính (T2 tối và DWI tối). Theo dõi định kỳ.",
        );
      }
      if (solid_dark_t2dwi === false) {
        if (!dce_curve) return empty();

        if (dce_curve === "low") {
          if (solid_large_lipid === true) {
            return pack(
              4,
              RISK_LABEL[4],
              "~50%",
              "Nguy cơ trung gian. Tham vấn chuyên khoa; xem xét phẫu thuật/đánh giá thêm.",
            );
          }
          if (solid_large_lipid === false) {
            return pack(
              3,
              RISK_LABEL[3],
              "~5%",
              "Nguy cơ thấp. Theo dõi sát hoặc đánh giá thêm tuỳ lâm sàng.",
            );
          }
          return empty();
        }

        if (dce_curve === "intermediate") {
          return pack(
            4,
            RISK_LABEL[4],
            "~50%",
            "Nguy cơ trung gian. Tham vấn chuyên khoa; xem xét can thiệp.",
          );
        }

        if (dce_curve === "high") {
          return pack(
            5,
            RISK_LABEL[5],
            "~90%",
            "Nguy cơ cao. Xử trí theo hướng ác tính; hội chẩn đa chuyên khoa.",
          );
        }

        if (dce_curve === "not_available") {
          if (non_dce_30s_enh === "lte_myometrium") {
            return pack(
              4,
              RISK_LABEL[4],
              "~50%",
              "Nguy cơ trung gian. Tham vấn chuyên khoa; xem xét can thiệp.",
            );
          }
          if (non_dce_30s_enh === "gt_myometrium") {
            return pack(
              5,
              RISK_LABEL[5],
              "~90%",
              "Nguy cơ cao. Xử trí theo hướng ác tính; hội chẩn đa chuyên khoa.",
            );
          }
          return empty();
        }
      }
      return empty();
    }

    if (abnormality === "dilated_tube") {
      if (!tube_wall_thickness) return empty();
      if (tube_wall_thickness === "thick") {
        return pack(
          3,
          RISK_LABEL[3],
          "~5%",
          "Low risk. Theo dõi sát/đánh giá thêm theo lâm sàng.",
        );
      }
      if (tube_wall_thickness === "thin") {
        if (!tube_contents) return empty();
        if (tube_contents === "simple_fluid") {
          return pack(
            2,
            RISK_LABEL[2],
            "<0.5%",
            "Gần như chắc chắn là lành tính. Theo dõi định kỳ.",
          );
        }
        if (tube_contents === "non_simple_fluid") {
          return pack(
            3,
            RISK_LABEL[3],
            "~5%",
            "Rủi ro thấp. Theo dõi sát hoặc đánh giá thêm.",
          );
        }
      }
      return empty();
    }

    if (abnormality === "para_ovarian") {
      return pack(
        2,
        RISK_LABEL[2],
        "<0.5%",
        "Gần như chắc chắn là lành tính. Theo dõi theo triệu chứng.",
      );
    }
    if (abnormality === "solid") {
      return pack(
        5,
        RISK_LABEL[5],
        "~90%",
        "Nghi ngờ cao ác tính. Hội chẩn chuyên khoa.",
      );
    }
    if (abnormality === "none") {
      return pack(1, RISK_LABEL[1], "Không áp dụng", "Bình thường.");
    }

    return empty();
  }

  // =========================
  // ======== US FLOW ========
  // =========================
  if (modality === "us") {
    // Adequacy
    if (usAdequate === false) {
      return pack(
        0,
        "Đánh giá không đầy đủ",
        "",
        "Lặp lại nghiên cứu siêu âm hoặc MRI",
      );
    }
    if (usAdequate !== true) return empty();

    // Loại tổn thương
    if (usType === "no_lesions" || usType === "physiologic_cyst") {
      return pack(1, "Bình thường", "Không áp dụng", "Không có");
    }

    if (usType === "typical_extraovarian") {
      return pack(
        2,
        "Gần như chắc chắn là lành tính (<1% rủi ro ác tính)",
        "<1%",
        "Đề xuất:\nChụp ảnh:\nKhông cần chụp thêm\nLâm sàng:\nChuyển viện cho bác sĩ phụ khoa khi cần thiết cho Hydrosalpinx và Nang bao quy đầu",
      );
    }

    if (usType === "typical_benign_ovarian") {
      if (!usBenignType || usMaxDiameter == null) return empty();
      const size = Number(usMaxDiameter);
      const ATT =
        "Lưu ý:\n\nCổ trướng ± các nốt phúc mạc, nếu không do các nguyên nhân ác tính hoặc lành tính khác, sẽ nâng phân loại các tổn thương O-RADS 3 và O-RADS 4 lên O-RADS 5.";

      const OR2 = (rec) =>
        pack(
          2,
          "Gần như chắc chắn là lành tính (<1% rủi ro ác tính)",
          "<1%",
          rec,
        );
      const OR3 = (rec) =>
        pack(3, "Rủi ro thấp (1–10%)", "1–10%", `${ATT}\n\n${rec}`);

      if (usBenignType === "hemorrhagic") {
        return size < 10
          ? OR2(
              "\n\nChẩn đoán hình ảnh:\n• Tiền mãn kinh:\n  • ≤5 cm: Không cần theo dõi\n  • >5 cm nhưng <10 cm: Siêu âm theo dõi sau 2–3 tháng\n• Hậu mãn kinh sớm (<5 năm):\n  • <10 cm, các lựa chọn: Siêu âm theo dõi sau 2–3 tháng / Siêu âm bởi bác sĩ chuyên khoa / MRI (kèm điểm O-RADS MRI)\n• Hậu mãn kinh muộn (≥5 năm): Không nên xảy ra; cần phân loại lại bằng các mô tả khác trong hệ thống thuật ngữ.\nLâm sàng:\nChuyển khám bác sĩ phụ khoa khi cần",
            )
          : OR3(
              "\nChẩn đoán hình ảnh:\n• Nếu không được phẫu thuật cắt bỏ, cân nhắc siêu âm theo dõi trong vòng 6 tháng*\n• Nếu là tổn thương đặc, có thể cân nhắc siêu âm bởi chuyên gia (nếu có) hoặc MRI (kèm điểm O-RADS MRI)**\nLâm sàng:\nChuyển khám bác sĩ phụ khoa khi cần",
            );
      }

      if (usBenignType === "dermoid") {
        return size < 10
          ? OR2(
              "\nChẩn đoán hình ảnh:\n• ≤3 cm: Có thể cân nhắc siêu âm theo dõi sau 12 tháng*\n• >3 cm nhưng <10 cm: Nếu không được phẫu thuật cắt bỏ, siêu âm theo dõi sau 12 tháng*\nLâm sàng:\nChuyển khám bác sĩ phụ khoa khi cần\n* Hiện có ít bằng chứng để xác định nhu cầu, thời gian tối ưu hoặc khoảng cách theo dõi. Nếu ổn định, cân nhắc siêu âm theo dõi sau 24 tháng kể từ lần khám ban đầu, sau đó theo chỉ định lâm sàng.",
            )
          : OR3(
              "\nChẩn đoán hình ảnh:\n• Nếu không được phẫu thuật cắt bỏ, cân nhắc siêu âm theo dõi trong vòng 6 tháng*\n• Nếu là tổn thương đặc, có thể cân nhắc siêu âm bởi chuyên gia (nếu có) hoặc MRI (kèm điểm O-RADS MRI)**\nLâm sàng:\nChuyển khám bác sĩ phụ khoa khi cần\n** MRI có tiêm thuốc tương phản có độ đặc hiệu cao hơn đối với các tổn thương đặc và các tổn thương dạng nang có thành phần đặc.",
            );
      }

      if (usBenignType === "endometrioma") {
        return size < 10
          ? OR2(
              "\nChẩn đoán hình ảnh:\n• Tiền mãn kinh: <10 cm → Nếu không được phẫu thuật cắt bỏ, siêu âm theo dõi sau 12 tháng*\n• Hậu mãn kinh: <10 cm và là lần khám đầu, các lựa chọn: Siêu âm theo dõi sau 2–3 tháng / Siêu âm bởi chuyên gia / MRI (kèm điểm O-RADS MRI). Sau đó nếu không phẫu thuật, siêu âm theo dõi sau 12 tháng*\nLâm sàng:\nChuyển khám bác sĩ phụ khoa khi cần\n* Nguy cơ tăng ở phụ nữ sau mãn kinh hoặc khi tổn thương tồn tại >10 năm.",
            )
          : OR3(
              "\nChẩn đoán hình ảnh:\n• Nếu không được phẫu thuật cắt bỏ, cân nhắc siêu âm theo dõi trong vòng 6 tháng*\n• Nếu là tổn thương đặc, có thể cân nhắc siêu âm bởi chuyên gia (nếu có) hoặc MRI (kèm điểm O-RADS MRI score)**\nLâm sàng:\nChuyển khám bác sĩ phụ khoa khi cần",
            );
      }

      return empty();
    }

    // ========== Other ovarian lesions (triển khai 'cystic WITHOUT solid') ==========
    // ========== Other ovarian lesions ==========
    if (usType === "other_ovarian") {
      if (!usOtherComposition || usMaxDiameter == null) return empty();
      const size = Number(usMaxDiameter);
      const ATT =
        "Lưu ý:\n\nCổ trướng ± các nốt phúc mạc, nếu không do các nguyên nhân ác tính hoặc không ác tính khác, sẽ nâng các tổn thương O-RADS 3 và 4 lên O-RADS 5. Cần xem xét các nguyên nhân khác gây cổ trướng trong các phân loại O-RADS 1 và 2.";

      const OR2_6M = pack(
        2,
        "Hầu như chắc chắn lành tính (<1% rủi ro ác tính)",
        "<1%",
        "Siêu âm theo dõi sau 6 tháng*. Xử trí lâm sàng với bác sĩ phụ khoa khi cần.",
      );

      const OR2_6M_NONE = pack(
        2,
        "Hầu như chắc chắn lành tính (<1% rủi ro ác tính)",
        "<1%",
        "",
      );

      const OR2_12M = pack(
        2,
        "Hầu như chắc chắn lành tính (<1% rủi ro ác tính)",
        "<1%",
        "Siêu âm theo dõi sau 12 tháng*. Xử trí lâm sàng với bác sĩ phụ khoa khi cần.",
      );
      const OR3 = pack(
        3,
        "Nguy cơ ác tính thấp (1–10%)",
        "1–10%",
        ATT +
          "\nChẩn đoán hình ảnh:\n• Nếu không được phẫu thuật cắt bỏ, cân nhắc siêu âm theo dõi trong vòng 6 tháng*\n• Nếu là tổn thương đặc, có thể cân nhắc siêu âm bởi chuyên gia hoặc MRI (kèm điểm O-RADS MRI)**\nLâm sàng:\nChuyển khám bác sĩ phụ khoa khi cần",
      );
      const OR4 = pack(
        4,
        "Nguy cơ ác tính trung bình (10–50%)",
        "10–50%",
        ATT +
          "\nChẩn đoán hình ảnh:\n• Siêu âm bởi chuyên gia (nếu có) hoặc\n• MRI (kèm điểm O–RADS MRI)* hoặc\n• Theo phác đồ của bác sĩ ung thư phụ khoa\nLâm sàng:\nBác sĩ phụ khoa phối hợp tư vấn với bác sĩ ung thư phụ khoa hoặc do bác sĩ ung thư phụ khoa trực tiếp quản lý",
      );
      const OR5 = pack(
        5,
        "Nguy cơ ác tính cao (≥50%)",
        "≥50%",
        "\nChẩn đoán hình ảnh:\nTheo phác đồ của bác sĩ ung thư phụ khoa\nLâm sàng:\nBác sĩ ung thư phụ khoa",
      );

      if (usOtherComposition === "cystic_no_solid") {
        if (!usOtherChambers || !usOtherContour) return empty();

        // >= 10 cm
        if (size >= 10) {
          if (usOtherChambers === "multi") {
            return OR4;
          }
          if (usOtherChambers === "bi") {
            return usOtherContour === "smooth" ? OR3 : OR4;
          }
          return OR3;
        }

        // < 10 cm
        if (usOtherChambers === "uni") {
          // NEW: Irregular => ORADS 3 (không cần echoes/menopause)
          if (usOtherContour === "irregular") return OR3;

          // smooth => hỏi echoes/septations -> ORADS 2
          if (!usOtherEchoSept) return empty();
          if (
            ["internal_echoes", "incomplete_septations", "both"].includes(
              usOtherEchoSept,
            )
          ) {
            if (usOtherMenopause == "pre") {
              return OR2_6M_NONE;
            }
            return OR2_12M;
          }
          return OR2_6M_NONE;
        }

        if (usOtherChambers === "bi") {
          return usOtherContour === "smooth" ? OR2_6M : OR4;
        }

        if (usOtherChambers === "multi") {
          if (usOtherContour === "irregular") return OR4;
          if (!usColorScore) return empty();
          return usColorScore === 4 ? OR4 : OR3;
        }

        return empty();
      }

      // --- B) Cystic WITH solid component(s) ---
      if (usOtherComposition === "cystic_with_solid") {
        if (!usOtherChambers) return empty();

        // Unilocular -> hỏi số papillary
        if (usOtherChambers === "uni") {
          if (!input.usPapillaryCount) return empty();
          if (input.usPapillaryCount === "ge4") return OR5;
          // "1_3" hoặc "non_papillary"
          return OR4;
        }

        // Bi- hoặc Multilocular -> hỏi Color score (bất kể size)
        if (usOtherChambers === "bi" || usOtherChambers === "multi") {
          if (!usColorScore) return empty();
          return usColorScore === 1 || usColorScore === 2 ? OR4 : OR5; // 3-4 -> OR5
        }

        return empty();
      }

      // --- C) Solid / Solid-appearing (≥80% solid) ---
      if (usOtherComposition === "solid_or_solid_appearing") {
        if (!usOtherContour) return empty();

        // Irregular contour -> ORADS 5
        if (usOtherContour === "irregular") return OR5;

        // Smooth contour -> hỏi shadowing + color score
        if (input.usShadowing === undefined || input.usShadowing === null)
          return empty();
        if (!usColorScore) return empty();

        if (input.usShadowing === true) {
          // shadowing YES: 1-3 -> OR3; 4 -> OR5
          return usColorScore === 4 ? OR5 : OR3;
        }
        // shadowing NO: 1 -> OR3; 2/3 -> OR4; 4 -> OR5
        if (usColorScore === 1) return OR3;
        if (usColorScore === 2 || usColorScore === 3) return OR4;
        return OR5;
      }

      // Các composition khác chưa hỗ trợ
      return empty();
    }

    // (Các nhánh US khác chưa hỗ trợ)
    return empty();
  }

  // Nếu không chọn modality hợp lệ
  return empty();
}
