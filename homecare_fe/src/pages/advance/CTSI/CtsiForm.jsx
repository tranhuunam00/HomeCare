import React, { useState } from "react";
import {
  Form,
  Select,
  Typography,
  Divider,
  Button,
  Row,
  Col,
  message,
} from "antd";
import { ReloadOutlined, CopyOutlined } from "@ant-design/icons";
import styles from "./CtsiForm.module.scss";
import { genAITextToHtml } from "../../../constant/app";
import AIRecommendationEditor from "../../../components/AIRecommendationEditor";
import { ThamKhaoLinkHomeCare } from "../component_common/Thamkhao";

const { Title, Text } = Typography;

// Helper nhỏ để lấy nhãn từ value
const getLabelFromValue = (options, value) =>
  options.find((o) => o.value === value)?.label || "";

// ====== OPTIONS (đúng theo nội dung bạn cung cấp) ======
const INFLAMMATION_OPTIONS = [
  { label: "0 điểm: Tuyến tụy trong trạng thái bình thường.", value: 0 },
  {
    label:
      "1 điểm: Tuyến tụy có dấu hiệu phì đại, có thể là khu trú hoặc lan tỏa.",
    value: 1,
  },
  {
    label:
      "2 điểm: Xuất hiện bất thường tại chỗ trên tuyến tụy, kèm theo các thay đổi viêm trong nhu mô mỡ quanh tụy.",
    value: 2,
  },
  { label: "3 điểm: Tích tụ dịch xung quanh tuyến tụy đơn lẻ.", value: 3 },
  {
    label:
      "4 điểm: Xuất hiện từ hai ổ tụ dịch trở lên và/hoặc có khí trong vùng sau phúc mạc, liền kề với tuyến tụy.",
    value: 4,
  },
];

const NECROSIS_OPTIONS = [
  { label: "0 điểm: Không xuất hiện hoại tử tụy.", value: 0 },
  { label: "2 điểm: Hoại tử tụy chiếm dưới 30%.", value: 2 },
  { label: "4 điểm: Hoại tử tụy trong khoảng từ 30% đến 50%.", value: 4 },
  { label: "6 điểm: Hoại tử tụy vượt quá 50%.", value: 6 },
];

// Phân độ & khuyến nghị hiển thị
const getSeverityAndRec = (total) => {
  if (total <= 3) {
    return {
      severity: "Mức độ nhẹ (0–3 điểm)",
      rec: "Theo dõi lâm sàng sát, điều trị hỗ trợ tiêu chuẩn; nguy cơ biến chứng nghiêm trọng thấp.",
    };
  }
  if (total <= 6) {
    return {
      severity: "Mức độ trung bình (4–6 điểm)",
      rec: "Theo dõi sát lâm sàng và xét nghiệm; cân nhắc đánh giá lại bằng hình ảnh nếu diễn tiến xấu.",
    };
  }
  return {
    severity: "Mức độ nặng (>6 điểm)",
    rec: "Nguy cơ biến chứng và tử vong cao; cần theo dõi tích cực, tối ưu hồi sức và hội chẩn chuyên khoa.",
  };
};

// style để copy bảng ra HTML đẹp
const STYLE_COPY = `
  <style>
    table { width: 100%; border-collapse: collapse; font-family: Arial, sans-serif; }
    th, td { border: 1px solid #ccc; padding: 8px 12px; text-align: left; vertical-align: top; }
    th { background: #f5f5f5; }
    caption { caption-side: top; font-weight: bold; font-size: 18px; margin-bottom: 10px; text-align: left; }
  </style>
`;

