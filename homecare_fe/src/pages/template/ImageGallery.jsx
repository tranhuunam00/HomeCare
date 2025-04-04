import React, { useState } from "react";
import "./ImageGallery.css"; // Đảm bảo bạn có file CSS để định dạng

const ImageGallery = ({ images }) => {
  const [selectedImages, setSelectedImages] = useState(images); // Trạng thái để lưu trữ hình ảnh đã chọn

  const handleImageClick = (index) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = e.target.files[0];
      console.log("file ", file);
      if (file) {
        const newImage = URL.createObjectURL(file);
        console.log("newImage ", newImage);
        const newImages = [...selectedImages];
        newImages[index] = { src: newImage, alt: file.name }; // Cập nhật hình ảnh đã chọn
        setSelectedImages(newImages);
        console.log("selectedImages ", selectedImages);
      }
    };
    input.click();
  };

  return (
    <div className="image-gallery">
      <h5 className="gallery-title">HÌNH ẢNH Minh Họa</h5>
      <div className="gallery-images">
        {selectedImages.map((image, index) => (
          <div
            className="image-item"
            key={index}
            onClick={() => handleImageClick(index)}
          >
            <img src={image.src} alt={image.alt} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageGallery;
