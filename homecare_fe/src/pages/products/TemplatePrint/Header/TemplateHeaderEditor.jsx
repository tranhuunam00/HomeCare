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

const TemplateHeaderEditor = ({ value = {}, onChange, form }) => {
  const [logoPreview, setLogoPreview] = useState(value.logo_url || "");
  form.setFieldsValue(value);

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
    <Row gutter={24} align="middle">
      <Col span={6}>
        <div className={styles.logoBlock}>
          <Form.Item
            label="Logo"
            name="logo"
            valuePropName="file" // 👈 quản lý 1 file duy nhất
            getValueFromEvent={(e) => {
              if (e?.file) {
                const file = e.file.originFileObj || e.file;
                setLogoPreview(URL.createObjectURL(file));
                onChange?.({ ...form.getFieldsValue(), logo: file });
                return file; // 👈 trả về đúng 1 file
              }
              return null;
            }}
            rules={
              logoPreview
                ? [] // đã có logo → không required
                : [{ required: true, message: "Vui lòng tải logo" }]
            }
          >
            <Upload
              beforeUpload={() => false} // chặn auto-upload
              maxCount={1}
              showUploadList={false}
              accept=".jpg,.png,.jpeg"
            >
              <Button icon={<UploadOutlined />}>Tải logo</Button>
            </Upload>
          </Form.Item>

          <img
            src={logoPreview || "https://via.placeholder.com/100x100?text=Logo"}
            alt="Logo"
            className={styles.logoImage}
            width={180}
          />
        </div>
      </Col>

      <Col span={18}>
        <Form.Item
          rules={[
            { required: true, message: "Vui lòng điền tên phòng khám " },
            {},
          ]}
          name="clinic_name"
          label="Tên phòng khám"
        >
          <Input />
        </Form.Item>
        <Form.Item
          rules={[{ required: true, message: "Vui lòng điền tên khoa " }, {}]}
          name="department_name"
          label="Khoa"
        >
          <Input />
        </Form.Item>
        <Form.Item
          rules={[{ required: true, message: "Vui lòng điền địa chỉ " }, {}]}
          name="address"
          label="Địa chỉ"
        >
          <Input />
        </Form.Item>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              rules={[
                { required: true, message: "Vui lòng điền website " },
                {},
              ]}
              name="website"
              label="Website"
            >
              <Input />
            </Form.Item>
            <Form.Item
              rules={[
                { required: true, message: "Vui lòng điền hotline " },
                {},
              ]}
              name="phone"
              label="Hotline"
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              rules={[{ required: true, message: "Vui lòng điền email " }, {}]}
              name="email"
              label="Email"
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>
      </Col>
    </Row>
  );
};

export default TemplateHeaderEditor;
