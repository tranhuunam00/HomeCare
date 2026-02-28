import React from "react";
import { Card, Row, Col, Typography, Collapse, Input, Button } from "antd";
import styles from "./UserGuidePage.module.scss";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;
const { Panel } = Collapse;

const guideItems = [
  "Cách tạo mới, chỉnh sửa header mẫu khi in",
  "Cách dịch mẫu kết quả đã đọc từ tiếng Việt sang tiếng Anh",
  "Cách tạo form liên hệ khi có lỗi kỹ thuật hoặc cần hỗ trợ",
  "Cách tạo form liên hệ khi có lỗi kỹ thuật hoặc cần hỗ trợ",
];

const UserGuidePage = () => {
  const navigate = useNavigate();

  const menuItems = [
    { title: "Menu WORKLIST", onClick: () => navigate("/guild/worklist") },
    { title: "Menu Ứng Dụng", onClick: () => navigate("/guild/app") },
    { title: "Menu Gói Đăng Ký" },
    { title: "Menu Quản Lý", onClick: () => navigate("/guild/manage") },
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
        <Collapse accordion>
          {guideItems.map((item, index) => (
            <Panel header={item} key={index}>
              <p>
                Nội dung hướng dẫn chi tiết cho: <strong>{item}</strong>. Bạn có
                thể viết hướng dẫn cụ thể tại đây.
              </p>
            </Panel>
          ))}
        </Collapse>
      </div>
    </div>
  );
};

export default UserGuidePage;
