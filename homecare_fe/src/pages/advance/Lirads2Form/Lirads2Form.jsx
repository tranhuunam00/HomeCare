import React, { useState } from "react";
import {
  Card,
  Row,
  Col,
  Radio,
  Select,
  InputNumber,
  Button,
  Typography,
  message,
} from "antd";
import styles from "./Lirads2Form.module.scss";

const { Text, Title } = Typography;

const CIRRHOSIS_CAUSES = [
  { label: "Khác", value: "other" },
  { label: "Xơ gan bẩm sinh", value: "chf" },
  { label: "Rối loạn mạch máu", value: "vascular" },
];

const Lirads2Form = () => {
  const [applicable, setApplicable] = useState(null);

  const [form, setForm] = useState({
    age: false,
    cirrhosis: false,
    hepatitisB: false,
    priorHCC: false,
    cirrhosisCause: "vascular",

    aphe: false,
    washout: false,
    capsule: false,
    size: 10,
    growth: false,
  });

  const [result, setResult] = useState("");

  const handleChange = (key, value) => {
    setForm({ ...form, [key]: value });
  };

  const checkApplicability = () => {
    if (form.age && (form.cirrhosis || form.hepatitisB) && !form.priorHCC) {
      setApplicable(true);
    } else {
      setApplicable(false);
    }
  };

  const calculateLIRADS = () => {
    if (!applicable) {
      message.error("LI-RADS không áp dụng");
      return;
    }

    let score = 0;

    if (form.aphe) score += 2;
    if (form.washout) score += 2;
    if (form.capsule) score += 1;
    if (form.growth) score += 1;

    if (form.size >= 20) score += 2;
    else if (form.size >= 10) score += 1;

    if (score >= 5) setResult("LR-5 (Chắc chắn HCC)");
    else if (score >= 3) setResult("LR-4 (Nghi ngờ cao)");
    else if (score >= 2) setResult("LR-3 (Trung gian)");
    else setResult("LR-2 (Có thể lành tính)");
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
        <Row gutter={16}>
          {/* LEFT */}
          <Col span={12}>
            <Card title="Khả năng áp dụng LI-RADS" className={styles.card}>
              <div className={styles.formGroup}>
                <p>Bệnh nhân ≥18 tuổi?</p>
                <Radio.Group
                  onChange={(e) => handleChange("age", e.target.value)}
                >
                  <Radio value={true}>Yes</Radio>
                  <Radio value={false}>No</Radio>
                </Radio.Group>
              </div>

              <div className={styles.formGroup}>
                <p>Bệnh nhân có xơ gan?</p>
                <Radio.Group
                  onChange={(e) => handleChange("cirrhosis", e.target.value)}
                >
                  <Radio value={true}>Yes</Radio>
                  <Radio value={false}>No</Radio>
                </Radio.Group>
              </div>

              {form.cirrhosis && (
                <div className={styles.formGroup}>
                  <p>Nguyên nhân gây xơ gan</p>
                  <Select
                    value={form.cirrhosisCause}
                    onChange={(val) => handleChange("cirrhosisCause", val)}
                    style={{ width: "100%" }}
                    options={CIRRHOSIS_CAUSES}
                  />
                </div>
              )}

              <div className={styles.formGroup}>
                <p>Có viêm gan B?</p>
                <Radio.Group
                  onChange={(e) => handleChange("hepatitisB", e.target.value)}
                >
                  <Radio value={true}>Yes</Radio>
                  <Radio value={false}>No</Radio>
                </Radio.Group>
              </div>

              <div className={styles.formGroup}>
                <p>Có tiền sử HCC?</p>
                <Radio.Group
                  onChange={(e) => handleChange("priorHCC", e.target.value)}
                >
                  <Radio value={true}>Yes</Radio>
                  <Radio value={false}>No</Radio>
                </Radio.Group>
              </div>

              <Button
                type="primary"
                onClick={checkApplicability}
                className={styles.buttonCheck}
              >
                Check LI-RADS
              </Button>

              {applicable === false && (
                <Text className={styles.statusError}>
                  LI-RADS không áp dụng được
                </Text>
              )}
              {applicable === true && (
                <Text className={styles.statusSuccess}>
                  Có thể áp dụng LI-RADS
                </Text>
              )}
            </Card>
          </Col>

          {/* RIGHT */}
          <Col span={12}>
            <Card title="Thanh điểm LI-RADS" className={styles.card}>
              <div className={styles.formGroup}>
                <p>Non-rim APHE</p>
                <Radio.Group
                  onChange={(e) => handleChange("aphe", e.target.value)}
                >
                  <Radio value={true}>Yes</Radio>
                  <Radio value={false}>No</Radio>
                </Radio.Group>
              </div>

              <div className={styles.formGroup}>
                <p>Washout</p>
                <Radio.Group
                  onChange={(e) => handleChange("washout", e.target.value)}
                >
                  <Radio value={true}>Yes</Radio>
                  <Radio value={false}>No</Radio>
                </Radio.Group>
              </div>

              <div className={styles.formGroup}>
                <p>Capsule</p>
                <Radio.Group
                  onChange={(e) => handleChange("capsule", e.target.value)}
                >
                  <Radio value={true}>Yes</Radio>
                  <Radio value={false}>No</Radio>
                </Radio.Group>
              </div>

              <div className={styles.formGroup}>
                <p>Size (mm)</p>
                <InputNumber
                  min={1}
                  value={form.size}
                  onChange={(val) => handleChange("size", val)}
                  style={{ width: "100%" }}
                />
              </div>

              <div className={styles.formGroup}>
                <p>Threshold Growth</p>
                <Select
                  style={{ width: "100%" }}
                  onChange={(val) => handleChange("growth", val)}
                  value={form.growth}
                >
                  <Select.Option value={true}>Yes</Select.Option>
                  <Select.Option value={false}>No</Select.Option>
                </Select>
              </div>

              <Button
                type="primary"
                onClick={calculateLIRADS}
                className={styles.buttonPrimary}
              >
                Calculate LI-RADS
              </Button>

              {result && (
                <div className={styles.resultBox}>
                  <Title level={4}>{result}</Title>
                </div>
              )}
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default Lirads2Form;
