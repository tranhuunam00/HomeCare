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
import {
  UploadOutlined,
  LogoutOutlined,
  PlusOutlined,
} from "@ant-design/icons";
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
            <Row gutter={16}>
              <Col span={10}>
                <Form.Item label="Họ và tên" name="fullName">
                  <Input placeholder="Nguyễn Văn A" />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item label="Ngày sinh" name="dob">
                  <DatePicker />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item label="Giới tính" name="gender">
                  <Select placeholder="Chọn giới tính">
                    <Option value="Nam">Nam</Option>
                    <Option value="Nữ">Nữ</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Email" name="email">
                  <Input placeholder="example@gmail.com" />
                </Form.Item>
              </Col>
              <Col>
                <Form.Item label="Số điện thoại" name="phone">
                  <Input placeholder="0912345678" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={4}>
                <Form.Item label="Quốc tịch" name="nation">
                  <Select defaultValue="Việt Nam">
                    <Option value="Việt Nam">Việt Nam</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item label="Tỉnh/Thành phố" name="city">
                  <Select>
                    <Option value="Hà Nội">Hà Nội</Option>
                    <Option value="HCM">Hồ Chí Minh</Option>
                  </Select>
                </Form.Item>
              </Col>

              <Col span={6}>
                <Form.Item label="Quận/Huyện" name="city">
                  <Select>
                    <Option value="Hà Nội">Hà Nội</Option>
                    <Option value="HCM">Hồ Chí Minh</Option>
                  </Select>
                </Form.Item>
              </Col>

              <Col span={6}>
                <Form.Item label="Xã/Phường" name="city">
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
            <Row gutter={16}>
              <Col span={4}>
                <Form.Item label="Mã số CCHN" name="nation">
                  <Select defaultValue="Việt Nam">
                    <Option value="Việt Nam">Việt Nam</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Nơi cấp CCHN" name="city">
                  <Select>
                    <Option value="Hà Nội">Hà Nội</Option>
                    <Option value="HCM">Hồ Chí Minh</Option>
                  </Select>
                </Form.Item>
              </Col>

              <Col span={6}>
                <Form.Item label="Năm cấp CCHN" name="city">
                  <Select>
                    <Option value="Hà Nội">Hà Nội</Option>
                    <Option value="HCM">Hồ Chí Minh</Option>
                  </Select>
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item label="Phạm vi chứng chỉ hành nghề" name="city">
                  <Select>
                    <Option value="Hà Nội">Hà Nội</Option>
                    <Option value="HCM">Hồ Chí Minh</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
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
          Kinh Nghiệm Làm Việc
        </Title>
        <Form.Item label="Lý lịch khoa học (CV)">
          <Row gutter={16} align="middle">
            <Col>
              <Link href="#">ly-lich-khoa-hoc.pdf</Link>
            </Col>
            <Col>
              <Upload beforeUpload={() => false} showUploadList={false}>
                <Button icon={<UploadOutlined />}>Tải lên lý lịch</Button>
              </Upload>
            </Col>
          </Row>
        </Form.Item>
        <Row gutter={16}>
          <Col span={4}>
            <Form.Item label="Học hàm" name="rank">
              <Select>
                <Option value="Giáo sư">Giáo sư</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={4}>
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
            <Form.Item label="Chuyên sâu" name="workplace">
              <Input />
            </Form.Item>
          </Col>
        </Row>
        <Title level={4} className={styles.sectionTitle}>
          Chi tiết quá trình làm việc
        </Title>
        <Form.List name="workExperiences">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <div
                  key={key}
                  style={{
                    marginBottom: 16,
                    padding: 12,
                    border: "1px solid #f0f0f0",
                    borderRadius: 4,
                  }}
                >
                  <Row gutter={16}>
                    <Col span={4}>
                      <Form.Item
                        {...restField}
                        name={[name, "from"]}
                        label="Từ"
                        rules={[
                          { required: true, message: "Nhập năm bắt đầu" },
                        ]}
                      >
                        <Input placeholder="2005" />
                      </Form.Item>
                    </Col>
                    <Col span={4}>
                      <Form.Item
                        {...restField}
                        name={[name, "to"]}
                        label="Đến"
                        rules={[
                          { required: true, message: "Nhập năm kết thúc" },
                        ]}
                      >
                        <Input placeholder="Nay" />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        {...restField}
                        name={[name, "position"]}
                        label="Chức vụ"
                        rules={[{ required: true, message: "Nhập chức vụ" }]}
                      >
                        <Input placeholder="Bác sĩ chuyên khoa" />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row>
                    <Col span={24}>
                      <Form.Item
                        {...restField}
                        name={[name, "workplace"]}
                        rules={[
                          { required: true, message: "Nhập nơi làm việc" },
                        ]}
                      >
                        <Input placeholder="Viện tim thành phố Hà Nội" />
                      </Form.Item>
                    </Col>
                  </Row>
                </div>
              ))}
              <Form.Item>
                <Button
                  type="dashed"
                  onClick={() => add()}
                  block
                  icon={<PlusOutlined />}
                >
                  Thêm quá trình làm việc
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>
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
