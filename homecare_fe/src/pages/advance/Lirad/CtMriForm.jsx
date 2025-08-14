// CTMRIForm.jsx — Standalone CT/MRI (Untreated & Treated)
// - Tự quản lý toàn bộ state + logic tính LI-RADS cho CT/MRI
// - UI AntD + module SCSS
// - Không phụ thuộc file/logic khác
// - Có copy bảng HTML kết quả, tính realtime, reset, tính thủ công

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

const { Text, Title } = Typography;

/* ====================== HẰNG SỐ ====================== */
const OBSERVATION_KIND_OPTIONS = [
  { label: "Chưa điều trị (Untreated)", value: "untreated" },
  { label: "Đã điều trị (Treated)", value: "treated" },
  { label: "Không phát hiện tổn thương", value: "none" },
];

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

/* ===== Khuyến nghị tiêu chuẩn (phần dùng cho CT/MRI) ===== */
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
};

/* ====================== TIỆN ÍCH ====================== */
const getLabel = (arr, v) => arr.find((x) => x.value === v)?.label || v || "--";

const getRecByLR = (lr) => {
  switch (lr) {
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

const bumpOne = (lr) => {
  const order = ["LR-1", "LR-2", "LR-3", "LR-4", "LR-5"];
  const idx = order.indexOf(lr);
  if (idx < 0) return lr;
  return order[Math.min(idx + 1, order.length - 1)];
};

/* ====================== LOGIC LI-RADS – CT/MRI ====================== */
/* ----- CT/MRI – Untreated (phần 1) ----- */
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

/* ----- CT/MRI – Untreated (phần 2: None) ----- */
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
    ancillary === "both" &&
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

  const finalRec = finalLR === "LR-5" ? REC.CONS_MGMT : getRecByLR(finalLR);
  return { lr: finalLR, rec: finalRec };
};

/* ----- CT/MRI – Treated ----- */
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
  // Fallback
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

/* ====================== COMPONENT ====================== */
export default function CTMRIForm() {
  const [form] = Form.useForm();

  // Observation Kind
  const [observationKind, setObservationKind] = useState(null);

  /* ===== Untreated ===== */
  const [untreatedApplies, setUntreatedApplies] = useState(null);
  const [untreatedAncillary, setUntreatedAncillary] = useState(null);
  const [featMulti, setFeatMulti] = useState([]);
  const [aphe, setAphe] = useState(null);
  const [sizeCat, setSizeCat] = useState(null);
  const [ancillaryNone, setAncillaryNone] = useState(null);

  /* ===== Treated ===== */
  const [treatedType, setTreatedType] = useState(null);
  const [radMasslike, setRadMasslike] = useState(null);
  const [radExamType, setRadExamType] = useState(null);
  const [radMriT2, setRadMriT2] = useState(null);
  const [radMriDiff, setRadMriDiff] = useState(null);
  const [nonRadMasslike, setNonRadMasslike] = useState(null);
  const [nonRadExamType, setNonRadExamType] = useState(null);
  const [nonRadMriT2, setNonRadMriT2] = useState(null);
  const [nonRadMriDiff, setNonRadMriDiff] = useState(null);

  // Kết quả
  const [lrCategory, setLrCategory] = useState("");
  const [lrRecommendation, setLrRecommendation] = useState("");

  /* ===== Reset helpers ===== */
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
    setObservationKind(null);
    resetUntreated();
    resetTreated();
    setLrCategory("");
    setLrRecommendation("");
  };

  /* ===== Tổng hợp tính LI-RADS từ state của CT/MRI ===== */
  const computeCTMRI = () => {
    if (!observationKind) return { lr: "", rec: "" };

    if (observationKind === "untreated") {
      if (untreatedApplies && untreatedApplies !== "none") {
        return computeUntreatedPart1(untreatedApplies, untreatedAncillary);
      }
      if (untreatedApplies === "none") {
        return computeUntreatedPart2({
          features: featMulti,
          apheVal: aphe,
          sizeVal: sizeCat,
          ancillary: ancillaryNone,
        });
      }
      return { lr: "", rec: "" };
    }

    if (observationKind === "treated") {
      if (!treatedType) return { lr: "", rec: "" };
      if (treatedType === "radiation") {
        return computeTreatedRadiation(
          radMasslike,
          radExamType,
          radMriT2,
          radMriDiff
        );
      }
      if (treatedType === "non_radiation") {
        return computeTreatedNonRadiation(
          nonRadMasslike,
          nonRadExamType,
          nonRadMriT2,
          nonRadMriDiff
        );
      }
      return { lr: "", rec: "" };
    }

    if (observationKind === "none") {
      return { lr: "Negative Study", rec: REC.SURV_6M_ONLY };
    }

    return { lr: "", rec: "" };
  };

  /* ===== gen HTML kết quả (CT/MRI only) ===== */
  const genHtml = async () => {
    const rows = [];
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

    let result = { lr: "", rec: "" };
    try {
      result = computeCTMRI();
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
        <caption><strong>LI-RADS – CT/MRI</strong></caption>
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
      const { lr, rec } = computeCTMRI();
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
                // reset đúng nhánh
                resetUntreated();
                resetTreated();
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

          {/* ===== Untreated ===== */}
          {observationKind === "untreated" && (
            <>
              <Divider />
              <Title level={5} style={{ marginTop: 0 }}>
                Tổn thương chưa điều trị (CT/MRI)
              </Title>

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
                    setLrCategory("");
                    setLrRecommendation("");
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
                      onChange={(e) => setAphe(e.target.value)}
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
                      onChange={(e) => setSizeCat(e.target.value)}
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
                      onChange={(e) => setAncillaryNone(e.target.value)}
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
          {observationKind === "treated" && (
            <>
              <Divider />
              <Title level={5} style={{ marginTop: 0 }}>
                Tổn thương đã điều trị (CT/MRI)
              </Title>

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
                    setLrCategory("");
                    setLrRecommendation("");
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
                              onChange={(e) => setRadMriT2(e.target.value)}
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

                          <Form.Item label="Có hạn chế khuếch tán? *" required>
                            <Radio.Group
                              value={radMriDiff}
                              onChange={(e) => setRadMriDiff(e.target.value)}
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
                              onChange={(e) => setNonRadMriT2(e.target.value)}
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

                          <Form.Item label="Có hạn chế khuếch tán? *" required>
                            <Radio.Group
                              value={nonRadMriDiff}
                              onChange={(e) => setNonRadMriDiff(e.target.value)}
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

          {/* ===== None ===== */}
          {observationKind === "none" && (
            <>
              <Divider />
              <div style={{ fontStyle: "italic", color: "#555" }}>
                Không phát hiện tổn thương trên CT/MRI.
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
