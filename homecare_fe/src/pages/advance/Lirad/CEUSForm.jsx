// CEUSForm.jsx — Standalone CEUS (Untreated & Treated & None)
// - Quản lý toàn bộ state + logic CEUS LI-RADS
// - AntD + toast + module SCSS
// - Không phụ thuộc file khác

import React, { useState } from "react";
import { Form, Button, Radio, Row, Col, Divider, Typography } from "antd";
import { CopyOutlined, ReloadOutlined } from "@ant-design/icons";
import styles from "./LIRADSForm.module.scss";
import { toast } from "react-toastify";

const { Text, Title } = Typography;

/* ====================== HẰNG SỐ ====================== */
const OBSERVATION_KIND_OPTIONS = [
  { label: "Chưa điều trị (Untreated)", value: "untreated" },
  { label: "Đã điều trị (Treated)", value: "treated" },
  { label: "Không phát hiện tổn thương", value: "none" },
];

/* ===== CEUS – Untreated ===== */
const CEUS_UNTREATED_APPLIES = [
  { label: "Chất lượng kém/thiếu thì ảnh", value: "compromised" },
  { label: "Tổn thương chắc chắn lành tính", value: "definitely_benign" },
  { label: "Tổn thương có khả năng lành tính", value: "probably_benign" },
  { label: "Chắc chắn có u xâm tĩnh mạch (TIV)", value: "tiv" },
  { label: "Không mục nào ở trên", value: "none" },
];

const CEUS_ANCILLARY = [
  { label: "≥1 dấu hiệu phụ hướng ác tính *", value: "malig" },
  { label: "≥1 dấu hiệu phụ hướng lành tính **", value: "benign" },
  { label: "Vừa ác tính* VÀ vừa lành tính**", value: "both" },
  { label: "Không có", value: "neither" },
];

const CEUS_AF_MALIG = "(*): Tăng kích thước rõ; nốt trong nốt; cấu trúc khảm.";
const CEUS_AF_BENIGN = "(**): Ổn định kích thước ≥ 2 năm; giảm kích thước.";

const CEUS_ARTERIAL_BEHAVIOR = [
  { label: "Không có tăng quang thì động mạch (No APHE)", value: "no_aphe" },
  { label: "Tăng quang viền (Rim APHE)", value: "rim_aphe" },
  {
    label: "Tăng quang ngoại vi dạng cầu gián đoạn (Peripheral globular APHE)",
    value: "peripheral_globular_aphe",
  },
  { label: "Kiểu tăng quang động mạch khác (Other APHE)", value: "other_aphe" },
];

const CEUS_SIZE_20 = [
  { label: "< 20 mm", value: "<20" },
  { label: "≥ 20 mm", value: ">=20" },
];

const CEUS_SIZE_10 = [
  { label: "< 10 mm", value: "<10" },
  { label: "≥ 10 mm", value: ">=10" },
];

const CEUS_WASHOUT = [
  { label: "Không mất thuốc (No washout)", value: "none" },
  { label: "Mất thuốc muộn & nhẹ (Late/mild)", value: "late_mild" },
  { label: "Mất thuốc sớm (< 60 s)", value: "early" },
  { label: "Mất thuốc rõ (Marked)", value: "marked" },
];

/* ===== CEUS – Treated ===== */
const CEUS_TREATED_TYPE = [
  { label: "Có bức xạ (Radiation) *", value: "radiation" },
  { label: "Không bức xạ (Non-Radiation) **", value: "non_radiation" },
];

const CEUS_TREATED_ADEQUATE = [
  { label: "Có", value: "yes" },
  { label: "Không", value: "no" },
];

const CEUS_INTRA_ENHANCE = [
  { label: "Không có tăng quang trong tổn thương", value: "intra_none" },
  { label: "Giảm tăng quang (HYPO-)", value: "intra_hypo" },
  { label: "Đẳng tăng quang (ISO-)", value: "intra_iso" },
  { label: "Tăng tăng quang (HYPER-)", value: "intra_hyper" },
];

const CEUS_PERI_ENHANCE = [
  { label: "Đẳng tăng quang, KHÔNG mất thuốc", value: "peri_iso_nowash" },
  { label: "Đẳng tăng quang, CÓ mất thuốc", value: "peri_iso_wash" },
  { label: "Giảm tăng quang (HYPO-)", value: "peri_hypo" },
  { label: "Tăng tăng quang, KHÔNG mất thuốc", value: "peri_hyper_nowash" },
  { label: "Tăng tăng quang, CÓ mất thuốc", value: "peri_hyper_wash" },
];

const YES_NO_OPTIONS = [
  { label: "Có", value: "yes" },
  { label: "Không", value: "no" },
];

