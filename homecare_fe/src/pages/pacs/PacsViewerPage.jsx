import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { message, Alert, Button, Drawer, Modal } from 'antd';
import { ArrowLeftOutlined, UserOutlined } from '@ant-design/icons';
import { renderDicomToCanvas } from './services/dicomDecoder';
import { usePacsStudy } from './hooks/usePacsStudy';
import { usePacsThumbnails } from './hooks/usePacsThumbnails';
import { usePacsInteraction } from './hooks/usePacsInteraction';
import { usePacsPresentationState } from './hooks/usePacsPresentationState';
import { useStableHandler } from './hooks/useStableHandler';
import PacsTopNav from './components/PacsTopNav';
import PacsSidebar from './components/PacsSidebar';
import './pacs.css';
import PacsSeriesStrip from './components/PacsSeriesStrip';
import PacsSliceStrip from './components/PacsSliceStrip';
import PacsViewport from './components/PacsViewport';
import PacsMultiViewportGrid from './components/PacsMultiViewportGrid';
import PacsCaptureAlert from './components/PacsCaptureAlert';
import PacsUploadAlert from './components/PacsUploadAlert';
import PacsAttachmentViewer from './components/PacsAttachmentViewer';
import PacsMprModal from './components/PacsMprModal';
import PacsHistogramModal from './components/PacsHistogramModal';
import PacsThresholdModal from './components/PacsThresholdModal';
import PacsKeyImageGalleryModal from './components/PacsKeyImageGalleryModal';
import PacsCropModal from './components/PacsCropModal';
import PacsReportingPanel from './components/PacsReportingPanel';
import { PACS_TOOLS, WW_WL_PRESETS } from './constants/pacs.constants';

const EMPTY_LIST = Object.freeze([]);

