import React, { useEffect, useState, useMemo, useRef } from "react";
import {
  Table,
  Input,
  Row,
  Col,
  Card,
  Button,
  Modal,
  Spin,
  Form,
  Popconfirm,
  Select,
  Tag,
} from "antd";
import {
  FilterOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  SearchOutlined,
  UploadOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import { toast } from "react-toastify";
import styles from "./FormVer2NameList.module.scss";
import API_CALL from "../../../services/axiosClient";
import { useGlobalAuth } from "../../../contexts/AuthContext";

const { Option } = Select;

const FormVer2NameList = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // lấy từ context
  const { examParts, templateServices } = useGlobalAuth();

  // file input ref (ẩn) cho nút Import
  const fileInputRef = useRef(null);

  // list + paging
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);
  const [orderBy, setOrderBy] = useState("id");
  const [orderDir, setOrderDir] = useState("ASC");

  // filters
  const [q, setQ] = useState("");
  const [selectedExamPartId, setSelectedExamPartId] = useState();
  const [selectedTemplateServiceId, setSelectedTemplateServiceId] = useState();
  const [isUsedFilter, setIsUsedFilter] = useState();
  const [languageFilter, setLanguageFilter] = useState();

  // modal
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // map id -> name để render nhanh trên bảng
  const examPartNameById = useMemo(() => {
    const map = new Map();
    (examParts || []).forEach((p) => map.set(p.id, p.name));
    return map;
  }, [examParts]);

  const templateServiceNameById = useMemo(() => {
    const map = new Map();
    (templateServices || []).forEach((s) => map.set(s.id, s.name));
    return map;
  }, [templateServices]);

  const params = useMemo(
    () => ({
      page,
      limit,
      q: q?.trim() || undefined,
      id_exam_part: selectedExamPartId,
      id_template_service: selectedTemplateServiceId,
      isUsed: isUsedFilter,
      language: languageFilter,
      orderBy,
      orderDir,
    }),
    [
      page,
      limit,
      q,
      selectedExamPartId,
      selectedTemplateServiceId,
      isUsedFilter,
      orderBy,
      languageFilter,
      orderDir,
    ]
  );

  const fetchList = async () => {
    setLoading(true);
    try {
      const res = await API_CALL.get("/form-ver2-names", { params });
      const data = res?.data?.data;
      setItems(data?.items || []);
      setTotal(data?.total || 0);
      setPage(data?.page || 1);
      setLimit(data?.limit || 20);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Lỗi tải danh sách");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit]);

  const onSearch = () => {
    setPage(1);
    fetchList();
  };

  const onResetFilters = () => {
    setQ("");
    setSelectedExamPartId(undefined);
    setSelectedTemplateServiceId(undefined);
    setIsUsedFilter(undefined);
    setPage(1);
    setLimit(20);
    fetchList();
    setLanguageFilter(undefined);
  };

  const openCreate = () => {
    setEditingId(null);
    form.resetFields();
    setOpen(true);
  };

  const openEdit = (record) => {
    setEditingId(record.id);
    form.setFieldsValue({
      name: record.name,
      code: record.code,
      id_exam_part: record.id_exam_part,
      id_template_service: record.id_template_service,
    });
    setOpen(true);
  };

  const handleSubmit = async (values) => {
    try {
      if (editingId) {
        await API_CALL.patch(`/form-ver2-names/${editingId}`, values);
        toast.success("Cập nhật thành công");
      } else {
        await API_CALL.post("/form-ver2-names", values);
        toast.success("Thêm mới thành công");
      }
      setOpen(false);
      form.resetFields();
      setEditingId(null);
      fetchList();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Lỗi xử lý");
    }
  };

  const handleDelete = async (id) => {
    try {
      await API_CALL.del(`/form-ver2-names/${id}`);
      toast.success("Đã xoá");
      if ((items?.length || 0) <= 1 && page > 1) setPage(page - 1);
      else fetchList();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Xoá thất bại");
    }
  };

  // ================== IMPORT & DOWNLOAD SAMPLE ==================
  const handleClickImport = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e?.target?.files?.[0];
    if (!file) return;

    const resetInput = () => {
      if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const allowed = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ];
    if (!allowed.includes(file.type)) {
      toast.error("Vui lòng chọn file Excel (.xlsx/.xls)");
      resetInput();
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await API_CALL.post(
        "/form-ver2-names/import-formver2-name",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          timeout: 300000, // 300s = 5 phút
          timeoutErrorMessage: "Import quá thời gian chờ. Vui lòng thử lại.",
        }
      );

      const data = res?.data?.data?.data || {};

      const { created, skipped, createdServices, createdExamParts, errors } =
        data;

      toast.success(
        `Import xong: ${created || 0} tạo mới, ${skipped || 0} bỏ qua` +
          (createdServices ? `, ${createdServices} phân hệ mới` : "") +
          (createdExamParts ? `, ${createdExamParts} bộ phận mới` : "")
      );

      if (errors?.length) {
        console.warn("Import errors:", errors);
        toast.warn(`Có ${errors.length} dòng lỗi. Xem console để chi tiết.`);
      }

      fetchList();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Import thất bại");
    } finally {
      setUploading(false);
      resetInput();
    }
  };

  const handleDownloadSample = () => {
    const header = ["Phân hệ", "Bộ phận", "Mã định danh", "Tên mẫu"];
    const rows = [
      [
        "ĐQCT",
        "Bụng",
        "DRAD-IRSA-02",
        "Đốt sóng cao tần (RFA) u gan dưới CLVT",
      ],
    ];

    const escapeCsv = (v) => {
      if (v == null) return "";
      const s = String(v);
      if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
      return s;
    };

    const csv = [header, ...rows]
      .map((r) => r.map(escapeCsv).join(","))
      .join("\n");
    const blob = new Blob([`\ufeff${csv}`], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "formver2_name_import_sample.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  // ==============================================================

  const columns = [
    {
      title: "STT",
      key: "stt",
      width: 70,
      align: "center",
      render: (_, __, index) => (page - 1) * limit + index + 1,
    },
    {
      title: "ID",
      width: 70,
      dataIndex: "id",
      key: "id",
      align: "center",
    },
    {
      title: "Code",
      dataIndex: "code",
      key: "code",
      width: 130,
      render: (v) => v || "",
    },
    {
      title: "Tên mẫu",
      dataIndex: "name",
      key: "name",
      width: 330,
      render: (v) => v || "",
    },

    {
      title: "Bộ phận",
      dataIndex: "id_exam_part",
      key: "id_exam_part",
      width: 200,
      render: (id) => examPartNameById.get(id) || id || "",
    },
    {
      title: "Phân hệ",
      dataIndex: "id_template_service",
      key: "id_template_service",
      width: 220,
      render: (id) => templateServiceNameById.get(id) || id || "",
    },
    {
      title: "Đã sử dụng?",
      dataIndex: "isUsed",
      key: "isUsed",
      width: 140,
      render: (val) =>
        val ? <Tag color="green">Đã dùng</Tag> : <Tag>Chưa dùng</Tag>,
    },
    {
      title: "id_root",
      dataIndex: "id_root",
      key: "id_root",
      width: 70,
      render: (v) => v || "",
    },
    {
      title: "Hành động",
      key: "actions",
      width: 220,
      render: (_, record) => (
        <div className={styles.actions}>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => openEdit(record)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Bạn chắc chắn muốn xoá?"
            okText="Xoá"
            cancelText="Huỷ"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button size="small" danger icon={<DeleteOutlined />}>
              Xoá
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h2 className={styles.title}>Danh sách tên mẫu form</h2>
        <div className={styles.headerActions}>
          <Button icon={<ReloadOutlined />} onClick={fetchList}>
            Tải lại
          </Button>
          <Button
            icon={<UploadOutlined />}
            loading={uploading}
            onClick={handleClickImport}
          >
            Import file
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
          <Button icon={<DownloadOutlined />} onClick={handleDownloadSample}>
            Tải file mẫu
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            Thêm mới
          </Button>
        </div>
      </div>

      {/* ===== Bộ lọc ===== */}
      <Row gutter={16} className={styles.filterRow}>
        <Col span={24}>
          <Card
            size="small"
            title={
              <>
                <FilterOutlined /> Bộ lọc --- {total} bản ghi
              </>
            }
            extra={
              <div className={styles.filterActions}>
                <Button icon={<SearchOutlined />} onClick={onSearch}>
                  Tìm
                </Button>
                <Button onClick={onResetFilters}>Xoá lọc</Button>
              </div>
            }
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={8} lg={6}>
                <label>Tên mẫu</label>
                <Input
                  placeholder="Nhập từ khoá…"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  onPressEnter={onSearch}
                  allowClear
                />
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <label>Phân hệ</label>
                <Select
                  allowClear
                  placeholder="Chọn phân hệ…"
                  value={selectedTemplateServiceId}
                  onChange={(v) => {
                    setSelectedTemplateServiceId(v);
                    setSelectedExamPartId(undefined); // reset bộ phận
                  }}
                  style={{ width: "100%" }}
                  showSearch
                  optionFilterProp="children"
                >
                  {(templateServices || []).map((s) => (
                    <Option key={s.id} value={s.id}>
                      {s.name}
                    </Option>
                  ))}
                </Select>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <label>Bộ phận</label>
                <Select
                  allowClear
                  placeholder="Chọn bộ phận…"
                  value={selectedExamPartId}
                  onChange={setSelectedExamPartId}
                  style={{ width: "100%" }}
                  showSearch
                  optionFilterProp="children"
                  disabled={!selectedTemplateServiceId}
                >
                  {(examParts || [])
                    .filter(
                      (p) =>
                        String(p.id_template_service) ===
                        String(selectedTemplateServiceId)
                    )
                    .map((p) => (
                      <Option key={p.id} value={p.id}>
                        {p.name}
                      </Option>
                    ))}
                </Select>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <label>Ngôn ngữ</label>
                <Select
                  allowClear
                  placeholder="Tất cả ngôn ngữ"
                  value={languageFilter}
                  onChange={(v) => setLanguageFilter(v || undefined)}
                  style={{ width: "100%" }}
                >
                  <Option value="vi">Tiếng Việt</Option>
                  <Option value="us">Tiếng Anh (US)</Option>
                </Select>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <label>Đã sử dụng?</label>
                <Select
                  allowClear
                  placeholder="Chọn trạng thái…"
                  value={isUsedFilter}
                  onChange={setIsUsedFilter}
                  style={{ width: "100%" }}
                >
                  <Option value={"true"}>Đã dùng</Option>
                  <Option value={"false"}>Chưa dùng</Option>
                </Select>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <label>Sắp xếp theo</label>
                <Select
                  value={orderBy}
                  onChange={(v) => setOrderBy(v)}
                  style={{ width: "100%" }}
                >
                  <Option value="id">ID</Option>
                  <Option value="name">Tên mẫu</Option>
                  <Option value="code">Code</Option>
                  <Option value="createdAt">Ngày tạo</Option>
                </Select>
              </Col>

              <Col xs={24} sm={12} md={8} lg={6}>
                <label>Thứ tự</label>
                <Select
                  value={orderDir}
                  onChange={(v) => setOrderDir(v)}
                  style={{ width: "100%" }}
                >
                  <Option value="ASC">Tăng dần</Option>
                  <Option value="DESC">Giảm dần</Option>
                </Select>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      <Spin spinning={loading}>
        <Table
          dataSource={items}
          columns={columns}
          rowKey="id"
          pagination={{
            current: page,
            pageSize: limit,
            total,
            showSizeChanger: true,
            onChange: (p, ps) => {
              setPage(p);
              setLimit(ps);
            },
          }}
        />
      </Spin>

      <Modal
        title={editingId ? "Chỉnh sửa tên mẫu" : "Thêm tên mẫu mới"}
        open={open}
        onCancel={() => {
          setOpen(false);
          setEditingId(null);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        okText={editingId ? "Cập nhật" : "Thêm"}
        cancelText="Huỷ"
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="name"
            label="Tên mẫu"
            rules={[
              { required: true, message: "Vui lòng nhập tên mẫu" },
              { max: 255, message: "Tối đa 255 ký tự" },
            ]}
          >
            <Input placeholder="VD: Mẫu siêu âm tuyến giáp" />
          </Form.Item>

          <Form.Item
            name="code"
            label="Mã định danh (Code)"
            rules={[
              { required: true, message: "Vui lòng nhập code" },
              { max: 30, message: "Tối đa 30 ký tự theo cú pháp DRAD-" },
              {
                pattern: /^DRAD-[A-Za-z0-9-]+$/,
                message:
                  "Code phải bắt đầu bằng DRAD- và chỉ gồm A–Z, 0–9, dấu gạch nối (-)",
              },
            ]}
          >
            <Input
              placeholder="DRAD-IRSA-06"
              allowClear
              onChange={(e) =>
                form.setFieldsValue({ code: e.target.value.toUpperCase() })
              }
              onBlur={(e) => {
                let v = (e.target.value || "").trim().toUpperCase();
                if (v && !v.startsWith("DRAD-"))
                  v = `DRAD-${v.replace(/^DRAD-?/i, "")}`;
                form.setFieldsValue({ code: v });
              }}
            />
          </Form.Item>

          <Row gutter={12}>
            <Col span={12}>
              <Form.Item
                name="id_template_service"
                label="Phân hệ"
                rules={[{ required: true, message: "Vui lòng chọn phân hệ" }]}
              >
                <Select
                  placeholder="Chọn phân hệ…"
                  allowClear
                  showSearch
                  optionFilterProp="children"
                  onChange={() =>
                    form.setFieldsValue({ id_exam_part: undefined })
                  }
                >
                  {(templateServices || []).map((s) => (
                    <Option key={s.id} value={s.id}>
                      {s.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item shouldUpdate>
                {({ getFieldValue }) => {
                  const serviceId = getFieldValue("id_template_service");
                  return (
                    <Form.Item
                      name="id_exam_part"
                      label="Bộ phận"
                      rules={[
                        { required: true, message: "Vui lòng chọn bộ phận" },
                      ]}
                    >
                      <Select
                        placeholder="Chọn bộ phận…"
                        allowClear
                        showSearch
                        optionFilterProp="children"
                        disabled={!serviceId}
                      >
                        {(examParts || [])
                          .filter(
                            (p) =>
                              String(p.id_template_service) ===
                              String(serviceId)
                          )
                          .map((p) => (
                            <Option key={p.id} value={p.id}>
                              {p.name}
                            </Option>
                          ))}
                      </Select>
                    </Form.Item>
                  );
                }}
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default FormVer2NameList;
