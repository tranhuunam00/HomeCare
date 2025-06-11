// src/pages/templates/TemplatePatientUser.jsx
import React, { useEffect } from "react";
import { Form, Input, Row, Col, Typography, Select, DatePicker } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import styles from "./TemplatePatientUser.module.scss";
import dayjs from "dayjs";
import useVietnamAddress from "../../../../hooks/useVietnamAddress";

const { Option } = Select;
const { Text } = Typography;

const TemplatePatientUser = ({ value = {}, onChange }) => {
  const [form] = Form.useForm();

  const handleFormChange = (_, allValues) => {
    onChange?.({ ...allValues });
  };

  useEffect(() => {
    if (value) {
      form.setFieldsValue({
        ...value,
        dob: value.dob ? dayjs(value.dob) : null,
      });
    }
  }, [value]);

  const {
    provinces,
    districts,
    wards,
    setSelectedProvince,
    setSelectedDistrict,
  } = useVietnamAddress();

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={{ ...value, dob: value.dob ? dayjs(value.dob) : null }}
      onValuesChange={handleFormChange}
      className={styles.templateHeaderForm}
    >
      <Row gutter={24} align="middle">
        <Col span={18}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="full_name" label="Họ và tên">
                <Input />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="dob" label="Năm sinh">
                <DatePicker picker="year" style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="gender" label="Giới tính">
                <Select>
                  <Option value="Nam">Nam</Option>
                  <Option value="Nữ">Nữ</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16} style={{ gap: 20, marginLeft: 1 }}>
            <Form.Item label="Tỉnh" name="province" style={{ width: "30%" }}>
              <Select
                placeholder="Chọn Tỉnh / Thành phố"
                onChange={(val) => {
                  form.setFieldsValue({ district: undefined, ward: undefined });
                  setSelectedProvince(val);
                }}
              >
                {provinces.map((prov) => (
                  <Option key={prov.code} value={prov.code}>
                    {prov.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item label="Huyện" name="district" style={{ width: "31%" }}>
              <Select
                placeholder="Chọn Huyện/Quận"
                onChange={(val) => {
                  form.setFieldsValue({ ward: undefined });
                  setSelectedDistrict(val);
                }}
                disabled={!districts.length}
                style={{ fontSize: 12 }}
              >
                {districts.map((dist) => (
                  <Option key={dist.code} value={dist.code}>
                    {dist.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item label="Xã" name="ward" style={{ width: "31%" }}>
              <Select placeholder="Chọn Xã / Phường" disabled={!wards.length}>
                {wards.map((ward) => (
                  <Option key={ward.code} value={ward.code}>
                    {ward.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Row>
          <Form.Item name="address" label="Số nhà">
            <Input />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="phone_number" label="Điện thoại">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="email" label="Email">
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="symptoms" label="Triệu chứng">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="progress" label="Diễn biến">
            <Input />
          </Form.Item>
          <Form.Item name="medical_history" label="Tiền sử bệnh">
            <Input />
          </Form.Item>
          <Row gutter={16}>
            <Col span={16}>
              <Form.Item name="compare_link" label="Link so sánh:">
                <Input />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="old_date" label="Có kết quả cũ:">
                <Input />
              </Form.Item>
            </Col>
          </Row>
        </Col>
      </Row>
    </Form>
  );
};

export default TemplatePatientUser;
