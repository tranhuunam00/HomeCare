import React, { useEffect, useState } from "react";
import { Modal, Button, Select, message, Card, Typography, Space } from "antd";
import { PlayCircleOutlined, UsergroupAddOutlined } from "@ant-design/icons";
import {
  PATIENT_DIAGNOSE_STATUS_CODE,
  PATIENT_DIAGNOSE_STATUS_NAME,
} from "../../../../constant/app";
import API_CALL from "../../../../services/axiosClient";
import { useGlobalAuth } from "../../../../contexts/AuthContext";
import usePatientDiagnoseStatus from "../../../../hooks/usePatientDiagnoseStatus";

const { Title, Text, Paragraph } = Typography;

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

  const isEligibleForConsultation =
    selectedPatientDiagnose?.status == PATIENT_DIAGNOSE_STATUS_CODE.NEW ||
    selectedPatientDiagnose?.status == PATIENT_DIAGNOSE_STATUS_CODE.IN_PROCESSING;

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={680}
      centered
      title={
        <div style={{ padding: "16px 24px 0", textAlign: "center" }}>
          <Title level={4} style={{ margin: 0, fontWeight: 700, color: "#1f2937" }}>
            Tiếp nhận xử lý ca bệnh
          </Title>
          <Text type="secondary" style={{ fontSize: 13 }}>
            Vui lòng lựa chọn hình thức xử lý chẩn đoán cho ca bệnh hiện tại
          </Text>
        </div>
      }
      bodyStyle={{ padding: "20px 24px 24px" }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isEligibleForConsultation ? "1fr 1fr" : "1fr",
          gap: 20,
          marginTop: 10,
        }}
      >
        {/* Cột 1: Tự tiếp nhận đọc ca */}
        <Card
          hoverable
          style={{
            borderRadius: 12,
            border: "1px solid #dbeafe",
            background: "linear-gradient(135deg, #f0f7ff 0%, #ffffff 100%)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
          }}
          bodyStyle={{
            padding: 24,
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div style={{ marginBottom: 24 }}>
            <Space align="center" style={{ marginBottom: 12 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: "#e0f2fe",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <PlayCircleOutlined style={{ fontSize: 22, color: "#0284c7" }} />
              </div>
              <Title level={5} style={{ margin: 0, fontWeight: 600, color: "#0369a1" }}>
                Tôi tự đọc ca này
              </Title>
            </Space>
            <Paragraph style={{ color: "#4b5563", fontSize: 13, lineHeight: "1.6", margin: 0 }}>
              Bạn sẽ trực tiếp tiếp nhận ca bệnh này, ghi nhận thông tin lâm sàng và thực hiện nhập kết quả chẩn đoán hình ảnh.
            </Paragraph>
          </div>

          <Button
            type="primary"
            size="large"
            icon={<PlayCircleOutlined />}
            loading={transitioning}
            onClick={handleReadNow}
            style={{
              width: "100%",
              borderRadius: 8,
              fontWeight: 500,
              boxShadow: "0 4px 12px rgba(2, 132, 199, 0.15)",
              background: "#0284c7",
              borderColor: "#0284c7",
            }}
          >
            Bắt đầu đọc
          </Button>
        </Card>

        {/* Cột 2: Mời bác sĩ hội chẩn */}
        {isEligibleForConsultation && (
          <Card
            hoverable
            style={{
              borderRadius: 12,
              border: "1px solid #fef3c7",
              background: "linear-gradient(135deg, #fffbeb 0%, #ffffff 100%)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
            }}
            bodyStyle={{
              padding: 24,
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div style={{ marginBottom: 20 }}>
              <Space align="center" style={{ marginBottom: 12 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: "#fef3c7",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <UsergroupAddOutlined style={{ fontSize: 22, color: "#d97706" }} />
                </div>
                <Title level={5} style={{ margin: 0, fontWeight: 600, color: "#b45309" }}>
                  Mời hội chẩn chuyên khoa
                </Title>
              </Space>
              <Paragraph style={{ color: "#4b5563", fontSize: 13, lineHeight: "1.6", marginBottom: 16 }}>
                Gửi hồ sơ bệnh án để cùng thảo luận và lấy ý kiến chuyên môn sâu từ bác sĩ chuyên khoa khác trong hệ thống.
              </Paragraph>

              <Select
                style={{ width: "100%" }}
                placeholder="Chọn bác sĩ chuyên khoa"
                showSearch
                optionFilterProp="label"
                value={consultDoctorId}
                onChange={setConsultDoctorId}
                options={clinicDoctors.map((d) => ({
                  value: d.id,
                  label: d.full_name,
                }))}
                size="large"
                dropdownStyle={{ borderRadius: 8 }}
              />
            </div>

            <Button
              disabled={!consultDoctorId}
              loading={transitioning}
              icon={<UsergroupAddOutlined />}
              onClick={handleConsultation}
              style={{
                width: "100%",
                borderRadius: 8,
                fontWeight: 500,
                color: "#fff",
                background: consultDoctorId ? "#d97706" : "#f3f4f6",
                borderColor: consultDoctorId ? "#d97706" : "#e5e7eb",
                boxShadow: consultDoctorId ? "0 4px 12px rgba(217, 119, 6, 0.15)" : "none",
              }}
            >
              Chuyển hội chẩn
            </Button>
          </Card>
        )}
      </div>
    </Modal>
  );
};

export default ConsultationSelectModal;
