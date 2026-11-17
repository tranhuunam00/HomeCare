/**
 * Bộ vẽ chú thích đo đạc cho Viewer PACS.
 *
 * Canvas chú thích có kích thước = ma trận ảnh gốc (toạ độ đo đạc = toạ độ pixel DICOM).
 * `scale` = số pixel ảnh trên 1 pixel màn hình -> nét/chữ luôn cùng cỡ trên màn hình
 * dù ảnh CT 512px hay X-quang 3072px, zoom 50% hay 400%.
 */

const COLORS = {
  length: '#22c55e',
  length_h: '#22c55e',
  length_v: '#22c55e',
  angle: '#f59e0b',
  angle_45: '#f59e0b',
  cobb: '#f97316',
  spine: '#f97316',
  roi_ellipse: '#38bdf8',
  roi_rect: '#c084fc',
  roi_rotated_rect: '#c084fc',
  roi_polygon: '#ec4899',
  roi_freehand: '#10b981',
  pen: '#facc15',
  arrow: '#38bdf8',
  text: '#e2e8f0',
  probe: '#06b6d4',
  bone: '#e879f9',
  arc: '#f59e0b',
};

function drawLabel(ctx, lines, x, y, color, scale) {
  if (!lines?.length) return;
  const fontPx = 12.5 * scale;
  const pad = 4 * scale;
  const lineH = fontPx * 1.3;
  ctx.save();
  ctx.font = `600 ${fontPx}px Inter, system-ui, sans-serif`;
  ctx.textBaseline = 'top';
  const w = Math.max(...lines.map((l) => ctx.measureText(l).width)) + pad * 2;
  const h = lines.length * lineH + pad * 2 - (lineH - fontPx);
  // Giữ nhãn trong khung ảnh
  const cx = Math.max(0, Math.min(ctx.canvas.width - w, x));
  const cy = Math.max(0, Math.min(ctx.canvas.height - h, y));
  ctx.fillStyle = 'rgba(2, 6, 23, 0.72)';
  ctx.strokeStyle = color;
  ctx.lineWidth = 1 * scale;
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(cx, cy, w, h, 3 * scale);
  else ctx.rect(cx, cy, w, h);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#f8fafc';
  lines.forEach((l, i) => {
    ctx.fillStyle = i === 0 ? color : '#e2e8f0';
    ctx.fillText(l, cx + pad, cy + pad + i * lineH);
  });
  ctx.restore();
}

function handle(ctx, p, color, scale) {
  ctx.beginPath();
  ctx.arc(p.x, p.y, 3.5 * scale, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.lineWidth = 1 * scale;
  ctx.strokeStyle = '#020617';
  ctx.stroke();
}

function strokeStyle(ctx, color, scale) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.6 * scale;
  ctx.shadowColor = 'rgba(0,0,0,0.85)';
  ctx.shadowBlur = 2 * scale;
}

function statsLines(ann) {
  const lines = [ann.valueText];
  const s = ann.stats;
  if (s) {
    const u = ann.statsUnit ? ` ${ann.statsUnit}` : '';
    lines.push(`Mean ${s.mean.toFixed(1)}${u}  SD ${s.sd.toFixed(1)}`);
    lines.push(`Min ${s.min.toFixed(0)}  Max ${s.max.toFixed(0)}${u}`);
  }
  return lines;
}

export function drawLengthAnnotation(ctx, ann, scale = 1) {
  const [p1, p2] = ann.points || [];
  if (!p1 || !p2) return;
  const color = COLORS.length;
  ctx.save();
  strokeStyle(ctx, color, scale);
  ctx.beginPath();
  ctx.moveTo(p1.x, p1.y);
  ctx.lineTo(p2.x, p2.y);
  ctx.stroke();
  ctx.shadowBlur = 0;
  handle(ctx, p1, color, scale);
  handle(ctx, p2, color, scale);
  ctx.restore();
  drawLabel(ctx, [ann.valueText], Math.max(p1.x, p2.x) + 8 * scale, (p1.y + p2.y) / 2 - 10 * scale, color, scale);
}

export function drawAngleAnnotation(ctx, ann, scale = 1) {
  const [p1, p2, p3] = ann.points || [];
  if (!p1 || !p2) return;
  const color = COLORS.angle;
  ctx.save();
  strokeStyle(ctx, color, scale);
  ctx.beginPath();
  ctx.moveTo(p1.x, p1.y);
  ctx.lineTo(p2.x, p2.y);
  if (p3) ctx.lineTo(p3.x, p3.y);
  ctx.stroke();
  ctx.shadowBlur = 0;
  [p1, p2, p3].filter(Boolean).forEach((p) => handle(ctx, p, color, scale));
  ctx.restore();
  if (ann.valueText) drawLabel(ctx, [ann.valueText], p2.x + 10 * scale, p2.y + 6 * scale, color, scale);
}

