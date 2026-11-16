import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { message } from 'antd';
import { generateKeyImageSnapshot, broadcastKeyImage } from '../utils/keyImage.utils';

/**
 * Chuyển số đo lưu theo vị trí cũ (index số) sang khoá ổn định `SOP#frame`.
 * Thứ tự cũ được dựng lại chính xác (sắp theo InstanceNumber) nên số đo không bị lệch lát.
 */
export function migrateAnnotationKeys(annotations, legacyOrderKeys) {
  if (!annotations || typeof annotations !== 'object') return {};
  const out = {};
  for (const [k, list] of Object.entries(annotations)) {
    if (!Array.isArray(list) || !list.length) continue;
    if (/^\d+$/.test(k)) {
      const stableKey = legacyOrderKeys?.[Number(k)];
      if (stableKey) out[stableKey] = [...(out[stableKey] || []), ...list];
    } else {
      out[k] = [...(out[k] || []), ...list];
    }
  }
  return out;
}

export function usePacsPresentationState({
  patientDiagnoseId,
  apiEndpoint,
  getAuthHeaders,
  annotations,
  setAnnotations,
  voiBySeries,
  setVoiBySeries,
  windowCenter,
  windowWidth,
  colorLut,
  setColorLut,
  invert,
  setInvert,
  imageCanvasRef,
  annotationCanvasRef,
  dicomCache,
  currentIndex,
  currentKey,
  instances,
  legacyOrderKeys,
  study,
}) {
  const presentationStateKey = patientDiagnoseId ? `pacs_presentation_state_${patientDiagnoseId}` : null;

  const [captureAlert, setCaptureAlert] = useState({
    open: false,
    dataUrl: '',
    caption: '',
    sliceIndex: 1,
    totalSlices: 1,
  });

  // Chỉ cho phép tự lưu SAU KHI đã khôi phục xong -> tránh ghi đè trạng thái cũ bằng dữ liệu rỗng
  const restoredRef = useRef(false);
  const legacyReady = (legacyOrderKeys?.length || 0) > 0 || (instances?.length || 0) > 0;

  useEffect(() => {
    restoredRef.current = false;
  }, [patientDiagnoseId]);

  // Khôi phục trạng thái (server ưu tiên, fallback localStorage)
  useEffect(() => {
    if (!patientDiagnoseId || !legacyReady || restoredRef.current) return;
    let isMounted = true;

    const applyState = (ps) => {
      if (!ps) return false;
      const migrated = migrateAnnotationKeys(ps.annotations, legacyOrderKeys);
      if (Object.keys(migrated).length) setAnnotations(migrated);
      if (ps.windowBySeries && typeof ps.windowBySeries === 'object') setVoiBySeries(ps.windowBySeries);
      // WW/WL toàn cục kiểu cũ KHÔNG áp cho mọi series (sai cửa sổ giữa phổi / trung thất / xương)
      if (ps.colorLut) setColorLut(ps.colorLut);
      if (ps.invert !== undefined) setInvert(ps.invert);
      return true;
    };

    (async () => {
      try {
        const res = await axios.get(`${apiEndpoint}/api/pacs/presentation-state/${patientDiagnoseId}`, {
          headers: getAuthHeaders(),
        });
        const serverPS = res.data?.data?.data || res.data?.data;
        if (isMounted && applyState(serverPS)) {
          restoredRef.current = true;
          return;
        }
      } catch (err) {
        console.warn('Lỗi tải Presentation State từ server:', err.message);
      }
      if (!isMounted) return;
      if (presentationStateKey) {
        try {
          const saved = localStorage.getItem(presentationStateKey);
          if (saved) applyState(JSON.parse(saved));
        } catch {
          /* localStorage không khả dụng - bỏ qua */
        }
      }
      restoredRef.current = true;
    })();

    return () => {
      isMounted = false;
    };
  }, [patientDiagnoseId, legacyReady, legacyOrderKeys, apiEndpoint, presentationStateKey, getAuthHeaders, setAnnotations, setVoiBySeries, setColorLut, setInvert]);

  // Tự lưu (debounce)
  const saveTimeoutRef = useRef(null);
  useEffect(() => {
    if (!patientDiagnoseId || !restoredRef.current) return;
    const stateToSave = {
      patientDiagnoseId: Number(patientDiagnoseId),
      annotations,
      windowBySeries: voiBySeries,
      windowCenter,
      windowWidth,
      colorLut,
      invert,
      updatedAt: new Date().toISOString(),
    };

    if (presentationStateKey) {
      try {
        localStorage.setItem(presentationStateKey, JSON.stringify(stateToSave));
      } catch {
          /* localStorage không khả dụng - bỏ qua */
        }
    }

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await axios.post(`${apiEndpoint}/api/pacs/presentation-state`, stateToSave, { headers: getAuthHeaders() });
      } catch (err) {
        console.warn('Lưu trạng thái lên PACS Server thất bại:', err.message);
      }
    }, 800);

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [patientDiagnoseId, presentationStateKey, annotations, voiBySeries, windowCenter, windowWidth, colorLut, invert, apiEndpoint, getAuthHeaders]);

  // Key Image Capture Handler
  const handleCaptureKeyImage = async () => {
    try {
      const { dataUrl, captionText } = generateKeyImageSnapshot({
        imgCanvas: imageCanvasRef.current,
        annCanvas: annotationCanvasRef.current,
        metadata: {
          patientName: dicomCache[currentIndex]?.meta?.patientName || study?.dbPatient?.patientName || '',
          patientId: dicomCache[currentIndex]?.meta?.patientId || study?.dbPatient?.patientId || '',
        },
        measurements: annotations[currentKey] || [],
        currentIndex,
        totalSlices: instances.length,
        windowCenter,
        windowWidth,
      });

      if (patientDiagnoseId) {
        broadcastKeyImage({
          patientDiagnoseId: Number(patientDiagnoseId),
          patient_diagnose_id: Number(patientDiagnoseId),
          dataUrl,
          caption: captionText,
          sliceIndex: currentIndex,
          sopInstanceUid: instances[currentIndex]?.sopInstanceUid,
          measurements: (annotations[currentKey] || []).map((a) => ({ type: a.type, value: a.valueText })),
        });

        await axios.post(
          `${apiEndpoint}/api/pacs/key-image`,
          {
            patientDiagnoseId: Number(patientDiagnoseId),
            imageBase64: dataUrl,
            caption: captionText,
            sliceIndex: currentIndex,
            sopInstanceUid: instances[currentIndex]?.sopInstanceUid,
            measurements: (annotations[currentKey] || []).map((a) => ({ type: a.type, value: a.valueText })),
          },
          { headers: getAuthHeaders() }
        );
      }

      setCaptureAlert({
        open: true,
        dataUrl,
        caption: captionText,
        sliceIndex: currentIndex + 1,
        totalSlices: instances.length,
      });

      setTimeout(() => {
        setCaptureAlert((prev) => ({ ...prev, open: false }));
      }, 4000);
    } catch (err) {
      console.error('Lỗi chụp ảnh Key:', err);
      message.error('Không thể chụp ảnh Key: ' + (err.message || 'Lỗi không xác định'));
    }
  };

  return {
    presentationStateKey,
    captureAlert,
    setCaptureAlert,
    handleCaptureKeyImage,
  };
}
