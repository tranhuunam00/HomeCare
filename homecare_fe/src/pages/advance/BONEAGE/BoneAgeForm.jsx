import React, { useEffect, useMemo, useState } from "react";
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

export const COT_HOA_STAGES = [
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
  {
    label: "14 – Hầu hết sụn tiếp hợp đóng (nữ)",
    value: 14,
    gender: "female",
    range: [14, 15],
  },
  {
    label: "15 – Dính đầu xương – thân xương hoàn toàn (nữ)",
    value: 15,
    gender: "female",
    range: [16, 17],
  },
  {
    label: "16 – Hầu hết sụn tiếp hợp đóng (nam)",
    value: 16,
    gender: "male",
    range: [15, 16],
  },
  {
    label: "17 – Dính đầu xương – thân xương hoàn toàn (nam)",
    value: 17,
    gender: "male",
    range: [17, 18],
  },
  { label: "18 – Trưởng thành hoàn toàn", value: 18, range: [18] },
];

const BoneAgeForm = () => {
  const [form] = Form.useForm();
  const ossificationSelected = Form.useWatch("ossificationPoints", form);
  const [boneAgeRange, setBoneAgeRange] = useState(null);
  const [physiologicalAge, setPhysiologicalAge] = useState(null);

  const gender = Form.useWatch("gender", form);

  const visibleStages = useMemo(() => {
    return COT_HOA_STAGES.filter((item) => {
      if (item.gender && item.gender !== gender) return false;
      return true;
    });
  }, [gender]);

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

  const genHtml = async ({ isCopy }) => {
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
    } = values;

    const selectedStageRows = visibleStages
      .map((stage) => {
        const isSelected = ossificationPoints?.includes(stage.value);
        const rangeDisplay = Array.isArray(stage.range)
          ? stage.range.join(" – ")
          : stage.range;
        return `
        <tr>
          <td>${stage.label}</td>
          <td>${rangeDisplay}</td>
          <td style="text-align: center;">${isSelected ? "✔️" : ""}</td>
        </tr>
      `;
      })
      .join("");

    const html = `
      

      <!-- Table 1: Thông tin hành chính -->
      <table>
        <caption>Thông tin kỹ thuật và hành chính</caption>
        <tr><th>Vị trí đánh giá</th><td>${position}</td></tr>
        <tr><th>Phương tiện</th><td>${way}</td></tr>
        <tr><th>Phương pháp</th><td>${method}</td></tr>
        <tr><th>Năm sinh</th><td>${birthYear?.year?.()}</td></tr>
        <tr><th>Tuổi sinh lý</th><td>${physiologicalAge} năm</td></tr>
        <tr><th>Giới tính</th><td>${gender === "male" ? "Nam" : "Nữ"}</td></tr>
      </table>

      <!-- Table 2: Các điểm cốt hóa -->
      <table>
        <caption>Đánh giá các điểm cốt hóa</caption>
        <tr>
          <th>Các điểm cốt hóa mới xuất hiện</th>
          <th>Tuổi xương (Năm)</th>
          <th class="center">Tick</th>
        </tr>
        ${selectedStageRows}
      </table>

      <!-- Table 3: Kết quả -->
      <div style="margin-top: 20px;">
        <h3 style="margin-bottom: 8px;">Kết luận</h3>
        <div style="text-align: center; font-size: 15px; line-height: 1.6;">
          Hình ảnh chụp X quang bàn tay trái đánh giá tuổi xương theo phương pháp Greulich & Pyle cho thấy tuổi xương tương đương
          <div style="font-size: 28px; font-weight: bold; margin: 8px 0;">${physiologicalAge}</div>
          <div style="font-size: 15px;">Năm</div>
        </div>
      </div>
    `;

    return html;
  };
  const onCopy = async () => {
    try {
      const html = `
      <style>
        table {
          width: 100%;
          border-collapse: collapse;
          font-family: Arial, sans-serif;
          margin-top: 16px;
        }
        th, td {
          border: 1px solid #ccc;
          padding: 8px 12px;
          font-size: 15px;
          text-align: left;
          vertical-align: top;
        }
        th {
          background-color: #f0f0f0;
          font-weight: bold;
        }
        caption {
          font-size: 18px;
          font-weight: bold;
          margin: 12px 0 8px;
          text-align: left;
        }
        .multiline {
          white-space: pre-wrap;
          word-break: break-word;
        }
        .center {
          text-align: center;
        }
      </style>

      ${await genHtml({ isCopy: true })}
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
        <h2 style={{ marginBottom: 24 }}>D-BONEAGE</h2>
        <h4>Lĩnh vực: X quang</h4>
        <h4>Mục đích: chẩn đoán tuổi xương</h4>
        <div style={{ marginBottom: 50 }}></div>
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
            <Checkbox.Group disabled={!gender}>
              <Row gutter={[12, 12]}>
                {visibleStages.map((opt) => (
                  <Col key={opt.value} span={12}>
                    <Checkbox value={opt.value}>{opt.label}</Checkbox>
                  </Col>
                ))}
              </Row>
            </Checkbox.Group>
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
