// src/utils/formVer2.js

import dayjs from "dayjs";
import API_CALL from "../../services/axiosClient";
// src/utils/exportFormVer2.js

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
  // Các action không cần submit
  if (key === "reset") {
    form.resetFields();
    return;
  }
  // Các action cần validate + gom dữ liệu → submit form
  if (["save", "approve", "export", "print"].includes(key)) {
    console.log("---");
    form.submit(); // ⬅️ sẽ kích hoạt onFinish nếu validate pass
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

export const appendIfExists = (fd, key, val) => {
  if (val === undefined || val === null) return;
  // cho phép chuỗi rỗng khi bạn muốn "Send empty value"
  fd.append(key, typeof val === "number" ? String(val) : String(val));
};

// Nếu bạn có file upload từ ImageBlock, đặt name form là ImageLeftFile / ImageRightFile
// (nếu không có file, cứ gửi link/mô tả cũng được)
// utils.ts
export function buildFormData(values, extra) {
  const fd = new FormData();

  // ---- Header & fields thường
  fd.append("id_template_service", String(values.id_template_service ?? ""));
  fd.append("id_exam_part", String(values.id_exam_part ?? ""));
  fd.append("language", values.language ?? "vi");
  fd.append("tenMau", values.ten_mau ?? "");
  fd.append("ketLuan", values.ket_luan ?? "");
  fd.append("quyTrinh", values.quy_trinh_url ?? "");
  fd.append("icd10", values.icd10 ?? "");
  fd.append("phanDoLoai", values.phan_do_loai ?? "");
  fd.append("chanDoanPhanBiet", values.chan_doan_phan_biet ?? "");
  fd.append("ketQuaChanDoan", values.ket_qua_chan_doan ?? "");
  fd.append("khuyenNghi", values.khuyen_nghi ?? "");
  fd.append("ngayThucHien", extra?.ngayThucHienISO);

  // ---- Ảnh: text fields (đúng key BE)
  fd.append("ImageLeftDesc", values.ImageLeftDesc ?? "");
  fd.append("ImageLeftDescLink", values.ImageLeftDescLink ?? "");
  fd.append("ImageRightDesc", values.ImageRightDesc ?? "");
  fd.append("ImageRightDescLink", values.ImageRightDescLink ?? "");
  fd.append(
    "id_formver2_name",
    values.id_formver2_name ?? values?.id_formver2_name_form_ver2_name?.id ?? ""
  );

  // ---- Ảnh: FILE (đúng key BE: ImageFormLeft / ImageFormRight)
  const leftFileObj = values.ImageLeftFile?.[0]?.originFileObj;
  if (leftFileObj) fd.append("ImageFormLeft", leftFileObj);

  const rightFileObj = values.ImageRightFile?.[0]?.originFileObj;
  if (rightFileObj) fd.append("ImageFormRight", rightFileObj);

  fd.append("tables", JSON.stringify(extra?.tablesData ?? []));
  fd.append("imageDescEditor", JSON.stringify(extra?.imageDescEditor ?? []));

  // ---- auto_code nếu cần

  return fd;
}

export function mapApiToForm(api) {
  // ảnh (left/right)
  const left = api?.image_form_ver2s?.find((x) => x.kind === "left");
  const right = api?.image_form_ver2s?.find((x) => x.kind === "right");

  return {
    id_template_service: api?.id_template_service ?? undefined,
    id_exam_part: api?.id_exam_part ?? undefined,
    language: api?.language ?? "vi",
    ten_mau: api?.ten_mau ?? "",
    ket_luan: api?.ket_luan ?? "",
    quy_trinh_url: api?.quy_trinh_url ?? "",
    icd10: api?.icd10 ?? "",
    phan_do_loai: api?.phan_do_loai ?? "",
    chan_doan_phan_biet: api?.chan_doan_phan_biet ?? "",
    ket_qua_chan_doan: api?.ket_qua_chan_doan ?? "",
    khuyen_nghi: api?.khuyen_nghi ?? "",
    ImageLeftDesc: left?.desc || "",
    ImageLeftDescLink: left?.link || "",
    ImageRightDesc: right?.desc || "",
    ImageRightDescLink: right?.link || "",
    ImageRightUrl: right?.url || "",
    ImageLeftUrl: left?.url || "",
    id: "DFORM_" + (api.id ?? "tự động"),
    doctor_name: api?.id_doctor_doctor?.full_name,
    createdAt: dayjs(api?.updatedAt ?? api.createdAt ?? new Date()).format(
      "DD-MM-YYYY"
    ),
    id_formver2_name:
      api?.id_formver2_name || api?.id_formver2_name_form_ver2_name?.id,
  };
}
export const calculateAge = (dob) => {
  if (!dob) return "";
  const today = dayjs();
  const birthDate = dayjs(dob);
  return today.diff(birthDate, "year");
};

export const handlePrint = (printRef) => {
  const printContents = printRef.current.innerHTML;
  const newWindow = window.open("", "_blank", "width=800,height=600");
  newWindow.document.write(`
    <html>
      <head>
        <title>HOMECARE</title>
        <style>
          /* Font toàn trang */
          * {
            font-family: 'Arial', sans-serif !important;
          }
          body { padding: 20px; }
         
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-bottom: 16px; 
          }
          th, td { 
            border: 0px solid #ccc; 
            padding: 4px; 
            text-align: left; 
            font-size: 13px 
          }
          h3 { margin-top: 24px; font-size: 16px !important }
          // .logoImg{
          //   height: 60px !important
          // }
         
        </style>
      </head>
     <body ">
        ${printContents}
      </body>
    </html>
  `);
  newWindow.document.close();
  newWindow.onload = () => {
    newWindow.focus();
    newWindow.print();
    newWindow.close();
  };
};

/** Lấy filename từ Content-Disposition nếu BE có set */
const getFilenameFromDisposition = (disposition) => {
  if (!disposition) return "";
  const m = /filename\*=UTF-8''([^;]+)|filename="([^"]+)"/i.exec(disposition);
  return decodeURIComponent(m?.[1] || m?.[2] || "");
};

