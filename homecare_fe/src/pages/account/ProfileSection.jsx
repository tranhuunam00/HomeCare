// ProfileSection.jsx
import React from "react";
import { Card, Avatar, Divider } from "antd";
import { UserOutlined } from "@ant-design/icons";
import styles from "./AccountPage.module.scss";

const ProfileSection = () => (
  <Card className={styles["account-page__card"]}>
    <div className={styles["account-page__profile"]}>
      <Avatar size={64} icon={<UserOutlined />} />
      <div>
        <h3>Vũ Thị Hồng_272</h3>
        <p>Marketing</p>
      </div>
    </div>
    <Divider />
    <p>
      <b>Tên đầy đủ:</b> Vũ Thị Hồng_272
    </p>
    <p>
      <b>Điện thoại:</b> 0936944427
    </p>
    <p>
      <b>Email:</b>
    </p>
    <p>
      <b>Ngày sinh:</b> 01-01-1990
    </p>
    <p>
      <b>Ngày tham gia:</b> 12-05-2025
    </p>
    <p>
      <b>Địa chỉ:</b>
    </p>
  </Card>
);

export default ProfileSection;
