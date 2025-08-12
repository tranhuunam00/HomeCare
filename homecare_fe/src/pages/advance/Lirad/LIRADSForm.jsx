// LIRADSForm.jsx – LI‑RADS (CT/MRI – Chưa điều trị & ĐÃ điều trị) – Tiếng Việt + Realtime

import React, { useState } from "react";
import {
  Form,
  Button,
  Radio,
  Row,
  Col,
  Divider,
  Typography,
  Checkbox,
} from "antd";
import { CopyOutlined, ReloadOutlined } from "@ant-design/icons";
import styles from "./LIRADSForm.module.scss";
import { toast } from "react-toastify";

// Nếu dự án đã có, giữ nguyên import; nếu chưa có, có thể bỏ STYLE_COPY.
import { getLabelFromValue, STYLE_COPY } from "../../../constant/app";

const { Text } = Typography;

/* ====================== HẰNG SỐ (TIẾNG VIỆT) ====================== */
const MODALITY_OPTIONS = [
  { label: "CT/MRI", value: "ct_mri" },
  { label: "CEUS (Siêu âm tăng cường tương phản)", value: "ceus" },
  { label: "Siêu âm (theo dõi định kỳ)", value: "us_surv" },
];

const OBSERVATION_KIND_OPTIONS = [
  { label: "Chưa điều trị (Untreated)", value: "untreated" },
  { label: "Đã điều trị (Treated)", value: "treated" },
  { label: "Không phát hiện tổn thương", value: "none" },
];

const UNTREATED_APPLIES_OPTIONS = [
  {
    label: "Chất lượng kém hoặc thiếu thì ảnh (exam bị suy giảm/thiếu sót)",
    value: "compromised",
  },
  { label: "Tổn thương chắc chắn lành tính", value: "definitely_benign" },
  { label: "Tổn thương có khả năng lành tính", value: "probably_benign" },
  { label: "Chắc chắn có u xâm tĩnh mạch (TIV)", value: "tiv" },
  {
    label: "Khả năng ác tính nhưng không đặc hiệu HCC",
    value: "malignant_not_hcc",
  },
  { label: "Không mục nào ở trên", value: "none" },
];

const ANCILLARY_OPTIONS = [
  { label: "Có ≥1 dấu hiệu phụ hướng ác tính (‡)", value: "malig" },
  { label: "Có ≥1 dấu hiệu phụ hướng lành tính (§)", value: "benign" },
  {
    label:
      "Vừa có dấu hiệu phụ ác tính (‡) VÀ vừa có dấu hiệu phụ lành tính (§)",
    value: "both",
  },
  { label: "Không có dấu hiệu phụ", value: "neither" },
];

const AF_MALIG_TXT =
  "Nốt thấy rõ trên siêu âm; tăng kích thước dưới ngưỡng; hạn chế khuếch tán; tăng tín hiệu T2 nhẹ–vừa; corona enhancement; fat/iron sparing trong khối so với gan; giảm tín hiệu thì chuyển tiếp; giảm tín hiệu thì gan–mật (HBP); 'vỏ' không tăng quang; nốt trong nốt; cấu trúc khảm; sản phẩm máu; mỡ trong khối nhiều hơn gan lân cận.";
const AF_BENIGN_TXT =
  "Ổn định kích thước >2 năm; giảm kích thước; tín hiệu song song máu, mạch không biến dạng; iron trong khối > gan; tăng tín hiệu T2 rất mạnh; đẳng tín hiệu ở thì gan–mật.";

// Untreated → “None of the above apply”
const FEATURE_MULTI_OPTIONS = [
  { label: 'Enhancing "capsule"', value: "capsule" },
  { label: "Nonperipheral washout", value: "washout" },
  {
    label: "Threshold growth (tăng kích thước khối ≥50% trong ≤6 tháng)",
    value: "threshold",
  },
];
const APHE_OPTIONS = [
  { label: "Có (Yes)", value: "yes" },
  { label: "Không (No)", value: "no" },
];
const SIZE_OPTIONS = [
  { label: "< 10 mm", value: "<10" },
  { label: "10–19 mm", value: "10-19" },
  { label: "≥ 20 mm", value: ">=20" },
];

/* ===== Treated ===== */
const TREATED_TYPE_OPTIONS = [
  { label: "Xạ trị / Thuyên tắc có bức xạ (Radiation *)", value: "radiation" },
  { label: "Không xạ trị (Non‑Radiation **)", value: "non_radiation" },
];

const TREATED_MASSLIKE_RADIATION = [
  {
    label: "Không đánh giá được do suy giảm/thiếu sót thì ảnh (Nonevaluable)",
    value: "rad_nonevaluable",
  },
  { label: "Không có tăng quang dạng khối (None present)", value: "rad_none" },
  {
    label:
      "Tăng quang dạng khối, ổn định hoặc giảm kích thước theo thời gian sau LRT",
    value: "rad_stable_decreased",
  },
  {
    label:
      "Tăng quang dạng khối, mới xuất hiện hoặc tăng kích thước theo thời gian sau LRT",
    value: "rad_new_increased",
  },
];

const TREATED_MASSLIKE_NONRAD = [
  {
    label: "Không đánh giá được do suy giảm/thiếu sót thì ảnh (Nonevaluable)",
    value: "nonrad_nonevaluable",
  },
  {
    label: "Không có tăng quang dạng khối (None present)",
    value: "nonrad_none",
  },
  {
    label:
      "Không chắc chắn về hiện diện/hình thái tăng quang dạng khối (Uncertainty*)",
    value: "nonrad_uncertainty",
  },
  {
    label: "Có tăng quang dạng khối (bất kỳ mức, bất kỳ thì)",
    value: "nonrad_present",
  },
];

