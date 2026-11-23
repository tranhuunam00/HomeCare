import { DEFAULT_IMAGING_ROWS } from "../formver3.constant";

export const DEFAULT_FAST_SONO_DATA = {
  selectedMap: null,
  grade: "",
  templateCode: "",
  isManualEdited: false,
  plainNarrative: "",
  abnormalCodes: [],
};

export function dataURLtoFile(dataurl, filename) {
  const arr = dataurl.split(",");
  const mime = arr[0].match(/:(.*?);/)?.[1] || "image/png";
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}

export function parseImageDescriptionState(rawDescription) {
  try {
    const parsed = JSON.parse(rawDescription || "[]");
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      if (parsed.isFastSono) {
        return {
          mode: "FAST_SONO",
          isFreeText: true,
          content: parsed.text || "",
          fastSonoData: parsed.fastSonoData || { ...DEFAULT_FAST_SONO_DATA },
          rows: DEFAULT_IMAGING_ROWS,
        };
      }
      if (parsed.isFreeText) {
        return {
          mode: "FREE_TEXT",
          isFreeText: true,
          content: parsed.text || "",
          fastSonoData: { ...DEFAULT_FAST_SONO_DATA },
          rows: DEFAULT_IMAGING_ROWS,
        };
      }
    } else if (Array.isArray(parsed) && parsed.length) {
      return {
        mode: "STRUCTURED_TABLE",
        isFreeText: false,
        content: "",
        fastSonoData: { ...DEFAULT_FAST_SONO_DATA },
        rows: parsed,
      };
    }
  } catch {}
  return {
    mode: "STRUCTURED_TABLE",
    isFreeText: false,
    content: "",
    fastSonoData: { ...DEFAULT_FAST_SONO_DATA },
    rows: DEFAULT_IMAGING_ROWS,
  };
}

/**
 * Chuyển mô tả dạng VĂN BẢN TỰ DO (vd kết quả từ D-SONO: "<p>Gan: ...<br/>Túi mật: ...</p>")
 * thành các dòng của bảng mô tả có cấu trúc để bác sĩ HomeCare SỬA TIẾP theo dạng structured.
 * - Mỗi dòng "Cơ quan: mô tả" -> { name: Cơ quan, description: mô tả }
 * - Dòng không có "Cơ quan:" -> gộp vào dòng trước (hoặc dòng "Mô tả" nếu là dòng đầu)
 * - status để TRỐNG: không tự kết luận bình thường/bất thường thay bác sĩ.
 */
export function freeTextToImagingRows(htmlOrText) {
  const text = String(htmlOrText || "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li|h[1-6])>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
  const lines = text
    .split("\n")
    .map((l) => l.replace(/^[\s•\-–*+]+/, "").trim())
    .filter(Boolean);
  const rows = [];
  for (const line of lines) {
    const m = line.match(/^([^:：]{1,60})[:：]\s*(.*)$/);
    if (m) {
      rows.push({ id: rows.length + 1, name: m[1].trim(), status: "", description: m[2].trim() });
    } else if (rows.length) {
      const last = rows[rows.length - 1];
      last.description = last.description ? `${last.description}\n${line}` : line;
    } else {
      rows.push({ id: 1, name: "Mô tả", status: "", description: line });
    }
  }
  return rows;
}

/**
 * Trạng thái phần MÔ TẢ HÌNH ẢNH để bác sĩ sửa trên màn đọc ca: luôn là bảng cấu trúc.
 * Phiếu văn bản tự do (vd kết quả D-SONO) -> tách thành các dòng; không tách được -> dòng mặc định.
 * Dùng CHUNG cho lúc nạp phiếu và lúc "Hoàn tác về dữ liệu gốc" để 2 đường không lệch nhau
 * (trước đây hoàn tác nạp bảng mặc định rỗng + bật isFreeText -> sửa bảng xong lưu bị bỏ qua).
 */
export function toEditableImagingState(parsed) {
  const freeRows = parsed?.isFreeText && parsed?.content ? freeTextToImagingRows(parsed.content) : [];
  return {
    mode: "STRUCTURED_TABLE",
    isFreeText: false,
    content: parsed?.content || "",
    fastSonoData: parsed?.fastSonoData || { ...DEFAULT_FAST_SONO_DATA },
    rows: freeRows.length ? freeRows : parsed?.rows || DEFAULT_IMAGING_ROWS,
  };
}
