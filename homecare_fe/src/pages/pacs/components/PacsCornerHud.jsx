import React from 'react';
import { COLOR_LUTS } from '../constants/pacs.constants';

export default function PacsCornerHud({
  currentMeta,
  study,
  patientDiagnoseId,
  currentIndex = 0,
  totalSlices = 1,
  colorLut,
  setColorLut,
  zoom = 1,
  windowWidth = 255,
  windowCenter = 128,
}) {
  if (!currentMeta) return null;

  return (
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
        <div>
          <strong>{study?.patientName || currentMeta.patientName || 'Bệnh nhân'}</strong>
        </div>
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
          right: 44,
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
        <div>
          Image: {currentIndex + 1}/{totalSlices}
        </div>
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
          right: 44,
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
        <div>
          WW/WL: {Math.round(windowWidth)}/{Math.round(windowCenter)}
        </div>
        <div>Upload by: system</div>
      </div>
    </>
  );
}
