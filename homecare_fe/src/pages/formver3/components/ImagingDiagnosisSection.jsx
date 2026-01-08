import React from "react";
import { Form, Input, Tooltip, Typography } from "antd";
import { QuestionCircleOutlined } from "@ant-design/icons";

const { Title } = Typography;
const { TextArea } = Input;

const ImagingDiagnosisSection = ({
  abnormalFindings,
  isEdit = true,
  languageTranslate,
  translateLabel,
}) => {
  return (
    <>
      <Title level={4} style={{ color: "#2f6db8", margin: "24px 0 16px" }}>
        {translateLabel(languageTranslate, "impression", false).toUpperCase()}
      </Title>
      {/* Chẩn đoán hình ảnh */}
      <div
        style={{
          fontWeight: 650,
          marginBottom: 8,
          fontSize: 15,
        }}
      >
        Chẩn đoán hình ảnh
      </div>

      {abnormalFindings.length > 0 ? (
        <ul style={{ paddingLeft: 24 }}>
          {abnormalFindings.map((item, idx) => (
            <li key={idx} style={{ marginBottom: 6 }}>
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <div style={{ fontStyle: "italic" }}>
          Chưa ghi nhận bất thường hình ảnh.
        </div>
      )}

      {/* ICD-10 */}
      <Form.Item
        label={
          <span>
            {translateLabel(languageTranslate, "icd10Classification", false)}
            <Tooltip title="Tra cứu ICD-10">
              <a
                href="https://icd.kcb.vn/icd-10/icd10"
                target="_blank"
                rel="noopener noreferrer"
                style={{ marginLeft: 4 }}
              >
                <QuestionCircleOutlined />
              </a>
            </Tooltip>
          </span>
        }
        name="icd10"
      >
        <Input disabled={!isEdit} placeholder="Link/Code ICD-10" />
      </Form.Item>

      {/* Phân độ / phân loại */}
      <Form.Item
        label={translateLabel(
          languageTranslate,
          "gradingClassification",
          false
        )}
        name="phan_do_loai"
      >
        <Input disabled={!isEdit} placeholder="Short text" />
      </Form.Item>

      {/* Chẩn đoán phân biệt */}
      <Form.Item
        label={translateLabel(
          languageTranslate,
          "differentialDiagnosis",
          false
        )}
        name="chan_doan_phan_biet"
      >
        <Input disabled={!isEdit} placeholder="Short text" />
      </Form.Item>

      {/* Khuyến nghị & tư vấn */}
      <Title
        level={4}
        style={{
          color: "#2f6db8",
          margin: "24px 0 16px",
        }}
      >
        {translateLabel(
          languageTranslate,
          "recommendationsCounseling",
          false
        ).toUpperCase()}
      </Title>

      <Form.Item name="khuyen_nghi" tooltip="Có thể tích hợp ChatGPT D-RADS">
        <TextArea
          disabled={!isEdit}
          autoSize={{ minRows: 4, maxRows: 10 }}
          placeholder="Nhập khuyến nghị & tư vấn..."
        />
      </Form.Item>
    </>
  );
};

export default ImagingDiagnosisSection;
