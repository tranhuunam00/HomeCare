import { decodeInWorker } from './decodeWorkerPool';

/**
 * BỘ TẢI ẢNH PACS THEO MỨC ƯU TIÊN
 * ------------------------------------------------------------------
 * Luồng hiển thị cho bác sĩ:
 *   1. Lát đang xem: tải ảnh XEM TRƯỚC (Web JPG ~40KB) + ảnh GỐC (DCM) song song, gốc ưu tiên cao nhất.
 *   2. Ảnh gốc về -> thay thế xem trước. Chỉ ảnh gốc mới cho phép đo đạc / đọc HU / chỉnh WW-WL chính xác.
 *   3. Prefetch lan dần từ lát hiện tại ra 2 phía (khoảng cách gần trước), giới hạn số request song song.
 *
 * Khoá ảnh (key) = `${sopInstanceUid}#${frameIndex}` -> ổn định dù thứ tự sắp xếp thay đổi.
 */

const DEFAULT_FULL_CONCURRENCY = 4;
const DEFAULT_PREVIEW_CONCURRENCY = 6;
const PINNED_TTL = 3000; // ms
const MULTIFRAME_BUFFER_LIMIT = 400 * 1024 * 1024; // giữ buffer file multi-frame tối đa ~400MB

export function makeInstanceKey(inst) {
  return `${inst.sopInstanceUid}#${inst.frameIndex || 0}`;
}

class PriorityQueue {
  constructor(concurrency, worker) {
    this.concurrency = concurrency;
    this.worker = worker;
    this.pending = new Map(); // key -> { job, priority }
    this.running = new Set();
  }

  push(key, job, priority) {
    if (this.running.has(key)) return;
    const existing = this.pending.get(key);
    if (!existing || existing.priority > priority) this.pending.set(key, { job, priority });
    this.pump();
  }

  /**
   * Giữ lại các job còn cần, bỏ job xa không còn liên quan.
   * Job yêu cầu trực tiếp (ô lưới, MPR) được giữ thêm PINNED_TTL ms dù không thuộc series đang xem.
   */
  retain(keys) {
    const now = Date.now();
    for (const [k, v] of this.pending) {
      if (keys.has(k)) continue;
      if (v.job?.pinnedAt && now - v.job.pinnedAt < PINNED_TTL) continue;
      this.pending.delete(k);
    }
  }

  clear() {
    this.pending.clear();
  }

  pump() {
    while (this.running.size < this.concurrency && this.pending.size) {
      let bestKey = null;
      let best = null;
      for (const [k, v] of this.pending) {
        if (!best || v.priority < best.priority) {
          best = v;
          bestKey = k;
        }
      }
      this.pending.delete(bestKey);
      this.running.add(bestKey);
      Promise.resolve()
        .then(() => this.worker(bestKey, best.job))
        .catch(() => {})
        .finally(() => {
          this.running.delete(bestKey);
          this.pump();
        });
    }
  }
}

