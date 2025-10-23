import React, { useState, useRef } from "react";
import Slider from "react-slick";
import { Avatar } from "antd";
import styles from "./DoctorAdvisorsSlider.module.scss";

const DoctorAdvisorsSlider = ({ doctors = [] }) => {
  const [hoveredDoctor, setHoveredDoctor] = useState(null);
  const hideTimer = useRef(null);

  const hasMany = doctors.length > 4;

  const settings = {
    dots: false,
    infinite: hasMany,
    slidesToShow: hasMany ? 4 : doctors.length || 1,
    slidesToScroll: 1,
    autoplay: hasMany,
    autoplaySpeed: 3000,
    pauseOnHover: true,
    arrows: false,
    responsive: [
      {
        breakpoint: 1024,
        settings: { slidesToShow: Math.min(doctors.length, 4) },
      },
      {
        breakpoint: 768,
        settings: { slidesToShow: Math.min(doctors.length, 3) },
      },
      {
        breakpoint: 480,
        settings: { slidesToShow: Math.min(doctors.length, 2) },
      },
    ],
  };

  const handleEnter = (doc) => {
    clearTimeout(hideTimer.current);
    setHoveredDoctor(doc);
  };

  const handleLeave = () => {
    hideTimer.current = setTimeout(() => setHoveredDoctor(null), 200);
  };

  return (
    <div className={styles["doctor-slider"]}>
      <Slider {...settings}>
        {doctors.map((doc, index) => (
          <div
            key={index}
            className={styles["doctor-card"]}
            onMouseEnter={() => handleEnter(doc)}
            onMouseLeave={handleLeave}
          >
            <div className={styles["avatar-wrapper"]}>
              <Avatar
                size={120}
                src={doc.avatar_url || "/default_doctor.png"}
                style={{
                  border: "2px solid #04580f",
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
        ))}
      </Slider>

      {/* ✅ Custom popup trung tâm, không dùng antd Modal */}
      {hoveredDoctor && (
        <div
          className={styles["hover-popup"]}
          onMouseEnter={() => clearTimeout(hideTimer.current)}
          onMouseLeave={() => setHoveredDoctor(null)}
        >
          <div className={styles["popup-content"]}>
            <Avatar
              size={160}
              src={hoveredDoctor.avatar_url || "/default_doctor.png"}
              style={{ border: "3px solid #04580f", marginBottom: 20 }}
            />
            <h3>
              {[
                hoveredDoctor.academic_title
                  ? `${hoveredDoctor.academic_title}.`
                  : null,
                hoveredDoctor.degree ? `${hoveredDoctor.degree}.` : null,
                hoveredDoctor.full_name,
              ]
                .filter(Boolean)
                .join(" ")}
            </h3>
            <p className={styles["popup-desc"]}>
              {hoveredDoctor.description ||
                "Chưa có mô tả chi tiết về bác sĩ này."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorAdvisorsSlider;
