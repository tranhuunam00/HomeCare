// src/pages/clinics/ClinicList.jsx
import React, { useEffect, useState } from "react";
import {
  Table,
  Input,
  Select,
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

const { Option } = Select;

const USER_STATUS = {
  1: "Chưa xác nhận",
  2: "Đang hoạt động",
  3: "Đã hoàn tiền",
};

const ClinicList = () => {
  const [clinicList, setClinicList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchName, setSearchName] = useState("");
  const [searchPhone, setSearchPhone] = useState("");
  const [statusFilter, setStatusFilter] = useState();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form] = Form.useForm();

  const fetchClinics = async () => {
    setLoading(true);
    try {
      const res = await API_CALL.get("/clinics", {
        params: { page: 1, limit: 100 },
      });
      setClinicList(res.data.data.data);
    } catch (err) {
      toast.error(err?.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchClinicById = async (id) => {
    try {
      const res = await API_CALL.get(`/clinics/${id}`);
      form.setFieldsValue(res.data.data);
    } catch (err) {
      toast.error(err?.response?.data?.message);
      message.error("Không lấy được thông tin cơ sở");
    }
  };

  useEffect(() => {
    fetchClinics();
  }, []);

  const handleSubmit = async (values) => {
    try {
      if (editingId) {
        await API_CALL.put(`/clinics/${editingId}`, values);
        message.success("Cập nhật cơ sở thành công");
      } else {
        await API_CALL.post("/clinics", values);
        message.success("Thêm mới cơ sở thành công");
      }
      fetchClinics();
      setModalVisible(false);
      form.resetFields();
      setEditingId(null);
    } catch (err) {
      toast.error(err?.response?.data?.message);
      console.error("Lỗi xử lý cơ sở:", err);
    }
  };

  const columns = [
    { title: "ID", dataIndex: "id", key: "id", width: 60 },
    { title: "Tên cơ sở", dataIndex: "name", key: "name" },
    { title: "SĐT", dataIndex: "phone_number", key: "phone_number" },
    { title: "Địa chỉ", dataIndex: "address", key: "address" },
    // {
    //   title: "Trạng thái",
    //   dataIndex: "status",
    //   key: "status",
    //   render: (status) => <span>{USER_STATUS[status]}</span>,
    // },
    {
      title: "Hành động",
      key: "actions",
      render: (_, record) => (
        <Button
          icon={<EditOutlined />}
          onClick={() => {
            setEditingId(record.id);
            fetchClinicById(record.id);
            setModalVisible(true);
          }}
        >
          Sửa
        </Button>
      ),
    },
  ];

  const filteredClinics = clinicList
    .filter((item) =>
      item.name?.toLowerCase().includes(searchName.toLowerCase())
    )
    .filter((item) =>
      item.phone_number?.toLowerCase().includes(searchPhone.toLowerCase())
    )
    .filter((item) => (statusFilter ? item.status === statusFilter : true));

  return (
    <div className={styles.clinicList}>
      <div className={styles.clinicList__header}>
        <h2 className={styles.clinicList__title}>Danh sách cơ sở</h2>
        <Button
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
                <label>Tên cơ sở</label>
                <Input
                  placeholder="Nhập tên..."
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                />
              </Col>
              <Col span={6}>
                <label>Số điện thoại</label>
                <Input
                  placeholder="Nhập số điện thoại..."
                  value={searchPhone}
                  onChange={(e) => setSearchPhone(e.target.value)}
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      <Spin spinning={loading}>
        <Table
          dataSource={filteredClinics}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Spin>

      <Modal
        title={editingId ? "Chỉnh sửa cơ sở" : "Thêm cơ sở mới"}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingId(null);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        okText={editingId ? "Cập nhật" : "Thêm"}
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
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
