import React, { useEffect, useState } from "react";
import {
  Table,
  Input,
  Row,
  Col,
  Card,
  Spin,
  Button,
  Popconfirm,
  Tooltip,
  Select,
} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  FilterOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { toast } from "react-toastify";
import styles from "./ExamPartList.module.scss";
import ExamPartModal from "./ExamPartModal";
import API_CALL from "../../../services/axiosClient";
import { useGlobalAuth } from "../../../contexts/AuthContext";

const ExamPartList = () => {
  const { templateServices } = useGlobalAuth();

  const serviceNameMap = React.useMemo(() => {
    const m = new Map();
    (templateServices || []).forEach((s) => m.set(s.id, s.name));
    return m;
  }, [templateServices]);

  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);

  const [searchDraft, setSearchDraft] = useState("");
  const [selectedServiceDraft, setSelectedServiceDraft] = useState();

  const [searchName, setSearchName] = useState("");
  const [selectedServiceId, setSelectedServiceId] = useState();

  const [modalOpen, setModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editRecord, setEditRecord] = useState(null);

  const openCreateModal = () => {
    setIsEdit(false);
    setEditRecord(null);
    setModalOpen(true);
  };

  const openEditModal = (record) => {
    setIsEdit(true);
    setEditRecord(record);
    setModalOpen(true);
  };

  const handleSubmit = async (formData) => {
    try {
      if (isEdit) {
        await API_CALL.patch(`/ts/exam-parts/${editRecord.id}`, formData);
        toast.success("Cập nhật thành công");
      } else {
        await API_CALL.post(`/ts/exam-parts`, formData);
        toast.success("Tạo mới thành công");
      }
      fetchParts();
      setModalOpen(false);
    } catch (err) {
      toast.error("Lỗi xử lý dữ liệu");
      console.error(err);
    }
  };

  const fetchParts = async () => {
    setLoading(true);
    try {
      const res = await API_CALL.get("/ts/exam-parts", {
        params: {
          name: searchName || undefined,
          id_template_service: selectedServiceId || undefined,
          page,
          limit,
        },
      });
      const responseData = res.data;
      setParts(responseData?.data?.data || []);
      setTotal(responseData?.data.total || 0);
    } catch (err) {
      console.error("Lỗi lấy danh sách exam part:", err);
      toast.error(err?.response?.data?.message || "Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParts();
  }, [page, limit, searchName, selectedServiceId]);

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      await API_CALL.del(`/ts/exam-parts/${id}`);
      toast.success("Đã xoá thành công");
      await fetchParts();
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "STT",
      key: "index",
      align: "center",
      render: (_, __, index) => (page - 1) * limit + index + 1,
      width: 70,
    },
    { title: "ID", dataIndex: "id", key: "id", align: "center" },
    { title: "Tên", dataIndex: "name", key: "name", width: 150 },
    {
      title: "Tên (EN)",
      dataIndex: "name_en",
      key: "name_en",
      width: 180,
      render: (v, record) => v || record.name,
    },
    {
      title: "Phân hệ",
      key: "service",
      dataIndex: "id_template_service",
      width: 200,
      render: (_, record) =>
        serviceNameMap.get(record.id_template_service) ||
        record?.id_template_service_template_service?.name ||
        "—",
    },
    // { title: "Tên rút gọn", dataIndex: "short_name", key: "short_name" },
    { title: "Mã code", dataIndex: "code", key: "code" },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => (status ? "Hoạt động" : "Ẩn"),
    },
    {
      title: "Thao tác",
      key: "action",
      align: "center",
      render: (_, record) => (
        <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
          <Tooltip title="Chỉnh sửa">
            <Button
              icon={<EditOutlined />}
              type="text"
              shape="circle"
              onClick={() => openEditModal(record)}
            />
          </Tooltip>

          <Popconfirm
            title="Xoá mục này?"
            description={`Bạn chắc chắn muốn xoá "${record.name}"?`}
            okText="Xoá"
            cancelText="Huỷ"
            okButtonProps={{ danger: true }}
            onConfirm={() => handleDelete(record.id)}
          >
            <Tooltip title="Xoá">
              <Button
                icon={<DeleteOutlined />}
                type="text"
                danger
                shape="circle"
              />
            </Tooltip>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div className={styles.ExamPartList}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <h2 className={styles.title}>Danh sách bộ phận thăm khám</h2>
        </Col>
        <Col>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={openCreateModal}
          >
            Tạo mới
          </Button>
        </Col>
      </Row>

      <Card
        size="small"
        title={
          <>
            <FilterOutlined /> Bộ lọc - {total} bản ghi
          </>
        }
        extra={
          <div style={{ display: "flex", gap: 8 }}>
            <Button
              type="primary"
              onClick={() => {
                setPage(1);
                setSearchName(searchDraft);
                setSelectedServiceId(selectedServiceDraft);
              }}
            >
              Tìm kiếm
            </Button>
            <Button
              onClick={() => {
                setPage(1);
                setLimit(10); // optional: nếu muốn reset luôn pageSize
                setSearchDraft("");
                setSelectedServiceDraft(undefined);
                setSearchName("");
                setSelectedServiceId(undefined);
              }}
            >
              Xoá lọc
            </Button>
          </div>
        }
      >
        <Row>
          <Col>
            <Input
              placeholder="Tìm theo tên..."
              value={searchDraft}
              onChange={(e) => setSearchDraft(e.target.value)}
              allowClear
              style={{ marginBottom: 8 }}
            />
          </Col>
          <Col>
            <Select
              allowClear
              placeholder="Chọn phân hệ..."
              value={selectedServiceDraft}
              onChange={(v) => setSelectedServiceDraft(v)}
              style={{ width: "100%" }}
            >
              {(templateServices || []).map((s) => (
                <Select.Option key={s.id} value={s.id}>
                  {s.name}
                </Select.Option>
              ))}
            </Select>
          </Col>
        </Row>
      </Card>

      <Spin spinning={loading}>
        <Table
          rowKey="id"
          dataSource={parts}
          columns={columns}
          pagination={{
            current: page,
            pageSize: limit,
            total,
            showSizeChanger: true,
            onChange: (p, l) => {
              if (l !== limit) {
                setPage(1); //
                setLimit(l);
              } else {
                setPage(p);
              }
            },
          }}
        />
      </Spin>

      <ExamPartModal
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        initialValues={editRecord}
        isEdit={isEdit}
      />
    </div>
  );
};

export default ExamPartList;
