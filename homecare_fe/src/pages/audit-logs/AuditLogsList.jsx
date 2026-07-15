import React, { useState, useEffect } from "react";
import {
  Table,
  Card,
  Select,
  DatePicker,
  Button,
  Space,
  Tag,
  Tooltip,
  Modal,
  Badge,
  Input,
} from "antd";
import {
  HistoryOutlined,
  SearchOutlined,
  ReloadOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import API_CALL from "../../services/axiosClient";
import { useGlobalAuth } from "../../contexts/AuthContext";
import { USER_ROLE } from "../../constant/app";

const { RangePicker } = DatePicker;

const ACTION_COLORS = {
  CREATE: "green",
  UPDATE: "blue",
  DELETE: "red",
  STATUS_CHANGE: "purple",
  LOGIN: "orange",
  LOGOUT: "gray",
};

const ENTITY_LABELS = {
  patient_diagnose: "Ca bệnh",
  doctor: "Bác sĩ",
  clinic: "Phòng khám",
  doctor_use_form_ver2: "Form v2",
  doctor_use_form_ver3: "Form v3",
  print_template: "Mẫu in kết quả",
  package: "Gói dịch vụ",
};

const AuditLogsList = () => {
  const { user } = useGlobalAuth();
  const isAdmin = user?.id_role === USER_ROLE.ADMIN;

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Filters state
  const [entity, setEntity] = useState(undefined);
  const [action, setAction] = useState(undefined);
  const [entityId, setEntityId] = useState("");
  const [searchUserId, setSearchUserId] = useState(undefined);
  const [searchClinicId, setSearchClinicId] = useState(undefined);
  const [dateRange, setDateRange] = useState([]);

  // Meta data for dropdowns
  const [usersList, setUsersList] = useState([]);
  const [clinicsList, setClinicsList] = useState([]);

  // Detail Modal
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  // Fetch users & clinics for filter dropdowns (Admin only)
  useEffect(() => {
    if (isAdmin) {
      // Fetch users
      API_CALL.get("/users?limit=100")
        .then((res) => {
          setUsersList(res.data?.data?.data || []);
        })
        .catch(console.error);

      // Fetch clinics
      API_CALL.get("/clinics?limit=100")
        .then((res) => {
          setClinicsList(res.data?.data?.data || res.data?.data?.rows || res.data?.data || []);
        })
        .catch(console.error);
    }
  }, [isAdmin]);

  const fetchLogs = async (currentPage = page, size = pageSize) => {
    setLoading(true);
    try {
      const params = {
        limit: size,
        offset: (currentPage - 1) * size,
      };

      if (entity) params.entity = entity;
      if (action) params.action = action;
      if (entityId) params.entity_id = entityId;
      if (searchUserId) params.user_id = searchUserId;
      if (searchClinicId) params.id_clinic = searchClinicId;

      if (dateRange && dateRange.length === 2) {
        params.from_date = dateRange[0].startOf("day").toISOString();
        params.to_date = dateRange[1].endOf("day").toISOString();
      }

      const res = await API_CALL.get("/audit-logs", { params });
      setData(res.data?.data?.data || []);
      setTotal(res.data?.data?.total || 0);
    } catch (error) {
      console.error("Fetch audit logs failed:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(1, pageSize);
    setPage(1);
  }, [entity, action, searchUserId, searchClinicId, dateRange]);

  const handleTableChange = (pagination) => {
    setPage(pagination.current);
    setPageSize(pagination.pageSize);
    fetchLogs(pagination.current, pagination.pageSize);
  };

  const handleReset = () => {
    setEntity(undefined);
    setAction(undefined);
    setEntityId("");
    setSearchUserId(undefined);
    setSearchClinicId(undefined);
    setDateRange([]);
    setPage(1);
    fetchLogs(1, pageSize);
  };

  const showDetail = (record) => {
    setSelectedRecord(record);
    setDetailModalVisible(true);
  };

  const columns = [
    {
      title: "Thời gian",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 160,
      render: (val) => dayjs(val).format("YYYY-MM-DD HH:mm:ss"),
    },
    {
      title: "Người thực hiện",
      dataIndex: "user_email",
      key: "user_email",
      width: 200,
      render: (val, record) => (
        <Space direction="vertical" size={0}>
          <span style={{ fontWeight: 600 }}>{val || "N/A"}</span>
          <span style={{ fontSize: 11, color: "#94a3b8" }}>
            Role ID: {record.user_role}
          </span>
        </Space>
      ),
    },
    {
      title: "Thao tác",
      dataIndex: "action",
      key: "action",
      width: 130,
      render: (val) => (
        <Tag color={ACTION_COLORS[val] || "blue"} style={{ fontWeight: 600 }}>
          {val}
        </Tag>
      ),
    },
    {
      title: "Phân hệ / Đối tượng",
      dataIndex: "entity",
      key: "entity",
      width: 160,
      render: (val, record) => (
        <Space direction="vertical" size={0}>
          <span>{ENTITY_LABELS[val] || val}</span>
          {record.entity_id && (
            <span style={{ fontSize: 11, color: "#64748b" }}>
              ID: {record.entity_id}
            </span>
          )}
        </Space>
      ),
    },
    {
      title: "Phòng khám",
      dataIndex: "id_clinic",
      key: "id_clinic",
      width: 140,
      render: (val) => (val ? <Badge status="processing" text={`ID: ${val}`} /> : <span style={{ color: "#cbd5e1" }}>—</span>),
    },
    {
      title: "Địa chỉ IP",
      dataIndex: "ip_address",
      key: "ip_address",
      width: 130,
    },
    {
      title: "Hành động",
      key: "actions",
      width: 80,
      align: "center",
      render: (_, record) => (
        <Tooltip title="Xem chi tiết dữ liệu thay đổi">
          <Button
            type="primary"
            shape="circle"
            icon={<EyeOutlined />}
            onClick={() => showDetail(record)}
            size="small"
          />
        </Tooltip>
      ),
    },
  ];

  return (
    <div style={{ padding: "12px 20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <Space>
          <HistoryOutlined style={{ fontSize: 20, color: "#1e3a8a" }} />
          <h3 style={{ margin: 0, fontWeight: 700, color: "#1e293b" }}>Nhật ký hoạt động hệ thống</h3>
        </Space>
        <Button icon={<ReloadOutlined />} onClick={() => fetchLogs()} loading={loading} size="small">
          Làm mới
        </Button>
      </div>

      <Card size="small" bodyStyle={{ padding: "8px 12px" }} style={{ marginBottom: 12, borderRadius: 8, boxShadow: "none", border: "1px solid #e2e8f0" }}>
        <Space wrap size={[12, 8]}>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <span style={{ fontSize: 11, color: "#64748b", fontWeight: 500 }}>Phân hệ</span>
            <Select
              placeholder="Chọn phân hệ"
              allowClear
              value={entity}
              onChange={setEntity}
              style={{ width: 140 }}
              size="small"
            >
              {Object.entries(ENTITY_LABELS).map(([k, v]) => (
                <Select.Option key={k} value={k}>
                  {v}
                </Select.Option>
              ))}
            </Select>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <span style={{ fontSize: 11, color: "#64748b", fontWeight: 500 }}>Thao tác</span>
            <Select
              placeholder="Chọn thao tác"
              allowClear
              value={action}
              onChange={setAction}
              style={{ width: 130 }}
              size="small"
            >
              {Object.keys(ACTION_COLORS).map((act) => (
                <Select.Option key={act} value={act}>
                  {act}
                </Select.Option>
              ))}
            </Select>
          </div>

          {isAdmin && (
            <>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <span style={{ fontSize: 11, color: "#64748b", fontWeight: 500 }}>Người dùng</span>
                <Select
                  placeholder="Chọn người dùng"
                  allowClear
                  showSearch
                  optionFilterProp="children"
                  value={searchUserId}
                  onChange={setSearchUserId}
                  style={{ width: 170 }}
                  size="small"
                >
                  {(Array.isArray(usersList) ? usersList : []).map((u) => (
                    <Select.Option key={u.id} value={u.id}>
                      {u.email} ({u.full_name})
                    </Select.Option>
                  ))}
                </Select>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <span style={{ fontSize: 11, color: "#64748b", fontWeight: 500 }}>Phòng khám</span>
                <Select
                  placeholder="Chọn phòng khám"
                  allowClear
                  showSearch
                  optionFilterProp="children"
                  value={searchClinicId}
                  onChange={setSearchClinicId}
                  style={{ width: 160 }}
                  size="small"
                >
                  {(Array.isArray(clinicsList) ? clinicsList : []).map((c) => (
                    <Select.Option key={c.id} value={c.id}>
                      {c.name}
                    </Select.Option>
                  ))}
                </Select>
              </div>
            </>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <span style={{ fontSize: 11, color: "#64748b", fontWeight: 500 }}>ID Đối tượng</span>
            <Input
              placeholder="Nhập ID"
              value={entityId}
              onChange={(e) => setEntityId(e.target.value)}
              style={{ width: 100 }}
              onPressEnter={() => fetchLogs(1)}
              size="small"
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <span style={{ fontSize: 11, color: "#64748b", fontWeight: 500 }}>Thời gian</span>
            <RangePicker
              value={dateRange}
              onChange={setDateRange}
              style={{ width: 230 }}
              size="small"
            />
          </div>

          <div style={{ display: "flex", alignItems: "flex-end", height: 38 }}>
            <Button onClick={handleReset} size="small">Xóa bộ lọc</Button>
          </div>
        </Space>
      </Card>

      <style>{`
        .compact-audit-table .ant-table-cell {
          font-size: 11px !important;
          padding: 4px 6px !important;
        }
        .compact-audit-table .ant-tag {
          font-size: 10px !important;
          line-height: 1.4 !important;
          padding: 0 4px !important;
          margin: 0 !important;
        }
        .compact-audit-table .ant-badge {
          font-size: 11px !important;
        }
        .compact-audit-table .ant-table-thead > tr > th {
          background-color: #f8fafc !important;
          font-weight: 600 !important;
          color: #475569 !important;
        }
      `}</style>

      <Table
        dataSource={data}
        columns={columns}
        rowKey="id"
        loading={loading}
        size="small"
        className="compact-audit-table"
        pagination={{
          current: page,
          pageSize: pageSize,
          total: total,
          showSizeChanger: true,
          pageSizeOptions: ["10", "20", "50", "100"],
          showTotal: (tot) => `Tổng số ${tot} hoạt động`,
        }}
        onChange={handleTableChange}
        bordered
        style={{ borderRadius: 8, overflow: "hidden" }}
      />

      <Modal
        title={
          <Space>
            <HistoryOutlined />
            <span>Chi tiết thay đổi dữ liệu</span>
          </Space>
        }
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" type="primary" onClick={() => setDetailModalVisible(false)}>
            Đóng
          </Button>,
        ]}
        width={800}
        bodyStyle={{ maxHeight: "70vh", overflowY: "auto" }}
      >
        {selectedRecord && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ background: "#f8fafc", padding: 12, borderRadius: 8, border: "1px solid #e2e8f0" }}>
              <Space wrap size={[24, 8]}>
                <span>
                  <strong>Phân hệ:</strong> {ENTITY_LABELS[selectedRecord.entity] || selectedRecord.entity}
                </span>
                <span>
                  <strong>Thao tác:</strong> <Tag color={ACTION_COLORS[selectedRecord.action]}>{selectedRecord.action}</Tag>
                </span>
                <span>
                  <strong>Đối tượng ID:</strong> {selectedRecord.entity_id || "N/A"}
                </span>
                <span>
                  <strong>Thời gian:</strong> {dayjs(selectedRecord.createdAt).format("YYYY-MM-DD HH:mm:ss")}
                </span>
              </Space>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <strong>User Agent / Browser:</strong>
              <div style={{ fontSize: 12, color: "#64748b", fontFamily: "monospace", wordBreak: "break-all", background: "#f1f5f9", padding: 8, borderRadius: 4 }}>
                {selectedRecord.user_agent || "N/A"}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <h4 style={{ margin: "0 0 8px 0", color: "#64748b" }}>Dữ liệu đầu vào / Trước thay đổi</h4>
                <pre style={{
                  background: "#fdf6e3",
                  padding: 12,
                  borderRadius: 8,
                  fontSize: 11,
                  maxHeight: 300,
                  overflow: "auto",
                  border: "1px solid #eee8d5"
                }}>
                  {selectedRecord.before_data
                    ? JSON.stringify(selectedRecord.before_data, null, 2)
                    : "Không có dữ liệu trước thay đổi (Hoặc thao tác CREATE)"}
                </pre>
              </div>

              <div>
                <h4 style={{ margin: "0 0 8px 0", color: "#64748b" }}>Dữ liệu phản hồi / Sau thay đổi</h4>
                <pre style={{
                  background: "#f0fdf4",
                  padding: 12,
                  borderRadius: 8,
                  fontSize: 11,
                  maxHeight: 300,
                  overflow: "auto",
                  border: "1px solid #dcfce7"
                }}>
                  {selectedRecord.after_data
                    ? JSON.stringify(selectedRecord.after_data, null, 2)
                    : "Không có dữ liệu phản hồi"}
                </pre>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AuditLogsList;
