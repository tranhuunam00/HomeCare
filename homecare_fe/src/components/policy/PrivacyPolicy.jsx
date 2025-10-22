import React from "react";
import { Typography, Divider, Card } from "antd";
import styles from "./PrivacyPolicy.module.scss";

const { Title, Paragraph, Text } = Typography;

const PrivacyPolicy = () => {
  return (
    <div className={styles.privacyWrapper}>
      <Card className={styles.privacyCard}>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <img src="/logo_home_care.png" alt="" width={100} />
        </div>
        <Typography>
          <Title level={2} className={styles.title}>
            CHÍNH SÁCH BẢO MẬT VÀ QUYỀN RIÊNG TƯ DỮ LIỆU
          </Title>

          <Divider />

          <Title level={4}>I. Mục đích và phạm vi áp dụng</Title>
          <Paragraph>
            Chính sách này quy định việc thu thập, sử dụng, lưu trữ, chia sẻ và
            bảo vệ dữ liệu cá nhân của Người dùng phần mềm <b>D-RADS</b> (Bác
            sĩ, Kỹ thuật viên, Điều dưỡng viên, Nhân viên y tế) và dữ liệu y tế
            của Người bệnh trong quá trình sử dụng hệ thống.
          </Paragraph>
          <Paragraph>
            Áp dụng cho toàn bộ sản phẩm, module và dịch vụ thuộc nền tảng
            <b> D-RADS</b>, do <b>Công ty TNHH Đầu tư & Công nghệ DAOGROUP</b>{" "}
            phát triển và cung cấp cho Người dùng cá nhân hoặc các đơn vị y tế
            đối tác (Bệnh viện, Phòng khám, Trung tâm chẩn đoán hình ảnh).
          </Paragraph>

          <Title level={4}>II. Căn cứ pháp lý</Title>
          <ul>
            <li>Luật An ninh mạng số 24/2018/QH14;</li>
            <li>Nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân;</li>
            <li>Luật Khám bệnh, chữa bệnh số 15/2023/QH15;</li>
            <li>Nghị định 53/2022/NĐ-CP hướng dẫn Luật An ninh mạng;</li>
            <li>Thông tư 46/2018/TT-BYT về hồ sơ, bệnh án điện tử;</li>
            <li>
              Các quy định của Bộ Y tế và Bộ Thông tin & Truyền thông về quản lý
              dữ liệu y tế điện tử.
            </li>
          </ul>

          <Title level={4}>III. Nguyên tắc bảo mật dữ liệu</Title>
          <ul>
            <li>
              <b>Tính hợp pháp và minh bạch:</b> Mọi hoạt động xử lý dữ liệu
              phải có căn cứ pháp lý, được thông báo và có sự đồng ý của chủ thể
              dữ liệu.
            </li>
            <li>
              <b>Giới hạn mục đích:</b> Dữ liệu chỉ được xử lý phục vụ khám,
              chẩn đoán, báo cáo, và quản lý hành chính y tế.
            </li>
            <li>
              <b>Bảo mật & toàn vẹn:</b> Dữ liệu được mã hóa, lưu trữ an toàn,
              hạn chế truy cập trái phép.
            </li>
            <li>
              <b>Giới hạn lưu trữ:</b> Dữ liệu được lưu trong thời gian cần
              thiết cho mục đích chuyên môn và tuân thủ quy định pháp luật.
            </li>
            <li>
              <b>Trách nhiệm & kiểm soát:</b> Cả hai bên cùng chịu trách nhiệm
              bảo mật trong phạm vi quản lý của mình.
            </li>
          </ul>

          <Title level={4}>IV. Phân loại dữ liệu được xử lý</Title>
          <Paragraph>
            <b>1. Dữ liệu người dùng</b>
          </Paragraph>
          <ul>
            <li>
              Đối tượng gồm: Bác sĩ, Kỹ thuật viên, Điều dưỡng, Nhân viên y tế;
            </li>
            <li>
              Họ tên, chức danh, chuyên khoa, đơn vị công tác, tài khoản đăng
              nhập, email, số điện thoại, thiết bị truy cập, chữ ký số (nếu có).
            </li>
          </ul>

          <Paragraph>
            <b>2. Dữ liệu người bệnh</b>
          </Paragraph>
          <ul>
            <li>
              Thông tin cá nhân cơ bản (họ tên, năm sinh, giới tính, mã bệnh
              nhân...);
            </li>
            <li>
              Dữ liệu hình ảnh y học (DICOM, ảnh CT/MRI/X-quang/Siêu âm...);
            </li>
            <li>
              Kết quả đọc, nhận định chuyên môn, hình ảnh minh họa (key image);
            </li>
            <li>Liên kết hồ sơ bệnh án (nếu tích hợp với HIS/RIS/PACS).</li>
          </ul>

          <Title level={4}>V. Mục đích xử lý dữ liệu</Title>
          <ul>
            <li>
              Hỗ trợ hoạt động chẩn đoán hình ảnh, lưu trữ, báo cáo và quản lý
              hồ sơ;
            </li>
            <li>
              Cho phép chia sẻ kết quả giữa các chuyên khoa, cơ sở y tế có thẩm
              quyền;
            </li>
            <li>
              Tuân thủ quy định pháp luật, yêu cầu của cơ quan quản lý nhà nước;
            </li>
            <li>
              Phân tích, thống kê phục vụ nghiên cứu và tối ưu thuật toán AI/ML
              (chỉ khi dữ liệu đã được ẩn danh hóa).
            </li>
          </ul>

          <Title level={4}>VI. Biện pháp bảo mật kỹ thuật và tổ chức</Title>
          <ul>
            <li>
              <b>Mã hóa dữ liệu:</b> Truyền tải qua SSL/TLS và lưu trữ bằng
              AES-256;
            </li>
            <li>
              <b>Phân quyền người dùng:</b> Quản lý truy cập theo vai trò và cấp
              độ hành nghề;
            </li>
            <li>
              <b>Nhật ký kiểm soát:</b> Ghi log toàn bộ hành động truy cập, tải
              xuống, chỉnh sửa;
            </li>
            <li>
              <b>Sao lưu & phục hồi:</b> Dữ liệu sao lưu định kỳ tại trung tâm
              đạt chuẩn ISO/IEC 27001;
            </li>
            <li>
              <b>Kiểm thử bảo mật:</b> Đánh giá an ninh mạng định kỳ hoặc khi
              nâng cấp hệ thống.
            </li>
          </ul>

          <Title level={4}>VII. Quyền của người dùng và người bệnh</Title>
          <ul>
            <li>Biết rõ dữ liệu của mình được thu thập và mục đích xử lý;</li>
            <li>Truy cập, chỉnh sửa hoặc yêu cầu xóa dữ liệu;</li>
            <li>Khiếu nại nếu có hành vi vi phạm hoặc rò rỉ thông tin;</li>
            <li>
              Rút lại sự đồng ý xử lý dữ liệu, trừ trường hợp pháp luật yêu cầu
              lưu trữ.
            </li>
          </ul>

          <Title level={4}>VIII. Chia sẻ và chuyển giao dữ liệu</Title>
          <ul>
            <li>
              Chỉ chia sẻ dữ liệu với Người dùng có thẩm quyền, không tiết lộ
              cho bên thứ ba nếu không có sự đồng ý hợp pháp.
            </li>
            <li>
              Bảo mật tuyệt đối dữ liệu Người bệnh và Người dùng; không bán,
              chuyển giao cho bên thứ ba.
            </li>
            <li>
              Thông báo kịp thời khi xảy ra sự cố rò rỉ, tấn công mạng hoặc nguy
              cơ mất an toàn.
            </li>
            <li>
              Cung cấp công cụ giúp Người dùng kiểm soát quyền truy cập nội bộ.
            </li>
            <li>
              Việc chuyển giao dữ liệu ra ngoài Việt Nam tuân thủ Điều 25–28
              Nghị định 13/2023/NĐ-CP.
            </li>
          </ul>

          <Title level={4}>IX. Liên hệ</Title>
          <Paragraph>
            <b>Công ty TNHH Đầu tư & Công nghệ DAOGROUP</b>
            <br />
            Email:{" "}
            <a href="mailto:daogroupltd@gmail.com">daogroupltd@gmail.com</a>
            <br />
            Điện thoại: <a href="tel:0969268000">0969 268 000</a>
            <br />
            Website: <a href="https://www.daogroup.vn">www.daogroup.vn</a>
            <br />
            Bộ phận phụ trách: Ban An toàn thông tin & Bảo mật dữ liệu
          </Paragraph>
        </Typography>
      </Card>
    </div>
  );
};

export default PrivacyPolicy;
