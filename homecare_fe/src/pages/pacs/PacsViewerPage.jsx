import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { message } from 'antd';
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

  useEffect(() => {
    if (seriesList.length > 0 && (!activeSeriesUid || !seriesList.some((s) => s.seriesUid === activeSeriesUid))) {
      setActiveSeriesUid(seriesList[0].seriesUid);
    }
  }, [seriesList, activeSeriesUid]);

  const activeSeries = useMemo(() => {
    if (!seriesList.length) return null;
    return seriesList.find((s) => s.seriesUid === activeSeriesUid) || seriesList[0];
  }, [seriesList, activeSeriesUid]);

  const activeSeriesIndices = useMemo(() => {
    if (activeSeries?.instances?.length) {
      return activeSeries.instances.map((inst) => inst.globalIndex);
    }
    return instances.map((_, idx) => idx);
  }, [activeSeries, instances]);

  const activeSeriesInstances = useMemo(() => activeSeries?.instances || [], [activeSeries]);
  const canBuild3D = activeSeriesInstances.length > 20;

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

  // Cine Loop Player
  const [isPlayingCine, setIsPlayingCine] = useState(false);
  const [cineFps, setCineFps] = useState(10);

  useEffect(() => {
    if (!isPlayingCine || activeSeriesIndices.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const curPos = activeSeriesIndices.indexOf(prev);
        const nextPos = (curPos + 1) % activeSeriesIndices.length;
        return activeSeriesIndices[nextPos];
      });
    }, Math.round(1000 / cineFps));
    return () => clearInterval(interval);
  }, [isPlayingCine, cineFps, activeSeriesIndices, setCurrentIndex]);

  const handleOpenMpr = useCallback(() => {
    if (activeSeriesInstances.length <= 20) {
      message.warning(
        `Nhóm đang chọn chỉ có ${activeSeriesInstances.length} ảnh. Cần trên 20 ảnh trong cùng 1 nhóm để dựng 3D / MPR.`
      );
      return;
    }
    setMprOpen(true);
  }, [activeSeriesInstances.length]);

  const [layout, setLayout] = useState('1x1');
  const [activeViewport, setActiveViewport] = useState(0);
  const [invert, setInvert] = useState(false);
  const [colorLut, setColorLut] = useState('default');
  const imageCanvasRef = useRef(null);
  const annotationCanvasRef = useRef(null);

  const { seriesThumbnails, setSeriesThumbnails, sliceThumbnails, setSliceThumbnails } = usePacsThumbnails({
    seriesList,
    activeSeries,
    dicomCache,
    setDicomCache,
    rightSliceStripOpen,
    apiEndpoint,
    getAuthHeaders,
  });

  const {
    activeTool,
    setActiveTool,
    zoom,
    setZoom,
    pan,
    setPan,
    rotation,
    setRotation,
    flipH,
    setFlipH,
    flipV,
    setFlipV,
    annotations,
    setAnnotations,
    isInteracting,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleWheel,
    handleZoomIn,
    handleZoomOut,
    handleResetZoom,
    handleDoubleClickZoom,
    handleReset,
    handleClearAnnotations,
    handleApplyPreset,
  } = usePacsInteraction({
    dicomCache,
    currentIndex,
    windowCenter,
    setWindowCenter,
    windowWidth,
    setWindowWidth,
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

  const {
    captureAlert,
    setCaptureAlert,
    handleCaptureKeyImage,
  } = usePacsPresentationState({
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
  });

  // Redraw DICOM Pixel Canvas
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

    const activeInst = instances[currentIndex];
    const ownerSeriesUid = activeInst?.seriesInstanceUid || 'default_series';
    if (!seriesThumbnails[ownerSeriesUid] || !sliceThumbnails[currentIndex]) {
      try {
        const dataUrl = canvas.toDataURL('image/jpeg', 0.65);
        if (!seriesThumbnails[ownerSeriesUid]) {
          setSeriesThumbnails((prev) => (prev[ownerSeriesUid] ? prev : { ...prev, [ownerSeriesUid]: dataUrl }));
        }
        if (!sliceThumbnails[currentIndex]) {
          setSliceThumbnails((prev) => (prev[currentIndex] ? prev : { ...prev, [currentIndex]: dataUrl }));
        }
      } catch (e) {}
    }
  }, [dicomCache, currentIndex, windowCenter, windowWidth, invert, colorLut, instances, seriesThumbnails, sliceThumbnails, setSeriesThumbnails, setSliceThumbnails]);

  // Keyboard Shortcuts: Space / Ctrl+S (Key Image), Arrows (Slices), 'I' (Invert), 'C' (Cine)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target?.tagName)) return;
      if (e.code === 'Space' || (e.ctrlKey && e.key.toLowerCase() === 's')) {
        e.preventDefault();
        handleCaptureKeyImage();
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        stepSeriesSlice(1);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        stepSeriesSlice(-1);
      } else if (e.key.toLowerCase() === 'i' && !e.ctrlKey && !e.altKey) {
        setInvert((prev) => !prev);
      } else if (e.key.toLowerCase() === 'c' && !e.ctrlKey && !e.altKey) {
        setIsPlayingCine((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleCaptureKeyImage, stepSeriesSlice, setInvert]);

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
        onReset={handleReset}
        onCaptureKeyImage={handleCaptureKeyImage}
        onApplyPreset={handleApplyPreset}
        currentMeta={currentMeta}
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
              setActiveSeriesUid(uid);
              const target = seriesList.find((s) => s.seriesUid === uid);
              if (target?.instances?.length) setCurrentIndex(target.instances[0].globalIndex);
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
            seriesIndex={activeSeries?.seriesIndex || 1}
            currentIndex={activeSlicePos}
            setCurrentIndex={(nextPos) => {
              const targetGlobal = activeSeriesIndices[nextPos];
              if (targetGlobal !== undefined) setCurrentIndex(targetGlobal);
            }}
            totalSlices={activeSeriesIndices.length}
            colorLut={colorLut}
            setColorLut={setColorLut}
            windowWidth={windowWidth}
            windowCenter={windowCenter}
            instancesCount={instances.length}
          />
        ) : (
          <PacsMultiViewportGrid
            layout={layout}
            seriesList={seriesList}
            instances={instances}
            dicomCache={dicomCache}
            activeViewport={activeViewport}
            setActiveViewport={setActiveViewport}
            activeTool={activeTool}
            windowCenter={windowCenter}
            windowWidth={windowWidth}
            invert={invert}
            colorLut={colorLut}
            patientName={study?.patientName}
            patientId={study?.patientId}
            study={study}
            onMaximizeTo1x1={(seriesUid) => {
              if (seriesUid) setActiveSeriesUid(seriesUid);
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
        patientName={currentMeta?.patientName || study?.dbPatient?.patientName || ''}
        modality={currentMeta?.modality || activeSeries?.modality || study?.modality || ''}
      />
    </div>
  );
}
