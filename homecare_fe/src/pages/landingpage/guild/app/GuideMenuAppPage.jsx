import React from "react";
import { Typography, Divider, Collapse, Tag, Button } from "antd";
import styles from "../GuideDetail.module.scss";
import { useNavigate } from "react-router-dom";

const { Title, Paragraph, Text } = Typography;
const { Panel } = Collapse;

const GuideMenuAppPage = () => {
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
      <Title level={3}>PHẦN MỀM D-RADS ỨNG DỤNG</Title>

      <Divider />

      <Title level={4} style={{ color: "#cf1322" }}>
        Thông tin ứng dụng
      </Title>

      <Paragraph>
        Menu <strong>Ứng dụng</strong> cho phép người dùng truy cập các công cụ
        đánh giá như:
      </Paragraph>

      <ul>
        <li>D-RECIST – Đánh giá đáp ứng điều trị theo tiêu chuẩn RECIST 1.1</li>
        <li>D-LUNG – Phân loại nốt phổi theo Lung-RADS</li>
        <li>D-BIRADS – Phân loại tổn thương vú theo BI-RADS</li>
        <li>D-TIRADS – Phân loại nhân giáp theo TI-RADS</li>
        <li>D-BONE – Đánh giá tuổi xương</li>
        <li>D-IPSS – Tính điểm tiên lượng IPSS</li>
        <li>D-CTSI – Đánh giá viêm tụy theo CT Severity Index</li>
        <li>D-KIDNEY – Phân loại tổn thương thận</li>
        <li>D-LIVER – Đánh giá tổn thương gan</li>
        <li>D-Bosniak – Phân loại nang thận theo Bosniak</li>
        <li>D-LIRADS – Phân loại tổn thương gan theo LI-RADS</li>
        <li>D-ORADS – Phân loại khối u buồng trứng theo O-RADS</li>
      </ul>
      <Divider />

      <Title level={4}>Giao diện</Title>

      <img
        src="/guild/ungdunglist.png"
        alt="ket-qua-word"
        className={styles.image}
      />

      <Paragraph>
        Sau khi nhấn nút <Tag color="blue">Copy kết quả</Tag>, hệ thống sẽ sao
        chép nội dung đánh giá dưới dạng bảng chuẩn để dán trực tiếp vào
        Microsoft Word.
      </Paragraph>

      <Divider />

      <Title level={4}>❓ Câu hỏi thường gặp</Title>

      <Collapse accordion>
        <Panel header="Vì sao khi dán vào Word bị mất định dạng?" key="1">
          <p>
            Hãy sử dụng tổ hợp phím Ctrl + V thông thường. Nếu Word đang ở chế
            độ chỉ đọc, hãy bật chế độ chỉnh sửa.
          </p>
        </Panel>

        <Panel header="Có thể xuất PDF không?" key="2">
          <p>
            Hiện tại hệ thống hỗ trợ copy nhanh sang Word. Phiên bản sau sẽ hỗ
            trợ xuất PDF trực tiếp.
          </p>
        </Panel>

        <Panel header="Có tự động lưu kết quả không?" key="3">
          <p>
            Sau khi nhấn nút Kết quả, hệ thống sẽ không lưu trạng thái đánh giá
            và hiển thị trong danh sách bệnh nhân.
          </p>
        </Panel>
      </Collapse>
    </div>
  );
};

export default GuideMenuAppPage;
