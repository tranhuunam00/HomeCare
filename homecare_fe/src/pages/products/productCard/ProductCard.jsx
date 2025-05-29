// ProductCard.jsx
import React from "react";
import { Card } from "antd";
import styles from "./ProductCard.module.scss";

const ProductCard = ({ product, showModal }) => {
  return (
    <Card
      key={product.id}
      className={styles.productCard}
      hoverable
      onClick={() => showModal(product)}
      cover={
        <img
          alt={product.name}
          src={product.image}
          className={styles.productImage}
        />
      }
    >
      <div className={styles.productName}>{product.name}</div>
      <div className={styles.productPrice}>
        {Number(product.price).toLocaleString("vi-VN")} đ
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
  );
};

export default ProductCard;
