import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Card,
  Row,
  Col,
  Typography,
  Spin,
  Tag,
  Button,
  Divider,
  ConfigProvider,
  Grid,
  Table,
  Space,
  Tooltip,
} from "antd";
import dayjs from "dayjs";
import useVietnamAddress from "../../../hooks/useVietnamAddress";
import API_CALL from "../../../services/axiosClient";
import {
  PATIENT_DIAGNOSE_COLOR,
  PATIENT_DIAGNOSE_STATUS,
  PATIENT_DIAGNOSE_STATUS_CODE,
  USER_ROLE,
} from "../../../constant/app";
import PatientTablePage from "../PatientDiagnoseList";
import StatusButtonPatientDiagnose from "../../../components/Status2ButtonPatientDiagnose";
import { useGlobalAuth } from "../../../contexts/AuthContext";
import GroupProcessPatientDiagnoiseFormVer2 from "../../../components/GroupProcessPatientDiagnoiseFormVer2";
import {
  EditOutlined,
  EyeOutlined,
  DeleteOutlined,
  CopyOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import SignedFilesBox from "../../doctor_use_form_ver2/SmartCASignModal/SignedFilesBox";
import DoctorUseFormVer3Viewer from "../../formver3/components/DoctorUseFormVer3Viewer";
import useLatestDoctorUseFormVer3 from "../../formver3/useLatestDoctorUseFormVer3";
import { calculateAge } from "../../formver3/formver3.constant";

const { Title, Text } = Typography;

const InfoItem = ({ label, children }) => (
  <div style={{ marginBottom: 6 }}>
    <div style={{ fontSize: '10px', color: '#8c8c8c', textTransform: 'uppercase', letterSpacing: '0.3px', marginBottom: 2 }}>
      {label}
    </div>
    <div style={{ fontSize: '12px', fontWeight: '500', color: '#262626', lineHeight: '1.3', wordBreak: 'break-all' }}>
      {children}
    </div>
  </div>
);

const PatientDiagnoiseDetailPage = ({
  onStatusChange,
  onOpenReading,
  setDoctorUseFormVer3Id,
}) => {
  const { id: routeId } = useParams();
  const navigate = useNavigate();

  const {
    examParts,
    templateServices,
    selectedPatientDiagnose,
    setSelectedPatientDiagnose,
    languageTranslate,
    doctor,
    user,
  } = useGlobalAuth();

  const isAdmin = user?.id_role == USER_ROLE.ADMIN;
  const inProcessingDoctorId =
    selectedPatientDiagnose?.id_doctor_in_processing ||
    selectedPatientDiagnose?.id_receive_doctor;
  const inProcessingDoctorName =
    selectedPatientDiagnose?.id_doctor_in_processing_doctor?.name ||
    selectedPatientDiagnose?.id_doctor_in_processing_doctor?.full_name ||
    selectedPatientDiagnose?.id_receive_doctor_doctor?.name ||
    selectedPatientDiagnose?.id_receive_doctor_doctor?.full_name ||
    "bác sĩ khác";

  // Kiểm tra quyền sửa đọc ca bệnh
  const hasReadingPermission =
    isAdmin ||
    !inProcessingDoctorId ||
    inProcessingDoctorId == doctor?.id;

  useEffect(() => {
    if (routeId && (!selectedPatientDiagnose || String(selectedPatientDiagnose.id) !== String(routeId))) {
      API_CALL.get(`/patient-diagnose/${routeId}`)
        .then((res) => {
          const data = res?.data?.data || res?.data;
          if (data?.id) setSelectedPatientDiagnose(data);
        })
        .catch(() => {});
    }
  }, [routeId]);

  const { record: latestVer3 } = useLatestDoctorUseFormVer3(
    selectedPatientDiagnose?.id,
    languageTranslate,
  );

  useEffect(() => {
    if (latestVer3?.id) {
      setDoctorUseFormVer3Id?.((prev) => (prev === latestVer3.id ? prev : latestVer3.id));
    }
  }, [latestVer3?.id, setDoctorUseFormVer3Id]);

  const { provinces, setSelectedProvince } = useVietnamAddress();

  // Set tỉnh/huyện/xã dựa trên data
  useEffect(() => {
    if (selectedPatientDiagnose?.province_code && provinces.length > 0) {
      setSelectedProvince((prev) =>
        prev === selectedPatientDiagnose.province_code ? prev : selectedPatientDiagnose.province_code
      );
    }
  }, [selectedPatientDiagnose?.province_code, provinces.length]);

  if (!selectedPatientDiagnose) return <Spin />;
  // console.log("data", data);

  const displayData = {
    name: (selectedPatientDiagnose?.name || "")?.toUpperCase(),
    birth_year: selectedPatientDiagnose?.birth_year || "",
    gender: selectedPatientDiagnose?.gender || "-",
    age:
      calculateAge(
        selectedPatientDiagnose?.dob,
        selectedPatientDiagnose?.birth_year,
      ) || "-",

    phone: selectedPatientDiagnose?.phoneNumber || "-",
    address: selectedPatientDiagnose?.address || "-",
    clinical: selectedPatientDiagnose?.Indication || "-",
    id_exam_part: selectedPatientDiagnose?.id_exam_part,
    PID: selectedPatientDiagnose?.PID || "-",
    SID: selectedPatientDiagnose?.SID || "-",
    CCCD: selectedPatientDiagnose?.CCCD || "-",
    email: selectedPatientDiagnose?.email || "-",
    countryCode: selectedPatientDiagnose?.countryCode || "-",
    id_template_service: selectedPatientDiagnose?.id_template_service,
    updatedAt: selectedPatientDiagnose?.updatedAt,
  };

  return (
    <div style={{ height: "100%" }}>
      <ConfigProvider
        theme={{
          token: {
            fontSize: 12,
            fontSizeHeading5: 12,
            padding: 0,
          },
        }}
      >
        <Card
          title="WORK SPACE"
          style={{ marginBottom: 6 }}
          bodyStyle={{ padding: "10px 16px 2px 16px" }}
          bordered
          extra={
            <Space>
              {(selectedPatientDiagnose.status === PATIENT_DIAGNOSE_STATUS_CODE.IN_PROCESSING ||
                selectedPatientDiagnose.status === PATIENT_DIAGNOSE_STATUS_CODE.READ_DONE) && (
                <>
                  {hasReadingPermission ? (
                    <Button
                      type="primary"
                      size="small"
                      onClick={() => {
                        if (onOpenReading) {
                          onOpenReading(true);
                        } else {
                          navigate(`/home/form-drad-v3/use/patient-diagnose/${selectedPatientDiagnose.id}`);
                        }
                      }}
                      icon={<EditOutlined />}
                    >
                      Sửa đọc
                    </Button>
                  ) : (
                    <>
                      <Tooltip
                        title={`Ca bệnh này đang được phụ trách bởi Bác sĩ ${inProcessingDoctorName}. Bạn không có quyền chỉnh sửa, chỉ có thể xem.`}
                      >
                        <span>
                          <Button
                            size="small"
                            disabled
                            icon={<EditOutlined />}
                          >
                            Sửa đọc
                          </Button>
                        </span>
                      </Tooltip>
                      <Button
                        type="primary"
                        ghost
                        size="small"
                        onClick={() => {
                          if (onOpenReading) {
                            onOpenReading(false); // Chế độ chỉ xem
                          } else {
                            navigate(`/home/form-drad-v3/use/patient-diagnose/${selectedPatientDiagnose.id}`);
                          }
                        }}
                        icon={<EyeOutlined />}
                      >
                        Xem ca
                      </Button>
                    </>
                  )}
                </>
              )}

              <Tooltip title="Mở phần mềm Siêu âm chuyên sâu (D-SONO)">
                <Button
                  size="small"
                  onClick={() => {
                    const dsonoBaseUrl = import.meta.env.VITE_DSONO_URL || 'http://localhost:3000';
                    const targetUrl = `${dsonoBaseUrl}?accessionNo=${selectedPatientDiagnose?.id}&pid=${selectedPatientDiagnose?.PID || ''}&patientName=${encodeURIComponent(selectedPatientDiagnose?.name || '')}&gender=${encodeURIComponent(selectedPatientDiagnose?.gender || '')}&source=HOMECARE`;
                    window.open(targetUrl, '_blank');
                  }}
                  style={{
                    backgroundColor: '#059669',
                    borderColor: '#047857',
                    color: '#ffffff',
                    fontWeight: 600,
                    fontSize: 11,
                  }}
                >
                  D-SONO
                </Button>
              </Tooltip>

              <Button
                size="small"
                type="text"
                style={{ color: "red" }}
                onClick={() => {
                  setSelectedPatientDiagnose(null);
                  if (routeId) navigate("/home/patients-diagnose");
                }}
              >
                X
              </Button>
            </Space>
          }
        >
          <Row gutter={[16, 12]} style={{ padding: "4px 2px" }}>
            {/* Row 1: Demographics */}
            <Col xs={24} sm={12} md={8}>
              <InfoItem label="Họ và tên">{displayData.name}</InfoItem>
            </Col>
            <Col xs={8} sm={4} md={4}>
              <InfoItem label="Giới tính">{displayData.gender}</InfoItem>
            </Col>
            <Col xs={8} sm={4} md={6}>
              <InfoItem label="Năm sinh">{displayData.birth_year}</InfoItem>
            </Col>
            <Col xs={8} sm={4} md={6}>
              <InfoItem label="Tuổi">{displayData.age}</InfoItem>
            </Col>

            {/* Row 2: Identifiers */}
            <Col xs={8} sm={4} md={2}>
              <InfoItem label="ID">{selectedPatientDiagnose.id}</InfoItem>
            </Col>
            <Col xs={16} sm={8} md={6}>
              <InfoItem label="PID">{displayData.PID}</InfoItem>
            </Col>
            <Col xs={12} sm={6} md={10}>
              <InfoItem label="SID">{displayData.SID}</InfoItem>
            </Col>
            <Col xs={12} sm={6} md={6}>
              <InfoItem label="CCCD">{displayData.CCCD}</InfoItem>
            </Col>

            {/* Row 3: Status & Contact */}
            <Col xs={12} sm={6} md={4}>
              <div style={{ marginBottom: 6 }}>
                <div style={{ fontSize: '10px', color: '#8c8c8c', textTransform: 'uppercase', letterSpacing: '0.3px', marginBottom: 2 }}>
                  Trạng thái
                </div>
                <Tag
                  color={PATIENT_DIAGNOSE_COLOR[selectedPatientDiagnose.status]}
                  style={{ fontSize: '12px', padding: '1px 6px', fontWeight: 5, margin: 0 }}
                >
                  {PATIENT_DIAGNOSE_STATUS[selectedPatientDiagnose.status]}
                </Tag>
              </div>
            </Col>
            <Col xs={12} sm={6} md={6}>
              <InfoItem label="SĐT">{displayData.phone}</InfoItem>
            </Col>
            <Col xs={14} sm={8} md={10}>
              <InfoItem label="Email">{displayData.email}</InfoItem>
            </Col>
            <Col xs={10} sm={4} md={4}>
              <InfoItem label="Quốc tịch">{displayData.countryCode}</InfoItem>
            </Col>

            {/* Row 4: Timestamps & Indications */}
            <Col xs={12} sm={6} md={6}>
              <InfoItem label="Ngày tạo">
                {dayjs(selectedPatientDiagnose.createdAt).format("HH:mm DD/MM/YYYY")}
              </InfoItem>
            </Col>
            <Col xs={12} sm={6} md={6}>
              <InfoItem label="Cập nhật gần nhất">
                {displayData.updatedAt ? dayjs(displayData.updatedAt).format("HH:mm DD/MM/YYYY") : "-"}
              </InfoItem>
            </Col>
            <Col xs={12} sm={6} md={6}>
              <InfoItem label="Chỉ định">
                {
                  templateServices?.find(
                    (t) => t.id == displayData.id_template_service,
                  )?.name || "-"
                }
              </InfoItem>
            </Col>
            <Col xs={12} sm={6} md={6}>
              <InfoItem label="Bộ phận thăm khám">
                {examParts?.find((t) => t.id == displayData.id_exam_part)?.name || "-"}
              </InfoItem>
            </Col>
          </Row>
        </Card>

        {latestVer3 ? (
          <DoctorUseFormVer3Viewer
            id_doctor_use_formver3={latestVer3.id}
            patientDiagnoise={selectedPatientDiagnose}
          />
        ) : (
          <h2 style={{ textAlign: "center" }}>Chưa có bản ghi nào!</h2>
        )}
      </ConfigProvider>
    </div>
  );
};

export default PatientDiagnoiseDetailPage;
