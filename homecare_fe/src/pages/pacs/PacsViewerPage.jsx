import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import {
  Button,
  Tooltip,
  Dropdown,
  message,
  Spin,
  Slider,
  Upload,
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
  CompressOutlined,
  UndoOutlined,
} from '@ant-design/icons';
import { parseDicomBuffer, renderDicomToCanvas } from './services/dicomDecoder';

const WW_WL_PRESETS = [
  { key: 'default', label: 'Mặc định (File DICOM)' },
  { key: 'lung', label: 'CT Cửa sổ Phổi (W: 1500, L: -600)', ww: 1500, wl: -600 },
  { key: 'bone', label: 'CT Cửa sổ Xương (W: 2000, L: 400)', ww: 2000, wl: 400 },
  { key: 'soft_tissue', label: 'CT Mô mềm (W: 350, L: 50)', ww: 350, wl: 50 },
  { key: 'brain', label: 'CT Sọ não (W: 80, L: 40)', ww: 80, wl: 40 },
  { key: 'abdomen', label: 'CT Bụng / Gan (W: 400, L: 50)', ww: 400, wl: 50 },
];

export default function PacsViewerPage() {
  const [searchParams] = useSearchParams();
  const patientDiagnoseId = searchParams.get('patientDiagnoseId');

  // Study & Slice State
  const [loading, setLoading] = useState(true);
  const [study, setStudy] = useState(null);
  const [instances, setInstances] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // DICOM Decoded Cache: index -> { meta, rawPixels }
  const [dicomCache, setDicomCache] = useState({});

  // Viewer Transformation & Settings
  const [activeTool, setActiveTool] = useState('length'); // 'select', 'pan', 'zoom', 'length', 'angle', 'roi', 'ww_wl'
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [invert, setInvert] = useState(false);
  const [windowCenter, setWindowCenter] = useState(40);
  const [windowWidth, setWindowWidth] = useState(400);

  // Annotations per slice: { [sliceIndex]: Array<Measurement> }
  // Measurement: { id, type: 'length'|'angle'|'roi', points: [{x, y}], valueText: string }
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
  const startWW = useRef({ ww: 400, wl: 40 });

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

  // Redraw Image Canvas when pixels or WW/WL/Invert changes
  useEffect(() => {
    const currentData = dicomCache[currentIndex];
    const canvas = imageCanvasRef.current;
    if (!currentData || !canvas) return;

    renderDicomToCanvas(canvas, currentData.rawPixels, currentData.meta, {
      windowCenter,
      windowWidth,
      invert,
    });
  }, [dicomCache, currentIndex, windowCenter, windowWidth, invert]);

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
          // Line
          ctx.strokeStyle = '#22c55e'; // Bright green
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();

          // End ticks
          ctx.fillStyle = '#22c55e';
          ctx.beginPath();
          ctx.arc(p1.x, p1.y, 4, 0, Math.PI * 2);
          ctx.arc(p2.x, p2.y, 4, 0, Math.PI * 2);
          ctx.fill();

          // Distance Label
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
          if (p3) {
            ctx.lineTo(p3.x, p3.y);
          }
          ctx.stroke();

          if (ann.valueText && p2) {
            ctx.font = 'bold 14px sans-serif';
            ctx.fillStyle = '#f59e0b';
            ctx.fillText(ann.valueText, p2.x + 8, p2.y - 8);
          }
        }
      } else if (ann.type === 'roi') {
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
      }
      ctx.restore();
    }
  }, [annotations, currentDrawing, currentIndex, dicomCache]);

  useEffect(() => {
    redrawAnnotations();
  }, [redrawAnnotations]);

  // Mouse Wheel: Scroll through Slices (CT Cine mode)
  const handleWheel = (e) => {
    e.preventDefault();
    if (instances.length <= 1) return;

    if (e.deltaY > 0) {
      setCurrentIndex((prev) => Math.min(prev + 1, instances.length - 1));
    } else {
      setCurrentIndex((prev) => Math.max(prev - 1, 0));
    }
  };

  // Convert Viewport Mouse Coordinates to DICOM Canvas Space
  const getCanvasCoordinates = (e) => {
    const canvas = imageCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const clientX = e.clientX;
    const clientY = e.clientY;

    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;
    return { x: Math.round(x), y: Math.round(y) };
  };

  // Mouse Down
  const handleMouseDown = (e) => {
    if (e.button !== 0 && e.button !== 1 && e.button !== 2) return;
    isInteracting.current = true;
    startPos.current = { x: e.clientX, y: e.clientY };
    startPan.current = { ...pan };
    startWW.current = { ww: windowWidth, wl: windowCenter };

    const coords = getCanvasCoordinates(e);

    if (activeTool === 'length') {
      setCurrentDrawing({
        id: `m_${Date.now()}`,
        type: 'length',
        points: [coords, coords],
        valueText: '0.0 mm',
      });
    } else if (activeTool === 'roi') {
      setCurrentDrawing({
        id: `m_${Date.now()}`,
        type: 'roi',
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

    if (activeTool === 'pan' || e.button === 1) {
      setPan({
        x: startPan.current.x + dx,
        y: startPan.current.y + dy,
      });
      return;
    }

    if (activeTool === 'zoom') {
      const zoomFactor = 1 - dy * 0.005;
      setZoom((prev) => Math.max(0.2, Math.min(prev * zoomFactor, 10)));
      startPos.current = { x: e.clientX, y: e.clientY };
      return;
    }

    if (activeTool === 'ww_wl' || e.button === 2) {
      const newWW = Math.max(10, startWW.current.ww + dx * 2);
      const newWL = startWW.current.wl - dy * 2;
      setWindowWidth(newWW);
      setWindowCenter(newWL);
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
    } else if (activeTool === 'roi' && currentDrawing) {
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
    }
  };

  // Mouse Up
  const handleMouseUp = () => {
    if (!isInteracting.current) return;
    isInteracting.current = false;

    if (currentDrawing) {
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
    setInvert(false);
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

  // Key Image Capture (Chụp ảnh Key)
  const handleCaptureKeyImage = async () => {
    const imgCanvas = imageCanvasRef.current;
    const annCanvas = annotationCanvasRef.current;
    if (!imgCanvas || !annCanvas) {
      message.error('Không tìm thấy hình ảnh để chụp');
      return;
    }

    try {
      // 1. Create composite canvas combining image + annotations + corner metadata
      const compositeCanvas = document.createElement('canvas');
      compositeCanvas.width = imgCanvas.width;
      compositeCanvas.height = imgCanvas.height;
      const ctx = compositeCanvas.getContext('2d');

      // Draw Base DICOM image
      ctx.drawImage(imgCanvas, 0, 0);
      // Draw Measurements
      ctx.drawImage(annCanvas, 0, 0);

      // Draw Overlay Text Watermark
      const currentData = dicomCache[currentIndex];
      ctx.save();
      ctx.fillStyle = '#22c55e';
      ctx.font = 'bold 16px sans-serif';
      const patientTitle = `${currentData?.meta?.patientName || 'Bệnh nhân'} - PID: ${currentData?.meta?.patientId || ''}`;
      ctx.fillText(patientTitle, 16, 28);

      const sliceTitle = `Lát cắt #${currentIndex + 1}/${instances.length} | WW: ${windowWidth} WL: ${windowCenter}`;
      ctx.font = '14px sans-serif';
      ctx.fillText(sliceTitle, 16, 52);
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

      // 2. Broadcast to Reading Form tab via BroadcastChannel & window.opener
      const messagePayload = {
        type: 'KEY_IMAGE_CAPTURED',
        patientDiagnoseId: Number(patientDiagnoseId),
        dataUrl,
        caption: captionText,
        sliceIndex: currentIndex,
        sopInstanceUid: instances[currentIndex]?.sopInstanceUid,
        measurements: sliceAnn.map((a) => ({
          type: a.type,
          value: a.valueText,
        })),
      };

      if (broadcastChannelRef.current) {
        broadcastChannelRef.current.postMessage(messagePayload);
      }
      if (window.opener) {
        window.opener.postMessage(messagePayload, '*');
      }

      // 3. Save snapshot to Backend
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

      message.success(
        'Đã chụp ảnh Key thành công! Ảnh đã tự động chuyển sang mục Hình ảnh minh họa.',
        4
      );
    } catch (err) {
      console.error('Lỗi khi chụp ảnh Key:', err);
      message.error('Không thể lưu ảnh Key: ' + (err.response?.data?.message || err.message));
    }
  };

  // Keyboard Shortcuts: Space or S for Key Image Capture
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

  // Upload handler for Admin/Doctor uploading new DICOM files
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
    return false; // Prevent Ant Design default upload
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
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      {/* ----------------- TOP BAR ----------------- */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '8px 16px',
          backgroundColor: '#0f172a',
          borderBottom: '1px solid #1e293b',
          zIndex: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontWeight: '700', fontSize: '15px', color: '#38bdf8' }}>
            PACS VIEWER
          </span>
          {study && (
            <div style={{ fontSize: '12px', color: '#94a3b8' }}>
              <span style={{ color: '#f8fafc', fontWeight: '600' }}>
                {study.patientName || 'Bệnh nhân'}
              </span>{' '}
              | PID: <span style={{ color: '#cbd5e1' }}>{study.patientId || patientDiagnoseId}</span>{' '}
              | Loại máy: <span style={{ color: '#38bdf8', fontWeight: '600' }}>{study.modality}</span>{' '}
              | Lát cắt: <span style={{ color: '#22c55e' }}>{currentIndex + 1}/{instances.length}</span>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Upload
            showUploadList={false}
            beforeUpload={handleUploadDicom}
            accept=".dcm,.zip"
          >
            <Button
              size="small"
              icon={<UploadOutlined />}
              style={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#cbd5e1' }}
            >
              Tải thêm DICOM
            </Button>
          </Upload>

          <Button
            type="primary"
            icon={<CameraOutlined />}
            onClick={handleCaptureKeyImage}
            style={{
              backgroundColor: '#16a34a',
              borderColor: '#15803d',
              fontWeight: '600',
              boxShadow: '0 0 10px rgba(22, 163, 74, 0.4)',
            }}
          >
            Chụp ảnh Key
          </Button>

          <Button
            size="small"
            icon={<CloseOutlined />}
            onClick={() => window.close()}
            style={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#94a3b8' }}
          >
            Đóng
          </Button>
        </div>
      </div>

      {/* ----------------- TOOLBAR ----------------- */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '6px 16px',
          backgroundColor: '#0f172a',
          borderBottom: '1px solid #1e293b',
          flexWrap: 'wrap',
        }}
      >
        <span style={{ fontSize: '11px', color: '#64748b', marginRight: 4 }}>Công cụ:</span>

        <Tooltip title="Thước đo chiều dài nốt / tổn thương (mm)">
          <Button
            size="small"
            type={activeTool === 'length' ? 'primary' : 'default'}
            onClick={() => setActiveTool('length')}
            style={activeTool !== 'length' ? { backgroundColor: '#1e293b', borderColor: '#334155', color: '#cbd5e1' } : {}}
          >
            Đo chiều dài (mm)
          </Button>
        </Tooltip>

        <Tooltip title="Đo diện tích elip (mm²)">
          <Button
            size="small"
            type={activeTool === 'roi' ? 'primary' : 'default'}
            onClick={() => setActiveTool('roi')}
            style={activeTool !== 'roi' ? { backgroundColor: '#1e293b', borderColor: '#334155', color: '#cbd5e1' } : {}}
          >
            Đo diện tích (ROI)
          </Button>
        </Tooltip>

        <Tooltip title="Chỉnh tương phản sáng tối tự do (Kéo chuột)">
          <Button
            size="small"
            type={activeTool === 'ww_wl' ? 'primary' : 'default'}
            onClick={() => setActiveTool('ww_wl')}
            style={activeTool !== 'ww_wl' ? { backgroundColor: '#1e293b', borderColor: '#334155', color: '#cbd5e1' } : {}}
          >
            Độ tương phản (WW/WL)
          </Button>
        </Tooltip>

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
          <Button
            size="small"
            style={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#cbd5e1' }}
          >
            Cửa sổ mẫu
          </Button>
        </Dropdown>

        <Tooltip title="Di chuyển ảnh (Pan)">
          <Button
            size="small"
            type={activeTool === 'pan' ? 'primary' : 'default'}
            icon={<DragOutlined />}
            onClick={() => setActiveTool('pan')}
            style={activeTool !== 'pan' ? { backgroundColor: '#1e293b', borderColor: '#334155', color: '#cbd5e1' } : {}}
          />
        </Tooltip>

        <Tooltip title="Phóng to / Thu nhỏ">
          <Button
            size="small"
            type={activeTool === 'zoom' ? 'primary' : 'default'}
            icon={<ZoomInOutlined />}
            onClick={() => setActiveTool('zoom')}
            style={activeTool !== 'zoom' ? { backgroundColor: '#1e293b', borderColor: '#334155', color: '#cbd5e1' } : {}}
          />
        </Tooltip>

        <Tooltip title="Đảo âm bản / dương bản">
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => setInvert((prev) => !prev)}
            style={{
              backgroundColor: invert ? '#3b82f6' : '#1e293b',
              borderColor: '#334155',
              color: '#cbd5e1',
            }}
          />
        </Tooltip>

        <Tooltip title="Xoay 90 độ">
          <Button
            size="small"
            icon={<UndoOutlined />}
            onClick={() => setRotation((prev) => (prev + 90) % 360)}
            style={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#cbd5e1' }}
          />
        </Tooltip>

        <Tooltip title="Xóa các đường đo trên lát cắt này">
          <Button
            size="small"
            icon={<DeleteOutlined />}
            onClick={handleClearAnnotations}
            style={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f87171' }}
          />
        </Tooltip>

        <Tooltip title="Khôi phục trạng thái ban đầu">
          <Button
            size="small"
            icon={<ReloadOutlined />}
            onClick={handleReset}
            style={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#cbd5e1' }}
          />
        </Tooltip>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: '11px', color: '#94a3b8' }}>
            WW: <strong style={{ color: '#f8fafc' }}>{Math.round(windowWidth)}</strong> | WL:{' '}
            <strong style={{ color: '#f8fafc' }}>{Math.round(windowCenter)}</strong>
          </span>
          <span style={{ fontSize: '11px', color: '#94a3b8' }}>
            Zoom: <strong style={{ color: '#f8fafc' }}>{Math.round(zoom * 100)}%</strong>
          </span>
        </div>
      </div>

      {/* ----------------- MAIN CONTENT (SIDEBAR + VIEWPORT) ----------------- */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left Thumbnails Strip */}
        <div
          style={{
            width: 110,
            backgroundColor: '#070b14',
            borderRight: '1px solid #1e293b',
            overflowY: 'auto',
            padding: '8px 4px',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          {instances.map((inst, idx) => (
            <div
              key={inst.sopInstanceUid || idx}
              onClick={() => setCurrentIndex(idx)}
              style={{
                borderRadius: 4,
                padding: 4,
                backgroundColor: currentIndex === idx ? '#1e293b' : 'transparent',
                border: currentIndex === idx ? '2px solid #38bdf8' : '1px solid #1e293b',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.15s ease',
              }}
            >
              <div
                style={{
                  width: '100%',
                  height: 70,
                  backgroundColor: '#0f172a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#64748b',
                  fontSize: '11px',
                }}
              >
                #{idx + 1}
              </div>
              <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: 2 }}>
                Lát #{inst.instanceNumber || idx + 1}
              </div>
            </div>
          ))}
          {instances.length === 0 && (
            <div style={{ padding: 12, textAlign: 'center', fontSize: '11px', color: '#64748b' }}>
              Chưa có lát cắt
            </div>
          )}
        </div>

        {/* Center Viewport */}
        <div
          ref={viewportRef}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onContextMenu={(e) => e.preventDefault()}
          style={{
            flex: 1,
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            backgroundColor: '#000',
            cursor:
              activeTool === 'length' || activeTool === 'roi'
                ? 'crosshair'
                : activeTool === 'pan'
                ? 'grab'
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

          {/* Canvas Wrapper with Zoom, Pan, Rotation */}
          <div
            style={{
              position: 'relative',
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom}) rotate(${rotation}deg)`,
              transformOrigin: 'center center',
              transition: isInteracting.current ? 'none' : 'transform 0.05s ease-out',
            }}
          >
            {/* DICOM Image Pixel Layer */}
            <canvas
              ref={imageCanvasRef}
              style={{
                display: 'block',
                maxWidth: '85vh',
                maxHeight: '85vh',
                imageRendering: 'pixelated',
              }}
            />
            {/* Measurement & Annotation Overlay Layer */}
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

          {/* Corner DICOM Overlays */}
          {currentMeta && (
            <>
              {/* Top-Left */}
              <div
                style={{
                  position: 'absolute',
                  top: 12,
                  left: 16,
                  color: '#22c55e',
                  fontSize: '12px',
                  lineHeight: '18px',
                  pointerEvents: 'none',
                  textShadow: '1px 1px 2px #000',
                }}
              >
                <div><strong>{currentMeta.patientName || 'Bệnh nhân'}</strong></div>
                <div>PID: {currentMeta.patientId || patientDiagnoseId}</div>
                <div>Loại máy: {currentMeta.modality}</div>
              </div>

              {/* Top-Right */}
              <div
                style={{
                  position: 'absolute',
                  top: 12,
                  right: 16,
                  color: '#22c55e',
                  fontSize: '12px',
                  lineHeight: '18px',
                  textAlign: 'right',
                  pointerEvents: 'none',
                  textShadow: '1px 1px 2px #000',
                }}
              >
                <div>HomeCare PACS</div>
                <div>{currentMeta.studyDate || '2026'}</div>
                <div>{currentMeta.seriesDescription || ''}</div>
              </div>

              {/* Bottom-Left */}
              <div
                style={{
                  position: 'absolute',
                  bottom: 12,
                  left: 16,
                  color: '#22c55e',
                  fontSize: '12px',
                  lineHeight: '18px',
                  pointerEvents: 'none',
                  textShadow: '1px 1px 2px #000',
                }}
              >
                <div>Lát cắt: {currentIndex + 1} / {instances.length}</div>
                <div>Kích thước: {currentMeta.columns} x {currentMeta.rows}</div>
                <div>Độ phân giải: {currentMeta.pixelSpacing?.[0]?.toFixed(2)} mm/px</div>
              </div>

              {/* Bottom-Right */}
              <div
                style={{
                  position: 'absolute',
                  bottom: 12,
                  right: 16,
                  color: '#22c55e',
                  fontSize: '12px',
                  lineHeight: '18px',
                  textAlign: 'right',
                  pointerEvents: 'none',
                  textShadow: '1px 1px 2px #000',
                }}
              >
                <div>WW: {Math.round(windowWidth)} WL: {Math.round(windowCenter)}</div>
                <div>Zoom: {Math.round(zoom * 100)}%</div>
                <div>Phím tắt chụp: <strong>Space / Ctrl+S</strong></div>
              </div>
            </>
          )}

          {/* Empty State */}
          {!loading && instances.length === 0 && (
            <div style={{ textAlign: 'center', color: '#64748b' }}>
              <p style={{ fontSize: '16px', marginBottom: 12 }}>Chưa có file DICOM cho ca bệnh này</p>
              <Upload showUploadList={false} beforeUpload={handleUploadDicom} accept=".dcm,.zip">
                <Button type="primary" icon={<UploadOutlined />}>
                  Tải lên file DICOM (.dcm / .zip)
                </Button>
              </Upload>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

