import { useState, useRef, useEffect, useCallback } from 'react';
import { message } from 'antd';
import { PACS_TOOLS } from '../constants/pacs.constants';
import {
  calculateDistance,
  calculateAngle,
  calculateEllipseArea,
  calculateRectArea,
  formatMeasurement,
} from '../utils/measurement.utils';
import { renderAnnotationsToCanvas } from '../utils/annotation.renderer';

export function usePacsInteraction({
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
  presentationStateKey,
}) {
  const [activeTool, setActiveTool] = useState(PACS_TOOLS.LENGTH);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);

  // Annotations per slice: { [sliceIndex]: Array<Measurement> }
  const [annotations, setAnnotations] = useState({});
  const [currentDrawing, setCurrentDrawing] = useState(null);

  useEffect(() => {
    setCurrentDrawing(null);
  }, [activeTool, currentIndex]);

  // Interaction tracking refs
  const isInteracting = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });
  const startPan = useRef({ x: 0, y: 0 });
  const startWW = useRef({ ww: 255, wl: 128 });

  // Redraw Vector Annotations on the dedicated transparent overlay canvas
  useEffect(() => {
    const canvas = annotationCanvasRef.current;
    const currentData = dicomCache[currentIndex];
    if (!canvas || !currentData) return;

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
  }, [annotations, currentDrawing, currentIndex, dicomCache, annotationCanvasRef]);

  // Convert Viewport Mouse Coordinates to DICOM Canvas Space with inverse transform
  const getCanvasCoordinates = useCallback(
    (e) => {
      const canvas = imageCanvasRef.current;
      if (!canvas) return { x: 0, y: 0 };

      const rect = canvas.getBoundingClientRect();
      const W = canvas.width || 512;
      const H = canvas.height || 512;

      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const dx = e.clientX - centerX;
      const dy = e.clientY - centerY;

      const rad = (-rotation * Math.PI) / 180;
      const cosA = Math.cos(rad);
      const sinA = Math.sin(rad);
      let unrotX = dx * cosA - dy * sinA;
      let unrotY = dx * sinA + dy * cosA;

      if (flipH) unrotX = -unrotX;
      if (flipV) unrotY = -unrotY;

      const displayW = rect.width / zoom;
      const displayH = rect.height / zoom;

      const isRotated90or270 = Math.abs(rotation % 180) === 90;
      const effDisplayW = isRotated90or270 ? displayH : displayW;
      const effDisplayH = isRotated90or270 ? displayW : displayH;

      const scaleFactorX = W / (effDisplayW * zoom);
      const scaleFactorY = H / (effDisplayH * zoom);

      const canvasX = Math.round(W / 2 + unrotX * scaleFactorX);
      const canvasY = Math.round(H / 2 + unrotY * scaleFactorY);

      return {
        x: Math.max(0, Math.min(W, canvasX)),
        y: Math.max(0, Math.min(H, canvasY)),
      };
    },
    [imageCanvasRef, rotation, flipH, flipV, zoom]
  );

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
      if (!currentDrawing || currentDrawing.type !== 'angle') {
        setCurrentDrawing({
          id: Date.now(),
          type: 'angle',
          points: [coords, coords],
          valueText: '',
        });
      } else if (currentDrawing.points.length === 2) {
        const [p1] = currentDrawing.points;
        if (Math.hypot(coords.x - p1.x, coords.y - p1.y) >= 3) {
          setCurrentDrawing({
            ...currentDrawing,
            points: [p1, coords, coords],
            valueText: '0.0°',
          });
        }
      } else if (currentDrawing.points.length === 3) {
        const [p1, p2] = currentDrawing.points;
        if (Math.hypot(coords.x - p2.x, coords.y - p2.y) >= 3) {
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

  const handleMouseMove = (e) => {
    const isAnglePreview =
      activeTool === PACS_TOOLS.ANGLE && currentDrawing?.type === 'angle';
    if (!isInteracting.current && !isAnglePreview) return;

    if (isInteracting.current) {
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
    }

    const coords = getCanvasCoordinates(e);
    const currentData = dicomCache[currentIndex];
    const pixelSpacing = currentData?.meta?.pixelSpacing || [1.0, 1.0];

    if (isAnglePreview) {
      if (currentDrawing.points.length === 2) {
        setCurrentDrawing({
          ...currentDrawing,
          points: [currentDrawing.points[0], coords],
        });
      } else if (currentDrawing.points.length === 3) {
        const [p1, p2] = currentDrawing.points;
        const angleDeg = calculateAngle(p1, p2, coords);
        setCurrentDrawing({
          ...currentDrawing,
          points: [p1, p2, coords],
          valueText: formatMeasurement('angle', angleDeg),
        });
      }
      return;
    }

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

  const handleMouseUp = () => {
    if (!isInteracting.current) return;
    isInteracting.current = false;

    if (
      activeTool === PACS_TOOLS.ANGLE &&
      currentDrawing?.type === 'angle' &&
      currentDrawing.points.length === 2
    ) {
      const [p1, p2] = currentDrawing.points;
      if (Math.hypot((p2?.x || 0) - (p1?.x || 0), (p2?.y || 0) - (p1?.y || 0)) >= 6) {
        setCurrentDrawing({
          ...currentDrawing,
          points: [p1, p2, p2],
          valueText: '0.0°',
        });
      }
      return;
    }

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

  const handleWheel = (e) => {
    e.preventDefault();
    if (activeSeriesIndices.length <= 1) return;
    stepSeriesSlice(e.deltaY > 0 ? 1 : -1);
  };

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

  return {
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
    currentDrawing,
    setCurrentDrawing,
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
  };
}
