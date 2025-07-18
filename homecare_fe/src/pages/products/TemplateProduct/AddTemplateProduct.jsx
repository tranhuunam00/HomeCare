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
import ImageWithCaptionInput from "../ImageWithCaptionInput/ImageWithCaptionInput";

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
  const [imageList, setImageList] = useState([]);
  const [links, setLinks] = useState([]);

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
        .then(async (res) => {
          const data = res.data.data;

          const isAdmin = user?.id_role == USER_ROLE.ADMIN;
          const isOwner = data?.id_user == user?.id;

          if (!isAdmin && !isOwner) {
            message.error("Bạn không có quyền chỉnh sửa mẫu này");
            return navigate("/home/templates");
          }
          const template_images = data.template_images;
          const newImageList = [];
          const newLink = [];

          for (const img of template_images) {
            newLink.push(img.attachment_url);

            try {
              const response = await fetch(img.url);
              const blob = await response.blob();

              const filename = img.url.split("/").pop() || "image.jpg";
              const file = new File([blob], filename, { type: blob.type });

              newImageList.push({
                url: img.url,
                caption: img.description,
                file, // để gán vào `Upload` hoặc form
              });
            } catch (error) {
              console.error("Lỗi tải ảnh từ URL:", img.url, error);
            }
          }
          setLinks(newLink);
          setImageList(newImageList);
          form.setFieldsValue(data);
        })
        .catch(() => message.error("Không thể tải dữ liệu chi tiết"))
        .finally(() => setLoading(false));
    }
  }, [id, form]);

  const onFinish = async (values) => {
    try {
      const user = storage.get("USER");

      // Bước 1: Chuẩn bị FormData
      const formData = new FormData();

      formData.append("id_user", user?.id || 3);
      formData.append("id_clinic", 1);
      formData.append("updated_at", Date.now().toString());
      Object.entries(values).forEach(([key, value]) => {
        if (
          key !== "images" &&
          key !== "imagesDesc" &&
          value !== undefined &&
          value !== null
        ) {
          formData.append(key, value);
        }
      });

      if (!id) {
        formData.append("createdAt", Date.now().toString());

        // Bước 2: Gắn các trường thông thường (trừ ảnh)

        // Bước 3: Gắn ảnh
        if (imageList?.length) {
          imageList.forEach((file) => {
            formData.append("images", file.file); // same field name for multiple images
          });
        }

        // Bước 4: Tạo imagesDesc từ imageList + links
        const imagesDesc = [];
        imageList.forEach((img, index) => {
          imagesDesc.push({
            description: img.caption,
            attachment_url: links[index],
          });
        });

        if (imagesDesc.length) {
          formData.append("imagesDesc", JSON.stringify(imagesDesc));
        }
      }
      // Bước 5: Gửi API
      if (id) {
        await API_CALL.patchForm(`/templates/${id}`, formData);
      } else {
        await API_CALL.postForm("/templates", formData);
      }

      showSuccess("Đã lưu thành công");
      navigate("/home/templates");
    } catch (err) {
      console.error("❌ Lỗi khi gửi:", err);
      showError("Gửi mẫu kết quả thất bại: " + err?.response?.data?.message);
    }
  };

  const onFinishWithImage = async (values) => {
    values = form.getFieldsValue();
    try {
      const user = storage.get("USER");

      // Bước 1: Chuẩn bị FormData
      const formData = new FormData();

      formData.append("id_user", user?.id || 3);
      formData.append("id_clinic", 1);
      formData.append("updated_at", Date.now().toString());
      if (!id) {
        formData.append("createdAt", Date.now().toString());
      }

      // Bước 2: Gắn các trường thông thường (trừ ảnh)
      Object.entries(values).forEach(([key, value]) => {
        if (
          key !== "images" &&
          key !== "imagesDesc" &&
          value !== undefined &&
          value !== null
        ) {
          formData.append(key, value);
        }
      });

      // Bước 3: Gắn ảnh
      if (imageList?.length) {
        imageList.forEach((file) => {
          formData.append("images", file.file); // same field name for multiple images
        });
      }

      // Bước 4: Tạo imagesDesc từ imageList + links
      const imagesDesc = [];
      imageList.forEach((img, index) => {
        imagesDesc.push({
          description: img.caption,
          attachment_url: links[index],
        });
      });

      if (imagesDesc.length) {
        formData.append("imagesDesc", JSON.stringify(imagesDesc));
      }

      // Bước 5: Gửi API
      if (id) {
        await API_CALL.patchForm(`/templates/${id}`, formData);
      } else {
        await API_CALL.postForm("/templates", formData);
      }

      showSuccess("Đã lưu thành công");
      navigate("/home/templates");
    } catch (err) {
      console.error("❌ Lỗi khi gửi:", err);
      showError("Gửi mẫu kết quả thất bại: " + err?.response?.data?.message);
    }
  };

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
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  label="Ngôn ngữ"
                  name="language"
                  rules={[
                    { required: true, message: "Vui lòng chọn ngôn ngữ" },
                  ]}
                >
                  <Select placeholder="Chọn ngôn ngữ">
                    <Select.Option value="vi">Tiếng Việt</Select.Option>
                    <Select.Option value="en">English</Select.Option>
                  </Select>
                </Form.Item>
              </Col>

              <Col span={16}>
                <Form.Item
                  label="Dịch vụ"
                  name="id_template_service"
                  rules={[{ required: true }]}
                >
                  <Select placeholder="Chọn dịch vụ">
                    {services.map((s) => (
                      <Select.Option key={s.id} value={s.id}>
                        {s.name}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item label="Mô tả ngắn gọn" name="short_description">
              <Input />
            </Form.Item>
            <Button
              onClick={onFinishWithImage}
              type="dashed"
              style={{ marginTop: 16, backgroundColor: "burlywood" }}
              disabled={!id}
            >
              Cập nhật ảnh
            </Button>
            <Form.Item label="Hình ảnh minh họa">
              <ImageWithCaptionInput
                value={imageList}
                onChange={setImageList}
                valueTrans={imageList}
                onChangeTrans={setImageList}
                links={links}
                setLinks={setLinks}
                max={2}
              />
            </Form.Item>

            <Form.Item label=" QUY TRÌNH KỸ THUẬT" name="description">
              <CustomSunEditor
                value={form.getFieldValue("description")}
                onChange={(value) => {
                  form.setFieldValue("description", value);
                  setDescriptionText(value);
                }}
              />
            </Form.Item>

            <Form.Item label="MÔ TẢ HÌNH ẢNH" name="result">
              <CustomSunEditor
                value={form.getFieldValue("result")}
                onChange={(value) => {
                  form.setFieldValue("result", value);
                  setResultText(value);
                }}
              />
            </Form.Item>

            <Form.Item label="KẾT LUẬN CHẨN ĐOÁN" name="recommendation">
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
      <Card style={{ width: 700 }}>
        <Title level={3}>Mô phỏng nhập liệu</Title>

        <h2>QUY TRÌNH KỸ THUẬT</h2>
        {renderDynamicAntdFields(extractDynamicFieldsFromHtml(descriptionText))}
        <h2>MÔ TẢ HÌNH ẢNH</h2>
        {renderDynamicAntdFields(extractDynamicFieldsFromHtml(resultText))}
        <h2>KẾT LUẬN CHẨN ĐOÁN</h2>
        {renderDynamicAntdFields(
          extractDynamicFieldsFromHtml(recommendationText)
        )}
      </Card>
    </div>
  );
};

export default AddOrEditTemplateProduct;
