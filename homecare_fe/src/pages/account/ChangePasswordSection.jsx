// ChangePasswordSection.jsx
import React from "react";
import { Card, Input, Button } from "antd";
import styles from "./AccountPage.module.scss";

const ChangePasswordSection = () => (
  <Card className={styles["account-page__card"]} title="Đổi mật khẩu">
    <p>Tên đăng nhập</p>
    <Input defaultValue="tk.tieuchuan272" disabled />
    <p>Mật khẩu hiện tại</p>
    <Input.Password placeholder="Nhập mật khẩu hiện tại" />
    <p>Mật khẩu mới (6 - 15 kí tự)</p>
    <Input.Password placeholder="Nhập mật khẩu mới" />
    <p>Nhập lại mật khẩu mới</p>
    <Input.Password placeholder="Xác nhận mật khẩu mới" />
    <p style={{ fontSize: 13, marginTop: 8 }}>
      <ul>
        <li>Bao gồm số và chữ cái</li>
        <li>Tối thiểu 6 ký tự</li>
      </ul>
    </p>
    <Button type="primary" style={{ marginTop: 8 }}>
      Lưu
    </Button>
  </Card>
);

export default ChangePasswordSection;
