import React, { useEffect, useRef, useState } from "react";
import { Form, Input, Tooltip, Typography } from "antd";
import { QuestionCircleOutlined } from "@ant-design/icons";
import { translateLabel as defaultTranslateLabel } from "../../../constant/translate.report";

const { Title } = Typography;
const { TextArea } = Input;

const ImagingDiagnosisSection = ({
  isEdit = true,
  languageTranslate = "vi",
  translateLabel,
  form,
  diagnosisSummary,
  setDiagnosisSummary,
}) => {
  const debounceRef = useRef(null);
  const t = typeof translateLabel === "function" ? translateLabel : defaultTranslateLabel;
  const safeT = (key, uppercase = false) => {
    try {
      const res = t(languageTranslate || "vi", key, uppercase);
      return uppercase ? String(res || "").toUpperCase() : String(res || "");
    } catch {
      return uppercase ? String(key || "").toUpperCase() : String(key || "");
    }
  };

  return (
    <>
      <Title level={4} style={{ color: "#2f6db8", margin: "20px 0 12px", fontSize: 15, fontWeight: 700 }}>
        {safeT("impression", true)}
      </Title>
      {/* Chẩn đoán hình ảnh */}

      <Form.Item
        label={<span style={{ fontWeight: 600, fontSize: 13 }}>{safeT("Chẩn đoán hình ảnh", false)}</span>}
        name="imagingDiagnosisSummary"
        tooltip="Có thể chỉnh sửa, tóm tắt từ các bất thường"
        style={{ marginBottom: 14 }}
      >
        <TextArea
          value={diagnosisSummary}
          onChange={(e) => {
            const value = e.target.value;

            // debounce update form
            if (debounceRef.current) {
              clearTimeout(debounceRef.current);
            }

            debounceRef.current = setTimeout(() => {
              setDiagnosisSummary(value);

              form.setFieldsValue({
                imagingDiagnosisSummary: value,
              });
            }, 500); // 300–500ms là đẹp
          }}
          disabled={!isEdit}
          autoSize={{ minRows: 3, maxRows: 10 }}
          style={{
            fontSize: 14,
            lineHeight: 1.6,
            padding: "8px 12px",
            borderRadius: 6,
            color: "#1e293b",
          }}
          placeholder="Tóm tắt chẩn đoán hình ảnh..."
        />
      </Form.Item>

      {/* Phân độ / phân loại */}
      <Form.Item
        label={<span style={{ fontWeight: 600, fontSize: 13 }}>{safeT("gradingClassification", false)}</span>}
        name="phan_do_loai"
        style={{ marginBottom: 14 }}
      >
        <Input
          size="middle"
          disabled={!isEdit}
          style={{ fontSize: 14, height: 38, borderRadius: 6, color: "#1e293b" }}
          placeholder="Nhập phân độ, phân loại (nếu có)..."
        />
      </Form.Item>

      {/* Chẩn đoán phân biệt */}
      <Form.Item
        label={<span style={{ fontWeight: 600, fontSize: 13 }}>{safeT("differentialDiagnosis", false)}</span>}
        name="chan_doan_phan_biet"
        style={{ marginBottom: 14 }}
      >
        <Input
          size="middle"
          disabled={!isEdit}
          style={{ fontSize: 14, height: 38, borderRadius: 6, color: "#1e293b" }}
          placeholder="Nhập chẩn đoán phân biệt (nếu có)..."
        />
      </Form.Item>

      {/* Khuyến nghị & tư vấn */}
      <Title
        level={4}
        style={{
          color: "#2f6db8",
          margin: "20px 0 12px",
          fontSize: 15,
          fontWeight: 700,
        }}
      >
        {safeT("recommendationsCounseling", false).toUpperCase()}
      </Title>

      <Form.Item name="khuyen_nghi" tooltip="Có thể tích hợp ChatGPT D-RADS" style={{ marginBottom: 14 }}>
        <TextArea
          disabled={!isEdit}
          autoSize={{ minRows: 2, maxRows: 8 }}
          style={{
            fontSize: 14,
            lineHeight: 1.6,
            padding: "8px 12px",
            borderRadius: 6,
            color: "#1e293b",
          }}
          placeholder="Nhập khuyến nghị & tư vấn..."
        />
      </Form.Item>
    </>
  );
};

export default ImagingDiagnosisSection;
