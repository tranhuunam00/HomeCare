export const BREAST_SIDE_OPTIONS = [
  { label: "Vú phải", value: "right" },
  { label: "Vú trái", value: "left" },
];

export const DENSITY_OPTIONS = [
  { label: "Type A – Nhiều mỡ, rất ít mô tuyến", value: "A" },
  { label: "Type B – Có ít mô tuyến rải rác", value: "B" },
  { label: "Type C – Nhiều mô tuyến, ít mô mỡ", value: "C" },
  { label: "Type D – Rất đặc, toàn mô tuyến", value: "D" },
];

export const LOCATION_OPTIONS = [
  { label: "Góc phần tư trên ngoài - UOQ", value: "UOQ" },
  { label: "Góc phần tư dưới ngoài - LOQ", value: "LOQ" },
  { label: "Góc phần tư trên trong - UIQ", value: "UIQ" },
  { label: "Góc phần tư dưới trong – LIQ", value: "LIQ" },
  { label: "Lan tỏa, không xác định được", value: "diffuse" },
];

export const SHAPE_OPTIONS = [
  { label: "Tròn – round (BR2)", value: "round", score: 2 },
  { label: "Bầu dục – oval (BR2)", value: "oval", score: 2 },
  {
    label: "Không xác định – irregular (BR4; BR5)",
    value: "irregular",
    score: 5,
  },
];

export const MARGIN_OPTIONS = [
  {
    label: "Bờ rõ nét – circumscribe (BR2; BR3)",
    value: "circumscribe",
    score: 3,
  },
  { label: "Bờ che lấp – obscured (BR3)", value: "obscured", score: 3 },
  {
    label: "Bờ đa cung nhỏ – microlobulated (BR4)",
    value: "microlobulated",
    score: 4,
  },
  {
    label: "Bờ tua gai – spiculated (BR4; BR5)",
    value: "spiculated",
    score: 5,
  },
  {
    label: "Không xác định – indistinct (BR4; BR5)",
    value: "indistinct",
    score: 5,
  },
];

export const ECHOGENICITY_OPTIONS = [
  { label: "Rất giảm – tương đương mỡ (BR2)", value: "very-low", score: 2 },
  { label: "Giảm đậm độ - low (BR2)", value: "low", score: 2 },
  { label: "Đồng đậm độ - equal (BR3)", value: "equal", score: 3 },
  { label: "Tăng đậm độ - high (BR4; BR5)", value: "high", score: 5 },
];

export const BENIGN_CALCIFICATION_OPTIONS = [
  { label: "Vôi hóa da (BR2)", value: "skin", score: 2 },
  { label: "Vôi hóa mạch máu (BR2)", value: "vascular", score: 2 },
  { label: "Vôi hóa hình bỏng ngô (BR2)", value: "popcorn", score: 2 },
  { label: "Vôi hóa hình vỏ trứng (BR2)", value: "egg-shell", score: 2 },
  { label: "Vôi hóa hình que lớn (BR2)", value: "large-rod", score: 2 },
  { label: "Vôi hóa hình tròn (BR2)", value: "round", score: 2 },
  { label: "Vôi hóa hình vỏ trứng (BR2)", value: "egg", score: 2 },
  { label: "Vôi hóa dạng sữa calci (BR2)", value: "milk", score: 2 },
  { label: "Vôi hóa mảng do loạn dưỡng (BR2)", value: "dystrophic", score: 2 },
];

export const SUSPICIOUS_CALCIFICATION_OPTIONS = [
  {
    label: "Vi vôi hóa không định hình – amorphous (BR3; BR4)",
    value: "amorphous",
    score: 4,
  },
  {
    label: "Vi vôi hóa thô – coarse (BR3)",
    value: "coarse",
    score: 3,
  },
  {
    label: "Vi vôi hóa đa hình nhỏ – fine pleomorphic (BR4; BR5)",
    value: "pleomorphic",
    score: 5,
  },
  {
    label:
      "Vi vôi hóa dải mảnh, dải chia nhánh – fine linear, branching (BR4; BR5)",
    value: "branching",
    score: 5,
  },
];

export const CALC_DISTRIBUTION_OPTIONS = [
  { label: "Dạng lan tỏa – diffuse (BR3)", value: "diffuse", score: 3 },
  { label: "Dạng vùng – regional (BR4)", value: "regional", score: 4 },
  { label: "Dạng cụm – group (BR4)", value: "group", score: 4 },
  { label: "Dạng dải – linear (BR3)", value: "linear", score: 3 },
  { label: "Dạng thùy – segmental (BR3)", value: "segmental", score: 3 },
];

