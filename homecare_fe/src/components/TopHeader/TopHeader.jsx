import React, { useState } from "react";
import { Input, Avatar, Tooltip, Badge, Dropdown, Menu, Drawer } from "antd";
import {
  MenuOutlined,
  BellOutlined,
  UserOutlined,
  CloudDownloadOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";

import { useNavigate } from "react-router-dom";

import styles from "./TopHeader.module.scss";

import { QRCodeCanvas } from "qrcode.react";
import { useGlobalAuth } from "../../contexts/AuthContext";
import { USER_ROLE, USER_ROLE_ID } from "../../constant/app";
import useToast from "../../hooks/useToast";
import { toast } from "react-toastify";
import SidebarMenu from "../Sidebar";

const qrValue = `https://www.daogroup.vn/`;

const currentEndpont = `${
  import.meta.env.VITE_MAIN_ENDPOINT || "http://localhost:5173"
}`;

const TopHeader = ({ collapsed, toggleSidebar }) => {
  const [rightDrawerVisible, setRightDrawerVisible] = useState(false);
  const { user, doctor, handleLogoutGlobal } = useGlobalAuth();
  const { showSuccess, showError, showWarning } = useToast();
  const [selectedMenu, setSelectedMenu] = useState("profile");

  const showRightDrawer = () => setRightDrawerVisible(true);
  const closeRightDrawer = () => setRightDrawerVisible(false);

  const navigate = useNavigate();
  const handleMenuClick = ({ key }) => {
    switch (key) {
      case "account":
        navigate("account");
        break;
      case "wallet":
        showWarning("Sắp ra mắt");
        break;
      case "logout":
        console.log("Đăng xuất");
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
      <Menu.Divider />
    </Menu>
  );

  return (
    <div className={styles.topHeader}>
      <div
        onClick={() => {
          window.open(currentEndpont);
        }}
        className={styles.topHeader__left}
        style={{ cursor: "pointer" }}
      >
        <img
          src="/logo_home_care.jpg"
          className={styles.topHeader__logo}
          alt="logo"
        />
        {!collapsed && (
          <span className={styles.topHeader__title}>HOMECARE</span>
        )}
        <MenuOutlined
          style={{ marginLeft: 50 }}
          onClick={toggleSidebar}
          className={styles.topHeader__toggleIcon}
        />
      </div>

      <div className={styles.topHeader__right}>
        <Input
          placeholder="Chi tiết eg. nhập tối thiểu 3 ký tự"
          className={styles.topHeader__search}
        />
        <Dropdown
          overlay={userMenu}
          placement="bottomRight"
          trigger={["click"]}
        >
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
        </Dropdown>
        <Tooltip title="Thông báo">
          <Badge
            onClick={() => toast.warning("Sắp ra mắt")}
            count={""}
            size="small"
          >
            <BellOutlined className={styles.topHeader__icon} />
          </Badge>
        </Tooltip>

        {/* Avatar Dropdown giữ nguyên ở đây nếu có */}

        {/* Nút menu bên phải */}
        <AppstoreOutlined
          onClick={showRightDrawer}
          className={styles.topHeader__rightToggle}
        />

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
              <div className={styles.customerName}>Daogroup D software</div>
              <div className={styles.version}>ver. 1</div>
            </div>
            <div className={styles.drawerClose} onClick={closeRightDrawer}>
              ✕
            </div>
          </div>
          <SidebarMenu
            onSelect={(key) => {
              setSelectedMenu(key);
              navigate(`/${key}`); // ✅ Điều hướng nội bộ, không mở tab mới
            }}
            selected={selectedMenu}
          />

          <div className={styles.qrContact}>
            <QRCodeCanvas value={qrValue} size={128} level="H" includeMargin />
            <p>
              Liên hệ <strong>0961 766 816</strong>
            </p>
            <div className={styles.socials}>
              <a href="#">Zalo</a> · <a href="#">Facebook</a> ·
              <a href="https://www.daogroup.vn/">Website</a>
            </div>
          </div>
        </Drawer>
      </div>
    </div>
  );
};

const DrawerItem = ({ icon, title, desc, isLink }) => (
  <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
    <span style={{ fontSize: 20 }}>{icon}</span>
    <div>
      <div style={{ fontWeight: 500 }}>{title}</div>
      <div style={{ fontSize: 13, color: isLink ? "#1677ff" : "#666" }}>
        {desc}
      </div>
    </div>
  </div>
);
export default TopHeader;
