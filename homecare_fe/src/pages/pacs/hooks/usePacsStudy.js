import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import axios from 'axios';
import { message } from 'antd';
import { decodeDicom } from '../services/dicomImageCore';
import {
  createPacsImageLoader,
  buildOrderedInstances,
  buildLegacyOrderKeys,
  orderByDistance,
  makeInstanceKey,
} from '../services/pacsImageLoader';
import { calculateAge } from '../../formver3/formver3.constant';

// Ngân sách bộ nhớ cho ảnh gốc đã giải mã (TypedArray). CT 735 lát ~ 385MB; X-quang 15MB/ảnh.
const DECODED_CACHE_BUDGET = 1200 * 1024 * 1024;

const pixelBytes = (decoded) => {
  const px = decoded?.rawPixels;
  if (!px) return 0;
  if (typeof px.byteLength === 'number') return px.byteLength;
  return (decoded.meta?.rows || 0) * (decoded.meta?.columns || 0) * 4;
};

/**
 * Quản lý dữ liệu ca chụp PACS cho viewer:
 *  - Danh sách lát đã sắp xếp theo giải phẫu (tách frame, khoá ổn định SOP#frame)
 *  - Bộ tải ưu tiên: ảnh xem trước (JPG) -> ảnh gốc (DCM 16-bit)
 *  - Cửa sổ WW/WL theo TỪNG SERIES (phổi / trung thất / xương không lẫn nhau)
 */
