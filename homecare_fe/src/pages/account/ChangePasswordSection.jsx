// ChangePasswordSection.jsx
import React from "react";
import { Card, Input, Button, Form, Typography } from "antd";
import styles from "./AccountPage.module.scss";

const { Title, Text } = Typography;

const ChangePasswordSection = () => {
  const [form] = Form.useForm();

  const onFinish = (values) => {
    console.log("Change Password Values:", values);
  };

  return (
    <Card className={styles["account-page__card"]} title="Đổi mật khẩu">
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        className={styles["change-password-form"]}
      >
        <Form.Item label="Tên đăng nhập">
          <Input defaultValue="tk.tieuchuan272" disabled />
        </Form.Item>

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
          <Button type="primary" htmlType="submit" block>
            Lưu
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default ChangePasswordSection;
