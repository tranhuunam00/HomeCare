import React from 'react';
import { Button, Tooltip } from 'antd';
import {
  CloseOutlined,
  DownloadOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  VideoCameraOutlined,
  FileOutlined,
} from '@ant-design/icons';

/**
 * Embedded Document & Media Viewer
 * Matching user reference screenshot (Bệnh viện Chợ Rẫy / VR-PACS Viewer File mode)
 */
export default function PacsAttachmentViewer({
  file,
  onClose,
  apiEndpoint = 'http://localhost:3001',
  token = '',
}) {
  if (!file) return null;

  const isPdf = file.fileType === 'pdf' || file.fileName?.toLowerCase().endsWith('.pdf');
  const isWord = file.fileType === 'word' || file.fileName?.toLowerCase().endsWith('.docx') || file.fileName?.toLowerCase().endsWith('.doc');
  const isVideo = file.fileType === 'video' || file.fileName?.toLowerCase().endsWith('.mp4');
  const isImage = file.fileType === 'image' || /\.(png|jpe?g|webp)$/i.test(file.fileName);

  const fullFileUrl = file.fileUrl?.startsWith('http')
    ? file.fileUrl
    : `${apiEndpoint}${file.fileUrl}${token ? `?token=${token}` : ''}`;

  return (
    <div
      style={{
        flex: 1,
        backgroundColor: '#0a0f1d',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      {/* Top Header matching Chợ Rẫy screenshot */}
      <div
        style={{
          height: 42,
          minHeight: 42,
          backgroundColor: '#111827',
          borderBottom: '1px solid #1e293b',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
          color: '#cbd5e1',
          zIndex: 20,
        }}
      >
        {/* Left: File Title & Icon */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {isPdf ? (
            <FilePdfOutlined style={{ color: '#ef4444', fontSize: 18 }} />
          ) : isWord ? (
            <FileWordOutlined style={{ color: '#3b82f6', fontSize: 18 }} />
          ) : isVideo ? (
            <VideoCameraOutlined style={{ color: '#a855f7', fontSize: 18 }} />
          ) : (
            <FileOutlined style={{ color: '#38bdf8', fontSize: 18 }} />
          )}
          <span style={{ fontWeight: '700', fontSize: '13px', color: '#f8fafc' }}>
            {file.fileName || 'Tài liệu đính kèm'}
          </span>
        </div>

        {/* Center: Upload metadata matching reference image */}
        <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '500' }}>
          Upload by: <strong style={{ color: '#e2e8f0' }}>{file.uploadedBy || 'localhost'}</strong> at {file.uploadedAt || '24/04/2026 16:11'}
        </div>

        {/* Right: Actions & Red Close Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Tooltip title="Tải xuống tệp gốc">
            <a href={fullFileUrl} download={file.fileName} target="_blank" rel="noreferrer">
              <Button
                size="small"
                type="text"
                icon={<DownloadOutlined />}
                style={{ color: '#38bdf8', backgroundColor: '#1e293b' }}
              >
                Tải xuống
              </Button>
            </a>
          </Tooltip>

          <Tooltip title="Đóng và quay lại DICOM Viewer">
            <button
              onClick={onClose}
              style={{
                backgroundColor: '#dc2626',
                border: 'none',
                color: '#ffffff',
                width: 28,
                height: 28,
                borderRadius: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'background-color 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#b91c1c')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#dc2626')}
            >
              <CloseOutlined style={{ fontSize: 14 }} />
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Main Content Area */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#1e293b',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {isPdf ? (
          <iframe
            src={`${fullFileUrl}#toolbar=1`}
            title={file.fileName}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              backgroundColor: '#ffffff',
            }}
          />
        ) : isVideo ? (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#000' }}>
            <video
              src={fullFileUrl}
              controls
              autoPlay
              style={{ maxHeight: '90%', maxWidth: '90%', outline: 'none' }}
            />
          </div>
        ) : isImage ? (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#000' }}>
            <img
              src={fullFileUrl}
              alt={file.fileName}
              style={{ maxHeight: '90%', maxWidth: '90%', objectFit: 'contain' }}
            />
          </div>
        ) : isWord ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#0f172a',
              border: '1px solid #334155',
              borderRadius: 8,
              padding: 32,
              textAlign: 'center',
              maxWidth: 500,
            }}
          >
            <div
              style={{
                width: 64,
                height: 76,
                backgroundColor: '#185abd',
                borderRadius: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontWeight: '900',
                fontSize: 36,
                marginBottom: 16,
              }}
            >
              W
            </div>
            <h3 style={{ color: '#f8fafc', marginBottom: 8, fontSize: 16 }}>
              {file.fileName}
            </h3>
            <p style={{ color: '#94a3b8', fontSize: 13, marginBottom: 20 }}>
              Tài liệu Microsoft Word (.docx) đính kèm ca bệnh. Bạn có thể tải xuống để mở trực tiếp hoặc in báo cáo kết quả.
            </p>
            <a href={fullFileUrl} download={file.fileName}>
              <Button type="primary" icon={<DownloadOutlined />} size="large">
                Tải xuống tài liệu Word (.docx)
              </Button>
            </a>
          </div>
        ) : (
          <div style={{ color: '#cbd5e1', textAlign: 'center' }}>
            <p>Định dạng tệp: {file.fileName}</p>
            <a href={fullFileUrl} download={file.fileName}>
              <Button type="primary" icon={<DownloadOutlined />}>Tải xuống</Button>
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

