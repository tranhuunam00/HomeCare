import React, { useState } from "react";
import { Form, Input, Upload, Button, Row, Col, Typography } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import styles from "./TemplateHeaderEditor.module.scss";

const { Text, Title } = Typography;

const TemplateHeaderEditor = ({ value = {}, onChange }) => {
  const [logoPreview, setLogoPreview] = useState(value.logoUrl || "");
  const [form] = Form.useForm();

  const handleLogoChange = (file) => {
    const preview = URL.createObjectURL(file);
    setLogoPreview(preview);
    onChange?.({ ...form.getFieldsValue(), logoFile: file, logoUrl: preview });
    return false; // Ngăn Antd upload mặc định
  };

  const handleFormChange = (_, allValues) => {
    onChange?.({ ...allValues, logoUrl: logoPreview });
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
            />
            <Upload
              beforeUpload={handleLogoChange}
              showUploadList={false}
              accept=".jpg,.png,.jpeg"
            >
              <Button icon={<UploadOutlined />}>Tải logo</Button>
            </Upload>
          </div>
        </Col>
        <Col span={18}>
          <Form.Item name="clinicName" label="Tên phòng khám">
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
              <Form.Item name="hotline" label="Hotline">
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
