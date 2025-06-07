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
import { motion } from "framer-motion";
import { products } from "./products";
import { useGlobalAuth } from "../../contexts/AuthContext";

const textVariants = {
  hidden: { opacity: 0, x: 30 },
  visible: (i) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.2,
      duration: 2,
      ease: "easeOut",
      repeat: Infinity,
      repeatDelay: 2, // l
    },
  }),
};

const HomeCareLanding = () => {
  const navigate = useNavigate();
  const [isContactOpen, setIsContactOpen] = useState(false);

  const showContactModal = () => setIsContactOpen(true);
  const handleContactCancel = () => setIsContactOpen(false);

  const topRef = useRef(null);
  const aboutRef = useRef(null);
  const serviceRef = useRef(null);

  const { showError, showSuccess } = useToast();

  const { isLoggedIn } = useGlobalAuth();

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

            {isLoggedIn ? (
              <Button
                type="primary"
                className={styles["homecare__contact"]}
                onClick={() => navigate("/home")} // hoặc route bạn muốn
              >
                Sử dụng ngay
              </Button>
            ) : (
              <>
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
              </>
            )}
          </div>
        </div>
      </header>

      <section ref={topRef} className={styles["homecare__hero"]}>
        <div className={styles["homecare__hero-inner"]}>
          <h1 className={styles["homecare__title"]}>
            <span>HOME</span>CARE
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
      <h2 style={{ textAlign: "center", marginTop: 50 }}>
        Giá trị của các phần mềm D-RADS
      </h2>

      <section className={styles["homecare__agency"]}>
        <div className={styles["homecare__agency-container"]}>
          <div className={styles["homecare__agency-left"]}>
            <img
              style={{ width: 100 }}
              src="/logo_home_care.jpg"
              alt="Rocket launch"
            />
            <h2>D-RADS</h2>
            <p style={{ textAlign: "left" }}>
              Phần mềm D-RADS chuẩn hóa quy trình chẩn đoán, rút ngắn thời gian
              đọc kết quả và nâng cao hiệu quả chuyên môn cho bác sĩ. Tích hợp
              AI thông minh giúp phân loại tổn thương, dịch đa ngôn ngữ, tư vấn
              kết quả và tạo video trực quan từ văn bản.
            </p>
          </div>
          <div className={styles["homecare__agency-right"]}>
            <ul className={styles["homecare__agency-services"]}>
              {[
                "Thiết kế biểu mẫu chuẩn hóa, đồng bộ giúp rút ngắn thời gian đọc kết quả, tăng chất lượng chẩn đoán cho Bác sĩ",
                "Tích hợp AI tự động phân loại tổn thương theo tiêu chuẩn quốc tế: TIRADS, BIRADS, Lung RADS, PIRADS, LIRADS, RECIST...",
                "Tích hợp AI tự động dịch kết quả đa ngôn ngữ (Anh, Pháp, Trung...)",
                "Tích hợp AI tự động hỗ trợ tư vấn và phiên giải kết quả",
                "Tích hợp AI tự động chuyển kết quả Text sang Video",
              ].map((text, index) => (
                <motion.li
                  key={index}
                  className={styles["homecare__agency-services_module"]}
                  custom={index}
                  initial="hidden"
                  whileInView="visible"
                  variants={textVariants}
                  viewport={{ once: true }}
                >
                  <img src={`/landing/icon${index + 1}.svg`} alt="Figma" />
                  <strong>{text}</strong>
                </motion.li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section ref={aboutRef} className={styles["homecare__about"]}>
        <h2 className={styles["homecare__about-title"]}>Giới thiệu chung</h2>
        <p className={styles["homecare__about-text"]}>
          Công ty TNHH Đầu tư & Công nghệ DAOGROUP là doanh nghiệp công nghệ
          tiên phong trong lĩnh vực y tế và giáo dục, chuyên cung cấp các giải
          pháp số hóa tiên tiến nhằm nâng cao chất lượng chăm sóc sức khỏe và
          đào tạo.
        </p>
        <p className={styles["homecare__about-text"]}>
          Với đội ngũ chuyên gia giàu kinh nghiệm, chúng tôi cam kết mang đến
          những sản phẩm và dịch vụ sáng tạo, góp phần cải thiện cuộc sống cộng
          đồng. Chúng tôi xây dựng một số giải pháp phần mềm y khoa ứng dụng AI
          – Chuẩn hóa kết quả chẩn đoán hình ảnh theo tiêu chuẩn quốc tế
          (D-RADS).
        </p>
        <div
          style={{
            backgroundImage:
              "linear-gradient(135deg,rgb(126, 248, 153),rgb(15, 71, 190))",
            width: 600,
            margin: "auto",
            padding: 20,
            paddingLeft: 60,
            borderRadius: 12,
            color: "#fff",
            textAlign: "left",
          }}
        >
          <h3 style={{ textAlign: "center", marginBottom: 20 }}>
            Giải pháp dành cho
          </h3>
          <p>Phòng khám – Bệnh viện – Trung tâm chẩn đoán hình ảnh</p>
          <p>Bác sĩ chuyên khoa siêu âm, X-quang, CT, MRI</p>
          <p>Đơn vị nghiên cứu – đào tạo trong ngành Y</p>
          <p>Đơn vị sản xuất phần mềm HIS, RIS, PACS</p>
        </div>
      </section>

      <section className={styles["homecare__articles"]}>
        <div className={styles["homecare__articles-top"]}>
          <div className={styles["homecare__articles-text"]}>
            <h2>Tăng tốc độ – giảm sai sót – nâng cao chất lượng chẩn đoán</h2>
            <p>
              Trong kỷ nguyên y học số, việc ứng dụng phần mềm y khoa tích hợp
              trí tuệ nhân tạo (AI) trong chẩn đoán hình ảnh đang trở thành xu
              hướng tất yếu.
            </p>
            <p>
              Một trong những giải pháp đột phá hiện nay là hệ thống phần mềm hỗ
              trợ đánh giá tổn thương theo các hệ thống phân loại chuẩn quốc tế:
              TIRADS, LI-RADS, BI-RADS, PI-RADS, Lung-RADS, RECIST...
            </p>
          </div>
          <div className={styles["homecare__articles-image"]}>
            <img src="/tirads.png" alt="Writing Guide" />
          </div>
        </div>

        <div className={styles["homecare__articles-bottom"]}>
          <div className={styles["homecare__article-card"]}>
            <img
              src="https://medlatec.vn/media/52668/file/sang-loc-133-gen-2.jpg"
              alt="Article 1"
            />
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
            <img
              src="https://benhvienvietbac.vn/wp-content/uploads/2020/01/chuan-doan-hinh-anh.jpg"
              alt="Article 2"
            />
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
            <img
              src="https://www.vinmec.com/static/uploads/20210521_164340_688751_chan_doan_hinh_anh_max_1800x1800_jpg_c5d59ea823.jpg"
              alt="Article 1"
            />
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
            <img
              src="https://cdn.nhathuoclongchau.com.vn/unsafe/https://cms-prod.s3-sgn09.fptcloud.com/cac_ky_thuat_chan_doan_hinh_anh_pho_bien_hien_nay_1_7997c4f8d7.jpg"
              alt="Article 1"
            />
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
            <img
              src="https://benhvienbinhthuan.vn/Uploads/images/KhoaPhong/khoa-chandoanhinhanh.jpg"
              alt="Article 2"
            />
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
