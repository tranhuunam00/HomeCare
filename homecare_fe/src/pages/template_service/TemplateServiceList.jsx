import React, { useEffect, useState } from "react";
import { Table, Input, Row, Col, Card, Spin, Button } from "antd";
import {
  EditOutlined,
  FilterOutlined,
  CopyOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { toast } from "react-toastify";
import styles from "./TemplateList.module.scss";
import API_CALL from "../../services/axiosClient";
import TemplateServiceModal from "./TemplateServiceModal";

const TemplateServiceList = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchName, setSearchName] = useState("");

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editRecord, setEditRecord] = useState(null);

  const openCreateModal = () => {
    setIsEdit(false);
    setEditRecord(null);
    setModalOpen(true);
  };

  const openEditModal = (record) => {
    setIsEdit(true);
    setEditRecord(record);
    setModalOpen(true);
  };

  const handleSubmit = async (formData) => {
    try {
      if (isEdit) {
        await API_CALL.patch(`/ts/${editRecord.id}`, formData);
        toast.success("Cập nhật thành công");
      } else {
        await API_CALL.post(`/ts`, formData);
        toast.success("Tạo mới thành công");
      }
      fetchServices();
      setModalOpen(false);
    } catch (err) {
      toast.error("Lỗi xử lý dữ liệu");
      console.error(err);
    }
  };

  const fetchServices = async () => {
    setLoading(true);
    try {
      const res = await API_CALL.get("/ts", {
        params: {
          name: searchName,
          page,
          limit: 10,
        },
      });

      const responseData = res.data.data;
      setServices(responseData?.data || []);
      setTotal(responseData?.total || 0);
    } catch (err) {
      console.error("Lỗi lấy danh sách dịch vụ:", err);
      toast.error(err?.response?.data?.message || "Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [page, searchName]);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Bạn có chắc chắn muốn xóa dịch vụ này?"
    );
    if (!confirmDelete) return;

    try {
      await API_CALL.del(`/template-service/${id}`);
      toast.success("Đã xóa thành công");
      fetchServices();
    } catch (err) {
      toast.error("Xóa thất bại");
      console.error(err);
    }
  };

  const handleClone = async (record) => {
    const confirmClone = window.confirm("Bạn có muốn clone mẫu dịch vụ này?");
    if (!confirmClone) return;

    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const payload = {
        ...record,
        id: undefined,
        name: `${record.name} - Copy ${timestamp}`,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      await API_CALL.post("/template-service", payload);
      toast.success("Đã clone thành công");
      fetchServices();
    } catch (err) {
      toast.error("Clone thất bại");
      console.error(err);
    }
  };

  const columns = [
    { title: "ID", dataIndex: "id", key: "id" },
    { title: "Tên", dataIndex: "name", key: "name" },
    { title: "Tên rút gọn", dataIndex: "short_name", key: "short_name" },
    { title: "Mã code", dataIndex: "code", key: "code" },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <>
          <Button
            icon={<EditOutlined />}
            type="link"
            onClick={() => openEditModal(record)}
          >
            Chỉnh sửa
          </Button>
        </>
      ),
    },
  ];

  return (
    <div className={styles.TemplateList}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <h2 className={styles.title}>Danh sách mẫu dịch vụ</h2>
        </Col>
        <Col>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={openCreateModal}
          >
            Tạo mới
          </Button>
        </Col>
      </Row>

      <Row gutter={16} className={styles.filterGroup}>
        <Col span={6}>
          <Card
            size="small"
            title={
              <>
                <FilterOutlined /> Bộ lọc
              </>
            }
          >
            <Input
              placeholder="Tìm theo tên..."
              value={searchName}
              onChange={(e) => {
                setPage(1);
                setSearchName(e.target.value);
              }}
              allowClear
              style={{ marginBottom: 8 }}
            />
          </Card>
        </Col>
      </Row>

      <Spin spinning={loading}>
        <Table
          rowKey="id"
          dataSource={services}
          columns={columns}
          pagination={{
            current: page,
            pageSize: 10,
            total,
            showSizeChanger: false,
            onChange: (p) => setPage(p),
          }}
        />
      </Spin>

      <TemplateServiceModal
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        initialValues={editRecord}
        isEdit={isEdit}
      />
    </div>
  );
};

export default TemplateServiceList;
