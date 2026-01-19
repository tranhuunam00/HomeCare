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
  Form,
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
import styles from "./FormVer3List.module.scss";
import API_CALL from "../../../services/axiosClient";
import { useGlobalAuth } from "../../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { USER_ROLE } from "../../../constant/app";
import { toast } from "react-toastify";
import {
  ADVANCED_SAMPLE_STATUS_MAP,
  defaultVisibleKeys,
  STATUS_FORMVER3_MAP,
} from "../formver3.constant";
import { languageTag } from "../../formver2/list/FormVer2List";
import { FormVer3CloneModal } from "../components/FormVer3CloneModal";

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const STORAGE_KEY_PAGE_SIZE = "formVer3_pageSize";
const FILTER_STORAGE_KEY = "formVer3_filters";

const renderAdvancedSample = (value) => {
  const s = ADVANCED_SAMPLE_STATUS_MAP[value];
  if (!s) return <Tag>—</Tag>;
  return <Tag color={s.color}>{s.text}</Tag>;
};

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

  if (f.status !== undefined && f.status !== null) {
    params.status = f.status;
  }
  return params;
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
  status: undefined,
};

const STORAGE_KEY = "visibleColumns_formVer3";

export default function FormVer3List() {
  const navigate = useNavigate();
  const { examParts = [], templateServices = [], user } = useGlobalAuth();
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);

  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [uiFilters, setUiFilters] = useState(DEFAULT_FILTERS);

  const [visibleKeys, setVisibleKeys] = useState([]);
  const [cloneOpen, setCloneOpen] = useState(false);
  const [cloneRecord, setCloneRecord] = useState(null);

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
    record?.id_formver3_name_formver3_name?.name || record?.ten_mau || "";

  const getLinkedCode = (record) =>
    record?.id_formver3_name_formver3_name?.code || "";

  /* ======= Fetch ======= */
  const fetchList = async () => {
    setLoading(true);
    try {
      const res = await API_CALL.get("/formVer3", {
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
        dataIndex: ["id_formver3_name_formver3_name", "code"],
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
        title: "Trạng thái",
        key: "status",
        dataIndex: "status",
        width: 130,
        align: "center",
        render: (status) => renderStatus(status),
      },

      {
        title: "Mẫu nâng cao",
        dataIndex: "advanced_sample",
        key: "advanced_sample",
        width: 140,
        align: "center",
        render: (value) => renderAdvancedSample(value),
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
        title: "Người thực hiện",
        dataIndex: "doctor_name",
        key: "doctor_name",
        width: 200,
        align: "left",
        render: (_, record) => record.id_doctor_doctor?.full_name,
      },
      // {
      //   title: "Ngôn ngữ",
      //   dataIndex: "language",
      //   key: "language",
      //   width: 110,
      //   align: "center",
      //   render: (lang) => languageTag(lang),
      // },
      {
        title: "Ngày thực hiện",
        dataIndex: "createdAt",
        key: "createdAt",
        width: 180,
        align: "left",
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
              onClick={() => navigate(`/home/form-drad-v3/detail/${record.id}`)}
            >
              Chi tiết
            </Button>

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
            {/* {user.id_role == USER_ROLE.ADMIN && (
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
            )} */}
            <Button
              type="link"
              danger={record.status === 2}
              onClick={(e) => {
                e.stopPropagation();
                confirmToggleApprove(record);
              }}
            >
              {record.status === 2 ? "Unapprove" : "Approve"}
            </Button>
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

  const renderStatus = (status) => {
    const s = STATUS_FORMVER3_MAP[status];
    if (!s) return <Tag>—</Tag>;
    return <Tag color={s.color}>{s.text}</Tag>;
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
      .filter((r) => ids.includes(r.id) && r.language === "en")
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
        "/form-ver3/nhan-ban-us",
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

  const unapproveForm = async (record) => {
    try {
      setLoading(true);
      await API_CALL.patch(`/formVer3/${record.id}/unapprove`);
      toast.success("Unapprove form thành công");
      await fetchList();
    } catch (e) {
      console.error(e);
      toast.error(e?.response?.data?.message || "Lỗi khi unapprove FormVer3");
    } finally {
      setLoading(false);
    }
  };
  const approveForm = async (record) => {
    try {
      setLoading(true);
      await API_CALL.patch(`/formVer3/${record.id}/approve`);
      toast.success("Approve form thành công");
      await fetchList();
    } catch (e) {
      console.error(e);
      toast.error(e?.response?.data?.message || "Lỗi khi approve FormVer3");
    } finally {
      setLoading(false);
    }
  };

  const confirmToggleApprove = (record) => {
    const isApproved = record.status === 2;

    const message = isApproved
      ? "Bạn có chắc muốn HỦY DUYỆT form này?\nTrạng thái sẽ quay về Nháp (DRAFT)."
      : "Bạn có chắc muốn DUYỆT form này?\nTrạng thái sẽ chuyển sang Hoàn thành.";

    const confirmed = window.confirm(message);

    if (!confirmed) return;

    if (isApproved) {
      unapproveForm(record);
    } else {
      approveForm(record);
    }
  };

  /* ======= UI ======= */
  return (
    <Spin spinning={loading}>
      <div className={styles.page}>
        <Title
          level={3}
          style={{
            margin: 0,
            textAlign: "center",
            marginBottom: 30,
            color: "#3366CC",
          }}
        >
          DANH SÁCH MẪU KẾT QUẢ V.3
        </Title>
        <div className={styles.header}>
          <Space>
            <Tooltip title="Sử dụng">
              <Button type="primary" icon={<CheckOutlined />}>
                Sử dụng
              </Button>
            </Tooltip>

            {user.id_role == USER_ROLE.ADMIN && (
              <Tooltip title="Thêm mới">
                <Button
                  icon={<FileAddFilled />}
                  onClick={() => navigate(`/home/form-drad-v3`)}
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
          className={styles.filterCard}
          title={
            <Space>
              <FilterOutlined />
              <span>Bộ lọc</span>
              <Tag color="blue">{total} bản ghi</Tag>
            </Space>
          }
          extra={
            <Space>
              <Button onClick={resetUi}>Reset</Button>
              <Button type="primary" onClick={applySearch}>
                Tìm kiếm
              </Button>
            </Space>
          }
        >
          <Row gutter={[16, 12]}>
            <Col xs={24} md={8} lg={6}>
              <Form.Item label="Từ khóa">
                <Input
                  placeholder="Tên mẫu / Code / ICD-10..."
                  value={uiFilters.search}
                  onChange={(e) =>
                    setUiFilters((s) => ({ ...s, search: e.target.value }))
                  }
                  allowClear
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={6} lg={4}>
              <Form.Item label="ID bác sĩ">
                <Input
                  placeholder="Nhập ID"
                  value={uiFilters.id_doctor}
                  onChange={(e) =>
                    setUiFilters((s) => ({ ...s, id_doctor: e.target.value }))
                  }
                  type="number"
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={8} lg={6}>
              <Form.Item label="Phân hệ">
                <Select
                  allowClear
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
                  {templateServices.map((t) => (
                    <Option key={t.id} value={t.id}>
                      {t.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} md={8} lg={6}>
              <Form.Item label="Bộ phận">
                <Select
                  allowClear
                  placeholder="Chọn bộ phận"
                  value={uiFilters.id_exam_part}
                  onChange={(v) =>
                    setUiFilters((s) => ({ ...s, id_exam_part: v }))
                  }
                  disabled={!uiFilters.id_template_service}
                >
                  {examParts
                    .filter(
                      (e) =>
                        String(e.id_template_service) ===
                        String(uiFilters.id_template_service)
                    )
                    .map((e) => (
                      <Option key={e.id} value={e.id}>
                        {e.name}
                      </Option>
                    ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={6} lg={4}>
              <Form.Item label="Trạng thái">
                <Select
                  allowClear
                  placeholder="Tất cả"
                  value={uiFilters.status}
                  onChange={(v) => setUiFilters((s) => ({ ...s, status: v }))}
                  options={[
                    { value: 1, label: "Nháp" },
                    { value: 2, label: "Hoàn thành" },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12} lg={8}>
              <Form.Item label="Khoảng ngày">
                <RangePicker
                  style={{ width: "100%" }}
                  value={uiFilters.range}
                  onChange={(range) => setUiFilters((s) => ({ ...s, range }))}
                />
              </Form.Item>
            </Col>

            <Col xs={12} md={6} lg={4}>
              <Form.Item label="Ngôn ngữ">
                <Select
                  allowClear
                  placeholder="Tất cả"
                  value={uiFilters.language}
                  onChange={(v) => setUiFilters((s) => ({ ...s, language: v }))}
                  options={[
                    { value: "vi", label: "Tiếng Việt" },
                    { value: "en", label: "English" },
                  ]}
                />
              </Form.Item>
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
        {cloneOpen && (
          <FormVer3CloneModal
            open={cloneOpen}
            onCancel={() => setCloneOpen(false)}
            cloneRecord={cloneRecord}
            onSuccess={(id) => {
              navigate("/home/form-drad-v3/detail/" + id);
            }} // ✅ reload list sau khi clone
          />
        )}
      </div>
    </Spin>
  );
}
