import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, Row, Col, Typography, Spin, Tag, Button } from "antd";
import dayjs from "dayjs";
import useVietnamAddress from "../../../hooks/useVietnamAddress";
import API_CALL from "../../../services/axiosClient"; // dùng để call /clinics
import {
  PATIENT_DIAGNOSE_COLOR,
  PATIENT_DIAGNOSE_STATUS,
} from "../../../constant/app";
import PatientTablePage from "../PatientDiagnoseList";

const { Title, Text } = Typography;

const PatientDiagnoiseDetailPage = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [clinics, setClinics] = useState([]);
  const [clinicName, setClinicName] = useState("");

  const {
    provinces,
    districts,
    wards,
    setSelectedProvince,
    setSelectedDistrict,
  } = useVietnamAddress();

  console.log("districts", districts);
  const fakeData = {
    id: 1,
    name: "Nguyễn Văn A",
    pid: "123456",
    sid: "SID001",
    indication: "MRI não",
    gender: "Nam",
    dob: "1990-05-15",
    age: 34,
    phone: "0901234567",
    email: "a@gmail.com",
    cccd: "012345678901",
    country: "Việt Nam",
    detail: "Căn hộ A101",
    province_code: "2",
    district_code: "26",
    ward_code: "724",
    status: 3,
    createdAt: "2024-06-01T10:00:00Z",
    updatedAt: "2024-06-10T16:30:00Z",
    deletedAt: null,
    id_clinic: 2,
    createdBy: 2,
  };

  // Load dữ liệu bệnh nhân
  useEffect(() => {
    setData(fakeData);
  }, []);

  // Load danh sách phòng khám
  useEffect(() => {
    const fetchClinics = async () => {
      try {
        const res = await API_CALL.get("/clinics", {
          params: { page: 1, limit: 100 },
        });
        setClinics(res.data.data.data || []);
      } catch (err) {
        console.error("Không thể tải danh sách phòng khám", err);
      }
    };
    fetchClinics();
  }, []);

  useEffect(() => {
    const fetchClinics = async () => {
      try {
        const res = await API_CALL.get("/clinics", {
          params: { page: 1, limit: 100 },
        });
        const list = res.data.data.data;
        setClinics(list);

        // tìm tên phòng khám theo id
        if (data) {
          const found = list.find((c) => c.id === data.id_clinic);
          setClinicName(found?.name || "Không xác định");
        }
      } catch (err) {
        console.error("Không thể tải phòng khám", err);
      }
    };

    fetchClinics();
  }, [data]);

  // Sau khi có clinics và data thì tìm tên phòng khám
  useEffect(() => {
    if (data && clinics.length > 0) {
      const found = clinics.find((c) => c.id === data.id_clinic);
      setClinicName(found?.name || "Không xác định");
    }
  }, [data, clinics]);

  useEffect(() => {
    if (data && provinces.length > 0) {
      setSelectedProvince(data.province_code);
    }
  }, [data, provinces]);

  useEffect(() => {
    if (data && districts.length > 0) {
      setSelectedDistrict(data.district_code);
    }
  }, [data, districts]);

  const getNameByCode = (list, code) => {
    const item = list.find((x) => x.code === code);
    return item ? item.name : "Không rõ";
  };

  if (!data) return <Spin />;

  return (
    <div style={{ padding: "2rem" }}>
      <Card title="Thông tin chi tiết bệnh nhân" bordered>
        <Row gutter={24}>
          <Col span={6}>
            <Title level={5}>Họ và tên:</Title>
            <Text>{data.name}</Text>
          </Col>
          <Col span={2}>
            <Title level={5}>Giới tính:</Title>
            <Text>{data.gender}</Text>
          </Col>
          <Col span={2}>
            <Title level={5}>Ngày sinh:</Title>
            <Text>{dayjs(data.dob).format("DD/MM/YYYY")}</Text>
          </Col>
          <Col span={2}>
            <Title level={5}>Tuổi:</Title>
            <Text>{data.age}</Text>
          </Col>
          <Col span={2}>
            <Title level={5}>PID:</Title>
            <Text>{data.pid}</Text>
          </Col>
          <Col span={2}>
            <Title level={5}>SID:</Title>
            <Text>{data.sid}</Text>
          </Col>
          <Col span={3}>
            <Title level={5}>CCCD:</Title>
            <Text>{data.cccd}</Text>
          </Col>
        </Row>

        <Row gutter={24} style={{ marginTop: 16 }}>
          <Col span={3}>
            <Title level={5}>Trạng thái:</Title>
            <Tag color={PATIENT_DIAGNOSE_COLOR[data.status]}>
              {PATIENT_DIAGNOSE_STATUS[data.status]}
            </Tag>
          </Col>
          <Col span={8}>
            <Title level={5}>Chỉ định:</Title>
            <Text>{data.indication}</Text>
          </Col>
          <Col span={8}>
            <Title level={5}>Phòng khám:</Title>
            <Text>{clinicName}</Text>
          </Col>
        </Row>

        <Row gutter={24} style={{ marginTop: 16 }}>
          <Col span={2}>
            <Title level={5}>SĐT:</Title>
            <Text>{data.phone}</Text>
          </Col>
          <Col span={5}>
            <Title level={5}>Email:</Title>
            <Text>{data.email}</Text>
          </Col>
          <Col span={8}>
            <Title level={5}>Quốc tịch:</Title>
            <Text>{data.country}</Text>
          </Col>
        </Row>

        <Row gutter={24} style={{ marginTop: 16 }}>
          <Col span={3}>
            <Title level={5}>Phường/Xã:</Title>
            <Text>{wards.find((p) => p.code == data.ward_code)?.name}</Text>
          </Col>
          <Col span={3}>
            <Title level={5}>Quận/Huyện:</Title>
            <Text>
              {districts.find((p) => p.code == data.district_code)?.name}
            </Text>
          </Col>
          <Col span={3}>
            <Title level={5}>Tỉnh/Thành phố:</Title>
            <Text>
              {provinces.find((p) => p.code == data.province_code)?.name}
            </Text>
          </Col>
          <Col span={8}>
            <Title level={5}>Địa chỉ chi tiết:</Title>
            <Text>{data.detail}</Text>
          </Col>
        </Row>

        <Row gutter={24} style={{ marginTop: 16 }}>
          <Col span={12}>
            <Title level={5}>Ngày tạo:</Title>
            <Text>{dayjs(data.createdAt).format("HH:mm DD/MM/YYYY")}</Text>
          </Col>
          <Col span={12}>
            <Title level={5}>Cập nhật gần nhất:</Title>
            <Text>{dayjs(data.updatedAt).format("HH:mm DD/MM/YYYY")}</Text>
          </Col>
        </Row>
        <Row gutter={24} style={{ marginTop: 40 }}>
          <h2>Hành động</h2>
        </Row>
        <Row gutter={24} style={{ marginTop: 16 }}>
          <Col span={4}>
            <Button type="primary">Đọc kết quả</Button>
          </Col>
          <Col span={5}>
            <Button type="dashed" danger>
              Xác nhận kết quả
            </Button>
          </Col>
          <Col span={3}>
            <Button type="default">In kết quả</Button>
          </Col>
        </Row>
        <Row gutter={24} style={{ marginTop: 40 }}>
          <h2>Lịch sử</h2>
        </Row>

        <PatientTablePage isNotCreate={true} />
      </Card>
    </div>
  );
};

export default PatientDiagnoiseDetailPage;
