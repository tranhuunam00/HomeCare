import React from "react";
import { Card, Row, Col, Typography, Button } from "antd";
import { useNavigate } from "react-router-dom";
import styles from "./ApplicationsPage.module.scss";
import { medicalCategories } from "../products";
import { useGlobalAuth } from "../../../contexts/AuthContext";

const { Title } = Typography;

const ApplicationsPage = () => {
  const { user } = useGlobalAuth();
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <Button
        type="link"
        onClick={() => navigate(-1)}
        style={{ padding: 0, marginBottom: 8 }}
      >
        ← Quay lại
      </Button>
      <Title level={3}>ỨNG DỤNG Y KHOA</Title>
      <Button
        type="link"
        onClick={() => navigate("/login")}
        style={{ padding: 0, marginBottom: 8, marginLeft: 10 }}
      >
        Đăng nhập để sử dụng đầy đủ tính năng
      </Button>
      {medicalCategories.map((cat) => (
        <div key={cat.key} className={styles.categorySection}>
          {/* ===== CATEGORY HEADER ===== */}
          <div className={styles.categoryHeader}>
            <div>
              <div className={styles.categoryTitle}>{cat.title}</div>
              <div className={styles.categoryCount}>
                {cat.apps.length} sản phẩm
              </div>
            </div>
          </div>

          {/* ===== LIST APPS ===== */}
          <Row gutter={[16, 16]}>
            {cat.apps.map((app) => (
              <Col xs={24} sm={12} md={8} lg={6} key={app.key}>
                <Card
                  className={styles.appCard}
                  onClick={() =>
                    user?.id ? navigate(app.path) : navigate("/login")
                  }
                >
                  <div className={styles.appContent}>
                    <img
                      src={app.image || "/icons/default.png"}
                      alt={app.label}
                      className={styles.appIcon}
                    />
                    <div className={styles.appLabel}>{app.label}</div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      ))}
    </div>
  );
};

export default ApplicationsPage;
