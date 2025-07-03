// src/pages/templates/TemplateList.jsx
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
  Modal,
} from "antd";
import {
  EditOutlined,
  EyeOutlined,
  FilterOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import styles from "./TemplateList.module.scss";
import API_CALL from "../../../services/axiosClient";
import { useNavigate } from "react-router-dom";
import { useGlobalAuth } from "../../../contexts/AuthContext";
import { USER_ROLE } from "../../../constant/app";
import { toast } from "react-toastify";

const { Option } = Select;

const TemplateList = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [searchName, setSearchName] = useState("");
  const [clinicMap, setClinicMap] = useState({});
  const [serviceMap, setServiceMap] = useState({});

  const { user } = useGlobalAuth();
  const navigate = useNavigate();

  const fetchClinics = async () => {
    try {
      const res = await API_CALL.get("/clinics", {
        params: { page: 1, limit: 100 },
      });
      const map = {};
      res.data.data.data.forEach((clinic) => {
        map[clinic.id] = clinic.name;
      });
      setClinicMap(map);
    } catch (err) {
      console.error("Lỗi khi lấy clinic:", err);
    }
  };

  const fetchServices = async () => {
    try {
      const res = await API_CALL.get("/ts", {
        params: { page: 1, limit: 100 },
      });
      const map = {};
      res.data.data.data.forEach((service) => {
        map[service.id] = service.name;
      });
      setServiceMap(map);
    } catch (err) {
      console.error("Lỗi khi lấy service:", err);
    }
  };

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const res = await API_CALL.get("/templates", {
        params: {
          name: searchName,
          page,
          limit,
        },
      });
      setTemplates(res.data.data.data);
      setTotal(res.data.data.total);
    } catch (err) {
      console.error("Lỗi khi lấy templates:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClinics();
    fetchServices();
  }, []);

  useEffect(() => {
    fetchTemplates();
  }, [page, limit, searchName]);

  const handleDeleteTemplate = async (id) => {
    const confirmed = window.confirm("Bạn có chắc chắn muốn xóa mẫu này?");
    if (!confirmed) return;
    try {
      await API_CALL.del(`/templates/${id}`);
      toast.success("Đã xóa thành công");
      fetchTemplates();
    } catch (err) {
      toast.error("Xóa thất bại, vui lòng thử lại");
    }
  };

  const handleCloneTemplate = async (record) => {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const payload = {
        ...record,
        id: undefined,
        name: `${record.name} - Copy ${timestamp}`,
        createdAt: Date.now(),
        updated_at: Date.now(),
      };
      await API_CALL.post("/templates", payload);
      toast.success("Đã clone mẫu thành công");
      fetchTemplates();
    } catch (err) {
      console.error("Lỗi clone template:", err);
    }
  };

  const columns = [
    { title: "ID", dataIndex: "id", key: "id", width: 60, align: "center" },
    { title: "Tên", dataIndex: "name", key: "name" },
    {
      title: "Dịch vụ",
      dataIndex: "id_template_service",
      key: "id_template_service",
      render: (val) => serviceMap[val] || "-",
    },
    {
      title: "Phòng khám",
      dataIndex: "id_clinic",
      key: "id_clinic",
      render: (val) => clinicMap[val] || "-",
    },
    {
      title: "Mô tả ngắn",
      dataIndex: "short_description",
      key: "short_description",
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => new Date(date).toLocaleDateString("vi-VN"),
    },
    {
      title: "Ngày cập nhật",
      dataIndex: "updatedAt",
      key: "updatedAt",
      render: (date) => new Date(date).toLocaleDateString("vi-VN"),
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => {
        const isAdmin = user?.id_role === USER_ROLE.ADMIN;
        const isOwner = record.id_user === user?.id;
        return (
          <>
            <Button
              icon={<EyeOutlined />}
              onClick={() => navigate(`/home/templates/view/${record.id}`)}
              type="link"
            >
              Xem
            </Button>
            {(isAdmin || isOwner) && (
              <>
                <Button
                  icon={<EditOutlined />}
                  onClick={() => navigate(`/home/templates/edit/${record.id}`)}
                  type="link"
                >
                  Chỉnh sửa
                </Button>
                <Button
                  danger
                  type="link"
                  onClick={() => handleDeleteTemplate(record.id)}
                >
                  Xóa
                </Button>
              </>
            )}
            <Button type="link" onClick={() => handleCloneTemplate(record)}>
              Copy
            </Button>
          </>
        );
      },
    },
  ];

  return (
    <div className={styles.TemplateList}>
      <h2 className={styles.title}>Danh sách Template Mẫu</h2>
      <Button
        style={{ margin: 30 }}
        type="primary"
        icon={<PlusOutlined />}
        onClick={() => navigate("/home/templates/add")}
      >
        Thêm mới
      </Button>
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
              placeholder="Tên template..."
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              allowClear
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
    </div>
  );
};

export default TemplateList;
