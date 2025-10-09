import React, { useEffect, useMemo, useState } from "react";
import {
  Table,
  Input,
  Select,
  Row,
  Col,
  Card,
  Button,
  Tag,
  Spin,
  Tooltip,
} from "antd";
import {
  FilterOutlined,
  ReloadOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import API_CALL from "../../../services/axiosClient";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import styles from "./userPackagesList.module.scss";

const { Option } = Select;

const STATUS_COLORS = {
  active: "green",
  expired: "red",
};

const EXPIRE_IN_OPTIONS = [
  { label: "3 ngày tới", value: "3" },
  { label: "7 ngày tới", value: "7" },
  { label: "30 ngày tới", value: "30" },
];

const UserPackagesList = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  const [filters, setFilters] = useState({
    package_code: "",
    status: "", // active | expired
    expire_in: "", // 3 | 7 | 30
    page: 1,
    limit: 10,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const cleanParams = Object.fromEntries(
        Object.entries(filters).filter(
          ([, v]) => v !== "" && v !== undefined && v !== null
        )
      );
      const res = await API_CALL.get("/package/user-package", {
        params: cleanParams,
      });
      // chấp nhận cả 2 format {data:{data, total}} hoặc {data, total}
      const payload = res?.data?.data || res?.data;
      setRows(payload?.data || []);
      setTotal(payload?.total || 0);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Lỗi tải danh sách gói");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, [filters]);

  // Tự tính daysRemaining ở FE nếu BE chưa trả về
  const enhancedRows = useMemo(() => {
    return (rows || []).map((r) => {
      const end = r.end_date ? dayjs(r.end_date) : null;
      const now = dayjs();
      const daysRemaining =
        end && end.isValid() ? Math.ceil(end.diff(now, "day", true)) : null;

      // Suy ra status nếu BE chưa trả
      let status = r.status;
      if (!status && end) {
        status = end.isBefore(now) ? "expired" : "active";
      }

      return { ...r, _daysRemaining: daysRemaining, _statusFE: status };
    });
  }, [rows]);

  const columns = [
    { title: "ID", dataIndex: "id", key: "id", width: 70 },
    {
      title: "Mã gói",
      dataIndex: "package_code",
      key: "package_code",
      render: (val) => <strong>{val}</strong>,
    },
    {
      title: "Bắt đầu",
      dataIndex: "start_date",
      key: "start_date",
      render: (val) => (val ? dayjs(val).format("DD/MM/YYYY") : "-"),
    },
    {
      title: "Hết hạn",
      dataIndex: "end_date",
      key: "end_date",
      render: (val, record) => {
        const soon =
          typeof record._daysRemaining === "number" &&
          record._daysRemaining >= 0 &&
          record._daysRemaining <= 7;
        return (
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span>{val ? dayjs(val).format("DD/MM/YYYY") : "-"}</span>
            {soon && (
              <Tooltip title="Sắp hết hạn trong 7 ngày">
                <ExclamationCircleOutlined style={{ color: "#faad14" }} />
              </Tooltip>
            )}
          </div>
        );
      },
    },
    {
      title: "Còn lại (ngày)",
      key: "_daysRemaining",
      dataIndex: "_daysRemaining",
      align: "center",
      render: (val) =>
        typeof val === "number" ? val >= 0 ? val : 0 : <span>-</span>,
    },
    {
      title: "Trạng thái",
      key: "_statusFE",
      dataIndex: "_statusFE",
      render: (status) => (
        <Tag color={STATUS_COLORS[status] || "default"}>{status || "-"}</Tag>
      ),
    },
  ];

  return (
    <div className={styles.userPackages}>
      <h2 className={styles.userPackages__title}>Các gói của bạn</h2>

      <Card
        size="small"
        className={styles.filterCard}
        title={
          <>
            <FilterOutlined /> Bộ lọc
          </>
        }
        extra={
          <Button
            icon={<ReloadOutlined />}
            onClick={() =>
              setFilters({
                package_code: "",
                status: "",
                expire_in: "",
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
          <Col xs={24} sm={12} md={8} lg={6}>
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
              placeholder="VD: PKG_PRO..."
            />
          </Col>

          <Col xs={24} sm={12} md={8} lg={6}>
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
              <Option value="active">active</Option>
              <Option value="expired">expired</Option>
            </Select>
          </Col>

          <Col xs={24} sm={12} md={8} lg={6}>
            <label>Sắp hết hạn</label>
            <Select
              allowClear
              value={filters.expire_in || undefined}
              onChange={(value) =>
                setFilters({ ...filters, expire_in: value, page: 1 })
              }
              placeholder="3 / 7 / 30 ngày tới"
              style={{ width: "100%" }}
            >
              {EXPIRE_IN_OPTIONS.map((o) => (
                <Option key={o.value} value={o.value}>
                  {o.label}
                </Option>
              ))}
            </Select>
          </Col>
        </Row>
      </Card>

      <Spin spinning={loading}>
        <Table
          dataSource={enhancedRows}
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
      </Spin>
    </div>
  );
};

export default UserPackagesList;
