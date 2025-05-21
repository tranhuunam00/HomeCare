import React, { useState } from "react";
import { Table, Input, Select, Tag, Row, Col, Card } from "antd";
import styles from "./CustomerList.module.scss";
import StatusTag from "../../components/StatusTag/StatusTag";
import { FilterOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Option } = Select;

const customerData = [
  {
    key: "1",
    name: "Nguyễn Văn A",
    status: "Đã thanh toán",
    visits: 50,
    total: 100_000_000,
    department: "Nội tiết",
    workplace: "Bệnh viện Bạch Mai",
  },
  {
    key: "2",
    name: "Trần Thị B",
    status: "Đã thanh toán",
    visits: 20,
    total: 15_000_000,
    department: "Nhi",
    workplace: "Bệnh viện Nhi Trung Ương",
  },
  {
    key: "3",
    name: "Lê Văn C",
    status: "Đã thanh toán",
    visits: 30,
    total: 60_000_000,
    department: "Tim mạch",
    workplace: "Bệnh viện E",
  },
  {
    key: "4",
    name: "Phạm Thị D",
    status: "Chưa thanh toán",
    visits: 40,
    total: 40_000_000,
    department: "Da liễu",
    workplace: "Bệnh viện Da Liễu Trung Ương",
  },
  {
    key: "5",
    name: "Nguyễn Văn E",
    status: "Chưa thanh toán",
    visits: 10,
    total: 15_000_000,
    department: "Nội tổng hợp",
    workplace: "Bệnh viện 103",
  },
  {
    key: "6",
    name: "Nguyễn Văn F",
    status: "Đã hoàn tiền",
    visits: 15,
    total: 60_000_000,
    department: "Phẫu thuật",
    workplace: "Bệnh viện Việt Đức",
  },
  {
    key: "7",
    name: "Phạm Thị G",
    status: "Chưa thanh toán",
    visits: 10,
    total: 40_000_000,
    department: "Sản",
    workplace: "Bệnh viện Phụ Sản Hà Nội",
  },
  {
    key: "8",
    name: "Lê Văn H",
    status: "Đã hoàn tiền",
    visits: 45,
    total: 60_000_000,
    department: "Chấn thương chỉnh hình",
    workplace: "Bệnh viện Hữu nghị Việt-Xô",
  },
];

const CustomerList = () => {
  const [searchId, setSearchId] = useState("");
  const [searchName, setSearchName] = useState("");
  const [searchDepartment, setSearchDepartment] = useState("");
  const [statusFilter, setStatusFilter] = useState("Tất cả");
  const [sortOrder] = useState("none");
  const navigate = useNavigate();

  const filteredData = customerData
    .filter((customer) =>
      customer.key.toLowerCase().includes(searchId.toLowerCase())
    )
    .filter((customer) =>
      customer.name.toLowerCase().includes(searchName.toLowerCase())
    )
    .filter((customer) =>
      customer.department.toLowerCase().includes(searchDepartment.toLowerCase())
    )
    .filter((customer) =>
      statusFilter === "Tất cả" ? true : customer.status === statusFilter
    )
    .sort((a, b) => {
      if (sortOrder === "amountAsc") return a.total - b.total;
      if (sortOrder === "amountDesc") return b.total - a.total;
      return 0;
    });

  const columns = [
    {
      title: "STT",
      dataIndex: "key",
      key: "key",
      width: 50,
      sorter: (a, b) => a.key.localeCompare(b.key),
    },
    {
      title: "Tên khách hàng",
      dataIndex: "name",
      key: "name",
      width: 200,
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 150,
      render: (status) => <StatusTag status={status} />,
      filters: [
        { text: "Đã thanh toán", value: "Đã thanh toán" },
        { text: "Chưa thanh toán", value: "Chưa thanh toán" },
        { text: "Đã hoàn tiền", value: "Đã hoàn tiền" },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: "Còn lại(lần)",
      dataIndex: "visits",
      key: "visits",
      width: 120,
      sorter: (a, b) => a.visits - b.visits,
    },
    {
      title: "Tổng giao dịch",
      dataIndex: "total",
      key: "total",
      width: 150,
      render: (amount) =>
        amount.toLocaleString("vi-VN", {
          style: "currency",
          currency: "VND",
        }),
      sorter: (a, b) => a.total - b.total,
    },
    {
      title: "Khoa",
      dataIndex: "department",
      key: "department",
      width: 200,
      sorter: (a, b) => a.department.localeCompare(b.department),
    },
    {
      title: "Nơi công tác hiện nay",
      dataIndex: "workplace",
      key: "workplace",
      width: 400,
      sorter: (a, b) => a.workplace.localeCompare(b.workplace),
    },
  ];

  return (
    <div className={styles.customerList}>
      <h2 className={styles.customerList__title}>Danh sách khách hàng</h2>

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
                <label className={styles.filterLabel}>ID Khách hàng</label>
                <Input
                  placeholder="Nhập ID"
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                />
              </Col>
              <Col span={4}>
                <label className={styles.filterLabel}>Tên khách hàng</label>
                <Input
                  placeholder="Nhập tên"
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                />
              </Col>
              <Col span={4}>
                <label className={styles.filterLabel}>Khoa</label>
                <Input
                  placeholder="Nhập tên khoa"
                  value={searchDepartment}
                  onChange={(e) => setSearchDepartment(e.target.value)}
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
                  <Option value="Đã thanh toán">Đã thanh toán</Option>
                  <Option value="Chưa thanh toán">Chưa thanh toán</Option>
                  <Option value="Đã hoàn tiền">Đã hoàn tiền</Option>
                </Select>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      <Table
        className={styles.customerList__table}
        columns={columns}
        dataSource={filteredData}
        pagination={{ pageSize: 5 }}
        onRow={(record) => ({
          onClick: () => navigate("/home/account"),
        })}
      />
    </div>
  );
};

export default CustomerList;
