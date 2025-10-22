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
  {
    label: "Góc phần tư trên ngoài - UOQ",
    value: "UOQ",
    printName: "Góc phần tư trên ngoài",
  },
  {
    label: "Góc phần tư dưới ngoài - LOQ",
    value: "LOQ",
    printName: "Góc phần tư dưới ngoài",
  },
  {
    label: "Góc phần tư trên trong - UIQ",
    value: "UIQ",
    printName: "Góc phần tư trên trong",
  },
  {
    label: "Góc phần tư dưới trong – LIQ",
    value: "LIQ",
    printName: "Góc phần tư dưới trong",
  },
  {
    label: "Lan tỏa, không xác định được",
    value: "diffuse",
    printName: "Lan tỏa, không xác định được",
  },
];

export const SHAPE_OPTIONS = [
  {
    label: "Tròn – round (BR2)",
    value: "round",
    score: 2,
    printName: "Tròn",
  },
  {
    label: "Bầu dục – oval (BR2)",
    value: "oval",
    score: 2,
    printName: "Bầu dục",
  },
  {
    label: "Không xác định – irregular (BR4; BR5)",
    value: "irregular",
    score: 5,
    printName: "Không xác định",
  },
];

export const TYPE_OF_LESION_OPTIONS = [
  {
    label: "Nốt, khối, đám",
    value: "mass",
    printName: "Nốt, khối, đám",
  },
  {
    label: "Vôi tính chất lành tính",
    value: "benign-calcification",
    printName: "Vôi tính chất lành tính",
  },
  {
    label: "Vi vôi hóa nghi ngờ",
    value: "microcalcification",
    printName: "Vi vôi hóa nghi ngờ",
  },
  {
    label: "Tổn thương khác",
    value: "other",
    printName: "Tổn thương khác",
  },
];

export const MARGIN_OPTIONS = [
  {
    label: "Bờ rõ nét – circumscribe (BR2; BR3)",
    value: "circumscribe",
    score: 3,
    printName: "Bờ rõ nét",
  },
  {
    label: "Bờ che lấp – obscured (BR3)",
    value: "obscured",
    score: 3,
    printName: "Bờ che lấp",
  },
  {
    label: "Bờ đa cung nhỏ – microlobulated (BR4)",
    value: "microlobulated",
    score: 4,
    printName: "Bờ đa cung nhỏ",
  },
  {
    label: "Bờ tua gai – spiculated (BR4; BR5)",
    value: "spiculated",
    score: 5,
    printName: "Bờ tua gai",
  },
  {
    label: "Không xác định – indistinct (BR4; BR5)",
    value: "indistinct",
    score: 5,
    printName: "Không xác định",
  },
];

export const ECHOGENICITY_OPTIONS = [
  {
    label: "Rất giảm – tương đương mỡ (BR2)",
    value: "very-low",
    score: 2,
    printName: "Rất giảm – tương đương mỡ",
  },
  {
    label: "Giảm đậm độ - low (BR2)",
    value: "low",
    score: 2,
    printName: "Giảm đậm độ",
  },
  {
    label: "Đồng đậm độ - equal (BR3)",
    value: "equal",
    score: 3,
    printName: "Đồng đậm độ",
  },
  {
    label: "Tăng đậm độ - high (BR4; BR5)",
    value: "high",
    score: 5,
    printName: "Tăng đậm độ",
  },
];

