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

  // Pre-generate thumbnails for every slice in the currently active series when right strip is open
  useEffect(() => {
    if (!rightSliceStripOpen || !activeSeries?.instances?.length) return;
    let cancelled = false;

    const generateActiveSeriesSliceThumbs = async () => {
      const headers = getAuthHeaders();
      for (const inst of activeSeries.instances) {
        if (cancelled) return;
        if (sliceThumbnails[inst.globalIndex]) continue;

        try {
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

  // Pre-generate real thumbnails for every series from its own first instance
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
