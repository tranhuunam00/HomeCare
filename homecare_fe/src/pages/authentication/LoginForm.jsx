import React, { useState } from "react";
import { Form, Input, Button, Typography, Card } from "antd";
import { useNavigate } from "react-router-dom";
import useToast from "../../hooks/useToast";
const { Title } = Typography;

const LoginPage = () => {
  const navigate = useNavigate();
  const { showError, showSuccess } = useToast();
  const onFinish = ({ username, password }) => {
    console.log("username, password ", username, password);
    if (username === "admin" && password === "123456") {
      showSuccess("Đăng nhập thành công!");
      navigate("/home");
    } else {
      showError("Tên đăng nhập hoặc mật khẩu không đúng!");
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
          backgroundImage:
            "url('https://media.istockphoto.com/id/517188688/photo/mountain-landscape.jpg?s=1024x1024&w=0&k=20&c=z8_rWaI8x4zApNEEG9DnWlGXyDIXe-OmsAyQ5fGPVV8=')",
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
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
