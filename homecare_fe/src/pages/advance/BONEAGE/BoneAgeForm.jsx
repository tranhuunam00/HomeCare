import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  DatePicker,
  Select,
  Checkbox,
  InputNumber,
  Row,
  Col,
  Tooltip,
  Button,
  message,
} from "antd";
import { CopyOutlined, RedoOutlined } from "@ant-design/icons";

const { Option } = Select;

import styles from "./BoneAgeForm.module.scss";
import { toast } from "react-toastify";

const COT_HOA_STAGES = [
  {
    label: "1 – Xương quay, trụ; xương bàn tay, đốt ngón",
    value: 1,
    range: [0, 0.25],
  },
  { label: "2 – Xương nguyệt bắt đầu xuất hiện", value: 2, range: [0.25, 0.5] },
  { label: "3 – Xương tháp xuất hiện", value: 3, range: [0.5, 0.75] },
  { label: "4 – Xương cả, xương móc xuất hiện", value: 4, range: [0.75, 1] },
  { label: "5 – Xương đậu bắt đầu xuất hiện", value: 5, range: [1, 1.5] },
  { label: "6 – Xương thang lớn xuất hiện", value: 6, range: [1.5, 2] },
  { label: "7 – Xương thang bé xuất hiện", value: 7, range: [2, 2.5] },
  { label: "8 – Hầu hết xương cổ tay có mặt", value: 8, range: [2.5, 3] },
  { label: "9 – Xương thuyền bắt đầu xuất hiện", value: 9, range: [4, 5] },
  { label: "10 – Xương thuyền rõ nét", value: 10, range: [6, 7] },
  { label: "11 – Đầu dưới xương quay phát triển rõ", value: 11, range: [8, 9] },
  { label: "12 – Sụn tiếp hợp mờ dần", value: 12, range: [10, 11] },
  {
    label: "13 – Đầu xương bắt đầu dính với thân xương",
    value: 13,
    range: [12, 13],
  },
  { label: "14 – Hầu hết sụn tiếp hợp đóng (nữ)", value: 14, range: [14, 15] },
  {
    label: "15 – Xương hoàn thiện (nữ), dính hoàn toàn (nam)",
    value: 15,
    range: [16, 17],
  },
  { label: "16 – Trưởng thành hoàn toàn", value: 16, range: [">18"] },
];

