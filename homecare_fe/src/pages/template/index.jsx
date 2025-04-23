import { Link } from "react-router-dom";
import {
  Form,
  Input,
  DatePicker,
  Radio,
  Select,
  Button,
  Typography,
  Space,
} from "antd";
import TargetLesionsTable from "./_TargetLesionsTable";
import GuildLine from "./_guildline";
import OtherAssessmentTable from "./OtherAssessmentTable.jsx";
import ConclusionTable from "./ConclusionTable.jsx";
import { useRef, useState, useEffect } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import ImageGallery from "./ImageGallery";
import ExaminationResults from "./ExaminationResults";
import { Header } from "./Header.jsx";

const { Title } = Typography;
const { TextArea } = Input;

const PatientForm = () => {
  const [form] = Form.useForm();
  const [gender, setGender] = useState(1);
  const [contrast, setContrast] = useState(1);

  const handleGenderChange = (e) => {
    console.log("Giới tính đã thay đổi:", e.target.value);
    setGender(e.target.value);
  };

  const handleContrastChange = (e) => {
    console.log("Tiêm thuốc đối quang đã thay đổi:", e.target.value);
    setContrast(e.target.value);
  };

  const onFinish = (values) => {};

  const formStyle = {
    backgroundColor: "#F0F8FF", // Màu nền xanh nhạt
    padding: "10px",
    marginBottom: "15px",
  };

  const titleStyle = {
    backgroundColor: "#4682B4", // Màu nền xanh đậm
    color: "white",
    padding: "5px 10px",
    margin: "0 0 10px 0",
    textAlign: "left",
  };

  return (
    <Form form={form} onFinish={onFinish}>
      <div>
        {/* THÔNG TIN BỆNH NHÂN */}
        <div style={formStyle}>
          <h3 style={titleStyle}>THÔNG TIN BỆNH NHÂN</h3>
          {renderPatientInfoFields({ gender, handleGenderChange })}
        </div>

        {/* THÔNG TIN LÂM SÀNG */}
        <div style={formStyle}>
          <h3 style={titleStyle}>THÔNG TIN LÂM SÀNG</h3>
          {renderClinicalInfoFields()}
        </div>

        {/* THÔNG TIN BÁC SĨ CHỈ ĐỊNH */}
        <div style={formStyle}>
          <h3 style={titleStyle}>THÔNG TIN BÁC SĨ CHỈ ĐỊNH</h3>
          {renderDoctorInfoFields()}
        </div>

        {/* THÔNG TIN YÊU CẦU */}
        <div style={formStyle}>
          <h3 style={titleStyle}>THÔNG TIN YÊU CẦU</h3>
          {renderRequestInfoFields({ contrast, handleContrastChange })}
        </div>
      </div>
    </Form>
  );
};

// Hàm để render các trường thông tin bệnh nhân
const renderPatientInfoFields = ({ gender, handleGenderChange }) => (
  <>
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "10px",
      }}
    >
      <Form.Item label="Họ và tên" name="name" rules={[{ required: true }]}>
        <Input placeholder="NGUYỄN VĂN A" />
      </Form.Item>
      <Form.Item
        label="Giới tính"
        name="gender"
        rules={[{ required: true, message: "Vui lòng chọn giới tính" }]}
        style={{ textAlign: "left" }}
      >
        <Radio.Group
          name="gender_radio"
          value={gender}
          onChange={handleGenderChange}
          options={[
            { value: 1, label: "Nam" },
            { value: 2, label: "Nữ" },
          ]}
        />
      </Form.Item>
      <Form.Item label="Ngày sinh" name="dob" style={{ textAlign: "left" }}>
        <DatePicker format="DD/MM/YYYY" />
      </Form.Item>
      <Form.Item label="Điện thoại" name="phone">
        <Input />
      </Form.Item>
      <div style={{ display: "flex", gap: "10px" }}>
        <Form.Item label="PID" name="pid" style={{ flex: 1 }}>
          <Input />
        </Form.Item>
        <Form.Item label="SID" name="sid" style={{ flex: 1 }}>
          <Input />
        </Form.Item>
      </div>
      <Form.Item label="Email" name="email">
        <Input />
      </Form.Item>
    </div>
    <Form.Item label="Địa chỉ" name="address">
      <Input />
    </Form.Item>
  </>
);

// Hàm để render các trường thông tin lâm sàng
const renderClinicalInfoFields = () => (
  <>
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "200px 1fr", // Cố định cột đầu 200px
        gap: "8px",
        rowGap: "8px",
      }}
    >
      <div style={{ textAlign: "left" }}>Triệu chứng chính:</div>
      <Form.Item name="symptom" style={{ margin: 0 }}>
        <Input placeholder="Mệt mỏi, đau bụng vùng gan" />
      </Form.Item>

      <div style={{ textAlign: "left" }}>Thời gian diễn biến:</div>
      <Form.Item name="duration" style={{ margin: 0 }}>
        <Input placeholder="1 tháng" />
      </Form.Item>

      <div style={{ textAlign: "left" }}>Chẩn đoán xác định:</div>
      <Form.Item name="diagnosis" style={{ margin: 0 }}>
        <Input placeholder="K gan phải (HCC)" />
      </Form.Item>

      <div style={{ textAlign: "left" }}>Phương pháp điều trị:</div>
      <Form.Item name="treatment" style={{ margin: 0 }}>
        <Input placeholder="Phẫu thuật cắt gan" />
      </Form.Item>

      <div style={{ textAlign: "left" }}>Ngày bắt đầu điều trị:</div>
      <Form.Item name="treatmentStart" style={{ margin: 0 }}>
        <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} />
      </Form.Item>
    </div>
  </>
);

