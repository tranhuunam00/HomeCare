import React, { useState, useEffect } from "react";
import { Input, Typography, Card, Select, Row, Col } from "antd";
import styles from "./ProductList.module.scss";

const { Title } = Typography;
const { Option } = Select;

const products = Array.from({ length: 20 }, (_, index) => ({
  id: index + 1,
  name: `Sản phẩm ${index + 1}`,
  price: (Math.random() * 1000000).toFixed(0),
  category: index % 2 === 0 ? "Thực phẩm" : "Đồ gia dụng",
  image:
    "https://media.istockphoto.com/id/624183176/vi/anh/ru%E1%BB%99ng-b%E1%BA%ADc-thang-%E1%BB%9F-mu-cang-ch%E1%BA%A3i-vi%E1%BB%87t-nam.jpg?s=612x612&w=0&k=20&c=UbNrn36xFBIff9yV3RDl5lPs3-kW-WQ_sSNMB1M3Trs=",
  purchased: Math.random() > 0.5,
  remainingUses: Math.floor(Math.random() * 10) + 1,
}));

const ProductList = () => {
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("none");
  const [filteredProducts, setFilteredProducts] = useState(products);

  useEffect(() => {
    handleFilterSort();
  }, [searchText, statusFilter, sortOrder]);

  const handleFilterSort = () => {
    let result = [...products];

    if (statusFilter === "purchased") {
      result = result.filter((p) => p.purchased);
    } else if (statusFilter === "notPurchased") {
      result = result.filter((p) => !p.purchased);
    }

    if (searchText) {
      result = result.filter((p) =>
        p.name.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    if (sortOrder === "asc") {
      result.sort((a, b) => a.remainingUses - b.remainingUses);
    } else if (sortOrder === "desc") {
      result.sort((a, b) => b.remainingUses - a.remainingUses);
    }

    setFilteredProducts(result);
  };

  return (
    <div className={styles.productListContainer}>
      <Title level={3} className={styles.title}>
        Danh sách sản phẩm
      </Title>

      <Row gutter={16} className={styles.controls}>
        <Col>
          <Input.Search
            placeholder="Tìm kiếm theo tên sản phẩm"
            onChange={(e) => setSearchText(e.target.value)}
            value={searchText}
            allowClear
          />
        </Col>
        <Col>
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 160 }}
          >
            <Option value="all">Tất cả trạng thái</Option>
            <Option value="purchased">Đã mua</Option>
            <Option value="notPurchased">Chưa mua</Option>
          </Select>
        </Col>
        <Col>
          <Select
            value={sortOrder}
            onChange={setSortOrder}
            style={{ width: 180 }}
          >
            <Option value="none">Không sắp xếp</Option>
            <Option value="asc">Lượt dùng tăng dần</Option>
            <Option value="desc">Lượt dùng giảm dần</Option>
          </Select>
        </Col>
      </Row>

      <div className={styles.productGrid}>
        {filteredProducts.map((product) => (
          <Card
            key={product.id}
            className={styles.productCard}
            hoverable
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
            <div
              className={
                product.purchased ? styles.remainingUses : styles.notPurchased
              }
            >
              {product.purchased
                ? `Còn dùng được: ${product.remainingUses} lượt`
                : "Chưa mua"}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ProductList;