export function createPacsImageLoader({
  caseId,
  apiEndpoint,
  getAuthHeaders,
  onFullLoaded,
  onPreviewLoaded,
  onError,
  fullConcurrency = DEFAULT_FULL_CONCURRENCY,
  previewConcurrency = DEFAULT_PREVIEW_CONCURRENCY,
}) {
  const fileBuffers = new Map(); // sop -> Promise<ArrayBuffer> (chỉ giữ lâu cho multi-frame)
  const multiframeBytes = new Map(); // sop -> bytes
  const localBuffers = new Map(); // sop -> ArrayBuffer (chế độ đọc cục bộ)
  const doneFull = new Set();
  const donePreview = new Set();
  const failed = new Set();
  const retries = new Map(); // key -> số lần đã thử lại
  const MAX_RETRIES = 3;
  let disposed = false;

  // Lỗi tạm thời (mất mạng, 429, 5xx) -> thử lại với khoảng chờ tăng dần
  const isRetryable = (err) => !err?.status || err.status === 429 || err.status >= 500;

  const authHeaders = () => (getAuthHeaders ? getAuthHeaders() : {});
  // Gửi kèm ca bệnh để máy chủ lấy đúng file của ca (1 bộ DICOM có thể gắn vào nhiều ca)
  const caseQuery = caseId ? `?patientDiagnoseId=${encodeURIComponent(caseId)}` : '';

  async function fetchArrayBuffer(url) {
    const res = await fetch(url, { headers: authHeaders() });
    if (!res.ok) {
      const err = new Error(res.status === 401 ? 'Phiên đăng nhập hết hạn' : `HTTP ${res.status}`);
      err.status = res.status;
      throw err;
    }
    return res.arrayBuffer();
  }

  function getFileBuffer(inst) {
    const sop = inst.sopInstanceUid;
    if (localBuffers.has(sop)) return Promise.resolve(localBuffers.get(sop));
    if (fileBuffers.has(sop)) return fileBuffers.get(sop);
    const p = fetchArrayBuffer(`${apiEndpoint}/api/pacs/instances/${encodeURIComponent(sop)}/file${caseQuery}`);
    fileBuffers.set(sop, p);
    p.then((buf) => {
      if ((inst.numberOfFrames || 1) > 1) {
        multiframeBytes.set(sop, buf.byteLength);
        let total = 0;
        for (const v of multiframeBytes.values()) total += v;
        // Vượt hạn mức -> bỏ buffer multi-frame cũ nhất (trừ file hiện tại)
        for (const [k, v] of multiframeBytes) {
          if (total <= MULTIFRAME_BUFFER_LIMIT || k === sop) continue;
          fileBuffers.delete(k);
          multiframeBytes.delete(k);
          total -= v;
        }
      } else {
        // Ảnh 1 frame: giải mã xong là không cần giữ buffer nữa
        setTimeout(() => fileBuffers.delete(sop), 0);
      }
    }).catch(() => fileBuffers.delete(sop));
    return p;
  }

  async function loadNonDicom(inst) {
    const buf = localBuffers.get(inst.sopInstanceUid) || (await fetchArrayBuffer(`${apiEndpoint}/api/pacs/instances/${encodeURIComponent(inst.sopInstanceUid)}/file${caseQuery}`));
    const bitmap = await createImageBitmap(new Blob([buf]));
    return {
      meta: {
        modality: 'NDCM',
        seriesDescription: inst.seriesDescription || inst.fileName || 'Ảnh nội soi / siêu âm / vết mổ',
        sopInstanceUid: inst.sopInstanceUid,
        seriesInstanceUid: inst.seriesInstanceUid,
        rows: bitmap.height,
        columns: bitmap.width,
        windowCenter: 127.5,
        windowWidth: 256,
        isNonDicom: true,
        isColor: true,
        pixelSpacing: null,
        pixelSpacingSource: null,
        windowPresets: [],
      },
      rawPixels: bitmap,
      decodeInfo: { ok: true, transferSyntax: 'Ảnh thường (Non-DICOM)', lossy: true, codec: 'image' },
    };
  }

  const fullQueue = new PriorityQueue(fullConcurrency, async (key, { index, inst }) => {
    if (disposed || doneFull.has(key)) return;
    try {
      let decoded;
      if (inst.isNonDicom || inst.modality === 'NDCM') {
        decoded = await loadNonDicom(inst);
      } else {
        const buf = await getFileBuffer(inst);
        // Ảnh 1 frame tải từ máy chủ: buffer không dùng lại -> chuyển hẳn sang worker (không copy).
        // Multi-frame / file cục bộ: buffer còn dùng cho frame khác -> worker nhận bản sao.
        const canTransfer = (inst.numberOfFrames || 1) <= 1 && !localBuffers.has(inst.sopInstanceUid);
        if (canTransfer) fileBuffers.delete(inst.sopInstanceUid);
        decoded = await decodeInWorker(buf, inst.frameIndex || 0, { transfer: canTransfer });
      }
      if (disposed) return;
      doneFull.add(key);
      onFullLoaded?.(index, decoded, key);
    } catch (err) {
      const attempt = retries.get(key) || 0;
      if (!disposed && isRetryable(err) && attempt < MAX_RETRIES) {
        retries.set(key, attempt + 1);
        setTimeout(() => !disposed && !doneFull.has(key) && fullQueue.push(key, { index, inst }, 1000 + attempt), 600 * 2 ** attempt);
        return;
      }
      failed.add(key);
      onError?.(index, err, key);
    }
  });

  const previewQueue = new PriorityQueue(previewConcurrency, async (key, { index, inst }) => {
    if (disposed || donePreview.has(key) || doneFull.has(key)) return;
    if (inst.isLocal || inst.isNonDicom || (inst.frameIndex || 0) > 0) return; // preview chỉ có cho frame đầu
    if (inst.previewStatus && inst.previewStatus !== 'ok') return;
    try {
      const res = await fetch(`${apiEndpoint}/api/pacs/instances/${encodeURIComponent(inst.sopInstanceUid)}/web${caseQuery}`, { headers: authHeaders() });
      if (!res.ok) return;
      const bitmap = await createImageBitmap(await res.blob());
      if (disposed || doneFull.has(key)) {
        bitmap.close?.();
        return;
      }
      donePreview.add(key);
      onPreviewLoaded?.(index, bitmap, key);
    } catch {
      /* preview là tuỳ chọn */
    }
  });

  return {
    registerLocalBuffer(sop, buffer) {
      localBuffers.set(sop, buffer);
    },

    /**
     * Lên lịch tải theo lát đang xem.
     * @param {Array<{index, inst}>} ordered danh sách lát của series hiện tại, đã sắp theo khoảng cách tới lát đang xem
     * @param {number} previewRadius số lát lân cận được tải ảnh xem trước
     */
    focus(ordered, { previewRadius = 12 } = {}) {
      if (disposed) return;
      const fullKeys = new Set();
      const previewKeys = new Set();
      ordered.forEach(({ index, inst }, rank) => {
        const key = makeInstanceKey(inst);
        if (failed.has(key)) return;
        if (!doneFull.has(key)) {
          fullKeys.add(key);
          fullQueue.push(key, { index, inst }, rank);
        }
        if (rank <= previewRadius && !doneFull.has(key) && !donePreview.has(key)) {
          previewKeys.add(key);
          previewQueue.push(key, { index, inst }, rank);
        }
      });
      fullQueue.retain(fullKeys);
      previewQueue.retain(previewKeys);
    },

    /** Tải ngay 1 ảnh (MPR, lưới đa khung nhìn...) */
    request(index, inst, priority = 0) {
      const key = makeInstanceKey(inst);
      if (doneFull.has(key) || failed.has(key)) return;
      fullQueue.push(key, { index, inst, pinnedAt: Date.now() }, priority);
    },

    /** Cho phép tải lại (sau khi bị huỷ khỏi cache vì giới hạn bộ nhớ) */
    forget(key) {
      doneFull.delete(key);
      donePreview.delete(key);
    },

    retryFailed() {
      failed.clear();
      retries.clear();
    },

    isFailed(key) {
      return failed.has(key);
    },

    dispose() {
      disposed = true;
      fullQueue.clear();
      previewQueue.clear();
      fileBuffers.clear();
      localBuffers.clear();
    },
  };
}

