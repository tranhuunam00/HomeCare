import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Modal, Slider, Button, Tooltip, Progress, Select } from 'antd';
import {
  CloseOutlined,
  ReloadOutlined,
  LoadingOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import axios from 'axios';
import { parseDicomBuffer } from '../services/dicomDecoder';

/**
 * VR-PACS 3D Volume & Multi-Planar Reconstruction (MPR) Tool
 * Computes isotropic Axial, Sagittal, Coronal planes and 3D Volume MIP from CT/MRI slices.
 */
export default function PacsMprModal({
  open,
  onClose,
  instances = [],
  dicomCache = {},
  setDicomCache,
  apiEndpoint = 'http://localhost:3001',
  getAuthHeaders = () => ({}),
  patientName = 'Bệnh nhân',
  modality = 'MR',
}) {
  // Loading progress state for fetching remaining DICOM slices
  const [downloadProgress, setDownloadProgress] = useState({
    loading: false,
    loaded: 0,
    total: 0,
    percent: 0,
  });

  // Local cache combining parent dicomCache and newly downloaded slices
  const [localCache, setLocalCache] = useState(dicomCache);

  useEffect(() => {
    setLocalCache((prev) => ({ ...prev, ...dicomCache }));
  }, [dicomCache]);

  // Slices in current multi-slice volume
  const validSlices = useMemo(() => {
    return Object.keys(localCache)
      .map(Number)
      .sort((a, b) => a - b)
      .map((idx) => localCache[idx])
      .filter((item) => item && item.rawPixels && item.meta);
  }, [localCache]);

  const numSlices = validSlices.length;
  const sampleMeta = validSlices[0]?.meta || {};
  const rows = sampleMeta.rows || 256;
  const cols = sampleMeta.columns || 256;

  // Viewport display resolution for isotropic MPR
  const RENDER_RES = 256;

  // Crosshair coordinates in 3D volume space [0..cols-1, 0..rows-1, 0..numSlices-1]
  const [crosshair, setCrosshair] = useState({
    x: 128,
    y: 128,
    z: 0,
  });

  // 3D Rotation angles and Rendering Parameters
  const [rot3D, setRot3D] = useState({ angleX: 15, angleY: 35 });
  const [threshold3D, setThreshold3D] = useState(modality === 'MR' ? 25 : 35);
  const [colorMode3D, setColorMode3D] = useState('bone'); // 'bone' | 'grayscale' | 'rainbow'

  // Canvas refs for the 4 viewports
  const axialCanvasRef = useRef(null);
  const sagittalCanvasRef = useRef(null);
  const coronalCanvasRef = useRef(null);
  const volumeCanvasRef = useRef(null);

  // Background fetch of all missing slices when modal opens
  useEffect(() => {
    if (!open || instances.length === 0) return;

    let isCancelled = false;

    const fetchAllSlices = async () => {
      const missingIndices = [];
      instances.forEach((inst, idx) => {
        if (!localCache[idx]?.rawPixels) {
          missingIndices.push({ index: idx, instance: inst });
        }
      });

      if (missingIndices.length === 0) {
        setDownloadProgress({
          loading: false,
          loaded: instances.length,
          total: instances.length,
          percent: 100,
        });
        return;
      }

      setDownloadProgress({
        loading: true,
        loaded: instances.length - missingIndices.length,
        total: instances.length,
        percent: Math.round(((instances.length - missingIndices.length) / instances.length) * 100),
      });

      const batchSize = 4;
      let completed = instances.length - missingIndices.length;
      const newSlices = {};

      for (let i = 0; i < missingIndices.length; i += batchSize) {
        if (isCancelled) break;
        const chunk = missingIndices.slice(i, i + batchSize);

        await Promise.all(
          chunk.map(async ({ index, instance }) => {
            try {
              const res = await axios.get(
                `${apiEndpoint}/api/pacs/instances/${instance.sopInstanceUid}/file`,
                {
                  responseType: 'arraybuffer',
                  headers: getAuthHeaders(),
                }
              );
              const parsed = parseDicomBuffer(res.data);
              newSlices[index] = parsed;
              completed++;
            } catch (err) {
              console.warn(`Lỗi tải lát cắt #${index}:`, err);
            }
          })
        );

        if (!isCancelled) {
          setLocalCache((prev) => ({ ...prev, ...newSlices }));
          if (setDicomCache) {
            setDicomCache((prev) => ({ ...prev, ...newSlices }));
          }
          setDownloadProgress({
            loading: completed < instances.length,
            loaded: completed,
            total: instances.length,
            percent: Math.round((completed / instances.length) * 100),
          });
        }
      }

      if (!isCancelled) {
        setDownloadProgress((prev) => ({ ...prev, loading: false, percent: 100 }));
      }
    };

    fetchAllSlices();

    return () => {
      isCancelled = true;
    };
  }, [open, instances, apiEndpoint, getAuthHeaders, setDicomCache]);

  // Synchronize initial crosshairs once slices are ready
  useEffect(() => {
    if (numSlices > 0) {
      setCrosshair({
        x: Math.floor(cols / 2),
        y: Math.floor(rows / 2),
        z: Math.floor(numSlices / 2),
      });
    }
  }, [numSlices, cols, rows]);

  // Helper: Sample a pixel with bilinear / nearest fallback
  const getVoxelValue = useCallback(
    (x, y, zFloat) => {
      if (numSlices <= 0) return 0;
      const clampedZ = Math.max(0, Math.min(numSlices - 1, zFloat));
      const z0 = Math.floor(clampedZ);
      const z1 = Math.min(numSlices - 1, z0 + 1);
      const t = clampedZ - z0;

      const slice0 = validSlices[z0]?.rawPixels;
      const slice1 = validSlices[z1]?.rawPixels;
      if (!slice0) return 0;

      const px0 = slice0[y * cols + x] || 0;
      if (t === 0 || !slice1) return px0;

      const px1 = slice1[y * cols + x] || 0;
      return (1 - t) * px0 + t * px1;
    },
    [validSlices, numSlices, cols]
  );

  // --- 1. Render AXIAL View (X-Y plane at Z) ---
  useEffect(() => {
    const canvas = axialCanvasRef.current;
    if (!canvas || numSlices === 0) return;
    const ctx = canvas.getContext('2d');
    const zIdx = Math.max(0, Math.min(crosshair.z, numSlices - 1));
    const slice = validSlices[zIdx];
    if (!slice) return;

    canvas.width = RENDER_RES;
    canvas.height = RENDER_RES;
    const imgData = ctx.createImageData(RENDER_RES, RENDER_RES);
    const pixels = slice.rawPixels;

    for (let sy = 0; sy < RENDER_RES; sy++) {
      const srcY = Math.floor((sy / RENDER_RES) * rows);
      for (let sx = 0; sx < RENDER_RES; sx++) {
        const srcX = Math.floor((sx / RENDER_RES) * cols);
        const val = Math.min(255, Math.max(0, pixels[srcY * cols + srcX] || 0));
        const outIdx = (sy * RENDER_RES + sx) * 4;
        imgData.data[outIdx] = val;
        imgData.data[outIdx + 1] = val;
        imgData.data[outIdx + 2] = val;
        imgData.data[outIdx + 3] = 255;
      }
    }
    ctx.putImageData(imgData, 0, 0);

    // Crosshairs
    const screenX = (crosshair.x / cols) * RENDER_RES;
    const screenY = (crosshair.y / rows) * RENDER_RES;
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);

    ctx.beginPath();
    ctx.moveTo(screenX, 0);
    ctx.lineTo(screenX, RENDER_RES);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, screenY);
    ctx.lineTo(RENDER_RES, screenY);
    ctx.stroke();
  }, [crosshair, validSlices, cols, rows, numSlices]);

  // --- 2. Render SAGITTAL View (Y-Z plane at X with Z-Interpolation) ---
  useEffect(() => {
    const canvas = sagittalCanvasRef.current;
    if (!canvas || numSlices === 0) return;
    const ctx = canvas.getContext('2d');
    const targetX = Math.max(0, Math.min(cols - 1, crosshair.x));

    canvas.width = RENDER_RES;
    canvas.height = RENDER_RES;
    const imgData = ctx.createImageData(RENDER_RES, RENDER_RES);

    for (let sy = 0; sy < RENDER_RES; sy++) {
      // Map vertical screen coordinate sy (0..255) to Z (0..numSlices-1)
      const zFloat = (sy / (RENDER_RES - 1)) * Math.max(1, numSlices - 1);
      for (let sx = 0; sx < RENDER_RES; sx++) {
        // Map horizontal screen coordinate sx (0..255) to Y (anterior-posterior)
        const srcY = Math.floor((sx / RENDER_RES) * rows);
        const val = Math.min(255, Math.max(0, getVoxelValue(targetX, srcY, zFloat)));
        const outIdx = (sy * RENDER_RES + sx) * 4;
        imgData.data[outIdx] = val;
        imgData.data[outIdx + 1] = val;
        imgData.data[outIdx + 2] = val;
        imgData.data[outIdx + 3] = 255;
      }
    }
    ctx.putImageData(imgData, 0, 0);

    // Crosshairs
    const screenY = (crosshair.y / rows) * RENDER_RES;
    const screenZ = numSlices > 1 ? (crosshair.z / (numSlices - 1)) * RENDER_RES : RENDER_RES / 2;
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);

    ctx.beginPath();
    ctx.moveTo(screenY, 0);
    ctx.lineTo(screenY, RENDER_RES);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, screenZ);
    ctx.lineTo(RENDER_RES, screenZ);
    ctx.stroke();
  }, [crosshair, getVoxelValue, cols, rows, numSlices]);

  // --- 3. Render CORONAL View (X-Z plane at Y with Z-Interpolation) ---
  useEffect(() => {
    const canvas = coronalCanvasRef.current;
    if (!canvas || numSlices === 0) return;
    const ctx = canvas.getContext('2d');
    const targetY = Math.max(0, Math.min(rows - 1, crosshair.y));

    canvas.width = RENDER_RES;
    canvas.height = RENDER_RES;
    const imgData = ctx.createImageData(RENDER_RES, RENDER_RES);

    for (let sy = 0; sy < RENDER_RES; sy++) {
      // Map vertical screen coordinate sy to Z
      const zFloat = (sy / (RENDER_RES - 1)) * Math.max(1, numSlices - 1);
      for (let sx = 0; sx < RENDER_RES; sx++) {
        // Map horizontal screen coordinate sx to X (left-right)
        const srcX = Math.floor((sx / RENDER_RES) * cols);
        const val = Math.min(255, Math.max(0, getVoxelValue(srcX, targetY, zFloat)));
        const outIdx = (sy * RENDER_RES + sx) * 4;
        imgData.data[outIdx] = val;
        imgData.data[outIdx + 1] = val;
        imgData.data[outIdx + 2] = val;
        imgData.data[outIdx + 3] = 255;
      }
    }
    ctx.putImageData(imgData, 0, 0);

    // Crosshairs
    const screenX = (crosshair.x / cols) * RENDER_RES;
    const screenZ = numSlices > 1 ? (crosshair.z / (numSlices - 1)) * RENDER_RES : RENDER_RES / 2;
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);

    ctx.beginPath();
    ctx.moveTo(screenX, 0);
    ctx.lineTo(screenX, RENDER_RES);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, screenZ);
    ctx.lineTo(RENDER_RES, screenZ);
    ctx.stroke();
  }, [crosshair, getVoxelValue, cols, rows, numSlices]);

  // --- 4. Render 3D VOLUME RENDERING (MIP with Depth Shading & Color Palette) ---
  useEffect(() => {
    const canvas = volumeCanvasRef.current;
    if (!canvas || numSlices === 0) return;
    const ctx = canvas.getContext('2d');
    canvas.width = RENDER_RES;
    canvas.height = RENDER_RES;

    ctx.fillStyle = '#05070e';
    ctx.fillRect(0, 0, RENDER_RES, RENDER_RES);

    const imgData = ctx.createImageData(RENDER_RES, RENDER_RES);
    const radY = (rot3D.angleY * Math.PI) / 180;
    const radX = (rot3D.angleX * Math.PI) / 180;
    const cosY = Math.cos(radY);
    const sinY = Math.sin(radY);
    const cosX = Math.cos(radX);
    const sinX = Math.sin(radX);

    // Calculate realistic volume depth scale
    const depthScale = numSlices >= 32 ? 1 : Math.max(1, Math.min(8, 64 / Math.max(1, numSlices)));
    const centerX = cols / 2;
    const centerY = rows / 2;
    const centerZ = numSlices / 2;

    const zStep = Math.max(1, Math.floor(numSlices / 48));

    for (let z = 0; z < numSlices; z += zStep) {
      const slicePixels = validSlices[z]?.rawPixels;
      if (!slicePixels) continue;

      const zRel = (z - centerZ) * depthScale;

      for (let y = 0; y < rows; y += 2) {
        const yRel = y - centerY;
        for (let x = 0; x < cols; x += 2) {
          const val = slicePixels[y * cols + x] || 0;
          if (val < threshold3D) continue;

          const xRel = x - centerX;

          // 3D Matrix Rotation (Rotate Y then Rotate X)
          const rotX1 = xRel * cosY - zRel * sinY;
          const rotZ1 = xRel * sinY + zRel * cosY;

          const rotY2 = yRel * cosX - rotZ1 * sinX;
          const rotZ2 = yRel * sinX + rotZ1 * cosX;

          const projX = Math.round(RENDER_RES / 2 + (rotX1 * RENDER_RES) / (cols * 1.2));
          const projY = Math.round(RENDER_RES / 2 + (rotY2 * RENDER_RES) / (rows * 1.2));

          if (projX >= 0 && projX < RENDER_RES && projY >= 0 && projY < RENDER_RES) {
            const idx = (projY * RENDER_RES + projX) * 4;
            const currentR = imgData.data[idx];

            if (val > currentR) {
              // Apply Color Mode
              if (colorMode3D === 'bone') {
                // VR Bone / Soft tissue anatomical palette (Amber / Warm Gold / Bone White)
                imgData.data[idx] = Math.min(255, val * 1.15); // R
                imgData.data[idx + 1] = Math.min(255, val * 0.88); // G
                imgData.data[idx + 2] = Math.min(255, val * 0.58); // B
              } else if (colorMode3D === 'rainbow') {
                // Jet/Rainbow thermal density gradient
                const norm = val / 255;
                imgData.data[idx] = Math.min(255, Math.floor(Math.sin(norm * Math.PI) * 255));
                imgData.data[idx + 1] = Math.min(255, Math.floor(Math.sin((norm + 0.33) * Math.PI) * 255));
                imgData.data[idx + 2] = Math.min(255, Math.floor(Math.sin((norm + 0.66) * Math.PI) * 255));
              } else {
                // Standard Grayscale MIP
                imgData.data[idx] = val;
                imgData.data[idx + 1] = val;
                imgData.data[idx + 2] = val;
              }
              imgData.data[idx + 3] = 255;
            }
          }
        }
      }
    }

    ctx.putImageData(imgData, 0, 0);

    // Overlay Watermark
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.font = '10px monospace';
    ctx.fillText(`3D MIP (${colorMode3D.toUpperCase()})`, 8, 16);
    ctx.fillText(`Góc xoay: ${Math.round(rot3D.angleX)}°, ${Math.round(rot3D.angleY)}°`, 8, 28);
  }, [validSlices, rot3D, threshold3D, colorMode3D, cols, rows, numSlices]);

  // Handle Dragging in 3D Volume Viewport to Rotate
  const isDragging3D = useRef(false);
  const startMousePos = useRef({ x: 0, y: 0 });

  const handleMouseDown3D = (e) => {
    isDragging3D.current = true;
    startMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove3D = (e) => {
    if (!isDragging3D.current) return;
    const dx = e.clientX - startMousePos.current.x;
    const dy = e.clientY - startMousePos.current.y;
    setRot3D((prev) => ({
      angleX: Math.max(-85, Math.min(85, prev.angleX - dy * 0.6)),
      angleY: (prev.angleY + dx * 0.8) % 360,
    }));
    startMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp3D = () => {
    isDragging3D.current = false;
  };

  // Reset 3D Handler
  const handleReset3D = () => {
    setCrosshair({
      x: Math.floor(cols / 2),
      y: Math.floor(rows / 2),
      z: Math.floor(numSlices / 2),
    });
    setRot3D({ angleX: 15, angleY: 35 });
    setThreshold3D(modality === 'MR' ? 25 : 35);
    setColorMode3D('bone');
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width="95vw"
      style={{ top: 16 }}
      styles={{
        body: {
          padding: 0,
          backgroundColor: '#070b14',
          borderRadius: 8,
          overflow: 'hidden',
        },
      }}
      closeIcon={<CloseOutlined style={{ color: '#ffffff' }} />}
    >
      <div style={{ display: 'flex', flexDirection: 'column', height: '89vh' }}>
        {/* Top Header */}
        <div
          style={{
            height: 48,
            backgroundColor: '#0f172a',
            borderBottom: '1px solid #1e293b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 16px',
            color: '#f8fafc',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span
              style={{
                fontWeight: '800',
                color: '#38bdf8',
                fontSize: '13px',
                letterSpacing: '0.4px',
              }}
            >
              D-PACS 3D VOLUME & MULTI-PLANAR RECONSTRUCTION (MPR)
            </span>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>
              {patientName} ({modality} - {numSlices} lát cắt)
            </span>
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '11px', color: '#cbd5e1' }}>
              <span>Bảng màu 3D:</span>
              <Select
                size="small"
                value={colorMode3D}
                onChange={setColorMode3D}
                style={{ width: 110 }}
                options={[
                  { value: 'bone', label: 'Mô & Xương VR' },
                  { value: 'grayscale', label: 'Trắng đen MIP' },
                  { value: 'rainbow', label: 'Phân tầng nhiệt' },
                ]}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '11px', color: '#cbd5e1' }}>
              <span>Ngưỡng 3D:</span>
              <Slider
                min={5}
                max={150}
                value={threshold3D}
                onChange={setThreshold3D}
                style={{ width: 90 }}
              />
              <span style={{ fontFamily: 'monospace', color: '#38bdf8', width: 22 }}>
                {threshold3D}
              </span>
            </div>

            <Button
              size="small"
              icon={<ReloadOutlined />}
              onClick={handleReset3D}
              style={{
                backgroundColor: '#1e293b',
                color: '#cbd5e1',
                border: '1px solid #334155',
                fontWeight: '600',
              }}
            >
              Reset 3D
            </Button>
          </div>
        </div>

        {/* Low slice count clinical notice banner if study has <= 4 slices */}
        {numSlices > 0 && numSlices <= 4 && (
          <div
            style={{
              backgroundColor: '#172554',
              borderBottom: '1px solid #1e3a8a',
              padding: '6px 16px',
              fontSize: '12px',
              color: '#93c5fd',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <InfoCircleOutlined style={{ color: '#60a5fa' }} />
            <span>
              Ca chụp này hiện có {numSlices} lát cắt (ảnh 2D lát cắt ít). Hệ thống đã tự động nội suy
              không gian để các mặt cắt Sagittal & Coronal hiển thị đầy đặn. Để dựng hình 3D khối giải phẫu
              chi tiết nhất, khuyến nghị nạp bộ chụp đa lát cắt (ví dụ: bộ MRI não 64 lát cắt `mri_brain_64slices.zip`).
            </span>
          </div>
        )}

        {/* Main Stage: Either 3D Loading Screen or 2x2 Grid */}
        {downloadProgress.loading ? (
          <div
            style={{
              flex: 1,
              backgroundColor: '#0a0f1d',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 24,
            }}
          >
            <div
              style={{
                backgroundColor: '#0f172a',
                border: '1.5px solid #38bdf8',
                borderRadius: 12,
                boxShadow: '0 8px 32px rgba(0,0,0,0.8), 0 0 20px rgba(56, 189, 248, 0.3)',
                padding: '28px 36px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                maxWidth: 480,
                width: '100%',
              }}
            >
              <LoadingOutlined style={{ fontSize: 36, color: '#38bdf8', marginBottom: 16 }} spin />
              <div
                style={{
                  fontWeight: '800',
                  color: '#f8fafc',
                  fontSize: '15px',
                  letterSpacing: '0.5px',
                  marginBottom: 6,
                }}
              >
                ĐANG TẢI & NỘI SUY DỮ LIỆU KHÔNG GIAN 3D
              </div>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: 18, textAlign: 'center' }}>
                Đang nạp các lát cắt DICOM từ máy chủ PACS để tái tạo các mặt phẳng Axial, Sagittal, Coronal...
              </div>

              <Progress
                percent={downloadProgress.percent}
                status="active"
                strokeColor={{
                  '0%': '#0284c7',
                  '100%': '#38bdf8',
                }}
                trailColor="#1e293b"
                style={{ width: '100%', marginBottom: 10 }}
              />

              <div style={{ fontSize: '11px', color: '#38bdf8', fontFamily: 'monospace' }}>
                Đã xử lý: {downloadProgress.loaded} / {downloadProgress.total} lát cắt ({downloadProgress.percent}%)
              </div>
            </div>
          </div>
        ) : (
          /* 2x2 Grid Viewports */
          <div
            style={{
              flex: 1,
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gridTemplateRows: '1fr 1fr',
              gap: 4,
              padding: 4,
              backgroundColor: '#000000',
            }}
          >
            {/* VIEWPORT 1: AXIAL (Mặt cắt ngang) */}
            <div
              style={{
                backgroundColor: '#0a0f1d',
                border: '1px solid #1e293b',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: 6,
                  left: 8,
                  zIndex: 10,
                  fontSize: '11px',
                  color: '#38bdf8',
                  fontWeight: '700',
                  backgroundColor: 'rgba(10, 15, 29, 0.75)',
                  padding: '2px 6px',
                  borderRadius: 3,
                }}
              >
                AXIAL (Mặt cắt ngang) | Lát cắt #{crosshair.z + 1}/{numSlices}
              </div>
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  cursor: 'crosshair',
                }}
              >
                <canvas
                  ref={axialCanvasRef}
                  style={{
                    width: '94%',
                    height: '94%',
                    objectFit: 'contain',
                    border: '1px solid #1e293b',
                  }}
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = Math.round(((e.clientX - rect.left) / rect.width) * cols);
                    const y = Math.round(((e.clientY - rect.top) / rect.height) * rows);
                    setCrosshair((prev) => ({ ...prev, x, y }));
                  }}
                />
              </div>
              <div style={{ padding: '0 12px 6px', backgroundColor: '#0a0f1d' }}>
                <Slider
                  min={0}
                  max={Math.max(0, numSlices - 1)}
                  value={crosshair.z}
                  onChange={(z) => setCrosshair((p) => ({ ...p, z }))}
                  tooltip={{ formatter: (v) => `Lát cắt Z: ${v + 1}` }}
                />
              </div>
            </div>

            {/* VIEWPORT 2: SAGITTAL (Mặt cắt dọc giữa) */}
            <div
              style={{
                backgroundColor: '#0a0f1d',
                border: '1px solid #1e293b',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: 6,
                  left: 8,
                  zIndex: 10,
                  fontSize: '11px',
                  color: '#f59e0b',
                  fontWeight: '700',
                  backgroundColor: 'rgba(10, 15, 29, 0.75)',
                  padding: '2px 6px',
                  borderRadius: 3,
                }}
              >
                SAGITTAL (Mặt cắt dọc) | Cột X #{crosshair.x + 1}/{cols}
              </div>
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  cursor: 'crosshair',
                }}
              >
                <canvas
                  ref={sagittalCanvasRef}
                  style={{
                    width: '94%',
                    height: '94%',
                    objectFit: 'contain',
                    border: '1px solid #1e293b',
                  }}
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const y = Math.round(((e.clientX - rect.left) / rect.width) * rows);
                    const z = Math.round(((e.clientY - rect.top) / rect.height) * Math.max(1, numSlices - 1));
                    setCrosshair((prev) => ({ ...prev, y, z }));
                  }}
                />
              </div>
              <div style={{ padding: '0 12px 6px', backgroundColor: '#0a0f1d' }}>
                <Slider
                  min={0}
                  max={Math.max(0, cols - 1)}
                  value={crosshair.x}
                  onChange={(x) => setCrosshair((p) => ({ ...p, x }))}
                  tooltip={{ formatter: (v) => `Vị trí X: ${v}` }}
                />
              </div>
            </div>

            {/* VIEWPORT 3: CORONAL (Mặt cắt đứng ngang / trán) */}
            <div
              style={{
                backgroundColor: '#0a0f1d',
                border: '1px solid #1e293b',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: 6,
                  left: 8,
                  zIndex: 10,
                  fontSize: '11px',
                  color: '#22c55e',
                  fontWeight: '700',
                  backgroundColor: 'rgba(10, 15, 29, 0.75)',
                  padding: '2px 6px',
                  borderRadius: 3,
                }}
              >
                CORONAL (Mặt cắt trán) | Hàng Y #{crosshair.y + 1}/{rows}
              </div>
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  cursor: 'crosshair',
                }}
              >
                <canvas
                  ref={coronalCanvasRef}
                  style={{
                    width: '94%',
                    height: '94%',
                    objectFit: 'contain',
                    border: '1px solid #1e293b',
                  }}
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = Math.round(((e.clientX - rect.left) / rect.width) * cols);
                    const z = Math.round(((e.clientY - rect.top) / rect.height) * Math.max(1, numSlices - 1));
                    setCrosshair((prev) => ({ ...prev, x, z }));
                  }}
                />
              </div>
              <div style={{ padding: '0 12px 6px', backgroundColor: '#0a0f1d' }}>
                <Slider
                  min={0}
                  max={Math.max(0, rows - 1)}
                  value={crosshair.y}
                  onChange={(y) => setCrosshair((p) => ({ ...p, y }))}
                  tooltip={{ formatter: (v) => `Vị trí Y: ${v}` }}
                />
              </div>
            </div>

            {/* VIEWPORT 4: 3D INTERACTIVE VOLUME (MIP / Surface) */}
            <div
              style={{
                backgroundColor: '#05070e',
                border: '1px solid #1e293b',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'grab',
              }}
              onMouseDown={handleMouseDown3D}
              onMouseMove={handleMouseMove3D}
              onMouseUp={handleMouseUp3D}
            >
              <div
                style={{
                  position: 'absolute',
                  top: 6,
                  left: 8,
                  zIndex: 10,
                  fontSize: '11px',
                  color: '#c084fc',
                  fontWeight: '700',
                  backgroundColor: 'rgba(10, 15, 29, 0.75)',
                  padding: '2px 6px',
                  borderRadius: 3,
                }}
              >
                3D VOLUME RENDERING (Kéo chuột xoay 360°)
              </div>
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                }}
              >
                <canvas
                  ref={volumeCanvasRef}
                  style={{
                    width: '94%',
                    height: '94%',
                    objectFit: 'contain',
                    border: '1px solid #1e293b',
                  }}
                />
              </div>
              <div
                style={{
                  position: 'absolute',
                  bottom: 6,
                  right: 8,
                  fontSize: '10px',
                  color: '#64748b',
                  fontFamily: 'monospace',
                }}
              >
                Xoay: X={Math.round(rot3D.angleX)}° Y={Math.round(rot3D.angleY)}°
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
