import React from "react";
import { Typography, Divider, Collapse, Tag, Button } from "antd";
import styles from "../GuideDetail.module.scss";
import { useNavigate } from "react-router-dom";

const { Title, Paragraph } = Typography;
const { Panel } = Collapse;

const GuideMenuSubscriptionPage = () => {
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

      <Title level={3}>MENU GÓI ĐĂNG KÝ</Title>

      <Divider />

      <Title level={4} style={{ color: "#cf1322" }}>
        Thông tin chức năng
      </Title>

      <Paragraph>
        Menu <strong>Gói đăng ký</strong> cho phép người dùng:
      </Paragraph>

      <ul>
        <li>Xem danh sách các gói dịch vụ của D-RADS (BASIC, PRO, HOSPITAL)</li>
        <li>So sánh quyền hạn giữa các gói</li>
        <li>Đăng ký / nâng cấp gói</li>
        <li>Theo dõi trạng thái phê duyệt</li>
        <li>Xem lịch sử đăng ký</li>
        <li>Kiểm tra thời hạn sử dụng còn lại</li>
      </ul>

      <Divider />

      <Title level={4}>Các loại gói</Title>

      <Paragraph>Hệ thống hiện cung cấp các gói:</Paragraph>

      <ul>
        <li>
          <strong>BASIC</strong> – Gói miễn phí, quyền hạn cơ bản
        </li>
        <li>
          <strong>PRO</strong> – Gói nâng cao, đầy đủ công cụ chuyên sâu
        </li>
        <li>
          <strong>HOSPITAL</strong> – Dành cho phòng khám / bệnh viện với đầy đủ
          quyền quản lý và phân quyền
        </li>
      </ul>

      <Divider />

      <Title level={4}>Giao diện quản lý gói</Title>

      <img
        src="/guild/goidangky.png"
        alt="goi-dang-ky"
        className={styles.image}
      />

      <Paragraph>Sau khi đăng ký, trạng thái sẽ hiển thị:</Paragraph>

      <ul>
        <li>
          <Tag color="gold">Pending</Tag> – Đang chờ phê duyệt
        </li>
        <li>
          <Tag color="green">Approved</Tag> – Đã được kích hoạt
        </li>
        <li>
          <Tag color="red">Expired</Tag> – Đã hết hạn
        </li>
      </ul>

      <Paragraph>
        Người dùng có thể theo dõi <strong>số ngày còn lại</strong> và lịch sử
        đăng ký phía dưới màn hình.
      </Paragraph>

      <Divider />

      <Title level={4}>❓ Câu hỏi thường gặp</Title>

      <Collapse accordion>
        <Panel header="Bao lâu thì gói được kích hoạt?" key="1">
          <p>
            Sau khi đăng ký, quản trị viên sẽ phê duyệt trong thời gian sớm
            nhất. Trạng thái sẽ chuyển sang Approved khi được kích hoạt. Nếu
            đăng ký lần đầu, sẽ tự động kích hoạt.
          </p>
        </Panel>

        <Panel header="Có thể nâng cấp gói không?" key="2">
          <p>
            Có. Người dùng có thể đăng ký gói cao hơn bất kỳ lúc nào. Thời hạn
            sẽ được tính lại theo gói mới bằng cách cộng thêm thời gian.
          </p>
        </Panel>

        <Panel header="Hết hạn thì sao?" key="3">
          <p>
            Khi gói hết hạn, các quyền nâng cao sẽ bị khóa và hệ thống sẽ chuyển
            về quyền mặc định của gói cơ bản.
          </p>
        </Panel>

        <Panel header="Có hoàn tiền khi hủy gói không?" key="4">
          <p>Hiện tại hệ thống chưa hỗ trợ hoàn tiền khi đã kích hoạt gói.</p>
        </Panel>
      </Collapse>
    </div>
  );
};

export default GuideMenuSubscriptionPage;
