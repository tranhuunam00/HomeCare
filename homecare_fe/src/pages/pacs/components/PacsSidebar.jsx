import React, { useState, useRef } from 'react';
import { Tooltip, Switch, message, Modal, Button, Select } from 'antd';
import {
  DownOutlined,
  RightOutlined,
  LineOutlined,
  BorderOutlined,
  RadiusSettingOutlined,
  ColumnHeightOutlined,
  ColumnWidthOutlined,
  DotChartOutlined,
  HighlightOutlined,
  AimOutlined,
  FontSizeOutlined,
  RotateLeftOutlined,
  RotateRightOutlined,
  SwapOutlined,
  RetweetOutlined,
  BgColorsOutlined,
  ZoomInOutlined,
  BulbOutlined,
  LinkOutlined,
  OrderedListOutlined,
  NodeIndexOutlined,
  FullscreenOutlined,
  PictureOutlined,
  CameraOutlined,
  ScissorOutlined,
  StarOutlined,
  DownloadOutlined,
  FolderOpenOutlined,
  PrinterOutlined,
  SettingOutlined,
  QuestionCircleOutlined,
  FileSearchOutlined,
  EyeOutlined,
  MessageOutlined,
  UnorderedListOutlined,
  UploadOutlined,
  BranchesOutlined,
  DatabaseOutlined,
  DragOutlined,
  GatewayOutlined,
  CopyOutlined,
  ArrowRightOutlined,
  DeploymentUnitOutlined,
  CheckSquareOutlined,
  HeartOutlined,
  CompassOutlined,
} from '@ant-design/icons';
import { VIEWER_LAYOUTS, PACS_TOOLS } from '../constants/pacs.constants';
import LayoutIcon from './LayoutIcon';
import PacsSidebarHistory from './sidebar/PacsSidebarHistory';

const SYNC_OPTIONS = [
  { key: 'scroll', label: 'Đồng bộ cuộn', hint: 'Cùng hướng cắt: theo vị trí (mm)' },
  { key: 'refLines', label: 'Đường tham chiếu', hint: 'Chỉ hiện khi ô kia KHÁC hướng cắt (Axial ↔ Coronal/Sagittal)' },
  { key: 'window', label: 'Đồng bộ WW/WL', hint: 'Các series cùng modality' },
  { key: 'zoomPan', label: 'Đồng bộ zoom / kéo' },
];

/** Thông báo cho nút chưa gắn chức năng (giữ nguyên bố cục thiết kế) */
const devToast = () =>
  message.info({ content: 'Tính năng đang phát triển', key: 'pacs-dev', duration: 1.5 });

/* ------- Icon chữ (Axial / Coronal / Sagittal / 3D) theo thiết kế ------- */
function LetterIcon({ big, small, size = 15 }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'baseline', lineHeight: 1 }}>
      <span style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontSize: size, fontWeight: 700 }}>{big}</span>
      {small && <span style={{ fontSize: size * 0.5, fontWeight: 600 }}>{small}</span>}
    </span>
  );
}

const CubeIcon = (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
    <path d="M12 2 21 7v10l-9 5-9-5V7z" />
    <path d="M12 2v10l9-5M12 12v10M12 12 3 7" />
  </svg>
);

const StackIcon = (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round">
    <path d="M12 3 2 8l10 5 10-5z" />
    <path d="M2 12l10 5 10-5M2 16l10 5 10-5" />
  </svg>
);

const RulerDiagIcon = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
    <rect x="2" y="14" width="20" height="6" rx="1" transform="rotate(-45 12 12)" />
    <path d="M9 9l1.5 1.5M12 6l1.5 1.5M15 3l1.5 1.5" />
  </svg>
);

const PentagonIcon = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
    <path d="M12 3l9 6.5-3.4 10.5H6.4L3 9.5z" />
  </svg>
);

const CobbIcon = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
    <path d="M3 7h10M4 17h12" />
    <path d="M13 7l-2 4M16 17l-2-4" />
  </svg>
);

const EllipseIcon = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <ellipse cx="12" cy="12" rx="10" ry="6" />
  </svg>
);

const FreehandIcon = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
    <path d="M4 14c0-5 4-8 8-8s7 3 6 7c-.7 3-5 3-5 0 0-2 2-3 4-2" />
  </svg>
);

const SpineIcon = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <path d="M12 3c2 0 2 2 0 3s-2 3 0 4 2 3 0 4-2 3 0 4" />
    <path d="M9 4h6M8 8h7M9 12h6M8 16h7M9 20h5" />
  </svg>
);

