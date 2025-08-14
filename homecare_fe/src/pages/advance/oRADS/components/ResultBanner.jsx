import React from "react";
import { Typography } from "antd";
const { Title, Paragraph } = Typography;

export default function ResultBanner({ title, subtitle }) {
  return (
    <div
      style={{
        marginTop: 20,
        padding: "16px 18px",
        borderRadius: 12,
        background:
          "linear-gradient(90deg, rgba(22,119,255,0.15), rgba(22,119,255,0.05))",
        border: "1px solid #1677ff33",
      }}
    >
      <Title level={3} style={{ color: "#fff", margin: 0 }}>
        {title}
      </Title>
      {subtitle && (
        <Paragraph style={{ color: "#d0d0d0", marginTop: 8 }}>
          {subtitle}
        </Paragraph>
      )}
    </div>
  );
}
