import React, { useEffect } from 'react';
import {
  CheckCircleFilled,
  CloseCircleFilled,
  LoadingOutlined,
  CloseOutlined,
} from '@ant-design/icons';

export default function PacsUploadAlert({
  status = 'idle', // 'idle' | 'uploading' | 'success' | 'error'
  fileName = '',
  fileSize = 0,
  progress = 0,
  message = '',
  details = '',
  onClose,
}) {
  // Auto-dismiss on success after 4.5 seconds
  useEffect(() => {
    if (status === 'success') {
      const timer = setTimeout(() => {
        if (onClose) onClose();
      }, 4500);
      return () => clearTimeout(timer);
    }
  }, [status, onClose]);

  if (status === 'idle') return null;

  const isUploading = status === 'uploading';
  const isSuccess = status === 'success';
  const isError = status === 'error';

  // Format file size
  const formatSize = (bytes) => {
    if (!bytes || bytes <= 0) return '';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const borderColor = isSuccess ? '#22c55e' : isError ? '#ef4444' : '#38bdf8';
  const glowColor = isSuccess
    ? 'rgba(34, 197, 94, 0.35)'
    : isError
    ? 'rgba(239, 68, 68, 0.35)'
    : 'rgba(56, 189, 248, 0.35)';

  return (
    <>
      <style>
        {`
          @keyframes pacsUploadSlideDown {
            0% { transform: translate(-50%, -24px); opacity: 0; }
            100% { transform: translate(-50%, 0); opacity: 1; }
          }
          @keyframes pacsProgressPulse {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
        `}
      </style>

      <div
        style={{
          position: 'fixed',
          top: 54,
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#0f172a',
          border: `1.5px solid ${borderColor}`,
          borderRadius: 8,
          boxShadow: `0 8px 32px rgba(0, 0, 0, 0.85), 0 0 18px ${glowColor}`,
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          padding: '14px 18px',
          maxWidth: 540,
          minWidth: 420,
          animation: 'pacsUploadSlideDown 0.25s ease-out',
          userSelect: 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          {/* Status Icon */}
          <div style={{ marginTop: 2, flexShrink: 0 }}>
            {isUploading && (
              <LoadingOutlined style={{ color: '#38bdf8', fontSize: 20 }} spin />
            )}
            {isSuccess && (
              <CheckCircleFilled style={{ color: '#22c55e', fontSize: 20 }} />
            )}
            {isError && (
              <CloseCircleFilled style={{ color: '#ef4444', fontSize: 20 }} />
            )}
          </div>

          {/* Text Content */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 4,
              }}
            >
              <span
                style={{
                  fontWeight: '800',
                  color: isSuccess ? '#4ade80' : isError ? '#f87171' : '#38bdf8',
                  fontSize: '13px',
                  letterSpacing: '0.3px',
                  textTransform: 'uppercase',
                }}
              >
                {isUploading && 'Đang xử lý tệp DICOM / Tài liệu...'}
                {isSuccess && 'Tải lên thành công!'}
                {isError && 'Tải lên thất bại!'}
              </span>

              {!isUploading && onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#64748b',
                    cursor: 'pointer',
                    padding: 2,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  title="Đóng thông báo"
                >
                  <CloseOutlined style={{ fontSize: 13 }} />
                </button>
              )}
            </div>

            {/* Filename & size */}
            {fileName && (
              <div
                style={{
                  fontSize: '12px',
                  color: '#f8fafc',
                  fontWeight: '600',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  marginBottom: 3,
                }}
              >
                {fileName}{' '}
                {fileSize > 0 && (
                  <span style={{ color: '#94a3b8', fontWeight: '400', fontSize: '11px' }}>
                    ({formatSize(fileSize)})
                  </span>
                )}
              </div>
            )}

            {/* Detailed message */}
            <div style={{ fontSize: '12px', color: '#94a3b8', lineHeight: '17px' }}>
              {details || message}
            </div>

            {/* Uploading Progress Bar */}
            {isUploading && (
              <div
                style={{
                  width: '100%',
                  height: 4,
                  backgroundColor: '#1e293b',
                  borderRadius: 2,
                  marginTop: 10,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${Math.max(progress, 15)}%`,
                    background:
                      'linear-gradient(90deg, #0284c7, #38bdf8, #818cf8)',
                    borderRadius: 2,
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

