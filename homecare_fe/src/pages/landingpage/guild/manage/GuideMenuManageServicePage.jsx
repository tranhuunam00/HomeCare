import React from "react";
import { Typography, Divider, Collapse, Tag, Button } from "antd";
import styles from "../GuideDetail.module.scss";
import { useNavigate } from "react-router-dom";

const { Title, Paragraph } = Typography;
const { Panel } = Collapse;

const GuideMenuManagerServicePage = () => {
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

      <Title level={3}>MENU DỊCH VỤ KHÁM</Title>

      <Divider />

      <Title level={4} style={{ color: "#cf1322" }}>
        Thông tin chức năng
      </Title>

      <Paragraph>
        Menu <strong>Dịch vụ khám</strong> cho phép quản lý các dịch vụ và bộ
        phận chuyên môn trong hệ thống D-RADS.
      </Paragraph>

      <ul>
        <li>
          Quản lý danh sách <strong>Phân hệ</strong>
        </li>
        <li>
          Quản lý danh sách <strong>Bộ phận</strong>
        </li>
        <li>Tạo mới, chỉnh sửa, cập nhật trạng thái</li>
        <li>Thiết lập mã code và tên rút gọn</li>
        <li>Phân quyền theo gói sử dụng</li>
      </ul>

      <Divider />

      <Title level={4}>1. Quản lý Phân hệ</Title>

      <Paragraph>
        Phân hệ đại diện cho nhóm chuyên môn lớn (ví dụ: Siêu âm, CT, MRI,
        X-quang…).
      </Paragraph>

      <ul>
        <li>Tên phân hệ</li>
        <li>Tên rút gọn</li>
        <li>Tên tiếng Anh (English)</li>
        <li>Mã code</li>
      </ul>

      <Paragraph>
        Nhấn <Tag color="blue">+ Tạo mới</Tag> để thêm phân hệ mới.
      </Paragraph>

      <img
        src="/guild/guildservice.png"
        alt="phan-he"
        className={styles.image}
      />

      <Divider />

      <Title level={4}>2. Quản lý Bộ phận</Title>

      <Paragraph>
        Bộ phận là các đơn vị chuyên sâu thuộc từng phân hệ (ví dụ: Ổ bụng,
        Tuyến giáp, Phổi, Tim mạch…).
      </Paragraph>

      <ul>
        <li>Tên bộ phận</li>
        <li>Tên rút gọn</li>
        <li>Mã code</li>
        <li>Trạng thái (Hoạt động / Ngừng hoạt động)</li>
        <li>Liên kết Template Service</li>
      </ul>

      <Paragraph>
        Nhấn <Tag color="blue">+ Tạo mới</Tag> để thêm bộ phận.
      </Paragraph>

      <Title level={4}>Trạng thái dịch vụ</Title>

      <ul>
        <li>
          <Tag color="green">Hoạt động</Tag> – Có thể sử dụng trong hệ thống
        </li>
        <li>
          <Tag color="red">Ngừng hoạt động</Tag> – Không hiển thị khi tạo hồ sơ
        </li>
      </ul>

      <Divider />

      <Title level={4}>❓ Câu hỏi thường gặp</Title>

      <Collapse accordion>
        <Panel header="Sự khác nhau giữa Phân hệ và Bộ phận?" key="1">
          <p>
            Phân hệ là nhóm chuyên môn cấp cao (CT, MRI, Siêu âm). Bộ phận là
            đơn vị chi tiết bên trong phân hệ (Ổ bụng, Tuyến giáp, Phổi...).
          </p>
        </Panel>

        <Panel header="Có thể xóa dịch vụ không?" key="2">
          <p>
            Hệ thống khuyến nghị chỉ chuyển trạng thái sang Ngừng hoạt động để
            đảm bảo không ảnh hưởng dữ liệu cũ.
          </p>
        </Panel>

        <Panel header="Ai có quyền chỉnh sửa?" key="3">
          <p>
            Chỉ tài khoản quản trị mới có quyền chỉnh sửa phân hệ và bộ phận.
          </p>
        </Panel>
      </Collapse>
    </div>
  );
};

export default GuideMenuManagerServicePage;
