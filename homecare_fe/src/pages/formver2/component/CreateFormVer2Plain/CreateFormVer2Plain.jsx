import React from "react";
import styles from "./CreateFormVer2Plain.module.scss";

export default function CreateFormVer2Plain({
  mode = "admin", // 'admin' | 'user'
  rows = [],
  columnLabels = [],
  setColumnLabels,
  addRow,
  removeRow,
  addColumn,
  removeColumn,
  // DnD hàng
  onRowDragStart,
  onRowDragOver,
  onRowDrop,
  onRowDragEnd,
  maxCols = 5,
  onPreview,
  onAutosaveDraft, // không dùng khi controlled, nhưng giữ prop cho tương thích
  onChangeLabel: onChangeLabelUp,
  onChangeInput: onChangeInputUp,
}) {
  const isAdmin = mode === "admin";

  const labelCols = Math.max(
    1,
    Math.min(maxCols, columnLabels.length || maxCols)
  );

  const autoGrow = (el) => {
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  };

  const onChangeLabel = (rowId, val) => {
    const capped = (val ?? "").slice(0, 100);
    onChangeLabelUp?.(rowId, capped);
  };

  const onChangeInput = (rowId, idx, val) => {
    const capped = (val ?? "").slice(0, 300);
    onChangeInputUp?.(rowId, idx, capped);
  };

  return (
    <div className={styles.a4}>
      {/* ======= NHÃN CỘT (thụt trái như inputs) ======= */}
      <div className={styles.colLabelsWrap}>
        <div className={styles.colLabelsRow}>
          <div className={styles.colLabelsLeft} />
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
                      setColumnLabels?.((prev = []) => {
                        const copy = [...prev];
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
          const nCols =
            Array.isArray(row.inputs) && row.inputs.length > 0
              ? row.inputs.length
              : 1;

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
                      value={row.label ?? ""}
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
                    {(row.inputs?.length
                      ? row.inputs
                      : Array.from({ length: 1 }, () => "")
                    )?.map((val, i) => {
                      const isLast = i === nCols - 1;
                      return (
                        <div key={i}>
                          <div className={styles.inputToolbar}>
                            <div className={styles.inputToolbarLeft}>
                              {isAdmin && nCols > 1 && (
                                <button
                                  type="button"
                                  title="Xóa cột này"
                                  onClick={() => removeColumn?.(row.id, i)}
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
                                  onClick={() => addColumn?.(row.id)}
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
                            value={val ?? ""}
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
    </div>
  );
}
