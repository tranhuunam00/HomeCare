import React, { useState, useRef } from 'react';
import { Tooltip, Switch, message, Modal } from 'antd';
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

const emoji = (ch) => <span style={{ fontSize: 15, lineHeight: 1 }}>{ch}</span>;

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
  setRotation,
  onReset,
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
  isSmooth = true,
  onToggleSmooth,
  onCaptureKeyImage,
  isPlayingCine = false,
  onToggleCine,
  onDownloadImage,
  onPrintImage,
  showOverlay = true,
  onToggleOverlay,
}) {
  const [helpOpen, setHelpOpen] = useState(false);
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
    const i = order.indexOf(colorLut);
    return setColorLut(order[(i + 1) % order.length]);
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
        <ToolBtn title="ROI đa giác (đang phát triển)" onClick={devToast}>{PentagonIcon}</ToolBtn>
        <ToolBtn title="Bút đánh dấu (đang phát triển)" color="#facc15" onClick={devToast}><HighlightOutlined /></ToolBtn>
        <ToolBtn title="Cột sống / trục (đang phát triển)" onClick={devToast}>{SpineIcon}</ToolBtn>

        <ToolBtn title="Giá trị điểm (Probe)" onClick={devToast}><AimOutlined /></ToolBtn>
        <ToolBtn title="Đo góc (Angle °)" color="#f59e0b" active={activeTool === PACS_TOOLS.ANGLE} onClick={() => setActiveTool(PACS_TOOLS.ANGLE)}><RadiusSettingOutlined /></ToolBtn>
        <ToolBtn title="Góc Cobb (đang phát triển)" onClick={devToast}>{CobbIcon}</ToolBtn>
        <ToolBtn title="Đo diện tích Chữ nhật (ROI mm²)" color="#c084fc" active={activeTool === PACS_TOOLS.ROI_RECT} onClick={() => setActiveTool(PACS_TOOLS.ROI_RECT)}><BorderOutlined /></ToolBtn>

        <ToolBtn title="Đo diện tích Elip (ROI mm²)" color="#38bdf8" active={activeTool === PACS_TOOLS.ROI_ELLIPSE} onClick={() => setActiveTool(PACS_TOOLS.ROI_ELLIPSE)}>{EllipseIcon}</ToolBtn>
        <ToolBtn title="ROI tự do (đang phát triển)" onClick={devToast}>{FreehandIcon}</ToolBtn>
        <ToolBtn title="Sao chép số đo (đang phát triển)" onClick={devToast}><CopyOutlined /></ToolBtn>
        <ToolBtn title="Đo chiều cao (đang phát triển)" onClick={devToast}><ColumnHeightOutlined /></ToolBtn>

        <ToolBtn title="Nhãn chữ (đang phát triển)" onClick={devToast}><FontSizeOutlined /></ToolBtn>
        <ToolBtn title="Đo khoảng (đang phát triển)" onClick={devToast}><ColumnWidthOutlined /></ToolBtn>
        <ToolBtn title="Đo đường kính (đang phát triển)" onClick={devToast}><LineOutlined /></ToolBtn>
        <ToolBtn title="Góc 45° (đang phát triển)" onClick={devToast}><RadiusSettingOutlined rotate={180} /></ToolBtn>

        <ToolBtn title="Chỉ số khung chậu (đang phát triển)" onClick={devToast}>{emoji('🦴')}</ToolBtn>
        <ToolBtn title="ROI nghiêng (đang phát triển)" onClick={devToast}><GatewayOutlined /></ToolBtn>
        <ToolBtn title="Khoảng cách ngang (đang phát triển)" onClick={devToast}><ArrowRightOutlined /></ToolBtn>
        <ToolBtn title="Cung tròn (đang phát triển)" onClick={devToast}>{CobbIcon}</ToolBtn>

        <button onClick={onClearAnnotations} style={CLEAR_BTN_STYLE}>Xóa đo đạc lát này</button>
      </Section>

      {/* ---------------- Advance Tools ---------------- */}
      <Section id="advance" title="Advance Tools" open={open.advance} onToggle={() => toggle('advance')}>
        <ToolBtn title="Biểu đồ phân bố (đang phát triển)" onClick={devToast}><DotChartOutlined /></ToolBtn>
        <ToolBtn title="Dựng mạch máu (đang phát triển)" onClick={devToast}><BranchesOutlined /></ToolBtn>
        <ToolBtn
          title={canBuild3D ? 'Dựng hình 3D Volume (popup)' : `Cần trên 20 ảnh (hiện có ${activeSeriesSliceCount})`}
          color="#38bdf8"
          onClick={onOpenMpr}
        >
          <DatabaseOutlined />
        </ToolBtn>
        <ToolBtn title="Phân vùng não (đang phát triển)" onClick={devToast}>{emoji('🧠')}</ToolBtn>

        <ToolBtn title="Dựng bề mặt (đang phát triển)" onClick={devToast}>{PentagonIcon}</ToolBtn>
        <ToolBtn title="Phân tích tim (đang phát triển)" onClick={devToast}>{emoji('❤️')}</ToolBtn>
        <ToolBtn title="Khối 3D (đang phát triển)" color="#34d399" onClick={onOpenMpr}>{CubeIcon}</ToolBtn>
        <ToolBtn title="Phân vùng AI (đang phát triển)" onClick={devToast}><DeploymentUnitOutlined /></ToolBtn>

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
        <ToolBtn title="Kính lúp / Zoom" color="#38bdf8" active={activeTool === PACS_TOOLS.MAGNIFY} onClick={() => setActiveTool(PACS_TOOLS.MAGNIFY)}><ZoomInOutlined /></ToolBtn>
        <ToolBtn title={`Làm mượt ảnh: ${isSmooth ? 'Bật' : 'Tắt'}`} active={isSmooth} onClick={onToggleSmooth}><DotChartOutlined /></ToolBtn>

        <ToolBtn title="Bảng màu (Color LUT)" active={colorLut !== 'default'} onClick={nextLut}><BgColorsOutlined /></ToolBtn>
        <ToolBtn title="Đổi bảng màu (Color LUT)" active={colorLut !== 'default'} onClick={nextLut}>{emoji('🎨')}</ToolBtn>
        <ToolBtn title={`Đảo màu (Invert): ${invert ? 'Bật' : 'Tắt'}`} active={invert} onClick={() => setInvert?.((v) => !v)}>{InvertGlyph}</ToolBtn>
      </Section>

      {/* ---------------- Sync Tools ---------------- */}
      <Section id="sync" title="Sync Tools" open={open.sync} onToggle={() => toggle('sync')}>
        <ToolBtn title="Đồng bộ cuộn" color="#38bdf8" active={!!sync.scroll} onClick={() => onChangeSync?.({ scroll: !sync.scroll })}><LinkOutlined /></ToolBtn>
        <ToolBtn title="Đường tham chiếu" color="#38bdf8" active={!!sync.refLines} onClick={() => onChangeSync?.({ refLines: !sync.refLines })}><OrderedListOutlined /></ToolBtn>
        <ToolBtn title="Đồng bộ trục X/Y/Z (đang phát triển)" onClick={devToast}><NodeIndexOutlined /></ToolBtn>
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
        <ToolBtn title="Cắt khối đa giác (đang phát triển)" onClick={devToast}>{PentagonIcon}</ToolBtn>
        <ToolBtn title="Phân vùng khối (đang phát triển)" onClick={devToast}><DeploymentUnitOutlined /></ToolBtn>
      </Section>

      {/* ---------------- Annotation Tools ---------------- */}
      <Section id="annotation" title="Annotation Tools" open={open.annotation} onToggle={() => toggle('annotation')}>
        <ToolBtn title="Khung chữ (đang phát triển)" onClick={devToast}><FontSizeOutlined /></ToolBtn>
        <ToolBtn title="Mũi tên chỉ (đang phát triển)" onClick={devToast}><ArrowRightOutlined rotate={-45} /></ToolBtn>
        <ToolBtn title="Đánh dấu cột sống (đang phát triển)" onClick={devToast}>{SpineIcon}</ToolBtn>
        <ToolBtn title="Ghi chú giải phẫu (đang phát triển)" onClick={devToast}>{emoji('🧠')}</ToolBtn>

        <ToolBtn title="Đo khoảng cách (Line mm)" color="#22c55e" active={activeTool === PACS_TOOLS.LENGTH} onClick={() => setActiveTool(PACS_TOOLS.LENGTH)}>{RulerDiagIcon}</ToolBtn>
      </Section>

      {/* ---------------- Capture Tools ---------------- */}
      <Section id="capture" title="Capture Tools" open={open.capture} onToggle={() => toggle('capture')}>
        <ToolBtn title="Cắt vùng ảnh (đang phát triển)" onClick={devToast}><ScissorOutlined /></ToolBtn>
        <ToolBtn title="Chụp ảnh key (lưu vào báo cáo)" color="#38bdf8" onClick={onCaptureKeyImage}><CameraOutlined /></ToolBtn>
        <ToolBtn title="Thư viện ảnh key (đang phát triển)" onClick={devToast}><PictureOutlined /></ToolBtn>
        <ToolBtn title="Ảnh key nhanh" color="#60a5fa" onClick={onCaptureKeyImage}><StarOutlined /></ToolBtn>
      </Section>

      {/* ---------------- More Tools ---------------- */}
      <Section id="more" title="More Tools" open={open.more} onToggle={() => toggle('more')}>
        <ToolBtn title="Danh sách lát (đang phát triển)" onClick={devToast}><CheckSquareOutlined /></ToolBtn>
        <ToolBtn title={`Cine (phát/dừng): ${isPlayingCine ? 'Đang chạy' : 'Dừng'}`} color="#f59e0b" active={isPlayingCine} onClick={onToggleCine}><UnorderedListOutlined /></ToolBtn>
        <ToolBtn title={showOverlay ? 'Ẩn thông tin overlay' : 'Hiện thông tin overlay'} active={!showOverlay} onClick={onToggleOverlay || devToast}><EyeOutlined /></ToolBtn>
        <ToolBtn title="Ghi chú / bình luận (đang phát triển)" onClick={devToast}><MessageOutlined /></ToolBtn>

        <ToolBtn title="Tải lát cắt hiện tại (PNG)" color="#38bdf8" onClick={onDownloadImage || devToast}><DownloadOutlined /></ToolBtn>
        <ToolBtn title="Mở thư mục (đang phát triển)" onClick={devToast}><FolderOpenOutlined /></ToolBtn>
        <ToolBtn title="Tra cứu báo cáo (đang phát triển)" onClick={devToast}><FileSearchOutlined /></ToolBtn>
        <ToolBtn title="In lát cắt hiện tại" color="#38bdf8" onClick={onPrintImage || devToast}><PrinterOutlined /></ToolBtn>

        <ToolBtn title="Cài đặt (đang phát triển)" onClick={devToast}><SettingOutlined /></ToolBtn>
        <ToolBtn title="Trợ giúp phím tắt" color="#38bdf8" onClick={() => setHelpOpen(true)}><QuestionCircleOutlined /></ToolBtn>
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
    <Tooltip title={title} placement="bottom" mouseEnterDelay={0.35}>
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
