import React, { useState } from "react";
import {
  Form,
  Select,
  InputNumber,
  Radio,
  Button,
  Typography,
  Slider,
  Row,
  message,
} from "antd";
import {
  ManOutlined,
  WomanOutlined,
  ReloadOutlined,
  CopyOutlined,
} from "@ant-design/icons";
import copy from "copy-to-clipboard";
import styles from "./FraminghamForm.module.scss";

const { Title } = Typography;

const getAgeKey = (age) => {
  if (age >= 20 && age <= 39) return "20-39";
  if (age >= 40 && age <= 49) return "40-49";
  if (age >= 50 && age <= 59) return "50-59";
  if (age >= 60 && age <= 69) return "60-69";
  if (age >= 70 && age <= 79) return "70-79";
  return null;
};

const calculateFraminghamScore = ({
  gender,
  age,
  totalCholesterol,
  hdl,
  sbp,
  onHypertensionTreatment,
  smoking,
}) => {
  const isMale = gender === "male";
  let score = 0;

  const agePoints = isMale
    ? [
        { min: 20, max: 34, points: -9 },
        { min: 35, max: 39, points: -4 },
        { min: 40, max: 44, points: 0 },
        { min: 45, max: 49, points: 3 },
        { min: 50, max: 54, points: 6 },
        { min: 55, max: 59, points: 8 },
        { min: 60, max: 64, points: 10 },
        { min: 65, max: 69, points: 11 },
        { min: 70, max: 74, points: 12 },
        { min: 75, max: 79, points: 13 },
      ]
    : [
        { min: 20, max: 34, points: -7 },
        { min: 35, max: 39, points: -3 },
        { min: 40, max: 44, points: 0 },
        { min: 45, max: 49, points: 3 },
        { min: 50, max: 54, points: 6 },
        { min: 55, max: 59, points: 8 },
        { min: 60, max: 64, points: 10 },
        { min: 65, max: 69, points: 12 },
        { min: 70, max: 74, points: 14 },
        { min: 75, max: 79, points: 16 },
      ];
  score += agePoints.find((g) => age >= g.min && age <= g.max)?.points || 0;

  const ageKey = getAgeKey(age);

  const getCTPoints = (ct, age, isMale) => {
    const thresholds = [4.1, 5.2, 6.3, 7.3];
    const pointsTable = isMale
      ? {
          "20-39": [0, 4, 7, 9, 11],
          "40-49": [0, 3, 5, 6, 8],
          "50-59": [0, 2, 3, 4, 5],
          "60-69": [0, 1, 1, 2, 3],
          "70-79": [0, 0, 0, 1, 1],
        }
      : {
          "20-39": [0, 4, 8, 11, 13],
          "40-49": [0, 3, 6, 8, 10],
          "50-59": [0, 2, 4, 5, 7],
          "60-69": [0, 1, 2, 3, 4],
          "70-79": [0, 1, 1, 2, 2],
        };

    const ageKey = getAgeKey(age);

    const idx = thresholds.findIndex((t) => ct < t);
    const columnIndex = idx >= 0 ? idx : thresholds.length;

    return pointsTable[ageKey]?.[columnIndex] ?? 0;
  };

  score += getCTPoints(totalCholesterol, age, isMale);

  const smokingPoints = isMale
    ? { "20-39": 8, "40-49": 5, "50-59": 3, "60-69": 1, "70-79": 1 }
    : { "20-39": 9, "40-49": 7, "50-59": 4, "60-69": 2, "70-79": 1 };
  score += smoking ? 0 : smokingPoints[ageKey] ?? 0;
  console.log("smokingPoints[ageKey]", smokingPoints[ageKey]);

  score += hdl >= 60 ? -1 : hdl >= 50 ? 0 : hdl >= 40 ? 1 : 2;

  const bpTable = isMale
    ? [
        { max: 120, untreated: 0, treated: 0 },
        { max: 129, untreated: 0, treated: 1 },
        { max: 139, untreated: 1, treated: 2 },
        { max: 159, untreated: 1, treated: 2 },
        { max: Infinity, untreated: 2, treated: 3 },
      ]
    : [
        { max: 120, untreated: 0, treated: 0 },
        { max: 129, untreated: 1, treated: 3 },
        { max: 139, untreated: 2, treated: 4 },
        { max: 159, untreated: 3, treated: 5 },
        { max: Infinity, untreated: 4, treated: 6 },
      ];
  const bpScore =
    bpTable.find((r) => sbp <= r.max)?.[
      onHypertensionTreatment ? "treated" : "untreated"
    ] ?? 0;
  score += bpScore;

  return score;
};

