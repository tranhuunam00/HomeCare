import React from "react";
import "./ImageGallery.css"; // Đảm bảo bạn có file CSS để định dạng

const ImageGallery = ({ images }) => {
  return (
    <div className="image-gallery">
      <h5 className="gallery-title">HÌNH ẢNH TIÊU BIỂU</h5>
      <div className="gallery-images">
        {images.map((image, index) => (
          <div className="image-item" key={index}>
            <img src={image.src} alt={image.alt} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageGallery;
