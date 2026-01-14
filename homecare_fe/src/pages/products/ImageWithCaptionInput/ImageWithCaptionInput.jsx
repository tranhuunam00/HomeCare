// src/components/ImageWithCaptionInput.jsx
import React, { useEffect, useState } from "react";
import { Upload, Input, Button, Row, Col } from "antd";
import { PlusOutlined, UploadOutlined } from "@ant-design/icons";

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
      <Row gutter={[16, 16]}>
        {images.map((item, index) => (
          <Col key={index} span={16} md={8}>
            <div style={{ border: "1px solid #ccc", padding: 8 }}>
              <Upload
                showUploadList={false}
                beforeUpload={(file) => handleImageChange(file, index)}
                accept=".jpg,.jpeg,.png"
              >
                <Button disabled={disabled} icon={<UploadOutlined />}>
                  Chọn ảnh
                </Button>
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
                disabled={disabled}
                placeholder="Chú thích ảnh"
                value={item.caption}
                onChange={(e) => handleCaptionChange(e, index)}
                autoSize={{ minRows: 1, maxRows: 6 }}
                style={{ marginTop: 8 }}
              />

              {links && (
                <Input.TextArea
                  placeholder="Link đính kèm"
                  value={links[index]}
                  onChange={(e) => {
                    const newLink = [...links];
                    newLink[index] = e.target.value;
                    setLinks(newLink);
                  }}
                  rows={3}
                  style={{ marginTop: 8 }}
                />
              )}
              <Button
                disabled={disabled}
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
      <Button
        icon={<PlusOutlined />}
        onClick={handleAddImage}
        style={{ marginBottom: 12 }}
        disabled={images.length >= max || disabled}
      >
        Thêm ảnh
      </Button>
    </div>
  );
};

export default ImageWithCaptionInput;
