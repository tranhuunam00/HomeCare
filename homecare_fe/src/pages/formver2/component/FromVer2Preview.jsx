// FormVer2Preview.jsx
import React from "react";

/**
 * FormVer2Preview
 * - Hiển thị bảng preview/in với header cột theo `columnLabels`
 * - Mỗi hàng merge cột theo số cột tối đa (nMax = columnLabels.length)
 *
 * Props:
 *  - data: Array<{ id: string, label: string, inputs: string[] }>
 *  - columnLabels: string[]  // số lượng = số cột tối đa (nMax)
 */
export default function FormVer2Preview({ data = [], columnLabels = [] }) {
  // nMax = tổng cột tối đa; mỗi hàng sẽ merge để tổng colSpan == nMax
  const nMax = Math.max(1, columnLabels?.length || 1);
  const safeLabel = (i) => columnLabels?.[i] ?? `Cột ${i + 1}`;

  // Chia đều nMax cho k ô, DỒN PHẦN DƯ về Ô CUỐI (đẹp mắt từ trái→phải)
  const buildSpans = (k) => {
    const kk = Math.max(1, Math.min(k || 1, nMax));
    const base = Math.floor(nMax / kk);
    const rem = nMax % kk;
    // ví dụ nMax=5, kk=2 => [2,3]; kk=3 => [1,2,2]
    return Array.from({ length: kk }, (_, i) => base + (i >= kk - rem ? 1 : 0));
  };

  return (
    <div style={{ overflowX: "auto" }}>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          tableLayout: "fixed",
          border: "1px solid #d9d9d9",
        }}
      >
        <thead>
          <tr>
            <th
              style={{
                border: "1px solid #d9d9d9",
                padding: 8,
                width: 260,
                background: "#fafafa",
                textAlign: "left",
              }}
            >
              Tiêu đề
            </th>
            {Array.from({ length: nMax }).map((_, i) => (
              <th
                key={`h-${i}`}
                style={{
                  border: "1px solid #d9d9d9",
                  padding: 8,
                  background: "#fafafa",
                  textAlign: "left",
                }}
              >
                {safeLabel(i)}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {data.map((row) => {
            const valuesRaw = Array.isArray(row.inputs) ? row.inputs : [""];
            // Nếu > nMax thì cắt để không tràn
            const values = valuesRaw.slice(0, nMax);
            const spans = buildSpans(values.length);

            return (
              <tr key={row.id}>
                <td
                  style={{
                    border: "1px solid #d9d9d9",
                    padding: 8,
                    verticalAlign: "top",
                    width: 260,
                    fontWeight: 600,
                  }}
                >
                  {row.label || ""}
                </td>

                {values.map((val, i) => (
                  <td
                    key={`c-${row.id}-${i}`}
                    colSpan={spans[i]}
                    style={{
                      border: "1px solid #d9d9d9",
                      padding: 8,
                      minHeight: 40,
                      wordBreak: "break-word",
                    }}
                  >
                    {val || ""}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
