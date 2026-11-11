import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { message } from 'antd';
import { renderDicomToCanvas } from './services/dicomDecoder';
import { usePacsStudy } from './hooks/usePacsStudy';
import PacsTopNav from './components/PacsTopNav';
import PacsSidebar from './components/PacsSidebar';
import PacsSeriesStrip from './components/PacsSeriesStrip';
import PacsViewport from './components/PacsViewport';
import PacsCaptureAlert from './components/PacsCaptureAlert';
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

  const apiEndpoint = import.meta.env.VITE_API_ENDPOINT || 'http://localhost:3001';

  // Custom hook: Data access and DICOM loading
  const {
    loading,
    study,
    instances,
    currentIndex,
    setCurrentIndex,
    dicomCache,
    windowCenter,
    setWindowCenter,
    windowWidth,
    setWindowWidth,
    loadStudy,
    uploadDicom,
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

  // Thumbnail URL generated from active DICOM canvas for the series card
  const [seriesThumbnailUrl, setSeriesThumbnailUrl] = useState('');

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
  // Persist doctor's annotations & display parameters across page reloads without modifying raw DICOM files
  const presentationStateKey = patientDiagnoseId ? `pacs_presentation_state_${patientDiagnoseId}` : null;

  // Restore presentation state on load
  useEffect(() => {
    if (!presentationStateKey) return;
    try {
      const saved = localStorage.getItem(presentationStateKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.annotations && typeof parsed.annotations === 'object') {
          setAnnotations(parsed.annotations);
        }
        if (parsed.windowCenter !== undefined) setWindowCenter(parsed.windowCenter);
        if (parsed.windowWidth !== undefined) setWindowWidth(parsed.windowWidth);
        if (parsed.colorLut) setColorLut(parsed.colorLut);
        if (parsed.invert !== undefined) setInvert(parsed.invert);
      }
    } catch (e) {
      console.warn('Lỗi khôi phục trạng thái đo đạc (Presentation State):', e);
    }
  }, [presentationStateKey, setWindowCenter, setWindowWidth]);

  // Auto-save presentation state when annotations or WW/WL change
  useEffect(() => {
    if (!presentationStateKey) return;
    try {
      const stateToSave = {
        annotations,
        windowCenter,
        windowWidth,
        colorLut,
        invert,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem(presentationStateKey, JSON.stringify(stateToSave));
    } catch (e) {
      console.warn('Lỗi tự động lưu trạng thái đo đạc:', e);
    }
  }, [presentationStateKey, annotations, windowCenter, windowWidth, colorLut, invert]);

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

    // Update series thumbnail from canvas
    if (currentIndex === 0 || !seriesThumbnailUrl) {
      try {
        setSeriesThumbnailUrl(canvas.toDataURL('image/jpeg', 0.7));
      } catch (e) {
        // ignore
      }
    }
  }, [dicomCache, currentIndex, windowCenter, windowWidth, invert, colorLut, seriesThumbnailUrl]);

  // Redraw Overlay Annotations Canvas
  useEffect(() => {
    const canvas = annotationCanvasRef.current;
    const currentData = dicomCache[currentIndex];
    if (!canvas || !currentData) return;

    renderAnnotationsToCanvas(
      canvas,
      annotations[currentIndex] || [],
      currentDrawing,
      currentData.meta
    );
  }, [annotations, currentDrawing, currentIndex, dicomCache]);

  // Convert Viewport Mouse Coordinates to DICOM Canvas Space
  const getCanvasCoordinates = (e) => {
    const canvas = imageCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: Math.round((e.clientX - rect.left) * scaleX),
      y: Math.round((e.clientY - rect.top) * scaleY),
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
      setAnnotations((prev) => ({
        ...prev,
        [currentIndex]: [...(prev[currentIndex] || []), currentDrawing],
      }));
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
    setAnnotations((prev) => ({ ...prev, [currentIndex]: [] }));
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
      />

      {/* Main Body */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Column 1: Left Tool Sidebar */}
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

        {/* Column 2: Series & Files Strip (As in Image 2 - Supports Multiple Files/Series) */}
        <PacsSeriesStrip
          seriesList={seriesList}
          activeSeriesUid={activeSeriesUid}
          onSelectSeries={(uid) => {
            setActiveAttachedFile(null);
            handleSelectSeries(uid);
          }}
          thumbnailUrl={seriesThumbnailUrl}
          attachedFiles={study?.attachedFiles || []}
          activeAttachedFile={activeAttachedFile}
          onSelectAttachedFile={(file) => {
            setActiveAttachedFile(file);
          }}
        />

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
        patientName={study?.patientName || 'Lê Văn Út'}
        modality={study?.modality || 'MR'}
      />
      </div>
    </div>
  );
}
