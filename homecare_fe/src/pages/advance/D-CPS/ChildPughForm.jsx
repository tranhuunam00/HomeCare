// components/ChildPughForm.jsx
import React, { useState } from "react";
import { Form, Select, Button, Typography, Divider, Row, Col } from "antd";
import { ReloadOutlined, CopyOutlined } from "@ant-design/icons";

import styles from "./ChildPughForm.module.scss";
import { toast } from "react-toastify";
import { genAITextToHtml, STYLE_COPY } from "../../../constant/app";

const { Title, Text } = Typography;

export const CHILD_PUGH_QUESTIONS = [
  { key: "bilirubin", label: "Bilirubin toàn phần (micromol/L)" },
  { key: "albumin", label: "Albumin huyết thanh (g/L)" },
  { key: "inr", label: "INR" },
  { key: "ascites", label: "Dịch tự do ổ bụng" },
  { key: "encephalopathy", label: "Bệnh não gan" },
];

export const CHILD_PUGH_OPTIONS = {
  bilirubin: [
    { label: "< 34.1", value: 1 },
    { label: "34.2 – 51.3", value: 2 },
    { label: "> 51.3", value: 3 },
  ],
  albumin: [
    { label: "> 35", value: 1 },
    { label: "28 – 35", value: 2 },
    { label: "< 28", value: 3 },
  ],
  inr: [
    { label: "< 1.7", value: 1 },
    { label: "1.7 – 2.3", value: 2 },
    { label: "> 2.3", value: 3 },
  ],
  ascites: [
    { label: "Không có", value: 1 },
    { label: "Nhẹ", value: 2 },
    { label: "Trung bình hoặc nặng", value: 3 },
  ],
  encephalopathy: [
    { label: "Không có", value: 1 },
    { label: "Độ 1 – 2", value: 2 },
    { label: "Độ 3 – 4", value: 3 },
  ],
};

export const CHILD_PUGH_LEVELS = [
  { label: "Child-Pugh A", range: [5, 6] },
  { label: "Child-Pugh B", range: [7, 9] },
  { label: "Child-Pugh C", range: [10, 15] },
];

const ChildPughForm = () => {
  const [form] = Form.useForm();
  const [summary, setSummary] = useState({ total: 0, level: "" });
  const [geminiResponse, setGeminiResponse] = useState("");

  const onReset = () => {
    form.resetFields();
    setSummary({ total: 0, level: "" });
    setGeminiResponse("");
  };

  const genHtml = async ({ isCopy }) => {
    const values = await form.validateFields();
    const total = Object.values(values).reduce(
      (sum, v) => sum + Number(v || 0),
      0
    );
    let level = "";
    for (const l of CHILD_PUGH_LEVELS) {
      if (total >= l.range[0] && total <= l.range[1]) {
        level = l.label;
        break;
      }
    }

    const html = `
      <table border="1" cellpadding="6" style="border-collapse: collapse; font-family: Arial, sans-serif;">
        <caption><strong>Đánh giá Child-Pugh</strong></caption>
        <tr><th>STT</th><th>Thông số</th><th>Đáp án</th></tr>
        ${CHILD_PUGH_QUESTIONS.map((q, index) => {
          const val = values[q.key];
          const option = CHILD_PUGH_OPTIONS[q.key].find((o) => o.value === val);
          return `<tr><td>${index + 1}</td><td>${q.label}</td><td>${
            option?.label || ""
          }</td></tr>`;
        }).join("")}
        <tr><td colspan="2"><strong>Tổng điểm</strong></td><td>${total}</td></tr>
        <tr><td colspan="2"><strong>Phân độ</strong></td><td>${level}</td></tr>
        ${
          isCopy
            ? `
        <tr><td colspan="2"><strong>Khuyến nghị AI</strong></td><td>${geminiResponse
          .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") // giữ định dạng đậm
          .replace(/^\* /gm, "• ") // dấu bullet
          .replace(/\n/g, "<br>")}</td></tr>
          `
            : ""
        }

      </table>
    `;

    return html;
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
      toast.error("Vui lòng điền đầy đủ thông tin hợp lệ!");
    }
  };

  const onFinish = async (values) => {
    const total = Object.values(values).reduce(
      (sum, v) => sum + Number(v || 0),
      0
    );
    let level = "";
    for (const l of CHILD_PUGH_LEVELS) {
      if (total >= l.range[0] && total <= l.range[1]) {
        level = l.label;
        break;
      }
    }
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
    setSummary({ total, level });
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.formContainer}>
        <Title level={3}>Child-Pugh Score</Title>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          {CHILD_PUGH_QUESTIONS.map((q) => (
            <Form.Item
              key={q.key}
              name={q.key}
              label={q.label}
              rules={[{ required: true, message: "Vui lòng chọn một đáp án" }]}
            >
              <Select
                options={CHILD_PUGH_OPTIONS[q.key]}
                placeholder="Chọn một đáp án"
              />
            </Form.Item>
          ))}

          <Divider />
          <Row gutter={24} className={styles.summaryRow}>
            <Col span={12}>
              <Text strong>Tổng điểm:</Text>{" "}
              <Text type="danger">{summary.total}</Text>
            </Col>
            <Col span={12}>
              <Text strong>Phân độ Child-Pugh:</Text>{" "}
              <Text>{summary.level}</Text>
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
              Kết quả
            </Button>
            <Button icon={<CopyOutlined />} onClick={onCopy}>
              Copy kết quả
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default ChildPughForm;
