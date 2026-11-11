import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateKeyImageSnapshot, broadcastKeyImage } from '../keyImage.utils';
import { PACS_CHANNELS } from '../../constants/pacs.constants';

describe('Key Image Snapshot & Broadcast Utilities', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('generateKeyImageSnapshot', () => {
    it('throws error when canvases are missing', () => {
      expect(() => generateKeyImageSnapshot({ imgCanvas: null, annCanvas: null })).toThrow();
    });

    it('generates composite snapshot with correct caption and dataUrl', () => {
      // Mock Canvas 2D context for jsdom environment
      const mockCtx = {
        drawImage: vi.fn(),
        save: vi.fn(),
        restore: vi.fn(),
        fillText: vi.fn(),
        fillStyle: '',
        font: '',
        shadowColor: '',
        shadowBlur: 0,
      };

      const originalCreateElement = document.createElement.bind(document);
      vi.spyOn(document, 'createElement').mockImplementation((tagName) => {
        if (tagName === 'canvas') {
          return {
            width: 0,
            height: 0,
            getContext: () => mockCtx,
            toDataURL: () => 'data:image/png;base64,mocked_snapshot_bytes',
          };
        }
        return originalCreateElement(tagName);
      });

      const mockImgCanvas = { width: 100, height: 100 };
      const mockAnnCanvas = { width: 100, height: 100 };

      const result = generateKeyImageSnapshot({
        imgCanvas: mockImgCanvas,
        annCanvas: mockAnnCanvas,
        metadata: { patientName: 'NGUYEN VAN A', patientId: '00123' },
        measurements: [{ valueText: '15.2 mm' }, { valueText: '30.1 mm²' }],
        currentIndex: 2,
        totalSlices: 10,
        windowCenter: 40,
        windowWidth: 400,
      });

      expect(result).toHaveProperty('dataUrl');
      expect(result.dataUrl).toContain('data:image/png;base64,mocked_snapshot_bytes');
      expect(result.captionText).toContain('lát cắt #3');
      expect(result.captionText).toContain('15.2 mm, 30.1 mm²');
      expect(result.measurementsSummary).toBe('15.2 mm, 30.1 mm²');
      expect(mockCtx.drawImage).toHaveBeenCalledTimes(2);
      expect(mockCtx.fillText).toHaveBeenCalledTimes(2);
    });
  });

  describe('broadcastKeyImage', () => {
    it('posts message to localStorage and does not throw', () => {
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');

      const payload = {
        patientDiagnoseId: 126,
        dataUrl: 'data:image/png;base64,abc',
        caption: 'Test Snapshot',
      };

      expect(() => broadcastKeyImage(payload)).not.toThrow();
      expect(setItemSpy).toHaveBeenCalledWith(
        PACS_CHANNELS.STORAGE_KEY,
        expect.stringContaining(PACS_CHANNELS.EVENT_KEY_IMAGE_CAPTURED)
      );
    });
  });
});
