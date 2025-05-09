import { Link } from "react-router-dom";
import {
  Form,
  Input,
  DatePicker,
  Radio,
  Button,
  Typography,
  Space,
  InputNumber,
} from "antd";
import { EditOutlined } from "@ant-design/icons";

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
import { exportPDF, generatePDF } from "../utils/exportPDF.js";

const { Title } = Typography;

const PatientForm = () => {
  const [form] = Form.useForm();
  const [gender, setGender] = useState(1);
  const [contrast, setContrast] = useState(1);
  const [isEditingTechnique, setIsEditingTechnique] = useState(false);
  const [techniqueContent, setTechniqueContent] = useState(
    "Trước tiêm thuốc cản quang, độ dày lớp cắt 1.5mm\n" +
      "Sau tiêm thuốc cản quang, độ dày lớp cắt 1.5mm\n" +
      "Xử lý tái tạo ảnh: MPR, VRT"
  );

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
          {renderRequestInfoFields({
            contrast,
            handleContrastChange,
            isEditingTechnique,
            techniqueContent,
            setTechniqueContent,
            setIsEditingTechnique,
          })}
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
      <Form.Item label="Năm sinh" name="dob" style={{ textAlign: "left" }}>
        <InputNumber min={1900} max={2100} placeholder="1900" />
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
    <Form.Item label="Địa chỉ">
      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}
      >
        <Form.Item name="province" style={{ margin: 0 }}>
          <Input placeholder="Tỉnh/Thành phố" />
        </Form.Item>
        <Form.Item name="district" style={{ margin: 0 }}>
          <Input placeholder="Huyện/Quận" />
        </Form.Item>
        <Form.Item name="ward" style={{ margin: 0 }}>
          <Input placeholder="Phường/Xã" />
        </Form.Item>
        <Form.Item name="detail" style={{ margin: 0 }}>
          <Input placeholder="Chi tiết" />
        </Form.Item>
      </div>
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
const renderRequestInfoFields = ({
  contrast,
  handleContrastChange,
  isEditingTechnique,
  techniqueContent,
  setTechniqueContent,
  setIsEditingTechnique,
}) => (
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

      <div style={{ textAlign: "left" }}>Ngày chụp:</div>
      <Form.Item name="executionDate" style={{ margin: 0 }}>
        <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} />
      </Form.Item>

      <div style={{ textAlign: "left" }}>Nơi chụp:</div>
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
        <div style={{ position: "relative" }}>
          {isEditingTechnique ? (
            <>
              <Input.TextArea
                value={techniqueContent}
                onChange={(e) => setTechniqueContent(e.target.value)}
                style={{ marginBottom: "8px", fontSize: "18px" }}
                rows={4}
              />
              <div style={{ textAlign: "right" }}>
                <Button
                  type="primary"
                  onClick={() => setIsEditingTechnique(false)}
                  style={{ marginRight: "8px" }}
                >
                  Lưu
                </Button>
                <Button onClick={() => setIsEditingTechnique(false)}>
                  Hủy
                </Button>
              </div>
            </>
          ) : (
            <>
              <div
                style={{
                  whiteSpace: "pre-line",
                  paddingRight: "30px",
                  fontSize: "18px",
                }}
              >
                {techniqueContent}
              </div>
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={() => setIsEditingTechnique(true)}
                style={{
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  padding: "4px",
                }}
                className="no-print"
              />
            </>
          )}
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
      location: "",
      baseline: 0,
      tp1: 0,
      tp2: 0,
      tp3: 0,
      tp4: 0,
    },
  ]);

  // State cho dữ liệu bảng tổn thương ngoài đích
  const [nonTargetData, setNonTargetData] = useState([
    {
      location: "",
      baseline: 0,
      tp1: 0,
      tp2: 0,
      tp3: 0,
      tp4: 0,
    },
  ]);

  // State cho dữ liệu bảng tổn thương mới
  const [newLesionData, setNewLesionData] = useState([
    {
      location: "",
      baseline: 0,
      tp1: 0,
      tp2: 0,
      tp3: 0,
      tp4: 0,
    },
  ]);

  const [dataDate, setDataDate] = useState([
    {
      location: "",
      baseline: "",
      tp1: "",
      tp2: "",
      tp3: "",
      tp4: "",
    },
  ]);

  // Kiểm tra đã chọn ngày chưa
  const isDateSelected = dataDate.some((row) =>
    ["baseline", "tp1", "tp2", "tp3", "tp4"].some((key) => row[key])
  );

  // Hàm xử lý thêm dòng cho tổn thương đích
  const onAddTargetRow = () => {
    setTargetData([
      ...targetData,
      {
        location: "",
        baseline: 0,
        tp1: 0,
        tp2: 0,
        tp3: 0,
        tp4: 0,
      },
    ]);
  };

  // Hàm xử lý thêm dòng cho tổn thương ngoài đích
  const onAddNonTargetRow = () => {
    setNonTargetData([
      ...nonTargetData,
      {
        location: "",
        baseline: 0,
        tp1: 0,
        tp2: 0,
        tp3: 0,
        tp4: 0,
      },
    ]);
  };

  // Hàm xử lý thêm dòng cho tổn thương mới
  const onAddNewRow = () => {
    setNewLesionData([
      ...newLesionData,
      {
        location: "",
        baseline: 0,
        tp1: 0,
        tp2: 0,
        tp3: 0,
        tp4: 0,
      },
    ]);
  };

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

  // Hàm xử lý xóa dòng cho tổn thương đích
  const onDeleteTargetRow = (index) => {
    const newData = [...targetData];
    newData.splice(index, 1);
    setTargetData(newData);
  };

  // Hàm xử lý xóa dòng cho tổn thương ngoài đích
  const onDeleteNonTargetRow = (index) => {
    const newData = [...nonTargetData];
    newData.splice(index, 1);
    setNonTargetData(newData);
  };

  // Hàm xử lý xóa dòng cho tổn thương mới
  const onDeleteNewRow = (index) => {
    const newData = [...newLesionData];
    newData.splice(index, 1);
    setNewLesionData(newData);
  };

  // Hàm reset dữ liệu về 0 cho bảng tổn thương đích
  const onResetTarget = () => {
    setTargetData(
      targetData.map((row) => ({
        ...row,
        baseline: 0,
        tp1: 0,
        tp2: 0,
        tp3: 0,
        tp4: 0,
      }))
    );
  };
  // Hàm reset dữ liệu về 0 cho bảng tổn thương ngoài đích
  const onResetNonTarget = () => {
    setNonTargetData(
      nonTargetData.map((row) => ({
        ...row,
        baseline: 0,
        tp1: 0,
        tp2: 0,
        tp3: 0,
        tp4: 0,
      }))
    );
  };
  // Hàm reset dữ liệu về 0 cho bảng tổn thương mới
  const onResetNew = () => {
    setNewLesionData(
      newLesionData.map((row) => ({
        ...row,
        baseline: 0,
        tp1: 0,
        tp2: 0,
        tp3: 0,
        tp4: 0,
      }))
    );
  };

  const handleExportPDF = async () => {
    setLoading(true);
    await exportPDF({
      selector: ".print-section",
      fileName: "ketqua_recist.pdf",
      type: "pdf",
    });
    setLoading(false);
  };

  const handlePrint = async () => {
    setLoading(true);
    await generatePDF();
    setLoading(false);
  };

  return (
    <div className="a4-page">
      <div>
        <Space
          style={{
            marginBottom: 16,
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <Link to="/">Quay lại Trang chủ</Link>
          <div style={{ display: "flex", gap: 8 }}>
            <Button
              type="primary"
              onClick={handleExportPDF}
              loading={loading}
              disabled={loading}
            >
              {loading ? "Đang xuất file PDF..." : "Xuất PDF"}
            </Button>
            <Button onClick={handlePrint} loading={loading} disabled={loading}>
              In trình duyệt
            </Button>
          </div>
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
        {/* <div className="print-section">
          <ExaminationResults />
        </div> */}
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
                marginBottom: 15,
                textAlign: "center",
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
              onAddRow={onAddTargetRow}
              onDeleteRow={onDeleteTargetRow}
              dataDate={dataDate}
              onReset={onResetTarget}
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
              onAddRow={onAddNonTargetRow}
              onDeleteRow={onDeleteNonTargetRow}
              dataDate={dataDate}
              onReset={onResetNonTarget}
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
              onAddRow={onAddNewRow}
              onDeleteRow={onDeleteNewRow}
              dataDate={dataDate}
              onReset={onResetNew}
            />
            <TargetLesionsTotalTable
              data={newLesionData}
              dataDate={dataDate}
              onChange={onNewChange}
            />
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
        </div>

        <div className="print-section">
          <ConclusionTable />
        </div>

        <div className="print-section">
          <ImageGallery />
        </div>
      </div>
    </div>
  );
}
