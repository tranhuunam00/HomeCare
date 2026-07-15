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
  Divider,
  ConfigProvider,
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
import { ThamKhaoLinkHomeCare } from "../../advance/component_common/Thamkhao";
import ReloadTSAndExamPartsButton from "../../../components/ReloadTSAndExamPartsButton";
import useConfirmAction from "../../../hooks/useConfirmAction";
import ConfirmActionModal from "../../../components/ConfirmActionModal/ConfirmActionModal";

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
  const [idTemplateService, setIdTemplateService] = useState(null);
  const { confirmState, openConfirm } = useConfirmAction();

  const fetchClinics = async () => {
    try {
      const res = await API_CALL.get("/clinics", {
        params: { page: 1, limit: 1000 },
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
          "https://countriesnow.space/api/v0.1/countries/positions",
        );
        const names = res.data.data.map((c) => c.name).sort();
        setCountries(names);
      } catch (err) {
        message.warning("Không thể tải danh sách quốc gia");
      }
    };
    fetchCountries();
  }, []);

  const fetchData = async () => {
    if (!id) return;
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
        address: data.address,
        country: data.countryCode,
        province: data.province_code ? Number(data.province_code) : undefined,
        ward: data.ward_code ? Number(data.ward_code) : undefined,
        id_clinic: data.id_clinic || doctor?.id_clinic || undefined,
        birth_year: data.birth_year,
        id_template_service: data.id_template_service,
        id_exam_part: data.id_exam_part,
        status: data.status,
        age: data.birth_year
          ? new Date().getFullYear() - Number(data.birth_year)
          : undefined,
      };
      form.setFieldsValue(dataMapping);
      setInitialValues(dataMapping);
      setIdTemplateService(data.id_template_service);
      setSelectedProvince(data.province_code);
    } catch (err) {
      message.error("Không thể tải thông tin bệnh nhân");
      console.error(err);
    }
  };

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  const handleReset = () => {
    if (id) {
      fetchData();
    } else {
      form.resetFields();
      setSelectedProvince(undefined);
      setIdTemplateService(undefined);
    }
  };

  const buildPayload = (values) => ({
    name: values.name,
    PID: values.pid,
    SID: values.sid,
    gender: values.gender,
    CCCD: values.cccd,
    phoneNumber: values.phone,
    email: values.email,
    address: values.address,
    countryCode: values.country,
    province_code: values.province + "",
    district_code: values.district + "",
    ward_code: values.ward + "",
    id_clinic: values.id_clinic || doctor?.id_clinic,
    createdBy: user?.id,
    status: PATIENT_DIAGNOSE_STATUS_CODE.NEW,
    birth_year: values.birth_year,
    id_template_service: values.id_template_service,
    id_exam_part: values.id_exam_part,
    Indication: values.Indication,
  });

  // Validate form → mở modal xác nhận → chạy API
  const handleSubmitClick = async () => {
    try {
      const values = await form.validateFields();

      if (id && initialValues?.status !== PATIENT_DIAGNOSE_STATUS_CODE.NEW) {
        toast.warn("Bạn chỉ được cập nhật khi trạng thái là mới");
        return;
      }

      openConfirm({
        title: id ? "Xác nhận cập nhật ca" : "Xác nhận tạo ca mới",
        message: id
          ? `Bạn có chắc chắn muốn cập nhật thông tin ca bệnh này không?`
          : `Bạn có chắc chắn muốn tạo ca bệnh mới không?`,
        successMessage: id ? "Cập nhật ca bệnh thành công!" : "Tạo ca bệnh mới thành công!",
        errorMessage: id
          ? "Cập nhật thất bại, vui lòng thử lại."
          : "Tạo mới thất bại, vui lòng thử lại.",
        onConfirm: async () => {
          const payload = buildPayload(values);
          if (id) {
            await API_CALL.put(`/patient-diagnose/${id}`, payload);
          } else {
            await API_CALL.post("/patient-diagnose", payload);
          }
          navigate("/home/patients-diagnose");
        },
      });
    } catch (validationError) {
      // Ant Design form validation failed – fields will show inline errors automatically
    }
  };

  // onFinish kept for backward compatibility (e.g. Enter key submit)
  const onFinish = async () => {
    await handleSubmitClick();
  };

  useEffect(() => {
    if (!initialValues) return;

    if (!templateServices.length || !examParts.length) return;

    // set lại form khi options đã load xong
    if (initialValues.id_template_service) {
      form.setFieldsValue({
        id_template_service: initialValues.id_template_service,
      });
      setIdTemplateService(initialValues.id_template_service);
    }

    if (initialValues.id_exam_part) {
      form.setFieldsValue({
        id_exam_part: initialValues.id_exam_part,
      });
    }

    if (clinics.length && initialValues.id_clinic) {
      form.setFieldsValue({
        id_clinic: +initialValues.id_clinic,
      });
    }
  }, [initialValues, templateServices, examParts, clinics]);

  return (
    <div style={{ paddingLeft: "1%", paddingRight: "1%" }}>
      <ConfigProvider
        theme={{
          token: {
            controlHeight: 28,
            fontSize: 12,
          },
          components: {
            Form: {
              itemMarginBottom: 6,
            },
            Card: {
              paddingLG: 10,
            },
          },
        }}
      >
        <Card bordered>
          <h3 style={{ textAlign: "center", margin: "2px 0 8px 0", color: "#15803d", fontWeight: "bold", fontSize: "16px" }}>
            {id ? "CẬP NHẬT CA" : "THÊM CA MỚI"}
          </h3>

          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            initialValues={{ country: "Vietnam" }}
          >
            {/* Họ tên + Giới tính + Năm sinh + Tuổi */}
            <h4 style={{ color: "#1677ff", margin: "4px 0 8px 0" }}>THÔNG TIN HÀNH CHÍNH</h4>
          <Row gutter={24}>
            <Col span={8}>
              <Form.Item
                name="name"
                label="Họ và tên"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập không để trống trường dữ liệu",
                  },
                ]}
                normalize={(value) => value?.toUpperCase()}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item
                name="gender"
                label="Giới tính"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập không để trống trường dữ liệu",
                  },
                ]}
              >
                <Select placeholder="Chọn giới tính">
                  <Option value="Nam">Nam</Option>
                  <Option value="Nữ">Nữ</Option>
                  <Option value="Khác">Khác</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name="birth_year"
                label="Năm sinh"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập năm sinh",
                  },
                ]}
              >
                <Input
                  type="number"
                  placeholder="Ví dụ: 1998"
                  onChange={(e) => {
                    const year = +e.target.value;

                    if (!year) {
                      form.setFieldsValue({ age: undefined });
                      return;
                    }

                    const currentYear = new Date().getFullYear();

                    form.setFieldsValue({
                      birth_year: year,
                      age: currentYear - year,
                    });
                  }}
                />
              </Form.Item>
            </Col>

            <Col span={6}>
              <Form.Item name="age" label="Tuổi">
                <Input disabled />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="province"
                label="Tỉnh/Thành phố"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập không để trống trường dữ liệu",
                  },
                ]}
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
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập không để trống trường dữ liệu",
                  },
                ]}
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
            <Col span={8}>
              <Form.Item name="address" label="Chi tiết địa chỉ">
                <Input placeholder="Nhập địa chỉ cụ thể (số nhà, ngõ...)" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="phone"
                label="Số điện thoại"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập không để trống trường dữ liệu",
                  },
                  {
                    pattern: /^(0[3|5|7|8|9])([0-9]{8})$/,
                    message:
                      "Số điện thoại không đúng định dạng (10 số, bắt đầu bằng 03, 05, 07, 08, 09)!",
                  },
                ]}
              >
                <Input type="number" maxLength={10} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="email"
                label="Email"
                // rules={[{ required: true, message: "Vui lòng nhập không để trống trường dữ liệu" }]}
                rules={[
                  {
                    type: "email",
                    message: "Định dạng email không hợp lệ!",
                  },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="country"
                label="Quốc tịch"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập không để trống trường dữ liệu",
                  },
                ]}
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
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="cccd"
                label="CCCD"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập không để trống trường dữ liệu",
                  },
                ]}
              >
                <Input placeholder="Nhập số CCCD / CMND" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="pid"
                label="PID"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập không để trống trường dữ liệu",
                  },
                ]}
              >
                <Input
                  onChange={(e) => {
                    form.setFieldValue(
                      "sid",
                      `${e.target.value}-${dayjs().format("DDMMYY-HHmmss")}`,
                    );
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="sid"
                label="SID"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập không để trống trường dữ liệu",
                  },
                ]}
              >
                <Input disabled />
              </Form.Item>
            </Col>
          </Row>
          <Divider style={{ margin: "8px 0" }} />
          <div style={{ display: "flex", alignItems: "center", margin: "4px 0 8px 0", gap: 12 }}>
            <h4 style={{ color: "#1677ff", margin: 0 }}>THÔNG TIN CHỈ ĐỊNH</h4>

            <ReloadTSAndExamPartsButton />

            <span style={{ fontStyle: "italic", fontWeight: 400, fontSize: "11px", color: "#64748b" }}>
              Nếu mục nhập chỉ định bị rỗng, vui lòng ấn nút reload bên trái để lấy lại thông tin
            </span>
          </div>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Chỉ định"
                name="id_template_service"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập không để trống trường dữ liệu",
                  },
                ]}
              >
                <Select
                  onChange={(e) => {
                    console.log("e", e);
                    setIdTemplateService(e);
                    form.setFieldsValue({ id_exam_part: undefined });
                  }}
                  placeholder="Chọn chỉ định"
                >
                  {templateServices.map((s) => (
                    <Option key={s.id} value={s.id}>
                      {s.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Bộ phận thăm khám"
                name="id_exam_part"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập không để trống trường dữ liệu",
                  },
                ]}
              >
                <Select
                  disabled={!idTemplateService}
                  placeholder="Chọn bộ phận thăm khám"
                >
                  {examParts
                    .filter((e) => e.id_template_service == idTemplateService)
                    .map((s) => (
                      <Option key={s.id} value={s.id}>
                        {s.name}
                      </Option>
                    ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row>
            <Col span={24}>
              <Form.Item name="Indication" label="Thông tin lâm sàng">
                <Input.TextArea
                  placeholder="Nhập địa chỉ cụ thể (số nhà, ngõ...)"
                  autoSize={{ minRows: 1, maxRows: 5 }}
                />
              </Form.Item>
            </Col>
          </Row>

          {user.id_role == USER_ROLE.ADMIN && (
            <Form.Item
              label="Phòng khám"
              name="id_clinic"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập không để trống trường dữ liệu",
                },
              ]}
            >
              <Select
                placeholder="Chọn phòng khám"
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option?.children?.toLowerCase()?.includes(input.toLowerCase())
                }
              >
                {clinics.map((clinic) => (
                  <Option key={clinic.id} value={clinic.id}>
                    {clinic.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          )}

          <Row justify="end" gutter={8}>
            <Col>
              <Form.Item>
                <Button
                  onClick={handleReset}
                >
                  Reset
                </Button>
              </Form.Item>
            </Col>
            <Col>
              <Form.Item>
                <Button
                  type="primary"
                  onClick={handleSubmitClick}
                  loading={confirmState.loading}
                >
                  {id ? "Cập nhật" : "Tạo mới"}
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>

        <ConfirmActionModal {...confirmState} />
      </Card>
      </ConfigProvider>
    </div>
  );
};

export default PatientFormPage;
