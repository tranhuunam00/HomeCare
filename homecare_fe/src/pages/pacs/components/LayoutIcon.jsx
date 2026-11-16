import React from 'react';

/** Biểu tượng lưới thu nhỏ cho 1 bố cục (dùng chung cho sidebar & menu) */
export default function LayoutIcon({ layout }) {
  const { cols, rows, areas } = layout;
  const style = { gridTemplateColumns: `repeat(${cols}, 1fr)`, gridTemplateRows: `repeat(${rows}, 1fr)` };
  if (areas) {
    const letters = [...new Set(areas.join(' ').split(/\s+/))];
    style.gridTemplateAreas = areas.map((r) => `"${r}"`).join(' ');
    return (
      <span className="pacs-layout-icon" style={style}>
        {letters.map((l) => (
          <i key={l} style={{ gridArea: l }} />
        ))}
      </span>
    );
  }
  return (
    <span className="pacs-layout-icon" style={style}>
      {Array.from({ length: cols * rows }, (_, i) => (
        <i key={i} />
      ))}
    </span>
  );
}
