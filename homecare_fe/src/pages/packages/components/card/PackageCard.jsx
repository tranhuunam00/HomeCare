import React from "react";
import { Card, Button, Tooltip } from "antd";
import { CheckOutlined, InfoCircleOutlined } from "@ant-design/icons";
import styles from "./PackageCard.module.scss";

const PackageCard = ({ planKey, plan, onSelect }) => {
  return (
    <Card className={styles.packageCard} hoverable>
      <div className={styles.contentWrapper}>
        <div className={styles.header}>
          <h3>{plan.name}</h3>
          <p className={styles.desc}>{plan.description}</p>
        </div>

        <ul className={styles.features}>
          {plan.permissions.map((feat, index) => (
            <li key={index}>
              <CheckOutlined className={styles.icon} />
              <span>{feat.label}</span>
              <Tooltip title={feat.description}>
                <InfoCircleOutlined className={styles.infoIcon} />
              </Tooltip>
            </li>
          ))}
        </ul>
      </div>

      <Button
        type="primary"
        block
        className={styles.button}
        onClick={() => onSelect(planKey)}
      >
        Đăng ký ngay
      </Button>
    </Card>
  );
};

export default PackageCard;
