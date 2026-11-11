import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Modal, Slider, Button, Tooltip, Row, Col } from 'antd';
import {
  CloseOutlined,
  ReloadOutlined,
  RotateRightOutlined,
  ExpandOutlined,
} from '@ant-design/icons';

/**
 * 3D Volume & Multi-Planar Reconstruction (MPR) Tool
 * Computes Axial, Sagittal, Coronal planes and 3D MIP volume from a multi-slice MRI/CT study
 */
export default function PacsMprModal({
  open,
  onClose,
  instances = [],
  dicomCache = {},
  patientName = 'Bệnh nhân',
  modality = 'MR',
}) {
  // Slices in current multi-slice volume
  const validSlices = useMemo(() => {
    return Object.keys(dicomCache)
      .map(Number)
      .sort((a, b) => a - b)
      .map((idx) => dicomCache[idx])
      .filter((item) => item && item.rawPixels && item.meta);
  }, [dicomCache]);

  const numSlices = validSlices.length || 1;
  const sampleMeta = validSlices[0]?.meta || {};
  const rows = sampleMeta.rows || 256;
  const cols = sampleMeta.columns || 256;

  // Crosshair coordinates in 3D volume space [0..cols-1, 0..rows-1, 0..numSlices-1]
  const [crosshair, setCrosshair] = useState({
    x: Math.floor(cols / 2),
    y: Math.floor(rows / 2),
    z: Math.floor(numSlices / 2),
  });

  // 3D Rotation angles for volume projection
  const [rot3D, setRot3D] = useState({ angleX: 25, angleY: 45 });
  const [threshold3D, setThreshold3D] = useState(40); // Intensity threshold for 3D

  // Canvas refs for the 4 viewports
  const axialCanvasRef = useRef(null);
  const sagittalCanvasRef = useRef(null);
  const coronalCanvasRef = useRef(null);
  const volumeCanvasRef = useRef(null);

  // Synchronize crosshair when numSlices changes
  useEffect(() => {
    if (numSlices > 0) {
      setCrosshair({
        x: Math.floor(cols / 2),
        y: Math.floor(rows / 2),
        z: Math.floor(numSlices / 2),
      });
    }
  }, [numSlices, cols, rows]);

  // --- 1. Render Axial View (X-Y plane at Z) ---
  useEffect(() => {
    const canvas = axialCanvasRef.current;
    if (!canvas || validSlices.length === 0) return;
    const ctx = canvas.getContext('2d');
    const zIdx = Math.max(0, Math.min(crosshair.z, validSlices.length - 1));
    const slice = validSlices[zIdx];
    if (!slice) return;

    canvas.width = cols;
    canvas.height = rows;
    const imgData = ctx.createImageData(cols, rows);
    const pixels = slice.rawPixels;

    for (let i = 0; i < pixels.length; i++) {
      const val = Math.min(255, Math.max(0, pixels[i]));
      const pIdx = i * 4;
      imgData.data[pIdx] = val;
      imgData.data[pIdx + 1] = val;
      imgData.data[pIdx + 2] = val;
      imgData.data[pIdx + 3] = 255;
    }
    ctx.putImageData(imgData, 0, 0);

    // Draw Crosshairs
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    // Vertical line (X)
    ctx.beginPath();
    ctx.moveTo(crosshair.x, 0);
    ctx.lineTo(crosshair.x, rows);
    ctx.stroke();
    // Horizontal line (Y)
    ctx.beginPath();
    ctx.moveTo(0, crosshair.y);
    ctx.lineTo(cols, crosshair.y);
    ctx.stroke();
  }, [crosshair, validSlices, cols, rows]);

  // --- 2. Render Sagittal View (Y-Z plane at X) ---
  useEffect(() => {
    const canvas = sagittalCanvasRef.current;
    if (!canvas || validSlices.length === 0) return;
    const ctx = canvas.getContext('2d');
    const targetX = Math.max(0, Math.min(crosshair.x, cols - 1));

    // Sagittal width = rows (anterior-posterior), height = numSlices (inferior-superior)
    canvas.width = rows;
    canvas.height = numSlices;
    const imgData = ctx.createImageData(rows, numSlices);

    for (let z = 0; z < numSlices; z++) {
      const slicePixels = validSlices[z]?.rawPixels;
      if (!slicePixels) continue;
      for (let y = 0; y < rows; y++) {
        const val = slicePixels[y * cols + targetX] || 0;
        const normalized = Math.min(255, Math.max(0, val));
        const outIdx = (z * rows + y) * 4;
        imgData.data[outIdx] = normalized;
        imgData.data[outIdx + 1] = normalized;
        imgData.data[outIdx + 2] = normalized;
        imgData.data[outIdx + 3] = 255;
      }
    }
    ctx.putImageData(imgData, 0, 0);

    // Draw Crosshairs
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(crosshair.y, 0);
    ctx.lineTo(crosshair.y, numSlices);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, crosshair.z);
    ctx.lineTo(rows, crosshair.z);
    ctx.stroke();
  }, [crosshair, validSlices, cols, rows, numSlices]);

  // --- 3. Render Coronal View (X-Z plane at Y) ---
  useEffect(() => {
    const canvas = coronalCanvasRef.current;
    if (!canvas || validSlices.length === 0) return;
    const ctx = canvas.getContext('2d');
    const targetY = Math.max(0, Math.min(crosshair.y, rows - 1));

    // Coronal width = cols (left-right), height = numSlices (inferior-superior)
    canvas.width = cols;
    canvas.height = numSlices;
    const imgData = ctx.createImageData(cols, numSlices);

    for (let z = 0; z < numSlices; z++) {
      const slicePixels = validSlices[z]?.rawPixels;
      if (!slicePixels) continue;
      const rowOffset = targetY * cols;
      for (let x = 0; x < cols; x++) {
        const val = slicePixels[rowOffset + x] || 0;
        const normalized = Math.min(255, Math.max(0, val));
        const outIdx = (z * cols + x) * 4;
        imgData.data[outIdx] = normalized;
        imgData.data[outIdx + 1] = normalized;
        imgData.data[outIdx + 2] = normalized;
        imgData.data[outIdx + 3] = 255;
      }
    }
    ctx.putImageData(imgData, 0, 0);

    // Draw Crosshairs
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(crosshair.x, 0);
    ctx.lineTo(crosshair.x, numSlices);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, crosshair.z);
    ctx.lineTo(cols, crosshair.z);
    ctx.stroke();
  }, [crosshair, validSlices, cols, rows, numSlices]);

  // --- 4. Render 3D MIP / Volume Projection ---
  useEffect(() => {
    const canvas = volumeCanvasRef.current;
    if (!canvas || validSlices.length === 0) return;
    const ctx = canvas.getContext('2d');
    const renderSize = 256;
    canvas.width = renderSize;
    canvas.height = renderSize;

    ctx.fillStyle = '#05070e';
    ctx.fillRect(0, 0, renderSize, renderSize);

    // Maximum Intensity Projection (MIP) with pseudo-shading
    const imgData = ctx.createImageData(renderSize, renderSize);
    const radY = (rot3D.angleY * Math.PI) / 180;
    const cosY = Math.cos(radY);
    const sinY = Math.sin(radY);

    const step = Math.max(1, Math.floor(numSlices / 32));
    const centerX = cols / 2;
    const centerZ = numSlices / 2;

    for (let z = 0; z < numSlices; z += step) {
      const slicePixels = validSlices[z]?.rawPixels;
      if (!slicePixels) continue;

      const zRel = z - centerZ;
      for (let y = 0; y < rows; y += 2) {
        for (let x = 0; x < cols; x += 2) {
          const val = slicePixels[y * cols + x] || 0;
          if (val < threshold3D) continue;

          const xRel = x - centerX;
          // Rotate around Y axis
          const rotX = xRel * cosY - zRel * sinY;
          const rotZ = xRel * sinY + zRel * cosY;

          const projX = Math.round(renderSize / 2 + (rotX * renderSize) / cols);
          const projY = Math.round(renderSize / 2 + ((y - rows / 2) * renderSize) / rows);

          if (projX >= 0 && projX < renderSize && projY >= 0 && projY < renderSize) {
            const idx = (projY * renderSize + projX) * 4;
            // Shaded 3D bone/soft tissue color (amber/cyan gradient)
            const current = imgData.data[idx];
            if (val > current) {
              imgData.data[idx] = Math.min(255, val * 1.1); // R
              imgData.data[idx + 1] = Math.min(255, val * 0.85); // G
              imgData.data[idx + 2] = Math.min(255, val * 0.6); // B
              imgData.data[idx + 3] = 255;
            }
          }
        }
      }
    }
    ctx.putImageData(imgData, 0, 0);

    // Watermark overlay
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.font = '10px monospace';
    ctx.fillText(`3D MIP Volume (Modality: ${modality})`, 10, 18);
    ctx.fillText(`Slices: ${numSlices} | Angle: ${rot3D.angleY}°`, 10, 32);
  }, [validSlices, rot3D, threshold3D, cols, rows, numSlices, modality]);

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
      angleX: Math.max(-90, Math.min(90, prev.angleX + dy * 0.5)),
      angleY: (prev.angleY + dx * 0.8) % 360,
    }));
    startMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp3D = () => {
    isDragging3D.current = false;
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width="94vw"
      style={{ top: 20 }}
      styles={{ body: { padding: 0, backgroundColor: '#070b14', borderRadius: 8, overflow: 'hidden' } }}
      closeIcon={<CloseOutlined style={{ color: '#ffffff' }} />}
    >
      <div style={{ display: 'flex', flexDirection: 'column', height: '88vh' }}>
        {/* Top Header */}
        <div
          style={{
            height: 44,
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
            <span style={{ fontWeight: '800', color: '#38bdf8', fontSize: '14px', letterSpacing: '0.5px' }}>
              VR-PACS 3D VOLUME & MULTI-PLANAR RECONSTRUCTION (MPR)
            </span>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>
              {patientName} ({modality} - {numSlices} lát cắt)
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '12px', color: '#cbd5e1' }}>
              <span>Ngưỡng 3D:</span>
              <Slider
                min={10}
                max={150}
                value={threshold3D}
                onChange={setThreshold3D}
                style={{ width: 100 }}
              />
            </div>
            <Button
              size="small"
              icon={<ReloadOutlined />}
              onClick={() => {
                setCrosshair({ x: Math.floor(cols / 2), y: Math.floor(rows / 2), z: Math.floor(numSlices / 2) });
                setRot3D({ angleX: 25, angleY: 45 });
              }}
              style={{ backgroundColor: '#1e293b', color: '#cbd5e1', border: '1px solid #334155' }}
            >
              Reset 3D
            </Button>
          </div>
        </div>

        {/* 2x2 Grid: Axial, Sagittal, Coronal, 3D Volume */}
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: 4, padding: 4, backgroundColor: '#000000' }}>
          {/* VIEWPORT 1: AXIAL (Trục ngang) */}
          <div style={{ backgroundColor: '#0a0f1d', border: '1px solid #1e293b', position: 'relative', display: 'flex', flexDirection: 'column' }}>
            <div style={{ position: 'absolute', top: 6, left: 8, zIndex: 10, fontSize: '11px', color: '#38bdf8', fontWeight: '700' }}>
              AXIAL (Mặt cắt ngang) | Lát cắt #{crosshair.z + 1}/{numSlices}
            </div>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              <canvas
                ref={axialCanvasRef}
                style={{ maxWidth: '95%', maxHeight: '95%', objectFit: 'contain' }}
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = Math.round(((e.clientX - rect.left) / rect.width) * cols);
                  const y = Math.round(((e.clientY - rect.top) / rect.height) * rows);
                  setCrosshair((prev) => ({ ...prev, x, y }));
                }}
              />
            </div>
            <div style={{ padding: '0 12px 6px' }}>
              <Slider min={0} max={Math.max(0, numSlices - 1)} value={crosshair.z} onChange={(z) => setCrosshair((p) => ({ ...p, z }))} tooltip={{ formatter: (v) => `Lát cắt Z: ${v + 1}` }} />
            </div>
          </div>

          {/* VIEWPORT 2: SAGITTAL (Mặt phẳng đứng dọc) */}
          <div style={{ backgroundColor: '#0a0f1d', border: '1px solid #1e293b', position: 'relative', display: 'flex', flexDirection: 'column' }}>
            <div style={{ position: 'absolute', top: 6, left: 8, zIndex: 10, fontSize: '11px', color: '#f59e0b', fontWeight: '700' }}>
              SAGITTAL (Mặt cắt dọc) | Cột X #{crosshair.x + 1}/{cols}
            </div>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              <canvas
                ref={sagittalCanvasRef}
                style={{ maxWidth: '95%', maxHeight: '95%', objectFit: 'contain', transform: 'scaleY(2.5)' }}
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const y = Math.round(((e.clientX - rect.left) / rect.width) * rows);
                  const z = Math.round(((e.clientY - rect.top) / rect.height) * numSlices);
                  setCrosshair((prev) => ({ ...prev, y, z }));
                }}
              />
            </div>
            <div style={{ padding: '0 12px 6px' }}>
              <Slider min={0} max={Math.max(0, cols - 1)} value={crosshair.x} onChange={(x) => setCrosshair((p) => ({ ...p, x }))} tooltip={{ formatter: (v) => `Vị trí X: ${v}` }} />
            </div>
          </div>

          {/* VIEWPORT 3: CORONAL (Mặt phẳng đứng ngang) */}
          <div style={{ backgroundColor: '#0a0f1d', border: '1px solid #1e293b', position: 'relative', display: 'flex', flexDirection: 'column' }}>
            <div style={{ position: 'absolute', top: 6, left: 8, zIndex: 10, fontSize: '11px', color: '#22c55e', fontWeight: '700' }}>
              CORONAL (Mặt cắt trán) | Hàng Y #{crosshair.y + 1}/{rows}
            </div>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              <canvas
                ref={coronalCanvasRef}
                style={{ maxWidth: '95%', maxHeight: '95%', objectFit: 'contain', transform: 'scaleY(2.5)' }}
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = Math.round(((e.clientX - rect.left) / rect.width) * cols);
                  const z = Math.round(((e.clientY - rect.top) / rect.height) * numSlices);
                  setCrosshair((prev) => ({ ...prev, x, z }));
                }}
              />
            </div>
            <div style={{ padding: '0 12px 6px' }}>
              <Slider min={0} max={Math.max(0, rows - 1)} value={crosshair.y} onChange={(y) => setCrosshair((p) => ({ ...p, y }))} tooltip={{ formatter: (v) => `Vị trí Y: ${v}` }} />
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
            <div style={{ position: 'absolute', top: 6, left: 8, zIndex: 10, fontSize: '11px', color: '#c084fc', fontWeight: '700' }}>
              3D VOLUME RENDERING (Kéo chuột để xoay 360°)
            </div>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              <canvas
                ref={volumeCanvasRef}
                style={{ width: '90%', height: '90%', objectFit: 'contain' }}
              />
            </div>
            <div style={{ position: 'absolute', bottom: 6, right: 8, fontSize: '10px', color: '#64748b' }}>
              Xoay: X={Math.round(rot3D.angleX)}° Y={Math.round(rot3D.angleY)}°
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

