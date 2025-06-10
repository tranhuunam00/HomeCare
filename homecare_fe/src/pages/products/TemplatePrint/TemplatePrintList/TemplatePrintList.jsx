// src/pages/templates/TemplatePrintList.jsx
import React, { useEffect, useState } from "react";
import { Table, Input, Row, Col, Card, Select, Spin, Button } from "antd";
import { FilterOutlined, PrinterOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import styles from "./TemplateList.module.scss";
import API_CALL from "../../../../services/axiosClient";

const { Option } = Select;

const TemplatePrintList = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchName, setSearchName] = useState("");
  const navigate = useNavigate();

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const res = await API_CALL.get("/templates", {
        params: {
          name: searchName,
          page,
          limit: 10,
        },
      });
      setTemplates(res.data.data.data);
      setTotal(res.data.data.count);
    } catch (err) {
      console.error("Lỗi khi lấy danh sách template:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, [page, searchName]);

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Tên",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Mô tả ngắn",
      dataIndex: "short_description",
      key: "short_description",
    },
    {
      title: "In kết quả",
      key: "action",
      render: (_, record) => (
        <Button
          icon={<PrinterOutlined />}
          type="primary"
          onClick={() => navigate(`/home/templates-print/${record.id}`)}
        >
          In mẫu
        </Button>
      ),
    },
  ];

  return (
    <div className={styles.TemplateList}>
      <h2 className={styles.title}>Danh sách mẫu in kết quả</h2>

      <Row gutter={16} className={styles.filterGroup}>
        <Col span={8}>
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
