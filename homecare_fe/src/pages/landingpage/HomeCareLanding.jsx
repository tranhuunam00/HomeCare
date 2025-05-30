// HomeCareLanding.jsx
import React, { useRef, useState } from "react";
import { Button, Form, Input, Menu, Modal } from "antd";
import { DownOutlined, SearchOutlined } from "@ant-design/icons";
import { FaPhoneAlt, FaMapMarkerAlt, FaEnvelope } from "react-icons/fa";
import { SiZalo } from "react-icons/si";
import styles from "./HomeCareLanding.module.scss";
import { useNavigate } from "react-router-dom";
import ProductCard from "../products/productCard/ProductCard";
import useToast from "../../hooks/useToast";
import FurnitureCarousel from "../../components/slick/FurnitureCarousel";

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

  const { showError, showSuccess } = useToast();

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
            {/* Giao diện chọn ngôn ngữ */}
            <select
              className={styles["homecare__lang-switcher"]}
              onChange={(e) =>
                showSuccess(`Chuyển sang ngôn ngữ: ${e.target.value}`)
              }
              defaultValue="vi"
            >
              <option value="vi">🇻🇳 VN</option>
              <option value="en">🇺🇸 EN</option>
            </select>

            <Button
              type="primary"
              className={styles["homecare__contact"]}
              onClick={() => navigate("login")}
            >
              Đăng nhập
            </Button>
            <Button
              type="primary"
              className={styles["homecare__contact"]}
              onClick={() => navigate("register")}
            >
              Đăng ký
            </Button>
          </div>
        </div>
      </header>

      <section ref={topRef} className={styles["homecare__hero"]}>
        <div className={styles["homecare__hero-inner"]}>
          <h1 className={styles["homecare__title"]}>
            <span>D</span>_RAD
          </h1>
          <h2 className={styles["homecare__subtitle"]}>
            Chuẩn hóa kết quả chẩn đoán hình ảnh theo tiêu chuẩn quốc tế
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
        <h2 className={styles["homecare__about-title"]}>Giới thiệu chung</h2>
        <p className={styles["homecare__about-text"]}>
          Công ty TNHH Đầu tư & Công nghệ DAOGROUP là doanh nghiệp công nghệ
          tiên phong trong lĩnh vực y tế và giáo dục, chuyên cung cấp các giải
          pháp số hóa tiên tiến nhằm nâng cao chất lượng chăm sóc sức khỏe và
          đào tạo. Với đội ngũ chuyên gia giàu kinh nghiệm, chúng tôi cam kết
          mang đến những sản phẩm và dịch vụ sáng tạo, góp phần cải thiện cuộc
          sống cộng đồng. Chúng tôi xây dựng một số giải pháp phần mềm y khoa
          ứng dụng AI – Chuẩn hóa kết quả chẩn đoán hình ảnh theo tiêu chuẩn
          quốc tế (D-RADS).
        </p>
        <h4>Giải pháp dành cho</h4>
        <p>Phòng khám – Bệnh viện – Trung tâm chẩn đoán hình ảnh</p>
        <p>Bác sĩ chuyên khoa siêu âm, X-quang, CT, MRI</p>
        <p>Đơn vị nghiên cứu – đào tạo trong ngành Y</p>
        <p>Đơn vị sản xuất phần mềm HIS, RIS, PACS</p>
      </section>

      <section className={styles["homecare__articles"]}>
        <div className={styles["homecare__articles-top"]}>
          <div className={styles["homecare__articles-text"]}>
            <h2>Tăng tốc độ – giảm sai sót – nâng cao chất lượng chẩn đoán</h2>
            <p>
              Trong kỷ nguyên y học số, việc ứng dụng phần mềm y khoa tích hợp
              trí tuệ nhân tạo (AI) trong chẩn đoán hình ảnh đang trở thành xu
              hướng tất yếu. Một trong những giải pháp đột phá hiện nay là hệ
              thống phần mềm hỗ trợ đánh giá tổn thương theo các hệ thống phân
              loại chuẩn quốc tế: TIRADS, LI-RADS, BI-RADS, PI-RADS, Lung-RADS,
              RECIST...
            </p>
          </div>
          <div className={styles["homecare__articles-image"]}>
            <img src="/tirads.png" alt="Writing Guide" />
          </div>
        </div>

        <div className={styles["homecare__articles-bottom"]}>
          <div className={styles["homecare__article-card"]}>
            <img src="/si2.png" alt="Article 1" />
            <h4>Hệ thống chuẩn hóa đánh giá tổn thương trên hình ảnh y khoa</h4>
            <p>
              Phân loại nguy cơ ác tính của các nhân tuyến giáp: D-TIRADS
              (Thyroid Imaging Reporting and Data System).
            </p>
            <p>
              Đánh giá nguy cơ ung thư biểu mô tế bào gan: D-LIRADS (Liver
              Imaging Reporting and Data System).
            </p>
            <p>
              Chuẩn hóa đánh giá và báo cáo các bất thường tuyến vú: D-BIRADS
              (Breast Imaging Reporting and Data System).
            </p>
          </div>
          <div className={styles["homecare__article-card"]}>
            <img src="/si1.png" alt="Article 2" />
            <div>
              <h4>Công cụ hỗ trợ chẩn đoán hình ảnh chính xác và nhất quán</h4>
              <p>
                Hỗ trợ phát hiện và phân tầng nguy cơ ung thư tuyến tiền liệt:
                D-PIRADS (Prostate Imaging Reporting and Data System).
              </p>
              <p>
                Sàng lọc và phân loại tổn thương phổi trong phát hiện sớm ung
                thư: D-LungRADS (Lung Imaging Reporting and Data System).
              </p>
              <p>
                Đo lường và theo dõi đáp ứng điều trị của các khối u đặc:
                D-RECIST (Response Evaluation Criteria in Solid Tumors).
              </p>
            </div>
          </div>
        </div>
      </section>

      <h2
        className={styles["homecare__about-title"]}
        style={{ textAlign: "center" }}
      >
        Lợi ích
      </h2>
      <section
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <FurnitureCarousel />
      </section>
      <h2
        className={styles["homecare__about-title"]}
        style={{ textAlign: "center" }}
      >
        Tính năng nổi bật
      </h2>
      <section className={styles["homecare__articles"]}>
        <div className={styles["homecare__articles-bottom"]}>
          <div className={styles["homecare__article-card"]}>
            <img src="/si2.png" alt="Article 1" />
            <h4>Cá nhân hóa</h4>
            <p>
              Tự động dịch kết quả đa ngôn ngữ (Anh, Pháp, Nhật, Trung). Tạo báo
              cáo chẩn đoán bán tự động, rút ngắn thời gian ghi chép.
            </p>
            <p>
              Tự động báo cáo theo mẫu chuẩn: TIRADS, BIRADS, PIRADS, Lung RADS,
              RECIST. Đề xuất phân loại RADS phù hợp, hỗ trợ quyết định lâm
              sàng.
            </p>
          </div>
          <div className={styles["homecare__article-card"]}>
            <img src="/si2.png" alt="Article 1" />
            <h4>AI tạo sinh</h4>
            <p>
              Tích hợp AI tư vấn, biện luận kết quả: giúp Người bệnh dễ dàng
              hiểu được các thuật ngữ chuyên môn có tính đặc thù cao, nâng cao
              trải nghiệm của người bệnh.
            </p>
            <p>
              Tích hợp AI tạo kết quả dạng video: đa dạng hóa trải nghiệm của
              người dùng, hỗ trợ những người hạn chế thị lực, khó đọc.
            </p>
          </div>
          <div className={styles["homecare__article-card"]}>
            <img src="/si1.png" alt="Article 2" />
            <div>
              <h4>AI hỗ trợ</h4>
              <p>
                Tích hợp AI hỗ trợ phát hiện bất thường. Nhận diện tự động các
                đặc điểm hình ảnh trên siêu âm, MRI, CT.
              </p>
              <p>
                Tích hợp AI đo lường và định lượng tổn thương tự động. Lưu trữ
                và theo dõi diễn tiến tổn thương qua từng lần chụp.
              </p>
            </div>
          </div>

          <div className={styles["homecare__article-card"]}>
            <img src="/si1.png" alt="Article 2" />
            <div>
              <h4>Dễ dàng mở rộng</h4>
              <p>
                Kêt nối hệ thống phần mềm bệnh viện và dữ liệu hồ sơ sức khỏe:
                HIS, RIS, PACS, eHos. Kết nối HL7/PACS/RIS, dễ dàng tích hợp vào
                hệ thống bệnh viện.
              </p>
            </div>
          </div>
        </div>
      </section>
      <h2
        style={{ textAlign: "center" }}
        className={styles["homecare__about-title"]}
      >
        Sản phẩm
      </h2>
      <section ref={serviceRef} className={styles["homecare__service"]}>
        {products.map((product, index) => (
          <ProductCard key={index} product={product} />
        ))}
      </section>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Button
          type="link"
          className={styles["homecare__about-link"]}
          onClick={() => navigate("home/products")}
        >
          Xem Thêm
        </Button>
      </div>

      {/* Footer Subscribe Section */}
      <section className={styles["homecare__subscribe"]}>
        <h2 className={styles["homecare__subscribe-title"]}>
          Đăng Ký Nhận Thông Tin Mới Nhất Từ Home Care
        </h2>
        <p className={styles["homecare__subscribe-desc"]}>
          Liên hệ ngay với chúng tôi để được trải nghiệm demo miễn phí và nhận
          tư vấn giải pháp tích hợp hệ thống phần mềm D-RADS vào quy trình vận
          hành y tế.
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
        title="Đăng ký làm đối tác"
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
