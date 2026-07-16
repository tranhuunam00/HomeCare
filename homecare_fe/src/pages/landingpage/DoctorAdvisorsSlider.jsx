import React, { useState } from "react";
import Slider from "react-slick";
import { Avatar } from "antd";
import styles from "./DoctorAdvisorsSlider.module.scss";

const DoctorAdvisorsSlider = ({ doctors = [] }) => {
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  const hasMany = doctors.length > 5;

  const settings = {
    dots: false,
    infinite: hasMany,
    slidesToShow: hasMany ? 5 : doctors.length || 1,
    slidesToScroll: 1,
    autoplay: hasMany,
    autoplaySpeed: 3000,
    pauseOnHover: true,
    arrows: false,
    responsive: [
      {
        breakpoint: 1024,
        settings: { slidesToShow: Math.min(doctors.length, 5) },
      },
      {
        breakpoint: 768,
        settings: { slidesToShow: Math.min(doctors.length, 4) },
      },
      {
        breakpoint: 480,
        settings: { slidesToShow: Math.min(doctors.length, 3) },
      },
    ],
  };

  const handleClickDoctor = (doc) => {
    setSelectedDoctor(doc);
  };

  const handleClosePopup = () => {
    setSelectedDoctor(null);
  };

  const containerStyle = {
    maxWidth: doctors.length < 5 ? `${doctors.length * 260}px` : "1240px",
    margin: "0 auto",
  };

  return (
    <div className={styles["doctor-slider"]} style={containerStyle}>
      <Slider {...settings}>
        {doctors.map((doc, index) => (
          <div key={index} className={styles["slider-slide"]}>
            <div
              className={styles["doctor-card"]}
              onClick={() => handleClickDoctor(doc)}
            >
              <div className={styles["avatar-wrapper"]}>
                <Avatar
                  className={styles["avatar-wrapper-avatar"]}
                  src={doc.avatar_url || "/default_doctor.png"}
                  style={{
                    margin: "0 auto",
                    cursor: "pointer",
                  }}
                />
              </div>
              <div className={styles["doctor-name"]}>
                {[
                  doc.academic_title ? `${doc.academic_title}.` : null,
                  doc.degree ? `${doc.degree}.` : null,
                  doc.full_name,
                ]
                  .filter(Boolean)
                  .join(" ")}
              </div>
            </div>
          </div>
        ))}
      </Slider>

      {/* ✅ Popup hiển thị khi click */}
      {selectedDoctor && (
        <div
          className={styles["hover-popup"]}
          onClick={handleClosePopup} //  click ra ngoài để tắt
        >
          <div
            className={styles["popup-content"]}
            onClick={(e) => e.stopPropagation()} //  chặn click bên trong popup làm tắt
          >
            <Avatar
              className={styles["popup-content_avatar"]}
              src={selectedDoctor.avatar_url || "/default_doctor.png"}
              style={{
                marginBottom: 20,
              }}
            />
            <h3 className={styles["popup-content_name"]}>
              {[
                selectedDoctor.academic_title
                  ? `${selectedDoctor.academic_title}.`
                  : null,
                selectedDoctor.degree ? `${selectedDoctor.degree}.` : null,
                selectedDoctor.full_name,
              ]
                .filter(Boolean)
                .join(" ")}
            </h3>
            <p className={styles["popup-desc"]}>
              {selectedDoctor.description ||
                "Chưa có mô tả chi tiết về bác sĩ này."}
            </p>
            <button
              className={styles["popup-close"]}
              onClick={handleClosePopup}
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorAdvisorsSlider;
