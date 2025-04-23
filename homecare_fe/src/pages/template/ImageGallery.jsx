import React, { useState } from "react";
import "./ImageGallery.css"; // Đảm bảo bạn có file CSS để định dạng

const ImageGallery = ({ images }) => {
  const [selectedImages, setSelectedImages] = useState(images); // Trạng thái để lưu trữ hình ảnh đã chọn
  const [captions, setCaptions] = useState(images.map(() => "Chú thích ảnh"));

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

  const handleCaptionChange = (index, value) => {
    const newCaptions = [...captions];
    newCaptions[index] = value;
    setCaptions(newCaptions);
  };

  return (
    <div className="image-gallery">
      <div className="gallery-title" style={{ textAlign: "left" }}>
        HÌNH ẢNH MINH HỌA
      </div>
      <div className="gallery-images">
        {selectedImages.map((image, index) => (
          <div className="image-container" key={index}>
            <div
              className="image-item"
              key={index}
              onClick={() => handleImageClick(index)}
            >
              <img src={image.src} alt={image.alt} />
            </div>
            <div className="image-caption">
              <input
                value={captions[index]}
                onChange={(e) => handleCaptionChange(index, e.target.value)}
                style={{ textAlign: "center", border: "none", fontSize: 16 }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageGallery;
