// src/components/FormVer2/TablesSnapshotPreview.jsx
import React from "react";
import FormVer2Preview from "../../formver2/component/FromVer2Preview";

/**
 * TablesSnapshotPreview
 * - Nhận mảng tablesSnapshot (mỗi item có { id, rows, columnLabels })
 * - Render lần lượt từng bảng bằng FormVer2Preview
 *
 * Props:
 *  - tablesSnapshot: Array<{
 *      id?: string | number,
 *      rows: Array<{ id: string, label: string, inputs: string[] }>,
 *      columnLabels?: string[]
 *    }>
 *  - titlePrefix?: string  // "Bảng" → sẽ in "Bảng 1", "Bảng 2", ...
 *  - showTitle?: boolean   // có in tiêu đề phụ của từng bảng không
 */
export default function TablesSnapshotPreview({
  tablesSnapshot = [],
  titlePrefix = "Bảng",
  showTitle = true,
}) {
  if (!Array.isArray(tablesSnapshot) || tablesSnapshot.length === 0) {
    return null;
  }

  return (
    <div>
      {tablesSnapshot.map((tbl, idx) => {
        const rows = Array.isArray(tbl?.rows) ? tbl.rows : [];

        // Nếu thiếu columnLabels, tự tính nMax từ rows
        let columnLabels = Array.isArray(tbl?.columnLabels)
          ? tbl.columnLabels
          : [];
        if (!columnLabels.length) {
          const nMax = Math.max(
            1,
            ...rows.map((r) => (Array.isArray(r.inputs) ? r.inputs.length : 0))
          );
          columnLabels = Array.from({ length: nMax }, (_, i) => `Cột ${i + 1}`);
        }

        return (
          <section
            key={tbl?.id ?? idx}
            style={{
              marginBottom: 16,
              breakInside: "avoid",
              pageBreakInside: "avoid",
            }}
          >
            {showTitle && (
              <h4 style={{ margin: "12px 0 8px" }}>
                {titlePrefix} {idx + 1}
              </h4>
            )}
            <FormVer2Preview data={rows} columnLabels={columnLabels} />
          </section>
        );
      })}
    </div>
  );
}
