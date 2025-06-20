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
            <Col span={8}>
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
