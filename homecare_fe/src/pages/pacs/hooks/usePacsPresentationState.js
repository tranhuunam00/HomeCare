import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { message } from 'antd';
import { generateKeyImageSnapshot, broadcastKeyImage } from '../utils/keyImage.utils';

export function usePacsPresentationState({
  patientDiagnoseId,
  apiEndpoint,
  getAuthHeaders,
  annotations,
  setAnnotations,
  windowCenter,
  setWindowCenter,
  windowWidth,
  setWindowWidth,
  colorLut,
  setColorLut,
  invert,
  setInvert,
  imageCanvasRef,
  annotationCanvasRef,
  dicomCache,
  currentIndex,
  instances,
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

  // Restore presentation state on load
  useEffect(() => {
    if (!patientDiagnoseId) return;
    let isMounted = true;

    const fetchServerState = async () => {
      try {
        const token = localStorage.getItem('TOKEN');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await axios.get(`${apiEndpoint}/api/pacs/presentation-state/${patientDiagnoseId}`, { headers });
        const serverPS = res.data?.data?.data || res.data?.data;

        if (isMounted && serverPS) {
          if (serverPS.annotations && Object.keys(serverPS.annotations).length > 0) {
            setAnnotations(serverPS.annotations);
          }
          if (serverPS.windowCenter !== undefined) setWindowCenter(serverPS.windowCenter);
          if (serverPS.windowWidth !== undefined) setWindowWidth(serverPS.windowWidth);
          if (serverPS.colorLut) setColorLut(serverPS.colorLut);
          if (serverPS.invert !== undefined) setInvert(serverPS.invert);
          return;
        }
      } catch (err) {
        console.warn('Lỗi tải Presentation State từ server:', err.message);
      }

      if (isMounted && presentationStateKey) {
        try {
          const saved = localStorage.getItem(presentationStateKey);
          if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed.annotations) setAnnotations(parsed.annotations);
            if (parsed.windowCenter !== undefined) setWindowCenter(parsed.windowCenter);
            if (parsed.windowWidth !== undefined) setWindowWidth(parsed.windowWidth);
            if (parsed.colorLut) setColorLut(parsed.colorLut);
            if (parsed.invert !== undefined) setInvert(parsed.invert);
          }
        } catch (e) {}
      }
    };

    fetchServerState();
    return () => {
      isMounted = false;
    };
  }, [patientDiagnoseId, apiEndpoint, presentationStateKey, setWindowCenter, setWindowWidth, setColorLut, setInvert, setAnnotations]);

  // Debounced auto-save
  const saveTimeoutRef = useRef(null);
  useEffect(() => {
    if (!patientDiagnoseId) return;
    const stateToSave = {
      patientDiagnoseId: Number(patientDiagnoseId),
      annotations,
      windowCenter,
      windowWidth,
      colorLut,
      invert,
      updatedAt: new Date().toISOString(),
    };

    if (presentationStateKey) {
      try {
        localStorage.setItem(presentationStateKey, JSON.stringify(stateToSave));
      } catch (e) {}
    }

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        const token = localStorage.getItem('TOKEN');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        await axios.post(`${apiEndpoint}/api/pacs/presentation-state`, stateToSave, { headers });
      } catch (err) {
        console.warn('Lưu trạng thái lên PACS Server thất bại:', err.message);
      }
    }, 800);

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [patientDiagnoseId, presentationStateKey, annotations, windowCenter, windowWidth, colorLut, invert, apiEndpoint]);

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
        measurements: annotations[currentIndex] || [],
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
          measurements: (annotations[currentIndex] || []).map((a) => ({ type: a.type, value: a.valueText })),
        });

        await axios.post(
          `${apiEndpoint}/api/pacs/key-image`,
          {
            patientDiagnoseId: Number(patientDiagnoseId),
            imageBase64: dataUrl,
            caption: captionText,
            sliceIndex: currentIndex,
            sopInstanceUid: instances[currentIndex]?.sopInstanceUid,
            measurements: (annotations[currentIndex] || []).map((a) => ({ type: a.type, value: a.valueText })),
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
