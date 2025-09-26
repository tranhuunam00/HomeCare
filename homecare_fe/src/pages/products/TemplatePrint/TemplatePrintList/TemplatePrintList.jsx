import React, { useEffect, useState } from "react";
import { Table, Input, Row, Col, Card, Spin, Button } from "antd";
import {
  EditOutlined,
  FilterOutlined,
  PrinterOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import styles from "./TemplateList.module.scss";
import API_CALL from "../../../../services/axiosClient";
import { toast } from "react-toastify";
import { useGlobalAuth } from "../../../../contexts/AuthContext";
import { USER_ROLE } from "../../../../constant/app";

const TemplatePrintList = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchName, setSearchName] = useState("");

  const { user } = useGlobalAuth();
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

      const responseData = res.data.data;
      setTemplates(responseData?.data || []);
      setTotal(responseData?.total || 0);
    } catch (err) {
      console.error("Lỗi khi lấy danh sách template:", err);
      toast.error(err?.response?.data?.message || "Không thể tải danh sách");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, [page, searchName]);

  const handleDelete = async (id) => {
    const confirm = window.confirm(
      "Bạn có chắc chắn muốn xóa mẫu in này? Thao tác này không thể hoàn tác."
    );
    if (!confirm) return;

    try {
      await API_CALL.del(`/print-template/${id}`);
      toast.success("Đã xóa thành công");
      fetchTemplates();
    } catch (err) {
      toast.error("Xóa thất bại, vui lòng thử lại");
      console.error("Lỗi xóa template:", err);
    }
  };

  const handleClone = async (record) => {
    const confirm = window.confirm("Bạn có muốn clone mẫu in này không?");
    if (!confirm) return;

    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const payload = {
        ...record,
        id: undefined,
        name: `${record.name} - Copy ${timestamp}`,
        createdAt: Date.now(),
        updated_at: Date.now(),
      };

      await API_CALL.post("/print-template", payload);
      toast.success("Đã clone mẫu in thành công");
      fetchTemplates();
    } catch (err) {
      toast.error("Clone thất bại");
      console.error("Lỗi clone:", err);
    }
  };

  const columns = [
    {
      title: "STT",
      key: "stt",
      align: "center",
      width: 70,
      render: (_, __, index) => (page - 1) * 10 + index + 1,
    },
    { title: "ID", dataIndex: "id", key: "id", align: "center" },
    { title: "Tên", dataIndex: "name", key: "name" },
    {
      title: "Phân hệ",
      key: "id_template_service",
      align: "center",
      render: (_, record) =>
        record?.id_template_service_template_service?.name || "—",
    },
    {
      title: "Tên phòng khám",
      key: "id_clinic",
      align: "center",
      render: (_, record) => record?.id_clinic_clinic?.name || "—",
    },

    {
      title: "Phòng khám hiển thị",
      dataIndex: "clinic_name",
      key: "clinic_name",
    },
    {
      title: "Khoa hiển thị",
      dataIndex: "department_name",
      key: "department_name",
    },
    // { title: "Mã header", dataIndex: "code_header", key: "code_header" },
    // {
    //   title: "Logo",
    //   dataIndex: "logo_url",
    //   key: "logo_url",
    //   render: (url) =>
    //     url ? <img src={url} alt="logo" style={{ width: 40 }} /> : "—",
    // },
    // {
    //   title: "Kích hoạt",
    //   dataIndex: "is_active",
    //   key: "is_active",
    //   render: (active) => (active ? "✔️" : "❌"),
    // },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => {
        const isAdmin = user?.id_role == USER_ROLE.ADMIN;
        const isOwner = record.id_user == user?.id;

        return (
          <>
            <Button
              icon={<EditOutlined />}
              type="link"
              onClick={() =>
                navigate(`/home/templates-print/edit/${record.id}`)
              }
            >
              Chỉnh sửa
            </Button>

            {(isAdmin || isOwner) && (
              <Button
                danger
                type="link"
                onClick={() => handleDelete(record.id)}
              >
                Xóa
              </Button>
            )}

            <Button type="link" onClick={() => handleClone(record)}>
              Copy
            </Button>
          </>
        );
      },
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
          dataSource={templates}
          columns={columns}
          pagination={{
            current: page,
            pageSize: 10,
            total,
            showSizeChanger: false,
            onChange: (p) => setPage(p),
          }}
        />
      </Spin>
    </div>
  );
};

export default TemplatePrintList;
