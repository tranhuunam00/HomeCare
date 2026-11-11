import React, { useState } from 'react';
import { Tooltip, Button, Upload } from 'antd';
import {
  UploadOutlined,
  ReloadOutlined,
  DownOutlined,
  RightOutlined,
  LineOutlined,
  BorderOutlined,
  RadiusSettingOutlined,
} from '@ant-design/icons';
import { VIEWER_LAYOUTS, PACS_TOOLS } from '../constants/pacs.constants';

export default function PacsSidebar({
  study,
  instances = [],
  currentIndex = 0,
  patientDiagnoseId,
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
}) {
  const [expandedSections, setExpandedSections] = useState({
    measure: true,
    advance: false,
    image: true,
    sync: false,
  });

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

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
      {/* History Header & Series Thumbnail */}
      <div style={{ padding: '8px 10px', borderBottom: '1px solid #1e293b' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 6,
          }}
        >
          <span
            style={{
              fontWeight: '700',
              color: '#94a3b8',
              fontSize: '11px',
              textTransform: 'uppercase',
            }}
          >
            History
          </span>
          <div style={{ display: 'flex', gap: 4 }}>
            <Upload showUploadList={false} beforeUpload={onUploadDicom} accept=".dcm,.zip">
              <Tooltip title="Tải thêm file DICOM">
                <Button
                  size="small"
                  type="text"
                  icon={<UploadOutlined />}
                  style={{ color: '#38bdf8', padding: '0 4px', height: 20 }}
                />
              </Tooltip>
            </Upload>
            <Tooltip title="Tải lại danh sách">
              <Button
                size="small"
                type="text"
                icon={<ReloadOutlined />}
                onClick={onReloadStudy}
                style={{ color: '#94a3b8', padding: '0 4px', height: 20 }}
              />
            </Tooltip>
          </div>
        </div>

        {/* Thumbnail Card */}
        {instances.length > 0 && (
          <div
            style={{
              border: '1.5px solid #f59e0b',
              borderRadius: 4,
              backgroundColor: '#111827',
              padding: 6,
              cursor: 'pointer',
              position: 'relative',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <span
                style={{
                  backgroundColor: '#b45309',
                  color: '#fff',
                  fontSize: '10px',
                  fontWeight: '700',
                  padding: '1px 4px',
                  borderRadius: 2,
                }}
              >
                {study?.modality || 'US'}
              </span>
              <span style={{ fontSize: '10px', color: '#cbd5e1' }}>
                {study?.studyDate || '2025-10-23'}
              </span>
              <span
                style={{
                  marginLeft: 'auto',
                  backgroundColor: '#ef4444',
                  color: '#fff',
                  fontSize: '10px',
                  fontWeight: '700',
                  padding: '0 4px',
                  borderRadius: 2,
                }}
              >
                {currentIndex + 1}/{instances.length}
              </span>
            </div>

            <div style={{ fontSize: '10px', color: '#94a3b8', lineHeight: '14px' }}>
              <div style={{ color: '#f8fafc', fontWeight: '600' }}>
                {study?.patientName || 'Bệnh nhân'}
              </div>
              <div>PID: {study?.patientId || patientDiagnoseId}</div>
              <div>File: DICOM ({instances.length} slices)</div>
            </div>
          </div>
        )}
      </div>

      {/* Layout Selector */}
      <div style={{ padding: '8px 10px', borderBottom: '1px solid #1e293b' }}>
        <div
          style={{
            fontWeight: '700',
            color: '#94a3b8',
            fontSize: '11px',
            marginBottom: 6,
            textTransform: 'uppercase',
          }}
        >
          Layout
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4 }}>
          {VIEWER_LAYOUTS.map((item) => (
            <button
              key={item.key}
              onClick={() => setLayout(item.key)}
              style={{
                backgroundColor: layout === item.key ? '#1e3a8a' : '#111827',
                border: layout === item.key ? '1px solid #38bdf8' : '1px solid #1e293b',
                color: layout === item.key ? '#38bdf8' : '#94a3b8',
                padding: '4px 0',
                fontSize: '11px',
                fontWeight: '600',
                borderRadius: 3,
                cursor: 'pointer',
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Measurement Tools Accordion */}
      <div style={{ borderBottom: '1px solid #1e293b' }}>
        <div
          onClick={() => toggleSection('measure')}
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
          {expandedSections.measure ? (
            <DownOutlined style={{ fontSize: 10 }} />
          ) : (
            <RightOutlined style={{ fontSize: 10 }} />
          )}
        </div>

        {expandedSections.measure && (
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
                  border:
                    activeTool === PACS_TOOLS.LENGTH ? '1px solid #22c55e' : '1px solid #1e293b',
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
                  border:
                    activeTool === PACS_TOOLS.ANGLE ? '1px solid #f59e0b' : '1px solid #1e293b',
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
                  border:
                    activeTool === PACS_TOOLS.ROI_ELLIPSE
                      ? '1px solid #38bdf8'
                      : '1px solid #1e293b',
                  backgroundColor: activeTool === PACS_TOOLS.ROI_ELLIPSE ? '#0c4a6e' : '#111827',
                  color: activeTool === PACS_TOOLS.ROI_ELLIPSE ? '#38bdf8' : '#cbd5e1',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
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
                  border:
                    activeTool === PACS_TOOLS.ROI_RECT
                      ? '1px solid #a855f7'
                      : '1px solid #1e293b',
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
          {expandedSections.advance ? (
            <DownOutlined style={{ fontSize: 10 }} />
          ) : (
            <RightOutlined style={{ fontSize: 10 }} />
          )}
        </div>

        {expandedSections.advance && (
          <div style={{ padding: '6px 8px', display: 'flex', flexDirection: 'column', gap: 4 }}>
            <button
              onClick={onOpenMpr}
              style={{
                padding: '6px 8px',
                textAlign: 'left',
                borderRadius: 3,
                border: '1px solid #334155',
                backgroundColor: '#1e293b',
                color: '#38bdf8',
                cursor: 'pointer',
                fontSize: '11px',
                fontWeight: '600',
              }}
            >
              3D Volume View
            </button>
            <button
              onClick={onOpenMpr}
              style={{
                padding: '6px 8px',
                textAlign: 'left',
                borderRadius: 3,
                border: '1px solid #334155',
                backgroundColor: '#1e293b',
                color: '#4ade80',
                cursor: 'pointer',
                fontSize: '11px',
                fontWeight: '600',
              }}
            >
              MPR Reconstruct
            </button>
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
          {expandedSections.image ? (
            <DownOutlined style={{ fontSize: 10 }} />
          ) : (
            <RightOutlined style={{ fontSize: 10 }} />
          )}
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
          {expandedSections.sync ? (
            <DownOutlined style={{ fontSize: 10 }} />
          ) : (
            <RightOutlined style={{ fontSize: 10 }} />
          )}
        </div>

        {expandedSections.sync && (
          <div style={{ padding: '6px 8px', display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label
              style={{
                fontSize: '11px',
                color: '#94a3b8',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <input type="checkbox" defaultChecked /> Đồng bộ cuộn Cine
            </label>
            <label
              style={{
                fontSize: '11px',
                color: '#94a3b8',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <input type="checkbox" defaultChecked /> Đồng bộ cửa sổ WW/WL
            </label>
          </div>
        )}
      </div>
    </div>
  );
}
