// BosniakForm.jsx – Máy tính phân loại Bosniak (Khối dạng nang thận) – CT + MRI (tiếng Việt)

import React, { useState } from "react";
import { Form, Button, Radio, Row, Col, Divider, Typography } from "antd";
import { CopyOutlined, ReloadOutlined } from "@ant-design/icons";
import styles from "./BosniakForm.module.scss";
import { toast } from "react-toastify";
import {
  getLabelFromValue,
  genAITextToHtml,
  STYLE_COPY,
} from "../../../constant/app";

const { Text } = Typography;

/* ====================== HẰNG SỐ (tiếng Việt) ====================== */

// Modality
const MODALITY_OPTIONS = [
  { label: "CT", value: "ct" },
  { label: "MRI", value: "mri" },
];

/* ---------- CT ---------- */
const CT_PROTOCOL_OPTIONS = [
  { label: "CT không tiêm cản quang (Noncontrast CT)", value: "noncontrast" },
  { label: "CT pha tĩnh mạch cửa (Portal venous phase CT)", value: "portal" },
  {
    label: "CT giao thức khối u thận (Renal mass protocol CT)",
    value: "renal_mass",
  },
];

const NONCONTRAST_LESION_OPTIONS = [
  {
    label: "Đồng nhất, độ đậm độ ≥70 HU",
    value: "nc_homo_ge70",
    score: "Bosniak II",
  },
  {
    label: "Đồng nhất, độ đậm độ từ -9 đến 20 HU",
    value: "nc_homo_-9_20",
    score: "Bosniak II",
  },
  {
    label: "Đồng nhất, giảm đậm độ, và quá nhỏ để đặc trưng hóa",
    value: "nc_low_tstc",
    score: "Bosniak II",
  },
  { label: "Không thuộc các mô tả trên", value: "nc_neither", score: "N/A_CT" },
];

const PORTAL_LESION_OPTIONS = [
  {
    label: "Đồng nhất, độ đậm độ 21–30 HU",
    value: "pv_21_30",
    score: "Bosniak II",
  },
  {
    label: "Đồng nhất, giảm đậm độ, và quá nhỏ để đặc trưng hóa",
    value: "pv_low_tstc",
    score: "Bosniak II",
  },
  { label: "Không thuộc các mô tả trên", value: "pv_neither", score: "N/A_CT" },
];

const SOLID_FEATURE_OPTIONS = [
  {
    label: "Khối đặc >3 cm hoặc ≥25% mô tăng đậm độ",
    value: "solid_gt3_or_25",
    score: "N/A_CT",
  },
  {
    label: "Tổn thương không tăng quang không đồng nhất",
    value: "solid_hetero_non_enh",
    score: "N/A_CT",
  },
  { label: "Vôi hóa dày đặc", value: "solid_calc_abundant", score: "N/A_CT" },
  { label: "Có mỡ đại thể", value: "solid_fat", score: "N/A_CT" },
  { label: "Không có đặc điểm nào", value: "solid_neither", score: null },
];

const ENHANCING_NODULE_OPTIONS = [
  { label: "Có", value: "nodule_yes", score: "Bosniak IV" },
  { label: "Không", value: "nodule_no", score: null },
];

const SEPTA_OPTIONS = [
  { label: "1–3 vách, dày ≤2 mm", value: "septa_1_3_le2" },
  { label: "≥4 vách, dày ≤2 mm", value: "septa_ge4_le2" },
  { label: "≥1 vách trơn, dày 3 mm", value: "septa_ge1_smooth_3" },
  { label: "≥1 vách dày ≥4 mm", value: "septa_ge1_ge4" },
  {
    label: "≥1 vách không đều (có ≤3 mm lồi lồi bờ tù)",
    value: "septa_ge1_irregular",
  },
  { label: "Không có vách", value: "septa_none" },
];

const WALL_OPTIONS = [
  { label: "Thành không đều (có ≤3 mm lồi bờ tù)", value: "wall_irregular" },
  { label: "Thành dày ≥4 mm", value: "wall_ge4" },
  { label: "Thành trơn, dày 3 mm", value: "wall_smooth_3" },
  {
    label: "Thành trơn, mỏng (≤2 mm) (± tăng quang)",
    value: "wall_smooth_thin",
  },
];

