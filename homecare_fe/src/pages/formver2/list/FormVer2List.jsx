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
  Tooltip,
  Checkbox,
  Divider,
  Dropdown,
} from "antd";
import {
  FilterOutlined,
  ReloadOutlined,
  FileAddFilled,
  DownloadOutlined,
  CheckOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import styles from "./FormVer2List.module.scss";
import API_CALL from "../../../services/axiosClient";
import { useGlobalAuth } from "../../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { exportFormVer2 } from "../utils";
import FormVer2PreviewModal from "./FormVer2PreviewModal";
import { USER_ROLE } from "../../../constant/app";

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
  range: undefined,
  withTables: false,
  withImages: false,
  includeDeleted: false,
};

const STORAGE_KEY = "visibleColumns_formVer2";
const defaultVisibleKeys = [
  "stt",
  "id",
  "code",
  "ten_mau",
  "id_exam_part",
  "id_template_service",
  "language",
  "ngay_thuc_hien",
  "doctor_name",
  "actions",
  "ket_luan",
  "icd10",
];

export default function FormVer2List() {
  const navigate = useNavigate();
  const { examParts = [], templateServices = [], user } = useGlobalAuth();
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewId, setPreviewId] = useState(null);

  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [uiFilters, setUiFilters] = useState(DEFAULT_FILTERS);

  const [visibleKeys, setVisibleKeys] = useState([]);

  /* ======= Helpers ======= */
  const getExamPartName = (id) =>
    examParts.find((e) => String(e.id) === String(id))?.name || id;

  const getTemplateServiceName = (id) =>
    templateServices.find((t) => String(t.id) === String(id))?.name || id;

  const getLinkedName = (record) =>
    record?.id_formver2_name_form_ver2_name?.name || record?.ten_mau || "";

  const getLinkedCode = (record) =>
    record?.id_formver2_name_form_ver2_name?.code || "";

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
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, [filters]);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    setVisibleKeys(saved ? JSON.parse(saved) : defaultVisibleKeys);
  }, []);

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
      const set = new Set([...prev, ...pageIds]);
      return Array.from(set);
    });
  };

  const unselectAllOnPage = () => {
    setSelectedRowKeys((prev) => {
      const pageIds = new Set(rows.map((r) => r.id));
      return prev.filter((id) => !pageIds.has(id));
    });
  };

  const clearAllSelections = () => setSelectedRowKeys([]);

  /* ======= Column visibility ======= */
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
      { title: "ID", dataIndex: "id", key: "id", align: "center", width: 70 },
      {
        title: "Kết Luận",
        dataIndex: "ket_luan",
        key: "ket_luan",
        align: "center",
        width: 150,
      },

      {
        title: "Icd10",
        dataIndex: "icd10",
        key: "icd10",
        align: "center",
        width: 100,
      },

      {
        title: "Code",
        key: "code",
        dataIndex: ["id_formver2_name_form_ver2_name", "code"],
        width: 140,
        ellipsis: true,
        render: (_, record) =>
          getLinkedCode(record) || <Text type="secondary">—</Text>,
      },
      {
        title: "Tên mẫu",
        dataIndex: "ten_mau",
        key: "ten_mau",
        width: 290,
        ellipsis: true,
        render: (_, record) => {
          const name = getLinkedName(record);
          return name ? name : <Text type="secondary">—</Text>;
        },
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
            {user.id_role == USER_ROLE.ADMIN && (
              <Button
                size="small"
                icon={<DownloadOutlined />}
                onClick={() => exportFormVer2({ ids: [record.id] })}
              >
                Export
              </Button>
            )}
          </Space>
        ),
      },
    ],
    [examParts, templateServices, filters.page, filters.limit]
  );

  const columnsToRender = useMemo(
    () => allColumns.filter((col) => visibleKeys.includes(col.key)),
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

  /* ======= Row Selection ======= */
  const rowSelection = {
    selectedRowKeys,
    onChange: (keys) => setSelectedRowKeys(keys),
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
    columnWidth: 48,
    preserveSelectedRowKeys: true,
  };

  /* ======= UI ======= */
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Title level={3} style={{ margin: 0 }}>
          Danh sách FormVer2
        </Title>
        <Space>
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

          {user.id_role == USER_ROLE.ADMIN && (
            <Tooltip title="Thêm mới">
              <Button
                icon={<FileAddFilled />}
                onClick={() => navigate(`/home/form-v2`)}
              />
            </Tooltip>
          )}

          <Tooltip title="Làm mới">
            <Button
              icon={<ReloadOutlined />}
              onClick={() => setFilters({ ...filters })}
            />
          </Tooltip>

          <Dropdown overlay={columnMenu} trigger={["click"]}>
            <Button icon={<SettingOutlined />}>Chọn cột</Button>
          </Dropdown>

          {user.id_role == USER_ROLE.ADMIN && (
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              disabled={!selectedRowKeys.length}
              onClick={() => exportFormVer2({ ids: selectedRowKeys })}
            >
              Export ({selectedRowKeys.length})
            </Button>
          )}

          <Button onClick={selectAllOnPage}>Chọn tất cả</Button>
          <Button onClick={unselectAllOnPage}>Bỏ chọn</Button>
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
              placeholder="search"
              value={uiFilters.search}
              onChange={(e) =>
                setUiFilters((s) => ({ ...s, search: e.target.value }))
              }
              onPressEnter={(e) => e.preventDefault()}
              type="text"
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

          <Col xs={12} md={8} lg={6}>
            <Text>Dịch vụ</Text>
            <Select
              allowClear
              style={{ width: "100%" }}
              placeholder="Chọn dịch vụ mẫu"
              value={uiFilters.id_template_service}
              onChange={(v) =>
                setUiFilters((s) => ({
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

          <Col xs={12} md={8} lg={5}>
            <Text>Bộ phận</Text>
            <Select
              allowClear
              style={{ width: "100%" }}
              placeholder="Chọn bộ phận thăm khám"
              value={uiFilters.id_exam_part}
              onChange={(v) => setUiFilters((s) => ({ ...s, id_exam_part: v }))}
              disabled={!uiFilters.id_template_service} // disable khi chưa chọn phân hệ
            >
              {examParts
                .filter(
                  (s) =>
                    String(s.id_template_service) ===
                    String(uiFilters.id_template_service)
                ) // lọc theo phân hệ
                .map((s) => (
                  <Option key={s.id} value={s.id}>
                    {s.name}
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
                { value: "createdAt", label: "Ngày tạo" },
                { value: "updatedAt", label: "Ngày cập nhật" },
                { value: "ngay_thuc_hien", label: "Ngày thực hiện" },
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
                { value: "DESC", label: "Cũ nhất" },
                { value: "ASC", label: "Mới nhất" },
              ]}
            />
          </Col>

          <Col xs={8} md={6} lg={2}>
            <Text>Đã xoá</Text>
            <div>
              <Switch
                checked={uiFilters.includeDeleted}
                onChange={(v) =>
                  setUiFilters((s) => ({ ...s, includeDeleted: v }))
                }
              />
            </div>
          </Col>
        </Row>
      </Card>

      <Spin spinning={loading}>
        <Table
          scroll={{ x: 1200, y: 800 }}
          className={styles.table}
          dataSource={rows}
          columns={columnsToRender}
          rowKey="id"
          rowSelection={rowSelection}
          onRow={(record) => ({
            onClick: () => {
              setPreviewId(record.id);
              setPreviewOpen(true);
            },
          })}
          pagination={{
            current: filters.page,
            pageSize: filters.limit,
            total,
            showSizeChanger: false,
            onChange: (page) => setFilters((s) => ({ ...s, page })),
            showTotal: () => (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Text>Page size</Text>
                <Select
                  style={{ width: 80 }}
                  value={filters.limit}
                  onChange={(limit) =>
                    setFilters((s) => ({ ...s, page: 1, limit }))
                  }
                  options={[10, 20, 50, 100].map((n) => ({
                    value: n,
                    label: n,
                  }))}
                />
              </div>
            ),
          }}
        />
        <FormVer2PreviewModal
          open={previewOpen}
          onClose={() => setPreviewOpen(false)}
          id={previewId}
        />
      </Spin>
    </div>
  );
}
