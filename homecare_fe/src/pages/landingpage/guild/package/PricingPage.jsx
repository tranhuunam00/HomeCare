import React from "react";
import { Button } from "antd";
import { useNavigate } from "react-router-dom";
import PackageList from "../../../packages/list/PackageList";
import HomeCareHeader from "../../header/HomeCareHeader";
import { useGlobalAuth } from "../../../../contexts/AuthContext";

const PricingPage = () => {
  const navigate = useNavigate();
  const { user } = useGlobalAuth();

  return (
    <div style={{ width: "100vw" }}>
      <HomeCareHeader />

      <div
        style={{
          padding: "32px 40px",
          background: "#f6f8fb",
          minHeight: "100vh",
          paddingTop: 120,
        }}
      >
        {!user?.id && (
          <Button
            type="link"
            onClick={() => navigate("/login")}
            style={{ padding: 0, marginBottom: 8, marginLeft: 10 }}
          >
            Đăng nhập để sử dụng đầy đủ tính năng
          </Button>
        )}

        <PackageList isLanding={true} />
      </div>
    </div>
  );
};

export default PricingPage;
