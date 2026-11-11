import { describe, it, expect } from 'vitest';

/**
 * Coordinate mapping algorithm verification
 */
function mapViewportToCanvas(e, canvas, transform = {}) {
  const { zoom = 1, rotation = 0, flipH = false, flipV = false } = transform;
  const rect = canvas.getBoundingClientRect();
  const W = canvas.width;
  const H = canvas.height;

  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  const dx = e.clientX - centerX;
  const dy = e.clientY - centerY;

  // 1. Inverse Rotation
  const rad = (-rotation * Math.PI) / 180;
  const cosA = Math.cos(rad);
  const sinA = Math.sin(rad);
  let unrotX = dx * cosA - dy * sinA;
  let unrotY = dx * sinA + dy * cosA;

  // 2. Inverse Flip
  if (flipH) unrotX = -unrotX;
  if (flipV) unrotY = -unrotY;

  // 3. Inverse Zoom and Screen Scale
  const displayW = rect.width / zoom;
  const displayH = rect.height / zoom;

  const isRotated90or270 = Math.abs(rotation % 180) === 90;
  const effDisplayW = isRotated90or270 ? displayH : displayW;
  const effDisplayH = isRotated90or270 ? displayW : displayH;

  const scaleFactorX = W / (effDisplayW * zoom);
  const scaleFactorY = H / (effDisplayH * zoom);

  const canvasX = Math.round(W / 2 + unrotX * scaleFactorX);
  const canvasY = Math.round(H / 2 + unrotY * scaleFactorY);

  return {
    x: Math.max(0, Math.min(W, canvasX)),
    y: Math.max(0, Math.min(H, canvasY)),
  };
}

describe('Coordinate Mapping Unit Tests', () => {
  const mockCanvas = {
    width: 512,
    height: 512,
    getBoundingClientRect: () => ({
      left: 100,
      top: 100,
      width: 512,
      height: 512,
    }),
  };

  it('should accurately map mouse click at exact center (256, 256)', () => {
    const coords = mapViewportToCanvas(
      { clientX: 100 + 256, clientY: 100 + 256 },
      mockCanvas,
      { zoom: 1, rotation: 0, flipH: false, flipV: false }
    );
    expect(coords.x).toBe(256);
    expect(coords.y).toBe(256);
  });

  it('should accurately map top-left corner (0, 0)', () => {
    const coords = mapViewportToCanvas(
      { clientX: 100, clientY: 100 },
      mockCanvas,
      { zoom: 1, rotation: 0, flipH: false, flipV: false }
    );
    expect(coords.x).toBe(0);
    expect(coords.y).toBe(0);
  });

  it('should accurately map bottom-right corner (512, 512)', () => {
    const coords = mapViewportToCanvas(
      { clientX: 100 + 512, clientY: 100 + 512 },
      mockCanvas,
      { zoom: 1, rotation: 0, flipH: false, flipV: false }
    );
    expect(coords.x).toBe(512);
    expect(coords.y).toBe(512);
  });

  it('should handle Zoom = 2.0 without cursor drift', () => {
    const zoomedCanvas = {
      width: 512,
      height: 512,
      getBoundingClientRect: () => ({
        left: 0,
        top: 0,
        width: 1024,
        height: 1024,
      }),
    };
    // Click at center
    const center = mapViewportToCanvas(
      { clientX: 512, clientY: 512 },
      zoomedCanvas,
      { zoom: 2, rotation: 0, flipH: false, flipV: false }
    );
    expect(center.x).toBe(256);
    expect(center.y).toBe(256);

    // Click at top-left
    const topLeft = mapViewportToCanvas(
      { clientX: 0, clientY: 0 },
      zoomedCanvas,
      { zoom: 2, rotation: 0, flipH: false, flipV: false }
    );
    expect(topLeft.x).toBe(0);
    expect(topLeft.y).toBe(0);
  });

  it('should handle Horizontal Flip (Flip H) correctly', () => {
    const coords = mapViewportToCanvas(
      { clientX: 100, clientY: 100 + 256 }, // clicked on visual left
      mockCanvas,
      { zoom: 1, rotation: 0, flipH: true, flipV: false }
    );
    // When flipped horizontally, visual left is canvas pixel 512
    expect(coords.x).toBe(512);
    expect(coords.y).toBe(256);
  });
});
