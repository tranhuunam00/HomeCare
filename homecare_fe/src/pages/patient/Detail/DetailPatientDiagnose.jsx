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
          <Row gutter={24}>
            <Col span={8}>
              <Title level={5}>Họ và tên:</Title>
              <Text>{displayData.name}</Text>
            </Col>
            <Col span={6}>
              <Title level={5}>Giới tính:</Title>
              <Text>{displayData.gender}</Text>
            </Col>
            <Col span={6}>
              <Title level={5}>Năm sinh:</Title>
              <Text>{displayData.birth_year}</Text>
            </Col>
            <Col span={4}>
              <Title level={5}>Tuổi:</Title>
              <Text>{displayData.age}</Text>
            </Col>
          </Row>

          <Divider />

          <Row gutter={24}>
            <Col span={2}>
              <Title level={5}>ID</Title>
              <Text>{selectedPatientDiagnose.id}</Text>
            </Col>
            <Col span={5}>
              <Title level={5}>PID:</Title>
              <Text>{displayData.PID}</Text>
            </Col>
            <Col span={12}>
              <Title level={5}>SID:</Title>
              <Text>{displayData.SID}</Text>
            </Col>
            <Col span={5}>
              <Title level={5}>CCCD:</Title>
              <Text>{displayData.CCCD}</Text>
            </Col>
          </Row>

          <Row gutter={24} style={{ marginTop: 6 }}>
            <Col span={12}>
              <Title level={5}>Trạng thái:</Title>
              <Tag
                color={PATIENT_DIAGNOSE_COLOR[selectedPatientDiagnose.status]}
              >
                {PATIENT_DIAGNOSE_STATUS[selectedPatientDiagnose.status]}
              </Tag>
            </Col>
          </Row>

          <Row gutter={24} style={{ marginTop: 6 }}>
            <Col span={6}>
              <Title level={5}>SĐT:</Title>
              <Text>{displayData.phone}</Text>
            </Col>
            <Col span={12}>
              <Title level={5}>Email:</Title>
              <Text>{displayData.email}</Text>
            </Col>
            <Col span={6}>
              <Title level={5}>Quốc tịch:</Title>
              <Text>{displayData.countryCode}</Text>
            </Col>
          </Row>

          <Row gutter={24} style={{ marginTop: 6 }}>
            <Col span={12}>
              <Title level={5}>Ngày tạo:</Title>
              <Text>
                {dayjs(selectedPatientDiagnose.createdAt).format(
                  "HH:mm DD/MM/YYYY",
                )}
              </Text>
            </Col>
            <Col span={12}>
              <Title level={5}>Cập nhật gần nhất:</Title>
              <Text>
                {dayjs(displayData.updatedAt).format("HH:mm DD/MM/YYYY")}
              </Text>
            </Col>
          </Row>

          <Divider />
          <Row gutter={24} style={{ marginTop: 6 }}>
            <Col span={12}>
              <Title level={5}>Chỉ định:</Title>
              <Text>
                {
                  templateServices?.find(
                    (t) => t.id == displayData.id_template_service,
                  )?.name
                }
              </Text>
            </Col>
            <Col span={10}>
              <Title level={5}>Bộ phận thăm khám:</Title>
              <Text>
                {examParts?.find((t) => t.id == displayData.id_exam_part)?.name}
              </Text>
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
