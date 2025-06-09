// ProductList.jsx
import React, { useState, useEffect } from "react";
import { Input, Typography, Card, Select, Row, Col, Modal, Button } from "antd";
import { useNavigate } from "react-router-dom";
import styles from "./ProductList.module.scss";
import ProductCard from "./productCard/ProductCard";
import { PlusOutlined } from "@ant-design/icons";

const { Title } = Typography;
const { Option } = Select;

const products = [
  {
    id: 1,
    name: "TIRADS Template",
    price: 0,
    category: "Chẩn đoán hình ảnh",
    image:
      "https://nhahangchotinhsapa.vn/wp-content/uploads/2024/01/kham-pha-nui-rung-Tay-Bac.jpg",
    subImages: [
      "https://nhahangchotinhsapa.vn/wp-content/uploads/2024/01/kham-pha-nui-rung-Tay-Bac.jpg",
      "https://nhahangchotinhsapa.vn/wp-content/uploads/2024/01/kham-pha-nui-rung-Tay-Bac.jpg",
      "https://nhahangchotinhsapa.vn/wp-content/uploads/2024/01/kham-pha-nui-rung-Tay-Bac.jpg",
    ],
    description:
      "Mẫu báo cáo tự động hóa TIRADS giúp phân loại nhân giáp trên siêu âm theo chuẩn ACR.",
    usage: "Dùng trong hệ thống chẩn đoán hỗ trợ AI",
    purchased: false,
    remainingUses: 3,
  },
  {
    id: 2,
    name: "RECIST Template",
    price: 0,
    category: "Ung thư học",
    image: "https://via.placeholder.com/300x200.png?text=RECIST",
    subImages: [
      "https://via.placeholder.com/100x100.png?text=CT1",
      "https://via.placeholder.com/100x100.png?text=CT2",
      "https://via.placeholder.com/100x100.png?text=CT3",
    ],
    description: "Báo cáo tiêu chuẩn đánh giá đáp ứng khối u theo RECIST 1.1.",
    usage: "Dùng trong theo dõi điều trị ung thư qua hình ảnh CT/MRI.",
    purchased: true,
    remainingUses: 5,
  },
  {
    id: 3,
    name: "BIRADS Template",
    price: 0,
    category: "Nhũ ảnh",
    image: "https://via.placeholder.com/300x200.png?text=BIRADS",
    subImages: [
      "https://via.placeholder.com/100x100.png?text=Mammo1",
      "https://via.placeholder.com/100x100.png?text=Mammo2",
      "https://via.placeholder.com/100x100.png?text=Mammo3",
    ],
    description: "Chuẩn hóa mô tả tổn thương tuyến vú trên nhũ ảnh.",
    usage: "Phân loại nguy cơ ung thư vú từ BIRADS 1-6.",
    purchased: false,
    remainingUses: 1,
  },
];

const ProductList = () => {
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("none");
  const [filteredProducts, setFilteredProducts] = useState(products);

  const navigate = useNavigate();

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
      <Button
        style={{ margin: 30 }}
        type="primary"
        icon={<PlusOutlined />}
        onClick={() => navigate("/home/products/add")}
      >
        Thêm mới
      </Button>

      <Row gutter={24}>
        <Col xs={24} sm={8} md={6} lg={5} className={styles.filterSidebar}>
          <div className={styles.filterBox}>
            <Input.Search
              placeholder="Tìm kiếm theo tên sản phẩm"
              onChange={(e) => setSearchText(e.target.value)}
              value={searchText}
              allowClear
              className={styles.filterInput}
            />
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              className={styles.filterSelect}
            >
              <Option value="all">Tất cả trạng thái</Option>
              <Option value="purchased">Đã mua</Option>
              <Option value="notPurchased">Chưa mua</Option>
            </Select>
            <Select
              value={sortOrder}
              onChange={setSortOrder}
              className={styles.filterSelect}
            >
              <Option value="none">Không sắp xếp</Option>
              <Option value="asc">Lượt dùng tăng dần</Option>
              <Option value="desc">Lượt dùng giảm dần</Option>
            </Select>
          </div>
        </Col>

        <Col xs={24} sm={16} md={18} lg={19}>
          <div className={styles.productGrid}>
            {filteredProducts.map((product, index) => (
              <ProductCard key={index} product={product} />
            ))}
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default ProductList;
