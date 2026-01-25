import React, { useState } from "react";
import { Form, Input, Button, Typography, Card, Row, Col } from "antd";
import { useNavigate } from "react-router-dom";
import useToast from "../../hooks/useToast";
import API_CALL from "../../services/axiosClient";
import BackButton from "../../components/BackButton";

const { Title, Text, Link } = Typography;

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const { showError, showSuccess } = useToast();
  const [logo] = useState("/logo_home_care.png");
  const [loading, setLoading] = useState(false);

  const onFinish = async ({ email, newPassword }) => {
    try {
      setLoading(true);
      await API_CALL.post("/auth/forgot-password", {
        email,
        newPassword,
      });
      showSuccess("Vui lòng kiểm tra email để xác nhận đổi mật khẩu");
      navigate("/login");
    } catch (err) {
      showError(
        err?.response?.data?.message || "Gửi yêu cầu đổi mật khẩu thất bại",
      );
    } finally {
      setLoading(false);
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
        alignItems: "center",
      }}
    >
      <div style={{ display: "flex", alignItems: "center" }}>
        {/* Banner */}
        {/* <div
          style={{
            backgroundImage: "url('/banner.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            width: 500,
            height: 500,
          }}
        /> */}

        {/* Form */}
        <Card
          style={{
            width: 500,
            padding: 24,
            borderRadius: 10,
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          }}
        >
          {/* Logo */}
          <div style={{ marginBottom: 12 }}>
            <BackButton to="/home" label="Về trang chủ" />
          </div>
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <img src={logo} alt="Logo" style={{ height: 60 }} />
          </div>

          <Title level={3} style={{ textAlign: "center" }}>
            Quên mật khẩu
          </Title>

          <Text
            type="secondary"
            style={{ display: "block", textAlign: "center", marginBottom: 24 }}
          >
            Nhập email và mật khẩu mới. Hệ thống sẽ gửi link xác nhận qua email.
          </Text>

          <Form layout="vertical" onFinish={onFinish}>
            <Form.Item
              label="Email"
              name="email"
              rules={[
                {
                  required: true,
                  type: "email",
                  message: "Email không hợp lệ",
                },
              ]}
            >
              <Input placeholder="Nhập email" />
            </Form.Item>

            <Form.Item
              label="Mật khẩu mới"
              name="newPassword"
              rules={[
                { required: true, message: "Vui lòng nhập mật khẩu mới" },
                { min: 6, message: "Mật khẩu tối thiểu 6 ký tự" },
              ]}
            >
              <Input.Password placeholder="Mật khẩu mới" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" block loading={loading}>
                Gửi yêu cầu
              </Button>
            </Form.Item>
          </Form>

          <Row justify="center">
            <Link onClick={() => navigate("/login")}>← Quay lại đăng nhập</Link>
          </Row>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
