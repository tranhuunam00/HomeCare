// FormVer2 — admin → user → print (localStorage, Ant Design)
// Single-file demo that shows the full workflow:
// 1) Admin designs the form layout & default values, then saves as a template.
// 2) User loads the saved template, fills inputs (labels locked), autosaves to draft.
// 3) User previews/prints.
//
// Notes:
// - Uses localStorage keys FORM_VER2_TEMPLATE and FORM_VER2_DRAFT.
// - Max columns per row = 5.
// - In USER mode: hide all structure-editing controls and disable label fields.
// - You can remove DnD fully by hiding handlers + not passing DnD callbacks.

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Button,
  Col,
  Divider,
  Form,
  Input,
  Modal,
  Popconfirm,
  Row,
  Segmented,
  Space,
  Tooltip,
  Typography,
  message,
} from "antd";
import {
  CloseOutlined,
  DeleteOutlined,
  EyeOutlined,
  HolderOutlined,
  PlusOutlined,
  SaveOutlined,
  UndoOutlined,
  CloudDownloadOutlined,
  ClearOutlined,
  PrinterOutlined,
} from "@ant-design/icons";

/* ========================= Helpers & Storage ========================= */
const { Title, Text } = Typography;
const mkId = () => Math.random().toString(36).slice(2, 9);
const MAX_COLS = 5;
const STORAGE_KEYS = {
  TEMPLATE: "FORM_VER2_TEMPLATE",
  DRAFT: "FORM_VER2_DRAFT",
};

const saveTemplate = (rows) => {
  localStorage.setItem(STORAGE_KEYS.TEMPLATE, JSON.stringify(rows || []));
  return true;
};
const loadTemplate = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TEMPLATE);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.error(e);
    return null;
  }
};
const clearTemplate = () => localStorage.removeItem(STORAGE_KEYS.TEMPLATE);

const saveDraft = (data) => {
  localStorage.setItem(STORAGE_KEYS.DRAFT, JSON.stringify(data || []));
};
const loadDraft = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DRAFT);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.error(e);
    return null;
  }
};
const clearDraft = () => localStorage.removeItem(STORAGE_KEYS.DRAFT);

