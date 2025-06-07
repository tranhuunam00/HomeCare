import React, { useState } from "react";
import {
  Table,
  Input,
  Select,
  Tag,
  Row,
  Col,
  Card,
  Dropdown,
  Menu,
  Button,
  Modal,
} from "antd";
import styles from "./ClinicList.module.scss";
import StatusTag from "../../components/StatusTag/StatusTag";
import { FilterOutlined, MoreOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Option } = Select;

const customerData = [
  {
    key: "1",
    name: "Nguyễn Văn A",
    status: "Chưa xác nhận",
    createdAt: "24-05-2024",
    total: 100_000_000,
    phoneNumber: "0961766816",
    workplace: "Bệnh viện Bạch Mai",
  },
  {
    key: "2",
    name: "Trần Thị B",
    status: "Chưa xác nhận",
    createdAt: "04-05-2024",
    total: 15_000_000,
    phoneNumber: "0961766816",
    workplace: "Bệnh viện Nhi Trung Ương",
  },
  {
    key: "3",
    name: "Lê Văn C",
    status: "Chưa xác nhận",
    createdAt: "04-05-2024",
    total: 60_000_000,
    phoneNumber: "0961766816",
    workplace: "Bệnh viện E",
  },
  {
    key: "4",
    name: "Phạm Thị D",
    status: "Đang hoạt động",
    createdAt: "04-05-2024",
    total: 40_000_000,
    phoneNumber: "0961766816",
    workplace: "Bệnh viện Da Liễu Trung Ương",
  },
  {
    key: "5",
    name: "Nguyễn Văn E",
    status: "Đang hoạt động",
    createdAt: "04-04-2024",
    total: 15_000_000,
    phoneNumber: "0961766816",
    workplace: "Bệnh viện 103",
  },
  {
    key: "6",
    name: "Nguyễn Văn F",
    status: "Đã hoàn tiền",
    createdAt: "14-04-2025",
    total: 60_000_000,
    phoneNumber: "0961766816",
    workplace: "Bệnh viện Việt Đức",
  },
  {
    key: "7",
    name: "Phạm Thị G",
    status: "Đang hoạt động",
    createdAt: "04-05-2024",
    total: 40_000_000,
    phoneNumber: "0961766816",
    workplace: "Bệnh viện Phụ Sản Hà Nội",
  },
  {
    key: "8",
    name: "Lê Văn H",
    status: "Đã hoàn tiền",
    createdAt: "04-05-2024",
    total: 60_000_000,
    phoneNumber: "0961766816",
    workplace: "Bệnh viện Hữu nghị Việt-Xô",
  },
];

