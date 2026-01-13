import React, { useEffect } from "react";
import { Modal, Form, Input, Switch } from "antd";

const TemplateServiceModal = ({
  open,
  onCancel,
  onSubmit,
  initialValues = {},
  isEdit = false,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) form.setFieldsValue(initialValues || {});
  }, [open, initialValues]);

  const handleOk = () => {
    form
      .validateFields()
      .then((values) => onSubmit(values))
      .catch((err) => console.error("Validation failed:", err));
  };

  return (
    <Modal
      title={isEdit ? "Chỉnh sửa mẫu PHÂN HỆ" : "Tạo mới mẫu PHÂN HỆ"}
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
      okText={isEdit ? "Cập nhật" : "Tạo mới"}
    >
      <Form layout="vertical" form={form}>
        <Form.Item
          name="name"
          label="Tên"
          rules={[{ required: true, message: "Vui lòng nhập tên" }]}
        >
          <Input placeholder="Nhập tên dịch vụ" />
        </Form.Item>

        <Form.Item
          name="short_name"
          label="Tên rút gọn"
          rules={[{ required: true, message: "Vui lòng nhập tên rút gọn" }]}
        >
          <Input placeholder="Nhập tên rút gọn" />
        </Form.Item>

        <Form.Item
          name="code"
          label="Mã code"
          rules={[{ required: true, message: "Vui lòng nhập mã code" }]}
        >
          <Input placeholder="Nhập mã code" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default TemplateServiceModal;
