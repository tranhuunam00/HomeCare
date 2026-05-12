import Title from "antd/es/skeleton/Title";
import BackHeader from "../../../components/BackHeader";
import { Divider } from "antd";

export const ThamKhaoLinkHomeCare = ({
  link,
  title = "ỨNG DỤNG",
  name,
  desc,
  isMobile,
  hideToplabel = false,
  hideAdditionalInfo = false,
}) => {
  return (
    <div style={{ marginBottom: isMobile ? 0 : 40 }}>
      <h3
        level={3}
        style={{
          textAlign: "center",
          marginBottom: 0,
          color: "rgba(18, 119, 49, 1)",
          fontSize: isMobile ? 18 : 24,
          display: hideToplabel ? "none" : "block",
        }}
      >
        PHẦN MỀM D-RADS
      </h3>
      <h3
        level={3}
        style={{
          textAlign: "center",
          marginBottom: 8,
          marginTop: 0,
          color: "rgba(18, 119, 49, 1)",
          fontSize: isMobile ? 14 : 24,
        }}
      >
        {title}
      </h3>
      <h2 style={{ marginBottom: 4, fontSize: isMobile ? 12 : 20 }}>{name}</h2>
      <h5>{desc}</h5>
      <h5
        style={{
          display: hideAdditionalInfo ? "none" : "block",
        }}
      >
        {"Xem thêm tại "}
        <a href={link || "https://home-care.vn/product/phan-mem-d-tirads/"}>
          www.home-care.vn
        </a>
      </h5>
      <Divider style={{ margin: isMobile ? 5 : 24 }} />
    </div>
  );
};
