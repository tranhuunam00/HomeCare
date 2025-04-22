import React from "react";
import "./ImageGallery.css"; // Đảm bảo bạn có file CSS để định dạng

const ImageGallery = ({ images }) => {
  return (
    <div className="image-gallery">
      <div className="gallery-title">HÌNH ẢNH MINH HỌA</div>
      <div className="gallery-images">
        {images.map((image, index) => (
          <div className="image-container" key={index}>
            <div className="image-item">
              <img src={image.src} alt={image.alt} />
            </div>
            <div className="image-caption">
              <input
                value={"Chú thích ảnh"}
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
