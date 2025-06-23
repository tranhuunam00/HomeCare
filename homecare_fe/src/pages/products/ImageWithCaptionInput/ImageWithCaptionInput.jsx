// src/components/ImageWithCaptionInput.jsx
import React, { useEffect, useState } from "react";
import { Upload, Input, Button, Row, Col, Form, message } from "antd";
import { PlusOutlined, UploadOutlined } from "@ant-design/icons";

const ImageWithCaptionInput = ({ value = [], onChange }) => {
  const [images, setImages] = useState(value);
  useEffect(() => {
    setImages(value);
  }, [value]);

  console.log("images", images);
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
      <Button
        icon={<PlusOutlined />}
        onClick={handleAddImage}
        style={{ marginBottom: 12 }}
      >
        Thêm ảnh
      </Button>
      <Row gutter={[16, 16]}>
        {images.map((item, index) => (
          <Col key={index} span={16} md={8}>
            <div style={{ border: "1px solid #ccc", padding: 8 }}>
              <Upload
                showUploadList={false}
                beforeUpload={(file) => handleImageChange(file, index)}
                accept=".jpg,.jpeg,.png"
              >
                <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
              </Upload>
              {item.url && (
                <img
                  src={item.url}
                  alt="preview"
                  style={{
                    width: 100,
                    height: 100,
                    objectFit: "cover",
                    marginTop: 8,
                  }}
                />
              )}
              <Input.TextArea
                placeholder="Chú thích ảnh"
                value={item.caption}
                onChange={(e) => handleCaptionChange(e, index)}
                rows={3}
                style={{ marginTop: 8 }}
              />
              <Button
                danger
                type="text"
                onClick={() => handleRemove(index)}
                style={{ marginTop: 4 }}
              >
                Xóa
              </Button>
            </div>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default ImageWithCaptionInput;
