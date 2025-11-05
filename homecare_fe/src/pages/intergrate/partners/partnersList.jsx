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
  ApiOutlined,
  CopyOutlined,
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
  const [intergration, setIntergration] = useState([]);

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

  const [testModalVisible, setTestModalVisible] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testForm] = Form.useForm();

  // 🔹 Modal tạo mới Partner
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form] = Form.useForm();

  // 🔹 Modal tạo token tích hợp
  const [tokenModalVisible, setTokenModalVisible] = useState(false);
  const [generatedToken, setGeneratedToken] = useState(null);
  const [tokenLoading, setTokenLoading] = useState(false);
  const [selectedPartnerForToken, setSelectedPartnerForToken] = useState(null);

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
      const intergrationRes = await API_CALL.get("/partners/intergrate", {});

      setPartners(res.data.data || res.data);
      setIntergration(intergrationRes.data.data || intergrationRes.data);

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
      await API_CALL.post("/partners", values);
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

  // 🧩 Tạo token tích hợp
  const handleGenerateIntegrationToken = async (partner) => {
    setSelectedPartnerForToken(partner);
    setGeneratedToken(null);
    setTokenModalVisible(true);
    setTokenLoading(true);

    try {
      const res = await API_CALL.post("/partners/generate-token-3rd", {
        partner_id: partner.id,
      });
      setGeneratedToken(res.data.data || res.data);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Không thể tạo token");
    } finally {
      setTokenLoading(false);
    }
  };

  const handleCopyToken = (token) => {
    navigator.clipboard.writeText(token);
    toast.success("Đã sao chép token vào clipboard");
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
      title: "Tích hợp",
      key: "integration_status",
      render: (_, record) => {
        const integrated = intergration.some(
          (item) => item.partner_id === record.id && item.is_active === true
        );

        return integrated ? (
          <Tag color="green">Đã tích hợp</Tag>
        ) : (
          <Tag color="default">Chưa tích hợp</Tag>
        );
      },
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
    {
      title: "Hành động",
      key: "actions",
      render: (_, record) => {
        const integrated = intergration.some(
          (item) => item.partner_id === record.id && item.is_active === true
        );

        return (
          <div style={{ display: "flex", gap: 8 }}>
            {/* Nút chi tiết */}

            {/* Nút tạo token: ai cũng thấy, nhưng disable nếu đã tích hợp */}
            <Button
              size="small"
              icon={<ApiOutlined />}
              disabled={integrated}
              onClick={() => handleGenerateIntegrationToken(record)}
            >
              {integrated ? "Đã tích hợp" : "Tạo token"}
            </Button>

            {/* Admin mới được chỉnh trạng thái */}
            {user.id_role === USER_ROLE.ADMIN && (
              <Button
                size="small"
                onClick={() => {
                  setSelectedPartner(record);
                  setDetailModalVisible(true);
                }}
              >
                Chi tiết
              </Button>
            )}
          </div>
        );
      },
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

            {user.id_role === USER_ROLE.ADMIN && (
              <>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => setCreateModalVisible(true)}
                  style={{ marginRight: 8 }}
                >
                  Tạo mới
                </Button>

                <Button
                  icon={<ApiOutlined />}
                  onClick={() => setTestModalVisible(true)}
                >
                  Test Connected
                </Button>
              </>
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

        {/* 🧩 Modal hiển thị token tích hợp */}
        <Modal
          open={tokenModalVisible}
          title={`Token tích hợp cho đối tác ${
            selectedPartnerForToken?.name || ""
          }`}
          onCancel={() => setTokenModalVisible(false)}
          footer={[
            <Button key="close" onClick={() => setTokenModalVisible(false)}>
              Đóng
            </Button>,
          ]}
        >
          {tokenLoading ? (
            <Spin />
          ) : generatedToken ? (
            <div style={{ wordBreak: "break-all" }}>
              <p>
                <strong>Token:</strong>{" "}
              </p>
              <Card
                size="small"
                style={{ background: "#f5f5f5", marginBottom: 8 }}
              >
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <code style={{ wordBreak: "break-all" }}>
                    {generatedToken.token}
                  </code>
                  <Button
                    size="small"
                    type="text"
                    icon={<CopyOutlined />}
                    onClick={() => handleCopyToken(generatedToken.token)}
                  >
                    Copy
                  </Button>
                </div>
              </Card>
              <p>
                <strong>Hết hạn:</strong>{" "}
                {dayjs(generatedToken.expired_at).format("DD/MM/YYYY HH:mm")}
              </p>
            </div>
          ) : (
            <p>Không thể tạo token</p>
          )}
        </Modal>

        {/* Modal tạo mới Partner (giữ nguyên như bạn có) */}
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
        <Modal
          open={testModalVisible}
          title="Kiểm tra kết nối đối tác"
          onCancel={() => setTestModalVisible(false)}
          onOk={async () => {
            try {
              const values = await testForm.validateFields();
              setTesting(true);
              const res = await API_CALL.post(
                "/partners/verify-token-3rd",
                values
              );
              toast.success(res?.data?.message || "Kết nối thành công!");
              setTestModalVisible(false);
              testForm.resetFields();
            } catch (err) {
              if (err?.errorFields) return;
              toast.error(err?.response?.data?.message || "Kết nối thất bại!");
            } finally {
              setTesting(false);
            }
          }}
          confirmLoading={testing}
          okText="Kiểm tra"
          cancelText="Đóng"
        >
          <Form layout="vertical" form={testForm}>
            <Form.Item
              label="Token tích hợp"
              name="token"
              rules={[{ required: true, message: "Vui lòng nhập token" }]}
            >
              <Input placeholder="Nhập token..." />
            </Form.Item>

            <Form.Item
              label="Mã code đối tác (code_3rd)"
              name="code_3rd"
              rules={[{ required: true, message: "Vui lòng nhập mã code" }]}
            >
              <Input placeholder="Nhập mã code..." />
            </Form.Item>
          </Form>
        </Modal>
      </Spin>
    </div>
  );
};

export default PartnerList;
