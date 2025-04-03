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

      <Form.Item>
        <Button type="primary" htmlType="submit">
          Gửi thông tin
        </Button>
      </Form.Item>
    </Form>
  );
};

export default function Template() {
  const [previewVisible, setPreviewVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const printRef = useRef(null);
  const generatePDF = async () => {
    // const reportContainer = document.getElementById("report-container");
    const element = printRef.current;
    if (!element) {
      return;
    }

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
        button, .ant-btn {
          display: none !important;
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
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Sử dụng html2canvas để chuyển đổi HTML thành canvas
    const canvas = await html2canvas(element, {
      scale: 0.8, // Tăng độ phân giải
      useCORS: true, // Cho phép tải hình ảnh từ miền khác
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "px",
      format: "a4",
    });

    // Thêm hình ảnh vào PDF
    // const imgWidth = 190; // Kích thước hình ảnh trong PDF
    // const pageHeight = pdf.internal.pageSize.height;
    // const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let position = 0;
    const imgProperties = pdf.getImageProperties(imgData);
    const pdfWith = pdf.internal.pageSize.getWidth();

    const pdfHeight = (imgProperties.height * pdfWith) / imgProperties.width;
    let heightLeft = pdfHeight;
    // Thêm hình ảnh vào PDF và xử lý nhiều trang nếu cần
    while (heightLeft >= 0) {
      pdf.addImage(imgData, "PNG", 0, 0, pdfWith, pdfHeight);
      heightLeft -= pageHeight;
      position -= pageHeight; // Di chuyển xuống trang tiếp theo
      if (heightLeft >= 0) {
        pdf.addPage(); // Thêm trang mới nếu cần
      }
    }

    // Lưu PDF
    pdf.save("ketqua_recist.pdf");

    // Xóa bỏ style đã thêm
    document.head.removeChild(styleTag);
  };

  return (
    <div>
      <div className="no-print">
        <Space
          style={{
            marginBottom: 16,
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <Link to="/">Quay lại Trang chủ</Link>
          <Button type="primary" onClick={generatePDF} loading={loading}>
            {loading ? "Đang tạo PDF..." : "Xuất PDF"}
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
          <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
            KẾT QUẢ PHÂN TÍCH DỮ LIỆU CHỤP CẮT LỚP VI TÍNH ĐÁNH GIÁ THEO TIÊU
            CHUẨN RECIST 1.1
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
      </div>
    </div>
  );
}
