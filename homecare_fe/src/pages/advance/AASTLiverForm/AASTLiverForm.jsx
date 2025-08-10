// AASTLiverForm.jsx – Biểu mẫu AAST Liver Trauma Grading & Score Calculator

import React, { useState } from "react";
import {
  Form,
  Button,
  Checkbox,
  Radio,
  Row,
  Col,
  Divider,
  Typography,
} from "antd";
import { CopyOutlined, ReloadOutlined } from "@ant-design/icons";
import styles from "./AASTLiverForm.module.scss";
import { toast } from "react-toastify";
import { genAITextToHtml, getLabelFromValue } from "../../../constant/app";

const { Text } = Typography;

// 1) Nhóm tổn thương chính
const INJURY_OPTIONS = [
  { label: "Subcapsular hematoma", value: "subcapsular" },
  { label: "Intraparenchymal hematoma", value: "intraparenchymal" },
  { label: "Parenchymal laceration", value: "laceration" },
  { label: "Vascular injury", value: "vascular" },
];

// 2) Sub-options + điểm (theo yêu cầu của bạn)

// Subcapsular hematoma – How much of the surface area… (1,2,3,3)
const SUBCAPSULAR_OPTIONS = [
  { label: "<10%", value: "<10%", score: 1 },
  { label: "10-50%", value: "10-50%", score: 2 },
  { label: ">50%", value: ">50%", score: 3 },
  { label: "Subcapsular hematoma is ruptured", value: "ruptured", score: 3 },
];

// Intraparenchymal hematoma – diameter (2,3,3)
const INTRAPARENCHYMAL_OPTIONS = [
  { label: "<10 cm", value: "<10cm", score: 2 },
  { label: ">10 cm", value: ">10cm", score: 3 },
  {
    label: "Intraparenchymal hematoma is ruptured",
    value: "ruptured",
    score: 3,
  },
];

// Parenchymal laceration – size/disruption (1,2,3,4,5)
const LACERATION_OPTIONS = [
  { label: "<1 cm in depth", value: "<1cmDepth", score: 1 },
  {
    label: "1-3 cm in depth and ≤10 cm in length",
    value: "1-3cmDepth_<=10cmLen",
    score: 2,
  },
  {
    label: ">3 cm in depth and/or >10 cm in length",
    value: ">3cmDepth_or_>10cmLen",
    score: 3,
  },
  {
    label: "Parenchymal disruption involving 25-75% of a hepatic lobe",
    value: "disruption_25-75%",
    score: 4,
  },
  {
    label: "Parenchymal disruption >75% of hepatic lobe",
    value: "disruption_>75%",
    score: 5,
  },
];

// Vascular injury – type (3,4,5)
const VASCULAR_OPTIONS = [
  {
    label: "Active bleeding contained within liver parenchyma",
    value: "contained_bleeding",
    score: 3,
  },
  {
    label:
      "Active bleeding extending beyond the liver parenchyma into the peritoneum",
    value: "beyond_parenchyma",
    score: 4,
  },
  {
    label:
      "Juxtahepatic venous injury to include retrohepatic vena cava and central major hepatic veins",
    value: "juxtahepatic_venous_injury",
    score: 5,
  },
];

