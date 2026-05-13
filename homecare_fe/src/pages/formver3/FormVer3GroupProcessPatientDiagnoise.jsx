import {
  PlusCircleOutlined,
  FileSearchOutlined,
  ReadOutlined,
  CheckCircleOutlined,
  PrinterOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { data, useNavigate } from "react-router-dom";

import { toast } from "react-toastify";
import { Button } from "antd";
import CustomSteps from "../../components/CustomSteps/CustomSteps";
import API_CALL from "../../services/axiosClient";
import {
  PATIENT_DIAGNOSE_COLOR,
  PATIENT_DIAGNOSE_STATUS_NAME,
} from "../../constant/app";
import { useGlobalAuth } from "../../contexts/AuthContext";
import { useState } from "react";
import ConsultationSelectModal from "./components/ConsultationSelectModal/ConsultationSelectModal";

const FormVer3GroupProcessPatientDiagnoise = ({
  patientDiagnose,
  setPatientDiagnose,
  onStatusChange,
  onClose,
}) => {
  const { id, status, id_doctor_in_processing, id_consulting_doctor } =
    patientDiagnose;

  const { doctor, templateServices } = useGlobalAuth();

  const [openConsultationModal, setOpenConsultationModal] = useState(false);

  const navigate = useNavigate();

  const onCheckandCreate = async () => {
    try {
      if (
        templateServices
          .find((t) => t.id == patientDiagnose.id_template_service)
          ?.code.toUpperCase()
          .includes("SASK")
      ) {
        const sonoResult = await API_CALL.get(`/sono`, {
          params: {
            id_patient_diagnose: id,
            // id_doctor: doctor.id,
          },
        });

        if (sonoResult.data.data.data.data?.length) {
          navigate(`/home/sono/bung/${sonoResult.data.data.data.data[0].id}`);
        } else {
          navigate(`/home/sono/use/patient-diagnose/${id}`);
        }
      } else {
        const doctorUseDFormVer3 = await API_CALL.get(`/doctorUseFormVer3`, {
          params: {
            id_patient_diagnose: id,
            // id_doctor: doctor.id,
            orderBy: "id",
            orderDir: "DESC",
          },
        });

        if (doctorUseDFormVer3.data.data.data?.length) {
          navigate(
            `/home/doctor-use-formver3/detail/${doctorUseDFormVer3.data.data.data[0].id}/${patientDiagnose.status == PATIENT_DIAGNOSE_STATUS_NAME.VERIFY}`,
          );
        } else {
          navigate(`/home/form-drad-v3/use/patient-diagnose/${id}`);
        }
      }
    } catch (error) {
      toast.error("Không cập nhật được trạng thái đọc ca bệnh");
    }
  };

  const steps = [
    {
      key: PATIENT_DIAGNOSE_STATUS_NAME.NEW,
      title: "Chưa đọc",
      color: PATIENT_DIAGNOSE_COLOR[PATIENT_DIAGNOSE_STATUS_NAME.NEW],
      onStepClick: () => {
        setOpenConsultationModal(true);
      },
    },

    {
      key: PATIENT_DIAGNOSE_STATUS_NAME.CONSULTATION,
      title: "Hội chẩn",
      color: PATIENT_DIAGNOSE_COLOR[PATIENT_DIAGNOSE_STATUS_NAME.CONSULTATION],
      onStepClick: async () => {
        try {
          await onCheckandCreate();
        } catch (error) {
          toast.error("Không mở được ca bệnh");
        }
      },
    },

    {
      key: PATIENT_DIAGNOSE_STATUS_NAME.IN_PROCESSING,
      title: "Đang đọc",
      color: PATIENT_DIAGNOSE_COLOR[PATIENT_DIAGNOSE_STATUS_NAME.IN_PROCESSING],
      onStepClick: async () => {
        try {
          await API_CALL.put(`/patient-diagnose/${id}`, {
            ...patientDiagnose,
            status: PATIENT_DIAGNOSE_STATUS_NAME.IN_PROCESSING,
          });

          await onCheckandCreate();
        } catch (error) {
          toast.error("Không cập nhật được trạng thái đọc ca bệnh");
        }
      },
    },

    {
      key: PATIENT_DIAGNOSE_STATUS_NAME.READ_DONE,
      title: "Đọc xong",
      color: PATIENT_DIAGNOSE_COLOR[PATIENT_DIAGNOSE_STATUS_NAME.READ_DONE],
      onStepClick: async () => {
        try {
          await onCheckandCreate();
        } catch (error) {
          toast.error("Không mở được kết quả");
        }
      },
    },

    {
      key: PATIENT_DIAGNOSE_STATUS_NAME.WAIT_VERIFY,
      title: "Đang duyệt",
      color: PATIENT_DIAGNOSE_COLOR[PATIENT_DIAGNOSE_STATUS_NAME.WAIT_VERIFY],
      onStepClick: async () => {
        try {
          await onCheckandCreate();
        } catch (error) {
          toast.error("Không mở được kết quả");
        }
      },
    },

    {
      key: PATIENT_DIAGNOSE_STATUS_NAME.VERIFIED,
      title: "Duyệt xong",
      color: PATIENT_DIAGNOSE_COLOR[PATIENT_DIAGNOSE_STATUS_NAME.VERIFIED],
      onStepClick: async () => {
        try {
          await onCheckandCreate();
        } catch (error) {
          toast.error("Không mở được kết quả");
        }
      },
    },
  ];

  const handleCancelReading = async (
    changedStatus = PATIENT_DIAGNOSE_STATUS_NAME.NEW,
  ) => {
    try {
      const updatePayload = {
        status: changedStatus,
      };

      await API_CALL.post(
        `/patient-diagnose/${id}/change-status`,
        updatePayload,
      );
      setPatientDiagnose({ ...patientDiagnose, status: changedStatus });
      if (onStatusChange) {
        onStatusChange();
      }
      navigate(`/home/patients-diagnose`);
      toast.success("Thao tác thành công");
    } catch (error) {
      toast.error("Thao tác thất bại do lỗi ", error.message);
    }
  };

  console.log(
    "doctor.id == patientDiagnose.id_doctor_in_processing",
    doctor.id,
    patientDiagnose.id_doctor_in_processing,
  );

  return (
    <div>
      <div
        style={{
          position: "fixed",
          zIndex: 3,
          display: "flex",
          flexDirection: "column",
          background: "#ffffff",
          width: "41vw",
          borderBottom: "1px solid #3950d163",
          boxShadow: "0 -2px 8px rgba(0,0,0,0.05)",
        }}
      >
        <CustomSteps
          steps={steps}
          current={steps.findIndex((s) => s.key === status)}
          onClose={onClose}
          is_consultation_doctor={patientDiagnose.id_consulting_doctor}
        />
      </div>

      <div
        style={{
          position: "fixed",
          zIndex: 3,
          display: "flex",
          flexDirection: "row",
          background: "#ffffff",
          gap: 30,
          width: "41vw",
          bottom: 0,
          borderTop: "1px solid #474f946c",
          boxShadow: "0 -2px 8px rgba(0,0,0,0.05)",
        }}
      >
        {status == PATIENT_DIAGNOSE_STATUS_NAME.CONSULTATION &&
          (doctor.id == patientDiagnose.id_receive_doctor ||
            doctor.id == patientDiagnose.id_consulting_doctor) && (
            <div style={{ marginTop: 16 }}>
              <Button
                style={{
                  height: 45,
                  padding: "16px 18px",
                  borderRadius: 14,
                  fontWeight: 800,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: "#c14728",
                  background: "rgba(14,165,233,0.06)",
                }}
                onClick={() => {
                  const ok = window.confirm(
                    "Bạn có chắc chắn muốn hủy hội chẩn?\n\nNếu Hủy, ca sẽ được trả về trạng thái MỚI.",
                  );
                  if (ok) handleCancelReading(PATIENT_DIAGNOSE_STATUS_NAME.NEW);
                }}
              >
                Hủy hội chẩn
              </Button>
            </div>
          )}
        {status == PATIENT_DIAGNOSE_STATUS_NAME.IN_PROCESSING &&
          id_doctor_in_processing == doctor.id && (
            <div style={{ marginTop: 16 }}>
              <Button
                style={{
                  height: 45,
                  padding: "16px 18px",
                  borderRadius: 14,
                  fontWeight: 800,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: "#c14728",
                  background: "rgba(14,165,233,0.06)",
                }}
                onClick={() => {
                  const ok = window.confirm(
                    `Bạn có chắc chắn muốn hủy phiếu?\n\nNếu Hủy Phiếu, ca sẽ được trả về trạng thái ${id_consulting_doctor ? "HỘI CHẨN" : "MỚI"}.`,
                  );
                  if (ok)
                    handleCancelReading(
                      id_consulting_doctor
                        ? PATIENT_DIAGNOSE_STATUS_NAME.CONSULTATION
                        : PATIENT_DIAGNOSE_STATUS_NAME.NEW,
                    );
                }}
              >
                Hủy phiếu
              </Button>
            </div>
          )}

        <div style={{ marginTop: 16 }}>
          <Button
            danger
            type="primary"
            onClick={() => {
              onClose();
            }}
            style={{
              height: 45,
              padding: "16px 18px",
              borderRadius: 14,
              fontWeight: 800,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: "#0551df",
              background: "rgba(14,165,233,0.06)",
              width: 150,
            }}
          >
            Exit
          </Button>
        </div>

        <div style={{ marginTop: 16 }}>
          {status === PATIENT_DIAGNOSE_STATUS_NAME.VERIFY && (
            <Button
              danger
              type="primary"
              onClick={async () => {
                await onCheckandCreate();
              }}
              style={{
                height: 45,
                padding: "16px 18px",
                borderRadius: 14,
                fontWeight: 800,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: "#3c7e06",
                background: "rgba(14,165,233,0.06)",
                width: 150,
              }}
            >
              In
            </Button>
          )}
        </div>

        {status === PATIENT_DIAGNOSE_STATUS_NAME.VERIFY &&
          id_doctor_in_processing === doctor.id && (
            <div style={{ marginTop: 16 }}>
              <Button
                style={{
                  height: 45,
                  padding: "16px 18px",
                  borderRadius: 14,
                  fontWeight: 800,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: "#b91c1c",
                  border: "1px solid rgba(185,28,28,0.35)",
                  background: "rgba(185,28,28,0.06)",
                }}
                onClick={() => {
                  const ok = window.confirm(
                    "Bạn có chắc chắn muốn hủy kết quả đã duyệt?\n\nNếu hủy, ca sẽ được trả về trạng thái CHỜ DUYỆT.",
                  );
                  if (ok)
                    handleCancelReading(PATIENT_DIAGNOSE_STATUS_NAME.WAITING);
                }}
              >
                Hủy duyệt
              </Button>
            </div>
          )}
      </div>

      <ConsultationSelectModal
        open={openConsultationModal}
        onClose={() => setOpenConsultationModal(false)}
        patientDiagnose={patientDiagnose}
        doctor={doctor}
        onSuccess={onStatusChange}
        onCheckandCreate={onCheckandCreate}
        setPatientDiagnose={setPatientDiagnose}
      />
    </div>
  );
};

export default FormVer3GroupProcessPatientDiagnoise;
