import React, { useRef } from "react";

export default function AutoGrowTextArea({ placeholder, disabled }) {
  const textRef = useRef(null);

  const handleInput = () => {
    const el = textRef.current;
    if (el) {
      el.style.height = "auto"; // reset để tính lại
      el.style.height = el.scrollHeight + "px"; // set theo content
    }
  };

  return (
    <textarea
      ref={textRef}
      placeholder={placeholder || ""}
      disabled={disabled}
      onInput={handleInput}
      style={{
        width: "100%",
        minHeight: "60px",
        resize: "none", // ko cho resize bằng chuột
        overflow: "hidden",
        padding: "8px",
        borderRadius: "4px",
        border: "1px solid #d9d9d9",
        fontSize: "14px",
      }}
    />
  );
}
