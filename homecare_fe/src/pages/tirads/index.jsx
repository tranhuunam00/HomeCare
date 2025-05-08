import React, { useState } from "react";

const options = {
  composition: [
    { label: "Cystic or almost completely cystic", value: 0 },
    { label: "Spongiform", value: 0 },
    { label: "Mixed cystic and solid", value: 1 },
    { label: "Solid or almost completely solid", value: 2 },
    { label: "Indeterminate due to calcification", value: 2 },
  ],
  echogenicity: [
    { label: "Anechoic", value: 0 },
    { label: "Hyperechoic or isoechoic", value: 1 },
    { label: "Hypoechoic", value: 2 },
    { label: "Very hypoechoic", value: 3 },
    { label: "Cannot be determined", value: 1 },
  ],
  shape: [
    { label: "Wider than tall", value: 0 },
    { label: "Taller than wide", value: 3 },
  ],
  margin: [
    { label: "Smooth", value: 0 },
    { label: "Ill-defined", value: 0 },
    { label: "Lobulated or irregular", value: 2 },
    { label: "Extra-thyroidal extension", value: 3 },
    { label: "Cannot be determined", value: 0 },
  ],
  echogenicFoci: [
    { label: "None or large comet-tail artifacts", value: 0 },
    { label: "Macrocalcifications", value: 1 },
    { label: "Peripheral (rim) calcifications", value: 2 },
    { label: "Punctate echogenic foci", value: 3 },
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

  return (
    <div>
      <h2>TIRADS Calculator for Thyroid Nodules</h2>
      {Object.entries(options).map(([category, opts]) => (
        <div key={category}>
          <h3>{category.toUpperCase()}</h3>
          {opts.map((opt, index) => (
            <div key={index}>
              <label>
                <input
                  type={category === "echogenicFoci" ? "checkbox" : "radio"}
                  name={category}
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
                {opt.label} ({opt.value} pts)
              </label>
            </div>
          ))}
        </div>
      ))}
      <h3>Total Points: {calculateTotal()}</h3>
    </div>
  );
}
