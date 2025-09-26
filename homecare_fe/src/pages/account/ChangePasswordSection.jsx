import React, { useState } from "react";
import { Card, Input, Button, Form, Typography, message, Modal } from "antd";
import styles from "./AccountPage.module.scss";
import API_CALL from "../../services/axiosClient";
import { useGlobalAuth } from "../../contexts/AuthContext";
import { toast } from "react-toastify";

const { Title, Text } = Typography;

const ChangePasswordSection = () => {
  const [form] = Form.useForm();
  const { user } = useGlobalAuth();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    const confirm = window.confirm("Bạn có chắc chắn muốn đổi mật khẩu không?");
    if (!confirm) return;

    try {
      setLoading(true);
      const payload = {
        oldPassword: values.currentPassword,
        newPassword: values.newPassword,
      };
      await API_CALL.patch("/users/password", payload);
      toast.success("Đổi mật khẩu thành công!");
      form.resetFields();
    } catch (err) {
      console.error("Change password error:", err);
      toast.error(
        err?.response?.data?.message ||
          "Đổi mật khẩu thất bại, vui lòng thử lại"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className={styles["account-page__card"]} title="Đổi mật khẩu">
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        className={styles["change-password-form"]}
      >
        <Form.Item
          label="Mật khẩu hiện tại"
          name="currentPassword"
          rules={[
            { required: true, message: "Vui lòng nhập mật khẩu hiện tại" },
          ]}
        >
          <Input.Password placeholder="Nhập mật khẩu hiện tại" />
        </Form.Item>

        <Form.Item
          label="Mật khẩu mới"
          name="newPassword"
          rules={[
            { required: true, message: "Vui lòng nhập mật khẩu mới" },
            { min: 6, message: "Mật khẩu ít nhất 6 ký tự" },
            { max: 15, message: "Mật khẩu tối đa 15 ký tự" },
          ]}
        >
          <Input.Password placeholder="Nhập mật khẩu mới" />
        </Form.Item>

        <Form.Item
          label="Xác nhận mật khẩu mới"
          name="confirmPassword"
          dependencies={["newPassword"]}
          rules={[
            { required: true, message: "Vui lòng xác nhận mật khẩu" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("newPassword") === value) {
                  return Promise.resolve();
                }
                return Promise.reject("Mật khẩu xác nhận không khớp!");
              },
            }),
          ]}
        >
          <Input.Password placeholder="Xác nhận mật khẩu mới" />
        </Form.Item>

        <div className={styles["password-note"]}>
          <ul>
            <li>Tối thiểu 6 ký tự</li>
            <li>Bao gồm cả chữ cái và số</li>
          </ul>
        </div>

        <Form.Item style={{ marginTop: 16 }}>
          <Button type="primary" htmlType="submit" block loading={loading}>
            Lưu
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default ChangePasswordSection;
