/**
 * PACS & DICOM Viewer Constants & Presets
 */

export const WW_WL_PRESETS = [
  { key: 'default', label: 'Mặc định (DICOM)' },
  { key: 'lung', label: 'Cửa sổ Phổi (W: 1500, L: -600)', ww: 1500, wl: -600 },
  { key: 'bone', label: 'Cửa sổ Xương (W: 2000, L: 400)', ww: 2000, wl: 400 },
  { key: 'soft_tissue', label: 'Mô mềm (W: 350, L: 50)', ww: 350, wl: 50 },
  { key: 'brain', label: 'Sọ não (W: 80, L: 40)', ww: 80, wl: 40 },
  { key: 'abdomen', label: 'Bụng / Gan (W: 400, L: 50)', ww: 400, wl: 50 },
];

export const COLOR_LUTS = [
  { value: 'default', label: 'Default' },
  { value: 'inverted', label: 'Inverted' },
  { value: 'rainbow', label: 'Rainbow' },
  { value: 'hot_iron', label: 'Hot Iron' },
];

export const VIEWER_LAYOUTS = [
  { key: '1x1', label: '1x1', cols: 1, rows: 1 },
  { key: '1x2', label: '1x2', cols: 2, rows: 1 },
  { key: '2x1', label: '2x1', cols: 1, rows: 2 },
  { key: '2x2', label: '2x2', cols: 2, rows: 2 },
];

export const PACS_TOOLS = {
  SELECT: 'select',
  LENGTH: 'length',
  ANGLE: 'angle',
  ROI_ELLIPSE: 'roi_ellipse',
  ROI_RECT: 'roi_rect',
  PAN: 'pan',
  ZOOM: 'zoom',
  WW_WL: 'ww_wl',
};

export const PACS_CHANNELS = {
  BROADCAST_CHANNEL: 'homecare_pacs_channel',
  STORAGE_KEY: 'homecare_pacs_latest_key_image',
  EVENT_KEY_IMAGE_CAPTURED: 'KEY_IMAGE_CAPTURED',
};
