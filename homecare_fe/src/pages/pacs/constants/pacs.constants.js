/**
 * PACS & DICOM Viewer Constants & Presets
 */

export const WW_WL_PRESETS = [
  { key: 'default', label: 'Mặc định (DICOM)' },
  // CT Modality Presets
  { key: 'brain', label: '🧠 Não - Nhu mô (W: 80, L: 40)', ww: 80, wl: 40, modality: 'CT' },
  { key: 'stroke', label: '⚡ Đột quỵ / Nhồi máu (W: 35, L: 35)', ww: 35, wl: 35, modality: 'CT' },
  { key: 'subdural', label: '🩸 Máu tụ DMC / NMC (W: 130, L: 60)', ww: 130, wl: 60, modality: 'CT' },
  { key: 'bone', label: '🦴 Xương / Hộp sọ (W: 2000, L: 400)', ww: 2000, wl: 400, modality: 'CT' },
  { key: 'lung', label: '🫁 Phổi / Khí phế thũng (W: 1500, L: -600)', ww: 1500, wl: -600, modality: 'CT' },
  { key: 'mediastinum', label: '🫀 Trung thất / Mạch máu (W: 350, L: 40)', ww: 350, wl: 40, modality: 'CT' },
  { key: 'abdomen', label: '🩻 Bụng / Gan mật (W: 150, L: 30)', ww: 150, wl: 30, modality: 'CT' },
  { key: 'soft_tissue', label: '👤 Mô mềm tổng quát (W: 350, L: 50)', ww: 350, wl: 50, modality: 'CT' },
  { key: 'spine', label: '📏 Cột sống / Đĩa đệm (W: 250, L: 50)', ww: 250, wl: 50, modality: 'CT' },
  // X-Ray Modality Presets
  { key: 'xray_chest', label: '🫁 X-Quang Ngực thẳng (W: 4095, L: 2048)', ww: 4095, wl: 2048, modality: 'CR' },
  { key: 'xray_bone', label: '🦴 X-Quang Xương khớp (W: 3000, L: 1500)', ww: 3000, wl: 1500, modality: 'CR' },
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
