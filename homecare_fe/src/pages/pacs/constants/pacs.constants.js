/**
 * PACS & DICOM Viewer Constants & Presets
 */

/**
 * Preset cửa sổ CT chuẩn lâm sàng (đơn vị HU). Phím tắt 1-9 trên viewer.
 * Ảnh không phải CT dùng cửa sổ trong DICOM / cửa sổ tự động (không áp preset HU).
 */
export const WW_WL_PRESETS = [
  { key: 'default', label: 'Mặc định (theo DICOM)' },
  { key: 'brain', label: 'Não', ww: 80, wl: 40, modality: 'CT', hotkey: '1' },
  { key: 'subdural', label: 'Máu tụ dưới màng cứng', ww: 215, wl: 75, modality: 'CT', hotkey: '2' },
  { key: 'stroke', label: 'Đột quỵ (nhồi máu sớm)', ww: 40, wl: 40, modality: 'CT', hotkey: '3' },
  { key: 'lung', label: 'Phổi', ww: 1500, wl: -600, modality: 'CT', hotkey: '4' },
  { key: 'mediastinum', label: 'Trung thất', ww: 350, wl: 50, modality: 'CT', hotkey: '5' },
  { key: 'abdomen', label: 'Bụng / mô mềm', ww: 400, wl: 50, modality: 'CT', hotkey: '6' },
  { key: 'liver', label: 'Gan', ww: 150, wl: 30, modality: 'CT', hotkey: '7' },
  { key: 'bone', label: 'Xương', ww: 1800, wl: 400, modality: 'CT', hotkey: '8' },
  { key: 'spine', label: 'Cột sống (mô mềm)', ww: 250, wl: 50, modality: 'CT', hotkey: '9' },
  { key: 'temporal', label: 'Xương thái dương', ww: 2800, wl: 600, modality: 'CT' },
];

export const COLOR_LUTS = [
  { value: 'default', label: 'Default' },
  { value: 'inverted', label: 'Inverted' },
  { value: 'rainbow', label: 'Rainbow' },
  { value: 'hot_iron', label: 'Hot Iron' },
];

/**
 * Bố cục khung nhìn. key "RxC" = R hàng x C cột (giữ quy ước cũ: 1x2 = 2 ô cạnh nhau).
 * `areas` (tuỳ chọn) dùng grid-template-areas cho bố cục không đều (1 ô lớn + ô nhỏ).
 */
export const VIEWER_LAYOUTS = [
  { key: '1x1', label: '1x1', cols: 1, rows: 1 },
  { key: '1x2', label: '1x2', cols: 2, rows: 1 },
  { key: '2x1', label: '2x1', cols: 1, rows: 2 },
  { key: '2x2', label: '2x2', cols: 2, rows: 2 },
  { key: '1x3', label: '1x3', cols: 3, rows: 1 },
  { key: '2x3', label: '2x3', cols: 3, rows: 2 },
  { key: '3x3', label: '3x3', cols: 3, rows: 3 },
  { key: '1+2', label: '1+2', cols: 2, rows: 2, areas: ['a b', 'a c'], title: '1 ô lớn bên trái + 2 ô bên phải' },
  { key: '1+3', label: '1+3', cols: 3, rows: 3, areas: ['a a b', 'a a c', 'a a d'], title: '1 ô lớn + 3 ô nhỏ bên phải' },
  { key: '2+1', label: '2+1', cols: 2, rows: 2, areas: ['a b', 'c c'], title: '2 ô trên + 1 ô rộng bên dưới' },
];

export const MAX_VIEWPORTS = 9;

/** Số ô của 1 bố cục */
export function getLayoutCellCount(layout) {
  if (!layout) return 1;
  if (layout.areas) return new Set(layout.areas.join(' ').split(/\s+/)).size;
  return layout.cols * layout.rows;
}

export const findLayout = (key) => VIEWER_LAYOUTS.find((l) => l.key === key) || VIEWER_LAYOUTS[0];

export const PACS_TOOLS = {
  SELECT: 'select',
  LENGTH: 'length',
  LENGTH_H: 'length_h',
  LENGTH_V: 'length_v',
  ANGLE: 'angle',
  ANGLE_45: 'angle_45',
  COBB: 'cobb',
  SPINE: 'spine',
  ROI_ELLIPSE: 'roi_ellipse',
  ROI_RECT: 'roi_rect',
  ROI_ROTATED_RECT: 'roi_rotated_rect',
  ROI_POLYGON: 'roi_polygon',
  ROI_FREEHAND: 'roi_freehand',
  PEN: 'pen',
  ARROW: 'arrow',
  TEXT: 'text',
  PROBE: 'probe',
  BONE: 'bone',
  ARC: 'arc',
  PAN: 'pan',
  ZOOM: 'zoom',
  WW_WL: 'ww_wl',
  MAGNIFY: 'magnify',
};

export const PACS_CHANNELS = {
  BROADCAST_CHANNEL: 'homecare_pacs_channel',
  STORAGE_KEY: 'homecare_pacs_latest_key_image',
  EVENT_KEY_IMAGE_CAPTURED: 'KEY_IMAGE_CAPTURED',
};
