import React, { useState } from "react";
import {
  Form,
  InputNumber,
  Select,
  Radio,
  Button,
  Typography,
  message,
} from "antd";
import styles from "./LungRADSForm.module.scss";
import { toast } from "react-toastify";

const { Title } = Typography;
const { Option } = Select;

const COMPARE_OPTIONS = [
  {
    label:
      "Chưa từng chụp hoặc đã từng chụp nhưng không có thông tin đối chiếu.",
    value: "none",
  },
  {
    label: "Đã chụp trước đó nhưng không thấy tổn thương.",
    value: "no-lesion",
  },
];

export const BENIGN_OPTIONS = [
  { label: "Nốt có vôi hóa", value: "calc" },
  { label: "Nốt chứa mỡ", value: "fat" },
  { label: "Nốt cạnh màng phổi", value: "mp" },
  { label: "Không có đặc điểm lành tính", value: "none" },
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

  const D1 = Form.useWatch("D1", form);
  const D2 = Form.useWatch("D2", form);
  const D3 = Form.useWatch("D3", form);

  const calcD4 = (d1, d2, d3) =>
    d1 && d2 && d3 ? ((d1 + d2 + d3) * 0.33).toFixed(2) : "";
  const calcVolume = (d1, d2, d3) =>
    d1 && d2 && d3 ? (d1 * d2 * d3 * 0.52).toFixed(2) : "";

  const onStructureChange = (value) => {
    setStructure(value);
    form.resetFields(["D1", "D2", "D3", "D4", "D5", "progression"]);
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
      <caption>Đánh giá Lung-RADS</caption>
      <tr><th>Thông tin</th><th>Giá trị</th></tr>
      <tr><td>Vị trí tổn thương</td><td>${getLabelFromOptions(
        LOCATION_OPTIONS,
        location
      )}</td></tr>
      <tr><td>Cấu trúc tổn thương</td><td>${getLabelFromOptions(
        STRUCTURE_OPTIONS,
        structure
      )}</td></tr>
      <tr><td>Tiến triển</td><td>${getLabelFromOptions(
        [
          {
            label: "Baseline - Không có kết quả chụp trước đó. Mới phát hiện",
            value: "baseline",
          },
          {
            label:
              "New - Có kết quả chụp trước đó nhưng không thấy. Mới phát hiện.",
            value: "new",
          },
          {
            label:
              "Stable - Có trong kết quả chụp trước đó nhưng không thay đổi kích thước.",
            value: "stable",
          },
          {
            label:
              "Slow - Có trong kết quả chụp trước đó, tăng kích thước ≤ 1.5mm/12 tháng.",
            value: "slow",
          },
          {
            label:
              "Growing - Có trong kết quả chụp trước đó, tăng kích thước >1.5mm/12 tháng.",
            value: "growing",
          },
        ],
        progression
      )}</td></tr>
      <tr><td>D1 (mm)</td><td>${D1 || ""}</td></tr>
      <tr><td>D2 (mm)</td><td>${D2 || ""}</td></tr>
      <tr><td>D3 (mm)</td><td>${D3 || ""}</td></tr>
      <tr><td>D4 trung bình (mm)</td><td>${calcD4}</td></tr>
      <tr><td>Thể tích (mm³)</td><td>${volume}</td></tr>
      ${
        structure === "part-solid"
          ? `<tr><td>D5 phần đặc (mm)</td><td>${D5 || ""}</td></tr>`
          : ""
      }
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
      <tr><td><strong>Lung-RADS</strong></td><td><strong>Nhóm ${group}</strong></td></tr>
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
        <Title level={3}>Đánh giá Lung-RADS</Title>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item label="Mục đích" name="purpose">
            <span>Sàng lọc chẩn đoán sớm ung thư phổi</span>
          </Form.Item>

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
              options={[
                {
                  label:
                    "Baseline - Không có kết quả chụp trước đó. Mới phát hiện",
                  value: "baseline",
                },
                {
                  label:
                    "New - Có kết quả chụp trước đó nhưng không thấy. Mới phát hiện.",
                  value: "new",
                },
                {
                  label:
                    "Stable - Có trong kết quả chụp trước đó nhưng không thay đổi kích thước.",
                  value: "stable",
                },
                {
                  label:
                    "Slow - Có trong kết quả chụp trước đó, tăng kích thước ≤ 1.5mm/12 tháng.",
                  value: "slow",
                },
                {
                  label:
                    "Growing - Có trong kết quả chụp trước đó, tăng kích thước  >1.5mm/12 tháng.",
                  value: "growing",
                },
              ]}
            />
          </Form.Item>

          <Form.Item
            name="D1"
            label="D1 (mm) – Đường kính lớn nhất"
            rules={[{ required: true }]}
          >
            <InputNumber placeholder="Nhập kích thước" min={0} />
          </Form.Item>
          <Form.Item
            name="D2"
            label="D2 (mm) – Đường kính bé nhất"
            rules={[{ required: true }]}
          >
            <InputNumber placeholder="Nhập kích thước" min={0} />
          </Form.Item>
          <Form.Item
            name="D3"
            label="D3 (mm) – Đường kính còn lại"
            rules={[{ required: true }]}
          >
            <InputNumber placeholder="Nhập kích thước" min={0} />
          </Form.Item>

          <Form.Item label="D4 (mm) – Trung bình">
            <InputNumber value={parseFloat(calcD4(D1, D2, D3))} readOnly />
          </Form.Item>
          <Form.Item label="V (mm³) – Thể tích tổn thương">
            <InputNumber value={parseFloat(calcVolume(D1, D2, D3))} readOnly />
          </Form.Item>

          {structure === "solid" && (
            <>
              <Form.Item
                name="benign"
                label="Dấu hiệu lành tính"
                rules={[{ required: true }]}
              >
                <Radio.Group options={BENIGN_OPTIONS} />
              </Form.Item>

              <Form.Item name="riskSigns" label="Dấu hiệu nguy cơ">
                <Select
                  mode="multiple"
                  placeholder="Chọn các dấu hiệu"
                  options={RISK_SIGNS_OPTIONS}
                />
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

          {structure === "non-solid" && (
            <Form.Item
              name="D4"
              label="D4 (mm) – Đường kính trung bình"
              rules={[{ required: true }]}
            >
              <InputNumber min={0} />
            </Form.Item>
          )}

          <Form.Item>
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
                <strong>Lung-RADS:</strong> Nhóm {result.group}
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
