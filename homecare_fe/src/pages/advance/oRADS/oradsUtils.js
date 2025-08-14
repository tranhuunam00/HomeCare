import { RISK_LABEL } from "./oradsConstants";

const pack = (orads, risk, ppv, rec) => ({ orads, risk, ppv, rec });
const empty = () => ({ orads: null, risk: "", ppv: "", rec: "" });

/**
 * Trả về { orads, risk, ppv, rec }
 * - MRI only
 * - Flow cystic: uni_no_enh / uni_smooth_enh / multilocular
 * - Flow cystic_solid: Dark T2/DWI → DCE curve → lipid | non‑DCE 30–40s
 */
export function computeORADS(input = {}) {
  const {
    modality,
    peritoneal,
    abnormality,

    // cystic (không-solid)
    cyst_structure, // 'uni_no_enh' | 'uni_smooth_enh' | 'multilocular'
    cyst_contents, // 'simple' | 'hemorrhagic' | 'endometrial' | 'protein_mucin' | 'lipid'
    cyst_small_premenop, // boolean|null (chỉ với uni_no_enh + simple/hemorrhagic)
    multiloc_has_fat, // boolean|null

    // cystic_solid
    solid_dark_t2dwi, // boolean|null
    dce_curve, // 'low'|'intermediate'|'high'|'not_available'|null
    solid_large_lipid, // boolean|null
    non_dce_30s_enh, // 'lte_myometrium'|'gt_myometrium'|null
  } = input;

  if (modality !== "mri") return empty();

  // 1) Có peritoneal/omental nodularity (+/- ascites) → O-RADS 5
  if (peritoneal === true) {
    return pack(
      5,
      RISK_LABEL[5],
      "~90%",
      "Nghi ngờ cao ác tính. Hội chẩn phụ khoa/ung bướu, đánh giá giai đoạn và lập kế hoạch điều trị."
    );
  }
  if (peritoneal !== false) return empty(); // chưa chọn

  // 2) Không có peritoneal → theo abnormality
  // ===== CYSTIC (không-solid) =====
  if (abnormality === "cystic") {
    // 2.1) Unilocular, WITHOUT wall enhancement
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
            "Gần như chắc chắn lành tính. Theo dõi định kỳ."
          );
        }
        return empty();
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

    // 2.2) Unilocular, WITH smooth wall enhancement
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

    // 2.3) Multilocular
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
  }

  // ===== CYSTIC LESION WITH A SOLID* COMPONENT =====
  if (abnormality === "cystic_solid") {
    // Q1: Dark T2 & Dark DWI?
    if (solid_dark_t2dwi === true) {
      return pack(
        2,
        RISK_LABEL[2],
        "<0.5%",
        "Almost certainly benign (Dark T2 & Dark DWI). Theo dõi định kỳ."
      );
    }
    if (solid_dark_t2dwi === false) {
      // Q2: DCE curve
      if (!dce_curve) return empty();

      if (dce_curve === "low") {
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

  // ===== Các nhóm khác (rút gọn) =====
  if (abnormality === "solid") {
    return pack(
      5,
      RISK_LABEL[5],
      "~90%",
      "Nghi ngờ cao ác tính. Hội chẩn chuyên khoa."
    );
  }

  if (abnormality === "dilated_tube" || abnormality === "para_ovarian") {
    return pack(
      2,
      RISK_LABEL[2],
      "<0.5%",
      "Tổn thương lành tính thường gặp. Theo dõi theo triệu chứng."
    );
  }

  if (abnormality === "none") {
    return pack(1, RISK_LABEL[1], "Not-applicable", "Bình thường.");
  }

  return empty();
}
