// StaffPage.jsx
import React, { useState } from "react";
import { Tabs } from "antd";
import styles from "./StaffPage.module.scss";

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
        <TabPane tab="Dịch vụ" key="1">
          <div className={styles["staff-page__content"]}>
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
