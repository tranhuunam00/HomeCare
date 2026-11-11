import React, { useState } from 'react';
import { Modal, Upload, Button, message, Typography } from 'antd';
import { InboxOutlined, UploadOutlined } from '@ant-design/icons';
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

  const apiEndpoint = import.meta.env.VITE_API_ENDPOINT || 'http://localhost:3001';

  const handleUpload = async () => {
    if (fileList.length === 0) {
      message.warning('Vui lòng chọn ít nhất một file DICOM (.dcm hoặc .zip)');
      return;
    }

    const formData = new FormData();
    fileList.forEach((file) => {
      formData.append('files', file);
    });

    try {
      setUploading(true);
      const token = localStorage.getItem('TOKEN');
      const res = await axios.post(
        `${apiEndpoint}/api/pacs/upload?patientDiagnoseId=${patientDiagnoseId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );

      if (res.data?.success) {
        message.success('Tải lên hình ảnh DICOM thành công!');
        setFileList([]);
        onUploadSuccess?.(res.data.data);
        onClose?.();
      }
    } catch (err) {
      console.error('Lỗi tải DICOM:', err);
      message.error(
        'Tải lên thất bại: ' + (err.response?.data?.message || err.message)
      );
    } finally {
      setUploading(false);
    }
  };

  const uploadProps = {
    multiple: true,
    fileList,
    beforeUpload: (file) => {
      setFileList((prev) => [...prev, file]);
      return false; // Prevent auto-upload
    },
    onRemove: (file) => {
      setFileList((prev) => prev.filter((item) => item.uid !== file.uid));
    },
    accept: '.dcm,.zip',
  };

  return (
    <Modal
      title={
        <div>
          <span style={{ fontWeight: '600' }}>Tải ảnh DICOM (PACS)</span>
          {patientName && (
            <span style={{ fontSize: '13px', color: '#64748b', marginLeft: 8 }}>
              - Ca bệnh: {patientName} (ID: #{patientDiagnoseId})
            </span>
          )}
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="back" onClick={onClose} disabled={uploading}>
          Hủy
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={uploading}
          onClick={handleUpload}
          icon={<UploadOutlined />}
        >
          Bắt đầu tải lên ({fileList.length} file)
        </Button>,
      ]}
      width={560}
      destroyOnClose
    >
      <div style={{ margin: '16px 0' }}>
        <Dragger {...uploadProps}>
          <p className="ant-upload-drag-icon">
            <InboxOutlined style={{ color: '#3b82f6', fontSize: '42px' }} />
          </p>
          <p className="ant-upload-text" style={{ fontWeight: '500' }}>
            Nhấp hoặc kéo thả file DICOM vào đây
          </p>
          <p className="ant-upload-hint" style={{ color: '#64748b', fontSize: '12px' }}>
            Hỗ trợ các file định dạng ảnh DICOM tiêu chuẩn (<code>.dcm</code>) hoặc file nén (<code>.zip</code>) chứa toàn bộ chuỗi lát cắt CT/MRI/X-quang.
          </p>
        </Dragger>
      </div>
    </Modal>
  );
}

