// oradsUtils.js
import { RISK_LABEL } from "./oradsConstants";

/**
 * Helper
 */
const pack = (orads, risk, ppv, rec) => ({ orads, risk, ppv, rec });
const empty = () => ({ orads: null, risk: "", ppv: "", rec: "" });

/**
 * computeORADS(input)
 * Trả về { orads, risk, ppv, rec }
 *
 * input:
 *  - modality: 'mri'
 *  - peritoneal: true | false | null
 *  - abnormality:
 *      'cystic' | 'cystic_solid' | 'dilated_tube' | 'para_ovarian' | 'solid' | 'none'
 *
 *  // CYSTIC (không có solid component)
 *  - cyst_structure: 'uni_no_enh' | 'uni_smooth_enh' | 'multilocular' | null
 *  - cyst_contents: 'simple' | 'hemorrhagic' | 'endometrial' | 'protein_mucin' | 'lipid' | null
 *  - cyst_small_premenop: boolean|null            // chỉ dùng khi uni_no_enh + (simple|hemorrhagic)
 *  - multiloc_has_fat: boolean|null               // chỉ dùng khi multilocular
 *
 *  // CYSTIC_SOLID
 *  - solid_dark_t2dwi: boolean|null               // Dark T2 & Dark DWI ?
 *  - dce_curve: 'low' | 'intermediate' | 'high' | 'not_available' | null
 *  - solid_large_lipid: boolean|null              // chỉ khi dce_curve='low'
 *  - non_dce_30s_enh: 'lte_myometrium' | 'gt_myometrium' | null   // chỉ khi dce_curve='not_available'
 *
 *  // DILATED TUBE
 *  - tube_wall_thickness: 'thin' | 'thick' | null
 *  - tube_contents: 'simple_fluid' | 'non_simple_fluid' | null     // chỉ khi thin
 */
