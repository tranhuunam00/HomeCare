import React, { useEffect, useState } from "react";
import { Modal, Button, Select, message } from "antd";
import {
  PATIENT_DIAGNOSE_STATUS_CODE,
  PATIENT_DIAGNOSE_STATUS_NAME,
} from "../../../../constant/app";
import API_CALL from "../../../../services/axiosClient";
import { useGlobalAuth } from "../../../../contexts/AuthContext";
import usePatientDiagnoseStatus from "../../../../hooks/usePatientDiagnoseStatus";

const ConsultationSelectModal = ({ open, onClose, onGoReading, onStatusChange }) => {
  const [consultDoctorId, setConsultDoctorId] = useState();
  const [clinicDoctors, setClinicDoctors] = useState([]);
  const { selectedPatientDiagnose, setSelectedPatientDiagnose, doctor } =
    useGlobalAuth();
  const { transitionStatus, transitioning } = usePatientDiagnoseStatus();

  const fetchDoctors = async () => {
    try {
      const res = await API_CALL.get("/doctor", {
        params: {
          id_clinic: selectedPatientDiagnose.id_clinic,
          status: 1,
        },
      });

      setClinicDoctors(
        (res.data.data.data || []).filter((d) => d.id !== doctor.id),
      );
    } catch (err) {
      message.error("Không tải được danh sách bác sĩ");
    }
  };

  useEffect(() => {
    if (open && selectedPatientDiagnose?.id_clinic) {
      fetchDoctors();
    }
  }, [open, selectedPatientDiagnose?.id_clinic]);

  const handleReadNow = async () => {
    const success = await transitionStatus({
      patientDiagnoseId: selectedPatientDiagnose.id,
      newStatus: PATIENT_DIAGNOSE_STATUS_NAME.IN_PROCESSING,
      successMessage: "Đã nhận đọc ca bệnh",
      onStatusChange,
    });

    if (success) {
      // Cập nhật thêm id_doctor_in_processing vào global state vì hook chỉ cập nhật status mặc định
      setSelectedPatientDiagnose((prev) => {
        if (!prev || prev.id !== selectedPatientDiagnose.id) return prev;
        return {
          ...prev,
          id_doctor_in_processing: doctor.id,
        };
      });
      onClose();
      onGoReading();
    }
  };

  const handleConsultation = async () => {
    if (!consultDoctorId) return;

    const success = await transitionStatus({
      patientDiagnoseId: selectedPatientDiagnose.id,
      newStatus: PATIENT_DIAGNOSE_STATUS_NAME.CONSULTATION,
      additionalPayload: {
        id_consulting_doctor: consultDoctorId,
        id_receive_doctor: doctor.id,
      },
      successMessage: "Đã chuyển hội chẩn thành công",
      onStatusChange,
    });

    if (success) {
      // Đồng bộ nốt các trường liên quan vào global context
      setSelectedPatientDiagnose((prev) => {
        if (!prev || prev.id !== selectedPatientDiagnose.id) return prev;
        return {
          ...prev,
          id_consulting_doctor: consultDoctorId,
          id_receive_doctor: doctor.id,
        };
      });
      onClose?.();
      onGoReading();
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      title="Chọn hình thức đọc ca"
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <Button
          type="primary"
          size="large"
          loading={transitioning}
          onClick={handleReadNow}
        >
          Tôi đọc ca này
        </Button>

        {(selectedPatientDiagnose?.status == PATIENT_DIAGNOSE_STATUS_CODE.NEW ||
          selectedPatientDiagnose?.status == PATIENT_DIAGNOSE_STATUS_CODE.IN_PROCESSING) && (
          <>
            <div>
              <div
                style={{
                  marginBottom: 8,
                  fontWeight: 600,
                }}
              >
                Chọn bác sĩ hội chẩn
              </div>

              <Select
                style={{ width: "100%" }}
                placeholder="Chọn bác sĩ"
                showSearch
                optionFilterProp="label"
                value={consultDoctorId}
                onChange={setConsultDoctorId}
                options={clinicDoctors.map((d) => ({
                  value: d.id,
                  label: d.full_name,
                }))}
              />
            </div>
            <Button
              disabled={!consultDoctorId}
              loading={transitioning}
              style={{
                background: "#F59E0B",
                color: "#fff",
              }}
              onClick={handleConsultation}
            >
              Chuyển hội chẩn
            </Button>
          </>
        )}
      </div>
    </Modal>
  );
};

export default ConsultationSelectModal;