export const BENIGN_CALCIFICATION_OPTIONS = [
  {
    label: "Vôi hóa da (BR2)",
    value: "skin",
    score: 2,
    printName: "Vôi hóa da",
  },
  {
    label: "Vôi hóa mạch máu (BR2)",
    value: "vascular",
    score: 2,
    printName: "Vôi hóa mạch máu",
  },
  {
    label: "Vôi hóa hình bỏng ngô (BR2)",
    value: "popcorn",
    score: 2,
    printName: "Vôi hóa hình bỏng ngô",
  },
  {
    label: "Vôi hóa hình vỏ trứng (BR2)",
    value: "egg-shell",
    score: 2,
    printName: "Vôi hóa hình vỏ trứng",
  },
  {
    label: "Vôi hóa hình que lớn (BR2)",
    value: "large-rod",
    score: 2,
    printName: "Vôi hóa hình que lớn",
  },
  {
    label: "Vôi hóa hình tròn (BR2)",
    value: "round",
    score: 2,
    printName: "Vôi hóa hình tròn",
  },
  {
    label: "Vôi hóa dạng sữa calci (BR2)",
    value: "milk",
    score: 2,
    printName: "Vôi hóa dạng sữa calci",
  },
  {
    label: "Vôi hóa mảng do loạn dưỡng (BR2)",
    value: "dystrophic",
    score: 2,
    printName: "Vôi hóa mảng do loạn dưỡng",
  },
  {
    label: "Không thấy",
    value: "none",
    score: 0,
    isOther: true,
    printName: "Không thấy",
  },
];

export const SUSPICIOUS_CALCIFICATION_OPTIONS = [
  {
    label: "Vi vôi hóa không định hình – amorphous (BR3; BR4)",
    value: "amorphous",
    score: 4,
    printName: "Vi vôi hóa không định hình",
  },
  {
    label: "Vi vôi hóa thô – coarse (BR3)",
    value: "coarse",
    score: 3,
    printName: "Vi vôi hóa thô",
  },
  {
    label: "Vi vôi hóa đa hình nhỏ – fine pleomorphic (BR4; BR5)",
    value: "pleomorphic",
    score: 5,
    printName: "Vi vôi hóa đa hình nhỏ",
  },
  {
    label:
      "Vi vôi hóa dải mảnh, dải chia nhánh – fine linear, branching (BR4; BR5)",
    value: "branching",
    score: 5,
    printName: "Vi vôi hóa dải mảnh, dải chia nhánh",
  },
  {
    label: "Không thấy",
    value: "none",
    score: 0,
    isOther: true,
    printName: "Không thấy",
  },
];

export const CALC_DISTRIBUTION_OPTIONS = [
  {
    label: "Dạng lan tỏa – diffuse (BR3)",
    value: "diffuse",
    score: 3,
    printName: "Dạng lan tỏa",
  },
  {
    label: "Dạng vùng – regional (BR4)",
    value: "regional",
    score: 4,
    printName: "Dạng vùng",
  },
  {
    label: "Dạng cụm – group (BR4)",
    value: "group",
    score: 4,
    printName: "Dạng cụm",
  },
  {
    label: "Dạng dải – linear (BR3)",
    value: "linear",
    score: 3,
    printName: "Dạng dải",
  },
  {
    label: "Dạng thùy – segmental (BR3)",
    value: "segmental",
    score: 3,
    printName: "Dạng thùy",
  },
];

export const OTHER_SUSPICIOUS_SIGNS = [
  {
    label: "Phù nề, dày bề mặt da (BR4; BR5)",
    value: "edema",
    score: 5,
    printName: "Phù nề, dày bề mặt da",
  },
  {
    label: "Co kéo bề mặt da (BR4; BR5)",
    value: "skin-retraction",
    score: 5,
    printName: "Co kéo bề mặt da",
  },
  {
    label: "Co kéo núm vú (BR4; BR5)",
    value: "nipple-retraction",
    score: 5,
    printName: "Co kéo núm vú",
  },
  {
    label: "Bất đối xứng hai bên (BR3)",
    value: "asymmetry",
    score: 3,
    printName: "Bất đối xứng hai bên",
  },
  {
    label: "Đảo lộn cấu trúc mô tuyến (BR3)",
    value: "disrupted-architecture",
    score: 3,
    printName: "Đảo lộn cấu trúc mô tuyến",
  },
  {
    label: "Hạch bệnh lý hố nách (BR3; BR4)",
    value: "lymph-node",
    score: 4,
    printName: "Hạch bệnh lý hố nách",
  },
  {
    label: "Không thấy",
    value: "none",
    score: 0,
    isOther: true,
    printName: "Không thấy",
  },
];
// src/pages/dbirads/BiradsForm.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Form,
  Input,
  InputNumber,
  Select,
  Checkbox,
  Button,
  Radio,
  Col,
  Row,
  Typography,
} from "antd";
import styles from "./BiradsForm.module.scss";
import { toast } from "react-toastify";
import { genAITextToHtml, STYLE_COPY } from "../../../constant/app";
import AIRecommendationEditor from "../../../components/AIRecommendationEditor";
import { ThamKhaoLinkHomeCare } from "../component_common/Thamkhao";
import API_CALL from "../../../services/axiosClient";

