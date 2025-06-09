import React, { useEffect, useState } from "react";
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
import CustomSunEditor from "../../../components/Suneditor/CustomSunEditor";
import storage from "../../../services/storage";

const { Title } = Typography;
const { Option } = Select;

const AddOrEditTemplateProduct = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);

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
      setLoading(true);
      API_CALL.get(`/templates/${id}`)
        .then((res) => {
          const data = res.data.data;
          console.log(" API_CALL.get(`/templates/${id}`)");
          console.log(data);
          form.setFieldsValue(data);
        })
        .catch(() => message.error("Không thể tải dữ liệu chi tiết"))
        .finally(() => setLoading(false));
    }
  }, [id, form]);

  const onFinish = async (values) => {
    try {
      const user = storage.get("USER");

      const payload = {
        ...values,
        id_user: user?.id || 3,
        id_clinic: 1,
        updated_at: Date.now(),
      };
      if (!id) payload.createdAt = Date.now();

      console.log("📤 Payload gửi lên:", payload);

      if (id) {
        await API_CALL.patch(`/templates/${id}`, payload);
        message.success("Đã cập nhật mẫu kết quả thành công");
      } else {
        await API_CALL.post("/templates", payload);
        message.success("Đã thêm mẫu kết quả thành công");
      }
      navigate("/home/templates");
    } catch (err) {
      console.error("❌ Lỗi khi gửi:", err);
      message.error("Gửi mẫu kết quả thất bại");
    }
  };

  return (
    <Card style={{ maxWidth: 800, margin: "auto" }}>
      <Title level={3}>{id ? "Chỉnh sửa" : "Thêm mới"} mẫu kết quả</Title>
      <Spin spinning={loading}>
        <Form layout="vertical" form={form} onFinish={onFinish}>
          <Form.Item label="Tên" name="name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item
            label="Dịch vụ"
            name="id_template_service"
            rules={[{ required: true }]}
          >
            <Select placeholder="Chọn dịch vụ">
              {services.map((s) => (
                <Option key={s.id} value={s.id}>
                  {s.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="Mô tả ngắn gọn" name="short_description">
            <Input />
          </Form.Item>

          <Form.Item label="Mô tả và kỹ thuật" name="description">
            <CustomSunEditor
              value={form.getFieldValue("description")}
              onChange={(value) => form.setFieldValue("description", value)}
            />
          </Form.Item>

          <Form.Item label="Kết quả" name="result">
            <CustomSunEditor
              value={form.getFieldValue("result")}
              onChange={(value) => form.setFieldValue("result", value)}
            />
          </Form.Item>

          <Form.Item label="Khuyến nghị" name="recommendation">
            <CustomSunEditor
              value={form.getFieldValue("recommendation")}
              onChange={(value) => form.setFieldValue("recommendation", value)}
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              {id ? "Cập nhật" : "Thêm mới"}
            </Button>
            <Button
              style={{ marginLeft: 8 }}
              onClick={() => navigate("/home/products")}
            >
              Hủy
            </Button>
          </Form.Item>
        </Form>
      </Spin>
    </Card>
  );
};

export default AddOrEditTemplateProduct;