export function drawRoiEllipseAnnotation(ctx, ann, scale = 1) {
  const [p1, p2] = ann.points || [];
  if (!p1 || !p2) return;
  const color = COLORS.roi_ellipse;
  const cx = (p1.x + p2.x) / 2;
  const cy = (p1.y + p2.y) / 2;
  const rx = Math.abs(p2.x - p1.x) / 2;
  const ry = Math.abs(p2.y - p1.y) / 2;
  ctx.save();
  strokeStyle(ctx, color, scale);
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
  drawLabel(ctx, statsLines(ann), cx + rx + 8 * scale, cy - ry, color, scale);
}

export function drawRoiRectAnnotation(ctx, ann, scale = 1) {
  const [p1, p2] = ann.points || [];
  if (!p1 || !p2) return;
  const color = COLORS.roi_rect;
  const minX = Math.min(p1.x, p2.x);
  const minY = Math.min(p1.y, p2.y);
  const w = Math.abs(p2.x - p1.x);
  const h = Math.abs(p2.y - p1.y);
  ctx.save();
  strokeStyle(ctx, color, scale);
  ctx.strokeRect(minX, minY, w, h);
  ctx.restore();
  drawLabel(ctx, statsLines(ann), minX + w + 8 * scale, minY, color, scale);
}

export function drawArrowAnnotation(ctx, ann, scale = 1) {
  const [p1, p2] = ann.points || [];
  if (!p1 || !p2) return;
  const color = COLORS.arrow || '#38bdf8';
  ctx.save();
  strokeStyle(ctx, color, scale);
  ctx.beginPath();
  ctx.moveTo(p1.x, p1.y);
  ctx.lineTo(p2.x, p2.y);
  ctx.stroke();

  // Mũi tên ở p2
  const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
  const headLen = 10 * scale;
  ctx.beginPath();
  ctx.moveTo(p2.x, p2.y);
  ctx.lineTo(p2.x - headLen * Math.cos(angle - Math.PI / 6), p2.y - headLen * Math.sin(angle - Math.PI / 6));
  ctx.moveTo(p2.x, p2.y);
  ctx.lineTo(p2.x - headLen * Math.cos(angle + Math.PI / 6), p2.y - headLen * Math.sin(angle + Math.PI / 6));
  ctx.stroke();
  handle(ctx, p1, color, scale);
  ctx.restore();

  if (ann.valueText || ann.text) {
    drawLabel(ctx, [ann.valueText || ann.text], p1.x + 8 * scale, p1.y - 10 * scale, color, scale);
  }
}

export function drawTextAnnotation(ctx, ann, scale = 1) {
  const p = ann.points?.[0];
  if (!p) return;
  const color = COLORS.text || '#ffffff';
  handle(ctx, p, color, scale);
  drawLabel(ctx, [ann.text || ann.valueText || 'Ghi chú'], p.x + 8 * scale, p.y - 8 * scale, color, scale);
}

export function drawProbeAnnotation(ctx, ann, scale = 1) {
  const p = ann.points?.[0];
  if (!p) return;
  const color = COLORS.probe || '#06b6d4';
  const r = 8 * scale;
  ctx.save();
  strokeStyle(ctx, color, scale);
  // Vẽ dấu tâm (+)
  ctx.beginPath();
  ctx.moveTo(p.x - r, p.y);
  ctx.lineTo(p.x + r, p.y);
  ctx.moveTo(p.x, p.y - r);
  ctx.lineTo(p.x, p.y + r);
  ctx.stroke();
  handle(ctx, p, color, scale);
  ctx.restore();
  drawLabel(ctx, [ann.valueText || `(${Math.round(p.x)}, ${Math.round(p.y)})`], p.x + 10 * scale, p.y - 10 * scale, color, scale);
}

export function drawRoiPolygonAnnotation(ctx, ann, scale = 1) {
  const pts = ann.points || [];
  if (pts.length < 2) return;
  const color = COLORS.roi_polygon || '#ec4899';
  ctx.save();
  strokeStyle(ctx, color, scale);
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) {
    ctx.lineTo(pts[i].x, pts[i].y);
  }
  if (ann.closed) {
    ctx.closePath();
    ctx.fillStyle = 'rgba(236, 72, 153, 0.12)';
    ctx.fill();
  }
  ctx.stroke();
  pts.forEach((p) => handle(ctx, p, color, scale));
  ctx.restore();
  drawLabel(ctx, statsLines(ann), pts[0].x + 8 * scale, pts[0].y - 10 * scale, color, scale);
}

