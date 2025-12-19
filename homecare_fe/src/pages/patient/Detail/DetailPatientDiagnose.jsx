import React, { useEffect, useState } from "react";
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
} from "antd";
import dayjs from "dayjs";
import useVietnamAddress from "../../../hooks/useVietnamAddress";
import API_CALL from "../../../services/axiosClient";
import {
  PATIENT_DIAGNOSE_COLOR,
  PATIENT_DIAGNOSE_STATUS,
} from "../../../constant/app";
import PatientTablePage from "../PatientDiagnoseList";
import StatusButtonPatientDiagnose from "../../../components/Status2ButtonPatientDiagnose";
import { useGlobalAuth } from "../../../contexts/AuthContext";
import GroupProcessPatientDiagnoiseFormVer2 from "../../../components/GroupProcessPatientDiagnoiseFormVer2";

const { Title, Text } = Typography;

const calculateAge = (dob) => {
  if (!dob) return "";
  const today = dayjs();
  const birthDate = dayjs(dob);
  return today.diff(birthDate, "year");
};

const PatientDiagnoiseDetailPage = ({ idFromList }) => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [clinics, setClinics] = useState([]);
  const [clinicName, setClinicName] = useState("");
  const navigate = useNavigate();
  const { user, doctor, examParts, templateServices } = useGlobalAuth();
  const [idEdit, setIdEdit] = useState();

  useEffect(() => {
    setIdEdit(idFromList || id);
  }, [id, idFromList]);

  const { provinces, wards, setSelectedProvince } = useVietnamAddress();

  // Lấy dữ liệu bệnh nhân theo ID
  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await API_CALL.get(`/patient-diagnose/${idEdit}`);
        setData(res.data.data);
      } catch (err) {
        console.error("Không thể lấy dữ liệu bệnh nhân:", err);
      }
    };
    if (idEdit) fetchDetail();
  }, [idEdit]);

  // Lấy danh sách phòng khám và gán tên
  useEffect(() => {
    const fetchClinics = async () => {
      try {
        const res = await API_CALL.get("/clinics", {
          params: { page: 1, limit: 100 },
        });
        const list = res.data.data.data;
        setClinics(list);
        if (data) {
          const found = list.find((c) => c.id == data.id_clinic);
          setClinicName(found?.name || "Không xác định");
        }
      } catch (err) {
        console.error("Không thể tải danh sách phòng khám", err);
      }
    };
    fetchClinics();
  }, [data]);

  // Set tỉnh/huyện/xã dựa trên data
  useEffect(() => {
    if (data && provinces.length > 0) {
      setSelectedProvince(data.province_code);
    }
  }, [data, provinces]);

  if (!data) return <Spin />;

  return (
    <div style={{ padding: "2rem" }}>
      <ConfigProvider
        theme={{
          token: {
            fontSize: 12,
            fontSizeHeading5: 12,
            padding: 0,
          },
        }}
      >
        <Card title="WORK SPACE" bordered>
          <Row gutter={24}>
            <Col span={8}>
              <Title level={5}>Họ và tên:</Title>
              <Text>{data.name}</Text>
            </Col>
            <Col span={6}>
              <Title level={5}>Giới tính:</Title>
              <Text>{data.gender}</Text>
            </Col>
            <Col span={6}>
              <Title level={5}>Ngày sinh:</Title>
              <Text>{dayjs(data.dob).format("DD/MM/YYYY")}</Text>
            </Col>
            <Col span={4}>
              <Title level={5}>Tuổi:</Title>
              <Text>{calculateAge(data.dob)}</Text>
            </Col>
          </Row>

          <Divider />

          <Row gutter={24}>
            <Col span={6}>
              <Title level={5}>PID:</Title>
              <Text>{data.PID}</Text>
            </Col>
            <Col span={12}>
              <Title level={5}>SID:</Title>
              <Text>{data.SID}</Text>
            </Col>
            <Col span={6}>
              <Title level={5}>CCCD:</Title>
              <Text>{data.CCCD}</Text>
            </Col>
          </Row>

          <Row gutter={24} style={{ marginTop: 6 }}>
            <Col span={12}>
              <Title level={5}>Trạng thái:</Title>
              <Tag color={PATIENT_DIAGNOSE_COLOR[data.status]}>
                {PATIENT_DIAGNOSE_STATUS[data.status]}
              </Tag>
            </Col>
            <Col span={12}>
              <Title level={5}>Phòng khám:</Title>
              <Text>{clinicName}</Text>
            </Col>
          </Row>

          <Row gutter={24} style={{ marginTop: 6 }}>
            <Col span={6}>
              <Title level={5}>SĐT:</Title>
              <Text>{data.phoneNumber}</Text>
            </Col>
            <Col span={12}>
              <Title level={5}>Email:</Title>
              <Text>{data.email}</Text>
            </Col>
            <Col span={6}>
              <Title level={5}>Quốc tịch:</Title>
              <Text>{data.countryCode}</Text>
            </Col>
          </Row>

          {/* <Row gutter={24} style={{ marginTop: 6 }}>
          <Col span={12}>
            <Title level={5}>Phường/Xã:</Title>
            <Text>{getNameByCode(wards, data.ward_code)}</Text>
          </Col>

          <Col span={12}>
            <Title level={5}>Tỉnh/Thành phố:</Title>
            <Text>{getNameByCode(provinces, data.province_code)}</Text>
          </Col>
        </Row> */}

          {/* <Row gutter={24} style={{ marginTop: 6 }}>
          <Col span={24}>
            <Title level={5}>Địa chỉ chi tiết:</Title>
            <Text>{data.address}</Text>
          </Col>
        </Row> */}
          <Row gutter={24} style={{ marginTop: 6 }}>
            <Col span={12}>
              <Title level={5}>Ngày tạo:</Title>
              <Text>{dayjs(data.createdAt).format("HH:mm DD/MM/YYYY")}</Text>
            </Col>
            <Col span={12}>
              <Title level={5}>Cập nhật gần nhất:</Title>
              <Text>{dayjs(data.updatedAt).format("HH:mm DD/MM/YYYY")}</Text>
            </Col>
          </Row>

          {/* <Row gutter={24} style={{ marginTop: 40 }}>
          <h2>Hành động</h2>
        </Row>
        <StatusButtonPatientDiagnose id={data.id} status={data.status} /> */}
          {/* <Row gutter={24} style={{ marginTop: 40 }}>
          <h2>Hành động</h2>
        </Row> */}
          <Divider />
          <Row gutter={24} style={{ marginTop: 6 }}>
            <Col span={12}>
              <Title level={5}>Chỉ định:</Title>
              <Text>
                {
                  templateServices?.find(
                    (t) => t.id == data.id_template_service
                  )?.name
                }
              </Text>
            </Col>
            <Col span={10}>
              <Title level={5}>Bộ phận thăm khám:</Title>
              <Text>
                {examParts?.find((t) => t.id == data.id_exam_part)?.name}
              </Text>
            </Col>
          </Row>
          <GroupProcessPatientDiagnoiseFormVer2 patientDiagnose={data} />

          {/* <Row gutter={24} style={{ marginTop: 40 }}>
          <h2>Lịch sử</h2>
        </Row>
        <Row gutter={24} style={{ marginTop: 40 }}>
          <h3>
            Người tạo:
            <p style={{ color: "cadetblue" }}>
              {data?.createdBy_user?.doctors[0]?.full_name}
            </p>
          </h3>
        </Row> */}
          {/* <PatientTablePage isNotCreate={true} PID={data.PID} /> */}
        </Card>
      </ConfigProvider>
    </div>
  );
};

export default PatientDiagnoiseDetailPage;