/* ===== Khuyến nghị CEUS ===== */
const REC = {
  // chung
  CEUS_COMMON_NOTE:
    "Phải báo cáo trong Findings/Impression. Cung cấp major features, growth, ancillary và thay đổi so với trước.",
  CEUS_RPT_3M:
    "Lặp lại CEUS trong ≤ 3 tháng. Lựa chọn thay thế hợp lý: MRI/CT ≤ 3 tháng",
  CEUS_LR1_REC: "Quay lại theo dõi định kỳ trong 6 tháng",
  CEUS_LR2_REC:
    "Quay lại theo dõi 6 tháng. Lựa chọn thay thế: lặp lại CEUS ≤ 6 tháng",
  CEUS_LR3_REC:
    "CT hoặc MRI trong ≤ 6 tháng. Lựa chọn thay thế: lặp lại CEUS ≤ 6 tháng.\nCó thể cần MDD; CEUS LR-3 thường có xác suất HCC cao hơn CT/MRI LR-3",
  CEUS_LRM_REC:
    "MDD để thống nhất xử trí. Có thể bao gồm chẩn đoán thay thế/lặp lại, sinh thiết, hoặc điều trị. Phải báo cáo major features, growth, ancillary và thay đổi so với trước.",
  CEUS_LR1_2_COMMON_NOTE:
    "Bắt buộc nêu trong Findings/Impression. Cung cấp major features, growth, ancillary; nêu thay đổi so với trước.",
  CEUS_NEGATIVE_NOTE:
    "Xử trí phụ thuộc bối cảnh:\n• Nếu CEUS do sàng lọc/surveillance US dương tính: quay lại theo dõi định kỳ.\n• Nếu CEUS để đặc trưng thêm CT/MRI LR-3/LR-4/LR-M: khuyến cáo chẩn đoán thay thế bằng CT/MRI.",
  // treated mượn thêm từ CT/MRI
  TR_RPT_3M: "Chụp/siêu âm lặp lại trong ≤ 3 tháng *",
  TR_MDD_USUAL:
    "Hội chẩn đa chuyên khoa trong các trường hợp không điển hình/phức tạp",
  TR_MDD_RETREAT: "MDD thống nhất xử trí – thường cần điều trị lại",
};

/* ====================== TIỆN ÍCH ====================== */
const getLabel = (arr, v) => arr.find((x) => x.value === v)?.label || v || "--";

/* ====================== LOGIC LI-RADS – CEUS ====================== */
// Untreated → None
const computeCEUSUntreatedNone = ({
  arterial,
  washout,
  size20,
  size10,
  ancillaryNoAphe,
  ancillaryOtherAphe,
}) => {
  if (!arterial) return { lr: "", rec: "" };

  // Peripheral globular APHE → LR-1 (hemangioma thường gặp)
  if (arterial === "peripheral_globular_aphe") {
    return {
      lr: "CEUS LR-1 (khả năng hemangioma)",
      rec: `Khuyến nghị: ${REC.CEUS_LR1_REC}\n${REC.CEUS_COMMON_NOTE}`,
    };
  }

  // Rim APHE → LR-M
  if (arterial === "rim_aphe") {
    return { lr: "CEUS LR-M", rec: `Khuyến nghị: ${REC.CEUS_LRM_REC}` };
  }

  // No APHE
  if (arterial === "no_aphe") {
    if (!size20 || !washout) return { lr: "", rec: "" };
    if (washout === "early" || washout === "marked") {
      return { lr: "CEUS LR-M", rec: `Khuyến nghị: ${REC.CEUS_LRM_REC}` };
    }
    if (!ancillaryNoAphe) return { lr: "", rec: "" };
    if (ancillaryNoAphe === "malig") {
      return {
        lr: "CEUS LR-4",
        rec:
          "Khuyến nghị: Có thể cần MDD để thống nhất xử trí. Nếu chưa sinh thiết/điều trị: lặp lại hoặc thay thế chẩn đoán trong ≤ 3 tháng.\n" +
          REC.CEUS_COMMON_NOTE,
      };
    }
    if (ancillaryNoAphe === "benign") {
      return {
        lr: "CEUS LR-2",
        rec: `Khuyến nghị: ${REC.CEUS_LR2_REC}\n${REC.CEUS_COMMON_NOTE}`,
      };
    }
    return {
      lr: "CEUS LR-3",
      rec: `Khuyến nghị: ${REC.CEUS_LR3_REC}\n${REC.CEUS_COMMON_NOTE}`,
    };
  }

  // Other APHE
  if (arterial === "other_aphe") {
    if (!size10 || !washout) return { lr: "", rec: "" };
    if (washout === "early" || washout === "marked") {
      return { lr: "CEUS LR-M", rec: `Khuyến nghị: ${REC.CEUS_LRM_REC}` };
    }
    if (!ancillaryOtherAphe) return { lr: "", rec: "" };

    if (size10 === "<10") {
      if (ancillaryOtherAphe === "malig") {
        return {
          lr: "CEUS LR-4",
          rec:
            "Khuyến nghị: Có thể cần MDD; nếu chưa sinh thiết/điều trị: lặp lại/CT/MRI trong ≤ 3 tháng.\n" +
            REC.CEUS_COMMON_NOTE,
        };
      }
      if (ancillaryOtherAphe === "benign") {
        return {
          lr: "CEUS LR-2",
          rec: `Khuyến nghị: ${REC.CEUS_LR2_REC}\n${REC.CEUS_COMMON_NOTE}`,
        };
      }
      return {
        lr: "CEUS LR-3",
        rec: `Khuyến nghị: ${REC.CEUS_LR3_REC}\n${REC.CEUS_COMMON_NOTE}`,
      };
    } else {
      // ≥10 mm
      if (ancillaryOtherAphe === "malig") {
        return {
          lr: "CEUS LR-4",
          rec:
            "Khuyến nghị: Có thể cần MDD; nếu chưa sinh thiết/điều trị: lặp lại/CT/MRI trong ≤ 3 tháng.\n" +
            REC.CEUS_COMMON_NOTE,
        };
      }
      if (ancillaryOtherAphe === "benign") {
        return {
          lr: "CEUS LR-3",
          rec: `Khuyến nghị: ${REC.CEUS_LR3_REC}\n${REC.CEUS_COMMON_NOTE}`,
        };
      }
      return {
        lr: "CEUS LR-4",
        rec:
          "Khuyến nghị: Có thể cần MDD; nếu chưa sinh thiết/điều trị: lặp lại/CT/MRI trong ≤ 3 tháng.\n" +
          REC.CEUS_COMMON_NOTE,
      };
    }
  }

  return { lr: "CEUS LR-3", rec: `Khuyến nghị: ${REC.CEUS_LR3_REC}` };
};

