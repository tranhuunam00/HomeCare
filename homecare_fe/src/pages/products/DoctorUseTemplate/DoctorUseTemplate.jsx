import React, { useEffect, useState } from "react";
import {
  Table,
  Input,
  Row,
  Col,
  Card,
  Spin,
  Button,
  Tag,
  Modal,
  Form,
  Upload,
  message,
} from "antd";
import {
  EditOutlined,
  FilterOutlined,
  FilePdfOutlined,
  InboxOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import styles from "./DoctorUseTemplate.module.scss";
import API_CALL from "../../../services/axiosClient";

const { Dragger } = Upload;

const DoctorPrintTemplateList = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchName, setSearchName] = useState("");

  const [modalVisible, setModalVisible] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [form] = Form.useForm();

  const navigate = useNavigate();

  const fetchList = async () => {
    setLoading(true);
    try {
      const res = await API_CALL.get("/doctor-print-template", {
        params: {
          name: searchName,
          page,
          limit: 10,
        },
      });

      setList(res.data.data?.data || res.data.data || []);
      setTotal(res.data.data?.count || res.data.total || 0);
    } catch (err) {
      console.error("Lỗi khi lấy danh sách doctor print template:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, [page, searchName]);

  const handleOpenEdit = (record) => {
    setCurrentItem(record);
    form.setFieldsValue({ name: record.name });
    setModalVisible(true);
  };

  const handleUpload = async () => {
    try {
      const values = await form.validateFields();

      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("status", currentItem.status || 1);

      if (selectedFile) {
        formData.append("pdf", selectedFile);
      }

      await API_CALL.put(`/doctor-print-template/${currentItem.id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      message.success("Cập nhật thành công!");
      setModalVisible(false);
      setSelectedFile(null);
      fetchList();
    } catch (err) {
      console.error(err);
      message.error("Cập nhật thất bại!");
    }
  };

  const columns = [
    { title: "ID", dataIndex: "id", key: "id" },
    { title: "Tên", dataIndex: "name", key: "name" },
    { title: "ID Bác sĩ", dataIndex: "id_doctor", key: "id_doctor" },
    { title: "ID Phòng khám", dataIndex: "id_clinic", key: "id_clinic" },
    {
      title: "File PDF",
      dataIndex: "pdf_url",
      key: "pdf_url",
      render: (url) =>
        url ? (
          <a href={url} target="_blank" rel="noreferrer">
            <FilePdfOutlined /> Xem PDF
          </a>
        ) : (
          <Tag color="warning">Chưa có file</Tag>
        ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (val) =>
        val === 1 ? (
          <Tag color="green">Đang dùng</Tag>
        ) : (
          <Tag color="default">Không dùng</Tag>
        ),
    },
    {
      title: "Cập nhật",
      dataIndex: "updatedAt",
      key: "updatedAt",
      render: (date) => (date ? new Date(date).toLocaleString() : "—"),
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Button
          icon={<EditOutlined />}
          type="primary"
          onClick={() => handleOpenEdit(record)}
        >
          Chỉnh sửa
        </Button>
      ),
    },
  ];

  return (
    <div className={styles.TemplateList}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <h2 className={styles.title}>Danh sách File PDF Mẫu In của Bác sĩ</h2>
        </Col>
        <Col>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => navigate("/home/doctor-print-template/create")}
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
              onChange={(e) => setSearchName(e.target.value)}
              allowClear
              style={{ marginBottom: 8 }}
            />
          </Card>
        </Col>
      </Row>

      <Spin spinning={loading}>
        <Table
          rowKey="id"
          dataSource={list}
          columns={columns}
          pagination={{
            current: page,
            pageSize: 10,
            total,
            onChange: (p) => setPage(p),
          }}
        />
      </Spin>

      <Modal
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleUpload}
        title="Cập nhật mẫu in của bác sĩ"
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Tên file"
            rules={[{ required: true, message: "Vui lòng nhập tên" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item label="Tải lên PDF mới (chỉ 1 file)">
            <Upload
              beforeUpload={(file) => {
                setSelectedFile(file);
                return false; // Không upload ngay
              }}
              fileList={selectedFile ? [selectedFile] : []}
              onRemove={() => setSelectedFile(null)}
              accept=".pdf"
              maxCount={1}
            >
              <Button icon={<FilePdfOutlined />}>Chọn file PDF</Button>
            </Upload>

            {currentItem?.pdf_url && !selectedFile && (
              <div style={{ marginTop: 8 }}>
                <a
                  href={currentItem.pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FilePdfOutlined /> Xem file hiện tại
                </a>
              </div>
            )}
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DoctorPrintTemplateList;
