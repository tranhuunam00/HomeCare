import React, { useEffect, useState } from "react";
import { Table, Input, Row, Col, Card, Spin, Button } from "antd";
import { EditOutlined, FilterOutlined, PlusOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";
import styles from "./ExamPartList.module.scss";
import ExamPartModal from "./ExamPartModal";
import API_CALL from "../../../services/axiosClient";

const ExamPartList = () => {
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [searchName, setSearchName] = useState("");

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
          name: searchName,
          page,
          limit,
        },
      });

      const responseData = res.data;
      setParts(responseData?.data || []);
      setTotal(responseData?.total || 0);
    } catch (err) {
      console.error("Lỗi lấy danh sách exam part:", err);
      toast.error(err?.response?.data?.message || "Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchParts();
  }, [page, limit, searchName]);

  const columns = [
    { title: "ID", dataIndex: "id", key: "id", align: "center" },
    { title: "Tên", dataIndex: "name", key: "name" },
    { title: "Tên rút gọn", dataIndex: "short_name", key: "short_name" },
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
      render: (_, record) => (
        <Button
          icon={<EditOutlined />}
          type="link"
          onClick={() => openEditModal(record)}
        >
          Chỉnh sửa
        </Button>
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

      <Row gutter={16} className={styles.filterGroup}>
        <Col span={6}>
          <Card
            size="small"
            title={
              <>
                <FilterOutlined /> Bộ lọc
              </>
            }
          >
            <Input
              placeholder="Tìm theo tên..."
              value={searchName}
              onChange={(e) => {
                setPage(1);
                setSearchName(e.target.value);
              }}
              allowClear
              style={{ marginBottom: 8 }}
            />
          </Card>
        </Col>
      </Row>

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
              setPage(p);
              setLimit(l);
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
