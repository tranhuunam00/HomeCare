// src/pages/formver2/FormVer2List.jsx
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
  Switch,
  Space,
  Tag,
  Spin,
  Typography,
} from "antd";
import {
  FilterOutlined,
  ReloadOutlined,
  PrinterOutlined,
  SearchOutlined,
  FileAddFilled,
  DownloadOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import styles from "./FormVer2List.module.scss";
import API_CALL from "../../../services/axiosClient";
import { useGlobalAuth } from "../../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { exportFormVer2 } from "../utils";

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

/* ================= Helpers ================= */
const buildParams = (f) => {
  const params = {
    page: f.page,
    limit: f.limit,
    orderBy: f.orderBy || "createdAt",
    orderDir: f.orderDir || "DESC",
    withTables: f.withTables,
    withImages: f.withImages,
    includeDeleted: f.includeDeleted,
  };
  if (f.id_exam_part) params.id_exam_part = f.id_exam_part;
  if (f.id_template_service) params.id_template_service = f.id_template_service;
  if (f.id_doctor) params.id_doctor = f.id_doctor;

  if (f.search?.trim()) params.search = f.search.trim();
  if (Array.isArray(f.range) && f.range[0] && f.range[1]) {
    params.date_from = f.range[0].format("YYYY-MM-DD");
    params.date_to = f.range[1].format("YYYY-MM-DD");
  }
  return params;
};

const languageTag = (lang) => {
  if (!lang) return "—";
  const map = {
    vi: { color: "green", text: "VI" },
    en: { color: "blue", text: "EN" },
  };
  const m = map[lang] || { color: "default", text: String(lang).toUpperCase() };
  return <Tag color={m.color}>{m.text}</Tag>;
};

const DEFAULT_FILTERS = {
  page: 1,
  limit: 20,
  orderBy: "createdAt",
  orderDir: "DESC",
  id_exam_part: undefined,
  id_template_service: undefined,
  search: "",
  id_doctor: undefined,
  range: undefined, // [dayjs, dayjs]
  withTables: false,
  withImages: false,
  includeDeleted: false,
};

export default function FormVer2List() {
  const navigate = useNavigate();

  /* ======= Global options ======= */
  const { examParts = [], templateServices = [] } = useGlobalAuth();
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  const getExamPartName = (id) =>
    examParts.find((e) => String(e.id) === String(id))?.name || id;

  const getTemplateServiceName = (id) =>
    templateServices.find((t) => String(t.id) === String(id))?.name || id;

  /* ======= State ======= */
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);

  // filters đang áp dụng để fetch
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  // filters ở UI (gõ/đổi không fetch)
  const [uiFilters, setUiFilters] = useState(DEFAULT_FILTERS);

  /* ======= Fetch ======= */
  const fetchList = async () => {
    setLoading(true);
    try {
      const res = await API_CALL.get("/form-ver2", {
        params: buildParams(filters),
      });
      const payload = res?.data?.data || {};
      setRows(payload.items || []);
      setTotal(payload.total || 0);
    } catch (e) {
      // có thể toast ở đây nếu bạn dùng react-toastify
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList(); // chỉ chạy khi filters đổi (ấn Tìm kiếm / đổi trang)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  /* ======= Actions ======= */
  const applySearch = () =>
    setFilters((prev) => ({
      ...prev,
      ...uiFilters,
      page: 1,
    }));

  const resetUi = () => setUiFilters(DEFAULT_FILTERS);

  const selectAllOnPage = () => {
    setSelectedRowKeys((prev) => {
      const pageIds = rows.map((r) => r.id);
      // Hợp nhất (giữ những id đã chọn ở trang khác)
      const set = new Set([...prev, ...pageIds]);
      return Array.from(set);
    });
  };

  // Bỏ chọn tất cả trên TRANG HIỆN TẠI
  const unselectAllOnPage = () => {
    setSelectedRowKeys((prev) => {
      const pageIds = new Set(rows.map((r) => r.id));
      return prev.filter((id) => !pageIds.has(id));
    });
  };

  const clearAllSelections = () => setSelectedRowKeys([]);

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys) => setSelectedRowKeys(keys),
    // Thêm menu nhanh: Chọn tất cả / đảo / bỏ chọn
    selections: [
      Table.SELECTION_ALL,
      Table.SELECTION_INVERT,
      Table.SELECTION_NONE,
      {
        key: "select-all-page",
        text: "Chọn tất cả (trang này)",
        onSelect: selectAllOnPage,
      },
      {
        key: "unselect-all-page",
        text: "Bỏ chọn (trang này)",
        onSelect: unselectAllOnPage,
      },
    ],
    // để checkbox nằm ở cột đầu
    columnWidth: 48,
    preserveSelectedRowKeys: true, // giữ selection khi đổi trang
  };

  /* ======= Columns ======= */
  const columns = useMemo(
    () => [
      { title: "ID", dataIndex: "id", key: "id", width: 70, align: "center" },
      {
        title: "Tên mẫu",
        dataIndex: "ten_mau",
        key: "ten_mau",
        render: (v) => v || <Text type="secondary">—</Text>,
      },
      {
        title: "Bộ phận thăm khám",
        dataIndex: "id_exam_part",
        key: "id_exam_part",
        align: "center",
        width: 150,
        render: (id) => getExamPartName(id),
      },
      {
        title: "Dịch vụ",
        dataIndex: "id_template_service",
        key: "id_template_service",
        align: "center",
        width: 200,
        render: (id) => getTemplateServiceName(id),
      },
      {
        title: "Ngôn ngữ",
        dataIndex: "language",
        key: "language",
        width: 110,
        align: "center",
        render: (lang) => languageTag(lang),
      },
      {
        title: "Ngày thực hiện",
        dataIndex: "ngay_thuc_hien",
        key: "ngay_thuc_hien",
        width: 140,
        align: "center",
      },

      {
        title: "Người thực hiện",
        dataIndex: "doctor_name",
        key: "doctor_name",
        width: 140,
        align: "center",
        render: (_, record) => record.id_doctor_doctor?.full_name,
      },

      {
        title: "Hành động",
        key: "actions",
        width: 220,
        align: "center",
        render: (_, record) => (
          <Space>
            <Button
              type="link"
              onClick={() => navigate(`/home/form-v2/detail/${record.id}`)}
            >
              Chi tiết
            </Button>
            <Button
              size="small"
              icon={<DownloadOutlined />}
              onClick={() => exportFormVer2({ ids: [record.id] })}
            >
              Export
            </Button>
          </Space>
        ),
      },
    ],
    [examParts, templateServices]
  );

  /* ======= UI ======= */
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Title level={3} style={{ margin: 0 }}>
          Danh sách FormVer2
        </Title>
        <Space>
          <Button
            icon={<FileAddFilled />}
            onClick={() => navigate(`/home/form-v2`)}
          >
            Thêm mới
          </Button>

          <Button
            icon={<ReloadOutlined />}
            onClick={() => setFilters({ ...filters })}
          >
            Tải lại
          </Button>

          <Button
            type="primary"
            icon={<DownloadOutlined />}
            disabled={!selectedRowKeys.length}
            onClick={() => exportFormVer2({ ids: selectedRowKeys })}
          >
            Export đã chọn ({selectedRowKeys.length})
          </Button>

          <Button onClick={selectAllOnPage}>Chọn tất cả (trang này)</Button>
          <Button onClick={unselectAllOnPage}>Bỏ chọn (trang này)</Button>
          <Button onClick={clearAllSelections}>Xóa toàn bộ chọn</Button>
        </Space>
      </div>

      <Card
        size="small"
        className={styles.filters}
        title={
          <Space>
            <FilterOutlined /> Bộ lọc
          </Space>
        }
        extra={
          <Space>
            <Button size="small" onClick={resetUi}>
              Reset
            </Button>
            <Button type="primary" size="small" onClick={applySearch}>
              Tìm kiếm
            </Button>
          </Space>
        }
      >
        <Row gutter={[12, 12]}>
          <Col xs={24} md={8} lg={6}>
            <Text>Từ khóa</Text>
            <Input
              allowClear
              placeholder="search"
              value={uiFilters.search}
              onChange={(e) =>
                setUiFilters((s) => ({ ...s, search: e.target.value }))
              }
              onPressEnter={(e) => e.preventDefault()}
            />
          </Col>
          <Col xs={24} md={8} lg={4}>
            <Text>Nhập Id bác sĩ</Text>
            <Input
              placeholder="search"
              value={uiFilters.id_doctor}
              onChange={(e) =>
                setUiFilters((s) => ({ ...s, id_doctor: e.target.value }))
              }
              type="number"
              onPressEnter={(e) => e.preventDefault()}
            />
          </Col>

          <Col xs={12} md={8} lg={5}>
            <Text>Bộ phận</Text>
            <Select
              allowClear
              style={{ width: "100%" }}
              placeholder="Chọn bộ phận thăm khám"
              value={uiFilters.id_exam_part}
              onChange={(v) => setUiFilters((s) => ({ ...s, id_exam_part: v }))}
            >
              {examParts.map((s) => (
                <Option key={s.id} value={s.id}>
                  {s.name}
                </Option>
              ))}
            </Select>
          </Col>

          <Col xs={12} md={8} lg={6}>
            <Text>Dịch vụ</Text>
            <Select
              allowClear
              style={{ width: "100%" }}
              placeholder="Chọn template service"
              value={uiFilters.id_template_service}
              onChange={(v) =>
                setUiFilters((s) => ({ ...s, id_template_service: v }))
              }
            >
              {templateServices.map((t) => (
                <Option key={t.id} value={t.id}>
                  {t.name}
                </Option>
              ))}
            </Select>
          </Col>

          <Col xs={24} md={12} lg={7}>
            <Text>Khoảng ngày</Text>
            <RangePicker
              style={{ width: "100%" }}
              value={uiFilters.range}
              onChange={(range) => setUiFilters((s) => ({ ...s, range }))}
            />
          </Col>

          <Col xs={12} md={6} lg={4}>
            <Text>Sắp xếp theo</Text>
            <Select
              style={{ width: "100%" }}
              value={uiFilters.orderBy}
              onChange={(v) => setUiFilters((s) => ({ ...s, orderBy: v }))}
              options={[
                { value: "createdAt", label: "createdAt" },
                { value: "updatedAt", label: "updatedAt" },
                { value: "ngay_thuc_hien", label: "ngay_thuc_hien" },
              ]}
            />
          </Col>

          <Col xs={12} md={6} lg={4}>
            <Text>Thứ tự</Text>
            <Select
              style={{ width: "100%" }}
              value={uiFilters.orderDir}
              onChange={(v) => setUiFilters((s) => ({ ...s, orderDir: v }))}
              options={[
                { value: "DESC", label: "DESC" },
                { value: "ASC", label: "ASC" },
              ]}
            />
          </Col>

          <Col xs={8} md={6} lg={4}>
            <Text>withTables</Text>
            <div>
              <Switch
                checked={uiFilters.withTables}
                onChange={(v) => setUiFilters((s) => ({ ...s, withTables: v }))}
              />
            </div>
          </Col>

          <Col xs={8} md={6} lg={4}>
            <Text>withImages</Text>
            <div>
              <Switch
                checked={uiFilters.withImages}
                onChange={(v) => setUiFilters((s) => ({ ...s, withImages: v }))}
              />
            </div>
          </Col>

          <Col xs={8} md={6} lg={4}>
            <Text>includeDeleted</Text>
            <div>
              <Switch
                checked={uiFilters.includeDeleted}
                onChange={(v) =>
                  setUiFilters((s) => ({ ...s, includeDeleted: v }))
                }
              />
            </div>
          </Col>

          <Col xs={12} md={6} lg={4}>
            <Text>Page size</Text>
            <Select
              style={{ width: "100%" }}
              value={uiFilters.limit}
              onChange={(v) => setUiFilters((s) => ({ ...s, limit: v }))}
              options={[10, 20, 50, 100].map((n) => ({ value: n, label: n }))}
            />
          </Col>
        </Row>
      </Card>

      <Spin spinning={loading}>
        <Table
          className={styles.table}
          dataSource={rows}
          columns={columns}
          rowKey="id"
          rowSelection={rowSelection} // <— NEW
          pagination={{
            current: filters.page,
            pageSize: filters.limit,
            total,
            showSizeChanger: false,
            onChange: (page) => setFilters((s) => ({ ...s, page })),
          }}
        />
      </Spin>
    </div>
  );
}
