import React from "react";
import { Form, Input, Row, Col, Select } from "antd";

const { TextArea } = Input;
const { Option } = Select;

export default function PatientInfoForm({
  form,
  provinces,
  wards,
  setSelectedProvince,
}) {
  return (
    <>
      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Form.Item
            label="Họ tên"
            name="benh_nhan_ho_ten"
            rules={[{ required: true, message: "Nhập họ tên bệnh nhân" }]}
          >
            <Input placeholder="VD: Nguyễn Văn A" />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item
            label="Giới tính"
            name="benh_nhan_gioi_tinh"
            rules={[{ required: true, message: "Chọn giới tính" }]}
          >
            <Select placeholder="Chọn giới tính">
              <Option value="Nam">Nam</Option>
              <Option value="Nữ">Nữ</Option>
              <Option value="Khác">Khác</Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Form.Item
            label="Tuổi"
            name="benh_nhan_tuoi"
            rules={[{ required: true, message: "Nhập tuổi bệnh nhân" }]}
          >
            <Input type="number" placeholder="VD: 45" />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item label="Quốc tịch" name="benh_nhan_quoc_tich">
            <Input placeholder="VD: Việt Nam" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Form.Item label="Điện thoại" name="benh_nhan_dien_thoai">
            <Input placeholder="SĐT liên hệ" />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item label="Email" name="benh_nhan_email">
            <Input type="email" placeholder="Email liên hệ" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Form.Item label="PID (Mã định danh)" name="benh_nhan_pid">
            <Input placeholder="VD: 123456789" />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item label="SID" name="benh_nhan_sid">
            <Input placeholder="PID-DATE-TIME" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Form.Item
            name="province"
            label="Tỉnh/Thành phố"
            rules={[{ required: true }]}
          >
            <Select
              placeholder="Chọn Tỉnh / Thành phố"
              onChange={(val) => {
                form.setFieldsValue({
                  province: val,
                  ward: undefined,
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
          <Form.Item name="ward" label="Phường/Xã" rules={[{ required: true }]}>
            <Select
              onChange={(val) => {
                form.setFieldsValue({ ward: val });
              }}
              placeholder="Chọn Xã / Phường"
              disabled={!wards.length}
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

      <Form.Item label="Địa chỉ (số nhà)" name="benh_nhan_dia_chi_so_nha">
        <Input placeholder="VD: 123 Lê Lợi" />
      </Form.Item>

      <Form.Item label="Lâm sàng" name="benh_nhan_lam_sang">
        <TextArea
          autoSize={{ minRows: 3, maxRows: 6 }}
          placeholder="Nhập triệu chứng lâm sàng..."
        />
      </Form.Item>
    </>
  );
}
