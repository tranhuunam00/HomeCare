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

  const chunkTemplates = (arr) => {
    const chunks = [];
    if (!arr) return chunks;
    for (let i = 0; i < arr.length; i += 2) {
      chunks.push(arr.slice(i, i + 2));
    }
    return chunks;
  };

  // ===== Steps =====
  const steps = [
    {
      title: "Hồ sơ bác sĩ",
      content: (
        <Row gutter={16}>
          <Col span={14}>
            <Form.Item
              label="Họ và tên"
              name="full_name"
              rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
            >
              <Input placeholder="Nhập họ và tên bác sĩ" style={{ borderRadius: 6 }} />
            </Form.Item>
          </Col>
          <Col span={10}>
            <Form.Item
              label="Giới tính"
              name="gender"
              rules={[{ required: true, message: "Vui lòng chọn giới tính" }]}
            >
              <Select placeholder="Chọn giới tính" style={{ borderRadius: 6 }}>
                <Option value="Nam">Nam</Option>
                <Option value="Nữ">Nữ</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Ngày sinh"
              name="dob"
              rules={[{ required: true, message: "Vui lòng chọn ngày sinh" }]}
            >
              <DatePicker format="DD-MM-YYYY" style={{ width: "100%", borderRadius: 6 }} placeholder="Chọn ngày sinh" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Số điện thoại"
              name="phone_number"
              rules={[
                { required: true, message: "Vui lòng nhập số điện thoại" },
                { pattern: /^[0-9]{9,11}$/, message: "Số điện thoại không hợp lệ" }
              ]}
            >
              <Input placeholder="Nhập số điện thoại liên hệ" style={{ borderRadius: 6 }} />
            </Form.Item>
          </Col>
        </Row>
      ),
    },
    {
      title: "Thông tin bổ sung",
      content: (
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Học hàm" name="academic_title">
              <Select allowClear placeholder="Chọn học hàm" style={{ borderRadius: 6 }}>
                {ACADEMIC_TITLES.map((item) => (
                  <Option key={item.value} value={item.value}>
                    {item.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Học vị" name="degree">
              <Select allowClear placeholder="Chọn học vị" style={{ borderRadius: 6 }}>
                {DEGREES.map((item) => (
                  <Option key={item.value} value={item.value}>
                    {item.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item label="Mô tả / Giới thiệu bản thân" name="description">
              <Input.TextArea placeholder="Nhập một vài dòng giới thiệu về chuyên môn hoặc kinh nghiệm..." rows={3} style={{ borderRadius: 6 }} />
            </Form.Item>
          </Col>
          <Col span={24}>
            <div style={{ 
              background: "#f8fafc", 
              border: "1px solid #e2e8f0", 
              borderRadius: "8px", 
              padding: "16px", 
              marginTop: "8px" 
            }}>
              {!createClinicMode ? (
                <>
                  <Form.Item
                    label="Chọn Cơ sở y tế / Phòng khám làm việc"
                    name="id_clinic"
                    rules={[{ required: true, message: "Vui lòng chọn phòng khám" }]}
                    style={{ marginBottom: 12 }}
                  >
                    <Select placeholder="Chọn cơ sở y tế làm việc" style={{ borderRadius: 6 }}>
                      {clinics?.map((c) => (
                        <Option key={c.id} value={c.id}>
                          {c.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                  <Button type="dashed" block onClick={() => setCreateClinicMode(true)} style={{ borderRadius: 6 }}>
                    + Hoặc tạo mới phòng khám của bạn
                  </Button>
                </>
              ) : (
                <>
                  <h4 style={{ margin: "0 0 12px 0", color: "#1e3a8a", fontSize: "13px" }}>Đăng ký phòng khám mới</h4>
                  <Row gutter={12}>
                    <Col span={12}>
                      <Form.Item
                        name="new_clinic_name"
                        label="Tên cơ sở"
                        rules={[{ required: true, message: "Vui lòng nhập tên cơ sở" }]}
                      >
                        <Input placeholder="Nhập tên phòng khám" style={{ borderRadius: 6 }} />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item name="new_clinic_phone_number" label="Số điện thoại liên hệ">
                        <Input placeholder="Nhập số điện thoại" style={{ borderRadius: 6 }} />
                      </Form.Item>
                    </Col>
                    <Col span={24}>
                      <Form.Item name="new_clinic_address" label="Địa chỉ">
                        <Input placeholder="Nhập địa chỉ chi tiết" style={{ borderRadius: 6 }} />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Button type="link" onClick={() => setCreateClinicMode(false)} style={{ paddingLeft: 0 }}>
                    ← Trở lại danh sách chọn phòng khám
                  </Button>
                </>
              )}
            </div>
          </Col>
        </Row>
      ),
    },
    {
      title: "Mẫu in phòng khám",
      content: (
        <div style={{ maxHeight: "400px", overflowY: "auto", paddingRight: "4px" }}>
          {printTemplates.length > 0 && !createTemplateMode ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {chunkTemplates(printTemplates).map((rowTemplates, rowIndex) => (
                <Row key={rowIndex} gutter={[12, 12]}>
                  {rowTemplates.map((tpl) => (
                    <Col span={12} key={tpl.id}>
                      <div
                        style={{
                          background: "#f8fafc",
                          border: "1px solid #e2e8f0",
                          borderRadius: 8,
                          padding: "10px 12px",
                          boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "space-between",
                          height: "90px"
                        }}
                      >
                        <div>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6, borderBottom: "1px solid #e2e8f0", paddingBottom: 4 }}>
                            <span style={{ fontSize: 11, fontWeight: 700, color: "#1e3a8a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "100px" }}>
                              {tpl.name}
                            </span>
                            <Tag color="blue" style={{ margin: 0, fontSize: "9px", padding: "0 4px", lineHeight: "15px" }}>Mẫu in chính</Tag>
                          </div>

                          <Row gutter={[8, 2]}>
                            <Col span={24}>
                              <div style={{ fontSize: 9, color: "#64748b", lineHeight: "12px" }}>Cơ sở y tế</div>
                              <div style={{ fontSize: 10, fontWeight: 600, color: "#1e293b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                {tpl.clinic_name}
                              </div>
                            </Col>
                            <Col span={14}>
                              <div style={{ fontSize: 9, color: "#64748b", lineHeight: "12px" }}>Chuyên khoa</div>
                              <div style={{ fontSize: 10, fontWeight: 600, color: "#1e293b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                {tpl.department_name}
                              </div>
                            </Col>
                            <Col span={10}>
                              <div style={{ fontSize: 9, color: "#64748b", lineHeight: "12px" }}>Hotline</div>
                              <div style={{ fontSize: 10, fontWeight: 600, color: "#334155", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                {tpl.phone}
                              </div>
                            </Col>
                          </Row>
                        </div>
                      </div>
                    </Col>
                  ))}
                </Row>
              ))}
            </div>
          ) : (
            <>
              <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", padding: "10px 14px", borderRadius: 6, marginBottom: 10, fontSize: "12px", color: "#1e40af" }}>
                Phòng khám chưa có mẫu in hoặc bạn đang tạo mẫu mới. Vui lòng điền thông tin header cho mẫu in kết quả.
              </div>
              <Form.Item
                label="Tên mẫu in"
                name="print_template_name"
                rules={[{ required: true, message: "Vui lòng nhập tên mẫu in" }]}
                style={{ marginBottom: 10 }}
              >
                <Input placeholder="VD: Mẫu in chuẩn HomeCare" style={{ borderRadius: 6 }} />
              </Form.Item>
              <div style={{ background: "#f8fafc", padding: "10px 14px", borderRadius: 8, border: "1px solid #e2e8f0" }}>
                <TemplateHeaderEditor
                  value={headerInfo}
                  onChange={setHeaderInfo}
                  form={form}
                />
              </div>

              {printTemplates.length > 0 && (
                <Button
                  type="link"
                  onClick={() => setCreateTemplateMode(false)}
                  style={{ marginTop: 12, paddingLeft: 0 }}
                >
                  ← Quay lại danh sách mẫu in hiện có
                </Button>
              )}
            </>
          )}
        </div>
      ),
    },
    {
      title: "Ảnh & Chữ ký",
      content: (
        <Row gutter={24}>
          <Col span={12}>
            <Card 
              style={{ borderRadius: 8, textAlign: "center", border: "1px dashed #cbd5e1" }}
              bodyStyle={{ padding: "20px 16px" }}
            >
              <span style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#475569", marginBottom: 12 }}>
                Ảnh đại diện bác sĩ
              </span>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                <Avatar
                  size={100}
                  src={avatarUrl ?? "https://i.pravatar.cc/300"}
                  style={{ border: "2px solid #3b82f6", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" }}
                />
                <Form.Item
                  name="avatar"
                  rules={[
                    {
                      validator: (_, value) => {
                        if (avatarUrl || value) return Promise.resolve();
                        return Promise.reject("Vui lòng tải ảnh đại diện");
                      },
                    },
                  ]}
                  style={{ margin: 0 }}
                >
                  <Upload
                    accept=".jpg,.jpeg,.png"
                    showUploadList={false}
                    beforeUpload={handleAvatarPreview}
                  >
                    <Button icon={<UploadOutlined />} style={{ borderRadius: 6 }}>Chọn ảnh đại diện</Button>
                  </Upload>
                </Form.Item>
              </div>
            </Card>
          </Col>
          <Col span={12}>
            <Card 
              style={{ borderRadius: 8, textAlign: "center", border: "1px dashed #cbd5e1" }}
              bodyStyle={{ padding: "20px 16px" }}
            >
              <span style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#475569", marginBottom: 12 }}>
                Chữ ký mẫu
              </span>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                <div style={{ 
                  height: 100, 
                  width: "100%", 
                  border: "1px solid #e2e8f0", 
                  borderRadius: 6, 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center",
                  background: "#f8fafc",
                  overflow: "hidden"
                }}>
                  {signatureUrl ? (
                    <img
                      src={signatureUrl}
                      alt="signature"
                      style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain" }}
                    />
                  ) : (
                    <span style={{ fontSize: "11px", color: "#94a3b8" }}>Chưa có hình ảnh chữ ký</span>
                  )}
                </div>
                <Form.Item
                  name="signature"
                  rules={[
                    {
                      validator: (_, value) => {
                        if (signatureUrl || value) return Promise.resolve();
                        return Promise.reject("Vui lòng tải chữ ký");
                      },
                    },
                  ]}
                  style={{ margin: 0 }}
                >
                  <Upload
                    accept=".jpg,.jpeg,.png"
                    showUploadList={false}
                    beforeUpload={handleSignaturePreview}
                  >
                    <Button icon={<UploadOutlined />} style={{ borderRadius: 6 }}>Tải lên chữ ký</Button>
                  </Upload>
                </Form.Item>
              </div>
            </Card>
          </Col>
        </Row>
      ),
    },
    {
      title: "Gói sử dụng",
      content: (
        <div style={{ maxHeight: "400px", overflowY: "auto", paddingRight: "4px" }}>
          <div style={{ background: "#fffbeb", border: "1px solid #fef3c7", padding: "10px 14px", borderRadius: 6, marginBottom: 12, fontSize: "12px", color: "#b45309" }}>
            Vui lòng đăng ký gói sử dụng phù hợp bên dưới và đợi quản trị viên phê duyệt.
          </div>

          <Row gutter={[10, 10]} justify="center" style={{ marginBottom: 12 }}>
            {Object.entries(PACKAGE_FEATURES).map(([key, plan]) => (
              <Col span={8} key={key}>
                <PackageCard
                  planKey={key}
                  plan={plan}
                  onSelect={handleSelectPackage}
                  compact={true}
                />
              </Col>
            ))}
          </Row>

          <Divider style={{ margin: "16px 0" }} />
          <h4 style={{ fontSize: "13px", color: "#1e3a8a", margin: "0 0 10px 0" }}>Các yêu cầu đăng ký của bạn</h4>
          <Spin spinning={loadingRequests}>
            <Table
              dataSource={requests}
              size="small"
              rowKey="id"
              pagination={false}
              bordered
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
                  render: (v) => dayjs(v).format("DD/MM/YYYY"),
                },
              ]}
            />
          </Spin>

          <Modal
            title="Xác nhận đăng ký gói"
            open={modalVisible}
            onCancel={() => setModalVisible(false)}
            footer={null}
          >
            <p>
              Bạn đang chọn gói: <strong style={{ color: "#1677ff" }}>{selectedPackage}</strong>
            </p>
            <div style={{ marginTop: 12 }}>
              <label>Chu kỳ sử dụng</label>
              <Select
                style={{ width: "100%", marginTop: 4 }}
                value={duration}
                onChange={(val) => setDuration(val)}
              >
                {DURATION_OPTIONS.map((d) => {
                  const feeItem = fees?.find((f) => f.value === d.value);
                  const fee = Number(feeItem?.label?.replace(/\./g, "")) || 0;
                  const oneMonthFee = Number(fees?.find((f) => f.value === 1)?.label?.replace(/\./g, "")) || 0;
                  const originalPrice = oneMonthFee * d.value;
                  const saving = originalPrice - fee;

                  return (
                    <Option key={d.value} value={d.value}>
                      {`${d.label} – ${feeItem?.label} đ`}
                      {saving > 0 && <span style={{ color: "#52c41a", marginLeft: 6 }}>(Tiết kiệm {saving.toLocaleString("vi-VN")} đ)</span>}
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
        </div>
      ),
    },
    {
      title: "Hoàn tất",
      content: (
        <div style={{ textAlign: "center", padding: "40px 20px" }}>
          <div style={{ fontSize: "60px", color: "#52c41a", marginBottom: "16px" }}>✓</div>
          <h2 style={{ color: "#1e3a8a", margin: "0 0 8px 0" }}>Chúc mừng bác sĩ!</h2>
          <p style={{ fontSize: "14px", color: "#475569" }}>
            Hồ sơ và cấu hình ban đầu đã được thiết lập thành công.
          </p>
          <p style={{ fontSize: "13px", color: "#64748b" }}>
            Hệ thống HomeCare đã sẵn sàng phục vụ bác sĩ.
          </p>
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
    <Modal
      open={open}
      closable={false}
      footer={null}
      width={1000}
      bodyStyle={{ padding: 0 }}
      styles={{ body: { padding: 0 } }}
      style={{ top: 40 }}
    >
      {/* Gradient Header Banner */}
      <div style={{
        background: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)",
        padding: "16px 24px",
        borderTopLeftRadius: "8px",
        borderTopRightRadius: "8px",
        color: "#ffffff"
      }}>
        <h3 style={{ margin: 0, color: "#ffffff", fontSize: "16px", fontWeight: "700" }}>
          Thiết lập tài khoản HomeCare
        </h3>
        <p style={{ margin: "4px 0 0 0", color: "#bfdbfe", fontSize: "12px" }}>
          Hoàn thành cấu hình thông tin ban đầu để sẵn sàng nhận và đọc kết quả ca bệnh
        </p>
      </div>

      <Row style={{ minHeight: "460px" }}>
        {/* Left column: Steps tracker */}
        <Col span={7} style={{ background: "#f8fafc", padding: "24px 16px", borderRight: "1px solid #e2e8f0" }}>
          <Steps
            direction="vertical"
            current={current}
            size="small"
            items={steps.map((s) => ({ title: s.title }))}
          />
        </Col>

        {/* Right column: Form Content */}
        <Col span={17} style={{ padding: "24px 32px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #f1f5f9", paddingBottom: 8, marginBottom: 16 }}>
              <h3 style={{ color: "#1e3a8a", margin: 0, fontSize: "14px", fontWeight: "600" }}>
                {steps[current].title}
              </h3>
              {current === 2 && printTemplates.length > 0 && !createTemplateMode && (
                <Button
                  icon={<PlusOutlined />}
                  type="primary"
                  ghost
                  size="small"
                  onClick={() => setCreateTemplateMode(true)}
                  style={{ borderRadius: 4 }}
                >
                  Tạo mới mẫu in
                </Button>
              )}
            </div>
            <Form form={form} layout="vertical">
              {steps[current].content}
            </Form>
          </div>

          {/* Footer buttons */}
          <div style={{ marginTop: 24, textAlign: "right", borderTop: "1px solid #f1f5f9", paddingTop: 16 }}>
            {current > 0 && current < steps.length - 1 && (
              <Button style={{ marginRight: 8, borderRadius: 6 }} onClick={prev}>
                Quay lại
              </Button>
            )}
            {current < steps.length - 1 && (
              <Button
                type="primary"
                onClick={next}
                disabled={current === 4 && usableCount === 0}
                loading={loadingTemplate}
                style={{ borderRadius: 6 }}
              >
                Tiếp tục
              </Button>
            )}
            {current === steps.length - 1 && (
              <Button type="primary" onClick={onClose} style={{ borderRadius: 6 }}>
                Bắt đầu sử dụng
              </Button>
            )}
          </div>
        </Col>
      </Row>
    </Modal>
  );
};

export default OnboardingWizard;
