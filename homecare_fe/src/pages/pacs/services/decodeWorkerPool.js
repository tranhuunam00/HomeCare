import { decodeDicom } from './dicomImageCore';

/**
 * Nhóm Web Worker giải mã DICOM (dùng chung toàn trang).
 * - Số worker = số nhân CPU - 1 (tối đa 4) -> giải nén song song thật, không chiếm luồng giao diện.
 * - Không tạo được worker (trình duyệt cũ / môi trường test) -> giải mã trên luồng chính như trước.
 */
const MAX_WORKERS = 4;
let pool = null;
let unsupported = false;
let seq = 0;

function createPool() {
  if (unsupported || typeof Worker === 'undefined') {
    unsupported = true;
    return null;
  }
  const size = Math.max(1, Math.min(MAX_WORKERS, (navigator.hardwareConcurrency || 4) - 1));
  try {
    const workers = Array.from({ length: size }, () => {
      const w = new Worker(new URL('./workers/dicomDecode.worker.js', import.meta.url), { type: 'module' });
      const entry = { worker: w, busy: 0, jobs: new Map() };
      w.onmessage = (e) => {
        const { id, ok, decoded, error } = e.data || {};
        const job = entry.jobs.get(id);
        if (!job) return;
        entry.jobs.delete(id);
        entry.busy--;
        if (ok) job.resolve(decoded);
        else job.reject(new Error(error || 'Lỗi giải mã DICOM'));
      };
      w.onerror = (err) => {
        // Worker hỏng (không nạp được module...) -> trả lỗi cho các job đang chờ, chuyển sang luồng chính
        for (const job of entry.jobs.values()) job.fallback();
        entry.jobs.clear();
        entry.busy = 0;
        entry.dead = true;
        err?.preventDefault?.();
      };
      return entry;
    });
    return workers;
  } catch {
    unsupported = true;
    return null;
  }
}

/**
 * Giải mã 1 frame.
 * @param {ArrayBuffer} buffer
 * @param {number} frameIndex
 * @param {{ transfer?: boolean }} opts transfer=true: chuyển quyền sở hữu buffer sang worker (buffer gốc bị tách rời,
 *   chỉ dùng khi không cần buffer nữa - ảnh 1 frame). false: worker nhận bản sao.
 */
export function decodeInWorker(buffer, frameIndex = 0, { transfer = false } = {}) {
  if (!pool) pool = createPool();
  const alive = pool?.filter((p) => !p.dead) || [];
  if (!alive.length) return decodeDicom(buffer, frameIndex);
  const entry = alive.reduce((a, b) => (b.busy < a.busy ? b : a));
  const id = ++seq;
  // Giữ bản sao để còn giải mã trên luồng chính nếu worker chết giữa chừng (chỉ khi transfer)
  return new Promise((resolve, reject) => {
    let fallbackBuffer = null;
    if (transfer) {
      try {
        entry.worker.postMessage({ id, buffer, frameIndex }, [buffer]);
      } catch {
        resolve(decodeDicom(buffer, frameIndex));
        return;
      }
    } else {
      entry.worker.postMessage({ id, buffer, frameIndex });
      fallbackBuffer = buffer;
    }
    entry.busy++;
    entry.jobs.set(id, {
      resolve,
      reject,
      fallback: () => {
        if (fallbackBuffer) resolve(decodeDicom(fallbackBuffer, frameIndex));
        else reject(new Error('Worker giải mã bị lỗi'));
      },
    });
  });
}
