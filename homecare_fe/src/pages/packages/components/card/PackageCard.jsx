import React from "react";
import { Card, Button, Tooltip, Divider } from "antd";
import { CheckOutlined, InfoCircleOutlined } from "@ant-design/icons";
import styles from "./PackageCard.module.scss";
import { PACKAGE_FEES } from "../../../../constant/permission";
import { useGlobalAuth } from "../../../../contexts/AuthContext";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const PackageCard = ({ planKey, plan, onSelect, isLanding, compact }) => {
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
    <Card 
      className={styles.packageCard} 
      hoverable
      bodyStyle={compact ? { padding: "12px 10px" } : undefined}
      styles={compact ? { body: { padding: "12px 10px" } } : undefined}
    >
      <div className={styles.contentWrapper}>
        <div className={styles.header}>
          <h3 style={compact ? { fontSize: "14px", marginBottom: 2 } : undefined}>{plan.name}</h3>
          {plan.isFree && (
            <h4
              style={{
                color: "red",
                fontWeight: 500,
                fontSize: compact ? 12 : 16,
                margin: 0
              }}
            >
              Miễn phí
            </h4>
          )}
          {!plan.isFree && (
            <h4 style={{ color: "green", fontWeight: 500, fontSize: compact ? 12 : 16, margin: 0 }}>
              Trả phí
            </h4>
          )}
          <p 
            className={styles.desc}
            style={compact ? { fontSize: "11px", marginBottom: 6, lineHeight: "14px", height: "42px", overflow: "hidden" } : undefined}
          >
            {plan.description}
          </p>
        </div>

        <ul 
          className={styles.features}
          style={compact ? { margin: "8px 0 12px", padding: "0 4px" } : undefined}
        >
          {plan.permissions.map((feat, index) => (
            <li key={index} style={compact ? { fontSize: "11px", padding: "3px 0", gap: "4px" } : undefined}>
              <CheckOutlined className={styles.icon} />
              <span style={compact ? { whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "80%" } : undefined}>
                {feat.label}
              </span>
              <Tooltip title={feat.description}>
                <InfoCircleOutlined className={styles.infoIcon} style={compact ? { fontSize: "10px" } : undefined} />
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
        size={compact ? "small" : "middle"}
        style={compact ? { fontSize: "12px", borderRadius: 4, height: 28 } : undefined}
      >
        Đăng ký ngay
      </Button>
      {!compact && <Divider />}
    </Card>
  );
};

export default PackageCard;
