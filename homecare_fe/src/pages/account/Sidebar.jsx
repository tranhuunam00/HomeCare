import React from "react";
import {
  SettingOutlined,
  UserOutlined,
  KeyOutlined,
  EditOutlined,
} from "@ant-design/icons";
import styles from "./AccountPage.module.scss";
import { toast } from "react-toastify";

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
      // onClick={() => onSelect("notifications")}
      onClick={() => toast.warn("Sắp ra mắt!")}
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
  </div>
);

export default SidebarMenu;
