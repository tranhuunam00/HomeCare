// HomeCareLanding.jsx
import React, { useRef, useState } from "react";
import { Button, Form, Input, Menu, Modal } from "antd";
import { DownOutlined, SearchOutlined } from "@ant-design/icons";
import { FaPhoneAlt, FaMapMarkerAlt, FaEnvelope } from "react-icons/fa";
import { SiZalo } from "react-icons/si";
import styles from "./HomeCareLanding.module.scss";
import { useNavigate } from "react-router-dom";
import ProductCard from "../products/productCard/ProductCard";

const products = [
  {
    id: 1,
    name: "TIRADS Template",
    price: 0,
    category: "Chẩn đoán hình ảnh",
    image: "/banner.png",

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
    isLanding: true,
  },
  {
    id: 2,
    name: "RECIST Template",
    price: 0,
    category: "Ung thư học",
    image: "/banner.png",

    subImages: [
      "https://via.placeholder.com/100x100.png?text=CT1",
      "https://via.placeholder.com/100x100.png?text=CT2",
      "https://via.placeholder.com/100x100.png?text=CT3",
    ],
    description: "Báo cáo tiêu chuẩn đánh giá đáp ứng khối u theo RECIST 1.1.",
    usage: "Dùng trong theo dõi điều trị ung thư qua hình ảnh CT/MRI.",
    purchased: true,
    remainingUses: 5,
    isLanding: true,
  },
  {
    id: 3,
    name: "BIRADS Template",
    price: 0,
    category: "Nhũ ảnh",
    image: "/banner.png",
    subImages: [
      "https://via.placeholder.com/100x100.png?text=Mammo1",
      "https://via.placeholder.com/100x100.png?text=Mammo2",
      "https://via.placeholder.com/100x100.png?text=Mammo3",
    ],
    description: "Chuẩn hóa mô tả tổn thương tuyến vú trên nhũ ảnh.",
    usage: "Phân loại nguy cơ ung thư vú từ BIRADS 1-6.",
    purchased: false,
    isLanding: true,
  },
];

