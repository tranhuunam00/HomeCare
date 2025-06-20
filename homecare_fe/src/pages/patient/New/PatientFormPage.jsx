import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Form,
  Input,
  DatePicker,
  Select,
  Button,
  message,
  Row,
  Col,
  Card,
} from "antd";
import axios from "axios";
import dayjs from "dayjs";
import useVietnamAddress from "../../../hooks/useVietnamAddress";
import API_CALL from "../../../services/axiosClient";
import { useGlobalAuth } from "../../../contexts/AuthContext";
import { USER_ROLE } from "../../../constant/app";

const { Option } = Select;

const PatientFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [countries, setCountries] = useState([]);
  const [clinics, setClinics] = useState([]);
  const { user, doctor, handleLogoutGlobal } = useGlobalAuth();

  const fetchClinics = async () => {
    try {
      const res = await API_CALL.get("/clinics", {
        params: { page: 1, limit: 100 },
      });
      setClinics(res.data.data.data);
    } catch (error) {
      console.error("Lỗi lấy danh sách phòng khám:", error);
    }
  };
  useEffect(() => {
    fetchClinics();
  }, []);

  const {
    provinces,
    districts,
    wards,
    setSelectedProvince,
    setSelectedDistrict,
  } = useVietnamAddress(form);

  // Call API lấy danh sách quốc gia
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const res = await axios.get(
          "https://countriesnow.space/api/v0.1/countries/positions"
        );
        const names = res.data.data.map((c) => c.name).sort();
        setCountries(names);
      } catch (err) {
        message.warning("Không thể tải danh sách quốc gia");
      }
    };
    fetchCountries();
  }, []);

  const handleDobChange = (date) => {
    if (date) {
      const today = dayjs();
      const birth = dayjs(date);
      const age = today.diff(birth, "year");
      form.setFieldsValue({ age });
      form.setFieldsValue({ dob: date });
    } else {
      form.setFieldsValue({ age: undefined });
      form.setFieldsValue({ dob: null });
    }
  };
  const onFinish = async (values) => {
    try {
      setLoading(true);

      const payload = {
        name: values.name,
        PID: values.pid,
        SID: values.sid,
        Indication: values.Indication,
        gender: values.gender,
        CCCD: values.cccd,
        phoneNumber: values.phone,
        email: values.email,
        address: values.detail,
        countryCode: values.country,
        province_code: values.province + "",
        district_code: values.district + "",
        ward_code: values.ward + "",
        id_clinic: values.id_clinic,
        createdBy: user?.id,
        status: 1,
        dob: values.dob,
      };

      await API_CALL.post("/patient-diagnose", payload);
      message.success("Tạo mới ca chẩn đoán thành công");
      navigate("/home/patients-diagnose");
    } catch (err) {
      message.error("Có lỗi xảy ra, vui lòng thử lại");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  console.log(form.getFieldsValue());
  return (
    <div style={{ padding: "2rem" }}>
      <Card
        title={id ? "Cập nhật thông tin bệnh nhân" : "Tạo mới ca chẩn đoán"}
        bordered
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          {/* Họ tên + Giới tính */}
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="name"
                label="Họ và tên"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item
                name="gender"
                label="Giới tính"
                rules={[{ required: true }]}
              >
                <Select placeholder="Chọn giới tính">
                  <Option value="Nam">Nam</Option>
                  <Option value="Nữ">Nữ</Option>
                  <Option value="Khác">Khác</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="Indication"
                label="Chỉ định"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>
          {user.id_role == USER_ROLE.ADMIN && (
            <Form.Item
              label="Phòng khám"
              name="id_clinic"
              rules={[{ required: true }]}
            >
              <Select placeholder="Chọn phòng khám">
                {clinics.map((clinic) => (
                  <Option key={clinic.id} value={clinic.id}>
                    {clinic.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          )}
          {/* Quốc tịch */}

          {/* Ngày sinh + tuổi */}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="dob"
                label="Ngày sinh"
                rules={[{ required: false }]}
              >
                <DatePicker
                  onChange={handleDobChange}
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="age" label="Tuổi" rules={[{ required: false }]}>
                <Input disabled />
              </Form.Item>
            </Col>
          </Row>

          {/* Số điện thoại */}
          <Row gutter={16}>
            <Col span={5}>
              <Form.Item
                name="phone"
                label="Số điện thoại"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="email"
                label="Email"
                // rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col>
              <Form.Item
                name="country"
                label="Quốc tịch"
                rules={[{ required: true }]}
              >
                <Select
                  showSearch
                  placeholder="Chọn quốc gia"
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option?.children
                      ?.toLowerCase()
                      .includes(input.toLowerCase())
                  }
                >
                  {countries.map((c) => (
                    <Option key={c} value={c}>
                      {c}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {/* Tỉnh - Huyện - Xã */}
          <Row gutter={16}>
            <Col span={8}>
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
                      district: undefined,
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
            <Col span={8}>
              <Form.Item
                name="district"
                label="Quận/Huyện"
                rules={[{ required: true }]}
              >
                <Select
                  placeholder="Chọn Quận/Huyện"
                  onChange={(val) => {
                    form.setFieldsValue({ ward: undefined, district: val });
                    setSelectedDistrict(val);
                  }}
                  disabled={!districts.length}
                >
                  {districts.map((dist) => (
                    <Option key={dist.code} value={dist.code}>
                      {dist.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="ward"
                label="Phường/Xã"
                rules={[{ required: true }]}
              >
                <Select
                  onChange={(val) => {
                    console.log(val);
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

          {/* Chi tiết địa chỉ */}
          <Row>
            <Col span={24}>
              <Form.Item name="detail" label="Chi tiết địa chỉ">
                <Input.TextArea
                  placeholder="Nhập địa chỉ cụ thể (số nhà, ngõ...)"
                  autoSize={{ minRows: 2, maxRows: 4 }}
                />
              </Form.Item>
            </Col>
          </Row>

          {/* PID - SID - CCCD */}
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="pid" label="PID" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="sid" label="SID" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="cccd" label="CCCD">
                <Input placeholder="Nhập số CCCD / CMND" />
              </Form.Item>
            </Col>
          </Row>

          {/* Nút Submit */}
          <Row justify="end">
            <Col>
              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading}>
                  {id ? "Cập nhật" : "Tạo mới"}
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>
    </div>
  );
};

export default PatientFormPage;
