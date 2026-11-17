import React, { useRef, useEffect } from 'react';
import { Slider } from 'antd';
import {
  renderAxialCanvas,
  renderCoronalCanvas,
  renderSagittalCanvas,
  mprEventToVoxel,
} from '../../services/pacsVolumeEngine';

// Cấu hình từng mặt cắt: hàm vẽ, trục crosshair điều khiển, màu & nhãn (đồng bộ với bố cục 2x2)
const PLANE_CONFIG = {
  AXIAL: {
    render: renderAxialCanvas,
    axis: 'z',
    color: '#38bdf8',
    rgb: '56, 189, 248',
    title: 'AXIAL (Mặt cắt ngang)',
    unit: 'Lát cắt',
  },
  CORONAL: {
    render: renderCoronalCanvas,
    axis: 'y',
    color: '#10b981',
    rgb: '16, 185, 129',
    title: 'CORONAL (Mặt cắt trán)',
    unit: 'Hàng Y',
  },
  SAGITTAL: {
    render: renderSagittalCanvas,
    axis: 'x',
    color: '#f59e0b',
    rgb: '245, 158, 11',
    title: 'SAGITTAL (Mặt cắt dọc)',
    unit: 'Cột X',
  },
};

/**
 * Hiển thị MỘT mặt cắt (Axial / Coronal / Sagittal) chiếm toàn bộ khung.
 * Lăn chuột hoặc kéo thanh trượt để chuyển lát; click để đặt tâm crosshair.
 */
export default function PacsMprSinglePlaneView({
  plane = 'AXIAL',
  validSlices = [],
  crosshair,
  setCrosshair,
  cols = 256,
  rows = 256,
  numSlices = 1,
}) {
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);
  const cfg = PLANE_CONFIG[plane] || PLANE_CONFIG.AXIAL;
  const max = Math.max(0, (cfg.axis === 'z' ? numSlices : cfg.axis === 'x' ? cols : rows) - 1);
  const value = crosshair?.[cfg.axis] ?? 0;

  useEffect(() => {
    cfg.render(canvasRef.current, validSlices, crosshair, cols, rows, numSlices, 512);
  }, [cfg, validSlices, crosshair, cols, rows, numSlices]);

  // Lăn chuột = chuyển lát. Gắn listener non-passive để chặn cuộn trang.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return undefined;
    const onWheel = (e) => {
      e.preventDefault();
      const step = (e.deltaY > 0 ? 1 : -1) * (e.shiftKey ? 5 : 1);
      setCrosshair((p) => ({ ...p, [cfg.axis]: Math.min(max, Math.max(0, (p[cfg.axis] ?? 0) + step)) }));
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [cfg.axis, max, setCrosshair]);

  return (
    <div style={{ flex: 1, display: 'flex', padding: 6, backgroundColor: '#000', minHeight: 0 }}>
      <div
        style={{
          flex: 1,
          backgroundColor: '#0a0f1d',
          border: `1.5px solid ${cfg.color}`,
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 4,
          overflow: 'hidden',
          minHeight: 0,
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 8,
            left: 10,
            zIndex: 10,
            fontSize: '12px',
            color: cfg.color,
            fontWeight: '700',
            backgroundColor: 'rgba(10, 15, 29, 0.85)',
            padding: '3px 10px',
            borderRadius: 3,
            border: `1px solid rgba(${cfg.rgb}, 0.4)`,
          }}
        >
          {cfg.title} | {cfg.unit} #{value + 1}/{max + 1}
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: 52,
            right: 12,
            zIndex: 10,
            fontSize: '10.5px',
            color: '#64748b',
            backgroundColor: 'rgba(10, 15, 29, 0.7)',
            padding: '2px 6px',
            borderRadius: 3,
          }}
        >
          Lăn chuột: chuyển lát · Shift + lăn: nhảy 5 lát
        </div>
        <div
          ref={wrapRef}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            cursor: 'crosshair',
            minHeight: 0,
          }}
        >
          <canvas
            ref={canvasRef}
            style={{ width: '98%', height: '98%', objectFit: 'contain' }}
            onClick={(e) => {
              const v = mprEventToVoxel(e, plane, validSlices);
              setCrosshair((prev) => ({ ...prev, ...v }));
            }}
          />
        </div>
        <div style={{ padding: '0 16px 8px', backgroundColor: '#0a0f1d' }}>
          <Slider
            min={0}
            max={max}
            value={value}
            onChange={(v) => setCrosshair((p) => ({ ...p, [cfg.axis]: v }))}
            tooltip={{ formatter: (v) => `${cfg.unit}: ${v + 1}` }}
          />
        </div>
      </div>
    </div>
  );
}
