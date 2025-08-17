// CreateFormVer2Plain.jsx – thuần HTML/CSS, giữ nguyên logic props
import React, { useEffect, useMemo, useRef, useState } from "react";

export default function CreateFormVer2Plain({
  mode = "admin", // 'admin' | 'user'
  rows = [],
  columnLabels = [],
  setColumnLabels, // only used in admin
  addRow,
  removeRow,
  addColumn,
  removeColumn,
  // DnD hàng
  onRowDragStart,
  onRowDragOver,
  onRowDrop,
  onRowDragEnd,
  // ❌ bỏ kéo thả cột
  maxCols = 5,
  onPreview,
  onAutosaveDraft,
}) {
  const isAdmin = mode === "admin";

  // ========= Local form state (thay cho AntD Form) =========
  // formData: { [rowId]: { label: string, inputs: string[] } }
  const [formData, setFormData] = useState(() => {
    const v = {};
    rows.forEach((r) => {
      v[r.id] = {
        label: r.label ?? "",
        inputs: r.inputs?.length ? [...r.inputs] : [""],
      };
    });
    return v;
  });

  // Sync khi props.rows thay đổi (thêm/xóa hàng, thêm/xóa cột từ ngoài)
  useEffect(() => {
    setFormData((prev) => {
      const next = { ...prev };
      const existIds = new Set(Object.keys(prev));
      const newIds = new Set();
      rows.forEach((r) => {
        newIds.add(r.id);
        if (!next[r.id]) {
          next[r.id] = {
            label: r.label ?? "",
            inputs: r.inputs?.length ? [...r.inputs] : [""],
          };
        } else {
          // giữ giá trị người dùng đã gõ, nhưng đảm bảo số cột khớp
          const want = r.inputs?.length || 1;
          const cur = next[r.id].inputs ?? [];
          if (cur.length < want) {
            next[r.id].inputs = [...cur, ...Array(want - cur.length).fill("")];
          } else if (cur.length > want) {
            next[r.id].inputs = cur.slice(0, want);
          }
          if (next[r.id].label === "" && r.label) next[r.id].label = r.label;
        }
      });
      // xóa những row không còn
      existIds.forEach((id) => {
        if (!newIds.has(id)) delete next[id];
      });
      return next;
    });
  }, [rows]);

  // Autosave ở mode user (thay cho onValuesChange)
  useEffect(() => {
    if (!isAdmin) {
      const ordered = rows.map((r) => ({
        id: r.id,
        label: r.label, // user không sửa nhãn
        inputs: formData[r.id]?.inputs || [],
      }));
      onAutosaveDraft?.(ordered);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData, isAdmin]);

  const labelCols = Math.max(
    1,
    Math.min(maxCols, columnLabels.length || maxCols)
  );

  const handlePreview = () => {
    // Giống validate nhẹ: đảm bảo mọi ô đều là string
    const ordered = rows.map((r) => {
      const payload = formData[r.id] || { label: "", inputs: [] };
      return {
        id: r.id,
        label: payload.label ?? r.label ?? "",
        inputs: Array.isArray(payload.inputs) ? payload.inputs : [],
      };
    });
    onPreview?.(ordered);
  };

  // ====== helpers ======
  const autoGrow = (el) => {
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  };

  const onChangeLabel = (rowId, val) => {
    setFormData((prev) => ({
      ...prev,
      [rowId]: {
        ...prev[rowId],
        label: val.slice(0, 100), // max 100
      },
    }));
  };

  const onChangeInput = (rowId, idx, val) => {
    setFormData((prev) => {
      const row = prev[rowId] || { label: "", inputs: [] };
      const nextInputs = [...(row.inputs || [])];
      nextInputs[idx] = (val ?? "").slice(0, 300); // max 300
      return { ...prev, [rowId]: { ...row, inputs: nextInputs } };
    });
  };

  const onRemoveColumn = (rowId, idx) => {
    removeColumn?.(rowId, idx);
    setFormData((prev) => {
      const row = prev[rowId] || { inputs: [] };
      const next = [...(row.inputs || [])];
      next.splice(idx, 1);
      return { ...prev, [rowId]: { ...row, inputs: next } };
    });
  };

  const onAddColumn = (rowId) => {
    addColumn?.(rowId);
    setFormData((prev) => {
      const row = prev[rowId] || { inputs: [] };
      const next = Array.isArray(row.inputs) ? [...row.inputs, ""] : [""];
      return { ...prev, [rowId]: { ...row, inputs: next } };
    });
  };

  // ====== Styles nhỏ gọn (A4, card, grid, nút) ======
  const styles = {
    a4: {
      maxWidth: "100%",
      margin: "0 0",
    },
    stack: { display: "flex", flexDirection: "column", gap: 12 },
    row: { display: "flex", alignItems: "flex-start", gap: 8, width: "100%" },
    card: {
      flex: 1,
      padding: 12,
      border: "1px solid #f0f0f0",
      borderRadius: 10,
      background: "#fff",
      cursor: isAdmin ? "grab" : "default",
    },
    labelCol: { width: "25%" }, // ~ md=6/24
    inputsCol: { width: "75%" }, // ~ md=18/24
    grid: (nCols) => ({
      display: "grid",
      gridTemplateColumns: `repeat(${Math.max(1, nCols)}, minmax(0, 1fr))`,
      gap: 8,
    }),
    input: {
      width: "100%",
      minHeight: 60,
      resize: "vertical",
      padding: 8,
      borderRadius: 6,
      border: "1px solid #d9d9d9",
      fontSize: 14,
      lineHeight: "1.4",
    },
    labelArea: {
      width: "100%",
      minHeight: 80,
      resize: "vertical",
      padding: 8,
      borderRadius: 6,
      border: "1px solid #d9d9d9",
      fontSize: 14,
      lineHeight: "1.4",
    },
    headerStrip: {
      background: "#fff",
      border: "1px solid #f0f0f0",
      borderRadius: 10,
      padding: 0,
    },
    colLabelsRow: {
      display: "flex",
      gap: 8,
      alignItems: "stretch",
    },
    colLabelsLeft: { width: "25%" },
    colLabelsRight: { width: "75%" },
    toolbarRight: {
      display: "flex",
      flexDirection: "column",
      gap: 8,
      alignItems: "flex-end",
    },
    hr: { border: "none", borderTop: "1px dashed #eee", margin: "60px 0 0" },
    addRowWrap: {
      marginTop: 0,
      display: "flex",
      justifyContent: "flex-end",
      width: "100%",
    },
    btn: {
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      padding: "1px 4px",
      borderRadius: 8,
      border: "1px solid #d9d9d9",
      background: "#fafafa",
      cursor: "pointer",
      fontSize: 13,
    },
    btnDanger: {
      background: "#fff5f5",
      border: "1px solid #ffccc7",
      color: "#cf1322",
    },
    btnGhost: {
      background: "#fff",
    },
    icon: { fontSize: 16, opacity: 0.75 },
    smallNote: { fontSize: 12, color: "#999" },
  };

  return (
    <div style={styles.a4}>
      {/* ======= NHÃN CỘT (thụt trái như inputs) ======= */}
      <div style={{ marginBottom: 12 }}>
        <div style={styles.colLabelsRow}>
          <div style={styles.colLabelsLeft}>
            {/* chừa trống để canh thụt */}
          </div>
          <div style={styles.colLabelsRight}>
            <div style={styles.headerStrip}>
              <div style={{ ...styles.grid(labelCols), padding: 0 }}>
                {Array.from({ length: labelCols }).map((_, i) => (
                  <input
                    key={i}
                    type="text"
                    value={columnLabels?.[i] ?? ""}
                    placeholder={`Nhãn cột ${i + 1}`}
                    onChange={(e) =>
                      isAdmin &&
                      setColumnLabels?.((prev) => {
                        const copy = [...(prev || [])];
                        for (let k = copy.length; k < labelCols; k++)
                          copy[k] = "";
                        copy[i] = e.target.value ?? "";
                        return copy;
                      })
                    }
                    disabled={!isAdmin}
                    style={{
                      width: "100%",
                      padding: "8px",
                      border: "1px solid #d9d9d9",
                      borderRadius: 6,
                      fontSize: 14,
                    }}
                  />
                ))}
              </div>
            </div>
            <div style={styles.smallNote}>
              * Hệ thống tự lấy số cột tối đa ≤ {maxCols} để hiển thị nhãn.
            </div>
          </div>
        </div>
      </div>

      {/* ========================= FORM BODY ========================= */}
      <div style={styles.stack}>
        {rows.map((row, idx) => {
          const rData = formData[row.id] || { label: "", inputs: [""] };
          const nCols = rData.inputs?.length || 1;

          const card = (
            <div
              key={row.id}
              style={styles.card}
              draggable={isAdmin}
              onDragStart={
                isAdmin ? (e) => onRowDragStart?.(e, row.id) : undefined
              }
              onDragOver={isAdmin ? onRowDragOver : undefined}
              onDrop={isAdmin ? (e) => onRowDrop?.(e, row.id) : undefined}
              onDragEnd={isAdmin ? onRowDragEnd : undefined}
            >
              <div
                style={{ display: "flex", gap: 12, alignItems: "flex-start" }}
              >
                {/* Label (trái) */}
                <div style={styles.labelCol}>
                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      alignItems: "flex-start",
                    }}
                  >
                    {isAdmin && (
                      <span title="Kéo để sắp xếp" style={styles.icon}>
                        ⠿
                      </span>
                    )}
                    <textarea
                      placeholder="Tiêu đề"
                      disabled={!isAdmin}
                      value={rData.label}
                      onChange={(e) => onChangeLabel(row.id, e.target.value)}
                      onInput={(e) => autoGrow(e.currentTarget)}
                      maxLength={100}
                      style={styles.labelArea}
                    />
                  </div>
                </div>

                {/* Inputs (phải) */}
                <div style={styles.inputsCol}>
                  <div style={styles.grid(nCols)}>
                    {(rData.inputs || []).map((val, i) => {
                      const isLast = i === nCols - 1;
                      return (
                        <div key={i}>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              marginBottom: 0,
                            }}
                          >
                            <div style={{ display: "flex", gap: 6 }}>
                              {isAdmin && nCols > 1 && (
                                <button
                                  type="button"
                                  title="Xóa cột này"
                                  onClick={() => onRemoveColumn(row.id, i)}
                                  style={{ ...styles.btn, ...styles.btnDanger }}
                                >
                                  ✕
                                </button>
                              )}
                              {isAdmin && isLast && (
                                <button
                                  type="button"
                                  title={
                                    nCols >= maxCols
                                      ? `Tối đa ${maxCols} cột`
                                      : "Thêm cột"
                                  }
                                  disabled={nCols >= maxCols}
                                  onClick={() => onAddColumn(row.id)}
                                  style={styles.btn}
                                >
                                  ＋
                                </button>
                              )}
                            </div>
                          </div>

                          <textarea
                            placeholder="Nội dung:"
                            disabled={!isAdmin}
                            value={val}
                            onChange={(e) =>
                              onChangeInput(row.id, i, e.target.value)
                            }
                            onInput={(e) => autoGrow(e.currentTarget)}
                            maxLength={300}
                            style={styles.input}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          );

          return (
            <React.Fragment key={`${row.id}-frag`}>
              <div style={styles.row}>
                <div style={{ flex: 1 }}>{card}</div>

                {/* Cột thao tác (xóa hàng) đặt ngoài để không che input */}
                {isAdmin && (
                  <div
                    style={styles.toolbarRight}
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      title="Xóa hàng này"
                      onClick={() => removeRow?.(row.id)}
                      style={{ ...styles.btn, ...styles.btnDanger }}
                    >
                      🗑
                    </button>
                  </div>
                )}
              </div>

              {/* Divider giữa các hàng */}
              {idx < rows.length - 1 && <hr style={styles.hr} />}

              {/* Thêm hàng chỉ ở hàng cuối */}
              {isAdmin && idx === rows.length - 1 && (
                <div style={styles.addRowWrap}>
                  <button
                    type="button"
                    title="Thêm hàng mới"
                    onClick={addRow}
                    style={styles.btn}
                  >
                    ＋ Thêm hàng
                  </button>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Action bar đơn giản */}
      {/* <div
        style={{
          marginTop: 24,
          display: "flex",
          gap: 8,
          justifyContent: "flex-end",
        }}
      >
        <button
          type="button"
          onClick={handlePreview}
          style={{ ...styles.btn, ...styles.btnGhost }}
        >
          👁 Xem trước
        </button>
      </div> */}
    </div>
  );
}
