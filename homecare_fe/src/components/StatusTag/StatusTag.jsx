// components/StatusTag.jsx
import React from "react";
import { Tag } from "antd";

const StatusTag = ({ status }) => {
  let color =
    status === "Đã thanh toán"
      ? "green"
      : status === "Chưa thanh toán"
      ? "red"
      : "orange";

  return <Tag color={color}>{status}</Tag>;
};

export default StatusTag;
