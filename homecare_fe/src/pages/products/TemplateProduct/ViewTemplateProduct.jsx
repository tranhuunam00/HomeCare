import React, { useEffect, useState } from "react";
import { Form, Input, Select, Card, Typography, message, Spin } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import API_CALL from "../../../services/axiosClient";
import useToast from "../../../hooks/useToast";
import { useGlobalAuth } from "../../../contexts/AuthContext";
import { replaceInputsInHtml } from "../../patient/Use/PatientUseTemplate";

const { Title } = Typography;
const { Option } = Select;

const ViewTemplateProduct = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [combinedHtml, setCombinedHtml] = useState("");

  const { showError } = useToast();
  const { user } = useGlobalAuth();

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
    if (id) {
      API_CALL.get(`/templates/${id}`)
        .then((res) => {
          const data = res.data.data;
          form.setFieldsValue(data);
          const imageListForm = [];

          const links = data.template_images.map(
            (img) => img.attachment_url || "#"
          );
          if (Array.isArray(data.template_images)) {
            data.template_images.forEach((img) => {
              imageListForm.push({
                url: img.url,
                rawUrl: img.url,
                caption: img.description,
              });
            });
          }

          const html = `
            <style>
              table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
              th, td { border: 1px solid #ccc; padding: 2px; text-align: left; }
              h3 {margin-bottom: 20px; margin-top: 40px;}
            </style>
            <h3>QUY TRÌNH KĨ THUẬT</h3>
            ${replaceInputsInHtml(data?.description || "", [])}
            <h3>MÔ TẢ HÌNH ẢNH</h3>
            <div style="display: flex; justify-content: center; gap: 40px; margin-top: 50px; font-size: 13px">
      <div style="text-align: center; width: 300px;">
        <img
          src="${imageListForm[0]?.url}"
          alt=""
          style="width: 300px; height: 200px; object-fit: cover; border-radius: 5px;"
        >
        <p style="margin: 8px 0 4px;">
        <a href="${
          links[0]
        }" target="_blank" rel="noopener noreferrer" style="color: #007bff; text-decoration: underline; font-weight: bold;">
          ${imageListForm[0]?.caption || ""}
        </a>
      </p>
        
      </div>

      <div style="text-align: center; width: 300px; font-size: 13px">
        <img
          src="${imageListForm[1]?.url}"
          alt="Minh họa quy trình chụp MRI"
          style="width: 300px; height: 200px; object-fit: cover; border-radius: 5px;"
        >
        <p style="margin: 8px 0 4px;">
        <a href="${
          links[1]
        }" target="_blank" rel="noopener noreferrer" style="color: #007bff; text-decoration: underline; font-weight: bold;">
          ${imageListForm[1]?.caption || ""}
        </a>
      </p>
      </div>
    </div>
            ${replaceInputsInHtml(data?.result || "", [])}
            <h3>KẾT LUẬN CHẨN ĐOÁN</h3>
            ${replaceInputsInHtml(data?.recommendation || "", [])}
          `;
          setCombinedHtml(html);
        })
        .catch(() => message.error("Không thể tải dữ liệu chi tiết"))
        .finally(() => setLoading(false));
    }
  }, [id, form]);

  console.log("combinedHtml", combinedHtml);
  return (
    <div style={{ display: "flex" }}>
      <Card
        style={{
          maxWidth: 800,
          marginRight: 60,
        }}
      >
        <Title level={3}>Xem chi tiết mẫu kết quả</Title>
        <Form layout="vertical" form={form} disabled>
          <Form.Item label="Tên" name="name">
            <Input disabled />
          </Form.Item>

          <Form.Item label="Dịch vụ" name="id_template_service">
            <Select placeholder="Chọn dịch vụ" disabled>
              {services.map((s) => (
                <Option key={s.id} value={s.id}>
                  {s.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="Mô tả ngắn gọn" name="short_description">
            <Input disabled />
          </Form.Item>
        </Form>
      </Card>

      <Card style={{ width: 1000 }}>
        <Title level={3}>Nội dung hiển thị</Title>
        <div
          dangerouslySetInnerHTML={{ __html: combinedHtml }}
          style={{ padding: "16px", border: "1px solid #ddd", borderRadius: 8 }}
        />
      </Card>
    </div>
  );
};

export default ViewTemplateProduct;
