// AASTKidneyForm.jsx - Biểu mẫu React đánh giá Tổn thương thận theo AAST

import React, { useState } from "react";
import { Form, Button, Checkbox, Row, Col, Divider, Typography } from "antd";
import { CopyOutlined, ReloadOutlined } from "@ant-design/icons";
import styles from "./AASTKidneyForm.module.scss";
import { toast } from "react-toastify";

const { Text } = Typography;

const VASCULAR_SUBOPTIONS = [
  {
    label: "Tụ máu quanh thận giới hạn trong mạc Gerota",
    value: "gerota_hematoma",
    score: 2,
  },
  {
    label: "Chảy máu hoạt động trong mạc Gerota",
    value: "gerota_bleeding",
    score: 3,
  },
  {
    label: "Chảy máu vượt ngoài mạc Gerota vào sau phúc mạc hoặc phúc mạc",
    value: "retro_bleeding",
    score: 4,
  },
  {
    label: "Tổn thương tĩnh mạch hoặc động mạch thận phân đoạn",
    value: "segmental_vessel",
    score: 4,
  },
  {
    label: "Rách hoặc đứt động mạch/tĩnh mạch chính của thận",
    value: "main_vessel_laceration",
    score: 5,
  },
  {
    label: "Thận mất tưới máu kèm chảy máu hoạt động",
    value: "devascularized_bleeding",
    score: 5,
  },
];

const LACERATION_SUBOPTIONS = [
  { label: "Chỉ dập nhu mô, không rách", value: "contusion", score: 1 },
  {
    label: "≤1 cm, không vỡ hệ thống thu thập nước tiểu, không rò rỉ nước tiểu",
    value: "laceration_1cm",
    score: 2,
  },
  {
    label: ">1 cm, không vỡ hệ thống thu thập nước tiểu, không rò rỉ nước tiểu",
    value: "laceration_gt1cm",
    score: 3,
  },
  {
    label:
      "Rách nhu mô lan đến hệ thống thu thập nước tiểu kèm rò rỉ nước tiểu",
    value: "collecting_system_injury",
    score: 4,
  },
  {
    label: "Rách bể thận và/hoặc đứt rời hoàn toàn chỗ nối bể thận - niệu quản",
    value: "pelvis_disruption",
    score: 4,
  },
];

const AASTKidneyForm = () => {
  const [form] = Form.useForm();
  const [maxGrade, setMaxGrade] = useState(0);
  const [injuries, setInjuries] = useState([]);
  const [lacerationGrades, setLacerationGrades] = useState([]);
  const [vascularGrades, setVascularGrades] = useState([]);

  const onReset = () => {
    form.resetFields();
    setInjuries([]);
    setLacerationGrades([]);
    setVascularGrades([]);
    setMaxGrade(0);
  };

  const onCalculate = () => {
    let grades = [];

    if (injuries.includes("Tụ máu dưới bao thận")) grades.push(1);

    if (injuries.includes("Dập/rách nhu mô thận")) {
      const lacPoints = LACERATION_SUBOPTIONS.filter((opt) =>
        lacerationGrades.includes(opt.value)
      ).map((opt) => opt.score);
      grades.push(...lacPoints);
    }

    if (
      injuries.includes(
        "Nhồi máu thận từng phần hoặc toàn bộ do huyết khối, không có chảy máu hoạt động"
      )
    ) {
      grades.push(4);
    }

    if (injuries.includes("Tổn thương mạch máu")) {
      const vascularPoints = VASCULAR_SUBOPTIONS.filter((opt) =>
        vascularGrades.includes(opt.value)
      ).map((opt) => opt.score);
      grades.push(...vascularPoints);
    }

    if (
      injuries.includes(
        "Thận bị phá hủy hoàn toàn, mất hình dạng giải phẫu ban đầu"
      )
    ) {
      grades.push(5);
    }

    const max = Math.max(...grades, 0);
    setMaxGrade(max);
  };

  const onCopy = async () => {
    const summary = `Điểm tổn thương thận theo AAST: Độ ${maxGrade}`;
    await navigator.clipboard.writeText(summary);
    toast.success("Đã copy kết quả vào clipboard");
  };

  const injuryOptions = [
    { label: "Tụ máu dưới bao thận", value: "Tụ máu dưới bao thận" },
    {
      label: "Dập/rách nhu mô thận",
      value: "Dập/rách nhu mô thận",
    },
    {
      label:
        "Nhồi máu thận từng phần hoặc toàn bộ do huyết khối, không có chảy máu hoạt động",
      value:
        "Nhồi máu thận từng phần hoặc toàn bộ do huyết khối, không có chảy máu hoạt động",
    },
    { label: "Tổn thương mạch máu", value: "Tổn thương mạch máu" },
    {
      label: "Thận bị phá hủy hoàn toàn, mất hình dạng giải phẫu ban đầu",
      value: "Thận bị phá hủy hoàn toàn, mất hình dạng giải phẫu ban đầu",
    },
  ];

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.formContainer}>
        <Form form={form} layout="vertical">
          <h2>Thang điểm tổn thương thận AAST</h2>
          <Form.Item
            name="injuries"
            label="Chọn các loại tổn thương đã xác định (có thể chọn nhiều)"
          >
            <Checkbox.Group
              value={injuries}
              onChange={(checked) => setInjuries(checked)}
            >
              <div
                style={{ display: "flex", flexDirection: "column", gap: "8px" }}
              >
                {injuryOptions.map((opt) => (
                  <Checkbox key={opt.value} value={opt.value}>
                    {opt.label}
                  </Checkbox>
                ))}
              </div>
            </Checkbox.Group>
          </Form.Item>

          {injuries.includes("Dập/rách nhu mô thận") && (
            <Form.Item label="Độ sâu của vết rách nhu mô (có thể chọn nhiều)">
              <Checkbox.Group
                value={lacerationGrades}
                onChange={setLacerationGrades}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  {LACERATION_SUBOPTIONS.map((opt) => (
                    <Checkbox key={opt.value} value={opt.value}>
                      {opt.label}
                    </Checkbox>
                  ))}
                </div>
              </Checkbox.Group>
            </Form.Item>
          )}

          {injuries.includes("Tổn thương mạch máu") && (
            <Form.Item label="Loại tổn thương mạch máu (có thể chọn nhiều)">
              <Checkbox.Group
                value={vascularGrades}
                onChange={setVascularGrades}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  {VASCULAR_SUBOPTIONS.map((opt) => (
                    <Checkbox key={opt.value} value={opt.value}>
                      {opt.label}
                    </Checkbox>
                  ))}
                </div>
              </Checkbox.Group>
            </Form.Item>
          )}

          <Divider />
          <Row gutter={16}>
            <Col span={8}>
              <Text strong>Độ tổn thương: </Text>
              <Text type="danger">{maxGrade}</Text>
            </Col>
          </Row>

          <Divider />
          <div className={styles.buttonRow}>
            <Button icon={<ReloadOutlined />} onClick={onReset}>
              Làm lại
            </Button>
            <Button onClick={onCalculate}>Kết quả</Button>
            <Button icon={<CopyOutlined />} type="primary" onClick={onCopy}>
              Copy kết quả
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default AASTKidneyForm;
