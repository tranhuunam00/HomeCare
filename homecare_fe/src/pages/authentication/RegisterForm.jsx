import React, { useState } from "react";
import { Form, Input, Button, Typography, Card, Checkbox, Divider } from "antd";
import { useNavigate } from "react-router-dom";
import useToast from "../../hooks/useToast";
import API_CALL from "../../services/axiosClient";
import { USER_ROLE } from "../../constant/app";
import { GoogleLogin } from "@react-oauth/google";
import { useGlobalAuth } from "../../contexts/AuthContext";

const { Title } = Typography;

const RegisterPage = () => {
  const navigate = useNavigate();
  const { showError, showSuccess } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [logo] = useState("/logo_home_care.jpg");
  const { handleLoginContext } = useGlobalAuth();

  const onFinish = async ({ email, password, confirmPassword, fullName }) => {
    if (password !== confirmPassword) {
      showError("Mật khẩu nhập lại không khớp!");
      return;
    }

    try {
      const res = await API_CALL.post("/auth/register", {
        email,
        password,
        id_role: USER_ROLE.DOCTOR,
        fullName,
      });
      showSuccess("Đăng ký thành công! Vui lòng kiểm tra email để xác nhận");
      navigate("/");
    } catch (err) {
      const message = err?.response?.data?.message || "Đăng ký thất bại!";
      showError(message);
    }
  };

  const handleGoogleLogin = () => {
    showSuccess("Chức năng đăng nhập bằng Google đang phát triển...");
  };

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
            borderRadius: 10,
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
          }}
        >
          {/* Logo */}
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <img src={logo} alt="Logo" style={{ height: 60 }} />
          </div>

          <Title level={3} style={{ textAlign: "center" }}>
            Đăng Ký
          </Title>

          <Form
            name="register_form"
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
                  message: "Vui lòng nhập email!",
                },
              ]}
            >
              <Input placeholder="Email@gmail.com" />
            </Form.Item>

            <Form.Item
              label="Họ và tên"
              name="fullName"
              rules={[
                { required: true, message: "Vui lòng nhập tên của bạn!" },
              ]}
            >
              <Input placeholder="Trần Văn B" />
            </Form.Item>

            <Form.Item
              label="Mật khẩu"
              name="password"
              rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
            >
              <Input
                placeholder="Mật khẩu"
                type={showPassword ? "text" : "password"}
              />
            </Form.Item>

            <Form.Item
              label="Nhập lại mật khẩu"
              name="confirmPassword"
              rules={[
                { required: true, message: "Vui lòng nhập lại mật khẩu!" },
              ]}
            >
              <Input
                placeholder="Nhập lại mật khẩu"
                type={showPassword ? "text" : "password"}
              />
            </Form.Item>

            <Form.Item style={{ marginTop: -10 }}>
              <Checkbox onChange={(e) => setShowPassword(e.target.checked)}>
                Hiện mật khẩu
              </Checkbox>
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                style={{ width: "100%", borderRadius: 5 }}
              >
                Đăng ký
              </Button>
            </Form.Item>
          </Form>

          <Divider plain>Hoặc</Divider>

          <GoogleLogin
            onSuccess={async (credentialResponse) => {
              try {
                const id_token = credentialResponse.credential;
                const res = await API_CALL.post("/auth/google-login", {
                  id_token,
                });

                const { token, user, doctor } = res.data.data;
                handleLoginContext({ token, user, doctor });
                showSuccess(`Đăng nhập thành công!`);
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

export default RegisterPage;
