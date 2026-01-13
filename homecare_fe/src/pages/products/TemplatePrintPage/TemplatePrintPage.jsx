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
import { useGlobalAuth } from "../../../contexts/AuthContext";
import { USER_ROLE } from "../../../constant/app";

const { Title } = Typography;
const { Option } = Select;

const TemplatePrintPreview = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [headerInfo, setHeaderInfo] = useState({});

  const { id_print_template } = useParams();
  const [idTemplate, setIdTemplate] = useState();
  const [clinics, setClinics] = useState([]);

  const { user, doctor, templateServices } = useGlobalAuth();

  const printRef = useRef();

  const fetchClinics = async () => {
    setLoading(true);
    try {
      const res = await API_CALL.get("/clinics", {
        params: { page: 1, limit: 100 },
      });
      setClinics(res.data.data.data);
    } catch (err) {
      toast.error(err?.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClinics();
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

  const onFinish = async (values) => {
    const formData = new FormData();

    // Gộp tất cả dữ liệu cần submit
    const payload = { ...headerInfo, ...values, id_template: idTemplate };

    // Đẩy từng key-value vào FormData
    Object.entries(payload).forEach(([key, value]) => {
      if (value === undefined || value === null) return;

      if (key === "logo") {
        console.log("value", value);
        if (value instanceof File) {
          formData.append("logo", value, value.name);
        } else if (value.originFileObj) {
          formData.append(
            "logo",
            value.originFileObj,
            value.originFileObj.name
          );
        }
      } else {
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
            th, td { border: 1px solid #ccc; padding: 2px; text-align: left; }
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

  return (
    <Card style={{ maxWidth: 1240, margin: "auto" }}>
      <Title level={3}>Mẫu in</Title>

      <Spin spinning={loading}>
        <Form layout="vertical" form={form} onFinish={onFinish}>
          <Form.Item
            label="Tên mẫu in"
            name="name"
            rules={[{ required: true, message: "Vui lòng nhập tên mẫu in" }]}
          >
            <Input placeholder="Nhập tên mẫu in" />
          </Form.Item>

          {user.id_role == USER_ROLE.ADMIN && (
            <Form.Item
              label="Phòng khám"
              name="id_clinic"
              rules={[{ required: true, message: "Vui lòng chọn phòng khám" }]}
            >
              <Select placeholder="Chọn phòng khám">
                {clinics.map((s) => (
                  <Option key={s.id} value={s.id}>
                    {s.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          )}

          <TemplateHeaderEditor
            value={headerInfo}
            onChange={setHeaderInfo}
            headerInfo={headerInfo}
            form={form}
          />

          <Form.Item style={{ marginTop: 24 }}>
            <Button type="primary" htmlType="submit">
              {id_print_template ? "Cập nhật" : "Thêm mới"}
            </Button>
            <Button
              style={{ marginLeft: 8 }}
              onClick={() => navigate("/home/templates-print")}
            >
              Hủy
            </Button>
          </Form.Item>
        </Form>
      </Spin>
    </Card>
  );
};

export default TemplatePrintPreview;
