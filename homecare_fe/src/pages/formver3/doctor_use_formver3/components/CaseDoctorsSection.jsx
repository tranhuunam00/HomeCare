import React from "react";
import { Row, Col, Avatar, Tag } from "antd";
import {
  UserOutlined,
  TeamOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";

export default function CaseDoctorsSection({
  readingDoctor,
  consultingDoctor,
  verifyDoctor,
  isMobile = false,
}) {
  const activeDoctors = [readingDoctor, consultingDoctor, verifyDoctor].filter(Boolean);
  const activeCount = activeDoctors.length;

  if (activeCount === 0) return null;

  const doctorColSpan = activeCount === 1 ? 24 : activeCount === 2 ? 12 : 8;

  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: 8,
        padding: isMobile ? "8px 10px" : "10px 14px",
        marginBottom: 12,
        boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 8,
        }}
      >
        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: "#475569",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <UserOutlined style={{ color: "#2563eb" }} />
          Bác sĩ phụ trách ca bệnh
        </span>
        <span style={{ fontSize: 11, color: "#94a3b8" }}>
          ({activeCount} bác sĩ tham gia)
        </span>
      </div>

      <Row gutter={[10, 10]}>
        {/* 1. Bác sĩ đọc ca */}
        {readingDoctor && (
          <Col xs={24} sm={doctorColSpan}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "6px 10px",
                background: "#f0f9ff",
                border: "1px solid #bae6fd",
                borderRadius: 6,
              }}
            >
              <Avatar
                size={36}
                src={readingDoctor.avatar_url}
                icon={<UserOutlined />}
                style={{ backgroundColor: "#0284c7" }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                  <Tag color="blue" style={{ fontSize: 10, margin: 0, padding: "0 4px", lineHeight: "16px" }}>
                    Bác sĩ đọc ca
                  </Tag>
                </div>
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: 13,
                    color: "#0369a1",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                  title={readingDoctor.full_name}
                >
                  {readingDoctor.full_name || "BS. Đang đọc"}
                </div>
                {readingDoctor.phone_number && (
                  <div style={{ fontSize: 11, color: "#64748b" }}>
                    SĐT: {readingDoctor.phone_number}
                  </div>
                )}
              </div>
            </div>
          </Col>
        )}

        {/* 2. Bác sĩ hội chẩn */}
        {consultingDoctor && (
          <Col xs={24} sm={doctorColSpan}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "6px 10px",
                background: "#fff7ed",
                border: "1px solid #fed7aa",
                borderRadius: 6,
              }}
            >
              <Avatar
                size={36}
                src={consultingDoctor.avatar_url}
                icon={<TeamOutlined />}
                style={{ backgroundColor: "#ea580c" }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                  <Tag color="orange" style={{ fontSize: 10, margin: 0, padding: "0 4px", lineHeight: "16px" }}>
                    Bác sĩ hội chẩn
                  </Tag>
                </div>
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: 13,
                    color: "#c2410c",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                  title={consultingDoctor.full_name}
                >
                  {consultingDoctor.full_name || "Chưa có tên"}
                </div>
                {consultingDoctor.phone_number && (
                  <div style={{ fontSize: 11, color: "#64748b" }}>
                    SĐT: {consultingDoctor.phone_number}
                  </div>
                )}
              </div>
            </div>
          </Col>
        )}

        {/* 3. Bác sĩ duyệt */}
        {verifyDoctor && (
          <Col xs={24} sm={doctorColSpan}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "6px 10px",
                background: "#f0fdf4",
                border: "1px solid #bbf7d0",
                borderRadius: 6,
              }}
            >
              <Avatar
                size={36}
                src={verifyDoctor.avatar_url}
                icon={<SafetyCertificateOutlined />}
                style={{ backgroundColor: "#16a34a" }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                  <Tag color="green" style={{ fontSize: 10, margin: 0, padding: "0 4px", lineHeight: "16px" }}>
                    Bác sĩ duyệt
                  </Tag>
                </div>
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: 13,
                    color: "#15803d",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                  title={verifyDoctor.full_name}
                >
                  {verifyDoctor.full_name || "Chưa có tên"}
                </div>
                {verifyDoctor.phone_number && (
                  <div style={{ fontSize: 11, color: "#64748b" }}>
                    SĐT: {verifyDoctor.phone_number}
                  </div>
                )}
              </div>
            </div>
          </Col>
        )}
      </Row>
    </div>
  );
}
