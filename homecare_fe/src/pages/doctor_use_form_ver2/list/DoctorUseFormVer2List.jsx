import React, { useEffect, useMemo, useState } from "react";
import {
  Table,
  Input,
  Select,
  Row,
  Col,
  Card,
  Button,
  DatePicker,
  Space,
  Tag,
  Spin,
  Typography,
  Tooltip,
  Dropdown,
  Checkbox,
  Divider,
  Switch,
  message,
} from "antd";
import {
  FilterOutlined,
  ReloadOutlined,
  SettingOutlined,
  EyeOutlined,
  CheckOutlined,
} from "@ant-design/icons";
import API_CALL from "../../../services/axiosClient";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import styles from "./DoctorUseFormVer2List.module.scss";
import { useGlobalAuth } from "../../../contexts/AuthContext";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const STORAGE_KEY = "visibleColumns_doctorUseFormVer2";

const defaultVisibleKeys = [
  "stt",
  "id",
  "ten_mau",
  "benh_nhan_ho_ten",
  "benh_nhan_gioi_tinh",
  "benh_nhan_tuoi",
  "benh_nhan_pid",
  "benh_nhan_sid",
  "template_service",
  "exam_part",
  "doctor_name",
  "formver2",
  "status",
  "actions",
];

const DEFAULT_FILTERS = {
  page: 1,
  limit: 20,
  search: "",
  id_template_service: undefined,
  id_exam_part: undefined,
  id_formver2: undefined,
  id: undefined,
  includeDeleted: false,
  range: undefined,
};

const STATUS = {
  1: { text: "Mới", color: "blue" },
  2: { text: "Đang đọc", color: "gold" },
  3: { text: "Chờ xác nhận", color: "orange" },
  4: { text: "Đã xác nhận", color: "green" },
};

