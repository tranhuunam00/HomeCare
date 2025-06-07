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
} from "antd";
import {
  UploadOutlined,
  LogoutOutlined,
  PlusOutlined,
  EditOutlined,
} from "@ant-design/icons";
import styles from "./Profile.module.scss";

const { Option } = Select;
const { Title, Text, Link } = Typography;

const Profile = ({ idUser, user, doctor }) => {
  const [form] = Form.useForm();
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (doctor) {
      form.setFieldsValue({
        fullName: doctor.full_name,
        phone: doctor.phone_number,
        address: doctor.address,
      });
    }
  }, [doctor, form]);

  const onFinish = (values) => {
    console.log("Submitted:", values);
    setIsEditing(false);
  };

  const editableFields = ["phone", "gender", "fullName", "dob"]; // những fields có thế sửa
  const renderItem = (label, name, children) => (
    <Form.Item label={label} name={name}>
      {isEditing && editableFields.includes(name) ? (
        children
      ) : (
        <Text>{form.getFieldValue(name) || "-"}</Text>
      )}
    </Form.Item>
  );

  return (
    <div className={styles.profileContainer}>
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
                  "fullName",
                  <Input placeholder="Nguyễn Văn A" />
                )}
              </Col>
              <Col span={4}>
                {renderItem(
                  "Ngày sinh",
                  "dob",
                  <DatePicker style={{ width: "100%" }} />
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
                  <Text>{user?.email || "Chưa có email"}</Text>
                </Form.Item>
              </Col>
              <Col>
                {renderItem(
                  "Số điện thoại",
                  "phone",
                  <Input placeholder="0912345678" />
                )}
              </Col>
            </Row>

            <Col span={6} className={styles.signatureSection}>
              <img
                // src={signatureUrl}
                alt="Chữ ký"
                className={styles.signature}
              />
              <Upload
                showUploadList={false}
                // beforeUpload={handleSignatureUpload}
                disabled={!isEditing}
              >
                <Button icon={<UploadOutlined />} disabled={!isEditing}>
                  Đổi chữ ký
                </Button>
              </Upload>
            </Col>

            <Row gutter={16}>
              <Col span={4}>
                {renderItem(
                  "Quốc tịch",
                  "nation",
                  <Select defaultValue="Việt Nam">
                    <Option value="Việt Nam">Việt Nam</Option>
                  </Select>
                )}
              </Col>
              <Col span={6}>
                {renderItem(
                  "Tỉnh/Thành phố",
                  "city",
                  <Select>
                    <Option value="Hà Nội">Hà Nội</Option>
                    <Option value="HCM">Hồ Chí Minh</Option>
                  </Select>
                )}
              </Col>
              <Col span={6}>
                {renderItem(
                  "Quận/Huyện",
                  "district",
                  <Select>
                    <Option value="Ba Đình">Ba Đình</Option>
                  </Select>
                )}
              </Col>
              <Col span={6}>
                {renderItem(
                  "Xã/Phường",
                  "ward",
                  <Select>
                    <Option value="Phúc Xá">Phúc Xá</Option>
                  </Select>
                )}
              </Col>
            </Row>

            {renderItem(
              "Địa chỉ",
              "address",
              <Input placeholder="Số 22, đường 3/2..." />
            )}

            <Row gutter={16}>
              <Col span={4}>
                {renderItem("Mã số CCHN", "cchnCode", <Input />)}
              </Col>
              <Col span={12}>
                {renderItem(
                  "Nơi cấp CCHN",
                  "cchnPlace",
                  <Select>
                    <Option value="Hà Nội">Hà Nội</Option>
                    <Option value="HCM">Hồ Chí Minh</Option>
                  </Select>
                )}
              </Col>
              <Col span={6}>
                {renderItem(
                  "Năm cấp CCHN",
                  "cchnYear",
                  <Select>
                    <Option value="2020">2020</Option>
                  </Select>
                )}
              </Col>
              <Col span={12}>
                {renderItem(
                  "Phạm vi chứng chỉ hành nghề",
                  "cchnScope",
                  <Select>
                    <Option value="Toàn quốc">Toàn quốc</Option>
                  </Select>
                )}
              </Col>
            </Row>
          </Col>

          <Col span={6} className={styles.avatarSection}>
            <Avatar
              size={120}
              src="https://i.pravatar.cc/300"
              className={styles.avatar}
            />
            <Upload showUploadList={false} disabled={!isEditing}>
              <Button icon={<UploadOutlined />} disabled={!isEditing}>
                Đổi Ảnh Đại Diện
              </Button>
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
              <Upload
                beforeUpload={() => false}
                showUploadList={false}
                disabled={!isEditing}
              >
                <Button icon={<UploadOutlined />} disabled={!isEditing}>
                  Tải lên lý lịch
                </Button>
              </Upload>
            </Col>
          </Row>
        </Form.Item>

        <Row gutter={16}>
          <Col span={4}>
            {renderItem(
              "Học hàm",
              "rank",
              <Select>
                <Option value="Giáo sư">Giáo sư</Option>
              </Select>
            )}
          </Col>
          <Col span={4}>
            {renderItem(
              "Học vị",
              "degree",
              <Select>
                <Option value="Tiến sĩ">Tiến sĩ</Option>
              </Select>
            )}
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            {renderItem(
              "Chuyên khoa",
              "specialty",
              <Select>
                <Option value="Tim mạch">Tim mạch</Option>
              </Select>
            )}
          </Col>
          <Col span={8}>
            {renderItem("Chuyên sâu", "subspecialty", <Input />)}
          </Col>
        </Row>

        <Title level={4} className={styles.sectionTitle}>
          Chi tiết quá trình làm việc
        </Title>

        <Form.List name="workExperiences">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <div key={key} className={styles.workExperienceItem}>
                  <Row gutter={16}>
                    <Col span={4}>
                      <Form.Item
                        {...restField}
                        name={[name, "from"]}
                        label="Từ"
                      >
                        {isEditing ? (
                          <Input />
                        ) : (
                          <Text>
                            {form.getFieldValue([
                              "workExperiences",
                              name,
                              "from",
                            ])}
                          </Text>
                        )}
                      </Form.Item>
                    </Col>
                    <Col span={4}>
                      <Form.Item {...restField} name={[name, "to"]} label="Đến">
                        {isEditing ? (
                          <Input />
                        ) : (
                          <Text>
                            {form.getFieldValue([
                              "workExperiences",
                              name,
                              "to",
                            ])}
                          </Text>
                        )}
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        {...restField}
                        name={[name, "position"]}
                        label="Chức vụ"
                      >
                        {isEditing ? (
                          <Input />
                        ) : (
                          <Text>
                            {form.getFieldValue([
                              "workExperiences",
                              name,
                              "position",
                            ])}
                          </Text>
                        )}
                      </Form.Item>
                    </Col>
                  </Row>
                  <Form.Item {...restField} name={[name, "workplace"]}>
                    {isEditing ? (
                      <Input />
                    ) : (
                      <Text>
                        {form.getFieldValue([
                          "workExperiences",
                          name,
                          "workplace",
                        ])}
                      </Text>
                    )}
                  </Form.Item>
                </div>
              ))}
              {isEditing && (
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
              )}
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
            {isEditing && (
              <Button type="primary" htmlType="submit">
                Lưu thay đổi
              </Button>
            )}
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default Profile;
