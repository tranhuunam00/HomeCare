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
    <Row gutter={[16, 8]}>
      {/* Kiểu header */}
      <Col span={12}>
        <Form.Item
          name="code_header"
          label="Kiểu header"
          rules={[{ required: true, message: "Vui lòng chọn kiểu header" }]}
          style={{ marginBottom: 10 }}
        >
          <Select
            placeholder="Chọn kiểu header"
            onChange={(val) => {
              const next = {
                ...form.getFieldsValue(),
                code_header: val,
              };
              onChange?.(next);
            }}
            style={{ borderRadius: 6 }}
          >
            <Option value={1}>Header 1 – Có logo</Option>
            <Option value={2}>Header 2 – Không logo</Option>
          </Select>
        </Form.Item>
      </Col>

      {/* Logo */}
      <Col span={7}>
        <Form.Item
          label="Logo phòng khám"
          name="logo"
          valuePropName="file"
          getValueFromEvent={(e) => {
            if (e?.file) {
              const file = e.file.originFileObj || e.file;
              setLogoPreview(URL.createObjectURL(file));
              onChange?.({ ...form.getFieldsValue(), logo: file });
              return file;
            }
            return null;
          }}
          rules={
            logoPreview
              ? []
              : [{ required: true, message: "Vui lòng tải logo" }]
          }
          style={{ marginBottom: 10 }}
        >
          <Upload
            beforeUpload={() => false}
            maxCount={1}
            showUploadList={false}
            accept=".jpg,.png,.jpeg"
          >
            <Button icon={<UploadOutlined />} style={{ borderRadius: 6, width: "100%" }}>Tải logo</Button>
          </Upload>
        </Form.Item>
      </Col>

      {/* Logo Preview */}
      <Col span={5}>
        <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "8px" }}>Xem trước</div>
        <div style={{
          width: "100%",
          height: 38,
          border: "1px solid #e2e8f0",
          borderRadius: 4,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f8fafc",
          overflow: "hidden"
        }}>
          {logoPreview ? (
            <img
              src={logoPreview}
              alt="Logo"
              style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain" }}
            />
          ) : (
            <span style={{ fontSize: "10px", color: "#94a3b8" }}>No Logo</span>
          )}
        </div>
      </Col>

      {/* Tên phòng khám */}
      <Col span={12}>
        <Form.Item
          rules={[{ required: true, message: "Vui lòng điền tên phòng khám" }]}
          name="clinic_name"
          label="Tên phòng khám"
          style={{ marginBottom: 10 }}
        >
          <Input placeholder="Tên hiển thị trên mẫu in" style={{ borderRadius: 6 }} />
        </Form.Item>
      </Col>

      {/* Chuyên khoa */}
      <Col span={12}>
        <Form.Item
          rules={[{ required: true, message: "Vui lòng điền tên khoa" }]}
          name="department_name"
          label="Chuyên khoa"
          style={{ marginBottom: 10 }}
        >
          <Input placeholder="VD: Khoa Chẩn đoán hình ảnh" style={{ borderRadius: 6 }} />
        </Form.Item>
      </Col>

      {/* Địa chỉ */}
      <Col span={24}>
        <Form.Item
          rules={[{ required: true, message: "Vui lòng điền địa chỉ" }]}
          name="address"
          label="Địa chỉ phòng khám"
          style={{ marginBottom: 10 }}
        >
          <Input placeholder="VD: Số 23 Nguyễn Tuân, Thanh Xuân, Hà Nội" style={{ borderRadius: 6 }} />
        </Form.Item>
      </Col>

      {/* Hotline */}
      <Col span={8}>
        <Form.Item
          rules={[{ required: true, message: "Vui lòng điền hotline" }]}
          name="phone"
          label="Hotline"
          style={{ marginBottom: 10 }}
        >
          <Input placeholder="Nhập số điện thoại" style={{ borderRadius: 6 }} />
        </Form.Item>
      </Col>

      {/* Email */}
      <Col span={8}>
        <Form.Item
          rules={[{ required: true, message: "Vui lòng điền email" }]}
          name="email"
          label="Email liên hệ"
          style={{ marginBottom: 10 }}
        >
          <Input placeholder="Nhập email" style={{ borderRadius: 6 }} />
        </Form.Item>
      </Col>

      {/* Website */}
      <Col span={8}>
        <Form.Item
          rules={[{ required: true, message: "Vui lòng điền website" }]}
          name="website"
          label="Website"
          style={{ marginBottom: 10 }}
        >
          <Input placeholder="VD: www.homecare.vn" style={{ borderRadius: 6 }} />
        </Form.Item>
      </Col>
    </Row>
  );
};

export default TemplateHeaderEditor;