const HomeCareLanding = () => {
  const navigate = useNavigate();
  const [isContactOpen, setIsContactOpen] = useState(false);

  const showContactModal = () => setIsContactOpen(true);
  const handleContactCancel = () => setIsContactOpen(false);

  const topRef = useRef(null);
  const aboutRef = useRef(null);
  const serviceRef = useRef(null);

  const scrollToSection = (ref) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth" });
    }
  };
  return (
    <div className={styles["homecare"]}>
      <header className={styles["homecare__header"]}>
        <div className={styles["homecare__container"]}>
          <div className={styles["homecare__logo"]}>
            <img src="/logo_home_care.jpg" alt="logo_home_care.jpg" />
          </div>
          <div className={styles["homecare__nav-left"]}>
            <Menu
              mode="horizontal"
              selectable={false}
              className={styles["homecare__menu"]}
            >
              <Menu.Item key="home" onClick={() => scrollToSection(topRef)}>
                Trang Chủ
              </Menu.Item>
              <Menu.Item key="about" onClick={() => scrollToSection(aboutRef)}>
                Giới Thiệu
              </Menu.Item>
              <Menu.Item
                key="service"
                onClick={() => scrollToSection(serviceRef)}
              >
                Dịch vụ
              </Menu.Item>
            </Menu>
          </div>
          <div className={styles["homecare__nav-right"]}>
            <Menu
              mode="horizontal"
              selectable={false}
              className={styles["homecare__auth"]}
            >
              <Menu.Item key="about" onClick={() => navigate("login")}>
                Đăng nhập
              </Menu.Item>
            </Menu>
            <Button
              type="primary"
              className={styles["homecare__contact"]}
              onClick={showContactModal}
            >
              Liên Hệ
            </Button>
          </div>
        </div>
      </header>

      <section ref={topRef} className={styles["homecare__hero"]}>
        <div className={styles["homecare__hero-inner"]}>
          <h1 className={styles["homecare__title"]}>
            <span>HOME</span>CARE
          </h1>
          <h2 className={styles["homecare__subtitle"]}>
            Giải Pháp Chăm Sóc Sức Khỏe Toàn Diện
          </h2>
          <Button
            type="primary"
            size="large"
            className={styles["homecare__cta"]}
          >
            Tư Vấn Ngay
          </Button>
        </div>
      </section>

      <section ref={aboutRef} className={styles["homecare__about"]}>
        <h2 className={styles["homecare__about-title"]}>Về Chúng Tôi</h2>
        <p className={styles["homecare__about-text"]}>
          Công ty TNHH Đầu tư & Công nghệ DAOGROUP là doanh nghiệp công nghệ
          tiên phong trong lĩnh vực y tế và giáo dục, chuyên cung cấp các giải
          pháp số hóa tiên tiến nhằm nâng cao chất lượng chăm sóc sức khỏe và
          đào tạo. Với đội ngũ chuyên gia giàu kinh nghiệm, chúng tôi cam kết
          mang đến những sản phẩm và dịch vụ sáng tạo, góp phần cải thiện cuộc
          sống cộng đồng.
        </p>
      </section>

      <h2 className={styles["homecare__about-title"]}>Sản phẩm</h2>
      <section ref={serviceRef} className={styles["homecare__service"]}>
        {products.map((product, index) => (
          <ProductCard key={index} product={product} />
        ))}
      </section>
      <Button
        type="link"
        className={styles["homecare__about-link"]}
        onClick={() => navigate("home/products")}
      >
        Xem Thêm
      </Button>

      {/* Footer Subscribe Section */}
      <section className={styles["homecare__subscribe"]}>
        <h2 className={styles["homecare__subscribe-title"]}>
          Đăng Ký Nhận Thông Tin Mới Nhất Từ Home Care
        </h2>
        <p className={styles["homecare__subscribe-desc"]}>
          Hãy để lại email của bạn để nhận thông báo về các dịch vụ y tế tại
          nhà, chương trình ưu đãi đặc biệt, và những mẹo chăm sóc sức khỏe hữu
          ích từ đội ngũ chuyên gia của chúng tôi.
        </p>
        <div className={styles["homecare__subscribe-input"]}>
          <Input placeholder="Nhập email của bạn..." size="large" />
          <Button type="primary">Đăng Ký Ngay</Button>
        </div>
      </section>

      <footer className={styles["homecare__footer"]}>
        <div className={styles["homecare__footer-content"]}>
          <div className={styles["homecare__footer-col"]}>
            <img src="/logo_home_care.jpg" alt="logo" />
            <p>Giải Pháp Chăm Sóc Sức Khỏe Toàn Diện</p>
          </div>

          <div className={styles["homecare__footer-col"]}>
            <h4>Thông Tin Liên Hệ</h4>
            <p>
              <FaMapMarkerAlt /> Số 22, đường 3.7/10, KĐT Gamuda Gardens, Hoàng
              Mai, Hà Nội
            </p>
            <p>
              <FaPhoneAlt /> 0969 268 000
            </p>
            <p>
              <FaEnvelope /> daogroupltd@gmail.com
            </p>
          </div>
        </div>

        <div className={styles["homecare__copyright"]}>
          &nbsp;|&nbsp; © 2025 Home Care by DAO Group. All Rights Reserved.
          &nbsp;|&nbsp;
        </div>
      </footer>

      <Modal
        key={new Date()}
        title="Liên Hệ Với Chúng Tôi"
        open={isContactOpen}
        onCancel={handleContactCancel}
        footer={null}
      >
        <Form layout="vertical">
          <div className={styles["homecare__logo"]}>
            <img src="/logo_home_care.jpg" alt="logo_home_care.jpg" />
          </div>
          <p style={{ marginBottom: 16, fontSize: 14, color: "#555" }}>
            Vui lòng điền thông tin bên dưới để HomeCare có thể liên hệ với bạn
            và cung cấp tài khoản dùng thử phù hợp.
          </p>
          <Form.Item label="Họ và tên" name="name" rules={[{ required: true }]}>
            <Input placeholder="Nhập họ và tên..." />
          </Form.Item>

          <Form.Item
            label="Số điện thoại"
            name="phone"
            rules={[{ required: true }]}
          >
            <Input placeholder="Nhập số điện thoại..." />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, type: "email" }]}
          >
            <Input placeholder="Nhập email..." />
          </Form.Item>

          <Form.Item
            label="Nội dung"
            name="message"
            rules={[{ required: true }]}
          >
            <Input.TextArea rows={4} placeholder="Nhập nội dung liên hệ..." />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Gửi
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default HomeCareLanding;
