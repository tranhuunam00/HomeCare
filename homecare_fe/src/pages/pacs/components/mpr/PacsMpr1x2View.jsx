import React, { useRef, useEffect } from 'react';
import { Radio, Slider } from 'antd';
import {
  renderAxialCanvas,
  renderCoronalCanvas,
  renderSagittalCanvas,
  renderVolume3DCanvas,
  mprEventToVoxel,
} from '../../services/pacsVolumeEngine';

export default function PacsMpr1x2View({
  validSlices = [],
  rot3D,
  crosshair,
  setCrosshair,
  active2DPlane = 'AXIAL',
  setActive2DPlane,
  cols = 256,
  rows = 256,
  numSlices = 1,
  threshold3D = 35,
  colorMode3D = 'bone_shaded',
  onMouseDown3D,
  onMouseMove3D,
  onMouseUp3D,
  isDragging3D = false,
}) {
  const volumeCanvasRef = useRef(null);
  const axialCanvasRef = useRef(null);
  const coronalCanvasRef = useRef(null);
  const sagittalCanvasRef = useRef(null);

  // Paint 3D Volume View
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
      320,
      isDragging3D
    );
  }, [validSlices, rot3D, threshold3D, colorMode3D, cols, rows, numSlices, isDragging3D]);

  // Paint 2D Views
  useEffect(() => {
    if (active2DPlane === 'AXIAL') {
      renderAxialCanvas(axialCanvasRef.current, validSlices, crosshair, cols, rows, numSlices, 340);
    } else if (active2DPlane === 'CORONAL') {
      renderCoronalCanvas(coronalCanvasRef.current, validSlices, crosshair, cols, rows, numSlices, 340);
    } else {
      renderSagittalCanvas(sagittalCanvasRef.current, validSlices, crosshair, cols, rows, numSlices, 340);
    }
  }, [active2DPlane, validSlices, crosshair, cols, rows, numSlices]);

  return (
    <div
      style={{
        flex: 1,
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gridTemplateRows: '1fr',
        gap: 6,
        padding: 6,
        backgroundColor: '#000000',
        minHeight: 0,
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
          borderRadius: 4,
        }}
      >
        {/* Header của Viewport 2D */}
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

        {/* Thước tỉ lệ thật được vẽ trực tiếp trong ảnh MPR (theo PixelSpacing) */}

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
              display: active2DPlane === 'AXIAL' ? 'block' : 'none',
              width: '96%',
              height: '96%',
              objectFit: 'contain',
            }}
            onClick={(e) => {
              // Toạ độ chính xác kể cả khi ảnh có viền (object-fit: contain) và tỉ lệ vật lý khác 1:1
              const v = mprEventToVoxel(e, 'AXIAL', validSlices);
              setCrosshair((prev) => ({ ...prev, ...v }));
            }}
          />
          <canvas
            ref={coronalCanvasRef}
            style={{
              display: active2DPlane === 'CORONAL' ? 'block' : 'none',
              width: '96%',
              height: '96%',
              objectFit: 'contain',
            }}
            onClick={(e) => {
              // Toạ độ chính xác kể cả khi ảnh có viền (object-fit: contain) và tỉ lệ vật lý khác 1:1
              const v = mprEventToVoxel(e, 'CORONAL', validSlices);
              setCrosshair((prev) => ({ ...prev, ...v }));
            }}
          />
          <canvas
            ref={sagittalCanvasRef}
            style={{
              display: active2DPlane === 'SAGITTAL' ? 'block' : 'none',
              width: '96%',
              height: '96%',
              objectFit: 'contain',
            }}
            onClick={(e) => {
              // Toạ độ chính xác kể cả khi ảnh có viền (object-fit: contain) và tỉ lệ vật lý khác 1:1
              const v = mprEventToVoxel(e, 'SAGITTAL', validSlices);
              setCrosshair((prev) => ({ ...prev, ...v }));
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
