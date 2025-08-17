// ImageDescriptionPreview.jsx (in/print view)
import React from "react";

export default function FormVer2Preview({ data = [] }) {
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
                padding: "8px",
                width: "260px",
                background: "#fafafa",
                textAlign: "left",
              }}
            >
              Tiêu đề
            </th>
            <th
              style={{
                border: "1px solid #d9d9d9",
                padding: "8px",
                background: "#fafafa",
                textAlign: "left",
              }}
            >
              Giá trị
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((r) => {
            const n = Math.max(1, r.inputs?.length || 0);
            return (
              <tr key={r.id}>
                <td
                  style={{
                    border: "1px solid #d9d9d9",
                    padding: "8px",
                    verticalAlign: "top",
                    width: "260px",
                    fontWeight: 600,
                  }}
                >
                  {r.label || ""}
                </td>
                <td style={{ padding: 0, border: "1px solid #d9d9d9" }}>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: `repeat(${n}, 1fr)`,
                      gap: 0,
                      width: "100%",
                    }}
                  >
                    {(r.inputs && r.inputs.length ? r.inputs : [""]).map(
                      (val, i) => (
                        <div
                          key={i}
                          style={{
                            borderRight:
                              i < n - 1 ? "1px solid #d9d9d9" : "none",
                            padding: "8px",
                            minHeight: 40,
                            wordBreak: "break-word",
                          }}
                        >
                          {val || ""}
                        </div>
                      )
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
