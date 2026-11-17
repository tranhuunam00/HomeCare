import React, { useState } from 'react';
import { Button, Modal, Popover } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import CustomSteps from '../../../components/CustomSteps/CustomSteps';
import { stepsStatus } from '../../formver3/formver3.constant';
import { PATIENT_DIAGNOSE_STATUS_CODE } from '../../../constant/app';
import FormVer3GroupProcessPatientDiagnoise from '../../formver3/FormVer3GroupProcessPatientDiagnoise';
import PatientDiagnoiseDetailPage from '../Detail/DetailPatientDiagnose';
import DoctorUseDFormVer3 from '../../formver3/doctor_use_formver3/use/DoctorIUseFormVer3';
import PatientMiniInfo from './PatientMiniInfo';

export default function PatientDiagnoseRightPanel({
  selectedPatientDiagnose,
  setSelectedPatientDiagnose,
  rightPanelMode,
  setRightPanelMode,
  initEditMode,
  setInitEditMode,
  doctorUseFormVer3Id,
  setDoctorUseFormVer3Id,
  handleStatusChange,
  onCheckandCreate,
  setOpenConsultationModal,
  setTranslateOpen,
  setOpenDicomModal,
  numberLanguageDoctorUseFormV3,
  templateServices,
  examParts,
  deviceIsMobile,
  leftWidth,
}) {
  const [openPatientInfoModal, setOpenPatientInfoModal] = useState(false);

  if (!selectedPatientDiagnose) return null;

  return (
    <div
      style={{
        flex: 1,
        minWidth: 0,
        width: deviceIsMobile ? '100%' : `${100 - leftWidth}%`,
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        background: '#ffffff',
        borderRadius: '6px',
        border: '1px solid #e2e8f0',
        padding: deviceIsMobile ? '8px 6px' : '10px 12px',
        overflowY: 'auto',
        maxHeight: 'calc(100vh - 120px)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: deviceIsMobile ? 6 : 8,
          flexWrap: 'wrap',
          marginBottom: deviceIsMobile ? 8 : 4,
        }}
      >
        {deviceIsMobile && (
          <Button
            size="small"
            style={{
              borderRadius: '4px',
              borderColor: '#cbd5e1',
              color: '#334155',
              fontSize: '11px',
              height: '24px',
              padding: '0 8px',
              fontWeight: '600',
            }}
            onClick={() => {
              setSelectedPatientDiagnose(null);
              setRightPanelMode('detail');
            }}
          >
            ← Danh sách
          </Button>
        )}
        <Button
          type="primary"
          ghost
          size="small"
          style={{
            borderColor: '#34d399',
            color: '#059669',
            fontSize: '11px',
            height: '22px',
            padding: '0 8px',
            display: 'flex',
            alignItems: 'center',
            fontWeight: '500',
          }}
          onClick={() => setTranslateOpen(true)}
        >
          Bản dịch: {numberLanguageDoctorUseFormV3}
        </Button>
        <Button
          style={{
            borderRadius: '4px',
            borderColor: '#0284c7',
            color: '#0284c7',
            fontSize: '11px',
            height: '22px',
            padding: '0 8px',
            display: 'flex',
            alignItems: 'center',
            fontWeight: '500',
          }}
          onClick={() =>
            window.open(`/pacs/viewer?patientDiagnoseId=${selectedPatientDiagnose?.id}`, '_blank')
          }
        >
          Xem DICOM (PACS)
        </Button>
        <Button
          style={{
            borderRadius: '4px',
            borderColor: '#059669',
            backgroundColor: '#ecfdf5',
            color: '#047857',
            fontSize: '11px',
            height: '22px',
            padding: '0 8px',
            display: 'flex',
            alignItems: 'center',
            fontWeight: '600',
          }}
          onClick={() => {
            const dsonoBaseUrl = import.meta.env.VITE_DSONO_URL || 'http://103.90.227.173:6002';
            const query = `accessionNo=${selectedPatientDiagnose?.id || ''}&pid=${selectedPatientDiagnose?.PID || ''}&patientName=${encodeURIComponent(selectedPatientDiagnose?.name || '')}&gender=${encodeURIComponent(selectedPatientDiagnose?.gender || '')}&source=HOMECARE`;
            const targetUrl = `${dsonoBaseUrl}?${query}`;
            // If on mobile device, try launching app intent / custom scheme first with fallback
            if (/android/i.test(navigator.userAgent)) {
              const appIntent = `intent://open?${query}#Intent;scheme=dsono;package=com.dsono.myapp;S.browser_fallback_url=${encodeURIComponent(targetUrl)};end`;
              window.location.href = appIntent;
            } else {
              window.open(targetUrl, '_blank');
            }
          }}
        >
          Mở D-SONO
        </Button>
        <Button
          style={{
            borderRadius: '4px',
            borderColor: '#64748b',
            color: '#475569',
            fontSize: '11px',
            height: '22px',
            padding: '0 8px',
            display: 'flex',
            alignItems: 'center',
            fontWeight: '500',
          }}
          onClick={() => setOpenDicomModal(true)}
        >
          Tải DICOM
        </Button>

        <CustomSteps
          steps={stepsStatus({
            setOpenConsultationModal,
            onCheckandCreate: () => onCheckandCreate(false),
            isConsultation:
              !!selectedPatientDiagnose.id_consulting_doctor ||
              selectedPatientDiagnose.status === PATIENT_DIAGNOSE_STATUS_CODE.CONSULTATION,
          })}
          current={stepsStatus({
            setOpenConsultationModal,
            onCheckandCreate,
            isConsultation:
              !!selectedPatientDiagnose.id_consulting_doctor ||
              selectedPatientDiagnose.status === PATIENT_DIAGNOSE_STATUS_CODE.CONSULTATION,
          }).findIndex((s) => s.key === selectedPatientDiagnose.status)}
          is_consultation_doctor={selectedPatientDiagnose.id_consulting_doctor}
        />

        {rightPanelMode === 'reading' &&
          (deviceIsMobile ? (
            <>
              <Button
                icon={<UserOutlined />}
                onClick={() => setOpenPatientInfoModal(true)}
                style={{
                  marginLeft: 0,
                  borderRadius: '4px',
                  borderColor: '#3b82f6',
                  color: '#1d4ed8',
                  fontSize: '11px',
                  height: '22px',
                  padding: '0 8px',
                  display: 'flex',
                  alignItems: 'center',
                  fontWeight: '500',
                }}
              >
                Thông tin BN
              </Button>
              <Modal
                open={openPatientInfoModal}
                onCancel={() => setOpenPatientInfoModal(false)}
                footer={null}
                centered
                width="94vw"
                styles={{ body: { padding: '8px 4px', maxHeight: '75vh', overflowY: 'auto' } }}
                title={
                  <span style={{ fontSize: '13px', fontWeight: '600', color: '#1d4ed8' }}>
                    Thông tin hành chính bệnh nhân
                  </span>
                }
              >
                <PatientMiniInfo
                  patient={selectedPatientDiagnose}
                  templateServices={templateServices}
                  examParts={examParts}
                  isMobile={true}
                />
              </Modal>
            </>
          ) : (
            <Popover
              content={
                <PatientMiniInfo
                  patient={selectedPatientDiagnose}
                  templateServices={templateServices}
                  examParts={examParts}
                />
              }
              title={
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#1d4ed8' }}>
                  Thông tin hành chính bệnh nhân
                </span>
              }
              trigger="click"
              placement="bottomLeft"
            >
              <Button
                icon={<UserOutlined />}
                style={{
                  marginLeft: 20,
                  borderRadius: '4px',
                  borderColor: '#3b82f6',
                  color: '#1d4ed8',
                  fontSize: '11px',
                  height: '22px',
                  padding: '0 8px',
                  display: 'flex',
                  alignItems: 'center',
                  fontWeight: '500',
                }}
              >
                Thông tin BN
              </Button>
            </Popover>
          ))}
      </div>

      <div>
        <div style={{ display: rightPanelMode === 'detail' ? 'block' : 'none' }}>
          <FormVer3GroupProcessPatientDiagnoise
            patientDiagnose={selectedPatientDiagnose}
            setPatientDiagnose={setSelectedPatientDiagnose}
            onStatusChange={handleStatusChange}
            onClose={() => setSelectedPatientDiagnose(null)}
            onOpenReading={(editMode = false) => {
              setInitEditMode(editMode);
              setRightPanelMode('reading');
            }}
          />
        </div>

        {rightPanelMode === 'detail' ? (
          <PatientDiagnoiseDetailPage
            idFromList={selectedPatientDiagnose?.id}
            onOpenReading={(editMode = false) => {
              setInitEditMode(editMode);
              setRightPanelMode('reading');
            }}
            onClose={() => setSelectedPatientDiagnose(null)}
            setDoctorUseFormVer3Id={setDoctorUseFormVer3Id}
            onStatusChange={handleStatusChange}
          />
        ) : (
          <DoctorUseDFormVer3
            patient_diagnose_id={selectedPatientDiagnose?.id}
            isUse={true}
            onBackDetail={() => setRightPanelMode('detail')}
            doctorUseFormVer3Id={doctorUseFormVer3Id}
            onStatusChange={handleStatusChange}
            onOpenConsultation={() => setOpenConsultationModal(true)}
            initEditMode={initEditMode}
          />
        )}
      </div>
    </div>
  );
}
