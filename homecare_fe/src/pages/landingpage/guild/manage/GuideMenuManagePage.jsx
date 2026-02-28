import React from "react";
import { Card, Row, Col, Typography, Divider, Button } from "antd";
import styles from "../UserGuidePage.module.scss";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const { Title, Paragraph } = Typography;

const GuideMenuManagePage = () => {
  const navigate = useNavigate();

  const subMenus = [
    {
      title: "Mẫu in kết quả",
      onClick: () => navigate("/guild/manage/print-template"),
    },
    {
      title: "Phòng khám",
      onClick: () => navigate("/guild/manage/clinic"),
    },
    {
      title: "Dịch vụ khám",
      onClick: () => navigate("/guild/manage/service"),
    },
    {
      title: "Bác sĩ",
      onClick: () => toast.warn("Chỉ admin mới có quyền"),
    },
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

      <Title level={3}>MENU QUẢN LÝ</Title>

      <Divider />

      <Paragraph>
        Menu <strong>Quản lý</strong> cho phép cấu hình và quản trị hệ thống,
        bao gồm các chức năng quản lý phòng khám, mẫu in, bác sĩ và tích hợp.
      </Paragraph>

      {/* Grid submenu */}
      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        {subMenus.map((item, index) => (
          <Col xs={24} md={12} key={index}>
            <Card onClick={item.onClick} className={styles.menuCard}>
              {item.title}
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default GuideMenuManagePage;
