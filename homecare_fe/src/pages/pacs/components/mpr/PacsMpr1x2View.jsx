import React from 'react';
import { Radio, Slider } from 'antd';

export default function PacsMpr1x2View({
  volumeCanvasRef,
  axialCanvasRef,
  coronalCanvasRef,
  sagittalCanvasRef,
  rot3D,
  crosshair,
  setCrosshair,
  active2DPlane,
  setActive2DPlane,
  cols,
  rows,
  numSlices,
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
        onMouseDown={onMouseDown3D}
        onMouseMove={onMouseMove3D}
        onMouseUp={onMouseUp3D}
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
                  ? `Mặt cắt Coronal Y: ${v + 1}`
                  : `Mặt cắt Sagittal X: ${v + 1}`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