const BoneIcon = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 3a2.83 2.83 0 0 0-4 0l-6 6a2.83 2.83 0 1 0 4 4l6-6a2.83 2.83 0 0 0 0-4z" />
    <circle cx="5" cy="19" r="2" />
    <circle cx="19" cy="5" r="2" />
  </svg>
);

const BrainIcon = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
    <path d="M12 4a4 4 0 0 0-4 4c0 1 .4 2 1 2.7A4 4 0 0 0 6 15a4 4 0 0 0 4 4h2" />
    <path d="M12 4a4 4 0 0 1 4 4c0 1-.4 2-1 2.7A4 4 0 0 1 18 15a4 4 0 0 1-4 4h-2" />
  </svg>
);

const PaletteIcon = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
    <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
    <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
    <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.9 0 1.5-.7 1.5-1.5 0-.4-.2-.8-.4-1.1-.3-.3-.4-.7-.4-1.1 0-.8.7-1.5 1.5-1.5H16c3.3 0 6-2.7 6-6 0-5.5-4.5-9.8-10-9.8z" />
  </svg>
);

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
  onCopyMeasurements,
  onUploadDicom,
  onReloadStudy,
  flipH,
  setFlipH,
  flipV,
  setFlipV,
  setRotation,
  onReset,
  onApplyPreset,
  onOpenMpr,
  onReconstructMpr,
  onMprPlane,
  mprInline = false,
  mprInitialLayout = '2x2',
  canBuild3D = false,
  activeSeriesSliceCount = 0,
  sync = {},
  onChangeSync,
  invert = false,
  setInvert,
  colorLut = 'default',
  setColorLut,
  onOpenHistogram,
  onOpenThreshold,
  activeThreshold,
  isSmooth = true,
  onToggleSmooth,
  onCaptureKeyImage,
  onCaptureStarKeyImage,
  onOpenCrop,
  onOpenKeyImageGallery,
  isPlayingCine = false,
  onToggleCine,
  onDownloadImage,
  onPrintImage,
  showOverlay = true,
  onToggleOverlay,
  onOpenWorklist,
  onOpenPatientInfo,
  reportingOpen = false,
  onToggleReporting,
  rightSliceStripOpen = false,
  onToggleSliceStrip,
}) {
  const [helpOpen, setHelpOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [open, setOpen] = useState({
    layout: true,
    measure: true,
    advance: true,
    image: true,
    sync: true,
    mpr: true,
    annotation: true,
    capture: true,
    more: true,
  });
  const toggle = (k) => setOpen((p) => ({ ...p, [k]: !p[k] }));

  const uploadInputRef = useRef(null);
  const openUpload = () => uploadInputRef.current?.click();
  const onPickFile = (e) => {
    const file = e.target.files?.[0];
    if (file && onUploadDicom) onUploadDicom(file);
    e.target.value = '';
  };

  const displaySlicePos = activeSliceIndex !== undefined ? activeSliceIndex : currentIndex;
  const displaySliceTotal = activeSeriesTotal !== undefined ? activeSeriesTotal : instances.length;

  const mprPlane = (plane) => (onMprPlane ? onMprPlane(plane) : onReconstructMpr?.());
  const mprActive = (plane) => mprInline && mprInitialLayout === plane;
  const mprTip = (label) =>
    canBuild3D ? label : `${label} — cần series > 20 lát (1 frame/lát), hiện có ${activeSeriesSliceCount}`;

  const nextLut = () => {
    if (!setColorLut) return devToast();
    const order = ['default', 'rainbow', 'hot_iron', 'inverted'];
    const names = {
      default: 'Mặc định (Grayscale)',
      rainbow: 'Cầu vồng nhiệt (Rainbow)',
      hot_iron: 'Sắt nung đỏ (Hot Iron)',
      inverted: 'Đảo âm bản (Inverted)',
    };
    const i = order.indexOf(colorLut);
    const next = order[(i + 1) % order.length];
    setColorLut(next);
    message.success(`Đã đổi bảng màu: ${names[next] || next}`);
  };

  const toggleFullscreen = () => {
    try {
      if (!document.fullscreenElement) document.documentElement.requestFullscreen?.();
      else document.exitFullscreen?.();
    } catch {
      devToast();
    }
  };

  return (
    <div className="pacs-sidebar" style={SIDEBAR_STYLE}>
      <PacsSidebarHistory
        study={study}
        currentMeta={currentMeta}
        instances={instances}
        displaySlicePos={displaySlicePos}
        displaySliceTotal={displaySliceTotal}
        onUploadDicom={onUploadDicom}
        onReloadStudy={onReloadStudy}
      />

      <input ref={uploadInputRef} type="file" accept=".dcm,application/dicom,image/*" style={{ display: 'none' }} onChange={onPickFile} />

      {/* ---------------- Layout ---------------- */}
      <Section id="layout" title="Layout" open={open.layout} onToggle={() => toggle('layout')}>
        {VIEWER_LAYOUTS.slice(0, 8).map((item) => (
          <ToolBtn
            key={item.key}
            title={item.title || `${item.rows} hàng × ${item.cols} cột`}
            active={layout === item.key}
            onClick={() => setLayout(item.key)}
          >
            <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, fontSize: 8 }}>
              <LayoutIcon layout={item} />
              {item.label}
            </span>
          </ToolBtn>
        ))}
      </Section>

      {/* ---------------- Measurement Tools ---------------- */}
      <Section id="measure" title="Measurement Tools" open={open.measure} onToggle={() => toggle('measure')}>
        <ToolBtn title="Đo khoảng cách (Line mm)" color="#22c55e" active={activeTool === PACS_TOOLS.LENGTH} onClick={() => setActiveTool(PACS_TOOLS.LENGTH)}>{RulerDiagIcon}</ToolBtn>
        <ToolBtn title="ROI đa giác" color="#ec4899" active={activeTool === PACS_TOOLS.ROI_POLYGON} onClick={() => setActiveTool(PACS_TOOLS.ROI_POLYGON)}>{PentagonIcon}</ToolBtn>
        <ToolBtn title="Bút đánh dấu (Pen)" color="#facc15" active={activeTool === PACS_TOOLS.PEN} onClick={() => setActiveTool(PACS_TOOLS.PEN)}><HighlightOutlined /></ToolBtn>
        <ToolBtn title="Trục cột sống (Spine)" color="#f97316" active={activeTool === PACS_TOOLS.SPINE} onClick={() => setActiveTool(PACS_TOOLS.SPINE)}>{SpineIcon}</ToolBtn>

        <ToolBtn title="Giá trị điểm (Probe HU)" color="#06b6d4" active={activeTool === PACS_TOOLS.PROBE} onClick={() => setActiveTool(PACS_TOOLS.PROBE)}><AimOutlined /></ToolBtn>
        <ToolBtn title="Đo góc (Angle °)" color="#f59e0b" active={activeTool === PACS_TOOLS.ANGLE} onClick={() => setActiveTool(PACS_TOOLS.ANGLE)}><RadiusSettingOutlined /></ToolBtn>
        <ToolBtn title="Góc Cobb" color="#f97316" active={activeTool === PACS_TOOLS.COBB} onClick={() => setActiveTool(PACS_TOOLS.COBB)}>{CobbIcon}</ToolBtn>
        <ToolBtn title="Đo diện tích Chữ nhật (ROI mm²)" color="#c084fc" active={activeTool === PACS_TOOLS.ROI_RECT} onClick={() => setActiveTool(PACS_TOOLS.ROI_RECT)}><BorderOutlined /></ToolBtn>

        <ToolBtn title="Đo diện tích Elip (ROI mm²)" color="#38bdf8" active={activeTool === PACS_TOOLS.ROI_ELLIPSE} onClick={() => setActiveTool(PACS_TOOLS.ROI_ELLIPSE)}>{EllipseIcon}</ToolBtn>
        <ToolBtn title="ROI tự do (Freehand)" color="#10b981" active={activeTool === PACS_TOOLS.ROI_FREEHAND} onClick={() => setActiveTool(PACS_TOOLS.ROI_FREEHAND)}>{FreehandIcon}</ToolBtn>
        <ToolBtn title="Sao chép số đo" color="#38bdf8" onClick={onCopyMeasurements || devToast}><CopyOutlined /></ToolBtn>
        <ToolBtn title="Đo chiều cao (dọc mm)" color="#22c55e" active={activeTool === PACS_TOOLS.LENGTH_V} onClick={() => setActiveTool(PACS_TOOLS.LENGTH_V)}><ColumnHeightOutlined /></ToolBtn>

        <ToolBtn title="Nhãn chữ (Text)" color="#e2e8f0" active={activeTool === PACS_TOOLS.TEXT} onClick={() => setActiveTool(PACS_TOOLS.TEXT)}><FontSizeOutlined /></ToolBtn>
        <ToolBtn title="Đo khoảng cách ngang (mm)" color="#22c55e" active={activeTool === PACS_TOOLS.LENGTH_H} onClick={() => setActiveTool(PACS_TOOLS.LENGTH_H)}><ColumnWidthOutlined /></ToolBtn>
        <ToolBtn title="Đo đường kính (Line)" color="#22c55e" active={activeTool === PACS_TOOLS.LENGTH} onClick={() => setActiveTool(PACS_TOOLS.LENGTH)}><LineOutlined /></ToolBtn>
        <ToolBtn title="Góc 45°" color="#f59e0b" active={activeTool === PACS_TOOLS.ANGLE_45} onClick={() => setActiveTool(PACS_TOOLS.ANGLE_45)}><RadiusSettingOutlined rotate={180} /></ToolBtn>

        <ToolBtn title="Chỉ số khung chậu / Xương" color="#e879f9" active={activeTool === PACS_TOOLS.BONE} onClick={() => setActiveTool(PACS_TOOLS.BONE)}>{BoneIcon}</ToolBtn>
        <ToolBtn title="ROI chữ nhật nghiêng" color="#c084fc" active={activeTool === PACS_TOOLS.ROI_ROTATED_RECT} onClick={() => setActiveTool(PACS_TOOLS.ROI_ROTATED_RECT)}><GatewayOutlined /></ToolBtn>
        <ToolBtn title="Mũi tên chỉ điểm (Arrow)" color="#38bdf8" active={activeTool === PACS_TOOLS.ARROW} onClick={() => setActiveTool(PACS_TOOLS.ARROW)}><ArrowRightOutlined /></ToolBtn>
        <ToolBtn title="Cung tròn (Arc)" color="#f59e0b" active={activeTool === PACS_TOOLS.ARC} onClick={() => setActiveTool(PACS_TOOLS.ARC)}>{CobbIcon}</ToolBtn>

        <button onClick={onClearAnnotations} style={CLEAR_BTN_STYLE}>Xóa đo đạc lát này</button>
      </Section>

      {/* ---------------- Advance Tools ---------------- */}
      <Section id="advance" title="Advance Tools" open={open.advance} onToggle={() => toggle('advance')}>
        <ToolBtn title="Biểu đồ phân bố (Histogram HU)" color="#0284c7" onClick={onOpenHistogram}><DotChartOutlined /></ToolBtn>
        <ToolBtn title="Dựng mạch máu (MIP)" color="#38bdf8" onClick={() => { onOpenMpr?.(); message.info('Mở chế độ dựng hình mạch máu 3D / MIP'); }}><BranchesOutlined /></ToolBtn>
        <ToolBtn
          title={canBuild3D ? 'Dựng hình 3D Volume (popup)' : `Cần trên 20 ảnh (hiện có ${activeSeriesSliceCount})`}
          color="#38bdf8"
          onClick={onOpenMpr}
        >
          <DatabaseOutlined />
        </ToolBtn>
        <ToolBtn title="Cửa sổ CT Não (Brain)" color="#ec4899" onClick={() => { onApplyPreset?.({ key: 'brain', ww: 80, wl: 40 }); message.success('Cửa sổ Não: W 80 / L 40'); }}>{BrainIcon}</ToolBtn>

        <ToolBtn title="Dựng bề mặt 3D" color="#38bdf8" onClick={onOpenMpr}>{PentagonIcon}</ToolBtn>
        <ToolBtn title="Cửa sổ Tim / Trung thất" color="#f43f5e" onClick={() => { onApplyPreset?.({ key: 'mediastinum', ww: 350, wl: 50 }); message.success('Cửa sổ Trung thất: W 350 / L 50'); }}><HeartOutlined /></ToolBtn>
        <ToolBtn title="Khối 3D đa mặt cắt (MPR)" color="#34d399" onClick={onOpenMpr}>{CubeIcon}</ToolBtn>
        <ToolBtn title="Phân vùng tổn thương" color="#a855f7" onClick={onOpenThreshold}><DeploymentUnitOutlined /></ToolBtn>

        <ToolBtn title="Tải ảnh DICOM lên" color="#38bdf8" onClick={openUpload}><UploadOutlined /></ToolBtn>
      </Section>

      {/* ---------------- Image Tools ---------------- */}
      <Section id="image" title="Image Tools" open={open.image} onToggle={() => toggle('image')}>
        <ToolBtn title="Xoay trái 90°" onClick={() => setRotation((r) => (r + 270) % 360)}><RotateLeftOutlined /></ToolBtn>
        <ToolBtn title="Xoay phải 90°" onClick={() => setRotation((r) => (r + 90) % 360)}><RotateRightOutlined /></ToolBtn>
        <ToolBtn title="Lật ngang (Flip H)" active={flipH} onClick={() => setFlipH((v) => !v)}><SwapOutlined /></ToolBtn>
        <ToolBtn title="Lật dọc (Flip V)" active={flipV} onClick={() => setFlipV((v) => !v)}><SwapOutlined rotate={90} /></ToolBtn>

        <ToolBtn title="Đặt lại hiển thị" onClick={onReset}><RetweetOutlined /></ToolBtn>
        <ToolBtn title="Chỉnh sáng / tương phản (WW/WL)" color="#f59e0b" active={activeTool === PACS_TOOLS.WW_WL} onClick={() => setActiveTool(PACS_TOOLS.WW_WL)}><BulbOutlined /></ToolBtn>
        <ToolBtn title="Kính lúp chi tiết (Magnify Lens)" color="#38bdf8" active={activeTool === PACS_TOOLS.MAGNIFY} onClick={() => setActiveTool(PACS_TOOLS.MAGNIFY)}><ZoomInOutlined /></ToolBtn>
        <ToolBtn title="Biểu đồ phân bố tần số (Histogram HU)" color="#0284c7" onClick={onOpenHistogram}><DotChartOutlined /></ToolBtn>

        <ToolBtn title="Cắt ngưỡng / Tô màu tổn thương (Threshold Tint)" color="#eab308" active={!!activeThreshold} onClick={onOpenThreshold}><BgColorsOutlined /></ToolBtn>
        <ToolBtn title={`Bảng màu (LUT): ${colorLut !== 'default' ? colorLut : 'Mặc định'}`} active={colorLut !== 'default'} onClick={nextLut}>{PaletteIcon}</ToolBtn>
        <ToolBtn title={`Đảo màu (Invert): ${invert ? 'Bật' : 'Tắt'}`} active={invert} onClick={() => { setInvert?.((v) => !v); message.info(invert ? 'Chuyển về ảnh gốc' : 'Đã bật đảo màu âm bản'); }}>{InvertGlyph}</ToolBtn>
      </Section>

      {/* ---------------- Sync Tools ---------------- */}
      <Section id="sync" title="Sync Tools" open={open.sync} onToggle={() => toggle('sync')}>
        <ToolBtn title="Đồng bộ cuộn" color="#38bdf8" active={!!sync.scroll} onClick={() => onChangeSync?.({ scroll: !sync.scroll })}><LinkOutlined /></ToolBtn>
        <ToolBtn title="Đường tham chiếu" color="#38bdf8" active={!!sync.refLines} onClick={() => onChangeSync?.({ refLines: !sync.refLines })}><OrderedListOutlined /></ToolBtn>
        <ToolBtn title="Đồng bộ trục X/Y/Z" color="#c084fc" onClick={() => (onMprPlane ? onMprPlane('AXIAL') : onOpenMpr ? onOpenMpr() : message.info('Đã bật đồng bộ trục tọa độ'))}><NodeIndexOutlined /></ToolBtn>
        <ToolBtn title="Toàn màn hình" onClick={toggleFullscreen}><FullscreenOutlined /></ToolBtn>

        <ToolBtn title="Đồng bộ WW/WL" color="#f59e0b" active={!!sync.window} onClick={() => onChangeSync?.({ window: !sync.window })}><BulbOutlined /></ToolBtn>
        <ToolBtn title="Đồng bộ zoom / kéo" color="#38bdf8" active={!!sync.zoomPan} onClick={() => onChangeSync?.({ zoomPan: !sync.zoomPan })}><LinkOutlined rotate={45} /></ToolBtn>
      </Section>

      {/* ---------------- MPR Tools ---------------- */}
      <Section id="mpr" title="MPR Tools" open={open.mpr} onToggle={() => toggle('mpr')}>
        <ToolBtn title={mprTip('Axial - Mặt cắt ngang')} color="#38bdf8" dim={!canBuild3D} active={mprActive('AXIAL')} onClick={() => mprPlane('AXIAL')}><LetterIcon big="A" small="xial" /></ToolBtn>
        <ToolBtn title={mprTip('Coronal - Mặt cắt trán')} color="#10b981" dim={!canBuild3D} active={mprActive('CORONAL')} onClick={() => mprPlane('CORONAL')}><LetterIcon big="C" small="oronal" /></ToolBtn>
        <ToolBtn title={mprTip('Sagittal - Mặt cắt dọc')} color="#f59e0b" dim={!canBuild3D} active={mprActive('SAGITTAL')} onClick={() => mprPlane('SAGITTAL')}><LetterIcon big="S" small="agittal" /></ToolBtn>
        <ToolBtn title={mprTip('Tri-planar 2x2 (Axial + Coronal + Sagittal + 3D)')} color="#a855f7" dim={!canBuild3D} active={mprActive('2x2')} onClick={() => mprPlane('2x2')}>{StackIcon}</ToolBtn>

        <ToolBtn title={mprTip('3D Volume trong khung xem')} color="#c084fc" dim={!canBuild3D} active={mprActive('3D_MAX')} onClick={() => mprPlane('3D_MAX')}>{CubeIcon}</ToolBtn>
        <ToolBtn title="Kéo ảnh (Pan)" color="#38bdf8" active={activeTool === PACS_TOOLS.PAN} onClick={() => setActiveTool(PACS_TOOLS.PAN)}><DragOutlined /></ToolBtn>
        <ToolBtn title="Cắt khối đa giác (ROI Polygon)" color="#ec4899" active={activeTool === PACS_TOOLS.ROI_POLYGON} onClick={() => setActiveTool(PACS_TOOLS.ROI_POLYGON)}>{PentagonIcon}</ToolBtn>
        <ToolBtn title="Phân vùng ngưỡng mật độ HU" color="#a855f7" onClick={onOpenThreshold}><DeploymentUnitOutlined /></ToolBtn>
      </Section>

      {/* ---------------- Annotation Tools ---------------- */}
      <Section id="annotation" title="Annotation Tools" open={open.annotation} onToggle={() => toggle('annotation')}>
        <ToolBtn title="Khung chữ (Text)" color="#e2e8f0" active={activeTool === PACS_TOOLS.TEXT} onClick={() => setActiveTool(PACS_TOOLS.TEXT)}><FontSizeOutlined /></ToolBtn>
        <ToolBtn title="Mũi tên chỉ tổn thương (Arrow)" color="#f59e0b" active={activeTool === PACS_TOOLS.ARROW} onClick={() => setActiveTool(PACS_TOOLS.ARROW)}><ArrowRightOutlined rotate={-45} /></ToolBtn>
        <ToolBtn title="Đánh dấu trục cột sống (Spine)" color="#f97316" active={activeTool === PACS_TOOLS.SPINE} onClick={() => setActiveTool(PACS_TOOLS.SPINE)}>{SpineIcon}</ToolBtn>
        <ToolBtn title="Đầu dò giá trị pixel (Probe HU)" color="#06b6d4" active={activeTool === PACS_TOOLS.PROBE} onClick={() => setActiveTool(PACS_TOOLS.PROBE)}>{BrainIcon}</ToolBtn>

        <ToolBtn title="Đo khoảng cách (Line mm)" color="#22c55e" active={activeTool === PACS_TOOLS.LENGTH} onClick={() => setActiveTool(PACS_TOOLS.LENGTH)}>{RulerDiagIcon}</ToolBtn>
      </Section>

      {/* ---------------- Capture Tools ---------------- */}
      <Section id="capture" title="Capture Tools" open={open.capture} onToggle={() => toggle('capture')}>
        <ToolBtn title="Cắt vùng ảnh (Crop ROI Snapshot)" color="#f59e0b" onClick={onOpenCrop}><ScissorOutlined /></ToolBtn>
        <ToolBtn title="Chụp ảnh key (lưu vào báo cáo) [Space / S]" color="#38bdf8" onClick={() => onCaptureKeyImage?.()}><CameraOutlined /></ToolBtn>
        <ToolBtn title="Thư viện ảnh key & chẩn đoán" color="#06b6d4" onClick={onOpenKeyImageGallery}><PictureOutlined /></ToolBtn>
        <ToolBtn title="Ảnh key quan trọng (Gắn sao ★)" color="#eab308" onClick={onCaptureStarKeyImage || (() => onCaptureKeyImage?.({ isStarred: true }))}><StarOutlined /></ToolBtn>
      </Section>

      {/* ---------------- More Tools ---------------- */}
      <Section id="more" title="More Tools" open={open.more} onToggle={() => toggle('more')}>
        <ToolBtn title="Lưu ảnh chẩn đoán (Key Image) [Phím S]" color="#38bdf8" onClick={onCaptureKeyImage}><CheckSquareOutlined /></ToolBtn>
        <ToolBtn title="Danh sách lát cắt (Thumbnails)" active={rightSliceStripOpen} onClick={onToggleSliceStrip || devToast}><UnorderedListOutlined /></ToolBtn>
        <ToolBtn title={showOverlay ? 'Ẩn thông tin overlay' : 'Hiện thông tin overlay'} active={!showOverlay} onClick={onToggleOverlay || devToast}><EyeOutlined /></ToolBtn>
        <ToolBtn title={reportingOpen ? 'Thu gọn bảng đọc báo cáo' : 'Mở bảng đọc báo cáo [Alt+D]'} color="#10b981" active={reportingOpen} onClick={onToggleReporting || devToast}><MessageOutlined /></ToolBtn>

        <ToolBtn title="Tải lát cắt hiện tại (PNG)" color="#38bdf8" onClick={onDownloadImage || devToast}><DownloadOutlined /></ToolBtn>
        <ToolBtn title="Danh sách ca chụp (Worklist)" color="#f59e0b" onClick={onOpenWorklist || devToast}><FolderOpenOutlined /></ToolBtn>
        <ToolBtn title="Xem chi tiết thẻ DICOM Tags" color="#38bdf8" onClick={onOpenPatientInfo || devToast}><FileSearchOutlined /></ToolBtn>
        <ToolBtn title="In lát cắt hiện tại" color="#38bdf8" onClick={onPrintImage || devToast}><PrinterOutlined /></ToolBtn>

        <ToolBtn title="Cài đặt hiển thị & Phím tắt" color="#94a3b8" onClick={() => setSettingsOpen(true)}><SettingOutlined /></ToolBtn>
        <ToolBtn title="Trợ giúp phím tắt [Phím ?]" color="#38bdf8" onClick={() => setHelpOpen(true)}><QuestionCircleOutlined /></ToolBtn>
      </Section>

      {/* Sync chi tiết (công tắc) - giữ lựa chọn rõ ràng cho đồng bộ nhiều ô */}
      <div style={{ padding: '6px 8px 12px' }}>
        <div style={{ fontSize: 9.5, color: '#64748b', margin: '2px 2px 4px', textTransform: 'uppercase', letterSpacing: 0.4 }}>
          Đồng bộ nhiều ô
        </div>
        {SYNC_OPTIONS.map((o) => (
          <label key={o.key} className="pacs-switch-row">
            <span>
              {o.label}
              {o.hint && <span className="hint">{o.hint}</span>}
            </span>
            <Switch size="small" checked={!!sync[o.key]} onChange={(v) => onChangeSync?.({ [o.key]: v })} />
          </label>
        ))}
      </div>

      <Modal open={helpOpen} onCancel={() => setHelpOpen(false)} footer={null} width={460} title="Phím tắt D-RADS PACS">
        <div style={{ display: 'flex', flexDirection: 'column', fontSize: 13 }}>
          {SHORTCUTS.map((s) => (
            <div key={s.k} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, padding: '6px 2px', borderBottom: '1px solid #f1f5f9' }}>
              <kbd style={{ fontFamily: 'monospace', background: '#f1f5f9', padding: '1px 7px', borderRadius: 4, color: '#0f172a' }}>{s.k}</kbd>
              <span style={{ color: '#334155', textAlign: 'right' }}>{s.d}</span>
            </div>
          ))}
        </div>
      </Modal>

      <Modal
        open={settingsOpen}
        onCancel={() => setSettingsOpen(false)}
        footer={null}
        width={480}
        title={
          <span style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#0284c7' }}>
            <SettingOutlined /> Cài đặt hiển thị PACS Viewer
          </span>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 13, color: '#0f172a' }}>Làm mượt ảnh (Bilinear Smoothing)</div>
              <div style={{ fontSize: 11, color: '#64748b' }}>Khử răng cưa điểm ảnh khi phóng to (Phím B)</div>
            </div>
            <Switch checked={isSmooth} onChange={onToggleSmooth} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 13, color: '#0f172a' }}>Thông số trên màn hình (HUD Overlay)</div>
              <div style={{ fontSize: 11, color: '#64748b' }}>Hiển thị tên BN, PID, ngày chụp, WW/WL, Zoom</div>
            </div>
            <Switch checked={showOverlay} onChange={onToggleOverlay} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 13, color: '#0f172a' }}>Đảo âm / dương bản (Invert)</div>
              <div style={{ fontSize: 11, color: '#64748b' }}>Xương đen trên nền sáng (Phím I)</div>
            </div>
            <Switch checked={invert} onChange={(v) => setInvert?.(v)} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 13, color: '#0f172a' }}>Bảng màu giả (Color LUT)</div>
              <div style={{ fontSize: 11, color: '#64748b' }}>Thang màu nhiệt, cầu vồng chẩn đoán</div>
            </div>
            <Select
              size="small"
              value={colorLut}
              onChange={setColorLut}
              style={{ width: 140 }}
              options={[
                { value: 'default', label: 'Mặc định (Grayscale)' },
                { value: 'rainbow', label: 'Cầu vồng (Rainbow)' },
                { value: 'hot_iron', label: 'Sắt nung đỏ (Hot Iron)' },
                { value: 'inverted', label: 'Đảo âm bản' },
              ]}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
            <Button type="primary" onClick={() => setSettingsOpen(false)}>Đã xong</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

