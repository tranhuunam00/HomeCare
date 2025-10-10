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
  Divider,
  Card,
  Descriptions,
} from "antd";
import { UploadOutlined, PlusOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import API_CALL from "../../services/axiosClient";
import { ACADEMIC_TITLES, DEGREES } from "../../constant/app";
import { useGlobalAuth } from "../../contexts/AuthContext";
import STORAGE from "../../services/storage";
import { toast } from "react-toastify";
import TemplateHeaderEditor from "../../pages/products/TemplatePrint/Header/TemplateHeaderEditor";

const { Option } = Select;

const OnboardingWizard = ({ open, onClose, doctorId }) => {
  const [current, setCurrent] = useState(0);
  const [form] = Form.useForm();
  const [avatarFile, setAvatarFile] = useState(null);
  const [signatureFile, setSignatureFile] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [signatureUrl, setSignatureUrl] = useState(null);
  const [clinics, setClinics] = useState([]);
  const { setDoctor } = useGlobalAuth();
  const [createClinicMode, setCreateClinicMode] = useState(false);

  // Mẫu in
  const [headerInfo, setHeaderInfo] = useState({});
  const [printTemplates, setPrintTemplates] = useState([]);
  const [createTemplateMode, setCreateTemplateMode] = useState(false);

  // ===== Load clinics =====
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
    if (open) fetchClinics();
  }, [open]);

  // ===== Load doctor =====
  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const res = await API_CALL.get(`/doctor/${doctorId}`);
        const data = res.data.data;

        form.setFieldsValue({
          ...data,
          dob: data.dob ? dayjs(data.dob, "YYYY-MM-DD") : null,
          email: data.id_user_user?.email || "",
        });

        setAvatarUrl(data.avatar_url || null);
        setSignatureUrl(data.signature_url || null);
      } catch (err) {
        console.error("Lỗi khi lấy thông tin doctor:", err);
      }
    };
    if (open && doctorId) fetchDoctor();
  }, [open, doctorId]);

  // ===== Avatar/Signature preview =====
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

  // ===== Steps =====
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
                label="Phòng khám (chưa có? tạo mới bên dưới)"
                name="id_clinic"
                rules={[
                  { required: true, message: "Vui lòng chọn phòng khám" },
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
      title: "Mẫu in phòng khám",
      content: (
        <>
          {printTemplates.length > 0 && !createTemplateMode ? (
            <>
              <Card
                title="Mẫu in hiện tại"
                style={{ marginBottom: 16, borderRadius: 8 }}
              >
                {printTemplates.map((tpl) => (
                  <Descriptions
                    key={tpl.id}
                    column={1}
                    size="small"
                    bordered
                    style={{ marginBottom: 12 }}
                  >
                    <Descriptions.Item label="Tên mẫu">
                      {tpl.name}
                    </Descriptions.Item>
                    <Descriptions.Item label="Phòng khám">
                      {tpl.clinic_name}
                    </Descriptions.Item>
                    <Descriptions.Item label="Khoa">
                      {tpl.department_name}
                    </Descriptions.Item>
                    <Descriptions.Item label="Địa chỉ">
                      {tpl.address}
                    </Descriptions.Item>
                    <Descriptions.Item label="Hotline">
                      {tpl.phone}
                    </Descriptions.Item>
                    <Descriptions.Item label="Email">
                      {tpl.email}
                    </Descriptions.Item>
                    <Descriptions.Item label="Website">
                      {tpl.website}
                    </Descriptions.Item>
                    {tpl.logo_url && (
                      <Descriptions.Item label="Logo">
                        <img
                          src={tpl.logo_url}
                          alt="logo"
                          style={{ height: 60 }}
                        />
                      </Descriptions.Item>
                    )}
                  </Descriptions>
                ))}
              </Card>

              <Divider />
              <Button
                icon={<PlusOutlined />}
                type="dashed"
                onClick={() => setCreateTemplateMode(true)}
              >
                + Tạo mẫu in mới
              </Button>
            </>
          ) : (
            <>
              <p>
                Phòng khám chưa có mẫu in hoặc bạn đang tạo mẫu mới. Vui lòng
                nhập thông tin bên dưới:
              </p>
              <Form.Item
                label="Tên mẫu in"
                name="print_template_name"
                rules={[
                  { required: true, message: "Vui lòng nhập tên mẫu in" },
                ]}
              >
                <Input placeholder="VD: Mẫu in chuẩn HomeCare" />
              </Form.Item>
              <TemplateHeaderEditor
                value={headerInfo}
                onChange={setHeaderInfo}
                form={form}
              />

              {printTemplates.length > 0 && (
                <Button
                  type="link"
                  onClick={() => setCreateTemplateMode(false)}
                >
                  ← Quay lại mẫu in hiện có
                </Button>
              )}
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

  // ===== NEXT =====
  const next = async () => {
    try {
      await form.validateFields();
      const values = form.getFieldsValue();

      // Bước 1: tạo clinic
      if (current === 1 && createClinicMode) {
        const payload = {
          name: values.new_clinic_name,
          phone_number: values.new_clinic_phone_number || "",
          address: values.new_clinic_address || "",
        };
        const resClinic = await API_CALL.post("/clinics", payload);
        const newClinic = resClinic.data.data;

        values.id_clinic = newClinic.id;
        form.setFieldValue("id_clinic", newClinic.id);
        setClinics((prev) => [...prev, newClinic]);
      }

      // Check mẫu in
      if (current === 1) {
        const clinicId = form.getFieldValue("id_clinic");
        if (clinicId) {
          const resTemplate = await API_CALL.get("/print-template", {
            params: { id_clinic: clinicId, is_use_onboard: true },
          });
          const templates = resTemplate.data.data?.data || [];
          setPrintTemplates(templates);

          if (!templates.length) {
            toast.info("Phòng khám chưa có mẫu in — vui lòng tạo mẫu in.");
            setCreateTemplateMode(true);
          }
        }
      }

      // Bước 2: tạo mẫu in
      if (current === 2 && createTemplateMode) {
        const clinicId = form.getFieldValue("id_clinic");
        const payload = {
          name: values.print_template_name,
          id_clinic: clinicId,
          ...headerInfo,
        };
        const fd = new FormData();
        Object.entries(payload).forEach(([k, v]) => {
          if (v !== undefined && v !== null) fd.append(k, v);
        });

        await API_CALL.post("/print-template", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Đã tạo mẫu in cho phòng khám!");
      }

      if (current !== 2) {
        const formData = new FormData();
        const append = (k, v) => v && formData.append(k, v);

        append("full_name", values.full_name);
        append("phone_number", values.phone_number);
        append("description", values.description);
        append("id_clinic", values.id_clinic);
        append("gender", values.gender);
        append("e_signature_url", values.e_signature_url);
        append("academic_title", values.academic_title);
        append("degree", values.degree);
        append(
          "dob",
          values.dob ? dayjs(values.dob).format("YYYY-MM-DD") : null
        );

        if (avatarFile) formData.append("avatar", avatarFile);
        if (signatureFile) formData.append("signature", signatureFile);

        await API_CALL.put(`/doctor/${doctorId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        const res = await API_CALL.get(`/doctor/${doctorId}`);
        setDoctor(res.data.data);
        STORAGE.set("DOCTOR", res.data.data);
      }

      setCurrent((prev) => prev + 1);
    } catch (err) {
      console.error("Validation fail:", err);
    }
  };

  const prev = () => setCurrent((prev) => prev - 1);

  return (
    <Modal open={open} closable={false} footer={null} width={800}>
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
