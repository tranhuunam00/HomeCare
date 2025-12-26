import React from "react";
import { Form, Input, Select, Row, Col, InputNumber } from "antd";
import dayjs from "dayjs";

const { TextArea } = Input;
const { Option } = Select;

export default function PatientInfoSection({
  form,
  languageTranslate,
  isEdit,
  provinces,
  wards,
  setSelectedProvince,
  translateLabel,
  isMobile,
  isApproved,
}) {
  const formItemLayout = {
    layout: isMobile ? "vertical" : "horizontal",
    labelCol: {
      xs: { span: 24 },
      md: { span: 8 },
    },
    wrapperCol: {
      xs: { span: 24 },
      md: { span: 16 },
    },
  };
  return (
    <>
      <Row gutter={[16, isMobile ? 0 : 24]}>
        <Col xs={24} md={12}>
          <Form.Item
            {...formItemLayout}
            label={translateLabel(languageTranslate, "fullName", false)}
            name="benh_nhan_ho_ten"
            rules={[{ required: true, message: "Nhập họ tên bệnh nhân" }]}
            style={{ marginBottom: isMobile ? 40 : 24 }}
          >
            <Input
              disabled={!isEdit || isApproved}
              placeholder="VD: Nguyễn Văn A"
            />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item
            {...formItemLayout}
            label={translateLabel(languageTranslate, "gender", false)}
            name="benh_nhan_gioi_tinh"
            rules={[{ required: true, message: "Chọn giới tính" }]}
            style={{ marginBottom: isMobile ? 40 : 24 }}
          >
            <Select
              disabled={!isEdit || isApproved}
              placeholder="Chọn giới tính"
            >
              <Option value="Nam">Nam</Option>
              <Option value="Nữ">Nữ</Option>
              <Option value="Khác">Khác</Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={[16, isMobile ? 0 : 24]}>
        <Col xs={24} md={12}>
          <Form.Item
            {...formItemLayout}
            label={translateLabel(languageTranslate, "age", false)}
            name="benh_nhan_tuoi"
            rules={[{ required: true, message: "Nhập tuổi bệnh nhân" }]}
            style={{ marginBottom: isMobile ? 40 : 24 }}
          >
            <InputNumber
              disabled={!isEdit || isApproved}
              type="number"
              placeholder="VD: 45"
            />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item
            {...formItemLayout}
            label={translateLabel(languageTranslate, "nationality", false)}
            name="benh_nhan_quoc_tich"
            style={{ marginBottom: isMobile ? 40 : 24 }}
          >
            <Input
              disabled={!isEdit || isApproved}
              placeholder="VD: Việt Nam"
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={[16, isMobile ? 0 : 24]}>
        <Col xs={24} md={12}>
          <Form.Item
            {...formItemLayout}
            label={translateLabel(languageTranslate, "phone", false)}
            name="benh_nhan_dien_thoai"
            style={{ marginBottom: isMobile ? 40 : 24 }}
            rules={[
              {
                pattern: /^(0[3|5|7|8|9])([0-9]{8})$/,
                message:
                  "Số điện thoại không đúng định dạng (10 số, bắt đầu bằng 03, 05, 07, 08, 09)!",
              },
            ]}
          >
            <Input disabled={!isEdit || isApproved} placeholder="SĐT liên hệ" />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item
            {...formItemLayout}
            label={translateLabel(languageTranslate, "email", false)}
            name="benh_nhan_email"
            style={{ marginBottom: isMobile ? 40 : 24 }}
          >
            <Input
              disabled={!isEdit || isApproved}
              type="email"
              placeholder="Email liên hệ"
              rules={[
                {
                  type: "email",
                  message: "Định dạng email không hợp lệ!",
                },
              ]}
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={[16, isMobile ? 0 : 24]}>
        <Col xs={24} md={12}>
          <Form.Item
            {...formItemLayout}
            label={translateLabel(languageTranslate, "patientId", false)}
            name="benh_nhan_pid"
            required
            rules={[{ required: true, message: "Nhập mã số bệnh nhân PID" }]}
            style={{ marginBottom: isMobile ? 40 : 24 }}
          >
            <Input
              disabled={!isEdit || isApproved}
              onChange={(e) => {
                form.setFieldValue(
                  "benh_nhan_sid",
                  `${e.target.value}-${dayjs().format("DDMMYY-HHmmss")}`
                );
              }}
              placeholder="CCCD"
            />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item
            {...formItemLayout}
            label={translateLabel(languageTranslate, "sid", false)}
            name="benh_nhan_sid"
            style={{ marginBottom: isMobile ? 40 : 24 }}
            required
          >
            <Input disabled={true} placeholder="SID + thời gian" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={[16, isMobile ? 0 : 24]}>
        <Col xs={24} md={12}>
          <Form.Item
            {...formItemLayout}
            name="benh_nhan_dia_chi_tinh_thanh_pho"
            label={translateLabel(languageTranslate, "province", false)}
            // rules={[{ required: true, message: "Chọn tỉnh/thành phố" }]}
            style={{ marginBottom: isMobile ? 40 : 24 }}
            disabled={!isEdit || isApproved}
          >
            <Select
              disabled={!isEdit || isApproved}
              placeholder={translateLabel(languageTranslate, "province", false)}
              onChange={(val) => {
                form.setFieldsValue({
                  benh_nhan_dia_chi_tinh_thanh_pho: val,
                  benh_nhan_dia_chi_xa_phuong: undefined,
                });
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
        </Col>
        <Col xs={24} md={12}>
          <Form.Item
            {...formItemLayout}
            name="benh_nhan_dia_chi_xa_phuong"
            label={translateLabel(languageTranslate, "district", false)}
            style={{ marginBottom: isMobile ? 40 : 24 }}
            // rules={[{ required: true, message: "Chọn xã/phường" }]}
          >
            <Select
              onChange={(val) => {
                form.setFieldsValue({
                  benh_nhan_dia_chi_xa_phuong: val,
                });
              }}
              placeholder="Chọn Xã / Phường"
              disabled={!wards.length || !isEdit || isApproved}
            >
              {wards.map((ward) => (
                <Option key={ward.code} value={ward.code}>
                  {ward.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={[16, isMobile ? 0 : 24]}>
        <Col span={24}>
          <Form.Item
            {...formItemLayout}
            labelCol={isMobile ? { span: 24 } : { span: 4 }}
            wrapperCol={isMobile ? { span: 24 } : { span: 20 }}
            label={translateLabel(languageTranslate, "address", false)}
            name="benh_nhan_dia_chi_so_nha"
            style={{ marginBottom: isMobile ? 10 : 30 }}
          >
            <Input
              disabled={!isEdit || isApproved}
              placeholder="VD: 123 Lê Lợi"
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={[16, isMobile ? 0 : 24]}>
        <Col span={24}>
          <Form.Item
            {...formItemLayout}
            labelCol={isMobile ? { span: 24 } : { span: 4 }}
            wrapperCol={isMobile ? { span: 24 } : { span: 20 }}
            label={translateLabel(languageTranslate, "clinical", false)}
            name="benh_nhan_lam_sang"
            style={{ marginBottom: isMobile ? 10 : 24 }}
          >
            <TextArea
              disabled={!isEdit || isApproved}
              autoSize={{ minRows: 3, maxRows: isMobile ? 3 : 6 }}
              placeholder="Nhập triệu chứng lâm sàng..."
            />
          </Form.Item>
        </Col>
      </Row>
    </>
  );
}
