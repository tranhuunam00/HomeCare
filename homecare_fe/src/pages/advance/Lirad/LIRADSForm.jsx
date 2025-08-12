// LIRADSForm.jsx – LI-RADS (CT/MRI & CEUS & US Surveillance) – Tiếng Việt + Realtime
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

// Nếu dự án đã có, giữ nguyên import; nếu chưa có có thể bỏ STYLE_COPY.
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

/* ===== CT/MRI UNTREATED ===== */
const UNTREATED_APPLIES_OPTIONS = [
  {
    label: "Chất lượng kém/thiếu thì ảnh (exam bị suy giảm/thiếu sót)",
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
  "Nốt thấy rõ trên siêu âm; tăng kích thước dưới ngưỡng; hạn chế khuếch tán; tăng tín hiệu T2 nhẹ–vừa; corona enhancement; fat/iron sparing; giảm tín hiệu thì chuyển tiếp; giảm tín hiệu thì gan–mật (HBP); 'vỏ' không tăng quang; nốt trong nốt; cấu trúc khảm; sản phẩm máu; mỡ trong khối nhiều hơn gan lân cận.";
const AF_BENIGN_TXT =
  "Ổn định kích thước > 2 năm; giảm kích thước; tín hiệu song song mạch, mạch không biến dạng; iron trong khối > gan; tăng tín hiệu T2 rất mạnh; đẳng tín hiệu ở thì gan–mật.";

/* ===== CT/MRI UNTREATED → None ===== */
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

/* ===== CEUS UNTREATED ===== */
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

/* ===== CEUS – Untreated → None ===== */
const CEUS_ARTERIAL_BEHAVIOR = [
  { label: "Không có tăng quang thì động mạch (No APHE)", value: "no_aphe" },
  { label: "Tăng quang viền (Rim APHE)", value: "rim_aphe" },
  {
    label: "Tăng quang ngoại vi dạng cầu gián đoạn (Peripheral globular APHE)",
    value: "peripheral_globular_aphe",
  },
  {
    label: "Kiểu tăng quang động mạch khác (Other APHE)",
    value: "other_aphe",
  },
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

/* ===== CEUS TREATMENT ===== */
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

const EXAM_TYPE_OPTIONS = [
  { label: "CT", value: "ct" },
  { label: "MRI", value: "mri" },
];

const MRI_T2_TREATED_OPTIONS = [
  {
    label:
      "Tăng tín hiệu T2 nhẹ–vừa (cao hơn gan, thấp hơn dịch; không quá tải sắt)",
    value: "mild_mod_hyper",
  },
  { label: "Khác", value: "other" },
];

const YES_NO_OPTIONS = [
  { label: "Có", value: "yes" },
  { label: "Không", value: "no" },
];

/* ===== US (Surveillance) ===== */
const US_HIGH_RISK_OPTIONS = [
  { label: "Có (Yes)", value: "yes" },
  { label: "Không (No)", value: "no" },
];

const US_FINDINGS_OPTIONS = [
  { label: "Không phát hiện (No findings)", value: "no_findings" },
  {
    label: "Có observation(s) (Vùng khác biệt so với nhu mô gan xung quanh)",
    value: "observations",
  },
  {
    label: "Huyết khối mới tĩnh mạch cửa hoặc tĩnh mạch gan",
    value: "new_thrombus",
  },
];

const US_OBS_KIND_OPTIONS = [
  {
    label: "Chỉ tổn thương chắc chắn lành tính (*)",
    value: "only_definitely_benign",
  },
  {
    label: "Tổn thương < 10 mm, không chắc chắn lành tính",
    value: "lt10_not_def_benign",
  },
  {
    label: "Tổn thương ≥ 10 mm, không chắc chắn lành tính",
    value: "ge10_not_def_benign",
  },
  {
    label:
      "Vùng biến dạng nhu mô ≥ 10 mm (dị đồng mơ hồ, bóng khúc xạ, mất cấu trúc)",
    value: "parenchymal_distortion_ge10",
  },
];

const US_AFP_OPTIONS = [
  { label: "AFP ≥ 20 ng/mL", value: "ge20" },
  {
    label: "AFP < 20 ng/mL nhưng tăng gấp đôi so với lần trước",
    value: "lt20_doubled",
  },
  {
    label: "AFP < 20 ng/mL nhưng tăng dần so với 2 lần đo liên tiếp gần nhất",
    value: "lt20_gradual",
  },
  {
    label: "AFP < 20 ng/mL, không xu hướng tăng dần",
    value: "lt20_no_increase",
  },
  { label: "Không rõ/không có (Unknown)", value: "unknown" },
];

const US_VIS_OPTIONS = [
  {
    label: "VIS-A*: Không hoặc tối thiểu hạn chế",
    value: "A",
  },
  {
    label: "VIS-B**: Hạn chế mức vừa",
    value: "B",
  },
  {
    label: "VIS-C***: Hạn chế nặng",
    value: "C",
  },
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
    "Tiếp tục theo dõi US sau 6 tháng – Có thể cân nhắc chẩn đoán lặp lại trong ≤ 6 tháng",
  SURV_6M_ONLY: "Tiếp tục theo dõi US sau 6 tháng",
  RPT_3_6M: "Chẩn đoán lặp lại trong 3–6 tháng",
  MDM_MAY_BX: "Hội chẩn đa chuyên khoa – Có thể cần sinh thiết",
  MDM_OFTEN_BX: "Hội chẩn đa chuyên khoa – Thường bao gồm sinh thiết",
  CONS_MGMT: "Hội chẩn đa chuyên khoa để thống nhất phương án điều trị",
  RPT_ALT_3M: "Chụp lại hoặc dùng phương án chẩn đoán thay thế trong ≤ 3 tháng",

  // Treated CT/MRI
  TR_RPT_3M: "Chụp lại trong ≤ 3 tháng *",
  TR_RPT_3M_TILDE: "Chụp lại trong ~ 3 tháng *",
  TR_MDD_USUAL:
    "Hội chẩn đa chuyên khoa trong các trường hợp không điển hình/phức tạp",
  TR_MDD_RETREAT: "MDD thống nhất xử trí – thường cần điều trị lại",

  // CEUS riêng
  CEUS_RPT_3M:
    "Lặp lại CEUS trong ≤ 3 tháng. Lựa chọn thay thế hợp lý: MRI/CT ≤ 3 tháng",
  CEUS_LR1_REC: "Quay lại theo dõi định kỳ trong 6 tháng",
  CEUS_LR2_REC:
    "Quay lại theo dõi 6 tháng. Lựa chọn thay thế: lặp lại CEUS ≤ 6 tháng",
  CEUS_LR3_REC:
    "CT hoặc MRI trong ≤ 6 tháng. Lựa chọn thay thế: lặp lại CEUS ≤ 6 tháng.\nCó thể cần MDD; CEUS LR-3 thường có xác suất HCC cao hơn CT/MRI LR-3",
  CEUS_LR1_2_COMMON_NOTE:
    "Bắt buộc nêu trong Findings/Impression. Cung cấp major features, growth, ancillary; nêu thay đổi so với trước.",
  CEUS_NEGATIVE_NOTE:
    "Xử trí phụ thuộc bối cảnh:\n• Nếu CEUS do sàng lọc/surveillance US dương tính: quay lại theo dõi định kỳ.\n• Nếu CEUS để đặc trưng thêm CT/MRI LR-3/LR-4/LR-M: khuyến cáo chẩn đoán thay thế bằng CT/MRI.",
  CEUS_LRM_REC:
    "MDD để thống nhất xử trí. Có thể bao gồm chẩn đoán thay thế/lặp lại, sinh thiết, hoặc điều trị. Phải báo cáo major features, growth, ancillary và thay đổi so với trước.",
  CEUS_COMMON_NOTE:
    "Phải báo cáo trong Findings/Impression. Cung cấp major features, growth, ancillary và thay đổi so với trước.",
};

// Helper khuyến nghị theo LR (Untreated CT/MRI)
const getRecByLR = (lr) => {
  const plain = lr.replace("LR-", "LR-");
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

  /* ===== CT/MRI – Untreated ===== */
  const [untreatedApplies, setUntreatedApplies] = useState(null);
  const [untreatedAncillary, setUntreatedAncillary] = useState(null);
  const [featMulti, setFeatMulti] = useState([]);
  const [aphe, setAphe] = useState(null);
  const [sizeCat, setSizeCat] = useState(null);
  const [ancillaryNone, setAncillaryNone] = useState(null);

  /* ===== Treated CT/MRI ===== */
  const [treatedType, setTreatedType] = useState(null);
  const [radMasslike, setRadMasslike] = useState(null);
  const [radExamType, setRadExamType] = useState(null);
  const [radMriT2, setRadMriT2] = useState(null);
  const [radMriDiff, setRadMriDiff] = useState(null);
  const [nonRadMasslike, setNonRadMasslike] = useState(null);
  const [nonRadExamType, setNonRadExamType] = useState(null);
  const [nonRadMriT2, setNonRadMriT2] = useState(null);
  const [nonRadMriDiff, setNonRadMriDiff] = useState(null);

  /* ===== CEUS – Untreated ===== */
  const [ceusUntreatedApplies, setCeusUntreatedApplies] = useState(null);
  const [ceusAncillary, setCeusAncillary] = useState(null);
  const [ceusArterialBehav, setCeusArterialBehav] = useState(null);
  const [ceusWashout, setCeusWashout] = useState(null);
  const [ceusSize20, setCeusSize20] = useState(null);
  const [ceusSize10, setCeusSize10] = useState(null);
  const [ceusAncillaryNoAphe, setCeusAncillaryNoAphe] = useState(null);
  const [ceusAncillaryOtherAphe, setCeusAncillaryOtherAphe] = useState(null);

  /* ===== CEUS – Treated ===== */
  const [ceusTreatedType, setCeusTreatedType] = useState(null);
  const [ceusAdequate, setCeusAdequate] = useState(null);
  const [ceusIntra, setCeusIntra] = useState(null);
  const [ceusPeri, setCeusPeri] = useState(null);
  const [ceusNewAfterNonviable, setCeusNewAfterNonviable] = useState(null);
  const [ceusSizeTrend, setCeusSizeTrend] = useState(null);
  const [ceusSinceTx, setCeusSinceTx] = useState(null);

  /* ===== US – Surveillance ===== */
  const [usHighRisk, setUsHighRisk] = useState(null);
  const [usFindings, setUsFindings] = useState(null);
  const [usObsKind, setUsObsKind] = useState(null);
  const [usAFP, setUsAFP] = useState(null);
  const [usVIS, setUsVIS] = useState(null);

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

  const resetUS = () => {
    setUsHighRisk(null);
    setUsFindings(null);
    setUsObsKind(null);
    setUsAFP(null);
    setUsVIS(null);
  };

  const onReset = () => {
    form.resetFields();
    setModality(null);
    setObservationKind(null);
    resetUntreated();
    resetTreated();
    resetCEUSUntreated();
    resetCEUSTreated();
    resetUS();
    setLrCategory("");
    setLrRecommendation("");
  };

  /* ====================== LOGIC LI-RADS ====================== */

  const bumpOne = (lr) => {
    const order = ["LR-1", "LR-2", "LR-3", "LR-4", "LR-5"];
    const idx = order.indexOf(lr);
    if (idx < 0) return lr;
    return order[Math.min(idx + 1, order.length - 1)];
  };

  /* ----- CT/MRI – Untreated ----- */
  const computeUntreatedPart1 = (applies, ancillary) => {
    if (!applies) return { lr: "", rec: "" };

    if (applies === "compromised") return { lr: "LR-NC", rec: REC.RPT_ALT_3M };
    if (applies === "tiv") return { lr: "LR-TIV", rec: REC.MDM_MAY_BX };
    if (applies === "malignant_not_hcc")
      return { lr: "LR-M", rec: REC.MDM_OFTEN_BX };

    if (applies === "definitely_benign") {
      if (!ancillary) return { lr: "", rec: "" };
      if (ancillary === "malig") return { lr: "LR-2", rec: REC.SURV_6M };
      return { lr: "LR-1", rec: REC.SURV_6M_ONLY };
    }

    if (applies === "probably_benign") {
      if (!ancillary) return { lr: "", rec: "" };
      if (ancillary === "malig") return { lr: "LR-3", rec: REC.RPT_3_6M };
      if (ancillary === "benign") return { lr: "LR-1", rec: REC.SURV_6M_ONLY };
      return { lr: "LR-2", rec: REC.SURV_6M };
    }

    return { lr: "", rec: "" };
  };

  const computeUntreatedPart2 = ({ features, apheVal, sizeVal, ancillary }) => {
    if (!ancillary || !apheVal || !sizeVal) return { lr: "", rec: "" };
    const featCount = Array.isArray(features) ? features.length : 0;

    // Ưu tiên các mapping chắc chắn
    if (
      ancillary === "malig" &&
      apheVal === "yes" &&
      (sizeVal === "10-19" || sizeVal === ">=20") &&
      featCount >= 1
    ) {
      return { lr: "LR-5", rec: REC.CONS_MGMT };
    }
    if (
      ancillary === "benign" &&
      apheVal === "yes" &&
      (sizeVal === "10-19" || sizeVal === ">=20") &&
      featCount >= 1
    ) {
      return { lr: "LR-4", rec: REC.CONS_MGMT };
    }
    if (
      (ancillary === "both" || ancillary === "neither") &&
      apheVal === "yes" &&
      sizeVal === "10-19" &&
      featCount >= 2
    ) {
      return { lr: "LR-5", rec: REC.CONS_MGMT };
    }
    if (
      ancillary === "neither" &&
      apheVal === "yes" &&
      sizeVal === "10-19" &&
      featCount >= 1
    ) {
      return { lr: "LR-5", rec: REC.CONS_MGMT };
    }

    // Cơ sở
    let baseLR = "";
    if (ancillary === "malig") {
      baseLR = "LR-4";
    } else if (ancillary === "benign") {
      baseLR = "LR-2";
      if (apheVal === "yes" && sizeVal === ">=20") baseLR = "LR-3";
    } else if (ancillary === "both" || ancillary === "neither") {
      baseLR = "LR-3";
      if (apheVal === "yes" && sizeVal === ">=20") baseLR = "LR-4";
    }

    // Nâng 1 bậc nếu đủ features (trừ khi đã chọn 'malig')
    let finalLR = baseLR;
    if (ancillary !== "malig") {
      const shouldBump =
        (apheVal === "yes" && featCount >= 1) ||
        (apheVal === "no" && featCount >= 2);
      if (shouldBump) finalLR = bumpOne(baseLR);
    }

    const lrPretty = finalLR.replace("LR-", "LR-");
    const finalRec = lrPretty === "LR-5" ? REC.CONS_MGMT : getRecByLR(lrPretty);
    return { lr: lrPretty, rec: finalRec };
  };

  /* ----- Treated CT/MRI ----- */
  const computeTreatedRadiation = (masslike, examType, mriT2, mriDiff) => {
    if (!masslike) return { lr: "", rec: "" };
    if (masslike === "rad_nonevaluable")
      return { lr: "LR-TR Nonevaluable", rec: REC.TR_RPT_3M };
    if (masslike === "rad_none")
      return { lr: "LR-TR Nonviable", rec: REC.TR_RPT_3M_TILDE };
    if (masslike === "rad_new_increased")
      return { lr: "LR-TR Viable", rec: REC.TR_MDD_RETREAT };

    if (masslike === "rad_stable_decreased") {
      if (!examType) return { lr: "", rec: "" };
      if (examType === "ct")
        return {
          lr: "LR-TR Nonprogressing",
          rec: `${REC.TR_RPT_3M}\n${REC.TR_MDD_USUAL}`,
        };
      if (examType === "mri") {
        if (!mriT2 || !mriDiff) return { lr: "", rec: "" };
        if (mriT2 === "mild_mod_hyper") {
          return { lr: "LR-TR Viable", rec: REC.TR_MDD_RETREAT };
        }
        if (mriDiff === "yes") {
          return { lr: "LR-TR Viable", rec: REC.TR_MDD_RETREAT };
        }
        return {
          lr: "LR-TR Nonprogressing",
          rec: `${REC.TR_RPT_3M}\n${REC.TR_MDD_USUAL}`,
        };
      }
    }
    // Fallback: kết luận chưa chắc -> Equivocal
    return {
      lr: "LR-TR Equivocal",
      rec: `${REC.TR_RPT_3M}\n${REC.TR_MDD_USUAL}`,
    };
  };

  const computeTreatedNonRadiation = (masslike, examType, mriT2, mriDiff) => {
    if (!masslike) return { lr: "", rec: "" };
    if (masslike === "nonrad_nonevaluable")
      return { lr: "LR-TR Nonevaluable", rec: REC.TR_RPT_3M };
    if (masslike === "nonrad_none")
      return { lr: "LR-TR Nonviable", rec: REC.TR_RPT_3M_TILDE };
    if (masslike === "nonrad_present")
      return { lr: "LR-TR Viable", rec: REC.TR_MDD_RETREAT };

    if (masslike === "nonrad_uncertainty") {
      if (!examType) return { lr: "", rec: "" };
      if (examType === "ct")
        return {
          lr: "LR-TR Equivocal",
          rec: `${REC.TR_RPT_3M}\n${REC.TR_MDD_USUAL}`,
        };
      if (examType === "mri") {
        if (!mriT2 || !mriDiff) return { lr: "", rec: "" };
        if (mriT2 === "mild_mod_hyper" || mriDiff === "yes") {
          return { lr: "LR-TR Viable", rec: REC.TR_MDD_RETREAT };
        }
        return {
          lr: "LR-TR Equivocal",
          rec: `${REC.TR_RPT_3M}\n${REC.TR_MDD_USUAL}`,
        };
      }
    }
    // Fallback
    return {
      lr: "LR-TR Equivocal",
      rec: `${REC.TR_RPT_3M}\n${REC.TR_MDD_USUAL}`,
    };
  };

  /* ----- CEUS – Untreated (đã phủ hết, tránh rơi vào trống) ----- */
  const computeCEUSUntreatedNone = ({
    arterial,
    washout,
    size20,
    size10,
    ancillaryNoAphe,
    ancillaryOtherAphe,
  }) => {
    if (!arterial) return { lr: "", rec: "" };

    // Peripheral globular APHE -> LR-1 (thường hemangioma)
    if (arterial === "peripheral_globular_aphe") {
      return {
        lr: "CEUS LR-1 (khả năng hemangioma)",
        rec: `Khuyến nghị: ${REC.CEUS_LR1_REC}\n${REC.CEUS_COMMON_NOTE}`,
      };
    }

    // Rim APHE -> LR-M
    if (arterial === "rim_aphe") {
      return { lr: "CEUS LR-M", rec: `Khuyến nghị: ${REC.CEUS_LRM_REC}` };
    }

    // No APHE -> hỏi size20 + washout + ancillary
    if (arterial === "no_aphe") {
      if (!size20 || !washout) return { lr: "", rec: "" };

      if (washout === "early" || washout === "marked") {
        return { lr: "CEUS LR-M", rec: `Khuyến nghị: ${REC.CEUS_LRM_REC}` };
      }

      // No washout hoặc Late & mild -> ancillary
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
      // both / neither -> LR-3
      return {
        lr: "CEUS LR-3",
        rec: `Khuyến nghị: ${REC.CEUS_LR3_REC}\n${REC.CEUS_COMMON_NOTE}`,
      };
    }

    // Other APHE -> hỏi size10 + washout + ancillary
    if (arterial === "other_aphe") {
      if (!size10 || !washout) return { lr: "", rec: "" };

      if (washout === "early" || washout === "marked") {
        return { lr: "CEUS LR-M", rec: `Khuyến nghị: ${REC.CEUS_LRM_REC}` };
      }

      // No washout hoặc Late/mild -> ancillary
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
        // both / neither
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
        // both / neither -> LR-4
        return {
          lr: "CEUS LR-4",
          rec:
            "Khuyến nghị: Có thể cần MDD; nếu chưa sinh thiết/điều trị: lặp lại/CT/MRI trong ≤ 3 tháng.\n" +
            REC.CEUS_COMMON_NOTE,
        };
      }
    }

    // Fallback
    return { lr: "CEUS LR-3", rec: `Khuyến nghị: ${REC.CEUS_LR3_REC}` };
  };

  const computeCEUSUntreated = (applies, ancillary) => {
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
          "Khuyến nghị: " +
          REC.CEUS_LR1_REC +
          "\n" +
          REC.CEUS_LR1_2_COMMON_NOTE,
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
          "Khuyến nghị: " +
          REC.CEUS_LR2_REC +
          "\n" +
          REC.CEUS_LR1_2_COMMON_NOTE,
      };
    }

    if (applies === "tiv") {
      return {
        lr: "CEUS LR-TIV",
        rec: "Khuyến nghị: MDD để thống nhất xử trí.",
      };
    }

    // None-of-the-above
    if (applies === "none") {
      return computeCEUSUntreatedNone({
        arterial: ceusArterialBehav,
        washout: ceusWashout,
        size20: ceusSize20,
        size10: ceusSize10,
        ancillaryNoAphe: ceusAncillaryNoAphe,
        ancillaryOtherAphe: ceusAncillaryOtherAphe,
      });
    }

    return { lr: "", rec: "" };
  };

  /* ----- CEUS – Treated (đã phủ hết, tránh rơi vào trống) ----- */
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

    // CEUS TRA chỉ áp dụng cho Non-Radiation
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

    // adequate === "yes"
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
      // no -> xét trend/time
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

    // Các tổ hợp khác:
    // - Bất kỳ INTRA HYPER/ISO/HYPO với PERI HYPER NOWASH: nghi ngờ còn mô sống -> Equivocal/Viable?
    //   Không có tiêu chí chắc chắn -> gán Equivocal + MDD.
    // - PERI HYPO: có thể do hoại tử/xơ -> thường không xác định -> Equivocal + theo dõi/MDD.
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

    // Fallback
    return {
      lr: "LR-TR Equivocal",
      rec: `${REC.TR_RPT_3M}\n${REC.TR_MDD_USUAL}`,
    };
  };

  /* ----- US – Surveillance ----- */
  const computeUSSurveillance = (highRisk, findings, obsKind, afp, vis) => {
    if (!highRisk) return { lr: "", rec: "" };

    if (highRisk === "no") {
      return {
        lr: "LI-RADS không áp dụng",
        rec: "LI-RADS chỉ áp dụng cho nhóm nguy cơ cao HCC. Không dùng cho người bệnh không nguy cơ cao.",
      };
    }

    // highRisk === "yes"
    if (!findings) return { lr: "", rec: "" };

    if (findings === "no_findings") {
      if (!afp) return { lr: "", rec: "" };

      if (afp === "ge20" || afp === "lt20_doubled" || afp === "lt20_gradual") {
        return {
          lr: "US-1 with positive AFP",
          rec: "Nếu AFP dương tính nhưng US không phải US-3, CEUS ít giúp ích. Tiếp tục thăm dò bằng MRI/CT chẩn đoán.",
        };
      }

      // lt20_no_increase / unknown
      if (!vis) return { lr: "", rec: "" };
      if (vis === "A" || vis === "B") {
        return {
          lr: "US-1 (Âm tính)",
          rec: "Không có bằng chứng HCC trên US. Lặp lại US sau 6 tháng.",
        };
      }
      return {
        lr: "US-1 (Âm tính) với VIS-C",
        rec: "Hạn chế nặng do điểm VIS thấp. Nếu MASH/EtOH, CTP-B/C, hoặc BMI ≥ 35: cân nhắc AMRI/CT. Nếu không, lặp US trong 3 tháng; nếu vẫn VIS-C, xem xét chiến lược thay thế.",
      };
    }

    if (findings === "new_thrombus") {
      return {
        lr: "US-3 (Dương tính)",
        rec: "Có phát hiện cần làm rõ bằng chẩn đoán hình ảnh đa thì có cản quang (CT, MRI hoặc CEUS).",
      };
    }

    if (findings === "observations") {
      if (!obsKind) return { lr: "", rec: "" };

      if (
        obsKind === "parenchymal_distortion_ge10" ||
        obsKind === "ge10_not_def_benign"
      ) {
        return {
          lr: "US-3 (Dương tính)",
          rec: "Cần đặc trưng thêm với hình ảnh đa thì có cản quang (CT, MRI hoặc CEUS).",
        };
      }

      if (obsKind === "only_definitely_benign") {
        if (!afp) return { lr: "", rec: "" };
        if (
          afp === "ge20" ||
          afp === "lt20_doubled" ||
          afp === "lt20_gradual"
        ) {
          return {
            lr: "US-1 with positive AFP",
            rec: "AFP dương tính nhưng US không phải US-3: CEUS ít giúp. Nên MRI/CT chẩn đoán.",
          };
        }
        if (!vis) return { lr: "", rec: "" };
        if (vis === "A" || vis === "B") {
          return { lr: "US-1 (Âm tính)", rec: "Lặp lại US sau 6 tháng." };
        }
        return {
          lr: "US-1 (Âm tính) với VIS-C",
          rec: "Hạn chế nặng VIS-C. Nếu MASH/EtOH, CTP-B/C, hoặc BMI ≥ 35: cân nhắc AMRI/CT. Nếu không, lặp US 3 tháng; nếu vẫn VIS-C, cân nhắc chiến lược thay thế.",
        };
      }

      if (obsKind === "lt10_not_def_benign") {
        if (!afp) return { lr: "", rec: "" };
        if (
          afp === "ge20" ||
          afp === "lt20_doubled" ||
          afp === "lt20_gradual"
        ) {
          return {
            lr: "US-2 (Dưới ngưỡng) with positive AFP",
            rec: "AFP dương tính nhưng chưa US-3: CEUS ít giúp. Nên MRI/CT chẩn đoán.",
          };
        }
        if (!vis) return { lr: "", rec: "" };
        if (vis === "A" || vis === "B") {
          return {
            lr: "US-2 (Dưới ngưỡng)",
            rec: "Lặp lại US mỗi 3–6 tháng trong 2 lần. Nếu mất tổn thương hoặc vẫn <10 mm, có thể xếp US-1 và quay lại chu kỳ 6 tháng.",
          };
        }
        return {
          lr: "US-2 (Dưới ngưỡng) với VIS-C",
          rec: "Hạn chế nặng VIS-C. Nếu MASH/EtOH, CTP-B/C, hoặc BMI ≥ 35: cân nhắc AMRI/CT. Nếu không, lặp US 3 tháng; nếu vẫn VIS-C, cân nhắc chiến lược thay thế.",
        };
      }
    }

    return { lr: "", rec: "" };
  };

  /* ===== Tính tổng ===== */
  const computeLIRADSFrom = (
    m,
    obs,
    applies,
    ancillary1,
    features,
    apheVal,
    sizeVal,
    ancillary2,
    // treated CT/MRI
    tType,
    rMasslike,
    rExam,
    rT2,
    rDiff,
    nrMasslike,
    nrExam,
    nrT2,
    nrDiff,
    // CEUS – Untreated/Treated (phần 1)
    ceusApplies,
    ceusAnc,
    ceusTType,
    ceusAdeq,
    ceusIntraVal,
    ceusPeriVal,
    ceusNewNV,
    ceusTrend,
    ceusSince,
    // CEUS Untreated → None (phần 2)
    ceusArterial,
    ceusWash,
    ceusSize20v,
    ceusSize10v,
    ceusAncNoAphe,
    ceusAncOtherAphe,
    // US (Surveillance)
    usHighRiskVal,
    usFindingsVal,
    usObsKindVal,
    usAFPVal,
    usVISVal
  ) => {
    /* --- CT/MRI --- */
    if (m === "ct_mri") {
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

      return { lr: "", rec: "" };
    }

    /* --- CEUS --- */
    if (m === "ceus") {
      if (obs === "untreated") {
        // Gọi compute theo applies
        const base = computeCEUSUntreated(ceusApplies, ceusAnc);
        // Nếu base chưa có lr và applies===none -> tính tiếp nhánh None bằng các biến phần 2
        if (
          (!base.lr || base.lr === "") &&
          ceusApplies === "none" &&
          ceusArterial
        ) {
          return computeCEUSUntreatedNone({
            arterial: ceusArterial,
            washout: ceusWash,
            size20: ceusSize20v,
            size10: ceusSize10v,
            ancillaryNoAphe: ceusAncNoAphe,
            ancillaryOtherAphe: ceusAncOtherAphe,
          });
        }
        // Nếu vẫn trống -> Fallback an toàn
        return base.lr
          ? base
          : { lr: "CEUS LR-3", rec: `Khuyến nghị: ${REC.CEUS_LR3_REC}` };
      }

      if (obs === "treated") {
        return computeCEUSTreated(
          ceusTType,
          ceusAdeq,
          ceusIntraVal,
          ceusPeriVal,
          ceusNewNV,
          ceusTrend,
          ceusSince
        );
      }

      if (obs === "none") {
        return { lr: "Negative Study", rec: REC.CEUS_NEGATIVE_NOTE };
      }

      return { lr: "", rec: "" };
    }

    /* --- US (Surveillance) --- */
    if (m === "us_surv") {
      return computeUSSurveillance(
        usHighRiskVal,
        usFindingsVal,
        usObsKindVal,
        usAFPVal,
        usVISVal
      );
    }

    return { lr: "", rec: "" };
  };

  /* ===== Realtime compute với override (FIX async setState) ===== */
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
      // Treated CT/MRI
      over.treatedType ?? treatedType,
      over.radMasslike ?? radMasslike,
      over.radExamType ?? radExamType,
      over.radMriT2 ?? radMriT2,
      over.radMriDiff ?? radMriDiff,
      over.nonRadMasslike ?? nonRadMasslike,
      over.nonRadExamType ?? nonRadExamType,
      over.nonRadMriT2 ?? nonRadMriT2,
      over.nonRadMriDiff ?? nonRadMriDiff,
      // CEUS phần 1
      over.ceusUntreatedApplies ?? ceusUntreatedApplies,
      over.ceusAncillary ?? ceusAncillary,
      over.ceusTreatedType ?? ceusTreatedType,
      over.ceusAdequate ?? ceusAdequate,
      over.ceusIntra ?? ceusIntra,
      over.ceusPeri ?? ceusPeri,
      over.ceusNewAfterNonviable ?? ceusNewAfterNonviable,
      over.ceusSizeTrend ?? ceusSizeTrend,
      over.ceusSinceTx ?? ceusSinceTx,
      // CEUS phần 2 (Untreated None)
      over.ceusArterialBehav ?? ceusArterialBehav,
      over.ceusWashout ?? ceusWashout,
      over.ceusSize20 ?? ceusSize20,
      over.ceusSize10 ?? ceusSize10,
      over.ceusAncillaryNoAphe ?? ceusAncillaryNoAphe,
      over.ceusAncillaryOtherAphe ?? ceusAncillaryOtherAphe,
      // US
      over.usHighRisk ?? usHighRisk,
      over.usFindings ?? usFindings,
      over.usObsKind ?? usObsKind,
      over.usAFP ?? usAFP,
      over.usVIS ?? usVIS
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
      // treated CT/MRI
      treatedType,
      radMasslike,
      radExamType,
      radMriT2,
      radMriDiff,
      nonRadMasslike,
      nonRadExamType,
      nonRadMriT2,
      nonRadMriDiff,
      // CEUS phần 1
      ceusUntreatedApplies,
      ceusAncillary,
      ceusTreatedType,
      ceusAdequate,
      ceusIntra,
      ceusPeri,
      ceusNewAfterNonviable,
      ceusSizeTrend,
      ceusSinceTx,
      // CEUS phần 2
      ceusArterialBehav,
      ceusWashout,
      ceusSize20,
      ceusSize10,
      ceusAncillaryNoAphe,
      ceusAncillaryOtherAphe,
      // US
      usHighRisk,
      usFindings,
      usObsKind,
      usAFP,
      usVIS
    );

  /* ====================== HTML & ACTIONS ====================== */
  const genHtml = async ({ isCopy }) => {
    const rows = [];
    rows.push([
      "Phương thức chẩn đoán hình ảnh",
      getLabel(MODALITY_OPTIONS, modality),
    ]);
    rows.push([
      "Loại quan sát",
      getLabel(OBSERVATION_KIND_OPTIONS, observationKind),
    ]);

    if (modality === "ct_mri") {
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
            "APHE (tăng quang động mạch không dạng viền)",
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
          getLabel(
            [
              { label: "Xạ trị / có bức xạ", value: "radiation" },
              { label: "Không xạ trị", value: "non_radiation" },
            ],
            treatedType
          ),
        ]);

        if (treatedType === "radiation") {
          rows.push([
            "Masslike enhancement?",
            getLabel(
              [
                { label: "Không đánh giá được", value: "rad_nonevaluable" },
                { label: "Không có", value: "rad_none" },
                {
                  label: "Ổn định/giảm theo thời gian sau LRT",
                  value: "rad_stable_decreased",
                },
                {
                  label: "Mới/tăng theo thời gian sau LRT",
                  value: "rad_new_increased",
                },
              ],
              radMasslike
            ),
          ]);
          if (radMasslike === "rad_stable_decreased") {
            rows.push([
              "Kiểu thăm khám",
              getLabel(EXAM_TYPE_OPTIONS, radExamType),
            ]);
            if (radExamType === "mri") {
              rows.push([
                "T2 vùng tăng quang dạng khối",
                getLabel(MRI_T2_TREATED_OPTIONS, radMriT2),
              ]);
              rows.push([
                "Hạn chế khuếch tán",
                getLabel(YES_NO_OPTIONS, radMriDiff),
              ]);
            }
          }
        }

        if (treatedType === "non_radiation") {
          rows.push([
            "Masslike enhancement?",
            getLabel(
              [
                { label: "Không đánh giá được", value: "nonrad_nonevaluable" },
                { label: "Không có", value: "nonrad_none" },
                { label: "Không chắc chắn", value: "nonrad_uncertainty" },
                { label: "Có (bất kỳ mức/thì)", value: "nonrad_present" },
              ],
              nonRadMasslike
            ),
          ]);
          if (nonRadMasslike === "nonrad_uncertainty") {
            rows.push([
              "Kiểu thăm khám",
              getLabel(EXAM_TYPE_OPTIONS, nonRadExamType),
            ]);
            if (nonRadExamType === "mri") {
              rows.push([
                "T2 vùng tăng quang dạng khối không chắc chắn",
                getLabel(MRI_T2_TREATED_OPTIONS, nonRadMriT2),
              ]);
              rows.push([
                "Hạn chế khuếch tán",
                getLabel(YES_NO_OPTIONS, nonRadMriDiff),
              ]);
            }
          }
        }
      }
    }

    if (modality === "ceus") {
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

      if (observationKind === "none") {
        rows.push(["CEUS kết luận", "Negative Study"]);
      }
    }

    if (modality === "us_surv") {
      rows.push([
        "US – Người bệnh nguy cơ cao HCC?",
        getLabel(US_HIGH_RISK_OPTIONS, usHighRisk),
      ]);

      if (usHighRisk === "yes") {
        rows.push([
          "US – Phát hiện gì?",
          getLabel(US_FINDINGS_OPTIONS, usFindings),
        ]);

        if (usFindings === "no_findings") {
          rows.push(["AFP", getLabel(US_AFP_OPTIONS, usAFP)]);
          if (usAFP === "lt20_no_increase" || usAFP === "unknown") {
            rows.push(["US – VIS score", getLabel(US_VIS_OPTIONS, usVIS)]);
          }
        }

        if (usFindings === "observations") {
          rows.push([
            "Loại observation(s)",
            getLabel(US_OBS_KIND_OPTIONS, usObsKind),
          ]);
          if (usObsKind === "only_definitely_benign") {
            rows.push(["AFP", getLabel(US_AFP_OPTIONS, usAFP)]);
            if (usAFP === "lt20_no_increase" || usAFP === "unknown") {
              rows.push(["US – VIS score", getLabel(US_VIS_OPTIONS, usVIS)]);
            }
          }
          if (usObsKind === "lt10_not_def_benign") {
            rows.push(["AFP", getLabel(US_AFP_OPTIONS, usAFP)]);
            if (usAFP === "lt20_no_increase" || usAFP === "unknown") {
              rows.push(["US – VIS score", getLabel(US_VIS_OPTIONS, usVIS)]);
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
        <caption><strong>LI-RADS</strong></caption>
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
      toast.success("Đã tính kết quả!");
    } catch (e) {
      toast.error(e?.message || "Vui lòng nhập đủ thông tin hợp lệ!");
    }
  };

  /* ====================== UI ====================== */
  return (
    <div className={styles.pageWrapper}>
      <div className={styles.formContainer}>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <h2>
            LI-RADS – CT/MRI, CEUS & US Surveillance (Tiếng Việt, realtime)
          </h2>

          {/* Modality */}
          <Form.Item label="Chọn phương thức chẩn đoán hình ảnh:" required>
            <Radio.Group
              value={modality}
              onChange={(e) => {
                const next = e.target.value;
                setModality(next);
                setObservationKind(null);
                // reset tất
                resetUntreated();
                resetTreated();
                resetCEUSUntreated();
                resetCEUSTreated();
                resetUS();
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
                  ceusUntreatedApplies: null,
                  ceusAncillary: null,
                  ceusTreatedType: null,
                  ceusAdequate: null,
                  ceusIntra: null,
                  ceusPeri: null,
                  ceusNewAfterNonviable: null,
                  ceusSizeTrend: null,
                  ceusSinceTx: null,
                  ceusArterialBehav: null,
                  ceusWashout: null,
                  ceusSize20: null,
                  ceusSize10: null,
                  ceusAncillaryNoAphe: null,
                  ceusAncillaryOtherAphe: null,
                  usHighRisk: null,
                  usFindings: null,
                  usObsKind: null,
                  usAFP: null,
                  usVIS: null,
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

          {/* Observation kind (ẩn với US cho gọn) */}
          {modality && modality !== "us_surv" && (
            <Form.Item label="Bạn muốn đánh giá loại quan sát nào? *" required>
              <Radio.Group
                value={observationKind}
                onChange={(e) => {
                  const next = e.target.value;
                  setObservationKind(next);
                  // reset theo nhánh
                  resetUntreated();
                  resetTreated();
                  resetCEUSUntreated();
                  resetCEUSTreated();
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
                    ceusUntreatedApplies: null,
                    ceusAncillary: null,
                    ceusTreatedType: null,
                    ceusAdequate: null,
                    ceusIntra: null,
                    ceusPeri: null,
                    ceusNewAfterNonviable: null,
                    ceusSizeTrend: null,
                    ceusSinceTx: null,
                    ceusArterialBehav: null,
                    ceusWashout: null,
                    ceusSize20: null,
                    ceusSize10: null,
                    ceusAncillaryNoAphe: null,
                    ceusAncillaryOtherAphe: null,
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

          {/* ===== CT/MRI – Untreated ===== */}
          {modality === "ct_mri" && observationKind === "untreated" && (
            <>
              <Divider />
              <Typography.Title level={5} style={{ marginTop: 0 }}>
                Tổn thương chưa điều trị (CT/MRI)
              </Typography.Title>

              <Form.Item label="Điều nào sau đây áp dụng? *" required>
                <Radio.Group
                  value={untreatedApplies}
                  onChange={(e) => {
                    const next = e.target.value;
                    setUntreatedApplies(next);
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
                    label="Tổn thương có tăng quang động mạch (non-rim APHE) không? *"
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

          {/* ===== CT/MRI – Treated ===== */}
          {modality === "ct_mri" && observationKind === "treated" && (
            <>
              <Divider />
              <Typography.Title level={5} style={{ marginTop: 0 }}>
                Tổn thương đã điều trị (CT/MRI)
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
                    <Radio value="radiation">Có bức xạ (Radiation) *</Radio>
                    <Radio value="non_radiation">
                      Không bức xạ (Non-Radiation) **
                    </Radio>
                  </div>
                </Radio.Group>
              </Form.Item>

              {treatedType === "radiation" && (
                <>
                  <Form.Item
                    label="Có tăng quang dạng khối trong/viền tổn thương hoặc dọc bờ phẫu thuật? *"
                    required
                  >
                    <Radio.Group
                      value={radMasslike}
                      onChange={(e) => {
                        const next = e.target.value;
                        setRadMasslike(next);
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
                        <Radio value="rad_nonevaluable">
                          Không đánh giá được
                        </Radio>
                        <Radio value="rad_none">Không có</Radio>
                        <Radio value="rad_stable_decreased">
                          Ổn định/giảm theo thời gian sau LRT
                        </Radio>
                        <Radio value="rad_new_increased">
                          Mới/tăng theo thời gian sau LRT
                        </Radio>
                      </div>
                    </Radio.Group>
                  </Form.Item>

                  {radMasslike === "rad_stable_decreased" && (
                    <>
                      <Form.Item label="Loại thăm khám *" required>
                        <Radio.Group
                          value={radExamType}
                          onChange={(e) => {
                            const next = e.target.value;
                            setRadExamType(next);
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
                            <Radio value="ct">CT</Radio>
                            <Radio value="mri">MRI</Radio>
                          </div>
                        </Radio.Group>
                      </Form.Item>

                      {radExamType === "mri" && (
                        <>
                          <Form.Item
                            label="Tín hiệu T2 vùng tăng quang dạng khối? *"
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
                                <Radio value="mild_mod_hyper">
                                  Tăng T2 nhẹ–vừa *
                                </Radio>
                                <Radio value="other">Khác</Radio>
                              </div>
                            </Radio.Group>
                          </Form.Item>

                          <Form.Item label="Có hạn chế khuếch tán? *" required>
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
                                <Radio value="yes">Có</Radio>
                                <Radio value="no">Không</Radio>
                              </div>
                            </Radio.Group>
                          </Form.Item>
                        </>
                      )}
                    </>
                  )}
                </>
              )}

              {treatedType === "non_radiation" && (
                <>
                  <Form.Item
                    label="Có tăng quang dạng khối trong/viền tổn thương hoặc dọc bờ phẫu thuật? *"
                    required
                  >
                    <Radio.Group
                      value={nonRadMasslike}
                      onChange={(e) => {
                        const next = e.target.value;
                        setNonRadMasslike(next);
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
                        <Radio value="nonrad_nonevaluable">
                          Không đánh giá được
                        </Radio>
                        <Radio value="nonrad_none">Không có</Radio>
                        <Radio value="nonrad_uncertainty">
                          Không chắc chắn *
                        </Radio>
                        <Radio value="nonrad_present">
                          Có (bất kỳ mức/thì)
                        </Radio>
                      </div>
                    </Radio.Group>
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
                            <Radio value="ct">CT</Radio>
                            <Radio value="mri">MRI</Radio>
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
                                <Radio value="mild_mod_hyper">
                                  Tăng T2 nhẹ–vừa *
                                </Radio>
                                <Radio value="other">Khác</Radio>
                              </div>
                            </Radio.Group>
                          </Form.Item>

                          <Form.Item label="Có hạn chế khuếch tán? *" required>
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
                                <Radio value="yes">Có</Radio>
                                <Radio value="no">Không</Radio>
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

          {/* ===== CEUS – Untreated ===== */}
          {modality === "ceus" && observationKind === "untreated" && (
            <>
              <Divider />
              <Typography.Title level={5} style={{ marginTop: 0 }}>
                CEUS – Tổn thương chưa điều trị
              </Typography.Title>

              <Form.Item label="Điều nào sau đây áp dụng? *" required>
                <Radio.Group
                  value={ceusUntreatedApplies}
                  onChange={(e) => {
                    const next = e.target.value;
                    setCeusUntreatedApplies(next);
                    // reset theo flow
                    setCeusAncillary(null);
                    setCeusArterialBehav(null);
                    setCeusWashout(null);
                    setCeusSize20(null);
                    setCeusSize10(null);
                    setCeusAncillaryNoAphe(null);
                    setCeusAncillaryOtherAphe(null);
                    computeAndSet({
                      ceusUntreatedApplies: next,
                      ceusAncillary: null,
                      ceusArterialBehav: null,
                      ceusWashout: null,
                      ceusSize20: null,
                      ceusSize10: null,
                      ceusAncillaryNoAphe: null,
                      ceusAncillaryOtherAphe: null,
                    });
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
                    onChange={(e) => {
                      const next = e.target.value;
                      setCeusAncillary(next);
                      computeAndSet({ ceusAncillary: next });
                    }}
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
                        // reset theo nhánh
                        setCeusWashout(null);
                        setCeusSize20(null);
                        setCeusSize10(null);
                        setCeusAncillaryNoAphe(null);
                        setCeusAncillaryOtherAphe(null);
                        computeAndSet({
                          ceusArterialBehav: next,
                          ceusWashout: null,
                          ceusSize20: null,
                          ceusSize10: null,
                          ceusAncillaryNoAphe: null,
                          ceusAncillaryOtherAphe: null,
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
                        onChange={(e) => {
                          const next = e.target.value;
                          setCeusSize20(next);
                          computeAndSet({ ceusSize20: next });
                        }}
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
                        onChange={(e) => {
                          const next = e.target.value;
                          setCeusSize10(next);
                          computeAndSet({ ceusSize10: next });
                        }}
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
                          // reset ancillary theo nhánh
                          if (ceusArterialBehav === "no_aphe") {
                            setCeusAncillaryNoAphe(null);
                            computeAndSet({
                              ceusWashout: next,
                              ceusAncillaryNoAphe: null,
                            });
                          } else {
                            setCeusAncillaryOtherAphe(null);
                            computeAndSet({
                              ceusWashout: next,
                              ceusAncillaryOtherAphe: null,
                            });
                          }
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
                          onChange={(e) => {
                            const next = e.target.value;
                            setCeusAncillaryNoAphe(next);
                            computeAndSet({ ceusAncillaryNoAphe: next });
                          }}
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
                          onChange={(e) => {
                            const next = e.target.value;
                            setCeusAncillaryOtherAphe(next);
                            computeAndSet({ ceusAncillaryOtherAphe: next });
                          }}
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
          {modality === "ceus" && observationKind === "treated" && (
            <>
              <Divider />
              <Typography.Title level={5} style={{ marginTop: 0 }}>
                CEUS – Tổn thương đã điều trị
              </Typography.Title>

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
                    computeAndSet({
                      ceusTreatedType: next,
                      ceusAdequate: null,
                      ceusIntra: null,
                      ceusPeri: null,
                      ceusNewAfterNonviable: null,
                      ceusSizeTrend: null,
                      ceusSinceTx: null,
                    });
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
                        computeAndSet({
                          ceusAdequate: next,
                          ceusIntra: null,
                          ceusPeri: null,
                          ceusNewAfterNonviable: null,
                          ceusSizeTrend: null,
                          ceusSinceTx: null,
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
                          onChange={(e) => {
                            const next = e.target.value;
                            setCeusIntra(next);
                            computeAndSet({ ceusIntra: next });
                          }}
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
                            computeAndSet({
                              ceusPeri: next,
                              ceusNewAfterNonviable: null,
                              ceusSizeTrend: null,
                              ceusSinceTx: null,
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
                                computeAndSet({
                                  ceusNewAfterNonviable: next,
                                  ceusSizeTrend: null,
                                  ceusSinceTx: null,
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
                                computeAndSet({
                                  ceusSizeTrend: next,
                                  ceusSinceTx: null,
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
                              onChange={(e) => {
                                const next = e.target.value;
                                setCeusSinceTx(next);
                                computeAndSet({ ceusSinceTx: next });
                              }}
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

          {/* ===== US – Surveillance ===== */}
          {modality === "us_surv" && (
            <>
              <Divider />
              <Typography.Title level={5} style={{ marginTop: 0 }}>
                Siêu âm (theo dõi định kỳ) – US Surveillance
              </Typography.Title>

              <Form.Item
                label="Người bệnh có thuộc nhóm nguy cơ cao HCC? *"
                required
              >
                <Radio.Group
                  value={usHighRisk}
                  onChange={(e) => {
                    const next = e.target.value;
                    setUsHighRisk(next);
                    setUsFindings(null);
                    setUsObsKind(null);
                    setUsAFP(null);
                    setUsVIS(null);
                    computeAndSet({
                      usHighRisk: next,
                      usFindings: null,
                      usObsKind: null,
                      usAFP: null,
                      usVIS: null,
                      // observationKind không cần cho US nhưng giữ state sạch
                      observationKind: null,
                    });
                  }}
                >
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 8 }}
                  >
                    {US_HIGH_RISK_OPTIONS.map((o) => (
                      <Radio key={o.value} value={o.value}>
                        {o.label}
                      </Radio>
                    ))}
                  </div>
                </Radio.Group>
              </Form.Item>

              {usHighRisk === "yes" && (
                <>
                  <Form.Item label="Bạn có phát hiện gì? *" required>
                    <Radio.Group
                      value={usFindings}
                      onChange={(e) => {
                        const next = e.target.value;
                        setUsFindings(next);
                        setUsObsKind(null);
                        setUsAFP(null);
                        setUsVIS(null);
                        computeAndSet({
                          usFindings: next,
                          usObsKind: null,
                          usAFP: null,
                          usVIS: null,
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
                        {US_FINDINGS_OPTIONS.map((o) => (
                          <Radio key={o.value} value={o.value}>
                            {o.label}
                          </Radio>
                        ))}
                      </div>
                    </Radio.Group>
                  </Form.Item>

                  {usFindings === "no_findings" && (
                    <>
                      <Form.Item label="Mức AFP huyết thanh? *" required>
                        <Radio.Group
                          value={usAFP}
                          onChange={(e) => {
                            const next = e.target.value;
                            setUsAFP(next);
                            if (
                              next !== "lt20_no_increase" &&
                              next !== "unknown"
                            ) {
                              setUsVIS(null);
                              computeAndSet({ usAFP: next, usVIS: null });
                            } else {
                              computeAndSet({ usAFP: next });
                            }
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 8,
                            }}
                          >
                            {US_AFP_OPTIONS.map((o) => (
                              <Radio key={o.value} value={o.value}>
                                {o.label}
                              </Radio>
                            ))}
                          </div>
                        </Radio.Group>
                      </Form.Item>

                      {(usAFP === "lt20_no_increase" ||
                        usAFP === "unknown") && (
                        <Form.Item label="Điểm trực quan hóa (VIS)? *" required>
                          <Radio.Group
                            value={usVIS}
                            onChange={(e) => {
                              const next = e.target.value;
                              setUsVIS(next);
                              computeAndSet({ usVIS: next });
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 8,
                              }}
                            >
                              {US_VIS_OPTIONS.map((o) => (
                                <Radio key={o.value} value={o.value}>
                                  {o.label}
                                </Radio>
                              ))}
                            </div>
                          </Radio.Group>
                          <div
                            style={{
                              marginTop: 8,
                              fontSize: 12,
                              lineHeight: 1.5,
                            }}
                          >
                            <div>
                              <strong>Ví dụ VIS-A:</strong> Gan đồng nhất/ít dị
                              đồng; suy giảm tia/bóng tối thiểu; thấy gần như
                              toàn bộ gan.
                            </div>
                            <div style={{ marginTop: 4 }}>
                              <strong>Ví dụ VIS-B:</strong> Dị đồng nhu mô có
                              thể che tổn thương nhỏ; suy giảm tia/bóng mức vừa;
                              một phần gan/cơ hoành không thấy.
                            </div>
                            <div style={{ marginTop: 4 }}>
                              <strong>Ví dụ VIS-C:</strong> Dị đồng nặng; suy
                              giảm tia/bóng nặng; >50% thùy không thấy hoặc >50%
                              cơ hoành không thấy.
                            </div>
                          </div>
                        </Form.Item>
                      )}
                    </>
                  )}

                  {usFindings === "observations" && (
                    <>
                      <Form.Item
                        label="Mô tả phù hợp nhất cho observation(s)? *"
                        required
                      >
                        <Radio.Group
                          value={usObsKind}
                          onChange={(e) => {
                            const next = e.target.value;
                            setUsObsKind(next);
                            setUsAFP(null);
                            setUsVIS(null);
                            computeAndSet({
                              usObsKind: next,
                              usAFP: null,
                              usVIS: null,
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
                            {US_OBS_KIND_OPTIONS.map((o) => (
                              <Radio key={o.value} value={o.value}>
                                {o.label}
                              </Radio>
                            ))}
                          </div>
                        </Radio.Group>
                        <div style={{ marginTop: 8, fontSize: 12 }}>
                          <em>
                            (*) Lành tính chắc chắn: nang đơn thuần, mỡ quanh
                            túi mật, hemangioma đã xác nhận, ...
                          </em>
                        </div>
                      </Form.Item>

                      {usObsKind === "only_definitely_benign" && (
                        <>
                          <Form.Item label="Mức AFP huyết thanh? *" required>
                            <Radio.Group
                              value={usAFP}
                              onChange={(e) => {
                                const next = e.target.value;
                                setUsAFP(next);
                                if (
                                  next !== "lt20_no_increase" &&
                                  next !== "unknown"
                                ) {
                                  setUsVIS(null);
                                  computeAndSet({ usAFP: next, usVIS: null });
                                } else {
                                  computeAndSet({ usAFP: next });
                                }
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: 8,
                                }}
                              >
                                {US_AFP_OPTIONS.map((o) => (
                                  <Radio key={o.value} value={o.value}>
                                    {o.label}
                                  </Radio>
                                ))}
                              </div>
                            </Radio.Group>
                          </Form.Item>

                          {(usAFP === "lt20_no_increase" ||
                            usAFP === "unknown") && (
                            <Form.Item
                              label="Điểm trực quan hóa (VIS)? *"
                              required
                            >
                              <Radio.Group
                                value={usVIS}
                                onChange={(e) => {
                                  const next = e.target.value;
                                  setUsVIS(next);
                                  computeAndSet({ usVIS: next });
                                }}
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 8,
                                  }}
                                >
                                  {US_VIS_OPTIONS.map((o) => (
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

                      {usObsKind === "lt10_not_def_benign" && (
                        <>
                          <Form.Item label="Mức AFP huyết thanh? *" required>
                            <Radio.Group
                              value={usAFP}
                              onChange={(e) => {
                                const next = e.target.value;
                                setUsAFP(next);
                                if (
                                  next !== "lt20_no_increase" &&
                                  next !== "unknown"
                                ) {
                                  setUsVIS(null);
                                  computeAndSet({ usAFP: next, usVIS: null });
                                } else {
                                  computeAndSet({ usAFP: next });
                                }
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: 8,
                                }}
                              >
                                {US_AFP_OPTIONS.map((o) => (
                                  <Radio key={o.value} value={o.value}>
                                    {o.label}
                                  </Radio>
                                ))}
                              </div>
                            </Radio.Group>
                          </Form.Item>

                          {(usAFP === "lt20_no_increase" ||
                            usAFP === "unknown") && (
                            <Form.Item
                              label="Điểm trực quan hóa (VIS)? *"
                              required
                            >
                              <Radio.Group
                                value={usVIS}
                                onChange={(e) => {
                                  const next = e.target.value;
                                  setUsVIS(next);
                                  computeAndSet({ usVIS: next });
                                }}
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 8,
                                  }}
                                >
                                  {US_VIS_OPTIONS.map((o) => (
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
                </>
              )}
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
};

export default LIRADSForm;
