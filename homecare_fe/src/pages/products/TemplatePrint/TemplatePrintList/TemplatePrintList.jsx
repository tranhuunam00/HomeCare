import React, { useEffect, useState } from "react";
import { Table, Input, Row, Col, Card, Spin, Button, Select } from "antd";
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
  const navigate = useNavigate();
  const { clinicsAll, user } = useGlobalAuth();

  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);

  const [filter, setFilter] = useState({
    name: "",
    id_clinic: undefined,
  });

  const [draft, setDraft] = useState({
    name: "",
    id_clinic: undefined,
  });

  const fetchTemplates = async () => {
    try {
      setLoading(true);

      const res = await API_CALL.get("/print-template", {
        params: {
          ...filter,
          page,
          limit: pageSize,
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
  }, [page, pageSize, filter]);

  const handleDelete = async (id) => {
    const confirm = window.confirm(
      "Bạn có chắc chắn muốn xóa mẫu in này? Thao tác này không thể hoàn tác.",
    );
    if (!confirm) return;

    try {
      await API_CALL.del(`/print-template/${id}`);
      toast.success("Đã xóa thành công");
      fetchTemplates();
    } catch (err) {
      console.error("Lỗi xóa:", err);
      toast.error("Xóa thất bại");
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
        updatedAt: Date.now(),
      };

      await API_CALL.post("/print-template", payload);

      toast.success("Clone thành công");
      fetchTemplates();
    } catch (err) {
      console.error(err);
      toast.error("Clone thất bại");
    }
  };

  const columns = [
    {
      title: "STT",
      key: "stt",
      align: "center",
      width: 70,
      render: (_, __, index) => (page - 1) * pageSize + index + 1,
    },
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      align: "center",
      width: 80,
    },
    {
      title: "Tên mẫu",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Tên phòng khám",
      key: "clinic",
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
    {
      title: "Thao tác",
      key: "action",
      width: 260,
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

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <Card
            size="small"
            title={
              <>
                <FilterOutlined /> Bộ lọc
              </>
            }
          >
            <Row gutter={8}>
              <Col span={12}>
                <Input
                  placeholder="Tìm theo tên..."
                  value={draft.name}
                  allowClear
                  onChange={(e) =>
                    setDraft((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
              </Col>

              <Col span={12}>
                <Select
                  allowClear
                  placeholder="Chọn phòng khám"
                  value={draft.id_clinic}
                  style={{ width: "100%" }}
                  onChange={(v) =>
                    setDraft((prev) => ({ ...prev, id_clinic: v }))
                  }
                >
                  {clinicsAll.map((c) => (
                    <Select.Option key={c.id} value={c.id}>
                      {c.name}
                    </Select.Option>
                  ))}
                </Select>
              </Col>

              <Col>
                <Button
                  type="primary"
                  onClick={() => {
                    setPage(1);
                    setFilter(draft);
                  }}
                >
                  Tìm kiếm
                </Button>
              </Col>

              <Col>
                <Button
                  onClick={() => {
                    const reset = { name: "", id_clinic: undefined };
                    setDraft(reset);
                    setFilter(reset);
                    setPage(1);
                  }}
                >
                  Reset
                </Button>
              </Col>
            </Row>
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
            pageSize: pageSize,
            total: total,
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "50", "100"],
            showTotal: (total) => `Tổng ${total} mẫu`,
            onChange: (p, size) => {
              setPage(p);
              setPageSize(size);
            },
          }}
        />
      </Spin>
    </div>
  );
};

export default TemplatePrintList;
