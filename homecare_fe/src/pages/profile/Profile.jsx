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

const { Option } = Select;
const { Title, Text } = Typography;

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

  const realId = idDoctor || doctor?.id;

  useEffect(() => {
    if (realId) {
      fetchDoctorById(realId);
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
      setAvatarUrl(data.avatar_url);
      setSignatureUrl(data.signature_url);
      form.setFieldsValue({
        ...data,
        dob: data.dob ? dayjs(data.dob, "YYYY-MM-DD") : null,
        email: data.id_user_user.email,
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
    const formData = new FormData();
    formData.append("full_name", values.full_name);
    formData.append("phone_number", values.phone_number);
    formData.append("description", values.description);
    formData.append("id_clinic", values.id_clinic);
    formData.append("gender", values.gender);
    formData.append(
      "dob",
      values.dob ? dayjs(values.dob).format("YYYY-MM-DD") : null
    );
    if (avatarFile) formData.append("avatar", avatarFile);
    if (signatureFile) formData.append("signature", signatureFile);

    try {
      await API_CALL.put(`/doctor/${realId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      showSuccess("Cập nhật thành công");
      setIsEditing(false);
    } catch (error) {
      console.error("Update error:", error);
      showError("Cập nhật thất bại:  " + error?.response?.data?.message);
    }
  };

  const editableFields = ["phone_number", "gender", "full_name", "dob"];
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
                  {renderItem(
                    "Họ và tên",
                    "full_name",
                    <Input placeholder="Nguyễn Văn A" />
                  )}
                </Col>
                <Col span={4}>
                  {renderItem(
                    "Ngày sinh",
                    "dob",
                    <DatePicker
                      style={{ width: "100%" }}
                      format="DD-MM-YYYY"
                      placeholder="Chọn ngày"
                    />
                  )}
                </Col>
                <Col span={4}>
                  {renderItem(
                    "Giới tính",
                    "gender",
                    <Select placeholder="Chọn giới tính">
                      <Option value="Nam">Nam</Option>
                      <Option value="Nữ">Nữ</Option>
                    </Select>
                  )}
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Email" name="email">
                    <Text>
                      {form.getFieldValue("email") || "Chưa có email"}
                    </Text>
                  </Form.Item>
                </Col>
                <Col>
                  {renderItem(
                    "Số điện thoại",
                    "phone_number",
                    <Input placeholder="0912345678" />
                  )}
                </Col>
              </Row>
              <Form.Item label="Mô tả" name="description">
                {isEditing ? (
                  <Input.TextArea />
                ) : (
                  <Text>{form.getFieldValue("description")}</Text>
                )}
              </Form.Item>
              <Form.Item label="Phòng khám" name="id_clinic">
                <Select placeholder="Chọn phòng khám" disabled={!isEditing}>
                  {clinics.map((clinic) => (
                    <Option key={clinic.id} value={clinic.id}>
                      {clinic.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Col span={6} className={styles.signatureSection}>
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
              </Col>
            </Col>
            <Col span={6} className={styles.avatarSection}>
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
            </Col>
          </Row>
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
