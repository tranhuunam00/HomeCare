import React, { useState } from "react";
import {
  Form,
  Select,
  InputNumber,
  Radio,
  Button,
  Typography,
  Space,
  message,
  Slider,
  Row,
} from "antd";
import {
  ManOutlined,
  WomanOutlined,
  ReloadOutlined,
  CopyOutlined,
} from "@ant-design/icons";
import copy from "copy-to-clipboard";
import styles from "./cvrisForm.module.scss";

const { Title } = Typography;
const { Option } = Select;

const CVRISForm = () => {
  const [form] = Form.useForm();
  const [result, setResult] = useState(null);

  const onFinish = (values) => {
    const {
      gender,
      race,
      age,
      totalCholesterol,
      hdl,
      sbp,
      onHypertensionTreatment,
      smoking,
      diabetes,
    } = values;

    // ✅ CHỈ người da đen (black) mới là 1, còn lại là 0
    const raceValue = race === "black" ? 1 : 0;
    const genderNum = gender === "female" ? 1 : 2;
    const ratio = totalCholesterol / hdl;
    const sbp2 = sbp * sbp;

    let logit;
    if (genderNum === 1) {
      // NỮ
      logit =
        -12.82311 +
        0.106501 * age +
        0.43244 * raceValue +
        0.000056 * sbp2 +
        0.017666 * sbp +
        0.731678 * (onHypertensionTreatment ? 1 : 0) +
        0.94397 * (diabetes ? 1 : 0) +
        1.00979 * (smoking ? 1 : 0) +
        0.151318 * ratio +
        -0.00858 * age * raceValue +
        -0.003647 * sbp * (onHypertensionTreatment ? 1 : 0) +
        0.006208 * sbp * raceValue +
        0.152968 * raceValue * (onHypertensionTreatment ? 1 : 0) +
        -0.000153 * age * sbp +
        0.115232 * raceValue * (diabetes ? 1 : 0) +
        -0.092231 * raceValue * (smoking ? 1 : 0) +
        0.070498 * raceValue * ratio +
        -0.000173 * raceValue * sbp * (onHypertensionTreatment ? 1 : 0) +
        -0.000094 * age * sbp * raceValue;
    } else {
      // NAM
      logit =
        -11.67998 +
        0.0642 * age +
        0.482835 * raceValue +
        -0.000061 * sbp2 +
        0.03895 * sbp +
        2.055533 * (onHypertensionTreatment ? 1 : 0) +
        0.842209 * (diabetes ? 1 : 0) +
        0.895589 * (smoking ? 1 : 0) +
        0.193307 * ratio +
        -0.014207 * sbp * (onHypertensionTreatment ? 1 : 0) +
        0.011609 * sbp * raceValue +
        -0.11946 * (onHypertensionTreatment ? 1 : 0) * raceValue +
        0.000025 * age * sbp +
        -0.077214 * raceValue * (diabetes ? 1 : 0) +
        -0.226771 * raceValue * (smoking ? 1 : 0) +
        -0.117749 * raceValue * ratio +
        0.00419 * raceValue * (onHypertensionTreatment ? 1 : 0) * sbp +
        -0.000199 * raceValue * age * sbp;
    }

    const risk = 100 / (1 + Math.exp(-logit));
    setResult(`Nguy cơ mắc bệnh tim mạch trong 10 năm: ${risk.toFixed(2)}%`);
  };

  const onReset = () => {
    form.resetFields();
    setResult(null);
  };

  const onCopy = () => {
    if (result) {
      copy(result);
      message.success("Đã sao chép kết quả!");
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.formContainer}>
        <h2 style={{ marginBottom: 24 }}>D-CVRIS</h2>
        <h4>
          Uớc tính nguy cơ mắc bệnh tim mạch do xơ vữa động mạch (ASCVD) trong
          10 năm
        </h4>
        <div style={{ marginBottom: 50 }}></div>
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

          <Form.Item name="race" label="Chủng tộc" rules={[{ required: true }]}>
            <Select placeholder="Chọn chủng tộc">
              <Option value="asian">Châu Á</Option>
              <Option value="white">Da trắng</Option>
              <Option value="black">Da đen</Option>
              <Option value="other">Khác</Option>
            </Select>
          </Form.Item>

          <Form.Item name="age" label="Tuổi" rules={[{ required: true }]}>
            <Slider
              style={{ width: 300 }}
              min={20}
              max={79}
              tooltip={{ formatter: (value) => `${value} tuổi` }}
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
            label="HDL cholesterol (mmol/L)"
            rules={[{ required: true }]}
          >
            <InputNumber min={0} step={0.1} style={{ width: "100%" }} />
          </Form.Item>

          {/* <Form.Item
            name="ldl"
            label="6. LDL cholesterol (mmol/L)"
            rules={[{ required: true }]}
          >
            <InputNumber min={0} step={0.1} style={{ width: "100%" }} />
          </Form.Item> */}

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
            valuePropName="checked"
          >
            <Radio.Group>
              <Radio value={true}>Có</Radio>
              <Radio value={false}>Không</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            name="diabetes"
            label="Bị tiểu đường"
            valuePropName="checked"
          >
            <Radio.Group>
              <Radio value={true}>Có</Radio>
              <Radio value={false}>Không</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            name="smoking"
            label="Có hút thuốc lá"
            valuePropName="checked"
          >
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
              <Button icon={<ReloadOutlined />} onClick={onReset}>
                Đặt lại
              </Button>
              <Button icon={<CopyOutlined />} onClick={onCopy}>
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

export default CVRISForm;
