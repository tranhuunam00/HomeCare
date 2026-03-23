import React, { useState } from "react";
import { Avatar, Button, Drawer, Dropdown, Menu, Tooltip } from "antd";
import { MenuOutlined, UserOutlined } from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./HomeCareHeader.module.scss";
import { useGlobalAuth } from "../../../contexts/AuthContext";

const HomeCareHeader = () => {
  const navigate = useNavigate();
  const { isLoggedIn, user, doctor, handleLogoutGlobal } = useGlobalAuth();

  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getSelectedKey = () => {
    if (location.pathname.startsWith("/applications")) return "applications";
    if (location.pathname.startsWith("/contact")) return "contact";
    if (location.pathname.startsWith("/guild")) return "guild";
    if (location.pathname.startsWith("/home")) return "home";
    if (location.pathname.startsWith("/pricing")) return "pricing";

    return "home";
  };

  return (
    <>
      <div className={styles.homecareHeader}>
        {/* LEFT: LOGO */}
        <div>
          <Tooltip title="Truy cập trang chủ HomeCare" placement="bottom">
            <img
              src="/logo_home_care.png"
              alt="logo"
              className={styles.logo}
              onClick={() => (window.location.href = "https://home-care.vn/")}
            />
          </Tooltip>

          <div className={styles.mobileMenuButton}>
            <Button
              type="text"
              icon={<MenuOutlined />}
              onClick={() => setMobileMenuOpen(true)}
            />
          </div>
        </div>

        {/* CENTER: MENU */}
        <header className={styles.header}>
          <Menu
            mode="horizontal"
            className={styles.menu}
            selectedKeys={[getSelectedKey()]}
          >
            <Menu.Item
              key="home"
              onClick={() => (window.location.href = "/home")}
            >
              Home
            </Menu.Item>

            <Menu.Item
              key="worklist"
              onClick={() =>
                isLoggedIn ? navigate("/home") : navigate("/login")
              }
            >
              Đọc kết quả
            </Menu.Item>

            <Menu.Item
              key="applications"
              onClick={() => navigate("/applications")}
            >
              Ứng dụng y khoa
            </Menu.Item>

            <Menu.Item key="contact" onClick={() => navigate("/contact")}>
              Hỗ trợ kỹ thuật
            </Menu.Item>

            <Menu.Item key="guild" onClick={() => navigate("/guild")}>
              Hướng dẫn sử dụng
            </Menu.Item>

            <Menu.Item
              key="pricing"
              onClick={() =>
                isLoggedIn
                  ? navigate("/home/subscription")
                  : navigate("/pricing")
              }
            >
              Các gói dịch vụ
            </Menu.Item>
          </Menu>
        </header>

        {/* RIGHT: AUTH */}
        <div className={styles.authWrapper}>
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
              <div className={styles.userBox}>
                <Avatar
                  className={styles.avatar}
                  src={doctor?.avatar_url}
                  icon={!user?.avatar_url && <UserOutlined />}
                />

                <div className={styles.avatarName}>
                  {[
                    doctor?.academic_title ? `${doctor.academic_title}.` : null,
                    doctor?.degree ? `${doctor.degree}.` : null,
                    doctor?.full_name,
                  ]
                    .filter(Boolean)
                    .join(" ")}
                </div>
              </div>
            </Dropdown>
          ) : (
            <div className={styles.authButtons}>
              <Button type="primary" onClick={() => navigate("/login")}>
                Đăng nhập
              </Button>
              <Button type="primary" onClick={() => navigate("/register")}>
                Đăng ký
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* MOBILE MENU */}
      <Drawer
        title="Menu"
        placement="right"
        onClose={() => setMobileMenuOpen(false)}
        open={mobileMenuOpen}
      >
        <Menu mode="vertical">
          <Menu.Item
            key="packages"
            onClick={() =>
              isLoggedIn ? navigate("/home/subscription") : navigate("/pricing")
            }
          >
            CÁC GÓI DỊCH VỤ
          </Menu.Item>

          <Menu.Item
            key="applications"
            onClick={() => navigate("/applications")}
          >
            ỨNG DỤNG Y KHOA
          </Menu.Item>

          <Menu.Item
            key="worklist"
            onClick={() =>
              isLoggedIn ? navigate("/home") : navigate("/login")
            }
          >
            ĐỌC KẾT QUẢ
          </Menu.Item>

          <Menu.Item key="contact" onClick={() => navigate("/contact")}>
            HỖ TRỢ KỸ THUẬT
          </Menu.Item>

          <Menu.Item key="guild" onClick={() => navigate("/guild")}>
            HƯỚNG DẪN SỬ DỤNG
          </Menu.Item>
        </Menu>
      </Drawer>
    </>
  );
};

export default HomeCareHeader;
