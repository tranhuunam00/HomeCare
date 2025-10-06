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
import { FormVer2CloneModal } from "../component/FormVer2CloneModal";
import { toast } from "react-toastify";

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const STORAGE_KEY_PAGE_SIZE = "formVer2_pageSize";
const FILTER_STORAGE_KEY = "formVer2_filters";

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
  if (f.language) params.language = f.language;

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
  language: "vi",
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

  const [cloneOpen, setCloneOpen] = useState(false);
  const [cloneRecord, setCloneRecord] = useState(null);

  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewId, setPreviewId] = useState(null);

  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [uiFilters, setUiFilters] = useState(DEFAULT_FILTERS);

  const [visibleKeys, setVisibleKeys] = useState([]);

  useEffect(() => {
    // Lấy pageSize đã lưu
    const savedPageSize = localStorage.getItem(STORAGE_KEY_PAGE_SIZE);
    let nextFilters = { ...DEFAULT_FILTERS };

    if (savedPageSize) {
      nextFilters.limit = Number(savedPageSize);
    }

    // Lấy toàn bộ filters đã lưu
    const savedFilters = localStorage.getItem(FILTER_STORAGE_KEY);
    if (savedFilters) {
      try {
        const parsed = JSON.parse(savedFilters);
        nextFilters = { ...nextFilters, ...parsed };
      } catch (e) {
        console.error("Parse filters error", e);
      }
    }

    // Cập nhật lại state
    setFilters(nextFilters);
    setUiFilters(nextFilters);
  }, []);

  useEffect(() => {
    localStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(filters));
  }, [filters]);

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

  const resetUi = () => {
    setUiFilters(DEFAULT_FILTERS);
    setFilters(DEFAULT_FILTERS);
  };

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
        title: "Code",
        key: "code",
        dataIndex: ["id_formver2_name_form_ver2_name", "code"],
        width: 160,
        ellipsis: true,
        render: (_, record) =>
          getLinkedCode(record) || <Text type="secondary">—</Text>,
      },
      {
        title: "Tên mẫu",
        dataIndex: "ten_mau",
        key: "ten_mau",
        width: 350,
        ellipsis: true,
        render: (_, record) => {
          const name = getLinkedName(record);
          return name ? name : <Text type="secondary">—</Text>;
        },
      },
      {
        title: "Bộ phận",
        dataIndex: "id_exam_part",
        key: "id_exam_part",
        align: "left",
        width: 150,

        render: (id) => getExamPartName(id),
      },
      {
        title: "Phân hệ",
        dataIndex: "id_template_service",
        key: "id_template_service",
        align: "left",
        width: 200,
        render: (id) => getTemplateServiceName(id),
      },

      {
        title: "ICD-10",
        dataIndex: "icd10",
        key: "icd10",
        align: "center",
        width: 150,
      },

      {
        title: "Kết Luận",
        dataIndex: "ket_luan",
        key: "ket_luan",
        align: "left",
        width: 260,
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
        width: 180,
        align: "left",
      },
      {
        title: "Người thực hiện",
        dataIndex: "doctor_name",
        key: "doctor_name",
        width: 200,
        align: "left",
        render: (_, record) => record.id_doctor_doctor?.full_name,
      },
      {
        title: "Hành động",
        key: "actions",
        width: 320,
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
            <Button
              type="link"
              onClick={(e) => {
                e.stopPropagation();
                setCloneRecord(record);
                setCloneOpen(true);
              }}
            >
              Clone
            </Button>
            {user.id_role == USER_ROLE.ADMIN && (
              <Button
                type="link"
                style={{ color: "#1890ff" }}
                onClick={(e) => {
                  e.stopPropagation();
                  cloneToEnglish({ ids: [record.id] });
                }}
              >
                Clone EN
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

  const cloneToEnglish = async ({ ids }) => {
    if (!ids?.length) return;

    const alreadyEN = rows
      .filter((r) => ids.includes(r.id) && r.language === "us")
      .map((r) => r.id);

    if (alreadyEN.length > 0) {
      toast.warning(
        `⚠️ Bản ghi ID: ${alreadyEN.join(
          ", "
        )} đã là bản tiếng Anh. Vui lòng bỏ chọn trước khi nhân bản.`,
        { autoClose: 6000 }
      );

      return;
    }

    try {
      setLoading(true);

      // ✅ Chỉ giữ lại ID chưa có EN
      const filteredIds = ids.filter((id) => !alreadyEN.includes(id));

      const res = await API_CALL.post(
        "/form-ver2/nhan-ban-us",
        { ids: filteredIds },
        { timeout: 120000 }
      );

      const { successed = [], failed = [] } = res?.data?.data || {};

      if (successed.length > 0) {
        toast.success(`✅ Thành công: ${successed.join(", ")}`, {
          autoClose: 5000,
        });
      }

      if (failed.length > 0) {
        const failMessages = failed
          .map((obj) => {
            const [id, msg] = Object.entries(obj)[0];
            return `${id}: ${msg}`;
          })
          .join(", ");
        toast.error(`❌ Thất bại: ${failMessages}`, { autoClose: 7000 });
      }

      if (successed.length === 0 && failed.length === 0) {
        toast.info("Không có bản ghi nào được xử lý.");
      }

      if (successed.length > 0) {
        await fetchList();
      }
    } catch (e) {
      console.error(e);
      toast.error("Lỗi khi nhân bản sang tiếng Anh!");
    } finally {
      setLoading(false);
    }
  };

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
    <Spin spinning={loading}>
      <div className={styles.page}>
        <Title
          level={3}
          style={{ margin: 0, textAlign: "center", color: "#3366CC" }}
        >
          PHẦN MỀM D-RADS
        </Title>
        <Title
          level={3}
          style={{
            margin: 0,
            textAlign: "center",
            marginBottom: 30,
            color: "#3366CC",
          }}
        >
          DANH SÁCH MẪU KẾT QUẢ
        </Title>
        <div className={styles.header}>
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
              <>
                {" "}
                <Button
                  type="primary"
                  icon={<DownloadOutlined />}
                  disabled={!selectedRowKeys.length}
                  onClick={() => exportFormVer2({ ids: selectedRowKeys })}
                >
                  Export ({selectedRowKeys.length})
                </Button>
                <Button
                  icon={<CheckOutlined />}
                  disabled={!selectedRowKeys.length}
                  onClick={() => cloneToEnglish({ ids: selectedRowKeys })}
                >
                  Clone EN ({selectedRowKeys.length})
                </Button>
              </>
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
              <FilterOutlined /> Bộ lọc --- {total}bản ghi
            </Space>
          }
          extra={
            <Space>
              <button onClick={resetUi}>Reset</button>
              <button onClick={applySearch}>Tìm kiếm</button>
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
              <Text>Phân hệ</Text>
              <Select
                allowClear
                style={{ width: "100%" }}
                placeholder="Chọn phân hệ"
                value={uiFilters.id_template_service}
                onChange={(v) =>
                  setUiFilters((s) => ({
                    ...s,
                    id_template_service: v,
                    id_exam_part: undefined,
                  }))
                }
              >
                {templateServices
                  .sort((a, b) => (a.name > b.name ? 1 : -1))
                  .map((t) => (
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
                onChange={(v) =>
                  setUiFilters((s) => ({ ...s, id_exam_part: v }))
                }
                disabled={!uiFilters.id_template_service} // disable khi chưa chọn phân hệ
              >
                {examParts
                  .filter(
                    (s) =>
                      String(s.id_template_service) ===
                      String(uiFilters.id_template_service)
                  )
                  .sort((a, b) => (a.name > b.name ? 1 : -1))
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
              <Text>Ngôn ngữ</Text>
              <Select
                allowClear
                style={{ width: "100%" }}
                placeholder="Chọn ngôn ngữ"
                value={uiFilters.language}
                onChange={(v) => setUiFilters((s) => ({ ...s, language: v }))}
                options={[
                  { value: "vi", label: "Tiếng Việt" },
                  { value: "us", label: "Tiếng Anh (US)" },
                ]}
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
                  { value: "DESC", label: "Giảm dần" },
                  { value: "ASC", label: "Tăng dần" },
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
                  onChange={(limit) => {
                    localStorage.setItem(STORAGE_KEY_PAGE_SIZE, limit);
                    setFilters((s) => ({ ...s, page: 1, limit }));
                  }}
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
        {cloneOpen && (
          <FormVer2CloneModal
            open={cloneOpen}
            onCancel={() => setCloneOpen(false)}
            cloneRecord={cloneRecord}
            onSuccess={(id) => {
              navigate("/home/form-v2/detail/" + id);
            }} // ✅ reload list sau khi clone
          />
        )}
      </div>
    </Spin>
  );
}
