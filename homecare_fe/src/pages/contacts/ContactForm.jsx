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
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: 20,
          }}
        >
          <img src="/logo_home_care.png" alt="" width={80} />
        </div>
        <Title
          level={3}
          style={{
            textAlign: "center",
            marginBottom: 32,
            color: "#04580fff",
          }}
        >
          {"Gửi yêu cầu, góp ý cho chúng tôi".toUpperCase()}
        </Title>

        <Form
          form={form}
          name="contact_form"
          layout="vertical"
          requiredMark
          onFinish={handleSubmit}
        >
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="Họ và tên"
                name="full_name"
                rules={[{ required: true, message: "Vui lòng nhập họ tên!" }]}
                ti
              >
                <Input placeholder="Nguyễn Văn A" />
              </Form.Item>
            </Col>
            <Col span={10}>
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
            <Col span={6}>
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
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Loại liên hệ"
                name="type"
                initialValue="hỗ trợ kỹ thuật"
                rules={[
                  { required: true, message: "Vui lòng chọn loại liên hệ!" },
                ]}
              >
                <Select placeholder="Chọn loại liên hệ">
                  <Option value="hỗ trợ kỹ thuật">Hỗ trợ kỹ thuật</Option>
                  <Option value="phát triển phần mềm">
                    Phát triển phần mềm
                  </Option>
                  <Option value="chỉnh sửa nội dung">Chỉnh sửa nội dung</Option>
                  <Option value="hợp tác kinh doanh">Hợp tác kinh doanh</Option>
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

          {/* <Form.Item label="Lưu ý" name="note">
            <TextArea rows={3} placeholder="Thông tin cần lưu ý (nếu có)..." />
          </Form.Item> */}

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              style={{ marginTop: 24, backgroundColor: "#04580fff" }}
            >
              {loading ? "Đang gửi..." : "Gửi"}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default ContactForm;
