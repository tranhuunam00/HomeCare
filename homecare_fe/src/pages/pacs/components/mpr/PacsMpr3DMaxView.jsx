import React from 'react';

export default function PacsMpr3DMaxView({
  volumeCanvasRef,
  rot3D,
  onMouseDown3D,
  onMouseMove3D,
  onMouseUp3D,
}) {
  return (
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
      onMouseDown={onMouseDown3D}
      onMouseMove={onMouseMove3D}
      onMouseUp={onMouseUp3D}
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
  );
}
