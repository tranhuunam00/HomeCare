// ... các import giữ nguyên
import React, { useEffect, useState } from "react";
import {
  Table,
  Input,
  Select,
  Row,
  Col,
  Card,
  Button,
  Spin,
  Modal,
} from "antd";
import { FilterOutlined } from "@ant-design/icons";
import API_CALL from "../../services/axiosClient";
import styles from "./CustomerList.module.scss";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const { Option } = Select;

const CustomerList = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchName, setSearchName] = useState("");
  const [clinicFilter, setClinicFilter] = useState();
  const [statusFilter, setStatusFilter] = useState();
  const [clinics, setClinics] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedClinics, setSelectedClinics] = useState([]);
  const [permissionModalOpen, setPermissionModalOpen] = useState(false);
  const navigate = useNavigate();

  console.log(clinics);
  const getClinicName = (clinicId) => {
    const found = clinics.find((clinic) => clinic.id == clinicId);
    return found ? found.name : "Không rõ";
  };

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const res = await API_CALL.get("/doctor", {
        params: {
          full_name: searchName,
          id_clinic: clinicFilter,
          status: statusFilter,
          page,
          limit: 10,
        },
      });
      setDoctors(res.data.data.data);
      setTotal(res.data.data.count);
    } catch (error) {
      toast.error("Lỗi khi lấy danh sách bác sĩ");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClinics = async () => {
    try {
      const res = await API_CALL.get("/clinics", {
        params: { page: 1, limit: 100 },
      });
      setClinics(res.data.data.data);
    } catch (err) {
      toast.error("Lỗi lấy danh sách phòng khám");
    }
  };

  const openPermissionModal = async (doctor) => {
    setSelectedDoctor(doctor);
    try {
      const res = await API_CALL.get(`/doctor/clinics/${doctor.id}`);
      const clinicItems = res.data.data.map((item) => {
        const clinic = clinics.find((c) => c.id == item.id_clinic);
        return {
          label: clinic?.name || `Phòng khám ${item.id_clinic}`,
          value: item.id_clinic,
        };
      });
      setSelectedClinics(clinicItems); // dùng dạng label-value object
      setPermissionModalOpen(true);
    } catch (err) {
      toast.error("Không thể lấy danh sách phân quyền hiện tại");
    }
  };

  const closePermissionModal = () => {
    if (selectedClinics.length > 0) {
      const confirmClose = window.confirm(
        "Bạn đang chỉnh sửa phân quyền. Bạn có chắc chắn muốn thoát không?"
      );
      if (!confirmClose) return;
    }
    setPermissionModalOpen(false);
    setSelectedDoctor(null);
    setSelectedClinics([]);
  };

  const savePermissions = async () => {
    if (!selectedDoctor) return;
    const confirmMessage = `Bạn xác nhận phân quyền cho bác sĩ ${
      selectedDoctor.full_name
    } đọc kết quả các phòng khám sau?\n- ${selectedClinics
      .map((sec) => getClinicName(sec.value))
      .join("\n- ")}`;
    if (!window.confirm(confirmMessage)) return;

    try {
      await API_CALL.post("/doctor/set-clinics", {
        id_doctor: selectedDoctor.id,
        id_clinic_list: selectedClinics.map((sec) => sec.value),
      });
      toast.success("Phân quyền thành công!");
      closePermissionModal();
    } catch (err) {
      toast.error("Phân quyền thất bại");
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, [searchName, clinicFilter, statusFilter, page]);

  useEffect(() => {
    fetchClinics();
  }, []);

  const columns = [
    { title: "ID", dataIndex: "id", key: "id", width: 60, align: "center" },
    { title: "Họ tên", dataIndex: "full_name", key: "full_name" },
    { title: "Số điện thoại", dataIndex: "phone_number", key: "phone_number" },
    { title: "Giới tính", dataIndex: "gender", key: "gender" },
    { title: "Ngày sinh", dataIndex: "dob", key: "dob" },
    {
      title: "Phòng khám",
      key: "id_clinic",
      render: (_, record) => getClinicName(record.id_clinic),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (val) => (
        <span style={{ color: val === 1 ? "green" : "red" }}>
          {val === 1 ? "Hoạt động" : "Ngừng hoạt động"}
        </span>
      ),
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_, record) => (
        <Button onClick={() => navigate(`/home/profile/${record.id}`)}>
          Chỉnh sửa
        </Button>
      ),
    },
    {
      title: "Phân quyền",
      key: "permissions",
      render: (_, record) => (
        <Button onClick={() => openPermissionModal(record)}>Phân quyền</Button>
      ),
    },
  ];

  return (
    <div className={styles.CustomerList}>
      <h2 className={styles.title}>Danh sách bác sĩ</h2>
      <Row gutter={16} className={styles.filterGroup}>
        <Col span={24}>
          <Card
            title={
              <>
                <FilterOutlined /> Bộ lọc tìm kiếm
              </>
            }
            size="small"
          >
            <Row gutter={16}>
              <Col span={6}>
                <label>Tên bác sĩ</label>
                <Input
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                />
              </Col>
              <Col span={6}>
                <label>Phòng khám</label>
                <Input
                  value={clinicFilter}
                  onChange={(e) => setClinicFilter(e.target.value)}
                />
              </Col>
              <Col span={6}>
                <label>Trạng thái</label>
                <Select
                  style={{ width: "100%" }}
                  placeholder="Tất cả"
                  allowClear
                  value={statusFilter}
                  onChange={(value) => setStatusFilter(value)}
                >
                  <Option value={1}>Hoạt động</Option>
                  <Option value={0}>Ngừng hoạt động</Option>
                </Select>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
      <Spin spinning={loading}>
        <Table
          columns={columns}
          dataSource={doctors}
          rowKey="id"
          pagination={{ current: page, pageSize: 10, total, onChange: setPage }}
        />
      </Spin>
      <Modal
        title={`Phân quyền bác sĩ: ${selectedDoctor?.full_name}`}
        open={permissionModalOpen}
        onCancel={closePermissionModal}
        onOk={savePermissions}
        okText="Lưu"
        cancelText="Hủy"
      >
        <p>Chọn phòng khám được phép truy cập:</p>
        <Select
          mode="multiple"
          labelInValue
          style={{ width: "100%" }}
          placeholder="Chọn các phòng khám"
          value={selectedClinics}
          onChange={(values) => {
            setSelectedClinics(values);
          }}
          optionFilterProp="children"
        >
          {clinics.map((clinic) => (
            <Option key={clinic.id} value={clinic.id}>
              {clinic.name}
            </Option>
          ))}
        </Select>
        <div style={{ marginTop: 16 }}>
          <strong>Đã chọn:</strong>
          <ul style={{ paddingLeft: 20 }}>
            {selectedClinics.map((sec) => (
              <li key={sec.value}>{sec.label}</li>
            ))}
          </ul>
        </div>
      </Modal>
    </div>
  );
};

export default CustomerList;
