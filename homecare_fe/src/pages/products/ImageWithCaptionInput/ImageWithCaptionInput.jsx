// src/components/ImageWithCaptionInput.jsx
import React, { useEffect, useState } from "react";
import { Upload, Input, Button, Row, Col, Form, message } from "antd";
import { PlusOutlined, UploadOutlined } from "@ant-design/icons";

const ImageWithCaptionInput = ({
  value = [],
  onChange,
  valueTrans = [],
  onChangeTrans,
}) => {
  const [images, setImages] = useState(value);
  const [imagesTrans, setImagesTrans] = useState(valueTrans);

  useEffect(() => {
    setImages(value);
    setImagesTrans(valueTrans);
  }, [value, valueTrans]);

  const handleAddImage = () => {
    const newList = [...images, { url: "", caption: "" }];
    const newListTrans = [...imagesTrans, { url: "", caption: "" }];

    setImages(newList);
    setImagesTrans(newListTrans);

    onChange?.(newList);
    onChangeTrans?.(newListTrans);
  };

  const handleImageChange = (file, index) => {
    const preview = URL.createObjectURL(file);
    const newList = [...images];
    const newListTrans = [...imagesTrans];

    newList[index].file = file;
    newListTrans[index].file = file;

    newList[index].url = preview;
    newListTrans[index].url = preview;

    setImages(newList);
    setImagesTrans(newListTrans);

    onChange?.(newList);
    onChangeTrans?.(newListTrans);
    return false;
  };

  const handleCaptionChange = (e, index) => {
    const newList = [...images];
    const newListTrans = [...imagesTrans];

    newList[index].caption = e.target.value;
    newListTrans[index].caption = e.target.value;

    setImages(newList);
    setImagesTrans(newListTrans);

    onChange?.(newList);
    onChangeTrans?.(newListTrans);
  };

  const handleRemove = (index) => {
    const newList = images.filter((_, i) => i !== index);
    const newListTrans = imagesTrans.filter((_, i) => i !== index);

    setImages(newList);
    setImagesTrans(newListTrans);

    onChange?.(newList);
    onChangeTrans?.(newListTrans);
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
