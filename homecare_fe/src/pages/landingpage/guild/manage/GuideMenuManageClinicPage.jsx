import React from "react";
import { Typography, Divider, Collapse, Tag, Button } from "antd";
import styles from "../GuideDetail.module.scss";
import { useNavigate } from "react-router-dom";

const { Title, Paragraph } = Typography;
const { Panel } = Collapse;

const GuideMenuManagerClinicPage = () => {
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

      <Title level={3}>MENU PHÒNG KHÁM</Title>

      <Divider />

      <Title level={4} style={{ color: "#cf1322" }}>
        Thông tin chức năng
      </Title>

      <Paragraph>
        Menu <strong>Phòng khám</strong> cho phép người dùng quản lý danh sách
        cơ sở y tế trong hệ thống D-RADS.
      </Paragraph>

      <ul>
        <li>Xem danh sách phòng khám</li>
        <li>Thêm mới cơ sở</li>
        <li>Chỉnh sửa thông tin</li>
        <li>Tìm kiếm theo tên hoặc số điện thoại</li>
        <li>Phân trang dữ liệu</li>
      </ul>

      <Divider />

      <Title level={4}>Thêm cơ sở mới</Title>

      <Paragraph>
        Khi nhấn nút <Tag color="blue">Thêm mới</Tag>, hệ thống sẽ hiển thị
        popup nhập thông tin gồm:
      </Paragraph>

      <ul>
        <li>
          <strong>Tên cơ sở</strong> (bắt buộc)
        </li>
        <li>
          <strong>Số điện thoại</strong>
        </li>
        <li>
          <strong>Địa chỉ</strong>
        </li>
      </ul>

      <Paragraph>
        Sau khi nhập đầy đủ thông tin, nhấn <Tag color="green">Thêm</Tag> để lưu
        dữ liệu.
      </Paragraph>

      <Divider />

      <Title level={4}>Giao diện quản lý phòng khám</Title>

      <img
        src="/guild/guildclinic.png"
        alt="phong-kham"
        className={styles.image}
      />

      <Paragraph>Danh sách hiển thị các cột:</Paragraph>

      <ul>
        <li>ID</li>
        <li>Tên cơ sở</li>
        <li>Số điện thoại</li>
        <li>Địa chỉ</li>
        <li>Hành động (Chỉnh sửa)</li>
      </ul>

      <Divider />

      <Title level={4}>❓ Câu hỏi thường gặp</Title>

      <Collapse accordion>
        <Panel header="Có thể xóa phòng khám không?" key="1">
          <p>
            Hiện tại hệ thống chỉ hỗ trợ chỉnh sửa thông tin. Chức năng xóa sẽ
            được cập nhật trong phiên bản tiếp theo nếu được phân quyền.
          </p>
        </Panel>

        <Panel header="Ai có quyền thêm phòng khám?" key="2">
          <p>Bất cứ ai cũng có thể thêm phòng khám</p>
        </Panel>

        <Panel header="Có giới hạn số lượng phòng khám không?" key="3">
          <p>
            Số lượng phòng khám phụ thuộc vào gói đăng ký của người dùng (BASIC
            / PRO / HOSPITAL).
          </p>
        </Panel>
      </Collapse>
    </div>
  );
};

export default GuideMenuManagerClinicPage;
