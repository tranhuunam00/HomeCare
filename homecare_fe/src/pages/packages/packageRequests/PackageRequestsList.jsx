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
  DatePicker,
  Spin,
} from "antd";
import {
  FilterOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import API_CALL from "../../../services/axiosClient";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import styles from "./packageRequestsList.module.scss";
import { useGlobalAuth } from "../../../contexts/AuthContext";
import { USER_ROLE } from "../../../constant/app";

const { Option } = Select;
const { RangePicker } = DatePicker;

const PACKAGE_CODES = ["BASIC", "PRO", "HOSPITAL"];
const PACKAGE_STATUSES = ["pending", "approved", "rejected"];
const STATUS_COLORS = {
  pending: "processing",
  approved: "success",
  rejected: "error",
};
const STATUS_ICONS = {
  pending: <ClockCircleOutlined />,
  approved: <CheckCircleOutlined />,
  rejected: <CloseCircleOutlined />,
};

const PackageRequestsList = () => {
  const { user } = useGlobalAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    id_user: "",
    package_code: "",
    status: "",
    from: "",
    to: "",
    page: 1,
    limit: 10,
  });
  const [uiFilters, setUiFilters] = useState(filters);
  const [total, setTotal] = useState(0);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const cleanParams = Object.fromEntries(
        Object.entries(filters).filter(
          ([, v]) => v !== "" && v !== undefined && v !== null
        )
      );
      const res = await API_CALL.get("/package/request-package", {
        params: cleanParams,
      });
      setRequests(res.data.data.data || res.data.data);
      setTotal(res.data.data.total || res.data.total);
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Lỗi tải danh sách yêu cầu gói"
      );
    } finally {
      setLoading(false);
    }
  };

  // Chỉ gọi API khi filters thay đổi (ko tự động khi UI gõ)
  useEffect(() => {
    fetchRequests();
  }, [
    filters.page,
    filters.limit,
    filters.id_user,
    filters.package_code,
    filters.status,
    filters.from,
    filters.to,
  ]);

  const handleSearch = () => {
    setFilters((prev) => ({
      ...prev,
      id_user: uiFilters.id_user,
      package_code: uiFilters.package_code,
      status: uiFilters.status,
      from: uiFilters.from,
      to: uiFilters.to,
      page: 1,
    }));
  };

  const handleStatusUpdate = async (id, newStatus, currentStatus) => {
    if (newStatus === currentStatus) return;
    const confirmChange = window.confirm(
      `Bạn có chắc chắn muốn chuyển trạng thái từ "${currentStatus}" sang "${newStatus}" không?`
    );
    if (!confirmChange) return;

    try {
      await API_CALL.patch(`/package/requests/${id}/status`, {
        status: newStatus,
      });
      toast.success("Cập nhật trạng thái thành công");
      fetchRequests();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Cập nhật thất bại");
    }
  };

  const columns = [
    { title: "ID", dataIndex: "id", key: "id", width: 60 },
    {
      title: "Người dùng",
      key: "user_info",
      render: (_, record) => {
        const u = record.id_user_user;
        const doctor = u?.doctors?.[0];
        return (
          <>
            <strong>{doctor?.full_name || "—"}</strong>
            <br />
            <small>{u?.email}</small>
          </>
        );
      },
    },
    {
      title: "Các gói đang dùng",
      key: "current_packages",
      render: (_, record) => {
        const packages = record.id_user_user?.user_packages || [];
        if (!packages.length) return "—";

        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                style={{
                  borderBottom: "1px dashed #ddd",
                  paddingBottom: 4,
                  marginBottom: 4,
                }}
              >
                <strong>{pkg.package_code}</strong>{" "}
                <Tag
                  color={
                    pkg.status === "active"
                      ? "green"
                      : pkg.status === "expired"
                      ? "red"
                      : "blue"
                  }
                >
                  {pkg.status}
                </Tag>
                <br />
                <small>
                  Hết hạn: {dayjs(pkg.end_date).format("DD/MM/YYYY HH:mm")}
                </small>
              </div>
            ))}
          </div>
        );
      },
    },

    { title: "Mã gói", dataIndex: "package_code", key: "package_code" },
    {
      title: "Dùng thử",
      dataIndex: "is_trial",
      key: "is_trial",
      align: "center",
      render: (val) =>
        val ? <Tag color="blue">Có</Tag> : <Tag color="default">Không</Tag>,
    },

    {
      title: "Thời hạn (tháng)",
      dataIndex: "duration_months",
      key: "duration_months",
      align: "center",
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
      render: (_, record) => (
        <div style={{ display: "flex", gap: 8 }}>
          <Button
            size="small"
            onClick={() => {
              setSelectedRequest(record);
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
              {PACKAGE_STATUSES.map((status) => (
                <Option key={status} value={status}>
                  {status}
                </Option>
              ))}
            </Select>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className={styles.packageRequests}>
      <h2 className={styles.packageRequests__title}>
        Quản lý yêu cầu đăng ký gói
      </h2>

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
              onClick={() => {
                setUiFilters({
                  id_user: "",
                  package_code: "",
                  status: "",
                  from: "",
                  to: "",
                });
                setFilters({
                  id_user: "",
                  package_code: "",
                  status: "",
                  from: "",
                  to: "",
                  page: 1,
                  limit: filters.limit,
                });
              }}
              style={{ marginRight: 8 }}
            >
              Làm mới
            </Button>
            <Button
              type="primary"
              icon={<SearchOutlined />}
              onClick={handleSearch}
            >
              Tìm kiếm
            </Button>
          </>
        }
      >
        <Row gutter={16}>
          <Col span={4}>
            <label>ID người dùng</label>
            <Input
              value={uiFilters.id_user}
              onChange={(e) =>
                setUiFilters({ ...uiFilters, id_user: e.target.value })
              }
              placeholder="Nhập ID user..."
            />
          </Col>
          <Col span={5}>
            <label>Mã gói</label>
            <Select
              allowClear
              value={uiFilters.package_code || undefined}
              onChange={(value) =>
                setUiFilters({ ...uiFilters, package_code: value })
              }
              placeholder="Chọn mã gói"
              style={{ width: "100%" }}
            >
              {PACKAGE_CODES.map((pkg) => (
                <Option key={pkg} value={pkg}>
                  {pkg}
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={5}>
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
              {PACKAGE_STATUSES.map((status) => (
                <Option key={status} value={status}>
                  {status}
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={10}>
            <label>Khoảng ngày tạo</label>
            <RangePicker
              value={
                uiFilters.from && uiFilters.to
                  ? [dayjs(uiFilters.from), dayjs(uiFilters.to)]
                  : []
              }
              onChange={(dates) => {
                if (dates) {
                  setUiFilters({
                    ...uiFilters,
                    from: dates[0].format("YYYY-MM-DD"),
                    to: dates[1].format("YYYY-MM-DD"),
                  });
                } else {
                  setUiFilters({ ...uiFilters, from: "", to: "" });
                }
              }}
              style={{ width: "100%" }}
            />
          </Col>
        </Row>
      </Card>

      <Spin spinning={loading}>
        <Table
          dataSource={requests}
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

        <Modal
          open={detailModalVisible}
          title="Chi tiết yêu cầu đăng ký gói"
          onCancel={() => {
            setDetailModalVisible(false);
            setSelectedRequest(null);
          }}
          footer={null}
        >
          {selectedRequest && (
            <div style={{ lineHeight: 1.8 }}>
              <p>
                <strong>ID yêu cầu:</strong> {selectedRequest.id}
              </p>
              <p>
                <strong>Người dùng:</strong>{" "}
                {selectedRequest.id_user_user?.doctors?.[0]?.full_name || "—"}
              </p>
              <p>
                <strong>Email:</strong>{" "}
                {selectedRequest.id_user_user?.email || "—"}
              </p>
              <p>
                <strong>Mã gói:</strong> {selectedRequest.package_code}
              </p>
              <p>
                <strong>Thời hạn:</strong> {selectedRequest.duration_months}{" "}
                tháng
              </p>
              <p>
                <strong>Trạng thái:</strong>{" "}
                <Tag
                  color={STATUS_COLORS[selectedRequest.status]}
                  icon={STATUS_ICONS[selectedRequest.status]}
                >
                  {selectedRequest.status}
                </Tag>
              </p>
              <p>
                <strong>Ngày tạo:</strong>{" "}
                {dayjs(selectedRequest.createdAt).format("DD/MM/YYYY HH:mm")}
              </p>
              {selectedRequest.id_user_user?.user_packages?.length > 0 && (
                <>
                  <h4 style={{ marginTop: 16 }}>
                    Danh sách gói của người dùng
                  </h4>
                  {selectedRequest.id_user_user.user_packages.map((pkg) => (
                    <Card
                      key={pkg.id}
                      size="small"
                      style={{ marginBottom: 10, background: "#fafafa" }}
                    >
                      <p>
                        <strong>Tên gói:</strong> {pkg.package_code}
                      </p>
                      <p>
                        <strong>Trạng thái:</strong>{" "}
                        <Tag
                          color={
                            pkg.status === "active"
                              ? "green"
                              : pkg.status === "expired"
                              ? "red"
                              : "blue"
                          }
                        >
                          {pkg.status}
                        </Tag>
                      </p>
                      <p>
                        <strong>Ngày bắt đầu:</strong>{" "}
                        {dayjs(pkg.start_date).format("DD/MM/YYYY HH:mm")}
                      </p>
                      <p>
                        <strong>Ngày hết hạn:</strong>{" "}
                        {dayjs(pkg.end_date).format("DD/MM/YYYY HH:mm")}
                      </p>
                      {pkg.note && (
                        <p>
                          <strong>Ghi chú:</strong> {pkg.note}
                        </p>
                      )}
                    </Card>
                  ))}
                </>
              )}
            </div>
          )}
        </Modal>
      </Spin>
    </div>
  );
};

export default PackageRequestsList;
