import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { message, Alert, Button, Drawer } from 'antd';
import { CloseOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import DoctorUseDFormVer3 from '../formver3/doctor_use_formver3/use/DoctorIUseFormVer3';
import { renderDicomToCanvas } from './services/dicomDecoder';
import { usePacsStudy } from './hooks/usePacsStudy';
import { usePacsThumbnails } from './hooks/usePacsThumbnails';
import { usePacsInteraction } from './hooks/usePacsInteraction';
import { usePacsPresentationState } from './hooks/usePacsPresentationState';
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

  const [leftSeriesStripOpen, setLeftSeriesStripOpen] = useState(true);
  const [rightSliceStripOpen, setRightSliceStripOpen] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeAttachedFile, setActiveAttachedFile] = useState(null);
  const [mprOpen, setMprOpen] = useState(false);
  // MPR dựng thẳng trong viewport chính (tri-planar Axial/Coronal/Sagittal), khác với modal 3D
  const [mprInline, setMprInline] = useState(false);

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
  const imageCanvasRef = useRef(null);
  const annotationCanvasRef = useRef(null);

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

  const { captureAlert, setCaptureAlert, handleCaptureKeyImage, saveStatus } = usePacsPresentationState({
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
  }, [hasFull, currentFull, currentPreview, currentIndex, instances, windowCenter, windowWidth, invert, colorLut, isSmooth, layout]);

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
  };

  // Sidebar/TopNav: meta hiện tại (đủ để hiện preset DICOM, modality)
  const navMeta = currentMeta || (currentInstance ? { modality: currentInstance.modality, windowPresets: currentInstance.windowPresets || [] } : null);

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
        onToggleSmooth={() => setIsSmooth((p) => !p)}
        onReset={handleReset}
        onCaptureKeyImage={handleCaptureKeyImage}
        onApplyPreset={handleApplyPreset}
        currentMeta={navMeta}
        onOpenMpr={handleOpenMpr}
        canBuild3D={canBuild3D}
        activeSeriesSliceCount={activeSeriesInstances.length}
        onUploadDicom={uploadDicom}
        zoom={zoom}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetZoom={handleResetZoom}
        isExpanded={isExpanded}
        onToggleExpand={() => setIsExpanded((prev) => !prev)}
        isPlayingCine={isPlayingCine}
        onToggleCine={() => setIsPlayingCine((prev) => !prev)}
        cineFps={cineFps}
        onChangeCineFps={setCineFps}
        totalSlices={activeSeriesIndices.length}
        onBackWorklist={() => navigate('/home')}
        reportingOpen={reportingOpen}
        onToggleReporting={handleToggleReporting}
        onToggleLeftNav={() => setLeftNavDrawerOpen(true)}
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

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <div
          style={{
            display: 'flex',
            flex: reportingOpen ? '1 1 52%' : '1 1 100%',
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
              setLayout={(k) => {
                setLayout(k);
                if (k === '1x1') setActiveViewport(0);
              }}
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
              onOpenMpr={handleOpenMpr}
              onReconstructMpr={handleReconstructMpr}
              mprInline={mprInline}
              canBuild3D={canBuild3D}
              activeSeriesSliceCount={activeSeriesInstances.length}
              sync={sync}
              onChangeSync={changeSync}
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
              token={localStorage.getItem('TOKEN') || ''}
            />
          ) : mprInline && canBuild3D ? (
            <PacsMprModal
              inline
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

        {/* Bảng đọc kết quả chia đôi màn hình */}
        {reportingOpen && patientDiagnoseId && (
          <div
            style={{
              flex: '0 0 48%',
              minWidth: 420,
              maxWidth: '55%',
              display: 'flex',
              flexDirection: 'column',
              background: '#ffffff',
              borderLeft: '2px solid #1e293b',
              boxShadow: '-4px 0 16px rgba(0,0,0,0.25)',
              zIndex: 10,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 14px',
                background: '#0b101b',
                borderBottom: '1px solid #1e293b',
                color: '#f8fafc',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontWeight: 700, fontSize: '13px', color: '#38bdf8' }}>
                  BÁO CÁO KẾT QUẢ CHẨN ĐOÁN (D-RADS)
                </span>
                {study?.dbPatient?.patientName && (
                  <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                    · {study.dbPatient.patientName}
                  </span>
                )}
              </div>
              <Button
                size="small"
                type="text"
                icon={<CloseOutlined />}
                onClick={() => setReportingOpen(false)}
                style={{ color: '#94a3b8' }}
              >
                Thu gọn
              </Button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px' }}>
              <DoctorUseDFormVer3
                patient_diagnose_id={patientDiagnoseId}
                isUse={true}
                initEditMode={true}
                isSplitScreen={true}
              />
            </div>
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
    </div>
  );
}