const BoneAgeForm = () => {
  const [form] = Form.useForm();
  const ossificationSelected = Form.useWatch("ossificationPoints", form);
  const [boneAgeRange, setBoneAgeRange] = useState(null);
  const [physiologicalAge, setPhysiologicalAge] = useState(null);

  useEffect(() => {
    if (!ossificationSelected?.length) {
      setBoneAgeRange(null);
      form.setFieldValue("boneAge", "");
      return;
    }
    const maxStage = Math.max(...ossificationSelected);
    const maxRange = COT_HOA_STAGES.find((s) => s.value === maxStage)?.range;

    if (maxRange) {
      setBoneAgeRange(maxRange);
      const ageText =
        Array.isArray(maxRange) && typeof maxRange[1] === "number"
          ? `<strong>${maxRange[0]} – ${maxRange[1]} năm</strong>`
          : `<strong>${maxRange[0]} năm</strong>`;
      form.setFieldValue("boneAge", ageText);
    }
  }, [ossificationSelected]);

  const birthYear = Form.useWatch("birthYear", form);

  useEffect(() => {
    if (birthYear) {
      const currentYear = new Date().getFullYear();
      const calculatedAge = +(currentYear - birthYear.year()).toFixed(1);
      setPhysiologicalAge(calculatedAge);
      form.setFieldValue("physiologicalAge", calculatedAge);
    }
  }, [birthYear]);

  const onCopy = async () => {
    try {
      const values = await form.validateFields();
      const {
        position,
        way,
        method,
        birthYear,
        physiologicalAge,
        gender,
        ossificationPoints,
        boneAge,
        conclusion,
      } = values;

      const selectedStages = `
      <ul style="padding-left: 16px; margin: 0;">
        ${COT_HOA_STAGES.filter((s) => ossificationPoints?.includes(s.value))
          .map((s) => `<li>${s.label}</li>`)
          .join("")}
      </ul>
    `;

      const html = `
      <style>
        table {
          width: 100%;
          table-layout: fixed;
          border-collapse: collapse;
          font-family: Arial, sans-serif;
          margin-top: 12px;
        }
        th, td {
          border: 1px solid #ccc;
          padding: 8px 12px;
          font-size: 15px;
          text-align: left;
          vertical-align: top;
          word-wrap: break-word;
          white-space: pre-wrap;
        }
        th {
          background-color: #f0f0f0;
          font-weight: bold;
        }
        caption {
          font-size: 17px;
          font-weight: bold;
          margin-bottom: 10px;
          text-align: left;
        }
        th:first-child, td:first-child {
          width: 45%;
        }
        th:last-child, td:last-child {
          width: 55%;
        }
      </style>
      <table>
        <caption>Đánh giá tuổi xương – Bone Age</caption>
        <tr><th>Thông tin</th><th>Giá trị</th></tr>
        <tr><td>Vị trí đánh giá</td><td>${position}</td></tr>
        <tr><td>Phương tiện</td><td>${way}</td></tr>
        <tr><td>Phương pháp</td><td>${method}</td></tr>
        <tr><td>Năm sinh</td><td>${birthYear?.year?.()}</td></tr>
        <tr><td>Tuổi sinh lý (năm)</td><td>${physiologicalAge}</td></tr>
        <tr><td>Giới tính</td><td>${gender === "male" ? "Nam" : "Nữ"}</td></tr>
        <tr><td>Điểm cốt hóa mới xuất hiện</td><td>${selectedStages}</td></tr>
        <tr>
          <td>Kết quả</td>
          <td>
            <div style="max-width: 100%; word-wrap: break-word; white-space: pre-wrap;">
              ${boneAge?.replace(/<[^>]*>/g, "")}
            </div>
          </td>
        </tr>
        <tr>
          <td>Kết luận</td>
          <td>
            <div style="max-width: 100%; word-wrap: break-word; white-space: pre-wrap;">
              ${conclusion}
            </div>
          </td>
        </tr>
      </table>
    `;

      if (navigator.clipboard?.write) {
        await navigator.clipboard.write([
          new ClipboardItem({
            "text/html": new Blob([html], { type: "text/html" }),
          }),
        ]);
      } else {
        const listener = (e) => {
          e.clipboardData.setData("text/html", html);
          e.preventDefault();
        };
        document.addEventListener("copy", listener);
        document.execCommand("copy");
        document.removeEventListener("copy", listener);
      }

      toast.success("Đã sao chép kết quả đánh giá tuổi xương!");
    } catch (error) {
      console.error(error);
      toast.error("Vui lòng nhập đầy đủ thông tin hợp lệ trước khi sao chép.");
    }
  };

  const handleReset = () => {
    form.resetFields();
    setBoneAgeRange(null);
    setPhysiologicalAge(null);
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.formContainer}>
        <Form layout="vertical" form={form}>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label={<span>Vị trí đánh giá</span>}
                name="position"
                initialValue="Bàn tay trái"
              >
                <Input disabled />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label={
                  <Tooltip title="Phương pháp đánh giá tuổi xương theo tiêu chuẩn">
                    <span>Phương tiện đánh giá</span>
                  </Tooltip>
                }
                name="way"
                initialValue="Chụp X quang"
              >
                <Input disabled />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label={
                  <Tooltip title="Phương pháp đánh giá tuổi xương theo tiêu chuẩn">
                    <span>Phương pháp đánh giá</span>
                  </Tooltip>
                }
                name="method"
                initialValue="Greulich & Pyle"
              >
                <Input disabled />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="Năm sinh"
                name="birthYear"
                rules={[{ required: true }]}
              >
                <DatePicker picker="year" style={{ width: "100%" }} />
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item
                label={
                  <Tooltip title="Tuổi tính theo ngày chụp – năm sinh">
                    <span>Tuổi sinh lý (năm)</span>
                  </Tooltip>
                }
                name="physiologicalAge"
                rules={[{ required: true }]}
              >
                <InputNumber
                  value={physiologicalAge}
                  onChange={(val) => {
                    setPhysiologicalAge(val);
                    form.setFieldValue("physiologicalAge", val);
                  }}
                  min={0}
                  max={25}
                  step={0.1}
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="Giới tính"
                name="gender"
                rules={[{ required: true }]}
              >
                <Select placeholder="Chọn giới tính">
                  <Option value="male">Nam</Option>
                  <Option value="female">Nữ</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label={
              <Tooltip title="Các mốc xuất hiện xương trên phim X-quang bàn tay trái">
                <span>Các điểm cốt hóa mới xuất hiện</span>
              </Tooltip>
            }
            name="ossificationPoints"
          >
            <Checkbox.Group options={COT_HOA_STAGES} />
          </Form.Item>

          <Form.Item
            label="Hình ảnh chụp X-quang bàn tay trái đánh giá tuổi xương theo phương pháp Greulich & Pyle cho thấy tuổi xương tương đương..."
            name="boneAge"
          >
            <div
              dangerouslySetInnerHTML={{
                __html: boneAgeRange
                  ? Array.isArray(boneAgeRange) &&
                    typeof boneAgeRange[1] === "number"
                    ? `<strong>${boneAgeRange[0]} – ${boneAgeRange[1]} năm</strong>`
                    : `<strong>${boneAgeRange[0]} năm</strong>`
                  : "",
              }}
            />
          </Form.Item>

          <Row gutter={12} justify="end">
            <Col>
              <Button icon={<RedoOutlined />} onClick={handleReset}>
                Đặt lại
              </Button>
            </Col>
            <Col>
              <Button type="primary" icon={<CopyOutlined />} onClick={onCopy}>
                Sao chép
              </Button>
            </Col>
          </Row>
        </Form>
      </div>
    </div>
  );
};

export default BoneAgeForm;
