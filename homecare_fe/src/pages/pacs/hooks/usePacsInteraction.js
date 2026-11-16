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
import { screenToImage } from '../utils/viewportMapping';
import { computeRoiStats, getPixelValue, getPixelValueUnit } from '../services/dicomImageCore';

/**
 * Tương tác khung nhìn: đo đạc, WW/WL, zoom/pan, đầu dò giá trị pixel (HU).
 * Mọi số đo gắn với khoá ổn định của lát (`SOP#frame`) và chỉ cho phép trên ẢNH GỐC.
 */
export function usePacsInteraction({
  dicomCache,
  currentIndex,
  currentKey,
  windowCenter,
  setWindowCenter,
  windowWidth,
  setWindowWidth,
  applyVoi,
  resetVoi,
  setInvert,
  setColorLut,
  activeSeriesIndices,
  stepSeriesSlice,
  imageCanvasRef,
  annotationCanvasRef,
  presentationStateKey,
  redrawKey,
}) {
  const [activeTool, setActiveTool] = useState(PACS_TOOLS.LENGTH);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);

  // Số đo theo lát: { [SOP#frame]: Array<Measurement> }
  const [annotations, setAnnotations] = useState({});
  const [currentDrawing, setCurrentDrawing] = useState(null);
  // Đầu dò giá trị pixel dưới con trỏ
  const [probe, setProbe] = useState(null);

  const currentData = dicomCache[currentIndex];
  const hasFullImage = !!(currentData?.rawPixels && currentData?.decodeInfo?.ok !== false);
  const meta = currentData?.meta;
  const pixelSpacing = meta?.pixelSpacing || null;
  const calibrated = !!pixelSpacing;
  const spacingForCalc = pixelSpacing || [1, 1];

  useEffect(() => {
    setCurrentDrawing(null);
  }, [activeTool, currentKey]);

  const isInteracting = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });
  const startPan = useRef({ x: 0, y: 0 });
  const startWW = useRef({ ww: 255, wl: 128 });

  /** Pixel ảnh trên 1 pixel màn hình (để nét/chữ chú thích luôn cùng cỡ) */
  const getImageToScreenScale = useCallback(() => {
    const canvas = imageCanvasRef.current;
    if (!canvas || !canvas.offsetWidth) return 1;
    return canvas.width / (canvas.offsetWidth * zoom);
  }, [imageCanvasRef, zoom]);

  // Vẽ lại chú thích
  useEffect(() => {
    const canvas = annotationCanvasRef.current;
    if (!canvas || !meta) return;
    renderAnnotationsToCanvas(canvas, annotations[currentKey] || [], currentDrawing, meta, getImageToScreenScale());
  }, [annotations, currentDrawing, currentKey, meta, annotationCanvasRef, getImageToScreenScale, redrawKey]);

  /**
   * Toạ độ chuột -> toạ độ pixel ảnh (không làm tròn, giữ độ chính xác dưới pixel).
   * Dùng kích thước layout chưa biến đổi (offsetWidth/Height) nên đúng với mọi góc xoay & ảnh không vuông.
   */
  const getCanvasCoordinates = useCallback(
    (e) => {
      const canvas = imageCanvasRef.current;
      if (!canvas || !canvas.offsetWidth) return { x: 0, y: 0, inside: false };
      const rect = canvas.getBoundingClientRect();
      const W = canvas.width;
      const H = canvas.height;
      const { x, y } = screenToImage(e, {
        centerX: rect.left + rect.width / 2,
        centerY: rect.top + rect.height / 2,
        layoutW: canvas.offsetWidth,
        layoutH: canvas.offsetHeight,
        W,
        H,
        zoom,
        rotation,
        flipH,
        flipV,
      });
      return { x: Math.max(0, Math.min(W, x)), y: Math.max(0, Math.min(H, y)), inside: x >= 0 && y >= 0 && x < W && y < H };
    },
    [imageCanvasRef, rotation, flipH, flipV, zoom]
  );

  const valueUnit = getPixelValueUnit(meta);

  /** withStats=false khi đang kéo (chỉ tính diện tích), true khi thả chuột (tính Mean/SD trên toàn ROI) */
  const finalizeRoi = (drawing, withStats = true) => {
    const [p1, p2] = drawing.points;
    const shape = drawing.type === 'roi_ellipse' ? 'ellipse' : 'rect';
    const area = shape === 'ellipse' ? calculateEllipseArea(p1, p2, spacingForCalc) : calculateRectArea(p1, p2, spacingForCalc);
    const stats = withStats && hasFullImage ? computeRoiStats(currentData.rawPixels, meta, shape, p1, p2) : null;
    return {
      ...drawing,
      valueText: `Diện tích ${formatMeasurement(drawing.type, area, calibrated)}`,
      stats,
      statsUnit: valueUnit,
      calibrated,
      spacingSource: meta?.pixelSpacingSource || null,
    };
  };

  const ensureMeasurable = () => {
    if (hasFullImage) return true;
    message.warning({ content: 'Đang tải ảnh gốc - chưa thể đo trên ảnh xem trước', key: 'pacs-measure-guard' });
    return false;
  };

  const handleMouseDown = (e) => {
    if (e.button !== 0 && e.button !== 1 && e.button !== 2) return;
    isInteracting.current = true;
    startPos.current = { x: e.clientX, y: e.clientY };
    startPan.current = { ...pan };
    startWW.current = { ww: windowWidth, wl: windowCenter };

    if (e.button === 1 || activeTool === PACS_TOOLS.PAN) return;
    if (e.button === 2 || activeTool === PACS_TOOLS.WW_WL || activeTool === PACS_TOOLS.ZOOM) return;

    const isMeasureTool = [PACS_TOOLS.LENGTH, PACS_TOOLS.ANGLE, PACS_TOOLS.ROI_ELLIPSE, PACS_TOOLS.ROI_RECT].includes(activeTool);
    if (isMeasureTool && !ensureMeasurable()) {
      isInteracting.current = false;
      return;
    }

    const coords = getCanvasCoordinates(e);
    const base = { id: Date.now(), calibrated, spacingSource: meta?.pixelSpacingSource || null };

    if (activeTool === PACS_TOOLS.LENGTH) {
      setCurrentDrawing({ ...base, type: 'length', points: [coords, coords], valueText: formatMeasurement('length', 0, calibrated) });
    } else if (activeTool === PACS_TOOLS.ANGLE) {
      if (!currentDrawing || currentDrawing.type !== 'angle') {
        setCurrentDrawing({ ...base, type: 'angle', points: [coords, coords], valueText: '' });
      } else if (currentDrawing.points.length === 2) {
        const [p1] = currentDrawing.points;
        if (Math.hypot(coords.x - p1.x, coords.y - p1.y) >= 1) {
          setCurrentDrawing({ ...currentDrawing, points: [p1, coords, coords], valueText: '0.0°' });
        }
      } else if (currentDrawing.points.length === 3) {
        const [p1, p2] = currentDrawing.points;
        if (Math.hypot(coords.x - p2.x, coords.y - p2.y) >= 1) {
          const angleDeg = calculateAngle(p1, p2, coords, spacingForCalc);
          setAnnotations((prev) => ({
            ...prev,
            [currentKey]: [
              ...(prev[currentKey] || []),
              { ...currentDrawing, points: [p1, p2, coords], valueText: formatMeasurement('angle', angleDeg) },
            ],
          }));
          setCurrentDrawing(null);
        }
      }
    } else if (activeTool === PACS_TOOLS.ROI_ELLIPSE || activeTool === PACS_TOOLS.ROI_RECT) {
      setCurrentDrawing({ ...base, type: activeTool, points: [coords, coords], valueText: '' });
    }
  };

  // Đầu dò HU: throttle theo khung hình
  const probeFrame = useRef(null);
  const updateProbe = (e) => {
    if (!hasFullImage) {
      if (probe) setProbe(null);
      return;
    }
    const { clientX, clientY } = e;
    if (probeFrame.current) return;
    probeFrame.current = requestAnimationFrame(() => {
      probeFrame.current = null;
      const c = getCanvasCoordinates({ clientX, clientY });
      if (!c.inside) {
        setProbe(null);
        return;
      }
      const v = getPixelValue(currentData.rawPixels, meta, c.x, c.y);
      setProbe(v ? { x: Math.floor(c.x), y: Math.floor(c.y), ...v, unit: valueUnit } : null);
    });
  };

  // Kéo Pan / WW-WL: chuột bắn 100-1000 sự kiện/giây -> gom 1 lần setState / khung hình
  const dragPendingRef = useRef(null);
  const dragRafRef = useRef(null);
  const flushDrag = () => {
    dragRafRef.current = null;
    const p = dragPendingRef.current;
    dragPendingRef.current = null;
    if (!p) return;
    if (p.pan) setPan(p.pan);
    if (p.ww !== undefined) setWindowWidth(p.ww);
    if (p.wl !== undefined) setWindowCenter(p.wl);
  };
  const scheduleDrag = (patch) => {
    dragPendingRef.current = { ...(dragPendingRef.current || {}), ...patch };
    if (!dragRafRef.current) dragRafRef.current = requestAnimationFrame(flushDrag);
  };
  useEffect(() => () => dragRafRef.current && cancelAnimationFrame(dragRafRef.current), []);

  const handleMouseMove = (e) => {
    updateProbe(e);
    const isAnglePreview = activeTool === PACS_TOOLS.ANGLE && currentDrawing?.type === 'angle';
    if (!isInteracting.current && !isAnglePreview) return;

    if (isInteracting.current) {
      const dx = e.clientX - startPos.current.x;
      const dy = e.clientY - startPos.current.y;

      if (e.buttons === 4 || activeTool === PACS_TOOLS.PAN) {
        scheduleDrag({ pan: { x: startPan.current.x + dx, y: startPan.current.y + dy } });
        return;
      }

      if (e.buttons === 2 || activeTool === PACS_TOOLS.WW_WL) {
        // Độ nhạy theo dải giá trị ảnh: CT (~4000 HU) và X-quang 15-bit (~32000) đều kéo mượt
        const range = meta && Number.isFinite(meta.maxPixelValue) ? meta.maxPixelValue - meta.minPixelValue : 1024;
        const sensitivity = Math.max(1, range / 600);
        scheduleDrag({
          ww: Math.max(1, Math.round(startWW.current.ww + dx * sensitivity)),
          wl: Math.round(startWW.current.wl - dy * sensitivity),
        });
        return;
      }

      if (activeTool === PACS_TOOLS.ZOOM) {
        const zoomFactor = 1 - dy * 0.01;
        setZoom((prev) => Math.max(0.1, Math.min(16, prev * zoomFactor)));
        startPos.current = { x: e.clientX, y: e.clientY };
        return;
      }
    }

    const coords = getCanvasCoordinates(e);

    if (isAnglePreview) {
      if (currentDrawing.points.length === 2) {
        setCurrentDrawing({ ...currentDrawing, points: [currentDrawing.points[0], coords] });
      } else if (currentDrawing.points.length === 3) {
        const [p1, p2] = currentDrawing.points;
        setCurrentDrawing({
          ...currentDrawing,
          points: [p1, p2, coords],
          valueText: formatMeasurement('angle', calculateAngle(p1, p2, coords, spacingForCalc)),
        });
      }
      return;
    }

    if (!currentDrawing) return;
    const p1 = currentDrawing.points[0];
    if (activeTool === PACS_TOOLS.LENGTH) {
      setCurrentDrawing({
        ...currentDrawing,
        points: [p1, coords],
        valueText: formatMeasurement('length', calculateDistance(p1, coords, spacingForCalc), calibrated),
      });
    } else if (activeTool === PACS_TOOLS.ROI_ELLIPSE || activeTool === PACS_TOOLS.ROI_RECT) {
      setCurrentDrawing(finalizeRoi({ ...currentDrawing, points: [p1, coords] }, false));
    }
  };

  const handleMouseUp = () => {
    if (!isInteracting.current) return;
    isInteracting.current = false;
    if (dragRafRef.current) {
      cancelAnimationFrame(dragRafRef.current);
      flushDrag();
    }

    if (activeTool === PACS_TOOLS.ANGLE && currentDrawing?.type === 'angle' && currentDrawing.points.length === 2) {
      const [p1, p2] = currentDrawing.points;
      if (Math.hypot((p2?.x || 0) - (p1?.x || 0), (p2?.y || 0) - (p1?.y || 0)) >= 2) {
        setCurrentDrawing({ ...currentDrawing, points: [p1, p2, p2], valueText: '0.0°' });
      }
      return;
    }

    if (currentDrawing && [PACS_TOOLS.LENGTH, PACS_TOOLS.ROI_ELLIPSE, PACS_TOOLS.ROI_RECT].includes(activeTool)) {
      const [p1, p2] = currentDrawing.points;
      if (Math.hypot((p1?.x || 0) - (p2?.x || 0), (p1?.y || 0) - (p2?.y || 0)) >= 1) {
        const finalItem = activeTool === PACS_TOOLS.LENGTH ? currentDrawing : finalizeRoi(currentDrawing);
        setAnnotations((prev) => ({ ...prev, [currentKey]: [...(prev[currentKey] || []), finalItem] }));
      }
      setCurrentDrawing(null);
    }
  };

  const handleMouseLeave = () => {
    setProbe(null);
    handleMouseUp();
  };

  const wheelAccRef = useRef(0);
  const wheelRafRef = useRef(null);
  const stepRef = useRef(stepSeriesSlice);
  stepRef.current = stepSeriesSlice;
  const handleWheel = (e) => {
    if (e.ctrlKey) {
      e.preventDefault?.();
      setZoom((prev) => Math.max(0.1, Math.min(16, prev * (e.deltaY > 0 ? 1 / 1.1 : 1.1))));
      return;
    }
    if (activeSeriesIndices.length <= 1) return;
    // Gộp nhiều nấc cuộn trong 1 khung hình thành 1 lần đổi lát (touchpad bắn 60-120 sự kiện/giây)
    wheelAccRef.current += e.deltaY > 0 ? 1 : -1;
    if (wheelRafRef.current) return;
    wheelRafRef.current = requestAnimationFrame(() => {
      wheelRafRef.current = null;
      const steps = wheelAccRef.current;
      wheelAccRef.current = 0;
      if (steps) stepRef.current(steps);
    });
  };

  const handleZoomIn = () => setZoom((prev) => Math.min(16, Number((prev * 1.25).toFixed(3))));
  const handleZoomOut = () => setZoom((prev) => Math.max(0.1, Number((prev / 1.25).toFixed(3))));
  const handleResetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };
  /** Zoom 1:1 - mỗi pixel ảnh = 1 pixel màn hình (đọc chi tiết X-quang) */
  const handleZoomActualPixels = () => {
    const canvas = imageCanvasRef.current;
    if (!canvas?.offsetWidth) return;
    setZoom(canvas.width / canvas.offsetWidth);
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
    resetVoi?.();
  };

  const handleClearAnnotations = () => {
    setAnnotations((prev) => {
      const next = { ...prev, [currentKey]: [] };
      if (presentationStateKey) {
        try {
          const saved = JSON.parse(localStorage.getItem(presentationStateKey) || '{}');
          saved.annotations = next;
          localStorage.setItem(presentationStateKey, JSON.stringify(saved));
        } catch {
          /* localStorage đầy / bị chặn - trạng thái vẫn lưu lên máy chủ */
        }
      }
      return next;
    });
    message.success('Đã xoá các số đo trên lát cắt này');
  };

  const handleUndoAnnotation = () => {
    setAnnotations((prev) => {
      const list = prev[currentKey] || [];
      if (!list.length) return prev;
      return { ...prev, [currentKey]: list.slice(0, -1) };
    });
  };

  /** preset: { ww, wl } | { key: 'default' } | { center, width } */
  const handleApplyPreset = (preset) => {
    if (!preset || preset.key === 'default') {
      resetVoi?.();
      return;
    }
    const center = preset.wl ?? preset.center;
    const width = preset.ww ?? preset.width;
    if (Number.isFinite(center) && Number.isFinite(width)) applyVoi?.(center, width, 'preset');
  };

  useEffect(
    () => () => {
      if (probeFrame.current) cancelAnimationFrame(probeFrame.current);
    },
    []
  );

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
    probe,
    hasFullImage,
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
  };
}
