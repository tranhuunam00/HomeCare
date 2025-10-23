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
import { FilterOutlined, SearchOutlined } from "@ant-design/icons";
import API_CALL from "../../services/axiosClient";
import styles from "./CustomerList.module.scss";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const { Option } = Select;

const CustomerList = () => {
  const navigate = useNavigate();

  // Dữ liệu chính
  const [doctors, setDoctors] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  // Bộ lọc “thật” (dùng khi ấn tìm kiếm)
  const [filters, setFilters] = useState({
    searchName: "",
    clinicFilter: null,
    statusFilter: null,
    advisorFilter: null,
  });

  // Bộ lọc “giả” (người dùng nhập, chưa tìm kiếm)
  const [pendingFilters, setPendingFilters] = useState({
    searchName: "",
    clinicFilter: null,
    statusFilter: null,
    advisorFilter: null,
  });

  // Phân quyền
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedClinics, setSelectedClinics] = useState([]);
  const [permissionModalOpen, setPermissionModalOpen] = useState(false);

  // Lấy tên phòng khám
  const getClinicName = (clinicId) => {
    const found = clinics.find((clinic) => clinic.id == clinicId);
    return found ? found.name : "Không rõ";
  };

  // ======= FETCH DATA =======
  const fetchDoctors = async () => {
    setLoading(true);
    try {
      // Chỉ thêm các filter có giá trị thật sự
      const params = {
        page,
        limit: 10,
      };
      if (filters.searchName) params.full_name = filters.searchName;
      if (filters.clinicFilter != null) params.id_clinic = filters.clinicFilter;
      if (filters.statusFilter != null) params.status = filters.statusFilter;
      if (filters.advisorFilter != null)
        params.is_advisor = filters.advisorFilter;

      const res = await API_CALL.get("/doctor", { params });
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

  // ======= ACTIONS =======
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
      setSelectedClinics(clinicItems);
      setPermissionModalOpen(true);
    } catch (err) {
      toast.error("Không thể lấy danh sách phân quyền hiện tại");
    }
  };

  const closePermissionModal = () => {
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

  const toggleAdvisor = async (doctor) => {
    const newStatus = !doctor.is_advisor;
    const confirmMsg = newStatus
      ? `Bạn có chắc muốn đặt bác sĩ "${doctor.full_name}" làm cố vấn?`
      : `Bạn có chắc muốn hủy trạng thái cố vấn của bác sĩ "${doctor.full_name}"?`;
    if (!window.confirm(confirmMsg)) return;

    try {
      await API_CALL.put(`/doctor/${doctor.id}/advisor`, {
        is_advisor: newStatus,
      });
      toast.success(
        newStatus ? "Đã đặt làm cố vấn" : "Đã hủy trạng thái cố vấn"
      );
      fetchDoctors();
    } catch (err) {
      toast.error("Cập nhật trạng thái cố vấn thất bại");
    }
  };

  // ======= EFFECTS =======
  useEffect(() => {
    fetchClinics();
  }, []);

  useEffect(() => {
    fetchDoctors();
  }, [page, filters]);

  // ======= TABLE COLUMNS =======
  const columns = [
    { title: "ID", dataIndex: "id", key: "id", width: 60, align: "center" },
    { title: "Họ tên", dataIndex: "full_name", key: "full_name" },
    { title: "Số điện thoại", dataIndex: "phone_number", key: "phone_number" },
    { title: "Giới tính", dataIndex: "gender", key: "gender" },
    { title: "Ngày sinh", dataIndex: "dob", key: "dob" },
    {
      title: "Cố vấn",
      dataIndex: "is_advisor",
      key: "is_advisor",
      align: "center",
      render: (val) => (
        <span style={{ color: val ? "blue" : "gray" }}>
          {val ? "Cố vấn" : "—"}
        </span>
      ),
    },
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
        <div style={{ display: "flex", gap: 8 }}>
          <Button onClick={() => navigate(`/home/profile/${record.id}`)}>
            Chỉnh sửa
          </Button>
          <Button
            type={record.is_advisor ? "default" : "primary"}
            danger={record.is_advisor}
            onClick={() => toggleAdvisor(record)}
          >
            {record.is_advisor ? "Hủy cố vấn" : "Làm cố vấn"}
          </Button>
        </div>
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

  // ======= UI =======
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
              <Col span={5}>
                <label>Tên bác sĩ</label>
                <Input
                  value={pendingFilters.searchName}
                  onChange={(e) =>
                    setPendingFilters({
                      ...pendingFilters,
                      searchName: e.target.value,
                    })
                  }
                />
              </Col>

              <Col span={5}>
                <label>Phòng khám</label>
                <Select
                  style={{ width: "100%" }}
                  placeholder="Tất cả"
                  allowClear
                  value={pendingFilters.clinicFilter}
                  onChange={(value) =>
                    setPendingFilters({
                      ...pendingFilters,
                      clinicFilter: value ?? null,
                    })
                  }
                  optionFilterProp="children"
                  showSearch
                >
                  <Option value={null}>Tất cả</Option>
                  {clinics.map((c) => (
                    <Option key={c.id} value={c.id}>
                      {c.name}
                    </Option>
                  ))}
                </Select>
              </Col>

              <Col span={5}>
                <label>Trạng thái cố vấn</label>
                <Select
                  style={{ width: "100%" }}
                  placeholder="Tất cả"
                  allowClear
                  value={pendingFilters.advisorFilter}
                  onChange={(value) =>
                    setPendingFilters({
                      ...pendingFilters,
                      advisorFilter: value === undefined ? null : value,
                    })
                  }
                >
                  <Option value={null}>Tất cả</Option>
                  <Option value={true}>Là cố vấn</Option>
                  <Option value={false}>Không phải cố vấn</Option>
                </Select>
              </Col>

              <Col span={5}>
                <label>Trạng thái hoạt động</label>
                <Select
                  style={{ width: "100%" }}
                  placeholder="Tất cả"
                  allowClear
                  value={pendingFilters.statusFilter}
                  onChange={(value) =>
                    setPendingFilters({
                      ...pendingFilters,
                      statusFilter: value === undefined ? null : value,
                    })
                  }
                >
                  <Option value={null}>Tất cả</Option>
                  <Option value={1}>Hoạt động</Option>
                  <Option value={0}>Ngừng hoạt động</Option>
                </Select>
              </Col>

              <Col
                span={4}
                style={{
                  display: "flex",
                  alignItems: "end",
                  justifyContent: "flex-end",
                }}
              >
                <Button
                  type="primary"
                  icon={<SearchOutlined />}
                  onClick={() => {
                    setPage(1);
                    setFilters({ ...pendingFilters });
                  }}
                >
                  Tìm kiếm
                </Button>
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
          pagination={{
            current: page,
            pageSize: 10,
            total,
            onChange: setPage,
          }}
        />
      </Spin>

      {/* Modal phân quyền */}
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
          onChange={(values) => setSelectedClinics(values)}
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
