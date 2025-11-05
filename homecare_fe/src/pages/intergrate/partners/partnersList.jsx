import React, { useEffect, useState } from "react";
import {
  Table,
  Input,
  Select,
  Row,
  Col,
  Card,
  Button,
  Tag,
  Modal,
  Form,
  Spin,
} from "antd";
import {
  FilterOutlined,
  ReloadOutlined,
  SearchOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import styles from "./partnersList.module.scss";
import { useGlobalAuth } from "../../../contexts/AuthContext";
import { USER_ROLE } from "../../../constant/app";
import API_CALL from "../../../services/axiosClient";

const { Option } = Select;

const STATUS_COLORS = {
  active: "success",
  inactive: "error",
};

const STATUS_ICONS = {
  active: <CheckCircleOutlined />,
  inactive: <CloseCircleOutlined />,
};

const PartnerList = () => {
  const { user } = useGlobalAuth();

  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    name: "",
    status: "",
    page: 1,
    limit: 10,
  });
  const [uiFilters, setUiFilters] = useState(filters);
  const [total, setTotal] = useState(0);

  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState(null);

  // 🔹 Modal tạo mới
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form] = Form.useForm();

  // 🧠 Fetch list
  const fetchPartners = async () => {
    setLoading(true);
    try {
      const cleanParams = Object.fromEntries(
        Object.entries(filters).filter(
          ([, v]) => v !== "" && v !== undefined && v !== null
        )
      );
      const res = await API_CALL.get("/partners", { params: cleanParams });
      setPartners(res.data.data || res.data);
      setTotal(res.data.total || res.data.data?.length || 0);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Lỗi tải danh sách đối tác");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, [filters.page, filters.limit, filters.name, filters.status]);

  // 🔍 Filter
  const handleSearch = () => {
    setFilters({
      ...filters,
      name: uiFilters.name,
      status: uiFilters.status,
      page: 1,
    });
  };

  const handleReset = () => {
    setUiFilters({ name: "", status: "" });
    setFilters({ name: "", status: "", page: 1, limit: filters.limit });
  };

  // 🔄 Update status
  const handleStatusUpdate = async (id, newStatus, currentStatus) => {
    if (newStatus === currentStatus) return;
    const confirmChange = window.confirm(
      `Bạn có chắc chắn muốn chuyển trạng thái từ "${currentStatus}" sang "${newStatus}" không?`
    );
    if (!confirmChange) return;

    try {
      await API_CALL.patch(`/partner/${id}/status`, { status: newStatus });
      toast.success("Cập nhật trạng thái thành công");
      fetchPartners();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Cập nhật thất bại");
    }
  };

  // 🆕 Tạo mới đối tác
  const handleCreatePartner = async () => {
    try {
      const values = await form.validateFields();
      setCreating(true);
      const res = await API_CALL.post("/partners", values);
      toast.success("Tạo mới đối tác thành công");
      setCreateModalVisible(false);
      form.resetFields();
      fetchPartners();
    } catch (err) {
      if (err?.errorFields) return; // validation fail
      toast.error(err?.response?.data?.message || "Tạo đối tác thất bại");
    } finally {
      setCreating(false);
    }
  };

  // 📋 Table columns
  const columns = [
    { title: "ID", dataIndex: "id", key: "id", width: 80 },
    {
      title: "Tên đối tác",
      dataIndex: "name",
      key: "name",
      render: (val) => <strong>{val}</strong>,
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      render: (text) => text || "—",
    },
    {
      title: "API URL",
      dataIndex: "api_base_url",
      key: "api_base_url",
      render: (val) =>
        val ? (
          <a href={val} target="_blank" rel="noopener noreferrer">
            {val}
          </a>
        ) : (
          "—"
        ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={STATUS_COLORS[status]} icon={STATUS_ICONS[status]}>
          {status}
        </Tag>
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (val) => dayjs(val).format("DD/MM/YYYY HH:mm"),
    },
    user.id_role === USER_ROLE.ADMIN && {
      title: "Hành động",
      key: "actions",
      render: (_, record) => (
        <div style={{ display: "flex", gap: 8 }}>
          <Button
            size="small"
            onClick={() => {
              setSelectedPartner(record);
              setDetailModalVisible(true);
            }}
          >
            Chi tiết
          </Button>

          {user.id_role === USER_ROLE.ADMIN && (
            <Select
              size="small"
              value={record.status}
              style={{ width: 120 }}
              onChange={(value) =>
                handleStatusUpdate(record.id, value, record.status)
              }
            >
              <Option value="active">active</Option>
              <Option value="inactive">inactive</Option>
            </Select>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className={styles.partnerList}>
      <h2 className={styles.partnerList__title}>Quản lý đối tác tích hợp</h2>

      {/* Bộ lọc */}
      <Card
        size="small"
        title={
          <>
            <FilterOutlined /> Bộ lọc tìm kiếm
          </>
        }
        className={styles.filterCard}
        extra={
          <>
            <Button
              icon={<ReloadOutlined />}
              onClick={handleReset}
              style={{ marginRight: 8 }}
            >
              Làm mới
            </Button>
            <Button
              type="primary"
              icon={<SearchOutlined />}
              onClick={handleSearch}
              style={{ marginRight: 8 }}
            >
              Tìm kiếm
            </Button>

            {/* 🆕 Nút Tạo mới (chỉ admin) */}
            {user.id_role === USER_ROLE.ADMIN && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setCreateModalVisible(true)}
              >
                Tạo mới
              </Button>
            )}
          </>
        }
      >
        <Row gutter={16}>
          <Col span={8}>
            <label>Tên đối tác</label>
            <Input
              value={uiFilters.name}
              onChange={(e) =>
                setUiFilters({ ...uiFilters, name: e.target.value })
              }
              placeholder="Nhập tên đối tác..."
            />
          </Col>
          <Col span={8}>
            <label>Trạng thái</label>
            <Select
              allowClear
              value={uiFilters.status || undefined}
              onChange={(value) =>
                setUiFilters({ ...uiFilters, status: value })
              }
              placeholder="Chọn trạng thái"
              style={{ width: "100%" }}
            >
              <Option value="active">active</Option>
              <Option value="inactive">inactive</Option>
            </Select>
          </Col>
        </Row>
      </Card>

      {/* Bảng danh sách */}
      <Spin spinning={loading}>
        <Table
          dataSource={partners}
          columns={columns}
          rowKey="id"
          pagination={{
            current: filters.page,
            pageSize: filters.limit,
            total: total,
            onChange: (page, pageSize) =>
              setFilters({ ...filters, page, limit: pageSize }),
          }}
        />

        {/* Modal chi tiết */}
        <Modal
          open={detailModalVisible}
          title="Chi tiết đối tác"
          onCancel={() => {
            setDetailModalVisible(false);
            setSelectedPartner(null);
          }}
          footer={null}
        >
          {selectedPartner && (
            <div style={{ lineHeight: 1.8 }}>
              <p>
                <strong>ID:</strong> {selectedPartner.id}
              </p>
              <p>
                <strong>Tên đối tác:</strong> {selectedPartner.name}
              </p>
              <p>
                <strong>Mô tả:</strong>{" "}
                {selectedPartner.description || "Không có"}
              </p>
              <p>
                <strong>API URL:</strong>{" "}
                {selectedPartner.api_base_url ? (
                  <a
                    href={selectedPartner.api_base_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {selectedPartner.api_base_url}
                  </a>
                ) : (
                  "—"
                )}
              </p>
              <p>
                <strong>Trạng thái:</strong>{" "}
                <Tag
                  color={STATUS_COLORS[selectedPartner.status]}
                  icon={STATUS_ICONS[selectedPartner.status]}
                >
                  {selectedPartner.status}
                </Tag>
              </p>
              <p>
                <strong>Ngày tạo:</strong>{" "}
                {dayjs(selectedPartner.createdAt).format("DD/MM/YYYY HH:mm")}
              </p>
              <p>
                <strong>Cập nhật gần nhất:</strong>{" "}
                {dayjs(selectedPartner.updatedAt).format("DD/MM/YYYY HH:mm")}
              </p>
            </div>
          )}
        </Modal>

        {/* 🆕 Modal tạo mới Partner */}
        <Modal
          open={createModalVisible}
          title="Tạo mới đối tác"
          onCancel={() => setCreateModalVisible(false)}
          onOk={handleCreatePartner}
          confirmLoading={creating}
          okText="Tạo mới"
          cancelText="Hủy"
        >
          <Form layout="vertical" form={form}>
            <Form.Item
              label="Tên đối tác"
              name="name"
              rules={[{ required: true, message: "Tên đối tác là bắt buộc" }]}
            >
              <Input placeholder="Nhập tên đối tác..." />
            </Form.Item>

            <Form.Item label="Mô tả" name="description">
              <Input.TextArea rows={3} placeholder="Mô tả ngắn..." />
            </Form.Item>

            <Form.Item label="API Base URL" name="apiBaseUrl">
              <Input placeholder="https://example.com/api" />
            </Form.Item>

            <Form.Item label="Trạng thái" name="status" initialValue="active">
              <Select>
                <Option value="active">active</Option>
                <Option value="inactive">inactive</Option>
              </Select>
            </Form.Item>
          </Form>
        </Modal>
      </Spin>
    </div>
  );
};

export default PartnerList;
