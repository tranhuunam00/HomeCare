import React from 'react';
import { CheckCircleFilled, CloseOutlined } from '@ant-design/icons';

export default function PacsCaptureAlert({
  open,
  onClose,
  dataUrl,
  caption,
  sliceIndex = 1,
  totalSlices = 1,
}) {
  if (!open) return null;

  return (
    <>
      {/* 1. Camera Shutter Flash Effect */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: '#ffffff',
          opacity: 0,
          pointerEvents: 'none',
          zIndex: 9999,
          animation: 'pacsShutterFlash 0.3s ease-out',
        }}
      />
      <style>
        {`
          @keyframes pacsShutterFlash {
            0% { opacity: 0.65; }
            100% { opacity: 0; }
          }
          @keyframes pacsSlideDown {
            0% { transform: translate(-50%, -20px); opacity: 0; }
            100% { transform: translate(-50%, 0); opacity: 1; }
          }
        `}
      </style>

      {/* 2. Prominent Success Notification Banner */}
      <div
        style={{
          position: 'fixed',
          top: 54,
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#0f172a',
          border: '1.5px solid #22c55e',
          borderRadius: 8,
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.8), 0 0 15px rgba(34, 197, 94, 0.4)',
          zIndex: 9998,
          display: 'flex',
          alignItems: 'center',
          padding: '12px 16px',
          gap: 14,
          maxWidth: 520,
          minWidth: 420,
          animation: 'pacsSlideDown 0.25s ease-out',
          userSelect: 'none',
        }}
      >
        {/* Thumbnail Preview */}
        {dataUrl && (
          <img
            src={dataUrl}
            alt="key-capture-thumb"
            style={{
              width: 58,
              height: 58,
              borderRadius: 4,
              objectFit: 'cover',
              border: '1px solid #334155',
              backgroundColor: '#000',
              flexShrink: 0,
            }}
          />
        )}

        {/* Content */}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
            <CheckCircleFilled style={{ color: '#22c55e', fontSize: 16 }} />
            <span style={{ fontWeight: '800', color: '#f8fafc', fontSize: '13px' }}>
              ĐÃ CHỤP ẢNH KEY THÀNH CÔNG!
            </span>
          </div>
          <div style={{ fontSize: '12px', color: '#94a3b8', lineHeight: '16px' }}>
            Lát cắt <strong>#{sliceIndex}/{totalSlices}</strong> đã được đồng bộ trực tiếp sang mục{' '}
            <span style={{ color: '#38bdf8', fontWeight: '600' }}>"HÌNH ẢNH MINH HỌA"</span> của bệnh án.
          </div>
          {caption && (
            <div
              style={{
                fontSize: '11px',
                color: '#64748b',
                marginTop: 3,
                fontStyle: 'italic',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {caption}
            </div>
          )}
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: '#64748b',
            cursor: 'pointer',
            padding: 4,
            fontSize: 14,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CloseOutlined />
        </button>
      </div>
    </>
  );
}