const computeCEUSUntreated = (
  applies,
  ancillary,
  { arterial, washout, size20, size10, ancillaryNoAphe, ancillaryOtherAphe }
) => {
  if (!applies) return { lr: "", rec: "" };

  if (applies === "compromised") {
    return {
      lr: "CEUS LR-NC",
      rec:
        "Khuyến nghị: " +
        REC.CEUS_RPT_3M +
        "\n\nBắt buộc nêu trong Findings/Impression nguyên nhân hạn chế kỹ thuật/tạo ảnh và gợi ý xử trí.",
    };
  }

  if (applies === "definitely_benign") {
    if (!ancillary) return { lr: "", rec: "" };
    if (ancillary === "malig") {
      return {
        lr: "CEUS LR-2",
        rec:
          "Khuyến nghị: " +
          REC.CEUS_LR2_REC +
          "\n" +
          REC.CEUS_LR1_2_COMMON_NOTE,
      };
    }
    return {
      lr: "CEUS LR-1",
      rec:
        "Khuyến nghị: " + REC.CEUS_LR1_REC + "\n" + REC.CEUS_LR1_2_COMMON_NOTE,
    };
  }

  if (applies === "probably_benign") {
    if (!ancillary) return { lr: "", rec: "" };
    if (ancillary === "malig") {
      return {
        lr: "CEUS LR-3",
        rec:
          "Khuyến nghị: " +
          REC.CEUS_LR3_REC +
          "\n" +
          REC.CEUS_LR1_2_COMMON_NOTE,
      };
    }
    if (ancillary === "benign") {
      return {
        lr: "CEUS LR-1",
        rec:
          "Khuyến nghị: " +
          REC.CEUS_LR1_REC +
          "\n" +
          REC.CEUS_LR1_2_COMMON_NOTE,
      };
    }
    return {
      lr: "CEUS LR-2",
      rec:
        "Khuyến nghị: " + REC.CEUS_LR2_REC + "\n" + REC.CEUS_LR1_2_COMMON_NOTE,
    };
  }

  if (applies === "tiv") {
    return { lr: "CEUS LR-TIV", rec: "Khuyến nghị: MDD để thống nhất xử trí." };
  }

  if (applies === "none") {
    return computeCEUSUntreatedNone({
      arterial,
      washout,
      size20,
      size10,
      ancillaryNoAphe,
      ancillaryOtherAphe,
    });
  }

  return { lr: "", rec: "" };
};

// Treated (CEUS TRA — chỉ áp dụng Non-Radiation)
const computeCEUSTreated = (
  tType,
  adequate,
  intra,
  peri,
  newAfterNonviable,
  trend,
  sinceTx
) => {
  if (!tType) return { lr: "", rec: "" };

  if (tType === "radiation") {
    return {
      lr: "",
      rec: "LI-RADS® CEUS TRA v2024 chỉ áp dụng cho tổn thương điều trị KHÔNG dùng bức xạ (Non-Radiation).",
    };
  }

  // Non-Radiation
  if (!adequate) return { lr: "", rec: "" };
  if (adequate === "no") {
    return {
      lr: "LR-TR Nonevaluable",
      rec: "Khuyến nghị: Lặp lại hình ảnh trong ≤ 3 tháng *",
    };
  }

  if (!intra || !peri) return { lr: "", rec: "" };

  // Quy tắc chắc chắn
  if (peri === "peri_hyper_wash") {
    return { lr: "LR-TR Viable", rec: REC.TR_MDD_RETREAT };
  }
  if (intra === "intra_none" && peri === "peri_iso_nowash") {
    return {
      lr: "LR-TR Nonviable",
      rec: "Khuyến nghị: Theo dõi ~ 3 tháng*. Nếu ổn định 1–2 năm, có thể giãn cách lên 6 tháng.",
    };
  }
  if (intra === "intra_none" && peri === "peri_iso_wash") {
    if (!newAfterNonviable) return { lr: "", rec: "" };
    if (newAfterNonviable === "yes") {
      return {
        lr: "LR-TR Equivocal",
        rec: "Khuyến nghị: MDD – thường cần CT/MRI",
      };
    }
    // no → xét trend/time
    if (!trend) return { lr: "", rec: "" };
    if (trend === "decreasing") {
      return {
        lr: "LR-TR Equivocal",
        rec: "Khuyến nghị: Theo dõi ~ 3 tháng*\nMDD khi trường hợp không điển hình/phức tạp",
      };
    }
    if (trend === "increasing") {
      return {
        lr: "LR-TR Equivocal",
        rec: "Khuyến nghị: MDD – thường cần CT/MRI",
      };
    }
    if (trend === "stable") {
      if (!sinceTx) return { lr: "", rec: "" };
      if (sinceTx === "<6") {
        return {
          lr: "LR-TR Equivocal",
          rec: "Khuyến nghị: Theo dõi ~ 3 tháng*\nMDD khi không điển hình/phức tạp",
        };
      }
      return {
        lr: "LR-TR Equivocal",
        rec: "Khuyến nghị: MDD – thường cần CT/MRI",
      };
    }
  }

  // Các tổ hợp còn lại → Equivocal
  if (
    peri === "peri_hyper_nowash" ||
    peri === "peri_hypo" ||
    intra === "intra_hyper" ||
    intra === "intra_iso" ||
    intra === "intra_hypo"
  ) {
    return {
      lr: "LR-TR Equivocal",
      rec: `${REC.TR_RPT_3M}\n${REC.TR_MDD_USUAL}`,
    };
  }

  return {
    lr: "LR-TR Equivocal",
    rec: `${REC.TR_RPT_3M}\n${REC.TR_MDD_USUAL}`,
  };
};

