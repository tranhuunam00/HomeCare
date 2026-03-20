import React, { useState } from "react";
import {
  Card,
  Row,
  Col,
  Radio,
  Select,
  InputNumber,
  Button,
  Typography,
} from "antd";
import styles from "./Lirads2Form.module.scss";
import {
  calculateScore,
  LIRADS_APPLICABILITY_RULES,
} from "./Lirads2Form.constant";
import TextArea from "antd/es/input/TextArea";
import API_CALL from "../../../services/axiosClient";
import AIRecommendationEditor from "../../../components/AIRecommendationEditor";
import {
  CalculatorOutlined,
  CopyOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { toast } from "react-toastify";

const { Text, Title } = Typography;

const CIRRHOSIS_CAUSES = [
  { label: "Khác", value: "other" },
  { label: "Xơ gan bẩm sinh", value: "chf" },
  { label: "Rối loạn mạch máu", value: "vascular" },
];

const Lirads2Form = () => {
  const [applicable, setApplicable] = useState(null);
  const [matchedRule, setMatchedRule] = useState(null);

  const [summary, setSummary] = useState({
    lirads: "",
    description: "",
  });

  const [geminiResponse, setGeminiResponse] = useState("");

  const [form, setForm] = useState({
    age: false,
    cirrhosis: false,
    hepatitisB: false,
    priorHCC: false,
    cirrhosisCause: "other",

    aphe: true,
    washout: false,
    capsule: false,
    size: 1,
    growth: "no",

    ancillary: "",
  });

  const [result, setResult] = useState("");

  const handleChange = (key, value) => {
    setForm({ ...form, [key]: value });
  };

  const checkApplicability = () => {
    const rule = LIRADS_APPLICABILITY_RULES.find((r) => r.condition(form));

    if (rule) {
      setApplicable(true);
      setMatchedRule(rule);
    } else {
      setApplicable(false);
      setMatchedRule(null);
    }
  };

  const genHtml = (result, isCopy = false) => {
    const bulletHtml = `
    <ul style="margin-top:8px; padding-left:20px;">
      ${geminiResponse
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line)
        .map((line) => `<li>${line.replace(/^[-•*]\s*/, "")}</li>`)
        .join("")}
    </ul>
  `;

    const body = `
    <table border="1" cellpadding="6" style="border-collapse: collapse;">
      <caption><strong>Đánh giá LI-RADS</strong></caption>

      <tr><td><strong>APHE</strong></td><td>${form.aphe ? "Có" : "Không"}</td></tr>
      <tr><td><strong>Washout</strong></td><td>${form.washout ? "Có" : "Không"}</td></tr>
      <tr><td><strong>Capsule</strong></td><td>${form.capsule ? "Có" : "Không"}</td></tr>
      <tr><td><strong>Kích thước</strong></td><td>${form.size} mm</td></tr>
      <tr><td><strong>Growth</strong></td><td>${form.growth}</td></tr>

      <tr><td><strong>Kết luận</strong></td><td>${result.lirads}</td></tr>
      <tr><td><strong>Ý nghĩa</strong></td><td>${result.description}</td></tr>
      <tr>
        <td><strong>Dấu hiệu phụ</strong></td>
        <td>${form.ancillary || "Không có"}</td>
      </tr>
    </table>

    ${isCopy ? `<div style="margin-top:16px;">${bulletHtml}</div>` : ""}
  `;

    return `
    <html>
      <head>
        <meta charset="utf-8" />
      </head>
      <body>
        ${body}
      </body>
    </html>
  `;
  };

  const handleCopy = async () => {
    toast.success("Đã copy");
    const html = genHtml(summary, true);

    await navigator.clipboard.write([
      new ClipboardItem({
        "text/html": new Blob([html], { type: "text/html" }),
      }),
    ]);
  };
  const handleSubmit = async () => {
    const result = calculateScore(form);
    if (!result) return;

    setSummary(result);

    const html = genHtml(result);

    const prompt = `
Bạn là bác sĩ chẩn đoán hình ảnh.

Dưới đây là bảng đánh giá LI-RADS:
${html}

Hãy đưa ra:
- Nhận định chuyên môn
- Gợi ý xử trí tiếp theo (nếu cần)
- Viết ngắn gọn, rõ ràng, dùng bullet point
`;

    try {
      const res = await API_CALL.get(`/chatgpt/ask-gemini-recommendation`, {
        params: { prompt },
      });

      const cleaned =
        res.data.data
          ?.replace(/\*\*(.*?)\*\*/g, "$1")
          .replace(/^\* /gm, "• ") || "";

      setGeminiResponse(cleaned);
    } catch (e) {
      console.error(e);
    }
  };

  const handleReset = () => {
    setForm({
      age: false,
      cirrhosis: false,
      hepatitisB: false,
      priorHCC: false,
      cirrhosisCause: "other",
      aphe: true,
      washout: false,
      capsule: false,
      size: 1,
      growth: "no",
    });

    setSummary({ lirads: "", description: "" });
    setGeminiResponse("");
  };
  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
        <Row gutter={16}>
          {/* LEFT */}
          <Col span={12}>
            <Card title="Khả năng áp dụng LI-RADS" className={styles.card}>
              <div className={styles.formGroup}>
                <p>
                  Bệnh nhân ≥18 tuổi?
                  <span className={styles.required}>*</span>
                </p>
                <Radio.Group
                  value={form.age}
                  onChange={(e) => handleChange("age", e.target.value)}
                >
                  <Radio value={true}>Có</Radio>
                  <Radio value={false}>Không</Radio>
                </Radio.Group>
              </div>

              <div className={styles.formGroup}>
                <p>
                  Bệnh nhân có xơ gan?
                  <span className={styles.required}>*</span>
                </p>
                <Radio.Group
                  value={form.cirrhosis}
                  onChange={(e) => handleChange("cirrhosis", e.target.value)}
                >
                  <Radio value={true}>Có</Radio>
                  <Radio value={false}>Không</Radio>
                </Radio.Group>
              </div>

              {form.cirrhosis && (
                <div className={styles.formGroup}>
                  <p>Nguyên nhân gây xơ gan</p>
                  <Select
                    value={form.cirrhosisCause}
                    onChange={(val) => handleChange("cirrhosisCause", val)}
                    style={{ width: "100%" }}
                    options={CIRRHOSIS_CAUSES}
                  />
                </div>
              )}

              <div className={styles.formGroup}>
                <p>
                  Có viêm gan B?
                  <span className={styles.required}>*</span>
                </p>
                <Radio.Group
                  value={form.hepatitisB}
                  onChange={(e) => handleChange("hepatitisB", e.target.value)}
                >
                  <Radio value={true}>Có</Radio>
                  <Radio value={false}>Không</Radio>
                </Radio.Group>
              </div>

              <div className={styles.formGroup}>
                <p>
                  Có tiền sử HCC?
                  <span className={styles.required}>*</span>
                </p>
                <Radio.Group
                  value={form.priorHCC}
                  onChange={(e) => handleChange("priorHCC", e.target.value)}
                >
                  <Radio value={true}>Có</Radio>
                  <Radio value={false}>Không</Radio>
                </Radio.Group>
              </div>

              <Button
                type="primary"
                onClick={checkApplicability}
                className={styles.buttonCheck}
              >
                Kiểm tra LI-RADS
              </Button>

              {applicable === false && (
                <Text className={styles.statusError}>
                  LI-RADS không áp dụng được
                </Text>
              )}
              {applicable === true && (
                <div className={styles.statusSuccess}>
                  <Text style={{ color: "green", fontSize: 20 }}>
                    Có thể áp dụng LI-RADS
                  </Text>
                </div>
              )}
            </Card>
          </Col>

          {/* RIGHT */}
          <Col span={12}>
            <Card title="Thanh điểm LI-RADS" className={styles.card}>
              <div className={styles.formGroup}>
                <p>
                  Tăng quang thì động mạch (không dạng viền)
                  <span className={styles.required}>*</span>
                </p>
                <Radio.Group
                  value={form.aphe}
                  onChange={(e) => handleChange("aphe", e.target.value)}
                >
                  <Radio value={true}>Có</Radio>
                  <Radio value={false}>Không</Radio>
                </Radio.Group>
              </div>

              <div className={styles.formGroup}>
                <p>
                  Rửa thuốc không ở ngoại vi
                  <span className={styles.required}>*</span>
                </p>
                <Radio.Group
                  value={form.washout}
                  onChange={(e) => handleChange("washout", e.target.value)}
                >
                  <Radio value={true}>Có</Radio>
                  <Radio value={false}>Không</Radio>
                </Radio.Group>
              </div>

              <div className={styles.formGroup}>
                <p>
                  Bao giả tăng quang
                  <span className={styles.required}>*</span>
                </p>
                <Radio.Group
                  value={form.capsule}
                  onChange={(e) => handleChange("capsule", e.target.value)}
                >
                  <Radio value={true}>Có</Radio>
                  <Radio value={false}>Không</Radio>
                </Radio.Group>
              </div>

              <div className={styles.formGroup}>
                <p>
                  Kích thước (mm)
                  <span className={styles.required}>*</span>
                </p>
                <InputNumber
                  min={1}
                  value={form.size}
                  onChange={(val) => handleChange("size", val)}
                  style={{ width: "100%" }}
                />
              </div>

              <div className={styles.formGroup}>
                <p>
                  Tăng trưởng ngưỡng (≥ 50% trong 6 tháng){" "}
                  <span className={styles.required}>*</span>
                </p>
                <Select
                  value={form.growth}
                  style={{ width: "100%" }}
                  onChange={(val) => handleChange("growth", val)}
                >
                  <Select.Option value={"no"}>Không</Select.Option>
                  <Select.Option value={"yes"}>Có</Select.Option>
                  <Select.Option value={"na"}>
                    Không xác định được
                  </Select.Option>
                </Select>
              </div>

              <div className={styles.formGroup}>
                <p>Các dấu hiệu phụ</p>
                <TextArea
                  value={form.ancillary}
                  onChange={(e) => handleChange("ancillary", e.target.value)}
                  placeholder="Ví dụ: hạn chế khuếch tán, tăng tín hiệu T2, có mỡ trong tổn thương"
                />
              </div>

              {result && (
                <div className={styles.resultBox}>
                  <Title level={4}>{result}</Title>
                </div>
              )}
              <div
                style={{ display: "flex", gap: 20, justifyContent: "flex-end" }}
              >
                <Button icon={<ReloadOutlined />} onClick={handleReset}>
                  Làm lại
                </Button>

                <Button
                  type="primary"
                  icon={<CalculatorOutlined />}
                  onClick={handleSubmit}
                >
                  Tính kết quả
                </Button>

                <Button icon={<CopyOutlined />} onClick={handleCopy}>
                  Copy kết quả
                </Button>
              </div>
            </Card>
          </Col>
        </Row>

        {summary.lirads && (
          <div className={styles.resultBox}>
            <Row gutter={16}>
              <Col span={8}>
                <Text strong>LI-RADS:</Text>{" "}
                <Text type="danger">{summary.lirads}</Text>
              </Col>
              <Col span={16}>
                <Text strong>Ý nghĩa:</Text> {summary.description}
              </Col>
            </Row>

            <div style={{ marginTop: 16 }}>
              <AIRecommendationEditor
                value={geminiResponse}
                onChange={setGeminiResponse}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Lirads2Form;
