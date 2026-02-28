import React from "react";
import { Typography, Divider, Collapse, Tag, Button } from "antd";
import styles from "../GuideDetail.module.scss";
import { useNavigate } from "react-router-dom";

const { Title, Paragraph } = Typography;
const { Panel } = Collapse;

const GuideMenuReadResultPage = () => {
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

      <Title level={3}>MENU ĐỌC KẾT QUẢ (READ RESULT V3)</Title>

      <Divider />

      {/* 1 */}
      <Title level={4} style={{ color: "#cf1322" }}>
        1. Chuyển trạng thái ca bệnh
      </Title>

      <img
        src="/guild/report.png"
        alt="chuyen-trang-thai"
        className={styles.image}
      />

      <Paragraph>
        Khi mở hồ sơ bệnh nhân, ca bệnh sẽ đi qua các trạng thái sau:
      </Paragraph>

      <ul>
        <li>
          <Tag>Khởi tạo</Tag> – Hồ sơ vừa được tạo, chưa xử lý.
        </li>
        <li>
          <Tag color="blue">Chưa đọc</Tag> – Đã tiếp nhận nhưng chưa bắt đầu đọc
          kết quả.
        </li>
        <li>
          <Tag color="processing">Đang đọc</Tag> – Bác sĩ đang nhập nội dung kết
          quả.
        </li>
        <li>
          <Tag color="warning">Chờ duyệt</Tag> – Đã hoàn tất nhập liệu và gửi
          duyệt.
        </li>
        <li>
          <Tag color="success">Đã duyệt</Tag> – Kết quả đã được phê duyệt chính
          thức.
        </li>
      </ul>

      <Paragraph>
        Tại một thời điểm, mỗi ca bệnh chỉ có thể được đọc bởi{" "}
        <strong>một bác sĩ</strong>. Khi một bác sĩ bắt đầu đọc, hệ thống sẽ
        chuyển trạng thái sang <Tag color="processing">Đang đọc</Tag> và khóa ca
        bệnh với các tài khoản khác.
      </Paragraph>

      <Paragraph>
        Nếu muốn bác sĩ khác tiếp tục đọc, cần thực hiện{" "}
        <Tag color="red">Hủy đọc</Tag> để đưa ca bệnh về trạng thái ban đầu, sau
        đó bác sĩ khác mới có thể nhận đọc.
      </Paragraph>
      <Divider />

      {/* 2 */}
      <Title level={4}>2. Thông tin hành chính</Title>

      <img
        src="/guild/report1.png"
        alt="thong-tin-hanh-chinh"
        className={styles.image}
      />

      <Paragraph>Bao gồm các thông tin:</Paragraph>

      <ul>
        <li>Họ tên</li>
        <li>Giới tính</li>
        <li>Tuổi</li>
        <li>PID – Mã bệnh nhân</li>
        <li>SID – Mã phiếu</li>
        <li>Địa chỉ – Quốc tịch</li>
        <li>Thông tin lâm sàng</li>
      </ul>
      <Paragraph>Phần này được đồng bộ từ phía ca cần đọc sang</Paragraph>
      <Divider />

      {/* 3 */}
      <Title level={4}>3. Chọn mẫu đọc kết quả & Header</Title>

      <img
        src="/guild/report2.png"
        alt="chon-mau-doc"
        className={styles.image}
      />

      <Paragraph>
        Sau khi chọn <Tag color="blue">Mẫu đọc kết quả</Tag>, hệ thống sẽ tự
        động tải nội dung template tương ứng và hiển thị trong phần{" "}
        <strong>Quy trình thủ thuật</strong> để bác sĩ nhập và chỉnh sửa.
      </Paragraph>

      <Paragraph>
        Đồng thời, khi chọn <Tag color="purple">Mẫu in kết quả (Header)</Tag>,
        hệ thống sẽ áp dụng bố cục in bao gồm:
      </Paragraph>

      <ul>
        <li>Thông tin phòng khám / bệnh viện</li>
        <li>Logo</li>
        <li>Địa chỉ – Điện thoại</li>
        <li>Chữ ký bác sĩ</li>
        <li>Định dạng tiêu đề và footer</li>
      </ul>

      <Paragraph>
        Nội dung trong <strong>Mẫu đọc kết quả</strong> quyết định phần mô tả
        chuyên môn, còn <strong>Mẫu in kết quả</strong> quyết định hình thức
        hiển thị khi Preview hoặc In báo cáo.
      </Paragraph>

      <Divider />

      {/* 4 */}
      <Title level={4}>4. Kết luận – Hình ảnh – Các nút chức năng</Title>

      <img
        src="/guild/report3.png"
        alt="ket-luan-hinh-anh"
        className={styles.image}
      />

      <ul>
        <li>Chẩn đoán hình ảnh</li>
        <li>Phân độ / Phân loại</li>
        <li>Chẩn đoán phân biệt</li>
        <li>Khuyến nghị & Tư vấn</li>
        <li>Upload hình ảnh minh họa</li>
      </ul>

      <Paragraph>Các chức năng chính:</Paragraph>

      <ul>
        <li>
          <Tag color="blue">Save</Tag> – Lưu bản nháp
        </li>
        <li>
          <Tag color="gold">Edit</Tag> – Chỉnh sửa
        </li>
        <li>
          <Tag color="processing">Approve</Tag> – Duyệt
        </li>
        <li>
          <Tag>Preview</Tag> – Xem trước
        </li>
        <li>
          <Tag color="purple">In</Tag> – In
        </li>
        <li>
          <Tag color="cyan">Dịch English</Tag> – Dịch
        </li>
        <li>
          <Tag color="red">Exit</Tag> – Thoát
        </li>
      </ul>

      <Divider />

      {/* 5 */}
      <Title level={4}>5. Bản dịch tiếng Anh</Title>

      <img
        src="/guild/report4.png"
        alt="ban-dich-tieng-anh"
        className={styles.image}
      />

      <Paragraph>
        Khi nhấn <Tag color="cyan">Dịch English</Tag>, hệ thống sẽ:
      </Paragraph>

      <ul>
        <li>Chuyển nội dung sang tiếng Anh</li>
        <li>Tạo bản ghi trong mục “Các bản dịch”</li>
        <li>Cho phép chỉnh sửa nội dung tiếng Anh</li>
      </ul>

      <Divider />

      <Title level={4}>❓ Câu hỏi thường gặp</Title>

      <Collapse accordion>
        <Panel header="Khi nào được phép duyệt kết quả?" key="1">
          <p>
            Chỉ khi kết quả đã được <strong>Lưu bản nháp (Save)</strong> thành
            công, và tài khoản có quyền duyệt, hệ thống mới cho phép chuyển sang
            trạng thái <Tag color="success">Đã duyệt</Tag>.
          </p>
          <p>
            Nếu chưa lưu, nút duyệt sẽ không hoạt động hoặc hệ thống sẽ yêu cầu
            lưu trước.
          </p>
        </Panel>

        <Panel header="Có thể chỉnh sửa sau khi duyệt không?" key="2">
          <p>
            Sau khi chuyển sang trạng thái <Tag color="success">Đã duyệt</Tag>,
            nội dung sẽ tạm thời bị khóa.
          </p>
          <p>
            Tuy nhiên, người đã thực hiện duyệt có thể sử dụng chức năng{" "}
            <Tag color="red">Hủy duyệt</Tag> để đưa ca bệnh về trạng thái trước
            đó và tiếp tục chỉnh sửa.
          </p>
        </Panel>

        <Panel header="Dịch tiếng Anh có chính xác 100% không?" key="3">
          <p>
            Hệ thống hỗ trợ dịch tự động, bác sĩ cần kiểm tra lại nội dung
            chuyên môn.
          </p>
        </Panel>
      </Collapse>
    </div>
  );
};

export default GuideMenuReadResultPage;
