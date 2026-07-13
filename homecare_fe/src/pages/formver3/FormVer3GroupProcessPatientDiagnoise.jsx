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
import ActionButton from "../formver2/component/ActionButton/ActionButton";

const FormVer3GroupProcessPatientDiagnoise = ({
  patientDiagnose,
  setPatientDiagnose,
  onStatusChange,
  onClose,
  onOpenReading,
}) => {
  const {
    id,
    status,
    id_doctor_in_processing,
    id_consulting_doctor,
    id_receive_doctor,
  } = patientDiagnose;

  const { doctor, setPreviewOpen } = useGlobalAuth();

  const handleCancelReading = async (
    changedStatus = PATIENT_DIAGNOSE_STATUS_NAME.NEW,
    callback = () => {},
  ) => {
    try {
      const updatePayload = {
        status: changedStatus,
      };

      await API_CALL.post(
        `/patient-diagnose/${id}/change-status`,
        updatePayload,
      );
      setPatientDiagnose({
        ...patientDiagnose,
        status: changedStatus,
        id_doctor_in_processing:
          changedStatus === PATIENT_DIAGNOSE_STATUS_NAME.IN_PROCESSING
            ? doctor.id
            : patientDiagnose.id_doctor_in_processing,
      });
      if (onStatusChange) {
        onStatusChange();
      }
      callback();
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
              <ActionButton
                color="red"
                icon={<WarningOutlined />}
                onClick={() => {
                  const ok = window.confirm(
                    "Bạn có chắc chắn muốn hủy hội chẩn?\n\nNếu Hủy, ca sẽ được trả về trạng thái MỚI.",
                  );

                  if (ok) {
                    handleCancelReading(
                      PATIENT_DIAGNOSE_STATUS_NAME.NEW,
                      () => {
                        setPatientDiagnose((prev) => ({
                          ...prev,
                          status: PATIENT_DIAGNOSE_STATUS_NAME.NEW,
                        }));
                      },
                    );
                  }
                }}
              >
                Hủy hội chẩn
              </ActionButton>
            </div>
          )}

        {status == PATIENT_DIAGNOSE_STATUS_NAME.CONSULTATION &&
          (doctor.id == patientDiagnose.id_receive_doctor ||
            doctor.id == patientDiagnose.id_consulting_doctor) && (
            <div style={{ marginTop: 16 }}>
              <ActionButton
                color="amber"
                icon={<ReadOutlined />}
                onClick={() => {
                  const ok = window.confirm(
                    "Bạn có chắc chắn muốn nhận đọc?\n\nNếu Nhận đọc, ca sẽ được chuyển sang trạng thái ĐANG XỬ LÝ.",
                  );

                  if (ok) {
                    handleCancelReading(
                      PATIENT_DIAGNOSE_STATUS_NAME.IN_PROCESSING,
                      () => {
                        setPatientDiagnose((prev) => ({
                          ...prev,
                          status: PATIENT_DIAGNOSE_STATUS_NAME.IN_PROCESSING,
                        }));
                      },
                    );
                  }
                }}
              >
                Nhận đọc
              </ActionButton>
            </div>
          )}

        {status == PATIENT_DIAGNOSE_STATUS_NAME.IN_PROCESSING &&
          (id_doctor_in_processing == doctor.id ||
            patientDiagnose.id_receive_doctor == doctor.id) && (
            <div style={{ marginTop: 16 }}>
              <ActionButton
                color="red"
                icon={<WarningOutlined />}
                onClick={() => {
                  const ok = window.confirm(
                    `Bạn có chắc chắn muốn hủy đọc?\n\nNếu Hủy đọc, ca sẽ được trả về trạng thái ${id_consulting_doctor ? "HỘI CHẨN" : "MỚI"}.`,
                  );
                  if (ok) {
                    handleCancelReading(
                      id_consulting_doctor
                        ? PATIENT_DIAGNOSE_STATUS_NAME.CONSULTATION
                        : PATIENT_DIAGNOSE_STATUS_NAME.NEW,
                      () => {
                        setPatientDiagnose((prev) => ({
                          ...prev,
                          status: id_consulting_doctor
                            ? PATIENT_DIAGNOSE_STATUS_NAME.CONSULTATION
                            : PATIENT_DIAGNOSE_STATUS_NAME.NEW,
                        }));
                      },
                    );
                  }
                }}
              >
                Hủy đọc
              </ActionButton>
            </div>
          )}

        {status == PATIENT_DIAGNOSE_STATUS_NAME.READ_DONE &&
          (id_doctor_in_processing == doctor.id ||
            id_consulting_doctor == doctor.id ||
            id_receive_doctor == doctor.id) && (
            <div style={{ marginTop: 16 }}>
              <ActionButton
                color="green"
                icon={<CheckCircleOutlined />}
                onClick={() => {
                  handleCancelReading(
                    PATIENT_DIAGNOSE_STATUS_NAME.WAIT_VERIFY,
                    () => {
                      setPatientDiagnose((prev) => ({
                        ...prev,
                        status: PATIENT_DIAGNOSE_STATUS_NAME.WAIT_VERIFY,
                      }));
                    },
                  );
                }}
              >
                Nhận duyệt
              </ActionButton>
            </div>
          )}

        {(status == PATIENT_DIAGNOSE_STATUS_NAME.READ_DONE ||
          status == PATIENT_DIAGNOSE_STATUS_NAME.WAIT_VERIFY) &&
          (patientDiagnose.id_verify_doctor == doctor.id ||
            patientDiagnose.id_receive_doctor == doctor.id) && (
            <div style={{ marginTop: 16 }}>
              <ActionButton
                color="green"
                icon={<CheckCircleOutlined />}
                onClick={() => {
                  handleCancelReading(
                    PATIENT_DIAGNOSE_STATUS_NAME.VERIFIED,
                    () => {
                      setPatientDiagnose((prev) => ({
                        ...prev,
                        status: PATIENT_DIAGNOSE_STATUS_NAME.VERIFIED,
                      }));
                    },
                  );
                }}
              >
                Duyệt
              </ActionButton>
            </div>
          )}

        <div style={{ marginTop: 16 }}>
          {status === PATIENT_DIAGNOSE_STATUS_NAME.VERIFIED && (
            <ActionButton
              color="teal"
              icon={<PrinterOutlined />}
              onClick={async () => {
                onOpenReading();
                setPreviewOpen(true);
              }}
            >
              In
            </ActionButton>
          )}
        </div>

        {(status === PATIENT_DIAGNOSE_STATUS_NAME.VERIFIED ||
          status === PATIENT_DIAGNOSE_STATUS_NAME.WAIT_VERIFY) &&
          (id_doctor_in_processing === doctor.id ||
            id_receive_doctor === doctor.id ||
            patientDiagnose.id_verify_doctor === doctor.id) && (
            <div style={{ marginTop: 16 }}>
              <ActionButton
                color="red"
                icon={<WarningOutlined />}
                onClick={() => {
                  const ok = window.confirm(
                    "Bạn có chắc chắn muốn hủy kết quả đã duyệt?\n\nNếu hủy, ca sẽ được trả về trạng thái Đọc Xong.",
                  );

                  if (ok) {
                    handleCancelReading(
                      PATIENT_DIAGNOSE_STATUS_NAME.READ_DONE,
                      () => {
                        setPatientDiagnose((prev) => ({
                          ...prev,
                          status: PATIENT_DIAGNOSE_STATUS_NAME.READ_DONE,
                        }));
                      },
                    );
                  }
                }}
              >
                Hủy duyệt
              </ActionButton>
            </div>
          )}

        {status === PATIENT_DIAGNOSE_STATUS_NAME.WAIT_VERIFY &&
          (id_receive_doctor === doctor.id ||
            patientDiagnose.id_verify_doctor === doctor.id) && (
            <div style={{ marginTop: 16 }}>
              <ActionButton
                color="orange"
                icon={<WarningOutlined />}
                onClick={() => {
                  const ok = window.confirm(
                    "Bạn có chắc chắn muốn từ chối duyệt và trả ca này về trạng thái Đang đọc để chỉnh sửa?",
                  );

                  if (ok) {
                    handleCancelReading(
                      PATIENT_DIAGNOSE_STATUS_NAME.IN_PROCESSING,
                      () => {
                        setPatientDiagnose((prev) => ({
                          ...prev,
                          status: PATIENT_DIAGNOSE_STATUS_NAME.IN_PROCESSING,
                        }));
                      },
                    );
                  }
                }}
              >
                Yêu cầu sửa
              </ActionButton>
            </div>
          )}

        <div style={{ marginTop: 16 }}>
          <ActionButton
            color="blue"
            icon={<WarningOutlined />}
            onClick={() => {
              onClose();
            }}
          >
            Exit
          </ActionButton>
        </div>
      </div>
    </div>
  );
};

export default FormVer3GroupProcessPatientDiagnoise;