// Hàm để render các trường thông tin bác sĩ chỉ định
const renderDoctorInfoFields = () => (
  <>
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "200px 1fr",
        gap: "8px",
        rowGap: "8px",
      }}
    >
      <div style={{ textAlign: "left" }}>Bác sĩ chỉ định:</div>
      <Form.Item name="doctor" style={{ margin: 0 }}>
        <Input placeholder="PGS.TS.TRỊNH VĂN Q" />
      </Form.Item>

      <div style={{ textAlign: "left" }}>Điện thoại:</div>
      <Form.Item name="doctorPhone" style={{ margin: 0 }}>
        <Input />
      </Form.Item>
    </div>
  </>
);

// Hàm để render các trường thông tin yêu cầu
const renderRequestInfoFields = ({ contrast, handleContrastChange }) => (
  <>
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "200px 1fr",
        gap: "8px",
        rowGap: "8px",
      }}
    >
      <div style={{ textAlign: "left" }}>Yêu cầu:</div>
      <Form.Item style={{ margin: 0 }}>
        <Input.TextArea
          value="Đánh giá đáp ứng điều trị u gan trên phim chụp cắt lớp vi tính (MSCT) theo tiêu chuẩn RECIST 1.1"
          readOnly
        />
      </Form.Item>

      <div style={{ textAlign: "left" }}>Ngày thực hiện:</div>
      <Form.Item name="executionDate" style={{ margin: 0 }}>
        <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} />
      </Form.Item>

      <div style={{ textAlign: "left" }}>Nơi thực hiện:</div>
      <Form.Item name="location" style={{ margin: 0 }}>
        <Input />
      </Form.Item>

      <div style={{ textAlign: "left" }}>Bộ phận thăm khám:</div>
      <Form.Item name="department" style={{ margin: 0 }}>
        <Input placeholder="Chụp cắt lớp vi tính gan và ổ bụng" />
      </Form.Item>

      <div style={{ textAlign: "left" }}>Tiêm thuốc đối quang:</div>
      <Form.Item name="contrast" style={{ margin: 0, textAlign: "left" }}>
        <Radio.Group
          name="contrast_radio"
          value={contrast}
          onChange={handleContrastChange}
          options={[
            { value: 1, label: "Có" },
            { value: 2, label: "Không" },
          ]}
        />
      </Form.Item>

      <div style={{ textAlign: "left" }}>Kỹ thuật tạo ảnh:</div>
      <Form.Item name="technique" style={{ margin: 0, textAlign: "left" }}>
        <div>
          <p>Trước tiêm thuốc cản quang, độ dày lớp cắt 1.5mm</p>
          <p>Sau tiêm thuốc cản quang, độ dày lớp cắt 1.5mm</p>
          <p>Xử lý tái tạo ảnh: MPR, VRT</p>
        </div>
      </Form.Item>
    </div>
  </>
);

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
        scale: 2,
        useCORS: true,
      });

      const imgData = canvas.toDataURL("image/jpeg", 1);
      const imgProperties = pdf.getImageProperties(imgData);
      const imgWidth = pdfWidth;
      const imgHeight = (imgProperties.height * imgWidth) / imgProperties.width;

      // Thêm nội dung vào trang
      pdf.addImage(imgData, "JPEG", margin, margin, imgWidth, imgHeight);

      // Thêm số trang
      const pageCount = pdf.internal.getNumberOfPages();
      for (let j = 1; j <= pageCount; j++) {
        pdf.setPage(j);
        pdf.setFontSize(10);
        pdf.setTextColor("#A9A9A9");
        pdf.text(
          `${j} / ${sections.length}`,
          pdf.internal.pageSize.getWidth() / 2,
          pdf.internal.pageSize.getHeight() - 10,
          { align: "center" }
        );
      }

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
        {/* Thông tin bệnh nhân */}
        <div className="print-section">
          {/* Thêm Header vào đây */}
          <Header />
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
              "Chú thích minh họa các phân thùy gan và một số viết tắt, quy ước của RECIST 1.1"
            }
          />
        </div>

        {/* Thêm component ExaminationResults */}
        <div className="print-section">
          <ExaminationResults />
        </div>
        {/* Các bảng tổn thương */}
        <div className="print-section">
          <div
            style={{
              paddingLeft: "24px",
              display: "flex",
              alignItems: "center",
            }}
          >
            <Title
              level={4}
              style={{
                margin: 0,
                textAlign: "left",
                width: "100%",
                color: "#1890ff",
              }}
            >
              KẾT QUẢ PHÂN TÍCH THEO TIÊU CHUẨN RESCIST 1.1
            </Title>
          </div>
          <TargetLesionsTable
            title={"TỔN THƯƠNG ĐÍCH (TARGET LESIONS)"}
            name_chart={"Đồ thị minh họa thay đổi tổn thương đích"}
          />
        </div>

        <div className="print-section">
          <TargetLesionsTable
            title={"NGOÀI TỔN THƯƠNG ĐÍCH (NON-TARGET LESIONS)"}
            name_chart={"Đồ thị minh họa thay đổi tổn thương ngoài đích"}
          />
        </div>

        <div className="print-section">
          <TargetLesionsTable
            title={"TỔN THƯƠNG MỚI"}
            name_chart={"Đồ thị minh họa thay đổi tổn thương mới"}
          />
        </div>
        {/* Ẩn đánh giá khác */}
        {/* <div className="print-section">
          <OtherAssessmentTable title={"ĐÁNH GIÁ KHÁC"} />
        </div> */}

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
