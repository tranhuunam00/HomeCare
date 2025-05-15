import React, { useState } from "react";
import { Card, Button, Upload, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import styles from "./AccountPage.module.scss";

const SignatureSection = () => {
  const [signatureUrl, setSignatureUrl] = useState(null);

  const handleUpload = ({ file }) => {
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      message.error("Chỉ hỗ trợ định dạng hình ảnh!");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setSignatureUrl(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const resetSignature = () => {
    setSignatureUrl(null);
  };

  return (
    <Card className={styles["account-page__card"]} title="Cập nhật chữ ký">
      <div
        style={{
          border: "1px dashed #ccc",
          height: 200,
          marginBottom: 16,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#fafafa",
        }}
      >
        {signatureUrl ? (
          <img
            src={signatureUrl}
            alt="Chữ ký"
            style={{
              maxHeight: "100%",
              maxWidth: "100%",
              objectFit: "contain",
            }}
          />
        ) : (
          <span style={{ color: "#aaa" }}>Chưa có chữ ký</span>
        )}
      </div>

      <Upload
        showUploadList={false}
        beforeUpload={() => false}
        onChange={handleUpload}
        accept="image/*"
      >
        <Button icon={<UploadOutlined />}>Tải ảnh chữ ký</Button>
      </Upload>

      <Button style={{ marginLeft: 8 }} onClick={resetSignature}>
        Đặt lại
      </Button>
    </Card>
  );
};

export default SignatureSection;
