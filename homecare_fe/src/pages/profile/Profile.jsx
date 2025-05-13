// src/pages/Profile.jsx
import React from "react";
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
} from "antd";
import { UploadOutlined, LogoutOutlined } from "@ant-design/icons";
import styles from "./Profile.module.scss";

const { Option } = Select;
const { Title, Link } = Typography;

const Profile = () => {
  const [form] = Form.useForm();

  const onFinish = (values) => {
    console.log("Submitted:", values);
  };

  return (
    <div className={styles.profileContainer}>
      <Title level={3} className={styles.profileTitle}>
        Thông Tin Cá Nhân
      </Title>
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Row gutter={24}>
          <Col span={18}>
            <Form.Item label="Họ và tên" name="fullName">
              <Input placeholder="Nguyễn Văn A" />
            </Form.Item>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Ngày sinh" name="dob">
                  <DatePicker style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Giới tính" name="gender">
                  <Select placeholder="Chọn giới tính">
                    <Option value="Nam">Nam</Option>
                    <Option value="Nữ">Nữ</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Form.Item label="Email" name="email">
              <Input placeholder="example@gmail.com" />
            </Form.Item>
            <Form.Item label="Số điện thoại" name="phone">
              <Input placeholder="0912345678" />
            </Form.Item>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Quốc tịch" name="nation">
                  <Select defaultValue="Việt Nam">
                    <Option value="Việt Nam">Việt Nam</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Tỉnh/Thành phố" name="city">
                  <Select>
                    <Option value="Hà Nội">Hà Nội</Option>
                    <Option value="HCM">Hồ Chí Minh</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Form.Item label="Địa chỉ" name="address">
              <Input placeholder="Số 22, đường 3/2, Gamuda Gardens..." />
            </Form.Item>
          </Col>

          <Col span={6} className={styles.avatarSection}>
            <Avatar
              size={120}
              src="https://i.pravatar.cc/300"
              className={styles.avatar}
            />
            <Upload showUploadList={false}>
              <Button icon={<UploadOutlined />}>Đổi Ảnh Đại Diện</Button>
            </Upload>
          </Col>
        </Row>

        <Title level={4} className={styles.sectionTitle}>
          Thông Tin Tài Khoản
        </Title>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Tên đăng nhập" name="username">
              <Input defaultValue="example123" disabled />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Mật khẩu" name="password">
              <Input.Password placeholder="********" />
            </Form.Item>
          </Col>
        </Row>

        <Title level={4} className={styles.sectionTitle}>
          Kinh Nghiệm Làm Việc
        </Title>
        <Form.Item label="Lý lịch khoa học (CV)">
          <Link href="#">ly-lich-khoa-hoc.pdf</Link>
        </Form.Item>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item label="Học hàm" name="rank">
              <Select>
                <Option value="Giáo sư">Giáo sư</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Học vị" name="degree">
              <Select>
                <Option value="Tiến sĩ">Tiến sĩ</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item label="Chuyên khoa" name="specialty">
              <Select>
                <Option value="Tim mạch">Tim mạch</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Nơi công tác" name="workplace">
              <Input />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Số năm kinh nghiệm" name="experience">
              <Input suffix="năm" />
            </Form.Item>
          </Col>
        </Row>

        <Row justify="space-between" style={{ marginTop: 24 }}>
          <Col>
            <Button danger icon={<LogoutOutlined />}>
              Đăng Xuất
            </Button>
          </Col>
          <Col>
            <Button type="primary" htmlType="submit">
              Cập nhật thông tin
            </Button>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default Profile;
