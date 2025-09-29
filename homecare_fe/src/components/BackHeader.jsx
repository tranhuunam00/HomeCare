// BackHeader.jsx
import React from "react";
import { Button, Space, Typography } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;

/**
 * Props:
 * - title?: string
 * - onBack?: () => void      // mặc định: navigate(-1)
 * - extra?: React.ReactNode  // khu vực nút bổ sung bên phải
 * - style?: React.CSSProperties
 * - className?: string
 * - level?: 1|2|3|4|5        // cỡ Title, mặc định 4
 * - sticky?: boolean         // true để dính trên đầu
 */
export default function BackHeader({
  title = "",
  onBack,
  extra,
  style,
  className,
  level = 4,
  sticky = false,
}) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) return onBack();
    navigate(-1);
  };

  return (
    <div
      className={className}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        padding: "8px 0",
        ...(sticky
          ? {
              position: "sticky",
              top: 0,
              zIndex: 10,
              background: "#fff",
            }
          : {}),
        ...style,
      }}
    >
      <Space size={12} align="center">
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={handleBack}
          aria-label="Quay lại"
        />
        {title ? (
          <Title level={level} style={{ margin: 0 }}>
            {title}
          </Title>
        ) : null}
      </Space>

      <div>{extra}</div>
    </div>
  );
}
