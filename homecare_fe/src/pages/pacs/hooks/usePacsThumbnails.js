import { useState, useEffect } from 'react';
import axios from 'axios';
import { parseDicomBuffer, renderDicomToCanvas } from '../services/dicomDecoder';

export function usePacsThumbnails({
  seriesList,
  activeSeries,
  dicomCache,
  setDicomCache,
  rightSliceStripOpen,
  apiEndpoint,
  getAuthHeaders,
}) {
  const [seriesThumbnails, setSeriesThumbnails] = useState({});
  const [sliceThumbnails, setSliceThumbnails] = useState({});

  // Tầng 3: Tải nhanh Thumbnail (~1.4KB) cho các lát cắt trong active series
  useEffect(() => {
    if (!rightSliceStripOpen || !activeSeries?.instances?.length) return;
    let cancelled = false;

    const generateActiveSeriesSliceThumbs = async () => {
      const headers = getAuthHeaders();
      for (const inst of activeSeries.instances) {
        if (cancelled) return;
        if (sliceThumbnails[inst.globalIndex]) continue;

        try {
          // Ưu tiên 1: Tải trực tiếp Thumbnail Tầng 3 từ backend PACS (chỉ ~1.4KB)
          try {
            const thumbRes = await axios.get(
              `${apiEndpoint}/api/pacs/instances/${inst.sopInstanceUid}/thumbnail`,
              { responseType: 'blob', headers, timeout: 3000 }
            );
            if (thumbRes.status === 200 && thumbRes.data) {
              const objectUrl = URL.createObjectURL(thumbRes.data);
              if (!cancelled) {
                setSliceThumbnails((prev) =>
                  prev[inst.globalIndex] ? prev : { ...prev, [inst.globalIndex]: objectUrl }
                );
                continue;
              }
            }
          } catch (e) {
            // Fallback sang tự decode nếu instance cũ chưa có thumbnail sinh sẵn
          }

          // Ưu tiên 2: Giải mã cục bộ từ DCM cache / file gốc
          let parsed = dicomCache[inst.globalIndex];
          if (!parsed) {
            const res = await axios.get(
              `${apiEndpoint}/api/pacs/instances/${inst.sopInstanceUid}/file`,
              { responseType: 'arraybuffer', headers }
            );
            if (cancelled) return;
            parsed = parseDicomBuffer(res.data);
            setDicomCache((prev) =>
              prev[inst.globalIndex] ? prev : { ...prev, [inst.globalIndex]: parsed }
            );
          }

          if (parsed?.rawPixels && !cancelled) {
            const offscreen = document.createElement('canvas');
            renderDicomToCanvas(offscreen, parsed.rawPixels, parsed.meta, {
              windowCenter: parsed.meta.windowCenter,
              windowWidth: parsed.meta.windowWidth,
              invert: false,
              colorLut: 'default',
            });
            const thumbUrl = offscreen.toDataURL('image/jpeg', 0.55);
            setSliceThumbnails((prev) =>
              prev[inst.globalIndex] ? prev : { ...prev, [inst.globalIndex]: thumbUrl }
            );
          }
        } catch (err) {
          console.warn('Không thể tạo thumbnail lát cắt:', inst.sopInstanceUid, err?.message);
        }
      }
    };

    generateActiveSeriesSliceThumbs();
    return () => {
      cancelled = true;
    };
  }, [rightSliceStripOpen, activeSeries, apiEndpoint, getAuthHeaders, dicomCache, setDicomCache, sliceThumbnails]);

  // Tầng 3: Tải nhanh Thumbnail đại diện cho từng Series
  useEffect(() => {
    if (!seriesList || seriesList.length === 0) return;
    let cancelled = false;

    const generateMissingSeriesThumbs = async () => {
      const headers = getAuthHeaders();
      for (const series of seriesList) {
        if (cancelled) return;
        const firstInst = series.instances?.[0];
        if (!firstInst || seriesThumbnails[series.seriesUid]) continue;

        try {
          // Ưu tiên 1: Tải nhanh Thumbnail Tầng 3 (~1.4KB)
          try {
            const thumbRes = await axios.get(
              `${apiEndpoint}/api/pacs/instances/${firstInst.sopInstanceUid}/thumbnail`,
              { responseType: 'blob', headers, timeout: 3000 }
            );
            if (thumbRes.status === 200 && thumbRes.data) {
              const objectUrl = URL.createObjectURL(thumbRes.data);
              if (!cancelled) {
                setSeriesThumbnails((prev) =>
                  prev[series.seriesUid] ? prev : { ...prev, [series.seriesUid]: objectUrl }
                );
                continue;
              }
            }
          } catch (e) {}

          // Ưu tiên 2: Tải và decode file gốc
          let parsed = dicomCache[firstInst.globalIndex];
          if (!parsed) {
            const res = await axios.get(
              `${apiEndpoint}/api/pacs/instances/${firstInst.sopInstanceUid}/file`,
              { responseType: 'arraybuffer', headers }
            );
            if (cancelled) return;
            parsed = parseDicomBuffer(res.data);
            setDicomCache((prev) =>
              prev[firstInst.globalIndex] ? prev : { ...prev, [firstInst.globalIndex]: parsed }
            );
          }

          if (parsed?.rawPixels && !cancelled) {
            const offscreen = document.createElement('canvas');
            renderDicomToCanvas(offscreen, parsed.rawPixels, parsed.meta, {
              windowCenter: parsed.meta.windowCenter,
              windowWidth: parsed.meta.windowWidth,
              invert: false,
              colorLut: 'default',
            });
            const thumbUrl = offscreen.toDataURL('image/jpeg', 0.65);
            setSeriesThumbnails((prev) =>
              prev[series.seriesUid] ? prev : { ...prev, [series.seriesUid]: thumbUrl }
            );
          }
        } catch (err) {
          console.warn('Không thể tạo thumbnail series:', series.seriesUid, err?.message);
        }
      }
    };

    generateMissingSeriesThumbs();
    return () => {
      cancelled = true;
    };
  }, [seriesList, apiEndpoint, getAuthHeaders, dicomCache, setDicomCache, seriesThumbnails]);

  return {
    seriesThumbnails,
    setSeriesThumbnails,
    sliceThumbnails,
    setSliceThumbnails,
  };
}