export function computeORADS(input = {}) {
  const {
    modality,
    peritoneal,
    abnormality,

    // cystic (non-solid)
    cyst_structure,
    cyst_contents,
    cyst_small_premenop,
    multiloc_has_fat,

    // cystic_solid
    solid_dark_t2dwi,
    dce_curve,
    solid_large_lipid,
    non_dce_30s_enh,

    // dilated tube
    tube_wall_thickness,
    tube_contents,
  } = input;

  // Chỉ áp dụng cho MRI
  if (modality !== "mri") return empty();

  // 1) Peritoneal / omental nodularity (+/− ascites) → O-RADS 5
  if (peritoneal === true) {
    return pack(
      5,
      RISK_LABEL[5],
      "~90%",
      "Nghi ngờ cao ác tính. Hội chẩn phụ khoa/ung bướu, đánh giá giai đoạn và lập kế hoạch điều trị."
    );
  }
  if (peritoneal !== false) return empty(); // chưa chọn Yes/No

  // 2) Không có peritoneal → theo abnormality
  // =====================================================================
  // A. CYSTIC (không có solid component)
  if (abnormality === "cystic") {
    // A1) Unilocular, WITHOUT wall enhancement
    if (cyst_structure === "uni_no_enh") {
      if (["simple", "hemorrhagic"].includes(cyst_contents)) {
        if (cyst_small_premenop === true) {
          return pack(
            1,
            RISK_LABEL[1],
            "Not-applicable",
            "Bình thường. Theo dõi lâm sàng."
          );
        }
        if (cyst_small_premenop === false) {
          return pack(
            2,
            RISK_LABEL[2],
            "<0.5%",
            "Gần như chắc chắn lành tính. Theo dõi định kỳ theo triệu chứng/kích thước."
          );
        }
        return empty(); // cần trả lời câu phụ (≤3cm & tiền mãn kinh?)
      }

      if (["endometrial", "protein_mucin", "lipid"].includes(cyst_contents)) {
        return pack(
          2,
          RISK_LABEL[2],
          "<0.5%",
          "Gần như chắc chắn lành tính. Theo dõi định kỳ."
        );
      }
      return empty();
    }

    // A2) Unilocular, WITH smooth wall enhancement
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
          : "Nguy cơ thấp. Theo dõi sát hoặc cân nhắc can thiệp tùy triệu chứng/kích thước."
      );
    }

    // A3) Multilocular
    if (cyst_structure === "multilocular") {
      if (multiloc_has_fat === true) {
        return pack(
          2,
          RISK_LABEL[2],
          "<0.5%",
          "Có mỡ → nhiều khả năng lành tính. Theo dõi định kỳ."
        );
      }
      if (multiloc_has_fat === false) {
        return pack(
          3,
          RISK_LABEL[3],
          "~5%",
          "Nguy cơ thấp. Theo dõi sát/đánh giá thêm tuỳ lâm sàng."
        );
      }
      return empty();
    }

    return empty();
  }

  // B. CYSTIC LESION WITH A SOLID* COMPONENT
  if (abnormality === "cystic_solid" || abnormality == "solid") {
    // B1) Dark T2 & Dark DWI?
    if (solid_dark_t2dwi === true) {
      return pack(
        2,
        RISK_LABEL[2],
        "<0.5%",
        "Almost certainly benign (Dark T2 & Dark DWI). Theo dõi định kỳ."
      );
    }
    if (solid_dark_t2dwi === false) {
      // B2) DCE curve?
      if (!dce_curve) return empty();

      if (dce_curve === "low") {
        // B2a) Hỏi thêm large volume enhancing with lipid?
        if (solid_large_lipid === true) {
          return pack(
            4,
            RISK_LABEL[4],
            "~50%",
            "Nguy cơ trung gian. Tham vấn chuyên khoa; xem xét phẫu thuật/đánh giá thêm."
          );
        }
        if (solid_large_lipid === false) {
          return pack(
            3,
            RISK_LABEL[3],
            "~5%",
            "Nguy cơ thấp. Theo dõi sát hoặc đánh giá thêm tuỳ lâm sàng."
          );
        }
        return empty();
      }

      if (dce_curve === "intermediate") {
        return pack(
          4,
          RISK_LABEL[4],
          "~50%",
          "Nguy cơ trung gian. Tham vấn chuyên khoa; xem xét phẫu thuật/đánh giá thêm."
        );
      }

      if (dce_curve === "high") {
        return pack(
          5,
          RISK_LABEL[5],
          "~90%",
          "Nguy cơ cao. Tham vấn ung bướu/phẫu thuật; xử trí theo hướng ác tính."
        );
      }

      if (dce_curve === "not_available") {
        // B2b) Không có DCE → dùng non-DCE 30–40s
        if (non_dce_30s_enh === "lte_myometrium") {
          return pack(
            4,
            RISK_LABEL[4],
            "~50%",
            "Nguy cơ trung gian. Tham vấn chuyên khoa; xem xét can thiệp."
          );
        }
        if (non_dce_30s_enh === "gt_myometrium") {
          return pack(
            5,
            RISK_LABEL[5],
            "~90%",
            "Nguy cơ cao. Xử trí theo hướng ác tính; hội chẩn đa chuyên khoa."
          );
        }
        return empty();
      }
    }
    return empty();
  }

  // C. DILATED FALLOPIAN TUBE (without a solid lesion)
  if (abnormality === "dilated_tube") {
    if (!tube_wall_thickness) return empty();

    if (tube_wall_thickness === "thick") {
      // Thick (>3mm)
      return pack(
        3,
        RISK_LABEL[3],
        "~5%",
        "Low risk. Theo dõi sát/đánh giá thêm theo lâm sàng."
      );
    }

    if (tube_wall_thickness === "thin") {
      // Thin (<3mm) → hỏi contents
      if (!tube_contents) return empty();

      if (tube_contents === "simple_fluid") {
        return pack(
          2,
          RISK_LABEL[2],
          "<0.5%",
          "Almost certainly benign. Theo dõi định kỳ."
        );
      }
      if (tube_contents === "non_simple_fluid") {
        return pack(
          3,
          RISK_LABEL[3],
          "~5%",
          "Low risk. Theo dõi sát hoặc đánh giá thêm."
        );
      }
    }
    return empty();
  }

  // D. PARA-OVARIAN CYST
  if (abnormality === "para_ovarian") {
    return pack(
      2,
      RISK_LABEL[2],
      "<0.5%",
      "Almost certainly benign. Theo dõi theo triệu chứng."
    );
  }

  // E. SOLID LESION (nhóm rút gọn)
  if (abnormality === "solid") {
    return pack(
      5,
      RISK_LABEL[5],
      "~90%",
      "Nghi ngờ cao ác tính. Hội chẩn chuyên khoa."
    );
  }

  // F. NONE OF THE ABOVE
  if (abnormality === "none") {
    return pack(1, RISK_LABEL[1], "Not-applicable", "Normal ovaries.");
  }

  return empty();
}
