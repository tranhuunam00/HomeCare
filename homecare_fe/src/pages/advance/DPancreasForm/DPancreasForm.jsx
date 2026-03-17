import React, { useState } from "react";
import { Form, Typography, Divider, Button, Row, Col, Radio } from "antd";

import { ReloadOutlined, CopyOutlined } from "@ant-design/icons";

import styles from "./DPancreasForm.module.scss";
import { genAITextToHtml } from "../../../constant/app";
import AIRecommendationEditor from "../../../components/AIRecommendationEditor";
import { ThamKhaoLinkHomeCare } from "../component_common/Thamkhao";
import API_CALL from "../../../services/axiosClient";

const { Text } = Typography;

export const PANCREAS_OPTIONS = {
  contusion: [
    { label: "Không", value: "none" },
    { label: "Dập nhẹ", value: "minor" },
    { label: "Dập nặng", value: "major" },
  ],

  lacerationDepth: [
    { label: "Không", value: "none" },
    { label: "Rách nông", value: "superficial" },
    { label: "Rách sâu", value: "deep" },
  ],

  ductInjury: [
    { label: "Không", value: "no" },
    { label: "Có", value: "yes" },
  ],

  location: [
    { label: "Distal pancreas", value: "distal" },
    { label: "Proximal pancreas", value: "proximal" },
  ],

  transection: [
    { label: "Không", value: "none" },
    { label: "Distal transection", value: "distal" },
    { label: "Proximal transection", value: "proximal" },
  ],

  shattered: [
    { label: "Không", value: "no" },
    { label: "Có", value: "yes" },
  ],
};

const DPancreasForm = () => {
  const [form] = Form.useForm();
  const [geminiResponse, setGeminiResponse] = useState("");

  const [summary, setSummary] = useState({
    grade: "",
    recommendation: "",
  });

  const calculateGrade = (values) => {
    let grade = 0;

    const {
      contusion,
      lacerationDepth,
      ductInjury,
      location,
      transection,
      shattered,
    } = values;

    if (contusion === "minor" || lacerationDepth === "superficial")
      grade = Math.max(grade, 1);

    if (contusion === "major" && ductInjury === "no")
      grade = Math.max(grade, 2);

    if (
      ductInjury === "yes" &&
      (transection === "distal" || location === "distal")
    )
      grade = Math.max(grade, 3);

    if (
      ductInjury === "yes" &&
      (transection === "proximal" || location === "proximal")
    )
      grade = Math.max(grade, 4);

    if (shattered === "yes") grade = 5;

    return grade;
  };

  const getRecommendation = (grade) => {
    if (grade <= 2) return "Theo dõi bảo tồn.";
    if (grade === 3) return "Cân nhắc can thiệp phẫu thuật.";
    return "Nguy cơ cao – cần đánh giá phẫu thuật khẩn.";
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
  <caption><strong>Đánh giá chấn thương tụy theo AAST</strong></caption>

<tr>
<th>Dập tụy</th>
<td>${values.contusion || ""}</td>
</tr>

<tr>
<th>Độ sâu rách nhu mô</th>
<td>${values.lacerationDepth || ""}</td>
</tr>

<tr>
<th>Tổn thương ống tụy</th>
<td>${values.ductInjury || ""}</td>
</tr>

<tr>
<th>Vị trí tụy</th>
<td>${values.location || ""}</td>
</tr>

<tr>
<th>Đứt tụy</th>
<td>${values.transection || ""}</td>
</tr>

<tr>
<th>Tụy vỡ nhiều mảnh</th>
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
          link={"https://home-care.vn/product/d-pancreas/"}
          name={"D-Pancreas"}
          desc={"Đánh giá chấn thương tụy theo hệ thống AAST"}
        />

        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item name="contusion" label="Dập tụy">
            {renderRadioOptions(PANCREAS_OPTIONS.contusion)}
          </Form.Item>

          <Form.Item name="lacerationDepth" label="Độ sâu rách nhu mô">
            {renderRadioOptions(PANCREAS_OPTIONS.lacerationDepth)}
          </Form.Item>

          <Form.Item name="ductInjury" label="Tổn thương ống tụy">
            {renderRadioOptions(PANCREAS_OPTIONS.ductInjury)}
          </Form.Item>

          <Form.Item name="location" label="Vị trí tụy">
            {renderRadioOptions(PANCREAS_OPTIONS.location)}
          </Form.Item>

          <Form.Item name="transection" label="Đứt tụy">
            {renderRadioOptions(PANCREAS_OPTIONS.transection)}
          </Form.Item>

          <Form.Item name="shattered" label="Tụy vỡ nhiều mảnh">
            {renderRadioOptions(PANCREAS_OPTIONS.shattered)}
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

export default DPancreasForm;
