import React, { useState } from "react";
import { Form, Input, Button, Typography, Card, Checkbox, Divider } from "antd";
import { useNavigate } from "react-router-dom";
import useToast from "../../hooks/useToast";
import API_CALL from "../../services/axiosClient";
import { USER_ROLE } from "../../constant/app";
import { GoogleLogin } from "@react-oauth/google";
import { useGlobalAuth } from "../../contexts/AuthContext";
import { EyeInvisibleOutlined, EyeTwoTone } from "@ant-design/icons";
import { passwordMinLengthRule } from "./auth.constant";

const { Title } = Typography;

const RegisterPage = () => {
  const navigate = useNavigate();
  const { showError, showSuccess } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [agreePolicy, setAgreePolicy] = useState(false);
  const [logo] = useState("/logo_home_care.png");
  const { handleLoginContext } = useGlobalAuth();

  const onFinish = async ({ email, password, confirmPassword, fullName }) => {
    if (password !== confirmPassword) {
      showError("Mật khẩu nhập lại không khớp!");
      return;
    }

    try {
      await API_CALL.post("/auth/register", {
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

      {/* Bên phải: Form đăng ký */}
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
            requiredMark={true}
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
              rules={[
                { required: true, message: "Vui lòng nhập mật khẩu!" },
                passwordMinLengthRule(6),
              ]}
            >
              <Input.Password
                placeholder="Mật khẩu"
                iconRender={(visible) =>
                  visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                }
              />
            </Form.Item>

            <Form.Item
              label="Nhập lại mật khẩu"
              name="confirmPassword"
              rules={[
                { required: true, message: "Vui lòng nhập lại mật khẩu!" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error("Mật khẩu nhập lại không khớp!")
                    );
                  },
                }),
              ]}
            >
              <Input.Password
                placeholder="Nhập lại mật khẩu"
                iconRender={(visible) =>
                  visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                }
              />
            </Form.Item>

            {/* ✅ Checkbox chính sách */}
            <Form.Item style={{ marginBottom: 0 }}>
              <Checkbox
                checked={agreePolicy}
                onChange={(e) => setAgreePolicy(e.target.checked)}
              >
                Tôi đồng ý với{" "}
                <a
                  href="/privacy-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Chính sách bảo mật và điều khoản sử dụng
                </a>{" "}
                của D-RADS.
              </Checkbox>
            </Form.Item>

            <Form.Item style={{ marginTop: 12 }}>
              <Button
                type="primary"
                htmlType="submit"
                disabled={!agreePolicy}
                style={{
                  width: "100%",
                  borderRadius: 5,
                  opacity: agreePolicy ? 1 : 0.6,
                  cursor: agreePolicy ? "pointer" : "not-allowed",
                }}
              >
                Đăng ký
              </Button>
            </Form.Item>
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
                    err?.response?.data?.message ||
                    "Đăng nhập Google thất bại!";
                  showError(message);
                }
              }}
              onError={() => {
                showError("Google đăng nhập thất bại!");
              }}
              width="100%"
              locale="vi"
            />
            <div style={{ marginTop: 16 }}>
              <Title level={5} style={{ textAlign: "center" }}>
                Hướng dẫn đăng ký tài khoản D-RADS
              </Title>

              <div
                style={{
                  position: "relative",
                  paddingBottom: "56.25%", // 16:9
                  height: 0,
                  overflow: "hidden",
                  borderRadius: 8,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  marginTop: 12,
                }}
              >
                <iframe
                  src="https://www.youtube.com/embed/nWGpaW54LYQ"
                  title="Hướng dẫn đăng ký D-RADS"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                  }}
                />
              </div>
            </div>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default RegisterPage;
