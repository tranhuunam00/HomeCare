import { useCallback, useEffect, useRef, useState } from 'react';
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

/**
 * Chọn bản trạng thái để khôi phục: máy chủ là nguồn chính; bản trong trình duyệt chỉ thắng khi nó là
 * thay đổi CHƯA ĐỒNG BỘ và mới hơn bản trên máy chủ (mất mạng / đóng tab ngay sau khi đo).
 */
export function pickRestoreState(serverPS, local) {
  const serverTime = Date.parse(serverPS?.clientUpdatedAt || serverPS?.updatedAt || 0) || 0;
  const localTime = Date.parse(local?.updatedAt || 0) || 0;
  if (local && local.synced === false && localTime > serverTime) return { state: local, source: 'local' };
  return { state: serverPS || null, source: 'server' };
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

  // Chỉ cho phép tự lưu SAU KHI đã khôi phục xong từ MÁY CHỦ -> không bao giờ ghi đè số đo trên máy chủ bằng bản trống / bản cũ
  const restoredRef = useRef(false);
  const [restoreTick, setRestoreTick] = useState(0);
  const legacyReady = (legacyOrderKeys?.length || 0) > 0 || (instances?.length || 0) > 0;
  /** state: idle | saving | saved | retrying | error | offline-restore */
  const [saveStatus, setSaveStatus] = useState({ state: 'idle', at: null, message: '' });

  useEffect(() => {
    restoredRef.current = false;
  }, [patientDiagnoseId]);

  const readLocal = useCallback(() => {
    if (!presentationStateKey) return null;
    try {
      const raw = localStorage.getItem(presentationStateKey);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, [presentationStateKey]);

  const writeLocal = useCallback(
    (state) => {
      if (!presentationStateKey) return;
      try {
        localStorage.setItem(presentationStateKey, JSON.stringify(state));
      } catch {
        /* localStorage không khả dụng - bỏ qua */
      }
    },
    [presentationStateKey]
  );

  // Khôi phục trạng thái
  useEffect(() => {
    if (!patientDiagnoseId || !legacyReady || restoredRef.current) return undefined;
    let isMounted = true;
    let retryTimer = null;

    const applyState = (ps) => {
      if (!ps) return;
      setAnnotations(migrateAnnotationKeys(ps.annotations, legacyOrderKeys));
      if (ps.windowBySeries && typeof ps.windowBySeries === 'object') setVoiBySeries(ps.windowBySeries);
      // WW/WL toàn cục kiểu cũ KHÔNG áp cho mọi series (sai cửa sổ giữa phổi / trung thất / xương)
      if (ps.colorLut) setColorLut(ps.colorLut);
      if (ps.invert !== undefined) setInvert(ps.invert);
    };

    const attempt = async (n) => {
      try {
        const res = await axios.get(`${apiEndpoint}/api/pacs/presentation-state/${patientDiagnoseId}`, { headers: getAuthHeaders() });
        if (!isMounted) return;
        const body = res.data?.data;
        const serverPS = body && typeof body === 'object' && 'data' in body ? body.data : body;
        const { state } = pickRestoreState(serverPS, readLocal());
        applyState(state);
        restoredRef.current = true;
        setRestoreTick((t) => t + 1);
        setSaveStatus({ state: 'saved', at: serverPS?.updatedAt || null, message: '' });
      } catch (err) {
        if (!isMounted) return;
        const status = err?.response?.status;
        if (status === 404) {
          // Ca chưa có ảnh DICOM trên máy chủ: chưa có gì để khôi phục / lưu
          restoredRef.current = true;
          return;
        }
        // Lỗi mạng / máy chủ: KHÔNG bật tự lưu, chỉ hiển thị bản tạm trong trình duyệt và thử lại
        if (n === 0) applyState(readLocal());
        setSaveStatus({ state: 'offline-restore', at: null, message: 'Chưa tải được số đo đã lưu từ máy chủ - đang thử lại' });
        if (status !== 401 && status !== 403) retryTimer = setTimeout(() => attempt(n + 1), Math.min(30000, 2000 * 2 ** n));
      }
    };
    attempt(0);

    return () => {
      isMounted = false;
      if (retryTimer) clearTimeout(retryTimer);
    };
  }, [patientDiagnoseId, legacyReady, legacyOrderKeys, apiEndpoint, getAuthHeaders, readLocal, setAnnotations, setVoiBySeries, setColorLut, setInvert]);

  /* ---------- Tự lưu: gộp thay đổi, chỉ 1 request/lúc (không bao giờ đến sai thứ tự), thử lại khi lỗi ---------- */
  const latestRef = useRef(null); // bản mới nhất chưa được máy chủ xác nhận
  const inFlightRef = useRef(false);
  const retryRef = useRef({ n: 0, timer: null });

  const pushToServer = useCallback(async () => {
    if (inFlightRef.current || !latestRef.current) return;
    const state = latestRef.current;
    inFlightRef.current = true;
    setSaveStatus((p) => ({ ...p, state: retryRef.current.n ? 'retrying' : 'saving' }));
    let sendNext = false;
    try {
      const res = await axios.post(`${apiEndpoint}/api/pacs/presentation-state`, state, { headers: getAuthHeaders() });
      retryRef.current.n = 0;
      if (latestRef.current === state) {
        latestRef.current = null;
        writeLocal({ ...state, synced: true });
      } else {
        sendNext = true; // có thay đổi mới trong lúc đang gửi
      }
      const saved = res.data?.data?.data || res.data?.data;
      setSaveStatus({ state: 'saved', at: saved?.updatedAt || new Date().toISOString(), message: '' });
    } catch (err) {
      const status = err?.response?.status;
      const n = ++retryRef.current.n;
      const fatal = [400, 401, 403, 404, 413].includes(status);
      setSaveStatus({
        state: 'error',
        at: null,
        message:
          status === 401
            ? 'Phiên đăng nhập hết hạn - số đo đang được giữ tạm trên máy này, hãy đăng nhập lại'
            : `Chưa lưu được số đo lên máy chủ (${status || 'mất kết nối'})${fatal ? '' : ' - đang thử lại'}`,
      });
      if (!fatal) {
        clearTimeout(retryRef.current.timer);
        retryRef.current.timer = setTimeout(() => pushToServer(), Math.min(30000, 1000 * 2 ** n));
      }
    } finally {
      inFlightRef.current = false;
    }
    if (sendNext) pushToServer();
  }, [apiEndpoint, getAuthHeaders, writeLocal]);

  const saveTimeoutRef = useRef(null);
  useEffect(() => {
    if (!patientDiagnoseId || !restoredRef.current) return undefined;
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
    // Ghi ngay vào trình duyệt (đánh dấu chưa đồng bộ) -> không mất số đo khi mất mạng / đóng tab
    writeLocal({ ...stateToSave, synced: false });
    latestRef.current = stateToSave;

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      retryRef.current.n = 0;
      pushToServer();
    }, 800);
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [patientDiagnoseId, restoreTick, annotations, voiBySeries, windowCenter, windowWidth, colorLut, invert, writeLocal, pushToServer]);

  // Đóng tab / rời trang khi còn thay đổi chưa gửi -> keepalive (trình duyệt vẫn gửi sau khi trang đóng)
  const flushRef = useRef(null);
  flushRef.current = () => {
    const state = latestRef.current;
    if (!state) return;
    try {
      fetch(`${apiEndpoint}/api/pacs/presentation-state`, {
        method: 'POST',
        keepalive: true,
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(state),
      }).catch(() => undefined);
    } catch {
      /* bản trong trình duyệt vẫn còn, sẽ đồng bộ ở lần mở sau */
    }
  };
  useEffect(() => {
    const onHide = () => flushRef.current?.();
    window.addEventListener('pagehide', onHide);
    const retry = retryRef.current;
    return () => {
      window.removeEventListener('pagehide', onHide);
      onHide(); // rời trang viewer trong SPA
      clearTimeout(retry.timer);
    };
  }, []);

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
    saveStatus,
  };
}
