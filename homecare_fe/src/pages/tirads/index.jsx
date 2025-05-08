// TiradPage.jsx
import React, { useState } from "react";
import "./tirad.css";
import TiradsReferenceSection from "./tirad_reference_section";

const options = {
  composition: [
    { label: "Nang hoặc hầu như là nang", value: 0 },
    { label: "Dạng tổ ong (spongiform)", value: 0 },
    { label: "Hỗn hợp nang và đặc", value: 1 },
    { label: "Đặc hoặc hầu như đặc", value: 2 },
    { label: "Không xác định do vôi hóa", value: 2 },
  ],
  echogenicity: [
    { label: "Trống âm", value: 0 },
    { label: "Tăng âm hoặc đồng âm", value: 1 },
    { label: "Giảm âm", value: 2 },
    { label: "Rất giảm âm", value: 3 },
    { label: "Không xác định", value: 1 },
  ],
  shape: [
    { label: "Rộng hơn cao", value: 0 },
    { label: "Cao hơn rộng", value: 3 },
  ],
  margin: [
    { label: "Nhẵn", value: 0 },
    { label: "Không rõ", value: 0 },
    { label: "Bờ thùy hoặc không đều", value: 2 },
    { label: "Mở rộng ra ngoài tuyến giáp", value: 3 },
    { label: "Không xác định", value: 0 },
  ],
  echogenicFoci: [
    { label: "Không hoặc có xảo ảnh đuôi sao lớn", value: 0 },
    { label: "Vôi hóa lớn", value: 1 },
    { label: "Vôi hóa viền", value: 2 },
    { label: "Điểm tăng âm nhỏ", value: 3 },
  ],
};

export default function TiradPage() {
  const [selected, setSelected] = useState({
    composition: null,
    echogenicity: null,
    shape: null,
    margin: null,
    echogenicFoci: [],
  });

  const handleSelect = (category, value) => {
    setSelected((prev) => ({ ...prev, [category]: value }));
  };

  const handleFociChange = (value) => {
    setSelected((prev) => {
      const current = prev.echogenicFoci;
      return {
        ...prev,
        echogenicFoci: current.includes(value)
          ? current.filter((v) => v !== value)
          : [...current, value],
      };
    });
  };

  const calculateTotal = () => {
    const basePoints = ["composition", "echogenicity", "shape", "margin"]
      .map((key) => selected[key]?.value || 0)
      .reduce((a, b) => a + b, 0);
    const fociPoints = selected.echogenicFoci
      .map((f) => f.value)
      .reduce((a, b) => a + b, 0);
    return basePoints + fociPoints;
  };

  const totalScore = calculateTotal();

  const getRecommendation = () => {
    if (totalScore <= 2) return "Không FNA";
    if (totalScore === 3) return "Nếu ≥ 2.5cm: FNA; Nếu ≥ 1.5cm: Theo dõi";
    if (totalScore <= 6) return "Nếu ≥ 1.5cm: FNA; Nếu ≥ 1cm: Theo dõi";
    return "Nếu ≥ 1cm: FNA; Nếu ≥ 0.5cm: Theo dõi hàng năm";
  };

  const getCategory = () => {
    if (totalScore === 0) return "1 - Lành tính";
    if (totalScore <= 2) return "2 - Không nghi ngờ";
    if (totalScore === 3) return "3 - Nghi ngờ thấp";
    if (totalScore <= 6) return "4 - Nghi ngờ vừa";
    return "5 - Nghi ngờ cao";
  };

  return (
    <div className="tirads-container">
      <h2 className="title">TIRADS CHO NANG GIÁP</h2>
      <p className="disclaimer">
        <strong>Lưu ý:</strong> Công cụ này dựa theo phân loại của ACR nhưng
        chưa được phê duyệt chính thức.
      </p>

      <div className="categories">
        {Object.entries(options).map(([category, opts]) => (
          <div className="category" key={category}>
            <h3 className="category-title">
              {category.replace(/([A-Z])/g, " $1").toUpperCase()}
            </h3>
            <em>
              {category === "echogenicFoci"
                ? "(Chọn tất cả các áp dụng)"
                : "(Chọn 1)"}
            </em>
            {opts.map((opt, i) => (
              <label className="option" key={i}>
                <input
                  type={category === "echogenicFoci" ? "checkbox" : "radio"}
                  name={`radio-${category}`}
                  checked={
                    category === "echogenicFoci"
                      ? selected[category].includes(opt)
                      : selected[category] === opt
                  }
                  onChange={() =>
                    category === "echogenicFoci"
                      ? handleFociChange(opt)
                      : handleSelect(category, opt)
                  }
                />
                {opt.label} <span className="points">({opt.value} điểm)</span>
              </label>
            ))}
          </div>
        ))}
      </div>

      <div className="total">Tổng điểm: {totalScore}</div>

      <div className="tirads-result">
        <div className="tr-boxes">
          {[1, 2, 3, 4, 5].map((tr) => (
            <div
              key={tr}
              className={`tr-box ${
                (Math.floor(totalScore) === 0 && tr === 1) ||
                (tr === 2 && totalScore >= 1 && totalScore <= 2) ||
                (tr === 3 && totalScore === 3) ||
                (tr === 4 && totalScore >= 4 && totalScore <= 6) ||
                (tr === 5 && totalScore >= 7)
                  ? "active"
                  : ""
              }`}
            >
              TR{tr}
              <br />
              <strong>
                {
                  {
                    1: "Lành tính",
                    2: "Không nghi ngờ",
                    3: "Nghi ngờ thấp",
                    4: "Nghi ngờ vừa",
                    5: "Nghi ngờ cao",
                  }[tr]
                }
              </strong>
              <br />
              {{
                1: "Không FNA",
                2: "Không FNA",
                3: "FNA ≥ 2.5cm\nTheo dõi ≥ 1.5cm",
                4: "FNA ≥ 1.5cm\nTheo dõi ≥ 1cm",
                5: "FNA ≥ 1cm\nTheo dõi ≥ 0.5cm",
              }[tr]
                .split("\n")
                .map((line, i) => (
                  <div key={i}>{line}</div>
                ))}
            </div>
          ))}
        </div>

        <button
          className="reset-button"
          onClick={() =>
            setSelected({
              composition: null,
              echogenicity: null,
              shape: null,
              margin: null,
              echogenicFoci: [],
            })
          }
        >
          Xóa tất cả
        </button>
      </div>

      <div className="findings">
        <h3>Kết quả:</h3>
        <p>
          <strong>TIRADS Score:</strong> {totalScore}
        </p>
        <p>
          <strong>Phân loại:</strong> {getCategory()}
        </p>
        <ul>
          {["composition", "echogenicity", "shape", "margin"].map(
            (key) =>
              selected[key] && (
                <li key={key}>
                  {key.charAt(0).toUpperCase() + key.slice(1)}:{" "}
                  {selected[key].label} ({selected[key].value} điểm)
                </li>
              )
          )}
          {selected.echogenicFoci.length > 0 && (
            <li>
              Echogenic foci:
              <ul>
                {selected.echogenicFoci.map((f, i) => (
                  <li key={i}>
                    {f.label} ({f.value} điểm)
                  </li>
                ))}
              </ul>
            </li>
          )}
        </ul>
        <div className="recommendation">
          <strong>Khuyến nghị:</strong> {getRecommendation()}
        </div>
      </div>
      <TiradsReferenceSection />
    </div>
  );
}
