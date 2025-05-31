import React, { useState } from "react";
import { Form, Input, Button, Typography, Card, Checkbox, Divider } from "antd";
import { useNavigate } from "react-router-dom";
import useToast from "../../hooks/useToast";

const { Title } = Typography;

const RegisterPage = () => {
  const navigate = useNavigate();
  const { showError, showSuccess } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [logo] = useState("/logo_home_care.jpg");

  const onFinish = ({ username, password, confirmPassword }) => {
    if (password !== confirmPassword) {
      showError("Mật khẩu nhập lại không khớp!");
      return;
    }

    if (username === "admin" && password === "123456") {
      showSuccess("Đăng ký thành công!");
      navigate("/home");
    } else {
      showError("Tên đăng nhập hoặc mật khẩu không đúng!");
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
          backgroundImage: "url('/banner.png')",
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
              label="Tên đăng nhập"
              name="username"
              rules={[
                { required: true, message: "Vui lòng nhập tên đăng nhập!" },
              ]}
            >
              <Input placeholder="Tên đăng nhập" />
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

          <Button
            type="default"
            style={{
              width: "100%",
              backgroundColor: "#fff",
              border: "1px solid #d9d9d9",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
            onClick={handleGoogleLogin}
          >
            <img
              src="https://developers.google.com/identity/images/g-logo.png"
              alt="Google"
              style={{ width: 18, height: 18 }}
            />
            Đăng nhập bằng Google
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default RegisterPage;
