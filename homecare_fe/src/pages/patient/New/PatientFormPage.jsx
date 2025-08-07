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
import {
  PATIENT_DIAGNOSE_STATUS,
  PATIENT_DIAGNOSE_STATUS_CODE,
  USER_ROLE,
} from "../../../constant/app";
import { toast } from "react-toastify";

const { Option } = Select;

const PatientFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [countries, setCountries] = useState([]);
  const [clinics, setClinics] = useState([]);
  const { user, doctor, examParts, templateServices } = useGlobalAuth();
  const [initialValues, setInitialValues] = useState(null);

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

  const { provinces, wards, setSelectedProvince } = useVietnamAddress();

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

  useEffect(() => {
    if (id) {
      const fetchData = async () => {
        try {
          const res = await API_CALL.get(`/patient-diagnose/${id}`);
          const data = res.data.data;
          // Gán giá trị vào form
          const dataMapping = {
            name: data.name,
            pid: data.PID,
            sid: data.SID,
            Indication: data.Indication,
            gender: data.gender,
            cccd: data.CCCD,
            phone: data.phoneNumber,
            email: data.email,
            detail: data.address,
            country: data.countryCode,
            province: data.province_code || undefined,
            ward: data.ward_code || undefined,
            id_clinic: data.id_clinic,
            dob: data.dob ? dayjs(data.dob) : null,
            age: data.dob ? dayjs().diff(dayjs(data.dob), "year") : undefined,
            id_template_service: data.id_template_service,
            id_exam_part: data.id_exam_part,
            status: data.status,
          };
          form.setFieldsValue(dataMapping);
          setInitialValues(dataMapping);

          setSelectedProvince(data.province_code);
        } catch (err) {
          message.error("Không thể tải thông tin bệnh nhân");
          console.error(err);
        }
      };
      fetchData();
    }
  }, [id]);

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
        Indication: values.Indication ?? "-",
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
        status: PATIENT_DIAGNOSE_STATUS_CODE.NEW, // c
        dob: values.dob,
        id_template_service: values.id_template_service,
        id_exam_part: values.id_exam_part,
      };
      if (id) {
        console.log("initialValues.status ", initialValues.status);
        if (initialValues.status != PATIENT_DIAGNOSE_STATUS_CODE.NEW) {
          toast.warn("Bạn chỉ được cập nhật khi trạng thái là mới");
          return;
        }
        // Update
        await API_CALL.put(`/patient-diagnose/${id}`, payload);
        message.success("Cập nhật thành công");
      } else {
        // Create
        await API_CALL.post("/patient-diagnose", payload);
        message.success("Tạo mới thành công");
      }

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
                normalize={(value) => value?.toUpperCase()}
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
                label="Chỉ định"
                name="id_template_service"
                rules={[{ required: true }]}
              >
                <Select placeholder="Chọn chỉ định">
                  {templateServices.map((s) => (
                    <Option key={s.id} value={s.id}>
                      {s.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Col span={12}>
            <Form.Item
              label="Bộ phận thăm khám"
              name="id_exam_part"
              rules={[{ required: true }]}
            >
              <Select placeholder="Chọn bộ phận thăm khám">
                {examParts.map((s) => (
                  <Option key={s.id} value={s.id}>
                    {s.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
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
          <Row justify="end" gutter={8}>
            <Col>
              <Form.Item>
                <Button
                  onClick={() => {
                    if (initialValues) {
                      form.setFieldsValue(initialValues);
                      setSelectedProvince(initialValues.province);
                    }
                  }}
                  disabled={!initialValues}
                >
                  Reset
                </Button>
              </Form.Item>
            </Col>
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