const EXAM_TYPE_OPTIONS = [
  { label: "CT", value: "ct" },
  { label: "MRI", value: "mri" },
];

const MRI_T2_TREATED_OPTIONS = [
  {
    label:
      "Tăng tín hiệu T2 mức nhẹ–vừa (cao hơn gan, tương tự hoặc thấp hơn lách không quá tải sắt, và thấp hơn dịch đơn thuần)",
    value: "mild_mod_hyper",
  },
  { label: "Khác (Other)", value: "other" },
];

const YES_NO_OPTIONS = [
  { label: "Có (Yes)", value: "yes" },
  { label: "Không (No)", value: "no" },
];

/* ====================== TIỆN ÍCH ====================== */
const getLabel = (arr, v) =>
  getLabelFromValue?.(arr, v) ||
  arr.find((x) => x.value === v)?.label ||
  v ||
  "--";

// Khuyến nghị tiêu chuẩn
const REC = {
  SURV_6M:
    "Tiếp tục theo dõi sau 6 tháng – Cân nhắc chụp chẩn đoán lặp lại trong ≤ 6 tháng",
  SURV_6M_ONLY: "Tiếp tục theo dõi sau 6 tháng",
  RPT_3_6M:
    "Chụp lại hoặc lựa chọn phương án chẩn đoán hình ảnh thay thế trong 3–6 tháng",
  MDM_MAY_BX:
    "Hội chẩn đa chuyên khoa để xây dựng quy trình thăm dò phù hợp – Có thể cần sinh thiết",
  MDM_OFTEN_BX:
    "Hội chẩn đa chuyên khoa để xây dựng quy trình thăm dò phù hợp – Thường bao gồm sinh thiết",
  CONS_MGMT: "Hội chẩn đa chuyên khoa để thống nhất phương án điều trị",
  RPT_ALT_3M:
    "Chụp lại hoặc dùng phương án chẩn đoán hình ảnh thay thế trong ≤ 3 tháng",
  // Treated
  TR_RPT_3M: "Chụp lại trong ≤ 3 tháng *",
  TR_RPT_3M_TILDE: "Chụp lại trong ~ 3 tháng *",
  TR_MDD_USUAL:
    "Hội chẩn đa chuyên khoa (MDD) trong các trường hợp không điển hình/phức tạp",
  TR_MDD_RETREAT:
    "MDD để thống nhất xử trí – thường cần điều trị lại (retreatment)",
};

// Helper khuyến nghị theo LR (dùng cho nhánh Untreated)
const getRecByLR = (lr) => {
  const plain = lr.replace("LR‑", "LR-");
  switch (plain) {
    case "LR-1":
      return REC.SURV_6M_ONLY;
    case "LR-2":
      return REC.SURV_6M;
    case "LR-3":
      return REC.RPT_3_6M;
    case "LR-4":
      return REC.MDM_MAY_BX;
    case "LR-5":
      return REC.CONS_MGMT;
    default:
      return "";
  }
};

