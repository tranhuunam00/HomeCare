import React, { useEffect, useState, useRef } from "react";
import { Form, Input, Button, Card, Typography, message, Spin } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import API_CALL from "../../../services/axiosClient";
import TemplateHeaderEditor from "../TemplatePrint/Header/TemplateHeaderEditor";
import styles from "./TemplatePrintPreview.module.scss";

const { Title } = Typography;

const TemplatePrintPreview = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { idTemplate } = useParams();
  const [loading, setLoading] = useState(false);
  const [headerInfo, setHeaderInfo] = useState({});
  const printRef = useRef();

  useEffect(() => {
    if (idTemplate) {
      setLoading(true);
      API_CALL.get(`/templates/${idTemplate}`)
        .then((res) => {
          const data = res.data.data;
          form.setFieldsValue(data);
          if (data) setHeaderInfo(data); // nếu header info nằm chung
        })
        .catch(() => message.error("Không thể tải dữ liệu chi tiết"))
        .finally(() => setLoading(false));
    }
  }, [idTemplate, form]);

  const onFinish = async (values) => {
    // Xử lý lưu dữ liệu nếu cần
    console.log("Submit:", { ...values, ...headerInfo });
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
    <Card style={{ maxWidth: 1240, margin: "auto" }}>
      <Title level={3}>Xem trước mẫu in</Title>
      <Spin spinning={loading}>
        <Form layout="vertical" form={form} onFinish={onFinish}>
          <Form.Item label="Tên mẫu" name="name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <TemplateHeaderEditor value={headerInfo} onChange={setHeaderInfo} />

          <h1 style={{ marginBottom: 30 }}>Nội dung tổng hợp</h1>

          <div ref={printRef}>
            <Card
              bordered={false}
              className={`a4-page  ${styles["card-print-template"]}`}
            >
              <header
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 20,
                  alignItems: "flex-start",
                  gap: 20,
                }}
              >
                <img
                  style={{ objectFit: "cover", alignContent: "center" }}
                  src={
                    headerInfo.logoUrl ||
                    "https://via.placeholder.com/150x100?text=Logo"
                  }
                  alt="Logo"
                  width={150}
                  height={100}
                />
                <div style={{ maxWidth: "350px" }}>
                  <h3>{headerInfo.clinicName || "Tên phòng khám"}</h3>
                  <p>
                    <strong>Địa chỉ:</strong>{" "}
                    {headerInfo.address || "Chưa nhập địa chỉ"}
                  </p>
                </div>
                <div style={{ maxWidth: "280px" }}>
                  <p>
                    <strong>Website:</strong>{" "}
                    <i>{headerInfo.website || "http://..."}</i>
                  </p>
                  <p>
                    <strong>Hotline:</strong> {headerInfo.hotline || "..."}
                  </p>
                  <p>
                    <strong>Email:</strong>{" "}
                    <i>{headerInfo.email || "example@email.com"}</i>
                  </p>
                </div>
              </header>
              <div
                className="print-content"
                dangerouslySetInnerHTML={{ __html: combinedHtml }}
              />
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
