import React from "react";
import { Typography, Divider, Collapse, Button } from "antd";
import styles from "../GuideDetail.module.scss";
import { useNavigate } from "react-router-dom";
import HomeCareHeader from "../../header/HomeCareHeader";

const { Title, Paragraph } = Typography;
const { Panel } = Collapse;

const GuideMenuWorkListPage = () => {
  const navigate = useNavigate();

  return (
    <>
      <HomeCareHeader />
      <div className={styles.container}>
        <Title level={3}>1. Màn hình tổng số ca</Title>

        <Paragraph>
          Chức năng <strong>Tổng số ca đã lọc</strong> giúp người dùng theo dõi
          số lượng ca bệnh đang được hiển thị sau khi áp dụng bộ lọc.
        </Paragraph>

        <Paragraph>
          Khi thay đổi các bộ lọc như: phòng khám, trạng thái, ngày tạo... hệ
          thống sẽ tự động cập nhật tổng số ca tương ứng.
        </Paragraph>

        <Divider />

        <Title level={4}>📌 Giao diện hiển thị</Title>

        <img
          src="/guild/Tổng số ca đã lọc.png"
          alt="tong-so-ca"
          className={styles.image}
        />

        <Divider />

        <Title level={3}>2. Màn hình khi ấn vào chi tiết</Title>

        <img
          src="/guild/Tổng số ca đã lọc (2).png"
          alt="tong-so-ca-2"
          className={styles.image}
        />

        <Divider />

        <Title level={3}>❓ Câu hỏi thường gặp</Title>

        <Collapse accordion>
          <Panel header="Tại sao tổng số ca không đúng?" key="1">
            <p>
              Hãy kiểm tra lại bộ lọc đang áp dụng (trạng thái, ngày, phòng
              khám). Có thể bạn đang lọc nhiều điều kiện cùng lúc.
            </p>
          </Panel>

          <Panel
            header="Vì sao có các ca cùng PID xuất hiện phía dưới?"
            key="2"
          >
            <p>
              Hệ thống sẽ hiển thị các ca khác có cùng PID hoặc CCCD để hỗ trợ
              bác sĩ theo dõi lịch sử khám.
            </p>
          </Panel>

          <Panel header="Tổng số ca có bao gồm ca đã duyệt không?" key="3">
            <p>
              Có. Tổng số ca sẽ bao gồm tất cả các trạng thái nếu bạn chọn bộ
              lọc là “Tất cả”.
            </p>
          </Panel>

          <Panel
            header="Cách để thay đổi thứ tự, có hiển thị không và độ rộng các cột?"
            key="3"
          >
            <p>
              Vui lòng ấn vào phần bánh răng ở góc phải trên cùng của bảng để
              tùy chỉnh cột hiển thị, thứ tự và độ rộng cột theo nhu cầu của
              bạn.
            </p>
            <img
              src="/guild/thaydoidorongcot.png"
              alt="tong-so-ca-2"
              className={styles.image}
            />
          </Panel>
        </Collapse>
      </div>
    </>
  );
};

export default GuideMenuWorkListPage;
