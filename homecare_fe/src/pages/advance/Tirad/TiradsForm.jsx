// tiradsConstants.js
export const COMPOSITION_OPTIONS = [
  { label: "Nang dịch (0 điểm)", value: 0 },
  { label: "Bọt biển (1 điểm)", value: 1 },
  { label: "Hỗn hợp (2 điểm)", value: 2 },
  { label: "Tổ chức đặc (3 điểm)", value: 3 },
];

export const STRUCTURE_OPTIONS = [
  { label: "Trống âm (0 điểm)", value: 0 },
  { label: "Đồng âm (1 điểm)", value: 1 },
  { label: "Giảm âm (2 điểm)", value: 2 },
  { label: "Rất giảm âm (3 điểm)", value: 3 },
];

export const SHAPE_OPTIONS = [
  { label: "Trục dài song song bề mặt da (0 điểm)", value: 0 },
  { label: "Trục dài vuông góc bề mặt da (3 điểm)", value: 3 },
];

export const MARGIN_OPTIONS = [
  { label: "Nhẵn (0 điểm)", value: 0 },
  { label: "Không rõ (1 điểm)", value: 1 },
  { label: "Không đều (2 điểm)", value: 2 },
  { label: "Mất liên tục (3 điểm)", value: 3 },
];

export const CALCIFICATION_OPTIONS = [
  { label: "Không (0 điểm)", value: 0 },
  { label: "Mảnh thô (1 điểm)", value: 1 },
  { label: "Vôi hóa vỏ (2 điểm)", value: 2 },
  { label: "Vi vôi hóa (3 điểm)", value: 3 },
];

// TiradsForm.jsx
import React, { useState } from "react";
import {
  Form,
  InputNumber,
  Select,
  Button,
  Row,
  Col,
  Divider,
  Typography,
  message,
} from "antd";
import { CopyOutlined, ReloadOutlined } from "@ant-design/icons";
import styles from "./TiradsForm.module.scss";
import { toast } from "react-toastify";

const { Text } = Typography;

