import React from "react";
import { Tag } from "antd";

export default function ImageRadioCard({
  selected,
  image,
  label,
  onClick,
  note,
}) {
  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === "Enter" ? onClick() : null)}
      style={{
        cursor: "pointer",
        borderRadius: 12,
        border: selected ? "2px solid #1677ff" : "1px solid #353535",
        boxShadow: selected ? "0 0 0 4px rgba(22,119,255,0.15)" : "none",
        overflow: "hidden",
        width: 320,
        background: "#111",
      }}
    >
      <div style={{ position: "relative", height: 220, background: "#000" }}>
        <img
          src={image}
          alt={label}
          loading="lazy"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
        <span
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            width: 20,
            height: 20,
            borderRadius: "50%",
            border: selected ? "6px solid #1677ff" : "2px solid #ddd",
            background: selected ? "#fff" : "transparent",
            boxSizing: "border-box",
          }}
        />
        {note && (
          <Tag style={{ position: "absolute", left: 12, top: 12 }}>{note}</Tag>
        )}
      </div>
      <div
        style={{
          padding: "12px 14px",
          textAlign: "center",
          color: "#fff",
          fontSize: 16,
          background: "#0a0a0a",
          minHeight: 56,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {label}
      </div>
    </div>
  );
}
