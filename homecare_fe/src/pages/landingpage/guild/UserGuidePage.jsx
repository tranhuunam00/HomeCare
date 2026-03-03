import React from "react";
import { Card, Row, Col, Typography, Collapse, Input, Button } from "antd";
import styles from "./UserGuidePage.module.scss";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;
const { Panel } = Collapse;

const guideItems = [
  "Cách dịch mẫu kết quả đã đọc từ tiếng Việt sang tiếng Anh",
  "Cách tạo form liên hệ khi có lỗi kỹ thuật hoặc cần hỗ trợ",
  "Cách tạo form liên hệ khi có lỗi kỹ thuật hoặc cần hỗ trợ",
];

const UserGuidePage = () => {
  const navigate = useNavigate();

  const menuItems = [
    { title: "Menu WORKLIST", onClick: () => navigate("/guild/worklist") },
    { title: "Menu Ứng Dụng", onClick: () => navigate("/guild/app") },
    {
      title: "Menu Gói Đăng Ký",
      onClick: () => navigate("/guild/subscription"),
    },
    { title: "Menu Quản Lý", onClick: () => navigate("/guild/manage") },
    { title: "Menu Đọc Kết Quả", onClick: () => navigate("/guild/report") },
  ];

  return (
    <div className={styles.container}>
      <Button
        type="link"
        onClick={() => navigate(-1)}
        style={{ padding: 0, marginBottom: 8 }}
      >
        ← Quay lại
      </Button>
      <Title level={3} className={styles.title}>
        1. Hướng dẫn sử dụng
      </Title>

      {/* Grid Menu */}
      <Row gutter={[24, 24]}>
        {menuItems.map((item, index) => (
          <Col xs={24} md={12} key={index}>
            <Card onClick={item.onClick} className={styles.menuCard}>
              {item.title}
            </Card>
          </Col>
        ))}
      </Row>

      {/* Collapse hướng dẫn chi tiết */}
      <div className={styles.collapseSection}>
        <Collapse
          accordion
          items={[
            {
              key: "1",
              label:
                "Cách dịch mẫu kết quả đã đọc từ tiếng Việt sang tiếng Anh",
              children: (
                <div>
                  <p>
                    <strong>Bước 1:</strong> Vào menu Đọc Kết Quả.
                  </p>
                  <p>
                    <strong>Bước 2:</strong> Chọn mẫu kết quả cần dịch.
                  </p>
                  <p>
                    <strong>Bước 3:</strong> Nhấn nút "Dịch sang tiếng Anh".
                  </p>
                  <p>
                    <strong>Bước 4:</strong> Kiểm tra lại nội dung và lưu.
                  </p>
                </div>
              ),
            },
            {
              key: "2",
              label:
                "Cách tạo form liên hệ khi có lỗi kỹ thuật hoặc cần hỗ trợ",
              children: (
                <div>
                  <p>
                    <strong>Bước 1:</strong> Về trang chủ.
                  </p>
                  <p>
                    <strong>Bước 2:</strong> Chọn mục Liên hệ hỗ trợ.
                  </p>
                  <p>
                    <strong>Bước 3:</strong> Điền đầy đủ thông tin và mô tả lỗi.
                  </p>
                  <p>
                    <strong>Bước 4:</strong> Nhấn Gửi yêu cầu.
                  </p>
                </div>
              ),
            },
            {
              key: "3",
              label: "Cách chỉnh sửa thông tin cá nhân, chữ ký",
              children: (
                <div>
                  <p>
                    <strong>Bước 1:</strong> Ấn vào Avatar.
                  </p>
                  <p>
                    <strong>Bước 2:</strong> Chọn Hồ sơ cá nhân.
                  </p>
                  <p>
                    <strong>Bước 3:</strong> Cập nhật thông tin cần chỉnh sửa.
                  </p>
                  <p>
                    <strong>Bước 4:</strong> Nhấn Lưu thay đổi.
                  </p>
                </div>
              ),
            },
          ]}
        />
      </div>
    </div>
  );
};

export default UserGuidePage;
