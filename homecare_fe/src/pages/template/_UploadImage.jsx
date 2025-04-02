import React, { useState } from "react";

const ImageUploader = () => {
  const [localImage, setLocalImage] = useState(null);

  // Xử lý ảnh người dùng chọn từ máy tính
  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setLocalImage(URL.createObjectURL(file));
    }
  };

  return (
    <div className="p-4">
      <div className="mb-4">
        <h3 className="font-semibold mb-2">Chọn ảnh mới:</h3>
        <input type="file" accept="image/*" onChange={handleImageChange} />
      </div>

      {/* Hiển thị ảnh người dùng vừa chọn */}
      {localImage && (
        <div style={{ width: 400 }}>
          <h3 className="font-semibold mb-2">Ảnh mới:</h3>
          <img
            src={localImage}
            alt="Local Upload"
            width={400}
            className="max-w-full h-auto rounded shadow"
          />
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
