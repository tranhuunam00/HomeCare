// src/components/OnboardingWizard.jsx
import React, { useState, useEffect } from "react";
import {
  Modal,
  Steps,
  Button,
  Form,
  Input,
  Select,
  DatePicker,
  Upload,
  Avatar,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import API_CALL from "../../services/axiosClient";
import { ACADEMIC_TITLES, DEGREES } from "../../constant/app";
import { useGlobalAuth } from "../../contexts/AuthContext";
import STORAGE from "../../services/storage";

const { Option } = Select;

const OnboardingWizard = ({ open, onClose, doctorId }) => {
  const [current, setCurrent] = useState(0);
  const [form] = Form.useForm();
  const [avatarFile, setAvatarFile] = useState(null);
  const [signatureFile, setSignatureFile] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [signatureUrl, setSignatureUrl] = useState(null);
  const [clinics, setClinics] = useState([]);
  const { setDoctor } = useGlobalAuth(); // cần thêm hàm setDoctor trong AuthContext
  const [createClinicMode, setCreateClinicMode] = useState(false);

  useEffect(() => {
    const fetchClinics = async () => {
      try {
        const res = await API_CALL.get("/clinics", {
          params: { page: 1, limit: 100 },
        });
        setClinics(res.data.data.data);
      } catch (err) {
        console.error("Lỗi khi load clinics:", err);
      }
    };
    if (open) {
      fetchClinics();
    }
  }, [open]);

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const res = await API_CALL.get(`/doctor/${doctorId}`);
        const data = res.data.data;

        // map vào form
        form.setFieldsValue({
          ...data,
          dob: data.dob ? dayjs(data.dob, "YYYY-MM-DD") : null,
          email: data.id_user_user?.email || "", // nếu API trả email trong user
        });

        // set avatar & signature preview
        setAvatarUrl(data.avatar_url || null);
        setSignatureUrl(data.signature_url || null);
      } catch (err) {
        console.error("Lỗi khi lấy thông tin doctor:", err);
      }
    };

    if (open && doctorId) {
      fetchDoctor();
    }
  }, [open, doctorId]);

  const handleAvatarPreview = (file) => {
    setAvatarFile(file);
    setAvatarUrl(URL.createObjectURL(file));
    form.setFieldValue("avatar", file);
    return false;
  };

  const handleSignaturePreview = (file) => {
    setSignatureFile(file);
    setSignatureUrl(URL.createObjectURL(file));
    form.setFieldValue("signature", file);
    return false;
  };

  const steps = [
    {
      title: "Hồ sơ bác sĩ",
      content: (
        <>
          <Form.Item
            label="Họ và tên"
            name="full_name"
            rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Ngày sinh"
            name="dob"
            rules={[{ required: true, message: "Vui lòng chọn ngày sinh" }]}
          >
            <DatePicker format="DD-MM-YYYY" style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            label="Giới tính"
            name="gender"
            rules={[{ required: true, message: "Vui lòng chọn giới tính" }]}
          >
            <Select>
              <Option value="Nam">Nam</Option>
              <Option value="Nữ">Nữ</Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="Số điện thoại"
            name="phone_number"
            rules={[{ required: true, message: "Vui lòng nhập số điện thoại" }]}
          >
            <Input />
          </Form.Item>
        </>
      ),
    },
    {
      title: "Thông tin bổ sung",
      content: (
        <>
          <Form.Item label="Học hàm" name="academic_title">
            <Select allowClear placeholder="Chọn học hàm">
              {ACADEMIC_TITLES.map((item) => (
                <Option key={item.value} value={item.value}>
                  {item.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="Học vị" name="degree">
            <Select allowClear placeholder="Chọn học vị">
              {DEGREES.map((item) => (
                <Option key={item.value} value={item.value}>
                  {item.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="Mô tả" name="description">
            <Input.TextArea />
          </Form.Item>
          {!createClinicMode ? (
            <>
              <Form.Item
                label="Phòng khám (nếu bạn chưa có thì vui lòng ấn vào Tạo mới phòng khám bên dưới)"
                name="id_clinic"
                rules={[
                  { required: true, message: "Vui lòng chọn phòng khám." },
                ]}
              >
                <Select placeholder="Chọn phòng khám">
                  {clinics?.map((c) => (
                    <Option key={c.id} value={c.id}>
                      {c.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Button type="dashed" onClick={() => setCreateClinicMode(true)}>
                + Tạo mới phòng khám
              </Button>
            </>
          ) : (
            <>
              <Form.Item
                name="new_clinic_name"
                label="Tên cơ sở"
                rules={[{ required: true, message: "Vui lòng nhập tên cơ sở" }]}
              >
                <Input />
              </Form.Item>
              <Form.Item name="new_clinic_phone_number" label="Số điện thoại">
                <Input />
              </Form.Item>
              <Form.Item name="new_clinic_address" label="Địa chỉ">
                <Input />
              </Form.Item>
              <Button type="link" onClick={() => setCreateClinicMode(false)}>
                ← Chọn phòng khám có sẵn
              </Button>
            </>
          )}
        </>
      ),
    },
    {
      title: "Ảnh & Chữ ký",
      content: (
        <>
          <Form.Item
            label="Ảnh đại diện"
            name="avatar"
            rules={[
              {
                validator: (_, value) => {
                  if (avatarUrl || value) return Promise.resolve();
                  return Promise.reject("Vui lòng tải ảnh đại diện");
                },
              },
            ]}
          >
            <>
              <Avatar
                size={120}
                src={avatarUrl ?? "https://i.pravatar.cc/300"}
                style={{ marginBottom: 12 }}
              />
              <Upload
                accept=".jpg,.jpeg,.png"
                showUploadList={false}
                beforeUpload={handleAvatarPreview}
              >
                <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
              </Upload>
            </>
          </Form.Item>
          <Form.Item
            label="Chữ ký"
            name="signature"
            rules={[
              {
                validator: (_, value) => {
                  if (signatureUrl || value) return Promise.resolve();
                  return Promise.reject("Vui lòng tải chữ ký");
                },
              },
            ]}
          >
            <>
              {signatureUrl && (
                <img
                  src={signatureUrl}
                  alt="signature"
                  style={{ maxHeight: 80, display: "block", marginBottom: 12 }}
                />
              )}
              <Upload
                accept=".jpg,.jpeg,.png"
                showUploadList={false}
                beforeUpload={handleSignaturePreview}
              >
                <Button icon={<UploadOutlined />}>Chọn chữ ký</Button>
              </Upload>
            </>
          </Form.Item>
          <Form.Item label="Chữ ký điện tử" name="e_signature_url">
            <Input placeholder="Nhập chữ ký điện tử" />
          </Form.Item>
        </>
      ),
    },
    {
      title: "Hoàn tất",
      content: (
        <div style={{ textAlign: "center" }}>
          <h2>🎉🎉🎉 Chúc mừng!</h2>
          <p>Bạn đã hoàn tất thiết lập ban đầu.</p>
        </div>
      ),
    },
  ];

  const next = async () => {
    try {
      await form.validateFields();
      const values = form.getFieldsValue();

      if (current === 1 && createClinicMode) {
        const payload = {
          name: values.new_clinic_name,
          phone_number: values.new_clinic_phone_number || "",
          address: values.new_clinic_address || "",
        };

        // Call API tạo mới clinic
        const resClinic = await API_CALL.post("/clinics", payload);
        const newClinic = resClinic.data.data;

        // gắn vào doctor
        values.id_clinic = newClinic.id;
        form.setFieldValue("id_clinic", newClinic.id);

        // cập nhật danh sách clinic
        setClinics([...clinics, newClinic]);
      }

      // Tạo FormData
      const formData = new FormData();
      values.full_name && formData.append("full_name", values.full_name);
      values.phone_number &&
        formData.append("phone_number", values.phone_number);
      values.description &&
        formData.append("description", values.description || "");
      values.id_clinic && formData.append("id_clinic", values.id_clinic || "");
      values.gender && formData.append("gender", values.gender);
      values.e_signature_url &&
        formData.append("e_signature_url", values.e_signature_url || "");
      values.academic_title &&
        formData.append("academic_title", values.academic_title || "");
      values.degree && formData.append("degree", values.degree || "");
      values.dob &&
        formData.append(
          "dob",
          values.dob ? dayjs(values.dob).format("YYYY-MM-DD") : null
        );
      if (avatarFile) formData.append("avatar", avatarFile);
      if (signatureFile) formData.append("signature", signatureFile);

      // Gọi API update
      await API_CALL.put(`/doctor/${doctorId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const res = await API_CALL.get(`/doctor/${doctorId}`);
      setDoctor(res.data.data);
      STORAGE.set("DOCTOR", res.data.data);
      setCurrent(current + 1);
    } catch (err) {
      console.error("Validation fail:", err);
    }
  };

  const prev = () => setCurrent(current - 1);

  return (
    <Modal open={open} closable={false} footer={null} width={700}>
      <Steps current={current} items={steps.map((s) => ({ title: s.title }))} />
      <Form form={form} layout="vertical" style={{ marginTop: 24 }}>
        {steps[current].content}
      </Form>
      <div style={{ marginTop: 24, textAlign: "right" }}>
        {current > 0 && current < steps.length - 1 && (
          <Button style={{ marginRight: 8 }} onClick={prev}>
            Quay lại
          </Button>
        )}
        {current < steps.length - 1 && (
          <Button type="primary" onClick={next}>
            Tiếp tục
          </Button>
        )}
        {current === steps.length - 1 && (
          <Button type="primary" onClick={onClose}>
            Bắt đầu sử dụng
          </Button>
        )}
      </div>
    </Modal>
  );
};

export default OnboardingWizard;
