import React, { useState } from "react";
import {
  Form,
  Select,
  Typography,
  Divider,
  Button,
  Row,
  Col,
  Table,
} from "antd";
import { ReloadOutlined, CopyOutlined } from "@ant-design/icons";
import styles from "./CtsiForm.module.scss";
import { getLabelFromValue, STYLE_COPY } from "../../../constant/app";
import AIRecommendationEditor from "../../../components/AIRecommendationEditor";

const { Title, Text } = Typography;

const INFLAMMATION_OPTIONS = [
  { label: "Tụy bình thường", value: 0 },
  {
    label: "Bất thường tại tụy kèm hoặc không kèm viêm mô mỡ quanh tụy",
    value: 2,
  },
  {
    label: "Có dịch hoặc hoại tử mỡ quanh tụy hoặc tụy",
    value: 4,
  },
];

const NECROSIS_OPTIONS = [
  { label: "Không có", value: 0 },
  { label: "≤ 30%", value: 2 },
  { label: "≥ 30%", value: 4 },
];

const COMPLICATIONS_OPTIONS = [
  {
    label:
      "Ít nhất một trong các biến chứng sau: Tràn dịch màng phổi, cổ trướng, biến chứng mạch máu, tổn thương nhu mô hoặc đường tiêu hóa",
    value: 2,
  },
  { label: "Không có", value: 0 },
];

const atlantaData = [
  {
    key: "1",
    type: "Viêm tụy phù nề kẽ",
    duration: "< 4 tuần",
    collection: "Dịch quanh tụy cấp (APFC)",
    description:
      "Dịch quanh tụy đồng nhất, không có thành bao rõ. Khu trú trong lớp cân quanh tụy, không lan vào nhu mô tụy.",
  },
  {
    key: "2",
    type: "Viêm tụy phù nề kẽ",
    duration: "> 4 tuần",
    collection: "Nang giả tụy (Pseudocyst)",
    description:
      "Khối dịch đồng nhất, tròn/oval, có thành bao rõ ràng, không có thành phần đặc bên trong.",
  },
  {
    key: "3",
    type: "Viêm tụy hoại tử",
    duration: "< 4 tuần",
    collection: "Tổn thương hoại tử cấp (ANC)",
    description:
      "Không đồng nhất, có thể không dịch. Không có thành bao. Vị trí: trong và/hoặc ngoài tụy.",
  },
  {
    key: "4",
    type: "Viêm tụy hoại tử",
    duration: "> 4 tuần",
    collection: "Hoại tử có thành bao (WON)",
    description:
      "Hỗn hợp dịch và mô hoại tử, có thành bao rõ. Có thể chia múi hoặc đồng nhất. Vị trí: trong và/hoặc ngoài tụy.",
  },
];

const atlantaColumns = [
  {
    title: "Loại viêm tụy cấp",
    dataIndex: "type",
    key: "type",
  },
  {
    title: "Thời gian",
    dataIndex: "duration",
    key: "duration",
  },
  {
    title: "Dạng tổn thương",
    dataIndex: "collection",
    key: "collection",
  },
  {
    title: "Mô tả trên CT",
    dataIndex: "description",
    key: "description",
  },
];

const ModifiedCTSIForm = () => {
  const [form] = Form.useForm();
  const [summary, setSummary] = useState({ total: 0 });
  const [geminiResponse, setGeminiResponse] = useState("");

  const onReset = () => {
    form.resetFields();
    setSummary({ total: 0 });
    setGeminiResponse("");
  };

  const onFinish = async () => {
    const values = await form.validateFields();
    const total =
      Number(values.inflammation || 0) +
      Number(values.necrosis || 0) +
      Number(values.complications || 0);

    setSummary({ total });

    const tableHtml = await genHtml(values, false);
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
  };

  const genHtml = async (values, isCopy) => {
    const total =
      Number(values.inflammation || 0) +
      Number(values.necrosis || 0) +
      Number(values.complications || 0);

    const mainTable = `
      <table border="1" cellpadding="6" style="border-collapse: collapse;">
        <caption><strong>Đánh giá M-CTSI</strong></caption>
        <tr><th>Hạng mục</th><th>Mô tả</th><th>Điểm</th></tr>
        <tr>
          <td>Tình trạng viêm tụy</td>
          <td>${getLabelFromValue(
            INFLAMMATION_OPTIONS,
            values.inflammation
          )}</td>
          <td>${values.inflammation}</td>
        </tr>
        <tr>
          <td>Mức độ hoại tử tụy</td>
          <td>${getLabelFromValue(NECROSIS_OPTIONS, values.necrosis)}</td>
          <td>${values.necrosis}</td>
        </tr>
        <tr>
          <td>Biến chứng ngoài tụy</td>
          <td>${getLabelFromValue(
            COMPLICATIONS_OPTIONS,
            values.complications
          )}</td>
          <td>${values.complications}</td>
        </tr>
        <tr><td colspan="2"><strong>Tổng điểm</strong></td><td>${total}</td></tr>
      </table>
    `;

    const aiTable = isCopy
      ? `
      <br>
      <table border="1" cellpadding="6" style="border-collapse: collapse;">
        <caption><strong>Khuyến nghị AI</strong></caption>
        <tr>
          <td>${geminiResponse
            .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
            .replace(/^\* /gm, "• ")
            .replace(/\n/g, "<br>")}</td>
        </tr>
      </table>
    `
      : "";

    return `${mainTable}${aiTable}`;
  };
  const onCopy = async () => {
    const values = await form.validateFields();
    const html = `
      ${STYLE_COPY}
      ${await genHtml(values, true)}
    `;
    await navigator.clipboard.write([
      new ClipboardItem({
        "text/html": new Blob([html], { type: "text/html" }),
      }),
    ]);
  };
  return (
    <div className={styles.pageWrapper}>
      <div className={styles.formContainer}>
        <Title level={2}>Đánh giá mức độ nặng của viêm tụy (CTSI)</Title>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="inflammation"
            label="Tình trạng viêm tụy"
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

          <Form.Item
            name="complications"
            label="Biến chứng ngoài tụy"
            rules={[{ required: true, message: "Vui lòng chọn" }]}
          >
            <Select options={COMPLICATIONS_OPTIONS} placeholder="Chọn" />
          </Form.Item>

          <Divider />
          <Row gutter={24} className={styles.summaryRow}>
            <Col span={8}>
              <Text strong>Tổng điểm:</Text>{" "}
              <Text type="danger">{summary.total}</Text>
            </Col>
          </Row>
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

        <Divider />
        <Title level={4} style={{ marginTop: 40 }}>
          Phân loại Atlanta cho Viêm tụy cấp
        </Title>
        <Table
          className={styles.atlantaTable}
          dataSource={atlantaData}
          columns={atlantaColumns}
          bordered
          pagination={false}
        />
      </div>
    </div>
  );
};

export default ModifiedCTSIForm;
