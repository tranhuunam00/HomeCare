import React from 'react';
import ColumnSettingModal from '../setting/ColumnSettingModal';
import ConsultationSelectModal from '../../formver3/components/ConsultationSelectModal/ConsultationSelectModal';
import TranslateListRecordsVer3 from '../../formver3/components/TranslateListRecordsVer3';
import DicomUploadModal from '../../pacs/components/DicomUploadModal';
import ConfirmActionModal from '../../../components/ConfirmActionModal/ConfirmActionModal';

export default function PatientDiagnoseModals({
  openColumnModal,
  setOpenColumnModal,
  allColumns,
  visibleKeys,
  columnSettingsStorageKey,
  onSaveColumnSettings,
  openConsultationModal,
  setOpenConsultationModal,
  onGoReading,
  handleStatusChange,
  translateOpen,
  setTranslateOpen,
  selectedPatientDiagnose,
  selectedDoctorUseFormVer3,
  setLanguageTransslate,
  setSelectedDoctorUseFormVer3,
  openDicomModal,
  setOpenDicomModal,
  confirmState,
}) {
  return (
    <>
      <ColumnSettingModal
        open={openColumnModal}
        onClose={() => setOpenColumnModal(false)}
        allColumns={allColumns}
        visibleKeys={visibleKeys}
        columnSettings={JSON.parse(localStorage.getItem(columnSettingsStorageKey) || '{}')}
        onSave={onSaveColumnSettings}
      />

      <ConsultationSelectModal
        open={openConsultationModal}
        onClose={() => setOpenConsultationModal(false)}
        onGoReading={onGoReading}
        onStatusChange={handleStatusChange}
      />

      <TranslateListRecordsVer3
        open={translateOpen}
        onClose={() => setTranslateOpen(false)}
        id_patient_diagnose={selectedPatientDiagnose?.id}
        selectedDoctorUseFormVer3={selectedDoctorUseFormVer3}
        setLanguageTransslate={setLanguageTransslate}
        setSelectedDoctorUseFormVer3={setSelectedDoctorUseFormVer3}
      />

      <DicomUploadModal
        open={openDicomModal}
        onClose={() => setOpenDicomModal(false)}
        patientDiagnoseId={selectedPatientDiagnose?.id}
        patientName={selectedPatientDiagnose?.name}
      />

      <ConfirmActionModal {...confirmState} />
    </>
  );
}