const BalthazarForm = () => {
  const [form] = Form.useForm();
  const [total, setTotal] = useState(0);
  const [severity, setSeverity] = useState("");
  const [recommendation, setRecommendation] = useState("");
  const [geminiResponse, setGeminiResponse] = useState("");

  const onReset = () => {
    form.resetFields();
    setTotal(0);
    setSeverity("");
    setRecommendation("");
  };

  const calcAndSet = async () => {
    const values = await form.validateFields();
    const sum = Number(values.inflammation || 0) + Number(values.necrosis || 0);
    const { severity: sev, rec } = getSeverityAndRec(sum);
    setTotal(sum);
    setSeverity(sev);
    const tableHtml = await genHtml({ isCopy: false });
    const res = await fetch(
      `https://api.home-care.vn/chatgpt/ask-gemini-recommendation?prompt=${encodeURIComponent(
        tableHtml
      )}`
    );
    const data = await res.json();
    setGeminiResponse(
      data?.data
        ?.replace(/\*\*(.*?)\*\*/g, "$1")
        .replace(/^\* /gm, "• ")
        .replace(/\n{2,}/g, "\n\n") || ""
    );
    setRecommendation(rec);
  };

  const genHtml = async ({ isCopy }) => {
    const values = await form.validateFields();
    const sum = Number(values.inflammation || 0) + Number(values.necrosis || 0);
    const { severity: sev, rec } = getSeverityAndRec(sum);

    const html = `
      <table border="1" cellpadding="6" style="border-collapse: collapse;">
        <caption><strong>Thang điểm Balthazar</strong></caption>
        <tr><th>Hạng mục</th><th>Mô tả</th><th>Điểm</th></tr>
        <tr>
          <td>Tổn thương tụy/quanh tụy</td>
          <td>${getLabelFromValue(
            INFLAMMATION_OPTIONS,
            values.inflammation
          )}</td>
          <td>${values.inflammation ?? ""}</td>
        </tr>
        <tr>
          <td>Mức độ hoại tử tụy</td>
          <td>${getLabelFromValue(NECROSIS_OPTIONS, values.necrosis)}</td>
          <td>${values.necrosis ?? ""}</td>
        </tr>
        <tr><td colspan="2"><strong>Tổng điểm</strong></td><td>${sum}</td></tr>
        <tr><td colspan="2"><strong>Phân độ</strong></td><td>${sev}</td></tr>
        <tr><td colspan="2"><strong>Khuyến nghị</strong></td><td>${rec}</td></tr>
      </table>
    `;

    return isCopy
      ? html +
          `<div style="margin-top:16px;">${genAITextToHtml(
            geminiResponse
          )}</div>`
      : html;
  };

  const onCopy = async () => {
    try {
      const html = `${STYLE_COPY}${await genHtml({ isCopy: true })}`;
      await navigator.clipboard.write([
        new ClipboardItem({
          "text/html": new Blob([html], { type: "text/html" }),
        }),
      ]);
      message.success("Đã sao chép bảng kết quả (HTML)!");
    } catch (e) {
      message.error("Sao chép thất bại. Vui lòng thử lại.");
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.formContainer}>
        <ThamKhaoLinkHomeCare
          link={"https://home-care.vn/product/phan-mem-d-ctsi/"}
        />
        <Title level={2}>Phần mềm D-CTSI</Title>

        <Form form={form} layout="vertical" onFinish={calcAndSet}>
          <Form.Item
            name="inflammation"
            label="Tổn thương tụy/quanh tụy"
            rules={[{ required: true, message: "Vui lòng chọn" }]}
          >
            <Select options={INFLAMMATION_OPTIONS} placeholder="Chọn" />
          </Form.Item>

          <Form.Item
            name="necrosis"
            label="Mức độ hoại tử tụy"
            rules={[{ required: true, message: "Vui lòng chọn" }]}
          >
            <Select options={NECROSIS_OPTIONS} placeholder="Chọn" />
          </Form.Item>

          <Divider />

          <Row gutter={24} className={styles.summaryRow}>
            <Col span={8}>
              <Text strong>Tổng điểm:</Text> <Text type="danger">{total}</Text>
            </Col>
            <Col span={16}>
              <Text strong>Phân độ:</Text> <Text>{severity}</Text>
            </Col>
          </Row>
          {recommendation && (
            <Row style={{ marginTop: 8 }}>
              <Col span={24}>
                <Text strong>Khuyến nghị: </Text>
                <Text>{recommendation}</Text>
              </Col>
            </Row>
          )}
          <Row
            gutter={12}
            className={styles.summaryRow}
            style={{ maxWidth: 1000, marginTop: 24 }}
          >
            <AIRecommendationEditor
              value={geminiResponse}
              onChange={setGeminiResponse}
            />
          </Row>

          <Divider />
          <div className={styles.buttonRow}>
            <Button icon={<ReloadOutlined />} onClick={onReset}>
              Làm lại
            </Button>
            <Button type="primary" htmlType="submit">
              Tính kết quả
            </Button>
            <Button icon={<CopyOutlined />} onClick={onCopy}>
              Sao chép bảng kết quả
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default BalthazarForm;
