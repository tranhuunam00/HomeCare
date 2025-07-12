import React from "react";
import { Menu, Dropdown } from "antd";
import { DownOutlined } from "@ant-design/icons";
import styles from "./DropdownNav.module.scss";

const DropdownNav = ({ title, items = [], onClickTitle = () => {} }) => {
  const menu = (
    <Menu className={styles.dropdownMenu}>
      {items.map((item, index) => (
        <Menu.Item
          style={{ borderBottom: "1px solid #ccc", padding: "14px 20px" }}
          key={index}
          onClick={item.onClick}
        >
          {item.label}
        </Menu.Item>
      ))}
    </Menu>
  );

  return (
    <Dropdown overlay={menu} trigger={["hover"]}>
      <span className={styles.menuTitle} onClick={onClickTitle}>
        {title} <DownOutlined />
      </span>
    </Dropdown>
  );
};

export default DropdownNav;
