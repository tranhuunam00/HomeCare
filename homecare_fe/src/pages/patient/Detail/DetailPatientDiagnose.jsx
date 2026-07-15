import React, { useEffect } from "react";
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
} from "antd";
import dayjs from "dayjs";
import useVietnamAddress from "../../../hooks/useVietnamAddress";
import API_CALL from "../../../services/axiosClient";
import {
  PATIENT_DIAGNOSE_COLOR,
  PATIENT_DIAGNOSE_STATUS,
  USER_ROLE,
} from "../../../constant/app";
import PatientTablePage from "../PatientDiagnoseList";
import StatusButtonPatientDiagnose from "../../../components/Status2ButtonPatientDiagnose";
import { useGlobalAuth } from "../../../contexts/AuthContext";
import GroupProcessPatientDiagnoiseFormVer2 from "../../../components/GroupProcessPatientDiagnoiseFormVer2";
import {
  EditOutlined,
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
  const {
    examParts,
    templateServices,
    selectedPatientDiagnose,
    setSelectedPatientDiagnose,
    languageTranslate,
  } = useGlobalAuth();

  const { record: latestVer3 } = useLatestDoctorUseFormVer3(
    selectedPatientDiagnose?.id,
    languageTranslate,
  );

  useEffect(() => {
    setDoctorUseFormVer3Id(latestVer3?.id);
  }, latestVer3);

  const { provinces, setSelectedProvince } = useVietnamAddress();

  // Set tỉnh/huyện/xã dựa trên data
  useEffect(() => {
    if (selectedPatientDiagnose && provinces.length > 0) {
      setSelectedProvince(selectedPatientDiagnose.province_code);
    }
  }, [selectedPatientDiagnose, provinces]);

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
              <Button
                size="small"
                type="text"
                style={{ color: "red" }}
                onClick={() => setSelectedPatientDiagnose(null)}
              >
                X
              </Button>
            </Space>
          }
        >
          <Row gutter={[24, 12]} style={{ padding: "4px 2px" }}>
            {/* Row 1: Demographics */}
            <Col span={8}>
              <InfoItem label="Họ và tên">{displayData.name}</InfoItem>
            </Col>
            <Col span={4}>
              <InfoItem label="Giới tính">{displayData.gender}</InfoItem>
            </Col>
            <Col span={6}>
              <InfoItem label="Năm sinh">{displayData.birth_year}</InfoItem>
            </Col>
            <Col span={6}>
              <InfoItem label="Tuổi">{displayData.age}</InfoItem>
            </Col>



            {/* Row 2: Identifiers */}
            <Col span={2}>
              <InfoItem label="ID">{selectedPatientDiagnose.id}</InfoItem>
            </Col>
            <Col span={6}>
              <InfoItem label="PID">{displayData.PID}</InfoItem>
            </Col>
            <Col span={10}>
              <InfoItem label="SID">{displayData.SID}</InfoItem>
            </Col>
            <Col span={6}>
              <InfoItem label="CCCD">{displayData.CCCD}</InfoItem>
            </Col>

            {/* Row 3: Status & Contact */}
            <Col span={4}>
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
            <Col span={6}>
              <InfoItem label="SĐT">{displayData.phone}</InfoItem>
            </Col>
            <Col span={10}>
              <InfoItem label="Email">{displayData.email}</InfoItem>
            </Col>
            <Col span={4}>
              <InfoItem label="Quốc tịch">{displayData.countryCode}</InfoItem>
            </Col>

            {/* Row 4: Timestamps & Indications */}
            <Col span={6}>
              <InfoItem label="Ngày tạo">
                {dayjs(selectedPatientDiagnose.createdAt).format("HH:mm DD/MM/YYYY")}
              </InfoItem>
            </Col>
            <Col span={6}>
              <InfoItem label="Cập nhật gần nhất">
                {displayData.updatedAt ? dayjs(displayData.updatedAt).format("HH:mm DD/MM/YYYY") : "-"}
              </InfoItem>
            </Col>
            <Col span={6}>
              <InfoItem label="Chỉ định">
                {
                  templateServices?.find(
                    (t) => t.id == displayData.id_template_service,
                  )?.name || "-"
                }
              </InfoItem>
            </Col>
            <Col span={6}>
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
