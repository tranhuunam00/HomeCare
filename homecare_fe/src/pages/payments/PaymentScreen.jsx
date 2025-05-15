// PaymentScreen.jsx
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Card,
  Row,
  Col,
  Input,
  Typography,
  Button,
  Divider,
  message,
} from "antd";
import styles from "./PaymentScreen.module.scss";

const { Title, Text } = Typography;

const PaymentScreen = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const product = location.state?.product;

  if (!product) {
    return <div style={{ padding: 24 }}>Không có thông tin sản phẩm.</div>;
  }

  const handlePayment = () => {
    message.success("Thanh toán thành công!");
    navigate("/");
  };

  const handleGoBack = () => {
    navigate(-1); // Quay lại trang trước đó
  };

  return (
    <div className={styles["payment-container"]}>
      <Title level={3}>Xác nhận thanh toán</Title>

      <Card className={styles["payment-card"]}>
        <Row gutter={24}>
          <Col span={12}>
            <Title level={5}>Chi tiết sản phẩm</Title>
            <div className={styles["payment-product"]}>
              <img
                src={product.image}
                alt="product"
                className={styles["payment-product__image"]}
              />
              <div className={styles["payment-product__info"]}>
                <Text strong>{product.name}</Text>
                <p>{product.description}</p>
                <Text type="danger" strong>
                  {Number(product.price).toLocaleString("vi-VN")} đ
                </Text>
              </div>
            </div>
          </Col>

          <Col span={12}>
            <Title level={5}>Chi tiết thanh toán</Title>
            <div className={styles["payment-summary"]}>
              <Row>
                <Col span={12}>Tên sản phẩm:</Col>
                <Col span={12} className={styles["text-right"]}>
                  {product.name}
                </Col>
              </Row>
              <Row>
                <Col span={12}>Số tiền:</Col>
                <Col span={12} className={styles["text-right"]}>
                  {Number(product.price).toLocaleString("vi-VN")} đ
                </Col>
              </Row>
              <Row>
                <Col span={12}>Thuế VAT (10%):</Col>
                <Col span={12} className={styles["text-right"]}>
                  {Number(product.price * 0.1).toLocaleString("vi-VN")} đ
                </Col>
              </Row>
              <Divider />
              <Row>
                <Col span={12}>
                  <Text strong>Tổng thanh toán:</Text>
                </Col>
                <Col span={12} className={styles["text-right"]}>
                  <Text strong>
                    {Number(product.price * 1.1).toLocaleString("vi-VN")} đ
                  </Text>
                </Col>
              </Row>
            </div>

            <div className={styles["payment-method"]}>
              <Title level={5}>Phương thức thanh toán</Title>
              <Input placeholder="Nhập số thẻ / mã giao dịch" />
            </div>

            <div className={styles["payment-action"]}>
              <Button
                type="default"
                style={{ marginRight: 8 }}
                onClick={handleGoBack}
              >
                Quay lại
              </Button>
              <Button type="primary" onClick={handlePayment}>
                Thanh toán
              </Button>
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default PaymentScreen;
