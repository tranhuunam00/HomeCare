import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { message } from 'antd';
import { parseDicomBuffer } from '../services/dicomDecoder';

export function usePacsStudy(patientDiagnoseId, apiEndpoint) {
  const [loading, setLoading] = useState(true);
  const [study, setStudy] = useState(null);
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

  // Fetch Study Metadata
  const loadStudy = useCallback(async () => {
    if (!patientDiagnoseId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await axios.get(`${apiEndpoint}/api/pacs/studies/${patientDiagnoseId}`, {
        headers: getAuthHeaders(),
      });
      if (res.data?.success && res.data?.data) {
        const raw = res.data.data;
        const studyData = raw.data ? raw.data : raw;
        setStudy(studyData);
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

  // Upload handler for new DICOM files
  const uploadDicom = async (file) => {
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
