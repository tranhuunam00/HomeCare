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
