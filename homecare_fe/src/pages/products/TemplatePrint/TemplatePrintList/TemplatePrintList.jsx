// src/pages/templates/TemplatePrintList.jsx
import React, { useEffect, useState } from "react";
import {
  Table,
  Input,
  Row,
  Col,
  Card,
  Select,
  Spin,
  Button,
  InputNumber,
} from "antd";
import {
  EditOutlined,
  FilterOutlined,
  PrinterOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import styles from "./TemplateList.module.scss";
import API_CALL from "../../../../services/axiosClient";
import { toast } from "react-toastify";

const { Option } = Select;

const TemplatePrintList = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  // Bộ lọc
  const [searchName, setSearchName] = useState("");

  const navigate = useNavigate();

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const res = await API_CALL.get("/print-template", {
        params: {
          name: searchName,
          page,
          limit: 10,
        },
      });

      setTemplates(res.data.data?.data || res.data.data || []);
      setTotal(res.data.data?.count || res.data.total || 0);
    } catch (err) {
      console.error("Lỗi khi lấy danh sách template:", err);
      toast.error(err?.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, [page, searchName]);

  const columns = [
    { title: "ID", dataIndex: "id", key: "id" },
    { title: "Tên", dataIndex: "name", key: "name" },
    { title: "Phòng khám", dataIndex: "clinic_name", key: "clinic_name" },
    { title: "Khoa", dataIndex: "department_name", key: "department_name" },
    { title: "Mã header", dataIndex: "code_header", key: "code_header" },
    {
      title: "Logo",
      dataIndex: "logo_url",
      key: "logo_url",
      render: (url) =>
        url ? <img src={url} alt="logo" style={{ width: 40 }} /> : "—",
    },
    {
      title: "Kích hoạt",
      dataIndex: "is_active",
      key: "is_active",
      render: (active) => (active ? "✔️" : "❌"),
    },
    {
      title: "In kết quả",
      key: "action",
      render: (_, record) => (
        <Button
          icon={<EditOutlined />}
          type="primary"
          onClick={() => navigate(`/home/templates-print/edit/${record.id}`)}
        >
          Chỉnh sửa
        </Button>
      ),
    },

    {
      title: "Sử dụng",
      key: "action",
      render: (_, record) => (
        <Button
          icon={<UserOutlined />}
          type="link"
          onClick={() => navigate(`/home/templates-print/use/${record.id}`)}
        >
          Sử dụng
        </Button>
      ),
    },
  ];

  return (
    <div className={styles.TemplateList}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <h2 className={styles.title}>Danh sách mẫu in kết quả</h2>
        </Col>
        <Col>
          <Button
            type="primary"
            icon={<PrinterOutlined />}
            onClick={() => navigate("/home/templates-print/create")}
          >
            Tạo mới
          </Button>
        </Col>
      </Row>

      <Row gutter={16} className={styles.filterGroup}>
        <Col span={6}>
          <Card
            size="small"
            style={{ display: "flex" }}
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
          dataSource={templates}
          columns={columns}
          pagination={{
            current: page,
            pageSize: 10,
            total,
            onChange: (p) => setPage(p),
          }}
        />
      </Spin>
    </div>
  );
};

export default TemplatePrintList;