export function usePacsStudy(patientDiagnoseId, apiEndpoint) {
  const [loading, setLoading] = useState(true);
  const [study, setStudy] = useState(null);
  const [patientDiagnose, setPatientDiagnose] = useState(null);
  const [instances, setInstances] = useState([]);
  const [legacyOrderKeys, setLegacyOrderKeys] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [authError, setAuthError] = useState(false);

  // Ảnh gốc đã giải mã: index -> { meta, rawPixels, decodeInfo }
  const [dicomCache, setDicomCache] = useState({});
  // Ảnh xem trước 8-bit: index -> ImageBitmap
  const [previewCache, setPreviewCache] = useState({});
  // Lỗi tải/giải mã: index -> message
  const [loadErrors, setLoadErrors] = useState({});

  // WW/WL theo series: seriesUid -> { center, width, source }
  const [voiBySeries, setVoiBySeries] = useState({});

  const [uploadState, setUploadState] = useState({
    status: 'idle', // 'idle' | 'uploading' | 'success' | 'error'
    fileName: '',
    fileSize: 0,
    progress: 0,
    message: '',
    details: '',
  });

  const resetUploadState = useCallback(() => {
    setUploadState({ status: 'idle', fileName: '', fileSize: 0, progress: 0, message: '', details: '' });
  }, []);

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('TOKEN');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  /* ---------------- Gom cập nhật cache theo khung hình (tránh render dồn dập) ---------------- */
  const pendingFullRef = useRef({});
  const pendingPreviewRef = useRef({});
  const flushTimerRef = useRef(null);
  const cacheBytesRef = useRef(new Map()); // index -> bytes
  const currentIndexRef = useRef(0);
  const instancesRef = useRef([]);
  currentIndexRef.current = currentIndex;
  instancesRef.current = instances;

  const loaderRef = useRef(null);

  const evictIfNeeded = useCallback((cacheDraft) => {
    let total = 0;
    for (const v of cacheBytesRef.current.values()) total += v;
    if (total <= DECODED_CACHE_BUDGET) return cacheDraft;
    const cur = currentIndexRef.current;
    const curSeries = instancesRef.current[cur]?.seriesInstanceUid;
    // Ưu tiên bỏ ảnh khác series, sau đó ảnh xa lát hiện tại nhất
    const candidates = Object.keys(cacheDraft)
      .map(Number)
      .filter((i) => Math.abs(i - cur) > 8)
      .sort((a, b) => {
        const sa = instancesRef.current[a]?.seriesInstanceUid === curSeries ? 1 : 0;
        const sb = instancesRef.current[b]?.seriesInstanceUid === curSeries ? 1 : 0;
        if (sa !== sb) return sa - sb;
        return Math.abs(b - cur) - Math.abs(a - cur);
      });
    const next = { ...cacheDraft };
    for (const idx of candidates) {
      if (total <= DECODED_CACHE_BUDGET * 0.85) break;
      total -= cacheBytesRef.current.get(idx) || 0;
      cacheBytesRef.current.delete(idx);
      const inst = instancesRef.current[idx];
      if (inst) loaderRef.current?.forget(makeInstanceKey(inst));
      delete next[idx];
    }
    return next;
  }, []);

  /**
   * Gộp ảnh tải xong rồi mới cập nhật state: mỗi lần cập nhật = render lại cả trang.
   * Ảnh ĐANG HIỂN THỊ (ưu tiên 0 / lát hiện tại) -> cập nhật ngay (~1 khung hình);
   * ảnh tải trước (prefetch) -> gộp 250 ms/lần. Trước đây 16 ms/lần => ~60 lần render/giây khi tải trước, gây giật.
   */
  const urgentRef = useRef(new Set());
  const flushDueRef = useRef(0);
  const scheduleFlush = useCallback((urgent = false) => {
    const delay = urgent ? 16 : 250;
    const due = Date.now() + delay;
    if (flushTimerRef.current) {
      if (due >= flushDueRef.current) return;
      clearTimeout(flushTimerRef.current);
    }
    flushDueRef.current = due;
    flushTimerRef.current = setTimeout(() => {
      flushTimerRef.current = null;
      const full = pendingFullRef.current;
      const prev = pendingPreviewRef.current;
      pendingFullRef.current = {};
      pendingPreviewRef.current = {};
      if (Object.keys(full).length) {
        setDicomCache((c) => evictIfNeeded({ ...c, ...full }));
        // Ảnh gốc đã có -> giải phóng ảnh xem trước tương ứng
        setPreviewCache((p) => {
          let changed = false;
          const next = { ...p };
          for (const idx of Object.keys(full)) {
            if (next[idx]) {
              next[idx].close?.();
              delete next[idx];
              changed = true;
            }
          }
          return changed ? next : p;
        });
      }
      if (Object.keys(prev).length) setPreviewCache((p) => ({ ...p, ...prev }));
    }, delay);
  }, [evictIfNeeded]);

  /* ---------------- Bộ tải ảnh ---------------- */
  useEffect(() => {
    const loader = createPacsImageLoader({
      caseId: patientDiagnoseId,
      apiEndpoint,
      getAuthHeaders,
      onFullLoaded: (index, decoded) => {
        cacheBytesRef.current.set(index, pixelBytes(decoded));
        pendingFullRef.current[index] = decoded;
        if (!decoded?.decodeInfo?.ok) {
          setLoadErrors((e) => ({ ...e, [index]: decoded?.decodeInfo?.reason || 'Không giải mã được ảnh' }));
        }
        scheduleFlush(urgentRef.current.delete(index) || index === currentIndexRef.current);
      },
      onPreviewLoaded: (index, bitmap) => {
        pendingPreviewRef.current[index] = bitmap;
        scheduleFlush(urgentRef.current.has(index) || index === currentIndexRef.current);
      },
      onError: (index, err) => {
        if (err?.status === 401) setAuthError(true);
        setLoadErrors((e) => ({ ...e, [index]: err?.message || 'Lỗi tải ảnh' }));
      },
    });
    loaderRef.current = loader;
    return () => {
      loader.dispose();
      if (loaderRef.current === loader) loaderRef.current = null;
    };
  }, [apiEndpoint, patientDiagnoseId, getAuthHeaders, scheduleFlush]);

  /* ---------------- Tải thông tin ca chụp ---------------- */
  const loadStudy = useCallback(async () => {
    if (!patientDiagnoseId) {
      setPatientDiagnose(null);
      setStudy(
        (prev) =>
          prev || {
            patientName: '',
            patientId: '',
            modality: '',
            studyDate: '',
            attachedFiles: [],
            dbPatient: null,
          }
      );
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const headers = getAuthHeaders();
      const [studyResult, pdResult] = await Promise.allSettled([
        axios.get(`${apiEndpoint}/api/pacs/studies/${patientDiagnoseId}`, { headers }),
        axios.get(`${apiEndpoint}/api/patient-diagnose/${patientDiagnoseId}`, { headers }),
      ]);

      const isUnauthorized = [studyResult, pdResult].some(
        (r) => r.status === 'rejected' && r.reason?.response?.status === 401
      );
      if (isUnauthorized) {
        setAuthError(true);
        message.error('Phiên đăng nhập đã hết hạn hoặc chưa đăng nhập. Vui lòng đăng nhập lại để xem ảnh DICOM.');
      }

      let pdData = null;
      if (pdResult.status === 'fulfilled') {
        const rawPd = pdResult.value?.data?.data;
        pdData = rawPd?.data ? rawPd.data : rawPd || null;
        setPatientDiagnose(pdData);
      }

      const computedAge =
        pdData && (pdData.dob || pdData.birth_year) ? calculateAge(pdData.dob, pdData.birth_year) : null;
      const formattedCreatedAt = pdData?.createdAt
        ? new Date(pdData.createdAt).toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          })
        : '';

      const dbPatient = pdData
        ? {
            patientName: pdData.name || '',
            patientId: pdData.PID || '',
            patientAge:
              computedAge !== null && computedAge !== undefined && computedAge !== '' ? `${computedAge} tuổi` : '',
            patientBirthYear: pdData.birth_year || '',
            patientGender: pdData.gender || '',
            patientSid: pdData.SID || '',
            studyDate: formattedCreatedAt || '',
          }
        : null;

      if (studyResult.status === 'fulfilled' && studyResult.value?.data?.success && studyResult.value?.data?.data) {
        const raw = studyResult.value.data.data;
        const studyData = raw.data ? raw.data : raw;
        setStudy({ ...studyData, dbPatient });

        // Reset cache khi tải lại ca
        cacheBytesRef.current.clear();
        loaderRef.current?.retryFailed();
        setDicomCache({});
        setPreviewCache({});
        setLoadErrors({});
        setLegacyOrderKeys(buildLegacyOrderKeys(studyData.instances));
        setInstances(buildOrderedInstances(studyData.instances));
        setCurrentIndex(0);
      } else if (dbPatient) {
        setStudy({ patientName: '', patientId: '', modality: '', studyDate: '', attachedFiles: [], dbPatient });
      }
    } catch (err) {
      console.warn('Chưa có dữ liệu study cho ca này:', err);
    } finally {
      setLoading(false);
    }
  }, [patientDiagnoseId, apiEndpoint, getAuthHeaders]);

  useEffect(() => {
    loadStudy();
  }, [loadStudy]);

  /* ---------------- Lên lịch tải theo lát đang xem ---------------- */
  const currentSeriesUid = instances[currentIndex]?.seriesInstanceUid || null;
  const seriesIndexList = useMemo(() => {
    if (!instances.length) return [];
    return instances
      .map((inst, index) => ({ index, inst }))
      .filter((x) => x.inst.seriesInstanceUid === currentSeriesUid);
  }, [instances, currentSeriesUid]);

  useEffect(() => {
    const loader = loaderRef.current;
    if (!loader || !seriesIndexList.length) return;
    const pos = Math.max(0, seriesIndexList.findIndex((x) => x.index === currentIndex));
    // Debounce nhẹ khi cuộn nhanh để không xếp hàng hàng trăm request lỗi thời
    const t = setTimeout(() => loader.focus(orderByDistance(seriesIndexList, pos)), 30);
    return () => clearTimeout(t);
  }, [seriesIndexList, currentIndex]);

  /** Yêu cầu tải ngay 1 lát bất kỳ (lưới đa khung nhìn, MPR) */
  const requestInstance = useCallback((index, priority = 0) => {
    const inst = instancesRef.current[index];
    if (!inst) return;
    if (priority <= 1) urgentRef.current.add(index); // đang hiện trên màn hình (ô lưới)
    loaderRef.current?.request(index, inst, priority);
  }, []);

  /* ---------------- WW/WL theo series ---------------- */
  const currentDecoded = dicomCache[currentIndex];
  const defaultVoi = useMemo(() => {
    const meta = currentDecoded?.meta;
    if (meta && Number.isFinite(meta.windowCenter) && Number.isFinite(meta.windowWidth)) {
      return { center: meta.windowCenter, width: meta.windowWidth, source: meta.windowSource || 'dicom' };
    }
    const inst = instances[currentIndex];
    if (inst && Number.isFinite(inst.windowCenter) && Number.isFinite(inst.windowWidth)) {
      return { center: inst.windowCenter, width: inst.windowWidth, source: 'dicom' };
    }
    return { center: 127.5, width: 256, source: 'none' };
  }, [currentDecoded, instances, currentIndex]);

  const activeVoi = (currentSeriesUid && voiBySeries[currentSeriesUid]) || defaultVoi;
  const windowCenter = activeVoi.center;
  const windowWidth = activeVoi.width;
  const activeVoiRef = useRef(activeVoi);
  activeVoiRef.current = activeVoi;
  const seriesUidRef = useRef(currentSeriesUid);
  seriesUidRef.current = currentSeriesUid;

  const updateVoi = useCallback((patch, source = 'user') => {
    const uid = seriesUidRef.current || 'default_series';
    setVoiBySeries((prev) => {
      const base = prev[uid] || activeVoiRef.current;
      const next = { ...base, ...patch, source };
      if (next.width < 1) next.width = 1;
      return { ...prev, [uid]: next };
    });
  }, []);

  const setWindowCenter = useCallback(
    (v) => updateVoi({ center: typeof v === 'function' ? v(activeVoiRef.current.center) : v }),
    [updateVoi]
  );
  const setWindowWidth = useCallback(
    (v) => updateVoi({ width: typeof v === 'function' ? v(activeVoiRef.current.width) : v }),
    [updateVoi]
  );
  const applyVoi = useCallback((center, width, source = 'preset') => updateVoi({ center, width }, source), [updateVoi]);
  /** Về cửa sổ mặc định của DICOM cho series hiện tại */
  const resetVoi = useCallback(() => {
    const uid = seriesUidRef.current || 'default_series';
    setVoiBySeries((prev) => {
      const next = { ...prev };
      delete next[uid];
      return next;
    });
  }, []);

  // Upload handler for new DICOM files (or local-only reading when no patientDiagnoseId)
  const uploadDicom = async (file) => {
    // Chế độ đọc độc lập: giải mã trực tiếp trên trình duyệt, không liên kết bệnh nhân
    if (!patientDiagnoseId) {
      const lowerName = (file.name || '').toLowerCase();
      if (lowerName.endsWith('.zip')) {
        message.warning('Chế độ đọc độc lập hỗ trợ chọn trực tiếp nhiều file .dcm / .dicom hoặc ảnh/PDF.');
        return false;
      }

      const isAttachment = /\.(pdf|docx?|mp4|png|jpe?g|webp)$/i.test(lowerName);
      if (isAttachment) {
        const objectUrl = URL.createObjectURL(file);
        setStudy((prev) => ({
          ...(prev || { patientName: 'Đọc độc lập (Local)', patientId: 'LOCAL', modality: 'DICOM' }),
          attachedFiles: [
            ...(prev?.attachedFiles || []),
            {
              id: `local_att_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
              fileName: file.name,
              fileUrl: objectUrl,
              fileSize: file.size,
              isLocal: true,
            },
          ],
        }));
        message.success(`Đã mở tệp cục bộ: ${file.name}`);
        return false;
      }

      try {
        const buffer = await file.arrayBuffer();
        const first = await decodeDicom(buffer, 0);
        if (!first.meta) {
          message.error(`Tệp ${file.name} không phải DICOM hợp lệ`);
          return false;
        }
        if (!first.decodeInfo?.ok) {
          message.warning(`${file.name}: ${first.decodeInfo?.reason}`);
        }
        const sop = first.meta.sopInstanceUid || `local_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        loaderRef.current?.registerLocalBuffer(sop, buffer);
        const frames = Math.max(1, first.meta.numberOfFrames || 1);
        const baseInst = {
          sopInstanceUid: sop,
          seriesInstanceUid: first.meta.seriesInstanceUid || 'local_series_1',
          seriesDescription: first.meta.seriesDescription || 'DICOM cục bộ',
          seriesNumber: first.meta.seriesNumber,
          modality: first.meta.modality || 'OT',
          fileName: file.name,
          instanceNumber: first.meta.instanceNumber,
          numberOfFrames: frames,
          isLocal: true,
        };
        const entries = Array.from({ length: frames }, (_, f) => {
          const inst = { ...baseInst, frameIndex: f, frameCount: frames };
          return { ...inst, key: makeInstanceKey(inst) };
        });

        setInstances((prev) => {
          const startIdx = prev.length;
          cacheBytesRef.current.set(startIdx, pixelBytes(first));
          pendingFullRef.current[startIdx] = first;
          scheduleFlush();
          if (startIdx === 0) setCurrentIndex(0);
          return [...prev, ...entries];
        });

        setStudy((prev) => ({
          ...(prev || {}),
          patientName: first.meta.patientName || prev?.patientName || '',
          patientId: first.meta.patientId || prev?.patientId || '',
          modality: first.meta.modality || prev?.modality || '',
          studyDate: first.meta.studyDate || prev?.studyDate || '',
        }));
      } catch (err) {
        console.error('Lỗi đọc DICOM cục bộ:', err);
        message.error(`Không thể đọc tệp ${file.name}`);
      }
      return false;
    }

    const formData = new FormData();
    formData.append('files', file);

    setUploadState({
      status: 'uploading',
      fileName: file.name,
      fileSize: file.size,
      progress: 20,
      message: `Đang tải lên tệp: ${file.name}`,
      details: 'Đang truyền dữ liệu và giải nén trên máy chủ PACS...',
    });

    try {
      const res = await axios.post(
        `${apiEndpoint}/api/pacs/upload?patientDiagnoseId=${patientDiagnoseId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            ...getAuthHeaders(),
          },
          timeout: 900000,
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setUploadState((prev) => ({
                ...prev,
                progress: Math.min(percent, 90),
                details:
                  percent < 100
                    ? `Đang truyền file (${percent}%)...`
                    : 'Máy chủ đang phân tích chỉ mục không gian DICOM...',
              }));
            }
          },
        }
      );

      const responseStudy = res.data?.data?.data || res.data?.data;
      const count = responseStudy?.instances?.length || 0;
      const attCount = responseStudy?.attachedFiles?.length || 0;

      setUploadState({
        status: 'success',
        fileName: file.name,
        fileSize: file.size,
        progress: 100,
        message: 'Tải lên thành công!',
        details: `Đã nạp thành công ${count} lát cắt DICOM${
          attCount > 0 ? ` và ${attCount} tệp đính kèm` : ''
        } vào ca bệnh #${patientDiagnoseId}.`,
      });

      await loadStudy();
    } catch (err) {
      let errorMsg = err.response?.data?.message;
      if (!errorMsg) {
        if (err.response?.status === 413) {
          errorMsg = 'Tệp tải lên vượt quá giới hạn dung lượng máy chủ (413 Payload Too Large).';
        } else if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
          errorMsg = 'Quá thời gian tải tệp lên máy chủ PACS (Timeout). Vui lòng thử lại.';
        } else if (err.message === 'Network Error') {
          errorMsg = 'Lỗi kết nối mạng hoặc máy chủ PACS (Network Error). Hãy đảm bảo máy chủ PACS đang hoạt động và cho phép tải tệp lớn.';
        } else {
          errorMsg = err.message || 'Lỗi kết nối máy chủ PACS';
        }
      }
      setUploadState({
        status: 'error',
        fileName: file.name,
        fileSize: file.size,
        progress: 0,
        message: 'Tải lên thất bại!',
        details: Array.isArray(errorMsg) ? errorMsg.join(', ') : String(errorMsg),
      });
    }
    return false;
  };

  return {
    loading,
    study,
    patientDiagnose,
    instances,
    legacyOrderKeys,
    currentIndex,
    setCurrentIndex,
    dicomCache,
    setDicomCache,
    previewCache,
    loadErrors,
    authError,
    requestInstance,
    windowCenter,
    setWindowCenter,
    windowWidth,
    setWindowWidth,
    voiSource: activeVoi.source,
    voiBySeries,
    setVoiBySeries,
    applyVoi,
    resetVoi,
    loadStudy,
    uploadDicom,
    uploadState,
    resetUploadState,
    getAuthHeaders,
  };
}
