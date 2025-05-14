// AccountPage.jsx
import React, { useState } from "react";
import { Tabs } from "antd";
import ProfileSection from "./ProfileSection";
import NotificationSection from "./NotificationSection";
import TokenSection from "./TokenSection";
import styles from "./AccountPage.module.scss";
import SidebarMenu from "./Sidebar";
import ChangePasswordSection from "./ChangePasswordSection";
import SignatureSection from "./SignatureSection";
import Profile from "../profile/Profile";

const { TabPane } = Tabs;

const AccountPage = () => {
  const [selectedMenu, setSelectedMenu] = useState("profile");

  const renderContent = () => {
    switch (selectedMenu) {
      case "profile":
        return <Profile />;
      case "notifications":
        return <NotificationSection />;
      case "password":
        return <ChangePasswordSection />;
      case "signature":
        return <SignatureSection />;
      default:
        return null;
    }
  };

  return (
    <div className={styles["account-page"]}>
      <Tabs defaultActiveKey="1" className={styles["account-page__tabs"]}>
        <TabPane tab="Thông tin chung" key="1">
          <div className={styles["account-page__content"]}>
            <SidebarMenu onSelect={setSelectedMenu} selected={selectedMenu} />
            <div className={styles["account-page__details"]}>
              {renderContent()}
            </div>
          </div>
          <TokenSection />
        </TabPane>

        <TabPane tab="Lịch sử" key="2">
          <p>Lịch sử hoạt động sẽ hiển thị ở đây...</p>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default AccountPage;
