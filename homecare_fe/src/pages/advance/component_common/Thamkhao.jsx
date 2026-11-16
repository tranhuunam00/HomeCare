import React from "react";
import { Divider, Grid } from "antd";

const { useBreakpoint } = Grid;

export const ThamKhaoLinkHomeCare = ({
  link,
  title = "ỨNG DỤNG",
  name,
  desc,
  isMobile: isMobileProp,
  hideToplabel = false,
  hideAdditionalInfo = false,
}) => {
  const screens = useBreakpoint();
  const isMobile = isMobileProp !== undefined ? isMobileProp : !screens.md;

  return (
    <div style={{ marginBottom: isMobile ? 12 : 24, textAlign: "left" }}>
      <h3
        style={{
          textAlign: "center",
          marginBottom: 2,
          color: "rgba(18, 119, 49, 1)",
          fontSize: isMobile ? 16 : 22,
          fontWeight: 700,
          display: hideToplabel ? "none" : "block",
        }}
      >
        PHẦN MỀM D-RADS
      </h3>
      <h3
        style={{
          textAlign: "center",
          marginBottom: 8,
          marginTop: 0,
          color: "rgba(18, 119, 49, 1)",
          fontSize: isMobile ? 14 : 20,
          fontWeight: 700,
        }}
      >
        {title}
      </h3>
      <h2 style={{ marginBottom: 4, fontSize: isMobile ? 16 : 20, fontWeight: 700, color: "#0f172a" }}>{name}</h2>
      <h5 style={{ fontSize: isMobile ? 13 : 14, fontWeight: 400, color: "#475569", lineHeight: 1.5, margin: "4px 0" }}>{desc}</h5>
      <h5
        style={{
          fontSize: isMobile ? 12 : 13,
          display: hideAdditionalInfo ? "none" : "block",
          marginTop: 4,
          color: "#64748b",
        }}
      >
        {"Xem thêm tại "}
        <a href={link || "https://home-care.vn/product/phan-mem-d-tirads/"} target="_blank" rel="noreferrer" style={{ color: "#0b6b4f", fontWeight: 600 }}>
          www.home-care.vn
        </a>
      </h5>
      <Divider style={{ margin: isMobile ? "8px 0" : "18px 0" }} />
    </div>
  );
};
