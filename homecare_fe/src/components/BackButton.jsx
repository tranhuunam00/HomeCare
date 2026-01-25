import React from "react";
import { Button } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const BackButton = ({ to = "/home", label = "Quay lại" }) => {
  const navigate = useNavigate();

  return (
    <Button
      type="link"
      icon={<ArrowLeftOutlined />}
      onClick={() => navigate(to)}
      style={{ padding: 0 }}
    >
      {label}
    </Button>
  );
};

export default BackButton;