/* ========================= Preview (Print view) ========================= */
function FormVer2Preview({ data = [] }) {
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
            <th
              style={{
                border: "1px solid #d9d9d9",
                padding: 8,
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
                    padding: 8,
                    verticalAlign: "top",
                    width: 260,
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
                            padding: 8,
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

/* ========================= Form builder / filler ========================= */
function CreateFormVer2({
  mode = "admin", // 'admin' | 'user'
  rows,
  addRow,
  removeRow,
  addColumn,
  removeColumn,
  // DnD hàng
  onRowDragStart,
  onRowDragOver,
  onRowDrop,
  onRowDragEnd,
  // DnD cột
  onColDragStart,
  onColDragOver,
  onColDrop,
  onColDragEnd,
  maxCols = 5,
  onPreview,
  onAutosaveDraft,
}) {
  const [form] = Form.useForm();
  const isAdmin = mode === "admin";

  // submit (nếu cần lưu backend)
  const onFinish = (values) => {
    console.log("Submit:", values.rows);
  };

  // tạo dữ liệu preview theo thứ tự layout hiện tại
  const handlePreview = async () => {
    await form.validateFields();
    const values = form.getFieldsValue();
    const ordered = rows.map((r) => {
      const payload = values?.rows?.[r.id] || {};
      return {
        id: r.id,
        label: payload.label ?? r.label ?? "",
        inputs: Array.isArray(payload.inputs) ? payload.inputs : [],
      };
    });
    onPreview?.(ordered);
  };

  // autosave draft when user typing (USER mode)
  const handleValuesChange = (_, allValues) => {
    if (!isAdmin) {
      const ordered = rows.map((r) => {
        const payload = allValues?.rows?.[r.id] || {};
        return {
          id: r.id,
          label: r.label, // user cannot change
          inputs: Array.isArray(payload.inputs) ? payload.inputs : [],
        };
      });
      onAutosaveDraft?.(ordered);
    }
  };

  // ensure initial values reflect current rows defaults
  const initialValues = useMemo(() => {
    const v = { rows: {} };
    rows.forEach((r) => {
      v.rows[r.id] = {
        label: r.label,
        inputs: r.inputs && r.inputs.length ? r.inputs : [""],
      };
    });
    return v;
  }, [rows]);

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      onValuesChange={handleValuesChange}
      initialValues={initialValues}
    >
      <Space direction="vertical" style={{ width: "100%" }} size={12}>
        {rows.map((row, idx) => (
          <div
            key={row.id}
            draggable={isAdmin}
            onDragStart={
              isAdmin ? (e) => onRowDragStart?.(e, row.id) : undefined
            }
            onDragOver={isAdmin ? onRowDragOver : undefined}
            onDrop={isAdmin ? (e) => onRowDrop?.(e, row.id) : undefined}
            onDragEnd={isAdmin ? onRowDragEnd : undefined}
            style={{
              padding: 12,
              border: "1px solid #f0f0f0",
              borderRadius: 10,
              background: "#fff",
              cursor: isAdmin ? "grab" : "default",
            }}
          >
            <Row gutter={[12, 8]} align="middle">
              {/* Tiêu đề + handle hàng */}
              <Col xs={24} md={6}>
                <Space align="start" style={{ width: "100%" }}>
                  {isAdmin && (
                    <Tooltip title="Kéo để sắp xếp hàng">
                      <HolderOutlined style={{ fontSize: 18, color: "#999" }} />
                    </Tooltip>
                  )}
                  <Form.Item
                    name={["rows", row.id, "label"]}
                    label={<Text strong>Tiêu đề</Text>}
                    initialValue={row.label}
                    rules={[{ required: true, message: "Nhập tiêu đề" }]}
                    style={{ flex: 1, marginBottom: 0 }}
                  >
                    <Input placeholder="Short text:" disabled={!isAdmin} />
                  </Form.Item>
                </Space>
              </Col>

              {/* Các input – grid luôn n cột */}
              <Col xs={24} md={18}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: `repeat(${
                      row.inputs.length || 1
                    }, minmax(0, 1fr))`,
                    gap: 12,
                  }}
                >
                  {(row.inputs || []).map((_, i) => (
                    <div
                      key={i}
                      onDragOver={isAdmin ? onColDragOver : undefined}
                      onDrop={
                        isAdmin
                          ? (e) =>
                              onColDrop?.(e, row.id, i, (from, to) => {
                                // sync order inside Form when DnD
                                const v = form.getFieldsValue();
                                const rowV = v?.rows?.[row.id];
                                if (!rowV?.inputs) return;
                                const copy = [...rowV.inputs];
                                const [m] = copy.splice(from, 1);
                                copy.splice(to, 0, m);
                                form.setFieldsValue({
                                  ...v,
                                  rows: {
                                    ...v.rows,
                                    [row.id]: { ...rowV, inputs: copy },
                                  },
                                });
                              })
                          : undefined
                      }
                    >
                      <Form.Item
                        name={["rows", row.id, "inputs", i]}
                        label={
                          <Space>
                            {isAdmin && (
                              <Tooltip title="Kéo để sắp xếp cột">
                                <Button
                                  size="small"
                                  type="text"
                                  icon={<HolderOutlined />}
                                  draggable
                                  onDragStart={(e) =>
                                    onColDragStart?.(e, row.id, i)
                                  }
                                  onDragEnd={onColDragEnd}
                                  style={{ cursor: "grab" }}
                                />
                              </Tooltip>
                            )}
                            {i === 0 ? (
                              <Text strong>Giá trị</Text>
                            ) : (
                              <span>&nbsp;</span>
                            )}
                            {isAdmin && row.inputs.length > 1 && (
                              <Tooltip title="Xóa cột này">
                                <Button
                                  size="small"
                                  type="text"
                                  danger
                                  icon={<CloseOutlined />}
                                  onClick={() => removeColumn?.(row.id, i)}
                                />
                              </Tooltip>
                            )}
                          </Space>
                        }
                        initialValue={row.inputs?.[i] ?? ""}
                        rules={[{ required: true, message: "Nhập nội dung" }]}
                        style={{ marginBottom: 0 }}
                      >
                        <Input placeholder="Short text" />
                      </Form.Item>
                    </div>
                  ))}
                </div>

                {/* Thêm cột */}
                {isAdmin && (
                  <div style={{ marginTop: 8 }}>
                    <Tooltip
                      title={
                        row.inputs.length >= maxCols
                          ? `Tối đa ${maxCols} cột`
                          : "Thêm cột"
                      }
                    >
                      <Button
                        type="dashed"
                        icon={<PlusOutlined />}
                        size="small"
                        onClick={() => addColumn?.(row.id)}
                        disabled={row.inputs.length >= maxCols}
                      >
                        Thêm cột
                      </Button>
                    </Tooltip>
                  </div>
                )}
              </Col>

              {/* Xóa hàng */}
              {isAdmin && (
                <Col xs={24} style={{ textAlign: "right", marginTop: 8 }}>
                  <Popconfirm
                    title="Xóa hàng này?"
                    okText="Xóa"
                    cancelText="Hủy"
                    onConfirm={() => removeRow?.(row.id)}
                  >
                    <Button danger icon={<DeleteOutlined />} size="small">
                      Xóa hàng
                    </Button>
                  </Popconfirm>
                </Col>
              )}
            </Row>

            {idx < rows.length - 1 && (
              <Divider style={{ margin: "12px 0 0" }} />
            )}
          </div>
        ))}

        {/* Action */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 8,
          }}
        >
          {isAdmin ? (
            <Button type="dashed" icon={<PlusOutlined />} onClick={addRow}>
              Thêm hàng
            </Button>
          ) : (
            <span />
          )}

          <Space>
            <Button icon={<EyeOutlined />} onClick={handlePreview}>
              Xem kết quả
            </Button>
            <Button type="primary" htmlType="submit">
              Lưu mô tả
            </Button>
          </Space>
        </div>
      </Space>
    </Form>
  );
}

