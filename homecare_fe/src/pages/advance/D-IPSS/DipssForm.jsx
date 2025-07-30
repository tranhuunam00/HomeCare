// components/DipssForm.jsx
import React, { useState } from "react";
import { Form, Select, Button, Typography, Divider, Row, Col } from "antd";
import { ReloadOutlined, CopyOutlined } from "@ant-design/icons";

import styles from "./DipssForm.module.scss";
import { genAITextToHtml } from "../../../constant/app";

const { Title, Text } = Typography;

export const IPSS_QUESTIONS = [
  { key: "q1", symptom: "Cảm giác chưa đi hết sau khi đi tiểu" },
  { key: "q2", symptom: "Đi tiểu lại trong vòng 2 giờ sau khi đã đi tiểu" },
  { key: "q3", symptom: "Dòng nước tiểu yếu hoặc chậm" },
  { key: "q4", symptom: "Nước tiểu bị gián đoạn và ngắt quãng" },
  { key: "q5", symptom: "Khó, không nhịn được tiểu" },
  { key: "q6", symptom: "Rặn mới tiểu được" },
  { key: "q7", symptom: "Tiểu ban đêm" },
];

export const IPSS_OPTIONS = [
  { label: "Không lần nào", value: 0 },
  { label: "Thi thoảng, không quá 5 lần", value: 1 },
  { label: "Nhiều lần, không quá 50%", value: 2 },
  { label: "Tương đối nhiều, khoảng 50%", value: 3 },
  { label: "Thường xuyên, khoảng >50%", value: 4 },
  { label: "Rất thường xuyên, hầu như ngày nào cũng bị", value: 5 },
];

export const IPSS_LEVELS = [
  { label: "Không rối loạn tiểu", range: [0, 0] },
  { label: "Rối loạn tiểu nhẹ", range: [1, 7] },
  { label: "Rối loạn tiểu trung bình", range: [8, 19] },
  { label: "Rối loạn tiểu nặng", range: [20, 35] },
];

export const IPSS_RECOMMENDATIONS = {
  "Không rối loạn tiểu": "Khám chuyên khoa khác nếu cần",
  "Rối loạn tiểu nhẹ": "Theo dõi định kỳ, không cần điều trị",
  "Rối loạn tiểu trung bình": "Khám và theo chỉ dẫn của Bác sĩ",
  "Rối loạn tiểu nặng": "Khám và điều trị Bác sĩ chuyên khoa tiết niệu",
};

const DipssForm = () => {
  const [form] = Form.useForm();
  const [geminiResponse, setGeminiResponse] = useState("");

  const [summary, setSummary] = useState({
    total: 0,
    level: "",
    recommendation: "",
  });

  const onReset = () => {
    form.resetFields();
    setSummary({ total: 0, level: "", recommendation: "" });
  };

  const calculateScore = (values) => {
    const total = Object.values(values).reduce(
      (sum, v) => sum + Number(v || 0),
      0
    );
    let level = "";
    for (const l of IPSS_LEVELS) {
      if (total >= l.range[0] && total <= l.range[1]) {
        level = l.label;
        break;
      }
    }
    const recommendation = IPSS_RECOMMENDATIONS[level] || "";
    setSummary({ total, level, recommendation });
  };

  const genHtml = async ({ isCopy }) => {
    const values = await form.validateFields();
    const total = Object.values(values).reduce(
      (sum, v) => sum + Number(v || 0),
      0
    );
    let level = "";
    for (const l of IPSS_LEVELS) {
      if (total >= l.range[0] && total <= l.range[1]) {
        level = l.label;
        break;
      }
    }
    const recommendation = IPSS_RECOMMENDATIONS[level] || "";

    const html = `
      <table border="1" cellpadding="6" style="border-collapse: collapse;">
        <caption><strong>Đánh giá D-IPSS</strong></caption>
        <tr><th>STT</th><th>Triệu chứng</th><th>Điểm</th></tr>
        ${IPSS_QUESTIONS.map((q) => {
          const val = values[q.key] ?? "";
          const option = IPSS_OPTIONS.find((o) => o.value === val);
          return `<tr><td>${q.key}</td><td>${q.symptom}</td><td>${
            option?.label || ""
          }</td></tr>`;
        }).join("")}
        <tr><td colspan="2"><strong>Tổng điểm</strong></td><td>${total}</td></tr>
        <tr><td colspan="2"><strong>Phân độ</strong></td><td>${level}</td></tr>
        <tr><td colspan="2"><strong>Khuyến nghị</strong></td><td>${recommendation}</td></tr>
        ${
          isCopy
            ? `<tr><td colspan="2">
            <strong>Khuyến nghị</strong>
            </td><td>${geminiResponse
              .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") // giữ định dạng đậm
              .replace(/^\* /gm, "• ") // dấu bullet
              .replace(/\n/g, "<br>")}
            </td></tr>
`
            : ""
        }
        </table>
      <table>
      </table>
    `;

    return html;
  };

  const onFinish = async (values) => {
    calculateScore(values);
    const tableHtml = await genHtml({ isCopy: false });
    const res = await fetch(
      `https://api.home-care.vn/chatgpt/ask-gemini-recommendation?prompt=${encodeURIComponent(
        tableHtml
      )}`
    );

    const data = await res.json();
    setGeminiResponse(
      data.data
        ?.replace(/\*\*(.*?)\*\*/g, "$1") // bỏ **bôi đậm**
        .replace(/^\* /gm, "• ") // dòng bắt đầu bằng "* " → "• "
        .replace(/\n{2,}/g, "\n\n")
    );
  };

  const onCopy = async () => {
    const html = await genHtml({ isCopy: true });

    await navigator.clipboard.write([
      new ClipboardItem({
        "text/html": new Blob([html], { type: "text/html" }),
      }),
    ]);
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.formContainer}>
        <h2>D-IPSS</h2>
        <h4>
          Phát hiện sớm các trường hợp có nguy cơ cao mắc bệnh phì đại tuyến
          tiền liệt (BPH).
        </h4>
        <h4>Đánh giá mức độ nghiêm trọng của triệu chứng.</h4>
        <h4 style={{ marginBottom: 40 }}>
          Theo dõi hiệu quả điều trị BPH theo thời gian.
        </h4>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          {IPSS_QUESTIONS.map((q) => (
            <Form.Item
              key={q.key}
              name={q.key}
              label={`${q.key}. ${q.symptom}`}
              rules={[{ required: true, message: "Vui lòng chọn một đáp án" }]}
            >
              <Select options={IPSS_OPTIONS} placeholder="Chọn một đáp án" />
            </Form.Item>
          ))}
          <Divider />
          <Row gutter={24} className={styles.summaryRow}>
            <Col span={8}>
              <Text strong>Tổng điểm:</Text>{" "}
              <Text type="danger">{summary.total}</Text>
            </Col>
            <Col span={8}>
              <Text strong>Phân độ:</Text> <Text>{summary.level}</Text>
            </Col>
            <Col span={8}>
              <Text strong>Khuyến nghị:</Text>{" "}
              <Text>{summary.recommendation}</Text>
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
                      padding: "12px",
                      marginTop: 8,
                      border: "1px solid #eee",
                      whiteSpace: "pre-wrap", // 👈 giữ ngắt dòng
                      fontFamily: "inherit",
                      fontSize: "15px",
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
              Reset
            </Button>
            <Button type="primary" htmlType="submit">
              Tính điểm
            </Button>
            <Button icon={<CopyOutlined />} onClick={onCopy}>
              Copy toàn bộ
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default DipssForm;