export const OTHER_SUSPICIOUS_SIGNS = [
  { label: "Phù nề, dày bề mặt da (BR4; BR5)", value: "edema", score: 5 },
  { label: "Co kéo bề mặt da (BR4; BR5)", value: "skin-retraction", score: 5 },
  { label: "Co kéo núm vú (BR4; BR5)", value: "nipple-retraction", score: 5 },
  { label: "Bất đối xứng hai bên (BR3)", value: "asymmetry", score: 3 },
  {
    label: "Đảo lộn cấu trúc mô tuyến (BR3)",
    value: "disrupted-architecture",
    score: 3,
  },
  { label: "Hạch bệnh lý hố nách (BR3; BR4)", value: "lymph-node", score: 4 },
];

// src/pages/dbirads/BiradsForm.jsx
import React, { useState, useMemo, useEffect } from "react";
import {
  Form,
  Input,
  InputNumber,
  Select,
  Checkbox,
  Button,
  Radio,
  Card,
  message,
  Col,
  Row,
} from "antd";

import styles from "./BiradsForm.module.scss";
import { toast } from "react-toastify";

const BiradsForm = () => {
  const [form] = Form.useForm();
  const [volume, setVolume] = useState(0);
  const [recommendation, setRecommendation] = useState("");

  const biradsValue = Form.useWatch("birads", form);

  const getRecommendationFromBirads = (birads = "") => {
    if (birads.startsWith("BIRADS 1") || birads.startsWith("BIRADS 2")) {
      return "Theo dõi định kỳ 12 tháng";
    }
    if (birads.startsWith("BIRADS 3")) {
      return "Theo dõi định kỳ 6 tháng";
    }
    if (birads.startsWith("BIRADS 4") || birads.startsWith("BIRADS 5")) {
      return "Khám Bác sĩ chuyên khoa và sinh thiết lõi (Core-Biopsy)";
    }
    return "Không rõ";
  };

  useEffect(() => {
    setRecommendation(getRecommendationFromBirads(biradsValue));
  }, [biradsValue]);

  const getScore = (options, value) =>
    options.find((opt) => opt.value === value)?.score || 0;

  const getMaxScoreFromCheckbox = (options, selectedValues) =>
    Math.max(
      0,
      ...selectedValues.map(
        (v) => options.find((o) => o.value === v)?.score || 0
      )
    );
  const handleCalcVolume = () => {
    const values = form.getFieldsValue();
    const v = (values.D1 || 0) * (values.D2 || 0) * (values.D3 || 0) * 0.52;
    setVolume(Number.isNaN(v) ? 0 : Math.round(v * 100) / 100);
  };

  const getLabelFromValue = (options, value) => {
    if (Array.isArray(value)) {
      return value
        .map((v) => options.find((o) => o.value === v)?.label || v)
        .join(", ");
    }
    return options.find((o) => o.value === value)?.label || value;
  };
  const onCopy = async () => {
    try {
      const values = await form.validateFields();
      handleCalcVolume();

      const html = `
      <style>
        table { width: 100%; border-collapse: collapse; font-family: Arial; }
        th, td { border: 1px solid #ccc; padding: 8px 12px; font-size: 16px; text-align: left; }
        th { background-color: #f5f5f5; }
        caption { font-weight: bold; font-size: 18px; margin-bottom: 10px; }
      </style>
      <table>
        <caption>Đánh giá D-BIRADS MM</caption>
        <tr><th>Thông tin</th><th>Giá trị</th></tr>
        <tr><td>Tuyến vú khảo sát</td><td>${getLabelFromValue(
          BREAST_SIDE_OPTIONS,
          values.breastSide
        )}</td></tr>
        <tr><td>Mật độ tuyến vú</td><td>${getLabelFromValue(
          DENSITY_OPTIONS,
          values.density
        )}</td></tr>
        <tr><td>Vị trí tổn thương</td><td>${getLabelFromValue(
          LOCATION_OPTIONS,
          values.location
        )}</td></tr>
        <tr><td>D1</td><td>${values.D1 || 0} mm</td></tr>
        <tr><td>D2</td><td>${values.D2 || 0} mm</td></tr>
        <tr><td>D3</td><td>${values.D3 || 0} mm</td></tr>
        <tr><td>Thể tích tổn thương</td><td>${volume} mm³</td></tr>
        <tr><td>Hình dạng</td><td>${getLabelFromValue(
          SHAPE_OPTIONS,
          values.shape
        )}</td></tr>
        <tr><td>Bờ viền</td><td>${getLabelFromValue(
          MARGIN_OPTIONS,
          values.margin
        )}</td></tr>
        <tr><td>Đậm độ</td><td>${getLabelFromValue(
          ECHOGENICITY_OPTIONS,
          values.echogenicity
        )}</td></tr>
        <tr><td>Vôi hóa lành tính</td><td>${getLabelFromValue(
          BENIGN_CALCIFICATION_OPTIONS,
          values.benignCalc
        )}</td></tr>
        <tr><td>Vôi hóa nghi ngờ</td><td>${getLabelFromValue(
          SUSPICIOUS_CALCIFICATION_OPTIONS,
          values.suspiciousCalc
        )}</td></tr>
        <tr><td>Phân bố vôi hóa</td><td>${getLabelFromValue(
          CALC_DISTRIBUTION_OPTIONS,
          values.calcDist
        )}</td></tr>
        <tr><td>Dấu hiệu nghi ngờ khác</td><td>${getLabelFromValue(
          OTHER_SUSPICIOUS_SIGNS,
          values.suspiciousSigns || []
        )}</td></tr>
        <tr><td>Phân loại BIRADS</td><td><strong>${
          values.birads
        }</strong></td></tr>
        <tr><td>Khuyến nghị</td><td>${getRecommendationFromBirads(
          values.birads
        )}</td></tr>
      </table>
    `;

      await navigator.clipboard.write([
        new ClipboardItem({
          "text/html": new Blob([html], { type: "text/html" }),
        }),
      ]);

      toast.success("Đã copy bảng D-BIRADS vào clipboard!");
    } catch (err) {
      console.error(err);
      toast.error("Vui lòng điền đầy đủ và hợp lệ!", err);
    }
  };

  const onReset = () => {
    form.resetFields();
    setVolume(0);
  };

  const onCalculate = async () => {
    const values = await form.validateFields();
    handleCalcVolume();

    const scores = [
      getScore(SHAPE_OPTIONS, values.shape),
      getScore(MARGIN_OPTIONS, values.margin),
      getScore(ECHOGENICITY_OPTIONS, values.echogenicity),
      getScore(SUSPICIOUS_CALCIFICATION_OPTIONS, values.suspiciousCalc),
      getMaxScoreFromCheckbox(
        OTHER_SUSPICIOUS_SIGNS,
        values.suspiciousSigns || []
      ),
    ];

    const maxScore = Math.max(...scores);
    let biradsLabel = "";

    // Ánh xạ score → label BIRADS
    if (maxScore >= 1 && maxScore <= 5) {
      biradsLabel = `BIRADS ${maxScore}`;
      form.setFieldValue("birads", biradsLabel);
      toast.success(`Đã tính lại thể tích và gợi ý phân loại ${biradsLabel}`);
    } else {
      toast.success("Đã tính lại thể tích tổn thương!");
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.formContainer}>
        <Form form={form} layout="vertical" onValuesChange={handleCalcVolume}>
          <Row gutter={16}>
            <Col span={6}>
              <Form.Item
                name="breastSide"
                label="Tuyến vú khảo sát"
                rules={[{ required: true }]}
              >
                <Radio.Group options={BREAST_SIDE_OPTIONS} />
              </Form.Item>
            </Col>

            <Col span={9}>
              <Form.Item
                name="density"
                label="Mật độ tuyến vú"
                rules={[{ required: true }]}
              >
                <Radio.Group options={DENSITY_OPTIONS} />
              </Form.Item>
            </Col>

            <Col span={9}>
              <Form.Item
                name="location"
                label="Vị trí tổn thương"
                rules={[{ required: true }]}
              >
                <Radio.Group options={LOCATION_OPTIONS} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={6}>
              <Form.Item name="D1" label="D1 (mm)">
                <InputNumber
                  placeholder="Nhập kích thước"
                  min={0}
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="D2" label="D2 (mm)">
                <InputNumber
                  placeholder="Nhập kích thước"
                  min={0}
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="D3" label="D3 (mm)">
                <InputNumber
                  placeholder="Nhập kích thước"
                  min={0}
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="Thể tích (mm³)">
                <Input disabled value={volume} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="shape"
            label="Hình dạng tổn thương"
            rules={[
              { required: true, message: "Vui lòng chọn hình dạng tổn thương" },
            ]}
          >
            <Radio.Group>
              <Row gutter={[12, 12]}>
                {SHAPE_OPTIONS.map((opt) => (
                  <Col key={opt.value} span={16}>
                    <Radio value={opt.value}>{opt.label}</Radio>
                  </Col>
                ))}
              </Row>
            </Radio.Group>
          </Form.Item>
          <Form.Item
            name="margin"
            label="Bờ viền tổn thương"
            rules={[{ required: true, message: "Vui lòng chọn bờ viền" }]}
          >
            <Radio.Group>
              <Row gutter={[12, 12]}>
                {MARGIN_OPTIONS.map((option) => (
                  <Col key={option.value} span={12}>
                    <Radio value={option.value}>{option.label}</Radio>
                  </Col>
                ))}
              </Row>
            </Radio.Group>
          </Form.Item>
          <Form.Item
            name="echogenicity"
            label="Đậm độ tổn thương"
            rules={[{ required: true }]}
          >
            <Radio.Group options={ECHOGENICITY_OPTIONS} />
          </Form.Item>

          <Form.Item
            name="benignCalc"
            label="Vôi hóa lành tính"
            rules={[{ required: true, message: "Bắt buộc chọn một mục" }]}
          >
            <Radio.Group>
              <Row gutter={[12, 12]}>
                {BENIGN_CALCIFICATION_OPTIONS.map((option, index) => (
                  <Col key={option.value} span={12}>
                    <Radio value={option.value}>{option.label}</Radio>
                  </Col>
                ))}
              </Row>
            </Radio.Group>
          </Form.Item>
          <Form.Item
            name="suspiciousCalc"
            label="Vôi hóa nghi ngờ"
            rules={[{ required: true, message: "Bắt buộc chọn một mục" }]}
          >
            <Radio.Group>
              <Row gutter={[12, 12]}>
                {SUSPICIOUS_CALCIFICATION_OPTIONS.map((option) => (
                  <Col key={option.value} span={12}>
                    <Radio value={option.value}>{option.label}</Radio>
                  </Col>
                ))}
              </Row>
            </Radio.Group>
          </Form.Item>
          <Form.Item
            name="calcDist"
            label="Phân bố vôi hóa"
            rules={[{ required: true }]}
          >
            <Select options={CALC_DISTRIBUTION_OPTIONS} />
          </Form.Item>
          <Form.Item name="suspiciousSigns" label="Dấu hiệu nghi ngờ khác">
            <Checkbox.Group>
              <Row gutter={[12, 12]}>
                {OTHER_SUSPICIOUS_SIGNS.map((option) => (
                  <Col key={option.value} span={12}>
                    <Checkbox value={option.value}>{option.label}</Checkbox>
                  </Col>
                ))}
              </Row>
            </Checkbox.Group>
          </Form.Item>

          <Form.Item name="birads" label="Phân loại BIRADS">
            <Select
              options={[
                { label: "BIRADS 1", value: "BIRADS 1" },
                { label: "BIRADS 2", value: "BIRADS 2" },
                { label: "BIRADS 3", value: "BIRADS 3" },
                { label: "BIRADS 4A", value: "BIRADS 4A" },
                { label: "BIRADS 4B", value: "BIRADS 4B" },
                { label: "BIRADS 4C", value: "BIRADS 4C" },
                { label: "BIRADS 5", value: "BIRADS 5" },
              ]}
            />
          </Form.Item>
          {recommendation && (
            <div
              style={{
                marginTop: -12,
                marginBottom: 24,
                fontStyle: "italic",
                color: "#595959",
              }}
            >
              <strong>Khuyến nghị:</strong> {recommendation}
            </div>
          )}
          <Form.Item>
            <Row gutter={16}>
              <Col>
                <Button onClick={onCalculate}>Tính điểm</Button>
              </Col>
              <Col>
                <Button onClick={onReset} danger>
                  Reset
                </Button>
              </Col>
              <Col>
                <Button type="primary" onClick={onCopy}>
                  Copy
                </Button>
              </Col>
            </Row>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default BiradsForm;
