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
  Col,
  Row,
} from "antd";
import { useNavigate, useParams } from "react-router-dom";
import API_CALL from "../../../services/axiosClient";
import CustomSunEditor from "../../../components/Suneditor/CustomSunEditor";
import storage from "../../../services/storage";
import useToast from "../../../hooks/useToast";
import { extractDynamicFieldsFromHtml, USER_ROLE } from "../../../constant/app";
import { renderDynamicAntdFields } from "../../../components/RenderInputFormTemplate";
import { useGlobalAuth } from "../../../contexts/AuthContext";

const { Title } = Typography;
const { Option } = Select;

const AddOrEditTemplateProduct = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const { showError, showSuccess } = useToast();
  const [resultText, setResultText] = useState("");
  const [descriptionText, setDescriptionText] = useState("");
  const [recommendationText, setRecommendationText] = useState("");

  const { user, doctor } = useGlobalAuth();
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

          const isAdmin = user?.id_role == USER_ROLE.ADMIN;
          const isOwner = data?.id_user == user?.id;

          if (!isAdmin && !isOwner) {
            message.error("Bạn không có quyền chỉnh sửa mẫu này");
            return navigate("/home/templates");
          }

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
      } else {
        await API_CALL.post("/templates", payload);
      }
      showSuccess("Đã thêm thành công");
      navigate("/home/templates");
    } catch (err) {
      console.error("❌ Lỗi khi gửi:", err);
      showError("Gửi mẫu kết quả thất bại: " + err?.response?.data?.message);
    }
  };

  console.log("des", resultText);

  console.log(extractDynamicFieldsFromHtml(resultText));
  return (
    <div style={{ display: "flex" }}>
      <Card
        style={{
          maxWidth: 800,
          marginRight: 60,
        }}
      >
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
                onChange={(value) => {
                  form.setFieldValue("description", value);
                  setDescriptionText(value);
                }}
              />
            </Form.Item>

            <Form.Item label="Kết quả" name="result">
              <CustomSunEditor
                value={form.getFieldValue("result")}
                onChange={(value) => {
                  form.setFieldValue("result", value);
                  setResultText(value);
                }}
              />
            </Form.Item>

            <Form.Item label="Khuyến nghị" name="recommendation">
              <CustomSunEditor
                value={form.getFieldValue("recommendation")}
                onChange={(value) => {
                  form.setFieldValue("recommendation", value);
                  setRecommendationText(value);
                }}
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
      <Card style={{ width: 500 }}>
        <Title level={3}>Chỗ nhập liệu</Title>

        <h2>Mô tả và kĩ thuật</h2>
        {renderDynamicAntdFields(extractDynamicFieldsFromHtml(descriptionText))}
        <h2>Kết quả</h2>
        {renderDynamicAntdFields(extractDynamicFieldsFromHtml(resultText))}
        <h2>Khuyến nghị</h2>
        {renderDynamicAntdFields(
          extractDynamicFieldsFromHtml(recommendationText)
        )}
      </Card>
    </div>
  );
};

export default AddOrEditTemplateProduct;