export function drawRoiFreehandAnnotation(ctx, ann, scale = 1) {
  const pts = ann.points || [];
  if (pts.length < 2) return;
  const color = COLORS.roi_freehand || '#10b981';
  ctx.save();
  strokeStyle(ctx, color, scale);
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) {
    ctx.lineTo(pts[i].x, pts[i].y);
  }
  if (ann.closed) {
    ctx.closePath();
    ctx.fillStyle = 'rgba(16, 185, 129, 0.12)';
    ctx.fill();
  }
  ctx.stroke();
  ctx.restore();
  drawLabel(ctx, statsLines(ann), pts[0].x + 8 * scale, pts[0].y - 10 * scale, color, scale);
}

export function drawPenAnnotation(ctx, ann, scale = 1) {
  const pts = ann.points || [];
  if (pts.length < 2) return;
  const color = COLORS.pen || '#facc15';
  ctx.save();
  strokeStyle(ctx, color, scale);
  ctx.lineWidth = 2.2 * scale;
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) {
    ctx.lineTo(pts[i].x, pts[i].y);
  }
  ctx.stroke();
  ctx.restore();
}

export function drawCobbAnnotation(ctx, ann, scale = 1) {
  const pts = ann.points || [];
  const color = COLORS.cobb || '#f97316';
  ctx.save();
  strokeStyle(ctx, color, scale);
  // Đường 1: pts[0] -> pts[1]
  if (pts[0] && pts[1]) {
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    ctx.lineTo(pts[1].x, pts[1].y);
    ctx.stroke();
    handle(ctx, pts[0], color, scale);
    handle(ctx, pts[1], color, scale);
  }
  // Đường 2: pts[2] -> pts[3]
  if (pts[2] && pts[3]) {
    ctx.beginPath();
    ctx.moveTo(pts[2].x, pts[2].y);
    ctx.lineTo(pts[3].x, pts[3].y);
    ctx.stroke();
    handle(ctx, pts[2], color, scale);
    handle(ctx, pts[3], color, scale);
  }
  ctx.restore();
  if (ann.valueText && pts[2]) {
    drawLabel(ctx, [ann.valueText], pts[2].x + 10 * scale, pts[2].y - 10 * scale, color, scale);
  }
}

export function drawBoneAnnotation(ctx, ann, scale = 1) {
  const [p1, p2] = ann.points || [];
  if (!p1 || !p2) return;
  const color = COLORS.bone || '#e879f9';
  ctx.save();
  strokeStyle(ctx, color, scale);
  ctx.beginPath();
  ctx.moveTo(p1.x, p1.y);
  ctx.lineTo(p2.x, p2.y);
  ctx.stroke();
  handle(ctx, p1, color, scale);
  handle(ctx, p2, color, scale);
  ctx.restore();
  drawLabel(ctx, [ann.valueText || 'Chỉ số khung chậu'], Math.max(p1.x, p2.x) + 8 * scale, (p1.y + p2.y) / 2 - 10 * scale, color, scale);
}

/**
 * Xoá và vẽ lại toàn bộ chú thích.
 * @param {number} scale pixel ảnh / pixel màn hình (mặc định 1)
 */
export function renderAnnotationsToCanvas(canvas, annotations = [], currentDrawing = null, dimensions = {}, scale = 1) {
  if (!canvas) return;
  const targetWidth = dimensions.columns || dimensions.width || 512;
  const targetHeight = dimensions.rows || dimensions.height || 512;
  if (canvas.width !== targetWidth) canvas.width = targetWidth;
  if (canvas.height !== targetHeight) canvas.height = targetHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const s = Number.isFinite(scale) && scale > 0 ? scale : 1;

  const list = currentDrawing ? [...annotations, currentDrawing] : annotations;
  for (const ann of list) {
    switch (ann.type) {
      case 'length':
      case 'length_h':
      case 'length_v':
        drawLengthAnnotation(ctx, ann, s);
        break;
      case 'angle':
      case 'angle_45':
      case 'arc':
        drawAngleAnnotation(ctx, ann, s);
        break;
      case 'cobb':
      case 'spine':
        drawCobbAnnotation(ctx, ann, s);
        break;
      case 'roi_ellipse':
        drawRoiEllipseAnnotation(ctx, ann, s);
        break;
      case 'roi_rect':
      case 'roi_rotated_rect':
        drawRoiRectAnnotation(ctx, ann, s);
        break;
      case 'roi_polygon':
        drawRoiPolygonAnnotation(ctx, ann, s);
        break;
      case 'roi_freehand':
        drawRoiFreehandAnnotation(ctx, ann, s);
        break;
      case 'pen':
        drawPenAnnotation(ctx, ann, s);
        break;
      case 'arrow':
        drawArrowAnnotation(ctx, ann, s);
        break;
      case 'text':
        drawTextAnnotation(ctx, ann, s);
        break;
      case 'probe':
        drawProbeAnnotation(ctx, ann, s);
        break;
      case 'bone':
        drawBoneAnnotation(ctx, ann, s);
        break;
      default:
        break;
    }
  }
}
