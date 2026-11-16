import React from 'react';
import { Tooltip } from 'antd';
import {
  DownOutlined,
  RightOutlined,
  LineOutlined,
  BorderOutlined,
  RadiusSettingOutlined,
} from '@ant-design/icons';
import { PACS_TOOLS } from '../../constants/pacs.constants';

export default function PacsSidebarMeasurements({
  isOpen,
  onToggle,
  activeTool,
  setActiveTool,
  onClearAnnotations,
}) {
  return (
    <div style={{ borderBottom: '1px solid #1e293b' }}>
      <div
        onClick={onToggle}
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
        <span>Measurement Tools</span>
        {isOpen ? <DownOutlined style={{ fontSize: 10 }} /> : <RightOutlined style={{ fontSize: 10 }} />}
      </div>

      {isOpen && (
        <div
          style={{
            padding: '6px 8px',
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 4,
          }}
        >
          <Tooltip title="Đo khoảng cách (Line mm)">
            <button
              onClick={() => setActiveTool(PACS_TOOLS.LENGTH)}
              style={{
                padding: '6px 0',
                borderRadius: 3,
                border: activeTool === PACS_TOOLS.LENGTH ? '1px solid #22c55e' : '1px solid #1e293b',
                backgroundColor: activeTool === PACS_TOOLS.LENGTH ? '#14532d' : '#111827',
                color: activeTool === PACS_TOOLS.LENGTH ? '#4ade80' : '#cbd5e1',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <LineOutlined style={{ fontSize: 13 }} />
            </button>
          </Tooltip>

          <Tooltip title="Đo góc (Angle °)">
            <button
              onClick={() => setActiveTool(PACS_TOOLS.ANGLE)}
              style={{
                padding: '6px 0',
                borderRadius: 3,
                border: activeTool === PACS_TOOLS.ANGLE ? '1px solid #f59e0b' : '1px solid #1e293b',
                backgroundColor: activeTool === PACS_TOOLS.ANGLE ? '#78350f' : '#111827',
                color: activeTool === PACS_TOOLS.ANGLE ? '#fbbf24' : '#cbd5e1',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <RadiusSettingOutlined style={{ fontSize: 13 }} />
            </button>
          </Tooltip>

          <Tooltip title="Đo diện tích Elip (ROI mm²)">
            <button
              onClick={() => setActiveTool(PACS_TOOLS.ROI_ELLIPSE)}
              style={{
                padding: '6px 0',
                borderRadius: 3,
                border: activeTool === PACS_TOOLS.ROI_ELLIPSE ? '1px solid #38bdf8' : '1px solid #1e293b',
                backgroundColor: activeTool === PACS_TOOLS.ROI_ELLIPSE ? '#0c4a6e' : '#111827',
                color: activeTool === PACS_TOOLS.ROI_ELLIPSE ? '#38bdf8' : '#cbd5e1',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <ellipse cx="12" cy="12" rx="10" ry="6" />
              </svg>
            </button>
          </Tooltip>

          <Tooltip title="Đo diện tích Chữ nhật (ROI mm²)">
            <button
              onClick={() => setActiveTool(PACS_TOOLS.ROI_RECT)}
              style={{
                padding: '6px 0',
                borderRadius: 3,
                border: activeTool === PACS_TOOLS.ROI_RECT ? '1px solid #a855f7' : '1px solid #1e293b',
                backgroundColor: activeTool === PACS_TOOLS.ROI_RECT ? '#581c87' : '#111827',
                color: activeTool === PACS_TOOLS.ROI_RECT ? '#c084fc' : '#cbd5e1',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <BorderOutlined style={{ fontSize: 13 }} />
            </button>
          </Tooltip>

          <Tooltip title="Xóa tất cả thước đo lát cắt này">
            <button
              onClick={onClearAnnotations}
              style={{
                gridColumn: 'span 4',
                padding: '4px 0',
                marginTop: 2,
                borderRadius: 3,
                border: '1px solid #334155',
                backgroundColor: '#1e293b',
                color: '#f87171',
                cursor: 'pointer',
                fontSize: '11px',
              }}
            >
              Xóa đo đạc lát này
            </button>
          </Tooltip>
        </div>
      )}
    </div>
  );
}
