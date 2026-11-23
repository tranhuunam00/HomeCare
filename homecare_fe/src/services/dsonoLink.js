// Mở phần mềm D-SONO (siêu âm) cho 1 ca từ HomeCare.
// Luôn HTTPS: trang D-SONO yêu cầu bác sĩ gõ email + mật khẩu HomeCare.
export const DEFAULT_DSONO_URL = "https://dsono.home-care.vn";

export function getDsonoBaseUrl(env = import.meta.env) {
  const raw = String(env?.VITE_DSONO_URL || "").trim().replace(/\/+$/, "");
  // Chặn cấu hình nhầm http:// (trừ localhost khi dev)
  if (!raw || (/^http:\/\//i.test(raw) && !/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(raw))) {
    return DEFAULT_DSONO_URL;
  }
  return raw;
}

/** Tham số mở ca trên D-SONO (đã mã hoá URL đầy đủ) */
export function buildDsonoCaseQuery(pd) {
  return new URLSearchParams({
    accessionNo: String(pd?.id ?? ""),
    pid: String(pd?.PID ?? ""),
    patientName: String(pd?.name ?? ""),
    gender: String(pd?.gender ?? ""),
    source: "HOMECARE",
  }).toString();
}

export function buildDsonoCaseUrl(pd, env) {
  return `${getDsonoBaseUrl(env)}?${buildDsonoCaseQuery(pd)}`;
}

/**
 * Android: thử mở app D-SONO qua intent, không có app thì trình duyệt mở bản web.
 * Máy khác: mở tab mới.
 */
export function openDsonoForCase(pd, { userAgent = navigator.userAgent, env } = {}) {
  const query = buildDsonoCaseQuery(pd);
  const targetUrl = `${getDsonoBaseUrl(env)}?${query}`;
  if (/android/i.test(userAgent)) {
    window.location.href = `intent://open?${query}#Intent;scheme=dsono;package=com.dsono.myapp;S.browser_fallback_url=${encodeURIComponent(targetUrl)};end`;
    return targetUrl;
  }
  window.open(targetUrl, "_blank", "noopener,noreferrer");
  return targetUrl;
}
