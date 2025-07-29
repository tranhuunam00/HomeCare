import React, { useEffect, useState } from "react";
import {
  Form,
  InputNumber,
  Select,
  Radio,
  Button,
  Typography,
  message,
  Col,
  Row,
  Tooltip,
  DatePicker,
  Input,
  Checkbox,
} from "antd";
import styles from "./LungRADSForm.module.scss";
import { toast } from "react-toastify";
import dayjs from "dayjs";

const { Title } = Typography;
const { Option } = Select;

const COMPARE_OPTIONS = [
  {
    label: "Không có thông tin kết quả cũ",
    value: "no-info",
  },
  {
    label: "Kết quả cũ không thấy tổn thương",
    value: "no-lesion",
  },
  {
    label: "Kết quả cũ có thấy tổn thương",
    value: "has-lesion",
  },
];

export const BENIGN_OPTIONS = [
  { label: "Nốt có vôi hóa (calcification)", value: "calc" },
  { label: "Nốt chứa mỡ (fat)", value: "fat" },
  { label: "Nốt cạnh màng phổi (juxtapleural).", value: "mp" },
  { label: "Không có đặc điểm lành tính nào (none)", value: "none" },
];

const LOCATION_OPTIONS = [
  { label: "Thùy trên phổi phải", value: "RUL" },
  { label: "Thùy giữa phổi phải", value: "RML" },
  { label: "Thùy dưới phổi phải", value: "RLL" },
  { label: "Thùy trên phổi trái", value: "LUL" },
  { label: "Thùy dưới phổi trái", value: "LLL" },
  { label: "Thùy lưỡi phổi trái", value: "lingula" },
];

const STRUCTURE_OPTIONS = [
  { label: "Nốt đặc (solid)", value: "solid" },
  { label: "Nốt bán đặc (part-solid)", value: "part-solid" },
  { label: "Nốt kính mờ (non-solid)", value: "non-solid" },
];

const RISK_SIGNS_OPTIONS = [
  { label: "Bờ tua gai", value: "spiculated" },
  { label: "Hạch to trung thất", value: "lymph" },
  { label: "Tiền sử ung thư", value: "cancerHistory" },
];