const ATTENUATION_OPTIONS = [
  { label: "-9 đến 20 HU", value: "att_-9_20" },
  { label: ">20 HU", value: "att_gt20" },
];

const CALCIFICATION_OPTIONS = [
  { label: "Có", value: "calc_yes" },
  { label: "Không", value: "calc_no" },
];

/* ---------- MRI ---------- */
const MRI_PROTOCOL_OPTIONS = [
  { label: "MRI không tiêm (Unenhanced MRI)", value: "unenhanced" },
  {
    label: "MRI giao thức khối u thận (Renal mass protocol MRI)",
    value: "renal_mass_mri",
  },
];

const MRI_UNENHANCED_LESION_OPTIONS = [
  {
    label: "Đồng nhất, tín hiệu T2w tương tự dịch não tủy (CSF)",
    value: "mri_t2_csf_like",
    score: "Bosniak II",
  },
  {
    label: "Đồng nhất, tín hiệu T1w fat-sat ≥2,5 lần so với nhu mô thận",
    value: "mri_t1fs_ge2_5x_kidney",
    score: "Bosniak II",
  },
  {
    label: "Không thuộc các mô tả trên",
    value: "mri_unenh_neither",
    score: "N/A_MRI",
  },
];

const MRI_SOLID_FEATURE_OPTIONS = [
  { label: "≥25% mô tăng quang", value: "mri_enhancing_25", score: "N/A_MRI" },
  { label: "Có mỡ đại thể", value: "mri_macroscopic_fat", score: "N/A_MRI" },
  { label: "Không có đặc điểm nào", value: "mri_neither", score: null },
];

const YES_NO_OPTIONS = [
  { label: "Có", value: "yes" },
  { label: "Không", value: "no" },
];

// Thông điệp “không áp dụng”
const NOT_APPLY_CT = "Phân loại Bosniak không áp dụng cho tổn thương này.";
const NOT_APPLY_MRI = "Phân loại Bosniak không áp dụng cho khối u thận đặc.";

/* ====================== COMPONENT ====================== */