const SHORTCUTS = [
  { k: '← → ↑ ↓', d: 'Chuyển lát trước/sau' },
  { k: 'PageUp / PageDown', d: 'Nhảy 10 lát' },
  { k: 'Home / End', d: 'Lát đầu / lát cuối' },
  { k: '1 – 9', d: 'Preset cửa sổ CT (Não, Phổi, Xương…)' },
  { k: '0', d: 'Cửa sổ mặc định (theo DICOM)' },
  { k: 'A / C / S / V', d: 'MPR Axial / Coronal / Sagittal / 3D (khi mở MPR)' },
  { k: 'W', d: 'Công cụ chỉnh sáng/tương phản (WW/WL)' },
  { k: 'L', d: 'Đo chiều dài' },
  { k: 'E', d: 'Đo diện tích elip' },
  { k: 'P', d: 'Kéo ảnh (Pan)' },
  { k: 'M', d: 'Kính lúp (Magnify)' },
  { k: 'I', d: 'Đảo âm/dương bản' },
  { k: 'B', d: 'Bật/tắt làm mịn ảnh' },
  { k: 'C', d: 'Chạy/dừng Cine' },
  { k: 'R', d: 'Đặt lại hiển thị' },
  { k: 'Space / Ctrl+S', d: 'Chụp ảnh key' },
  { k: 'Ctrl+Z', d: 'Hoàn tác số đo' },
];

