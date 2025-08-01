import React, { useState } from "react";
import { Form, Input, Button, Typography, Card, Select, Row, Col } from "antd";
import { useNavigate } from "react-router-dom";
import useToast from "../../hooks/useToast";
import API_CALL from "../../services/axiosClient";

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const ContactForm = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [form] = Form.useForm();

  const [loading, setLoading] = useState(false); // <-- Loading state

  const handleSubmit = async (values) => {
    setLoading(true); // Bắt đầu loading
    try {
      await API_CALL.post("/contacts", values);
      showSuccess("Gửi liên hệ thành công. Chúng tôi sẽ phản hồi sớm nhất!");
      form.resetFields();
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        "Gửi liên hệ thất bại. Vui lòng thử lại!";
      showError(msg);
    } finally {
      setLoading(false); // Tắt loading sau khi hoàn tất
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        padding: "60px 16px",
        backgroundColor: "#f0f2f5",
        width: "100vw",
      }}
    >
      <Card
        style={{
          maxWidth: 1000,
          width: "100%",
          padding: 24,
          borderRadius: 10,
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
        }}
      >
        <h2 style={{ textAlign: "center" }}>HOME-CARE</h2>
        <Title level={3} style={{ textAlign: "center", marginBottom: 32 }}>
          Liên hệ với chúng tôi
        </Title>

        <Form
          form={form}
          name="contact_form"
          layout="vertical"
          requiredMark
          onFinish={handleSubmit}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Họ và tên"
                name="full_name"
                rules={[{ required: true, message: "Vui lòng nhập họ tên!" }]}
              >
                <Input placeholder="Nguyễn Văn A" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { required: true, message: "Vui lòng nhập email!" },
                  { type: "email", message: "Email không hợp lệ" },
                ]}
              >
                <Input placeholder="abc@gmail.com" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Số điện thoại"
                name="phone"
                rules={[
                  { required: true, message: "Vui lòng nhập số điện thoại!" },
                ]}
              >
                <Input placeholder="0909123456" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Loại liên hệ"
                name="type"
                initialValue="liên hệ tư vấn chung"
                rules={[
                  { required: true, message: "Vui lòng chọn loại liên hệ!" },
                ]}
              >
                <Select placeholder="Chọn loại liên hệ">
                  <Option value="liên hệ tư vấn chung">Tư vấn chung</Option>
                  <Option value="đặt lịch khám/chăm sóc">
                    Đặt lịch khám/chăm sóc
                  </Option>
                  <Option value="phản hồi/dịch vụ đã dùng">Phản hồi</Option>
                  <Option value="hợp tác kinh doanh">Hợp tác</Option>
                  <Option value="khiếu nại">Khiếu nại</Option>
                  <Option value="khác">Khác</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Nội dung liên hệ"
            name="message"
            rules={[{ required: true, message: "Vui lòng nhập nội dung!" }]}
          >
            <TextArea rows={4} placeholder="Tôi cần tư vấn về dịch vụ ABC..." />
          </Form.Item>

          <Form.Item label="Lưu ý" name="note">
            <TextArea rows={3} placeholder="Thông tin cần lưu ý (nếu có)..." />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              style={{ marginTop: 24 }}
            >
              {loading ? "Đang gửi..." : "Gửi liên hệ"}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default ContactForm;
