import React, { useState, useEffect, useCallback } from "react";
import { Form, Radio, Typography, Row, Col, Button, Divider } from "antd";
import styles from "./OradsForm.module.scss";
import { toast } from "react-toastify";
import { genAITextToHtml, STYLE_COPY } from "../../../constant/app";
import AIRecommendationEditor from "../../../components/AIRecommendationEditor";

import ImageRadioCard from "./components/ImageRadioCard";
import CysticLesionSection from "./components/CysticLesionSection";
import CysticSolidSection from "./components/CysticSolidSection";
import DilatedTubeSection from "./components/DilatedTubeSection";

import {
  MODALITY,
  ABN_OPTIONS, // phải có value "cystic", "cystic_solid", "dilated_tube", "para_ovarian", "solid", "none"
  CYST_STRUCTURE, // KHÔNG chứa 'with_solid'
  getLabelFromValue,
} from "./oradsConstants";

import { computeORADS } from "./oradsUtils";

const { Text, Paragraph } = Typography;

export default function OradsForm() {
  const [form] = Form.useForm();

  // ===== CORE STATES =====
  const [modality, setModality] = useState("mri");
  const [peritoneal, setPeritoneal] = useState(null);
  const [abn, setAbn] = useState(null);

  // cystic (không-solid)
  const [cystStruct, setCystStruct] = useState(null);
  const [cystContent, setCystContent] = useState(null);
  const [cystSmallPrem, setCystSmallPrem] = useState(null);
  const [multilocHasFat, setMultilocHasFat] = useState(null);

  // cystic_solid
  const [solidDark, setSolidDark] = useState(null);
  const [dceCurve, setDceCurve] = useState(null);
  const [solidLipid, setSolidLipid] = useState(null);
  const [nonDceEnh, setNonDceEnh] = useState(null);

  // dilated tube
  const [tubeWall, setTubeWall] = useState(null);
  const [tubeContents, setTubeContents] = useState(null);

  // summary + AI
  const [summary, setSummary] = useState({
    orads: "",
    risk: "",
    ppv: "",
    recommendation: "",
  });
  const [aiText, setAiText] = useState("");

  // ===== RESET HELPERS =====
  const resetCystic = useCallback(() => {
    setCystStruct(null);
    setCystContent(null);
    setCystSmallPrem(null);
    setMultilocHasFat(null);
  }, []);

  const resetCysticSolid = useCallback(() => {
    setSolidDark(null);
    setDceCurve(null);
    setSolidLipid(null);
    setNonDceEnh(null);
  }, []);

  const resetDilatedTube = useCallback(() => {
    setTubeWall(null);
    setTubeContents(null);
  }, []);

  const resetAllExceptModality = useCallback(() => {
    form.resetFields();
    setPeritoneal(null);
    setAbn(null);
    resetCystic();
    resetCysticSolid();
    resetDilatedTube();
    setSummary({ orads: "", risk: "", ppv: "", recommendation: "" });
    setAiText("");
  }, [form, resetCystic, resetCysticSolid, resetDilatedTube]);

  // ===== AUTO-CALC =====
  const recalcSummary = useCallback(() => {
    const res = computeORADS({
      modality,
      peritoneal,
      abnormality: abn,

      cyst_structure: cystStruct,
      cyst_contents: cystContent,
      cyst_small_premenop: cystSmallPrem,
      multiloc_has_fat: multilocHasFat,

      solid_dark_t2dwi: solidDark,
      dce_curve: dceCurve,
      solid_large_lipid: solidLipid,
      non_dce_30s_enh: nonDceEnh,

      tube_wall_thickness: tubeWall,
      tube_contents: tubeContents,
    });

    if (!res?.orads) {
      setSummary({ orads: "", risk: "", ppv: "", recommendation: "" });
      return;
    }
    setSummary({
      orads: `O-RADS ${res.orads} – ${res.risk}`,
      risk: res.risk,
      ppv: res.ppv || "--",
      recommendation: res.rec || "",
    });
  }, [
    modality,
    peritoneal,
    abn,
    cystStruct,
    cystContent,
    cystSmallPrem,
    multilocHasFat,
    solidDark,
    dceCurve,
    solidLipid,
    nonDceEnh,
    tubeWall,
    tubeContents,
  ]);

  useEffect(() => {
    recalcSummary();
  }, [recalcSummary]);

  // ===== HTML COPY =====
  const genHtml = async ({ isCopy }) => {
    const title = "Đánh giá O-RADS (MRI)";

    const rowsForCystic =
      abn === "cystic"
        ? `
        <tr><td>Cấu trúc nang</td><td>${
          getLabelFromValue(CYST_STRUCTURE, cystStruct) || "--"
        }</td></tr>
        <tr><td>Thành phần dịch</td><td>${cystContent || "--"}</td></tr>
        <tr><td>≤3cm & tiền mãn kinh?</td><td>${
          cystSmallPrem === true ? "Yes" : cystSmallPrem === false ? "No" : "--"
        }</td></tr>
        <tr><td>Multilocular có mỡ?</td><td>${
          multilocHasFat === true
            ? "Yes"
            : multilocHasFat === false
            ? "No"
            : "--"
        }</td></tr>
      `
        : "";

    const rowsForCysticSolid =
      abn === "cystic_solid"
        ? `
        <tr><td>Dark T2 & Dark DWI?</td><td>${
          solidDark === true ? "Yes" : solidDark === false ? "No" : "--"
        }</td></tr>
        <tr><td>DCE curve</td><td>${dceCurve || "--"}</td></tr>
        <tr><td>Large volume enhancing with lipid?</td><td>${
          solidLipid === true ? "Yes" : solidLipid === false ? "No" : "--"
        }</td></tr>
        <tr><td>non-DCE 30–40s</td><td>${nonDceEnh || "--"}</td></tr>
      `
        : "";

    const rowsForDilatedTube =
      abn === "dilated_tube"
        ? `
        <tr><td>Tube walls / endosalpingeal folds</td><td>${
          tubeWall === "thin"
            ? "Thin (<3mm)"
            : tubeWall === "thick"
            ? "Thick (>3mm)"
            : "--"
        }</td></tr>
        <tr><td>Tube contents</td><td>${
          tubeWall === "thin"
            ? tubeContents === "simple_fluid"
              ? "Simple fluid*"
              : tubeContents === "non_simple_fluid"
              ? "Non-simple fluid"
              : "--"
            : "--"
        }</td></tr>
      `
        : "";

    const html = `
      <table>
        <caption>${title}</caption>
        <tr><th>Hạng mục</th><th>Giá trị</th></tr>
        <tr><td>Phương thức</td><td>${
          getLabelFromValue(MODALITY, modality) || "--"
        }</td></tr>
        <tr><td>Peritoneal/omental nodularity (+/− ascites)</td><td>${
          peritoneal === true ? "Yes" : peritoneal === false ? "No" : "--"
        }</td></tr>
        ${
          peritoneal === false
            ? `
          <tr><td>Tổn thương xác định</td><td>${
            getLabelFromValue(ABN_OPTIONS, abn) || "--"
          }</td></tr>
          ${rowsForCystic}
          ${rowsForCysticSolid}
          ${rowsForDilatedTube}
        `
            : ""
        }
        <tr><td><strong>Phân loại (O-RADS)</strong></td><td><strong>${
          summary?.orads || "Không xác định"
        }</strong></td></tr>
        <tr><td>PPV</td><td>${summary?.ppv || "--"}</td></tr>
        <tr><td>Khuyến nghị</td><td>${summary?.recommendation || "--"}</td></tr>
      </table>
    `;
    return isCopy
      ? html + `<div style="margin-top:16px;">${genAITextToHtml(aiText)}</div>`
      : html;
  };

  // ===== ACTIONS =====
  const onCalculate = async () => {
    if (!summary?.orads) {
      toast.error("Vui lòng hoàn thành các lựa chọn cần thiết để tính O-RADS!");
      return;
    }
    try {
      const tableHtml = await genHtml({ isCopy: false });
      const r = await fetch(
        `https://api.home-care.vn/chatgpt/ask-gemini-recommendation?prompt=${encodeURIComponent(
          tableHtml
        )}`
      );
      const data = await r.json();
      setAiText(
        data?.data
          ?.replace(/\*\*(.*?)\*\*/g, "$1")
          .replace(/^\* /gm, "• ")
          .replace(/\n{2,}/g, "\n\n") || ""
      );
    } catch {
      // optional
    }
  };

  const onCopy = async () => {
    try {
      const html = `${STYLE_COPY}${await genHtml({ isCopy: true })}`;
      await navigator.clipboard.write([
        new ClipboardItem({
          "text/html": new Blob([html], { type: "text/html" }),
        }),
      ]);
      toast.success("Đã copy bảng HTML vào clipboard!");
    } catch {
      toast.error("Không thể sao chép. Kiểm tra dữ liệu!");
    }
  };

  const onReset = () => resetAllExceptModality();

  // ===== RENDER =====
  return (
    <div className={styles.pageWrapper}>
      <div className={styles.formContainer}>
        <Form
          form={form}
          layout="vertical"
          initialValues={{ modality }}
          onValuesChange={recalcSummary}
        >
          <h2 style={{ marginBottom: 24 }}>D-O-RADS HOME-CARE</h2>
          <h4>Lĩnh vực: MRI phụ khoa</h4>
          <div style={{ marginBottom: 24 }} />

          {/* Modality */}
          <Form.Item
            name="modality"
            label="Imaging modality"
            rules={[{ required: true }]}
            colon={false}
          >
            <Radio.Group
              options={MODALITY}
              value={modality}
              onChange={(e) => {
                const next = e.target.value;
                setModality(next);
                resetAllExceptModality();
                setModality(next);
              }}
            />
          </Form.Item>

          {/* Peritoneal nodularity */}
          <Form.Item
            label="Is there peritoneal, mesenteric or omental nodularity or irregular thickening (+/− ascites)?"
            required
            colon={false}
            style={{ marginTop: 8, marginBottom: 8 }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(260px, 320px))",
                gap: 20,
              }}
            >
              <ImageRadioCard
                selected={peritoneal === true}
                image={"/product/orads/radaide-orads-peritoneal-nodularity.jpg"}
                label="Yes"
                onClick={() => {
                  setPeritoneal(true);
                  setAbn(null);
                  resetCystic();
                  resetCysticSolid();
                  resetDilatedTube();
                }}
              />
              <ImageRadioCard
                selected={peritoneal === false}
                image={"/product/orads/cancel-no-center-256.webp"}
                label="No"
                onClick={() => setPeritoneal(false)}
              />
            </div>
          </Form.Item>

          {/* Abnormality */}
          {peritoneal === false && (
            <>
              <Form.Item
                label="Which abnormality have you identified?"
                required
                colon={false}
                style={{ marginTop: 20, marginBottom: 8 }}
              >
                <Paragraph style={{ color: "#9aa3af", marginTop: 0 }}>
                  Chọn một loại tổn thương phù hợp nhất với quan sát của bạn.
                </Paragraph>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, minmax(240px, 320px))",
                    gap: 20,
                  }}
                >
                  {ABN_OPTIONS.map((o) => (
                    <ImageRadioCard
                      key={o.value}
                      selected={abn === o.value}
                      image={o.img}
                      label={o.label}
                      note={o.note}
                      onClick={() => {
                        setAbn(o.value);
                        resetCystic();
                        resetCysticSolid();
                        resetDilatedTube();
                      }}
                    />
                  ))}
                </div>
              </Form.Item>

              {/* Cystic (không-solid) */}
              {abn === "cystic" && (
                <CysticLesionSection
                  cystStruct={cystStruct}
                  setCystStruct={(v) => {
                    setCystStruct(v);
                    setCystContent(null);
                    setCystSmallPrem(null);
                    setMultilocHasFat(null);
                  }}
                  cystContent={cystContent}
                  setCystContent={setCystContent}
                  cystSmallPrem={cystSmallPrem}
                  setCystSmallPrem={setCystSmallPrem}
                  multilocHasFat={multilocHasFat}
                  setMultilocHasFat={setMultilocHasFat}
                />
              )}

              {/* Cystic lesion with a solid* component */}
              {abn === "cystic_solid" && (
                <CysticSolidSection
                  solidDark={solidDark}
                  setSolidDark={setSolidDark}
                  dceCurve={dceCurve}
                  setDceCurve={setDceCurve}
                  solidLipid={solidLipid}
                  setSolidLipid={setSolidLipid}
                  nonDceEnh={nonDceEnh}
                  setNonDceEnh={setNonDceEnh}
                />
              )}

              {abn === "solid" && (
                <CysticSolidSection
                  solidDark={solidDark}
                  setSolidDark={setSolidDark}
                  dceCurve={dceCurve}
                  setDceCurve={setDceCurve}
                  solidLipid={solidLipid}
                  setSolidLipid={setSolidLipid}
                  nonDceEnh={nonDceEnh}
                  setNonDceEnh={setNonDceEnh}
                />
              )}

              {/* Dilated fallopian tube (without a solid lesion) */}
              {abn === "dilated_tube" && (
                <DilatedTubeSection
                  tubeWall={tubeWall}
                  setTubeWall={setTubeWall}
                  tubeContents={tubeContents}
                  setTubeContents={setTubeContents}
                />
              )}
            </>
          )}

          {/* Summary */}
          <Divider />
          <Row gutter={24} className={styles.summaryRow}>
            <Col span={8}>
              <Text strong>Phân loại:</Text>{" "}
              <Text>{summary.orads || "--"}</Text>
            </Col>
            <Col span={8}>
              <Text strong>PPV:</Text> <Text>{summary.ppv || "--"}</Text>
            </Col>
            <Col span={8}>
              <Text strong>Khuyến nghị:</Text>{" "}
              <Text>{summary.recommendation || "--"}</Text>
            </Col>
          </Row>

          {/* AI editor */}
          <Row
            gutter={12}
            className={styles.summaryRow}
            style={{ maxWidth: 1000, marginTop: 24 }}
          >
            <AIRecommendationEditor value={aiText} onChange={setAiText} />
          </Row>

          <Divider />
          <div className={styles.buttonRow} style={{ display: "flex", gap: 8 }}>
            <Button onClick={onReset}>Reset</Button>
            <Button onClick={onCalculate}>Kết quả</Button>
            <Button type="primary" onClick={onCopy}>
              Copy kết quả
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
}
