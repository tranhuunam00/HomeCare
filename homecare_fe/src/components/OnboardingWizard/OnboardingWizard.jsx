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
  Row,
  Col,
} from "antd";
import { UploadOutlined, PlusOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import API_CALL from "../../services/axiosClient";
import { ACADEMIC_TITLES, DEGREES } from "../../constant/app";
import {
  PACKAGE_FEATURES,
  DURATION_OPTIONS,
  getUsablePackageCodes,
  PACKAGE_FEES,
} from "../../constant/permission";
import { useGlobalAuth } from "../../contexts/AuthContext";
import STORAGE from "../../services/storage";
import { toast } from "react-toastify";
import TemplateHeaderEditor from "../../pages/products/TemplatePrint/Header/TemplateHeaderEditor";
import PackageCard from "../../pages/packages/components/card/PackageCard";

import { Tag, Table, Spin } from "antd";
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";

const STATUS_COLORS = {
  pending: "processing",
  approved: "success",
  rejected: "error",
};
const STATUS_ICONS = {
  pending: <ClockCircleOutlined />,
  approved: <CheckCircleOutlined />,
  rejected: <CloseCircleOutlined />,
};

const { Option } = Select;

const OnboardingWizard = ({ open, onClose, doctorId, is_use_onboard }) => {
  const [current, setCurrent] = useState(0);
  const [form] = Form.useForm();
  const [avatarFile, setAvatarFile] = useState(null);
  const [signatureFile, setSignatureFile] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [signatureUrl, setSignatureUrl] = useState(null);
  const [clinics, setClinics] = useState([]);
  const { setDoctor, userPackages, user } = useGlobalAuth();
  const [createClinicMode, setCreateClinicMode] = useState(false);

  // Mẫu in
  const [headerInfo, setHeaderInfo] = useState({});
  const [printTemplates, setPrintTemplates] = useState([]);
  const [createTemplateMode, setCreateTemplateMode] = useState(false);

  // ==== Package registration ====
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [duration, setDuration] = useState(null);
  const [note, setNote] = useState("");
  const [loadingPackage, setLoadingPackage] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [requests, setRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [loadingTemplate, setLoadingTemplate] = useState(false);

  const fees = PACKAGE_FEES[selectedPackage];

  const usableCount = getUsablePackageCodes(userPackages).length;

  const handleSelectPackage = (planKey) => {
    setSelectedPackage(planKey);
    setModalVisible(true);
  };

  const handleSubmitPackage = async () => {
    if (!selectedPackage) return toast.error("Vui lòng chọn gói!");
    setLoadingPackage(true);
    try {
      const hasPackage = userPackages.some(
        (pkg) => pkg.package_code === selectedPackage,
      );

      const payload = {
        package_code: selectedPackage,
        duration_months: 1, // Dùng thử 1 tháng
        type: "new",
        note,
      };

      // Nếu chưa có gói này => thêm is_trial = true
      if (!hasPackage) {
        payload.is_trial = true;
      }

      const res = await API_CALL.post("/package/request", payload);
      const data = res.data?.data || {};
      toast.success("Gửi yêu cầu đăng ký gói thành công!");
      setModalVisible(false);
      setNote("");
      setSelectedPackage(null);
      if (data.trial === true) {
        toast.success("Gói trial đã được kích hoạt tự động!");
        setCurrent((prev) => prev + 1);
      } else {
        await fetchRequests();
      }
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          "Đăng ký gói thất bại, vui lòng thử lại.",
      );
    } finally {
      setLoadingPackage(false);
    }
  };

  const fetchRequests = async () => {
    if (!user?.id) return;
    setLoadingRequests(true);
    try {
      const res = await API_CALL.get("/package/request-package", {
        params: { id_user: user.id, limit: 10 },
      });
      setRequests(res.data.data.data || []);
    } catch (err) {
      toast.error("Không thể tải yêu cầu gói");
    } finally {
      setLoadingRequests(false);
    }
  };

  useEffect(() => {
    if (open) fetchRequests();
  }, [open]);

  // ===== Load clinics =====
  useEffect(() => {
    const fetchClinics = async () => {
      try {
        const res = await API_CALL.get("/clinics", {
          params: { page: 1, limit: 1000 },
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
      title: "Đăng ký gói sử dụng",
      content: (
        <>
          <div style={{ textAlign: "center", marginBottom: 16 }}>
            <h3>Chọn gói sử dụng phần mềm D-RADS phù hợp</h3>
          </div>
          <Divider />

          <h3>Gói hiện tại của bạn</h3>
          {userPackages?.length > 0 ? (
            <Table
              dataSource={userPackages}
              size="small"
              rowKey="id"
              pagination={false}
              columns={[
                { title: "Mã gói", dataIndex: "package_code" },
                {
                  title: "Trạng thái",
                  dataIndex: "status",
                  render: (st) => (
                    <Tag color={STATUS_COLORS[st]} icon={STATUS_ICONS[st]}>
                      {st}
                    </Tag>
                  ),
                },
                {
                  title: "Hết hạn",
                  dataIndex: "expired_at",
                  render: (v) => (v ? dayjs(v).format("DD/MM/YYYY") : "—"),
                },
              ]}
            />
          ) : (
            <p style={{ color: "#999" }}>Chưa có gói hoạt động nào.</p>
          )}
          <h3 style={{ color: "rgba(19, 143, 180, 1)" }}>
            Vui lòng đợi ADMIN phê duyệt để sử dụng sản phẩm!
          </h3>
          <Divider />
          <h4>Các yêu cầu đăng ký gần đây</h4>
          <Spin spinning={loadingRequests}>
            <Table
              dataSource={requests}
              size="small"
              rowKey="id"
              pagination={false}
              columns={[
                { title: "Mã gói", dataIndex: "package_code" },
                {
                  title: "Trạng thái",
                  dataIndex: "status",
                  render: (st) => (
                    <Tag color={STATUS_COLORS[st]} icon={STATUS_ICONS[st]}>
                      {st}
                    </Tag>
                  ),
                },
                {
                  title: "Ngày tạo",
                  dataIndex: "createdAt",
                  render: (v) => dayjs(v).format("DD/MM/YYYY HH:mm"),
                },
              ]}
            />
          </Spin>
          <Divider />

          <Row gutter={[24, 24]} justify="center">
            {Object.entries(PACKAGE_FEATURES).map(([key, plan]) => (
              <Col xs={24} sm={12} md={8} key={key}>
                <PackageCard
                  planKey={key}
                  plan={plan}
                  onSelect={handleSelectPackage}
                />
              </Col>
            ))}
          </Row>

          <Modal
            title="Xác nhận đăng ký gói"
            open={modalVisible}
            onCancel={() => setModalVisible(false)}
            footer={null}
          >
            <p>
              Bạn đang chọn gói:{" "}
              <strong style={{ color: "#1677ff" }}>{selectedPackage}</strong>
            </p>

            <div style={{ marginTop: 12 }}>
              <label>Gói dùng thử</label>
              <Select
                style={{ width: "100%", marginTop: 4 }}
                value={1}
                onChange={(val) => setDuration(val)}
              >
                {[{ value: 1, label: "Dùng thử 1 tháng" }].map((d) => {
                  return (
                    <Option key={d.value} value={d.value} disabled={true}>
                      {`${d.label} – ${0} đ`}
                    </Option>
                  );
                })}
              </Select>
            </div>
            <div style={{ marginTop: 12 }}>
              <label>Chu kỳ thanh toán</label>
              <Select
                style={{ width: "100%", marginTop: 4 }}
                value={duration}
                onChange={(val) => setDuration(val)}
              >
                {DURATION_OPTIONS.map((d) => {
                  const feeItem = fees?.find((f) => f.value === d.value);
                  const fee = Number(feeItem?.label?.replace(/\./g, "")) || 0;

                  const oneMonthFee =
                    Number(
                      fees
                        ?.find((f) => f.value === 1)
                        ?.label?.replace(/\./g, ""),
                    ) || 0;

                  const originalPrice = oneMonthFee * d.value;
                  const saving = originalPrice - fee;

                  return (
                    <Option key={d.value} value={d.value} disabled={true}>
                      {`${d.label} – ${feeItem?.label} đ`}
                      {saving > 0 && (
                        <span style={{ color: "#52c41a", marginLeft: 6 }}>
                          (Tiết kiệm {saving.toLocaleString("vi-VN")} đ)
                        </span>
                      )}
                      {d.value == 1 && (
                        <span
                          style={{ color: "#52c41a", marginLeft: 6 }}
                        ></span>
                      )}
                    </Option>
                  );
                })}
              </Select>
            </div>

            <Button
              type="primary"
              block
              style={{ marginTop: 16 }}
              loading={loadingPackage}
              onClick={handleSubmitPackage}
            >
              Gửi yêu cầu đăng ký
            </Button>
          </Modal>
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
      let newIDClinic = null;

      // Bước 1: tạo clinic
      if (current === 1 && createClinicMode) {
        const payload = {
          name: values.new_clinic_name,
          phone_number: values.new_clinic_phone_number || "",
          address: values.new_clinic_address || "",
        };

        setLoadingTemplate(true); // dùng chung state loading hoặc tạo state riêng như loadingClinic
        try {
          // 1️⃣ Tạo mới clinic
          const resClinic = await API_CALL.post("/clinics", payload);
          const newClinic = resClinic.data.data;
          toast.success("Tạo mới phòng khám thành công!");

          const res = await API_CALL.get("/clinics", {
            params: { page: 1, limit: 1000 },
          });
          setClinics(res.data.data.data || []);

          form.setFieldValue("id_clinic", newClinic.id);
          newIDClinic = newClinic.id;
          setCreateClinicMode(false);
        } catch (err) {
          console.error("Tạo phòng khám lỗi:", err);
          toast.error("Tạo mới phòng khám thất bại!");
        } finally {
          setLoadingTemplate(false);
        }
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

        setLoadingTemplate(true);
        try {
          // 1️⃣ Tạo mới template
          await API_CALL.post("/print-template", fd, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          toast.success("Đã tạo mẫu in cho phòng khám!");

          const res = await API_CALL.get("/print-template", {
            params: { id_clinic: clinicId, is_use_onboard: true },
          });
          const updatedTemplates = res.data.data?.data || [];
          setPrintTemplates(updatedTemplates);

          setCreateTemplateMode(false);
        } catch (err) {
          console.error("Tạo mẫu in lỗi:", err);
          toast.error(err?.response?.data?.message || "Tạo mẫu in thất bại!");
        } finally {
          setLoadingTemplate(false);
        }
      }

      if (current === 4 && usableCount === 0) {
        toast.warning(
          "Vui lòng đăng ký và được duyệt ít nhất 1 gói hoạt động.",
        );
        return;
      }

      if (current !== 2 || current !== 3) {
        const formData = new FormData();
        const append = (k, v) => v && formData.append(k, v);

        append("full_name", values.full_name);
        append("phone_number", values.phone_number);
        append("description", values.description);
        append("id_clinic", values.id_clinic || newIDClinic);
        append("gender", values.gender);
        append("e_signature_url", values.e_signature_url);
        append("academic_title", values.academic_title);
        append("degree", values.degree);
        append(
          "dob",
          values.dob ? dayjs(values.dob).format("YYYY-MM-DD") : null,
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
    <Modal open={open} closable={false} footer={null} width={900}>
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
          <Button
            type="primary"
            onClick={next}
            disabled={current === 4 && usableCount === 0}
            loading={loadingTemplate}
          >
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
