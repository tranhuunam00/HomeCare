// src/pages/templates/TemplateList.jsx
import React, { useEffect, useState } from "react";
import { Table, Input, Row, Col, Select, Spin, Button } from "antd";
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

  const [clinicMap, setClinicMap] = useState({});
  const [serviceMap, setServiceMap] = useState({});

  const [filter, setFilter] = useState({
    id: "",
    name: "",
    id_clinic: null,
    id_template_service: null,
  });
  const [submittedFilter, setSubmittedFilter] = useState(null);

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

      map[-1] = "Dùng chung";
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
    if (!submittedFilter) return;
    setLoading(true);
    try {
      const res = await API_CALL.get("/templates", {
        params: {
          ...submittedFilter,
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

    // Auto fetch once when page loads
    setSubmittedFilter({
      id: "",
      name: "",
      id_clinic: null,
      id_template_service: null,
    });
  }, []);

  useEffect(() => {
    fetchTemplates();
  }, [page, limit, submittedFilter]);

  const handleDeleteTemplate = async (id) => {
    const confirmed = window.confirm("Bạn có chắc chắn muốn xóa mẫu này?");
    if (!confirmed) return;
    try {
      setLoading(true);
      await API_CALL.del(`/templates/${id}`);
      toast.success("Đã xóa thành công");
      fetchTemplates();
    } catch (err) {
      toast.error("Xóa thất bại, vui lòng thử lại");
    } finally {
      setLoading(false);
    }
  };

  const handleCloneTemplate = async ({
    record,
    language = "vi",
    parentId,
    name,
  }) => {
    try {
      setLoading(true);
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const payload = {
        ...record,
        id: record.id,
        name: name || `${record.name} - Copy ${timestamp}`,
        createdAt: Date.now(),
        updated_at: Date.now(),
        parentId,
        language,
        isClone: true,
      };
      await API_CALL.post("/templates", payload, { timeout: 120000 });
      toast.success("Đã clone mẫu thành công");
      fetchTemplates();
    } catch (err) {
      console.error("Lỗi clone template:", err);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { title: "ID", dataIndex: "id", key: "id", width: 60, align: "center" },
    { title: "Tên", dataIndex: "name", key: "name" },
    { title: "Ngôn ngữ", dataIndex: "language", key: "language", width: 60 },
    { title: "Id cha", dataIndex: "parentId", key: "parentId", width: 60 },
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
            <Button type="link" onClick={() => handleCloneTemplate({ record })}>
              Copy
            </Button>
            <Button
              type="link"
              onClick={() =>
                handleCloneTemplate({
                  record,
                  language: "en",
                  parentId: record.id,
                  name: record.name + " Phiên bản tiếng anh " + new Date(),
                })
              }
            >
              Nhân bản sang tiếng Anh
            </Button>
          </>
        );
      },
    },
  ];

  return (
    <Spin spinning={loading} tip="Đang tải dữ liệu...">
      <div className={styles.TemplateList}>
        <h2 className={styles.title}>Danh sách Template Mẫu</h2>
        <Row
          gutter={16}
          align="middle"
          style={{ marginBottom: 24, flexWrap: "wrap" }}
        >
          <Col>
            <Input
              placeholder="ID..."
              value={filter.id}
              onChange={(e) =>
                setFilter((prev) => ({ ...prev, id: e.target.value }))
              }
              allowClear
              style={{ width: 150 }}
            />
          </Col>
          <Col>
            <Input
              placeholder="Tên template..."
              value={filter.name}
              onChange={(e) =>
                setFilter((prev) => ({ ...prev, name: e.target.value }))
              }
              allowClear
              style={{ width: 200 }}
            />
          </Col>
          <Col>
            <Select
              value={filter.id_clinic}
              onChange={(val) =>
                setFilter((prev) => ({ ...prev, id_clinic: val }))
              }
              allowClear
              placeholder="Phòng khám"
              style={{ width: 180 }}
            >
              {Object.entries(clinicMap).map(([id, name]) => (
                <Option key={id} value={id}>
                  {name}
                </Option>
              ))}
            </Select>
          </Col>
          <Col>
            <Select
              value={filter.id_template_service}
              onChange={(val) =>
                setFilter((prev) => ({ ...prev, id_template_service: val }))
              }
              allowClear
              placeholder="Dịch vụ"
              style={{ width: 180 }}
            >
              {Object.entries(serviceMap).map(([id, name]) => (
                <Option key={id} value={id}>
                  {name}
                </Option>
              ))}
            </Select>
          </Col>
          <Col>
            <Button
              type="primary"
              icon={<FilterOutlined />}
              onClick={() => {
                setPage(1);
                setSubmittedFilter(filter);
              }}
            >
              Tìm kiếm
            </Button>
          </Col>
          <Col flex="auto" style={{ textAlign: "right" }}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate("/home/templates/add")}
            >
              Thêm mới
            </Button>
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
    </Spin>
  );
};

export default TemplateList;
