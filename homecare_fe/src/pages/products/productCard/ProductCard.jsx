// ProductCard.jsx
import React, { useState } from "react";
import { Button, Card, Col, Modal, Row } from "antd";
import styles from "./ProductCard.module.scss";
import StatusTag from "../../../components/StatusTag/StatusTag";

const ProductCard = ({ product }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };
  return (
    <div>
      <Card
        key={product.id}
        className={styles.productCard}
        hoverable
        onClick={() => showModal()}
        cover={
          <img
            alt={product.name}
            src={product.image}
            className={styles.productImage}
          />
        }
      >
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div className={styles.productName}>{product.name}</div>
          <div className={styles.productPrice}>
            {Number(product.price).toLocaleString("vi-VN")} đ
          </div>
        </div>

        <div
          style={{ display: "flex", justifyContent: "space-between", gap: 10 }}
        >
          <h5 className={styles.productSubName}>{product.subName ?? "--"}</h5>
          <StatusTag status={product.status} type={"products"} />
        </div>

        <div className={styles.productCategory}>{product.category}</div>
        {!product.isLanding && (
          <div
            className={
              product.purchased ? styles.remainingUses : styles.notPurchased
            }
          >
            {product.purchased
              ? `Còn dùng được: ${product.remainingUses} lượt`
              : "Chưa mua"}
          </div>
        )}
      </Card>
      <Modal
        title={product?.name}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={[
          <Button key="buy" type="primary">
            Thanh toán
          </Button>,
        ]}
      >
        <img
          src={product?.image}
          alt="main"
          style={{ width: "100%", marginBottom: 12 }}
        />
        <Row gutter={8}>
          {product?.subImages.map((img, idx) => (
            <Col span={8} key={idx}>
              <img
                src={img}
                alt={`sub-${idx}`}
                style={{ width: "100%", borderRadius: 8 }}
              />
            </Col>
          ))}
        </Row>
        <p style={{ marginTop: 12 }}>
          Giá: {Number(product?.price).toLocaleString("vi-VN")} đ
        </p>
        <p>Loại: {product?.category}</p>
        <p>Mô tả: {product?.description}</p>
      </Modal>
    </div>
  );
};

export default ProductCard;
