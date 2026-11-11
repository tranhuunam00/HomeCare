/**
 * Canvas Annotation Renderer for PACS DICOM Viewer
 * Renders anti-aliased measurements with clinical visibility and contrast.
 */

/**
 * Draws a distance measurement line with endpoint calipers and text badge.
 */
export function drawLengthAnnotation(ctx, ann) {
  const [p1, p2] = ann.points || [];
  if (!p1 || !p2) return;

  ctx.save();
  ctx.strokeStyle = '#22c55e'; // Bright green
  ctx.lineWidth = 2;

  // Main measurement line
  ctx.beginPath();
  ctx.moveTo(p1.x, p1.y);
  ctx.lineTo(p2.x, p2.y);
  ctx.stroke();

  // End points calipers
  ctx.fillStyle = '#22c55e';
  ctx.beginPath();
  ctx.arc(p1.x, p1.y, 4, 0, Math.PI * 2);
  ctx.arc(p2.x, p2.y, 4, 0, Math.PI * 2);
  ctx.fill();

  // Text badge with shadow
  if (ann.valueText) {
    const midX = (p1.x + p2.x) / 2;
    const midY = (p1.y + p2.y) / 2;
    ctx.font = 'bold 13px Inter, monospace, sans-serif';
    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 4;
    ctx.fillStyle = '#4ade80';
    ctx.fillText(ann.valueText, midX + 8, midY - 6);
  }
  ctx.restore();
}

/**
 * Draws an angle measurement with vertex and ray lines.
 */
export function drawAngleAnnotation(ctx, ann) {
  const [p1, p2, p3] = ann.points || [];
  if (!p1 || !p2) return;

  ctx.save();
  ctx.strokeStyle = '#f59e0b'; // Amber
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.moveTo(p1.x, p1.y);
  ctx.lineTo(p2.x, p2.y);
  if (p3) {
    ctx.lineTo(p3.x, p3.y);
  }
  ctx.stroke();

  // Vertex indicator
  ctx.fillStyle = '#f59e0b';
  ctx.beginPath();
  ctx.arc(p2.x, p2.y, 4, 0, Math.PI * 2);
  ctx.fill();

  if (ann.valueText) {
    ctx.font = 'bold 13px Inter, monospace, sans-serif';
    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 4;
    ctx.fillStyle = '#fbbf24';
    ctx.fillText(ann.valueText, p2.x + 8, p2.y - 8);
  }
  ctx.restore();
}

/**
 * Draws an elliptical ROI with area value.
 */
export function drawRoiEllipseAnnotation(ctx, ann) {
  const [p1, p2] = ann.points || [];
  if (!p1 || !p2) return;

  const centerX = (p1.x + p2.x) / 2;
  const centerY = (p1.y + p2.y) / 2;
  const radiusX = Math.abs(p2.x - p1.x) / 2;
  const radiusY = Math.abs(p2.y - p1.y) / 2;

  ctx.save();
  ctx.strokeStyle = '#38bdf8'; // Cyan
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
  ctx.stroke();

  if (ann.valueText) {
    ctx.font = 'bold 13px Inter, monospace, sans-serif';
    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 4;
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(ann.valueText, centerX, centerY - radiusY - 6);
  }
  ctx.restore();
}

/**
 * Draws a rectangular ROI with area value.
 */
export function drawRoiRectAnnotation(ctx, ann) {
  const [p1, p2] = ann.points || [];
  if (!p1 || !p2) return;

  const minX = Math.min(p1.x, p2.x);
  const minY = Math.min(p1.y, p2.y);
  const width = Math.abs(p2.x - p1.x);
  const height = Math.abs(p2.y - p1.y);

  ctx.save();
  ctx.strokeStyle = '#c084fc'; // Purple
  ctx.lineWidth = 2;

  ctx.strokeRect(minX, minY, width, height);

  if (ann.valueText) {
    ctx.font = 'bold 13px Inter, monospace, sans-serif';
    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 4;
    ctx.fillStyle = '#c084fc';
    ctx.fillText(ann.valueText, minX, minY - 6);
  }
  ctx.restore();
}

/**
 * Clears and redraws all annotations on a target canvas.
 * Ensures the annotation canvas pixel buffer strictly matches the underlying DICOM image dimensions.
 */
export function renderAnnotationsToCanvas(canvas, annotations = [], currentDrawing = null, dimensions = {}) {
  if (!canvas) return;

  // Support both DICOM tags (columns, rows) and standard dimensions (width, height)
  const targetWidth = dimensions.columns || dimensions.width || 512;
  const targetHeight = dimensions.rows || dimensions.height || 512;

  if (canvas.width !== targetWidth) {
    canvas.width = targetWidth;
  }
  if (canvas.height !== targetHeight) {
    canvas.height = targetHeight;
  }

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const list = currentDrawing ? [...annotations, currentDrawing] : annotations;

  for (const ann of list) {
    switch (ann.type) {
      case 'length':
        drawLengthAnnotation(ctx, ann);
        break;
      case 'angle':
        drawAngleAnnotation(ctx, ann);
        break;
      case 'roi_ellipse':
        drawRoiEllipseAnnotation(ctx, ann);
        break;
      case 'roi_rect':
        drawRoiRectAnnotation(ctx, ann);
        break;
      default:
        break;
    }
  }
}
