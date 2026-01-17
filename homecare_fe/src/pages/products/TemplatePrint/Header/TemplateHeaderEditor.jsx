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

  console.log("logoPreview", logoPreview);
  useEffect(() => {
    if (!value || !value.id) return;
    form.setFieldsValue(value);
    setLogoPreview(value?.logo_url);
  }, [value.id]);

  useEffect(() => {
    return () => {
      if (logoPreview?.startsWith("blob:")) {
        URL.revokeObjectURL(logoPreview);
      }
    };
  }, [logoPreview]);

  useEffect(() => {
    if (value?.logo_url && !logoPreview) {
      setLogoPreview(value.logo_url);
    }
  }, [value?.logo_url]);

  return (
    <Row gutter={24} align="middle">
      <Col span={6}>
        <div className={styles.logoBlock}>
          <Form.Item
            name="code_header"
            label="Kiểu header"
            rules={[{ required: true, message: "Vui lòng chọn kiểu header" }]}
          >
            <Select
              placeholder="Chọn kiểu header"
              onChange={(val) => {
                // cập nhật form + notify parent
                const next = {
                  ...form.getFieldsValue(),
                  code_header: val,
                };

                onChange?.(next);

                // 🔥 nếu sau này bạn muốn đổi layout block theo header
                // onChange?.({
                //   ...next,
                //   blocks: HEADER_TEMPLATES[val],
                // });
              }}
            >
              <Option value={1}>Header 1 – Có logo</Option>
              <Option value={2}>Header 2 – Không logo</Option>
            </Select>
          </Form.Item>
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
                ? []
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
          label="Chuyên khoa"
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
