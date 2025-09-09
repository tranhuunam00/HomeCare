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
import React, { useEffect, useMemo, useRef, useState } from "react";

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
  onChange,
  disabled,
}) {
  const descName = `${namePrefix}Desc`;
  const linkName = `${namePrefix}DescLink`; // ⚠️ đồng bộ với BE: ...DescLink
  const fileName = `${namePrefix}File`; // gửi file qua field này

  const linkVal = Form.useWatch(linkName, form);
  const descVal = Form.useWatch(descName, form);
  const fileList = Form.useWatch(fileName, form) || [];

  const [previewSrc, setPreviewSrc] = useState(src || "");
  const currentUrlRef = useRef(null);

  const firstFileObj = fileList?.[0]?.originFileObj || null;
  const firstFileUid = fileList?.[0]?.uid || null;
  useEffect(() => {
    if (firstFileObj) return;
    if (currentUrlRef.current?.startsWith?.("blob:")) {
      URL.revokeObjectURL(currentUrlRef.current);
    }

    currentUrlRef.current = src || "";
    setPreviewSrc(src || "");
    onChange?.(src || "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src, firstFileObj]);

  /* ✅ Effect 2: tạo blob URL khi file đầu tiên thay đổi */
  useEffect(() => {
    if (!firstFileObj) return;

    const newBlobUrl = URL.createObjectURL(firstFileObj);

    // nếu URL không đổi thì bỏ
    if (newBlobUrl === currentUrlRef.current) return;

    // revoke cũ nếu là blob
    if (currentUrlRef.current?.startsWith?.("blob:")) {
      URL.revokeObjectURL(currentUrlRef.current);
    }

    currentUrlRef.current = newBlobUrl;
    setPreviewSrc(newBlobUrl);
    onChange?.(newBlobUrl);

    // cleanup khi file thay/unmount
    return () => {
      if (newBlobUrl && newBlobUrl.startsWith("blob:")) {
        URL.revokeObjectURL(newBlobUrl);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firstFileUid]);

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
    <div
      style={{
        width: "100%",
      }}
    >
      {/* Ảnh hiển thị – bấm để mở link */}
      <div
        style={{
          cursor: linkVal ? "pointer" : "default",
          display: "flex",
          justifyContent: "center",
        }}
        onClick={() => safeOpen(linkVal)}
      >
        <Image
          src={previewSrc}
          alt={title}
          style={{
            width: 300,
            height: 220,
            objectFit: "cover",
            borderRadius: 8,
          }}
          preview={false}
        />
      </div>

      {/* Upload/Dragger: BỌC TRONG Form.Item để file vào form */}
      <Form.Item
        name={fileName}
        valuePropName="fileList"
        getValueFromEvent={normFileList}
        style={{
          marginTop: 8,
          display: "flex",
          alignItems: "center", // căn giữa dọc
          justifyContent: "center",
        }}
      >
        <Dragger
          disabled={disabled}
          {...draggerProps}
          showUploadList={false}
          style={{
            height: 40,
            borderRadius: 8,
            padding: "0 0",
            width: 150,
          }}
        >
          <p
            className="ant-upload-drag-icon"
            style={{ margin: 0, lineHeight: 1, textAlign: "center" }}
          >
            <InboxOutlined style={{ fontSize: 32, color: "#1890ff" }} />
          </p>
        </Dragger>
      </Form.Item>

      {/* Hai ô input: Mô tả & Link */}
      <Row gutter={8} style={{ marginTop: 0 }}>
        <Col span={24}>
          <Form.Item
            name={descName}
            label="Mô tả"
            rules={[{ required: true, message: "Nhập mô tả ngắn" }]}
          >
            <Input disabled={disabled} placeholder="Nhập mô tả ảnh" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={8} style={{ marginTop: 0 }}>
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
            <Input
              disabled={disabled}
              placeholder="https://... hoặc domain.com/..."
            />
          </Form.Item>
        </Col>
      </Row>
    </div>
  );
}
