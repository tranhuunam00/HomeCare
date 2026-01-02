import React from "react";
import { Card, Button, Tooltip, Divider } from "antd";
import { CheckOutlined, InfoCircleOutlined } from "@ant-design/icons";
import styles from "./PackageCard.module.scss";
import { PACKAGE_FEES } from "../../../../constant/permission";
import { useGlobalAuth } from "../../../../contexts/AuthContext";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const PackageCard = ({ planKey, plan, onSelect, isLanding }) => {
  const { doctor } = useGlobalAuth();
  const fees = PACKAGE_FEES[planKey];
  const navigate = useNavigate();

  const handleSelect = () => {
    if (!doctor?.id) {
      toast.warning("Vui lòng đăng nhập để đăng ký gói dịch vụ");
      navigate("/login");
      return;
    }

    // ✅ đã đăng nhập → vận hành như cũ
    onSelect(planKey);
  };

  return (
    <Card className={styles.packageCard} hoverable>
      <div className={styles.contentWrapper}>
        <div className={styles.header}>
          <h3>{plan.name}</h3>
          {plan.isFree && (
            <h4 style={{ color: "green", fontWeight: 500, fontSize: 15 }}>
              miễn phí
            </h4>
          )}
          {!plan.isFree && (
            <h4 style={{ color: "green", fontWeight: 500, fontSize: 15 }}>
              trả phí
            </h4>
          )}
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
        onClick={handleSelect}
      >
        Đăng ký ngay
      </Button>
      <Divider />
    </Card>
  );
};

export default PackageCard;