const seriesTitle = (inst, idx) => {
  if (inst.modality === 'NDCM' || inst.isNonDicom) return inst.seriesDescription || 'Ảnh nội soi / siêu âm (Non-DICOM)';
  const num = Number.isFinite(inst.seriesNumber) ? `S${inst.seriesNumber}` : `S${idx}`;
  return inst.seriesDescription ? `${num} · ${inst.seriesDescription}` : `${num} · ${inst.modality || 'DICOM'}`;
};

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

  const {
    loading,
    study,
    instances,
    legacyOrderKeys,
    currentIndex,
    setCurrentIndex,
    dicomCache,
    setDicomCache,
    previewCache,
    loadErrors,
    authError,
    requestInstance,
    windowCenter,
    setWindowCenter,
    windowWidth,
    setWindowWidth,
    voiSource,
    voiBySeries,
    setVoiBySeries,
    applyVoi,
    resetVoi,
    loadStudy,
    uploadDicom,
    uploadState,
    resetUploadState,
    getAuthHeaders,
  } = usePacsStudy(patientDiagnoseId, apiEndpoint);

  /* ---------------- Series ---------------- */
  const seriesList = useMemo(() => {
    if (!instances || instances.length === 0) return [];
    const map = new Map();
    instances.forEach((inst, idx) => {
      const key = inst.seriesInstanceUid || 'default_series';
      if (!map.has(key)) {
        map.set(key, {
          seriesUid: key,
          seriesIndex: map.size + 1,
          title: seriesTitle(inst, map.size + 1),
          modality: inst.modality,
          instances: [],
        });
      }
      map.get(key).instances.push({ ...inst, globalIndex: idx });
    });
    return Array.from(map.values());
  }, [instances]);

  const [activeSeriesUid, setActiveSeriesUid] = useState(null);
  const [isSmooth, setIsSmooth] = useState(true);

  // Series đang xem luôn theo lát hiện tại
  useEffect(() => {
    const uid = instances[currentIndex]?.seriesInstanceUid || seriesList[0]?.seriesUid || null;
    if (uid && uid !== activeSeriesUid) setActiveSeriesUid(uid);
  }, [instances, currentIndex, seriesList, activeSeriesUid]);

  const activeSeries = useMemo(() => {
    if (!seriesList.length) return null;
    return seriesList.find((s) => s.seriesUid === activeSeriesUid) || seriesList[0];
  }, [seriesList, activeSeriesUid]);

  const activeSeriesIndices = useMemo(() => {
    if (activeSeries?.instances?.length) return activeSeries.instances.map((inst) => inst.globalIndex);
    return instances.map((_, idx) => idx);
  }, [activeSeries, instances]);

  const activeSeriesInstances = useMemo(() => activeSeries?.instances || [], [activeSeries]);
  const canBuild3D = activeSeriesInstances.length > 20 && activeSeriesInstances.every((i) => (i.frameCount || 1) === 1);

  const activeSlicePos = useMemo(() => {
    const pos = activeSeriesIndices.indexOf(currentIndex);
    return pos >= 0 ? pos : 0;
  }, [activeSeriesIndices, currentIndex]);

  const stepSeriesSlice = useCallback(
    (delta) => {
      if (activeSeriesIndices.length <= 1) return;
      const pos = activeSeriesIndices.indexOf(currentIndex);
      const curPos = pos >= 0 ? pos : 0;
      const nextPos = Math.max(0, Math.min(activeSeriesIndices.length - 1, curPos + delta));
      setCurrentIndex(activeSeriesIndices[nextPos]);
    },
    [activeSeriesIndices, currentIndex, setCurrentIndex]
  );

  const navigate = useNavigate();
  const [reportingOpen, setReportingOpen] = useState(false);
  const [patientInfoOpen, setPatientInfoOpen] = useState(false);
  const [showOverlay, setShowOverlay] = useState(true);
  // Tỉ lệ bề rộng bảng báo cáo khi chia màn hình (kéo thanh ngăn để đổi)
  const [reportWidthPct, setReportWidthPct] = useState(44);
  const splitContainerRef = useRef(null);

  const onSplitMouseDown = useCallback((e) => {
    e.preventDefault();
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    const onMove = (ev) => {
      const el = splitContainerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const pct = ((rect.right - ev.clientX) / rect.width) * 100;
      setReportWidthPct(Math.max(25, Math.min(72, pct)));
    };
    const onUp = () => {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, []);
  const [leftNavDrawerOpen, setLeftNavDrawerOpen] = useState(false);

  const handleToggleReporting = useCallback(() => {
    if (!patientDiagnoseId) {
      message.info('Vui lòng mở ca từ Worklist để sử dụng chức năng đọc kết quả (reporting).');
      return;
    }
    setReportingOpen((prev) => {
      const next = !prev;
      if (next && window.innerWidth < 1600) {
        setRightSliceStripOpen(false);
      }
      return next;
    });
  }, [patientDiagnoseId]);

  // Callback ổn định cho bảng báo cáo memo hoá (không tạo mới mỗi lần re-render viewer)
  const handleCloseReporting = useCallback(() => setReportingOpen(false), []);
  const handleOpenPatientInfo = useCallback(() => setPatientInfoOpen(true), []);

  const [leftSeriesStripOpen, setLeftSeriesStripOpen] = useState(true);
  const [rightSliceStripOpen, setRightSliceStripOpen] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeAttachedFile, setActiveAttachedFile] = useState(null);
  const [mprOpen, setMprOpen] = useState(false);
  // MPR dựng thẳng trong viewport chính (tri-planar Axial/Coronal/Sagittal), khác với modal 3D
  const [mprInline, setMprInline] = useState(false);
  const [mprInitialLayout, setMprInitialLayout] = useState('2x2');

  /* ---------------- Cine ---------------- */
  const [isPlayingCine, setIsPlayingCine] = useState(false);
  const [cineFps, setCineFps] = useState(10);
  useEffect(() => {
    if (!isPlayingCine || activeSeriesIndices.length <= 1) return undefined;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const curPos = activeSeriesIndices.indexOf(prev);
        return activeSeriesIndices[(curPos + 1) % activeSeriesIndices.length];
      });
    }, Math.round(1000 / cineFps));
    return () => clearInterval(interval);
  }, [isPlayingCine, cineFps, activeSeriesIndices, setCurrentIndex]);

  const handleOpenMpr = useCallback(() => {
    if (!canBuild3D) {
      message.warning(`Series đang chọn có ${activeSeriesInstances.length} ảnh. Cần trên 20 lát cắt (1 frame/lát) trong cùng series để dựng MPR / 3D.`);
      return;
    }
    setMprOpen(true);
  }, [canBuild3D, activeSeriesInstances.length]);

  // Dựng MPR tri-planar ngay trong viewport chính (không mở popup)
  const handleReconstructMpr = useCallback(() => {
    if (!canBuild3D) {
      message.warning(`Series đang chọn có ${activeSeriesInstances.length} ảnh. Cần trên 20 lát cắt (1 frame/lát) trong cùng series để dựng MPR.`);
      return;
    }
    setActiveAttachedFile(null);
    setMprInline((prev) => !prev);
  }, [canBuild3D, activeSeriesInstances.length]);

  // Mở MPR inline tại một mặt cắt cụ thể (nút Axial/Coronal/Sagittal/2x2/3D ở sidebar)
  const handleMprPlane = useCallback(
    (plane) => {
      if (!canBuild3D) {
        message.warning(`Series đang chọn có ${activeSeriesInstances.length} ảnh. Cần trên 20 lát cắt (1 frame/lát) trong cùng series để dựng MPR.`);
        return;
      }
      setActiveAttachedFile(null);
      // Bấm lại đúng mặt đang mở -> thoát MPR
      if (mprInline && mprInitialLayout === plane) {
        setMprInline(false);
        return;
      }
      setMprInitialLayout(plane);
      setMprInline(true);
    },
    [canBuild3D, activeSeriesInstances.length, mprInline, mprInitialLayout]
  );

  // Series hiện tại không đủ lát để dựng -> tự thoát chế độ MPR inline
  useEffect(() => {
    if (mprInline && !canBuild3D) setMprInline(false);
  }, [mprInline, canBuild3D]);

  const [layout, setLayout] = useState('1x1');
  const [sync, setSync] = useState({ scroll: true, refLines: true, window: false, zoomPan: false });
  const changeSync = useCallback((patch) => setSync((prev) => ({ ...prev, ...patch })), []);
  const [activeViewport, setActiveViewport] = useState(0);
  const [invert, setInvert] = useState(false);
  const [colorLut, setColorLut] = useState('default');
  const [histogramOpen, setHistogramOpen] = useState(false);
  const [thresholdOpen, setThresholdOpen] = useState(false);
  const [activeThreshold, setActiveThreshold] = useState(null);
  const [keyImageGalleryOpen, setKeyImageGalleryOpen] = useState(false);
  const [cropOpen, setCropOpen] = useState(false);
  const imageCanvasRef = useRef(null);
  const annotationCanvasRef = useRef(null);

  // Ref để callback ghi nhật ký giữ identity ổn định (không re-render thanh công cụ mỗi lần cuộn lát)
  const instancesRef = useRef(instances);
  instancesRef.current = instances;
  const currentIndexRef = useRef(currentIndex);
  currentIndexRef.current = currentIndex;
  const activeSlicePosRef = useRef(activeSlicePos);
  activeSlicePosRef.current = activeSlicePos;

  // Ảnh bệnh nhân rời hệ thống (tải / in) -> ghi nhật ký thao tác trên máy chủ (không chặn thao tác)
  const logImageExport = useCallback(
    (kind) => {
      if (!patientDiagnoseId) return;
      const inst = instancesRef.current?.[currentIndexRef.current];
      fetch(`${apiEndpoint}/api/pacs/export-log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({
          patientDiagnoseId: Number(patientDiagnoseId),
          kind,
          sopInstanceUid: inst?.sopInstanceUid,
          sliceIndex: activeSlicePosRef.current + 1,
        }),
      }).catch(() => {});
    },
    [apiEndpoint, getAuthHeaders, patientDiagnoseId]
  );

  // Tải lát cắt hiện tại ra PNG
  const handleDownloadImage = useCallback(() => {
    const canvas = imageCanvasRef.current;
    if (!canvas) {
      message.warning('Chưa có ảnh để tải');
      return;
    }
    try {
      const link = document.createElement('a');
      link.download = `pacs_slice_${activeSlicePos + 1}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      logImageExport('download');
      message.success('Đã tải ảnh lát cắt');
    } catch {
      message.error('Không tải được ảnh');
    }
  }, [activeSlicePos, logImageExport]);

  // In lát cắt hiện tại
  const handlePrintImage = useCallback(() => {
    const canvas = imageCanvasRef.current;
    if (!canvas) {
      message.warning('Chưa có ảnh để in');
      return;
    }
    let url;
    try {
      url = canvas.toDataURL('image/png');
    } catch {
      message.error('Không in được ảnh');
      return;
    }
    const w = window.open('', '_blank');
    if (!w) {
      message.warning('Trình duyệt chặn cửa sổ in');
      return;
    }
    w.document.write(
      `<html><head><title>In ảnh PACS</title></head><body style="margin:0;display:flex;align-items:center;justify-content:center;background:#000"><img src="${url}" style="max-width:100%;max-height:100vh" onload="window.focus();window.print();" /></body></html>`
    );
    w.document.close();
    logImageExport('print');
  }, [logImageExport]);

  const { seriesThumbnails, sliceThumbnails } = usePacsThumbnails({
    caseId: patientDiagnoseId,
    seriesList,
    activeSeries,
    rightSliceStripOpen,
    apiEndpoint,
    getAuthHeaders,
    currentIndex,
  });

  const currentInstance = instances[currentIndex];
  const currentKey = currentInstance?.key;

  const {
    activeTool,
    setActiveTool,
    zoom,
    pan,
    setPan,
    setZoom,
    rotation,
    setRotation,
    flipH,
    setFlipH,
    flipV,
    setFlipV,
    annotations,
    setAnnotations,
    setCurrentDrawing,
    isInteracting,
    probe,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleMouseLeave,
    handleWheel,
    handleZoomIn,
    handleZoomOut,
    handleResetZoom,
    handleZoomActualPixels,
    handleDoubleClickZoom,
    handleReset,
    handleClearAnnotations,
    handleUndoAnnotation,
    handleApplyPreset,
  } = usePacsInteraction({
    dicomCache,
    currentIndex,
    currentKey,
    windowCenter,
    setWindowCenter,
    windowWidth,
    setWindowWidth,
    applyVoi,
    resetVoi,
    invert,
    setInvert,
    colorLut,
    setColorLut,
    activeSeriesIndices,
    stepSeriesSlice,
    imageCanvasRef,
    annotationCanvasRef,
    presentationStateKey: patientDiagnoseId ? `pacs_presentation_state_${patientDiagnoseId}` : null,
    redrawKey: layout,
  });

  const {
    captureAlert,
    setCaptureAlert,
    handleCaptureKeyImage,
    keyImages,
    handleDeleteKeyImage,
    handleClearAllKeyImages,
    handleToggleStarKeyImage,
    handleInsertToReport,
    saveStatus,
  } = usePacsPresentationState({
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
  });

  /* ---------------- Callback ổn định cho các dải ảnh (memo) ---------------- */
  const handleCopyMeasurements = useCallback(() => {
    const list = annotations[currentKey] || [];
    if (!list.length) {
      message.info('Lát cắt hiện tại chưa có số đo hoặc chú thích nào để sao chép');
      return;
    }
    const text = list
      .map((m, idx) => `${idx + 1}. ${m.type || 'Đo đạc'}: ${m.valueText || ''}`)
      .join('\n');
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
    }
    message.success(`Đã sao chép ${list.length} số đo vào bộ nhớ tạm!`);
  }, [annotations, currentKey]);

  const toggleLeftStrip = useCallback(() => setLeftSeriesStripOpen((prev) => !prev), []);
  const toggleRightStrip = useCallback(() => setRightSliceStripOpen((prev) => !prev), []);
  const handleSelectSeries = useCallback(
    (uid) => {
      setActiveAttachedFile(null);
      const target = seriesList.find((s) => s.seriesUid === uid);
      if (target?.instances?.length) {
        // Mở series ở lát giữa (thường là vùng giải phẫu chính)
        setCurrentIndex(target.instances[Math.floor((target.instances.length - 1) / 2)].globalIndex);
      }
      setActiveSeriesUid(uid);
    },
    [seriesList, setCurrentIndex]
  );

  /* ---------------- Handler ổn định cho TopNav & Sidebar (đã memo hoá) ----------------
   * Giữ IDENTITY cố định để 2 panel không re-render khi kéo WW/WL, pan, probe, cuộn lát.
   * useStableHandler đọc giá trị mới nhất qua ref -> không stale, không phá memo.
   */
  const stableReset = useStableHandler(handleReset);
  const stableApplyPreset = useStableHandler(handleApplyPreset);
  const stableZoomIn = useStableHandler(handleZoomIn);
  const stableZoomOut = useStableHandler(handleZoomOut);
  const stableResetZoom = useStableHandler(handleResetZoom);
  const stableClearAnnotations = useStableHandler(handleClearAnnotations);
  const stableCaptureKeyImage = useStableHandler(handleCaptureKeyImage);
  const stableUploadDicom = useStableHandler(uploadDicom);
  const stableCaptureStar = useCallback(() => stableCaptureKeyImage({ isStarred: true }), [stableCaptureKeyImage]);
  const toggleSmooth = useCallback(() => setIsSmooth((p) => !p), []);
  const toggleExpand = useCallback(() => setIsExpanded((prev) => !prev), []);
  const toggleCine = useCallback(() => setIsPlayingCine((prev) => !prev), []);
  const toggleOverlay = useCallback(() => setShowOverlay((v) => !v), []);
  const toggleReportingSidebar = useCallback(() => setReportingOpen((prev) => !prev), []);
  const openLeftNav = useCallback(() => setLeftNavDrawerOpen(true), []);
  const openKeyGallery = useCallback(() => setKeyImageGalleryOpen(true), []);
  const openHistogram = useCallback(() => setHistogramOpen(true), []);
  const openThreshold = useCallback(() => setThresholdOpen(true), []);
  const openCrop = useCallback(() => setCropOpen(true), []);
  const backWorklist = useCallback(() => navigate('/home'), [navigate]);
  const changeLayout = useCallback((k) => {
    setLayout(k);
    if (k === '1x1') setActiveViewport(0);
  }, []);

  /* ---------------- Vẽ ảnh ---------------- */
  const currentFull = dicomCache[currentIndex];
  const hasFull = !!(currentFull?.rawPixels && currentFull.decodeInfo?.ok !== false);
  const currentPreview = previewCache[currentIndex];
  const hasPreview = !hasFull && !!currentPreview;
  const currentMeta = currentFull?.meta;

  useEffect(() => {
    const canvas = imageCanvasRef.current;
    if (!canvas) return;
    if (hasFull) {
      renderDicomToCanvas(canvas, currentFull.rawPixels, currentFull.meta, {
        windowCenter,
        windowWidth,
        invert,
        colorLut,
        isSmooth,
        threshold: activeThreshold,
      });
      return;
    }
    const inst = instances[currentIndex];
    if (currentPreview && inst) {
      // Xem trước: vẽ giãn về đúng ma trận ảnh gốc để toạ độ khớp khi ảnh gốc thay thế
      renderDicomToCanvas(
        canvas,
        currentPreview,
        { rows: inst.rows || currentPreview.height, columns: inst.columns || currentPreview.width },
        { invert, isSmooth }
      );
      return;
    }
    // Chưa có dữ liệu cho lát này -> xoá trắng, KHÔNG để lại ảnh của lát trước dưới số lát mới
    const ctx = canvas.getContext('2d');
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
    // layout: chuyển 1x1 <-> lưới làm canvas được tạo mới -> vẽ lại
  }, [hasFull, currentFull, currentPreview, currentIndex, instances, windowCenter, windowWidth, invert, colorLut, isSmooth, activeThreshold, layout]);

  // Kích thước ma trận ảnh cho bố cục khung nhìn (có trước khi ảnh gốc về nhờ metadata máy chủ)
  const imageDims = useMemo(() => {
    if (currentMeta?.columns) {
      return { columns: currentMeta.columns, rows: currentMeta.rows, pixelSpacing: currentMeta.pixelSpacing };
    }
    if (currentInstance?.columns) {
      return { columns: currentInstance.columns, rows: currentInstance.rows, pixelSpacing: currentInstance.pixelSpacing || null };
    }
    if (currentPreview) return { columns: currentPreview.width, rows: currentPreview.height, pixelSpacing: null };
    return null;
  }, [currentMeta, currentInstance, currentPreview]);

  /* ---------------- Phím tắt ---------------- */
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target?.tagName) || e.target?.isContentEditable) return;
      // MPR đang mở (popup hoặc inline) -> phím tắt (A/C/S/V...) thuộc về MPR, không tác động viewer phía sau
      if (mprOpen || mprInline) return;
      const key = e.key.toLowerCase();
      if (e.code === 'Space' || (e.ctrlKey && key === 's')) {
        e.preventDefault();
        handleCaptureKeyImage();
      } else if (e.ctrlKey && key === 'z') {
        e.preventDefault();
        handleUndoAnnotation();
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        stepSeriesSlice(1);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        stepSeriesSlice(-1);
      } else if (e.key === 'PageDown') {
        e.preventDefault();
        stepSeriesSlice(10);
      } else if (e.key === 'PageUp') {
        e.preventDefault();
        stepSeriesSlice(-10);
      } else if (e.key === 'Home') {
        stepSeriesSlice(-100000);
      } else if (e.key === 'End') {
        stepSeriesSlice(100000);
      } else if (e.key === 'Escape') {
        setCurrentDrawing(null);
      } else if (e.ctrlKey || e.altKey || e.metaKey) {
        return;
      } else if (/^[1-9]$/.test(e.key) && currentMeta?.modality === 'CT') {
        const preset = WW_WL_PRESETS.find((p) => p.hotkey === e.key);
        if (preset) {
          handleApplyPreset(preset);
          message.info({ content: `Cửa sổ ${preset.label}: W ${preset.ww} / L ${preset.wl}`, key: 'pacs-preset', duration: 1.2 });
        }
      } else if (e.key === '0') {
        handleApplyPreset({ key: 'default' });
      } else if (key === 'i') {
        setInvert((prev) => !prev);
      } else if (key === 'b') {
        setIsSmooth((prev) => !prev);
      } else if (key === 'c') {
        setIsPlayingCine((prev) => !prev);
      } else if (key === 'r') {
        handleReset();
      } else if (key === 'l') {
        setActiveTool(PACS_TOOLS.LENGTH);
      } else if (key === 'a') {
        setActiveTool(PACS_TOOLS.ANGLE);
      } else if (key === 'e') {
        setActiveTool(PACS_TOOLS.ROI_ELLIPSE);
      } else if (key === 'w') {
        setActiveTool(PACS_TOOLS.WW_WL);
      } else if (key === 'p') {
        setActiveTool(PACS_TOOLS.PAN);
      } else if (key === 'm') {
        setActiveTool(PACS_TOOLS.MAGNIFY);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mprOpen, mprInline, handleCaptureKeyImage, handleUndoAnnotation, stepSeriesSlice, handleApplyPreset, handleReset, setActiveTool, setCurrentDrawing, currentMeta?.modality]);

  // Đổi series -> về khung nhìn chuẩn (giữ nguyên số đo và WW/WL riêng của từng series)
  // (Lưới nhiều ô tự quản khung nhìn từng ô -> không reset ở đây)
  const layoutRef = useRef(layout);
  layoutRef.current = layout;
  useEffect(() => {
    if (layoutRef.current !== '1x1') return;
    setPan({ x: 0, y: 0 });
    setZoom(1);
  }, [activeSeriesUid, setPan, setZoom]);

  // Khung nhìn của ô đang chọn (zoom/pan/xoay/lật) - lưới cất/nạp khi đổi ô
  const activeView = useMemo(() => ({ zoom, pan, rotation, flipH, flipV }), [zoom, pan, rotation, flipH, flipV]);
  const applyActiveView = useCallback(
    (v) => {
      setZoom(v.zoom ?? 1);
      setPan(v.pan || { x: 0, y: 0 });
      setRotation(v.rotation || 0);
      setFlipH(!!v.flipH);
      setFlipV(!!v.flipV);
    },
    [setZoom, setPan, setRotation, setFlipH, setFlipV]
  );

  const seriesLabel = activeSeries ? activeSeries.title : '';
  const overlayProps = {
    meta: currentMeta,
    instance: currentInstance,
    study,
    hasFull,
    hasPreview,
    loadError: loadErrors[currentIndex] && !(currentFull?.decodeInfo?.ok === false) ? loadErrors[currentIndex] : null,
    decodeInfo: currentFull?.decodeInfo?.ok === false ? currentFull.decodeInfo : null,
    seriesLabel,
    slicePos: activeSlicePos,
    sliceTotal: activeSeriesIndices.length,
    windowCenter,
    windowWidth,
    voiSource,
    invert,
    probe,
    measurementCount: (annotations[currentKey] || []).length,
    saveStatus,
    showOverlay,
  };

  // Sidebar/TopNav: meta hiện tại (đủ để hiện preset DICOM, modality). Memo hoá -> giữ identity
  // ổn định khi kéo WW/WL / pan (currentMeta không đổi) để TopNav memo không re-render.
  const navMeta = useMemo(
    () => currentMeta || (currentInstance ? { modality: currentInstance.modality, windowPresets: currentInstance.windowPresets || [] } : null),
    [currentMeta, currentInstance]
  );

  // Thông tin BN theo 2 nguồn riêng: hệ thống HomeCare (DB) và ảnh DICOM
  const patientInfo = useMemo(() => {
    const db = study?.dbPatient || {};
    const m = currentMeta || {};
    // Một số tag DICOM (vd Cơ sở) có thể là chuỗi mã hóa -> chỉ hiện nếu là văn bản sạch
    const cleanText = (v) => (v && /^[\p{L}\p{N}\s.,\-()]+$/u.test(v) ? v : null);
    const dash = (v) => (v || v === 0 ? v : '—');
    const homecare = [
      { label: 'Họ tên', value: dash(db.patientName) },
      { label: 'Mã BN (PID)', value: dash(db.patientId) },
      { label: 'Giới tính / Tuổi', value: [db.patientGender, db.patientAge].filter(Boolean).join(' · ') || '—' },
      { label: 'Năm sinh', value: dash(db.patientBirthYear) },
      { label: 'Ngày tạo ca', value: dash(db.studyDate || study?.studyDate) },
    ];
    const dicom = [
      { label: 'Họ tên', value: dash(m.patientName) },
      { label: 'Mã BN (PID)', value: dash(m.patientId) },
      { label: 'Giới tính / Tuổi', value: [m.patientSex, m.patientAge].filter(Boolean).join(' · ') || '—' },
      { label: 'Ngày sinh', value: dash(m.patientBirthDate) },
      { label: 'Ngày chụp', value: [m.studyDate, m.studyTime].filter(Boolean).join(' ') || '—' },
      { label: 'Modality', value: dash(m.modality || activeSeries?.modality) },
      { label: 'Mô tả ca chụp', value: dash(m.studyDescription) },
      { label: 'Accession', value: dash(m.accessionNumber) },
      { label: 'Cơ sở chụp', value: dash(cleanText(m.institutionName)) },
      { label: 'Số series / ảnh', value: `${seriesList.length} series · ${instances.length} ảnh` },
    ];
    return { homecare, dicom };
  }, [study, currentMeta, activeSeries, seriesList.length, instances.length]);

  const mainViewportElement = (
    <PacsViewport
        viewportIndex={layout === '1x1' ? 0 : activeViewport}
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
        isSmooth={isSmooth}
        activeTool={activeTool}
        setActiveTool={setActiveTool}
        isInteracting={isInteracting}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onWheel={handleWheel}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onZoomActualPixels={handleZoomActualPixels}
        onUndo={handleUndoAnnotation}
        onDoubleClickZoom={handleDoubleClickZoom}
        isExpanded={isExpanded}
      compact={layout !== '1x1'}
        onToggleExpand={() => setIsExpanded((prev) => !prev)}
        onCaptureKeyImage={handleCaptureKeyImage}
        onOpenCrop={() => setCropOpen(true)}
        onUploadDicom={uploadDicom}
        patientDiagnoseId={patientDiagnoseId}
        currentIndex={activeSlicePos}
        setCurrentIndex={(nextPos) => {
          const targetGlobal = activeSeriesIndices[nextPos];
          if (targetGlobal !== undefined) setCurrentIndex(targetGlobal);
        }}
        totalSlices={activeSeriesIndices.length}
        instancesCount={instances.length}
        imageDims={imageDims}
        overlayProps={overlayProps}
      />
  );

  return (
    <div
      className="pacs-root"
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
      <PacsCaptureAlert
        open={captureAlert.open}
        onClose={() => setCaptureAlert((prev) => ({ ...prev, open: false }))}
        dataUrl={captureAlert.dataUrl}
        caption={captureAlert.caption}
        sliceIndex={captureAlert.sliceIndex}
        totalSlices={captureAlert.totalSlices}
        isStarred={captureAlert.isStarred}
        isCrop={captureAlert.isCrop}
        patientDiagnoseId={patientDiagnoseId}
      />

      <PacsUploadAlert
        status={uploadState.status}
        fileName={uploadState.fileName}
        fileSize={uploadState.fileSize}
        progress={uploadState.progress}
        message={uploadState.message}
        details={uploadState.details}
        onClose={resetUploadState}
      />

      <PacsTopNav
        activeTool={activeTool}
        setActiveTool={setActiveTool}
        invert={invert}
        setInvert={setInvert}
        rotation={rotation}
        setRotation={setRotation}
        isSmooth={isSmooth}
        onToggleSmooth={toggleSmooth}
        onReset={stableReset}
        onCaptureKeyImage={stableCaptureKeyImage}
        onApplyPreset={stableApplyPreset}
        currentMeta={navMeta}
        onOpenMpr={handleOpenMpr}
        canBuild3D={canBuild3D}
        activeSeriesSliceCount={activeSeriesInstances.length}
        onUploadDicom={stableUploadDicom}
        zoom={zoom}
        onZoomIn={stableZoomIn}
        onZoomOut={stableZoomOut}
        onResetZoom={stableResetZoom}
        isExpanded={isExpanded}
        onToggleExpand={toggleExpand}
        isPlayingCine={isPlayingCine}
        onToggleCine={toggleCine}
        cineFps={cineFps}
        onChangeCineFps={setCineFps}
        totalSlices={activeSeriesIndices.length}
        onBackWorklist={backWorklist}
        reportingOpen={reportingOpen}
        onToggleReporting={handleToggleReporting}
        onToggleLeftNav={openLeftNav}
        onOpenKeyImageGallery={openKeyGallery}
        keyImageCount={keyImages?.length || 0}
      />

      {(saveStatus?.state === 'error' || saveStatus?.state === 'offline-restore') && (
        <Alert type={saveStatus.state === 'error' ? 'error' : 'warning'} showIcon banner message={saveStatus.message} />
      )}

      {authError && (
        <Alert
          type="error"
          showIcon
          banner
          message="Phiên đăng nhập đã hết hạn - không tải được ảnh từ máy chủ PACS."
          action={
            <Button size="small" danger onClick={() => (window.location.href = '/login')}>
              Đăng nhập lại
            </Button>
          }
        />
      )}

      <div ref={splitContainerRef} style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <div
          style={{
            display: 'flex',
            flex: reportingOpen && patientDiagnoseId ? '1 1 0%' : '1 1 100%',
            minWidth: 0,
            overflow: 'hidden',
          }}
        >
          {!isExpanded && (
            <PacsSidebar
              study={study}
              currentMeta={activeAttachedFile ? null : currentMeta}
              instances={instances}
              currentIndex={currentIndex}
              activeSliceIndex={activeSlicePos}
              activeSeriesTotal={activeSeriesIndices.length}
              patientDiagnoseId={patientDiagnoseId}
              layout={layout}
              setLayout={changeLayout}
              activeTool={activeTool}
              setActiveTool={setActiveTool}
              onClearAnnotations={stableClearAnnotations}
              onCopyMeasurements={handleCopyMeasurements}
              onUploadDicom={stableUploadDicom}
              onReloadStudy={loadStudy}
              flipH={flipH}
              setFlipH={setFlipH}
              flipV={flipV}
              setFlipV={setFlipV}
              rotation={rotation}
              setRotation={setRotation}
              onReset={stableReset}
              onApplyPreset={stableApplyPreset}
              onOpenMpr={handleOpenMpr}
              onReconstructMpr={handleReconstructMpr}
              onMprPlane={handleMprPlane}
              mprInline={mprInline}
              mprInitialLayout={mprInitialLayout}
              canBuild3D={canBuild3D}
              activeSeriesSliceCount={activeSeriesInstances.length}
              sync={sync}
              onChangeSync={changeSync}
              invert={invert}
              setInvert={setInvert}
              colorLut={colorLut}
              setColorLut={setColorLut}
              onOpenHistogram={openHistogram}
              onOpenThreshold={openThreshold}
              activeThreshold={activeThreshold}
              isSmooth={isSmooth}
              onToggleSmooth={toggleSmooth}
              onZoomIn={stableZoomIn}
              onZoomOut={stableZoomOut}
              onCaptureKeyImage={stableCaptureKeyImage}
              onCaptureStarKeyImage={stableCaptureStar}
              onOpenCrop={openCrop}
              onOpenKeyImageGallery={openKeyGallery}
              onDownloadImage={handleDownloadImage}
              onPrintImage={handlePrintImage}
              showOverlay={showOverlay}
              onToggleOverlay={toggleOverlay}
              onOpenWorklist={openLeftNav}
              onOpenPatientInfo={handleOpenPatientInfo}
              reportingOpen={reportingOpen}
              onToggleReporting={toggleReportingSidebar}
              rightSliceStripOpen={rightSliceStripOpen}
              onToggleSliceStrip={toggleRightStrip}
            />
          )}

          {!isExpanded && (
            <PacsSeriesStrip
              isOpen={leftSeriesStripOpen}
              onToggleOpen={toggleLeftStrip}
              seriesList={seriesList}
              activeSeriesUid={activeSeriesUid}
              onSelectSeries={handleSelectSeries}
              seriesThumbnails={seriesThumbnails}
              attachedFiles={study?.attachedFiles || EMPTY_LIST}
              activeAttachedFile={activeAttachedFile}
              onSelectAttachedFile={setActiveAttachedFile}
            />
          )}

          {activeAttachedFile ? (
            <PacsAttachmentViewer
              file={activeAttachedFile}
              onClose={() => setActiveAttachedFile(null)}
              apiEndpoint={apiEndpoint}
            />
          ) : mprInline && canBuild3D ? (
            <PacsMprModal
              inline
              initialLayout={mprInitialLayout}
              onClose={() => setMprInline(false)}
              instances={activeSeriesInstances}
              dicomCache={dicomCache}
              setDicomCache={setDicomCache}
              apiEndpoint={apiEndpoint}
              getAuthHeaders={getAuthHeaders}
              caseId={patientDiagnoseId}
              patientName={study?.dbPatient?.patientName || currentMeta?.patientName || ''}
              modality={currentMeta?.modality || activeSeries?.modality || study?.modality || ''}
            />
          ) : layout === '1x1' ? (
            mainViewportElement
          ) : (
            <PacsMultiViewportGrid
              layout={layout}
              seriesList={seriesList}
              dicomCache={dicomCache}
              previewCache={previewCache}
              requestInstance={requestInstance}
              voiBySeries={voiBySeries}
              setVoiBySeries={setVoiBySeries}
              activeViewport={activeViewport}
              setActiveViewport={setActiveViewport}
              invert={invert}
              colorLut={colorLut}
              isSmooth={isSmooth}
              currentIndex={currentIndex}
              onActiveSliceChange={setCurrentIndex}
              sync={sync}
              annotations={annotations}
              activeView={activeView}
              onActiveViewChange={applyActiveView}
              activeViewportElement={mainViewportElement}
              onMaximize={(globalIdx, view) => {
                setCurrentIndex(globalIdx);
                setActiveViewport(0);
                setLayout('1x1');
                if (view) applyActiveView(view);
              }}
            />
          )}

          {!activeAttachedFile && (
            <PacsSliceStrip
              isOpen={rightSliceStripOpen}
              onToggleOpen={toggleRightStrip}
              activeSeries={activeSeries}
              currentIndex={currentIndex}
              activeSlicePos={activeSlicePos}
              sliceThumbnails={sliceThumbnails}
              onSelectSlice={setCurrentIndex}
            />
          )}
        </div>

        {/* Thanh kéo đổi tỉ lệ chia màn hình */}
        {reportingOpen && patientDiagnoseId && (
          <div
            onMouseDown={onSplitMouseDown}
            title="Kéo để đổi tỉ lệ chia màn hình"
            className="pacs-split-handle"
            style={{
              flex: '0 0 6px',
              cursor: 'col-resize',
              background: '#1e293b',
              zIndex: 11,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div style={{ width: 2, height: 36, borderRadius: 2, background: '#475569' }} />
          </div>
        )}

        {/* Bảng đọc kết quả chia đôi màn hình (memo hoá -> không re-render khi thao tác ảnh) */}
        {reportingOpen && patientDiagnoseId && (
          <div
            style={{
              flex: `0 0 ${reportWidthPct}%`,
              minWidth: 340,
              maxWidth: '72%',
              display: 'flex',
              flexDirection: 'column',
              borderLeft: '2px solid #1e293b',
              boxShadow: '-4px 0 16px rgba(0,0,0,0.25)',
              zIndex: 10,
              overflow: 'hidden',
            }}
          >
            <PacsReportingPanel
              patientDiagnoseId={patientDiagnoseId}
              patientName={study?.dbPatient?.patientName || ''}
              onClose={handleCloseReporting}
              onOpenPatientInfo={handleOpenPatientInfo}
            />
          </div>
        )}
      </div>

      <Drawer
        placement="left"
        open={leftNavDrawerOpen}
        onClose={() => setLeftNavDrawerOpen(false)}
        width={260}
        styles={{ body: { padding: '12px 16px', background: '#f8fafc' } }}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <img src="/logo_home_care.png" alt="Logo" style={{ width: 28, height: 28, borderRadius: 6 }} />
            <span style={{ fontWeight: 700, fontSize: 14, color: '#0b6b4f' }}>RADIOLOGY · D-RADS</span>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Button
            type="primary"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/home')}
            style={{ width: '100%', backgroundColor: '#0b6b4f', borderColor: '#0b6b4f', fontWeight: 600 }}
          >
            Quay về Worklist
          </Button>
          <div style={{ height: 1, background: '#e2e8f0', margin: '8px 0' }} />
          <Button
            type="default"
            onClick={() => {
              navigate('/home');
              setLeftNavDrawerOpen(false);
            }}
            style={{ textAlign: 'left', width: '100%' }}
          >
            Danh sách ca bệnh (Worklist)
          </Button>
          <Button
            type="default"
            onClick={() => {
              navigate('/home/clinics');
              setLeftNavDrawerOpen(false);
            }}
            style={{ textAlign: 'left', width: '100%' }}
          >
            Quản lý phòng khám
          </Button>
          <Button
            type="default"
            onClick={() => {
              navigate('/home/templates-print');
              setLeftNavDrawerOpen(false);
            }}
            style={{ textAlign: 'left', width: '100%' }}
          >
            Mẫu in kết quả
          </Button>
        </div>
      </Drawer>

      <PacsMprModal
        open={mprOpen}
        onClose={() => setMprOpen(false)}
        instances={activeSeriesInstances}
        dicomCache={dicomCache}
        setDicomCache={setDicomCache}
        apiEndpoint={apiEndpoint}
        getAuthHeaders={getAuthHeaders}
        caseId={patientDiagnoseId}
        patientName={study?.dbPatient?.patientName || currentMeta?.patientName || ''}
        modality={currentMeta?.modality || activeSeries?.modality || study?.modality || ''}
      />

      <Modal
        open={patientInfoOpen}
        onCancel={() => setPatientInfoOpen(false)}
        footer={null}
        width={460}
        title={
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <UserOutlined style={{ color: '#2563eb' }} />
            Thông tin bệnh nhân &amp; ca chụp
          </span>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            { key: 'hc', title: 'Theo hệ thống HomeCare (ca bệnh)', color: '#0b6b4f', rows: patientInfo.homecare },
            { key: 'dc', title: 'Theo dữ liệu DICOM (ảnh chụp)', color: '#2563eb', rows: patientInfo.dicom },
          ].map((grp) => (
            <div key={grp.key}>
              <div style={{ fontSize: 12, fontWeight: 700, color: grp.color, textTransform: 'uppercase', letterSpacing: 0.3, marginBottom: 4 }}>
                {grp.title}
              </div>
              {grp.rows.map((row) => (
                <div
                  key={row.label}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 16,
                    padding: '6px 2px',
                    borderBottom: '1px solid #f1f5f9',
                    fontSize: 13,
                  }}
                >
                  <span style={{ color: '#64748b', flexShrink: 0 }}>{row.label}</span>
                  <span style={{ color: '#0f172a', fontWeight: 600, textAlign: 'right', wordBreak: 'break-word' }}>{row.value}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </Modal>

      <PacsHistogramModal
        open={histogramOpen}
        onClose={() => setHistogramOpen(false)}
        rawPixels={currentFull?.rawPixels}
        meta={currentFull?.meta || currentMeta}
        windowCenter={windowCenter}
        windowWidth={windowWidth}
        onApplyWwWl={({ width, center }) => {
          setWindowWidth(width);
          setWindowCenter(center);
        }}
      />

      <PacsThresholdModal
        open={thresholdOpen}
        onClose={() => setThresholdOpen(false)}
        activeThreshold={activeThreshold}
        onSelectThreshold={(t) => setActiveThreshold(t)}
      />

      <PacsKeyImageGalleryModal
        open={keyImageGalleryOpen}
        onClose={() => setKeyImageGalleryOpen(false)}
        keyImages={keyImages}
        onDeleteKeyImage={handleDeleteKeyImage}
        onClearAllKeyImages={handleClearAllKeyImages}
        onToggleStarKeyImage={handleToggleStarKeyImage}
        onInsertToReport={handleInsertToReport}
        onCaptureCurrentSlice={handleCaptureKeyImage}
        onOpenCrop={() => {
          setKeyImageGalleryOpen(false);
          setCropOpen(true);
        }}
        currentSliceIndex={currentIndex + 1}
        totalSlices={instances.length}
      />

      <PacsCropModal
        open={cropOpen}
        onClose={() => setCropOpen(false)}
        imageCanvas={imageCanvasRef.current}
        annotationCanvas={annotationCanvasRef.current}
        metadata={{
          patientName: dicomCache[currentIndex]?.meta?.patientName || study?.dbPatient?.patientName || '',
          patientId: dicomCache[currentIndex]?.meta?.patientId || study?.dbPatient?.patientId || '',
        }}
        currentIndex={currentIndex}
        totalSlices={instances.length}
        windowCenter={windowCenter}
        windowWidth={windowWidth}
        pixelSpacing={currentMeta?.pixelSpacing || currentInstance?.pixelSpacing || null}
        onSaveCrop={(cropData) => handleCaptureKeyImage(cropData)}
      />
    </div>
  );
}
