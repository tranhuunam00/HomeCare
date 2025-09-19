import React, { useState } from "react";
import { Form, Input, Button, Typography, Card } from "antd";
import { useNavigate } from "react-router-dom";
import useToast from "../../hooks/useToast";
import API_CALL from "../../services/axiosClient";
import STORAGE from "../../services/storage";
import { useGlobalAuth } from "../../contexts/AuthContext";
const { Title } = Typography;
import { GoogleLogin } from "@react-oauth/google";

const LoginPage = () => {
  const navigate = useNavigate();
  const { showError, showSuccess } = useToast();
  const { handleLoginContext } = useGlobalAuth();

  const onFinish = async ({ email, password }) => {
    try {
      const res = await API_CALL.post("/auth/login", {
        email,
        password,
      });
      const { token, user, doctor } = res.data.data;
      handleLoginContext({ token, user, doctor });
      showSuccess("Đăng nhập thành công");
      navigate("/");
    } catch (err) {
      const message = err?.response?.data?.message || "Đăng nhập thất bại!";
      showError(message);
    }
  };

  const [logo, setLogo] = useState("/logo_home_care.jpg");

  return (
    <div
      style={{
        display: "flex",
        backgroundColor: "#f0f2f5",
        justifyContent: "center",
        width: "100vw",
      }}
    >
      {/* Bên trái: Hình ảnh giới thiệu */}
      <div
        style={{
          backgroundImage: "url('/banner.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          width: 500,
          height: 500,
        }}
      ></div>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Card
          style={{
            width: 500,
            padding: 24,
            height: 500,
            borderRadius: 10,
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
          }}
        >
          {/* Logo */}
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <img src={logo} alt="Logo" style={{ height: 60 }} />
          </div>

          <Title level={3} style={{ textAlign: "center" }}>
            Đăng Nhập
          </Title>

          <Form
            name="login_form"
            onFinish={onFinish}
            layout="vertical"
            requiredMark={false}
          >
            <Form.Item
              label="Email"
              name="email"
              rules={[
                {
                  required: true,
                  type: "email",
                  message: "Vui lòng nhập Email!",
                },
              ]}
            >
              <Input placeholder="Email" />
            </Form.Item>

            <Form.Item
              label="Mật khẩu"
              name="password"
              rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
            >
              <Input.Password placeholder="Mật khẩu" />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                style={{ width: "100%", borderRadius: 5 }}
              >
                Đăng nhập
              </Button>
            </Form.Item>
          </Form>
          <GoogleLogin
            onSuccess={async (credentialResponse) => {
              try {
                const id_token = credentialResponse.credential;
                const res = await API_CALL.post("/auth/google-login", {
                  id_token,
                });

                const { token, user, doctor } = res.data.data;
                handleLoginContext({ token, user, doctor });
                showSuccess(`Đăng nhập thành công! Xin chào ${user.name}`);
                navigate("/");
              } catch (err) {
                const message =
                  err?.response?.data?.message || "Đăng nhập Google thất bại!";
                showError(message);
              }
            }}
            onError={() => {
              showError("Google đăng nhập thất bại!");
            }}
            width="100%"
            locale="vi"
          />
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
