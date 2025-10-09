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
} from "@ant-design/icons";
import API_CALL from "../../../services/axiosClient";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import styles from "./packageRequestsList.module.scss";
import { useGlobalAuth } from "../../../contexts/AuthContext";
import { USER_ROLE } from "../../../constant/app";

const { Option } = Select;
const { RangePicker } = DatePicker;

const PACKAGE_STATUSES = ["pending", "approved", "rejected"];
const STATUS_COLORS = {
  pending: "processing", // xanh lam nhạt
  approved: "success", // xanh lá
  rejected: "error", // đỏ
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
  const [total, setTotal] = useState(0);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const cleanParams = Object.fromEntries(
        Object.entries(filters).filter(
          ([, value]) => value !== "" && value !== undefined && value !== null
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

  useEffect(() => {
    fetchRequests();
  }, [filters]);

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
    { title: "Mã gói", dataIndex: "package_code", key: "package_code" },
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
          <Button
            icon={<ReloadOutlined />}
            onClick={() =>
              setFilters({
                id_user: "",
                package_code: "",
                status: "",
                from: "",
                to: "",
                page: 1,
                limit: 10,
              })
            }
          >
            Làm mới
          </Button>
        }
      >
        <Row gutter={16}>
          <Col span={4}>
            <label>ID người dùng</label>
            <Input
              value={filters.id_user}
              onChange={(e) =>
                setFilters({ ...filters, id_user: e.target.value, page: 1 })
              }
              placeholder="Nhập ID user..."
            />
          </Col>
          <Col span={5}>
            <label>Mã gói</label>
            <Input
              value={filters.package_code}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  package_code: e.target.value,
                  page: 1,
                })
              }
              placeholder="Tìm theo mã gói..."
            />
          </Col>
          <Col span={5}>
            <label>Trạng thái</label>
            <Select
              allowClear
              value={filters.status || undefined}
              onChange={(value) =>
                setFilters({ ...filters, status: value, page: 1 })
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
                filters.from && filters.to
                  ? [dayjs(filters.from), dayjs(filters.to)]
                  : []
              }
              onChange={(dates) => {
                if (dates) {
                  setFilters({
                    ...filters,
                    from: dates[0].format("YYYY-MM-DD"),
                    to: dates[1].format("YYYY-MM-DD"),
                    page: 1,
                  });
                } else {
                  setFilters({ ...filters, from: "", to: "", page: 1 });
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
            </div>
          )}
        </Modal>
      </Spin>
    </div>
  );
};

export default PackageRequestsList;
