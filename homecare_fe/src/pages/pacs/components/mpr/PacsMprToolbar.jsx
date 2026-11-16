import React from 'react';
import { Button, Tooltip, Select, Slider, Radio } from 'antd';
import {
  ReloadOutlined,
  AppstoreOutlined,
  SplitCellsOutlined,
  FullscreenOutlined,
  UpOutlined,
  DownOutlined,
} from '@ant-design/icons';

export default function PacsMprToolbar({
  patientName = 'Bệnh nhân',
  modality = 'MR',
  numSlices = 0,
  layoutMode = '1x2',
  setLayoutMode,
  colorMode3D = 'bone_shaded',
  setColorMode3D,
  threshold3D = 35,
  setThreshold3D,
  onReset3D,
  isControlsMinimized = false,
  setIsControlsMinimized,
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
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
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
              <Radio.Button value="3D_MAX" title="Phóng to riêng Viewport 3D toàn màn hình">
                <FullscreenOutlined /> 3D Max
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
              min={5}
              max={150}
              value={threshold3D}
              onChange={setThreshold3D}
              style={{ width: 80 }}
            />
            <span style={{ fontFamily: 'monospace', color: '#38bdf8', minWidth: 22 }}>
              {threshold3D}
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

      {/* Nút Thu gọn / Mở rộng Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <Tooltip title={isControlsMinimized ? 'Mở rộng bảng công cụ' : 'Thu gọn thanh công cụ để mở rộng ảnh'}>
          <Button
            size="small"
            type="text"
            icon={isControlsMinimized ? <DownOutlined style={{ color: '#38bdf8' }} /> : <UpOutlined style={{ color: '#94a3b8' }} />}
            onClick={() => setIsControlsMinimized((prev) => !prev)}
            style={{ backgroundColor: isControlsMinimized ? '#1e293b' : 'transparent' }}
          >
            {isControlsMinimized ? 'Hiện công cụ' : ''}
          </Button>
        </Tooltip>
      </div>
    </div>
  );
}