export default function DoctorUseFormVer2List() {
  const navigate = useNavigate();
  const { examParts = [], templateServices = [] } = useGlobalAuth();

  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);

  // filters chính thức (gửi lên API)
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  // filters nháp (UI điều chỉnh)
  const [filtersDraft, setFiltersDraft] = useState(DEFAULT_FILTERS);

  const [visibleKeys, setVisibleKeys] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    setVisibleKeys(saved ? JSON.parse(saved) : defaultVisibleKeys);
  }, []);

  const fetchList = async () => {
    setLoading(true);
    try {
      const params = {
        page: filters.page,
        limit: filters.limit,
        search: filters.search || undefined,
        id_template_service: filters.id_template_service || undefined,
        id_exam_part: filters.id_exam_part || undefined,
        id_formver2: filters.id_formver2 || undefined,
        id: filters.id || undefined,
        includeDeleted: filters.includeDeleted || undefined,
      };
      if (filters.range) {
        params.date_from = filters.range[0].format("YYYY-MM-DD");
        params.date_to = filters.range[1].format("YYYY-MM-DD");
      }

      const res = await API_CALL.get("/doctor-use-form-ver2", { params });
      const payload = res?.data?.data || {};
      setRows(payload.items || []);
      setTotal(payload.total || 0);
    } catch (err) {
      console.error("Fetch error:", err);
      message.error("Không tải được dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  // Chỉ fetch khi filters chính thức đổi (sau khi bấm Tìm kiếm)
  useEffect(() => {
    fetchList();
  }, [filters]);

  const allColumns = useMemo(
    () => [
      {
        title: "STT",
        key: "stt",
        width: 70,
        align: "center",
        render: (_, __, index) =>
          (filters.page - 1) * filters.limit + index + 1,
      },
      { title: "ID", dataIndex: "id", key: "id", width: 70, align: "center" },
      { title: "Tên mẫu", dataIndex: "ten_mau", key: "ten_mau", width: 200 },
      {
        title: "Họ tên BN",
        dataIndex: "benh_nhan_ho_ten",
        key: "benh_nhan_ho_ten",
        width: 160,
      },
      {
        title: "Giới tính",
        dataIndex: "benh_nhan_gioi_tinh",
        key: "benh_nhan_gioi_tinh",
        width: 100,
      },
      {
        title: "Tuổi",
        dataIndex: "benh_nhan_tuoi",
        key: "benh_nhan_tuoi",
        width: 80,
      },
      {
        title: "PID",
        dataIndex: "benh_nhan_pid",
        key: "benh_nhan_pid",
        width: 120,
      },
      {
        title: "SID",
        dataIndex: "benh_nhan_sid",
        key: "benh_nhan_sid",
        width: 200,
      },
      {
        title: "Phân hệ",
        key: "template_service",
        width: 160,
        render: (_, r) => r.id_template_service_template_service?.name || "—",
      },
      {
        title: "Bộ phận",
        key: "exam_part",
        width: 140,
        render: (_, r) => r.id_exam_part_exam_part?.name || "—",
      },
      {
        title: "Bác sĩ",
        key: "doctor_name",
        width: 150,
        render: (_, r) => r.id_doctor_doctor?.full_name || "—",
      },
      {
        title: "FormVer2",
        key: "formver2",
        width: 120,
        render: (_, r) =>
          r.id_formver2_form_ver2?.ten_mau || r.id_formver2 || "—",
      },
      {
        title: "Trạng thái",
        dataIndex: "status",
        key: "status",
        width: 120,
        render: (status) => (
          <Tag color={STATUS[status]?.color}>{STATUS[status]?.text}</Tag>
        ),
      },
      {
        title: "Hành động",
        key: "actions",
        width: 120,
        align: "center",
        render: (_, record) => (
          <Space>
            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={() =>
                navigate(`/home/doctor-use-form-v2/detail/${record.id}`)
              }
            >
              Xem
            </Button>
          </Space>
        ),
      },
    ],
    [filters.page, filters.limit]
  );

  const columnsToRender = useMemo(
    () => allColumns.filter((c) => visibleKeys.includes(c.key)),
    [visibleKeys, allColumns]
  );

  const toggleColumn = (key) => {
    const updated = visibleKeys.includes(key)
      ? visibleKeys.filter((k) => k !== key)
      : [...visibleKeys, key];
    setVisibleKeys(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const columnMenu = (
    <div style={{ padding: 12, maxHeight: 300, overflowY: "auto" }}>
      <Typography.Text strong style={{ display: "block", marginBottom: 8 }}>
        Chọn cột hiển thị
      </Typography.Text>
      {allColumns.map((col) => (
        <div key={col.key} style={{ padding: "4px 0" }}>
          <Checkbox
            checked={visibleKeys.includes(col.key)}
            onChange={() => toggleColumn(col.key)}
          >
            {col.title}
          </Checkbox>
        </div>
      ))}
      <Divider style={{ margin: "8px 0" }} />
      <Button
        size="small"
        onClick={() => {
          setVisibleKeys(defaultVisibleKeys);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultVisibleKeys));
        }}
      >
        Khôi phục mặc định
      </Button>
    </div>
  );

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Title level={3}>Danh sách Kết quả Ver2 đã sử dụng</Title>
        <Space>
          <Dropdown overlay={columnMenu} trigger={["click"]}>
            <Button icon={<SettingOutlined />}>Chọn cột</Button>
          </Dropdown>
          <Tooltip title="Làm mới">
            <Button icon={<ReloadOutlined />} onClick={() => fetchList()} />
          </Tooltip>
          <Tooltip title="Sử dụng">
            <Button
              type="primary"
              icon={<CheckOutlined />}
              onClick={() => {
                navigate(`/home/form-v2/use`);
              }}
            >
              Sử dụng
            </Button>
          </Tooltip>
        </Space>
      </div>

      <Card
        size="small"
        className={styles.filters}
        title={
          <Space>
            <FilterOutlined /> Bộ lọc --- {total} bản ghi
          </Space>
        }
        extra={
          <Space>
            <Button
              size="small"
              onClick={() => {
                setFiltersDraft(DEFAULT_FILTERS);
                setFilters(DEFAULT_FILTERS);
              }}
            >
              Reset
            </Button>
            <Button
              type="primary"
              size="small"
              onClick={() => setFilters({ ...filtersDraft, page: 1 })}
            >
              Tìm kiếm
            </Button>
          </Space>
        }
      >
        <Row gutter={[12, 12]}>
          {/* Từ khóa */}
          <Col xs={24} md={8} lg={6}>
            <Text>Từ khóa</Text>
            <Input
              placeholder="Search..."
              value={filtersDraft.search}
              onChange={(e) =>
                setFiltersDraft((s) => ({ ...s, search: e.target.value }))
              }
            />
          </Col>

          {/* Phân hệ */}
          <Col xs={24} md={8} lg={4}>
            <Text>Phân hệ</Text>
            <Select
              allowClear
              style={{ width: "100%" }}
              placeholder="Chọn phân hệ"
              value={filtersDraft.id_template_service}
              onChange={(v) =>
                setFiltersDraft((s) => ({
                  ...s,
                  id_template_service: v,
                  id_exam_part: undefined,
                }))
              }
            >
              {templateServices.map((t) => (
                <Option key={t.id} value={t.id}>
                  {t.name}
                </Option>
              ))}
            </Select>
          </Col>

          {/* Bộ phận */}
          <Col xs={24} md={8} lg={4}>
            <Text>Bộ phận</Text>
            <Select
              allowClear
              style={{ width: "100%" }}
              placeholder="Chọn bộ phận"
              value={filtersDraft.id_exam_part}
              onChange={(v) =>
                setFiltersDraft((s) => ({ ...s, id_exam_part: v }))
              }
              disabled={!filtersDraft.id_template_service}
            >
              {examParts
                .filter(
                  (p) =>
                    p.id_template_service === filtersDraft.id_template_service
                )
                .map((p) => (
                  <Option key={p.id} value={p.id}>
                    {p.name}
                  </Option>
                ))}
            </Select>
          </Col>

          {/* FormVer2 */}
          <Col xs={24} md={8} lg={4}>
            <Text>FormVer2</Text>
            <Input
              placeholder="Nhập id FormVer2"
              value={filtersDraft.id_formver2}
              onChange={(e) =>
                setFiltersDraft((s) => ({ ...s, id_formver2: e.target.value }))
              }
            />
          </Col>

          {/* ID */}
          <Col xs={24} md={8} lg={4}>
            <Text>ID</Text>
            <Input
              type="number"
              placeholder="Nhập ID"
              value={filtersDraft.id}
              onChange={(e) =>
                setFiltersDraft((s) => ({ ...s, id: e.target.value }))
              }
            />
          </Col>

          {/* Khoảng ngày */}
          <Col xs={24} md={12} lg={6}>
            <Text>Khoảng ngày</Text>
            <RangePicker
              style={{ width: "100%" }}
              value={filtersDraft.range}
              onChange={(range) =>
                setFiltersDraft((s) => ({
                  ...s,
                  range,
                  date_from: range?.[0]?.format("YYYY-MM-DD"),
                  date_to: range?.[1]?.format("YYYY-MM-DD"),
                }))
              }
            />
          </Col>

          {/* Đã xóa */}
          <Col xs={12} md={6} lg={3}>
            <Text>Đã xóa</Text>
            <div>
              <Switch
                checked={filtersDraft.includeDeleted}
                onChange={(v) =>
                  setFiltersDraft((s) => ({ ...s, includeDeleted: v }))
                }
              />
            </div>
          </Col>
        </Row>
      </Card>

      <Spin spinning={loading}>
        <Table
          dataSource={rows}
          columns={columnsToRender}
          rowKey="id"
          bordered
          scroll={{ x: "max-content" }}
          pagination={{
            current: filters.page,
            pageSize: filters.limit,
            total,
            showSizeChanger: true,
            onChange: (page, limit) =>
              setFilters((s) => ({ ...s, page, limit })),
          }}
        />
      </Spin>
    </div>
  );
}
