import React, { useState } from "react";
import {
  Table,
  Input,
  Select,
  Row,
  Col,
  Card,
  Modal,
  Descriptions,
  Divider,
  Tag,
  Button,
} from "antd";
import styles from "./OrderList.module.scss";
import StatusTag from "../../components/StatusTag/StatusTag";
import { FilterOutlined } from "@ant-design/icons";

const { Option } = Select;

const orderData = [
  {
    key: "ORD001",
    orderCode: "ORD001",
    customerName: "Nguyễn Minh Hoàng Phương",
    phone: "0985123245",
    email: "nguyenvana@gmail.com",
    consultant: "Nguyễn Văn A",
    productItems: [
      {
        name: "Nước Mắm Sá Sùng Vân Đồn chai 700ml",
        barcode: "124562",
        quantity: 2,
        price: 1024000,
        oldPrice: 2000000,
      },
      {
        name: "Nước Mắm Sá Sùng Vân Đồn chai 700ml",
        barcode: "124562",
        quantity: 2,
        price: 1024000,
        oldPrice: 2000000,
      },
    ],
    deliveryAddress:
      "Tầng 12, tòa PeakView, Số 36 Hoàng Cầu, phường Ô Chợ Dừa, Hà Nội",
    status: "ĐÃ THANH TOÁN",
    payment: {
      methods: [
        { type: "Tiền mặt", amount: 10000000 },
        { type: "VnpayQR", amount: 6000000 },
      ],
      subtotal: 16000000,
      discount: 30000,
      shipping: 0,
      coupon: { code: "VNSHOP123", value: 10000 },
      rewardPointsEarned: 1500,
      rewardPointsUsed: 20000,
      finalAmount: 1540000,
    },
    createdAt: "02/01/2022 - 23:51",
  },
];