// ⬇️ Giả định các constants đã được export từ cùng file constants hoặc ở trên scope hiện tại
// import {
//   BREAST_SIDE_OPTIONS,
//   DENSITY_OPTIONS,
//   LOCATION_OPTIONS,
//   TYPE_OF_LESION_OPTIONS,
//   SHAPE_OPTIONS,
//   MARGIN_OPTIONS,
//   ECHOGENICITY_OPTIONS,
//   BENIGN_CALCIFICATION_OPTIONS,
//   SUSPICIOUS_CALCIFICATION_OPTIONS,
//   CALC_DISTRIBUTION_OPTIONS,
//   OTHER_SUSPICIOUS_SIGNS,
// } from "./dbiradsConstants";

const { Text } = Typography;

const BiradsForm = () => {
  const [form] = Form.useForm();
  const [volume, setVolume] = useState(0); // D3
  const [typeOfLesion, setTypeOfLesion] = useState([]);
  const [geminiResponse, setGeminiResponse] = useState("");

  // ====== Helpers ======
  const getRecommendationFromBirads = (birads = "") => {
    if (!birads) return "Không rõ";
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

  const getScore = (options, value) =>
    options.find((opt) => opt.value === value)?.score || 0;

  const getMaxScoreFromCheckbox = (options, selectedValues) =>
    Math.max(
      0,
      ...((selectedValues || []).map(
        (v) => options.find((o) => o.value === v)?.score || 0
      ) || [0])
    );

  const getLabelFromValue = (options, value) => {
    if (Array.isArray(value) && value.length > 0) {
      return `
        <ul style="padding-left: 16px; margin: 0;">
          ${value
            .map(
              (v) =>
                `<li style="margin-bottom: 6px;">${
                  options.find((o) => o.value === v)?.printName ||
                  options.find((o) => o.value === v)?.label ||
                  v
                }</li>`
            )
            .join("")}
        </ul>
      `;
    }
    if (typeof value === "string") {
      const label =
        options.find((o) => o.value === value)?.printName ||
        options.find((o) => o.value === value)?.label ||
        value;
      return `${label}`;
    }
    return "";
  };

  // ====== Recalc every change ======
  const recalcAll = (all) => {
    // --- Tính D3 ---
    const v = ((Number(all.D1) || 0) + (Number(all.D2) || 0)) * 0.5;
    setVolume(Number.isNaN(v) ? 0 : Math.round(v * 100) / 100);

    // --- Tính điểm theo max score ---
    const shapeScore = getScore(SHAPE_OPTIONS, all.shape);
    const marginScore = getScore(MARGIN_OPTIONS, all.margin);
    const echoScore = getScore(ECHOGENICITY_OPTIONS, all.echogenicity);
    const suspiciousCalcScore = getScore(
      SUSPICIOUS_CALCIFICATION_OPTIONS,
      all.suspiciousCalc
    );
    const otherSignsScore = getMaxScoreFromCheckbox(
      OTHER_SUSPICIOUS_SIGNS,
      all.suspiciousSigns
    );

    const maxScore = Math.max(
      0,
      shapeScore,
      marginScore,
      echoScore,
      suspiciousCalcScore,
      otherSignsScore
    );

    if (maxScore >= 1 && maxScore <= 5) {
      const biradsLabel = `BIRADS ${maxScore}`;
      if (all.birads !== biradsLabel) {
        form.setFieldValue("birads", biradsLabel);
      }
    }
  };

  // Khuyến nghị = derive từ birads hiện tại -> không cần state, dùng useWatch + useMemo
  const allValues = Form.useWatch([], form); // watch toàn form
  const recommendation = useMemo(
    () => getRecommendationFromBirads(allValues?.birads || ""),
    [allValues?.birads]
  );

  // ====== Phụ thuộc theo type_of_lesion ======
  useEffect(() => {
    // Reset các field phụ thuộc khi loại tổn thương thay đổi
    // (setFieldValue là async — gọi recalc sau một nhịp)
    if (!typeOfLesion?.includes("benign-calcification")) {
      form.setFieldValue("benignCalc", "none");
    } else {
      form.setFieldValue("benignCalc", undefined);
    }

    if (!typeOfLesion?.includes("microcalcification")) {
      form.setFieldValue("suspiciousCalc", "none");
      form.setFieldValue("calcDistribution", []);
    } else {
      form.setFieldValue("suspiciousCalc", undefined);
    }

    if (!typeOfLesion?.includes("other")) {
      form.setFieldValue("suspiciousSigns", ["none"]);
    } else {
      form.setFieldValue("suspiciousSigns", undefined);
    }

    setTimeout(() => recalcAll(form.getFieldsValue()), 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typeOfLesion]);

  // Khởi tạo
  useEffect(() => {
    recalcAll(form.getFieldsValue());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ====== HTML xuất kết quả ======
  const genHtml = async ({ isCopy }) => {
    const values = await form.validateFields();

    const html = `
      <table>
        <caption>Đánh giá BIRADS</caption>
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
        <tr><td>Loại tổn thương</td><td>${getLabelFromValue(
          TYPE_OF_LESION_OPTIONS,
          values.type_of_lesion
        )}</td></tr>

        ${
          typeOfLesion?.includes("mass")
            ? `
              <tr>
                <th colspan="2">Đặc điểm của nốt, khối, đám</th>
              </tr>
              <tr>
                <td>Kích thước</td>
                <td>
                  <table style="width: 100%; border-collapse: collapse; border: none;">
                    <tr>
                      <td style="text-align: center; border: none; padding: 0; border-right: 1px solid #ccc;">
                        D1 = ${values.D1 || ""} mm
                      </td>
                      <td style="text-align: center; border: none; padding: 0;">
                        D2 =  ${values.D2 || ""} mm
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td>Kích thước trung bình</td>
                <td style="text-align: center;">D3 = ${volume || 0} mm</td>
              </tr>
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
            `
            : ""
        }

        <tr><td>Vôi hóa lành tính</td><td>${getLabelFromValue(
          BENIGN_CALCIFICATION_OPTIONS,
          values.benignCalc
        )}</td></tr>

        <tr><td>Vi vôi hóa nghi ngờ</td><td>${getLabelFromValue(
          SUSPICIOUS_CALCIFICATION_OPTIONS,
          values.suspiciousCalc
        )}</td></tr>

        <tr><td>Phân bố vôi hóa</td><td>${getLabelFromValue(
          CALC_DISTRIBUTION_OPTIONS,
          values.calcDistribution
        )}</td></tr>

        <tr><td>Dấu hiệu nghi ngờ khác</td><td>${getLabelFromValue(
          OTHER_SUSPICIOUS_SIGNS,
          values.suspiciousSigns || []
        )}</td></tr>

        <tr><td><strong>Phân loại BIRADS</strong></td><td><strong>${
          values.birads || ""
        }</strong></td></tr>
        <tr><td>Khuyến nghị</td><td>${getRecommendationFromBirads(
          values.birads || ""
        )}</td></tr>

      </table>
    `;
    return isCopy
      ? html +
          `<div style="margin-top:16px;">${genAITextToHtml(
            geminiResponse
          )}</div>`
      : html;
  };

  // ====== Actions ======
  const onCopy = async () => {
    try {
      const html = `
        ${STYLE_COPY}
        ${await genHtml({ isCopy: true })}
      `;
      await navigator.clipboard.write([
        new ClipboardItem({
          "text/html": new Blob([html], { type: "text/html" }),
        }),
      ]);
      toast.success("Đã copy bảng D-BIRADS vào clipboard!");
    } catch (err) {
      console.error(err);
      toast.error("Vui lòng điền đầy đủ và hợp lệ!");
    }
  };

  const onReset = () => {
    form.resetFields();
    setTypeOfLesion([]);
    setVolume(0);
    setGeminiResponse("");
    // Sau reset, recalc trạng thái trống
    setTimeout(() => recalcAll(form.getFieldsValue()), 0);
  };

  const onCalculate = async () => {
    try {
      // Chỉ gọi AI; tính điểm/khuyến nghị đã tự động rồi
      const tableHtml = await genHtml({ isCopy: false });
      try {
        const res = await API_CALL.get(`/chatgpt/ask-gemini-recommendation`, {
          params: {
            prompt: encodeURIComponent(tableHtml),
          },
        });
        const data = res.data;
        setGeminiResponse(
          data?.data
            ?.replace(/\*\*(.*?)\*\*/g, "$1")
            .replace(/^\* /gm, "• ")
            .replace(/\n{2,}/g, "\n\n") || ""
        );
      } catch (error) {}
    } catch (e) {
      toast.error("Không gọi được AI. Vui lòng thử lại!");
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.formContainer}>
        <ThamKhaoLinkHomeCare
          link={"https://home-care.vn/product/phan-mem-d-birads/"}
          name={"D-BIRADS"}
          desc={
            "Đánh giá và đọc kết quả Mammography theo hệ thống BI-RADS của ACR"
          }
        />

        <Form
          form={form}
          layout="vertical"
          onValuesChange={(_, all) => {
            recalcAll(all); // ⬅️ mọi thay đổi đều tính lại
          }}
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <Form.Item
                name="breastSide"
                label="Tuyến vú khảo sát"
                rules={[{ required: true }]}
              >
                <Radio.Group options={BREAST_SIDE_OPTIONS} />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item
                name="density"
                label="Mật độ tuyến vú"
                rules={[{ required: true }]}
              >
                <Radio.Group options={DENSITY_OPTIONS} />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item
                name="location"
                label="Vị trí tổn thương"
                rules={[{ required: true }]}
              >
                <Radio.Group options={LOCATION_OPTIONS} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="type_of_lesion"
            label="Loại tổn thương"
            rules={[
              {
                required: true,
                message: "Bắt buộc chọn ít nhất 1 loại tổn thương",
              },
            ]}
          >
            <Select
              mode="multiple"
              placeholder="Chọn một hoặc nhiều loại tổn thương"
              onChange={(values) => setTypeOfLesion(values)}
              options={TYPE_OF_LESION_OPTIONS}
            />
          </Form.Item>

          {typeOfLesion?.includes("mass") && (
            <>
              <Row gutter={16}>
                <Col span={6}>
                  <Form.Item name="D1" label="D1 (mm) chiều dài">
                    <InputNumber min={0} style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item name="D2" label="D2 (mm) chiều rộng">
                    <InputNumber min={0} style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item label="D3 (mm) – Kích thước trung bình">
                    <Input disabled value={volume} />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="shape"
                label="Hình dạng tổn thương"
                rules={[{ required: true, message: "Vui lòng chọn hình dạng" }]}
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
                rules={[{ required: true, message: "Vui lòng chọn đậm độ" }]}
              >
                <Radio.Group>
                  <Row gutter={[12, 12]}>
                    {ECHOGENICITY_OPTIONS.map((option) => (
                      <Col key={option.value} span={12}>
                        <Radio value={option.value}>{option.label}</Radio>
                      </Col>
                    ))}
                  </Row>
                </Radio.Group>
              </Form.Item>
            </>
          )}

          <Form.Item
            name="benignCalc"
            label="Vôi hóa lành tính"
            rules={[{ required: true, message: "Bắt buộc chọn một mục" }]}
          >
            <Radio.Group>
              <Row gutter={[12, 12]}>
                {BENIGN_CALCIFICATION_OPTIONS.filter(
                  (s) =>
                    !!s.isOther !==
                    !!typeOfLesion?.includes("benign-calcification")
                ).map((option) =>
                  option.value !== "none" ? (
                    <Col key={option.value} span={12}>
                      <Radio value={option.value}>{option.label}</Radio>
                    </Col>
                  ) : (
                    <Radio key={option.value} value={option.value}>
                      {option.label}
                    </Radio>
                  )
                )}
              </Row>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            name="suspiciousCalc"
            label="Vi vôi hóa"
            rules={[{ required: true, message: "Bắt buộc chọn một mục" }]}
          >
            <Radio.Group>
              <Row gutter={[12, 12]}>
                {SUSPICIOUS_CALCIFICATION_OPTIONS.filter(
                  (s) =>
                    !!s.isOther !==
                    !!typeOfLesion?.includes("microcalcification")
                ).map((option) =>
                  option.value !== "none" ? (
                    <Col key={option.value} span={12}>
                      <Radio value={option.value}>{option.label}</Radio>
                    </Col>
                  ) : (
                    <Radio key={option.value} value={option.value}>
                      {option.label}
                    </Radio>
                  )
                )}
              </Row>
            </Radio.Group>
          </Form.Item>

          {typeOfLesion?.includes("microcalcification") && (
            <Form.Item
              name="calcDistribution"
              label="Phân bố vôi hóa, vi vôi hóa"
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn ít nhất một phân bố",
                },
              ]}
            >
              <Checkbox.Group>
                <Row gutter={[12, 12]}>
                  {CALC_DISTRIBUTION_OPTIONS.map((option) => (
                    <Col key={option.value} span={12}>
                      <Checkbox value={option.value}>{option.label}</Checkbox>
                    </Col>
                  ))}
                </Row>
              </Checkbox.Group>
            </Form.Item>
          )}

          <Form.Item name="suspiciousSigns" label="Dấu hiệu nghi ngờ khác">
            <Checkbox.Group>
              <Row gutter={[12, 12]}>
                {OTHER_SUSPICIOUS_SIGNS.filter(
                  (s) => !!s.isOther !== !!typeOfLesion?.includes("other")
                ).map((option) =>
                  option.value !== "none" ? (
                    <Col key={option.value} span={12}>
                      <Checkbox value={option.value}>{option.label}</Checkbox>
                    </Col>
                  ) : (
                    <Checkbox key={option.value} value={option.value}>
                      {option.label}
                    </Checkbox>
                  )
                )}
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

          <Row
            gutter={12}
            className={styles.summaryRow}
            style={{ maxWidth: 1000, marginTop: 24 }}
          >
            <AIRecommendationEditor
              value={geminiResponse}
              onChange={setGeminiResponse}
            />
          </Row>
          <Form.Item>
            <Row gutter={16} style={{ justifyContent: "flex-end" }}>
              <Col>
                <Button onClick={onCalculate}>Kết quả</Button>
              </Col>
              <Col>
                <Button onClick={onReset} danger>
                  Reset
                </Button>
              </Col>
              <Col>
                <Button type="primary" onClick={onCopy}>
                  Copy kết quả
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
