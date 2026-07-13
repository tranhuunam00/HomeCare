import {
  PlusCircleOutlined,
  FileSearchOutlined,
  ReadOutlined,
  CheckCircleOutlined,
  PrinterOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

import { Button } from "antd";
import CustomSteps from "../../components/CustomSteps/CustomSteps";
import {
  PATIENT_DIAGNOSE_COLOR,
  PATIENT_DIAGNOSE_STATUS_NAME,
} from "../../constant/app";
import { useGlobalAuth } from "../../contexts/AuthContext";
import { useState } from "react";
import ConsultationSelectModal from "./components/ConsultationSelectModal/ConsultationSelectModal";
import ActionButton from "../formver2/component/ActionButton/ActionButton";
import usePatientDiagnoseStatus from "../../hooks/usePatientDiagnoseStatus";

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
  const { transitionStatus } = usePatientDiagnoseStatus();

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
                onClick={() =>
                  transitionStatus({
                    patientDiagnoseId: id,
                    newStatus: PATIENT_DIAGNOSE_STATUS_NAME.NEW,
                    confirmMessage:
                      "Bạn có chắc chắn muốn hủy hội chẩn?\n\nNếu Hủy, ca sẽ được trả về trạng thái MỚI.",
                    successMessage: "Thao tác thành công",
                    localSetState: setPatientDiagnose,
                    onStatusChange,
                  })
                }
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
                onClick={() =>
                  transitionStatus({
                    patientDiagnoseId: id,
                    newStatus: PATIENT_DIAGNOSE_STATUS_NAME.IN_PROCESSING,
                    confirmMessage:
                      "Bạn có chắc chắn muốn nhận đọc?\n\nNếu Nhận đọc, ca sẽ được chuyển sang trạng thái ĐANG XỬ LÝ.",
                    successMessage: "Thao tác thành công",
                    localSetState: setPatientDiagnose,
                    onStatusChange,
                  })
                }
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
                  const newStatus = id_consulting_doctor
                    ? PATIENT_DIAGNOSE_STATUS_NAME.CONSULTATION
                    : PATIENT_DIAGNOSE_STATUS_NAME.NEW;
                  transitionStatus({
                    patientDiagnoseId: id,
                    newStatus,
                    confirmMessage: `Bạn có chắc chắn muốn hủy đọc?\n\nNếu Hủy đọc, ca sẽ được trả về trạng thái ${id_consulting_doctor ? "HỘI CHẨN" : "MỚI"}.`,
                    successMessage: "Thao tác thành công",
                    localSetState: setPatientDiagnose,
                    onStatusChange,
                  });
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
                onClick={() =>
                  transitionStatus({
                    patientDiagnoseId: id,
                    newStatus: PATIENT_DIAGNOSE_STATUS_NAME.WAIT_VERIFY,
                    successMessage: "Thao tác thành công",
                    localSetState: setPatientDiagnose,
                    onStatusChange,
                  })
                }
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
                onClick={() =>
                  transitionStatus({
                    patientDiagnoseId: id,
                    newStatus: PATIENT_DIAGNOSE_STATUS_NAME.VERIFIED,
                    successMessage: "Thao tác thành công",
                    localSetState: setPatientDiagnose,
                    onStatusChange,
                  })
                }
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
                onClick={() =>
                  transitionStatus({
                    patientDiagnoseId: id,
                    newStatus: PATIENT_DIAGNOSE_STATUS_NAME.READ_DONE,
                    confirmMessage:
                      "Bạn có chắc chắn muốn hủy kết quả đã duyệt?\n\nNếu hủy, ca sẽ được trả về trạng thái Đọc Xong.",
                    successMessage: "Thao tác thành công",
                    localSetState: setPatientDiagnose,
                    onStatusChange,
                  })
                }
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
                onClick={() =>
                  transitionStatus({
                    patientDiagnoseId: id,
                    newStatus: PATIENT_DIAGNOSE_STATUS_NAME.IN_PROCESSING,
                    confirmMessage:
                      "Bạn có chắc chắn muốn từ chối duyệt và trả ca này về trạng thái Đang đọc để chỉnh sửa?",
                    successMessage: "Thao tác thành công",
                    localSetState: setPatientDiagnose,
                    onStatusChange,
                  })
                }
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
