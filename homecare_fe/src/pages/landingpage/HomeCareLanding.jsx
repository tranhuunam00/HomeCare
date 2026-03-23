// HomeCareLanding.jsx
import React, { useEffect, useRef, useState } from "react";
import {
  Avatar,
  Button,
  Drawer,
  Dropdown,
  Form,
  Input,
  Menu,
  Modal,
  Tooltip,
} from "antd";
import {
  DownOutlined,
  MenuOutlined,
  SearchOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { FaPhoneAlt, FaMapMarkerAlt, FaEnvelope } from "react-icons/fa";
import styles from "./HomeCareLanding.module.scss";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useGlobalAuth } from "../../contexts/AuthContext";
import DoctorAdvisorsSlider from "./DoctorAdvisorsSlider";
import API_CALL from "../../services/axiosClient";
import HomeCareHeader from "./header/HomeCareHeader";
import HomeCareFooter from "./footer/HomeCareFooter";

const textVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.15,
      duration: 0.8,
      ease: "easeOut",
    },
  }),
};

const HomeCareLanding = () => {
  const navigate = useNavigate();
  const { isLoggedIn, user, doctor, handleLogoutGlobal, doctors } =
    useGlobalAuth();

  const [isContactOpen, setIsContactOpen] = useState(false);
  const handleContactCancel = () => setIsContactOpen(false);
  const [advisorDoctors, setAdvisorDoctors] = useState([]);

  const topRef = useRef(null);

  useEffect(() => {
    if (!doctors || doctors.length == 0) {
      API_CALL.get("/doctor")
        .then((data) => {
          const advisors = data.data.data.data.filter((d) => d.is_advisor);
          setAdvisorDoctors(advisors);
        })
        .catch((err) => console.error(err));
    } else {
      setAdvisorDoctors(doctors.filter((d) => d.is_advisor));
    }
  }, [doctors]);

  return (
    <>
      <HomeCareHeader />
      <div className={styles["homecare"]}>
        <section ref={topRef} className={styles["homecare__hero"]}></section>

        <section
          className={styles["homecare__advisors"]}
          style={{
            textAlign: "center",
            marginTop: 80,
            marginBottom: 80,
          }}
        >
          <h2
            style={{
              color: "#04580f",
              fontWeight: "bold",
              marginBottom: 40,
              fontSize: 30,
            }}
          >
            CỐ VẤN CHUYÊN MÔN
          </h2>

          {advisorDoctors?.length > 0 ? (
            <DoctorAdvisorsSlider doctors={advisorDoctors} />
          ) : (
            <p>Đang cập nhật danh sách cố vấn...</p>
          )}
        </section>

        <section className={styles["homecare__agency"]}>
          <div className={styles["homecare__agency-container"]}>
            <div className={styles["homecare__agency-left"]}>
              <img
                className={styles["homecare__agency-left_logo"]}
                src="/logo_home_care.png"
              />
              <h2>D-RADS</h2>
              <p>Nhanh hơn - Dễ hơn - Chuẩn hơn</p>
            </div>
            <div className={styles["homecare__agency-right"]}>
              <ul className={styles["homecare__agency-services"]}>
                {[
                  "Ngân hàng mẫu kết quả gồm hơn 3.000 mẫu Template bình thường và bệnh lý được chuẩn hóa theo các phân loại quốc tế, dành cho Siêu âm, X quang, Cắt lớp vi tính MSCT, Cộng hưởng từ MRI, Điện quang can thiệp, Nội soi tiêu hóa, Thăm dò chức năng và Y học hạt nhân.",
                  "Tích hợp công cụ AI dịch kết quả từ tiếng Việt sang tiếng Anh và hơn 30 ngôn ngữ khác với độ chính xác theo ngôn ngữ y khoa đạt hơn 90%. ",
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
                    <img src={`/landing/icon${index + 1}.svg`} alt="Figma" />
                    <strong>{text}</strong>
                  </motion.li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* <PackageList /> */}

        <div
          style={{
            alignItems: "center",
            display: "flex",
            justifyContent: "center",
            marginTop: 60,
            marginBottom: 60,
          }}
        >
          <Button
            type="primary"
            size="large"
            style={{
              backgroundColor: "#04580fff",
            }}
            onClick={() => {
              navigate("/contact");
            }}
            className={styles["contact"]}
          >
            {"Gửi yêu cầu, góp ý cho chúng tôi".toUpperCase()}
          </Button>
        </div>
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
              <img src="/logo_home_care.png" alt="logo_home_care.png" />
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
