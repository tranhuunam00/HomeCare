// Thêm component Header mới
export const Header = () => {
  return (
    <div style={{ marginBottom: "20px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "60px" }}>
        <div style={{ width: "100px" }}>
          <img
            src="../../../public/logo_home_care.jpg"
            alt="HomeCare Logo"
            style={{ width: "100%" }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <div>
              <h2 style={{ margin: 0 }}>PHÒNG KHÁM BÁC SĨ GIA ĐÌNH HOMECARE</h2>
              <div style={{ display: "flex", justifyContent: "flex-start" }}>
                <ul
                  style={{
                    listStyle: "none",
                    paddingLeft: 40,
                    margin: "10px 0",
                  }}
                >
                  <li style={{ textAlign: "left" }}>- Khám chữa bệnh từ xa</li>
                  <li style={{ textAlign: "left" }}>
                    - Tư vấn kết quả y khoa theo yêu cầu
                  </li>
                  <li style={{ textAlign: "left" }}>
                    - Bệnh viện trực tuyến tại nhà
                  </li>
                </ul>
              </div>
            </div>
            <div style={{ textAlign: "left" }}>
              <p style={{ margin: "0 0 5px 0" }}>THÔNG TIN LIÊN HỆ</p>
              <p style={{ margin: "0 0 5px 0" }}>Tele: 0969268000</p>
              <a
                href="http://www.home-care.vn"
                style={{ display: "block", margin: "0 0 5px 0" }}
              >
                www.home-care.vn
              </a>
              <a href="mailto:daogroupltd@gmail.com">daogroupltd@gmail.com</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
