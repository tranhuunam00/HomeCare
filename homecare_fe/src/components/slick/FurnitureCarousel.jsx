import React from "react";
import Slider from "react-slick";
import styles from "./FurnitureCarousel.module.scss";

const items = [
  {
    title: "Tăng độ chính xác (accuracy)",
    desc: "Chuẩn hóa quy trình chẩn đoán theo khuyến cáo quốc tế. Giảm thiểu sai sót cá nhân, nhất là ở bác sĩ trẻ, giúp Bác sĩ chẩn đoán đúng ngay từ đầu, tránh bỏ sót hoặc nhầm lẫn bệnh lý. ",
    img: "https://png.pngtree.com/png-clipart/20230913/original/pngtree-accuracy-clipart-target-vector-illustration-png-image_11076663.png",
  },
  {
    title: "Tăng tính kịp thời (timeliness)",
    desc: "Rút ngắn thời gian đọc kết quả của Bác sĩ, giúp cho kết quả cần được trả trong thời gian phù hợp với mức độ cấp thiết của tình trạng lâm sàng. Tiết kiệm thời gian ghi chép – tăng hiệu suất chuyên môn.",
    img: "/banner.png",
  },
  {
    title: "Dễ hiểu và dễ tư vấn (interpretability & decision support)",
    desc: "Kết quả có hình ảnh rõ ràng, mạch lạc, có cấu trúc khoa học. Kết luận có định hướng, gợi ý chẩn đoán phân biệt, khuyến nghị thêm nếu cần thiết (như: cần sinh thiết, cần chụp thêm MRI...).",
    img: "/banner.png",
  },
  {
    title: "Nhất quán và chuẩn hóa (consistency & standardization)",
    desc: "Các thuật ngữ, cách mô tả, cấu trúc báo cáo cần được chuẩn hóa để đảm bảo dễ trao đổi giữa các bác sĩ, chuyên khoa và với người bệnh. Tránh sự mơ hồ hoặc biến đổi giữa các lần đọc.",
    img: "/banner.png",
  },
  {
    title: "Lưu trữ và dễ truy suất (archiving & integration)",
    desc: "Kết quả được lưu trữ đầy đủ, truy xuất dễ dàng qua cloud server, tạo điều kiện thuận lợi cho việc hội chẩn, nghiên cứu, theo dõi dài hạn và chia sẻ thông tin đa chuyên khoa, từ đó giúp cho các hoạt động hỗ trợ đào tạo, đối chiếu và phân tích kết quả hiệu quả hơn.",
    img: "/banner.png",
  },
  {
    title: "Liên kết đa chuyên khoa (multidisciplinary value)",
    desc: "Kết quả hình ảnh có giá trị trong quyết định điều trị của bác sĩ nội khoa, ngoại khoa, ung bướu, cấp cứu,...Là cơ sở quan trọng cho hội chẩn đa chuyên ngành – một xu hướng đang phổ biến trong y học hiện đại",
    img: "/banner.png",
  },
  {
    title:
      "Hỗ trợ ra quyết định và theo dõi điều trị (decision & monitoring value)",
    desc: "Không chỉ giúp chẩn đoán bệnh ban đầu, mà còn đo lường mức độ tiến triển hoặc hiệu quả điều trị.",
    img: "/banner.png",
  },
];

const FurnitureCarousel = () => {
  const settings = {
    dots: false,
    infinite: true,
    autoplay: true,
    autoplaySpeed: 3000,
    slidesToShow: 3,
    centerMode: true,
    centerPadding: "0px",
    arrows: false,
    responsive: [
      {
        breakpoint: 768,
        settings: { slidesToShow: 1 },
      },
    ],
  };

  return (
    <div className={styles.carouselWrapper}>
      <Slider {...settings}>
        {items.map((item, index) => (
          <div key={index} className={styles.slide}>
            <div className={styles.card}>
              <img src={item.img} alt={item.title} />
              <div className={styles.overlay}>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default FurnitureCarousel;
