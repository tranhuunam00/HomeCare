// src/pages/AdminFormVer2.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Button, Space, Segmented, Typography, Divider } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";

import {
  MAX_COLS,
  mkId,
  reorderArray,
  computeNMax,
  ensureColumnLabels,
} from "../utils.js";
import CreateFormVer2 from "./CreateFormVer2.jsx";

const { Title } = Typography;

/* Tạo 1 "bảng" mới (form) với state riêng */
const mkTable = () => ({
  tid: mkId(),
  rows: [{ id: mkId(), inputs: [""], label: "Short text:" }],
  columnLabels: ensureColumnLabels([], 1),
});

export default function AdminFormVer2() {
  // Quản lý NHIỀU bảng
  const [tables, setTables] = useState([mkTable()]);

  /* ======================= Helpers cập nhật theo tid ======================= */
  const updateTable = (tid, updater) =>
    setTables((prev) =>
      prev.map((t) => (t.tid === tid ? updater(structuredClone(t)) : t))
    );

  const addTable = () => setTables((prev) => [...prev, mkTable()]);
  const removeTable = (tid) =>
    setTables((prev) =>
      prev.length > 1 ? prev.filter((t) => t.tid !== tid) : prev
    );

  /* ======================= HÀNG ======================= */
  const addRow = (tid) =>
    updateTable(tid, (t) => {
      t.rows.push({ id: mkId(), inputs: [""], label: "Short text:" });
      const nMax = computeNMax(t.rows);
      t.columnLabels = ensureColumnLabels(t.columnLabels, nMax);
      return t;
    });

  const removeRow = (tid, rowId) =>
    updateTable(tid, (t) => {
      t.rows = t.rows.filter((r) => r.id !== rowId);
      const nMax = computeNMax(t.rows);
      t.columnLabels = ensureColumnLabels(t.columnLabels, nMax);
      return t;
    });

  const onRowDragStart = (tid, _e, rowId) =>
    updateTable(tid, (t) => ((t._dragRowSrcId = rowId), t));
  const onRowDragOver = (_e) => _e.preventDefault();
  const onRowDrop = (tid, e, targetId) =>
    updateTable(tid, (t) => {
      e.preventDefault();
      const srcId = t._dragRowSrcId;
      t._dragRowSrcId = null;
      if (!srcId || srcId === targetId) return t;
      const srcIndex = t.rows.findIndex((r) => r.id === srcId);
      const targetIndex = t.rows.findIndex((r) => r.id === targetId);
      if (srcIndex < 0 || targetIndex < 0) return t;
      const next = [...t.rows];
      const [moved] = next.splice(srcIndex, 1);
      next.splice(targetIndex, 0, moved);
      t.rows = next;
      return t;
    });
  const onRowDragEnd = (tid) =>
    updateTable(tid, (t) => ((t._dragRowSrcId = null), t));

  /* ======================= CỘT ======================= */
  const addColumn = (tid, rowId) =>
    updateTable(tid, (t) => {
      t.rows = t.rows.map((r) =>
        r.id === rowId && r.inputs.length < MAX_COLS
          ? { ...r, inputs: [...r.inputs, ""] }
          : r
      );
      const nMax = computeNMax(t.rows);
      t.columnLabels = ensureColumnLabels(t.columnLabels, nMax);
      return t;
    });

  const removeColumn = (tid, rowId, colIndex) =>
    updateTable(tid, (t) => {
      t.rows = t.rows.map((r) => {
        if (r.id !== rowId) return r;
        if (r.inputs.length <= 1) return r;
        return { ...r, inputs: r.inputs.filter((_, i) => i !== colIndex) };
      });
      const nMax = computeNMax(t.rows);
      t.columnLabels = ensureColumnLabels(t.columnLabels, nMax);
      return t;
    });

  // (CreateFormVer2 đã bỏ kéo-thả cột, nên KHÔNG cần onColDrag* nữa)

  /* ======================= UI ======================= */
  return (
    <div style={{ maxWidth: 1400, margin: "0 auto", padding: 16 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: 12,
        }}
      >
        <Segmented
          value={"admin"}
          options={[{ label: "Admin", value: "admin" }]}
          disabled
        />
        {/* Nút thêm bảng toàn cục */}
        <Button type="dashed" icon={<PlusOutlined />} onClick={addTable}>
          Thêm bảng
        </Button>
      </div>

      <Space direction="vertical" style={{ width: "100%" }} size={20}>
        {tables.map((t, idx) => {
          const nMax = computeNMax(t.rows);

          return (
            <div
              key={t.tid}
              style={{
                border: "1px solid #eaeaea",
                borderRadius: 10,
                padding: 12,
                background: "#fff",
              }}
            >
              {/* Header mỗi bảng */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <Space>
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    size="small"
                    onClick={() => removeTable(t.tid)}
                    disabled={tables.length <= 1}
                  >
                    Xóa bảng
                  </Button>
                </Space>
              </div>

              {/* Form builder cho bảng này */}
              <CreateFormVer2
                mode="admin"
                rows={t.rows}
                columnLabels={t.columnLabels}
                setColumnLabels={(updater) =>
                  updateTable(t.tid, (tt) => {
                    tt.columnLabels =
                      typeof updater === "function"
                        ? updater(tt.columnLabels)
                        : updater;
                    // đảm bảo đủ độ dài theo nMax hiện tại
                    tt.columnLabels = ensureColumnLabels(
                      tt.columnLabels,
                      computeNMax(tt.rows)
                    );
                    return tt;
                  })
                }
                addRow={() => addRow(t.tid)}
                removeRow={(rowId) => removeRow(t.tid, rowId)}
                addColumn={(rowId) => addColumn(t.tid, rowId)}
                removeColumn={(rowId, colIndex) =>
                  removeColumn(t.tid, rowId, colIndex)
                }
                // DnD hàng
                onRowDragStart={(e, rowId) => onRowDragStart(t.tid, e, rowId)}
                onRowDragOver={onRowDragOver}
                onRowDrop={(e, targetRowId) => onRowDrop(t.tid, e, targetRowId)}
                onRowDragEnd={() => onRowDragEnd(t.tid)}
                // (CreateFormVer2 không nhận onColDrag* nữa)
                maxCols={MAX_COLS}
                onPreview={undefined}
                onAutosaveDraft={undefined}
              />

              {/* Nút "Thêm bảng" giữa các bảng (tuỳ thích). Có thể bỏ nếu không cần */}
              {/* <div style={{ textAlign: "right", marginTop: 8 }}>
                <Button type="dashed" icon={<PlusOutlined />} onClick={addTable}>
                  Thêm bảng
                </Button>
              </div> */}

              {idx < tables.length - 1 && (
                <Divider style={{ margin: "12px 0 0" }} />
              )}
            </div>
          );
        })}
      </Space>
    </div>
  );
}
