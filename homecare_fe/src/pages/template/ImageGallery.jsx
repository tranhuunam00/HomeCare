import React, { useState } from "react";
import "./ImageGallery.css"; // Đảm bảo bạn có file CSS để định dạng

const ImageGallery = () => {
  const [images, setImages] = useState([]);
  const [captions, setCaptions] = useState([]);

  const handleAddImage = (index) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const newImage = URL.createObjectURL(file);
        if (index !== undefined) {
          // Cập nhật ảnh tại vị trí index
          const newImages = [...images];
          newImages[index] = { src: newImage, alt: file.name };
          setImages(newImages);
        } else {
          // Thêm ảnh mới
          setImages([...images, { src: newImage, alt: file.name }]);
          setCaptions([...captions, "Chú thích ảnh"]);
        }
      }
    };
    input.click();
  };

  const handleCaptionChange = (index, value) => {
    const newCaptions = [...captions];
    newCaptions[index] = value;
    setCaptions(newCaptions);
  };

  const renderAddImageButton = (isFirst = false) => (
    <div
      className="add-image-button no-print"
      onClick={() => handleAddImage()}
      style={{
        width: "300px",
        height: "300px",
        border: "2px dashed #ccc",
        borderRadius: "8px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        margin: "10px",
      }}
    >
      <div
        style={{
          width: "50px",
          height: "50px",
          backgroundColor: "#4CAF50",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "10px",
        }}
      >
        <span style={{ color: "white", fontSize: "24px" }}>↑</span>
      </div>
      <div>Thêm ảnh</div>
    </div>
  );

  return (
    <div className="image-gallery">
      <div
        className="gallery-title"
        style={{ textAlign: "left", marginBottom: "20px" }}
      >
        HÌNH ẢNH MINH HỌA
      </div>
      <div className="gallery-images">
        {images.length === 0 ? (
          renderAddImageButton(true)
        ) : (
          <>
            {images.map((image, index) => (
              <div
                className="image-container"
                key={index}
                style={{
                  width: "300px",
                  margin: "0",
                }}
              >
                <div
                  className="image-item"
                  onClick={() => handleAddImage(index)}
                  style={{
                    width: "100%",
                    height: "300px",
                    overflow: "hidden",
                    borderRadius: "8px",
                    marginBottom: "10px",
                    border: "1px solid #ddd",
                  }}
                >
                  <img
                    src={image.src}
                    alt={image.alt}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </div>
                <div className="image-caption">
                  <textarea
                    value={captions[index]}
                    onChange={(e) => handleCaptionChange(index, e.target.value)}
                    rows={7}
                    style={{
                      width: "100%",
                      padding: "8px",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                      fontSize: "14px",
                      resize: "none",
                    }}
                  />
                </div>
              </div>
            ))}
            {renderAddImageButton()}
          </>
        )}
      </div>
    </div>
  );
};

export default ImageGallery;
