import React from "react";
import { Input, Button } from "antd";
import TextArea from "antd/es/input/TextArea";
import styles from "./ImagingStructureTable.module.scss";

const ImagingStructureTextTable = ({ rows, setRows, isEdit }) => {
  const updateRow = (id, key, value) => {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [key]: value } : r)),
    );
  };

  const handleDelete = (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa hàng này không?")) return;
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div>
      <table
        className={styles.imagingTable}
        style={{
          width: "100%",
          borderCollapse: "collapse",
        }}
      >
        {/* 🔹 CỐ ĐỊNH WIDTH CỘT */}
        <colgroup>
          <col style={{ width: 44 }} /> {/* STT */}
          <col style={{ width: 150 }} /> {/* Cấu trúc */}
          <col /> {/* Mô tả */}
          <col style={{ width: 48 }} /> {/* Xóa */}
        </colgroup>

        <thead>
          <tr>
            <th style={thStyle}>STT</th>
            <th style={thStyle}>Cấu trúc</th>
            <th style={thStyle}>Mô tả</th>
            <th style={thStyle}></th>
          </tr>
        </thead>

        <tbody>
          {rows.map((row, idx) => (
            <tr
              key={row.id}
              style={{
                borderBottom: "1px solid #e5e7eb",
              }}
            >
              <td style={tdStyle}>{idx + 1}</td>

              <td style={{ width: 700 }}>
                <Input
                  disabled={!isEdit}
                  value={row.name}
                  placeholder="Bộ phận ..."
                  onChange={(e) => updateRow(row.id, "name", e.target.value)}
                />
              </td>

              <td style={{ width: "99vw" }}>
                <TextArea
                  style={{
                    width: "100%",
                    resize: "none",
                  }}
                  disabled={!isEdit}
                  value={row.description}
                  placeholder=""
                  autoSize={{ minRows: 1, maxRows: 8 }}
                  onChange={(e) =>
                    updateRow(row.id, "description", e.target.value)
                  }
                />
              </td>

              <td
                style={{
                  textAlign: "right",
                  padding: 0,
                  whiteSpace: "nowrap",
                }}
              >
                <Button
                  danger
                  type="text"
                  size="small"
                  style={{
                    padding: 0,
                    minWidth: "auto",
                    height: "auto",
                    lineHeight: 1,
                  }}
                  disabled={!isEdit || rows.length === 1}
                  onClick={() => handleDelete(row.id)}
                >
                  Xóa
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Button
        type="link"
        disabled={!isEdit}
        onClick={() =>
          setRows((prev) => [
            ...prev,
            {
              id: Date.now(),
              name: "",
              description: "",
            },
          ])
        }
      >
        + Thêm hàng
      </Button>
    </div>
  );
};

const thStyle = {
  padding: "6px 6px",
  textAlign: "left",
  fontWeight: 600,
  background: "#fafafa",
};

const tdStyle = {
  padding: "4px 6px",
  verticalAlign: "middle",
};

export default ImagingStructureTextTable;
