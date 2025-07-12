// AccountPage.jsx
import React, { useState } from "react";
import { Tabs } from "antd";
import ProfileSection from "./ProfileSection";
import NotificationSection from "./NotificationSection";
import TokenSection from "./TokenSection";
import styles from "./AccountPage.module.scss";
import SidebarMenu from "../../components/Sidebar";
import ChangePasswordSection from "./ChangePasswordSection";
import SignatureSection from "./SignatureSection";
import Profile from "../profile/Profile";
import { useGlobalAuth } from "../../contexts/AuthContext";
import { KeyOutlined, SettingOutlined, UserOutlined } from "@ant-design/icons";

const { TabPane } = Tabs;

const AccountPage = () => {
  const [selectedMenu, setSelectedMenu] = useState("profile");
  const { user, doctor } = useGlobalAuth();

  const renderContent = () => {
    switch (selectedMenu) {
      case "profile":
        return <Profile user={user} doctor={doctor} idUser={user?.id} />;
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
        <TabPane tab="Dịch vụ" key="1">
          <div className={styles["account-page__content"]}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div className={styles["account-page__content-child"]}>
                <UserOutlined /> Hồ sơ cá nhân
              </div>
              <div className={styles["account-page__content-child"]}>
                <SettingOutlined /> Thông báo
              </div>
              <div className={styles["account-page__content-child"]}>
                <KeyOutlined /> Đổi mật khẩu
              </div>
            </div>

            <div className={styles["account-page__details"]}>
              {renderContent()}
            </div>
          </div>
          <TokenSection />
        </TabPane>

        <TabPane tab="Lịch sử" key="2">
          <p>Lịch sử hoạt động sẽ hiển thị ở đây...</p>
          <h2>Sắp ra mắt!</h2>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default AccountPage;
