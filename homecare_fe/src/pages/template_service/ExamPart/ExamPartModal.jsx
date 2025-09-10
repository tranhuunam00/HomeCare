import React, { useEffect } from "react";
import { Modal, Form, Input, Switch, Select } from "antd";
import { useGlobalAuth } from "../../../contexts/AuthContext";

const ExamPartModal = ({ open, onCancel, onSubmit, initialValues, isEdit }) => {
  const [form] = Form.useForm();

  const { templateServices } = useGlobalAuth();

  useEffect(() => {
    if (open && initialValues) {
      form.setFieldsValue({
        ...initialValues,
        status: initialValues.status ?? true,
      });
    } else {
      form.resetFields();
    }
  }, [open, initialValues, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      onSubmit(values);
    } catch (err) {
      console.error("Validation Failed:", err);
    }
  };

  return (
    <Modal
      open={open}
      title={isEdit ? "Chỉnh sửa bộ phận" : "Tạo mới bộ phận"}
      onCancel={onCancel}
      onOk={handleOk}
      okText={isEdit ? "Lưu thay đổi" : "Tạo mới"}
      cancelText="Hủy"
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="Tên bộ phận"
          name="name"
          rules={[{ required: true, message: "Vui lòng nhập tên" }]}
        >
          <Input placeholder="Nhập tên bộ phận" />
        </Form.Item>

        <Form.Item
          label="Tên rút gọn"
          name="short_name"
          rules={[{ required: true, message: "Vui lòng nhập tên rút gọn" }]}
        >
          <Input placeholder="Nhập tên rút gọn" />
        </Form.Item>

        <Form.Item
          label="Mã code"
          name="code"
          rules={[{ required: true, message: "Vui lòng nhập mã code" }]}
        >
          <Input placeholder="Nhập mã code" />
        </Form.Item>

        <Form.Item label="Trạng thái" name="status" valuePropName="checked">
          <Switch
            checkedChildren="Hoạt động"
            unCheckedChildren="Ẩn"
            defaultChecked
          />
        </Form.Item>

        {/* Select Template Service */}
        <Form.Item
          label="Template Service"
          name="id_template_service"
          rules={[
            { required: true, message: "Vui lòng chọn Template Service" },
          ]}
        >
          <Select placeholder="Chọn template service">
            {templateServices?.map((ts) => (
              <Select.Option key={ts.id} value={ts.id}>
                {ts.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item label="Trạng thái" name="status" valuePropName="checked">
          <Switch
            checkedChildren="Hoạt động"
            unCheckedChildren="Ẩn"
            defaultChecked
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ExamPartModal;
