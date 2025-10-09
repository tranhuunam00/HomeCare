import React from "react";
import { Row, Col } from "antd";
import styles from "./PackageList.module.scss";
import PackageCard from "../components/card/PackageCard";
import { PACKAGE_FEATURES } from "../../../constant/permission";

const PackageList = () => {
  const handleSelect = (planKey) => {
    console.log("User chọn gói:", planKey);
    // TODO: mở modal hoặc chuyển hướng sang màn đăng ký
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h2>Chọn gói dịch vụ DRADS phù hợp với bạn</h2>
      </div>

      <Row gutter={[24, 24]} justify="center">
        {Object.entries(PACKAGE_FEATURES).map(([key, plan]) => (
          <Col xs={24} sm={12} md={8} key={key}>
            <PackageCard planKey={key} plan={plan} onSelect={handleSelect} />
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default PackageList;