const TiradsForm = () => {
  const [form] = Form.useForm();
  const [summary, setSummary] = useState({
    score: 0,
    tirads: "",
    recommendation: "",
  });
  const [volume, setVolume] = useState(0);

  const defaultValues = {};

  const getTotalScore = (values) => {
    const {
      structure = 0,
      echogenicity = 0,
      shape = 0,
      margin = 0,
      composition = 0,
      calcification = [],
    } = values;

    const calcScore = Array.isArray(calcification)
      ? calcification.reduce((sum, val) => sum + Number(val || 0), 0)
      : Number(calcification || 0);

    return (
      Number(structure) +
      Number(echogenicity) +
      Number(shape) +
      Number(margin) +
      Number(composition) +
      calcScore
    );
  };

  const getTirads = (score) => {
    if (score === 0) return "TIRADS 1";
    if ([1, 2].includes(score)) return "TIRADS 2";
    if (score === 3) return "TIRADS 3";
    if (score >= 4 && score <= 6) return "TIRADS 4";
    if (score >= 7) return "TIRADS 5";
    return "";
  };

  const getRecommendation = (tirads, size) => {
    if (tirads === "TIRADS 1") return "Theo dõi định kỳ 12 tháng";
    if (tirads === "TIRADS 2") return "Theo dõi định kỳ 6-12 tháng";
    if (tirads === "TIRADS 3")
      return size < 2.5 ? "Theo dõi 6-12 tháng" : "Chọc hút FNA nếu ≥2.5cm";
    if (tirads === "TIRADS 4")
      return size < 1.5 ? "Theo dõi 3-6 tháng" : "Chọc hút FNA nếu ≥1.5cm";
    if (tirads === "TIRADS 5")
      return size >= 1.0 ? "Chọc hút tế bào kim nhỏ FNA" : "Theo dõi sát";
    return "";
  };

  const getLabelWithScore = (options, value) => {
    const found = options.find((opt) => opt.value === value);
    return found ? `${found.label} (${value} điểm)` : `${value} điểm`;
  };

  const onReset = () => {
    form.resetFields();
    setSummary({ score: 0, tirads: "", recommendation: "" });
  };

  const onCalculate = async () => {
    try {
      console.log("first", form.getFieldsValue());
      const values = await form.validateFields();
      const score = getTotalScore(values);
      const tirads = getTirads(score);
      const recommendation = getRecommendation(
        tirads,
        Math.max(values.D1 || 0, values.D2 || 0, values.D3 || 0)
      );
      setSummary({ score, tirads, recommendation });
    } catch {
      message.error("Vui lòng điền đầy đủ thông tin hợp lệ!");
    }
  };

  const onCopy = async () => {
    try {
      const values = await form.validateFields();
      const score = getTotalScore(values);
      const tirads = getTirads(score);
      const recommendation = getRecommendation(
        tirads,
        Math.max(values.D1 || 0, values.D2 || 0, values.D3 || 0)
      );

      const calcDisplay =
        Array.isArray(values.calcification) && values.calcification.length > 0
          ? `
        <ul style="padding-left: 16px; margin: 0;">
          ${values.calcification
            .map(
              (v) =>
                `<li style="margin-bottom: 8px;">${getLabelWithScore(
                  CALCIFICATION_OPTIONS,
                  v
                )}</li>`
            )
            .join("")}
        </ul>
      `
          : "Không";

      const html = `
      <style>
        table {
          width: 100%;
          border-collapse: collapse;
          font-family: Arial, sans-serif;
        }
        th, td {
          border: 1px solid #ccc;
          padding: 8px 12px;
          text-align: left;
          font-size: 16px;
          vertical-align: top;
          word-wrap: break-word;
          white-space: pre-wrap;
        }
        th {
          background-color: #f5f5f5;
        }
        caption {
          caption-side: top;
          font-weight: bold;
          font-size: 18px;
          margin-bottom: 10px;
          text-align: left;
        }
      </style>
      <table>
        <caption>Đánh giá TIRADS</caption>
        <tr><th>Thông tin</th><th>Giá trị</th></tr>
        <tr><td>Vị trí tổn thương</td><td>${values.location || ""}</td></tr>
        <tr>
          <td>Kích thước</td>
          <td>
            <table style="width: 100%; border-collapse: collapse; border: none;">
              <tr>
                <td style="text-align: center; border: none; padding: 0; border-right: 1px solid #ccc;">${
                  values.D1 || ""
                } mm</td>
                <td style="text-align: center; border: none; padding: 0; border-right: 1px solid #ccc;">${
                  values.D2 || ""
                } mm</td>
                <td style="text-align: center; border: none; padding: 0;">${
                  values.D3 || ""
                } mm</td>
              </tr>
            </table>
          </td>
        </tr>
        <tr><td>Thể tích</td><td style="text-align: center;">${volume} mm3 </td></tr>
        <tr><td>Đặc điểm thành phần</td><td>${getLabelWithScore(
          COMPOSITION_OPTIONS,
          values.composition
        )}</td></tr>
        <tr><td>Đặc điểm cấu trúc âm</td><td>${getLabelWithScore(
          STRUCTURE_OPTIONS,
          values.structure
        )}</td></tr>
        <tr><td>Đặc điểm hình dạng</td><td>${getLabelWithScore(
          SHAPE_OPTIONS,
          values.shape
        )}</td></tr>
        <tr><td>Đặc điểm bờ viền</td><td>${getLabelWithScore(
          MARGIN_OPTIONS,
          values.margin
        )}</td></tr>
        <tr><td>Đặc điểm vôi hóa</td><td>${calcDisplay}</td></tr>
        <tr><td><strong>Tổng điểm</strong></td><td style="text-align: center;">${score}</td></tr>
        <tr><td>Phân loại (ACR-TIRADS)</td><td><strong style="text-align: center;">${tirads}</strong></td></tr>
        <tr><td>Khuyến nghị</td><td>${recommendation}</td></tr>
        <tr><td>Ghi chú</td><td><em>${"home-care"}</em></td></tr>
      </table>
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

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.formContainer}>
        <Form form={form} layout="vertical" initialValues={defaultValues}>
          <h2 style={{ marginBottom: 24 }}>D-TIRADS HOME-CARE</h2>
          <h4>Lĩnh vực: siêu âm</h4>
          <h4>Mục đích: sàng lọc chẩn đoán sớm ung thư tuyến giáp</h4>
          <div style={{ marginBottom: 50 }}></div>
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                name="location"
                label="Vị trí tổn thương"
                rules={[{ required: true }]}
              >
                <Select placeholder="Chọn vị trí">
                  <Select.Option value="Thùy phải">
                    Thùy phải tuyến giáp
                  </Select.Option>
                  <Select.Option value="Thùy trái">
                    Thùy trái tuyến giáp
                  </Select.Option>
                  <Select.Option value="Eo">Eo tuyến giáp</Select.Option>
                </Select>
              </Form.Item>
              {["D1", "D2", "D3"].map((dim) => (
                <Form.Item
                  key={dim}
                  name={dim}
                  label={`${dim} (mm)`}
                  rules={[{ required: true }]}
                >
                  <InputNumber
                    style={{ width: "100%" }}
                    placeholder="Nhập kích thước"
                    onChange={() => {
                      const { D1, D2, D3 } = form.getFieldsValue();
                      const v = (D1 || 0) * (D2 || 0) * (D3 || 0) * 0.52;
                      setVolume(
                        Number.isNaN(v) ? 0 : Math.round(v * 100) / 100
                      );
                    }}
                  />
                </Form.Item>
              ))}

              <Form.Item label="Thể tích (mm³)">
                <InputNumber
                  style={{ width: "100%" }}
                  disabled
                  value={volume}
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="composition"
                label="Đặc điểm thành phần"
                rules={[{ required: true }]}
              >
                <Select options={COMPOSITION_OPTIONS} />
              </Form.Item>
              <Form.Item
                name="structure"
                label="Đặc điểm cấu trúc âm"
                rules={[{ required: true }]}
              >
                <Select options={STRUCTURE_OPTIONS} />
              </Form.Item>
              <Form.Item
                name="shape"
                label="Đặc điểm hình dạng"
                rules={[{ required: true }]}
              >
                <Select options={SHAPE_OPTIONS} />
              </Form.Item>
              <Form.Item
                name="margin"
                label="Đặc điểm bờ viền"
                rules={[{ required: true }]}
              >
                <Select options={MARGIN_OPTIONS} />
              </Form.Item>
              <Form.Item
                name="calcification"
                label="Đặc điểm vôi hóa"
                rules={[{ required: true }]}
                validateTrigger="onChange"
              >
                <Select
                  mode="multiple"
                  allowClear
                  options={CALCIFICATION_OPTIONS}
                />
              </Form.Item>
            </Col>
          </Row>
          <Divider />
          <Row gutter={24} className={styles.summaryRow}>
            <Col span={8}>
              <Text strong>Tổng điểm:</Text>
              <Text type="danger">{summary.score}</Text>
            </Col>
            <Col span={8}>
              <Text strong>Phân loại:</Text> <Text>{summary.tirads}</Text>
            </Col>
            <Col span={8}>
              <Text strong>Khuyến nghị:</Text>
              <Text>{summary.recommendation}</Text>
            </Col>
          </Row>
          <Divider />
          <div className={styles.buttonRow}>
            <Button icon={<ReloadOutlined />} onClick={onReset}>
              Reset
            </Button>
            <Button onClick={onCalculate}>Tính điểm</Button>
            <Button icon={<CopyOutlined />} type="primary" onClick={onCopy}>
              Copy toàn bộ
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default TiradsForm;
