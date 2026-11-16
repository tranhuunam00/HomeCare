import { useEffect } from "react";

/**
 * Hook lắng nghe bộ phím tắt lâm sàng toàn cục cho Bác sĩ:
 * - Ctrl + S / Cmd + S: Lưu nháp form
 * - Alt + D: Đọc xong ca
 * - Alt + P: Bật / tắt Xem trước kết quả
 * - Escape: Đóng cửa sổ xem trước
 */
export default function useDoctorFormHotkeys({
  onSave,
  onReadDone,
  onTogglePreview,
  onClosePreview,
  isPreviewOpen = false,
}) {
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      // 1. Ctrl + S (hoặc Cmd + S trên Mac): Lưu đọc tức thì
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        onSave?.();
        return;
      }

      // 2. Alt + D: Đọc xong
      if (e.altKey && e.key.toLowerCase() === "d") {
        e.preventDefault();
        onReadDone?.();
        return;
      }

      // 3. Alt + P: Mở / Đóng Preview
      if (e.altKey && e.key.toLowerCase() === "p") {
        e.preventDefault();
        onTogglePreview?.();
        return;
      }

      // 4. Esc: Đóng popup xem trước
      if (e.key === "Escape") {
        if (isPreviewOpen) {
          onClosePreview?.();
        }
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [onSave, onReadDone, onTogglePreview, onClosePreview, isPreviewOpen]);
}
