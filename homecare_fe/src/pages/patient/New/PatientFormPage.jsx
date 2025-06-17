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

  const fetchPatientInfo = async (patientId) => {
    // try {
    //   setLoading(true);
    //   const res = await axios.get(`/api/patients/${patientId}`);
    //   const data = res.data;
    //   form.setFieldsValue({
    //     ...data,
    //     dob: data.dob ? dayjs(data.dob) : null,
    //   });
    // } catch (err) {
    //   message.error("Không thể tải thông tin bệnh nhân");
    // } finally {
    //   setLoading(false);
    // }
  };

  const handleDobChange = (date) => {
    if (date) {
      const age = dayjs().year() - dayjs(date).year();
      form.setFieldsValue({ age });
    }
  };

  const onFinish = async (values) => {
    try {
      setLoading(true);
      const payload = {
        ...values,
        dob: values.dob ? values.dob.format("YYYY-MM-DD") : null,
      };

      if (id) {
        await axios.put(`/api/patients/${id}`, payload);
        message.success("Cập nhật thông tin bệnh nhân thành công");
      } else {
        await axios.post(`/api/patients`, payload);
        message.success("Tạo mới ca chẩn đoán thành công");
      }

      navigate("/patients-diagnose");
    } catch (err) {
      message.error("Có lỗi xảy ra, vui lòng thử lại");
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
                  <Option value="male">Nam</Option>
                  <Option value="female">Nữ</Option>
                  <Option value="other">Khác</Option>
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
          <Form.Item label="Phòng khám" name="id_clinic">
            <Select placeholder="Chọn phòng khám">
              {clinics.map((clinic) => (
                <Option key={clinic.id} value={clinic.id}>
                  {clinic.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          {/* Quốc tịch */}

          {/* Ngày sinh + tuổi */}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="dob" label="Ngày sinh">
                <DatePicker
                  onChange={handleDobChange}
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="age" label="Tuổi">
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
                // rules={[{ required: true }]}
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
              <Form.Item name="country" label="Quốc tịch">
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
                rules={[{ required: false }]}
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
                rules={[{ required: false }]}
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
                rules={[{ required: false }]}
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
              <Form.Item name="pid" label="PID">
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="sid" label="SID">
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
