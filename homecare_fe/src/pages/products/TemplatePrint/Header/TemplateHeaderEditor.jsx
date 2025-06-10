import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  Upload,
  Button,
  Row,
  Col,
  Typography,
  Select,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import styles from "./TemplateHeaderEditor.module.scss";

const { Option } = Select;

const TemplateHeaderEditor = ({ value = {}, onChange }) => {
  const [logoPreview, setLogoPreview] = useState(value.logo_url || "");
  const [form] = Form.useForm();
  form.setFieldsValue(value);

  console.log("value", value);

  const handleLogoChange = (file) => {
    const preview = URL.createObjectURL(file);
    setLogoPreview(preview);
    onChange?.({ ...form.getFieldsValue(), logo: file, logo_url: preview });
    return false;
  };
  useEffect(() => {
    setLogoPreview(value?.logo_url);
  }, [value.id]);

  const handleFormChange = (_, allValues) => {
    onChange?.({ ...allValues, logo_url: logoPreview });
  };

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={value}
      onValuesChange={handleFormChange}
      className={styles.templateHeaderForm}
    >
      <Row gutter={24} align="middle">
        <Col span={6}>
          <div className={styles.logoBlock}>
            <img
              src={
                logoPreview || "https://via.placeholder.com/100x100?text=Logo"
              }
              alt="Logo"
              className={styles.logoImage}
              width={180}
            />
            <Upload
              beforeUpload={handleLogoChange}
              showUploadList={false}
              accept=".jpg,.png,.jpeg"
            >
              <Button icon={<UploadOutlined />}>Tải logo</Button>
            </Upload>

            <Form.Item name="code_header" label="Kiểu header">
              <Select>
                <Option value="1">Header 1</Option>
              </Select>
            </Form.Item>
          </div>
        </Col>

        <Col span={18}>
          <Form.Item name="clinic_name" label="Tên phòng khám">
            <Input />
          </Form.Item>
          <Form.Item name="department_name" label="Khoa">
            <Input />
          </Form.Item>
          <Form.Item name="address" label="Địa chỉ">
            <Input />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="website" label="Website">
                <Input />
              </Form.Item>
              <Form.Item name="phone" label="Hotline">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="email" label="Email">
                <Input />
              </Form.Item>
            </Col>
          </Row>
        </Col>
      </Row>
    </Form>
  );
};

export default TemplateHeaderEditor;