/* ============================ Helpers ============================ */

const SIDEBAR_STYLE = {
  width: 182,
  minWidth: 182,
  backgroundColor: '#0c1222',
  borderRight: '1px solid #1e293b',
  display: 'flex',
  flexDirection: 'column',
  overflowY: 'auto',
  fontSize: '12px',
  userSelect: 'none',
};

const CLEAR_BTN_STYLE = {
  gridColumn: 'span 4',
  padding: '4px 0',
  marginTop: 2,
  borderRadius: 3,
  border: '1px solid #334155',
  backgroundColor: '#1e293b',
  color: '#f87171',
  cursor: 'pointer',
  fontSize: '11px',
};

const InvertGlyph = (
  <svg width="15" height="15" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.6" fill="none">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor" stroke="none" />
  </svg>
);

function Section({ title, open, onToggle, children }) {
  return (
    <div style={{ borderBottom: '1px solid #1e293b' }}>
      <div
        onClick={onToggle}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '7px 10px',
          cursor: 'pointer',
          fontWeight: 800,
          color: '#dbe4f0',
          fontSize: 12,
          letterSpacing: 0.3,
          background: 'linear-gradient(90deg, #17233c 0%, #101a2e 100%)',
        }}
      >
        <span>{title}</span>
        {open ? <DownOutlined style={{ fontSize: 10 }} /> : <RightOutlined style={{ fontSize: 10 }} />}
      </div>
      {open && (
        <div style={{ padding: '7px 8px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 5 }}>
          {children}
        </div>
      )}
    </div>
  );
}

function ToolBtn({ title, active = false, onClick, color = '#38bdf8', dim = false, children }) {
  return (
    <Tooltip title={title} placement="right" mouseEnterDelay={0.4}>
      <button
        type="button"
        onClick={onClick}
        aria-pressed={active}
        className="pacs-tool-grid-btn"
        style={{
          height: 38,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 4,
          cursor: dim ? 'not-allowed' : 'pointer',
          padding: 0,
          border: `1px ${dim ? 'dashed' : 'solid'} ${active ? color : '#24324a'}`,
          backgroundColor: active ? color : '#0e1726',
          color: active ? '#071320' : '#cbd5e1',
          fontSize: 14,
          opacity: dim ? 0.4 : 1,
          transition: 'background-color .12s, border-color .12s, color .12s',
        }}
      >
        {children}
      </button>
    </Tooltip>
  );
}
