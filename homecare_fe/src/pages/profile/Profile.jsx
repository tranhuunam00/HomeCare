// src/pages/doctors/Profile.jsx
import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  DatePicker,
  Select,
  Button,
  Avatar,
  Upload,
  Row,
  Col,
  Typography,
  Tooltip,
  Spin,
} from "antd";
import { UploadOutlined, EditOutlined } from "@ant-design/icons";
import { useParams } from "react-router-dom";
import styles from "./Profile.module.scss";
import API_CALL from "../../services/axiosClient";
import useToast from "../../hooks/useToast";
import dayjs from "dayjs";
import storage from "../../services/storage";
import { useGlobalAuth } from "../../contexts/AuthContext";
import { ACADEMIC_TITLES, DEGREES } from "../../constant/app";

const { Option } = Select;
const { Title, Text } = Typography;

export const E_SIGNATURE_TYPES = {
  NONE: "none",
  SMARTCA: "smartca",
};

export const E_SIGNATURE_OPTIONS = [
  {
    value: E_SIGNATURE_TYPES.NONE,
    label: "Không set",
  },
  {
    value: E_SIGNATURE_TYPES.SMARTCA,
    label: "SmartCa VNPT",
  },
];

const Profile = () => {
  const { idDoctor } = useParams();
  const [form] = Form.useForm();
  const [isEditing, setIsEditing] = useState(false);
  const [signatureUrl, setSignatureUrl] = useState();
  const [avatarUrl, setAvatarUrl] = useState();
  const [avatarFile, setAvatarFile] = useState(null);
  const [signatureFile, setSignatureFile] = useState(null);
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user, doctor } = useGlobalAuth();
  const { showSuccess, showError } = useToast();
  const eSignatureType = Form.useWatch("e_signature_url", form);

  const realId = idDoctor || doctor?.id;

  const fetchDoctorSignInfo = async () => {
    try {
      const res = await API_CALL.get("/doctor-sign/info");
      const signInfo = res.data?.data;

      if (!signInfo) return;

      // Ví dụ response
      // {
      //   type: "smartca",
      //   username: "abc123",
      //   status: "ACTIVE"
      // }

      form.setFieldsValue({
        e_signature_url: signInfo.partnerName || "none",
        smartca_username: signInfo.username,
        smartca_password: signInfo.password,
      });
    } catch (error) {
      console.error("Lỗi lấy thông tin chữ ký:", error);
    }
  };

  useEffect(() => {
    if (realId) {
      fetchDoctorById(realId);
      fetchDoctorSignInfo(); // ✅ call chữ ký
    }
  }, [realId]);

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

  const fetchDoctorById = async (id) => {
    try {
      setLoading(true);
      const res = await API_CALL.get(`/doctor/${id}`);
      const data = res.data.data;

      console.log("data?.avatar_url", data?.avatar_url);
      setAvatarUrl(data?.avatar_url);
      setSignatureUrl(data.signature_url);
      form.setFieldsValue({
        ...data,
        dob: data.dob ? dayjs(data.dob, "YYYY-MM-DD") : null,
        email: data.id_user_user.email,
        academic_title: data.academic_title,
        degree: data.degree,
      });
    } catch (err) {
      console.error("Lỗi khi lấy thông tin bác sĩ theo ID:", err);
      showError("Không thể lấy dữ liệu bác sĩ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClinics();
  }, []);

  const handleSignaturePreview = (file) => {
    const previewUrl = URL.createObjectURL(file);
    setSignatureUrl(previewUrl);
    setSignatureFile(file);
    return false;
  };

  const handleAvatarPreview = (file) => {
    setAvatarFile(file);
    setAvatarUrl(URL.createObjectURL(file));
    return false;
  };

  const onFinish = async (values) => {
    try {
      setLoading(true);

      if (values.e_signature_url === E_SIGNATURE_TYPES.NONE) {
        await API_CALL.get("/doctor-sign/delete");
      }

      if (values.e_signature_url !== E_SIGNATURE_TYPES.NONE) {
        await API_CALL.post("/doctor-sign/apply-sign", {
          username: values.smartca_username,
          password: values.smartca_password,
          partnerName: values.e_signature_url,
        });
      }

      const formData = new FormData();
      formData.append("full_name", values.full_name);
      formData.append("phone_number", values.phone_number);
      formData.append("description", values.description);
      formData.append("id_clinic", values.id_clinic);
      formData.append("gender", values.gender);
      formData.append("e_signature_url", values.e_signature_url);
      formData.append("academic_title", values.academic_title || "");
      formData.append("degree", values.degree || "");
      formData.append(
        "dob",
        values.dob ? dayjs(values.dob).format("YYYY-MM-DD") : null
      );

      if (avatarFile) formData.append("avatar", avatarFile);
      if (signatureFile) formData.append("signature", signatureFile);

      await API_CALL.put(`/doctor/${realId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      showSuccess("Cập nhật thông tin & chữ ký thành công");
      setIsEditing(false);
    } catch (error) {
      console.error("Update error:", error);
      showError(error?.response?.data?.message || "Cập nhật thất bại");
    } finally {
      setLoading(false);
    }
  };

  const editableFields = [
    "e_signature_url",
    "phone_number",
    "gender",
    "full_name",
    "dob",
  ];
  const renderItem = (label, name, children) => (
    <Form.Item label={label} name={name}>
      {isEditing && editableFields.includes(name) ? (
        children
      ) : (
        <Text>
          {(() => {
            const value = form.getFieldValue(name);
            if (name === "dob" && value)
              return dayjs(value).format("DD-MM-YYYY");
            return value || "-";
          })()}
        </Text>
      )}
    </Form.Item>
  );

  return (
    <div className={styles.profileContainer}>
      <Spin spinning={loading}>
        <div className={styles.profileTitleWrapper}>
          <Title level={3} className={styles.profileTitle}>
            Thông Tin Cá Nhân
          </Title>
          <Tooltip
            title={isEditing ? "Chuyển sang chế độ xem" : "Chỉnh sửa thông tin"}
          >
            <EditOutlined
              onClick={() => setIsEditing(!isEditing)}
              style={{ fontSize: 18, marginLeft: 12, cursor: "pointer" }}
            />
          </Tooltip>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          className={styles.boldLabel}
        >
          <Row gutter={24}>
            <Col span={18}>
              <Row gutter={16}>
                <Col span={10}>
                  <Form.Item
                    label="Họ và tên"
                    name="full_name"
                    rules={[
                      { required: true, message: "Vui lòng nhập họ và tên" },
                    ]}
                  >
                    {isEditing && editableFields.includes("full_name") ? (
                      <Input placeholder="Nguyễn Văn A" />
                    ) : (
                      <Text>{form.getFieldValue("full_name") || "-"}</Text>
                    )}
                  </Form.Item>
                </Col>
                <Col span={4}>
                  <Form.Item
                    label="Ngày sinh"
                    name="dob"
                    rules={[
                      { required: true, message: "Vui lòng chọn ngày sinh" },
                    ]}
                  >
                    {isEditing && editableFields.includes("dob") ? (
                      <DatePicker
                        style={{ width: "100%" }}
                        format="DD-MM-YYYY"
                        placeholder="Chọn ngày"
                      />
                    ) : (
                      <Text>
                        {form.getFieldValue("dob")
                          ? dayjs(form.getFieldValue("dob")).format(
                              "DD-MM-YYYY"
                            )
                          : "-"}
                      </Text>
                    )}
                  </Form.Item>
                </Col>
                <Col span={4}>
                  <Form.Item
                    label="Giới tính"
                    name="gender"
                    rules={[
                      { required: true, message: "Vui lòng chọn giới tính" },
                    ]}
                  >
                    {isEditing && editableFields.includes("gender") ? (
                      <Select placeholder="Chọn giới tính">
                        <Option value="Nam">Nam</Option>
                        <Option value="Nữ">Nữ</Option>
                      </Select>
                    ) : (
                      <Text>{form.getFieldValue("gender") || "-"}</Text>
                    )}
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="Email"
                    name="email"
                    rules={[
                      {
                        required: true,
                        type: "email",
                        message: "Vui lòng nhập email hợp lệ",
                      },
                    ]}
                  >
                    {isEditing ? (
                      <Input placeholder="abc@gmail.com" />
                    ) : (
                      <Text>
                        {form.getFieldValue("email") || "Chưa có email"}
                      </Text>
                    )}
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Số điện thoại"
                    name="phone_number"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập số điện thoại",
                      },
                    ]}
                  >
                    {isEditing ? (
                      <Input placeholder="0912345678" />
                    ) : (
                      <Text>{form.getFieldValue("phone_number") || "-"}</Text>
                    )}
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Học hàm" name="academic_title">
                    {isEditing ? (
                      <Select placeholder="Chọn học hàm">
                        {ACADEMIC_TITLES.map((item) => (
                          <Option key={item.value} value={item.value}>
                            {item.label}
                          </Option>
                        ))}
                      </Select>
                    ) : (
                      <Text>
                        {ACADEMIC_TITLES.find(
                          (item) =>
                            item.value === form.getFieldValue("academic_title")
                        )?.label || "-"}
                      </Text>
                    )}
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item label="Học vị" name="degree">
                    {isEditing ? (
                      <Select placeholder="Chọn học vị">
                        {DEGREES.map((item) => (
                          <Option key={item.value} value={item.value}>
                            {item.label}
                          </Option>
                        ))}
                      </Select>
                    ) : (
                      <Text>
                        {DEGREES.find(
                          (item) => item.value === form.getFieldValue("degree")
                        )?.label || "-"}
                      </Text>
                    )}
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item label="Lý lịch khoa học" name="description">
                {isEditing ? (
                  <Input.TextArea />
                ) : (
                  <Text>{form.getFieldValue("description")}</Text>
                )}
              </Form.Item>
              <Form.Item
                rules={[
                  { required: true, message: "Vui lòng chọn phòng khám" },
                ]}
                label="Phòng khám"
                name="id_clinic"
              >
                <Select placeholder="Chọn phòng khám" disabled={!isEditing}>
                  {clinics.map((clinic) => (
                    <Option key={clinic.id} value={clinic.id}>
                      {clinic.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Col span={6} className={styles.signatureSection}>
                <Form.Item
                  label="Chữ ký"
                  name="signature"
                  rules={[
                    {
                      validator: (_, value) => {
                        if (signatureUrl || value) {
                          return Promise.resolve();
                        }
                        return Promise.reject("Vui lòng tải chữ ký");
                      },
                    },
                  ]}
                >
                  <>
                    <img
                      src={signatureUrl || "http://suneditor.com/docs/cat.jpg"}
                      alt="Chữ ký"
                      className={styles.signature}
                    />
                    <Upload
                      accept=".jpg,.jpeg,.png"
                      showUploadList={false}
                      beforeUpload={handleSignaturePreview}
                      disabled={!isEditing}
                    >
                      <Button icon={<UploadOutlined />} disabled={!isEditing}>
                        Đổi chữ ký
                      </Button>
                    </Upload>
                  </>
                </Form.Item>
              </Col>
            </Col>
            <Col span={6} className={styles.avatarSection}>
              <Form.Item
                label="Ảnh đại diện"
                name="avatar"
                rules={[
                  {
                    validator: (_, value) => {
                      if (avatarUrl || value) {
                        return Promise.resolve();
                      }
                      return Promise.reject("Vui lòng tải ảnh đại diện");
                    },
                  },
                ]}
              >
                <>
                  <Avatar
                    size={120}
                    src={avatarUrl ?? "https://i.pravatar.cc/300"}
                    className={styles.avatar}
                  />
                  <Upload
                    accept=".jpg,.jpeg,.png"
                    showUploadList={false}
                    beforeUpload={handleAvatarPreview}
                    disabled={!isEditing}
                  >
                    <Button icon={<UploadOutlined />} disabled={!isEditing}>
                      Đổi Ảnh Đại Diện
                    </Button>
                  </Upload>
                </>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            label="Chữ ký điện tử"
            name="e_signature_url"
            rules={[
              { required: true, message: "Vui lòng chọn chữ ký điện tử" },
            ]}
          >
            {isEditing ? (
              <Select placeholder="Chọn loại chữ ký">
                {E_SIGNATURE_OPTIONS.map((item) => (
                  <Option key={item.value} value={item.value}>
                    {item.label}
                  </Option>
                ))}
              </Select>
            ) : (
              <Text>
                {E_SIGNATURE_OPTIONS.find(
                  (item) => item.value === form.getFieldValue("e_signature_url")
                )?.label || "Không set"}
              </Text>
            )}
          </Form.Item>

          {eSignatureType === "smartca" && (
            <Row gutter={16}>
              <Col span={6}>
                <Form.Item
                  label="SmartCA Username"
                  name="smartca_username"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng nhập username SmartCA",
                    },
                  ]}
                >
                  <Input
                    disabled={!isEditing}
                    placeholder="Nhập username SmartCA"
                  />
                </Form.Item>
              </Col>

              <Col span={6}>
                <Form.Item
                  label="SmartCA Password"
                  name="smartca_password"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng nhập password SmartCA",
                    },
                  ]}
                >
                  <Input.Password
                    disabled={!isEditing}
                    placeholder="Nhập password SmartCA"
                  />
                </Form.Item>
              </Col>
            </Row>
          )}

          <Row justify="space-between" style={{ marginTop: 24 }}>
            <Col>
              {isEditing && (
                <Button type="primary" htmlType="submit">
                  Lưu thay đổi
                </Button>
              )}
            </Col>
          </Row>
        </Form>
      </Spin>
    </div>
  );
};

export default Profile;
