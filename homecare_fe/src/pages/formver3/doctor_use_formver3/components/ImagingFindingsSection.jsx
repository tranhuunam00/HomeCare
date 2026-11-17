import React from "react";
import { Typography } from "antd";
import ImagingStructureTextTable from "../../components/ImagingStructureTextTable.jsx";
import ImagingStructureTable from "../../components/ImagingStructureTable3.jsx";

const { Title } = Typography;

/**
 * ImagingFindingsSection:
 * Hiển thị phần mô tả hình ảnh cho D-RADS.
 * Mặc định chỉ dùng Báo cáo cấu trúc (Structured Report).
 * Không tích hợp D-SONO (ứng dụng riêng).
 */
export default function ImagingFindingsSection({
  isMobile = false,
  isEdit = true,
  isCanThiepGroup = false,
  languageTranslate = "vi",
  translateLabel,
  imagingRows = [],
  setImagingRows,
  form,
  setDiagnosisSummary,
  abnormalFindings = [],
}) {
  const sectionTitle = isCanThiepGroup
    ? (translateLabel ? translateLabel(languageTranslate, "QUY TRÌNH THỦ THUẬT", false) : "QUY TRÌNH THỦ THUẬT").toUpperCase()
    : (translateLabel ? translateLabel(languageTranslate, "imagingFindings", false) : "MÔ TẢ HÌNH ẢNH").toUpperCase();

  return (
    <>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: isMobile ? 6 : 12,
          margin: isMobile ? "10px 0 8px" : "20px 0 12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Title level={4} style={{ color: "#2f6db8", margin: 0, fontSize: 15, fontWeight: 700 }}>
            {sectionTitle}
          </Title>
        </div>
      </div>

      {isCanThiepGroup ? (
        <ImagingStructureTextTable
          rows={imagingRows}
          setRows={setImagingRows}
          isEdit={isEdit}
          languageTranslate={languageTranslate}
        />
      ) : (
        <ImagingStructureTable
          rows={imagingRows}
          setRows={setImagingRows}
          isEdit={isEdit}
          setDiagnosisSummary={setDiagnosisSummary}
          abnormalFindings={abnormalFindings}
          form={form}
          languageTranslate={languageTranslate}
        />
      )}
    </>
  );
}
