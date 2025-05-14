// SignatureSection.jsx
import React from "react";
import { Card, Button } from "antd";
import styles from "./AccountPage.module.scss";

const SignatureSection = () => (
  <Card className={styles["account-page__card"]} title="Cập nhật chữ ký">
    <div style={{ border: "1px dashed #ccc", height: 200, marginBottom: 16 }}>
      {/* Placeholder canvas or signature pad */}
    </div>
    <Button type="primary">Cập nhật chữ ký</Button>
    <Button style={{ marginLeft: 8 }}>Đặt lại</Button>
  </Card>
);

export default SignatureSection;
