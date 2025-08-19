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
import React, { useEffect, useMemo, useState } from "react";

const { Text } = Typography;
const { Dragger } = Upload;

const safeOpen = (raw) => {
  if (!raw) return message.warning("Chưa có đường dẫn để mở");
  let url = raw.trim();
  if (!/^https?:\/\//i.test(url)) url = `https://${url}`;
  window.open(url, "_blank", "noopener,noreferrer");
};

const normFileList = (e) => {
  // AntD pattern
  if (Array.isArray(e)) return e;
  return e?.fileList ?? [];
};

export default function ImageBlock({
  form,
  namePrefix, // "ImageLeft" | "ImageRight"
  src,
  title,
}) {
  const descName = `${namePrefix}Desc`;
  const linkName = `${namePrefix}DescLink`; // ⚠️ đồng bộ với BE: ...DescLink
  const fileName = `${namePrefix}File`; // gửi file qua field này

  const linkVal = Form.useWatch(linkName, form);
  const descVal = Form.useWatch(descName, form);
  const fileList = Form.useWatch(fileName, form) || [];

  // preview ảnh: ưu tiên file mới chọn, fallback props.src
  const previewSrc = useMemo(() => {
    const f = fileList?.[0]?.originFileObj;
    if (f) return URL.createObjectURL(f);
    return src;
  }, [fileList, src]);

  // Dragger config — không auto upload
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
      // return false để AntD không upload mà chỉ giữ trong fileList
      return false;
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
            width: "100%",
            height: 300,
            objectFit: "cover",
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

      {/* Upload/Dragger: BỌC TRONG Form.Item để file vào form */}
      <Form.Item
        name={fileName}
        valuePropName="fileList"
        getValueFromEvent={normFileList}
        style={{ marginTop: 8 }}
      >
        <Dragger {...draggerProps}>
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">
            Kéo & thả ảnh vào đây, hoặc bấm để chọn
          </p>
          <p className="ant-upload-hint">
            PNG/JPG/JPEG/WEBP • 1 ảnh • Preview cục bộ
          </p>
        </Dragger>
      </Form.Item>

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
              ({ getFieldValue }) => ({
                validator: async (_, v) => {
                  if (!v) return;
                  const ok = /^(https?:\/\/)?[\w.-]+(\.[\w.-]+)+\S*$/i.test(v);
                  if (!ok) throw new Error("Link không hợp lệ");
                },
              }),
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
