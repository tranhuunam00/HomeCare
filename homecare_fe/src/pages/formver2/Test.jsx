// FormVer2 — admin → user → print (localStorage, Ant Design) + COLUMN LABELS
// Adds global column labels whose count equals the maximum number of columns among rows.
// Admin can edit these labels; User sees them locked. Preview prints them as table headers.

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
import FormVer2Preview from "./component/FromVer2Preview";
import CreateFormVer2 from "./component/CreateFormVer2Plain/CreateFormVer2Plain";

/* ========================= Helpers & Storage ========================= */
const { Title, Text } = Typography;
const mkId = () => Math.random().toString(36).slice(2, 9);
const MAX_COLS = 5;
const STORAGE_KEYS = {
  TEMPLATE: "FORM_VER2_TEMPLATE", // JSON: { rows, columnLabels }
  DRAFT: "FORM_VER2_DRAFT", // JSON: { rows, columnLabels }
};

const saveTemplate = (payload) => {
  localStorage.setItem(STORAGE_KEYS.TEMPLATE, JSON.stringify(payload || {}));
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

const saveDraft = (payload) => {
  localStorage.setItem(STORAGE_KEYS.DRAFT, JSON.stringify(payload || {}));
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

/* ========================= Form builder / filler ========================= */

/* ========================= Page: Admin/User/Print flow ========================= */
export default function FormVer2WorkflowPage() {
  // ----- rows layout state -----
  const [rows, setRows] = useState([
    { id: mkId(), inputs: [""], label: "" },
    { id: mkId(), inputs: ["", ""], label: "" },
    { id: mkId(), inputs: ["", "", ""], label: "" },
  ]);

  // dynamic max columns across rows
  const nMax = useMemo(
    () => Math.max(1, ...rows.map((r) => r.inputs?.length || 1)),
    [rows]
  );

  // Global column labels with length = nMax
  const [columnLabels, setColumnLabels] = useState(() =>
    Array.from({ length: nMax }, (_, i) => `Cột ${i + 1}`)
  );
  // Keep labels array synced with nMax (preserve existing values)
  useEffect(() => {
    setColumnLabels((prev) => {
      const next = [...prev];
      if (nMax > prev.length) {
        for (let i = prev.length; i < nMax; i++) next.push(`Cột ${i + 1}`);
      } else if (nMax < prev.length) {
        next.length = nMax;
      }
      return next;
    });
  }, [nMax]);

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
    setRows((prev) => [...prev, { id: mkId(), inputs: [""], label: "" }]);
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

  // ===================== Admin actions (Template) =====================
  const handleSaveTemplate = () => {
    // Normalize rows: ensure at least one input per row
    const normalizedRows = rows.map((r) => ({
      ...r,
      inputs: r.inputs?.length ? r.inputs : [""],
    }));
    saveTemplate({ rows: normalizedRows, columnLabels });
    message.success("Đã lưu mẫu (template) vào trình duyệt");
  };
  const handleLoadTemplate = () => {
    const tpl = loadTemplate();
    if (!tpl || !Array.isArray(tpl.rows)) {
      message.warning("Chưa có mẫu nào trong trình duyệt");
      return;
    }
    setRows(tpl.rows);
    setColumnLabels(
      Array.from(
        { length: Math.max(1, tpl.columnLabels?.length || 1) },
        (_, i) => tpl.columnLabels?.[i] || `Cột ${i + 1}`
      )
    );
    message.success("Đã tải mẫu");
  };
  const handleClearTemplate = () => {
    clearTemplate();
    message.success("Đã xóa mẫu trong trình duyệt");
  };

  // ===================== User actions (Draft) =====================
  const handleAutosaveDraft = (ordered) => {
    saveDraft({ rows: ordered, columnLabels });
  };
  const handleLoadDraft = () => {
    const d = loadDraft();
    if (d && Array.isArray(d.rows) && d.rows.length) {
      setRows(
        d.rows.map((r) => ({
          ...r,
          inputs: r.inputs?.length ? r.inputs : [""],
        }))
      );
      setColumnLabels(
        Array.from(
          { length: Math.max(1, d.columnLabels?.length || 1) },
          (_, i) => d.columnLabels?.[i] || `Cột ${i + 1}`
        )
      );
      message.success("Đã tải bản nháp từ trình duyệt");
    } else {
      message.info("Không có bản nháp, sẽ tải mẫu thay thế nếu có");
      const tpl = loadTemplate();
      if (tpl && tpl.rows) {
        setRows(tpl.rows);
        setColumnLabels(
          Array.from(
            { length: Math.max(1, tpl.columnLabels?.length || 1) },
            (_, i) => tpl.columnLabels?.[i] || `Cột ${i + 1}`
          )
        );
      }
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
      if (d && Array.isArray(d.rows) && d.rows.length) {
        setRows(d.rows);
        setColumnLabels(
          Array.from(
            { length: Math.max(1, d.columnLabels?.length || 1) },
            (_, i) => d.columnLabels?.[i] || `Cột ${i + 1}`
          )
        );
      } else {
        const tpl = loadTemplate();
        if (tpl && Array.isArray(tpl.rows)) {
          setRows(tpl.rows);
          setColumnLabels(
            Array.from(
              { length: Math.max(1, tpl.columnLabels?.length || 1) },
              (_, i) => tpl.columnLabels?.[i] || `Cột ${i + 1}`
            )
          );
        }
      }
    }
  }, [mode]);

  // Print handler (print current preview data)
  const handlePrint = () => {
    if (!previewOpen) {
      const ordered = rows.map((r) => ({
        id: r.id,
        label: r.label,
        inputs: r.inputs || [""],
      }));
      setPreviewData(ordered);
      setPreviewOpen(true);
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
            onClick={() => {
              const tpl = loadTemplate();
              if (tpl && tpl.rows) {
                setRows(tpl.rows);
                setColumnLabels(
                  Array.from(
                    { length: Math.max(1, tpl.columnLabels?.length || 1) },
                    (_, i) => tpl.columnLabels?.[i] || `Cột ${i + 1}`
                  )
                );
              }
            }}
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
        columnLabels={columnLabels}
        setColumnLabels={setColumnLabels}
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
        onAutosaveDraft={
          mode === "user"
            ? (ordered) => handleAutosaveDraft(ordered)
            : undefined
        }
      />

      <Modal
        open={previewOpen}
        onCancel={() => setPreviewOpen(false)}
        footer={null}
        width={1100}
      >
        <FormVer2Preview data={previewData} columnLabels={columnLabels} />
      </Modal>
    </div>
  );
}
