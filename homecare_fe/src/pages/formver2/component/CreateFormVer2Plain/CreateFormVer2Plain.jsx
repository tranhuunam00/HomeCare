import React, { useEffect, useMemo, useRef, useState } from "react";
import styles from "./CreateFormVer2Plain.module.scss";

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
  onChangeLabel: onChangeLabelUp, // NEW
  onChangeInput: onChangeInputUp,
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
    const capped = (val ?? "").slice(0, 100);
    setFormData((prev) => ({
      ...prev,
      [rowId]: { ...prev[rowId], label: capped },
    }));
    // đẩy lên parent
    onChangeLabelUp?.(rowId, capped);
  };

  const onChangeInput = (rowId, idx, val) => {
    const capped = (val ?? "").slice(0, 300);
    setFormData((prev) => {
      const row = prev[rowId] || { label: "", inputs: [] };
      const nextInputs = [...(row.inputs || [])];
      nextInputs[idx] = capped;
      return { ...prev, [rowId]: { ...row, inputs: nextInputs } };
    });
    // đẩy lên parent
    onChangeInputUp?.(rowId, idx, capped);
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

  return (
    <div className={styles.a4}>
      {/* ======= NHÃN CỘT (thụt trái như inputs) ======= */}
      <div className={styles.colLabelsWrap}>
        <div className={styles.colLabelsRow}>
          <div className={styles.colLabelsLeft}>{/* chừa trống */}</div>
          <div className={styles.colLabelsRight}>
            <div className={styles.headerStrip}>
              <div className={styles.grid} style={{ ["--cols"]: labelCols }}>
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
                    className={styles.colLabelInput}
                  />
                ))}
              </div>
            </div>
            <div className={styles.smallNote}>
              * Hệ thống tự lấy số cột tối đa ≤ {maxCols} để hiển thị nhãn.
            </div>
          </div>
        </div>
      </div>

      {/* ========================= FORM BODY ========================= */}
      <div className={styles.stack}>
        {rows.map((row, idx) => {
          const rData = formData[row.id] || { label: "", inputs: [""] };
          const nCols = rData.inputs?.length || 1;

          const card = (
            <div
              key={row.id}
              className={`${styles.card} ${isAdmin ? styles.draggable : ""}`}
              draggable={isAdmin}
              onDragStart={
                isAdmin ? (e) => onRowDragStart?.(e, row.id) : undefined
              }
              onDragOver={isAdmin ? onRowDragOver : undefined}
              onDrop={isAdmin ? (e) => onRowDrop?.(e, row.id) : undefined}
              onDragEnd={isAdmin ? onRowDragEnd : undefined}
            >
              <div className={styles.cardInner}>
                {/* Label (trái) */}
                <div className={styles.labelCol}>
                  <div className={styles.labelWrap}>
                    {isAdmin && (
                      <span title="Kéo để sắp xếp" className={styles.icon}>
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
                      className={styles.labelArea}
                    />
                  </div>
                </div>

                {/* Inputs (phải) */}
                <div className={styles.inputsCol}>
                  <div className={styles.grid} style={{ ["--cols"]: nCols }}>
                    {(rData.inputs || []).map((val, i) => {
                      const isLast = i === nCols - 1;
                      return (
                        <div key={i}>
                          <div className={styles.inputToolbar}>
                            <div className={styles.inputToolbarLeft}>
                              {isAdmin && nCols > 1 && (
                                <button
                                  type="button"
                                  title="Xóa cột này"
                                  onClick={() => onRemoveColumn(row.id, i)}
                                  className={`${styles.btn} ${styles.btnDanger}`}
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
                                  className={styles.btn}
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
                            className={styles.input}
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
              <div className={styles.row}>
                <div className={styles.rowMain}>{card}</div>

                {/* Cột thao tác (xóa hàng) đặt ngoài để không che input */}
                {isAdmin && (
                  <div
                    className={styles.toolbarRight}
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      title="Xóa hàng này"
                      onClick={() => removeRow?.(row.id)}
                      className={`${styles.btn} ${styles.btnDanger}`}
                    >
                      🗑
                    </button>
                  </div>
                )}
              </div>

              {/* Divider giữa các hàng */}
              {idx < rows.length - 1 && <hr className={styles.hr} />}

              {/* Thêm hàng chỉ ở hàng cuối */}
              {isAdmin && idx === rows.length - 1 && (
                <div className={styles.addRowWrap}>
                  <button
                    type="button"
                    title="Thêm hàng mới"
                    onClick={addRow}
                    className={styles.btn}
                  >
                    ＋ Thêm hàng
                  </button>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Action bar đơn giản (nếu cần) */}
      {/* <div className={styles.actionBar}>
        <button
          type="button"
          onClick={handlePreview}
          className={`${styles.btn} ${styles.btnGhost}`}
        >
          👁 Xem trước
        </button>
      </div> */}
    </div>
  );
}
