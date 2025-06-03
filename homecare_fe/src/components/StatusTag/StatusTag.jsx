// components/StatusTag.jsx
import React from "react";
import { Tag } from "antd";

const StatusTag = ({ status, type }) => {
  let color =
    status === "Đã thanh toán"
      ? "green"
      : status === "Chưa thanh toán"
      ? "red"
      : "orange";

  switch (type) {
    case "customer":
      if (status === "Chưa xác nhận") {
        color = "orange";
      }
      if (status === "Đang hoạt động") {
        color = "green";
      }
      if (status === "Bị cấm") {
        color = "red";
      }
      break;

    case "products":
      if (status === "Coming soon") {
        color = "orange";
      }
      if (status === "Đang hoạt động") {
        color = "green";
      }
  }

  return (
    <Tag
      style={{
        padding: 0,
        paddingLeft: 4,
        paddingRight: 4,

        margin: 0,
        fontSize: 12,
        height: 24,
      }}
      color={color}
    >
      {status}
    </Tag>
  );
};

export default StatusTag;
