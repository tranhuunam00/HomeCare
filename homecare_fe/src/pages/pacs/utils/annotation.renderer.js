/**
 * Bộ vẽ chú thích đo đạc cho Viewer PACS.
 *
 * Canvas chú thích có kích thước = ma trận ảnh gốc (toạ độ đo đạc = toạ độ pixel DICOM).
 * `scale` = số pixel ảnh trên 1 pixel màn hình -> nét/chữ luôn cùng cỡ trên màn hình
 * dù ảnh CT 512px hay X-quang 3072px, zoom 50% hay 400%.
 */

const COLORS = {
  length: '#22c55e',
  angle: '#f59e0b',
  roi_ellipse: '#38bdf8',
  roi_rect: '#c084fc',
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
        drawLengthAnnotation(ctx, ann, s);
        break;
      case 'angle':
        drawAngleAnnotation(ctx, ann, s);
        break;
      case 'roi_ellipse':
        drawRoiEllipseAnnotation(ctx, ann, s);
        break;
      case 'roi_rect':
        drawRoiRectAnnotation(ctx, ann, s);
        break;
      default:
        break;
    }
  }
}
