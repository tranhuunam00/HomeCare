import React, { useRef, useEffect } from 'react';
import { Slider } from 'antd';
import {
  renderAxialCanvas,
  renderCoronalCanvas,
  renderSagittalCanvas,
  renderVolume3DCanvas,
} from '../../services/pacsVolumeEngine';

export default function PacsMpr2x2View({
  validSlices = [],
  crosshair,
  setCrosshair,
  cols = 256,
  rows = 256,
  numSlices = 1,
  rot3D,
  threshold3D = 35,
  colorMode3D = 'bone_shaded',
  onMouseDown3D,
  onMouseMove3D,
  onMouseUp3D,
  isDragging3D = false,
}) {
  const axialCanvasRef = useRef(null);
  const sagittalCanvasRef = useRef(null);
  const coronalCanvasRef = useRef(null);
  const volumeCanvasRef = useRef(null);

  // Render 2D Views
  useEffect(() => {
    renderAxialCanvas(axialCanvasRef.current, validSlices, crosshair, cols, rows, numSlices, 280);
    renderSagittalCanvas(sagittalCanvasRef.current, validSlices, crosshair, cols, rows, numSlices, 280);
    renderCoronalCanvas(coronalCanvasRef.current, validSlices, crosshair, cols, rows, numSlices, 280);
  }, [validSlices, crosshair, cols, rows, numSlices]);

  // Render 3D View
  useEffect(() => {
    renderVolume3DCanvas(
      volumeCanvasRef.current,
      validSlices,
      rot3D,
      threshold3D,
      colorMode3D,
      cols,
      rows,
      numSlices,
      280,
      isDragging3D
    );
  }, [validSlices, rot3D, threshold3D, colorMode3D, cols, rows, numSlices, isDragging3D]);

  return (
    <div
      style={{
        flex: 1,
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gridTemplateRows: '1fr 1fr',
        gap: 6,
        padding: 6,
        backgroundColor: '#000000',
        minHeight: 0,
      }}
    >
      {/* VIEWPORT 1: AXIAL (Mặt cắt ngang) */}
      <div
        style={{
          backgroundColor: '#0a0f1d',
          border: '1.5px solid #38bdf8',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 4,
          overflow: 'hidden',
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
            backgroundColor: 'rgba(10, 15, 29, 0.85)',
            padding: '2px 8px',
            borderRadius: 3,
            border: '1px solid rgba(56, 189, 248, 0.4)',
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
          border: '1.5px solid #f59e0b',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 4,
          overflow: 'hidden',
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
            backgroundColor: 'rgba(10, 15, 29, 0.85)',
            padding: '2px 8px',
            borderRadius: 3,
            border: '1px solid rgba(245, 158, 11, 0.4)',
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
            tooltip={{ formatter: (v) => `Cột Sagittal X: ${v + 1}` }}
          />
        </div>
      </div>

      {/* VIEWPORT 3: CORONAL (Mặt cắt trán) */}
      <div
        style={{
          backgroundColor: '#0a0f1d',
          border: '1.5px solid #10b981',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 4,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 6,
            left: 8,
            zIndex: 10,
            fontSize: '11px',
            color: '#10b981',
            fontWeight: '700',
            backgroundColor: 'rgba(10, 15, 29, 0.85)',
            padding: '2px 8px',
            borderRadius: 3,
            border: '1px solid rgba(16, 185, 129, 0.4)',
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
            tooltip={{ formatter: (v) => `Hàng Coronal Y: ${v + 1}` }}
          />
        </div>
      </div>

      {/* VIEWPORT 4: 3D VOLUME RENDERING */}
      <div
        style={{
          backgroundColor: '#05070e',
          border: '1.5px solid #a855f7',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          cursor: isDragging3D ? 'grabbing' : 'grab',
          overflow: 'hidden',
          borderRadius: 4,
        }}
        onMouseDown={onMouseDown3D}
        onMouseMove={onMouseMove3D}
        onMouseUp={onMouseUp3D}
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
            backgroundColor: 'rgba(10, 15, 29, 0.85)',
            padding: '2px 8px',
            borderRadius: 3,
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
              width: '94%',
              height: '94%',
              objectFit: 'contain',
            }}
          />
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: 6,
            right: 8,
            fontSize: '10px',
            color: '#94a3b8',
            fontFamily: 'monospace',
            backgroundColor: 'rgba(10, 15, 29, 0.75)',
            padding: '1px 5px',
            borderRadius: 3,
          }}
        >
          X={Math.round(rot3D.angleX)}° | Y={Math.round(rot3D.angleY)}°
        </div>
      </div>
    </div>
  );
}
