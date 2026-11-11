import React, { useState } from 'react';
import { Modal, Upload, Button, message, Typography, Alert, Progress } from 'antd';
import { InboxOutlined, UploadOutlined } from '@ant-design/icons';
import { toast } from 'react-toastify';
import axios from 'axios';

const { Dragger } = Upload;
const { Text } = Typography;

export default function DicomUploadModal({
  open,
  onClose,
  patientDiagnoseId,
  patientName,
  onUploadSuccess,
}) {
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(null);

  const apiEndpoint =
    typeof window !== 'undefined' && window.location.hostname.includes('home-care.vn')
      ? 'https://api.home-care.vn'
      : import.meta.env.VITE_API_ENDPOINT || 'http://localhost:3001';

  const handleUpload = async () => {
    if (fileList.length === 0) {
      toast.warning('Vui lòng chọn ít nhất một file DICOM (.dcm hoặc .zip)');
      message.warning('Vui lòng chọn ít nhất một file DICOM (.dcm hoặc .zip)');
      return;
    }

    setUploadError(null);
    setUploadSuccess(null);
    setUploading(true);
    setUploadProgress(15);

    const formData = new FormData();
    fileList.forEach((file) => {
      formData.append('files', file);
    });

    try {
      const token = localStorage.getItem('TOKEN');
      const res = await axios.post(
        `${apiEndpoint}/api/pacs/upload?patientDiagnoseId=${patientDiagnoseId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setUploadProgress(Math.min(percent, 95));
            }
          },
        }
      );

      // Handle both { success: true, data } and direct entity response
      const isSuccess = res.status >= 200 && res.status < 300;
      if (isSuccess) {
        setUploadProgress(100);
        const studyData = res.data?.data?.data || res.data?.data || res.data;
        const instCount = studyData?.instances?.length || 0;
        const msg = `Tải lên thành công! Đã nạp ${instCount > 0 ? `${instCount} lát cắt DICOM` : 'dữ liệu hình ảnh'} vào ca bệnh #${patientDiagnoseId}.`;

        setUploadSuccess(msg);
        toast.success(msg);
        message.success(msg);
        setFileList([]);

        setTimeout(() => {
          onUploadSuccess?.(studyData);
          onClose?.();
        }, 1200);
      } else {
        throw new Error(res.data?.message || 'Máy chủ trả về phản hồi không hợp lệ');
      }
    } catch (err) {
      console.error('Lỗi tải DICOM:', err);
      const rawMsg = err.response?.data?.message || err.message || 'Lỗi kết nối máy chủ PACS';
      const formatted = Array.isArray(rawMsg) ? rawMsg.join(', ') : String(rawMsg);
      const errorMsg = `Tải lên thất bại: ${formatted}`;

      setUploadError(errorMsg);
      toast.error(errorMsg);
      message.error(errorMsg);
    } finally {
      setUploading(false);
    }
  };

  const uploadProps = {
    multiple: true,
    fileList,
    beforeUpload: (file) => {
      setFileList((prev) => [...prev, file]);
      setUploadError(null);
      setUploadSuccess(null);
      return false; // Prevent auto-upload
    },
    onRemove: (file) => {
      setFileList((prev) => prev.filter((item) => item.uid !== file.uid));
      setUploadError(null);
    },
    accept: '.dcm,.dicom,.zip,.pdf,.docx,.doc,.mp4,.mov,.avi,.webm,.png,.jpg,.jpeg,.webp,.bmp',
  };

  const handleModalClose = () => {
    if (!uploading) {
      setFileList([]);
      setUploadError(null);
      setUploadSuccess(null);
      setUploadProgress(0);
      onClose?.();
    }
  };

  return (
    <Modal
      title={
        <div>
          <span style={{ fontWeight: '600' }}>Tải tệp chẩn đoán hình ảnh & Tư liệu (D-PACS)</span>
          {patientName && (
            <span style={{ fontSize: '13px', color: '#64748b', marginLeft: 8 }}>
              - Ca bệnh: {patientName} (ID: #{patientDiagnoseId})
            </span>
          )}
        </div>
      }
      open={open}
      onCancel={handleModalClose}
      footer={[
        <Button key="back" onClick={handleModalClose} disabled={uploading}>
          Hủy
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={uploading}
          onClick={handleUpload}
          icon={<UploadOutlined />}
        >
          {uploading ? 'Đang tải lên...' : `Bắt đầu tải lên (${fileList.length} file)`}
        </Button>,
      ]}
      width={580}
      destroyOnClose
    >
      <div style={{ margin: '16px 0' }}>
        <Dragger {...uploadProps} disabled={uploading}>
          <p className="ant-upload-drag-icon">
            <InboxOutlined style={{ color: '#3b82f6', fontSize: '42px' }} />
          </p>
          <p className="ant-upload-text" style={{ fontWeight: '500' }}>
            Nhấp hoặc kéo thả file DICOM, Video, Ảnh hoặc Tài liệu vào đây
          </p>
          <p className="ant-upload-hint" style={{ color: '#64748b', fontSize: '12px' }}>
            Hỗ trợ lát cắt DICOM (<code>.dcm</code>), file nén (<code>.zip</code>), video nội soi/siêu âm (<code>.mp4, .mov, .avi</code>), ảnh lâm sàng và tài liệu kết quả (<code>.pdf, .docx</code>).
          </p>
        </Dragger>

        {/* Upload Progress Bar */}
        {uploading && (
          <div style={{ marginTop: 14 }}>
            <Progress
              percent={uploadProgress}
              status="active"
              strokeColor={{
                '0%': '#3b82f6',
                '100%': '#06b6d4',
              }}
            />
            <div style={{ fontSize: '12px', color: '#64748b', textAlign: 'center', marginTop: 4 }}>
              Đang truyền dữ liệu lên máy chủ PACS và giải nén...
            </div>
          </div>
        )}

        {/* Prominent Inline Error Alert */}
        {uploadError && !uploading && (
          <div style={{ marginTop: 14 }}>
            <Alert
              type="error"
              message="Lỗi tải lên"
              description={uploadError}
              showIcon
              closable
              onClose={() => setUploadError(null)}
            />
          </div>
        )}

        {/* Prominent Inline Success Alert */}
        {uploadSuccess && (
          <div style={{ marginTop: 14 }}>
            <Alert
              type="success"
              message="Thành công"
              description={uploadSuccess}
              showIcon
            />
          </div>
        )}
      </div>
    </Modal>
  );
}
