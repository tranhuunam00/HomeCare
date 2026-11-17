import React, { useState, useMemo } from 'react';
import { Modal, Tag, Tooltip, Popconfirm, message, Image } from 'antd';
import {
  PictureOutlined,
  StarFilled,
  StarOutlined,
  DeleteOutlined,
  DownloadOutlined,
  SendOutlined,
  EyeOutlined,
  ScissorOutlined,
  CameraOutlined,
  CloseOutlined,
} from '@ant-design/icons';

/**
 * Modal Thư viện ảnh Key & Chẩn đoán lâm sàng
 * Cho phép bác sĩ quản lý, xem phóng to, gắn sao, tải về và chèn trực tiếp vào báo cáo kết quả chẩn đoán.
 */
export default function PacsKeyImageGalleryModal({
  open,
  onClose,
  keyImages = [],
  onDeleteKeyImage,
  onClearAllKeyImages,
  onToggleStarKeyImage,
  onInsertToReport,
  onCaptureCurrentSlice,
  onOpenCrop,
  currentSliceIndex = 1,
  totalSlices = 1,
}) {
  const [filterTab, setFilterTab] = useState('all'); // 'all' | 'starred' | 'crop'
  const [previewImage, setPreviewImage] = useState(null);

  const starredCount = useMemo(() => keyImages.filter((k) => k.isStarred).length, [keyImages]);
  const cropCount = useMemo(() => keyImages.filter((k) => k.isCrop).length, [keyImages]);

  const filteredImages = useMemo(() => {
    if (filterTab === 'starred') return keyImages.filter((k) => k.isStarred);
    if (filterTab === 'crop') return keyImages.filter((k) => k.isCrop);
    return keyImages;
  }, [keyImages, filterTab]);

  // Download 1 ảnh PNG
  const handleDownloadSingle = (item) => {
    try {
      const a = document.createElement('a');
      a.href = item.dataUrl;
      const safeCaption = (item.caption || 'key_image').replace(/[^a-zA-Z0-9_\u00C0-\u024F\u1E00-\u1EFF]/g, '_').slice(0, 40);
      a.download = `PACS_KeyImage_Slice${item.sliceIndex || 1}_${safeCaption}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      message.success('Đã tải ảnh key thành công!');
    } catch (err) {
      console.error(err);
      message.error('Lỗi khi tải ảnh');
    }
  };

  // Tải toàn bộ ảnh
  const handleDownloadAll = () => {
    if (!filteredImages.length) return;
    filteredImages.forEach((img, idx) => {
      setTimeout(() => {
        const a = document.createElement('a');
        a.href = img.dataUrl;
        a.download = `PACS_KeyImage_${idx + 1}_Slice${img.sliceIndex || 1}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }, idx * 250);
    });
    message.success(`Đang tải ${filteredImages.length} ảnh...`);
  };

  return (
    <>
      <Modal
        open={open}
        onCancel={onClose}
        footer={null}
        width={960}
        centered
        destroyOnClose
        closeIcon={<CloseOutlined style={{ color: '#94a3b8', fontSize: 16 }} />}
        styles={{
          content: {
            backgroundColor: '#0f172a',
            border: '1px solid #334155',
            borderRadius: 12,
            padding: 0,
            overflow: 'hidden',
            boxShadow: '0 20px 45px rgba(0,0,0,0.85)',
          },
          body: {
            padding: '20px 24px',
            color: '#f8fafc',
          },
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #1e293b', paddingBottom: 16, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                backgroundColor: 'rgba(56, 189, 248, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#38bdf8',
                fontSize: 18,
              }}
            >
              <PictureOutlined />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: 8 }}>
                Thư viện ảnh Key & Chẩn đoán
                <span
                  style={{
                    backgroundColor: '#1e293b',
                    color: '#38bdf8',
                    border: '1px solid #334155',
                    fontSize: 12,
                    fontWeight: 600,
                    padding: '1px 8px',
                    borderRadius: 12,
                  }}
                >
                  {keyImages.length} ảnh
                </span>
              </div>
              <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
                Các lát cắt và vùng tổn thương đã chọn lọc để chèn vào báo cáo bệnh án
              </div>
            </div>
          </div>

          {/* Quick Capture Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {onCaptureCurrentSlice && (
              <button
                onClick={onCaptureCurrentSlice}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 12px',
                  borderRadius: 6,
                  backgroundColor: '#0284c7',
                  border: 'none',
                  color: '#fff',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#0369a1')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#0284c7')}
              >
                <CameraOutlined /> Chụp lát #{currentSliceIndex}
              </button>
            )}
            {onOpenCrop && (
              <button
                onClick={onOpenCrop}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 12px',
                  borderRadius: 6,
                  backgroundColor: '#1e293b',
                  border: '1px solid #f59e0b',
                  color: '#fbbf24',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(245, 158, 11, 0.15)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#1e293b')}
              >
                <ScissorOutlined /> Cắt vùng ROI
              </button>
            )}
          </div>
        </div>

        {/* Filter Bar & Batch Actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, backgroundColor: '#090d16', padding: 4, borderRadius: 8, border: '1px solid #1e293b' }}>
            <button
              onClick={() => setFilterTab('all')}
              style={{
                border: 'none',
                padding: '5px 12px',
                borderRadius: 6,
                backgroundColor: filterTab === 'all' ? '#0284c7' : 'transparent',
                color: filterTab === 'all' ? '#fff' : '#94a3b8',
                fontWeight: filterTab === 'all' ? 600 : 500,
                fontSize: 12,
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              Tất cả ({keyImages.length})
            </button>
            <button
              onClick={() => setFilterTab('starred')}
              style={{
                border: 'none',
                padding: '5px 12px',
                borderRadius: 6,
                backgroundColor: filterTab === 'starred' ? '#eab308' : 'transparent',
                color: filterTab === 'starred' ? '#0f172a' : '#94a3b8',
                fontWeight: filterTab === 'starred' ? 700 : 500,
                fontSize: 12,
                cursor: 'pointer',
                transition: 'all 0.15s',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <StarFilled style={{ color: filterTab === 'starred' ? '#0f172a' : '#eab308' }} /> Đã gắn sao ({starredCount})
            </button>
            <button
              onClick={() => setFilterTab('crop')}
              style={{
                border: 'none',
                padding: '5px 12px',
                borderRadius: 6,
                backgroundColor: filterTab === 'crop' ? '#f97316' : 'transparent',
                color: filterTab === 'crop' ? '#fff' : '#94a3b8',
                fontWeight: filterTab === 'crop' ? 600 : 500,
                fontSize: 12,
                cursor: 'pointer',
                transition: 'all 0.15s',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <ScissorOutlined /> Cắt ROI ({cropCount})
            </button>
          </div>

          {filteredImages.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button
                onClick={handleDownloadAll}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  padding: '5px 10px',
                  borderRadius: 6,
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  color: '#38bdf8',
                  fontSize: 12,
                  cursor: 'pointer',
                }}
              >
                <DownloadOutlined /> Tải tất cả PNG
              </button>
              {onClearAllKeyImages && (
                <Popconfirm
                  title="Xác nhận xóa toàn bộ ảnh key?"
                  description="Thao tác này sẽ xóa toàn bộ ảnh key trong phiên hiện tại."
                  onConfirm={onClearAllKeyImages}
                  okText="Xóa hết"
                  cancelText="Hủy"
                  okButtonProps={{ danger: true }}
                >
                  <button
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 5,
                      padding: '5px 10px',
                      borderRadius: 6,
                      backgroundColor: 'rgba(239, 68, 68, 0.12)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      color: '#ef4444',
                      fontSize: 12,
                      cursor: 'pointer',
                    }}
                  >
                    <DeleteOutlined /> Xóa hết
                  </button>
                </Popconfirm>
              )}
            </div>
          )}
        </div>

        {/* Gallery Content */}
        {filteredImages.length === 0 ? (
          <div
            style={{
              padding: '60px 20px',
              textAlign: 'center',
              backgroundColor: '#090d16',
              borderRadius: 8,
              border: '1px dashed #334155',
            }}
          >
            <PictureOutlined style={{ fontSize: 44, color: '#334155', marginBottom: 12 }} />
            <div style={{ color: '#e2e8f0', fontSize: 14, fontWeight: 600 }}>
              {filterTab === 'starred'
                ? 'Chưa có ảnh key nào được gắn sao quan trọng'
                : filterTab === 'crop'
                ? 'Chưa có ảnh cắt ROI nào được lưu'
                : 'Chưa có ảnh key nào trong thư viện'}
            </div>
            <div style={{ color: '#64748b', fontSize: 12, marginTop: 4, maxWidth: 420, margin: '6px auto 0' }}>
              Bác sĩ có thể bấm nút <strong>Máy ảnh</strong> hoặc phím tắt <strong>[Space] / [S]</strong> khi xem để chụp lát cắt, hoặc dùng công cụ <strong>Cắt vùng ảnh [✂]</strong> để lưu ảnh tổn thương.
            </div>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: 16,
              maxHeight: '62vh',
              overflowY: 'auto',
              paddingRight: 4,
            }}
          >
            {filteredImages.map((item, idx) => (
              <div
                key={item.id || idx}
                style={{
                  backgroundColor: '#131b2e',
                  border: item.isStarred ? '1px solid rgba(234, 179, 8, 0.5)' : '1px solid #1e293b',
                  borderRadius: 8,
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.2s',
                  boxShadow: item.isStarred ? '0 0 12px rgba(234, 179, 8, 0.15)' : 'none',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#38bdf8')}
                onMouseLeave={(e) =>
                  (e.currentTarget.style.borderColor = item.isStarred ? 'rgba(234, 179, 8, 0.5)' : '#1e293b')
                }
              >
                {/* Thumbnail Header */}
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    height: 160,
                    backgroundColor: '#000',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onClick={() => setPreviewImage(item)}
                >
                  <img
                    src={item.dataUrl}
                    alt={item.caption || 'Key Image'}
                    style={{
                      maxWidth: '100%',
                      maxHeight: '100%',
                      objectFit: 'contain',
                    }}
                  />

                  {/* Badges on Thumbnail */}
                  <div style={{ position: 'absolute', top: 8, left: 8, display: 'flex', gap: 6, zIndex: 2 }}>
                    <Tag color="#0284c7" style={{ margin: 0, fontWeight: 700, fontSize: 11, border: 'none' }}>
                      Lát #{item.sliceIndex || 1}/{item.totalSlices || totalSlices}
                    </Tag>
                    {item.isCrop && (
                      <Tag color="#d97706" style={{ margin: 0, fontWeight: 700, fontSize: 11, border: 'none' }}>
                        ✂ ROI
                      </Tag>
                    )}
                  </div>

                  {/* Star Toggle Button */}
                  <div
                    style={{
                      position: 'absolute',
                      top: 6,
                      right: 8,
                      zIndex: 3,
                      cursor: 'pointer',
                      padding: 4,
                      borderRadius: 4,
                      backgroundColor: 'rgba(15, 23, 42, 0.75)',
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleStarKeyImage?.(item.id);
                    }}
                  >
                    {item.isStarred ? (
                      <StarFilled style={{ color: '#eab308', fontSize: 16 }} />
                    ) : (
                      <StarOutlined style={{ color: '#94a3b8', fontSize: 16 }} />
                    )}
                  </div>

                  {/* Hover Overlay Hint */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 6,
                      right: 8,
                      backgroundColor: 'rgba(0,0,0,0.65)',
                      color: '#94a3b8',
                      fontSize: 10,
                      padding: '2px 6px',
                      borderRadius: 4,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <EyeOutlined /> Phóng to
                  </div>
                </div>

                {/* Card Body */}
                <div style={{ padding: '10px 12px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: '#f1f5f9',
                      lineHeight: '16px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      minHeight: 32,
                    }}
                    title={item.caption}
                  >
                    {item.caption || `Lát cắt #${item.sliceIndex}`}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8, fontSize: 11, color: '#64748b' }}>
                    <span>
                      {item.createdAt
                        ? new Date(item.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                        : ''}
                    </span>
                    {item.windowWidth !== undefined && (
                      <span style={{ fontFamily: 'monospace' }}>
                        W:{item.windowWidth} L:{item.windowCenter}
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Action Footer */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    borderTop: '1px solid #1e293b',
                    backgroundColor: '#0c1322',
                    padding: '6px 8px',
                    gap: 6,
                  }}
                >
                  <Tooltip title="Chèn trực tiếp vào mẫu báo cáo bệnh án">
                    <button
                      onClick={() => {
                        onInsertToReport?.(item);
                        message.success('Đã chèn ảnh key vào mẫu đọc báo cáo!');
                      }}
                      style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 4,
                        padding: '5px 0',
                        borderRadius: 4,
                        backgroundColor: '#0284c7',
                        border: 'none',
                        color: '#fff',
                        fontSize: 11,
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#0369a1')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#0284c7')}
                    >
                      <SendOutlined /> Vào báo cáo
                    </button>
                  </Tooltip>

                  <Tooltip title="Tải ảnh PNG về máy">
                    <button
                      onClick={() => handleDownloadSingle(item)}
                      style={{
                        width: 28,
                        height: 28,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 4,
                        backgroundColor: '#1e293b',
                        border: '1px solid #334155',
                        color: '#38bdf8',
                        cursor: 'pointer',
                      }}
                    >
                      <DownloadOutlined />
                    </button>
                  </Tooltip>

                  {onDeleteKeyImage && (
                    <Popconfirm
                      title="Xóa ảnh key này?"
                      onConfirm={() => onDeleteKeyImage(item.id)}
                      okText="Xóa"
                      cancelText="Hủy"
                      okButtonProps={{ danger: true }}
                    >
                      <button
                        style={{
                          width: 28,
                          height: 28,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: 4,
                          backgroundColor: '#1e293b',
                          border: '1px solid #334155',
                          color: '#ef4444',
                          cursor: 'pointer',
                        }}
                      >
                        <DeleteOutlined />
                      </button>
                    </Popconfirm>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>

      {/* Lightbox Preview */}
      {previewImage && (
        <Modal
          open={!!previewImage}
          onCancel={() => setPreviewImage(null)}
          footer={null}
          width={800}
          centered
          styles={{
            content: {
              backgroundColor: '#000',
              padding: 0,
              borderRadius: 8,
              overflow: 'hidden',
              boxShadow: '0 25px 50px rgba(0,0,0,0.95)',
            },
          }}
          closeIcon={<CloseOutlined style={{ color: '#fff', fontSize: 18 }} />}
        >
          <div style={{ padding: 12, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <img
              src={previewImage.dataUrl}
              alt={previewImage.caption}
              style={{
                maxWidth: '100%',
                maxHeight: '75vh',
                objectFit: 'contain',
                borderRadius: 4,
              }}
            />
            <div style={{ marginTop: 12, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#f8fafc', padding: '0 8px' }}>
              <div>
                <span style={{ fontWeight: 700, color: '#38bdf8' }}>Lát #{previewImage.sliceIndex}: </span>
                <span>{previewImage.caption}</span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => {
                    onInsertToReport?.(previewImage);
                    message.success('Đã chèn ảnh key vào mẫu đọc báo cáo!');
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 12px',
                    borderRadius: 6,
                    backgroundColor: '#0284c7',
                    border: 'none',
                    color: '#fff',
                    fontWeight: 600,
                    fontSize: 12,
                    cursor: 'pointer',
                  }}
                >
                  <SendOutlined /> Chèn vào báo cáo
                </button>
                <button
                  onClick={() => handleDownloadSingle(previewImage)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 12px',
                    borderRadius: 6,
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    color: '#38bdf8',
                    fontWeight: 600,
                    fontSize: 12,
                    cursor: 'pointer',
                  }}
                >
                  <DownloadOutlined /> Tải PNG
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
