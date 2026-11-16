import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { message, Alert, Button } from 'antd';
import { renderDicomToCanvas } from './services/dicomDecoder';
import { usePacsStudy } from './hooks/usePacsStudy';
import { usePacsThumbnails } from './hooks/usePacsThumbnails';
import { usePacsInteraction } from './hooks/usePacsInteraction';
import { usePacsPresentationState } from './hooks/usePacsPresentationState';
import PacsTopNav from './components/PacsTopNav';
import PacsSidebar from './components/PacsSidebar';
import PacsSeriesStrip from './components/PacsSeriesStrip';
import PacsSliceStrip from './components/PacsSliceStrip';
import PacsViewport from './components/PacsViewport';
import PacsMultiViewportGrid from './components/PacsMultiViewportGrid';
import PacsCaptureAlert from './components/PacsCaptureAlert';
import PacsUploadAlert from './components/PacsUploadAlert';
import PacsAttachmentViewer from './components/PacsAttachmentViewer';
import PacsMprModal from './components/PacsMprModal';
import { PACS_TOOLS, WW_WL_PRESETS } from './constants/pacs.constants';

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

  const [leftSeriesStripOpen, setLeftSeriesStripOpen] = useState(true);
  const [rightSliceStripOpen, setRightSliceStripOpen] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeAttachedFile, setActiveAttachedFile] = useState(null);
  const [mprOpen, setMprOpen] = useState(false);

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

  const [layout, setLayout] = useState('1x1');
  const [activeViewport, setActiveViewport] = useState(0);
  const [invert, setInvert] = useState(false);
  const [colorLut, setColorLut] = useState('default');
  const imageCanvasRef = useRef(null);
  const annotationCanvasRef = useRef(null);

  const { seriesThumbnails, sliceThumbnails } = usePacsThumbnails({
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
  });

  const { captureAlert, setCaptureAlert, handleCaptureKeyImage } = usePacsPresentationState({
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
  }, [hasFull, currentFull, currentPreview, currentIndex, instances, windowCenter, windowWidth, invert, colorLut, isSmooth]);

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
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleCaptureKeyImage, handleUndoAnnotation, stepSeriesSlice, handleApplyPreset, handleReset, setActiveTool, setCurrentDrawing, currentMeta?.modality]);

  // Đổi series -> về khung nhìn chuẩn (giữ nguyên số đo và WW/WL riêng của từng series)
  useEffect(() => {
    setPan({ x: 0, y: 0 });
    setZoom(1);
  }, [activeSeriesUid, setPan, setZoom]);

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
  };

  // Sidebar/TopNav: meta hiện tại (đủ để hiện preset DICOM, modality)
  const navMeta = currentMeta || (currentInstance ? { modality: currentInstance.modality, windowPresets: currentInstance.windowPresets || [] } : null);

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
      />

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
            onOpenMpr={handleOpenMpr}
            canBuild3D={canBuild3D}
            activeSeriesSliceCount={activeSeriesInstances.length}
          />
        )}

        {!isExpanded && (
          <PacsSeriesStrip
            isOpen={leftSeriesStripOpen}
            onToggleOpen={() => setLeftSeriesStripOpen((prev) => !prev)}
            seriesList={seriesList}
            activeSeriesUid={activeSeriesUid}
            onSelectSeries={(uid) => {
              setActiveAttachedFile(null);
              const target = seriesList.find((s) => s.seriesUid === uid);
              if (target?.instances?.length) {
                // Mở series ở lát giữa (thường là vùng giải phẫu chính)
                setCurrentIndex(target.instances[Math.floor((target.instances.length - 1) / 2)].globalIndex);
              }
              setActiveSeriesUid(uid);
            }}
            seriesThumbnails={seriesThumbnails}
            attachedFiles={study?.attachedFiles || []}
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
        ) : layout === '1x1' ? (
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
        ) : (
          <PacsMultiViewportGrid
            layout={layout}
            seriesList={seriesList}
            instances={instances}
            dicomCache={dicomCache}
            previewCache={previewCache}
            requestInstance={requestInstance}
            voiBySeries={voiBySeries}
            activeViewport={activeViewport}
            setActiveViewport={setActiveViewport}
            activeTool={activeTool}
            windowCenter={windowCenter}
            windowWidth={windowWidth}
            invert={invert}
            colorLut={colorLut}
            isSmooth={isSmooth}
            onToggleSmooth={() => setIsSmooth((p) => !p)}
            patientName={study?.dbPatient?.patientName || study?.patientName}
            patientId={study?.dbPatient?.patientId || study?.patientId}
            study={study}
            onMaximizeTo1x1={(seriesUid) => {
              const target = seriesList.find((s) => s.seriesUid === seriesUid);
              if (target?.instances?.length) setCurrentIndex(target.instances[0].globalIndex);
              setLayout('1x1');
            }}
          />
        )}

        {!activeAttachedFile && (
          <PacsSliceStrip
            isOpen={rightSliceStripOpen}
            onToggleOpen={() => setRightSliceStripOpen((prev) => !prev)}
            activeSeries={activeSeries}
            currentIndex={currentIndex}
            activeSlicePos={activeSlicePos}
            sliceThumbnails={sliceThumbnails}
            onSelectSlice={(globalIdx) => setCurrentIndex(globalIdx)}
          />
        )}
      </div>

      <PacsMprModal
        open={mprOpen}
        onClose={() => setMprOpen(false)}
        instances={activeSeriesInstances}
        dicomCache={dicomCache}
        setDicomCache={setDicomCache}
        apiEndpoint={apiEndpoint}
        getAuthHeaders={getAuthHeaders}
        patientName={study?.dbPatient?.patientName || currentMeta?.patientName || ''}
        modality={currentMeta?.modality || activeSeries?.modality || study?.modality || ''}
      />
    </div>
  );
}
