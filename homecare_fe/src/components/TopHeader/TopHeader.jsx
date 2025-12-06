import React, { useState } from "react";
import { Input, Avatar, Tooltip, Dropdown, Menu, Drawer, Divider } from "antd";
import { MenuOutlined, AppstoreOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import styles from "./TopHeader.module.scss";
import { QRCodeCanvas } from "qrcode.react";
import { useGlobalAuth } from "../../contexts/AuthContext";
import { USER_ROLE_ID } from "../../constant/app";
import useToast from "../../hooks/useToast";
import NotificationBell from "../../pages/notifications/NotificationBell";

const qrValue = `https://www.daogroup.vn/`;
const currentEndpont = `${
  import.meta.env.VITE_MAIN_ENDPOINT || "http://localhost:5173"
}`;

const TopHeader = ({ collapsed, toggleSidebar }) => {
  const [rightDrawerVisible, setRightDrawerVisible] = useState(false);
  const { user, doctor, handleLogoutGlobal, isOnWorkList, setIsOnWorkList } =
    useGlobalAuth();
  const { showWarning } = useToast();
  const [selectedMenu, setSelectedMenu] = useState("profile");
  const navigate = useNavigate();

  const showRightDrawer = () => setRightDrawerVisible(true);
  const closeRightDrawer = () => setRightDrawerVisible(false);

  const handleMenuClick = ({ key }) => {
    switch (key) {
      case "account":
        navigate("account");
        break;
      case "wallet":
        showWarning("Sắp ra mắt");
        break;
      case "logout":
        handleLogoutGlobal();
        break;
      case "connect":
        showWarning("Sắp ra mắt");
        break;
      default:
        break;
    }
  };

  const userMenu = (
    <Menu onClick={handleMenuClick}>
      <Menu.Item key="user" disabled>
        <div style={{ lineHeight: "1.2" }}>
          <strong style={{ color: "#1677ff" }}>{doctor?.full_name}</strong>
          <br />
          <small>{`${USER_ROLE_ID[user?.id_role]}`}</small>
        </div>
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="account">Quản Lý Tài Khoản</Menu.Item>
      <Menu.Item key="logout">Đăng Xuất</Menu.Item>
    </Menu>
  );
  if (isOnWorkList) {
    return <div className={styles.topHeader} style={{ height: 1 }}></div>;
  }
  return (
    <div className={styles.topHeader}>
      {/* --- Logo & Toggle --- */}
      <div className={styles.topHeader__left} style={{ cursor: "pointer" }}>
        <img
          onClick={() => window.open(currentEndpont)}
          src="/logo_home_care.png"
          className={styles.topHeader__logo}
          alt="logo"
        />
        {!collapsed && <span className={styles.topHeader__title}>D-RADS</span>}
        <MenuOutlined
          style={{ marginLeft: 50 }}
          onClick={toggleSidebar}
          className={styles.topHeader__toggleIcon}
        />
      </div>

      {/* --- Right side --- */}
      <div className={styles.topHeader__right}>
        {/* Avatar Dropdown */}
        <Dropdown
          overlay={userMenu}
          placement="bottomRight"
          trigger={["click"]}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <Avatar
              size={36}
              style={{
                backgroundColor: "#d9d9d9",
                cursor: "pointer",
              }}
              src={
                doctor?.avatar_url ||
                "https://cdn-icons-png.flaticon.com/512/149/149071.png"
              }
            />
            <div style={{ marginLeft: 8, fontWeight: "bold", fontSize: 12 }}>
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

        {/* Bell notification */}
        <Tooltip title="Thông báo">
          <NotificationBell />
        </Tooltip>

        {/* App icon mở Drawer */}
        <AppstoreOutlined
          onClick={showRightDrawer}
          className={styles.topHeader__rightToggle}
        />

        {/* --- Drawer --- */}
        <Drawer
          title={null}
          placement="right"
          width={320}
          onClose={closeRightDrawer}
          open={rightDrawerVisible}
          closable={false}
          className={styles.rightDrawer}
        >
          <div className={styles.drawerHeader}>
            <div>
              <div className={styles.customerName}>D-RADS</div>
              <div className={styles.version}>ver. 1.0</div>
            </div>
            <div className={styles.drawerClose} onClick={closeRightDrawer}>
              ✕
            </div>
          </div>

          {/* QR liên hệ */}
          <div className={styles.qrContact}>
            <QRCodeCanvas value={qrValue} size={128} level="H" includeMargin />
            <p>
              Liên hệ <strong>0961 766 816</strong>
            </p>
            <div className={styles.socials}>
              <a href="#">Zalo</a> · <a href="#">Facebook</a> ·{" "}
              <a href="https://www.daogroup.vn/" target="_blank">
                Website
              </a>
            </div>
          </div>

          <Divider />

          {/* ✅ Thêm phần Chính sách & Điều khoản */}
          <div className={styles.policyLinks}>
            <h4 style={{ fontWeight: 600, marginBottom: 8 }}>
              Tài liệu & pháp lý
            </h4>
            <ul style={{ listStyle: "none", padding: 0, lineHeight: 1.8 }}>
              <li>
                <a
                  href="/privacy-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  🔒 Chính sách bảo mật dữ liệu
                </a>
              </li>

              <li>
                <a
                  href="mailto:daogroupltd@gmail.com"
                  rel="noopener noreferrer"
                >
                  📧 Liên hệ hỗ trợ: daogroupltd@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </Drawer>
      </div>
    </div>
  );
};

export default TopHeader;