const LungRADSForm = () => {
  const [form] = Form.useForm();
  const [structure, setStructure] = useState();
  const [result, setResult] = useState(null);
  const [compareMonths, setCompareMonths] = useState("");
  const oldDate = Form.useWatch("old_result_date", form);
  const currentDate = Form.useWatch("current_result_date", form);

  const compare = Form.useWatch("compare", form);

  const getProgressionOptions = () => {
    if (compare === "has-lesion") {
      return [
        { label: "Không thay đổi kích thước (Stable).", value: "stable" },
        { label: "Tăng kích thước ≤ 1.5mm/12 tháng (Slow).", value: "slow" },
        {
          label: "Tăng kích thước >1.5mm/12 tháng (Growing).",
          value: "growing",
        },
      ];
    }

    if (compare === "no-lesion") {
      return [{ label: "Mới phát hiện (New).", value: "new" }];
    }

    if (compare === "no-info") {
      return [{ label: "Mới phát hiện (Baseline).", value: "baseline" }];
    }

    return [];
  };

  useEffect(() => {
    if (compare === "no-info") {
      form.setFieldValue("progression", "baseline");
    } else if (compare === "no-lesion") {
      form.setFieldValue("progression", "new");
    } else if (compare === "has-lesion") {
      form.setFieldValue("progression", undefined); // bắt người dùng chọn
    }
  }, [compare]);

  useEffect(() => {
    if (oldDate && currentDate) {
      const diffMonths = currentDate.diff(oldDate, "months", true).toFixed(1);
      setCompareMonths(diffMonths);
    } else {
      setCompareMonths("");
    }
  }, [oldDate, currentDate]);

  const D1 = Form.useWatch("D1", form);
  const D2 = Form.useWatch("D2", form);
  const D3 = Form.useWatch("D3", form);

  const calcD4 = (d1, d2, d3) =>
    d1 && d2 && d3 ? ((d1 + d2 + d3) * 0.33).toFixed(2) : "";
  const calcVolume = (d1, d2, d3) =>
    d1 && d2 && d3 ? (d1 * d2 * d3 * 0.52).toFixed(2) : "";

  const onStructureChange = (value) => {
    setStructure(value);
    form.resetFields(["D1", "D2", "D3", "D4", "D5"]);
  };

  const getLungRADS = (values) => {
    const {
      structure,
      D1,
      D2,
      D3,
      D4,
      D5,
      benign,
      riskSigns = [],
      progression,
    } = values;
    const d4 = D4 || (D1 && D2 && D3 ? (D1 + D2 + D3) * 0.33 : 0);
    const hasRisk = riskSigns.length > 0;

    let group = "Không xác định";

    if (structure === "solid") {
      if (benign === "calc" || benign === "fat") {
        group = "1";
      } else if (benign === "mp" && d4 < 10) {
        group = "2";
      } else if (
        (progression === "baseline" && d4 >= 6 && d4 <= 8) ||
        (progression === "new" && d4 >= 4 && d4 <= 6) ||
        (benign === "mp" && d4 >= 10)
      ) {
        group = "3";
      } else if (
        (progression === "baseline" && d4 >= 8 && d4 <= 15) ||
        (progression === "new" && d4 >= 6 && d4 <= 8) ||
        (progression === "growing" && d4 < 8)
      ) {
        group = "4A";
      } else if (
        (progression === "baseline" && d4 >= 15) ||
        (progression === "new" && d4 >= 8) ||
        (progression === "growing" && d4 >= 8)
      ) {
        group = "4B";
      }
    }

    if (structure === "part-solid") {
      if (progression === "baseline" && d4 < 6) group = "2";
      else if (
        (progression === "baseline" && d4 >= 6 && D5 < 6) ||
        (progression === "new" && d4 < 6)
      )
        group = "3";
      else if (
        (progression === "baseline" && d4 >= 6 && D5 >= 6 && D5 <= 8) ||
        (progression === "new" && D5 < 4) ||
        (progression === "growing" && D5 < 4)
      )
        group = "4A";
      else if (
        (progression === "baseline" && D5 >= 8) ||
        (progression === "new" && D5 >= 5) ||
        (progression === "growing" && D5 >= 5)
      )
        group = "4B";
    }

    if (structure === "non-solid") {
      if (
        (progression === "baseline" && d4 < 30) ||
        (progression === "new" && d4 < 30) ||
        (progression === "growing" && d4 < 30)
      )
        group = "2";
      else if (
        (progression === "stable" && d4 >= 30) ||
        (progression === "slow" && d4 >= 30)
      )
        group = "2";
      else if (
        (progression === "baseline" && d4 >= 30) ||
        (progression === "new" && d4 >= 30)
      )
        group = "3";
    }

    if ((group === "3" || group.startsWith("4")) && hasRisk) {
      group = "4X";
    }

    return group;
  };

  const getRecommendation = (group) => {
    switch (group) {
      case "1":
      case "2":
        return "Kiểm tra định kỳ bằng chụp cắt lớp vi tính phổi liều thấp (LDCT) sau 12 tháng";
      case "3":
        return "Kiểm tra định kỳ bằng chụp cắt lớp vi tính phổi liều thấp (LDCT) sau 6 tháng";
      case "4A":
        return "Khám Bác sĩ chuyên khoa (hô hấp, ung bướu) và chụp cắt lớp vi tính phổi có tiêm thuốc cản quang sau 3 tháng.";
      case "4B":
      case "4X":
        return "Khám Bác sĩ chuyên khoa (hô hấp, ung bướu) và Chụp PET-CT hoặc sinh thiết phổi.";
      default:
        return "Không rõ khuyến nghị.";
    }
  };

  const onFinish = (values) => {
    const group = getLungRADS(values);
    const recommendation = getRecommendation(group);
    setResult({ group, recommendation });
  };

  const onReset = () => {
    form.resetFields();
    setResult(null);
  };

  const getLabelFromOptions = (options, value) => {
    const found = options.find((item) => item.value === value);
    return found ? found.label : value || "";
  };

  const onCopy = async () => {
    try {
      const values = await form.validateFields();
      const group = getLungRADS(values);
      const recommendation = getRecommendation(group);

      const {
        location,
        structure,
        progression,
        D1,
        D2,
        D3,
        D4,
        D5,
        benign,
        riskSigns = [],
      } = values;

      const calcD4 =
        D4 || (D1 && D2 && D3 ? ((D1 + D2 + D3) * 0.33).toFixed(2) : "");
      const volume = D1 && D2 && D3 ? (D1 * D2 * D3 * 0.52).toFixed(2) : "";

      const html = `
    <style>
      table {
        width: 100%;
        border-collapse: collapse;
        font-family: Arial, sans-serif;
        margin-top: 12px;
      }
      th, td {
        border: 1px solid #ccc;
        padding: 8px 12px;
        font-size: 16px;
        text-align: left;
      }
      th {
        background-color: #f0f0f0;
        font-weight: bold;
      }
      caption {
        font-size: 18px;
        font-weight: bold;
        margin-bottom: 10px;
        text-align: left;
      }
    </style>
    <table>
      <caption>Đánh giá D-LungRADS</caption>
      <tr><th>Thông tin</th><th>Giá trị</th></tr>
      <tr><td>Đối chiếu kết quả cũ</td><td>${getLabelFromOptions(
        COMPARE_OPTIONS,
        compare
      )}</td></tr>
     ${
       compare !== "no-info"
         ? `<tr>
           <td>Ngày chụp kết quả hiện tại</td>
           <td>
             ${
               form.getFieldValue("old_result_date")
                 ? dayjs(form.getFieldValue("old_result_date")).format(
                     "DD-MM-YYYY"
                   )
                 : "--"
             }
           </td>
         </tr>`
         : ""
     }
      ${
        compare !== "no-info"
          ? `<tr>
            <td>Ngày chụp kết quả hiện tại</td>
            <td>
              ${
                form.getFieldValue("current_result_date")
                  ? dayjs(form.getFieldValue("current_result_date")).format(
                      "DD-MM-YYYY"
                    )
                  : "--"
              }
            </td>
          </tr>`
          : ""
      }
     ${
       compare !== "no-info"
         ? `<tr>
           <td>Thời gian đối chiếu</td>
           <td>${compareMonths} tháng</td>
         </tr>`
         : ""
     }
      <tr><td>Vị trí tổn thương</td><td>${getLabelFromOptions(
        LOCATION_OPTIONS,
        location
      )}</td></tr>
      <tr><td>Cấu trúc tổn thương</td><td>${getLabelFromOptions(
        STRUCTURE_OPTIONS,
        structure
      )}</td></tr>
     <tr>
          <td>Kích thước</td>
          <td>
            <table style="width: 100%; border-collapse: collapse; border: none;">
              <tr>
                <td style="text-align: center; border: none; padding: 0; border-right: 1px solid #ccc;">${
                  D1 || ""
                } mm</td>
                <td style="text-align: center; border: none; padding: 0; border-right: 1px solid #ccc;">${
                  D2 || ""
                } mm</td>
                <td style="text-align: center; border: none; padding: 0;">${
                  D3 || ""
                } mm</td>
              </tr>
            </table>
          </td>
        </tr>
      <tr><td>Kích thước trung bình</td><td style="text-align: center;">${calcD4} mm</td></tr>
      ${
        structure == "part-solid"
          ? `<tr>
            <td>Thể tích phần đặc</td>
            <td style="text-align: center;">${D5 || "--"} mm</td>
          </tr>`
          : "hehe"
      }

      <tr><td>Thể tích tổn thương</td><td style="text-align: center;">${volume} mm³</td></tr>
      ${
        structure === "solid"
          ? `<tr><td>Dấu hiệu lành tính</td><td>${getLabelFromOptions(
              BENIGN_OPTIONS,
              benign
            )}</td></tr>
             <tr><td>Dấu hiệu nguy cơ</td><td>${
               riskSigns
                 .map((r) => getLabelFromOptions(RISK_SIGNS_OPTIONS, r))
                 .join(", ") || "Không"
             }</td></tr>`
          : ""
      }
       <tr><td>Theo dõi tiến triển</td><td>${getLabelFromOptions(
         [
           {
             label: "Mới phát hiện (Baseline).",
             value: "baseline",
           },
           {
             label: "Mới phát hiện (New).",
             value: "new",
           },
           {
             label: "Không thay đổi kích thước (Stable).",
             value: "stable",
           },
           {
             label: "Tăng kích thước ≤ 1.5mm/12 tháng (Slow).",
             value: "slow",
           },
           {
             label: "Tăng kích thước >1.5mm/12 tháng (Growing).",
             value: "growing",
           },
         ],
         progression
       )}</td></tr>
      <tr><td><strong>Phân loại ACR -LungRADS</strong></td><td><strong>Nhóm ${group}</strong></td></tr>
      <tr><td>Khuyến nghị</td><td>${recommendation}</td></tr>
    </table>`;

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

      toast.success("Đã sao chép kết quả đánh giá vào clipboard!");
    } catch (error) {
      console.error(error);
      toast.error("Vui lòng điền đầy đủ thông tin hợp lệ trước khi sao chép.");
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.formContainer}>
        <Title level={3}>Đánh giá D-LungRADS</Title>
        <h4>Lĩnh vực: cắt lớp vi tính</h4>
        <h4 style={{ marginBottom: 40 }}>
          Mục đích: sàng lọc chẩn đoán sớm ung thư phổ
        </h4>

        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="compare"
            label="Đối chiếu kết quả cũ"
            rules={[{ required: true }]}
          >
            <Select
              placeholder="Chọn tình trạng đối chiếu"
              options={COMPARE_OPTIONS}
            />
          </Form.Item>

          {compare !== "no-info" && (
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item label="Ngày chụp kết quả cũ" name="old_result_date">
                  <DatePicker
                    style={{ width: "100%" }}
                    placeholder="Ngày chụp lần đầu tiên"
                  />
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item
                  label="Ngày chụp kết quả hiện tại"
                  name="current_result_date"
                >
                  <DatePicker
                    style={{ width: "100%" }}
                    placeholder="Ngày chụp lần hiện tại"
                  />
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item label="Thời gian đối chiếu (số tháng)">
                  <Input value={compareMonths} disabled suffix="tháng" />
                </Form.Item>
              </Col>
            </Row>
          )}

          <Form.Item
            name="location"
            label="Vị trí tổn thương"
            rules={[{ required: true }]}
          >
            <Select placeholder="Chọn vị trí" options={LOCATION_OPTIONS} />
          </Form.Item>

          <Form.Item
            name="structure"
            label="Cấu trúc tổn thương"
            rules={[{ required: true }]}
          >
            <Select
              placeholder="Chọn loại"
              onChange={onStructureChange}
              options={STRUCTURE_OPTIONS}
            />
          </Form.Item>

          <Form.Item
            name="progression"
            label="Theo dõi tiến triển"
            rules={[{ required: true }]}
          >
            <Select
              placeholder="Chọn loại"
              disabled={compare !== "has-lesion"}
              options={getProgressionOptions()}
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="D1"
                label={
                  <Tooltip title=" Chiều dài">
                    <span>D1 (mm)</span>
                  </Tooltip>
                }
                rules={[{ required: true }]}
              >
                <InputNumber
                  placeholder="Nhập kích thước"
                  min={0}
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item
                name="D2"
                label={
                  <Tooltip title="Chiều rộng">
                    <span>D2 (mm)</span>
                  </Tooltip>
                }
                rules={[{ required: true }]}
              >
                <InputNumber
                  placeholder="Nhập kích thước"
                  min={0}
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item
                name="D3"
                label={
                  <Tooltip title="Chiều cao">
                    <span>D3 (mm)</span>
                  </Tooltip>
                }
                rules={[{ required: true }]}
              >
                <InputNumber
                  placeholder="Nhập kích thước"
                  min={0}
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="D4 (mm) – Trung bình">
                <InputNumber
                  value={parseFloat(calcD4(D1, D2, D3))}
                  readOnly
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="V (mm³) – Thể tích tổn thương">
                <InputNumber
                  value={parseFloat(calcVolume(D1, D2, D3))}
                  readOnly
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
          </Row>
          {structure === "solid" && (
            <>
              <Form.Item
                name="benign"
                label="Dấu hiệu lành tính"
                rules={[{ required: true, message: "Bắt buộc chọn một mục" }]}
              >
                <Radio.Group>
                  <Row gutter={[12, 12]}>
                    {BENIGN_OPTIONS.map((option) => (
                      <Col key={option.value} span={12}>
                        <Radio value={option.value}>{option.label}</Radio>
                      </Col>
                    ))}
                  </Row>
                </Radio.Group>
              </Form.Item>

              <Form.Item
                name="riskSigns"
                label="Dấu hiệu nguy cơ"
                rules={[
                  {
                    required: false,
                    message: "Chọn ít nhất một dấu hiệu nguy cơ",
                  },
                ]}
              >
                <Checkbox.Group>
                  <Row gutter={[12, 12]}>
                    {RISK_SIGNS_OPTIONS.map((option) => (
                      <Col key={option.value} span={16}>
                        <Checkbox value={option.value}>{option.label}</Checkbox>
                      </Col>
                    ))}
                  </Row>
                </Checkbox.Group>
              </Form.Item>
            </>
          )}

          {structure === "part-solid" && (
            <>
              <Form.Item
                name="D5"
                label="D5 (mm) – Kích thước phần đặc"
                rules={[{ required: true }]}
              >
                <InputNumber min={0} />
              </Form.Item>
            </>
          )}

          <Form.Item style={{ textAlign: "right" }}>
            <Button type="primary" htmlType="submit" style={{ marginRight: 8 }}>
              Tính điểm
            </Button>
            <Button onClick={onReset} style={{ marginRight: 8 }}>
              Reset
            </Button>
            <Button type="dashed" onClick={onCopy}>
              Copy kết quả
            </Button>
          </Form.Item>

          {result && (
            <div className={styles.resultBox}>
              <Title level={4}>Kết quả đánh giá:</Title>
              <p>
                <strong>D-LungRADS:</strong> Nhóm {result.group}
              </p>
              <p>
                <strong>Khuyến nghị:</strong> {result.recommendation}
              </p>
            </div>
          )}
        </Form>
      </div>
    </div>
  );
};

export default LungRADSForm;
