// src/components/ImageWithCaptionInput.jsx
import React, { useEffect, useState } from "react";
import { Upload, Input, Button, Row, Col } from "antd";
import { PlusOutlined, UploadOutlined, DeleteOutlined } from "@ant-design/icons";

const ImageWithCaptionInput = ({
  value = [],
  onChange,
  links,
  setLinks = () => {},
  max,
  disabled,
}) => {
  const [images, setImages] = useState(value);

  useEffect(() => {
    if (value) setImages(value);
  }, [value]);

  const handleAddImage = () => {
    const newList = [...images, { url: "", caption: "" }];

    setImages(newList);

    onChange?.(newList);
  };

  const handleImageChange = (file, index) => {
    const preview = URL.createObjectURL(file);
    const newList = [...images];

    newList[index].file = file;

    newList[index].url = preview;

    newList[index].rawUrl = "";

    setImages(newList);

    onChange?.(newList);
    return false;
  };

  const handleCaptionChange = (e, index) => {
    const newList = [...images];

    newList[index].caption = e.target.value;

    setImages(newList);

    onChange?.(newList);
  };

  const handleRemove = (index) => {
    const newList = images.filter((_, i) => i !== index);

    setImages(newList);

    onChange?.(newList);
  };

  return (
    <div>
      <Row gutter={[8, 8]}>
        {images.map((item, index) => (
          <Col key={index} xs={12} sm={12} md={8}>
            <div
              style={{
                border: "1px solid #e2e8f0",
                borderRadius: 8,
                padding: 8,
                background: "#f8fafc",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 4,
                }}
              >
                <Upload
                  showUploadList={false}
                  beforeUpload={(file) => handleImageChange(file, index)}
                  accept=".jpg,.jpeg,.png"
                >
                  <Button size="small" disabled={disabled} icon={<UploadOutlined />}>
                    Chọn ảnh
                  </Button>
                </Upload>
                <Button
                  size="small"
                  disabled={disabled}
                  danger
                  type="text"
                  icon={<DeleteOutlined />}
                  onClick={() => handleRemove(index)}
                  title="Xóa ảnh"
                />
              </div>
              {item.url && (
                <img
                  src={item.url}
                  alt="preview"
                  style={{
                    width: "100%",
                    height: 88,
                    objectFit: "cover",
                    borderRadius: 6,
                    marginTop: 6,
                    display: "block",
                  }}
                />
              )}
              <Input.TextArea
                size="small"
                disabled={disabled}
                placeholder="Chú thích ảnh"
                value={item.caption}
                onChange={(e) => handleCaptionChange(e, index)}
                autoSize={{ minRows: 1, maxRows: 3 }}
                style={{ marginTop: 6, fontSize: 12 }}
              />

              {links && (
                <Input.TextArea
                  size="small"
                  placeholder="Link đính kèm"
                  value={links[index]}
                  onChange={(e) => {
                    const newLink = [...links];
                    newLink[index] = e.target.value;
                    setLinks(newLink);
                  }}
                  rows={2}
                  style={{ marginTop: 6, fontSize: 12 }}
                />
              )}
            </div>
          </Col>
        ))}
      </Row>
      <Button
        size="small"
        icon={<PlusOutlined />}
        onClick={handleAddImage}
        style={{ marginTop: 8, marginBottom: 8 }}
        disabled={images.length >= max || disabled}
      >
        Thêm ảnh
      </Button>
    </div>
  );
};

export default ImageWithCaptionInput;
