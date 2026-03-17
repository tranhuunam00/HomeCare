import React, { useState } from "react";
import {
  Form,
  Select,
  Typography,
  Divider,
  Button,
  Row,
  Col,
  Radio,
} from "antd";

import { ReloadOutlined, CopyOutlined } from "@ant-design/icons";

import styles from "./DSpleenForm.module.scss";
import { genAITextToHtml } from "../../../constant/app";
import AIRecommendationEditor from "../../../components/AIRecommendationEditor";
import { ThamKhaoLinkHomeCare } from "../component_common/Thamkhao";
import API_CALL from "../../../services/axiosClient";

const { Text } = Typography;

export const SPLEEN_OPTIONS = {
  subcapsular: [
    { label: "<10%", value: "<10%" },
    { label: "10-50%", value: "10-50%" },
    { label: ">50%", value: ">50%" },
  ],

  intraparenchymal: [
    { label: "<5 cm", value: "<5cm" },
    { label: ">5 cm", value: ">5cm" },
  ],

  laceration: [
    { label: "<1 cm", value: "<1cm" },
    { label: "1–3 cm", value: "1-3cm" },
    { label: ">3 cm", value: ">3cm" },
  ],

  vascular: [
    { label: "Không", value: "none" },
    { label: "Chảy máu trong bao lách", value: "contained" },
    { label: "Chảy máu vào ổ bụng", value: "free" },
  ],

  devascularization: [
    { label: "Không", value: "none" },
    { label: ">25%", value: ">25%" },
  ],

  shattered: [
    { label: "Không", value: "no" },
    { label: "Có", value: "yes" },
  ],
};

const DSpleenForm = () => {
  const [form] = Form.useForm();
  const [geminiResponse, setGeminiResponse] = useState("");

  const [summary, setSummary] = useState({
    grade: "",
    recommendation: "",
  });

  const calculateGrade = (values) => {
    let grade = 0;

    const {
      subcapsular,
      intraparenchymal,
      laceration,
      vascular,
      devascularization,
      shattered,
    } = values;

    if (subcapsular === "<10%" || laceration === "<1cm")
      grade = Math.max(grade, 1);

    if (
      subcapsular === "10-50%" ||
      intraparenchymal === "<5cm" ||
      laceration === "1-3cm"
    )
      grade = Math.max(grade, 2);

    if (
      subcapsular === ">50%" ||
      intraparenchymal === ">5cm" ||
      laceration === ">3cm"
    )
      grade = Math.max(grade, 3);

    if (vascular === "contained" || devascularization === ">25%")
      grade = Math.max(grade, 4);

    if (vascular === "free" || shattered === "yes") grade = Math.max(grade, 5);

    return grade;
  };

  const getRecommendation = (grade) => {
    if (grade <= 2) return "Theo dõi bảo tồn.";
    if (grade === 3) return "Theo dõi sát, cân nhắc can thiệp.";
    return "Nguy cơ cao – cần đánh giá phẫu thuật hoặc can thiệp mạch.";
  };

  const calculate = (values) => {
    const grade = calculateGrade(values);
    const recommendation = getRecommendation(grade);

    setSummary({
      grade: `Grade ${grade}`,
      recommendation,
    });
  };

  const genHtml = async ({ isCopy }) => {
    const values = await form.validateFields();

    const grade = calculateGrade(values);
    const recommendation = getRecommendation(grade);

    const html = `
      <table border="1" cellpadding="6" style="border-collapse: collapse;">
        <caption><strong>Đánh giá chấn thương lách theo AAST</strong></caption>

        <tr>
          <th>Tụ máu dưới bao</th>
          <td>${values.subcapsular || ""}</td>
        </tr>

        <tr>
          <th>Tụ máu nhu mô</th>
          <td>${values.intraparenchymal || ""}</td>
        </tr>

        <tr>
          <th>Rách nhu mô</th>
          <td>${values.laceration || ""}</td>
        </tr>

        <tr>
          <th>Tổn thương mạch máu</th>
          <td>${values.vascular || ""}</td>
        </tr>

        <tr>
          <th>Giảm tưới máu</th>
          <td>${values.devascularization || ""}</td>
        </tr>

        <tr>
          <th>Lách vỡ nhiều mảnh</th>
          <td>${values.shattered || ""}</td>
        </tr>

        <tr>
          <td><strong>Phân độ</strong></td>
          <td>${grade}</td>
        </tr>

        <tr>
          <td><strong>Khuyến nghị</strong></td>
          <td>${recommendation}</td>
        </tr>
      </table>
    `;

    return isCopy
      ? html +
          `<div style="margin-top:16px;">${genAITextToHtml(
            geminiResponse,
          )}</div>`
      : html;
  };

  const onFinish = async (values) => {
    calculate(values);

    const tableHtml = await genHtml({ isCopy: false });

    try {
      const res = await API_CALL.get(`/chatgpt/ask-gemini-recommendation`, {
        params: {
          prompt: encodeURIComponent(tableHtml),
        },
      });

      const data = res.data;

      setGeminiResponse(
        data.data
          ?.replace(/\*\*(.*?)\*\*/g, "$1")
          .replace(/^\* /gm, "• ")
          .replace(/\n{2,}/g, "\n\n"),
      );
    } catch (error) {}
  };

  const onCopy = async () => {
    const html = await genHtml({ isCopy: true });

    await navigator.clipboard.write([
      new ClipboardItem({
        "text/html": new Blob([html], { type: "text/html" }),
      }),
    ]);
  };

  const onReset = () => {
    form.resetFields();
    setSummary({ grade: "", recommendation: "" });
  };

  const renderRadioOptions = (options) => (
    <Radio.Group>
      <div style={{ display: "flex" }}>
        {options.map((o) => (
          <Radio
            key={o.value}
            value={o.value}
            style={{ display: "block", minWidth: 200 }}
          >
            {o.label}
          </Radio>
        ))}
      </div>
    </Radio.Group>
  );

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.formContainer}>
        <ThamKhaoLinkHomeCare
          link={"https://home-care.vn/product/d-spleen/"}
          name={"D-Spleen"}
          desc={
            "Đánh giá phân độ chấn thương lách theo hệ thống AAST 2018 dựa trên hình ảnh CT"
          }
        />

        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item name="subcapsular" label="Tụ máu dưới bao">
            {renderRadioOptions(SPLEEN_OPTIONS.subcapsular)}
          </Form.Item>

          <Form.Item name="intraparenchymal" label="Tụ máu nhu mô">
            {renderRadioOptions(SPLEEN_OPTIONS.intraparenchymal)}
          </Form.Item>

          <Form.Item name="laceration" label="Rách nhu mô">
            {renderRadioOptions(SPLEEN_OPTIONS.laceration)}
          </Form.Item>

          <Form.Item name="vascular" label="Tổn thương mạch máu">
            {renderRadioOptions(SPLEEN_OPTIONS.vascular)}
          </Form.Item>

          <Form.Item name="devascularization" label="Giảm tưới máu">
            {renderRadioOptions(SPLEEN_OPTIONS.devascularization)}
          </Form.Item>

          <Form.Item name="shattered" label="Lách vỡ nhiều mảnh">
            {renderRadioOptions(SPLEEN_OPTIONS.shattered)}
          </Form.Item>

          <Divider />

          <Row gutter={24} className={styles.summaryRow}>
            <Col span={12}>
              <Text strong>Phân độ:</Text>{" "}
              <Text type="danger">{summary.grade}</Text>
            </Col>

            <Col span={12}>
              <Text strong>Khuyến nghị:</Text>{" "}
              <Text>{summary.recommendation}</Text>
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

export default DSpleenForm;
