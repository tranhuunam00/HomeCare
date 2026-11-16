import React, { useState } from 'react';
import { Tooltip, Switch } from 'antd';
import { DownOutlined, RightOutlined } from '@ant-design/icons';
import { VIEWER_LAYOUTS } from '../constants/pacs.constants';
import LayoutIcon from './LayoutIcon';
import PacsSidebarHistory from './sidebar/PacsSidebarHistory';
import PacsSidebarMeasurements from './sidebar/PacsSidebarMeasurements';

const SYNC_OPTIONS = [
  { key: 'scroll', label: 'Đồng bộ cuộn', hint: 'Cùng hướng cắt: theo vị trí (mm)' },
  { key: 'refLines', label: 'Đường tham chiếu', hint: 'Vị trí lát đang xem trên ô khác' },
  { key: 'window', label: 'Đồng bộ WW/WL', hint: 'Các series cùng modality' },
  { key: 'zoomPan', label: 'Đồng bộ zoom / kéo' },
];

export default function PacsSidebar({
  study,
  currentMeta,
  instances = [],
  currentIndex = 0,
  activeSliceIndex,
  activeSeriesTotal,
  layout,
  setLayout,
  activeTool,
  setActiveTool,
  onClearAnnotations,
  onUploadDicom,
  onReloadStudy,
  flipH,
  setFlipH,
  flipV,
  setFlipV,
  rotation,
  setRotation,
  onReset,
  onOpenMpr,
  canBuild3D = false,
  activeSeriesSliceCount = 0,
  sync = {},
  onChangeSync,
}) {
  const [expandedSections, setExpandedSections] = useState({
    measure: true,
    advance: false,
    image: true,
    sync: true,
  });

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const displaySlicePos = activeSliceIndex !== undefined ? activeSliceIndex : currentIndex;
  const displaySliceTotal = activeSeriesTotal !== undefined ? activeSeriesTotal : instances.length;

  return (
    <div
      style={{
        width: 175,
        minWidth: 175,
        backgroundColor: '#0c1222',
        borderRight: '1px solid #1e293b',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
        fontSize: '12px',
        userSelect: 'none',
      }}
    >
      <PacsSidebarHistory
        study={study}
        currentMeta={currentMeta}
        instances={instances}
        displaySlicePos={displaySlicePos}
        displaySliceTotal={displaySliceTotal}
        onUploadDicom={onUploadDicom}
        onReloadStudy={onReloadStudy}
      />

      {/* Layout Selector */}
      <div style={{ padding: '8px 10px', borderBottom: '1px solid #1e293b' }}>
        <div style={{ fontWeight: '700', color: '#94a3b8', fontSize: '11px', marginBottom: 6, textTransform: 'uppercase' }}>
          Layout
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 3 }}>
          {VIEWER_LAYOUTS.map((item) => (
            <Tooltip key={item.key} title={item.title || `${item.rows} hàng × ${item.cols} cột`} placement="bottom" mouseEnterDelay={0.4}>
              <button
                type="button"
                onClick={() => setLayout(item.key)}
                className={`pacs-layout-btn${layout === item.key ? ' is-active' : ''}`}
                aria-pressed={layout === item.key}
              >
                <LayoutIcon layout={item} />
                {item.label}
              </button>
            </Tooltip>
          ))}
        </div>
      </div>

      <PacsSidebarMeasurements
        isOpen={expandedSections.measure}
        onToggle={() => toggleSection('measure')}
        activeTool={activeTool}
        setActiveTool={setActiveTool}
        onClearAnnotations={onClearAnnotations}
      />

      {/* Advance Tools Accordion */}
      <div style={{ borderBottom: '1px solid #1e293b' }}>
        <div
          onClick={() => toggleSection('advance')}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '8px 10px',
            cursor: 'pointer',
            fontWeight: '700',
            color: '#cbd5e1',
            fontSize: '11px',
            backgroundColor: '#0f172a',
          }}
        >
          <span>Advance Tools</span>
          {expandedSections.advance ? <DownOutlined style={{ fontSize: 10 }} /> : <RightOutlined style={{ fontSize: 10 }} />}
        </div>

        {expandedSections.advance && (
          <div style={{ padding: '6px 8px', display: 'flex', flexDirection: 'column', gap: 4 }}>
            <Tooltip
              title={
                canBuild3D
                  ? 'Dựng hình 3D theo nhóm đang chọn'
                  : `Cần trên 20 ảnh trong nhóm đang chọn (hiện có ${activeSeriesSliceCount})`
              }
              placement="right"
            >
              <button
                onClick={onOpenMpr}
                style={{
                  padding: '6px 8px',
                  textAlign: 'left',
                  borderRadius: 3,
                  border: '1px solid #334155',
                  backgroundColor: canBuild3D ? '#1e293b' : '#0f172a',
                  color: canBuild3D ? '#38bdf8' : '#64748b',
                  cursor: canBuild3D ? 'pointer' : 'not-allowed',
                  fontSize: '11px',
                  fontWeight: '600',
                  opacity: canBuild3D ? 1 : 0.65,
                }}
              >
                3D Volume View
              </button>
            </Tooltip>
            <Tooltip
              title={
                canBuild3D
                  ? 'Dựng hình đa mặt phẳng theo nhóm đang chọn'
                  : `Cần trên 20 ảnh trong nhóm đang chọn (hiện có ${activeSeriesSliceCount})`
              }
              placement="right"
            >
              <button
                onClick={onOpenMpr}
                style={{
                  padding: '6px 8px',
                  textAlign: 'left',
                  borderRadius: 3,
                  border: '1px solid #334155',
                  backgroundColor: canBuild3D ? '#1e293b' : '#0f172a',
                  color: canBuild3D ? '#4ade80' : '#64748b',
                  cursor: canBuild3D ? 'pointer' : 'not-allowed',
                  fontSize: '11px',
                  fontWeight: '600',
                  opacity: canBuild3D ? 1 : 0.65,
                }}
              >
                MPR Reconstruct
              </button>
            </Tooltip>
          </div>
        )}
      </div>

      {/* Image Tools Accordion */}
      <div style={{ borderBottom: '1px solid #1e293b' }}>
        <div
          onClick={() => toggleSection('image')}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '8px 10px',
            cursor: 'pointer',
            fontWeight: '700',
            color: '#cbd5e1',
            fontSize: '11px',
            backgroundColor: '#0f172a',
          }}
        >
          <span>Image Tools</span>
          {expandedSections.image ? <DownOutlined style={{ fontSize: 10 }} /> : <RightOutlined style={{ fontSize: 10 }} />}
        </div>

        {expandedSections.image && (
          <div style={{ padding: '6px 8px', display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
              <button
                onClick={() => setFlipH((prev) => !prev)}
                style={{
                  padding: '4px 0',
                  borderRadius: 3,
                  border: '1px solid #1e293b',
                  backgroundColor: flipH ? '#1e3a8a' : '#111827',
                  color: '#cbd5e1',
                  cursor: 'pointer',
                  fontSize: '11px',
                }}
              >
                Flip H
              </button>
              <button
                onClick={() => setFlipV((prev) => !prev)}
                style={{
                  padding: '4px 0',
                  borderRadius: 3,
                  border: '1px solid #1e293b',
                  backgroundColor: flipV ? '#1e3a8a' : '#111827',
                  color: '#cbd5e1',
                  cursor: 'pointer',
                  fontSize: '11px',
                }}
              >
                Flip V
              </button>
            </div>

            <button
              onClick={() => setRotation((prev) => (prev + 90) % 360)}
              style={{
                padding: '4px 0',
                borderRadius: 3,
                border: '1px solid #1e293b',
                backgroundColor: '#111827',
                color: '#cbd5e1',
                cursor: 'pointer',
                fontSize: '11px',
              }}
            >
              Xoay 90° (Hiện tại: {rotation}°)
            </button>

            <button
              onClick={onReset}
              style={{
                padding: '4px 0',
                borderRadius: 3,
                border: '1px solid #1e293b',
                backgroundColor: '#111827',
                color: '#cbd5e1',
                cursor: 'pointer',
                fontSize: '11px',
              }}
            >
              Reset hiển thị
            </button>
          </div>
        )}
      </div>

      {/* Sync Tools Accordion */}
      <div>
        <div
          onClick={() => toggleSection('sync')}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '8px 10px',
            cursor: 'pointer',
            fontWeight: '700',
            color: '#cbd5e1',
            fontSize: '11px',
            backgroundColor: '#0f172a',
          }}
        >
          <span>Sync Tools</span>
          {expandedSections.sync ? <DownOutlined style={{ fontSize: 10 }} /> : <RightOutlined style={{ fontSize: 10 }} />}
        </div>

        {expandedSections.sync && (
          <div style={{ padding: '4px 8px 8px', display: 'flex', flexDirection: 'column', gap: 2 }}>
            {SYNC_OPTIONS.map((o) => (
              <label key={o.key} className="pacs-switch-row">
                <span>
                  {o.label}
                  {o.hint && <span className="hint">{o.hint}</span>}
                </span>
                <Switch size="small" checked={!!sync[o.key]} onChange={(v) => onChangeSync?.({ [o.key]: v })} />
              </label>
            ))}
            {layout === '1x1' && <div style={{ fontSize: 9.5, color: '#64748b', marginTop: 2 }}>Áp dụng khi xem nhiều ô (chọn bố cục ở trên).</div>}
          </div>
        )}
      </div>
    </div>
  );
}
