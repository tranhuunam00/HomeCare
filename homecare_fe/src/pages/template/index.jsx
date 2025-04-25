import { Link } from "react-router-dom";
import {
  Form,
  Input,
  DatePicker,
  Radio,
  Button,
  Typography,
  Space,
} from "antd";

import GuildLine from "./_guildline";

import ConclusionTable from "./ConclusionTable.jsx";
import { useRef, useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import ImageGallery from "./ImageGallery";
import ExaminationResults from "./ExaminationResults";
import { Header } from "./Header.jsx";
import TargetLesionsDateTable from "./_TargetLesionsDateTable.jsx";
import TargetLesionsMainTable from "./_TargetLesionsMainTable.jsx";
import TargetLesionsTotalTable from "./_TargetLesionsTotalTable.jsx";
import TargetLesionsChart from "./_TargetLesionsChart.jsx";

const { Title } = Typography;

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
        <div style={formStyle} className="print-section">
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

  // State cho dữ liệu bảng tổn thương đích
  const [targetData, setTargetData] = useState([
    {
      location: "RUL3",
      baseline: 52,
      tp1: 45,
      tp2: 25,
      tp3: "",
      tp4: "",
      tp5: "",
    },
    {
      location: "RML5",
      baseline: 45,
      tp1: 41,
      tp2: 20,
      tp3: "",
      tp4: "",
      tp5: "",
    },
    {
      location: "LLL10",
      baseline: 32,
      tp1: 32,
      tp2: 14,
      tp3: "",
      tp4: "",
      tp5: "",
    },
  ]);

  // State cho dữ liệu bảng tổn thương ngoài đích
  const [nonTargetData, setNonTargetData] = useState([
    {
      location: "RUL3",
      baseline: 52,
      tp1: 45,
      tp2: 25,
      tp3: "",
      tp4: "",
      tp5: "",
    },
    {
      location: "RML5",
      baseline: 45,
      tp1: 41,
      tp2: 20,
      tp3: "",
      tp4: "",
      tp5: "",
    },
  ]);

  // State cho dữ liệu bảng tổn thương mới
  const [newLesionData, setNewLesionData] = useState([
    {
      location: "RUL3",
      baseline: 52,
      tp1: 45,
      tp2: 25,
      tp3: "",
      tp4: "",
      tp5: "",
    },
  ]);

  const [dataDate, setDataDate] = useState([
    {
      location: "",
      baseline: "2024-01-01",
      tp1: "2024-05-01",
      tp2: "2025-01-01",
      tp3: "",
      tp4: "",
      tp5: "",
    },
  ]);

  // Hàm xử lý thay đổi dữ liệu cho tổn thương đích
  const onTargetChange = (rowIndex, key, value) => {
    const newData = [...targetData];
    if (key !== "location") {
      newData[rowIndex][key] = +value || 0;
    } else {
      newData[rowIndex][key] = value;
    }
    setTargetData(newData);
  };

  // Hàm xử lý thay đổi dữ liệu cho tổn thương ngoài đích
  const onNonTargetChange = (rowIndex, key, value) => {
    const newData = [...nonTargetData];
    if (key !== "location") {
      newData[rowIndex][key] = +value || 0;
    } else {
      newData[rowIndex][key] = value;
    }
    setNonTargetData(newData);
  };

  // Hàm xử lý thay đổi dữ liệu cho tổn thương mới
  const onNewChange = (rowIndex, key, value) => {
    const updatedData = [...newLesionData];
    if (key !== "location") {
      updatedData[rowIndex][key] = value === "" ? "" : +value || 0;
    } else {
      updatedData[rowIndex][key] = value;
    }
    setNewLesionData(updatedData);
  };

  const onChangeDate = (rowIndex, key, value) => {
    const newData = [...dataDate];
    newData[rowIndex][key] = value;
    setDataDate(newData);
  };

  const generatePDF = async () => {
    setLoading(true);

    // Lưu title cũ
    const oldTitle = document.title;

    // Đặt tên mới cho file PDF
    document.title = `RECIST_Report_${new Date()
      .toLocaleDateString("vi-VN")
      .replace(/\//g, "_")}`;

    // Thêm CSS cho in ấn
    const style = `
      @page {
        size: A4;
        margin: 15mm;
      }
      @media print {
        @page {
          margin: 0;
        }
        html {
          height: 100vh;
        }
        body {
          height: 100vh;
          margin: 0 !important;
          padding: 0 !important;
          overflow: hidden !important;
        }
        /* Ẩn tất cả extension và thanh công cụ */
        #browser-extension-hide,
        #browser-action-hide,
        #page-action-hide,
        #nav-bar-hide,
        #toolbar-hide,
        #chrome-extension-hide,
        .chrome-extension,
        .browser-action,
        .page-action {
          display: none !important;
          visibility: hidden !important;
        }
        /* Ẩn tất cả nội dung khác */
        body * {
          visibility: hidden;
        }
        /* Chỉ hiển thị nội dung cần in */
        #report-container, 
        #report-container * {
          visibility: visible;
        }
        #report-container {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          background-color: white !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          margin: 0;
          padding: 15mm;
          box-sizing: border-box;
        }
        .no-print {
          display: none !important;
        }
        .print-section {
          page-break-inside: avoid;
          margin-bottom: 20px;
          margin-top: 20px;
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
        .name_title {
          font-size: 16px;
          font-weight: bold;
        }
      }
    `;

    const styleTag = document.createElement("style");
    styleTag.innerHTML = style;
    document.head.appendChild(styleTag);

    // Đợi một chút để đảm bảo các style đã được áp dụng
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Gọi hàm in của trình duyệt
    window.print();

    // Khôi phục lại title cũ
    document.title = oldTitle;

    // Xóa style sau khi in xong
    document.head.removeChild(styleTag);
    setLoading(false);
  };

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

          {/* Bảng ngày tháng chung */}
          <div style={{ marginBottom: "24px" }} className="no-print">
            <TargetLesionsDateTable
              dataDate={dataDate}
              onChangeDate={onChangeDate}
            />
          </div>

          {/* Bảng tổn thương đích */}
          <div style={{ marginBottom: "24px" }}>
            <Title level={4} style={{ textAlign: "left", color: "#1890ff" }}>
              TỔN THƯƠNG ĐÍCH (TARGET LESIONS)
            </Title>
            <TargetLesionsMainTable
              data={targetData}
              onChange={onTargetChange}
            />
            <TargetLesionsTotalTable
              data={targetData}
              dataDate={dataDate}
              onChange={onTargetChange}
            />
          </div>

          {/* Bảng tổn thương ngoài đích */}
          <div style={{ marginBottom: "24px" }}>
            <Title level={4} style={{ textAlign: "left", color: "#1890ff" }}>
              NGOÀI TỔN THƯƠNG ĐÍCH (NON-TARGET LESIONS)
            </Title>
            <TargetLesionsMainTable
              data={nonTargetData}
              onChange={onNonTargetChange}
            />
            <TargetLesionsTotalTable
              data={nonTargetData}
              dataDate={dataDate}
              onChange={onNonTargetChange}
            />
          </div>

          {/* Bảng tổn thương mới */}
          <div style={{ marginBottom: "24px" }} className="print-section">
            <Title level={4} style={{ textAlign: "left", color: "#1890ff" }}>
              TỔN THƯƠNG MỚI
            </Title>
            <TargetLesionsMainTable
              data={newLesionData}
              onChange={onNewChange}
            />
            <TargetLesionsTotalTable
              data={newLesionData}
              dataDate={dataDate}
              onChange={onNewChange}
            />
          </div>
        </div>

        <div className="print-section">
          <ConclusionTable />
        </div>

        {/* Các biểu đồ */}
        <div style={{ marginTop: "48px" }} className="print-section">
          <TargetLesionsChart
            data={targetData}
            dataDate={dataDate}
            name_chart={"Đồ thị minh họa thay đổi tổn thương đích"}
          />
          <TargetLesionsChart
            data={nonTargetData}
            dataDate={dataDate}
            name_chart={"Đồ thị minh họa thay đổi tổn thương ngoài đích"}
          />
          <TargetLesionsChart
            data={newLesionData}
            dataDate={dataDate}
            name_chart={"Đồ thị minh họa thay đổi tổn thương mới"}
          />
        </div>
        <div className="print-section">
          <ImageGallery />
        </div>
      </div>
    </div>
  );
}
