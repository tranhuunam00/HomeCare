import React from "react";
import { Button } from "antd";
import { useNavigate } from "react-router-dom";
import PackageList from "../../../packages/list/PackageList";

const PricingPage = () => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        padding: "32px 40px",
        background: "#f6f8fb",
        minHeight: "100vh",
      }}
    >
      <Button
        type="link"
        onClick={() => navigate(-1)}
        style={{ padding: 0, marginBottom: 8 }}
      >
        ← Quay lại
      </Button>
      <Button
        type="link"
        onClick={() => navigate("/login")}
        style={{ padding: 0, marginBottom: 8, marginLeft: 10 }}
      >
        Đăng nhập để sử dụng đầy đủ tính năng
      </Button>

      <PackageList isLanding={true} />
    </div>
  );
};

export default PricingPage;
