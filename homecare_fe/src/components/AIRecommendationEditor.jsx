import React from "react";
import { Input, Typography } from "antd";

const { TextArea } = Input;
const { Text } = Typography;

export default function AIRecommendationEditor({
  value = "",
  onChange,
  minRows = 6,
  maxRows = 16,
  style,
}) {
  const handleChange = (e) => onChange?.(e.target.value);

  return (
    <div className="ai-rec-min" style={style}>
      <style>{`
        .ai-rec-min {
          width: 100%;
          max-width: 1000px;
          margin: 0 auto;
        }
        .ai-rec-min__hint {
          margin-bottom: 8px;
          color: #595959;
          display: none; /* tối giản: ẩn hint; bật nếu cần */
        }
        .ai-rec-min__textarea {
          width: 100%;
        }

        /* Tablet ≤ 992px */
        @media (max-width: 992px) {
          .ai-rec-min {
            max-width: 860px;
          }
        }

        /* Mobile ≤ 576px */
        @media (max-width: 576px) {
          .ai-rec-min {
            max-width: 100%;
            padding: 0 8px;
          }
        }
      `}</style>

      {/* gợi ý nhỏ (đang ẩn) — có thể đổi display nếu muốn hiện */}
      <Text className="ai-rec-min__hint">
        Bạn có thể chỉnh sửa nội dung khuyến nghị bên dưới.
      </Text>

      <TextArea
        className="ai-rec-min__textarea"
        value={value}
        onChange={handleChange}
        autoSize={{ minRows, maxRows }}
        placeholder="Nhập/chỉnh sửa khuyến nghị..."
        showCount
      />
    </div>
  );
}
