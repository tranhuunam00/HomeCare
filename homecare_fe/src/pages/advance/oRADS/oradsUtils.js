// oradsUtils.js
import { RISK_LABEL } from "./oradsConstants";

const pack = (orads, risk, ppv, rec) => ({ orads, risk, ppv, rec });
const empty = () => ({ orads: null, risk: "", ppv: "", rec: "" });

export function computeORADS(input = {}) {
  const {
    modality,

    // ===== MRI (đã có sẵn) =====
    peritoneal,
    abnormality,
    cyst_structure,
    cyst_contents,
    cyst_small_premenop,
    multiloc_has_fat,
    solid_dark_t2dwi,
    dce_curve,
    solid_large_lipid,
    non_dce_30s_enh,
    tube_wall_thickness,
    tube_contents,

    // ===== US (mới) =====
    usAdequate,
    usType, // 'no_lesions'|'physiologic_cyst'|'typical_extraovarian'|'typical_benign_ovarian'|'other_ovarian'
    usBenignType, // 'hemorrhagic'|'dermoid'|'endometrioma'
    usMaxDiameter, // number (cm)
  } = input;

  // ===== MRI branch =====
  if (modality === "mri") {
    // 1) Peritoneal/omental nodularity → O-RADS 5
    if (peritoneal === true) {
      return pack(
        5,
        RISK_LABEL[5],
        "~90%",
        "Nghi ngờ cao ác tính. Hội chẩn phụ khoa/ung bướu, đánh giá giai đoạn và lập kế hoạch điều trị."
      );
    }
    if (peritoneal !== false) return empty();

    // 2) Abnormality
    if (abnormality === "cystic") {
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

    if (abnormality === "cystic_solid" || abnormality == "solid") {
      if (solid_dark_t2dwi === true) {
        return pack(
          2,
          RISK_LABEL[2],
          "<0.5%",
          "Almost certainly benign (Dark T2 & Dark DWI). Theo dõi định kỳ."
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

    if (abnormality === "dilated_tube") {
      if (!tube_wall_thickness) return empty();
      if (tube_wall_thickness === "thick") {
        return pack(
          3,
          RISK_LABEL[3],
          "~5%",
          "Low risk. Theo dõi sát/đánh giá thêm theo lâm sàng."
        );
      }
      if (tube_wall_thickness === "thin") {
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

    if (abnormality === "para_ovarian") {
      return pack(
        2,
        RISK_LABEL[2],
        "<0.5%",
        "Almost certainly benign. Theo dõi theo triệu chứng."
      );
    }
    if (abnormality === "solid") {
      return pack(
        5,
        RISK_LABEL[5],
        "~90%",
        "Nghi ngờ cao ác tính. Hội chẩn chuyên khoa."
      );
    }
    if (abnormality === "none") {
      return pack(1, RISK_LABEL[1], "Not-applicable", "Normal ovaries.");
    }
    return empty();
  }

  // ===== US branch =====
  if (modality === "us") {
    if (usAdequate === false) {
      return pack(0, "Incomplete Evaluation", "", "Repeat US study or MRI");
    }
    if (usAdequate !== true) return empty();

    if (usType === "no_lesions" || usType === "physiologic_cyst") {
      return pack(1, "Normal Ovary", "Not-applicable", "None");
    }

    if (usType === "typical_extraovarian") {
      return pack(
        2,
        "Almost certainly benign (<1% risk of malignancy)",
        "<1%",
        "Recommendation:\nImaging:\nNo further imaging\nClinical:\nGynecologist referral as needed for Hydrosalpinx and Peritoneal Inclusion Cyst"
      );
    }

    if (usType === "typical_benign_ovarian") {
      if (!usBenignType || usMaxDiameter == null) return empty();
      const size = Number(usMaxDiameter);

      const ATTENTION =
        "Attention:\n\nAscites ± peritoneal nodules not due to other malignant or non-malignant etiologies upgrades O-RADS 3 and 4 lesions to O-RADS 5. Must consider other etiologies of ascites in O-RADS categories 1 and 2.";

      // < 10 cm → O-RADS 2 ; >= 10 cm → O-RADS 3
      if (usBenignType === "hemorrhagic") {
        if (size < 10) {
          return pack(
            2,
            "Almost certainly benign (<1% risk of malignancy)",
            "<1%",
            "Recommendation:\nImaging:\n• Premenopausal:\n  • ≤5 cm: None\n  • >5 cm but <10 cm: Follow-up US in 2–3 months\n• Early postmenopausal (<5 years):\n  • <10 cm, options to confirm include:\n    1. Follow-up US in 2–3 months or\n    2. US specialist (if available) or\n    3. MRI (with O-RADS MRI score)\n• Late postmenopausal (≥5 years):\n  • Should not occur; recategorize using other lexicon descriptors.\nClinical:\nGynecologist referral as needed"
          );
        }
        return pack(
          3,
          "Low risk of malignancy (1–10%)",
          "1–10%",
          `${ATTENTION}\n\nRecommendation:\nImaging:\n• If not surgically excised, consider follow-up US within 6 months*\n• If solid, may consider US specialist (if available) or MRI (with O-RADS MRI score)**\nClinical:\nGynecologist referral as needed`
        );
      }

      if (usBenignType === "dermoid") {
        if (size < 10) {
          return pack(
            2,
            "Almost certainly benign (<1% risk of malignancy)",
            "<1%",
            "Recommendation:\nImaging:\n• ≤3 cm: May consider follow-up US in 12 months*\n• >3 cm but <10 cm: If not surgically excised, follow-up US in 12 months*\nClinical:\nGynecologist referral as needed\n* There is a paucity of evidence for defining the need, optimal duration or interval of timing for surveillance. If stable, consider US follow-up at 24 months from initial exam, then as clinically indicated. Specifically, evidence does support an increased risk of malignancy in endometriomas following menopause and those present greater than 10 years."
          );
        }
        return pack(
          3,
          "Low risk of malignancy (1–10%)",
          "1–10%",
          `${ATTENTION}\n\nRecommendation:\nImaging:\n• If not surgically excised, consider follow-up US within 6 months*\n• If solid, may consider US specialist (if available) or MRI (with O-RADS MRI score)**\nClinical:\nGynecologist referral as needed\n\n* There is a paucity of evidence for defining the optimal duration or interval for imaging surveillance. Shorter follow-up may be considered in some scenarios (eg, clinical factors). If stable, follow-up at 12 and 24 months from the initial exam, then as clinically indicated. For changing morphology, reassess using lexicon descriptors.\n** MRI with contrast has a higher specificity for solid lesions, and cystic lesions with solid component(s).`
        );
      }

      if (usBenignType === "endometrioma") {
        if (size < 10) {
          return pack(
            2,
            "Almost certainly benign (<1% risk of malignancy)",
            "<1%",
            "Recommendation:\nImaging:\n• Premenopausal:\n  • <10 cm: If not surgically excised, follow-up US in 12 months*\n• Postmenopausal:\n  • <10 cm and initial exam, options to confirm include\n    1. Follow-up US in 2–3 months or\n    2. US specialist (if available) or\n    3. MRI (with O-RADS MRI score)\n  Then, if not surgically excised, recommend follow-up US in 12 months*\nClinical:\nGynecologist referral as needed\n* There is a paucity of evidence for defining the need, optimal duration or interval of timing for surveillance. If stable, consider US follow-up at 24 months from initial exam, then as clinically indicated. Specifically, evidence does support an increased risk of malignancy in endometriomas following menopause and those present greater than 10 years."
          );
        }
        return pack(
          3,
          "Low risk of malignancy (1–10%)",
          "1–10%",
          `${ATTENTION}\n\nRecommendation:\nImaging:\n• If not surgically excised, consider follow-up US within 6 months*\n• If solid, may consider US specialist (if available) or MRI (with O-RADS MRI score)**\nClinical:\nGynecologist referral as needed`
        );
      }
      return empty();
    }

    if (usType === "other_ovarian") {
      // Để sau: hiện chưa xử lý
      return empty();
    }

    return empty();
  }

  // nothing matched
  return empty();
}
