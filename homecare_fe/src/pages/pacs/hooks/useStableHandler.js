import { useRef, useCallback } from 'react';

/**
 * useStableHandler — "useEvent" pattern.
 *
 * Trả về một hàm có IDENTITY CỐ ĐỊNH suốt vòng đời component nhưng luôn gọi phiên bản
 * MỚI NHẤT của `fn` (đọc giá trị/state mới nhất, không bị stale closure).
 *
 * Dùng để truyền handler xuống component đã memo hoá (PacsTopNav, PacsSidebar...) mà
 * không phá memo: dù handler đọc windowCenter / currentIndex / annotations... đổi liên
 * tục khi kéo WW/WL, định danh hàm vẫn không đổi -> con không re-render theo từng frame.
 *
 * An toàn vì chỉ dùng cho EVENT HANDLER (không gọi trong lúc render).
 */
export function useStableHandler(fn) {
  const ref = useRef(fn);
  // Cập nhật về bản mới nhất ở mỗi lần render (handler không chạy trong render nên an toàn)
  ref.current = fn;
  return useCallback((...args) => ref.current?.(...args), []);
}
