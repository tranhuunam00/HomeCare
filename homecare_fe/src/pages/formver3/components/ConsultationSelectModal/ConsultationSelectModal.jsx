import React, { useEffect, useState } from "react";
import { Modal, Button, Select, message } from "antd";
import {
  PATIENT_DIAGNOSE_STATUS_CODE,
  PATIENT_DIAGNOSE_STATUS_NAME,
} from "../../../../constant/app";
import API_CALL from "../../../../services/axiosClient";
import { useGlobalAuth } from "../../../../contexts/AuthContext";

const ConsultationSelectModal = ({ open, onClose, onGoReading }) => {
  const [loading, setLoading] = useState(false);
  const [consultDoctorId, setConsultDoctorId] = useState();
  const [clinicDoctors, setClinicDoctors] = useState([]);
  const { selectedPatientDiagnose, setSelectedPatientDiagnose, doctor } =
    useGlobalAuth();

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
    if (open) {
      fetchDoctors();
    }
  }, [open]);

  const handleReadNow = async () => {
    try {
      setLoading(true);

      await API_CALL.post(
        `/patient-diagnose/${selectedPatientDiagnose.id}/change-status`,
        {
          status: PATIENT_DIAGNOSE_STATUS_NAME.IN_PROCESSING,
        },
      );

      setSelectedPatientDiagnose((prev) => ({
        ...prev,
        status: PATIENT_DIAGNOSE_STATUS_NAME.IN_PROCESSING,
        id_doctor_in_processing: doctor.id,
      }));

      onClose();
      onGoReading();
    } catch (err) {
      message.error("Không thể nhận đọc");
    } finally {
      setLoading(false);
    }
  };

  const handleConsultation = async () => {
    try {
      setLoading(true);

      await API_CALL.post(
        `/patient-diagnose/${selectedPatientDiagnose.id}/change-status`,
        {
          status: PATIENT_DIAGNOSE_STATUS_NAME.CONSULTATION,
          id_consulting_doctor: consultDoctorId,
          id_receive_doctor: doctor.id,
        },
      );

      setSelectedPatientDiagnose((prev) => ({
        ...prev,
        status: PATIENT_DIAGNOSE_STATUS_NAME.CONSULTATION,
        id_consulting_doctor: consultDoctorId,
        id_receive_doctor: doctor.id,
      }));

      onClose?.();
      onGoReading();
    } catch (err) {
      message.error("Không thể chuyển hội chẩn");
    } finally {
      setLoading(false);
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
          loading={loading}
          onClick={handleReadNow}
        >
          Tôi đọc ca này
        </Button>

        {selectedPatientDiagnose?.status ==
          PATIENT_DIAGNOSE_STATUS_CODE.NEW && (
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
              loading={loading}
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
