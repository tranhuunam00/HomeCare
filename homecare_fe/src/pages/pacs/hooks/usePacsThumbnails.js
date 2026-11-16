import { useState, useEffect, useRef } from 'react';

/**
 * Thumbnail cho dải series & dải lát cắt.
 * Chỉ dùng thumbnail JPEG nhẹ (~3KB) do máy chủ sinh sẵn - KHÔNG tải file DCM gốc chỉ để làm ảnh nhỏ.
 * Tải tuần tự với giới hạn song song, ưu tiên các lát gần lát đang xem.
 */
const THUMB_CONCURRENCY = 6;

export function usePacsThumbnails({ caseId, seriesList, activeSeries, rightSliceStripOpen, apiEndpoint, getAuthHeaders, currentIndex }) {
  const [seriesThumbnails, setSeriesThumbnails] = useState({});
  const [sliceThumbnails, setSliceThumbnails] = useState({});
  const requestedRef = useRef(new Set());
  const urlsRef = useRef([]);

  // Gom kết quả thumbnail: 250 lát = 250 lần setState = 250 lần render cả trang -> gộp ~150ms/lần
  const pendingSliceRef = useRef({});
  const flushTimerRef = useRef(null);
  const queueSliceThumb = (globalIndex, url) => {
    pendingSliceRef.current[globalIndex] = url;
    if (flushTimerRef.current) return;
    flushTimerRef.current = setTimeout(() => {
      flushTimerRef.current = null;
      const batch = pendingSliceRef.current;
      pendingSliceRef.current = {};
      if (Object.keys(batch).length) setSliceThumbnails((prev) => ({ ...prev, ...batch }));
    }, 150);
  };
  useEffect(() => () => flushTimerRef.current && clearTimeout(flushTimerRef.current), []);

  const fetchThumb = async (sop) => {
    const res = await fetch(`${apiEndpoint}/api/pacs/instances/${encodeURIComponent(sop)}/thumbnail${caseId ? `?patientDiagnoseId=${encodeURIComponent(caseId)}` : ''}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const url = URL.createObjectURL(await res.blob());
    urlsRef.current.push(url);
    return url;
  };

  // Danh sách lát thay đổi (tải thêm ảnh / tải lại ca) -> chỉ số lát đổi -> làm mới thumbnail
  const signature = (seriesList || []).map((s) => `${s.seriesUid}:${s.instances?.length || 0}`).join('|');
  const lastSignature = useRef(signature);
  useEffect(() => {
    if (lastSignature.current === signature) return;
    lastSignature.current = signature;
    requestedRef.current.clear();
    // Chỉ thu hồi URL cũ khi đã thay bằng danh sách mới
    urlsRef.current.forEach((u) => URL.revokeObjectURL(u));
    urlsRef.current = [];
    pendingSliceRef.current = {};
    setSeriesThumbnails({});
    setSliceThumbnails({});
  }, [signature]);

  // Thumbnail đại diện mỗi series = lát giữa series (thường thể hiện rõ giải phẫu hơn lát đầu)
  useEffect(() => {
    if (!seriesList?.length) return undefined;
    let cancelled = false;
    (async () => {
      for (const series of seriesList) {
        if (cancelled) return;
        if (seriesThumbnails[series.seriesUid]) continue;
        const list = series.instances || [];
        const rep = list[Math.floor(list.length / 2)] || list[0];
        if (!rep || rep.isLocal || (rep.frameIndex || 0) > 0) continue;
        const reqKey = `series:${series.seriesUid}`;
        if (requestedRef.current.has(reqKey)) continue;
        requestedRef.current.add(reqKey);
        try {
          const url = await fetchThumb(rep.sopInstanceUid);
          if (!cancelled) setSeriesThumbnails((prev) => ({ ...prev, [series.seriesUid]: url }));
        } catch {
          requestedRef.current.delete(reqKey);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seriesList, apiEndpoint]);

  // Thumbnail lát cắt của series đang mở (ưu tiên quanh lát hiện tại)
  useEffect(() => {
    if (!rightSliceStripOpen || !activeSeries?.instances?.length) return undefined;
    let cancelled = false;
    const list = activeSeries.instances;
    const curPos = Math.max(0, list.findIndex((i) => i.globalIndex === currentIndex));
    const ordered = [...list]
      .map((inst, pos) => ({ inst, dist: Math.abs(pos - curPos) }))
      .sort((a, b) => a.dist - b.dist)
      .map((x) => x.inst)
      .filter((inst) => !inst.isLocal && !(inst.frameIndex > 0) && !sliceThumbnails[inst.globalIndex] && !requestedRef.current.has(`slice:${inst.globalIndex}`));

    let cursor = 0;
    const worker = async () => {
      while (!cancelled && cursor < ordered.length) {
        const inst = ordered[cursor++];
        const reqKey = `slice:${inst.globalIndex}`;
        requestedRef.current.add(reqKey);
        try {
          const url = await fetchThumb(inst.sopInstanceUid);
          if (!cancelled) queueSliceThumb(inst.globalIndex, url);
        } catch {
          requestedRef.current.delete(reqKey);
        }
      }
    };
    Array.from({ length: THUMB_CONCURRENCY }, worker);
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rightSliceStripOpen, activeSeries, apiEndpoint]);

  // KHÔNG thu hồi object URL trong cleanup của effect: React Fast Refresh / StrictMode chạy lại cleanup
  // nhưng giữ nguyên state -> ảnh trỏ tới URL đã thu hồi (ảnh hỏng). Thumbnail ~3KB, trình duyệt tự giải phóng khi đóng tab.

  return { seriesThumbnails, setSeriesThumbnails, sliceThumbnails, setSliceThumbnails };
}
