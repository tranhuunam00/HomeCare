import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
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
  getAge,
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
import FormVer3GroupProcessPatientDiagnoise from "../../formver3/FormVer3GroupProcessPatientDiagnoise";
import DoctorUseFormVer3Viewer from "../../formver3/components/DoctorUseFormVer3Viewer";
import useLatestDoctorUseFormVer3 from "../../formver3/useLatestDoctorUseFormVer3";

const { Title, Text } = Typography;

const calculateAge = (dob) => {
  if (!dob) return "";
  const today = dayjs();
  const birthDate = dayjs(dob);
  return today.diff(birthDate, "year");
};

const PatientDiagnoiseDetailPage = ({
  idFromList,
  onStatusChange,
  onClose,
}) => {
  const { id } = useParams();
  const location = useLocation();
  const chosenRecord = location.state?.record;
  const [data, setData] = useState(null);
  const [clinics, setClinics] = useState([]);
  const [clinicName, setClinicName] = useState("");

  const navigate = useNavigate();
  const { user, doctor, examParts, templateServices, clinicsAll } =
    useGlobalAuth();
  const [idEdit, setIdEdit] = useState();

  const [page, setPage] = useState(1);
  const [sameCCCDData, setSameCCCDData] = useState([]);

  const { useBreakpoint } = Grid;
  const screens = useBreakpoint();
  const deviceIsMobile = !screens.md;

  const { record: latestVer3, loading: loadingVer3 } =
    useLatestDoctorUseFormVer3(data?.id);

  const allColumns = useMemo(
    () => [
      {
        title: "STT",
        key: "STT",
        align: "right", // ✅ CĂN BÊN PHẢI
        width: 20,
        render: (_, __, index) => (page - 1) * 10 + index + 1,
      },
      {
        title: "ID",
        dataIndex: "id",
        key: "id",
        fixed: "left",
        width: 20,
        align: "center",
        sorter: true,
      },

      {
        title: "Trạng thái",
        dataIndex: "status",
        key: "status",
        width: 40,
        render: (status) => (
          <Tag style={{ width: 80 }} color={PATIENT_DIAGNOSE_COLOR[status]}>
            {PATIENT_DIAGNOSE_STATUS[status]}
          </Tag>
        ),
        sorter: true,
      },
      {
        title: "Họ tên",
        dataIndex: "name",
        key: "name",
        width: 40,

        sorter: true,
        render: (text, record) => {
          const nameUpdated =
            record.sono_results?.[0]?.benh_nhan_ho_ten ||
            record.doctor_use_form_ver2s?.[0]?.benh_nhan_ho_ten;
          const displayName = nameUpdated || text;
          return displayName ? displayName.toUpperCase() : "-";
        },
      },

      {
        title: "Tuổi",
        dataIndex: "dob",
        key: "dob",
        width: 30,
        align: "right", // ✅ CĂN BÊN PHẢI

        render: (val, record) => {
          const ageUpdated = record.sono_results?.[0]?.benh_nhan_tuoi;
          if (ageUpdated !== undefined && ageUpdated !== null) {
            return <span>{ageUpdated}</span>;
          }
          return val ? getAge(val) : "-";
        },
      },
      {
        title: "Giới tính",
        dataIndex: "gender",
        key: "gender",
        width: 30,
        render: (text, record) => {
          const genderUpdated = record.sono_results?.[0]?.benh_nhan_gioi_tinh;
          return genderUpdated || text || "-";
        },
      },
      {
        title: "Lâm sàng",
        dataIndex: "Indication",
        key: "Indication",
        width: 40,
        render: (text, record) => {
          const clinicalUpdated = record.sono_results?.[0]?.benh_nhan_lam_sang;
          const displayValue = clinicalUpdated || text;

          const limit = 20;
          const isOverLimit = displayValue?.length > limit;
          const truncatedText = isOverLimit
            ? `${displayValue.substring(0, limit)}...`
            : displayValue;
          return <div>{truncatedText || "-"}</div>;
        },
      },
    ],
    [user, clinicsAll, examParts, templateServices, page],
  );

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

  useEffect(() => {
    if (chosenRecord) fetchPatientsByChosen();
  }, [chosenRecord]);

  const fetchPatientsByChosen = async () => {
    try {
      if (!chosenRecord?.CCCD && !chosenRecord?.PID) {
        setSameCCCDData([]);
        return;
      }
      const res = chosenRecord?.CCCD
        ? await API_CALL.get("/patient-diagnose", {
            params: {
              CCCD: chosenRecord?.CCCD,
              page: 1,
              limit: 10,
            },
          })
        : await API_CALL.get("/patient-diagnose", {
            params: {
              PID: chosenRecord?.PID,
              page: 1,
              limit: 10,
            },
          });
      const responseData = res.data.data;
      setSameCCCDData(responseData?.rows || []);
    } catch (err) {
      console.error("Lỗi lấy danh sách:", err);
    }
  };

  if (!data) return <Spin />;
  // console.log("data", data);

  // Lấy bản ghi siêu âm đầu tiên nếu có
  const sono = data?.sono_results?.[0];
  const doctorUseFormVer2 = data?.doctor_use_form_ver2s?.[0];

  const displayData = {
    name: (
      sono?.benh_nhan_ho_ten ||
      doctorUseFormVer2?.benh_nhan_ho_ten ||
      data?.name ||
      ""
    )?.toUpperCase(),
    gender:
      sono?.benh_nhan_gioi_tinh ||
      doctorUseFormVer2?.benh_nhan_gioi_tinh ||
      data?.gender ||
      "-",
    age:
      sono?.benh_nhan_tuoi ||
      doctorUseFormVer2?.benh_nhan_tuoi ||
      calculateAge(data?.dob) ||
      "-",
    phone:
      sono?.benh_nhan_dien_thoai ||
      doctorUseFormVer2?.benh_nhan_dien_thoai ||
      data?.phoneNumber ||
      "-",
    address: sono?.benh_nhan_dia_chi_so_nha || data?.address || "-",
    clinical:
      sono?.benh_nhan_lam_sang ||
      doctorUseFormVer2?.benh_nhan_lam_sang ||
      data?.Indication ||
      "-",
    id_exam_part:
      sono?.id_exam_part ||
      doctorUseFormVer2?.id_exam_part ||
      data?.id_exam_part,
    PID:
      sono?.benh_nhan_pid ||
      doctorUseFormVer2?.benh_nhan_pid ||
      data?.PID ||
      "-",
    SID:
      sono?.benh_nhan_sid ||
      doctorUseFormVer2?.benh_nhan_sid ||
      data?.SID ||
      "-",
    CCCD:
      sono?.benh_nhan_cccd ||
      doctorUseFormVer2?.benh_nhan_cccd ||
      data?.CCCD ||
      "-",
    email:
      sono?.benh_nhan_email ||
      doctorUseFormVer2?.benh_nhan_email ||
      data?.email ||
      "-",
    countryCode:
      sono?.benh_nhan_quoc_tich ||
      doctorUseFormVer2?.benh_nhan_quoc_tich ||
      data?.countryCode ||
      "-",
    id_template_service:
      sono?.id_template_service ||
      doctorUseFormVer2?.id_template_service ||
      data?.id_template_service,
  };

  return (
    <div style={{}}>
      <FormVer3GroupProcessPatientDiagnoise
        patientDiagnose={data}
        setPatientDiagnose={setData}
        onStatusChange={onStatusChange}
      />
      <div style={{ display: deviceIsMobile ? "block" : "none" }}>
        <Space align="center" style={{ marginBottom: 8 }}>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(`/home/`)}
            style={{ display: "flex", alignItems: "center" }}
          />

          <Typography.Text strong style={{ color: "#cf1322", fontSize: 14 }}>
            Các ca có cùng CCCD hoặc PID ({sameCCCDData.length})
          </Typography.Text>
        </Space>
        <ConfigProvider
          theme={{
            components: {
              Table: {
                fontSize: 11,
                cellPaddingBlock: 0,
              },
            },
          }}
        >
          <Table
            rowKey="id"
            size="small"
            columns={allColumns}
            dataSource={sameCCCDData || []}
            bordered
            pagination={false}
            scroll={{ x: 1200 }}
            style={{ marginTop: 8 }}
            onRow={(record) => ({
              onClick: () => {
                navigate(`/home/patients-diagnose/${record.id}`, {
                  state: { record },
                });
              },
              style: { cursor: "pointer", background: "#fafafa" },
            })}
          />
        </ConfigProvider>
      </div>

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
            <Button
              size="small"
              type="text"
              style={{ color: "red" }}
              onClick={onClose}
            >
              X
            </Button>
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
              <Title level={5}>Ngày sinh:</Title>
              <Text>{dayjs(data.dob).format("DD/MM/YYYY")}</Text>
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
              <Text>{data.id}</Text>
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
              <Text>{dayjs(data.createdAt).format("HH:mm DD/MM/YYYY")}</Text>
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

          {/* <GroupProcessPatientDiagnoiseFormVer2
            patientDiagnose={data}
            setPatientDiagnose={setData}
            onStatusChange={onStatusChange}
          /> */}
        </Card>

        {latestVer3 && (
          <DoctorUseFormVer3Viewer id_doctor_use_formver3={latestVer3.id} />
        )}
      </ConfigProvider>
    </div>
  );
};

export default PatientDiagnoiseDetailPage;
