// HomeCareLanding.jsx
import React, { useRef, useState } from "react";
import { Avatar, Button, Dropdown, Form, Input, Menu, Modal } from "antd";
import { DownOutlined, SearchOutlined, UserOutlined } from "@ant-design/icons";
import { FaPhoneAlt, FaMapMarkerAlt, FaEnvelope } from "react-icons/fa";
import { SiZalo } from "react-icons/si";
import styles from "./HomeCareLanding.module.scss";
import { useNavigate } from "react-router-dom";
import ProductCard from "../products/productCard/ProductCard";
import FurnitureCarousel from "../../components/slick/FurnitureCarousel";
import { motion } from "framer-motion";
import { useGlobalAuth } from "../../contexts/AuthContext";
import DropdownNav from "../../components/DropdownNav";
import { toast } from "react-toastify";
import API_CALL from "../../services/axiosClient";
import DoctorAdvisorsSlider from "./DoctorAdvisorsSlider";

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
  const { isLoggedIn, user, doctor, handleLogoutGlobal, doctors } =
    useGlobalAuth();

  const [isContactOpen, setIsContactOpen] = useState(false);

  const handleContactCancel = () => setIsContactOpen(false);

  const topRef = useRef(null);

  return (
    <div className={styles["homecare"]}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
          // gap: 200,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <img
            onClick={() => (window.location.href = "https://home-care.vn/")}
            src="/logo_home_care.png"
            alt=""
            width={200}
            style={{ cursor: "pointer" }}
          />
        </div>

        <header className={styles["homecare__header"]}>
          <div className={styles["homecare__container"]}>
            <div
              className={styles["homecare__nav-left"]}
              style={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "center",
                width: "100%",
                gap: 50,
              }}
            >
              <Menu
                mode="horizontal"
                selectable={false}
                className={styles["homecare__menu"]}
                style={{ width: "100%", justifyContent: "center", gap: 40 }}
              >
                <Menu.Item
                  key="home"
                  onClick={() =>
                    (window.location.href = "https://home-care.vn/")
                  }
                >
                  TRANG CHỦ
                </Menu.Item>

                <Menu.Item
                  key="contact"
                  onClick={() => navigate("/home")}
                  style={{ fontSize: 24 }}
                >
                  PHẦN MỀM D-RADS
                </Menu.Item>
                <Menu.Item key="contact" onClick={() => navigate("/contact")}>
                  HỖ TRỢ KỸ THUẬT
                </Menu.Item>
              </Menu>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: "30px",
              gap: 30,
            }}
          >
            {isLoggedIn ? (
              <div
                style={{
                  display: "flex",
                  gap: 30,
                }}
              >
                <Button
                  type="primary"
                  className={styles["homecare__contact"]}
                  onClick={() => {
                    toast.info("✨ Tính năng sắp ra mắt!");
                  }} // hoặc route bạn muốn
                >
                  PACS
                </Button>
                <Button
                  type="primary"
                  className={styles["homecare__contact"]}
                  onClick={() => navigate("/home/form-drad/use")} // hoặc route bạn muốn
                >
                  ĐỌC KẾT QUẢ
                </Button>
                <Button
                  type="primary"
                  className={styles["homecare__contact"]}
                  onClick={() => navigate("/home/tirad")} // hoặc route bạn muốn
                >
                  ỨNG DỤNG
                </Button>
              </div>
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
        </header>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "30px",
            gap: 30,
            minWidth: 200,
          }}
        >
          {isLoggedIn ? (
            <Dropdown
              menu={{
                items: [
                  {
                    key: "profile",
                    label: "Trang cá nhân",
                    onClick: () => navigate("/home/profile"),
                  },
                  {
                    key: "logout",
                    label: "Đăng xuất",
                    onClick: () => handleLogoutGlobal(),
                  },
                ],
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <Avatar
                  size={70}
                  src={doctor?.avatar_url}
                  icon={!user?.avatar_url && <UserOutlined />}
                  style={{ cursor: "pointer", border: "1px solid #000" }}
                />
                <div style={{ marginTop: 8, fontWeight: "bold", fontSize: 12 }}>
                  {[
                    doctor.academic_title ? `${doctor.academic_title}.` : null,
                    doctor.degree ? `${doctor.degree}.` : null,
                    doctor.full_name,
                  ]
                    .filter(Boolean)
                    .join(" ")}
                </div>
              </div>
            </Dropdown>
          ) : (
            <></>
          )}
        </div>
      </div>

      <section ref={topRef} className={styles["homecare__hero"]}></section>

      <section
        className={styles["homecare__advisors"]}
        style={{
          textAlign: "center",
          marginTop: 80,
          marginBottom: 80,
        }}
      >
        <h2 style={{ color: "#04580f", fontWeight: "bold", marginBottom: 40 }}>
          CỐ VẤN CHUYÊN MÔN
        </h2>

        {doctors?.length > 0 ? (
          <DoctorAdvisorsSlider doctors={doctors.filter((d) => d.is_advisor)} />
        ) : (
          <p>Đang cập nhật danh sách cố vấn...</p>
        )}
      </section>

      <section className={styles["homecare__agency"]}>
        <div className={styles["homecare__agency-container"]}>
          <div className={styles["homecare__agency-left"]}>
            <img
              style={{ width: 100 }}
              src="/logo_home_care.png"
              alt="Rocket launch"
            />
            <h2>D-RADS</h2>
            <p
              style={{
                textAlign: "center",
                fontSize: 24,
                fontWeight: "bold",
                padding: 10,
                borderRadius: 8,
              }}
            >
              Nhanh hơn - Dễ hơn - Chuẩn hơn
            </p>
          </div>
          <div className={styles["homecare__agency-right"]}>
            <ul className={styles["homecare__agency-services"]}>
              {[
                "Sở hữu hơn 3.000 mẫu kết quả bình thường và bệnh lý trong các lĩnh vực Siêu âm, X Quang, MSCT, MRI, Điện quang can thiệp, Thăm dò chức năng…",
                "Nội dung chuyên môn được chuẩn hóa theo các phân loại quốc tế Lung RADS, TIRADS, BIRADS, ORADS, TNM, CTSI, AAST, ARCO, FICAT….",
                "Thiết kế chuẩn hóa theo Thông tư 32 Bộ y tế, phân loại mã bệnh quốc tế ICD-10 để dễ dàng đồng bộ với yêu cầu và quy chuẩn của hệ thống BHYT",
                "Đa ngôn ngữ : Tiếng Việt, Tiếng Anh, Tiếng Pháp,..",
                "Dễ dàng tích hợp với các hệ thống HIS/RIS/PACS/eHOS/EMR…",
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
        >
          {"Gửi yêu cầu, góp ý cho chúng tôi".toUpperCase()}
        </Button>
      </div>
      <footer className={styles["homecare__footer"]}>
        <div className={styles["homecare__footer-content"]}>
          <div className={styles["homecare__footer-col"]}>
            <img src="/daogroup.png" alt="logo" />
            <p> Kiến tạo cuộc sống số - Digital for life</p>
            <p>www.daogroup.vn</p>
            <p>
              <a
                href="/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "white" }}
              >
                Chính sách phát triển
              </a>
            </p>
          </div>

          <div className={styles["homecare__footer-col"]}>
            <h4 style={{ color: "white" }}>Thông Tin Liên Hệ</h4>
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
            <img src="/logo_home_care.png" alt="logo_home_care.png" />
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
