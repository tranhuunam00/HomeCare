import React from 'react';
import { COLOR_LUTS } from '../constants/pacs.constants';

export default function PacsCornerHud({
  currentMeta,
  study,
  patientDiagnoseId,
  seriesIndex = 1,
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
        {currentMeta.patientName && (
          <div>
            <strong>{currentMeta.patientName}</strong>
          </div>
        )}
        {(currentMeta.patientAge || currentMeta.patientSex || currentMeta.patientBirthDate) && (
          <div>
            {[
              currentMeta.patientAge ? `Age: ${currentMeta.patientAge}` : '',
              currentMeta.patientSex,
              currentMeta.patientBirthDate ? `DOB: ${currentMeta.patientBirthDate}` : '',
            ]
              .filter(Boolean)
              .join(' • ')}
          </div>
        )}
        {currentMeta.patientId && <div>PID: {currentMeta.patientId}</div>}
        {(currentMeta.studyDate || currentMeta.studyTime) && (
          <div>{[currentMeta.studyDate, currentMeta.studyTime].filter(Boolean).join(' ')}</div>
        )}
        {currentMeta.institutionName && <div>{currentMeta.institutionName}</div>}
        {currentMeta.laterality && <div>Laterality: {currentMeta.laterality}</div>}
        {currentMeta.viewPosition && <div>ViewPosition: {currentMeta.viewPosition}</div>}
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
        <div>Series Index: {seriesIndex}</div>
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
        <div>Zoom: {Math.round(zoom * 100)}% ({zoom.toFixed(2)}x)</div>
        <div>
          WW/WL: {Math.round(windowWidth)}/{Math.round(windowCenter)}
        </div>
        <div>Upload by: system</div>
      </div>
    </>
  );
}
