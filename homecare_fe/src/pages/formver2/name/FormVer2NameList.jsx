import React, { useEffect, useState, useMemo } from "react";
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
} from "antd";
import {
  FilterOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { toast } from "react-toastify";
import styles from "./FormVer2NameList.module.scss";
import API_CALL from "../../../services/axiosClient";

const FormVer2NameList = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // list + paging
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);

  // filters
  const [q, setQ] = useState("");
  const [includeDeleted, setIncludeDeleted] = useState(false); // nếu sau này cần

  // modal
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const params = useMemo(
    () => ({
      page,
      limit,
      q: q?.trim() || undefined,
      includeDeleted: includeDeleted ? 1 : undefined,
    }),
    [page, limit, q, includeDeleted]
  );

  const fetchList = async () => {
    setLoading(true);
    try {
      const res = await API_CALL.get("/form-ver2-names", { params });
      const data = res?.data.data;
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
  }, [page, limit /* q để trigger bằng nút search riêng */]);

  const onSearch = () => {
    setPage(1);
    fetchList();
  };

  const onResetFilters = () => {
    setQ("");
    setPage(1);
    setLimit(20);
    fetchList();
  };

  const openCreate = () => {
    setEditingId(null);
    form.resetFields();
    setOpen(true);
  };

  const openEdit = async (record) => {
    setEditingId(record.id);
    form.setFieldsValue({ name: record.name });
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
      console.log("id", id);
      await API_CALL.del(`/form-ver2-names/${id}`);
      toast.success("Đã xoá");
      // nếu xoá hết trang hiện tại, lùi về trang trước
      if ((items?.length || 0) <= 1 && page > 1) setPage(page - 1);
      else fetchList();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Xoá thất bại");
    }
  };

  const columns = [
    { title: "ID", dataIndex: "id", key: "id", width: 80 },
    { title: "Tên mẫu", dataIndex: "name", key: "name" },
    {
      title: "Hành động",
      key: "actions",
      width: 180,
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
        <h2 className={styles.title}>Danh mục Tên Mẫu (FormVer2Name)</h2>
        <div className={styles.headerActions}>
          <Button icon={<ReloadOutlined />} onClick={fetchList}>
            Tải lại
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            Thêm mới
          </Button>
        </div>
      </div>

      <Row gutter={16} className={styles.filterRow}>
        <Col span={24}>
          <Card
            size="small"
            title={
              <>
                <FilterOutlined /> Bộ lọc
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
            <Row gutter={16}>
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
              {/* Nếu cần includeDeleted sau này thì thêm một Switch/Checkbox */}
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
        </Form>
      </Modal>
    </div>
  );
};

export default FormVer2NameList;
