import React, { useEffect, useState } from "react";
import {
  Table,
  Input,
  Select,
  Row,
  Col,
  Card,
  Button,
  Tag,
  Modal,
  Spin,
} from "antd";
import { FilterOutlined, EditOutlined } from "@ant-design/icons";
import API_CALL from "../../../services/axiosClient";
import { toast } from "react-toastify";
import styles from "./contactAdminList.module.scss";

const { Option } = Select;

const CONTACT_TYPES = [
  "hỗ trợ kỹ thuật",
  "phát triển phần mềm",
  "chỉnh sửa nội dung",
  "hợp tác kinh doanh",
  "khác",
];

const CONTACT_STATUSES = ["new", "in_progress", "resolved", "archived"];

const STATUS_COLORS = {
  new: "blue",
  in_progress: "orange",
  resolved: "green",
  archived: "default",
};

const ContactAdminList = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState({
    full_name: "",
    phone: "",
    type: "",
    status: "",
    page: 1,
    limit: 10,
  });

  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);

  const [total, setTotal] = useState(0);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      // Xử lý loại bỏ các key có giá trị "" hoặc undefined
      const cleanParams = Object.fromEntries(
        Object.entries(filters).filter(
          ([_, value]) => value !== "" && value !== undefined
        )
      );

      const res = await API_CALL.get("/contacts", {
        params: cleanParams,
      });

      setContacts(res.data.data.data);
      setTotal(res.data.data.total);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Lỗi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchContacts();
  }, [filters]);

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await API_CALL.patch(`/contacts/${id}/status`, {
        status: newStatus,
      });
      toast.success("Cập nhật trạng thái thành công");
      fetchContacts();
    } catch (err) {
      toast.error("Cập nhật thất bại");
    }
  };

  const columns = [
    { title: "ID", dataIndex: "id", key: "id", width: 60 },
    { title: "Họ tên", dataIndex: "full_name", key: "full_name" },
    { title: "SĐT", dataIndex: "phone", key: "phone" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Loại liên hệ", dataIndex: "type", key: "type" },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={STATUS_COLORS[status] || "default"}>{status}</Tag>
      ),
    },
    {
      title: "Nội dung",
      dataIndex: "message",
      key: "message",
      ellipsis: true,
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_, record) => (
        <div style={{ display: "flex", gap: 8 }}>
          <Button
            size="small"
            onClick={() => {
              setSelectedContact(record);
              setDetailModalVisible(true);
            }}
          >
            Chi tiết
          </Button>
          <Select
            size="small"
            defaultValue={record.status}
            onChange={(value) => handleStatusUpdate(record.id, value)}
          >
            {CONTACT_STATUSES.map((status) => (
              <Option key={status} value={status}>
                {status}
              </Option>
            ))}
          </Select>
        </div>
      ),
    },
  ];

  return (
    <div className={styles.contactList}>
      <h2 className={styles.contactList__title}>Quản lý liên hệ</h2>

      <Card
        size="small"
        title={
          <>
            <FilterOutlined /> Bộ lọc tìm kiếm
          </>
        }
        className={styles.filterCard}
      >
        <Row gutter={16}>
          <Col span={6}>
            <label>Họ tên</label>
            <Input
              value={filters.full_name}
              onChange={(e) =>
                setFilters({ ...filters, full_name: e.target.value, page: 1 })
              }
              placeholder="Tìm theo tên..."
            />
          </Col>
          <Col span={6}>
            <label>Số điện thoại</label>
            <Input
              value={filters.phone}
              onChange={(e) =>
                setFilters({ ...filters, phone: e.target.value, page: 1 })
              }
              placeholder="Tìm theo SĐT..."
            />
          </Col>
          <Col span={6}>
            <label>Loại liên hệ</label>
            <Select
              allowClear
              value={filters.type || undefined}
              onChange={(value) =>
                setFilters({ ...filters, type: value, page: 1 })
              }
              placeholder="Chọn loại liên hệ"
              style={{ width: "100%" }}
            >
              {CONTACT_TYPES.map((type) => (
                <Option key={type} value={type}>
                  {type}
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={6}>
            <label>Trạng thái</label>
            <Select
              allowClear
              value={filters.status || undefined}
              onChange={(value) =>
                setFilters({ ...filters, status: value, page: 1 })
              }
              placeholder="Chọn trạng thái"
              style={{ width: "100%" }}
            >
              {CONTACT_STATUSES.map((status) => (
                <Option key={status} value={status}>
                  {status}
                </Option>
              ))}
            </Select>
          </Col>
        </Row>
      </Card>

      <Spin spinning={loading}>
        <Table
          dataSource={contacts}
          columns={columns}
          rowKey="id"
          pagination={{
            current: filters.page,
            pageSize: filters.limit,
            total: total,
            onChange: (page, pageSize) =>
              setFilters({ ...filters, page, limit: pageSize }),
          }}
        />
        <Modal
          open={detailModalVisible}
          title="Chi tiết liên hệ"
          onCancel={() => {
            setDetailModalVisible(false);
            setSelectedContact(null);
          }}
          footer={null}
        >
          {selectedContact && (
            <div style={{ lineHeight: 1.8 }}>
              <p>
                <strong>Họ tên:</strong> {selectedContact.full_name}
              </p>
              <p>
                <strong>SĐT:</strong> {selectedContact.phone}
              </p>
              <p>
                <strong>Email:</strong> {selectedContact.email}
              </p>
              <p>
                <strong>Loại liên hệ:</strong> {selectedContact.type}
              </p>
              <p>
                <strong>Trạng thái:</strong>{" "}
                <Tag color={STATUS_COLORS[selectedContact.status]}>
                  {selectedContact.status}
                </Tag>
              </p>
              <p>
                <strong>Nội dung:</strong>
                <br />
                {selectedContact.message}
              </p>
              {selectedContact.note && (
                <p>
                  <strong>Ghi chú:</strong>
                  <br />
                  {selectedContact.note}
                </p>
              )}
            </div>
          )}
        </Modal>
      </Spin>
    </div>
  );
};

export default ContactAdminList;
