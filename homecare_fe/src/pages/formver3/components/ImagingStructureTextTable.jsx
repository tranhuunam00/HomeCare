import React, { useEffect, useRef, useState } from "react";
import { Input, Button } from "antd";
import TextArea from "antd/es/input/TextArea";
import debounce from "lodash/debounce";
import styles from "./ImagingStructureTable.module.scss";

const ImagingStructureTextTable = ({ rows, setRows, isEdit }) => {
  const [localRows, setLocalRows] = useState(rows);

  useEffect(() => {
    setLocalRows(rows);
  }, [rows]);

  const debouncedUpdate = useRef(
    debounce((nextRows) => {
      setRows(nextRows);
    }, 400),
  ).current;

  useEffect(() => {
    return () => {
      debouncedUpdate.cancel();
    };
  }, []);

  const updateRow = (id, key, value) => {
    const next = localRows.map((r) =>
      r.id === id ? { ...r, [key]: value } : r,
    );

    setLocalRows(next); // update UI ngay
    debouncedUpdate(next); // update parent có debounce
  };

  const handleDelete = (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa hàng này không?")) return;

    const next = localRows.filter((r) => r.id !== id);
    setLocalRows(next);
    setRows(next); // delete thì update ngay, không cần debounce
  };

  const handleAddRow = () => {
    const next = [
      ...localRows,
      {
        id: Date.now(),
        name: "",
        description: "",
      },
    ];
    setLocalRows(next);
    setRows(next);
  };

  return (
    <div>
      <table
        className={styles.imagingTable}
        style={{ width: "100%", borderCollapse: "collapse" }}
      >
        <colgroup>
          <col style={{ width: 44 }} />
          <col style={{ width: 150 }} />
          <col />
          <col style={{ width: 48 }} />
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
          {localRows.map((row, idx) => (
            <tr key={row.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
              <td style={tdStyle}>{idx + 1}</td>

              <td style={{ width: 300 }}>
                <Input
                  disabled={!isEdit}
                  value={row.name}
                  placeholder="Bộ phận ..."
                  onChange={(e) => updateRow(row.id, "name", e.target.value)}
                />
              </td>

              <td>
                <TextArea
                  disabled={!isEdit}
                  value={row.description}
                  autoSize={{ minRows: 1, maxRows: 8 }}
                  onChange={(e) =>
                    updateRow(row.id, "description", e.target.value)
                  }
                />
              </td>

              <td style={{ textAlign: "right", padding: 0 }}>
                <Button
                  danger
                  type="text"
                  size="small"
                  disabled={!isEdit || localRows.length === 1}
                  onClick={() => handleDelete(row.id)}
                >
                  Xóa
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Button type="link" disabled={!isEdit} onClick={handleAddRow}>
        + Thêm hàng
      </Button>
    </div>
  );
};

const thStyle = {
  padding: "6px",
  textAlign: "left",
  fontWeight: 600,
  background: "#fafafa",
};

const tdStyle = {
  padding: "4px 6px",
  verticalAlign: "middle",
};

export default ImagingStructureTextTable;
