import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { message } from 'antd';
import { parseDicomBuffer } from '../services/dicomDecoder';
import { calculateAge } from '../../formver3/formver3.constant';

export function usePacsStudy(patientDiagnoseId, apiEndpoint) {
  const [loading, setLoading] = useState(true);
  const [study, setStudy] = useState(null);
  const [patientDiagnose, setPatientDiagnose] = useState(null);
  const [instances, setInstances] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Decoded DICOM cache: index -> { meta, rawPixels }
  const [dicomCache, setDicomCache] = useState({});

  // Windowing state initialized from active DICOM instance
  const [windowCenter, setWindowCenter] = useState(128);
  const [windowWidth, setWindowWidth] = useState(255);

  // Upload state for user feedback (placed at top with all states to preserve hook order)
  const [uploadState, setUploadState] = useState({
    status: 'idle', // 'idle' | 'uploading' | 'success' | 'error'
    fileName: '',
    fileSize: 0,
    progress: 0,
    message: '',
    details: '',
  });

  const resetUploadState = useCallback(() => {
    setUploadState({
      status: 'idle',
      fileName: '',
      fileSize: 0,
      progress: 0,
      message: '',
      details: '',
    });
  }, []);

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('TOKEN');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  // Fetch Study Metadata & HomeCare PatientDiagnose Record
  const loadStudy = useCallback(async () => {
    if (!patientDiagnoseId) {
      setPatientDiagnose(null);
      setStudy((prev) =>
        prev || {
          patientName: 'Đọc độc lập (Local)',
          patientId: 'LOCAL',
          modality: 'DICOM',
          studyDate: '',
          attachedFiles: [],
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

      let pdData = null;
      if (pdResult.status === 'fulfilled') {
        const rawPd = pdResult.value?.data?.data;
        pdData = rawPd?.data ? rawPd.data : rawPd || null;
        setPatientDiagnose(pdData);
      }

      if (studyResult.status === 'fulfilled' && studyResult.value?.data?.success && studyResult.value?.data?.data) {
        const raw = studyResult.value.data.data;
        const studyData = raw.data ? raw.data : raw;

        const computedAge =
          pdData && (pdData.dob || pdData.birth_year)
            ? calculateAge(pdData.dob, pdData.birth_year)
            : null;
        const formattedCreatedAt = pdData?.createdAt
          ? new Date(pdData.createdAt).toLocaleString('vi-VN', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
            })
          : '';

        setStudy({
          ...studyData,
          patientName: pdData?.name || studyData.patientName || '',
          patientId: pdData?.PID || studyData.patientId || String(patientDiagnoseId),
          patientAge: computedAge !== null && computedAge !== undefined && computedAge !== '' ? `${computedAge} tuổi` : '',
          patientBirthYear: pdData?.birth_year || '',
          patientGender: pdData?.gender || '',
          patientSid: pdData?.SID || '',
          studyDate: formattedCreatedAt || studyData.studyDate || '',
        });

        const sorted = (studyData.instances || []).sort(
          (a, b) => (a.instanceNumber || 0) - (b.instanceNumber || 0)
        );
        setInstances(sorted);
        setCurrentIndex(0);
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

  // Load and decode active DICOM instance slice
  const loadInstance = useCallback(
    async (index) => {
      if (!instances || instances.length === 0 || !instances[index]) return;
      if (dicomCache[index]) {
        const item = dicomCache[index];
        setWindowCenter(item.meta.windowCenter);
        setWindowWidth(item.meta.windowWidth);
        return;
      }

      const instance = instances[index];
      if (instance?.isLocal) return;
      try {
        const res = await axios.get(
          `${apiEndpoint}/api/pacs/instances/${instance.sopInstanceUid}/file`,
          {
            responseType: 'arraybuffer',
            headers: getAuthHeaders(),
          }
        );
        const parsed = parseDicomBuffer(res.data);
        setDicomCache((prev) => ({ ...prev, [index]: parsed }));
        setWindowCenter(parsed.meta.windowCenter);
        setWindowWidth(parsed.meta.windowWidth);
      } catch (err) {
        console.error('Lỗi tải file DICOM:', err);
        message.error(`Không thể đọc file lát cắt #${index + 1}`);
      }
    },
    [instances, dicomCache, apiEndpoint, getAuthHeaders]
  );

  useEffect(() => {
    if (instances.length > 0) {
      loadInstance(currentIndex);
    }
  }, [currentIndex, instances, loadInstance]);

  // Upload handler for new DICOM files (or local-only reading when no patientDiagnoseId)
  const uploadDicom = async (file) => {
    // Standalone Local Mode: read & decode directly in browser without linking to any patient
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
        const parsed = parseDicomBuffer(buffer);
        if (!parsed?.rawPixels) {
          message.error(`Không thể giải mã pixel DICOM từ tệp: ${file.name}`);
          return false;
        }

        const localInst = {
          sopInstanceUid: parsed.meta?.sopInstanceUid || `local_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          seriesInstanceUid: parsed.meta?.seriesInstanceUid || 'local_series_1',
          seriesDescription: parsed.meta?.seriesDescription || 'Local DICOM',
          modality: parsed.meta?.modality || 'DICOM',
          fileName: file.name,
          isLocal: true,
        };

        setInstances((prev) => {
          const nextIdx = prev.length;
          const nextList = [...prev, { ...localInst, instanceNumber: nextIdx + 1 }];
          setDicomCache((cachePrev) => ({ ...cachePrev, [nextIdx]: parsed }));
          if (nextIdx === 0) {
            setCurrentIndex(0);
            setWindowCenter(parsed.meta.windowCenter);
            setWindowWidth(parsed.meta.windowWidth);
          }
          return nextList;
        });

        setStudy((prev) => ({
          ...(prev || {}),
          patientName:
            prev?.patientName && prev.patientName !== 'Đọc độc lập (Local)'
              ? prev.patientName
              : parsed.meta?.patientName && parsed.meta.patientName !== 'Unknown' && parsed.meta.patientName !== 'Không xác định'
              ? parsed.meta.patientName
              : 'Đọc độc lập (Local)',
          patientId: parsed.meta?.patientId || prev?.patientId || 'LOCAL',
          modality: parsed.meta?.modality || prev?.modality || 'DICOM',
          studyDate: parsed.meta?.studyDate || prev?.studyDate || '',
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
      const errorMsg =
        err.response?.data?.message || err.message || 'Lỗi kết nối máy chủ PACS';
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
    currentIndex,
    setCurrentIndex,
    dicomCache,
    setDicomCache,
    windowCenter,
    setWindowCenter,
    windowWidth,
    setWindowWidth,
    loadStudy,
    uploadDicom,
    uploadState,
    resetUploadState,
    getAuthHeaders,
  };
}
