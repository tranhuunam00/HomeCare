import React from 'react';
import { useNavigate } from 'react-router-dom';
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
  CaretRightOutlined,
  PauseOutlined,
  ArrowLeftOutlined,
  FileTextOutlined,
  MenuOutlined,
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
  canBuild3D = false,
  activeSeriesSliceCount = 0,
  onUploadDicom,
  zoom = 1,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  isExpanded = false,
  onToggleExpand,
  isPlayingCine = false,
  onToggleCine,
  cineFps = 10,
  onChangeCineFps,
  totalSlices = 1,
  isSmooth = true,
  onToggleSmooth,
  onBackWorklist,
  reportingOpen = false,
  onToggleReporting,
  onToggleLeftNav,
}) {
  const navigate = useNavigate();

  const handleClose = () => {
    if (window.opener) {
      window.close();
    } else {
      navigate(-1);
    }
  };

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
      {/* Brand Title & Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, whiteSpace: 'nowrap' }}>
        <Tooltip title="Quay về danh sách ca (Worklist)">
          <Button
            size="small"
            icon={<ArrowLeftOutlined />}
            onClick={onBackWorklist || (() => navigate('/home'))}
            style={{
              backgroundColor: '#1e293b',
              borderColor: '#334155',
              color: '#38bdf8',
              fontWeight: '600',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            Worklist
          </Button>
        </Tooltip>

        {onToggleLeftNav && (
          <Tooltip title="Menu chức năng & Lọc trạng thái ca">
            <Button
              size="small"
              icon={<MenuOutlined />}
              onClick={onToggleLeftNav}
              style={{
                backgroundColor: '#131b2e',
                borderColor: '#1e293b',
                color: '#94a3b8',
              }}
            />
          </Tooltip>
        )}

        <img
          src="/logo_home_care.png"
          alt="D-RADS"
          title="D-RADS"
          style={{
            width: 30,
            height: 30,
            borderRadius: '50%',
            objectFit: 'cover',
            marginLeft: 4,
            flexShrink: 0,
          }}
        />
        <span
          style={{
            fontWeight: '800',
            fontSize: '14px',
            letterSpacing: '0.5px',
            color: '#f8fafc',
            whiteSpace: 'nowrap',
          }}
          className="pacs-topnav-title"
        >
          D-RADS PACS VIEWER
        </span>
      </div>

      {/* Quick Toolbar (Center) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        {/* Preset WW/WL */}
        <Dropdown
          menu={{
            items: [
              {
                key: 'default',
                label: 'Mặc định (theo DICOM)',
                onClick: () => onApplyPreset({ key: 'default' }),
              },
              ...((currentMeta?.windowPresets || []).length > 1
                ? [
                    {
                      type: 'group',
                      key: 'dicom',
                      label: 'Cửa sổ do máy chụp đề xuất',
                      children: currentMeta.windowPresets.map((p, i) => ({
                        key: `dicom_${i}`,
                        label: `${p.explanation || `Cửa sổ ${i + 1}`}  ·  W ${Math.round(p.width)} / L ${Math.round(p.center)}`,
                        onClick: () => onApplyPreset({ center: p.center, width: p.width }),
                      })),
                    },
                  ]
                : []),
              ...(!currentMeta || currentMeta.modality === 'CT'
                ? [
                    {
                      type: 'group',
                      key: 'ct',
                      label: 'Preset CT (HU)',
                      children: WW_WL_PRESETS.filter((p) => p.modality === 'CT').map((p) => ({
                        key: p.key,
                        label: (
                          <span style={{ display: 'flex', justifyContent: 'space-between', gap: 16, minWidth: 230 }}>
                            <span>
                              {p.hotkey && <kbd style={{ fontSize: 10, marginRight: 6, opacity: 0.7 }}>{p.hotkey}</kbd>}
                              {p.label}
                            </span>
                            <span style={{ fontFamily: 'monospace', opacity: 0.65 }}>
                              W {p.ww} / L {p.wl}
                            </span>
                          </span>
                        ),
                        onClick: () => onApplyPreset(p),
                      })),
                    },
                  ]
                : []),
            ],
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

        <Tooltip title="Đảo âm / dương bản (Phím I)">
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

        {onToggleSmooth && (
          <Tooltip title={isSmooth ? "Đang bật làm mịn Bilinear (Phím B để chuyển pixel gốc)" : "Đang xem điểm ảnh gốc Pixelated (Phím B để bật làm mịn)"}>
            <Button
              size="small"
              onClick={onToggleSmooth}
              style={{
                backgroundColor: isSmooth ? '#0284c7' : '#131b2e',
                borderColor: isSmooth ? '#38bdf8' : '#1e293b',
                color: isSmooth ? '#fff' : '#94a3b8',
                fontSize: '11px',
                fontWeight: '600',
              }}
            >
              {isSmooth ? '✨ Mịn' : '🔲 Gốc'}
            </Button>
          </Tooltip>
        )}

        {/* Cine Loop Player for Ultrasound, DSA, and CT/MRI multi-slice series */}
        {totalSlices > 1 && onToggleCine && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Tooltip title={isPlayingCine ? 'Tạm dừng Cine Loop (Phím C)' : 'Chạy Cine Loop tự động (Phím C)'}>
              <Button
                size="small"
                type={isPlayingCine ? 'primary' : 'default'}
                icon={isPlayingCine ? <PauseOutlined /> : <CaretRightOutlined />}
                onClick={onToggleCine}
                style={
                  isPlayingCine
                    ? { backgroundColor: '#10b981', borderColor: '#059669' }
                    : { backgroundColor: '#131b2e', borderColor: '#1e293b', color: '#38bdf8' }
                }
              >
                Cine
              </Button>
            </Tooltip>
            {onChangeCineFps && (
              <Dropdown
                menu={{
                  items: [
                    { key: '5', label: '5 FPS (Chậm)', onClick: () => onChangeCineFps(5) },
                    { key: '10', label: '10 FPS (Chuẩn)', onClick: () => onChangeCineFps(10) },
                    { key: '15', label: '15 FPS (Nhanh)', onClick: () => onChangeCineFps(15) },
                    { key: '25', label: '25 FPS (Rất nhanh)', onClick: () => onChangeCineFps(25) },
                  ],
                }}
              >
                <Button
                  size="small"
                  style={{
                    backgroundColor: '#131b2e',
                    borderColor: '#1e293b',
                    color: '#94a3b8',
                    fontSize: '10px',
                    fontFamily: 'monospace',
                    padding: '0 4px',
                  }}
                >
                  {cineFps}fps
                </Button>
              </Dropdown>
            )}
          </div>
        )}

        <Tooltip title="Xoay 90°">
          <Button
            size="small"
            icon={<UndoOutlined />}
            onClick={() => setRotation((prev) => (prev + 90) % 360)}
            style={{ backgroundColor: '#131b2e', borderColor: '#1e293b', color: '#94a3b8' }}
          />
        </Tooltip>

        <Tooltip
          title={
            canBuild3D
              ? 'Dựng hình đa mặt phẳng (MPR: Axial, Sagittal, Coronal)'
              : `Cần trên 20 ảnh trong nhóm đang chọn để dựng MPR (hiện có ${activeSeriesSliceCount} ảnh)`
          }
        >
          <Button
            size="small"
            onClick={onOpenMpr}
            style={{
              backgroundColor: canBuild3D ? '#1e3a8a' : '#0f172a',
              borderColor: canBuild3D ? '#38bdf8' : '#334155',
              color: canBuild3D ? '#38bdf8' : '#64748b',
              fontWeight: '700',
              fontSize: '11px',
              opacity: canBuild3D ? 1 : 0.65,
            }}
          >
            MPR
          </Button>
        </Tooltip>

        <Tooltip
          title={
            canBuild3D
              ? 'Dựng hình 3D (3D Volume Rendering / MIP)'
              : `Cần trên 20 ảnh trong nhóm đang chọn để dựng 3D (hiện có ${activeSeriesSliceCount} ảnh)`
          }
        >
          <Button
            size="small"
            onClick={onOpenMpr}
            style={{
              backgroundColor: canBuild3D ? '#581c87' : '#0f172a',
              borderColor: canBuild3D ? '#c084fc' : '#334155',
              color: canBuild3D ? '#c084fc' : '#64748b',
              fontWeight: '700',
              fontSize: '11px',
              opacity: canBuild3D ? 1 : 0.65,
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
            multiple
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

        {onToggleReporting && (
          <Tooltip title={reportingOpen ? "Thu gọn bảng đọc kết quả" : "Mở bảng đọc kết quả (Chia đôi màn hình)"}>
            <Button
              type={reportingOpen ? "primary" : "default"}
              size="small"
              icon={<FileTextOutlined />}
              onClick={onToggleReporting}
              style={{
                backgroundColor: reportingOpen ? '#2563eb' : '#131b2e',
                borderColor: reportingOpen ? '#1d4ed8' : '#3b82f6',
                color: reportingOpen ? '#ffffff' : '#60a5fa',
                fontWeight: '600',
                fontSize: '12px',
                boxShadow: reportingOpen ? '0 0 10px rgba(37, 99, 235, 0.5)' : 'none',
              }}
            >
              {reportingOpen ? "Thu gọn báo cáo" : "Báo cáo kết quả"}
            </Button>
          </Tooltip>
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

        <Tooltip title="Đóng / Quay lại">
          <Button
            size="small"
            icon={<CloseOutlined />}
            onClick={handleClose}
            style={{ backgroundColor: '#131b2e', borderColor: '#1e293b', color: '#ef4444' }}
          />
        </Tooltip>
      </div>
    </div>
  );
}