const AASTLiverForm = () => {
  const [form] = Form.useForm();

  // State lựa chọn
  const [injuries, setInjuries] = useState([]);
  const [subcapsularChoice, setSubcapsularChoice] = useState(null);
  const [intraChoice, setIntraChoice] = useState(null);
  const [lacerationChoice, setLacerationChoice] = useState(null);
  const [vascularChoice, setVascularChoice] = useState(null);

  // Kết quả hiển thị
  const [maxGrade, setMaxGrade] = useState(0);
  const [geminiResponse, setGeminiResponse] = useState("");

  const onReset = () => {
    form.resetFields();
    setInjuries([]);
    setSubcapsularChoice(null);
    setIntraChoice(null);
    setLacerationChoice(null);
    setVascularChoice(null);
    setMaxGrade(0);
    setGeminiResponse("");
  };

  // Helper: lấy điểm từ option arrays
  const findScore = (options, val) =>
    options.find((o) => o.value === val)?.score ?? 0;

  // Tính max grade theo lựa chọn
  const computeMaxGrade = () => {
    const grades = [];

    if (injuries.includes("subcapsular")) {
      if (!subcapsularChoice) throw new Error("Chọn mức Subcapsular hematoma.");
      grades.push(findScore(SUBCAPSULAR_OPTIONS, subcapsularChoice));
    }

    if (injuries.includes("intraparenchymal")) {
      if (!intraChoice) throw new Error("Chọn mức Intraparenchymal hematoma.");
      grades.push(findScore(INTRAPARENCHYMAL_OPTIONS, intraChoice));
    }

    if (injuries.includes("laceration")) {
      if (!lacerationChoice)
        throw new Error("Chọn mức Parenchymal laceration.");
      grades.push(findScore(LACERATION_OPTIONS, lacerationChoice));
    }

    if (injuries.includes("vascular")) {
      if (!vascularChoice) throw new Error("Chọn mức Vascular injury.");
      grades.push(findScore(VASCULAR_OPTIONS, vascularChoice));
    }

    return Math.max(...grades, 0);
  };

  const onCalculate = async () => {
    try {
      const max = computeMaxGrade();
      const tableHtml = await genHtml({ isCopy: false });

      // gọi AI giống bản chuẩn
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

      setMaxGrade(max);
    } catch (err) {
      toast.error(err?.message || "Vui lòng chọn đầy đủ thông tin hợp lệ!");
    }
  };

  // genHtml: dùng getLabelFromValue để render label (ul/li tự động nếu là array; string thì label đơn)
  const genHtml = async ({ isCopy }) => {
    // (Không cần validate form vì ta dùng state; nhưng giữ cấu trúc tương tự)
    const selectedMain = getLabelFromValue(INJURY_OPTIONS, injuries);

    const html = `
      <table border="1" cellpadding="6" style="border-collapse: collapse; width: 100%;">
        <caption><strong>AAST Liver Trauma Grading & Score</strong></caption>
        <tr><th style="width:32%">Mục</th><th>Giá trị</th></tr>

        <tr>
          <td>Nhóm tổn thương chọn</td>
          <td>${selectedMain}</td>
        </tr>

        ${
          injuries.includes("subcapsular")
            ? `
          <tr>
            <td>Subcapsular hematoma – surface area</td>
            <td>${getLabelFromValue(
              SUBCAPSULAR_OPTIONS,
              subcapsularChoice
            )}</td>
          </tr>`
            : ""
        }

        ${
          injuries.includes("intraparenchymal")
            ? `
          <tr>
            <td>Intraparenchymal hematoma – diameter</td>
            <td>${getLabelFromValue(INTRAPARENCHYMAL_OPTIONS, intraChoice)}</td>
          </tr>`
            : ""
        }

        ${
          injuries.includes("laceration")
            ? `
          <tr>
            <td>Parenchymal laceration – size/disruption</td>
            <td>${getLabelFromValue(LACERATION_OPTIONS, lacerationChoice)}</td>
          </tr>`
            : ""
        }

        ${
          injuries.includes("vascular")
            ? `
          <tr>
            <td>Vascular injury – type</td>
            <td>${getLabelFromValue(VASCULAR_OPTIONS, vascularChoice)}</td>
          </tr>`
            : ""
        }

        <tr>
          <td><strong>Độ tổn thương (AAST)</strong></td>
          <td><strong>Độ ${computeMaxGrade()}</strong></td>
          ${isCopy ? genAITextToHtml(geminiResponse) : ""}
        </tr>
      </table>
    `;

    // cập nhật state grade (để đồng bộ UI)
    try {
      setMaxGrade(computeMaxGrade());
    } catch (e) {
      console.log("e", e);
    }

    return html;
  };

  const onCopy = async () => {
    try {
      const html = await genHtml({ isCopy: true });
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

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.formContainer}>
        <Form form={form} layout="vertical">
          <h2>AAST Liver Trauma Grading & Score Calculator</h2>

          {/* Nhóm chính */}
          <Form.Item
            name="injuries"
            label="Chọn nhóm tổn thương (có thể chọn nhiều)"
          >
            <Checkbox.Group
              value={injuries}
              onChange={(vals) => {
                setInjuries(vals);
                // clear sub-choices nếu bỏ chọn
                if (!vals.includes("subcapsular")) setSubcapsularChoice(null);
                if (!vals.includes("intraparenchymal")) setIntraChoice(null);
                if (!vals.includes("laceration")) setLacerationChoice(null);
                if (!vals.includes("vascular")) setVascularChoice(null);
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {INJURY_OPTIONS.map((opt) => (
                  <Checkbox key={opt.value} value={opt.value}>
                    {opt.label}
                  </Checkbox>
                ))}
              </div>
            </Checkbox.Group>
          </Form.Item>

          {/* Subcapsular */}
          {injuries.includes("subcapsular") && (
            <Form.Item label="How much of the surface area is occupied by the subcapsular hematoma? *">
              <Radio.Group
                value={subcapsularChoice}
                onChange={(e) => setSubcapsularChoice(e.target.value)}
              >
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 8 }}
                >
                  {SUBCAPSULAR_OPTIONS.map((opt) => (
                    <Radio key={opt.value} value={opt.value}>
                      {opt.label}
                    </Radio>
                  ))}
                </div>
              </Radio.Group>
            </Form.Item>
          )}

          {/* Intraparenchymal */}
          {injuries.includes("intraparenchymal") && (
            <Form.Item label="What is the diameter of the intraparenchymal hematoma? *">
              <Radio.Group
                value={intraChoice}
                onChange={(e) => setIntraChoice(e.target.value)}
              >
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 8 }}
                >
                  {INTRAPARENCHYMAL_OPTIONS.map((opt) => (
                    <Radio key={opt.value} value={opt.value}>
                      {opt.label}
                    </Radio>
                  ))}
                </div>
              </Radio.Group>
            </Form.Item>
          )}

          {/* Laceration */}
          {injuries.includes("laceration") && (
            <Form.Item label="How big is the parenchymal laceration? *">
              <Radio.Group
                value={lacerationChoice}
                onChange={(e) => setLacerationChoice(e.target.value)}
              >
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 8 }}
                >
                  {LACERATION_OPTIONS.map((opt) => (
                    <Radio key={opt.value} value={opt.value}>
                      {opt.label}
                    </Radio>
                  ))}
                </div>
              </Radio.Group>
            </Form.Item>
          )}

          {/* Vascular */}
          {injuries.includes("vascular") && (
            <Form.Item label="How is the vascular injury? *">
              <Radio.Group
                value={vascularChoice}
                onChange={(e) => setVascularChoice(e.target.value)}
              >
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 8 }}
                >
                  {VASCULAR_OPTIONS.map((opt) => (
                    <Radio key={opt.value} value={opt.value}>
                      {opt.label}
                    </Radio>
                  ))}
                </div>
              </Radio.Group>
            </Form.Item>
          )}

          <Divider />
          <Row gutter={16}>
            <Col span={8}>
              <Text strong>Độ tổn thương: </Text>
              <Text type="danger">{maxGrade}</Text>
            </Col>
          </Row>

          <Row
            gutter={12}
            className={styles.summaryRow}
            style={{ maxWidth: 1000 }}
          >
            <Text strong>Khuyến nghị AI:</Text>
            {geminiResponse && (
              <Row>
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

export default AASTLiverForm;
