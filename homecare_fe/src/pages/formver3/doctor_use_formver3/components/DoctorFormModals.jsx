import React from "react";
import HistoryModal from "../../../doctor_use_form_ver2/use/items/HistoryModal";
import TranslateListRecordsVer3 from "../../components/TranslateListRecordsVer3.jsx";
import SmartCASignModal from "../../../doctor_use_form_ver2/SmartCASignModal/SmartCASignModal";
import ConfirmActionModal from "../../../../components/ConfirmActionModal/ConfirmActionModal";
import PrintPreviewModal from "./PrintPreviewModal";

export default function DoctorFormModals({
  patientDiagnose,
  idEdit,
  formValues,
  imageList,
  imagingRows,
  isFreeText,
  freeTextContent,
  printTemplate,
  printTemplateList,
  setPrintTemplate,
  previewOpen,
  setPreviewOpen,
  onPrint,
  signModalOpen,
  setSignModalOpen,
  confirmState,
  openConfirm,
  languageTranslate,
  printSourceRef,
  printRef,
  handlePrint,
  form,
  initialSnap,
  examParts,
  templateServices,
  isMobile,
  is_print,
}) {
  return (
    <>
      <PrintPreviewModal
        open={previewOpen}
        onCancel={() => setPreviewOpen(false)}
        setPreviewOpen={setPreviewOpen}
        patientDiagnose={patientDiagnose}
        status={patientDiagnose?.status}
        idEdit={idEdit}
        formValues={formValues}
        imageList={imageList}
        imagingRows={imagingRows}
        isFreeText={isFreeText}
        freeTextContent={freeTextContent}
        printTemplate={printTemplate}
        printTemplateList={printTemplateList}
        setPrintTemplate={setPrintTemplate}
        onPrint={onPrint}
        printSourceRef={printSourceRef}
        printRef={printRef}
        handlePrint={handlePrint}
        form={form}
        initialSnap={initialSnap}
        examParts={examParts}
        templateServices={templateServices}
        languageTranslate={languageTranslate || "vi"}
        isMobile={isMobile}
        is_print={is_print}
      />

      <SmartCASignModal
        open={signModalOpen}
        onCancel={() => setSignModalOpen(false)}
        patientDiagnose={patientDiagnose}
        idDoctorUseFormVer3={idEdit}
      />

      <HistoryModal patientDiagnoseId={patientDiagnose?.id} />

      <TranslateListRecordsVer3
        patientDiagnoseId={patientDiagnose?.id}
        doctorUseFormVer3Id={idEdit}
      />

      <ConfirmActionModal {...confirmState} />
    </>
  );
}
