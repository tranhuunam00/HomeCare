// StaffPage.jsx
import React, { useState } from "react";
import { Tabs } from "antd";
import styles from "./StaffPage.module.scss";
import SidebarMenu from "./Sidebar";

const { TabPane } = Tabs;

const StaffPage = () => {
  const [selectedMenu, setSelectedMenu] = useState("profile");

  const renderContent = () => {
    switch (selectedMenu) {
      case "Kế toán":
        return <div>1</div>;
      case "Công nghệ":
        return <div>2</div>;
    }
  };

  return (
    <div className={styles["staff-page"]}>
      <Tabs defaultActiveKey="1" className={styles["staff-page__tabs"]}>
        <TabPane tab="Thông tin chung" key="1">
          <div className={styles["staff-page__content"]}>
            <SidebarMenu onSelect={setSelectedMenu} selected={selectedMenu} />
            <div className={styles["staff-page__details"]}>
              {renderContent()}
            </div>
          </div>
        </TabPane>

        <TabPane tab="Lịch sử" key="2">
          <p>Lịch sử hoạt động sẽ hiển thị ở đây...</p>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default StaffPage;
