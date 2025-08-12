// LIRADSForm.jsx – LI‑RADS (CT/MRI – Chưa điều trị) – Tiếng Việt + Realtime

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

// Nhánh Untreated → None of the above apply
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

/* ====================== TIỆN ÍCH ====================== */
const getLabel = (arr, v) =>
  getLabelFromValue?.(arr, v) ||
  arr.find((x) => x.value === v)?.label ||
  v ||
  "--";

// Khuyến nghị nhanh
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
};

// Thêm helper để lấy khuyến nghị mặc định theo LR (đặt gần REC)
const getRecByLR = (lr) => {
  const plain = lr.replace("LR‑", "LR-"); // chuẩn hóa
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

  // Untreated – phần 1
  const [untreatedApplies, setUntreatedApplies] = useState(null);
  const [untreatedAncillary, setUntreatedAncillary] = useState(null);

  // Untreated – phần 2 (applies === "none")
  const [featMulti, setFeatMulti] = useState([]); // multi-select, không bắt buộc
  const [aphe, setAphe] = useState(null); // yes/no
  const [sizeCat, setSizeCat] = useState(null); // <10, 10-19, >=20
  const [ancillaryNone, setAncillaryNone] = useState(null); // malig/benign/both/neither

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

  const onReset = () => {
    form.resetFields();
    setModality(null);
    setObservationKind(null);
    resetUntreated();
    setLrCategory("");
    setLrRecommendation("");
  };

  /* ====================== LOGIC LI‑RADS ====================== */

  // Bump 1 bậc LR (tối đa LR-5)
  const bumpOne = (lr) => {
    const order = ["LR-1", "LR-2", "LR-3", "LR-4", "LR-5"];
    const idx = order.indexOf(lr);
    if (idx < 0) return lr;
    return order[Math.min(idx + 1, order.length - 1)];
  };

  // Tính phần 1: Untreated + applies ≠ "none"
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

  // Tính phần 2: Untreated + applies === "none"
  // Thay toàn bộ hàm computeUntreatedPart2 bằng bản này
  const computeUntreatedPart2 = ({ features, apheVal, sizeVal, ancillary }) => {
    // Ancillary + APHE + Size đều phải có (features có thể rỗng)
    if (!ancillary || !apheVal || !sizeVal) return { lr: "", rec: "" };

    const featCount = Array.isArray(features) ? features.length : 0;
    const hasAnyFeature = featCount > 0;

    // QUY TẮC ƯU TIÊN CAO: APHE=Yes + size (10–19 hoặc ≥20) + ≥1 feature → LR‑5
    if (
      apheVal === "yes" &&
      (sizeVal === "10-19" || sizeVal === ">=20") &&
      hasAnyFeature
    ) {
      return { lr: "LR‑4", rec: REC.CONS_MGMT };
    }

    // Base theo ancillary (đáp ứng yêu cầu "benign ít nhất LR-2")
    let baseLR = "";
    if (ancillary === "malig") {
      baseLR = "LR-4";
    } else if (ancillary === "benign") {
      baseLR = "LR-2";
      // Ngoại lệ đã yêu cầu: benign + APHE=Yes + size >=20 → LR‑3
      if (apheVal === "yes" && sizeVal === ">=20") {
        baseLR = "LR-3";
      }
    } else if (ancillary === "both" || ancillary === "neither") {
      baseLR = "LR-3";
      // Ngoại lệ cũ: APHE=Yes + size >=20 → LR‑4
      if (apheVal === "yes" && sizeVal === ">=20") {
        baseLR = "LR-4";
      }
    }

    // BUMP +1 theo yêu cầu mới:
    // - (feat >= 1 && APHE = yes)  OR  (feat >= 2 && APHE = no)
    const shouldBump =
      (apheVal === "yes" && featCount >= 1) ||
      (apheVal === "no" && featCount >= 2);

    if (shouldBump) {
      baseLR = bumpOne(baseLR);
    }

    // Gán khuyến nghị theo LR cuối cùng (không giữ rec cũ sau khi bump)
    const finalRec = getRecByLR(baseLR);

    return { lr: baseLR.replace("LR-", "LR‑"), rec: finalRec };
  };

  // Tính tổng theo các tham số (dùng cho realtime và override)
  const computeLIRADSFrom = (
    m,
    obs,
    applies,
    ancillary1,
    features,
    apheVal,
    sizeVal,
    ancillary2
  ) => {
    if (m !== "ct_mri" || obs !== "untreated") return { lr: "", rec: "" };

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
  };

  // ===== Realtime compute với override (FIX async setState) =====
  const computeAndSet = (over = {}) => {
    const m = over.modality ?? modality;
    const obs = over.observationKind ?? observationKind;

    const applies = over.untreatedApplies ?? untreatedApplies;
    const anc1 = over.untreatedAncillary ?? untreatedAncillary;

    const feats = over.featMulti ?? featMulti;
    const apheVal = over.aphe ?? aphe;
    const sizeVal = over.sizeCat ?? sizeCat;
    const anc2 = over.ancillaryNone ?? ancillaryNone;

    const { lr, rec } = computeLIRADSFrom(
      m,
      obs,
      applies,
      anc1,
      feats,
      apheVal,
      sizeVal,
      anc2
    );
    setLrCategory(lr || "");
    setLrRecommendation(rec || "");
  };

  // Giữ cho các nút “Kết quả”
  const computeLIRADS = () =>
    computeLIRADSFrom(
      modality,
      observationKind,
      untreatedApplies,
      untreatedAncillary,
      featMulti,
      aphe,
      sizeCat,
      ancillaryNone
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
        <caption><strong>LI‑RADS (CT/MRI – Chưa điều trị)</strong></caption>
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
          <h2>LI‑RADS – CT/MRI (Chưa điều trị) – Bản tiếng Việt</h2>

          {/* 1) Chọn phương thức */}
          <Form.Item label="Chọn phương thức chẩn đoán hình ảnh:" required>
            <Radio.Group
              value={modality}
              onChange={(e) => {
                const next = e.target.value;
                setModality(next);
                setObservationKind(null);
                resetUntreated();
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

          {/* 3) Nhánh CHƯA ĐIỀU TRỊ */}
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
                    // reset các câu con
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

              {/* PHẦN 1: definitely/probably benign → hỏi ancillary */}
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

              {/* PHẦN 2: applies === none */}
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