/** Sắp danh sách lát theo khoảng cách tới vị trí hiện tại (xen kẽ 2 phía) */
export function orderByDistance(items, centerPos) {
  const out = [];
  if (!items.length) return out;
  const c = Math.max(0, Math.min(items.length - 1, centerPos));
  out.push(items[c]);
  for (let d = 1; out.length < items.length; d++) {
    if (c + d < items.length) out.push(items[c + d]);
    if (c - d >= 0) out.push(items[c - d]);
  }
  return out;
}

/**
 * Sắp xếp lát cắt theo GIẢI PHẪU trong từng series:
 *  - Có ImagePositionPatient + ImageOrientationPatient: chiếu lên pháp tuyến mặt cắt (chuẩn của PACS)
 *  - Không có: theo InstanceNumber
 * Series sắp theo SeriesNumber. Ảnh nhiều frame được tách thành từng frame.
 */
export function buildOrderedInstances(rawInstances) {
  const expanded = [];
  for (const inst of rawInstances || []) {
    const frames = Math.max(1, inst.numberOfFrames || 1);
    for (let f = 0; f < frames; f++) {
      expanded.push({ ...inst, frameIndex: f, frameCount: frames });
    }
  }

  const seriesMap = new Map();
  for (const inst of expanded) {
    const sUid = inst.seriesInstanceUid || 'default_series';
    if (!seriesMap.has(sUid)) seriesMap.set(sUid, []);
    seriesMap.get(sUid).push(inst);
  }

  const projection = (inst) => {
    const iop = inst.imageOrientationPatient;
    const ipp = inst.imagePositionPatient;
    if (!iop || iop.length !== 6 || !ipp || ipp.length !== 3) return null;
    const n = [
      iop[1] * iop[5] - iop[2] * iop[4],
      iop[2] * iop[3] - iop[0] * iop[5],
      iop[0] * iop[4] - iop[1] * iop[3],
    ];
    return ipp[0] * n[0] + ipp[1] * n[1] + ipp[2] * n[2];
  };

  const seriesEntries = Array.from(seriesMap.entries()).map(([uid, list]) => {
    const canUseGeometry = list.every((i) => i.frameCount === 1 && projection(i) !== null);
    const sorted = [...list].sort((a, b) => {
      if (canUseGeometry) {
        // Giảm dần theo vị trí: Axial -> từ đầu (Superior) xuống chân như thông lệ đọc phim
        const d = projection(b) - projection(a);
        if (Math.abs(d) > 1e-4) return d;
      }
      const dn = (a.instanceNumber || 0) - (b.instanceNumber || 0);
      if (dn) return dn;
      return (a.frameIndex || 0) - (b.frameIndex || 0);
    });
    const first = sorted[0] || {};
    return { uid, sorted, seriesNumber: first.seriesNumber ?? Number.MAX_SAFE_INTEGER, isNonDicom: !!first.isNonDicom };
  });

  seriesEntries.sort((a, b) => {
    if (a.isNonDicom !== b.isNonDicom) return a.isNonDicom ? 1 : -1;
    return a.seriesNumber - b.seriesNumber;
  });

  const ordered = [];
  for (const s of seriesEntries) ordered.push(...s.sorted);
  return ordered.map((inst) => ({ ...inst, key: makeInstanceKey(inst) }));
}

/**
 * Thứ tự cũ (trước nâng cấp): toàn bộ instance sắp theo InstanceNumber, không tách frame.
 * Dùng để chuyển số đo đã lưu theo vị trí (index) sang khoá ổn định.
 */
export function buildLegacyOrderKeys(rawInstances) {
  return [...(rawInstances || [])]
    .sort((a, b) => (a.instanceNumber || 0) - (b.instanceNumber || 0))
    .map((inst) => `${inst.sopInstanceUid}#0`);
}