/* ====================== COMPONENT ====================== */
export default function CEUSForm() {
  const [form] = Form.useForm();

  // Observation Kind
  const [observationKind, setObservationKind] = useState(null);

  /* ===== CEUS – Untreated state ===== */
  const [ceusUntreatedApplies, setCeusUntreatedApplies] = useState(null);
  const [ceusAncillary, setCeusAncillary] = useState(null);
  const [ceusArterialBehav, setCeusArterialBehav] = useState(null);
  const [ceusWashout, setCeusWashout] = useState(null);
  const [ceusSize20, setCeusSize20] = useState(null);
  const [ceusSize10, setCeusSize10] = useState(null);
  const [ceusAncillaryNoAphe, setCeusAncillaryNoAphe] = useState(null);
  const [ceusAncillaryOtherAphe, setCeusAncillaryOtherAphe] = useState(null);

  /* ===== CEUS – Treated state ===== */
  const [ceusTreatedType, setCeusTreatedType] = useState(null);
  const [ceusAdequate, setCeusAdequate] = useState(null);
  const [ceusIntra, setCeusIntra] = useState(null);
  const [ceusPeri, setCeusPeri] = useState(null);
  const [ceusNewAfterNonviable, setCeusNewAfterNonviable] = useState(null);
  const [ceusSizeTrend, setCeusSizeTrend] = useState(null);
  const [ceusSinceTx, setCeusSinceTx] = useState(null);

  // Kết quả
  const [lrCategory, setLrCategory] = useState("");
  const [lrRecommendation, setLrRecommendation] = useState("");

  /* ===== Reset ===== */
  const resetCEUSUntreated = () => {
    setCeusUntreatedApplies(null);
    setCeusAncillary(null);
    setCeusArterialBehav(null);
    setCeusWashout(null);
    setCeusSize20(null);
    setCeusSize10(null);
    setCeusAncillaryNoAphe(null);
    setCeusAncillaryOtherAphe(null);
  };

  const resetCEUSTreated = () => {
    setCeusTreatedType(null);
    setCeusAdequate(null);
    setCeusIntra(null);
    setCeusPeri(null);
    setCeusNewAfterNonviable(null);
    setCeusSizeTrend(null);
    setCeusSinceTx(null);
  };

  const onReset = () => {
    form.resetFields();
    setObservationKind(null);
    resetCEUSUntreated();
    resetCEUSTreated();
    setLrCategory("");
    setLrRecommendation("");
  };

  /* ===== Compute tổng từ state (CEUS) ===== */
  const computeCEUS = () => {
    if (!observationKind) return { lr: "", rec: "" };

    if (observationKind === "untreated") {
      return computeCEUSUntreated(ceusUntreatedApplies, ceusAncillary, {
        arterial: ceusArterialBehav,
        washout: ceusWashout,
        size20: ceusSize20,
        size10: ceusSize10,
        ancillaryNoAphe: ceusAncillaryNoAphe,
        ancillaryOtherAphe: ceusAncillaryOtherAphe,
      });
    }

    if (observationKind === "treated") {
      return computeCEUSTreated(
        ceusTreatedType,
        ceusAdequate,
        ceusIntra,
        ceusPeri,
        ceusNewAfterNonviable,
        ceusSizeTrend,
        ceusSinceTx
      );
    }

    if (observationKind === "none") {
      return { lr: "Negative Study", rec: REC.CEUS_NEGATIVE_NOTE };
    }

    return { lr: "", rec: "" };
  };

  /* ===== gen HTML kết quả (CEUS only) ===== */
  const genHtml = async () => {
    const rows = [];
    rows.push([
      "Loại quan sát",
      getLabel(OBSERVATION_KIND_OPTIONS, observationKind),
    ]);

    if (observationKind === "untreated") {
      rows.push([
        "CEUS – Điều nào áp dụng",
        getLabel(CEUS_UNTREATED_APPLIES, ceusUntreatedApplies),
      ]);

      if (
        ceusUntreatedApplies === "definitely_benign" ||
        ceusUntreatedApplies === "probably_benign"
      ) {
        rows.push([
          "Ancillary (CEUS)",
          getLabel(CEUS_ANCILLARY, ceusAncillary),
        ]);
      }

      if (ceusUntreatedApplies === "none") {
        rows.push([
          "Hành vi thì động mạch",
          getLabel(CEUS_ARTERIAL_BEHAVIOR, ceusArterialBehav),
        ]);
        if (ceusArterialBehav === "no_aphe") {
          rows.push([
            'Kích thước bờ ngoài–bờ ngoài (bao gồm "capsule")',
            getLabel(CEUS_SIZE_20, ceusSize20),
          ]);
        }
        if (ceusArterialBehav === "other_aphe") {
          rows.push([
            'Kích thước bờ ngoài–bờ ngoài (bao gồm "capsule")',
            getLabel(CEUS_SIZE_10, ceusSize10),
          ]);
        }
        if (
          ceusArterialBehav === "no_aphe" ||
          ceusArterialBehav === "other_aphe"
        ) {
          rows.push([
            "Mất thuốc tương phản",
            getLabel(CEUS_WASHOUT, ceusWashout),
          ]);
        }
        if (
          ceusArterialBehav === "no_aphe" &&
          (ceusWashout === "none" || ceusWashout === "late_mild")
        ) {
          rows.push([
            "Ancillary (CEUS)",
            getLabel(CEUS_ANCILLARY, ceusAncillaryNoAphe),
          ]);
        }
        if (
          ceusArterialBehav === "other_aphe" &&
          (ceusWashout === "none" || ceusWashout === "late_mild")
        ) {
          rows.push([
            "Ancillary (CEUS)",
            getLabel(CEUS_ANCILLARY, ceusAncillaryOtherAphe),
          ]);
        }
      }
    }

    if (observationKind === "treated") {
      rows.push([
        "Loại điều trị nhận",
        getLabel(CEUS_TREATED_TYPE, ceusTreatedType),
      ]);
      if (ceusTreatedType === "non_radiation") {
        rows.push([
          "CEUS đủ điều kiện đánh giá tổn thương/bờ phẫu thuật?",
          getLabel(CEUS_TREATED_ADEQUATE, ceusAdequate),
        ]);
        if (ceusAdequate === "yes") {
          rows.push([
            "INTRA-lesional enhancement (động mạch)",
            getLabel(CEUS_INTRA_ENHANCE, ceusIntra),
          ]);
          rows.push([
            "PERI-lesional enhancement (động mạch)",
            getLabel(CEUS_PERI_ENHANCE, ceusPeri),
          ]);
          if (ceusIntra === "intra_none" && ceusPeri === "peri_iso_wash") {
            rows.push([
              "Phát hiện MỚI ở BN trước đó LR-TR Nonviable?",
              getLabel(YES_NO_OPTIONS, ceusNewAfterNonviable),
            ]);
            if (ceusNewAfterNonviable === "no") {
              rows.push([
                "Kích thước tổn thương so với trước?",
                getLabel(
                  [
                    { label: "Giảm", value: "decreasing" },
                    { label: "Ổn định", value: "stable" },
                    { label: "Tăng", value: "increasing" },
                  ],
                  ceusSizeTrend
                ),
              ]);
              if (ceusSizeTrend === "stable") {
                rows.push([
                  "Thời gian từ điều trị?",
                  getLabel(
                    [
                      { label: "< 6 tháng", value: "<6" },
                      { label: "≥ 6 tháng", value: ">=6" },
                    ],
                    ceusSinceTx
                  ),
                ]);
              }
            }
          }
        }
      }
    }

    let result = { lr: "", rec: "" };
    try {
      result = computeCEUS();
    } catch {
      result = { lr: "—", rec: "" };
    }

    const tableRows = rows
      .map(
        ([k, v]) =>
          `<tr><td style="width:32%">${k}</td><td>${
            typeof v === "string" ? v : v ?? "--"
          }</td></tr>`
      )
      .join("");

    const html = `
      <table border="1" cellpadding="6" style="border-collapse: collapse; width: 100%;">
        <caption><strong>LI-RADS – CEUS</strong></caption>
        <tr><th style="width:32%">Mục</th><th>Giá trị</th></tr>
        ${tableRows}
        <tr>
          <td><strong>Kết luận</strong></td>
          <td><strong>${result.lr || "—"}</strong></td>
        </tr>
        <tr>
          <td><strong>Khuyến nghị</strong></td>
          <td>${(result.rec || "").replace(/\n/g, "<br/>")}</td>
        </tr>
      </table>
    `;

    setLrCategory(result.lr || "");
    setLrRecommendation(result.rec || "");
    return html;
  };

  /* ===== Actions ===== */
  const onFinish = async () => {
    try {
      await genHtml();
      toast.success("Đã tạo bảng kết quả!");
    } catch (e) {
      toast.error(e?.message || "Vui lòng nhập đủ thông tin hợp lệ!");
    }
  };

  const onCalculate = async () => {
    try {
      const { lr, rec } = computeCEUS();
      setLrCategory(lr || "—");
      setLrRecommendation(rec || "");
      await genHtml();
      toast.success("Đã tính kết quả!");
    } catch (e) {
      toast.error(e?.message || "Vui lòng nhập đủ thông tin hợp lệ!");
    }
  };

  const onCopy = async () => {
    try {
      const html = await genHtml();
      if (window.ClipboardItem) {
        await navigator.clipboard.write([
          new ClipboardItem({
            "text/html": new Blob([html], { type: "text/html" }),
            "text/plain": new Blob([html.replace(/<[^>]+>/g, "")], {
              type: "text/plain",
            }),
          }),
        ]);
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(html.replace(/<[^>]+>/g, ""));
      } else {
        const tmp = document.createElement("textarea");
        tmp.value = html.replace(/<[^>]+>/g, "");
        document.body.appendChild(tmp);
        tmp.select();
        document.execCommand("copy");
        document.body.removeChild(tmp);
      }
      toast.success("Đã copy bảng HTML vào clipboard!");
    } catch (error) {
      console.error(error);
      toast.error("Không thể copy. Vui lòng thử lại!");
    }
  };

  /* ====================== UI ====================== */
  return (
    <div>
      <div className={styles.formContainer}>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          {/* Observation kind */}
          <Form.Item label="Bạn muốn đánh giá loại quan sát nào? *" required>
            <Radio.Group
              value={observationKind}
              onChange={(e) => {
                const next = e.target.value;
                setObservationKind(next);
                resetCEUSUntreated();
                resetCEUSTreated();
                setLrCategory("");
                setLrRecommendation("");
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {OBSERVATION_KIND_OPTIONS.map((o) => (
                  <Radio key={o.value} value={o.value}>
                    {o.label}
                  </Radio>
                ))}
              </div>
            </Radio.Group>
          </Form.Item>

          {/* ===== CEUS – Untreated ===== */}
          {observationKind === "untreated" && (
            <>
              <Divider />
              <Title level={5} style={{ marginTop: 0 }}>
                CEUS – Tổn thương chưa điều trị
              </Title>

              <Form.Item label="Điều nào sau đây áp dụng? *" required>
                <Radio.Group
                  value={ceusUntreatedApplies}
                  onChange={(e) => {
                    const next = e.target.value;
                    setCeusUntreatedApplies(next);
                    // reset flow
                    setCeusAncillary(null);
                    setCeusArterialBehav(null);
                    setCeusWashout(null);
                    setCeusSize20(null);
                    setCeusSize10(null);
                    setCeusAncillaryNoAphe(null);
                    setCeusAncillaryOtherAphe(null);
                    setLrCategory("");
                    setLrRecommendation("");
                  }}
                >
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 8 }}
                  >
                    {CEUS_UNTREATED_APPLIES.map((o) => (
                      <Radio key={o.value} value={o.value}>
                        {o.label}
                      </Radio>
                    ))}
                  </div>
                </Radio.Group>
              </Form.Item>

              {(ceusUntreatedApplies === "definitely_benign" ||
                ceusUntreatedApplies === "probably_benign") && (
                <Form.Item
                  label="Có dấu hiệu phụ (ancillary features)? *"
                  required
                >
                  <Radio.Group
                    value={ceusAncillary}
                    onChange={(e) => setCeusAncillary(e.target.value)}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                      }}
                    >
                      {CEUS_ANCILLARY.map((o) => (
                        <Radio key={o.value} value={o.value}>
                          {o.label}
                        </Radio>
                      ))}
                    </div>
                  </Radio.Group>
                  <div style={{ marginTop: 8, fontSize: 12 }}>
                    <div>
                      <strong>Ancillary hướng ác tính:</strong> {CEUS_AF_MALIG}
                    </div>
                    <div>
                      <strong>Ancillary hướng lành tính:</strong>{" "}
                      {CEUS_AF_BENIGN}
                    </div>
                  </div>
                </Form.Item>
              )}

              {ceusUntreatedApplies === "none" && (
                <>
                  <Form.Item label="Hành vi ở thì động mạch? *" required>
                    <Radio.Group
                      value={ceusArterialBehav}
                      onChange={(e) => {
                        const next = e.target.value;
                        setCeusArterialBehav(next);
                        setCeusWashout(null);
                        setCeusSize20(null);
                        setCeusSize10(null);
                        setCeusAncillaryNoAphe(null);
                        setCeusAncillaryOtherAphe(null);
                        setLrCategory("");
                        setLrRecommendation("");
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 8,
                        }}
                      >
                        {CEUS_ARTERIAL_BEHAVIOR.map((o) => (
                          <Radio key={o.value} value={o.value}>
                            {o.label}
                          </Radio>
                        ))}
                      </div>
                    </Radio.Group>
                  </Form.Item>

                  {ceusArterialBehav === "no_aphe" && (
                    <Form.Item
                      label='Kích thước bờ ngoài–bờ ngoài (bao gồm "capsule")? *'
                      required
                    >
                      <Radio.Group
                        value={ceusSize20}
                        onChange={(e) => setCeusSize20(e.target.value)}
                      >
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 8,
                          }}
                        >
                          {CEUS_SIZE_20.map((o) => (
                            <Radio key={o.value} value={o.value}>
                              {o.label}
                            </Radio>
                          ))}
                        </div>
                      </Radio.Group>
                    </Form.Item>
                  )}

                  {ceusArterialBehav === "other_aphe" && (
                    <Form.Item
                      label='Kích thước bờ ngoài–bờ ngoài (bao gồm "capsule")? *'
                      required
                    >
                      <Radio.Group
                        value={ceusSize10}
                        onChange={(e) => setCeusSize10(e.target.value)}
                      >
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 8,
                          }}
                        >
                          {CEUS_SIZE_10.map((o) => (
                            <Radio key={o.value} value={o.value}>
                              {o.label}
                            </Radio>
                          ))}
                        </div>
                      </Radio.Group>
                    </Form.Item>
                  )}

                  {(ceusArterialBehav === "no_aphe" ||
                    ceusArterialBehav === "other_aphe") && (
                    <Form.Item
                      label="Mất thuốc tương phản (washout)? *"
                      required
                    >
                      <Radio.Group
                        value={ceusWashout}
                        onChange={(e) => {
                          const next = e.target.value;
                          setCeusWashout(next);
                          if (ceusArterialBehav === "no_aphe") {
                            setCeusAncillaryNoAphe(null);
                          } else {
                            setCeusAncillaryOtherAphe(null);
                          }
                          setLrCategory("");
                          setLrRecommendation("");
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 8,
                          }}
                        >
                          {CEUS_WASHOUT.map((o) => (
                            <Radio key={o.value} value={o.value}>
                              {o.label}
                            </Radio>
                          ))}
                        </div>
                      </Radio.Group>
                    </Form.Item>
                  )}

                  {ceusArterialBehav === "no_aphe" &&
                    (ceusWashout === "none" || ceusWashout === "late_mild") && (
                      <Form.Item
                        label="Có dấu hiệu phụ (ancillary)? *"
                        required
                      >
                        <Radio.Group
                          value={ceusAncillaryNoAphe}
                          onChange={(e) =>
                            setCeusAncillaryNoAphe(e.target.value)
                          }
                        >
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 8,
                            }}
                          >
                            {CEUS_ANCILLARY.map((o) => (
                              <Radio key={o.value} value={o.value}>
                                {o.label}
                              </Radio>
                            ))}
                          </div>
                        </Radio.Group>
                      </Form.Item>
                    )}

                  {ceusArterialBehav === "other_aphe" &&
                    (ceusWashout === "none" || ceusWashout === "late_mild") && (
                      <Form.Item
                        label="Có dấu hiệu phụ (ancillary)? *"
                        required
                      >
                        <Radio.Group
                          value={ceusAncillaryOtherAphe}
                          onChange={(e) =>
                            setCeusAncillaryOtherAphe(e.target.value)
                          }
                        >
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 8,
                            }}
                          >
                            {CEUS_ANCILLARY.map((o) => (
                              <Radio key={o.value} value={o.value}>
                                {o.label}
                              </Radio>
                            ))}
                          </div>
                        </Radio.Group>
                      </Form.Item>
                    )}
                </>
              )}
            </>
          )}

          {/* ===== CEUS – Treated ===== */}
          {observationKind === "treated" && (
            <>
              <Divider />
              <Title level={5} style={{ marginTop: 0 }}>
                CEUS – Tổn thương đã điều trị
              </Title>

              <Form.Item
                label="Bệnh nhân đã nhận loại điều trị nào? *"
                required
              >
                <Radio.Group
                  value={ceusTreatedType}
                  onChange={(e) => {
                    const next = e.target.value;
                    setCeusTreatedType(next);
                    setCeusAdequate(null);
                    setCeusIntra(null);
                    setCeusPeri(null);
                    setCeusNewAfterNonviable(null);
                    setCeusSizeTrend(null);
                    setCeusSinceTx(null);
                    setLrCategory("");
                    setLrRecommendation("");
                  }}
                >
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 8 }}
                  >
                    {CEUS_TREATED_TYPE.map((o) => (
                      <Radio key={o.value} value={o.value}>
                        {o.label}
                      </Radio>
                    ))}
                  </div>
                </Radio.Group>
              </Form.Item>

              {ceusTreatedType === "radiation" && (
                <div
                  style={{
                    fontStyle: "italic",
                    color: "#555",
                    marginBottom: 8,
                  }}
                >
                  LI-RADS® CEUS TRA v2024 chỉ áp dụng cho tổn thương điều trị{" "}
                  <strong>không dùng bức xạ</strong> (Non-Radiation).
                </div>
              )}

              {ceusTreatedType === "non_radiation" && (
                <>
                  <Form.Item
                    label="CEUS có đủ điều kiện đánh giá tổn thương & bờ phẫu thuật? *"
                    required
                  >
                    <Radio.Group
                      value={ceusAdequate}
                      onChange={(e) => {
                        const next = e.target.value;
                        setCeusAdequate(next);
                        setCeusIntra(null);
                        setCeusPeri(null);
                        setCeusNewAfterNonviable(null);
                        setCeusSizeTrend(null);
                        setCeusSinceTx(null);
                        setLrCategory("");
                        setLrRecommendation("");
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 8,
                        }}
                      >
                        {CEUS_TREATED_ADEQUATE.map((o) => (
                          <Radio key={o.value} value={o.value}>
                            {o.label}
                          </Radio>
                        ))}
                      </div>
                    </Radio.Group>
                  </Form.Item>

                  {ceusAdequate === "yes" && (
                    <>
                      <Form.Item
                        label="INTRA-lesional enhancement (động mạch)? *"
                        required
                      >
                        <Radio.Group
                          value={ceusIntra}
                          onChange={(e) => setCeusIntra(e.target.value)}
                        >
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 8,
                            }}
                          >
                            {CEUS_INTRA_ENHANCE.map((o) => (
                              <Radio key={o.value} value={o.value}>
                                {o.label}
                              </Radio>
                            ))}
                          </div>
                        </Radio.Group>
                      </Form.Item>

                      <Form.Item
                        label="PERI-lesional enhancement (động mạch)? *"
                        required
                      >
                        <Radio.Group
                          value={ceusPeri}
                          onChange={(e) => {
                            const next = e.target.value;
                            setCeusPeri(next);
                            setCeusNewAfterNonviable(null);
                            setCeusSizeTrend(null);
                            setCeusSinceTx(null);
                            setLrCategory("");
                            setLrRecommendation("");
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 8,
                            }}
                          >
                            {CEUS_PERI_ENHANCE.map((o) => (
                              <Radio key={o.value} value={o.value}>
                                {o.label}
                              </Radio>
                            ))}
                          </div>
                        </Radio.Group>
                      </Form.Item>

                      {ceusIntra === "intra_none" &&
                        ceusPeri === "peri_iso_wash" && (
                          <Form.Item
                            label="Đây có phải phát hiện MỚI ở BN trước đó LR-TR Nonviable? *"
                            required
                          >
                            <Radio.Group
                              value={ceusNewAfterNonviable}
                              onChange={(e) => {
                                const next = e.target.value;
                                setCeusNewAfterNonviable(next);
                                setCeusSizeTrend(null);
                                setCeusSinceTx(null);
                                setLrCategory("");
                                setLrRecommendation("");
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: 8,
                                }}
                              >
                                <Radio value="yes">Có</Radio>
                                <Radio value="no">Không</Radio>
                              </div>
                            </Radio.Group>
                          </Form.Item>
                        )}

                      {ceusIntra === "intra_none" &&
                        ceusPeri === "peri_iso_wash" &&
                        ceusNewAfterNonviable === "no" && (
                          <Form.Item
                            label="Kích thước tổn thương so với trước? *"
                            required
                          >
                            <Radio.Group
                              value={ceusSizeTrend}
                              onChange={(e) => {
                                const next = e.target.value;
                                setCeusSizeTrend(next);
                                setCeusSinceTx(null);
                                setLrCategory("");
                                setLrRecommendation("");
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: 8,
                                }}
                              >
                                <Radio value="decreasing">Giảm</Radio>
                                <Radio value="stable">Ổn định</Radio>
                                <Radio value="increasing">Tăng</Radio>
                              </div>
                            </Radio.Group>
                          </Form.Item>
                        )}

                      {ceusIntra === "intra_none" &&
                        ceusPeri === "peri_iso_wash" &&
                        ceusNewAfterNonviable === "no" &&
                        ceusSizeTrend === "stable" && (
                          <Form.Item
                            label="Thời gian kể từ điều trị? *"
                            required
                          >
                            <Radio.Group
                              value={ceusSinceTx}
                              onChange={(e) => setCeusSinceTx(e.target.value)}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: 8,
                                }}
                              >
                                <Radio value="<6">&lt; 6 tháng</Radio>
                                <Radio value=">=6">≥ 6 tháng</Radio>
                              </div>
                            </Radio.Group>
                          </Form.Item>
                        )}
                    </>
                  )}
                </>
              )}
            </>
          )}

          {/* ===== None ===== */}
          {observationKind === "none" && (
            <>
              <Divider />
              <div style={{ fontStyle: "italic", color: "#555" }}>
                CEUS: Không phát hiện tổn thương (Negative Study).
              </div>
            </>
          )}

          <Divider />

          {/* Kết quả realtime */}
          <Row gutter={16}>
            <Col span={12}>
              <Text strong>Kết luận: </Text>
              <Text type="danger">{lrCategory || "—"}</Text>
            </Col>
            <Col span={24} style={{ marginTop: 8, whiteSpace: "pre-line" }}>
              <Text italic>{lrRecommendation}</Text>
            </Col>
          </Row>

          <Divider />
          <div className={styles.buttonRow}>
            <Button icon={<ReloadOutlined />} onClick={onReset}>
              Làm lại
            </Button>
            <Button onClick={onCalculate}>Kết quả</Button>
            <Button icon={<CopyOutlined />} type="primary" onClick={onCopy}>
              Copy kết quả
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
}
