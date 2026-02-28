import React from "react";
import { Typography, Divider, Collapse, Tag, Button } from "antd";
import styles from "../GuideDetail.module.scss";
import { useNavigate } from "react-router-dom";

const { Title, Paragraph } = Typography;
const { Panel } = Collapse;

const GuideMenuManagePrintPage = () => {
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

      <Title level={3}>QUẢN LÝ MẪU IN KẾT QUẢ</Title>

      <Divider />

      <Title level={4} style={{ color: "#cf1322" }}>
        Thông tin chức năng
      </Title>

      <Paragraph>
        Menu <strong>Mẫu in kết quả</strong> cho phép người dùng quản lý các mẫu
        in sử dụng trong hệ thống.
      </Paragraph>

      <ul>
        <li>Tạo mới mẫu in cho từng phòng khám</li>
        <li>Chỉnh sửa thông tin và logo hiển thị</li>
        <li>Sao chép mẫu in có sẵn</li>
        <li>Xóa mẫu không còn sử dụng</li>
        <li>Cấu hình header in bằng kéo thả</li>
      </ul>

      <Divider />

      <Title level={4}>Giao diện danh sách</Title>

      <img
        src="/guild/print.png"
        alt="mau-in-danh-sach"
        className={styles.image}
      />

      <Paragraph>
        Màn hình hiển thị danh sách mẫu in theo từng phòng khám, cho phép{" "}
        <Tag color="blue">Chỉnh sửa</Tag>, <Tag color="red">Xóa</Tag> hoặc{" "}
        <Tag color="green">Copy</Tag>.
      </Paragraph>

      <Divider />

      <Title level={4}>Màn hình chỉnh sửa & cài đặt</Title>

      <img
        src="/guild/printSetting.png"
        alt="mau-in-cai-dat"
        className={styles.image}
      />

      <Paragraph>Tại màn hình cài đặt, người dùng có thể:</Paragraph>

      <ul>
        <li>Kéo thả để di chuyển vị trí logo và thông tin</li>
        <li>Chỉnh font chữ, kích thước, màu sắc</li>
        <li>Xem trước trước khi lưu</li>
        <li>Lưu cấu hình header in cho từng phòng khám</li>
      </ul>

      <Divider />

      <Title level={4}>❓ Câu hỏi thường gặp</Title>

      <Collapse accordion>
        <Panel header="Có thể tạo nhiều mẫu cho một phòng khám không?" key="1">
          <p>
            Có. Mỗi phòng khám có thể cấu hình nhiều mẫu in khác nhau tùy theo
            nhu cầu sử dụng.
          </p>
        </Panel>

        <Panel
          header="Sau khi chỉnh sửa có cần cấu hình lại header không?"
          key="2"
        >
          <p>
            Không bắt buộc. Chỉ cần vào phần Cài đặt nếu muốn thay đổi bố cục
            hiển thị trên bản in.
          </p>
        </Panel>

        <Panel header="Có thể khôi phục mẫu cũ không?" key="3">
          <p>Nếu chưa xóa, bạn có thể sao chép lại từ danh sách mẫu in.</p>
        </Panel>
      </Collapse>
    </div>
  );
};

export default GuideMenuManagePrintPage;