/**
 * Gọi API export FormVer2 và tải xuống ngay
 * @param {Object} opts
 * @param {number[]} [opts.ids]  - mảng ID; nếu có ids thì bỏ qua all/filters
 * @param {boolean}  [opts.all]  - export theo filter (bỏ phân trang)
 * @param {Object}   [opts.filters] - filter: id_exam_part,id_template_service,id_doctor,search,range,orderBy,orderDir,withTables,withImages,includeDeleted
 * @param {string}   [opts.fileName] - custom filename
 */
export async function exportFormVer2({
  ids,
  all,
  filters = {},
  fileName,
} = {}) {
  // build params
  const params = {};
  if (Array.isArray(ids) && ids.length) {
    params.ids = ids; // axios => ids=1&ids=2...
    params.withImages = true;
  } else if (all) {
    params.all = true;
    // các filter phổ biến khi export
    if (filters.orderBy) params.orderBy = filters.orderBy;
    if (filters.orderDir) params.orderDir = filters.orderDir;
    params.withTables = !!filters.withTables;
    params.withImages = true;
    params.includeDeleted = !!filters.includeDeleted;

    if (filters.id_exam_part) params.id_exam_part = filters.id_exam_part;
    if (filters.id_template_service)
      params.id_template_service = filters.id_template_service;
    if (filters.id_doctor) params.id_doctor = filters.id_doctor;
    if (filters.search?.trim()) params.search = filters.search.trim();

    // RangePicker: [dayjs, dayjs]
    if (Array.isArray(filters.range) && filters.range[0] && filters.range[1]) {
      params.date_from = filters.range[0].format("YYYY-MM-DD");
      params.date_to = filters.range[1].format("YYYY-MM-DD");
    }
  } else {
    throw new Error("Thiếu ids hoặc all=true khi export FormVer2.");
  }

  if (fileName) params.fileName = fileName;

  // Gọi API — nhận binary
  const res = await API_CALL.get("/form-ver2/export", {
    params,
    responseType: "blob",
  });

  const headerName = getFilenameFromDisposition(
    res.headers?.["content-disposition"]
  );
  const finalName =
    headerName ||
    fileName ||
    `formver2_export_${dayjs().format("YYYYMMDD_HHmmss")}.xlsx`;

  // Tạo link tải
  const blob = new Blob([res.data], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = finalName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

export const buildPrompt = ({
  v,
  selectedExamPart,
  selectedTemplateService,
  currentFormVer2Name,
  imageDescHTML,
}) => {
  return `
Hệ kỹ thuật: ${selectedTemplateService?.name || ""}
Bộ phận: ${selectedExamPart?.name || ""}
Tên mẫu: ${currentFormVer2Name?.name || ""} (${currentFormVer2Name?.code || ""})
Ngôn ngữ: ${v?.language || "vi"}
Ngày thực hiện: ${v?.createdAt || ""}
Người thực hiện: ${v?.doctor_name || ""}
ICD-10: ${v?.icd10 || ""}

[KẾT LUẬN CỦA MẪU]
${v?.ketLuan || ""}

[QUY TRÌNH KỸ THUẬT]
${v?.quyTrinh || ""}

[MÔ TẢ HÌNH ẢNH]
${imageDescHTML || ""}

[KẾT LUẬN / CHẨN ĐOÁN]
${v?.ketQuaChanDoan || ""}

YÊU CẦU: Tạo phần "Khuyến nghị & Tư vấn" cho bệnh nhân bằng ${
    v?.language === "en" ? "English" : "Tiếng Việt"
  }.
Dạng Markdown, ngắn gọn, rõ ràng (theo dõi, xét nghiệm bổ sung, điều trị/lối sống, thời điểm tái khám/cấp cứu, lưu ý giới hạn).
Chỉ trả về nội dung "Khuyến nghị & Tư vấn", không lặp lại dữ liệu đầu vào.
`.trim();
};

const toISODate = (d = new Date()) => new Date(d).toISOString().slice(0, 10); // YYYY-MM-DD

export function buildFormDataDoctorUseFormVer2(values, extra) {
  const fd = new FormData();

  if (extra.imageList?.length) {
    const meta = extra.imageList.map((item, idx) => {
      const hasFile = item.file;
      return {
        url: !hasFile ? item.url || item.rawUrl : "",
        caption: item.caption || "",
        isChange: hasFile,
        fileField: hasFile ? `ImageDescFiles` : undefined,
      };
    });

    fd.append("imageDescMeta", JSON.stringify(meta));

    extra.imageList.forEach((item, idx) => {
      if (item.file) {
        fd.append(`ImageDescFiles`, item.file);
      }
    });
  }

  // ---- Header & fields thường
  fd.append("id_template_service", String(values.id_template_service ?? ""));
  fd.append("id_exam_part", String(values.id_exam_part ?? ""));
  fd.append("id_print_template", String(values.id_print_template ?? ""));
  fd.append("id_formver2", String(extra.id_formver2 ?? ""));
  fd.append("id_doctor", String(extra.doctor.id ?? ""));
  if (extra.prev_id) {
    fd.append("prev_id", String(extra.prev_id));
  }

  if (extra.id_root) {
    fd.append("id_root", String(extra.id_root));
  }

  fd.append("language", values.language ?? "vi");
  fd.append("ten_mau", values.doctor_use_form_ver2_name ?? "");
  fd.append("ket_luan", values.ket_luan ?? "");
  fd.append("quy_trinh_url", values.quy_trinh_url ?? "");
  fd.append("icd10", values.icd10 ?? "");
  fd.append("phan_do_loai", values.phan_do_loai ?? "");
  fd.append("chan_doan_phan_biet", values.chan_doan_phan_biet ?? "");
  fd.append("ket_qua_chan_doan", values.ket_qua_chan_doan ?? "");
  fd.append("khuyen_nghi", values.khuyen_nghi ?? "");
  fd.append(
    "ngay_thuc_hien",
    extra?.ngayThucHienISO || new Date().toISOString().slice(0, 10)
  );

  // ---- Thông tin bệnh nhân
  fd.append("benh_nhan_ho_ten", values.benh_nhan_ho_ten ?? "");
  fd.append("benh_nhan_gioi_tinh", values.benh_nhan_gioi_tinh ?? "");
  fd.append("benh_nhan_tuoi", String(values.benh_nhan_tuoi ?? ""));
  fd.append("benh_nhan_dia_chi_so_nha", values.benh_nhan_dia_chi_so_nha ?? "");
  fd.append(
    "benh_nhan_dia_chi_xa_phuong",
    values.benh_nhan_dia_chi_xa_phuong ?? ""
  );
  fd.append(
    "benh_nhan_dia_chi_tinh_thanh_pho",
    values.benh_nhan_dia_chi_tinh_thanh_pho ?? ""
  );
  fd.append("benh_nhan_quoc_tich", values.benh_nhan_quoc_tich ?? "");
  fd.append("benh_nhan_dien_thoai", values.benh_nhan_dien_thoai ?? "");
  fd.append("benh_nhan_email", values.benh_nhan_email ?? "");
  fd.append("benh_nhan_pid", values.benh_nhan_pid ?? "");
  fd.append("benh_nhan_sid", values.benh_nhan_sid ?? "");
  fd.append("benh_nhan_lam_sang", values.benh_nhan_lam_sang ?? "");

  // ---- Ảnh: text fields (đúng key BE)
  fd.append("ImageLeftDesc", values.ImageLeftDesc ?? "");
  fd.append("ImageLeftDescLink", values.ImageLeftDescLink ?? "");
  fd.append("ImageRightDesc", values.ImageRightDesc ?? "");
  fd.append("ImageRightDescLink", values.ImageRightDescLink ?? "");
  fd.append(
    "id_formver2_name",
    values.id_formver2_name ?? values?.id_formver2_name_form_ver2_name?.id ?? ""
  );

  // ---- Ảnh: FILE (đúng key BE: ImageFormLeft / ImageFormRight)
  const leftFileObj = values.ImageLeftFile?.[0]?.originFileObj;
  if (leftFileObj) fd.append("ImageFormLeft", leftFileObj);

  const rightFileObj = values.ImageRightFile?.[0]?.originFileObj;
  if (rightFileObj) fd.append("ImageFormRight", rightFileObj);

  fd.append("tables", JSON.stringify(extra?.tablesData ?? []));
  fd.append("imageDescEditor", extra?.imageDescEditor);

  // ---- auto_code nếu cần

  return fd;
}
