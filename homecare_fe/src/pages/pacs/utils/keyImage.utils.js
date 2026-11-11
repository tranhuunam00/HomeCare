import { PACS_CHANNELS } from '../constants/pacs.constants';

/**
 * Creates a composite clinical snapshot combining DICOM pixels, annotations, and clinical watermark HUD.
 * @param {Object} params
 * @returns {{ dataUrl: string, captionText: string, measurementsSummary: string }}
 */
export function generateKeyImageSnapshot({
  imgCanvas,
  annCanvas,
  metadata = {},
  measurements = [],
  currentIndex = 0,
  totalSlices = 1,
  windowCenter = 128,
  windowWidth = 255,
}) {
  if (!imgCanvas || !annCanvas) {
    throw new Error('Canvas không sẵn sàng để chụp ảnh');
  }

  const compositeCanvas = document.createElement('canvas');
  compositeCanvas.width = imgCanvas.width;
  compositeCanvas.height = imgCanvas.height;
  const ctx = compositeCanvas.getContext('2d');

  // 1. Draw base DICOM pixel image
  ctx.drawImage(imgCanvas, 0, 0);

  // 2. Draw annotations & measurements
  ctx.drawImage(annCanvas, 0, 0);

  // 3. Draw Clinical HUD Watermarks
  ctx.save();
  ctx.fillStyle = '#22c55e';
  ctx.font = 'bold 15px monospace, sans-serif';
  ctx.shadowColor = '#000000';
  ctx.shadowBlur = 4;

  const patientName = metadata.patientName || 'Bệnh nhân';
  const patientId = metadata.patientId || '';
  const topText = `${patientName} | PID: ${patientId}`;
  ctx.fillText(topText, 16, 28);

  const bottomText = `Lát cắt #${currentIndex + 1}/${totalSlices} | WW: ${Math.round(windowWidth)} WL: ${Math.round(windowCenter)}`;
  ctx.font = '13px monospace, sans-serif';
  ctx.fillText(bottomText, 16, 50);
  ctx.restore();

  const dataUrl = compositeCanvas.toDataURL('image/png');

  // 4. Build summary caption
  const measurementsSummary = (measurements || [])
    .map((m) => m.valueText)
    .filter(Boolean)
    .join(', ');

  const captionText = `Ảnh PACS lát cắt #${currentIndex + 1}${
    measurementsSummary ? ` (Kích thước: ${measurementsSummary})` : ''
  }`;

  return { dataUrl, captionText, measurementsSummary };
}

/**
 * Broadcasts key image snapshot across tabs/windows using triple redundancy:
 * 1) BroadcastChannel
 * 2) window.opener.postMessage
 * 3) window.localStorage event
 * @param {Object} payload
 */
export function broadcastKeyImage(payload) {
  const fullPayload = {
    ...payload,
    type: PACS_CHANNELS.EVENT_KEY_IMAGE_CAPTURED,
    timestamp: Date.now(),
  };

  // 1. BroadcastChannel
  try {
    const bc = new BroadcastChannel(PACS_CHANNELS.BROADCAST_CHANNEL);
    bc.postMessage(fullPayload);
    bc.close();
  } catch (err) {
    console.warn('BroadcastChannel error:', err);
  }

  // 2. Window Opener postMessage
  if (typeof window !== 'undefined' && window.opener) {
    try {
      window.opener.postMessage(fullPayload, '*');
    } catch (err) {
      console.warn('postMessage error:', err);
    }
  }

  // 3. localStorage cross-tab event
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(PACS_CHANNELS.STORAGE_KEY, JSON.stringify(fullPayload));
    } catch (err) {
      console.warn('localStorage error:', err);
    }
  }
}
