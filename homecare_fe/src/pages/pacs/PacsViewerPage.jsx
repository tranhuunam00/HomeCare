import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import {
  Button,
  Tooltip,
  Dropdown,
  message,
  Spin,
  Upload,
  Select,
} from 'antd';
import {
  ZoomInOutlined,
  ZoomOutOutlined,
  DragOutlined,
  EyeOutlined,
  CameraOutlined,
  ReloadOutlined,
  DeleteOutlined,
  CloseOutlined,
  UploadOutlined,
  UndoOutlined,
  RedoOutlined,
  FullscreenOutlined,
  ShareAltOutlined,
  PrinterOutlined,
  VideoCameraOutlined,
  LineOutlined,
  AppstoreOutlined,
  DownOutlined,
  RightOutlined,
  CheckOutlined,
  LinkOutlined,
  SlidersOutlined,
  SunOutlined,
  BorderOutlined,
  RadiusSettingOutlined,
} from '@ant-design/icons';
import { parseDicomBuffer, renderDicomToCanvas } from './services/dicomDecoder';

const WW_WL_PRESETS = [
  { key: 'default', label: 'Mặc định (DICOM)' },
  { key: 'lung', label: 'Cửa sổ Phổi (W: 1500, L: -600)', ww: 1500, wl: -600 },
  { key: 'bone', label: 'Cửa sổ Xương (W: 2000, L: 400)', ww: 2000, wl: 400 },
  { key: 'soft_tissue', label: 'Mô mềm (W: 350, L: 50)', ww: 350, wl: 50 },
  { key: 'brain', label: 'Sọ não (W: 80, L: 40)', ww: 80, wl: 40 },
  { key: 'abdomen', label: 'Bụng / Gan (W: 400, L: 50)', ww: 400, wl: 50 },
];

const COLOR_LUTS = [
  { value: 'default', label: 'Default' },
  { value: 'inverted', label: 'Inverted' },
  { value: 'rainbow', label: 'Rainbow' },
  { value: 'hot_iron', label: 'Hot Iron' },
];

