import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Modal, Slider, Button, Tooltip, Progress, Select, Radio } from 'antd';
import {
  CloseOutlined,
  ReloadOutlined,
  LoadingOutlined,
  InfoCircleOutlined,
  AppstoreOutlined,
  SplitCellsOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
  UpOutlined,
  DownOutlined,
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

  // Slices strictly in the selected series/group
  const validSlices = useMemo(() => {
    return instances
      .map((inst, idx) => localCache[inst?.globalIndex ?? idx])
      .filter((item) => item && item.rawPixels && item.meta);
  }, [instances, localCache]);

  const numSlices = validSlices.length;
  const sampleMeta = validSlices[0]?.meta || {};
  const rows = sampleMeta.rows || 256;
  const cols = sampleMeta.columns || 256;

  // Viewport display resolution for isotropic MPR and 3D Volume
  const RENDER_RES = 320;

  // Layout mode: '1x2' (3D + 2D Slice side-by-side like OsiriX/Horos) | '2x2' (Axial, Coronal, Sagittal, 3D) | '3D_MAX' (Full 3D)
  const [layoutMode, setLayoutMode] = useState('1x2');
  const [active2DPlane, setActive2DPlane] = useState('AXIAL'); // 'AXIAL' | 'SAGITTAL' | 'CORONAL'
  const [isControlsMinimized, setIsControlsMinimized] = useState(false);

  // Crosshair coordinates in 3D volume space [0..cols-1, 0..rows-1, 0..numSlices-1]
  const [crosshair, setCrosshair] = useState({
    x: 128,
    y: 128,
    z: 0,
  });

  // 3D Rotation angles and Rendering Parameters
  const [rot3D, setRot3D] = useState({ angleX: 18, angleY: 35 });
  const [threshold3D, setThreshold3D] = useState(modality === 'MR' ? 25 : 35);
  // Color & Shading Preset: 'bone_shaded' | 'bone' | 'vascular' | 'soft_tissue' | 'grayscale' | 'rainbow'
  const [colorMode3D, setColorMode3D] = useState('bone_shaded');

  // Canvas refs for the 4 viewports
  const axialCanvasRef = useRef(null);
  const sagittalCanvasRef = useRef(null);
  const coronalCanvasRef = useRef(null);
  const volumeCanvasRef = useRef(null);

  // Background fetch of all missing slices in the active series when modal opens
  useEffect(() => {
    if (!open || instances.length <= 20) return;

    let isCancelled = false;

    const fetchAllSlices = async () => {
      const missingIndices = [];
      instances.forEach((inst, idx) => {
        const cacheKey = inst?.globalIndex ?? idx;
        if (!localCache[cacheKey]?.rawPixels) {
          missingIndices.push({ cacheKey, instance: inst });
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
          chunk.map(async ({ cacheKey, instance }) => {
            try {
              const res = await axios.get(
                `${apiEndpoint}/api/pacs/instances/${instance.sopInstanceUid}/file`,
                {
                  responseType: 'arraybuffer',
                  headers: getAuthHeaders(),
                }
              );
              const parsed = parseDicomBuffer(res.data);
              newSlices[cacheKey] = parsed;
              completed++;
            } catch (err) {
              console.warn(`Lỗi tải lát cắt #${cacheKey}:`, err);
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

  // --- 4. Render 3D SHADED VOLUME RENDERING & MIP (Surface Depth, Normal Shading & Presets) ---
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

    const zStep = Math.max(1, Math.floor(numSlices / 56));
    const isShadedMode =
      colorMode3D === 'bone_shaded' ||
      colorMode3D === 'vascular' ||
      colorMode3D === 'soft_tissue';

    // Z-buffer để xác định độ sâu bề mặt 3D thực (First-hit surface occlusion)
    const zBuffer = new Float32Array(RENDER_RES * RENDER_RES);
    zBuffer.fill(-999999);

    // Vector hướng ánh sáng (Light Direction: chiếu từ góc trên-phải-trước mặt)
    const lightX = 0.45;
    const lightY = -0.6;
    const lightZ = 0.65;
    const lightLen = Math.sqrt(lightX * lightX + lightY * lightY + lightZ * lightZ) || 1;
    const lx = lightX / lightLen;
    const ly = lightY / lightLen;
    const lz = lightZ / lightLen;

    for (let z = 0; z < numSlices; z += zStep) {
      const slicePixels = validSlices[z]?.rawPixels;
      if (!slicePixels) continue;

      const zRel = (z - centerZ) * depthScale;
      const prevSlice = validSlices[Math.max(0, z - zStep)]?.rawPixels;
      const nextSlice = validSlices[Math.min(numSlices - 1, z + zStep)]?.rawPixels;

      for (let y = 0; y < rows; y += 2) {
        const yRel = y - centerY;
        const yOffset = y * cols;

        for (let x = 0; x < cols; x += 2) {
          const val = slicePixels[yOffset + x] || 0;
          if (val < threshold3D) continue;

          const xRel = x - centerX;

          // 3D Matrix Rotation (Rotate Y then Rotate X)
          const rotX1 = xRel * cosY - zRel * sinY;
          const rotZ1 = xRel * sinY + zRel * cosY;

          const rotY2 = yRel * cosX - rotZ1 * sinX;
          const rotZ2 = yRel * sinX + rotZ1 * cosX;

          const projX = Math.round(RENDER_RES / 2 + (rotX1 * RENDER_RES) / (cols * 1.25));
          const projY = Math.round(RENDER_RES / 2 + (rotY2 * RENDER_RES) / (rows * 1.25));

          if (projX >= 0 && projX < RENDER_RES && projY >= 0 && projY < RENDER_RES) {
            const pixelIdx = projY * RENDER_RES + projX;
            const idx = pixelIdx * 4;

            if (isShadedMode) {
              // 3D Surface Shaded Display (SSD / SVR): Điểm gần camera hơn (rotZ2 lớn hơn) sẽ đè điểm sau
              if (rotZ2 > zBuffer[pixelIdx]) {
                zBuffer[pixelIdx] = rotZ2;

                // Tính Gradient Normal Vector (Pháp tuyến bề mặt 3D)
                const gx = (slicePixels[yOffset + Math.min(cols - 1, x + 2)] || val) - (slicePixels[yOffset + Math.max(0, x - 2)] || val);
                const gy = (slicePixels[Math.min(rows - 1, y + 2) * cols + x] || val) - (slicePixels[Math.max(0, y - 2) * cols + x] || val);
                const gz = (nextSlice ? nextSlice[yOffset + x] || val : val) - (prevSlice ? prevSlice[yOffset + x] || val : val);

                // Xoay pháp tuyến theo cùng ma trận camera
                const nx1 = gx * cosY - gz * sinY;
                const nz1 = gx * sinY + gz * cosY;
                const ny2 = gy * cosX - nz1 * sinX;
                const nz2 = gy * sinX + nz1 * cosX;

                const nLen = Math.sqrt(nx1 * nx1 + ny2 * ny2 + nz2 * nz2) || 1;
                const nx = nx1 / nLen;
                const ny = ny2 / nLen;
                const nz = Math.abs(nz2 / nLen);

                // Phong Lighting Model: Ambient (0.35) + Diffuse (0.65 * N.L) + Specular
                const dot = Math.max(0, nx * lx + ny * ly + nz * lz);
                const diffuse = dot;
                const specular = Math.pow(Math.max(0, nz), 18) * 0.45;
                const shade = Math.min(1.5, 0.35 + 0.65 * diffuse + specular);

                if (colorMode3D === 'bone_shaded') {
                  // Medical Bone Shaded VR Palette: Ngà vàng ấm, bóng đổ nổi rõ từng đường nứt xương
                  imgData.data[idx] = Math.min(255, Math.floor((val * 1.08 + 40) * shade));
                  imgData.data[idx + 1] = Math.min(255, Math.floor((val * 0.94 + 28) * shade));
                  imgData.data[idx + 2] = Math.min(255, Math.floor((val * 0.76 + 18) * shade));
                } else if (colorMode3D === 'vascular') {
                  // Vascular Angio 3D: Đỏ cam mạch máu cản quang
                  imgData.data[idx] = Math.min(255, Math.floor((val * 1.35 + 40) * shade));
                  imgData.data[idx + 1] = Math.min(255, Math.floor((val * 0.45) * shade));
                  imgData.data[idx + 2] = Math.min(255, Math.floor((val * 0.25) * shade));
                } else if (colorMode3D === 'soft_tissue') {
                  // Soft Tissue / Skin: Tông màu da hồng hào
                  imgData.data[idx] = Math.min(255, Math.floor((val * 1.1 + 45) * shade));
                  imgData.data[idx + 1] = Math.min(255, Math.floor((val * 0.75 + 25) * shade));
                  imgData.data[idx + 2] = Math.min(255, Math.floor((val * 0.65 + 15) * shade));
                }
                imgData.data[idx + 3] = 255;
              }
            } else {
              // MIP Mode (Maximum Intensity Projection): Chiếu tia xuyên thấu
              const currentR = imgData.data[idx];
              if (val > currentR) {
                if (colorMode3D === 'bone') {
                  imgData.data[idx] = Math.min(255, val * 1.15);
                  imgData.data[idx + 1] = Math.min(255, val * 0.88);
                  imgData.data[idx + 2] = Math.min(255, val * 0.58);
                } else if (colorMode3D === 'rainbow') {
                  const norm = val / 255;
                  imgData.data[idx] = Math.min(255, Math.floor(Math.sin(norm * Math.PI) * 255));
                  imgData.data[idx + 1] = Math.min(255, Math.floor(Math.sin((norm + 0.33) * Math.PI) * 255));
                  imgData.data[idx + 2] = Math.min(255, Math.floor(Math.sin((norm + 0.66) * Math.PI) * 255));
                } else {
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
    }

    ctx.putImageData(imgData, 0, 0);

    // Overlay Watermark
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.font = '11px monospace';
    const modeLabel =
      colorMode3D === 'bone_shaded'
        ? '3D BONE SHADED VR'
        : colorMode3D === 'vascular'
        ? '3D VASCULAR ANGIO'
        : colorMode3D === 'soft_tissue'
        ? '3D SOFT TISSUE'
        : `3D MIP (${colorMode3D.toUpperCase()})`;
    ctx.fillText(modeLabel, 8, 16);
    ctx.fillText(`Xoay: X=${Math.round(rot3D.angleX)}°, Y=${Math.round(rot3D.angleY)}°`, 8, 30);
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
      <div style={{ display: 'flex', flexDirection: 'column', height: '90vh' }}>
        {/* Top Header & Viewport Controls */}
        <div
          style={{
            minHeight: isControlsMinimized ? 32 : 48,
            backgroundColor: '#0f172a',
            borderBottom: '1px solid #1e293b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: isControlsMinimized ? '0 12px' : '0 16px',
            color: '#f8fafc',
            flexWrap: 'wrap',
            gap: 8,
            transition: 'all 0.2s ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span
              style={{
                fontWeight: '800',
                color: '#38bdf8',
                fontSize: '13px',
                letterSpacing: '0.4px',
              }}
            >
              D-PACS 3D VR & MPR
            </span>
            <span style={{ fontSize: '11px', color: '#94a3b8' }}>
              {patientName} ({modality} - {numSlices} lát cắt)
            </span>
          </div>

          {!isControlsMinimized && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              {/* Bố cục Viewport Switcher */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>Bố cục:</span>
                <Radio.Group
                  size="small"
                  value={layoutMode}
                  onChange={(e) => setLayoutMode(e.target.value)}
                  buttonStyle="solid"
                >
                  <Radio.Button value="1x2" title="Chế độ 1x2: 3D Dựng hình & Lát cắt 2D song song">
                    <SplitCellsOutlined /> 1x2 (3D + 2D)
                  </Radio.Button>
                  <Radio.Button value="2x2" title="Chế độ 2x2: 4 mặt cắt đồng bộ MPR">
                    <AppstoreOutlined /> 2x2 MPR
                  </Radio.Button>
                  <Radio.Button value="3D_MAX" title="Phóng to riêng Viewport 3D toàn màn hình">
                    <FullscreenOutlined /> 3D Max
                  </Radio.Button>
                </Radio.Group>
              </div>

              {/* Bảng màu 3D Presets */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '11px', color: '#cbd5e1' }}>
                <span style={{ color: '#94a3b8' }}>Preset 3D:</span>
                <Select
                  size="small"
                  value={colorMode3D}
                  onChange={setColorMode3D}
                  style={{ width: 155 }}
                  options={[
                    { value: 'bone_shaded', label: '🦴 Xương 3D Nổi khối' },
                    { value: 'vascular', label: '🫀 Mạch máu CTA 3D' },
                    { value: 'soft_tissue', label: '👤 Mô mềm / Da mặt' },
                    { value: 'bone', label: 'Xương MIP xuyên thấu' },
                    { value: 'grayscale', label: 'Trắng đen MIP' },
                    { value: 'rainbow', label: 'Phân tầng nhiệt' },
                  ]}
                />
              </div>

              {/* Ngưỡng tỷ trọng 3D */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '11px', color: '#cbd5e1' }}>
                <span style={{ color: '#94a3b8' }}>Ngưỡng HU:</span>
                <Slider
                  min={5}
                  max={150}
                  value={threshold3D}
                  onChange={setThreshold3D}
                  style={{ width: 80 }}
                />
                <span style={{ fontFamily: 'monospace', color: '#38bdf8', minWidth: 22 }}>
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
                Reset
              </Button>
            </div>
          )}

          {/* Nút Thu gọn / Mở rộng Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Tooltip title={isControlsMinimized ? 'Mở rộng bảng công cụ' : 'Thu gọn thanh công cụ để mở rộng ảnh'}>
              <Button
                size="small"
                type="text"
                icon={isControlsMinimized ? <DownOutlined style={{ color: '#38bdf8' }} /> : <UpOutlined style={{ color: '#94a3b8' }} />}
                onClick={() => setIsControlsMinimized((prev) => !prev)}
                style={{ backgroundColor: isControlsMinimized ? '#1e293b' : 'transparent' }}
              >
                {isControlsMinimized ? 'Hiện công cụ' : ''}
              </Button>
            </Tooltip>
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

        {/* Main Stage: Either 3D Loading Screen or Multi-Viewport Grid */}
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
        ) : layoutMode === '1x2' ? (
          /* BỐ CỤC 1x2 SONG SONG (3D DỰNG HÌNH BÊN TRÁI ⟷ LÁT CẮT 2D BÊN PHẢI - NHƯ OSIRIX / RADIANT) */
          <div
            style={{
              flex: 1,
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gridTemplateRows: '1fr',
              gap: 4,
              padding: 4,
              backgroundColor: '#000000',
            }}
          >
            {/* VIEWPORT 3D VOLUME RENDERING (Bên trái) */}
            <div
              style={{
                backgroundColor: '#05070e',
                border: '1.5px solid #a855f7',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'grab',
                overflow: 'hidden',
              }}
              onMouseDown={handleMouseDown3D}
              onMouseMove={handleMouseMove3D}
              onMouseUp={handleMouseUp3D}
            >
              <div
                style={{
                  position: 'absolute',
                  top: 8,
                  left: 10,
                  zIndex: 10,
                  fontSize: '11px',
                  color: '#c084fc',
                  fontWeight: '700',
                  backgroundColor: 'rgba(10, 15, 29, 0.85)',
                  padding: '3px 8px',
                  borderRadius: 4,
                  border: '1px solid rgba(168, 85, 247, 0.4)',
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
                    width: '96%',
                    height: '96%',
                    objectFit: 'contain',
                  }}
                />
              </div>

              <div
                style={{
                  position: 'absolute',
                  bottom: 8,
                  right: 10,
                  fontSize: '11px',
                  color: '#94a3b8',
                  fontFamily: 'monospace',
                  backgroundColor: 'rgba(10, 15, 29, 0.75)',
                  padding: '2px 6px',
                  borderRadius: 3,
                }}
              >
                Xoay: X={Math.round(rot3D.angleX)}° | Y={Math.round(rot3D.angleY)}°
              </div>
            </div>

            {/* VIEWPORT 2D LÁT CẮT TƯƠNG ỨNG (Bên phải) */}
            <div
              style={{
                backgroundColor: '#0a0f1d',
                border: '1.5px solid #38bdf8',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
              }}
            >
              {/* Header của Viewport 2D: Cho phép đổi mặt cắt */}
              <div
                style={{
                  position: 'absolute',
                  top: 8,
                  left: 10,
                  zIndex: 10,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  backgroundColor: 'rgba(10, 15, 29, 0.85)',
                  padding: '3px 8px',
                  borderRadius: 4,
                  border: '1px solid rgba(56, 189, 248, 0.4)',
                }}
              >
                <span style={{ fontSize: '11px', color: '#38bdf8', fontWeight: '700' }}>
                  LÁT CẮT 2D:
                </span>
                <Radio.Group
                  size="small"
                  value={active2DPlane}
                  onChange={(e) => setActive2DPlane(e.target.value)}
                >
                  <Radio.Button value="AXIAL" style={{ fontSize: '10px' }}>Axial</Radio.Button>
                  <Radio.Button value="CORONAL" style={{ fontSize: '10px' }}>Coronal</Radio.Button>
                  <Radio.Button value="SAGITTAL" style={{ fontSize: '10px' }}>Sagittal</Radio.Button>
                </Radio.Group>
                <span style={{ fontSize: '11px', color: '#cbd5e1', fontFamily: 'monospace' }}>
                  {active2DPlane === 'AXIAL'
                    ? `#${crosshair.z + 1}/${numSlices}`
                    : active2DPlane === 'CORONAL'
                    ? `#${crosshair.y + 1}/${rows}`
                    : `#${crosshair.x + 1}/${cols}`}
                </span>
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
                  ref={
                    active2DPlane === 'AXIAL'
                      ? axialCanvasRef
                      : active2DPlane === 'CORONAL'
                      ? coronalCanvasRef
                      : sagittalCanvasRef
                  }
                  style={{
                    width: '96%',
                    height: '96%',
                    objectFit: 'contain',
                  }}
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    if (active2DPlane === 'AXIAL') {
                      const x = Math.round(((e.clientX - rect.left) / rect.width) * cols);
                      const y = Math.round(((e.clientY - rect.top) / rect.height) * rows);
                      setCrosshair((prev) => ({ ...prev, x, y }));
                    } else if (active2DPlane === 'CORONAL') {
                      const x = Math.round(((e.clientX - rect.left) / rect.width) * cols);
                      const z = Math.round(((e.clientY - rect.top) / rect.height) * Math.max(1, numSlices - 1));
                      setCrosshair((prev) => ({ ...prev, x, z }));
                    } else {
                      const y = Math.round(((e.clientX - rect.left) / rect.width) * rows);
                      const z = Math.round(((e.clientY - rect.top) / rect.height) * Math.max(1, numSlices - 1));
                      setCrosshair((prev) => ({ ...prev, y, z }));
                    }
                  }}
                />
              </div>

              {/* Slider cuộn lát cắt */}
              <div style={{ padding: '4px 16px 8px', backgroundColor: '#0a0f1d', borderTop: '1px solid #1e293b' }}>
                <Slider
                  min={0}
                  max={
                    active2DPlane === 'AXIAL'
                      ? Math.max(0, numSlices - 1)
                      : active2DPlane === 'CORONAL'
                      ? Math.max(0, rows - 1)
                      : Math.max(0, cols - 1)
                  }
                  value={
                    active2DPlane === 'AXIAL'
                      ? crosshair.z
                      : active2DPlane === 'CORONAL'
                      ? crosshair.y
                      : crosshair.x
                  }
                  onChange={(v) => {
                    if (active2DPlane === 'AXIAL') setCrosshair((p) => ({ ...p, z: v }));
                    else if (active2DPlane === 'CORONAL') setCrosshair((p) => ({ ...p, y: v }));
                    else setCrosshair((p) => ({ ...p, x: v }));
                  }}
                  tooltip={{
                    formatter: (v) =>
                      active2DPlane === 'AXIAL'
                        ? `Lát cắt Axial Z: ${v + 1}`
                        : active2DPlane === 'CORONAL'
                        ? `Vị trí Coronal Y: ${v + 1}`
                        : `Vị trí Sagittal X: ${v + 1}`,
                  }}
                />
              </div>
            </div>
          </div>
        ) : layoutMode === '3D_MAX' ? (
          /* BỐ CỤC TOÀN MÀN HÌNH 3D VIEWPORT */
          <div
            style={{
              flex: 1,
              backgroundColor: '#05070e',
              border: '2px solid #a855f7',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              cursor: 'grab',
              overflow: 'hidden',
            }}
            onMouseDown={handleMouseDown3D}
            onMouseMove={handleMouseMove3D}
            onMouseUp={handleMouseUp3D}
          >
            <div
              style={{
                position: 'absolute',
                top: 10,
                left: 12,
                zIndex: 10,
                fontSize: '12px',
                color: '#c084fc',
                fontWeight: '700',
                backgroundColor: 'rgba(10, 15, 29, 0.85)',
                padding: '4px 10px',
                borderRadius: 4,
                border: '1px solid rgba(168, 85, 247, 0.4)',
              }}
            >
              3D VOLUME RENDERING (Toàn màn hình - Kéo chuột xoay 360°)
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
                  width: '98%',
                  height: '98%',
                  objectFit: 'contain',
                }}
              />
            </div>
            <div
              style={{
                position: 'absolute',
                bottom: 10,
                right: 12,
                fontSize: '11px',
                color: '#94a3b8',
                fontFamily: 'monospace',
                backgroundColor: 'rgba(10, 15, 29, 0.75)',
                padding: '3px 8px',
                borderRadius: 4,
              }}
            >
              Xoay: X={Math.round(rot3D.angleX)}° | Y={Math.round(rot3D.angleY)}°
            </div>
          </div>
        ) : (
          /* BỐ CỤC 2x2 TRUYỀN THỐNG (4 MẶT CẮT MPR) */
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
                border: '1px solid #a855f7',
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
