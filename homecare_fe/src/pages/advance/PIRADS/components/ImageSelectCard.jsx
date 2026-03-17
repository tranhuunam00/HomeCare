import React from "react";
import styles from "./ImageSelectCard.module.scss";

export default function ImageSelectCard({ options = [], value, onChange }) {
  return (
    <div className={styles.grid}>
      {options.map((opt) => (
        <div
          key={opt.value}
          className={`${styles.card} ${
            value === opt.value ? styles.active : ""
          }`}
          onClick={() => onChange(opt.value)}
        >
          <img src={opt.image} alt="" />

          <div className={styles.caption}>{opt.label}</div>

          <div className={styles.radioDot}></div>
        </div>
      ))}
    </div>
  );
}