/* ====================== COMPONENT ====================== */
const LIRADSForm = () => {
  const [form] = Form.useForm();

  // STATE chính
  const [modality, setModality] = useState(null);
  const [observationKind, setObservationKind] = useState(null);

  // ===== Untreated =====
  const [untreatedApplies, setUntreatedApplies] = useState(null);
  const [untreatedAncillary, setUntreatedAncillary] = useState(null);
  const [featMulti, setFeatMulti] = useState([]);
  const [aphe, setAphe] = useState(null);
  const [sizeCat, setSizeCat] = useState(null);
  const [ancillaryNone, setAncillaryNone] = useState(null);

  // ===== Treated =====
  const [treatedType, setTreatedType] = useState(null); // radiation / non_radiation
  // Radiation
  const [radMasslike, setRadMasslike] = useState(null);
  const [radExamType, setRadExamType] = useState(null); // ct/mri (khi stable/decreased)
  const [radMriT2, setRadMriT2] = useState(null); // mild_mod_hyper / other
  const [radMriDiff, setRadMriDiff] = useState(null); // yes/no
  // Non-radiation
  const [nonRadMasslike, setNonRadMasslike] = useState(null);
  const [nonRadExamType, setNonRadExamType] = useState(null); // ct/mri (khi uncertainty)
  const [nonRadMriT2, setNonRadMriT2] = useState(null);
  const [nonRadMriDiff, setNonRadMriDiff] = useState(null);

  // Kết quả
  const [lrCategory, setLrCategory] = useState("");
  const [lrRecommendation, setLrRecommendation] = useState("");

  const resetUntreated = () => {
    setUntreatedApplies(null);
    setUntreatedAncillary(null);
    setFeatMulti([]);
    setAphe(null);
    setSizeCat(null);
    setAncillaryNone(null);
  };

  const resetTreated = () => {
    setTreatedType(null);
    setRadMasslike(null);
    setRadExamType(null);
    setRadMriT2(null);
    setRadMriDiff(null);
    setNonRadMasslike(null);
    setNonRadExamType(null);
    setNonRadMriT2(null);
    setNonRadMriDiff(null);
  };

  const onReset = () => {
    form.resetFields();
    setModality(null);
    setObservationKind(null);
    resetUntreated();
    resetTreated();
    setLrCategory("");
    setLrRecommendation("");
  };

  /* ====================== LOGIC LI‑RADS ====================== */

  // Bump 1 bậc LR (tối đa LR-5) – dùng cho Untreated
  const bumpOne = (lr) => {
    const order = ["LR-1", "LR-2", "LR-3", "LR-4", "LR-5"];
    const idx = order.indexOf(lr);
    if (idx < 0) return lr;
    return order[Math.min(idx + 1, order.length - 1)];
  };

  // ===== Untreated: applies ≠ "none"
  const computeUntreatedPart1 = (applies, ancillary) => {
    if (!applies) return { lr: "", rec: "" };

    if (applies === "compromised") return { lr: "LR‑NC", rec: REC.RPT_ALT_3M };
    if (applies === "tiv") return { lr: "LR‑TIV", rec: REC.MDM_MAY_BX };
    if (applies === "malignant_not_hcc")
      return { lr: "LR‑M", rec: REC.MDM_OFTEN_BX };

    if (applies === "definitely_benign") {
      if (!ancillary) return { lr: "", rec: "" };
      if (ancillary === "malig") return { lr: "LR‑2", rec: REC.SURV_6M };
      return { lr: "LR‑1", rec: REC.SURV_6M_ONLY }; // benign / both / neither
    }

    if (applies === "probably_benign") {
      if (!ancillary) return { lr: "", rec: "" };
      if (ancillary === "malig") return { lr: "LR‑3", rec: REC.RPT_3_6M };
      if (ancillary === "benign") return { lr: "LR‑1", rec: REC.SURV_6M_ONLY };
      return { lr: "LR‑2", rec: REC.SURV_6M }; // both / neither
    }

    return { lr: "", rec: "" };
  };

  // ===== Untreated: applies === "none"
  const computeUntreatedPart2 = ({ features, apheVal, sizeVal, ancillary }) => {
    if (!ancillary || !apheVal || !sizeVal) return { lr: "", rec: "" };

    const featCount = Array.isArray(features) ? features.length : 0;

    // ƯU TIÊN CAO (chỉ khi ancillary = malig): APHE yes + size 10–19/≥20 + ≥1 feature → LR‑5
    if (
      ancillary === "malig" &&
      apheVal === "yes" &&
      (sizeVal === "10-19" || sizeVal === ">=20") &&
      featCount >= 1
    ) {
      return { lr: "LR‑5", rec: REC.CONS_MGMT };
    }

    // Ưu tiên phụ theo yêu cầu
    if (
      ancillary === "benign" &&
      apheVal === "yes" &&
      (sizeVal === "10-19" || sizeVal === ">=20") &&
      featCount >= 1
    ) {
      return { lr: "LR‑4", rec: REC.CONS_MGMT };
    }
    if (
      (ancillary === "both" || ancillary === "neither") &&
      apheVal === "yes" &&
      sizeVal === "10-19" &&
      featCount >= 2
    ) {
      return { lr: "LR‑5", rec: REC.CONS_MGMT };
    }
    if (
      ancillary === "neither" &&
      apheVal === "yes" &&
      sizeVal === "10-19" &&
      featCount >= 1
    ) {
      return { lr: "LR‑5", rec: REC.CONS_MGMT };
    }

    // Base theo ancillary
    let baseLR = "";
    if (ancillary === "malig") {
      baseLR = "LR-4";
    } else if (ancillary === "benign") {
      baseLR = "LR-2"; // tối thiểu LR‑2
      if (apheVal === "yes" && sizeVal === ">=20") baseLR = "LR-3";
    } else if (ancillary === "both" || ancillary === "neither") {
      baseLR = "LR-3"; // tối thiểu LR‑3
      if (apheVal === "yes" && sizeVal === ">=20") baseLR = "LR-4";
    }

    // BUMP +1 (không áp dụng nếu ancillary = malig)
    let finalLR = baseLR;
    if (ancillary !== "malig") {
      const shouldBump =
        (apheVal === "yes" && featCount >= 1) ||
        (apheVal === "no" && featCount >= 2);
      if (shouldBump) finalLR = bumpOne(baseLR);
    }

    const lrPretty = finalLR.replace("LR-", "LR‑");
    const finalRec = lrPretty === "LR‑5" ? REC.CONS_MGMT : getRecByLR(lrPretty);
    return { lr: lrPretty, rec: finalRec };
  };

  // ===== Treated: Radiation
  const computeTreatedRadiation = (masslike, examType, mriT2, mriDiff) => {
    if (!masslike) return { lr: "", rec: "" };

    // Nonevaluable
    if (masslike === "rad_nonevaluable")
      return { lr: "LR‑TR Nonevaluable", rec: REC.TR_RPT_3M };

    // None
    if (masslike === "rad_none")
      return { lr: "LR‑TR Nonviable", rec: REC.TR_RPT_3M_TILDE };

    // New/increased
    if (masslike === "rad_new_increased")
      return { lr: "LR‑TR Viable", rec: REC.TR_MDD_RETREAT };

    // Stable/decreased → cần exam type
    if (masslike === "rad_stable_decreased") {
      if (!examType) return { lr: "", rec: "" };
      if (examType === "ct")
        return {
          lr: "LR‑TR Nonprogressing",
          rec: `${REC.TR_RPT_3M}\n${REC.TR_MDD_USUAL}`,
        };

      // MRI → cần T2 + Diff
      if (examType === "mri") {
        if (!mriT2 || !mriDiff) return { lr: "", rec: "" };

        if (mriT2 === "mild_mod_hyper") {
          // bất kể Diff yes/no → Viable
          return { lr: "LR‑TR Viable", rec: REC.TR_MDD_RETREAT };
        }

        // other
        if (mriDiff === "yes") {
          return { lr: "LR‑TR Viable", rec: REC.TR_MDD_RETREAT };
        }
        // mriDiff === "no"
        return {
          lr: "LR‑TR Nonprogressing",
          rec: `${REC.TR_RPT_3M}\n${REC.TR_MDD_USUAL}`,
        };
      }
    }

    return { lr: "", rec: "" };
  };

  // ===== Treated: Non‑Radiation
  const computeTreatedNonRadiation = (masslike, examType, mriT2, mriDiff) => {
    if (!masslike) return { lr: "", rec: "" };

    if (masslike === "nonrad_nonevaluable")
      return { lr: "LR‑TR Nonevaluable", rec: REC.TR_RPT_3M };

    if (masslike === "nonrad_none")
      return { lr: "LR‑TR Nonviable", rec: REC.TR_RPT_3M_TILDE };

    if (masslike === "nonrad_present")
      return { lr: "LR‑TR Viable", rec: REC.TR_MDD_RETREAT };

    // uncertainty → cần exam type
    if (masslike === "nonrad_uncertainty") {
      if (!examType) return { lr: "", rec: "" };
      if (examType === "ct")
        return {
          lr: "LR‑TR Equivocal",
          rec: `${REC.TR_RPT_3M}\n${REC.TR_MDD_USUAL}`,
        };

      if (examType === "mri") {
        if (!mriT2 || !mriDiff) return { lr: "", rec: "" };

        if (mriT2 === "mild_mod_hyper") {
          // bất kể Diff yes/no → Viable
          return { lr: "LR‑TR Viable", rec: REC.TR_MDD_RETREAT };
        }

        // other
        if (mriDiff === "yes") {
          return { lr: "LR‑TR Viable", rec: REC.TR_MDD_RETREAT };
        }
        // no
        return {
          lr: "LR‑TR Equivocal",
          rec: `${REC.TR_RPT_3M}\n${REC.TR_MDD_USUAL}`,
        };
      }
    }

    return { lr: "", rec: "" };
  };

  // ===== Tính tổng
  const computeLIRADSFrom = (
    m,
    obs,
    applies,
    ancillary1,
    features,
    apheVal,
    sizeVal,
    ancillary2,
    // treated
    tType,
    rMasslike,
    rExam,
    rT2,
    rDiff,
    nrMasslike,
    nrExam,
    nrT2,
    nrDiff
  ) => {
    if (m !== "ct_mri") return { lr: "", rec: "" };

    if (obs === "untreated") {
      if (applies && applies !== "none") {
        return computeUntreatedPart1(applies, ancillary1);
      }
      if (applies === "none") {
        return computeUntreatedPart2({
          features,
          apheVal,
          sizeVal,
          ancillary: ancillary2,
        });
      }
      return { lr: "", rec: "" };
    }

    if (obs === "treated") {
      if (!tType) return { lr: "", rec: "" };
      if (tType === "radiation") {
        return computeTreatedRadiation(rMasslike, rExam, rT2, rDiff);
      }
      if (tType === "non_radiation") {
        return computeTreatedNonRadiation(nrMasslike, nrExam, nrT2, nrDiff);
      }
      return { lr: "", rec: "" };
    }
    if (obs === "none") {
      return { lr: "Negative Study", rec: REC.SURV_6M_ONLY };
    }

    // obs === "none" hoặc khác
    return { lr: "", rec: "" };
  };

  // ===== Realtime compute với override (FIX async setState) =====
  const computeAndSet = (over = {}) => {
    const { lr, rec } = computeLIRADSFrom(
      over.modality ?? modality,
      over.observationKind ?? observationKind,
      over.untreatedApplies ?? untreatedApplies,
      over.untreatedAncillary ?? untreatedAncillary,
      over.featMulti ?? featMulti,
      over.aphe ?? aphe,
      over.sizeCat ?? sizeCat,
      over.ancillaryNone ?? ancillaryNone,
      // treated
      over.treatedType ?? treatedType,
      over.radMasslike ?? radMasslike,
      over.radExamType ?? radExamType,
      over.radMriT2 ?? radMriT2,
      over.radMriDiff ?? radMriDiff,
      over.nonRadMasslike ?? nonRadMasslike,
      over.nonRadExamType ?? nonRadExamType,
      over.nonRadMriT2 ?? nonRadMriT2,
      over.nonRadMriDiff ?? nonRadMriDiff
    );
    setLrCategory(lr || "");
    setLrRecommendation(rec || "");
  };

  // Nút “Kết quả”
  const computeLIRADS = () =>
    computeLIRADSFrom(
      modality,
      observationKind,
      untreatedApplies,
      untreatedAncillary,
      featMulti,
      aphe,
      sizeCat,
      ancillaryNone,
      // treated
      treatedType,
      radMasslike,
      radExamType,
      radMriT2,
      radMriDiff,
      nonRadMasslike,
      nonRadExamType,
      nonRadMriT2,
      nonRadMriDiff
    );

  /* ====================== HTML & ACTIONS (GIỮ KHUNG) ====================== */
  const genHtml = async ({ isCopy }) => {
    const rows = [];
    rows.push([
      "Phương thức chẩn đoán hình ảnh",
      getLabel(MODALITY_OPTIONS, modality),
    ]);

    if (modality === "ct_mri") {
      rows.push([
        "Loại quan sát",
        getLabel(OBSERVATION_KIND_OPTIONS, observationKind),
      ]);

      if (observationKind === "untreated") {
        rows.push([
          "Chưa điều trị – Điều nào áp dụng",
          getLabel(UNTREATED_APPLIES_OPTIONS, untreatedApplies),
        ]);

        if (
          untreatedApplies === "definitely_benign" ||
          untreatedApplies === "probably_benign"
        ) {
          rows.push([
            "Dấu hiệu phụ (ancillary)",
            getLabel(ANCILLARY_OPTIONS, untreatedAncillary),
          ]);
        }

        if (untreatedApplies === "none") {
          rows.push([
            "Đặc điểm (chọn nhiều, không bắt buộc)",
            featMulti && featMulti.length
              ? featMulti
                  .map((v) => getLabel(FEATURE_MULTI_OPTIONS, v))
                  .join("; ")
              : "--",
          ]);
          rows.push([
            "APHE (tăng quang động mạch không dạng vành)",
            getLabel(APHE_OPTIONS, aphe),
          ]);
          rows.push([
            'Kích thước bờ ngoài–bờ ngoài (bao gồm "capsule")',
            getLabel(SIZE_OPTIONS, sizeCat),
          ]);
          rows.push([
            "Dấu hiệu phụ (ancillary)",
            getLabel(ANCILLARY_OPTIONS, ancillaryNone),
          ]);
        }
      }

      if (observationKind === "treated") {
        rows.push([
          "Loại điều trị đã nhận",
          getLabel(TREATED_TYPE_OPTIONS, treatedType),
        ]);

        if (treatedType === "radiation") {
          rows.push([
            "Tăng quang dạng khối (trong/viền tổn thương hoặc dọc bờ phẫu thuật)?",
            getLabel(TREATED_MASSLIKE_RADIATION, radMasslike),
          ]);
          if (radMasslike === "rad_stable_decreased") {
            rows.push([
              "Kiểu thăm khám",
              getLabel(EXAM_TYPE_OPTIONS, radExamType),
            ]);
            if (radExamType === "mri") {
              rows.push([
                "Tín hiệu T2 vùng tăng quang dạng khối ổn định/giảm?",
                getLabel(MRI_T2_TREATED_OPTIONS, radMriT2),
              ]);
              rows.push([
                "Có hạn chế khuếch tán ở vùng đó?",
                getLabel(YES_NO_OPTIONS, radMriDiff),
              ]);
            }
          }
        }

        if (treatedType === "non_radiation") {
          rows.push([
            "Tăng quang dạng khối (trong/viền tổn thương hoặc dọc bờ phẫu thuật)?",
            getLabel(TREATED_MASSLIKE_NONRAD, nonRadMasslike),
          ]);
          if (nonRadMasslike === "nonrad_uncertainty") {
            rows.push([
              "Kiểu thăm khám",
              getLabel(EXAM_TYPE_OPTIONS, nonRadExamType),
            ]);
            if (nonRadExamType === "mri") {
              rows.push([
                "Tín hiệu T2 vùng tăng quang dạng khối không chắc chắn?",
                getLabel(MRI_T2_TREATED_OPTIONS, nonRadMriT2),
              ]);
              rows.push([
                "Có hạn chế khuếch tán ở vùng đó?",
                getLabel(YES_NO_OPTIONS, nonRadMriDiff),
              ]);
            }
          }
        }
      }
    }

    let result = { lr: "", rec: "" };
    try {
      result = computeLIRADS();
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
        <caption><strong>LI‑RADS (CT/MRI)</strong></caption>
        <tr><th style="width:32%">Mục</th><th>Giá trị</th></tr>
        ${tableRows}
        <tr>
          <td><strong>Kết luận LI‑RADS</strong></td>
          <td><strong>${result.lr || "—"}</strong></td>
        </tr>
        <tr>
          <td><strong>Khuyến nghị</strong></td>
          <td>${result.rec || ""}</td>
        </tr>
      </table>
    `;

    setLrCategory(result.lr || "");
    setLrRecommendation(result.rec || "");
    return html;
  };

  const onCopy = async () => {
    try {
      const html = `
        ${STYLE_COPY || ""}
        ${await genHtml({ isCopy: true })}
      `;
      if (window.ClipboardItem) {
        await navigator.clipboard.write([
          new ClipboardItem({
            "text/html": new Blob([html], { type: "text/html" }),
            "text/plain": new Blob([html.replace(/<[^>]+>/g, "")], {
              type: "text/plain",
            }),
          }),
        ]);
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

  const onFinish = async () => {
    try {
      await genHtml({ isCopy: false });
      toast.success("Đã tạo bảng kết quả!");
    } catch (e) {
      toast.error(e?.message || "Vui lòng nhập đủ thông tin hợp lệ!");
    }
  };

  const onCalculate = async () => {
    try {
      const { lr, rec } = computeLIRADS();
      setLrCategory(lr || "—");
      setLrRecommendation(rec || "");
      await genHtml({ isCopy: false });
      toast.success("Đã tính kết quả LI‑RADS!");
    } catch (e) {
      toast.error(e?.message || "Vui lòng nhập đủ thông tin hợp lệ!");
    }
  };

  /* ====================== UI ====================== */
  return (
    <div className={styles.pageWrapper}>
      <div className={styles.formContainer}>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <h2>LI‑RADS – CT/MRI – Bản tiếng Việt (Realtime)</h2>

          {/* 1) Chọn phương thức */}
          <Form.Item label="Chọn phương thức chẩn đoán hình ảnh:" required>
            <Radio.Group
              value={modality}
              onChange={(e) => {
                const next = e.target.value;
                setModality(next);
                setObservationKind(null);
                // reset cả hai nhánh
                resetUntreated();
                resetTreated();
                setLrCategory("");
                setLrRecommendation("");
                computeAndSet({
                  modality: next,
                  observationKind: null,
                  untreatedApplies: null,
                  untreatedAncillary: null,
                  featMulti: [],
                  aphe: null,
                  sizeCat: null,
                  ancillaryNone: null,
                  treatedType: null,
                });
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {MODALITY_OPTIONS.map((o) => (
                  <Radio key={o.value} value={o.value}>
                    {o.label}
                  </Radio>
                ))}
              </div>
            </Radio.Group>
          </Form.Item>

          {/* 2) Nếu CT/MRI → hỏi loại quan sát */}
          {modality === "ct_mri" && (
            <Form.Item label="Bạn muốn đánh giá loại quan sát nào? *" required>
              <Radio.Group
                value={observationKind}
                onChange={(e) => {
                  const next = e.target.value;
                  setObservationKind(next);
                  resetUntreated();
                  resetTreated();
                  setLrCategory("");
                  setLrRecommendation("");
                  computeAndSet({
                    observationKind: next,
                    untreatedApplies: null,
                    untreatedAncillary: null,
                    featMulti: [],
                    aphe: null,
                    sizeCat: null,
                    ancillaryNone: null,
                    treatedType: null,
                  });
                }}
              >
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 8 }}
                >
                  {OBSERVATION_KIND_OPTIONS.map((o) => (
                    <Radio key={o.value} value={o.value}>
                      {o.label}
                    </Radio>
                  ))}
                </div>
              </Radio.Group>
            </Form.Item>
          )}

          {/* ===== Untreated ===== */}
          {modality === "ct_mri" && observationKind === "untreated" && (
            <>
              <Divider />
              <Typography.Title level={5} style={{ marginTop: 0 }}>
                Tổn thương chưa điều trị
              </Typography.Title>

              <Form.Item label="Điều nào sau đây áp dụng? *" required>
                <Radio.Group
                  value={untreatedApplies}
                  onChange={(e) => {
                    const next = e.target.value;
                    setUntreatedApplies(next);
                    // reset các câu con Untreated
                    setUntreatedAncillary(null);
                    setFeatMulti([]);
                    setAphe(null);
                    setSizeCat(null);
                    setAncillaryNone(null);
                    computeAndSet({
                      untreatedApplies: next,
                      untreatedAncillary: null,
                      featMulti: [],
                      aphe: null,
                      sizeCat: null,
                      ancillaryNone: null,
                    });
                  }}
                >
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 8 }}
                  >
                    {UNTREATED_APPLIES_OPTIONS.map((o) => (
                      <Radio key={o.value} value={o.value}>
                        {o.label}
                      </Radio>
                    ))}
                  </div>
                </Radio.Group>
              </Form.Item>

              {(untreatedApplies === "definitely_benign" ||
                untreatedApplies === "probably_benign") && (
                <Form.Item
                  label="Tổn thương có dấu hiệu phụ (ancillary) nào không? *"
                  required
                >
                  <Radio.Group
                    value={untreatedAncillary}
                    onChange={(e) => {
                      const next = e.target.value;
                      setUntreatedAncillary(next);
                      computeAndSet({ untreatedAncillary: next });
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                      }}
                    >
                      {ANCILLARY_OPTIONS.map((o) => (
                        <Radio key={o.value} value={o.value}>
                          {o.label}
                        </Radio>
                      ))}
                    </div>
                  </Radio.Group>

                  <div style={{ marginTop: 8, fontSize: 12, lineHeight: 1.5 }}>
                    <div>
                      <strong>(‡) Dấu hiệu phụ hướng ác tính:</strong>{" "}
                      {AF_MALIG_TXT}
                    </div>
                    <div style={{ marginTop: 4 }}>
                      <strong>(§) Dấu hiệu phụ hướng lành tính:</strong>{" "}
                      {AF_BENIGN_TXT}
                    </div>
                  </div>
                </Form.Item>
              )}

              {untreatedApplies === "none" && (
                <>
                  <Form.Item label="Tổn thương có các đặc điểm sau không? (chọn tất cả mục áp dụng) – KHÔNG bắt buộc">
                    <Checkbox.Group
                      value={featMulti}
                      onChange={(vals) => {
                        const next = vals || [];
                        setFeatMulti(next);
                        computeAndSet({ featMulti: next });
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 8,
                        }}
                      >
                        {FEATURE_MULTI_OPTIONS.map((o) => (
                          <Checkbox key={o.value} value={o.value}>
                            {o.label}
                          </Checkbox>
                        ))}
                      </div>
                    </Checkbox.Group>
                    <div style={{ marginTop: 6, fontSize: 12, color: "#666" }}>
                      * Nonperipheral washout: giảm tăng quang theo thời gian so
                      với gan tổng hợp ở thì ngoại bào.
                    </div>
                  </Form.Item>

                  <Form.Item
                    label="Tổn thương có tăng quang động mạch (nonrim-like APHE) không? *"
                    required
                  >
                    <Radio.Group
                      value={aphe}
                      onChange={(e) => {
                        const next = e.target.value;
                        setAphe(next);
                        computeAndSet({ aphe: next });
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 8,
                        }}
                      >
                        {APHE_OPTIONS.map((o) => (
                          <Radio key={o.value} value={o.value}>
                            {o.label}
                          </Radio>
                        ))}
                      </div>
                    </Radio.Group>
                  </Form.Item>

                  <Form.Item
                    label='Kích thước bờ ngoài–bờ ngoài (bao gồm "capsule")? *'
                    required
                  >
                    <Radio.Group
                      value={sizeCat}
                      onChange={(e) => {
                        const next = e.target.value;
                        setSizeCat(next);
                        computeAndSet({ sizeCat: next });
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 8,
                        }}
                      >
                        {SIZE_OPTIONS.map((o) => (
                          <Radio key={o.value} value={o.value}>
                            {o.label}
                          </Radio>
                        ))}
                      </div>
                    </Radio.Group>
                  </Form.Item>

                  <Form.Item
                    label="Tổn thương có dấu hiệu phụ (ancillary) nào không? *"
                    required
                  >
                    <Radio.Group
                      value={ancillaryNone}
                      onChange={(e) => {
                        const next = e.target.value;
                        setAncillaryNone(next);
                        computeAndSet({ ancillaryNone: next });
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 8,
                        }}
                      >
                        {ANCILLARY_OPTIONS.map((o) => (
                          <Radio key={o.value} value={o.value}>
                            {o.label}
                          </Radio>
                        ))}
                      </div>
                    </Radio.Group>

                    <div
                      style={{ marginTop: 8, fontSize: 12, lineHeight: 1.5 }}
                    >
                      <div>
                        <strong>(‡) Dấu hiệu phụ hướng ác tính:</strong>{" "}
                        {AF_MALIG_TXT}
                      </div>
                      <div style={{ marginTop: 4 }}>
                        <strong>(§) Dấu hiệu phụ hướng lành tính:</strong>{" "}
                        {AF_BENIGN_TXT}
                      </div>
                    </div>
                  </Form.Item>
                </>
              )}
            </>
          )}

          {/* ===== Treated ===== */}
          {modality === "ct_mri" && observationKind === "treated" && (
            <>
              <Divider />
              <Typography.Title level={5} style={{ marginTop: 0 }}>
                Tổn thương đã điều trị (Treated Observations)
              </Typography.Title>

              <Form.Item
                label="Bệnh nhân đã nhận loại điều trị nào? *"
                required
              >
                <Radio.Group
                  value={treatedType}
                  onChange={(e) => {
                    const next = e.target.value;
                    setTreatedType(next);
                    // reset mọi state của 2 nhánh treated
                    setRadMasslike(null);
                    setRadExamType(null);
                    setRadMriT2(null);
                    setRadMriDiff(null);
                    setNonRadMasslike(null);
                    setNonRadExamType(null);
                    setNonRadMriT2(null);
                    setNonRadMriDiff(null);
                    computeAndSet({
                      treatedType: next,
                      radMasslike: null,
                      radExamType: null,
                      radMriT2: null,
                      radMriDiff: null,
                      nonRadMasslike: null,
                      nonRadExamType: null,
                      nonRadMriT2: null,
                      nonRadMriDiff: null,
                    });
                  }}
                >
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 8 }}
                  >
                    {TREATED_TYPE_OPTIONS.map((o) => (
                      <Radio key={o.value} value={o.value}>
                        {o.label}
                      </Radio>
                    ))}
                  </div>
                </Radio.Group>
              </Form.Item>

              {/* Radiation */}
              {treatedType === "radiation" && (
                <>
                  <Form.Item
                    label="Có tăng quang dạng khối (bất kỳ mức, bất kỳ thì) trong/viền tổn thương hoặc dọc bờ phẫu thuật? *"
                    required
                  >
                    <Radio.Group
                      value={radMasslike}
                      onChange={(e) => {
                        const next = e.target.value;
                        setRadMasslike(next);
                        // reset các câu con
                        setRadExamType(null);
                        setRadMriT2(null);
                        setRadMriDiff(null);
                        computeAndSet({
                          radMasslike: next,
                          radExamType: null,
                          radMriT2: null,
                          radMriDiff: null,
                        });
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 8,
                        }}
                      >
                        {TREATED_MASSLIKE_RADIATION.map((o) => (
                          <Radio key={o.value} value={o.value}>
                            {o.label}
                          </Radio>
                        ))}
                      </div>
                    </Radio.Group>
                    <div style={{ marginTop: 6, fontSize: 12, color: "#666" }}>
                      * Nếu phân vân giữa hai hạng mục TRA, chọn hạng mục thể
                      hiện mức độ chắc chắn thấp hơn (ví dụ: LR‑TR
                      Nonprogressing).
                    </div>
                  </Form.Item>

                  {radMasslike === "rad_stable_decreased" && (
                    <>
                      <Form.Item label="Loại thăm khám *" required>
                        <Radio.Group
                          value={radExamType}
                          onChange={(e) => {
                            const next = e.target.value;
                            setRadExamType(next);
                            // reset nhánh MRI con
                            setRadMriT2(null);
                            setRadMriDiff(null);
                            computeAndSet({
                              radExamType: next,
                              radMriT2: null,
                              radMriDiff: null,
                            });
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 8,
                            }}
                          >
                            {EXAM_TYPE_OPTIONS.map((o) => (
                              <Radio key={o.value} value={o.value}>
                                {o.label}
                              </Radio>
                            ))}
                          </div>
                        </Radio.Group>
                      </Form.Item>

                      {radExamType === "mri" && (
                        <>
                          <Form.Item
                            label="Tín hiệu T2 vùng tăng quang dạng khối ổn định/giảm? *"
                            required
                          >
                            <Radio.Group
                              value={radMriT2}
                              onChange={(e) => {
                                const next = e.target.value;
                                setRadMriT2(next);
                                computeAndSet({ radMriT2: next });
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: 8,
                                }}
                              >
                                {MRI_T2_TREATED_OPTIONS.map((o) => (
                                  <Radio key={o.value} value={o.value}>
                                    {o.label}
                                  </Radio>
                                ))}
                              </div>
                            </Radio.Group>
                          </Form.Item>

                          <Form.Item
                            label="Có hạn chế khuếch tán ở vùng đó? *"
                            required
                          >
                            <Radio.Group
                              value={radMriDiff}
                              onChange={(e) => {
                                const next = e.target.value;
                                setRadMriDiff(next);
                                computeAndSet({ radMriDiff: next });
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: 8,
                                }}
                              >
                                {YES_NO_OPTIONS.map((o) => (
                                  <Radio key={o.value} value={o.value}>
                                    {o.label}
                                  </Radio>
                                ))}
                              </div>
                            </Radio.Group>
                          </Form.Item>
                        </>
                      )}
                    </>
                  )}
                </>
              )}

              {/* Non‑Radiation */}
              {treatedType === "non_radiation" && (
                <>
                  <Form.Item
                    label="Có tăng quang dạng khối (bất kỳ mức, bất kỳ thì) trong/viền tổn thương hoặc dọc bờ phẫu thuật? *"
                    required
                  >
                    <Radio.Group
                      value={nonRadMasslike}
                      onChange={(e) => {
                        const next = e.target.value;
                        setNonRadMasslike(next);
                        // reset câu con
                        setNonRadExamType(null);
                        setNonRadMriT2(null);
                        setNonRadMriDiff(null);
                        computeAndSet({
                          nonRadMasslike: next,
                          nonRadExamType: null,
                          nonRadMriT2: null,
                          nonRadMriDiff: null,
                        });
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 8,
                        }}
                      >
                        {TREATED_MASSLIKE_NONRAD.map((o) => (
                          <Radio key={o.value} value={o.value}>
                            {o.label}
                          </Radio>
                        ))}
                      </div>
                    </Radio.Group>
                    <div style={{ marginTop: 6, fontSize: 12, color: "#666" }}>
                      * Nếu phân vân giữa hai hạng mục TRA, chọn hạng mục thể
                      hiện mức độ chắc chắn thấp hơn (ví dụ: LR‑TR Equivocal).
                    </div>
                  </Form.Item>

                  {nonRadMasslike === "nonrad_uncertainty" && (
                    <>
                      <Form.Item label="Loại thăm khám? *" required>
                        <Radio.Group
                          value={nonRadExamType}
                          onChange={(e) => {
                            const next = e.target.value;
                            setNonRadExamType(next);
                            setNonRadMriT2(null);
                            setNonRadMriDiff(null);
                            computeAndSet({
                              nonRadExamType: next,
                              nonRadMriT2: null,
                              nonRadMriDiff: null,
                            });
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 8,
                            }}
                          >
                            {EXAM_TYPE_OPTIONS.map((o) => (
                              <Radio key={o.value} value={o.value}>
                                {o.label}
                              </Radio>
                            ))}
                          </div>
                        </Radio.Group>
                      </Form.Item>

                      {nonRadExamType === "mri" && (
                        <>
                          <Form.Item
                            label="Tín hiệu T2 vùng tăng quang dạng khối không chắc chắn? *"
                            required
                          >
                            <Radio.Group
                              value={nonRadMriT2}
                              onChange={(e) => {
                                const next = e.target.value;
                                setNonRadMriT2(next);
                                computeAndSet({ nonRadMriT2: next });
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: 8,
                                }}
                              >
                                {MRI_T2_TREATED_OPTIONS.map((o) => (
                                  <Radio key={o.value} value={o.value}>
                                    {o.label}
                                  </Radio>
                                ))}
                              </div>
                            </Radio.Group>
                          </Form.Item>

                          <Form.Item
                            label="Có hạn chế khuếch tán ở vùng đó? *"
                            required
                          >
                            <Radio.Group
                              value={nonRadMriDiff}
                              onChange={(e) => {
                                const next = e.target.value;
                                setNonRadMriDiff(next);
                                computeAndSet({ nonRadMriDiff: next });
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: 8,
                                }}
                              >
                                {YES_NO_OPTIONS.map((o) => (
                                  <Radio key={o.value} value={o.value}>
                                    {o.label}
                                  </Radio>
                                ))}
                              </div>
                            </Radio.Group>
                          </Form.Item>
                        </>
                      )}
                    </>
                  )}
                </>
              )}
            </>
          )}

          <Divider />

          {/* Kết quả realtime */}
          <Row gutter={16}>
            <Col span={12}>
              <Text strong>Kết luận LI‑RADS: </Text>
              <Text type="danger">{lrCategory || "—"}</Text>
            </Col>
            <Col span={24} style={{ marginTop: 8 }}>
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
};

export default LIRADSForm;