/* ========================= Page: Admin/User/Print flow ========================= */
export default function FormVer2WorkflowPage() {
  // ----- rows layout state -----
  const [rows, setRows] = useState([
    { id: mkId(), inputs: [""], label: "Short text:" },
    { id: mkId(), inputs: ["", ""], label: "Short text:" },
    { id: mkId(), inputs: ["", "", ""], label: "Short text:" },
  ]);

  // Which mode are we in? (for the demo UI)
  const [mode, setMode] = useState("admin"); // 'admin' | 'user'

  // Drag & Drop Hàng / Cột (only active in admin)
  const dragRowSrcIdRef = useRef(null);
  const dragColRef = useRef({ rowId: null, colIndex: null });

  // helpers
  const reorderArray = (arr, from, to) => {
    const copy = [...arr];
    const [item] = copy.splice(from, 1);
    copy.splice(to, 0, item);
    return copy;
  };

  // ====== HÀNG ======
  const addRow = () =>
    setRows((prev) => [
      ...prev,
      { id: mkId(), inputs: [""], label: "Short text:" },
    ]);
  const removeRow = (id) => setRows((prev) => prev.filter((r) => r.id !== id));
  const onRowDragStart = (_e, rowId) => (dragRowSrcIdRef.current = rowId);
  const onRowDragOver = (e) => e.preventDefault();
  const onRowDrop = (e, targetId) => {
    e.preventDefault();
    const srcId = dragRowSrcIdRef.current;
    if (!srcId || srcId === targetId) return;
    setRows((prev) => {
      const srcIndex = prev.findIndex((r) => r.id === srcId);
      const targetIndex = prev.findIndex((r) => r.id === targetId);
      if (srcIndex < 0 || targetIndex < 0) return prev;
      const next = [...prev];
      const [moved] = next.splice(srcIndex, 1);
      next.splice(targetIndex, 0, moved);
      return next;
    });
    dragRowSrcIdRef.current = null;
  };
  const onRowDragEnd = () => (dragRowSrcIdRef.current = null);

  // ====== CỘT ======
  const addColumn = (rowId) =>
    setRows((prev) =>
      prev.map((r) =>
        r.id === rowId && r.inputs.length < MAX_COLS
          ? { ...r, inputs: [...r.inputs, ""] }
          : r
      )
    );
  const removeColumn = (rowId, colIndex) =>
    setRows((prev) =>
      prev.map((r) => {
        if (r.id !== rowId) return r;
        if (r.inputs.length <= 1) return r;
        return { ...r, inputs: r.inputs.filter((_, i) => i !== colIndex) };
      })
    );

  const onColDragStart = (_e, rowId, colIndex) =>
    (dragColRef.current = { rowId, colIndex });
  const onColDragOver = (e) => e.preventDefault();
  const onColDrop = (e, rowId, targetIndex, sync) => {
    e.preventDefault();
    const { rowId: srcRowId, colIndex: srcIndex } = dragColRef.current || {};
    if (srcRowId == null || srcIndex == null) return;
    if (srcRowId !== rowId || srcIndex === targetIndex) {
      dragColRef.current = { rowId: null, colIndex: null };
      return;
    }
    setRows((prev) =>
      prev.map((r) =>
        r.id !== rowId
          ? r
          : { ...r, inputs: reorderArray(r.inputs, srcIndex, targetIndex) }
      )
    );
    sync?.(srcIndex, targetIndex);
    dragColRef.current = { rowId: null, colIndex: null };
  };
  const onColDragEnd = () =>
    (dragColRef.current = { rowId: null, colIndex: null });

  // ----- Preview state -----
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState([]);

  const handleOpenPreview = (orderedValues) => {
    setPreviewData(orderedValues);
    setPreviewOpen(true);
  };

  // ===================== Admin actions (Template) =====================
  const handleSaveTemplate = () => {
    // Normalize rows: ensure at least one input per row
    const normalized = rows.map((r) => ({
      ...r,
      inputs: r.inputs?.length ? r.inputs : [""],
    }));
    saveTemplate(normalized);
    message.success("Đã lưu mẫu (template) vào trình duyệt");
  };
  const handleLoadTemplate = () => {
    const tpl = loadTemplate();
    if (!tpl || !Array.isArray(tpl) || !tpl.length) {
      message.warning("Chưa có mẫu nào trong trình duyệt");
      return;
    }
    setRows(tpl);
    message.success("Đã tải mẫu");
  };
  const handleClearTemplate = () => {
    clearTemplate();
    message.success("Đã xóa mẫu trong trình duyệt");
  };

  // ===================== User actions (Draft) =====================
  const handleAutosaveDraft = (ordered) => {
    saveDraft(ordered);
  };
  const handleLoadDraft = () => {
    const d = loadDraft();
    if (d && Array.isArray(d) && d.length) {
      setRows(
        d.map((r) => ({ ...r, inputs: r.inputs?.length ? r.inputs : [""] }))
      );
      message.success("Đã tải bản nháp từ trình duyệt");
    } else {
      message.info("Không có bản nháp, sẽ tải mẫu thay thế nếu có");
      const tpl = loadTemplate();
      if (tpl && tpl.length) setRows(tpl);
    }
  };
  const handleClearDraft = () => {
    clearDraft();
    message.success("Đã xóa bản nháp");
  };

  // Switch to USER auto-load template if available
  useEffect(() => {
    if (mode === "user") {
      // Load draft first, else template
      const d = loadDraft();
      if (d && Array.isArray(d) && d.length) {
        setRows(d);
      } else {
        const tpl = loadTemplate();
        if (tpl && tpl.length) setRows(tpl);
      }
    }
  }, [mode]);

  // Print handler (print current preview data)
  const handlePrint = () => {
    // If preview not opened yet, build from current rows
    if (!previewOpen) {
      const ordered = rows.map((r) => ({
        id: r.id,
        label: r.label,
        inputs: r.inputs || [""],
      }));
      setPreviewData(ordered);
      setPreviewOpen(true);
      // Give modal a tick to render before print
      setTimeout(() => window.print(), 100);
    } else {
      window.print();
    }
  };

  return (
    <div style={{ maxWidth: 1400, margin: "0 auto", padding: 16 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <Title level={3} style={{ marginBottom: 12, color: "#2f6db8" }}>
          MÔ TẢ HÌNH ẢNH — Quy trình Admin → User → In
        </Title>
        <Segmented
          value={mode}
          onChange={(v) => setMode(v)}
          options={[
            { label: "Admin", value: "admin" },
            { label: "User", value: "user" },
          ]}
        />
      </div>

      {/* Toolbar theo mode */}
      {mode === "admin" ? (
        <Space style={{ marginBottom: 16 }} wrap>
          <Button
            icon={<SaveOutlined />}
            type="primary"
            onClick={handleSaveTemplate}
          >
            Lưu mẫu
          </Button>
          <Button icon={<CloudDownloadOutlined />} onClick={handleLoadTemplate}>
            Tải mẫu
          </Button>
          <Button icon={<ClearOutlined />} danger onClick={handleClearTemplate}>
            Xóa mẫu
          </Button>
          <Button
            icon={<UndoOutlined />}
            onClick={() => setRows(loadTemplate() || rows)}
          >
            Hoàn tác về mẫu
          </Button>
        </Space>
      ) : (
        <Space style={{ marginBottom: 16 }} wrap>
          <Button icon={<CloudDownloadOutlined />} onClick={handleLoadDraft}>
            Tải bản nháp / mẫu
          </Button>
          <Button icon={<ClearOutlined />} danger onClick={handleClearDraft}>
            Xóa bản nháp
          </Button>
          <Button icon={<PrinterOutlined />} onClick={handlePrint}>
            In nhanh
          </Button>
        </Space>
      )}

      <CreateFormVer2
        mode={mode}
        rows={rows}
        addRow={mode === "admin" ? addRow : undefined}
        removeRow={mode === "admin" ? removeRow : undefined}
        addColumn={mode === "admin" ? addColumn : undefined}
        removeColumn={mode === "admin" ? removeColumn : undefined}
        // DnD hàng
        onRowDragStart={mode === "admin" ? onRowDragStart : undefined}
        onRowDragOver={mode === "admin" ? onRowDragOver : undefined}
        onRowDrop={mode === "admin" ? onRowDrop : undefined}
        onRowDragEnd={mode === "admin" ? onRowDragEnd : undefined}
        // DnD cột
        onColDragStart={mode === "admin" ? onColDragStart : undefined}
        onColDragOver={mode === "admin" ? onColDragOver : undefined}
        onColDrop={mode === "admin" ? onColDrop : undefined}
        onColDragEnd={mode === "admin" ? onColDragEnd : undefined}
        maxCols={MAX_COLS}
        onPreview={(ordered) => {
          setPreviewData(ordered);
          setPreviewOpen(true);
        }}
        onAutosaveDraft={mode === "user" ? handleAutosaveDraft : undefined}
      />

      <Modal
        title="Kết quả mô tả"
        open={previewOpen}
        onCancel={() => setPreviewOpen(false)}
        footer={<Button onClick={() => setPreviewOpen(false)}>Đóng</Button>}
        width={1100}
      >
        <FormVer2Preview data={previewData} />
      </Modal>
    </div>
  );
}
