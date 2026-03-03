// src/pages/clinics/ClinicList.jsx
import React, { useEffect, useState } from "react";
import {
  Table,
  Input,
  Row,
  Col,
  Card,
  Button,
  Modal,
  Spin,
  Form,
  message,
} from "antd";
import { FilterOutlined, PlusOutlined, EditOutlined } from "@ant-design/icons";
import API_CALL from "../../services/axiosClient";
import styles from "./ClinicList.module.scss";
import { toast } from "react-toastify";
import { useGlobalAuth } from "../../contexts/AuthContext";
import { USER_ROLE } from "../../constant/app";

const ClinicList = () => {
  const { user } = useGlobalAuth();

  const [clinicList, setClinicList] = useState([]);
  const [filteredClinics, setFilteredClinics] = useState([]);
  const [loading, setLoading] = useState(false);

  const [searchName, setSearchName] = useState("");
  const [searchPhone, setSearchPhone] = useState("");

  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20, // 👈 Mặc định 20
  });

  const [form] = Form.useForm();

  // ================= FETCH LIST =================
  const fetchClinics = async () => {
    setLoading(true);
    try {
      const params =
        user.id_role !== USER_ROLE.ADMIN
          ? { page: 1, limit: 1000, id_user: user.id }
          : { page: 1, limit: 1000 };

      const res = await API_CALL.get("/clinics", { params });

      const data = res?.data?.data?.data || [];
      setClinicList(data);
      setFilteredClinics(data);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Lỗi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  // ================= FETCH DETAIL =================
  const fetchClinicById = async (id) => {
    try {
      const res = await API_CALL.get(`/clinics/${id}`);
      form.setFieldsValue(res.data.data);
    } catch (err) {
      message.error("Không lấy được thông tin cơ sở");
    }
  };

  useEffect(() => {
    fetchClinics();
  }, []);

  // ================= FILTER =================
  useEffect(() => {
    const filtered = clinicList
      .filter((item) =>
        item.name?.toLowerCase().includes(searchName.toLowerCase()),
      )
      .filter((item) =>
        item.phone_number?.toLowerCase().includes(searchPhone.toLowerCase()),
      );

    setFilteredClinics(filtered);
  }, [searchName, searchPhone, clinicList]);

  // ================= SUBMIT =================
  const handleSubmit = async (values) => {
    try {
      if (editingId) {
        await API_CALL.patch(`/clinics/${editingId}`, values);
        toast.success("Cập nhật thành công");
      } else {
        await API_CALL.post("/clinics", values);
        toast.success("Thêm mới thành công");
      }

      fetchClinics();
      closeModal();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingId(null);
    form.resetFields();
  };

  // ================= TABLE COLUMNS =================
  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      width: 80,
      align: "center",
    },
    {
      title: "Tên cơ sở",
      dataIndex: "name",
    },
    {
      title: "SĐT",
      dataIndex: "phone_number",
    },
    {
      title: "Địa chỉ",
      dataIndex: "address",
    },
    {
      title: "Hành động",
      render: (_, record) => {
        const canEdit =
          user?.id_role === USER_ROLE.ADMIN || user?.id === record.id_user;

        if (!canEdit) return null;

        return (
          <Button
            icon={<EditOutlined />}
            onClick={() => {
              setEditingId(record.id);
              fetchClinicById(record.id);
              setModalVisible(true);
            }}
          >
            Chỉnh sửa
          </Button>
        );
      },
    },
  ];

  return (
    <div className={styles.clinicList}>
      {/* HEADER */}
      <div className={styles.clinicList__header}>
        <h2>Danh sách phòng khám</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingId(null);
            form.resetFields();
            setModalVisible(true);
          }}
        >
          Thêm mới
        </Button>
      </div>

      {/* FILTER */}
      <Row gutter={16}>
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
                <Input
                  placeholder="Tìm theo tên..."
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                />
              </Col>
              <Col span={6}>
                <Input
                  placeholder="Tìm theo SĐT..."
                  value={searchPhone}
                  onChange={(e) => setSearchPhone(e.target.value)}
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* TABLE */}
      <Spin spinning={loading}>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={filteredClinics}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: filteredClinics.length,
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "50", "100"],
            onChange: (page, pageSize) => {
              setPagination({
                current: page,
                pageSize: pageSize,
              });
            },
          }}
        />
      </Spin>

      {/* MODAL */}
      <Modal
        title={editingId ? "Chỉnh sửa cơ sở" : "Thêm cơ sở mới"}
        open={modalVisible}
        onCancel={closeModal}
        onOk={() => form.submit()}
        okText={editingId ? "Cập nhật" : "Thêm"}
      >
        <Form layout="vertical" form={form} onFinish={handleSubmit}>
          <Form.Item name="name" label="Tên cơ sở" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item name="phone_number" label="Số điện thoại">
            <Input />
          </Form.Item>

          <Form.Item name="address" label="Địa chỉ">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ClinicList;
