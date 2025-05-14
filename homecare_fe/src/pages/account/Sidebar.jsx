import React from "react";
import {
  SettingOutlined,
  UserOutlined,
  KeyOutlined,
  EditOutlined,
} from "@ant-design/icons";
import styles from "./AccountPage.module.scss";

const SidebarMenu = ({ onSelect, selected }) => (
  <div className={styles["account-page__sidebar"]}>
    <div
      className={`${styles["account-page__sidebar-item"]} ${
        selected === "profile" ? styles.selected : ""
      }`}
      onClick={() => onSelect("profile")}
    >
      <UserOutlined /> Hồ sơ cá nhân
    </div>
    <div
      className={`${styles["account-page__sidebar-item"]} ${
        selected === "notifications" ? styles.selected : ""
      }`}
      onClick={() => onSelect("notifications")}
    >
      <SettingOutlined /> Thông báo
    </div>
    <div
      className={`${styles["account-page__sidebar-item"]} ${
        selected === "password" ? styles.selected : ""
      }`}
      onClick={() => onSelect("password")}
    >
      <KeyOutlined /> Đổi mật khẩu
    </div>
    <div
      className={`${styles["account-page__sidebar-item"]} ${
        selected === "signature" ? styles.selected : ""
      }`}
      onClick={() => onSelect("signature")}
    >
      <EditOutlined /> Cập nhật chữ ký
    </div>
  </div>
);

export default SidebarMenu;
