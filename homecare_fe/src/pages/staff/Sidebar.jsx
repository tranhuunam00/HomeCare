import React from "react";
import {
  SettingOutlined,
  UserOutlined,
  KeyOutlined,
  EditOutlined,
} from "@ant-design/icons";
import styles from "./StaffPage.module.scss";

const SidebarMenu = ({ onSelect, selected }) => (
  <div className={styles["staff-page__sidebar"]}>
    <div
      className={`${styles["staff-page__sidebar-item"]} ${
        selected === "admin" ? styles.selected : ""
      }`}
      onClick={() => onSelect("admin")}
    >
      <UserOutlined /> Quản trị hệ thống (2)
    </div>
    <div
      className={`${styles["staff-page__sidebar-item"]} ${
        selected === "ke_toan" ? styles.selected : ""
      }`}
      onClick={() => onSelect("ke_toan")}
    >
      <SettingOutlined /> Kế toán (4)
    </div>
    <div
      className={`${styles["staff-page__sidebar-item"]} ${
        selected === "marketing" ? styles.selected : ""
      }`}
      onClick={() => onSelect("marketing")}
    >
      <KeyOutlined /> Marketing
    </div>
    <div
      className={`${styles["staff-page__sidebar-item"]} ${
        selected === "signature" ? styles.selected : ""
      }`}
      onClick={() => onSelect("customer_service")}
    >
      <EditOutlined /> Chăm sóc khách hàng
    </div>
  </div>
);

export default SidebarMenu;
