import React, { useState } from "react";
import { Form, Input, Button, Typography, Card } from "antd";
import { useNavigate } from "react-router-dom";
import useToast from "../../hooks/useToast";
const { Title } = Typography;

const RegisterForm = () => {
  const navigate = useNavigate();
  const { showError, showSuccess } = useToast();
  const onFinish = ({ username, password }) => {
    console.log("username, password ", username, password);
    if (username === "admin" && password === "123456") {
      showSuccess("Chúng tôi đã tiếp nhận thông tin của bạn cung cấp.");
      navigate("/");
    } else {
      showError("Tên Đăng ký hoặc mật khẩu không đúng!");
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
        textAlign: "left",
      }}
    >
      <div
        style={{
          backgroundImage: "url('/banner.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          width: 500,
          inset: 0,
        }}
      >
        <div
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.7)", // lớp phủ mờ
            inset: 0,
            height: "100%",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: 20, zIndex: 1 }}>
            <img src={logo} alt="Logo" style={{ height: 60, color: "black" }} />
          </div>

          <Title level={3} style={{ textAlign: "center", zIndex: 1 }}>
            Đăng ký
          </Title>
          <p style={{ textAlign: "center", zIndex: 2 }}>
            Chúng tôi hiện đang cung cấp các biểu mẫu kết quả dành cho bác sĩ
            tại Homecare, hỗ trợ chuẩn hóa quy trình chẩn đoán – điều trị và
            nâng cao hiệu quả chăm sóc sức khỏe tại nhà
          </p>
        </div>
      </div>

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
            borderRadius: 10,
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
          }}
        >
          {/* Logo */}

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
              label="Email"
              name="clinic_name"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập email của bạn!",
                  type: "email",
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

            <Form.Item
              label="Họ và tên"
              name="fullName"
              rules={[
                { required: true, message: "Vui lòng nhập tên của bạn!" },
              ]}
            >
              <Input placeholder="Họ và tên" />
            </Form.Item>

            <Form.Item
              label="Số điện thoại"
              name="phoneNumber"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập số điện thoại của bạn!",
                },
              ]}
            >
              <Input placeholder="Số điện thoại" />
            </Form.Item>

            <Form.Item label="Tên phòng khám" name="clinic_name">
              <Input placeholder="Tên phòng khám" />
            </Form.Item>

            <Form.Item label="Mã phòng khám (đã có)" name="clinic_name">
              <Input placeholder="Tên phòng khám" />
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
        </Card>
      </div>
    </div>
  );
};

export default RegisterForm;
