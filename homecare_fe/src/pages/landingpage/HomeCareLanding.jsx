// HomeCareLanding.jsx
import React, { useEffect, useRef, useState } from "react";
import { Button, Form, Input, Modal } from "antd";
import styles from "./HomeCareLanding.module.scss";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useGlobalAuth } from "../../contexts/AuthContext";
import DoctorAdvisorsSlider from "./DoctorAdvisorsSlider";
import API_CALL from "../../services/axiosClient";
import HomeCareHeader from "./header/HomeCareHeader";
import HomeCareFooter from "./footer/HomeCareFooter";

const textVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.12,
      duration: 0.6,
      ease: "easeOut",
    },
  }),
};

const HomeCareLanding = () => {
  const navigate = useNavigate();
  const { isLoggedIn, user, doctor, handleLogoutGlobal, doctors } = useGlobalAuth();

  const [isContactOpen, setIsContactOpen] = useState(false);
  const handleContactCancel = () => setIsContactOpen(false);
  const [advisorDoctors, setAdvisorDoctors] = useState([]);

  const topRef = useRef(null);

  useEffect(() => {
    API_CALL.get("/doctor", { params: { limit: 100, is_advisor: true } })
      .then((res) => {
        const advisors = res.data?.data?.data || [];
        setAdvisorDoctors(advisors);
      })
      .catch((err) => console.error(err));
  }, []);

  return (
    <>
      <HomeCareHeader />
      <div className={styles["homecare"]}>
        
        {/* HERO SECTION WITH DYNAMIC ANIMATIONS */}
        <section ref={topRef} className={styles["homecare__hero"]}>
          <div className={styles["hero-overlay"]}></div>
          <div className={styles["hero-content"]}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className={styles["hero-tag"]}
            >
              Hệ thống Chẩn đoán hình ảnh thông minh D-RADS
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className={styles["hero-title"]}
            >
              <div className={styles["title-line-1"]}>
                <span className={styles["title-word"]}>Nhanh hơn</span>
                <span className={styles["title-dot"]}>•</span>
                <span className={styles["title-word"]}>Dễ hơn</span>
              </div>
              <div className={styles["title-line-2"]}>
                <span className={styles["title-word-highlight"]}>Chuẩn xác hơn</span>
              </div>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className={styles["hero-subtitle"]}
            >
              Ngân hàng hơn 3.000 mẫu Template kết quả chuẩn hóa quốc tế tích hợp AI dịch đa ngôn ngữ và các bộ công cụ tính điểm hỗ trợ bác sĩ lâm sàng.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className={styles["hero-actions"]}
            >
              <Button 
                type="primary" 
                size="large" 
                className={styles["hero-btn-primary"]}
                onClick={() => isLoggedIn ? navigate("/home") : navigate("/login")}
              >
                Bắt đầu trải nghiệm
              </Button>
              <Button 
                size="large" 
                className={styles["hero-btn-secondary"]}
                onClick={() => {
                  document.getElementById("advisors-section")?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Cố vấn chuyên môn
              </Button>
            </motion.div>
          </div>
        </section>

        {/* CỐ VẤN CHUYÊN MÔN - SLIDER */}
        <section id="advisors-section" className={styles["homecare__advisors"]}>
          <div className={styles["section-header"]}>
            <motion.span 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className={styles["section-tag"]}
            >
              Đội ngũ hàng đầu
            </motion.span>
            <motion.h2 
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className={styles["section-title"]}
            >
              CỐ VẤN CHUYÊN MÔN
            </motion.h2>
            <div className={styles["title-divider"]}></div>
          </div>

          <div className={styles["advisors-slider-container"]}>
            {advisorDoctors?.length > 0 ? (
              <DoctorAdvisorsSlider doctors={advisorDoctors} />
            ) : (
              <p className={styles["loading-text"]}>Đang cập nhật danh sách cố vấn...</p>
            )}
          </div>
        </section>

        {/* AGENCY & SERVICES SECTION */}
        <section className={styles["homecare__agency"]}>
          <div className={styles["homecare__agency-container"]}>
            <div className={styles["homecare__agency-left"]}>
              <motion.img
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
                className={styles["homecare__agency-left_logo"]}
                src="/logo_home_care.png"
                alt="Logo D-RADS"
              />
              <h2>D-RADS SYSTEMS</h2>
              <p className={styles["motto"]}>Đồng hành cùng nền Y tế số hiện đại</p>
            </div>
            
            <div className={styles["homecare__agency-right"]}>
              <ul className={styles["homecare__agency-services"]}>
                {[
                  "Ngân hàng mẫu kết quả gồm hơn 3.000 mẫu Template bình thường và bệnh lý được chuẩn hóa theo các phân loại quốc tế, dành cho Siêu âm, X quang, Cắt lớp vi tính MSCT, Cộng hưởng từ MRI, Điện quang can thiệp, Nội soi tiêu hóa, Thăm dò chức năng và Y học hạt nhân.",
                  "Tích hợp công cụ AI dịch kết quả từ tiếng Việt sang tiếng Anh và hơn 30 ngôn ngữ khác với độ chính xác theo ngôn ngữ y khoa đạt hơn 90%.",
                  "Tích hợp bộ công cụ phổ biến hỗ trợ Bác sĩ đọc kết quả: TI-RADS, BI-RADS, Lung-RADS, LI-RADS, PI-RADS, O-RADS, C-RADS, Bone-RADS, Bone-Age, CTSI, AAST 1994, RECIST...",
                  "Tích hợp với danh mục phân loại mã bệnh quốc tế ICD-10",
                  "Tích hợp 2 chiều với các hệ thống quản lý thông tin bệnh viện HIS/RIS/PACS/EMR…",
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
                    <div className={styles["icon-bullet"]}>
                      <span className={styles["bullet-number"]}>{index + 1}</span>
                    </div>
                    <strong>{text}</strong>
                  </motion.li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* CONTACT / CTA */}
        <section className={styles["homecare__cta"]}>
          <div className={styles["cta-card"]}>
            <h3>Hợp tác phát triển & Giải đáp thắc mắc</h3>
            <p>Để nhận tài khoản dùng thử và hỗ trợ tích hợp HIS/RIS/PACS, vui lòng liên hệ với chúng tôi.</p>
            <Button
              type="primary"
              size="large"
              onClick={() => navigate("/contact")}
              className={styles["contact-btn"]}
            >
              GỬI YÊU CẦU & LIÊN HỆ HỢP TÁC
            </Button>
          </div>
        </section>

        <HomeCareFooter />

        <Modal
          key={new Date()}
          title="Đăng ký làm đối tác"
          open={isContactOpen}
          onCancel={handleContactCancel}
          footer={null}
        >
          <Form layout="vertical">
            <div className={styles["homecare__logo"]}>
              <img src="/logo_home_care.png" alt="logo" />
            </div>
            <p style={{ marginBottom: 16, fontSize: 14, color: "#555" }}>
              Vui lòng điền thông tin bên dưới để HomeCare có thể liên hệ với
              bạn và cung cấp tài khoản dùng thử phù hợp.
            </p>
            <Form.Item
              label="Họ và tên"
              name="name"
              rules={[{ required: true }]}
            >
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
    </>
  );
};

export default HomeCareLanding;
