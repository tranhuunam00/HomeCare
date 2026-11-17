import React from 'react';
import { Button, Tooltip, Select, Slider, Radio } from 'antd';
import {
  ReloadOutlined,
  AppstoreOutlined,
  SplitCellsOutlined,
  UpOutlined,
  DownOutlined,
  CloseOutlined,
} from '@ant-design/icons';

// Nút chuyển nhanh 1 mặt cắt: A = Axial, C = Coronal, S = Sagittal, V = 3D Volume
const QUICK_VIEWS = [
  { value: 'AXIAL', letter: 'A', rest: 'xial', color: '#38bdf8', tip: 'Axial - Mặt cắt ngang (phím A)' },
  { value: 'CORONAL', letter: 'C', rest: 'oronal', color: '#10b981', tip: 'Coronal - Mặt cắt trán (phím C)' },
  { value: 'SAGITTAL', letter: 'S', rest: 'agittal', color: '#f59e0b', tip: 'Sagittal - Mặt cắt dọc (phím S)' },
  { value: '3D_MAX', letter: 'V', rest: 'olume 3D', color: '#c084fc', tip: '3D Volume Rendering (phím V)' },
];

function QuickViewButtons({ layoutMode, setLayoutMode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      {QUICK_VIEWS.map((v) => {
        const active = layoutMode === v.value;
        return (
          <Tooltip key={v.value} title={v.tip}>
            <button
              type="button"
              onClick={() => setLayoutMode(v.value)}
              aria-pressed={active}
              style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: 0,
                height: 26,
                padding: '0 8px',
                borderRadius: 4,
                cursor: 'pointer',
                backgroundColor: active ? v.color : '#1e293b',
                border: `1px solid ${active ? v.color : '#334155'}`,
                color: active ? '#0b101b' : '#e2e8f0',
                fontWeight: 700,
                lineHeight: '24px',
                transition: 'all 0.15s ease',
              }}
            >
              <span style={{ fontSize: 15, color: active ? '#0b101b' : v.color }}>{v.letter}</span>
              <span style={{ fontSize: 10 }}>{v.rest}</span>
            </button>
          </Tooltip>
        );
      })}
    </div>
  );
}

export default function PacsMprToolbar({
  patientName = 'Bệnh nhân',
  modality = 'MR',
  numSlices = 0,
  layoutMode = '1x2',
  setLayoutMode,
  colorMode3D = 'bone_shaded',
  setColorMode3D,
  threshold3D = 300,
  thresholdRange,
  thresholdUnit,
  setThreshold3D,
  onReset3D,
  isControlsMinimized = false,
  setIsControlsMinimized,
  onClose,
}) {
  return (
    <div
      style={{
        minHeight: isControlsMinimized ? 32 : 48,
        backgroundColor: '#0f172a',
        borderBottom: '1px solid #1e293b',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: isControlsMinimized ? '0 12px' : '0 16px',
        color: '#f8fafc',
        flexWrap: 'wrap',
        gap: 8,
        transition: 'all 0.2s ease',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <img
          src="/logo_home_care.png"
          alt="D-RADS"
          style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover' }}
        />
        <span
          style={{
            fontWeight: '800',
            color: '#38bdf8',
            fontSize: '13px',
            letterSpacing: '0.4px',
          }}
        >
          D-PACS 3D VR & MPR
        </span>
        <span style={{ fontSize: '11px', color: '#94a3b8' }}>
          {patientName} ({modality} - {numSlices} lát cắt)
        </span>
        <QuickViewButtons layoutMode={layoutMode} setLayoutMode={setLayoutMode} />
      </div>

      {!isControlsMinimized && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          {/* Bố cục Viewport Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize: '11px', color: '#94a3b8' }}>Bố cục:</span>
            <Radio.Group
              size="small"
              value={layoutMode}
              onChange={(e) => setLayoutMode(e.target.value)}
              buttonStyle="solid"
            >
              <Radio.Button value="1x2" title="Chế độ 1x2: 3D Dựng hình & Lát cắt 2D song song">
                <SplitCellsOutlined /> 1x2 (3D + 2D)
              </Radio.Button>
              <Radio.Button value="2x2" title="Chế độ 2x2: 4 mặt cắt đồng bộ MPR">
                <AppstoreOutlined /> 2x2 MPR
              </Radio.Button>
            </Radio.Group>
          </div>

          {/* Bảng màu 3D Presets */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '11px', color: '#cbd5e1' }}>
            <span style={{ color: '#94a3b8' }}>Preset 3D:</span>
            <Select
              size="small"
              value={colorMode3D}
              onChange={setColorMode3D}
              style={{ width: 155 }}
              options={[
                { value: 'bone_shaded', label: '🦴 Xương 3D Nổi khối' },
                { value: 'vascular', label: '🫀 Mạch máu CTA 3D' },
                { value: 'soft_tissue', label: '👤 Mô mềm / Da mặt' },
                { value: 'bone', label: 'Xương MIP xuyên thấu' },
                { value: 'grayscale', label: 'Trắng đen MIP' },
                { value: 'rainbow', label: 'Phân tầng nhiệt' },
              ]}
            />
          </div>

          {/* Ngưỡng tỷ trọng 3D */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '11px', color: '#cbd5e1' }}>
            <span style={{ color: '#94a3b8' }}>Ngưỡng HU:</span>
            <Slider
              min={thresholdRange?.[0] ?? -1000}
              max={thresholdRange?.[1] ?? 2000}
              step={10}
              value={threshold3D}
              onChange={setThreshold3D}
              style={{ width: 110 }}
              tooltip={{ formatter: (v) => `${v} ${thresholdUnit || 'HU'}` }}
            />
            <span style={{ fontFamily: 'monospace', color: '#38bdf8', minWidth: 22 }}>
              {threshold3D} {thresholdUnit || 'HU'}
            </span>
          </div>

          <Button
            size="small"
            icon={<ReloadOutlined />}
            onClick={onReset3D}
            style={{
              backgroundColor: '#1e293b',
              color: '#cbd5e1',
              border: '1px solid #334155',
              fontWeight: '600',
            }}
          >
            Reset
          </Button>
        </div>
      )}

      {/* Thu gọn thanh công cụ + Đóng (đặt cùng nhóm, không chồng lên nút đóng mặc định của Modal) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <Tooltip title={isControlsMinimized ? 'Hiện thanh công cụ' : 'Thu gọn thanh công cụ để mở rộng ảnh'}>
          <button
            type="button"
            className="pacs-mpr-head-btn"
            onClick={() => setIsControlsMinimized((prev) => !prev)}
            aria-label={isControlsMinimized ? 'Hiện thanh công cụ' : 'Thu gọn thanh công cụ'}
          >
            {isControlsMinimized ? <DownOutlined /> : <UpOutlined />}
          </button>
        </Tooltip>
        {onClose && (
          <Tooltip title="Đóng (Esc)">
            <button type="button" className="pacs-mpr-head-btn is-close" onClick={onClose} aria-label="Đóng">
              <CloseOutlined />
            </button>
          </Tooltip>
        )}
      </div>
    </div>
  );
}
