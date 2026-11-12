import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { message } from 'antd';
import { parseDicomBuffer, renderDicomToCanvas } from './services/dicomDecoder';
import { usePacsStudy } from './hooks/usePacsStudy';
import PacsTopNav from './components/PacsTopNav';
import PacsSidebar from './components/PacsSidebar';
import PacsSeriesStrip from './components/PacsSeriesStrip';
import PacsViewport from './components/PacsViewport';
import PacsCaptureAlert from './components/PacsCaptureAlert';
import PacsUploadAlert from './components/PacsUploadAlert';
import PacsAttachmentViewer from './components/PacsAttachmentViewer';
import PacsMprModal from './components/PacsMprModal';
import { PACS_TOOLS } from './constants/pacs.constants';
import {
  calculateDistance,
  calculateAngle,
  calculateEllipseArea,
  calculateRectArea,
  formatMeasurement,
} from './utils/measurement.utils';
import { renderAnnotationsToCanvas } from './utils/annotation.renderer';
import { generateKeyImageSnapshot, broadcastKeyImage } from './utils/keyImage.utils';

export default function PacsViewerPage() {
  const [searchParams] = useSearchParams();
  const patientDiagnoseId = searchParams.get('patientDiagnoseId') || '';

  const apiEndpoint = useMemo(() => {
    const envUrl = import.meta.env.VITE_API_ENDPOINT;
    if (typeof window !== 'undefined' && window.location.hostname.includes('home-care.vn')) {
      if (!envUrl || envUrl.includes('localhost') || envUrl.includes('127.0.0.1')) {
        return 'https://api.home-care.vn';
      }
    }
    return envUrl || 'http://localhost:3001';
  }, []);

  // Custom hook: Data access and DICOM loading
  const {
    loading,
    study,
    instances,
    currentIndex,
    setCurrentIndex,
    dicomCache,
    setDicomCache,
    windowCenter,
    setWindowCenter,
    windowWidth,
    setWindowWidth,
    loadStudy,
    uploadDicom,
    uploadState,
    resetUploadState,
    getAuthHeaders,
  } = usePacsStudy(patientDiagnoseId, apiEndpoint);

  // Group instances into Series (Supports multiple files / multiple series per patient)
  const seriesList = useMemo(() => {
    if (!instances || instances.length === 0) return [];

    const map = new Map();
    instances.forEach((inst, idx) => {
      const key = inst.seriesInstanceUid || 'default_series';
      if (!map.has(key)) {
        map.set(key, {
          seriesUid: key,
          seriesIndex: map.size + 1,
          title: inst.fileName?.replace(/\.dcm$/i, '') || inst.seriesDescription || `upload_${idx + 1}`,
          instances: [],
        });
      }
      map.get(key).instances.push({ ...inst, globalIndex: idx });
    });

    return Array.from(map.values());
  }, [instances]);

  const [activeSeriesUid, setActiveSeriesUid] = useState(null);

  // Per-series thumbnail map: { [seriesUid]: dataUrl }
  const [seriesThumbnails, setSeriesThumbnails] = useState({});
  const [isExpanded, setIsExpanded] = useState(false);

  // Key Image Capture Alert State (Clear feedback & Shutter Flash for doctor)
  const [captureAlert, setCaptureAlert] = useState({
    open: false,
    dataUrl: '',
    caption: '',
    sliceIndex: 1,
    totalSlices: 1,
  });

  // Active non-DICOM attached file (PDF report, Word docx, Video mp4) for embedded viewing (Ảnh 1)
  const [activeAttachedFile, setActiveAttachedFile] = useState(null);

  // 3D Volume Rendering & Multi-Planar Reconstruction (MPR) modal state
  const [mprOpen, setMprOpen] = useState(false);

  // Layout mode: '1x1' | '1x2' | '2x1' | '2x2'
  const [layout, setLayout] = useState('1x1');
  const [activeViewport, setActiveViewport] = useState(0);

  // Active Tool & Canvas Transforms
  const [activeTool, setActiveTool] = useState(PACS_TOOLS.LENGTH);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [invert, setInvert] = useState(false);
  const [colorLut, setColorLut] = useState('default');

  // Annotations per slice: { [sliceIndex]: Array<Measurement> }
  const [annotations, setAnnotations] = useState({});
  const [currentDrawing, setCurrentDrawing] = useState(null);

  // 🏥 Medical Standard (DICOM Presentation State - GSPS):
  // Persist doctor's annotations & display parameters across page reloads on both PACS Server and local cache
  const presentationStateKey = patientDiagnoseId ? `pacs_presentation_state_${patientDiagnoseId}` : null;

  // Restore presentation state from PACS Server on load (with localStorage fallback)
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
        console.warn('Lỗi tải Presentation State từ server, chuyển sang đọc bộ nhớ cục bộ:', err.message);
      }

      // Local storage fallback
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
        } catch (e) {
          console.warn('Lỗi khôi phục trạng thái cục bộ:', e);
        }
      }
    };

    fetchServerState();
    return () => {
      isMounted = false;
    };
  }, [patientDiagnoseId, apiEndpoint, presentationStateKey, setWindowCenter, setWindowWidth]);

  // Auto-save presentation state to both localStorage and PACS Server (debounced)
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

    // 1. Instant local persistence
    if (presentationStateKey) {
      try {
        localStorage.setItem(presentationStateKey, JSON.stringify(stateToSave));
      } catch (e) {}
    }

    // 2. Debounced PACS Server persistence (save 800ms after user finishes measuring)
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
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

  // Canvas Refs
  const imageCanvasRef = useRef(null);
  const annotationCanvasRef = useRef(null);

  // Interaction tracking
  const isInteracting = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });
  const startPan = useRef({ x: 0, y: 0 });
  const startWW = useRef({ ww: 255, wl: 128 });

  // Redraw DICOM Pixel Canvas when pixels or rendering parameters change
  useEffect(() => {
    const currentData = dicomCache[currentIndex];
    const canvas = imageCanvasRef.current;
    if (!currentData || !canvas) return;

    renderDicomToCanvas(canvas, currentData.rawPixels, currentData.meta, {
      windowCenter,
      windowWidth,
      invert,
      colorLut,
    });

    // Update thumbnail strictly for the series that owns currentIndex
    const activeInst = instances[currentIndex];
    const ownerSeriesUid = activeInst?.seriesInstanceUid || 'default_series';
    if (!seriesThumbnails[ownerSeriesUid]) {
      try {
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        setSeriesThumbnails((prev) =>
          prev[ownerSeriesUid] ? prev : { ...prev, [ownerSeriesUid]: dataUrl }
        );
      } catch (e) {
        // ignore
      }
    }
  }, [dicomCache, currentIndex, windowCenter, windowWidth, invert, colorLut, instances, seriesThumbnails]);

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
            setSeriesThumbnails((prev) => ({ ...prev, [series.seriesUid]: thumbUrl }));
          }
        } catch (err) {
          console.warn('Không thể tạo thumbnail cho series:', series.seriesUid, err?.message);
        }
      }
    };

    generateMissingSeriesThumbs();
    return () => {
      cancelled = true;
    };
  }, [seriesList, apiEndpoint, getAuthHeaders]);

  // Redraw Overlay Annotations Canvas
  useEffect(() => {
    const canvas = annotationCanvasRef.current;
    const currentData = dicomCache[currentIndex];
    if (!canvas || !currentData) return;

    // 🎯 Crucial: Ensure annotation canvas pixel buffer strictly matches image canvas resolution
    const targetW = currentData.meta?.columns || 512;
    const targetH = currentData.meta?.rows || 512;
    if (canvas.width !== targetW) canvas.width = targetW;
    if (canvas.height !== targetH) canvas.height = targetH;

    renderAnnotationsToCanvas(
      canvas,
      annotations[currentIndex] || [],
      currentDrawing,
      currentData.meta
    );
  }, [annotations, currentDrawing, currentIndex, dicomCache]);

  // Convert Viewport Mouse Coordinates to DICOM Canvas Space with full inverse transform
  const getCanvasCoordinates = (e) => {
    const canvas = imageCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const W = canvas.width || 512;
    const H = canvas.height || 512;

    // Visual center of the transformed canvas on screen
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Mouse distance from the visual center on screen
    const dx = e.clientX - centerX;
    const dy = e.clientY - centerY;

    // 1. Inverse Rotation
    const rad = (-rotation * Math.PI) / 180;
    const cosA = Math.cos(rad);
    const sinA = Math.sin(rad);
    let unrotX = dx * cosA - dy * sinA;
    let unrotY = dx * sinA + dy * cosA;

    // 2. Inverse Flip
    if (flipH) unrotX = -unrotX;
    if (flipV) unrotY = -unrotY;

    // 3. Inverse Zoom and Screen Scale
    // Unzoomed display size of canvas on screen
    const displayW = rect.width / zoom;
    const displayH = rect.height / zoom;

    const isRotated90or270 = Math.abs(rotation % 180) === 90;
    const effDisplayW = isRotated90or270 ? displayH : displayW;
    const effDisplayH = isRotated90or270 ? displayW : displayH;

    const scaleFactorX = W / (effDisplayW * zoom);
    const scaleFactorY = H / (effDisplayH * zoom);

    const canvasX = Math.round(W / 2 + unrotX * scaleFactorX);
    const canvasY = Math.round(H / 2 + unrotY * scaleFactorY);

    // Clamp to canvas boundaries
    return {
      x: Math.max(0, Math.min(W, canvasX)),
      y: Math.max(0, Math.min(H, canvasY)),
    };
  };

  // Select Series from Strip
  const handleSelectSeries = (seriesUid) => {
    setActiveSeriesUid(seriesUid);
    const targetSeries = seriesList.find((s) => s.seriesUid === seriesUid);
    if (targetSeries && targetSeries.instances?.length > 0) {
      setCurrentIndex(targetSeries.instances[0].globalIndex);
    }
  };

  // Mouse Down Handler
  const handleMouseDown = (e) => {
    if (e.button !== 0 && e.button !== 1 && e.button !== 2) return;
    isInteracting.current = true;
    startPos.current = { x: e.clientX, y: e.clientY };
    startPan.current = { ...pan };
    startWW.current = { ww: windowWidth, wl: windowCenter };

    if (e.button === 1 || activeTool === PACS_TOOLS.PAN) return;
    if (e.button === 2 || activeTool === PACS_TOOLS.WW_WL) return;

    const coords = getCanvasCoordinates(e);

    if (activeTool === PACS_TOOLS.LENGTH) {
      setCurrentDrawing({
        id: Date.now(),
        type: 'length',
        points: [coords, coords],
        valueText: '0.0 mm',
      });
    } else if (activeTool === PACS_TOOLS.ANGLE) {
      if (!currentDrawing) {
        setCurrentDrawing({
          id: Date.now(),
          type: 'angle',
          points: [coords, coords],
          valueText: '',
        });
      } else if (currentDrawing.points.length === 2) {
        const [p1, p2] = currentDrawing.points;
        const angleDeg = calculateAngle(p1, p2, coords);
        setAnnotations((prev) => ({
          ...prev,
          [currentIndex]: [
            ...(prev[currentIndex] || []),
            {
              ...currentDrawing,
              points: [p1, p2, coords],
              valueText: formatMeasurement('angle', angleDeg),
            },
          ],
        }));
        setCurrentDrawing(null);
      }
    } else if (activeTool === PACS_TOOLS.ROI_ELLIPSE) {
      setCurrentDrawing({
        id: Date.now(),
        type: 'roi_ellipse',
        points: [coords, coords],
        valueText: '0.0 mm²',
      });
    } else if (activeTool === PACS_TOOLS.ROI_RECT) {
      setCurrentDrawing({
        id: Date.now(),
        type: 'roi_rect',
        points: [coords, coords],
        valueText: '0.0 mm²',
      });
    }
  };

  // Mouse Move Handler
  const handleMouseMove = (e) => {
    if (!isInteracting.current) return;

    const dx = e.clientX - startPos.current.x;
    const dy = e.clientY - startPos.current.y;

    if (e.buttons === 4 || activeTool === PACS_TOOLS.PAN) {
      setPan({ x: startPan.current.x + dx, y: startPan.current.y + dy });
      return;
    }

    if (e.buttons === 2 || activeTool === PACS_TOOLS.WW_WL) {
      const sensitivity = 2.0;
      setWindowWidth((prev) => Math.max(1, Math.round(startWW.current.ww + dx * sensitivity)));
      setWindowCenter((prev) => Math.round(startWW.current.wl - dy * sensitivity));
      return;
    }

    if (activeTool === PACS_TOOLS.ZOOM) {
      const zoomFactor = 1 - dy * 0.01;
      setZoom((prev) => Math.max(0.1, Math.min(10, prev * zoomFactor)));
      startPos.current = { x: e.clientX, y: e.clientY };
      return;
    }

    const coords = getCanvasCoordinates(e);
    const currentData = dicomCache[currentIndex];
    const pixelSpacing = currentData?.meta?.pixelSpacing || [1.0, 1.0];

    if (activeTool === PACS_TOOLS.LENGTH && currentDrawing) {
      const dist = calculateDistance(currentDrawing.points[0], coords, pixelSpacing);
      setCurrentDrawing({
        ...currentDrawing,
        points: [currentDrawing.points[0], coords],
        valueText: formatMeasurement('length', dist),
      });
    } else if (activeTool === PACS_TOOLS.ROI_ELLIPSE && currentDrawing) {
      const area = calculateEllipseArea(currentDrawing.points[0], coords, pixelSpacing);
      setCurrentDrawing({
        ...currentDrawing,
        points: [currentDrawing.points[0], coords],
        valueText: formatMeasurement('roi_ellipse', area),
      });
    } else if (activeTool === PACS_TOOLS.ROI_RECT && currentDrawing) {
      const area = calculateRectArea(currentDrawing.points[0], coords, pixelSpacing);
      setCurrentDrawing({
        ...currentDrawing,
        points: [currentDrawing.points[0], coords],
        valueText: formatMeasurement('roi_rect', area),
      });
    }
  };

  // Mouse Up Handler
  const handleMouseUp = () => {
    if (!isInteracting.current) return;
    isInteracting.current = false;

    if (
      currentDrawing &&
      (activeTool === PACS_TOOLS.LENGTH ||
        activeTool === PACS_TOOLS.ROI_ELLIPSE ||
        activeTool === PACS_TOOLS.ROI_RECT)
    ) {
      const [p1, p2] = currentDrawing.points;
      const dx = (p1?.x || 0) - (p2?.x || 0);
      const dy = (p1?.y || 0) - (p2?.y || 0);
      if (Math.hypot(dx, dy) >= 3) {
        setAnnotations((prev) => ({
          ...prev,
          [currentIndex]: [...(prev[currentIndex] || []), currentDrawing],
        }));
      }
      setCurrentDrawing(null);
    }
  };

  // Wheel Handler: Cine Slice Navigation
  const handleWheel = (e) => {
    e.preventDefault();
    if (instances.length <= 1) return;
    if (e.deltaY > 0) {
      setCurrentIndex((prev) => Math.min(prev + 1, instances.length - 1));
    } else {
      setCurrentIndex((prev) => Math.max(prev - 1, 0));
    }
  };

  // Zoom & Enlarge Helpers
  const handleZoomIn = () => setZoom((prev) => Math.min(10, Number((prev * 1.25).toFixed(2))));
  const handleZoomOut = () => setZoom((prev) => Math.max(0.2, Number((prev / 1.25).toFixed(2))));
  const handleResetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };
  const handleDoubleClickZoom = () => {
    if (zoom > 1.05) {
      setZoom(1);
      setPan({ x: 0, y: 0 });
    } else {
      setZoom(2);
    }
  };

  // Reset Transformations
  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
    setInvert(false);
    setColorLut('default');
    const currentData = dicomCache[currentIndex];
    if (currentData) {
      setWindowCenter(currentData.meta.windowCenter);
      setWindowWidth(currentData.meta.windowWidth);
    }
  };

  const handleClearAnnotations = () => {
    setAnnotations((prev) => {
      const next = { ...prev, [currentIndex]: [] };
      if (presentationStateKey) {
        try {
          const saved = JSON.parse(localStorage.getItem(presentationStateKey) || '{}');
          saved.annotations = next;
          localStorage.setItem(presentationStateKey, JSON.stringify(saved));
        } catch (e) {}
      }
      return next;
    });
    message.success('Đã xóa tất cả đo đạc trên lát cắt này');
  };

  const handleClearAllAnnotations = () => {
    setAnnotations({});
    if (presentationStateKey) {
      localStorage.removeItem(presentationStateKey);
    }
    message.success('Đã xóa toàn bộ số đo của ca khám');
  };

  // Apply Window/Level Preset
  const handleApplyPreset = (preset) => {
    if (preset.ww && preset.wl) {
      setWindowWidth(preset.ww);
      setWindowCenter(preset.wl);
    } else {
      const currentData = dicomCache[currentIndex];
      if (currentData) {
        setWindowWidth(currentData.meta.windowWidth);
        setWindowCenter(currentData.meta.windowCenter);
      }
    }
  };

  // KEY IMAGE CAPTURE (Chụp ảnh Key & Hiển thị thông báo + Shutter Flash rõ ràng)
  const handleCaptureKeyImage = async () => {
    try {
      const { dataUrl, captionText, measurementsSummary } = generateKeyImageSnapshot({
        imgCanvas: imageCanvasRef.current,
        annCanvas: annotationCanvasRef.current,
        metadata: {
          patientName: study?.patientName || dicomCache[currentIndex]?.meta?.patientName,
          patientId: study?.patientId || dicomCache[currentIndex]?.meta?.patientId || patientDiagnoseId,
        },
        measurements: annotations[currentIndex] || [],
        currentIndex,
        totalSlices: instances.length,
        windowCenter,
        windowWidth,
      });

      // 1. Broadcast across all frontend tabs
      broadcastKeyImage({
        patientDiagnoseId: patientDiagnoseId ? Number(patientDiagnoseId) : undefined,
        patient_diagnose_id: patientDiagnoseId ? Number(patientDiagnoseId) : undefined,
        dataUrl,
        caption: captionText,
        sliceIndex: currentIndex,
        sopInstanceUid: instances[currentIndex]?.sopInstanceUid,
        measurements: (annotations[currentIndex] || []).map((a) => ({
          type: a.type,
          value: a.valueText,
        })),
      });

      // 2. Persist to PACS backend
      if (patientDiagnoseId) {
        await axios.post(
          `${apiEndpoint}/api/pacs/key-image`,
          {
            patientDiagnoseId: Number(patientDiagnoseId),
            imageBase64: dataUrl,
            caption: captionText,
            sliceIndex: currentIndex,
            sopInstanceUid: instances[currentIndex]?.sopInstanceUid,
            measurements: (annotations[currentIndex] || []).map((a) => ({
              type: a.type,
              value: a.valueText,
            })),
          },
          { headers: getAuthHeaders() }
        );
      }

      // 3. Trigger Flash Effect and Prominent Success Alert Modal
      setCaptureAlert({
        open: true,
        dataUrl,
        caption: captionText,
        sliceIndex: currentIndex + 1,
        totalSlices: instances.length,
      });

      // Auto close alert after 4 seconds
      setTimeout(() => {
        setCaptureAlert((prev) => ({ ...prev, open: false }));
      }, 4000);
    } catch (err) {
      console.error('Lỗi chụp ảnh Key:', err);
      message.error('Không thể chụp ảnh Key: ' + (err.message || 'Lỗi không xác định'));
    }
  };

  // Keyboard Shortcuts: Space / Ctrl+S for Key Image Capture, Arrows for Cine
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' || (e.ctrlKey && e.key.toLowerCase() === 's')) {
        e.preventDefault();
        handleCaptureKeyImage();
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        setCurrentIndex((prev) => Math.min(prev + 1, instances.length - 1));
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        setCurrentIndex((prev) => Math.max(prev - 1, 0));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleCaptureKeyImage, instances.length]);

  const currentMeta = dicomCache[currentIndex]?.meta;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        width: '100vw',
        backgroundColor: '#0a0f1d',
        color: '#e2e8f0',
        overflow: 'hidden',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        position: 'relative',
      }}
    >
      {/* Visual Camera Flash & Prominent Success Alert */}
      <PacsCaptureAlert
        open={captureAlert.open}
        onClose={() => setCaptureAlert((prev) => ({ ...prev, open: false }))}
        dataUrl={captureAlert.dataUrl}
        caption={captureAlert.caption}
        sliceIndex={captureAlert.sliceIndex}
        totalSlices={captureAlert.totalSlices}
      />

      {/* Prominent DICOM & Document Upload Notification Toast */}
      <PacsUploadAlert
        status={uploadState.status}
        fileName={uploadState.fileName}
        fileSize={uploadState.fileSize}
        progress={uploadState.progress}
        message={uploadState.message}
        details={uploadState.details}
        onClose={resetUploadState}
      />

      {/* Top Navbar */}
      <PacsTopNav
        activeTool={activeTool}
        setActiveTool={setActiveTool}
        invert={invert}
        setInvert={setInvert}
        rotation={rotation}
        setRotation={setRotation}
        onReset={handleReset}
        onCaptureKeyImage={handleCaptureKeyImage}
        onApplyPreset={handleApplyPreset}
        currentMeta={currentMeta}
        onOpenMpr={() => setMprOpen(true)}
        onUploadDicom={uploadDicom}
        zoom={zoom}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetZoom={handleResetZoom}
        isExpanded={isExpanded}
        onToggleExpand={() => setIsExpanded((prev) => !prev)}
      />

      {/* Main Body */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Column 1: Left Tool Sidebar */}
        {!isExpanded && (
          <PacsSidebar
            study={study}
            instances={instances}
            currentIndex={currentIndex}
            patientDiagnoseId={patientDiagnoseId}
            layout={layout}
            setLayout={setLayout}
            activeTool={activeTool}
            setActiveTool={setActiveTool}
            onClearAnnotations={handleClearAnnotations}
            onUploadDicom={uploadDicom}
            onReloadStudy={loadStudy}
            flipH={flipH}
            setFlipH={setFlipH}
            flipV={flipV}
            setFlipV={setFlipV}
            rotation={rotation}
            setRotation={setRotation}
            onReset={handleReset}
            onOpenMpr={() => setMprOpen(true)}
          />
        )}

        {/* Column 2: Series & Files Strip (As in Image 2 - Supports Multiple Files/Series) */}
        {!isExpanded && (
          <PacsSeriesStrip
            seriesList={seriesList}
            activeSeriesUid={activeSeriesUid}
            onSelectSeries={(uid) => {
              setActiveAttachedFile(null);
              handleSelectSeries(uid);
            }}
            seriesThumbnails={seriesThumbnails}
            attachedFiles={study?.attachedFiles || []}
            activeAttachedFile={activeAttachedFile}
            onSelectAttachedFile={(file) => {
              setActiveAttachedFile(file);
            }}
          />
        )}

        {/* Column 3: Main Stage - Either Embedded Attachment Viewer (Ảnh 1) or DICOM Multi-Viewport Grid (Ảnh 2) */}
        {activeAttachedFile ? (
          <PacsAttachmentViewer
            file={activeAttachedFile}
            onClose={() => setActiveAttachedFile(null)}
            apiEndpoint={apiEndpoint}
            token={localStorage.getItem('TOKEN') || ''}
          />
        ) : (
          <div
            style={{
              flex: 1,
              backgroundColor: '#000000',
              display: 'grid',
              gridTemplateColumns: layout === '1x2' || layout === '2x2' ? '1fr 1fr' : '1fr',
              gridTemplateRows: layout === '2x1' || layout === '2x2' ? '1fr 1fr' : '1fr',
              gap: 2,
              padding: 2,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Main Viewport Pane */}
            <PacsViewport
              viewportIndex={0}
              activeViewport={activeViewport}
              setActiveViewport={setActiveViewport}
              loading={loading}
              imageCanvasRef={imageCanvasRef}
              annotationCanvasRef={annotationCanvasRef}
              pan={pan}
              zoom={zoom}
              rotation={rotation}
              flipH={flipH}
              flipV={flipV}
              activeTool={activeTool}
              setActiveTool={setActiveTool}
              isInteracting={isInteracting}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onWheel={handleWheel}
              onReset={handleReset}
              onZoomIn={handleZoomIn}
              onZoomOut={handleZoomOut}
              onDoubleClickZoom={handleDoubleClickZoom}
              isExpanded={isExpanded}
              onToggleExpand={() => setIsExpanded((prev) => !prev)}
              onCaptureKeyImage={handleCaptureKeyImage}
              onUploadDicom={uploadDicom}
              currentMeta={currentMeta}
              study={study}
              patientDiagnoseId={patientDiagnoseId}
              currentIndex={currentIndex}
              setCurrentIndex={setCurrentIndex}
              totalSlices={instances.length}
              colorLut={colorLut}
              setColorLut={setColorLut}
              windowWidth={windowWidth}
              windowCenter={windowCenter}
              instancesCount={instances.length}
            />

            {/* Comparison Viewport Pane (When 1x2 or 2x2 layout is active) */}
            {(layout === '1x2' || layout === '2x1' || layout === '2x2') && (
              <div
                onClick={() => setActiveViewport(1)}
                style={{
                  position: 'relative',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: '#000000',
                  overflow: 'hidden',
                  border: activeViewport === 1 ? '1.5px solid #f59e0b' : '1.5px solid #1e293b',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: 8,
                    left: 10,
                    color: '#94a3b8',
                    fontSize: '11px',
                    fontFamily: 'monospace',
                    lineHeight: '15px',
                  }}
                >
                  <div>Age: Invalid date</div>
                  <div>00:::00</div>
                  <div>Laterality:</div>
                  <div>ImageLaterality:</div>
                  <div>ViewPosition:</div>
                </div>

                <div
                  style={{
                    position: 'absolute',
                    top: 8,
                    right: 12,
                    color: '#94a3b8',
                    fontSize: '11px',
                    fontFamily: 'monospace',
                    lineHeight: '15px',
                    textAlign: 'right',
                  }}
                >
                  <div>Series Index: 2</div>
                  <div>Image: 1/{instances.length || 1}</div>
                </div>

                <div style={{ color: '#475569', fontSize: '12px' }}>
                  Khung so sánh (Kéo series khác hoặc lặp lại lát cắt)
                </div>

                <div
                  style={{
                    position: 'absolute',
                    bottom: 8,
                    right: 12,
                    color: '#94a3b8',
                    fontSize: '11px',
                    fontFamily: 'monospace',
                    lineHeight: '15px',
                    textAlign: 'right',
                  }}
                >
                  <div>Zoom: 0.59</div>
                  <div>WW/WL: 255/128</div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3D Volume & Multi-Planar Reconstruction (MPR) Modal */}
      <PacsMprModal
        open={mprOpen}
        onClose={() => setMprOpen(false)}
        instances={instances}
        dicomCache={dicomCache}
        setDicomCache={setDicomCache}
        apiEndpoint={apiEndpoint}
        getAuthHeaders={getAuthHeaders}
        patientName={study?.patientName || 'Bệnh nhân'}
        modality={study?.modality || 'DICOM'}
      />
    </div>
  );
}