export default function PacsViewerPage() {
  const [searchParams] = useSearchParams();
  const patientDiagnoseId = searchParams.get('patientDiagnoseId') || '';

  // Study & Instances
  const [loading, setLoading] = useState(true);
  const [study, setStudy] = useState(null);
  const [instances, setInstances] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Layout mode: '1x1' | '1x2' | '2x1' | '2x2'
  const [layout, setLayout] = useState('1x1');
  const [activeViewport, setActiveViewport] = useState(0); // 0 or 1

  // Accordion collapsed state in left sidebar
  const [expandedSections, setExpandedSections] = useState({
    measure: true,
    advance: false,
    image: true,
    sync: false,
  });

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // DICOM Decoded Cache: index -> { meta, rawPixels }
  const [dicomCache, setDicomCache] = useState({});

  // Active Tool: 'length' | 'angle' | 'roi_rect' | 'roi_ellipse' | 'pan' | 'zoom' | 'ww_wl' | 'select'
  const [activeTool, setActiveTool] = useState('length');
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [invert, setInvert] = useState(false);
  const [colorLut, setColorLut] = useState('default');
  const [windowCenter, setWindowCenter] = useState(128);
  const [windowWidth, setWindowWidth] = useState(255);

  // Annotations per slice: { [sliceIndex]: Array<Measurement> }
  const [annotations, setAnnotations] = useState({});
  const [currentDrawing, setCurrentDrawing] = useState(null);

  // Canvas Refs
  const viewportRef = useRef(null);
  const imageCanvasRef = useRef(null);
  const annotationCanvasRef = useRef(null);

  // Interaction tracking
  const isInteracting = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });
  const startPan = useRef({ x: 0, y: 0 });
  const startWW = useRef({ ww: 255, wl: 128 });

  // Broadcast Channel for syncing with Reading Form tab
  const broadcastChannelRef = useRef(null);

  const apiEndpoint = import.meta.env.VITE_API_ENDPOINT || 'http://localhost:3001';

  useEffect(() => {
    try {
      broadcastChannelRef.current = new BroadcastChannel('homecare_pacs_channel');
    } catch {
      // BroadcastChannel fallback if needed
    }
    return () => {
      broadcastChannelRef.current?.close();
    };
  }, []);

  // Fetch Study Data
  const loadStudy = useCallback(async () => {
    if (!patientDiagnoseId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await axios.get(`${apiEndpoint}/api/pacs/studies/${patientDiagnoseId}`);
      if (res.data?.success && res.data?.data) {
        const raw = res.data.data;
        const studyData = raw.data ? raw.data : raw;
        setStudy(studyData);
        const sorted = (studyData.instances || []).sort(
          (a, b) => (a.instanceNumber || 0) - (b.instanceNumber || 0)
        );
        setInstances(sorted);
        setCurrentIndex(0);
      }
    } catch (err) {
      console.warn('Chưa có dữ liệu study cho ca này:', err);
    } finally {
      setLoading(false);
    }
  }, [patientDiagnoseId, apiEndpoint]);

  useEffect(() => {
    loadStudy();
  }, [loadStudy]);

  // Load and decode active DICOM instance
  const loadInstance = useCallback(
    async (index) => {
      if (!instances || instances.length === 0 || !instances[index]) return;
      if (dicomCache[index]) {
        const item = dicomCache[index];
        setWindowCenter(item.meta.windowCenter);
        setWindowWidth(item.meta.windowWidth);
        return;
      }

      const instance = instances[index];
      try {
        const res = await axios.get(
          `${apiEndpoint}/api/pacs/instances/${instance.sopInstanceUid}/file`,
          { responseType: 'arraybuffer' }
        );
        const parsed = parseDicomBuffer(res.data);
        setDicomCache((prev) => ({ ...prev, [index]: parsed }));
        setWindowCenter(parsed.meta.windowCenter);
        setWindowWidth(parsed.meta.windowWidth);
      } catch (err) {
        console.error('Lỗi tải file DICOM:', err);
        message.error(`Không thể đọc file lát cắt #${index + 1}`);
      }
    },
    [instances, dicomCache, apiEndpoint]
  );

  useEffect(() => {
    if (instances.length > 0) {
      loadInstance(currentIndex);
    }
  }, [currentIndex, instances, loadInstance]);

  // Redraw Image Canvas
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
  }, [dicomCache, currentIndex, windowCenter, windowWidth, invert, colorLut]);

  // Redraw Annotations Canvas
  const redrawAnnotations = useCallback(() => {
    const canvas = annotationCanvasRef.current;
    const currentData = dicomCache[currentIndex];
    if (!canvas || !currentData) return;

    const { rows, columns } = currentData.meta;
    canvas.width = columns;
    canvas.height = rows;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, columns, rows);

    const sliceAnnotations = annotations[currentIndex] || [];
    const allToDraw = currentDrawing
      ? [...sliceAnnotations, currentDrawing]
      : sliceAnnotations;

    for (const ann of allToDraw) {
      ctx.save();
      if (ann.type === 'length') {
        const [p1, p2] = ann.points;
        if (p1 && p2) {
          ctx.strokeStyle = '#22c55e'; // Bright green
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();

          ctx.fillStyle = '#22c55e';
          ctx.beginPath();
          ctx.arc(p1.x, p1.y, 4, 0, Math.PI * 2);
          ctx.arc(p2.x, p2.y, 4, 0, Math.PI * 2);
          ctx.fill();

          if (ann.valueText) {
            const midX = (p1.x + p2.x) / 2;
            const midY = (p1.y + p2.y) / 2;
            ctx.font = 'bold 14px sans-serif';
            ctx.fillStyle = '#22c55e';
            ctx.fillText(ann.valueText, midX + 8, midY - 8);
          }
        }
      } else if (ann.type === 'angle') {
        const [p1, p2, p3] = ann.points;
        if (p1 && p2) {
          ctx.strokeStyle = '#f59e0b'; // Amber
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          if (p3) ctx.lineTo(p3.x, p3.y);
          ctx.stroke();

          if (ann.valueText) {
            ctx.font = 'bold 14px sans-serif';
            ctx.fillStyle = '#f59e0b';
            ctx.fillText(ann.valueText, p2.x + 8, p2.y - 8);
          }
        }
      } else if (ann.type === 'roi_ellipse') {
        const [p1, p2] = ann.points;
        if (p1 && p2) {
          const centerX = (p1.x + p2.x) / 2;
          const centerY = (p1.y + p2.y) / 2;
          const radiusX = Math.abs(p2.x - p1.x) / 2;
          const radiusY = Math.abs(p2.y - p1.y) / 2;

          ctx.strokeStyle = '#38bdf8'; // Cyan
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
          ctx.stroke();

          if (ann.valueText) {
            ctx.font = 'bold 14px sans-serif';
            ctx.fillStyle = '#38bdf8';
            ctx.fillText(ann.valueText, centerX, centerY - radiusY - 6);
          }
        }
      } else if (ann.type === 'roi_rect') {
        const [p1, p2] = ann.points;
        if (p1 && p2) {
          const minX = Math.min(p1.x, p2.x);
          const minY = Math.min(p1.y, p2.y);
          const width = Math.abs(p2.x - p1.x);
          const height = Math.abs(p2.y - p1.y);

          ctx.strokeStyle = '#a855f7'; // Purple
          ctx.lineWidth = 2;
          ctx.strokeRect(minX, minY, width, height);

          if (ann.valueText) {
            ctx.font = 'bold 14px sans-serif';
            ctx.fillStyle = '#a855f7';
            ctx.fillText(ann.valueText, minX, minY - 6);
          }
        }
      }
      ctx.restore();
    }
  }, [annotations, currentDrawing, currentIndex, dicomCache]);

  useEffect(() => {
    redrawAnnotations();
  }, [redrawAnnotations]);

  // Mouse Wheel: Scroll through Slices
  const handleWheel = (e) => {
    e.preventDefault();
    if (instances.length <= 1) return;
    if (e.deltaY > 0) {
      setCurrentIndex((prev) => Math.min(prev + 1, instances.length - 1));
    } else {
      setCurrentIndex((prev) => Math.max(prev - 1, 0));
    }
  };

  // Convert Mouse Coordinates to DICOM Canvas Space
  const getCanvasCoordinates = (e) => {
    const canvas = imageCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    return { x: Math.round(x), y: Math.round(y) };
  };

  // Mouse Down
  const handleMouseDown = (e) => {
    if (e.button !== 0 && e.button !== 1 && e.button !== 2) return;
    isInteracting.current = true;
    startPos.current = { x: e.clientX, y: e.clientY };
    startPan.current = { ...pan };
    startWW.current = { ww: windowWidth, wl: windowCenter };

    if (e.button === 1 || activeTool === 'pan') {
      return;
    }

    if (e.button === 2 || activeTool === 'ww_wl') {
      return;
    }

    const coords = getCanvasCoordinates(e);

    if (activeTool === 'length') {
      setCurrentDrawing({
        id: Date.now(),
        type: 'length',
        points: [coords, coords],
        valueText: '0.0 mm',
      });
    } else if (activeTool === 'angle') {
      if (!currentDrawing) {
        setCurrentDrawing({
          id: Date.now(),
          type: 'angle',
          points: [coords, coords],
          valueText: '',
        });
      } else if (currentDrawing.points.length === 2) {
        const [p1, p2] = currentDrawing.points;
        const p3 = coords;
        const v1 = { x: p1.x - p2.x, y: p1.y - p2.y };
        const v2 = { x: p3.x - p2.x, y: p3.y - p2.y };
        const dot = v1.x * v2.x + v1.y * v2.y;
        const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
        const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y);
        const angleDeg = Math.acos(Math.max(-1, Math.min(1, dot / (mag1 * mag2)))) * (180 / Math.PI);

        setAnnotations((prev) => ({
          ...prev,
          [currentIndex]: [
            ...(prev[currentIndex] || []),
            { ...currentDrawing, points: [p1, p2, p3], valueText: `${angleDeg.toFixed(1)}°` },
          ],
        }));
        setCurrentDrawing(null);
      }
    } else if (activeTool === 'roi_ellipse') {
      setCurrentDrawing({
        id: Date.now(),
        type: 'roi_ellipse',
        points: [coords, coords],
        valueText: '0.0 mm²',
      });
    } else if (activeTool === 'roi_rect') {
      setCurrentDrawing({
        id: Date.now(),
        type: 'roi_rect',
        points: [coords, coords],
        valueText: '0.0 mm²',
      });
    }
  };

  // Mouse Move
  const handleMouseMove = (e) => {
    if (!isInteracting.current) return;

    const dx = e.clientX - startPos.current.x;
    const dy = e.clientY - startPos.current.y;

    if (e.buttons === 4 || activeTool === 'pan') {
      setPan({
        x: startPan.current.x + dx,
        y: startPan.current.y + dy,
      });
      return;
    }

    if (e.buttons === 2 || activeTool === 'ww_wl') {
      const sensitivity = 2.0;
      setWindowWidth((prev) => Math.max(1, Math.round(startWW.current.ww + dx * sensitivity)));
      setWindowCenter((prev) => Math.round(startWW.current.wl - dy * sensitivity));
      return;
    }

    if (activeTool === 'zoom') {
      const zoomFactor = 1 - dy * 0.01;
      setZoom((prev) => Math.max(0.1, Math.min(10, prev * zoomFactor)));
      startPos.current = { x: e.clientX, y: e.clientY };
      return;
    }

    const coords = getCanvasCoordinates(e);
    const currentData = dicomCache[currentIndex];
    const pixelSpacing = currentData?.meta?.pixelSpacing || [1.0, 1.0];

    if (activeTool === 'length' && currentDrawing) {
      const p1 = currentDrawing.points[0];
      const p2 = coords;
      const distMm = Math.sqrt(
        Math.pow((p2.x - p1.x) * pixelSpacing[1], 2) +
        Math.pow((p2.y - p1.y) * pixelSpacing[0], 2)
      );
      setCurrentDrawing({
        ...currentDrawing,
        points: [p1, p2],
        valueText: `${distMm.toFixed(1)} mm`,
      });
    } else if (activeTool === 'roi_ellipse' && currentDrawing) {
      const p1 = currentDrawing.points[0];
      const p2 = coords;
      const rx = (Math.abs(p2.x - p1.x) / 2) * pixelSpacing[1];
      const ry = (Math.abs(p2.y - p1.y) / 2) * pixelSpacing[0];
      const area = Math.PI * rx * ry;
      setCurrentDrawing({
        ...currentDrawing,
        points: [p1, p2],
        valueText: `${area.toFixed(1)} mm²`,
      });
    } else if (activeTool === 'roi_rect' && currentDrawing) {
      const p1 = currentDrawing.points[0];
      const p2 = coords;
      const w = Math.abs(p2.x - p1.x) * pixelSpacing[1];
      const h = Math.abs(p2.y - p1.y) * pixelSpacing[0];
      const area = w * h;
      setCurrentDrawing({
        ...currentDrawing,
        points: [p1, p2],
        valueText: `${area.toFixed(1)} mm²`,
      });
    }
  };

  // Mouse Up
  const handleMouseUp = () => {
    if (!isInteracting.current) return;
    isInteracting.current = false;

    if (currentDrawing && (activeTool === 'length' || activeTool === 'roi_ellipse' || activeTool === 'roi_rect')) {
      setAnnotations((prev) => {
        const sliceList = prev[currentIndex] || [];
        return {
          ...prev,
          [currentIndex]: [...sliceList, currentDrawing],
        };
      });
      setCurrentDrawing(null);
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

  // Clear measurements on current slice
  const handleClearAnnotations = () => {
    setAnnotations((prev) => ({ ...prev, [currentIndex]: [] }));
  };

  // KEY IMAGE CAPTURE (Chụp ảnh Key & Đồng bộ sang Bệnh án)
  const handleCaptureKeyImage = async () => {
    const imgCanvas = imageCanvasRef.current;
    const annCanvas = annotationCanvasRef.current;
    if (!imgCanvas || !annCanvas) {
      message.error('Không tìm thấy hình ảnh để chụp');
      return;
    }

    try {
      // 1. Composite canvas: DICOM Image + Annotations + Clinical Watermark HUD
      const compositeCanvas = document.createElement('canvas');
      compositeCanvas.width = imgCanvas.width;
      compositeCanvas.height = imgCanvas.height;
      const ctx = compositeCanvas.getContext('2d');

      // Draw Base DICOM image
      ctx.drawImage(imgCanvas, 0, 0);
      // Draw Measurements
      ctx.drawImage(annCanvas, 0, 0);

      // Draw Top & Bottom Clinical HUD
      const currentData = dicomCache[currentIndex];
      ctx.save();
      ctx.fillStyle = '#22c55e';
      ctx.font = 'bold 16px monospace, sans-serif';
      const patientTitle = `${currentData?.meta?.patientName || study?.patientName || 'Bệnh nhân'} | PID: ${currentData?.meta?.patientId || study?.patientId || patientDiagnoseId}`;
      ctx.fillText(patientTitle, 16, 28);

      const sliceTitle = `Lát cắt #${currentIndex + 1}/${instances.length} | WW: ${Math.round(windowWidth)} WL: ${Math.round(windowCenter)}`;
      ctx.font = '14px monospace, sans-serif';
      ctx.fillText(sliceTitle, 16, 50);
      ctx.restore();

      const dataUrl = compositeCanvas.toDataURL('image/png');

      // Summary of measurements on this slice
      const sliceAnn = annotations[currentIndex] || [];
      const measurementsSummary = sliceAnn
        .map((a) => a.valueText)
        .filter(Boolean)
        .join(', ');

      const captionText = `Ảnh PACS lát cắt #${currentIndex + 1}${
        measurementsSummary ? ` (Kích thước: ${measurementsSummary})` : ''
      }`;

      // 2. Broadcast to Doctor Reading Tab via all available channels
      const messagePayload = {
        type: 'KEY_IMAGE_CAPTURED',
        patientDiagnoseId: patientDiagnoseId ? Number(patientDiagnoseId) : undefined,
        patient_diagnose_id: patientDiagnoseId ? Number(patientDiagnoseId) : undefined,
        dataUrl,
        caption: captionText,
        sliceIndex: currentIndex,
        sopInstanceUid: instances[currentIndex]?.sopInstanceUid,
        measurements: sliceAnn.map((a) => ({
          type: a.type,
          value: a.valueText,
        })),
        timestamp: Date.now(),
      };

      // Channel 1: BroadcastChannel
      if (broadcastChannelRef.current) {
        broadcastChannelRef.current.postMessage(messagePayload);
      }

      // Channel 2: window.opener postMessage
      if (window.opener) {
        window.opener.postMessage(messagePayload, '*');
      }

      // Channel 3: localStorage cross-tab event
      try {
        localStorage.setItem('homecare_pacs_latest_key_image', JSON.stringify(messagePayload));
      } catch (err) {
        console.warn('localStorage error', err);
      }

      // 3. Save snapshot to PACS Backend
      if (patientDiagnoseId) {
        await axios.post(`${apiEndpoint}/api/pacs/key-image`, {
          patientDiagnoseId: Number(patientDiagnoseId),
          imageBase64: dataUrl,
          caption: captionText,
          sliceIndex: currentIndex,
          sopInstanceUid: instances[currentIndex]?.sopInstanceUid,
          measurements: sliceAnn.map((a) => ({
            type: a.type,
            value: a.valueText,
          })),
        });
      }

      message.success('Đã chụp ảnh Key và đồng bộ sang Hình ảnh minh họa!');
    } catch (err) {
      console.error('Lỗi chụp ảnh Key:', err);
      message.error('Không thể lưu ảnh Key: ' + (err.response?.data?.message || err.message));
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

  // Upload handler for DICOM files
  const handleUploadDicom = async (file) => {
    const formData = new FormData();
    formData.append('files', file);

    try {
      message.loading({ content: 'Đang tải lên file DICOM...', key: 'dicom_upload' });
      await axios.post(
        `${apiEndpoint}/api/pacs/upload?patientDiagnoseId=${patientDiagnoseId}`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      message.success({ content: 'Tải file DICOM thành công!', key: 'dicom_upload' });
      loadStudy();
    } catch (err) {
      message.error({
        content: 'Lỗi tải lên: ' + (err.response?.data?.message || err.message),
        key: 'dicom_upload',
      });
    }
    return false;
  };

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
      }}
    >
      {/* ----------------- TOP NAVBAR (VR-PACS VIEWER) ----------------- */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          height: 42,
          padding: '0 12px',
          backgroundColor: '#0b101b',
          borderBottom: '1px solid #1e293b',
          zIndex: 20,
        }}
      >
        {/* Brand Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: 3,
              backgroundColor: '#38bdf8',
              boxShadow: '0 0 8px #38bdf8',
            }}
          />
          <span style={{ fontWeight: '800', fontSize: '14px', letterSpacing: '0.5px', color: '#f8fafc' }}>
            VR-PACS VIEWER
          </span>
        </div>

        {/* Quick Toolbar (Center) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {/* Preset WW/WL */}
          <Dropdown
            menu={{
              items: WW_WL_PRESETS.map((p) => ({
                key: p.key,
                label: p.label,
                onClick: () => {
                  if (p.ww && p.wl) {
                    setWindowWidth(p.ww);
                    setWindowCenter(p.wl);
                  } else if (currentMeta) {
                    setWindowWidth(currentMeta.windowWidth);
                    setWindowCenter(currentMeta.windowCenter);
                  }
                },
              })),
            }}
          >
            <Tooltip title="Cửa sổ tương phản (Presets)">
              <Button
                size="small"
                icon={<SlidersOutlined />}
                style={{ backgroundColor: '#131b2e', borderColor: '#1e293b', color: '#94a3b8' }}
              />
            </Tooltip>
          </Dropdown>

          <Tooltip title="Độ tương phản tự do (WW/WL - Kéo chuột phải)">
            <Button
              size="small"
              type={activeTool === 'ww_wl' ? 'primary' : 'default'}
              onClick={() => setActiveTool('ww_wl')}
              style={activeTool !== 'ww_wl' ? { backgroundColor: '#131b2e', borderColor: '#1e293b', color: '#94a3b8' } : {}}
            >
              WW/WL
            </Button>
          </Tooltip>

          <Tooltip title="Phóng to / Thu nhỏ (Zoom)">
            <Button
              size="small"
              type={activeTool === 'zoom' ? 'primary' : 'default'}
              icon={<ZoomInOutlined />}
              onClick={() => setActiveTool('zoom')}
              style={activeTool !== 'zoom' ? { backgroundColor: '#131b2e', borderColor: '#1e293b', color: '#94a3b8' } : {}}
            />
          </Tooltip>

          <Tooltip title="Di chuyển ảnh (Pan)">
            <Button
              size="small"
              type={activeTool === 'pan' ? 'primary' : 'default'}
              icon={<DragOutlined />}
              onClick={() => setActiveTool('pan')}
              style={activeTool !== 'pan' ? { backgroundColor: '#131b2e', borderColor: '#1e293b', color: '#94a3b8' } : {}}
            />
          </Tooltip>

          <Tooltip title="Đo chiều dài nốt / tổn thương (mm)">
            <Button
              size="small"
              type={activeTool === 'length' ? 'primary' : 'default'}
              icon={<LineOutlined />}
              onClick={() => setActiveTool('length')}
              style={activeTool !== 'length' ? { backgroundColor: '#131b2e', borderColor: '#1e293b', color: '#94a3b8' } : {}}
            />
          </Tooltip>

          <Tooltip title="Đảo âm/dương bản (Invert)">
            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={() => setInvert((prev) => !prev)}
              style={{
                backgroundColor: invert ? '#0284c7' : '#131b2e',
                borderColor: '#1e293b',
                color: invert ? '#fff' : '#94a3b8',
              }}
            />
          </Tooltip>

          <Tooltip title="Xoay 90°">
            <Button
              size="small"
              icon={<UndoOutlined />}
              onClick={() => setRotation((prev) => (prev + 90) % 360)}
              style={{ backgroundColor: '#131b2e', borderColor: '#1e293b', color: '#94a3b8' }}
            />
          </Tooltip>

          <Tooltip title="Đặt lại góc nhìn">
            <Button
              size="small"
              icon={<ReloadOutlined />}
              onClick={handleReset}
              style={{ backgroundColor: '#131b2e', borderColor: '#1e293b', color: '#94a3b8' }}
            />
          </Tooltip>
        </div>

        {/* Right Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Button
            type="primary"
            size="small"
            icon={<CameraOutlined />}
            onClick={handleCaptureKeyImage}
            style={{
              backgroundColor: '#16a34a',
              borderColor: '#15803d',
              fontWeight: '600',
              fontSize: '12px',
              boxShadow: '0 0 10px rgba(22, 163, 74, 0.5)',
            }}
          >
            Chụp ảnh Key
          </Button>

          <Tooltip title="Toàn màn hình">
            <Button
              size="small"
              icon={<FullscreenOutlined />}
              onClick={() => {
                if (!document.fullscreenElement) {
                  document.documentElement.requestFullscreen();
                } else {
                  document.exitFullscreen();
                }
              }}
              style={{ backgroundColor: '#131b2e', borderColor: '#1e293b', color: '#94a3b8' }}
            />
          </Tooltip>

          <Tooltip title="Đóng cửa sổ">
            <Button
              size="small"
              icon={<CloseOutlined />}
              onClick={() => window.close()}
              style={{ backgroundColor: '#131b2e', borderColor: '#1e293b', color: '#ef4444' }}
            />
          </Tooltip>
        </div>
      </div>

      {/* ----------------- BODY: LEFT SIDEBAR + VIEWPORT ----------------- */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left Sidebar */}
        <div
          style={{
            width: 175,
            minWidth: 175,
            backgroundColor: '#0c1222',
            borderRight: '1px solid #1e293b',
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
            fontSize: '12px',
            userSelect: 'none',
          }}
        >
          {/* History Header & Thumbnail */}
          <div style={{ padding: '8px 10px', borderBottom: '1px solid #1e293b' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontWeight: '700', color: '#94a3b8', fontSize: '11px', textTransform: 'uppercase' }}>
                History
              </span>
              <div style={{ display: 'flex', gap: 4 }}>
                <Upload showUploadList={false} beforeUpload={handleUploadDicom} accept=".dcm,.zip">
                  <Tooltip title="Tải thêm file DICOM">
                    <Button
                      size="small"
                      type="text"
                      icon={<UploadOutlined />}
                      style={{ color: '#38bdf8', padding: '0 4px', height: 20 }}
                    />
                  </Tooltip>
                </Upload>
                <Tooltip title="Tải lại danh sách">
                  <Button
                    size="small"
                    type="text"
                    icon={<ReloadOutlined />}
                    onClick={loadStudy}
                    style={{ color: '#94a3b8', padding: '0 4px', height: 20 }}
                  />
                </Tooltip>
              </div>
            </div>

            {/* Series Thumbnail Card */}
            {instances.length > 0 && (
              <div
                style={{
                  border: '1.5px solid #f59e0b',
                  borderRadius: 4,
                  backgroundColor: '#111827',
                  padding: 6,
                  cursor: 'pointer',
                  position: 'relative',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <span
                    style={{
                      backgroundColor: '#b45309',
                      color: '#fff',
                      fontSize: '10px',
                      fontWeight: '700',
                      padding: '1px 4px',
                      borderRadius: 2,
                    }}
                  >
                    {study?.modality || 'US'}
                  </span>
                  <span style={{ fontSize: '10px', color: '#cbd5e1' }}>
                    {study?.studyDate || '2025-10-23'}
                  </span>
                  <span
                    style={{
                      marginLeft: 'auto',
                      backgroundColor: '#ef4444',
                      color: '#fff',
                      fontSize: '10px',
                      fontWeight: '700',
                      padding: '0 4px',
                      borderRadius: 2,
                    }}
                  >
                    {currentIndex + 1}/{instances.length}
                  </span>
                </div>

                <div style={{ fontSize: '10px', color: '#94a3b8', lineHeight: '14px' }}>
                  <div style={{ color: '#f8fafc', fontWeight: '600' }}>
                    {study?.patientName || 'Bệnh nhân'}
                  </div>
                  <div>PID: {study?.patientId || patientDiagnoseId}</div>
                  <div>File: DICOM ({instances.length} slices)</div>
                </div>
              </div>
            )}
          </div>

          {/* Layout Selector (1x1, 1x2, 2x1, 2x2) */}
          <div style={{ padding: '8px 10px', borderBottom: '1px solid #1e293b' }}>
            <div style={{ fontWeight: '700', color: '#94a3b8', fontSize: '11px', marginBottom: 6, textTransform: 'uppercase' }}>
              Layout
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4 }}>
              {['1x1', '1x2', '2x1', '2x2'].map((item) => (
                <button
                  key={item}
                  onClick={() => setLayout(item)}
                  style={{
                    backgroundColor: layout === item ? '#1e3a8a' : '#111827',
                    border: layout === item ? '1px solid #38bdf8' : '1px solid #1e293b',
                    color: layout === item ? '#38bdf8' : '#94a3b8',
                    padding: '4px 0',
                    fontSize: '11px',
                    fontWeight: '600',
                    borderRadius: 3,
                    cursor: 'pointer',
                  }}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Collapsible: Measurement Tools */}
          <div style={{ borderBottom: '1px solid #1e293b' }}>
            <div
              onClick={() => toggleSection('measure')}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 10px',
                cursor: 'pointer',
                fontWeight: '700',
                color: '#cbd5e1',
                fontSize: '11px',
                backgroundColor: '#0f172a',
              }}
            >
              <span>Measurement Tools</span>
              {expandedSections.measure ? <DownOutlined style={{ fontSize: 10 }} /> : <RightOutlined style={{ fontSize: 10 }} />}
            </div>

            {expandedSections.measure && (
              <div style={{ padding: '6px 8px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4 }}>
                <Tooltip title="Đo khoảng cách (Line mm)">
                  <button
                    onClick={() => setActiveTool('length')}
                    style={{
                      padding: '6px 0',
                      borderRadius: 3,
                      border: activeTool === 'length' ? '1px solid #22c55e' : '1px solid #1e293b',
                      backgroundColor: activeTool === 'length' ? '#14532d' : '#111827',
                      color: activeTool === 'length' ? '#4ade80' : '#cbd5e1',
                      cursor: 'pointer',
                      fontSize: '11px',
                      fontWeight: '600',
                    }}
                  >
                    <LineOutlined style={{ fontSize: 13 }} />
                  </button>
                </Tooltip>

                <Tooltip title="Đo góc (Angle °)">
                  <button
                    onClick={() => setActiveTool('angle')}
                    style={{
                      padding: '6px 0',
                      borderRadius: 3,
                      border: activeTool === 'angle' ? '1px solid #f59e0b' : '1px solid #1e293b',
                      backgroundColor: activeTool === 'angle' ? '#78350f' : '#111827',
                      color: activeTool === 'angle' ? '#fbbf24' : '#cbd5e1',
                      cursor: 'pointer',
                      fontSize: '11px',
                      fontWeight: '600',
                    }}
                  >
                    <RadiusSettingOutlined style={{ fontSize: 13 }} />
                  </button>
                </Tooltip>

                <Tooltip title="Đo diện tích Elip (ROI mm²)">
                  <button
                    onClick={() => setActiveTool('roi_ellipse')}
                    style={{
                      padding: '6px 0',
                      borderRadius: 3,
                      border: activeTool === 'roi_ellipse' ? '1px solid #38bdf8' : '1px solid #1e293b',
                      backgroundColor: activeTool === 'roi_ellipse' ? '#0c4a6e' : '#111827',
                      color: activeTool === 'roi_ellipse' ? '#38bdf8' : '#cbd5e1',
                      cursor: 'pointer',
                      fontSize: '11px',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <ellipse cx="12" cy="12" rx="10" ry="6" />
                    </svg>
                  </button>
                </Tooltip>

                <Tooltip title="Đo diện tích Chữ nhật (ROI mm²)">
                  <button
                    onClick={() => setActiveTool('roi_rect')}
                    style={{
                      padding: '6px 0',
                      borderRadius: 3,
                      border: activeTool === 'roi_rect' ? '1px solid #a855f7' : '1px solid #1e293b',
                      backgroundColor: activeTool === 'roi_rect' ? '#581c87' : '#111827',
                      color: activeTool === 'roi_rect' ? '#c084fc' : '#cbd5e1',
                      cursor: 'pointer',
                      fontSize: '11px',
                      fontWeight: '600',
                    }}
                  >
                    <BorderOutlined style={{ fontSize: 13 }} />
                  </button>
                </Tooltip>

                <Tooltip title="Xóa tất cả thước đo lát cắt này">
                  <button
                    onClick={handleClearAnnotations}
                    style={{
                      gridColumn: 'span 4',
                      padding: '4px 0',
                      marginTop: 2,
                      borderRadius: 3,
                      border: '1px solid #334155',
                      backgroundColor: '#1e293b',
                      color: '#f87171',
                      cursor: 'pointer',
                      fontSize: '11px',
                    }}
                  >
                    Xóa đo đạc lát này
                  </button>
                </Tooltip>
              </div>
            )}
          </div>

          {/* Collapsible: Advance Tools */}
          <div style={{ borderBottom: '1px solid #1e293b' }}>
            <div
              onClick={() => toggleSection('advance')}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 10px',
                cursor: 'pointer',
                fontWeight: '700',
                color: '#cbd5e1',
                fontSize: '11px',
                backgroundColor: '#0f172a',
              }}
            >
              <span>Advance Tools</span>
              {expandedSections.advance ? <DownOutlined style={{ fontSize: 10 }} /> : <RightOutlined style={{ fontSize: 10 }} />}
            </div>

            {expandedSections.advance && (
              <div style={{ padding: '6px 8px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                <button
                  onClick={() => message.info('Tính năng 3D Volume Rendering đang cập nhật')}
                  style={{
                    padding: '5px 8px',
                    textAlign: 'left',
                    borderRadius: 3,
                    border: '1px solid #1e293b',
                    backgroundColor: '#111827',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    fontSize: '11px',
                  }}
                >
                  3D Volume View
                </button>
                <button
                  onClick={() => message.info('Tính năng MPR đa mặt cắt đang cập nhật')}
                  style={{
                    padding: '5px 8px',
                    textAlign: 'left',
                    borderRadius: 3,
                    border: '1px solid #1e293b',
                    backgroundColor: '#111827',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    fontSize: '11px',
                  }}
                >
                  MPR Reconstruct
                </button>
              </div>
            )}
          </div>

          {/* Collapsible: Image Tools */}
          <div style={{ borderBottom: '1px solid #1e293b' }}>
            <div
              onClick={() => toggleSection('image')}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 10px',
                cursor: 'pointer',
                fontWeight: '700',
                color: '#cbd5e1',
                fontSize: '11px',
                backgroundColor: '#0f172a',
              }}
            >
              <span>Image Tools</span>
              {expandedSections.image ? <DownOutlined style={{ fontSize: 10 }} /> : <RightOutlined style={{ fontSize: 10 }} />}
            </div>

            {expandedSections.image && (
              <div style={{ padding: '6px 8px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
                  <button
                    onClick={() => setFlipH((prev) => !prev)}
                    style={{
                      padding: '4px 0',
                      borderRadius: 3,
                      border: '1px solid #1e293b',
                      backgroundColor: flipH ? '#1e3a8a' : '#111827',
                      color: '#cbd5e1',
                      cursor: 'pointer',
                      fontSize: '11px',
                    }}
                  >
                    Flip H
                  </button>
                  <button
                    onClick={() => setFlipV((prev) => !prev)}
                    style={{
                      padding: '4px 0',
                      borderRadius: 3,
                      border: '1px solid #1e293b',
                      backgroundColor: flipV ? '#1e3a8a' : '#111827',
                      color: '#cbd5e1',
                      cursor: 'pointer',
                      fontSize: '11px',
                    }}
                  >
                    Flip V
                  </button>
                </div>

                <button
                  onClick={() => setRotation((prev) => (prev + 90) % 360)}
                  style={{
                    padding: '4px 0',
                    borderRadius: 3,
                    border: '1px solid #1e293b',
                    backgroundColor: '#111827',
                    color: '#cbd5e1',
                    cursor: 'pointer',
                    fontSize: '11px',
                  }}
                >
                  Xoay 90° (Hiện tại: {rotation}°)
                </button>

                <button
                  onClick={handleReset}
                  style={{
                    padding: '4px 0',
                    borderRadius: 3,
                    border: '1px solid #1e293b',
                    backgroundColor: '#111827',
                    color: '#cbd5e1',
                    cursor: 'pointer',
                    fontSize: '11px',
                  }}
                >
                  Reset hiển thị
                </button>
              </div>
            )}
          </div>

          {/* Collapsible: Sync Tools */}
          <div>
            <div
              onClick={() => toggleSection('sync')}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 10px',
                cursor: 'pointer',
                fontWeight: '700',
                color: '#cbd5e1',
                fontSize: '11px',
                backgroundColor: '#0f172a',
              }}
            >
              <span>Sync Tools</span>
              {expandedSections.sync ? <DownOutlined style={{ fontSize: 10 }} /> : <RightOutlined style={{ fontSize: 10 }} />}
            </div>

            {expandedSections.sync && (
              <div style={{ padding: '6px 8px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: '11px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <input type="checkbox" defaultChecked /> Đồng bộ cuộn Cine
                </label>
                <label style={{ fontSize: '11px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <input type="checkbox" defaultChecked /> Đồng bộ cửa sổ WW/WL
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Viewport Stage (Black Background) */}
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
          {/* Main Viewport Pane 1 */}
          <div
            ref={viewportRef}
            onClick={() => setActiveViewport(0)}
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onContextMenu={(e) => e.preventDefault()}
            style={{
              position: 'relative',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: '#000000',
              overflow: 'hidden',
              border: activeViewport === 0 ? '1.5px solid #f59e0b' : '1.5px solid #1e293b',
              cursor:
                activeTool === 'pan'
                  ? 'grab'
                  : activeTool === 'length' || activeTool === 'angle' || activeTool.startsWith('roi')
                  ? 'crosshair'
                  : activeTool === 'ww_wl'
                  ? 'all-scroll'
                  : activeTool === 'zoom'
                  ? 'ns-resize'
                  : 'default',
            }}
          >
            {loading && (
              <div style={{ position: 'absolute', zIndex: 30 }}>
                <Spin size="large" />
              </div>
            )}

            {/* Canvas Transformation Wrapper */}
            <div
              style={{
                position: 'relative',
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom}) rotate(${rotation}deg) scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1})`,
                transformOrigin: 'center center',
                transition: isInteracting.current ? 'none' : 'transform 0.05s ease-out',
              }}
            >
              {/* DICOM Pixel Canvas */}
              <canvas
                ref={imageCanvasRef}
                style={{
                  display: 'block',
                  maxWidth: '85vh',
                  maxHeight: '85vh',
                  imageRendering: 'pixelated',
                }}
              />
              {/* Overlay Annotations Canvas */}
              <canvas
                ref={annotationCanvasRef}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  pointerEvents: 'none',
                }}
              />
            </div>

            {/* Floating Micro-toolbar on viewport right edge */}
            <div
              style={{
                position: 'absolute',
                right: 8,
                top: '50%',
                transform: 'translateY(-50%)',
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
                backgroundColor: 'rgba(15, 23, 42, 0.75)',
                padding: '4px',
                borderRadius: 4,
                border: '1px solid rgba(51, 65, 85, 0.5)',
                zIndex: 15,
              }}
            >
              <Tooltip title="Đo khoảng cách (Line mm)" placement="left">
                <button
                  onClick={() => setActiveTool('length')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: activeTool === 'length' ? '#22c55e' : '#94a3b8',
                    cursor: 'pointer',
                    padding: 4,
                  }}
                >
                  <LineOutlined />
                </button>
              </Tooltip>
              <Tooltip title="Độ tương phản (WW/WL)" placement="left">
                <button
                  onClick={() => setActiveTool('ww_wl')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: activeTool === 'ww_wl' ? '#38bdf8' : '#94a3b8',
                    cursor: 'pointer',
                    padding: 4,
                  }}
                >
                  <SunOutlined />
                </button>
              </Tooltip>
              <Tooltip title="Chụp ảnh Key" placement="left">
                <button
                  onClick={handleCaptureKeyImage}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#4ade80',
                    cursor: 'pointer',
                    padding: 4,
                  }}
                >
                  <CameraOutlined />
                </button>
              </Tooltip>
              <Tooltip title="Reset" placement="left">
                <button
                  onClick={handleReset}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    padding: 4,
                  }}
                >
                  <ReloadOutlined />
                </button>
              </Tooltip>
            </div>

            {/* 4-Corner Clinical Monospace HUD Overlays */}
            {currentMeta && (
              <>
                {/* Top-Left HUD */}
                <div
                  style={{
                    position: 'absolute',
                    top: 8,
                    left: 10,
                    color: '#f59e0b',
                    fontSize: '11px',
                    fontFamily: 'monospace',
                    lineHeight: '15px',
                    pointerEvents: 'none',
                    textShadow: '1px 1px 2px #000',
                  }}
                >
                  <div><strong>{study?.patientName || currentMeta.patientName || 'Bệnh nhân'}</strong></div>
                  <div>Age: {currentMeta.age || '023Y'}</div>
                  <div>PID: {study?.patientId || currentMeta.patientId || patientDiagnoseId}</div>
                  <div>{study?.studyDate || '2025-10-23 08:26:16'}</div>
                  <div>Laterality: L</div>
                  <div>ViewPosition: PA</div>
                </div>

                {/* Top-Right HUD */}
                <div
                  style={{
                    position: 'absolute',
                    top: 8,
                    right: 40,
                    color: '#f59e0b',
                    fontSize: '11px',
                    fontFamily: 'monospace',
                    lineHeight: '15px',
                    textAlign: 'right',
                    pointerEvents: 'none',
                    textShadow: '1px 1px 2px #000',
                  }}
                >
                  <div>Series Index: 1</div>
                  <div>Image: {currentIndex + 1}/{instances.length}</div>
                </div>

                {/* Bottom-Left HUD: Color LUT Selector */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: 8,
                    left: 10,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: '11px',
                    fontFamily: 'monospace',
                    color: '#94a3b8',
                    zIndex: 10,
                  }}
                >
                  <span>Color:</span>
                  <select
                    value={colorLut}
                    onChange={(e) => setColorLut(e.target.value)}
                    style={{
                      backgroundColor: 'rgba(15, 23, 42, 0.85)',
                      color: '#f8fafc',
                      border: '1px solid #334155',
                      borderRadius: 3,
                      padding: '2px 4px',
                      fontSize: '10px',
                      cursor: 'pointer',
                    }}
                  >
                    {COLOR_LUTS.map((lut) => (
                      <option key={lut.value} value={lut.value}>
                        {lut.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Bottom-Right HUD */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: 8,
                    right: 40,
                    color: '#94a3b8',
                    fontSize: '11px',
                    fontFamily: 'monospace',
                    lineHeight: '15px',
                    textAlign: 'right',
                    pointerEvents: 'none',
                    textShadow: '1px 1px 2px #000',
                  }}
                >
                  <div>Zoom: {zoom.toFixed(2)}</div>
                  <div>WW/WL: {Math.round(windowWidth)}/{Math.round(windowCenter)}</div>
                  <div>Upload by: system</div>
                </div>
              </>
            )}

            {/* Empty State */}
            {!loading && instances.length === 0 && (
              <div style={{ textAlign: 'center', color: '#64748b' }}>
                <p style={{ fontSize: '15px', marginBottom: 12 }}>Chưa có file ảnh DICOM cho ca này</p>
                <Upload showUploadList={false} beforeUpload={handleUploadDicom} accept=".dcm,.zip">
                  <Button type="primary" icon={<UploadOutlined />}>
                    Tải lên file DICOM (.dcm / .zip)
                  </Button>
                </Upload>
              </div>
            )}
          </div>

          {/* Viewport Pane 2 (When Layout 1x2 or 2x2 is enabled) */}
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
              {/* Top-Left & Right HUD for Pane 2 */}
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
                <div>Series Index: 0</div>
                <div>Image: 0/0</div>
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
      </div>
    </div>
  );
}
