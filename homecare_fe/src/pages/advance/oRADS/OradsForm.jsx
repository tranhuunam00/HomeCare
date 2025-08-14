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
import UltrasoundSection from "./components/UltrasoundSection";

import {
  US_MODES as MODALITY, // dùng chung cho MRI + US
  ABN_OPTIONS,
  CYST_STRUCTURE,
  getLabelFromValue,
  US_LESION_TYPES,
  US_BENIGN_OVARIAN_OPTIONS,
} from "./oradsConstants";

import { computeORADS } from "./oradsUtils";

const { Text, Paragraph } = Typography;

export default function OradsForm() {
  const [form] = Form.useForm();

  // ===== CORE =====
  const [modality, setModality] = useState("mri");

  // ===== MRI states =====
  const [peritoneal, setPeritoneal] = useState(null);
  const [abn, setAbn] = useState(null);
  const [cystStruct, setCystStruct] = useState(null);
  const [cystContent, setCystContent] = useState(null);
  const [cystSmallPrem, setCystSmallPrem] = useState(null);
  const [multilocHasFat, setMultilocHasFat] = useState(null);
  const [solidDark, setSolidDark] = useState(null);
  const [dceCurve, setDceCurve] = useState(null);
  const [solidLipid, setSolidLipid] = useState(null);
  const [nonDceEnh, setNonDceEnh] = useState(null);
  const [tubeWall, setTubeWall] = useState(null);
  const [tubeContents, setTubeContents] = useState(null);

  // ===== US states =====
  const [usAdequate, setUsAdequate] = useState(null);
  const [usType, setUsType] = useState(null);
  const [usBenignType, setUsBenignType] = useState(null);
  const [usMaxDiameter, setUsMaxDiameter] = useState(null);

  // summary + AI
  const [summary, setSummary] = useState({
    orads: "",
    risk: "",
    ppv: "",
    recommendation: "",
  });
  const [aiText, setAiText] = useState("");

  // ===== reset helpers =====
  const resetMRI = useCallback(() => {
    setPeritoneal(null);
    setAbn(null);
    setCystStruct(null);
    setCystContent(null);
    setCystSmallPrem(null);
    setMultilocHasFat(null);
    setSolidDark(null);
    setDceCurve(null);
    setSolidLipid(null);
    setNonDceEnh(null);
    setTubeWall(null);
    setTubeContents(null);
  }, []);
  const resetUS = useCallback(() => {
    setUsAdequate(null);
    setUsType(null);
    setUsBenignType(null);
    setUsMaxDiameter(null);
  }, []);
  const resetAll = useCallback(() => {
    form.resetFields();
    resetMRI();
    resetUS();
    setSummary({ orads: "", risk: "", ppv: "", recommendation: "" });
    setAiText("");
  }, [form, resetMRI, resetUS]);

  // ===== auto-calc =====
  const recalcSummary = useCallback(() => {
    const res = computeORADS({
      modality,

      // MRI
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

      // US
      usAdequate,
      usType,
      usBenignType,
      usMaxDiameter,
    });

    if (!res?.orads && res?.orads !== 0) {
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
    usAdequate,
    usType,
    usBenignType,
    usMaxDiameter,
  ]);

  useEffect(() => {
    recalcSummary();
  }, [recalcSummary]);

  // ===== html copy =====
  const genHtml = async ({ isCopy }) => {
    const title = `Đánh giá O-RADS (${modality === "mri" ? "MRI" : "US"})`;

    const rowsMRI =
      modality === "mri"
        ? `
      <tr><td>Peritoneal/omental nodularity (+/− ascites)</td><td>${
        peritoneal === true ? "Yes" : peritoneal === false ? "No" : "--"
      }</td></tr>
      ${
        peritoneal === false
          ? `
        <tr><td>Tổn thương xác định</td><td>${
          getLabelFromValue(ABN_OPTIONS, abn) || "--"
        }</td></tr>
        ${
          abn === "cystic"
            ? `
          <tr><td>Cấu trúc nang</td><td>${
            getLabelFromValue(CYST_STRUCTURE, cystStruct) || "--"
          }</td></tr>
          <tr><td>Thành phần dịch</td><td>${cystContent || "--"}</td></tr>
          <tr><td>≤3cm & tiền mãn kinh?</td><td>${
            cystSmallPrem === true
              ? "Yes"
              : cystSmallPrem === false
              ? "No"
              : "--"
          }</td></tr>
          <tr><td>Multilocular có mỡ?</td><td>${
            multilocHasFat === true
              ? "Yes"
              : multilocHasFat === false
              ? "No"
              : "--"
          }</td></tr>
        `
            : ""
        }
        ${
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
            : ""
        }
        ${
          abn === "dilated_tube"
            ? `
          <tr><td>Tube walls / folds</td><td>${
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
            : ""
        }
      `
          : ""
      }`
        : "";

    const rowsUS =
      modality === "us"
        ? `
      <tr><td>Technically adequate exam?</td><td>${
        usAdequate === true ? "Yes" : usAdequate === false ? "No" : "--"
      }</td></tr>
      ${
        usAdequate === true
          ? `
        <tr><td>Type</td><td>${
          US_LESION_TYPES.find((x) => x.value === usType)?.label || "--"
        }</td></tr>
        ${
          usType === "typical_benign_ovarian"
            ? `
          <tr><td>Benign ovarian subtype</td><td>${
            US_BENIGN_OVARIAN_OPTIONS.find((x) => x.value === usBenignType)
              ?.label || "--"
          }</td></tr>
          <tr><td>Max diameter (cm)</td><td>${usMaxDiameter ?? "--"}</td></tr>
        `
            : ""
        }
      `
          : ""
      }
    `
        : "";

    const html = `
      <table>
        <caption>${title}</caption>
        <tr><th>Hạng mục</th><th>Giá trị</th></tr>
        <tr><td>Phương thức</td><td>${
          getLabelFromValue(MODALITY, modality) || "--"
        }</td></tr>
        ${rowsMRI}
        ${rowsUS}
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

  // ===== actions =====
  const onCalculate = async () => {
    if (summary?.orads === "") {
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
    } catch {}
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

  const onReset = () => resetAll();

  // ===== render =====
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
          <div style={{ marginBottom: 8 }} />

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
                const v = e.target.value;
                setModality(v);
                form.resetFields();
                resetAll();
                setModality(v);
              }}
            />
          </Form.Item>

          {/* Flow theo modality */}
          {modality === "mri" ? (
            <>
              {/* Peritoneal */}
              <Form.Item
                label="Is there peritoneal, mesenteric or omental nodularity or irregular thickening (+/− ascites)?"
                required
                colon={false}
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
                    image={
                      "/product/orads/radaide-orads-peritoneal-nodularity.jpg"
                    }
                    label="Yes"
                    onClick={() => {
                      setPeritoneal(true);
                      setAbn(null);
                      setCystStruct(null);
                      setCystContent(null);
                      setCystSmallPrem(null);
                      setMultilocHasFat(null);
                      setSolidDark(null);
                      setDceCurve(null);
                      setSolidLipid(null);
                      setNonDceEnh(null);
                      setTubeWall(null);
                      setTubeContents(null);
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

              {peritoneal === false && (
                <>
                  <Form.Item
                    label="Which abnormality have you identified?"
                    required
                    colon={false}
                    style={{ marginTop: 8 }}
                  >
                    <Paragraph style={{ color: "#9aa3af", marginTop: 0 }}>
                      Chọn loại tổn thương phù hợp nhất.
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
                            setCystStruct(null);
                            setCystContent(null);
                            setCystSmallPrem(null);
                            setMultilocHasFat(null);
                            setSolidDark(null);
                            setDceCurve(null);
                            setSolidLipid(null);
                            setNonDceEnh(null);
                            setTubeWall(null);
                            setTubeContents(null);
                          }}
                        />
                      ))}
                    </div>
                  </Form.Item>

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
            </>
          ) : (
            <UltrasoundSection
              usAdequate={usAdequate}
              setUsAdequate={setUsAdequate}
              usType={usType}
              setUsType={setUsType}
              usBenignType={usBenignType}
              setUsBenignType={setUsBenignType}
              usMaxDiameter={usMaxDiameter}
              setUsMaxDiameter={setUsMaxDiameter}
            />
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
