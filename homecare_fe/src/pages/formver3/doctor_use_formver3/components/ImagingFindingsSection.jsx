import React from "react";
import { Typography, Segmented } from "antd";
import FastSonoSelector from "../../components/FastSonoSelector/FastSonoSelector.jsx";
import CustomSunEditor from "../../../../components/Suneditor/CustomSunEditor";
import ImagingStructureTextTable from "../../components/ImagingStructureTextTable.jsx";
import ImagingStructureTable from "../../components/ImagingStructureTable3.jsx";

const { Title } = Typography;

export default function ImagingFindingsSection({
  isMobile = false,
  isEdit = true,
  isCanThiepGroup = false,
  languageTranslate = "vi",
  translateLabel,
  imagingMode = "FAST_SONO",
  setImagingMode,
  setIsFreeText,
  freeTextContent = "",
  setFreeTextContent,
  generateTextFromStructuredRows,
  imagingRows = [],
  setImagingRows,
  selectedIDs = {},
  form,
  examParts = [],
  templateServices = [],
  patientDiagnose,
  fastSonoData,
  setFastSonoData,
  setDiagnosisSummary,
  abnormalFindings = [],
}) {
  return (
    <>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: isMobile ? 6 : 12,
          margin: isMobile ? "10px 0 8px" : "24px 0 12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <Title level={4} style={{ color: "#2f6db8", margin: 0 }}>
            {isCanThiepGroup
              ? (translateLabel ? translateLabel(languageTranslate, "QUY TRÌNH THỦ THUẬT", false) : "QUY TRÌNH THỦ THUẬT").toUpperCase()
              : (translateLabel ? translateLabel(languageTranslate, "imagingFindings", false) : "MÔ TẢ HÌNH ẢNH").toUpperCase()}
          </Title>
          <span
            style={{
              fontSize: 10,
              padding: "2px 8px",
              borderRadius: 12,
              fontWeight: 600,
              backgroundColor:
                imagingMode === "FAST_SONO"
                  ? "#f0fdf4"
                  : imagingMode === "FREE_TEXT"
                  ? "#e6f7ff"
                  : "#f9f0ff",
              color:
                imagingMode === "FAST_SONO"
                  ? "#0b6b4f"
                  : imagingMode === "FREE_TEXT"
                  ? "#096dd9"
                  : "#531dab",
              border:
                imagingMode === "FAST_SONO"
                  ? "1px solid #bbf7d0"
                  : imagingMode === "FREE_TEXT"
                  ? "1px solid #91d5ff"
                  : "1px solid #d3adf7",
              display: "inline-block",
            }}
          >
            {imagingMode === "FAST_SONO"
              ? "Chọn nhanh D-SONO (5 tầng)"
              : imagingMode === "FREE_TEXT"
              ? (languageTranslate === "en" ? "Free text" : "Văn bản tự do")
              : (languageTranslate === "en" ? "Structured table" : "Bảng cấu trúc")}
          </span>
        </div>

        {isEdit && (
          <div style={{ maxWidth: "100%", overflowX: "auto" }}>
            <Segmented
              size={isMobile ? "small" : "middle"}
              value={imagingMode}
              onChange={(val) => {
                setImagingMode(val);
                if (val === "FREE_TEXT") {
                  setIsFreeText(true);
                  if (!freeTextContent || freeTextContent === "<p><br></p>" || freeTextContent === "") {
                    const convertedHTML = generateTextFromStructuredRows
                      ? generateTextFromStructuredRows(imagingRows, languageTranslate)
                      : "";
                    setFreeTextContent(convertedHTML);
                  }
                } else if (val === "FAST_SONO") {
                  setIsFreeText(true);
                } else {
                  setIsFreeText(false);
                }
              }}
              options={[
                {
                  label: isMobile
                    ? "Nhanh"
                    : (languageTranslate === "en" ? "Fast D-SONO" : "Chọn nhanh (D-SONO)"),
                  value: "FAST_SONO",
                },
                {
                  label: isMobile
                    ? (languageTranslate === "en" ? "Table" : "Bảng")
                    : (languageTranslate === "en" ? "Structured table" : "Bảng cấu trúc"),
                  value: "STRUCTURED_TABLE",
                },
                {
                  label: isMobile
                    ? (languageTranslate === "en" ? "Text" : "Tự do")
                    : (languageTranslate === "en" ? "Free text" : "Văn bản tự do"),
                  value: "FREE_TEXT",
                },
              ]}
            />
          </div>
        )}
      </div>

      {imagingMode === "FAST_SONO" ? (
        <FastSonoSelector
          idTemplateService={selectedIDs?.id_template_service || form?.getFieldValue("id_template_service")}
          idExamPart={selectedIDs?.id_exam_part || form?.getFieldValue("id_exam_part")}
          examPartName={
            examParts.find(
              (ex) => ex.id == (selectedIDs?.id_exam_part || form?.getFieldValue("id_exam_part"))
            )?.name || ""
          }
          serviceName={
            templateServices?.find(
              (ts) => ts.id == (selectedIDs?.id_template_service || form?.getFieldValue("id_template_service"))
            )?.name || ""
          }
          gender={patientDiagnose?.gender}
          isEdit={isEdit}
          initialSelectedMap={fastSonoData?.selectedMap}
          initialGrade={fastSonoData?.grade}
          initialNarrativeText={fastSonoData?.plainNarrative || freeTextContent}
          isManualEdited={fastSonoData?.isManualEdited}
          onNarrativeChange={(plainText, htmlText, isManual) => {
            setFreeTextContent(htmlText);
            setFastSonoData?.((prev) => ({
              ...prev,
              isManualEdited: isManual,
              plainNarrative: plainText,
            }));
          }}
          onConclusionChange={(conclusionText) => {
            setDiagnosisSummary?.(conclusionText);
            form?.setFieldsValue({
              imagingDiagnosisSummary: conclusionText,
            });
          }}
          onSelectedMapChange={(selectedMap, grade, templateCode, abnormalCodes) => {
            setFastSonoData?.((prev) => ({
              ...prev,
              selectedMap,
              grade,
              templateCode,
              abnormalCodes: abnormalCodes || [],
            }));
          }}
        />
      ) : imagingMode === "FREE_TEXT" ? (
        <div style={{ border: "1px solid #e5e7eb", borderRadius: 6, overflow: "hidden" }}>
          <CustomSunEditor
            value={freeTextContent}
            onChange={setFreeTextContent}
            disabled={!isEdit}
          />
        </div>
      ) : isCanThiepGroup ? (
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
