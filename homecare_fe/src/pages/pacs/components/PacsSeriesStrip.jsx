import React from 'react';
import { Tooltip } from 'antd';
import { FileWordOutlined, FilePdfOutlined } from '@ant-design/icons';

export default function PacsSeriesStrip({
  seriesList = [],
  activeSeriesUid,
  onSelectSeries,
  thumbnailUrl,
  attachedFiles = [],
  activeAttachedFile,
  onSelectAttachedFile,
}) {
  return (
    <div
      style={{
        width: 82,
        minWidth: 82,
        backgroundColor: '#0a0f1d',
        borderRight: '1px solid #1e293b',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '6px 4px',
        gap: 8,
        overflowY: 'auto',
        userSelect: 'none',
        zIndex: 10,
      }}
    >
      {/* Series Cards */}
      {seriesList.map((series, idx) => {
        const isSelected = activeSeriesUid === series.seriesUid || (!activeSeriesUid && idx === 0);
        const count = series.instances?.length || 1;
        const displayTitle = `${idx + 1}. ${series.title || 'upload_series'}`;

        return (
          <Tooltip key={series.seriesUid} title={`${displayTitle} (${count} ảnh)`} placement="right">
            <div
              onClick={() => onSelectSeries(series.seriesUid)}
              style={{
                width: 72,
                height: 84,
                backgroundColor: '#111827',
                border: isSelected ? '2px solid #f59e0b' : '1px solid #1e293b',
                borderRadius: 4,
                cursor: 'pointer',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                transition: 'all 0.15s ease',
                boxShadow: isSelected ? '0 0 8px rgba(245, 158, 11, 0.3)' : 'none',
              }}
            >
              {/* Header Label */}
              <div
                style={{
                  fontSize: '9px',
                  fontWeight: '700',
                  color: isSelected ? '#f59e0b' : '#cbd5e1',
                  padding: '2px 4px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  backgroundColor: 'rgba(0, 0, 0, 0.4)',
                }}
              >
                {displayTitle}
              </div>

              {/* Thumbnail Area */}
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#000',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {thumbnailUrl ? (
                  <img
                    src={thumbnailUrl}
                    alt="thumb"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                ) : (
                  <div style={{ color: '#64748b', fontSize: '10px' }}>DICOM</div>
                )}

                {/* 3 Green Stack Lines at bottom right */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: 3,
                    right: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1.5,
                  }}
                >
                  <div style={{ width: 12, height: 1.5, backgroundColor: '#10b981' }} />
                  <div style={{ width: 12, height: 1.5, backgroundColor: '#10b981' }} />
                  <div style={{ width: 12, height: 1.5, backgroundColor: '#10b981' }} />
                </div>
              </div>

              {/* Big Slice Count at bottom left */}
              <div
                style={{
                  position: 'absolute',
                  bottom: 2,
                  left: 4,
                  fontSize: '13px',
                  fontWeight: '800',
                  color: '#ffffff',
                  fontFamily: 'monospace',
                  textShadow: '1px 1px 2px #000',
                }}
              >
                {count}
              </div>
            </div>
          </Tooltip>
        );
      })}

      {/* Attached Files List (PDF, Word docx, Video mp4, Images) matching Ảnh 1 & Ảnh 2 */}
      {attachedFiles.length > 0 ? (
        attachedFiles.map((file, fIdx) => {
          const isPdf = file.fileType === 'pdf' || file.fileName?.toLowerCase().endsWith('.pdf');
          const isWord = file.fileType === 'word' || file.fileName?.toLowerCase().endsWith('.docx') || file.fileName?.toLowerCase().endsWith('.doc');
          const isVideo = file.fileType === 'video' || file.fileName?.toLowerCase().endsWith('.mp4');
          const isSelected = activeAttachedFile?.id === file.id;

          return (
            <Tooltip key={file.id || fIdx} title={`${file.fileName} (${file.uploadedAt || ''})`} placement="right">
              <div
                onClick={() => onSelectAttachedFile?.(file)}
                style={{
                  width: 72,
                  height: 84,
                  backgroundColor: isSelected ? '#1e293b' : '#111b33',
                  border: isSelected ? '2px solid #f59e0b' : '1px solid #1e293b',
                  borderRadius: 4,
                  cursor: 'pointer',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '4px',
                  transition: 'all 0.15s ease',
                  boxShadow: isSelected ? '0 0 8px rgba(245, 158, 11, 0.4)' : 'none',
                }}
              >
                <div
                  style={{
                    fontSize: '10px',
                    fontWeight: '700',
                    color: isSelected ? '#f59e0b' : '#ffffff',
                    marginBottom: 4,
                  }}
                >
                  File
                </div>

                <div
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {isPdf ? (
                    <div
                      style={{
                        width: 32,
                        height: 38,
                        backgroundColor: '#dc2626',
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ffffff',
                        fontWeight: '900',
                        fontSize: '11px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.5)',
                      }}
                    >
                      PDF
                    </div>
                  ) : isWord ? (
                    <div
                      style={{
                        width: 32,
                        height: 38,
                        backgroundColor: '#185abd',
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ffffff',
                        fontWeight: '900',
                        fontSize: '18px',
                        fontFamily: 'sans-serif',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.5)',
                      }}
                    >
                      W
                    </div>
                  ) : isVideo ? (
                    <div
                      style={{
                        width: 32,
                        height: 38,
                        backgroundColor: '#7c3aed',
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ffffff',
                        fontWeight: '900',
                        fontSize: '11px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.5)',
                      }}
                    >
                      MP4
                    </div>
                  ) : (
                    <div
                      style={{
                        width: 32,
                        height: 38,
                        backgroundColor: '#0284c7',
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ffffff',
                        fontWeight: '900',
                        fontSize: '11px',
                      }}
                    >
                      FILE
                    </div>
                  )}
                </div>

                {/* File Index at bottom left */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: 2,
                    left: 6,
                    fontSize: '12px',
                    fontWeight: '700',
                    color: '#ffffff',
                    fontFamily: 'monospace',
                  }}
                >
                  {fIdx + 1}
                </div>
              </div>
            </Tooltip>
          );
        })
      ) : (
        /* Default template preview tile if no files uploaded yet */
        <Tooltip title="Mẫu phiếu kết quả Word (.docx)" placement="right">
          <div
            onClick={() => onSelectAttachedFile?.({ fileName: 'Bao_cao_mau.docx', fileType: 'word' })}
            style={{
              width: 72,
              height: 84,
              backgroundColor: '#111b33',
              border: '1px solid #1e293b',
              borderRadius: 4,
              cursor: 'pointer',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '4px',
              transition: 'all 0.15s ease',
            }}
          >
            <div style={{ fontSize: '10px', fontWeight: '700', color: '#ffffff', marginBottom: 4 }}>
              File
            </div>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div
                style={{
                  width: 32,
                  height: 38,
                  backgroundColor: '#185abd',
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  fontWeight: '900',
                  fontSize: '18px',
                  fontFamily: 'sans-serif',
                }}
              >
                W
              </div>
            </div>
            <div style={{ position: 'absolute', bottom: 2, left: 6, fontSize: '12px', fontWeight: '700', color: '#ffffff', fontFamily: 'monospace' }}>
              1
            </div>
          </div>
        </Tooltip>
      )}
    </div>
  );
}

