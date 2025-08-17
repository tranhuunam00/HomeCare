import React, { useMemo, useRef, useState } from "react";
import {
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  Divider,
  Typography,
  Row,
  Col,
  Upload,
  Image,
  message,
  Tooltip,
} from "antd";
import { InboxOutlined, QuestionCircleOutlined } from "@ant-design/icons";
import ImageBlock from "./component/ImageBlock";
import AdminFormVer2 from "./component/AdminFormVer2";
import { useGlobalAuth } from "../../contexts/AuthContext";
import FormActionBar from "./component/FormActionBar";
import { handleAction } from "./utils";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Dragger } = Upload;

const LANGUAGE_OPTIONS = [
  { label: "VI", value: "vi" },
  { label: "EN", value: "en" },
];

/* ============== HELPERS ============== */
const generateAutoId = () => {
  const d = new Date();

  return `DFORM-tự động sinh`; // ví dụ: DFORM-2025-08-17-ABCD
};

const todayLabel = () => {
  const d = new Date();
  return d.toLocaleDateString();
};

/* ============== COMPONENT ============== */
export default function DFormVer2() {
  const [form] = Form.useForm();

  const pendingAction = useRef(null);
  const autoId = useMemo(() => generateAutoId(), []);

  const { user, doctor, examParts, templateServices } = useGlobalAuth();

  const [imgAnatomy, setImgAnatomy] = useState(
    "https://via.placeholder.com/640x360?text=Minh+hoa+giai+phau"
  );
  const [imgProcedure, setImgProcedure] = useState(
    "https://via.placeholder.com/640x360?text=Minh+hoa+quy+trinh+thuc+hi%C3%AAn"
  );

  const [tablesData, setTablesData] = useState([]);

  const onFinish = (values) => {
    console.log("onFinish");
    const payload = {
      ...values,
      autoCode: autoId,
      ngayThucHien: todayLabel(),
      nguoiThucHien: "Login",
      images: { anatomy: imgAnatomy, procedure: imgProcedure },
      tables: tablesData,
      _action: pendingAction.current, // biết submit vì nút nào
    };

    console.log("D-FORM payload", payload);

    // Tuỳ hành động mà xử lý thêm
    switch (pendingAction.current) {
      case "save":
        message.success("Đã SAVE");
        break;
      case "approve":
        message.success("Đã APPROVE");
        break;
      case "export":
        message.success("Đã EXPORT (log console)");
        // TODO: nếu muốn, xuất file JSON tại đây
        break;
      case "print":
        window.print();
        break;
      default:
        message.success("Submit thành công");
    }

    pendingAction.current = null;
  };

  const onFinishFailed = (err) => {
    console.log("[onFinishFailed] errors:", err?.errorFields);
    message.error("Vui lòng kiểm tra các trường còn thiếu/không hợp lệ.");
  };

  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: 16 }}>
      <Title level={3} style={{ textAlign: "center", marginBottom: 24 }}>
        PHẦN MỀM NHẬP LIỆU BỘ MẪU KẾT QUẢ D‑FORM
      </Title>

      <Form
        form={form}
        layout="horizontal" // ⬅️ đổi từ "vertical" → "horizontal"
        labelAlign="left"
        labelCol={{ flex: "0 0 180px" }} // độ rộng cột label
        wrapperCol={{ flex: "1 0 0" }} // cột input chiếm phần còn lại
        colon={false}
        onFinish={onFinish}
        initialValues={{ language: "vi" }}
        onFinishFailed={onFinishFailed}
      >
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              label="Kỹ thuật (1)"
              name="id_template_service"
              rules={[{ required: true, message: "Chọn kỹ thuật" }]}
            >
              <Select placeholder="Chọn bộ phận thăm khám">
                {templateServices.map((s) => (
                  <Option key={s.id} value={s.id}>
                    {s.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              label="Bộ phận (2)"
              name="id_exam-parts"
              rules={[{ required: true, message: "Chọn bộ phận" }]}
            >
              <Select placeholder="Chọn bộ phận thăm khám">
                {examParts.map((s) => (
                  <Option key={s.id} value={s.id}>
                    {s.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              label="Ngôn ngữ (3)"
              name="language"
              rules={[{ required: true }]}
            >
              <Select options={LANGUAGE_OPTIONS} placeholder="VI / EN" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label="Mã số định danh mẫu (4)">
              <Input value={autoId} readOnly disabled />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} md={24}>
            <Form.Item
              label="Tên mẫu (5)"
              name="tenMau"
              rules={[{ required: true, message: "Nhập tên mẫu" }]}
            >
              <Input placeholder="Short text (VD: Siêu âm bụng tổng quát nam)" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item label="Kết luận của mẫu (6)" name="ketLuan">
              <Input placeholder="Short text (VD: U máu gan)" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item label="Ngày thực hiện (7)">
              <Input value={todayLabel()} readOnly disabled />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label="Người thực hiện (8)">
              <Input value="Login" readOnly disabled />
            </Form.Item>
          </Col>
        </Row>

        <Title
          level={4}
          style={{
            color: "#2f6db8",
            marginTop: 24,
            marginBottom: 16,
          }}
        >
          NỘI DUNG THỰC HIỆN
        </Title>

        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <ImageBlock
              form={form}
              namePrefix="ImageLeft"
              src="https://via.placeholder.com/640x360?text=Minh+hoa+giai+phau"
              title="Minh hoạ giải phẫu (cố định, có mô tả & link)"
            />
          </Col>
          <Col xs={24} md={12}>
            <ImageBlock
              form={form}
              namePrefix="ImageRight"
              src="https://via.placeholder.com/640x360?text=Minh+hoa+quy+trinh+thuc+hien"
              title="Minh hoạ quy trình thực hiện (cố định, có mô tả & link)"
            />
          </Col>
        </Row>

        <Title
          level={4}
          style={{
            color: "#2f6db8",
            marginTop: 24,
            marginBottom: 16,
          }}
        >
          QUY TRÌNH KỸ THUẬT
        </Title>

        <Form.Item name="quyTrinh" label="Mô tả quy trình" tooltip="Short text">
          <TextArea
            autoSize={{ minRows: 4, maxRows: 10 }}
            placeholder="Nhập mô tả quy trình kỹ thuật..."
          />
        </Form.Item>
        <Title
          level={4}
          style={{
            color: "#2f6db8",
            marginTop: 24,
            marginBottom: 16,
          }}
        >
          MÔ TẢ HÌNH ẢNH
        </Title>

        <AdminFormVer2 onChange={setTablesData} />

        <Title
          level={4}
          style={{
            color: "#2f6db8",
            marginTop: 24,
            marginBottom: 16,
          }}
        >
          KẾT LUẬN, CHẨN ĐOÁN
        </Title>

        <Form.Item
          label="Kết luận (6)"
          name="ketLuan"
          rules={[{ required: true, message: "Nhập kết luận" }]}
        >
          <Input placeholder="Short text (VD: U máu gan)" />
        </Form.Item>

        <Form.Item
          label={
            <span>
              Phân loại ICD-10
              <Tooltip title="Tra cứu ICD-10">
                <a
                  href="https://icd.kcb.vn/icd-10/icd10"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ marginLeft: 4 }}
                >
                  <QuestionCircleOutlined />
                </a>
              </Tooltip>
            </span>
          }
          name="icd10"
        >
          <Input placeholder="Tự động sinh link ICD-10" readOnly />
        </Form.Item>

        <Form.Item label="Phân độ, phân loại" name="phanDoLoai">
          <Input placeholder="Short text" />
        </Form.Item>

        <Form.Item label="Chẩn đoán phân biệt" name="chanDoanPhanBiet">
          <Input placeholder="Short text" />
        </Form.Item>

        <Title
          level={4}
          style={{
            color: "#2f6db8",
            marginTop: 24,
            marginBottom: 16,
          }}
        >
          KHUYẾN NGHỊ & TƯ VẤN (10)
        </Title>

        <Form.Item name="khuyenNghi" tooltip="Có thể tích hợp ChatGPT D-RADS">
          <TextArea
            autoSize={{ minRows: 4, maxRows: 10 }}
            placeholder="Nhập khuyến nghị & tư vấn..."
          />
        </Form.Item>

        <FormActionBar
          onAction={(key) => handleAction({ key, form, pendingAction })}
        />
      </Form>
    </div>
  );
}
