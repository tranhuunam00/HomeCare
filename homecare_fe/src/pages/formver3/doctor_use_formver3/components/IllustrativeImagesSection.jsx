import React from "react";
import { Typography, Button, Form } from "antd";
import { EyeOutlined } from "@ant-design/icons";
import ImageWithCaptionInput from "../../../products/ImageWithCaptionInput/ImageWithCaptionInput";

const { Title } = Typography;

export default function IllustrativeImagesSection({
  isMobile = false,
  isEdit = true,
  languageTranslate = "vi",
  translateLabel,
  patientDiagnose,
  selectedPatientDiagnose,
  imageList = [],
  setImageList,
}) {
  const targetId = patientDiagnose?.id || selectedPatientDiagnose?.id;

  const handleOpenPacsViewer = () => {
    window.open(
      `/pacs/viewer?patientDiagnoseId=${targetId || ""}`,
      "_blank"
    );
  };

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 8,
          margin: isMobile ? "12px 0 8px" : "24px 0 16px",
        }}
      >
        <Title level={4} style={{ color: "#2f6db8", margin: 0, fontSize: isMobile ? 14 : undefined }}>
          {translateLabel
            ? translateLabel(languageTranslate, "illustrativeImages", false).toUpperCase()
            : "HÌNH ẢNH MINH HỌA"}
        </Title>
        <Button
          size={isMobile ? "small" : "middle"}
          type="primary"
          ghost
          icon={<EyeOutlined />}
          onClick={handleOpenPacsViewer}
        >
          Mở D-PACS Viewer
        </Button>
      </div>

      <Form.Item label="" style={{ marginBottom: 12 }}>
        <ImageWithCaptionInput
          disabled={!isEdit}
          max={6}
          value={imageList}
          onChange={setImageList}
          valueTrans={imageList}
          onChangeTrans={setImageList}
        />
      </Form.Item>
    </>
  );
}
