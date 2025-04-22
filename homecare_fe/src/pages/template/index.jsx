import { data, Link } from "react-router-dom";
import html2pdf from "html2pdf.js";
import {
  Form,
  Input,
  DatePicker,
  Radio,
  Select,
  Button,
  Typography,
  Space,
  Modal,
} from "antd";
import TargetLesionsTable from "./_TargetLesionsTable";
import GuildLine from "./_guildline";
import OtherAssessmentTable from "./OtherAssessmentTable.jsx";
import ConclusionTable from "./ConclusionTable.jsx";
import { useRef, useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import ImageGallery from "./ImageGallery";

const { Title } = Typography;
const { TextArea } = Input;

const PatientForm = () => {
  const [form] = Form.useForm();

  const onFinish = (values) => {};

  return (
    <Form
      form={form}
      layout="horizontal"
      labelCol={{ span: 4 }}
      wrapperCol={{ span: 20 }}
      labelAlign="left"
      onFinish={onFinish}
      style={{ maxWidth: 900 }}
    >
      <Title level={4}>THÔNG TIN BỆNH NHÂN</Title>
      <Form.Item label="Họ và tên" name="name" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item label="Ngày sinh" name="dob">
        <DatePicker />
      </Form.Item>
      <Form.Item label="Giới tính" name="gender">
        <Radio.Group>
          <Radio value="Nam">Nam</Radio>
          <Radio value="Nữ">Nữ</Radio>
        </Radio.Group>
      </Form.Item>
      <Form.Item label="PID" name="pid">
        <Input type="number" />
      </Form.Item>
      <Form.Item label="SID" name="sid">
        <Input type="number" />
      </Form.Item>
      <Form.Item label="Điện thoại" name="phone">
        <Input />
      </Form.Item>
      <Form.Item label="Email" name="email">
        <Input />
      </Form.Item>
      <Form.Item label="Địa chỉ" name="address">
        <Input.TextArea rows={3} />
      </Form.Item>

      <Title level={4}>THÔNG TIN LÂM SÀNG</Title>
      <Form.Item label="Triệu chứng chính" name="symptom">
        <TextArea />
      </Form.Item>
      <Form.Item label="Thời gian diễn biến" name="duration">
        <Select>
          <Select.Option value="<1 tuần">&lt; 1 tuần</Select.Option>
          <Select.Option value="<1 tháng">&lt; 1 tháng</Select.Option>
          <Select.Option value="<3 tháng">&lt; 3 tháng</Select.Option>
          <Select.Option value=">3 tháng">&gt; 3 tháng</Select.Option>
        </Select>
      </Form.Item>
      <Form.Item label="Chẩn đoán xác định" name="diagnosis">
        <Input />
      </Form.Item>
      <Form.Item label="Phương pháp điều trị" name="treatment">
        <Input />
      </Form.Item>
      <Form.Item label="Ngày bắt đầu điều trị" name="treatmentStart">
        <DatePicker />
      </Form.Item>

      <Title level={4}>THÔNG TIN BÁC SỸ CHỈ ĐỊNH</Title>
      <Form.Item label="Bác sỹ chỉ định" name="doctor">
        <Input />
      </Form.Item>
      <Form.Item label="Điện thoại bác sỹ" name="doctorPhone">
        <Input />
      </Form.Item>

      <Title level={4}>THÔNG TIN YÊU CẦU</Title>
      <Form.Item label="Yêu cầu">
        <p>
          Đánh giá đáp ứng điều trị u gan trên phim chụp cắt lớp vi tính (MSCT)
          theo tiêu chuẩn RECIST1.1
        </p>
      </Form.Item>
      <Form.Item label="Ngày thực hiện" name="executionDate">
        <DatePicker />
      </Form.Item>
      <Form.Item label="Nơi thực hiện" name="location">
        <Input />
      </Form.Item>
      <Form.Item label="Bộ phận thăm khám" name="department">
        <Input />
      </Form.Item>
      <Form.Item label="Tiêm thuốc đối quang" name="contrast">
        <Radio.Group>
          <Radio value="Có">Có</Radio>
          <Radio value="Không">Không</Radio>
        </Radio.Group>
      </Form.Item>
      <Form.Item label="Kỹ thuật kèm theo" name="technique">
        <Input />
      </Form.Item>

      <Form.Item className="no-print">
        <Button type="primary" htmlType="submit" className="no-print">
          Gửi thông tin
        </Button>
      </Form.Item>
    </Form>
  );
};

// Thêm component Header mới
const Header = () => {
  return (
    <div className="print-section" style={{ marginBottom: "20px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
        <div style={{ width: "100px" }}>
          <img
            src="../../../public/logo_home_care.jpg"
            alt="HomeCare Logo"
            style={{ width: "100%" }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <div>
              <h2 style={{ margin: 0 }}>PHÒNG KHÁM BÁC SĨ GIA ĐÌNH HOMECARE</h2>
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: "10px 0",
                }}
              >
                <li>- Khám chữa bệnh từ xa</li>
                <li>- Tư vấn kết quả y khoa theo yêu cầu</li>
                <li>- Bệnh viện trực tuyến tại nhà</li>
              </ul>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ margin: "0 0 5px 0" }}>THÔNG TIN LIÊN HỆ</p>
              <p style={{ margin: "0 0 5px 0" }}>Tele: 0969268000</p>
              <a
                href="http://www.home-care.vn"
                style={{ display: "block", margin: "0 0 5px 0" }}
              >
                www.home-care.vn
              </a>
              <a href="mailto:daogroupltd@gmail.com">daogroupltd@gmail.com</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Template() {
  const [loading, setLoading] = useState(false);
  const printRef = useRef(null);

  const generatePDF = async () => {
    setLoading(true);

    // Thêm CSS cho in ấn
    const style = `
      .no-print {
        display: none !important;
      }
      .print-section {
        page-break-inside: avoid;
        margin-bottom: 20px;
      }
      table {
        page-break-inside: avoid;
      }
      .ant-table {
        page-break-inside: avoid;
      }
      .ant-table-tbody {
        page-break-inside: avoid;
      }
      .ant-table-row {
        page-break-inside: avoid;
      }
      // button, .ant-btn {
      //   display: none !important;
      // }
      /* Ẩn các form control không cần thiết khi in */
      .ant-form-item-control-input-content .ant-picker-suffix,
      .ant-form-item-control-input-content .ant-select-arrow,
      .ant-form-item-control-input-content .ant-input-number-handler-wrap {
        display: none !important;
      }
    `;

    const styleTag = document.createElement("style");
    styleTag.innerHTML = style;
    document.head.appendChild(styleTag);

    // Đợi một chút để đảm bảo các style đã được áp dụng
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const sections = document.querySelectorAll(".print-section");
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const margin = 10;
    const pdfWidth = pdf.internal.pageSize.getWidth() - margin * 2;

    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];
      const canvas = await html2canvas(section, {
        scale: 1.5,
        useCORS: true,
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.7);
      const imgProperties = pdf.getImageProperties(imgData);
      const imgWidth = pdfWidth;
      const imgHeight = (imgProperties.height * imgWidth) / imgProperties.width;

      pdf.addImage(imgData, "JPEG", margin, margin, imgWidth, imgHeight);

      if (i < sections.length - 1) {
        pdf.addPage();
      }
    }

    pdf.save("ketqua_recist.pdf");
    setLoading(false);

    // Xóa bỏ style đã thêm
    document.head.removeChild(styleTag);
  };

  // Dữ liệu hình ảnh mẫu
  const images = [
    {
      src: "https://cdn.pixabay.com/photo/2023/12/29/18/23/daisy-8476666_1280.jpg",
      alt: "Hình ảnh 1",
    },
    {
      src: "https://photo.znews.vn/w660/Uploaded/mdf_eioxrd/2021_07_06/2.jpg",
      alt: "Hình ảnh 2",
    },
    {
      src: "https://d1hjkbq40fs2x4.cloudfront.net/2016-01-31/files/1045-2.jpg",
      alt: "Hình ảnh 3",
    },
    {
      src: "https://images2.thanhnien.vn/zoom/700_438/528068263637045248/2024/1/26/e093e9cfc9027d6a142358d24d2ee350-65a11ac2af785880-17061562929701875684912-37-0-587-880-crop-1706239860681642023140.jpg",
      alt: "Hình ảnh 4",
    },
    {
      src: "https://file3.qdnd.vn/data/images/0/2023/05/03/vuhuyen/khanhphan.jpg",
      alt: "Hình ảnh 5",
    },
    {
      src: "https://d1hjkbq40fs2x4.cloudfront.net/2017-08-21/files/landscape-photography_1645.jpg",
      alt: "Hình ảnh 6",
    },
    {
      src: "https://vcdn1-dulich.vnecdn.net/2021/07/16/1-1626437591.jpg?w=460&h=0&q=100&dpr=1&fit=crop&s=wkxNSU_JeGofMu90v5u03g",
      alt: "Hình ảnh 7",
    },
    {
      src: "https://hoinhabaobacgiang.vn/Includes/NewsImg/1_2024/29736_7-1-1626444923.jpg",
      alt: "Hình ảnh 8",
    },
    {
      src: "https://images.pexels.com/photos/986733/pexels-photo-986733.jpeg?cs=srgb&dl=pexels-nickoloui-986733.jpg&fm=jpg",
      alt: "Hình ảnh 9",
    },
    // Thêm nhiều hình ảnh nếu cần
  ];

  return (
    <div>
      <div>
        <Space
          style={{
            marginBottom: 16,
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <Link to="/">Quay lại Trang chủ</Link>
          <Button
            type="primary"
            onClick={generatePDF}
            loading={loading}
            disabled={loading}
          >
            {loading ? "Đang xuất file PDF..." : "Xuất PDF"}
          </Button>
        </Space>
      </div>

      <div
        ref={printRef}
        id="report-container"
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "20px",
        }}
      >
        {/* Thêm Header vào đây */}
        <Header />

        {/* Thông tin bệnh nhân */}
        <div className="print-section">
          <h2
            style={{
              textAlign: "center",
              marginBottom: "20px",
              color: "#0000FF",
            }}
          >
            KẾT QUẢ CHỤP CẮT LỚP VI TÍNH MSCT REPORT
          </h2>
          <PatientForm />
        </div>

        {/* Hướng dẫn RECIST */}
        <div className="print-section">
          <GuildLine
            title={
              "Minh họa các phân thùy gan và một số viết tắt, quy ước của RECIST 1.1"
            }
          />
        </div>

        {/* Các bảng tổn thương */}
        <div className="print-section">
          <TargetLesionsTable title={"TỔN THƯƠNG ĐÍCH (TARGET LESIONS)"} />
        </div>

        <div className="print-section">
          <TargetLesionsTable
            title={"NGOÀI TỔN THƯƠNG ĐÍCH (NON-TARGET LESIONS)"}
          />
        </div>

        <div className="print-section">
          <TargetLesionsTable title={"TỔN THƯƠNG MỚI"} />
        </div>

        <div className="print-section">
          <OtherAssessmentTable title={"ĐÁNH GIÁ KHÁC"} />
        </div>

        <div className="print-section">
          <ConclusionTable />
        </div>

        <div className="print-section">
          <ImageGallery images={images} />
        </div>
      </div>
    </div>
  );
}
