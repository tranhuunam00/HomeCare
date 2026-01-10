import React, { useState } from "react";
import { Form, Input, Button, Typography, Card, Row, Col } from "antd";
import { useNavigate } from "react-router-dom";
import useToast from "../../hooks/useToast";
import API_CALL from "../../services/axiosClient";
import { useGlobalAuth } from "../../contexts/AuthContext";
import { GoogleLogin } from "@react-oauth/google";
import { passwordMinLengthRule } from "./auth.constant";

const { Title, Text, Link } = Typography;

const LoginPage = () => {
  const navigate = useNavigate();
  const { showError, showSuccess } = useToast();
  const { handleLoginContext } = useGlobalAuth();

  const [logo] = useState("/logo_home_care.png");

  const onFinish = async ({ email, password }) => {
    try {
      const res = await API_CALL.post("/auth/login", { email, password });
      const { token, user, doctor } = res.data.data;
      handleLoginContext({ token, user, doctor });
      showSuccess("Đăng nhập thành công");
      navigate("/");
    } catch (err) {
      const message = err?.response?.data?.message || "Đăng nhập thất bại!";
      showError(message);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        backgroundColor: "#f0f2f5",
        justifyContent: "center",
        width: "100vw",
        height: "100vh",
      }}
    >
      <div style={{ display: "flex", alignItems: "center" }}>
        <div
          style={{
            backgroundImage: "url('/banner.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            width: 500,
            height: 500,
          }}
        />
        <Card
          style={{
            width: 500,
            padding: 24,
            height: 500,
            borderRadius: 10,
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          }}
        >
          {/* Logo */}
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <img src={logo} alt="Logo" style={{ height: 60 }} />
          </div>

          <Title level={3} style={{ textAlign: "center" }}>
            Đăng Nhập
          </Title>

          <Form layout="vertical" onFinish={onFinish}>
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
              rules={[
                { required: true, message: "Vui lòng nhập mật khẩu!" },
                passwordMinLengthRule(6),
              ]}
            >
              <Input.Password placeholder="Mật khẩu" />
            </Form.Item>

            {/* Quên mật khẩu & Liên hệ kỹ thuật */}
            <Row justify="space-between" style={{ marginBottom: 16 }}>
              <Col>
                <Link onClick={() => navigate("/forgot-password")}>
                  Quên mật khẩu?
                </Link>
              </Col>
              <Col>
                <Text type="secondary">
                  Liên hệ kỹ thuật:{" "}
                  <a
                    href="https://zalo.me/84961766816"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Mr. Nam – Zalo: 0961 766 816
                  </a>
                </Text>
              </Col>
            </Row>

            <Form.Item>
              <Button type="primary" htmlType="submit" block>
                Đăng nhập
              </Button>
            </Form.Item>
          </Form>

          {/* Google Login */}
          <GoogleLogin
            onSuccess={async (credentialResponse) => {
              try {
                const id_token = credentialResponse.credential;
                const res = await API_CALL.post("/auth/google-login", {
                  id_token,
                });

                const { token, user, doctor } = res.data.data;
                handleLoginContext({ token, user, doctor });
                showSuccess("Đăng nhập Google thành công");
                navigate("/");
              } catch (err) {
                showError(
                  err?.response?.data?.message || "Đăng nhập Google thất bại!"
                );
              }
            }}
            onError={() => showError("Google đăng nhập thất bại!")}
            width="100%"
            locale="vi"
          />
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
