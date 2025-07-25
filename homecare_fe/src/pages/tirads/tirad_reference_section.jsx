import React from "react";
import "./tirad.css";

const TiradsReferenceSection = () => {
  return (
    <div className="tirads-reference">
      <div className="tirads-description">
        <h2>TIRADS là gì?</h2>
        <p>
          TIRADS (Thyroid Imaging Reporting and Data System) là hệ thống chấm
          điểm 5 mức cho các nhân giáp trên siêu âm, được phát triển bởi
          <a href="https://www.acr.org/">Hiệp hội X-quang Hoa Kỳ (ACR)</a>. Hệ
          thống này giúp xác định nhân giáp là lành tính hay ác tính bằng cách
          kết hợp nhiều đặc điểm trên hình ảnh siêu âm.
        </p>

        <h3>Cách tính điểm TIRADS cho nhân giáp bằng công cụ này</h3>
        <ul className="tirads-description-list left-align">
          <li>
            Bước #1: Thực hiện siêu âm theo đúng hướng dẫn. Đọc kỹ
            <a href="https://pubs.rsna.org/doi/pdf/10.1148/radiol.12120637">
              whitepaper
            </a>
            và
            <a href="https://www.acr.org/-/media/ACR/Files/Clinical-Resources/TIRADS/TIRADS_White_Paper.pdf">
              bài viết TIRADS
            </a>
            rút gọn. Có thể sử dụng
            <a href="https://www.acr.org/-/media/ACR/Files/Clinical-Resources/TIRADS/Worksheet.pdf">
              phiếu ghi chú cho kỹ thuật viên siêu âm
            </a>
            để ghi lại các đặc điểm.
          </li>
          <li>
            Bước #2: Chọn các đặc điểm phù hợp trong bảng tính TIRADS ở trên.
          </li>
          <li>
            Bước #3: Kiểm tra tổng điểm và khuyến nghị theo bảng phân loại
            TIRADS ở cuối công cụ.
          </li>
          <li>
            Bước #4: Sử dụng
            <a href="https://www.acr.org/-/media/ACR/Files/Clinical-Resources/TIRADS/Template.docx">
              mẫu báo cáo siêu âm
            </a>
            để tạo báo cáo.
          </li>
          <li>
            Bước #5: Đề xuất theo dõi siêu âm định kỳ hoặc chọc hút tế bào bằng
            kim nhỏ (FNAC) tùy theo phân loại TIRADS.
          </li>
        </ul>
      </div>
      <div className="print-section">
        <h2 className="reference-title">Bảng phân loại TIRADS</h2>
        <table className="reference-table">
          <thead>
            <tr>
              <th>Nhóm</th>
              <th>Điểm</th>
              <th>Mức độ nghi ngờ</th>
              <th>Tỷ lệ ác tính</th>
              <th>Khuyến cáo</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>TR1</td>
              <td>0</td>
              <td>Lành tính</td>
              <td>0.3%</td>
              <td>Không FNA</td>
            </tr>
            <tr>
              <td>TR2</td>
              <td>2</td>
              <td>Không nghi ngờ</td>
              <td>1.5%</td>
              <td>Không FNA</td>
            </tr>
            <tr>
              <td>TR3</td>
              <td>3</td>
              <td>Nghi ngờ thấp</td>
              <td>4.8%</td>
              <td>FNA nếu ≥ 2.5cm; Theo dõi nếu ≥ 1.5cm</td>
            </tr>
            <tr>
              <td>TR4</td>
              <td>4 - 6</td>
              <td>Nghi ngờ vừa</td>
              <td>9.1%</td>
              <td>FNA nếu ≥ 1.5cm; Theo dõi nếu ≥ 1cm</td>
            </tr>
            <tr>
              <td>TR5</td>
              <td>≥ 7</td>
              <td>Nghi ngờ cao</td>
              <td>35%</td>
              <td>FNA nếu ≥ 1cm; Theo dõi nếu ≥ 0.5cm hàng năm trong 5 năm</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TiradsReferenceSection;
