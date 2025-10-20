import React, { useState, useRef } from "react";
import { Input, Button, Upload } from "antd";
import {
  EditOutlined,
  SaveOutlined,
  CloseOutlined,
  UploadOutlined,
} from "@ant-design/icons";

// Thêm component Header mới
export const Header = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState("PHÒNG KHÁM BÁC SĨ GIA ĐÌNH HOMECARE");
  const [logo, setLogo] = useState("/logo_home_care.png");
  const [contact, setContact] = useState({
    phone: "0969268000",
    website: "www.home-care.vn",
    email: "daogroupltd@gmail.com",
  });
  const [services, setServices] = useState([
    "Khám chữa bệnh từ xa",
    "Tư vấn kết quả y khoa theo yêu cầu",
    "Bệnh viện trực tuyến tại nhà",
  ]);
  const [tempServices, setTempServices] = useState(services);

  // Xử lý upload logo
  const handleLogoChange = (info) => {
    if (info.file.status === "done" || info.file.status === "uploading") {
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogo(e.target.result);
      };
      reader.readAsDataURL(info.file.originFileObj);
    }
  };

  // Lưu thay đổi
  const handleSave = () => {
    setServices(tempServices);
    setIsEditing(false);
  };

  // Hủy chỉnh sửa
  const handleCancel = () => {
    setTempServices(services);
    setIsEditing(false);
  };

  return (
    <div style={{ marginBottom: "20px", position: "relative" }}>
      {/* Nút sửa */}
      {!isEditing && (
        <Button
          className="no-print"
          icon={<EditOutlined />}
          type="text"
          style={{ position: "absolute", top: 0, right: 0, zIndex: 2 }}
          onClick={() => setIsEditing(true)}
        />
      )}
      <div style={{ display: "flex", alignItems: "center", gap: "60px" }}>
        <div style={{ width: "100px", position: "relative" }}>
          {isEditing ? (
            <Upload
              showUploadList={false}
              beforeUpload={() => false}
              onChange={handleLogoChange}
            >
              <Button icon={<UploadOutlined />}>Đổi logo</Button>
            </Upload>
          ) : (
            <img src={logo} alt="HomeCare Logo" style={{ width: "100%" }} />
          )}
        </div>
        <div style={{ flex: 1 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <div>
              {isEditing ? (
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  style={{ fontWeight: "bold", fontSize: 20, marginBottom: 8 }}
                />
              ) : (
                <h3 style={{ margin: 0 }} className="name_title">
                  {title}
                </h3>
              )}
              <div style={{ display: "flex", justifyContent: "flex-start" }}>
                <ul
                  style={{
                    listStyle: "none",
                    paddingLeft: 40,
                    margin: "10px 0",
                  }}
                >
                  {isEditing
                    ? tempServices.map((s, idx) => (
                        <li
                          key={idx}
                          style={{ textAlign: "left", marginBottom: 4 }}
                        >
                          <Input
                            value={s}
                            onChange={(e) => {
                              const newArr = [...tempServices];
                              newArr[idx] = e.target.value;
                              setTempServices(newArr);
                            }}
                            style={{ width: 300 }}
                          />
                        </li>
                      ))
                    : services.map((s, idx) => (
                        <li key={idx} style={{ textAlign: "left" }}>
                          - {s}
                        </li>
                      ))}
                </ul>
              </div>
            </div>
            <div style={{ textAlign: "left", minWidth: 180 }}>
              {isEditing ? (
                <>
                  <p style={{ margin: "0 0 5px 0" }}>THÔNG TIN LIÊN HỆ</p>
                  <Input
                    value={contact.phone}
                    onChange={(e) =>
                      setContact({ ...contact, phone: e.target.value })
                    }
                    style={{ marginBottom: 4 }}
                  />
                  <Input
                    value={contact.website}
                    onChange={(e) =>
                      setContact({ ...contact, website: e.target.value })
                    }
                    style={{ marginBottom: 4 }}
                  />
                  <Input
                    value={contact.email}
                    onChange={(e) =>
                      setContact({ ...contact, email: e.target.value })
                    }
                  />
                </>
              ) : (
                <>
                  <p style={{ margin: "0 0 5px 0" }}>THÔNG TIN LIÊN HỆ</p>
                  <p style={{ margin: "0 0 5px 0" }}>Tele: {contact.phone}</p>
                  <a
                    href={`http://${contact.website}`}
                    style={{ display: "block", margin: "0 0 5px 0" }}
                  >
                    {contact.website}
                  </a>
                  <a href={`mailto:${contact.email}`}>{contact.email}</a>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Nút lưu/hủy */}
      {isEditing && (
        <div style={{ marginTop: 12, textAlign: "right" }}>
          <Button
            icon={<SaveOutlined />}
            type="primary"
            onClick={handleSave}
            style={{ marginRight: 8 }}
          >
            Lưu
          </Button>
          <Button icon={<CloseOutlined />} onClick={handleCancel}>
            Hủy
          </Button>
        </div>
      )}
    </div>
  );
};
