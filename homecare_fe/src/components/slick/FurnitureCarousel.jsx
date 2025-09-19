import React from "react";
import Slider from "react-slick";
import styles from "./FurnitureCarousel.module.scss";
import { Tooltip } from "antd";
const items = [
  {
    title: "Tăng độ chính xác (accuracy)",
    desc: "Chuẩn hóa quy trình chẩn đoán theo khuyến cáo quốc tế. Giảm thiểu sai sót cá nhân, nhất là ở bác sĩ trẻ, giúp Bác sĩ chẩn đoán đúng ngay từ đầu, tránh bỏ sót hoặc nhầm lẫn bệnh lý. ",
    img: "https://png.pngtree.com/png-clipart/20230913/original/pngtree-accuracy-clipart-target-vector-illustration-png-image_11076663.png",
  },
  {
    title: "Tăng tính kịp thời (timeliness)",
    desc: "Rút ngắn thời gian đọc kết quả của Bác sĩ, giúp cho kết quả cần được trả trong thời gian phù hợp với mức độ cấp thiết của tình trạng lâm sàng. Tiết kiệm thời gian ghi chép – tăng hiệu suất chuyên môn.",
    img: "https://bcp.cdnchinhphu.vn/Uploaded/buithuhuong/2020_01_02/2_0-1.jpg",
  },
  {
    title: "Dễ hiểu và dễ tư vấn (interpretability & decision support)",
    desc: "Kết quả có hình ảnh rõ ràng, mạch lạc, có cấu trúc khoa học. Kết luận có định hướng, gợi ý chẩn đoán phân biệt, khuyến nghị thêm nếu cần thiết (như: cần sinh thiết, cần chụp thêm MRI...).",
    img: "https://suckhoeviet.org.vn/stores/news_dataimages/2024/062024/22/23/ung-dung-ai-giup-chan-doan-som-benh-parkinson-20240622231536.png?rt=20240622231536",
  },
  {
    title: "Nhất quán và chuẩn hóa (consistency & standardization)",
    desc: "Các thuật ngữ, cách mô tả, cấu trúc báo cáo cần được chuẩn hóa để đảm bảo dễ trao đổi giữa các bác sĩ, chuyên khoa và với người bệnh. Tránh sự mơ hồ hoặc biến đổi giữa các lần đọc.",
    img: "https://admin.lienhiephoigialai.vn/uploads/image_da1bd6c8c4.jpeg",
  },
  {
    title: "Lưu trữ và dễ truy suất (archiving & integration)",
    desc: "Kết quả được lưu trữ đầy đủ, truy xuất dễ dàng qua cloud server, tạo điều kiện thuận lợi cho việc hội chẩn, nghiên cứu, theo dõi dài hạn và chia sẻ thông tin đa chuyên khoa, từ đó giúp cho các hoạt động hỗ trợ đào tạo, đối chiếu và phân tích kết quả hiệu quả hơn.",
    img: "https://onesme.vn/blog/wp-content/uploads/2023/12/cloud-storage-la-hinh-thuc-luu-tru-dam-may-duoc-ung-dung-pho-bien-hien-nay.jpg",
  },
  {
    title: "Liên kết đa chuyên khoa (multidisciplinary value)",
    desc: "Kết quả hình ảnh có giá trị trong quyết định điều trị của bác sĩ nội khoa, ngoại khoa, ung bướu, cấp cứu,...Là cơ sở quan trọng cho hội chẩn đa chuyên ngành – một xu hướng đang phổ biến trong y học hiện đại",
    img: "/banner.jpg",
  },
  {
    title:
      "Hỗ trợ ra quyết định và theo dõi điều trị (decision & monitoring value)",
    desc: "Không chỉ giúp chẩn đoán bệnh ban đầu, mà còn đo lường mức độ tiến triển hoặc hiệu quả điều trị.",
    img: "https://gitiho.com/caches/p_medium_large//uploads/281464/images/image_ky-nang-ra-quyet-dinh-1.jpg",
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
            <Tooltip
              className={styles.tooltip}
              color="green"
              title={<span className={styles.tooltipText}>{item.desc}</span>}
            >
              <div className={styles.card}>
                <img src={item.img} alt={item.title} />
                <div className={styles.overlay}>
                  <h3>{item.title}</h3>
                </div>
              </div>
            </Tooltip>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default FurnitureCarousel;
