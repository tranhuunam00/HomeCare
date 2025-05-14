// NotificationSection.jsx
import React from "react";
import { Card, Switch, Divider } from "antd";
import styles from "./AccountPage.module.scss";

const NotificationSection = () => (
  <Card className={styles["account-page__card"]} title="Thông báo">
    <div className={styles["account-page__notification"]}>
      <div className={styles["account-page__notification-switch"]}>
        <span>Thông báo cá nhân</span>
        <Switch defaultChecked />
      </div>
      <div className={styles["account-page__notification-switch"]}>
        <span>Âm thanh thông báo</span>
        <Switch />
      </div>
      <Divider />
      <div className={styles["account-page__notification-group"]}>
        <div className={styles["account-page__notification-switch"]}>
          <span>Nhận thông báo khi có thanh toán</span>
          <Switch />
        </div>
        <div className={styles["account-page__notification-switch"]}>
          <span>Nhận thông báo khi xóa thanh toán</span>
          <Switch />
        </div>
        <div className={styles["account-page__notification-switch"]}>
          <span>Nhận thông báo từ app khách hàng</span>
          <Switch />
        </div>
        <div className={styles["account-page__notification-switch"]}>
          <span>Nhận thông báo nội bộ</span>
          <Switch />
        </div>
        <div className={styles["account-page__notification-switch"]}>
          <span>Nhận thông báo từ cổng khách hàng</span>
          <Switch />
        </div>
      </div>
    </div>
  </Card>
);

export default NotificationSection;
