import React, { useEffect, useState, useRef } from "react";
import {
  Form,
  Input,
  Button,
  Select,
  Card,
  Typography,
  message,
  Spin,
} from "antd";
import { useNavigate, useParams } from "react-router-dom";
import API_CALL from "../../../services/axiosClient";
import TemplateHeaderEditor from "../TemplatePrint/Header/TemplateHeaderEditor";

const { Title } = Typography;
const { Option } = Select;

const TemplatePrintPreview = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { idTemplate } = useParams();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const printRef = useRef();

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await API_CALL.get("/ts", {
          params: { page: 1, limit: 100 },
        });
        setServices(res.data.data.data || []);
      } catch (err) {
        message.error("Không thể tải danh sách dịch vụ");
      }
    };

    fetchServices();
  }, []);

  useEffect(() => {
    if (idTemplate) {
      setLoading(true);
      API_CALL.get(`/templates/${idTemplate}`)
        .then((res) => {
          const data = res.data.data;
          form.setFieldsValue(data);
        })
        .catch(() => message.error("Không thể tải dữ liệu chi tiết"))
        .finally(() => setLoading(false));
    }
  }, [idTemplate, form]);

  const onFinish = async (values) => {
    // Xử lý khi người dùng submit form (nếu cần)
  };

  const handlePrint = () => {
    const printContents = printRef.current.innerHTML;
    const newWindow = window.open("", "_blank", "width=800,height=600");
    newWindow.document.write(`
      <html>
        <head>
          <title>HOMECARE</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
            th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
            h3 { margin-top: 24px; }
          </style>
        </head>
        <body>${printContents}</body>
      </html>
    `);
    newWindow.document.close();
    newWindow.focus();
    newWindow.print();
    newWindow.close();
  };

  const combinedHtml = `
  <style>
    table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
    th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
  </style>
  <h3>Mô tả và kỹ thuật</h3>
  ${form.getFieldValue("description") || ""}
  <h3>Kết quả</h3>
  ${form.getFieldValue("result") || ""}
  <h3>Khuyến nghị</h3>
  ${form.getFieldValue("recommendation") || ""}
`;
  return (
    <Card style={{ maxWidth: 800, margin: "auto" }}>
      <Title level={3}>Xem trước mẫu in</Title>
      <Spin spinning={loading}>
        <Form layout="vertical" form={form} onFinish={onFinish}>
          <Form.Item label="Tên mẫu" name="name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <TemplateHeaderEditor />

          <h1 style={{ marginBottom: 100 }}>Nội dung tổng hợp</h1>

          <div ref={printRef}>
            <Card bordered={false} className="a4-page">
              <header
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 20,
                  gap: 20,
                }}
              >
                <img
                  style={{ objectFit: "cover" }}
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTFYqoKTu_o3Zns2yExbst2Co84Gpc2Q1RJbA&s"
                  alt="Logo"
                  width={150}
                  height={100}
                />
                <div>
                  <h3>CÔNG TY TNHH ĐẦU TƯ & CÔNG NGHỆ DAOGROUP</h3>
                  <p>
                    <strong>Địa chỉ:</strong> Số 22, R3.7/10, Gamuda Gardens,
                    Trần Phú, Hoàng Mai, Hà Nội
                  </p>
                </div>
                <div>
                  <p>
                    <strong>Website:</strong> <i>http://www.daogroup.com/</i>
                  </p>
                  <p>
                    <strong>Hotline:</strong> 0969268000
                  </p>
                  <p>
                    <strong>Email:</strong> <i>http://www.daogroup.com/</i>
                  </p>
                </div>
              </header>
              <div dangerouslySetInnerHTML={{ __html: combinedHtml }} />
            </Card>
          </div>

          <Form.Item style={{ marginTop: 24 }}>
            <Button type="primary" htmlType="submit">
              {idTemplate ? "Cập nhật" : "Thêm mới"}
            </Button>
            <Button
              style={{ marginLeft: 8 }}
              onClick={() => navigate("/home/products")}
            >
              Hủy
            </Button>
            <Button
              style={{ marginLeft: 8 }}
              type="default"
              onClick={handlePrint}
            >
              In
            </Button>
          </Form.Item>
        </Form>
      </Spin>
    </Card>
  );
};

export default TemplatePrintPreview;
