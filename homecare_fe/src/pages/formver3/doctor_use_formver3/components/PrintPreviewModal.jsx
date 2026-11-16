import React from "react";
import { Modal } from "antd";
import PrintPreviewVer3NotDataDiagnose from "../../components/PrintPreviewVer3NotDataDiagnose.jsx";

export default function PrintPreviewModal({
  open = false,
  onCancel,
  isMobile = false,
  printRef,
  printSourceRef,
  is_print,
  handlePrint,
  status,
  imagingRows = [],
  isFreeText = false,
  freeTextContent = "",
  form,
  initialSnap,
  examParts = [],
  templateServices = [],
  idEdit,
  imageList = [],
  isUse = true,
  printTemplateList = [],
  printTemplate,
  languageTranslate = "vi",
  setPreviewOpen,
  patientDiagnose,
}) {
  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      centered
      width={isMobile ? "96vw" : 1100}
      destroyOnClose={false}
      afterOpenChange={(isOpen) => {
        if (
          isOpen &&
          is_print === "true" &&
          printSourceRef?.current !== "manual"
        ) {
          setTimeout(() => {
            if (printRef?.current && handlePrint) {
              handlePrint(printRef);
            }
          }, 300);
        }
      }}
      styles={{
        content: {
          padding: 0,
        },
      }}
    >
      <div ref={printRef}>
        <PrintPreviewVer3NotDataDiagnose
          approvalStatus={status}
          imagingRows={isFreeText ? [] : imagingRows}
          isFreeText={isFreeText}
          freeTextContent={freeTextContent}
          formSnapshot={{
            ...(form?.getFieldsValue ? form.getFieldsValue() : {}),
            createdAt: initialSnap?.apiData?.createdAt,
          }}
          selectedExamPart={examParts?.find(
            (ex) => ex.id == form?.getFieldValue("id_exam_part"),
          )}
          selectedTemplateService={templateServices?.find(
            (ex) => ex.id == form?.getFieldValue("id_template_service"),
          )}
          initialSnap={initialSnap}
          editId={idEdit}
          imageList={imageList}
          isUse={isUse}
          doctor={initialSnap?.apiData?.id_receive_doctor_doctor}
          printTemplate={
            printTemplateList?.find(
              (t) => t.id == form?.getFieldValue("id_print_template"),
            ) ||
            printTemplate ||
            initialSnap?.apiData?.id_print_template_print_template
          }
          languageTranslate={languageTranslate}
          setPreviewOpen={setPreviewOpen}
          is_print={is_print}
          patientDiagnose={patientDiagnose}
        />
      </div>
    </Modal>
  );
}
