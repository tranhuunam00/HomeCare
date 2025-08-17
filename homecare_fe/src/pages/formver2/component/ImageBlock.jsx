import {
  Form,
  Row,
  Col,
  Image,
  Input,
  Typography,
  Upload,
  message,
} from "antd";
import { InboxOutlined } from "@ant-design/icons";
import React, { useEffect, useState } from "react";

const { Text } = Typography;
const { Dragger } = Upload;

const safeOpen = (raw) => {
  if (!raw) return message.warning("Chưa có đường dẫn để mở");
  let url = raw.trim();
  if (!/^https?:\/\//i.test(url)) url = `https://${url}`; // tự thêm schema nếu thiếu
  window.open(url, "_blank", "noopener,noreferrer");
};

export default function ImageBlock({ form, namePrefix, src, title }) {
  const descName = `${namePrefix}Desc`;
  const linkName = `${namePrefix}Link`;

  const linkVal = Form.useWatch(linkName, form);
  const descVal = Form.useWatch(descName, form);

  // preview ảnh: khởi tạo từ prop src, thay đổi khi người dùng chọn ảnh mới
  const [previewSrc, setPreviewSrc] = useState(src);

  useEffect(() => {
    setPreviewSrc(src);
  }, [src]);

  const draggerProps = {
    name: "file",
    multiple: false,
    maxCount: 1,
    accept: ".png,.jpg,.jpeg,.webp",
    beforeUpload: (file) => {
      const isImg = /image\/(png|jpeg|jpg|webp)/.test(file.type);
      if (!isImg) {
        message.error("Chỉ nhận PNG/JPG/JPEG/WEBP");
        return Upload.LIST_IGNORE;
      }
      const url = URL.createObjectURL(file);
      setPreviewSrc(url);
      message.success("Đã chọn ảnh (chỉ hiển thị cục bộ)");
      return false; // chặn upload thật
    },
    onRemove: () => {
      setPreviewSrc(src); // quay về ảnh gốc
    },
  };

  return (
    <div style={{ width: "100%" }}>
      {/* Ảnh hiển thị – bấm để mở link */}
      <div
        style={{ cursor: linkVal ? "pointer" : "default" }}
        onClick={() => safeOpen(linkVal)}
      >
        <Image
          src={previewSrc}
          alt={title}
          style={{
            width: "100%", // chiếm full chiều ngang
            height: 300, // cố định chiều cao 300px
            objectFit: "cover", // bo ảnh cho vừa khung, không méo
            borderRadius: 8,
          }}
          preview={false}
        />
      </div>
      <Text
        type="secondary"
        style={{ display: "block", marginTop: 8, textAlign: "center" }}
      >
        {title}
      </Text>

      {/* Upload/Dragger để thay ảnh */}
      <Dragger {...draggerProps} style={{ marginTop: 8 }}>
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">
          Kéo & thả ảnh vào đây, hoặc bấm để chọn
        </p>
        <p className="ant-upload-hint">
          PNG/JPG/JPEG/WEBP • 1 ảnh • Chỉ preview cục bộ
        </p>
      </Dragger>

      {/* Hai ô input: Mô tả & Link */}
      <Row gutter={8} style={{ marginTop: 12 }}>
        <Col span={24}>
          <Form.Item
            name={descName}
            label="Mô tả"
            rules={[{ required: true, message: "Nhập mô tả ngắn" }]}
          >
            <Input placeholder="Nhập mô tả ảnh" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={8} style={{ marginTop: 12 }}>
        <Col span={24}>
          <Form.Item
            name={linkName}
            label="Link"
            tooltip="Nhập URL (vd: https://...)"
            rules={[
              {
                validator: (_, v) => {
                  if (!v) return Promise.resolve();
                  const ok = /^(https?:\/\/)?[\w.-]+(\.[\w.-]+)+\S*$/i.test(v);
                  const ok2 = /^(http?:\/\/)?[\w.-]+(\.[\w.-]+)+\S*$/i.test(v);

                  return ok || ok2
                    ? Promise.resolve()
                    : Promise.reject("Link không hợp lệ");
                },
              },
            ]}
          >
            <Input placeholder="https://... hoặc domain.com/..." />
          </Form.Item>
        </Col>
      </Row>
      {/* Bấm vào mô tả cũng mở link */}
      <div style={{ marginTop: -8 }}>
        {descVal ? (
          <a
            onClick={() => safeOpen(linkVal)}
            style={{ cursor: linkVal ? "pointer" : "not-allowed" }}
          >
            {descVal}
          </a>
        ) : (
          <Text type="secondary">— Nhập mô tả để hiện link có thể bấm —</Text>
        )}
      </div>
    </div>
  );
}
