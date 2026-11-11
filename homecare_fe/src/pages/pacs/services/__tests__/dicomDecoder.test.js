import { describe, it, expect } from 'vitest';
import { parseDicomBuffer, renderDicomToCanvas } from '../dicomDecoder';

describe('dicomDecoder (Frontend PACS)', () => {
  it('should handle empty buffer gracefully and return empty rawPixels', () => {
    // Construct a minimal dummy DICOM preamble: 128 bytes zero + "DICM"
    const buffer = new ArrayBuffer(132);
    const view = new DataView(buffer);
    // Write 'D' 'I' 'C' 'M' at byte 128
    view.setUint8(128, 0x44);
    view.setUint8(129, 0x49);
    view.setUint8(130, 0x43);
    view.setUint8(131, 0x4d);

    const parsed = parseDicomBuffer(buffer);
    expect(parsed).toBeDefined();
    expect(parsed.meta).toBeDefined();
    expect(parsed.meta.rows).toBe(512);
    expect(parsed.meta.columns).toBe(512);
    expect(parsed.rawPixels).toBeNull();
  });

  it('renderDicomToCanvas should handle empty pixels without throwing', () => {
    // Create mock canvas
    const canvas = {
      width: 0,
      height: 0,
      getContext: () => ({
        createImageData: (w, h) => ({ data: new Uint8ClampedArray(w * h * 4) }),
        putImageData: () => {},
        fillRect: () => {},
      }),
    };

    expect(() => {
      renderDicomToCanvas(canvas, null, {
        rows: 256,
        columns: 256,
        windowCenter: 40,
        windowWidth: 400,
        rescaleSlope: 1,
        rescaleIntercept: 0,
        photometricInterpretation: 'MONOCHROME2',
      });
    }).not.toThrow();
  });
});

