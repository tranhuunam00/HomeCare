// src/utils/formVer2.js

/* ========================= Constants ========================= */
export const MAX_COLS = 5;

export const STORAGE_KEYS = Object.freeze({
  TEMPLATE: "FORM_VER2_TEMPLATE", // JSON: { rows, columnLabels }
  DRAFT: "FORM_VER2_DRAFT", // JSON: { rows, columnLabels }
});

/* ========================= Id & Array helpers ========================= */
export const mkId = () => Math.random().toString(36).slice(2, 9);

export const reorderArray = (arr = [], from, to) => {
  const copy = [...arr];
  const [item] = copy.splice(from, 1);
  copy.splice(to, 0, item);
  return copy;
};

/* ========================= Row / Label helpers ========================= */
export const computeNMax = (rows = []) =>
  Math.max(1, ...rows.map((r) => r?.inputs?.length || 1));

export const normalizeRows = (rows = []) =>
  rows.map((r) => ({
    ...r,
    inputs: r?.inputs?.length ? r.inputs : [""],
  }));

/**
 * Đồng bộ danh sách nhãn cột theo nMax, giữ nguyên các giá trị đã nhập.
 * Trả về mảng nhãn cột mới (không mutate tham chiếu cũ).
 */
export const ensureColumnLabels = (labels = [], nMax = 1) => {
  const next = [...labels];
  if (nMax > next.length) {
    for (let i = next.length; i < nMax; i++) next.push(`Cột ${i + 1}`);
  } else if (nMax < next.length) {
    next.length = nMax;
  }
  return next;
};

/* ========================= localStorage helpers ========================= */
const saveJSON = (key, obj) => {
  localStorage.setItem(key, JSON.stringify(obj || {}));
  return true;
};

const loadJSON = (key) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.error(e);
    return null;
  }
};

const clearKey = (key) => localStorage.removeItem(key);

// Template (Admin)
export const saveTemplate = (payload) =>
  saveJSON(STORAGE_KEYS.TEMPLATE, payload);
export const loadTemplate = () => loadJSON(STORAGE_KEYS.TEMPLATE);
export const clearTemplate = () => clearKey(STORAGE_KEYS.TEMPLATE);

// Draft (User)
export const saveDraft = (payload) => saveJSON(STORAGE_KEYS.DRAFT, payload);
export const loadDraft = () => loadJSON(STORAGE_KEYS.DRAFT);
export const clearDraft = () => clearKey(STORAGE_KEYS.DRAFT);

/* ========================= High-level helpers ========================= */

/**
 * Lấy dữ liệu cho chế độ USER:
 * - Ưu tiên bản nháp; nếu không có thì fallback sang template; nếu không có nữa trả null.
 * Kết quả đã được chuẩn hoá rows và nhãn cột khớp nMax.
 */
export const getUserRowsAndLabels = () => {
  const d = loadDraft();
  if (d?.rows?.length) {
    const rows = normalizeRows(d.rows);
    const nMax = computeNMax(rows);
    const columnLabels = ensureColumnLabels(d.columnLabels || [], nMax);
    return { rows, columnLabels };
  }
  const tpl = loadTemplate();
  if (tpl?.rows?.length) {
    const rows = normalizeRows(tpl.rows);
    const nMax = computeNMax(rows);
    const columnLabels = ensureColumnLabels(tpl.columnLabels || [], nMax);
    return { rows, columnLabels };
  }
  return null;
};

/**
 * Lấy dữ liệu template (Admin) đã chuẩn hoá; không có thì trả null.
 */
export const getTemplateRowsAndLabels = () => {
  const tpl = loadTemplate();
  if (tpl?.rows?.length) {
    const rows = normalizeRows(tpl.rows);
    const nMax = computeNMax(rows);
    const columnLabels = ensureColumnLabels(tpl.columnLabels || [], nMax);
    return { rows, columnLabels };
  }
  return null;
};

export const handleAction = ({ pendingAction, key, form }) => {
  pendingAction.current = key;

  // Các action cần validate + gom dữ liệu → submit form
  if (["save", "approve", "export", "print"].includes(key)) {
    console.log("---");
    form.submit(); // ⬅️ sẽ kích hoạt onFinish nếu validate pass
    return;
  }

  // Các action không cần submit
  if (key === "reset") {
    form.resetFields();
    console.log("Đã RESET biểu mẫu.");
    return;
  }
  if (key === "preview") {
    // TODO: mở modal preview
    console.log("PREVIEW (demo).");
    return;
  }
  if (key === "edit") {
    console.log("EDIT (demo).");
    return;
  }
  if (key === "exit") {
    // TODO: điều hướng/đóng
    console.log("EXIT (demo).");
    return;
  }
};

export function normalizeTablesFromApi(apiTables) {
  // API có thể ở 1 trong 3 dạng:
  // A) { table_json: { tid, rows, columnLabels } }
  // B) { table_json: { tid, table_json: { tid, rows, columnLabels } } }  // lồng
  // C) { tid, rows, columnLabels }
  return (apiTables || []).map((it) => {
    let raw = it?.table_json ?? it;
    if (raw?.table_json) raw = raw.table_json; // bóc lớp lồng
    const t = {
      id: it?.id ?? null, // giữ id của record trên server để PUT/PATCH nếu cần
      tid: raw?.tid ?? `t-${Math.random().toString(36).slice(2, 8)}`,
      rows: Array.isArray(raw?.rows) ? raw.rows : [],
      columnLabels: Array.isArray(raw?.columnLabels) ? raw.columnLabels : [],
    };
    return t;
  });
}

export function buildTablesPayload(feTables) {
  // BE kỳ vọng [{ table_json: { tid, rows, columnLabels }, id? }]
  return (feTables || []).map((t) => ({
    ...(t.id ? { id: t.id } : {}),
    table_json: {
      tid: t.tid,
      rows: t.rows,
      columnLabels: t.columnLabels,
    },
  }));
}
