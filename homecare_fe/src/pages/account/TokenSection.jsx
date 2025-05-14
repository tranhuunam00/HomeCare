// TokenSection.jsx
import React from "react";
import { Card, Divider } from "antd";
import styles from "./AccountPage.module.scss";

const TokenSection = () => (
  <Card
    className={`${styles["account-page__card"]} ${styles["account-page__token-card"]}`}
  >
    <p>
      <b>Chrome</b> 136.0.0.0
    </p>
    <p className="enabled">Nhận thông báo</p>
    <p style={{ fontSize: 13 }}>
      Mở quyền thông báo để nhận thông báo từ ứng dụng
    </p>
    <Divider />
    <p>
      <b>Token:</b>
    </p>
    <p className="token">
      dQeZrYaBRVZOrjIfB1POZM:APA91bFzaRv-iBfLd_7GLLFQvZNcgJ5Rt4v6C7Twlo...
    </p>
  </Card>
);

export default TokenSection;
