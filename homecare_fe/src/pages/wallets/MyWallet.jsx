// MyWallet.jsx
import React from "react";
import { Card, Input, Row, Col, Checkbox, Typography, Button } from "antd";
import { QrcodeOutlined } from "@ant-design/icons";
import styles from "./MyWallet.module.scss";

const { Title, Text } = Typography;

const MyWallet = () => {
  return (
    <div className={styles["wallet-container"]}>
      <Title level={4}>Ví của tôi</Title>
      <Card className={styles["wallet-card"]}>
        <Row gutter={16}>
          <Col span={10}>
            <div className={styles["wallet-visual"]}>
              <div className={styles["wallet-visual__title"]}>CARD 0100</div>
              <div className={styles["wallet-visual__code"]}>CARD0100</div>
              <div className={styles["wallet-visual__value"]}>
                Giá trị: 115,000,000,000
              </div>
              <div className={styles["wallet-visual__qrcode"]}>
                <QrcodeOutlined style={{ fontSize: 32 }} />
              </div>
            </div>
          </Col>
          <Col span={14}>
            <Row gutter={16}>
              <Col span={12}>
                <Text>Mã thẻ</Text>
                <Input value="CARD0100" disabled />
              </Col>
              <Col span={12}>
                <Text>Tên thẻ</Text>
                <Input value="CARD0100" disabled />
              </Col>
            </Row>
            <Row gutter={16} style={{ marginTop: 12 }}>
              <Col span={8}>
                <Text>Mệnh giá</Text>
                <Input defaultValue="100,000,000" />
              </Col>
              <Col span={8}>
                <Text>Giá trị sử dụng</Text>
                <Input defaultValue="115,000,000,000" />
              </Col>
              <Col span={8}>
                <Text>Hoa hồng tư vấn</Text>
                <Input defaultValue="5" suffix="%" />
              </Col>
            </Row>
            <Text style={{ display: "block", marginTop: 12 }}>Ghi chú</Text>
            <Input.TextArea rows={2} placeholder="eg. ghi chú" />
          </Col>
        </Row>

        <div className={styles["wallet-config"]}>
          <Title level={5}>Cấu hình - Cài đặt bổ sung</Title>
          <div className={styles["wallet-config__checkbox-group"]}>
            <Checkbox>Lần sử dụng</Checkbox>
            <Checkbox>Ngày sử dụng</Checkbox>
            <Checkbox>Thẻ gia đình</Checkbox>
            <Checkbox defaultChecked>Thanh toán để sử dụng</Checkbox>
          </div>
          <Checkbox defaultChecked style={{ marginTop: 16 }}>
            Phạm vi sử dụng:
            <Text type="secondary">Sử dụng cho tất cả dịch vụ</Text>
          </Checkbox>
        </div>

        <div className={styles["wallet-config__footer"]}>
          <Button type="default" style={{ marginRight: 8 }}>
            Đóng
          </Button>
          <Button type="primary">Lưu thay đổi</Button>
        </div>
      </Card>
    </div>
  );
};

export default MyWallet;
