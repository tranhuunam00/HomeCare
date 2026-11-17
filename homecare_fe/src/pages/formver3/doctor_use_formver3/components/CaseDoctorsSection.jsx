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
  currentDoctor,
  patientDiagnose,
  isMobile = false,
}) {
  const effectiveReadingDoctor =
    readingDoctor ||
    (currentDoctor
      ? {
          full_name: currentDoctor.full_name || currentDoctor.username || "Bác sĩ đọc",
          avatar_url: currentDoctor.avatar_url,
          phone_number: currentDoctor.phone_number,
        }
      : null);

  const effectiveVerifyDoctor =
    verifyDoctor ||
    (patientDiagnose?.technician
      ? {
          full_name: patientDiagnose.technician,
          role_label: "Kỹ thuật viên",
        }
      : null);

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
          Nhân sự phụ trách ca bệnh
        </span>
        <span style={{ fontSize: 11, color: "#94a3b8" }}>
          (3 vị trí chuyên môn)
        </span>
      </div>

      <Row gutter={[10, 10]}>
        {/* 1. Bác sĩ đọc ca */}
        <Col xs={24} sm={8}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "6px 10px",
              background: effectiveReadingDoctor ? "#f0f9ff" : "#f8fafc",
              border: `1px solid ${effectiveReadingDoctor ? "#bae6fd" : "#e2e8f0"}`,
              borderRadius: 6,
              minHeight: 52,
            }}
          >
            <Avatar
              size={34}
              src={effectiveReadingDoctor?.avatar_url}
              icon={<UserOutlined />}
              style={{ backgroundColor: effectiveReadingDoctor ? "#0284c7" : "#cbd5e1" }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Tag color="blue" style={{ fontSize: 10, margin: 0, padding: "0 4px", lineHeight: "16px" }}>
                  Bác sĩ đọc
                </Tag>
              </div>
              <div
                style={{
                  fontWeight: 600,
                  fontSize: 13,
                  color: effectiveReadingDoctor ? "#0369a1" : "#94a3b8",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
                title={effectiveReadingDoctor?.full_name}
              >
                {effectiveReadingDoctor?.full_name || "Chưa phân công"}
              </div>
            </div>
          </div>
        </Col>

        {/* 2. Bác sĩ đọc cùng / hội chẩn */}
        <Col xs={24} sm={8}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "6px 10px",
              background: consultingDoctor ? "#fff7ed" : "#f8fafc",
              border: `1px solid ${consultingDoctor ? "#fed7aa" : "#e2e8f0"}`,
              borderRadius: 6,
              minHeight: 52,
            }}
          >
            <Avatar
              size={34}
              src={consultingDoctor?.avatar_url}
              icon={<TeamOutlined />}
              style={{ backgroundColor: consultingDoctor ? "#ea580c" : "#cbd5e1" }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Tag color="orange" style={{ fontSize: 10, margin: 0, padding: "0 4px", lineHeight: "16px" }}>
                  Bác sĩ đọc cùng
                </Tag>
              </div>
              <div
                style={{
                  fontWeight: 600,
                  fontSize: 13,
                  color: consultingDoctor ? "#c2410c" : "#94a3b8",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
                title={consultingDoctor?.full_name}
              >
                {consultingDoctor?.full_name || "Chưa có bác sĩ đọc cùng"}
              </div>
            </div>
          </div>
        </Col>

        {/* 3. Bác sĩ duyệt / Kỹ thuật viên */}
        <Col xs={24} sm={8}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "6px 10px",
              background: effectiveVerifyDoctor ? "#f0fdf4" : "#f8fafc",
              border: `1px solid ${effectiveVerifyDoctor ? "#bbf7d0" : "#e2e8f0"}`,
              borderRadius: 6,
              minHeight: 52,
            }}
          >
            <Avatar
              size={34}
              src={effectiveVerifyDoctor?.avatar_url}
              icon={<SafetyCertificateOutlined />}
              style={{ backgroundColor: effectiveVerifyDoctor ? "#16a34a" : "#cbd5e1" }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Tag color="green" style={{ fontSize: 10, margin: 0, padding: "0 4px", lineHeight: "16px" }}>
                  {effectiveVerifyDoctor?.role_label || "Bác sĩ duyệt"}
                </Tag>
              </div>
              <div
                style={{
                  fontWeight: 600,
                  fontSize: 13,
                  color: effectiveVerifyDoctor ? "#15803d" : "#94a3b8",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
                title={effectiveVerifyDoctor?.full_name}
              >
                {effectiveVerifyDoctor?.full_name || "Chưa có bác sĩ duyệt"}
              </div>
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
}