const OrderList = () => {
  const [searchId, setSearchId] = useState("");
  const [searchCustomer, setSearchCustomer] = useState("");
  const [statusFilter, setStatusFilter] = useState("Tất cả");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const filteredOrders = orderData.filter((order) =>
    order.orderCode.toLowerCase().includes(searchId.toLowerCase())
  );

  const showOrderDetail = (record) => {
    setSelectedOrder(record);
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setSelectedOrder(null);
  };

  const columns = [
    {
      title: "STT",
      key: "index",
      render: (_, __, index) => index + 1,
    },
    {
      title: "Mã đơn hàng",
      dataIndex: "orderCode",
      key: "orderCode",
    },
    {
      title: "Tên khách hàng",
      dataIndex: "customerName",
      key: "customerName",
    },
    {
      title: "Tình trạng",
      dataIndex: "status",
      key: "status",
      render: (status) => <Tag color="green">{status}</Tag>,
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
    },
  ];

  return (
    <div className={styles.orderList}>
      <h2 className={styles["orderList__title"]}>Danh sách đơn hàng</h2>

      <Row gutter={16} className={styles["orderList__filter-group"]}>
        <Col span={24}>
          <Card
            title={
              <>
                <FilterOutlined /> Bộ lọc tìm kiếm
              </>
            }
            size="small"
          >
            <Row gutter={16}>
              <Col span={6}>
                <label className={styles["orderList__filter-label"]}>
                  Mã đơn hàng
                </label>
                <Input
                  placeholder="Nhập mã đơn hàng"
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      <Table
        columns={columns}
        dataSource={filteredOrders}
        onRow={(record) => ({ onClick: () => showOrderDetail(record) })}
        rowKey="orderCode"
      />

      <Modal
        title={<b>Chi tiết đơn hàng</b>}
        visible={isModalVisible}
        onCancel={handleCloseModal}
        footer={[
          <Button key="close" type="primary" onClick={handleCloseModal}>
            Đóng
          </Button>,
        ]}
        width={1000}
      >
        {selectedOrder && (
          <>
            <Row justify="space-between" gutter={24}>
              <Col span={16}>
                <p>
                  <b>Đơn hàng:</b> {selectedOrder.orderCode} | <b>Thời gian:</b>
                  {selectedOrder.createdAt} | <b>NV tư vấn:</b>
                  {selectedOrder.consultant} - {selectedOrder.email}
                </p>
              </Col>
              <Col span={8} style={{ textAlign: "right" }}>
                <Tag color="green">{selectedOrder.status}</Tag>
              </Col>
            </Row>

            <Divider />

            <Row gutter={16}>
              <Col span={12}>
                <Descriptions title="Khách hàng" column={1} size="small">
                  <Descriptions.Item label="Tên">
                    {selectedOrder.customerName}
                  </Descriptions.Item>
                  <Descriptions.Item label="SĐT">
                    {selectedOrder.phone}
                  </Descriptions.Item>
                </Descriptions>
              </Col>
              <Col span={12}>
                <Descriptions title="Người nhận" column={1} size="small">
                  <Descriptions.Item label="Tên">
                    {selectedOrder.customerName}
                  </Descriptions.Item>
                  <Descriptions.Item label="SĐT">
                    {selectedOrder.phone}
                  </Descriptions.Item>
                  <Descriptions.Item label="Địa chỉ">
                    {selectedOrder.deliveryAddress}
                  </Descriptions.Item>
                </Descriptions>
              </Col>
            </Row>

            <Divider />

            <Table
              columns={[
                { title: "Tên sản phẩm", dataIndex: "name", key: "name" },
                { title: "Số lượng", dataIndex: "quantity", key: "quantity" },
                {
                  title: "Đơn giá",
                  dataIndex: "price",
                  key: "price",
                  render: (val, record) => (
                    <>
                      <div>{val.toLocaleString()} đ</div>
                      {record.oldPrice && (
                        <div
                          style={{
                            textDecoration: "line-through",
                            color: "gray",
                          }}
                        >
                          {record.oldPrice.toLocaleString()} đ
                        </div>
                      )}
                    </>
                  ),
                },
                {
                  title: "Tổng tiền",
                  key: "total",
                  render: (_, record) =>
                    `${(record.price * record.quantity).toLocaleString()} đ`,
                },
              ]}
              dataSource={selectedOrder.productItems}
              rowKey={(item, index) => `${item.barcode}-${index}`}
              pagination={false}
              size="small"
            />

            <Divider />

            <Descriptions column={1} bordered size="small" title="Thanh toán">
              <Descriptions.Item label="Phương thức thanh toán">
                {selectedOrder.payment.methods.map((m) => (
                  <div key={m.type}>
                    {m.type}: {m.amount.toLocaleString()} đ
                  </div>
                ))}
              </Descriptions.Item>
              <Descriptions.Item label="Tạm tính">
                {selectedOrder.payment.subtotal.toLocaleString()} đ
              </Descriptions.Item>
              <Descriptions.Item label="Khuyến mãi">
                -{selectedOrder.payment.discount.toLocaleString()} đ
              </Descriptions.Item>
              <Descriptions.Item label="Phí vận chuyển">
                Miễn phí
              </Descriptions.Item>
              <Descriptions.Item label="Mã giảm giá">
                {selectedOrder.payment.coupon.code} (-
                {selectedOrder.payment.coupon.value.toLocaleString()} đ)
              </Descriptions.Item>
              <Descriptions.Item label="Điểm thưởng">
                +{selectedOrder.payment.rewardPointsEarned.toLocaleString()}
                điểm
              </Descriptions.Item>
              <Descriptions.Item label="Dùng điểm">
                -{selectedOrder.payment.rewardPointsUsed.toLocaleString()} đ
              </Descriptions.Item>
              <Descriptions.Item label="Cần thanh toán">
                <b style={{ color: "red", fontSize: 16 }}>
                  {selectedOrder.payment.finalAmount.toLocaleString()} đ
                </b>
              </Descriptions.Item>
            </Descriptions>
          </>
        )}
      </Modal>
    </div>
  );
};

export default OrderList;
