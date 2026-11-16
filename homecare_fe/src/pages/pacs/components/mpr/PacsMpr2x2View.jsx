import React from 'react';
import { Slider } from 'antd';

export default function PacsMpr2x2View({
  axialCanvasRef,
  sagittalCanvasRef,
  coronalCanvasRef,
  volumeCanvasRef,
  crosshair,
  setCrosshair,
  cols,
  rows,
  numSlices,
  rot3D,
  onMouseDown3D,
  onMouseMove3D,
  onMouseUp3D,
}) {
  return (
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

      {/* VIEWPORT 4: 3D INTERACTIVE VOLUME */}
      <div
        style={{
          backgroundColor: '#05070e',
          border: '1px solid #a855f7',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          cursor: 'grab',
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
            backgroundColor: 'rgba(10, 15, 29, 0.75)',
            padding: '2px 6px',
            borderRadius: 3,
          }}
        >
          3D VOLUME RENDERING (Kéo xoay)
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
            fontSize: '11px',
            color: '#94a3b8',
            fontFamily: 'monospace',
            backgroundColor: 'rgba(10, 15, 29, 0.75)',
            padding: '2px 6px',
            borderRadius: 3,
          }}
        >
          X={Math.round(rot3D.angleX)}° | Y={Math.round(rot3D.angleY)}°
        </div>
      </div>
    </div>
  );
}