const BosniakForm = () => {
  const [form] = Form.useForm();

  // dùng chung
  const [modality, setModality] = useState(null);
  const [bosniak, setBosniak] = useState("");
  const [geminiResponse, setGeminiResponse] = useState("");

  // CT
  const [ctProtocol, setCtProtocol] = useState(null);
  const [ncLesion, setNcLesion] = useState(null);
  const [pvLesion, setPvLesion] = useState(null);
  const [solidFeature, setSolidFeature] = useState(null);
  const [enhancingNodule, setEnhancingNodule] = useState(null);
  const [septaKind, setSeptaKind] = useState(null);
  const [wallKind, setWallKind] = useState(null);
  const [attenuation, setAttenuation] = useState(null);
  const [calcifications, setCalcifications] = useState(null);

  // MRI
  const [mriProtocol, setMriProtocol] = useState(null);
  const [mriUnenhancedLesion, setMriUnenhancedLesion] = useState(null);
  const [mriSolidFeature, setMriSolidFeature] = useState(null);
  const [mriEnhancingNodule, setMriEnhancingNodule] = useState(null);
  const [mriSeptaKind, setMriSeptaKind] = useState(null);
  const [mriWallKind, setMriWallKind] = useState(null);
  const [mriT1fsHetero, setMriT1fsHetero] = useState(null); // câu hỏi phụ
  const [mriT2CsfLike, setMriT2CsfLike] = useState(null); // câu hỏi phụ
  const [mriCalcifications, setMriCalcifications] = useState(null);

  const resetCT = () => {
    setCtProtocol(null);
    setNcLesion(null);
    setPvLesion(null);
    setSolidFeature(null);
    setEnhancingNodule(null);
    setSeptaKind(null);
    setWallKind(null);
    setAttenuation(null);
    setCalcifications(null);
  };

  const resetMRI = () => {
    setMriProtocol(null);
    setMriUnenhancedLesion(null);
    setMriSolidFeature(null);
    setMriEnhancingNodule(null);
    setMriSeptaKind(null);
    setMriWallKind(null);
    setMriT1fsHetero(null);
    setMriT2CsfLike(null);
    setMriCalcifications(null);
  };

  const onReset = () => {
    form.resetFields();
    setModality(null);
    resetCT();
    resetMRI();
    setBosniak("");
    setGeminiResponse("");
  };

  /* ====================== TÍNH KẾT QUẢ BOSNIAK ====================== */

  const computeBosniak = () => {
    if (modality === "ct") {
      if (!ctProtocol) throw new Error("Vui lòng chọn giao thức CT.");

      if (ctProtocol === "noncontrast") {
        const found = NONCONTRAST_LESION_OPTIONS.find(
          (o) => o.value === ncLesion
        );
        if (!found)
          throw new Error("Vui lòng chọn mô tả tổn thương (CT không tiêm).");
        return found.score === "N/A_CT" ? NOT_APPLY_CT : found.score;
      }

      if (ctProtocol === "portal") {
        const found = PORTAL_LESION_OPTIONS.find((o) => o.value === pvLesion);
        if (!found)
          throw new Error(
            "Vui lòng chọn mô tả tổn thương (CT pha tĩnh mạch cửa)."
          );
        return found.score === "N/A_CT" ? NOT_APPLY_CT : found.score;
      }

      // CT giao thức khối u thận
      if (ctProtocol === "renal_mass") {
        if (!solidFeature)
          throw new Error("Vui lòng chọn đặc điểm 'khối đặc' (CT).");
        if (solidFeature !== "solid_neither") return NOT_APPLY_CT;

        if (!enhancingNodule)
          throw new Error("Vui lòng chọn có/không nốt tăng quang.");
        if (enhancingNodule === "nodule_yes") return "Bosniak IV";

        if (!wallKind)
          throw new Error("Vui lòng chọn tình trạng thành tổn thương.");
        if (!septaKind) throw new Error("Vui lòng chọn loại vách (septa).");

        if (wallKind === "wall_irregular" || wallKind === "wall_ge4")
          return "Bosniak III";
        if (
          septaKind === "septa_ge1_ge4" ||
          septaKind === "septa_ge1_irregular"
        )
          return "Bosniak III";

        if (wallKind === "wall_smooth_3") {
          if (
            [
              "septa_1_3_le2",
              "septa_ge4_le2",
              "septa_ge1_smooth_3",
              "septa_none",
            ].includes(septaKind)
          ) {
            return "Bosniak IIF";
          }
        }

        if (wallKind === "wall_smooth_thin") {
          if (septaKind === "septa_1_3_le2") return "Bosniak II";
          if (["septa_ge4_le2", "septa_ge1_smooth_3"].includes(septaKind))
            return "Bosniak IIF";
          if (["septa_ge1_ge4", "septa_ge1_irregular"].includes(septaKind))
            return "Bosniak III";

          if (septaKind === "septa_none") {
            if (!attenuation)
              throw new Error("Vui lòng chọn mức độ đậm độ (attenuation).");

            if (attenuation === "att_gt20") return "Bosniak II";
            if (attenuation === "att_-9_20") {
              if (!calcifications)
                throw new Error("Vui lòng chọn có/không vôi hóa.");
              return calcifications === "calc_yes" ? "Bosniak II" : "Bosniak I";
            }
          }
        }

        return "Không xác định";
      }
    }

    if (modality === "mri") {
      if (!mriProtocol) throw new Error("Vui lòng chọn giao thức MRI.");

      if (mriProtocol === "unenhanced") {
        const found = MRI_UNENHANCED_LESION_OPTIONS.find(
          (o) => o.value === mriUnenhancedLesion
        );
        if (!found)
          throw new Error("Vui lòng chọn mô tả tổn thương (MRI không tiêm).");
        return found.score === "N/A_MRI" ? NOT_APPLY_MRI : found.score;
      }

      // MRI giao thức khối u thận
      if (mriProtocol === "renal_mass_mri") {
        if (!mriSolidFeature)
          throw new Error("Vui lòng chọn đặc điểm ban đầu (MRI khối u thận).");
        const sf = MRI_SOLID_FEATURE_OPTIONS.find(
          (o) => o.value === mriSolidFeature
        );
        if (sf?.score === "N/A_MRI") return NOT_APPLY_MRI;

        if (!mriEnhancingNodule)
          throw new Error("Vui lòng chọn có/không nốt tăng quang.");
        if (mriEnhancingNodule === "yes") return "Bosniak IV";

        if (!mriWallKind)
          throw new Error("Vui lòng chọn tình trạng thành (walls).");
        if (!mriSeptaKind) throw new Error("Vui lòng chọn loại vách (septa).");

        // Thành không đều / ≥4 mm → luôn III
        if (["wall_irregular", "wall_ge4"].includes(mriWallKind))
          return "Bosniak III";

        // Thành trơn 3 mm
        if (mriWallKind === "wall_smooth_3") {
          if (["septa_ge1_ge4", "septa_ge1_irregular"].includes(mriSeptaKind))
            return "Bosniak III";
          return "Bosniak IIF"; // các lựa chọn còn lại
        }

        // Thành trơn mỏng ≤2 mm
        if (mriWallKind === "wall_smooth_thin") {
          if (mriSeptaKind === "septa_1_3_le2") {
            if (!mriT1fsHetero)
              throw new Error(
                "Vui lòng trả lời câu: Tổn thương KHÔNG tăng quang và tăng tín hiệu KHÔNG đồng nhất trên T1w fat-sat?"
              );
            return mriT1fsHetero === "yes" ? "Bosniak IIF" : "Bosniak II";
          }

          if (["septa_ge4_le2", "septa_ge1_smooth_3"].includes(mriSeptaKind))
            return "Bosniak IIF";
          if (["septa_ge1_ge4", "septa_ge1_irregular"].includes(mriSeptaKind))
            return "Bosniak III";

          if (mriSeptaKind === "septa_none") {
            if (!mriT2CsfLike)
              throw new Error(
                "Vui lòng trả lời: Tín hiệu T2w có đồng nhất và tương tự CSF không?"
              );
            if (mriT2CsfLike === "no") return "Bosniak II";
            if (!mriCalcifications)
              throw new Error("Vui lòng chọn có/không vôi hóa.");
            return mriCalcifications === "yes" ? "Bosniak II" : "Bosniak I";
          }
        }

        return "Không xác định";
      }
    }

    return "";
  };

  /* ====================== HTML & ACTIONS ====================== */

  const genHtml = async ({ isCopy }) => {
    const rows = [];
    rows.push([
      "Phương thức (modality)",
      getLabelFromValue(MODALITY_OPTIONS, modality) || "--",
    ]);

    if (modality === "ct") {
      rows.push([
        "Giao thức CT",
        getLabelFromValue(CT_PROTOCOL_OPTIONS, ctProtocol) || "--",
      ]);

      if (ctProtocol === "noncontrast") {
        rows.push([
          "Mô tả tổn thương (CT không tiêm)",
          getLabelFromValue(NONCONTRAST_LESION_OPTIONS, ncLesion) || "--",
        ]);
      }

      if (ctProtocol === "portal") {
        rows.push([
          "Mô tả tổn thương (CT pha tĩnh mạch cửa)",
          getLabelFromValue(PORTAL_LESION_OPTIONS, pvLesion) || "--",
        ]);
      }

      if (ctProtocol === "renal_mass") {
        rows.push([
          "Đặc điểm khối đặc",
          getLabelFromValue(SOLID_FEATURE_OPTIONS, solidFeature) || "--",
        ]);

        if (solidFeature === "solid_neither") {
          rows.push([
            "Có nốt tăng quang?",
            getLabelFromValue(ENHANCING_NODULE_OPTIONS, enhancingNodule) ||
              "--",
          ]);

          if (enhancingNodule === "nodule_no") {
            rows.push([
              "Thành tổn thương",
              getLabelFromValue(WALL_OPTIONS, wallKind) || "--",
            ]);
            rows.push([
              "Vách (septa)",
              getLabelFromValue(SEPTA_OPTIONS, septaKind) || "--",
            ]);

            if (wallKind === "wall_smooth_thin" && septaKind === "septa_none") {
              rows.push([
                "Đậm độ (attenuation)",
                getLabelFromValue(ATTENUATION_OPTIONS, attenuation) || "--",
              ]);
              if (attenuation === "att_-9_20") {
                rows.push([
                  "Vôi hóa",
                  getLabelFromValue(CALCIFICATION_OPTIONS, calcifications) ||
                    "--",
                ]);
              }
            }
          }
        }
      }
    }

    if (modality === "mri") {
      rows.push([
        "Giao thức MRI",
        getLabelFromValue(MRI_PROTOCOL_OPTIONS, mriProtocol) || "--",
      ]);

      if (mriProtocol === "unenhanced") {
        rows.push([
          "Mô tả tổn thương (MRI không tiêm)",
          getLabelFromValue(
            MRI_UNENHANCED_LESION_OPTIONS,
            mriUnenhancedLesion
          ) || "--",
        ]);
      }

      if (mriProtocol === "renal_mass_mri") {
        rows.push([
          "Đặc điểm ban đầu",
          getLabelFromValue(MRI_SOLID_FEATURE_OPTIONS, mriSolidFeature) || "--",
        ]);

        if (mriSolidFeature === "mri_neither") {
          rows.push([
            "Có nốt tăng quang?",
            getLabelFromValue(YES_NO_OPTIONS, mriEnhancingNodule) || "--",
          ]);

          if (mriEnhancingNodule === "no") {
            rows.push([
              "Thành tổn thương",
              getLabelFromValue(WALL_OPTIONS, mriWallKind) || "--",
            ]);
            rows.push([
              "Vách (septa)",
              getLabelFromValue(SEPTA_OPTIONS, mriSeptaKind) || "--",
            ]);

            if (
              mriWallKind === "wall_smooth_thin" &&
              mriSeptaKind === "septa_1_3_le2"
            ) {
              rows.push([
                "Không tăng quang & tăng tín hiệu không đồng nhất trên T1w fat-sat?",
                getLabelFromValue(YES_NO_OPTIONS, mriT1fsHetero) || "--",
              ]);
            }

            if (
              mriWallKind === "wall_smooth_thin" &&
              mriSeptaKind === "septa_none"
            ) {
              rows.push([
                "T2w đồng nhất và giống CSF?",
                getLabelFromValue(YES_NO_OPTIONS, mriT2CsfLike) || "--",
              ]);
              if (mriT2CsfLike === "yes") {
                rows.push([
                  "Vôi hóa",
                  getLabelFromValue(YES_NO_OPTIONS, mriCalcifications) || "--",
                ]);
              }
            }
          }
        }
      }
    }

    let result = "";
    try {
      result = computeBosniak();
    } catch {
      result = "—";
    }

    const tableRows = rows
      .map(
        ([k, v]) =>
          `<tr><td>${k}</td><td>${
            typeof v === "string" ? v : v ?? "--"
          }</td></tr>`
      )
      .join("");

    const caption =
      modality === "ct"
        ? "Phân loại Bosniak – Khối dạng nang thận (CT)"
        : modality === "mri"
        ? "Phân loại Bosniak – Khối dạng nang thận (MRI)"
        : "Phân loại Bosniak – Khối dạng nang thận";

    const html = `
      <table border="1" cellpadding="6" style="border-collapse: collapse; width: 100%;">
        <caption><strong>${caption}</strong></caption>
        <tr><th style="width:32%">Mục</th><th>Giá trị</th></tr>
        ${tableRows}
        <tr>
          <td><strong>Kết luận Bosniak</strong></td>
          <td><strong>${result}</strong></td>
          ${isCopy ? genAITextToHtml(geminiResponse) : ""}
        </tr>
      </table>
    `;

    setBosniak(result);
    return html;
  };

  const onCalculate = async () => {
    try {
      const result = computeBosniak();
      setBosniak(result);

      const tableHtml = await genHtml({ isCopy: false });
      const res = await fetch(
        `https://api.home-care.vn/chatgpt/ask-gemini-recommendation?prompt=${encodeURIComponent(
          tableHtml
        )}`
      );
      const data = await res.json();
      setGeminiResponse(
        data.data
          ?.replace(/\*\*(.*?)\*\*/g, "$1")
          .replace(/^\* /gm, "• ")
          .replace(/\n{2,}/g, "\n\n")
      );

      toast.success("Đã tính toán kết quả!");
    } catch (err) {
      toast.error(err?.message || "Vui lòng chọn đầy đủ thông tin hợp lệ!");
    }
  };

  const onCopy = async () => {
    try {
      const html = `
        ${STYLE_COPY}
        ${await genHtml({ isCopy: true })}
      `;
      await navigator.clipboard.write([
        new ClipboardItem({
          "text/html": new Blob([html], { type: "text/html" }),
        }),
      ]);
      toast.success("Đã copy bảng HTML vào clipboard!");
    } catch (error) {
      console.error(error);
      toast.error("Không thể copy. Vui lòng thử lại!");
    }
  };

  /* ====================== UI ====================== */

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.formContainer}>
        <Form form={form} layout="vertical">
          <h2>Máy tính phân loại Bosniak cho khối dạng nang thận</h2>

          {/* Modality */}
          <Form.Item label="Bạn muốn báo cáo theo phương thức nào? *">
            <Radio.Group
              value={modality}
              onChange={(e) => {
                const val = e.target.value;
                setModality(val);
                setBosniak("");
                setGeminiResponse("");
                if (val === "ct") resetMRI();
                if (val === "mri") resetCT();
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

          {/* --------- CT --------- */}
          {modality === "ct" && (
            <>
              <Form.Item label="Giao thức chụp là gì? *">
                <Radio.Group
                  value={ctProtocol}
                  onChange={(e) => {
                    setCtProtocol(e.target.value);
                    setNcLesion(null);
                    setPvLesion(null);
                    setSolidFeature(null);
                    setEnhancingNodule(null);
                    setSeptaKind(null);
                    setWallKind(null);
                    setAttenuation(null);
                    setCalcifications(null);
                    setBosniak("");
                  }}
                >
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 8 }}
                  >
                    {CT_PROTOCOL_OPTIONS.map((o) => (
                      <Radio key={o.value} value={o.value}>
                        {o.label}
                      </Radio>
                    ))}
                  </div>
                </Radio.Group>
              </Form.Item>

              {ctProtocol === "noncontrast" && (
                <Form.Item label="Mô tả phù hợp nhất với tổn thương? *">
                  <Radio.Group
                    value={ncLesion}
                    onChange={(e) => setNcLesion(e.target.value)}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                      }}
                    >
                      {NONCONTRAST_LESION_OPTIONS.map((o) => (
                        <Radio key={o.value} value={o.value}>
                          {o.label}
                        </Radio>
                      ))}
                    </div>
                  </Radio.Group>
                </Form.Item>
              )}

              {ctProtocol === "portal" && (
                <Form.Item label="Mô tả phù hợp nhất với tổn thương? *">
                  <Radio.Group
                    value={pvLesion}
                    onChange={(e) => setPvLesion(e.target.value)}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                      }}
                    >
                      {PORTAL_LESION_OPTIONS.map((o) => (
                        <Radio key={o.value} value={o.value}>
                          {o.label}
                        </Radio>
                      ))}
                    </div>
                  </Radio.Group>
                </Form.Item>
              )}

              {ctProtocol === "renal_mass" && (
                <>
                  <Form.Item label="Tổn thương có đặc điểm của khối đặc không? *">
                    <Radio.Group
                      value={solidFeature}
                      onChange={(e) => {
                        setSolidFeature(e.target.value);
                        setEnhancingNodule(null);
                        setSeptaKind(null);
                        setWallKind(null);
                        setAttenuation(null);
                        setCalcifications(null);
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 8,
                        }}
                      >
                        {SOLID_FEATURE_OPTIONS.map((o) => (
                          <Radio key={o.value} value={o.value}>
                            {o.label}
                          </Radio>
                        ))}
                      </div>
                    </Radio.Group>
                  </Form.Item>

                  {solidFeature === "solid_neither" && (
                    <Form.Item label="Tổn thương có nốt tăng quang nào không? *">
                      <Radio.Group
                        value={enhancingNodule}
                        onChange={(e) => {
                          setEnhancingNodule(e.target.value);
                          setSeptaKind(null);
                          setWallKind(null);
                          setAttenuation(null);
                          setCalcifications(null);
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 8,
                          }}
                        >
                          {ENHANCING_NODULE_OPTIONS.map((o) => (
                            <Radio key={o.value} value={o.value}>
                              {o.label}
                            </Radio>
                          ))}
                        </div>
                      </Radio.Group>
                    </Form.Item>
                  )}

                  {solidFeature === "solid_neither" &&
                    enhancingNodule === "nodule_no" && (
                      <>
                        <Form.Item label="Loại vách (septa) của tổn thương? *">
                          <Radio.Group
                            value={septaKind}
                            onChange={(e) => {
                              setSeptaKind(e.target.value);
                              if (e.target.value !== "septa_none") {
                                setAttenuation(null);
                                setCalcifications(null);
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
                              {SEPTA_OPTIONS.map((o) => (
                                <Radio key={o.value} value={o.value}>
                                  {o.label}
                                </Radio>
                              ))}
                            </div>
                          </Radio.Group>
                        </Form.Item>

                        <Form.Item label="Thành của tổn thương? *">
                          <Radio.Group
                            value={wallKind}
                            onChange={(e) => setWallKind(e.target.value)}
                          >
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 8,
                              }}
                            >
                              {WALL_OPTIONS.map((o) => (
                                <Radio key={o.value} value={o.value}>
                                  {o.label}
                                </Radio>
                              ))}
                            </div>
                          </Radio.Group>
                        </Form.Item>

                        {wallKind === "wall_smooth_thin" &&
                          septaKind === "septa_none" && (
                            <>
                              <Form.Item label="Đậm độ của tổn thương (attenuation)? *">
                                <Radio.Group
                                  value={attenuation}
                                  onChange={(e) => {
                                    setAttenuation(e.target.value);
                                    if (e.target.value !== "att_-9_20")
                                      setCalcifications(null);
                                  }}
                                >
                                  <div
                                    style={{
                                      display: "flex",
                                      flexDirection: "column",
                                      gap: 8,
                                    }}
                                  >
                                    {ATTENUATION_OPTIONS.map((o) => (
                                      <Radio key={o.value} value={o.value}>
                                        {o.label}
                                      </Radio>
                                    ))}
                                  </div>
                                </Radio.Group>
                              </Form.Item>

                              {attenuation === "att_-9_20" && (
                                <Form.Item label="Tổn thương có vôi hóa không? *">
                                  <Radio.Group
                                    value={calcifications}
                                    onChange={(e) =>
                                      setCalcifications(e.target.value)
                                    }
                                  >
                                    <div
                                      style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: 8,
                                      }}
                                    >
                                      {CALCIFICATION_OPTIONS.map((o) => (
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

          {/* --------- MRI --------- */}
          {modality === "mri" && (
            <>
              <Form.Item label="Giao thức chụp là gì? *">
                <Radio.Group
                  value={mriProtocol}
                  onChange={(e) => {
                    setMriProtocol(e.target.value);
                    setMriUnenhancedLesion(null);
                    setMriSolidFeature(null);
                    setMriEnhancingNodule(null);
                    setMriSeptaKind(null);
                    setMriWallKind(null);
                    setMriT1fsHetero(null);
                    setMriT2CsfLike(null);
                    setMriCalcifications(null);
                    setBosniak("");
                  }}
                >
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 8 }}
                  >
                    {MRI_PROTOCOL_OPTIONS.map((o) => (
                      <Radio key={o.value} value={o.value}>
                        {o.label}
                      </Radio>
                    ))}
                  </div>
                </Radio.Group>
              </Form.Item>

              {mriProtocol === "unenhanced" && (
                <Form.Item label="Mô tả phù hợp nhất với tổn thương? *">
                  <Radio.Group
                    value={mriUnenhancedLesion}
                    onChange={(e) => setMriUnenhancedLesion(e.target.value)}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                      }}
                    >
                      {MRI_UNENHANCED_LESION_OPTIONS.map((o) => (
                        <Radio key={o.value} value={o.value}>
                          {o.label}
                        </Radio>
                      ))}
                    </div>
                  </Radio.Group>
                </Form.Item>
              )}

              {mriProtocol === "renal_mass_mri" && (
                <>
                  <Form.Item label="Tổn thương có một trong các đặc điểm sau? *">
                    <Radio.Group
                      value={mriSolidFeature}
                      onChange={(e) => {
                        setMriSolidFeature(e.target.value);
                        setMriEnhancingNodule(null);
                        setMriSeptaKind(null);
                        setMriWallKind(null);
                        setMriT1fsHetero(null);
                        setMriT2CsfLike(null);
                        setMriCalcifications(null);
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 8,
                        }}
                      >
                        {MRI_SOLID_FEATURE_OPTIONS.map((o) => (
                          <Radio key={o.value} value={o.value}>
                            {o.label}
                          </Radio>
                        ))}
                      </div>
                    </Radio.Group>
                  </Form.Item>

                  {mriSolidFeature === "mri_neither" && (
                    <Form.Item label="Tổn thương có nốt tăng quang nào không? *">
                      <Radio.Group
                        value={mriEnhancingNodule}
                        onChange={(e) => {
                          setMriEnhancingNodule(e.target.value);
                          setMriSeptaKind(null);
                          setMriWallKind(null);
                          setMriT1fsHetero(null);
                          setMriT2CsfLike(null);
                          setMriCalcifications(null);
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
                  )}

                  {mriSolidFeature === "mri_neither" &&
                    mriEnhancingNodule === "no" && (
                      <>
                        <Form.Item label="Loại vách (septa) của tổn thương? *">
                          <Radio.Group
                            value={mriSeptaKind}
                            onChange={(e) => {
                              setMriSeptaKind(e.target.value);
                              setMriT1fsHetero(null);
                              setMriT2CsfLike(null);
                              setMriCalcifications(null);
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 8,
                              }}
                            >
                              {SEPTA_OPTIONS.map((o) => (
                                <Radio key={o.value} value={o.value}>
                                  {o.label}
                                </Radio>
                              ))}
                            </div>
                          </Radio.Group>
                        </Form.Item>

                        <Form.Item label="Thành của tổn thương? *">
                          <Radio.Group
                            value={mriWallKind}
                            onChange={(e) => setMriWallKind(e.target.value)}
                          >
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 8,
                              }}
                            >
                              {WALL_OPTIONS.map((o) => (
                                <Radio key={o.value} value={o.value}>
                                  {o.label}
                                </Radio>
                              ))}
                            </div>
                          </Radio.Group>
                        </Form.Item>

                        {/* Thành mỏng ≤2mm + 1–3 vách mỏng → hỏi T1w fat-sat */}
                        {mriWallKind === "wall_smooth_thin" &&
                          mriSeptaKind === "septa_1_3_le2" && (
                            <Form.Item label="Tổn thương KHÔNG tăng quang và tăng tín hiệu KHÔNG đồng nhất trên T1w fat-sat? *">
                              <Radio.Group
                                value={mriT1fsHetero}
                                onChange={(e) =>
                                  setMriT1fsHetero(e.target.value)
                                }
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
                          )}

                        {/* Thành mỏng ≤2mm + không vách → hỏi T2w + vôi hóa */}
                        {mriWallKind === "wall_smooth_thin" &&
                          mriSeptaKind === "septa_none" && (
                            <>
                              <Form.Item label="Tín hiệu T2w có đồng nhất và tương tự CSF không? *">
                                <Radio.Group
                                  value={mriT2CsfLike}
                                  onChange={(e) =>
                                    setMriT2CsfLike(e.target.value)
                                  }
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

                              {mriT2CsfLike === "yes" && (
                                <Form.Item label="Tổn thương có vôi hóa không? *">
                                  <Radio.Group
                                    value={mriCalcifications}
                                    onChange={(e) =>
                                      setMriCalcifications(e.target.value)
                                    }
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

          <Row gutter={16}>
            <Col span={12}>
              <Text strong>Kết luận Bosniak: </Text>
              <Text type="danger">{bosniak}</Text>
            </Col>
          </Row>

          <Row
            gutter={12}
            className={styles.summaryRow}
            style={{ maxWidth: 1000, marginTop: 16 }}
          >
            <Text strong>Khuyến nghị AI:</Text>
            {geminiResponse && (
              <Row style={{ width: "100%" }}>
                <Col span={24}>
                  <Text strong>Phản hồi từ hệ thống:</Text>
                  <div
                    style={{
                      background: "#fafafa",
                      padding: 12,
                      marginTop: 8,
                      border: "1px solid #eee",
                      whiteSpace: "pre-wrap",
                      fontFamily: "inherit",
                      fontSize: 15,
                    }}
                  >
                    {geminiResponse}
                  </div>
                </Col>
              </Row>
            )}
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

export default BosniakForm;
