import React from 'react';
import { Button, Tooltip, Dropdown, Upload } from 'antd';
import {
  ZoomInOutlined,
  ZoomOutOutlined,
  DragOutlined,
  EyeOutlined,
  CameraOutlined,
  ReloadOutlined,
  CloseOutlined,
  UndoOutlined,
  FullscreenOutlined,
  ExpandOutlined,
  CompressOutlined,
  LineOutlined,
  SlidersOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { WW_WL_PRESETS, PACS_TOOLS } from '../constants/pacs.constants';

export default function PacsTopNav({
  activeTool,
  setActiveTool,
  invert,
  setInvert,
  rotation,
  setRotation,
  onReset,
  onCaptureKeyImage,
  onApplyPreset,
  currentMeta,
  onOpenMpr,
  onUploadDicom,
  zoom = 1,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  isExpanded = false,
  onToggleExpand,
}) {
  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: 42,
        padding: '0 12px',
        backgroundColor: '#0b101b',
        borderBottom: '1px solid #1e293b',
        zIndex: 20,
        userSelect: 'none',
      }}
    >
      {/* Brand Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div
          style={{
            width: 12,
            height: 12,
            borderRadius: 3,
            backgroundColor: '#38bdf8',
            boxShadow: '0 0 8px #38bdf8',
          }}
        />
        <span
          style={{
            fontWeight: '800',
            fontSize: '14px',
            letterSpacing: '0.5px',
            color: '#f8fafc',
          }}
        >
          D-PACS VIEWER
        </span>
      </div>

      {/* Quick Toolbar (Center) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        {/* Preset WW/WL */}
        <Dropdown
          menu={{
            items: WW_WL_PRESETS.map((p) => ({
              key: p.key,
              label: p.label,
              onClick: () => onApplyPreset(p),
            })),
          }}
        >
          <Tooltip title="Cửa sổ tương phản (Presets)">
            <Button
              size="small"
              icon={<SlidersOutlined />}
              style={{ backgroundColor: '#131b2e', borderColor: '#1e293b', color: '#94a3b8' }}
            />
          </Tooltip>
        </Dropdown>

        <Tooltip title="Độ tương phản tự do (WW/WL - Kéo chuột phải)">
          <Button
            size="small"
            type={activeTool === PACS_TOOLS.WW_WL ? 'primary' : 'default'}
            onClick={() => setActiveTool(PACS_TOOLS.WW_WL)}
            style={
              activeTool !== PACS_TOOLS.WW_WL
                ? { backgroundColor: '#131b2e', borderColor: '#1e293b', color: '#94a3b8' }
                : {}
            }
          >
            WW/WL
          </Button>
        </Tooltip>

        <Tooltip title="Thu nhỏ (-)">
          <Button
            size="small"
            icon={<ZoomOutOutlined />}
            onClick={onZoomOut}
            style={{ backgroundColor: '#131b2e', borderColor: '#1e293b', color: '#94a3b8' }}
          />
        </Tooltip>

        <Tooltip title="Đặt lại tỷ lệ 100% (Nhấn để về 100%)">
          <Button
            size="small"
            onClick={onResetZoom}
            style={{
              backgroundColor: '#131b2e',
              borderColor: '#1e293b',
              color: zoom !== 1 ? '#38bdf8' : '#94a3b8',
              fontSize: '11px',
              fontFamily: 'monospace',
              padding: '0 6px',
              minWidth: 44,
            }}
          >
            {Math.round(zoom * 100)}%
          </Button>
        </Tooltip>

        <Tooltip title="Phóng to (+)">
          <Button
            size="small"
            icon={<ZoomInOutlined />}
            onClick={onZoomIn}
            style={{ backgroundColor: '#131b2e', borderColor: '#1e293b', color: '#94a3b8' }}
          />
        </Tooltip>

        <Tooltip title="Công cụ kéo phóng to / thu nhỏ (Kéo chuột lên/xuống)">
          <Button
            size="small"
            type={activeTool === PACS_TOOLS.ZOOM ? 'primary' : 'default'}
            icon={<ZoomInOutlined />}
            onClick={() => setActiveTool(PACS_TOOLS.ZOOM)}
            style={
              activeTool !== PACS_TOOLS.ZOOM
                ? { backgroundColor: '#131b2e', borderColor: '#1e293b', color: '#94a3b8' }
                : {}
            }
          >
            Zoom
          </Button>
        </Tooltip>

        {onToggleExpand && (
          <Tooltip title={isExpanded ? 'Thu gọn khung ảnh (Hiện thanh bên)' : 'Phóng to tối đa khung ảnh (Ẩn thanh bên)'}>
            <Button
              size="small"
              type={isExpanded ? 'primary' : 'default'}
              icon={isExpanded ? <CompressOutlined /> : <ExpandOutlined />}
              onClick={onToggleExpand}
              style={
                !isExpanded
                  ? { backgroundColor: '#131b2e', borderColor: '#1e293b', color: '#38bdf8' }
                  : {}
              }
            >
              {isExpanded ? 'Thu gọn' : 'Mở rộng'}
            </Button>
          </Tooltip>
        )}

        <Tooltip title="Di chuyển ảnh (Pan)">
          <Button
            size="small"
            type={activeTool === PACS_TOOLS.PAN ? 'primary' : 'default'}
            icon={<DragOutlined />}
            onClick={() => setActiveTool(PACS_TOOLS.PAN)}
            style={
              activeTool !== PACS_TOOLS.PAN
                ? { backgroundColor: '#131b2e', borderColor: '#1e293b', color: '#94a3b8' }
                : {}
            }
          />
        </Tooltip>

        <Tooltip title="Đo chiều dài nốt / tổn thương (Line mm)">
          <Button
            size="small"
            type={activeTool === PACS_TOOLS.LENGTH ? 'primary' : 'default'}
            icon={<LineOutlined />}
            onClick={() => setActiveTool(PACS_TOOLS.LENGTH)}
            style={
              activeTool !== PACS_TOOLS.LENGTH
                ? { backgroundColor: '#131b2e', borderColor: '#1e293b', color: '#94a3b8' }
                : {}
            }
          />
        </Tooltip>

        <Tooltip title="Đảo âm / dương bản (Invert)">
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => setInvert((prev) => !prev)}
            style={{
              backgroundColor: invert ? '#0284c7' : '#131b2e',
              borderColor: '#1e293b',
              color: invert ? '#fff' : '#94a3b8',
            }}
          />
        </Tooltip>

        <Tooltip title="Xoay 90°">
          <Button
            size="small"
            icon={<UndoOutlined />}
            onClick={() => setRotation((prev) => (prev + 90) % 360)}
            style={{ backgroundColor: '#131b2e', borderColor: '#1e293b', color: '#94a3b8' }}
          />
        </Tooltip>

        <Tooltip title="Dựng hình đa mặt phẳng (MPR: Axial, Sagittal, Coronal)">
          <Button
            size="small"
            onClick={onOpenMpr}
            style={{
              backgroundColor: '#1e3a8a',
              borderColor: '#38bdf8',
              color: '#38bdf8',
              fontWeight: '700',
              fontSize: '11px',
            }}
          >
            MPR
          </Button>
        </Tooltip>

        <Tooltip title="Dựng hình 3D (3D Volume Rendering / MIP)">
          <Button
            size="small"
            onClick={onOpenMpr}
            style={{
              backgroundColor: '#581c87',
              borderColor: '#c084fc',
              color: '#c084fc',
              fontWeight: '700',
              fontSize: '11px',
            }}
          >
            3D
          </Button>
        </Tooltip>

        <Tooltip title="Đặt lại góc nhìn">
          <Button
            size="small"
            icon={<ReloadOutlined />}
            onClick={onReset}
            style={{ backgroundColor: '#131b2e', borderColor: '#1e293b', color: '#94a3b8' }}
          />
        </Tooltip>
      </div>

      {/* Right Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {onUploadDicom && (
          <Upload
            showUploadList={false}
            beforeUpload={onUploadDicom}
            accept=".dcm,.dicom,.zip,.pdf,.docx,.doc,.mp4,.png,.jpg,.jpeg"
          >
            <Tooltip title="Tải lên DICOM (.dcm, .zip) hoặc tệp lâm sàng (PDF, Word, Video)">
              <Button
                size="small"
                icon={<UploadOutlined />}
                style={{
                  backgroundColor: '#0369a1',
                  borderColor: '#0284c7',
                  color: '#ffffff',
                  fontWeight: '600',
                  fontSize: '12px',
                }}
              >
                Tải lên DICOM / Tệp
              </Button>
            </Tooltip>
          </Upload>
        )}

        <Button
          type="primary"
          size="small"
          icon={<CameraOutlined />}
          onClick={onCaptureKeyImage}
          style={{
            backgroundColor: '#16a34a',
            borderColor: '#15803d',
            fontWeight: '600',
            fontSize: '12px',
            boxShadow: '0 0 10px rgba(22, 163, 74, 0.5)',
          }}
        >
          Chụp ảnh Key
        </Button>

        <Tooltip title="Toàn màn hình">
          <Button
            size="small"
            icon={<FullscreenOutlined />}
            onClick={handleFullscreen}
            style={{ backgroundColor: '#131b2e', borderColor: '#1e293b', color: '#94a3b8' }}
          />
        </Tooltip>

        <Tooltip title="Đóng cửa sổ">
          <Button
            size="small"
            icon={<CloseOutlined />}
            onClick={() => window.close()}
            style={{ backgroundColor: '#131b2e', borderColor: '#1e293b', color: '#ef4444' }}
          />
        </Tooltip>
      </div>
    </div>
  );
}