const ClinicList = () => {
  const [searchId, setSearchId] = useState("");
  const [searchName, setSearchName] = useState("");
  const [searchphoneNumber, setSearchphoneNumber] = useState("");
  const [statusFilter, setStatusFilter] = useState("Tất cả");
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const navigate = useNavigate();
  const [isVerifyModalVisible, setIsVerifyModalVisible] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const [xScroll, setXScroll] = useState("fixed");

  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [newClinic, setNewClinic] = useState({
    name: "",
    phoneNumber: "",
    workplace: "",
    status: "Chưa xác nhận",
    createdAt: new Date().toLocaleDateString("vi-VN"),
    total: 0,
  });

  const handleXScrollChange = (e) => {
    setXScroll(e.target.value);
  };

  const scroll = {};

  const handleAction = (action, record) => {
    if (action === "verify") {
      setSelectedCustomer(record);
      setIsVerifyModalVisible(true);
    } else if (action === "changePassword") {
      console.log("Đổi mật khẩu:", record);
    }
  };

  const handleConfirmVerify = () => {
    console.log("Xác thực và gửi mail cho:", selectedCustomer);
    setIsVerifyModalVisible(false);
    setSelectedCustomer(null);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedKeys) => setSelectedRowKeys(newSelectedKeys),
  };

  const filteredData = customerData
    .filter((customer) =>
      customer.key.toLowerCase().includes(searchId.toLowerCase())
    )
    .filter((customer) =>
      customer.name.toLowerCase().includes(searchName.toLowerCase())
    )
    .filter((customer) =>
      customer.phoneNumber
        .toLowerCase()
        .includes(searchphoneNumber.toLowerCase())
    )
    .filter((customer) =>
      statusFilter === "Tất cả" ? true : customer.status === statusFilter
    );

  const columns = [
    {
      title: "STT",
      dataIndex: "key",
      key: "key",
      width: 60,
      sorter: (a, b) => a.key.localeCompare(b.key),
    },
    {
      title: "Tên cơ sở",
      dataIndex: "name",
      key: "name",
      width: 160,
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status) => <StatusTag status={status} type={"customer"} />,
      filters: [
        { text: "Chưa xác nhận", value: "Chưa xác nhận" },
        { text: "Đang hoạt động", value: "Đang hoạt động" },
        { text: "Đã hoàn tiền", value: "Đã hoàn tiền" },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: "Tổng bác sĩ",
      dataIndex: "total",
      key: "total",
      width: 100,
      // render: (amount) =>
      //   amount.toLocaleString("vi-VN", {
      //     style: "currency",
      //     currency: "VND",
      //   }),
      sorter: (a, b) => a.total - b.total,
    },
    {
      title: "Số điện thoại",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
      width: 100,
      sorter: (a, b) => a.phoneNumber.localeCompare(b.phoneNumber),
    },
    {
      title: "Ngày tham gia",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 100,
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    },
    {
      title: "Địa chỉ",
      dataIndex: "workplace",
      key: "workplace",
      width: 400,
      sorter: (a, b) => a.workplace.localeCompare(b.workplace),
    },

    {
      title: "Hành động",
      key: "action",
      width: 50,
      render: (_, record) => (
        <Dropdown
          overlay={
            <Menu
              onClick={(info) => {
                info.domEvent.stopPropagation(); // CHẶN CLICK LAN RA ROW
                handleAction(info.key, record);
              }}
              items={[
                {
                  key: "verify",
                  label: "✅ Xác thực",
                },
              ]}
            />
          }
          trigger={["click"]}
        >
          <Button
            icon={<MoreOutlined />}
            onClick={(e) => e.stopPropagation()} // ngăn click lan sang row
          />
        </Dropdown>
      ),
    },
  ];
  if (xScroll === "fixed") {
    columns[0].fixed = true;
    columns[columns.length - 1].fixed = "right";
  }
  if (xScroll !== "unset") {
    scroll.x = "100vw";
  }

  return (
    <div className={styles.ClinicList}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h2 className={styles.ClinicList__title}>Danh sách cơ sở</h2>
        <Button onClick={() => setIsAddModalVisible(true)}>Thêm mới</Button>
      </div>
      <Row gutter={16} className={styles.filterGroup}>
        <Col span={24}>
          <Card
            title={
              <>
                <FilterOutlined /> Bộ lọc tìm kiếm
              </>
            }
            size="small"
          >
            <Row gutter={16} style={{ justifyContent: "flex-end" }}>
              <Col span={4}>
                <label className={styles.filterLabel}>ID cơ sở</label>
                <Input
                  placeholder="Nhập ID"
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                />
              </Col>
              <Col span={4}>
                <label className={styles.filterLabel}>Tên cơ sở</label>
                <Input
                  placeholder="Nhập tên"
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                />
              </Col>

              <Col span={3}>
                <label className={styles.filterLabel}>Trạng thái</label>
                <Select
                  value={statusFilter}
                  onChange={setStatusFilter}
                  style={{ width: "100%" }}
                >
                  <Option value="Tất cả">Tất cả</Option>
                  <Option value="Chưa xác nhận">Chưa xác nhận</Option>
                  <Option value="Đang hoạt động">Đang hoạt động</Option>
                  <Option value="Đã hoàn tiền">Đã hoàn tiền</Option>
                </Select>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
      <Table
        rowSelection={rowSelection}
        className={styles.ClinicList__table}
        columns={columns}
        dataSource={filteredData}
        pagination={{ pageSize: 5 }}
        onRow={(record) => ({
          onClick: () => console.log("ấn vào ", record),
        })}
        scroll={scroll}
        size="small"
      />
      <Modal
        title="Xác nhận xác thực"
        open={isVerifyModalVisible}
        onOk={handleConfirmVerify}
        onCancel={() => setIsVerifyModalVisible(false)}
        okText="Xác thực & Gửi mail"
        cancelText="Hủy"
      >
        <p>
          Bạn có chắc chắn muốn xác thực tài khoản và gửi email đến{" "}
          <strong>{selectedCustomer?.name}</strong> không?
        </p>
      </Modal>
      <Modal
        title="Thêm cơ sở mới"
        open={isAddModalVisible}
        onCancel={() => setIsAddModalVisible(false)}
        onOk={() => {
          const newKey = (customerData.length + 1).toString();
          customerData.push({ ...newClinic, key: newKey });
          setIsAddModalVisible(false);
          setNewClinic({
            name: "",
            phoneNumber: "",
            workplace: "",
            status: "Chưa xác nhận",
            createdAt: new Date().toLocaleDateString("vi-VN"),
            total: 0,
          });
        }}
        okText="Thêm"
        cancelText="Hủy"
      >
        <Input
          placeholder="Tên cơ sở"
          style={{ marginBottom: 10 }}
          value={newClinic.name}
          onChange={(e) => setNewClinic({ ...newClinic, name: e.target.value })}
        />
        <Input
          placeholder="Số điện thoại"
          style={{ marginBottom: 10 }}
          value={newClinic.phoneNumber}
          onChange={(e) =>
            setNewClinic({ ...newClinic, phoneNumber: e.target.value })
          }
        />
        <Input
          placeholder="Địa chỉ"
          style={{ marginBottom: 10 }}
          value={newClinic.workplace}
          onChange={(e) =>
            setNewClinic({ ...newClinic, workplace: e.target.value })
          }
        />
        <Select
          value={newClinic.status}
          style={{ width: "100%" }}
          onChange={(value) => setNewClinic({ ...newClinic, status: value })}
        >
          <Option value="Chưa xác nhận">Chưa xác nhận</Option>
          <Option value="Đang hoạt động">Đang hoạt động</Option>
          <Option value="Đã hoàn tiền">Đã hoàn tiền</Option>
        </Select>
      </Modal>
    </div>
  );
};

export default ClinicList;