const getFraminghamRisk = (score, isMale) => {
  const riskTable = isMale
    ? [
        { max: -1, risk: "<1%" },
        { max: 4, risk: "1%" },
        { max: 6, risk: "2%" },
        { max: 7, risk: "3%" },
        { max: 8, risk: "4%" },
        { max: 9, risk: "5%" },
        { max: 10, risk: "6%" },
        { max: 11, risk: "8%" },
        { max: 12, risk: "10%" },
        { max: 13, risk: "12%" },
        { max: 14, risk: "16%" },
        { max: 15, risk: "20%" },
        { max: 16, risk: "25%" },
        { max: 17, risk: "30%" },
        { max: Infinity, risk: ">30%" },
      ]
    : [
        { max: 8, risk: "<1%" },
        { max: 12, risk: "1%" },
        { max: 14, risk: "2%" },
        { max: 15, risk: "3%" },
        { max: 16, risk: "4%" },
        { max: 17, risk: "5%" },
        { max: 18, risk: "6%" },
        { max: 19, risk: "8%" },
        { max: 20, risk: "11%" },
        { max: 21, risk: "14%" },
        { max: 22, risk: "17%" },
        { max: 23, risk: "22%" },
        { max: 24, risk: "27%" },
        { max: Infinity, risk: ">30%" },
      ];
  return riskTable.find((r) => score <= r.max)?.risk ?? "N/A";
};

const FraminghamForm = () => {
  const [form] = Form.useForm();
  const [result, setResult] = useState(null);

  const onFinish = (values) => {
    const score = calculateFraminghamScore(values);
    const risk = getFraminghamRisk(score, values.gender === "male");
    setResult(
      `Tổng điểm: ${score} → Nguy cơ mắc bệnh tim mạch trong 10 năm: ${risk}`
    );
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.formContainer}>
        <h2>Framingham Risk Score</h2>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ gender: "male", onHypertensionTreatment: false }}
        >
          <Form.Item name="gender" label="Giới tính">
            <Radio.Group>
              <Radio.Button value="male">
                <ManOutlined /> Nam
              </Radio.Button>
              <Radio.Button value="female">
                <WomanOutlined /> Nữ
              </Radio.Button>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            name="age"
            label="Tuổi"
            rules={[{ required: true, message: "Vui lòng chọn tuổi" }]}
          >
            <Slider
              min={20}
              max={79}
              tooltip={{ formatter: (v) => `${v} tuổi` }}
              onChange={(value) => form.setFieldValue("age", value)}
            />
          </Form.Item>
          <Form.Item
            name="totalCholesterol"
            label="Cholesterol toàn phần (mmol/L)"
            rules={[{ required: true }]}
          >
            <InputNumber min={0} step={0.1} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            name="hdl"
            label="HDL-C (mg/dL)"
            rules={[{ required: true }]}
          >
            <InputNumber min={0} step={1} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            name="sbp"
            label="Huyết áp tâm thu (mmHg)"
            rules={[{ required: true }]}
          >
            <InputNumber min={80} max={250} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            name="onHypertensionTreatment"
            label="Đang điều trị tăng huyết áp"
          >
            <Radio.Group>
              <Radio value={true}>Có</Radio>
              <Radio value={false}>Không</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item name="smoking" label="Có hút thuốc lá">
            <Radio.Group>
              <Radio value={true}>Có</Radio>
              <Radio value={false}>Không</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item>
            <Row style={{ justifyContent: "flex-end", gap: 20 }}>
              <Button type="primary" htmlType="submit">
                Tính điểm
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  form.resetFields();
                  setResult(null);
                }}
              >
                Đặt lại
              </Button>
              <Button
                icon={<CopyOutlined />}
                onClick={() => {
                  if (result) {
                    copy(result);
                    message.success("Đã sao chép kết quả!");
                  }
                }}
              >
                Sao chép
              </Button>
            </Row>
          </Form.Item>
          {result && (
            <Form.Item>
              <Title level={4}>{result}</Title>
            </Form.Item>
          )}
        </Form>
      </div>
    </div>
  );
};

export default FraminghamForm;
