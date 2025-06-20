import React, { useEffect, useState, useRef } from "react";
import {
  Form,
  Input,
  Button,
  Card,
  Typography,
  message,
  Spin,
  Select,
} from "antd";
import { useNavigate } from "react-router-dom";
import API_CALL from "../../../services/axiosClient";
import TemplateHeaderEditor from "../TemplatePrint/Header/TemplateHeaderEditor";
import styles from "./TemplatePrintPreview.module.scss";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";

const { Title } = Typography;
const { Option } = Select;

const TemplatePrintPreview = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [headerInfo, setHeaderInfo] = useState({});
  const [template, setTemplate] = useState({});

  const [templateList, setTemplateList] = useState([]);
  const { id_print_template } = useParams();
  const [idTemplate, setIdTemplate] = useState();

  const printRef = useRef();

  // Lấy danh sách tất cả template
  useEffect(() => {
    API_CALL.get("/templates", {
      params: {
        page: 1,
        limit: 100,
      },
    })
      .then((res) => {
        const data = res.data.data?.data || res.data.data || [];
        setTemplateList(data);
      })
      .catch(() => message.error("Không thể tải danh sách template"));
  }, []);

  useEffect(() => {
    if (id_print_template) {
      setLoading(true);
      API_CALL.get(`/print-template/${id_print_template}`)
        .then((res) => {
          const data = res.data.data;
          form.setFieldsValue(data);
          if (data) {
            setHeaderInfo(data);
            setIdTemplate(data.id_template);
          }
        })
        .catch(() => message.error("Không thể tải dữ liệu chi tiết"))
        .finally(() => setLoading(false));
    }
  }, [id_print_template]);

  // Khi chọn template → load chi tiết
  useEffect(() => {
    if (idTemplate) {
      setLoading(true);
      API_CALL.get(`/templates/${idTemplate}`)
        .then((res) => {
          const data = res.data.data;
          if (data) setTemplate(data);
        })
        .catch(() => message.error("Không thể tải dữ liệu chi tiết"))
        .finally(() => setLoading(false));
    }
  }, [idTemplate]);

  const onFinish = async (values) => {
    const formData = new FormData();

    // Gộp tất cả dữ liệu cần submit
    const payload = { ...headerInfo, ...values, id_template: idTemplate };

    // Đẩy từng key-value vào FormData
    Object.entries(payload).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value);
      }
    });

    try {
      setLoading(true);
      if (id_print_template) {
        await API_CALL.put(`/print-template/${id_print_template}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        message.success("Cập nhật thành công!");
      } else {
        await API_CALL.post("/print-template", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        message.success("Tạo mới thành công!");
      }
      navigate("/home/templates-print");
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message);
    } finally {
      setLoading(false);
    }
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
    ${template.description || ""}
    <h3>Kết quả</h3>
    ${template.result || ""}
    <h3>Khuyến nghị</h3>
    ${template.recommendation || ""}
  `;

  return (
    <Card style={{ maxWidth: 1240, margin: "auto" }}>
      <Title level={3}>Xem trước mẫu in</Title>

      <Spin spinning={loading}>
        <div style={{ marginBottom: 20 }}>
          <Select
            showSearch
            allowClear
            style={{ width: 400 }}
            value={idTemplate}
            placeholder="Chọn template cần xem trước"
            optionFilterProp="children"
            onChange={(val) => setIdTemplate(val)}
            filterOption={(input, option) =>
              option.children.toLowerCase().includes(input.toLowerCase())
            }
          >
            {templateList.map((tpl) => (
              <Option key={tpl.id} value={tpl.id}>
                {tpl.name}
              </Option>
            ))}
          </Select>
        </div>

        <Form layout="vertical" form={form} onFinish={onFinish}>
          <Form.Item label="Tên mẫu" name="name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <TemplateHeaderEditor
            value={headerInfo}
            onChange={setHeaderInfo}
            headerInfo={headerInfo}
          />

          <h1 style={{ marginBottom: 30 }}>Nội dung tổng hợp</h1>

          <div ref={printRef}>
            <Card
              bordered={false}
              className={`a4-page  ${styles["card-print-template"]}`}
            >
              <header
                className={styles.printHeader}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 20,
                  alignItems: "flex-start",
                  gap: 20,
                }}
              >
                <img
                  style={{
                    marginTop: 10,
                    objectFit: "cover",
                    alignContent: "center",
                  }}
                  src={
                    headerInfo.logo_url ||
                    "https://via.placeholder.com/150x100?text=Logo"
                  }
                  alt="Logo"
                  width={100}
                  height={100}
                />
                <div style={{ maxWidth: "350px" }}>
                  <p
                    className={styles.printHeader_name}
                    style={{ fontWeight: 600, color: "red", fontSize: 16 }}
                  >
                    {headerInfo.clinic_name || "[Tên phòng khám]"}
                  </p>
                  <p style={{ fontSize: 14 }}>
                    <strong>Khoa:</strong> {headerInfo.department_name || "-"}
                  </p>
                  <p style={{ fontSize: 14 }}>
                    <strong>Địa chỉ:</strong> {headerInfo.address || "-"}
                  </p>
                </div>
                <div style={{ maxWidth: "280px" }}>
                  <p style={{ fontSize: 14 }}>
                    <strong>Website:</strong>{" "}
                    <i>{headerInfo.website || "http://..."}</i>
                  </p>
                  <p style={{ fontSize: 14 }}>
                    <strong>Hotline:</strong> {headerInfo.phone || "..."}
                  </p>
                  <p style={{ fontSize: 14 }}>
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
              {id_print_template ? "Cập nhật" : "Thêm mới"}
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
              disabled={!idTemplate}
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
