import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Tooltip, Spin, Upload, Button } from 'antd';
import {
  UploadOutlined,
  CameraOutlined,
  DragOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  ExpandOutlined,
  CompressOutlined,
  SlidersOutlined,
  UndoOutlined,
  BorderOutlined,
  RadiusSettingOutlined,
  ColumnWidthOutlined,
  ApartmentOutlined,
} from '@ant-design/icons';
import PacsViewportOverlay from './PacsViewportOverlay';
import { PACS_TOOLS } from '../constants/pacs.constants';

const toolBtn = (active, accent = '#38bdf8') => ({
  width: 30,
  height: 30,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: active ? `${accent}26` : 'transparent',
  border: `1px solid ${active ? accent : 'transparent'}`,
  borderRadius: 6,
  color: active ? accent : '#94a3b8',
  cursor: 'pointer',
  fontSize: 15,
  transition: 'all 0.12s',
});

const toolbarBox = {
  position: 'absolute',
  top: '50%',
  transform: 'translateY(-50%)',
  display: 'flex',
  flexDirection: 'column',
  gap: 3,
  background: 'rgba(10, 15, 29, 0.82)',
  backdropFilter: 'blur(6px)',
  padding: 4,
  borderRadius: 8,
  border: '1px solid rgba(51, 65, 85, 0.7)',
  zIndex: 15,
  boxShadow: '0 4px 14px rgba(0,0,0,0.35)',
};

const divider = { height: 1, background: 'rgba(51,65,85,0.8)', margin: '2px 3px' };

export default function PacsViewport({
  viewportIndex = 0,
  activeViewport = 0,
  setActiveViewport,
  loading,
  imageCanvasRef,
  annotationCanvasRef,
  pan,
  zoom,
  rotation,
  flipH,
  flipV,
  activeTool,
  setActiveTool,
  isInteracting,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onMouseLeave,
  onWheel,
  onZoomIn,
  onZoomOut,
  onZoomActualPixels,
  onUndo,
  onDoubleClickZoom,
  isExpanded = false,
  onToggleExpand,
  onCaptureKeyImage,
  onUploadDicom,
  patientDiagnoseId,
  currentIndex,
  setCurrentIndex,
  totalSlices = 1,
  instancesCount = 0,
  isSmooth = true,
  // Ảnh & overlay
  imageDims, // { columns, rows, pixelSpacing }
  overlayProps,
  onDisplaySizeChange,
}) {
  const isActive = activeViewport === viewportIndex;
  const containerRef = useRef(null);
  const sliderTrackRef = useRef(null);
  const draggingSlider = useRef(false);
  const [displaySize, setDisplaySize] = useState({ width: 0, height: 0 });

  // Khớp ảnh vào khung nhìn theo TỈ LỆ VẬT LÝ (cột×spacingCột : hàng×spacingHàng)
  const dimCols = imageDims?.columns;
  const dimRows = imageDims?.rows;
  const spacingRow = imageDims?.pixelSpacing?.[0];
  const spacingCol = imageDims?.pixelSpacing?.[1];
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return undefined;
    const compute = () => {
      const cols = dimCols;
      const rows = dimRows;
      if (!cols || !rows) return;
      const physW = cols * (spacingCol || 1);
      const physH = rows * (spacingRow || 1);
      const availW = Math.max(50, el.clientWidth - 96); // chừa chỗ thanh công cụ 2 bên
      const availH = Math.max(50, el.clientHeight - 24);
      const fit = Math.min(availW / physW, availH / physH);
      const next = { width: Math.round(physW * fit), height: Math.round(physH * fit) };
      setDisplaySize((prev) => (prev.width === next.width && prev.height === next.height ? prev : next));
    };
    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(el);
    return () => ro.disconnect();
  }, [dimCols, dimRows, spacingRow, spacingCol]);

  useEffect(() => {
    onDisplaySizeChange?.(displaySize);
  }, [displaySize, onDisplaySizeChange]);

  // Wheel phải đăng ký non-passive để chặn cuộn trang / zoom trình duyệt khi Ctrl+wheel
  const wheelHandlerRef = useRef(onWheel);
  wheelHandlerRef.current = onWheel;
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return undefined;
    const handler = (e) => {
      e.preventDefault();
      wheelHandlerRef.current?.(e);
    };
    el.addEventListener('wheel', handler, { passive: false });
    return () => el.removeEventListener('wheel', handler);
  }, []);

  const getCursor = () => {
    switch (activeTool) {
      case PACS_TOOLS.PAN:
        return 'grab';
      case PACS_TOOLS.LENGTH:
      case PACS_TOOLS.ANGLE:
      case PACS_TOOLS.ROI_ELLIPSE:
      case PACS_TOOLS.ROI_RECT:
        return 'crosshair';
      case PACS_TOOLS.WW_WL:
        return 'ns-resize';
      case PACS_TOOLS.ZOOM:
        return 'zoom-in';
      default:
        return 'default';
    }
  };

  const seekSlider = (clientY) => {
    if (totalSlices <= 1 || !sliderTrackRef.current) return;
    const rect = sliderTrackRef.current.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
    setCurrentIndex(Math.round(ratio * (totalSlices - 1)));
  };

  useEffect(() => {
    const move = (e) => draggingSlider.current && seekSlider(e.clientY);
    const up = () => {
      draggingSlider.current = false;
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
    };
  });

  const sliderPercent = totalSlices > 1 ? (currentIndex / (totalSlices - 1)) * 100 : 0;
  const stop = (fn) => (e) => {
    e.stopPropagation();
    fn?.();
  };
  const hasImage = displaySize.width > 0 && (overlayProps?.hasFull || overlayProps?.hasPreview);

  return (
    <div
      ref={containerRef}
      onClick={() => setActiveViewport(viewportIndex)}
      onDoubleClick={onDoubleClickZoom}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
      onContextMenu={(e) => e.preventDefault()}
      style={{
        position: 'relative',
        flex: 1,
        minWidth: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000',
        overflow: 'hidden',
        outline: isActive ? '1.5px solid rgba(245, 158, 11, 0.85)' : '1px solid #111827',
        outlineOffset: -1.5,
        cursor: getCursor(),
        userSelect: 'none',
      }}
    >
      {loading && (
        <div style={{ position: 'absolute', zIndex: 30 }}>
          <Spin size="large" />
        </div>
      )}

      {/* Ảnh + chú thích (cùng phép biến đổi) */}
      <div
        style={{
          position: 'relative',
          width: displaySize.width || undefined,
          height: displaySize.height || undefined,
          visibility: hasImage || overlayProps?.decodeInfo ? 'visible' : 'hidden',
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom}) rotate(${rotation}deg) scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1})`,
          transformOrigin: 'center center',
          transition: isInteracting?.current ? 'none' : 'transform 0.06s ease-out',
          willChange: 'transform',
        }}
      >
        <canvas
          ref={imageCanvasRef}
          style={{
            display: 'block',
            width: '100%',
            height: '100%',
            imageRendering: isSmooth ? 'auto' : 'pixelated',
          }}
        />
        <canvas
          ref={annotationCanvasRef}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
        />
      </div>

      {overlayProps && instancesCount > 0 && (
        <PacsViewportOverlay
          {...overlayProps}
          zoom={zoom}
          rotation={rotation}
          flipH={flipH}
          flipV={flipV}
          displaySize={displaySize}
        />
      )}

      {/* Thanh công cụ trái: điều hướng & hiển thị */}
      {instancesCount > 0 && (
        <div style={{ ...toolbarBox, left: 8 }} onMouseDown={(e) => e.stopPropagation()}>
          <Tooltip title="Kéo ảnh (Pan) · chuột giữa" placement="right">
            <button onClick={stop(() => setActiveTool(PACS_TOOLS.PAN))} style={toolBtn(activeTool === PACS_TOOLS.PAN)}>
              <DragOutlined />
            </button>
          </Tooltip>
          <Tooltip title="Chỉnh WW/WL · chuột phải kéo" placement="right">
            <button onClick={stop(() => setActiveTool(PACS_TOOLS.WW_WL))} style={toolBtn(activeTool === PACS_TOOLS.WW_WL)}>
              <SlidersOutlined />
            </button>
          </Tooltip>
          <div style={divider} />
          <Tooltip title="Phóng to · Ctrl + cuộn" placement="right">
            <button onClick={stop(onZoomIn)} style={toolBtn(false)}>
              <ZoomInOutlined />
            </button>
          </Tooltip>
          <Tooltip title="Thu nhỏ" placement="right">
            <button onClick={stop(onZoomOut)} style={toolBtn(false)}>
              <ZoomOutOutlined />
            </button>
          </Tooltip>
          <Tooltip title="Zoom 1:1 (mỗi pixel ảnh = 1 pixel màn hình)" placement="right">
            <button onClick={stop(onZoomActualPixels)} style={{ ...toolBtn(false), fontSize: 10.5, fontWeight: 800 }}>
              1:1
            </button>
          </Tooltip>
          <div style={divider} />
          <Tooltip title={isExpanded ? 'Thu gọn khung nhìn' : 'Mở rộng toàn khung nhìn'} placement="right">
            <button onClick={stop(onToggleExpand)} style={toolBtn(isExpanded)}>
              {isExpanded ? <CompressOutlined /> : <ExpandOutlined />}
            </button>
          </Tooltip>
        </div>
      )}

      {/* Thanh công cụ phải: đo đạc */}
      {instancesCount > 0 && (
        <div style={{ ...toolbarBox, right: 26 }} onMouseDown={(e) => e.stopPropagation()}>
          <Tooltip title="Đo khoảng cách" placement="left">
            <button onClick={stop(() => setActiveTool(PACS_TOOLS.LENGTH))} style={toolBtn(activeTool === PACS_TOOLS.LENGTH, '#22c55e')}>
              <ColumnWidthOutlined />
            </button>
          </Tooltip>
          <Tooltip title="Đo góc (3 điểm)" placement="left">
            <button onClick={stop(() => setActiveTool(PACS_TOOLS.ANGLE))} style={toolBtn(activeTool === PACS_TOOLS.ANGLE, '#f59e0b')}>
              <ApartmentOutlined />
            </button>
          </Tooltip>
          <Tooltip title="ROI elip (diện tích, Mean/SD HU)" placement="left">
            <button onClick={stop(() => setActiveTool(PACS_TOOLS.ROI_ELLIPSE))} style={toolBtn(activeTool === PACS_TOOLS.ROI_ELLIPSE, '#38bdf8')}>
              <RadiusSettingOutlined />
            </button>
          </Tooltip>
          <Tooltip title="ROI chữ nhật" placement="left">
            <button onClick={stop(() => setActiveTool(PACS_TOOLS.ROI_RECT))} style={toolBtn(activeTool === PACS_TOOLS.ROI_RECT, '#c084fc')}>
              <BorderOutlined />
            </button>
          </Tooltip>
          <Tooltip title="Hoàn tác số đo cuối (Ctrl+Z)" placement="left">
            <button onClick={stop(onUndo)} style={toolBtn(false)}>
              <UndoOutlined />
            </button>
          </Tooltip>
          <div style={divider} />
          <Tooltip title="Chụp ảnh Key (Space)" placement="left">
            <button onClick={stop(onCaptureKeyImage)} style={{ ...toolBtn(false), color: '#4ade80' }}>
              <CameraOutlined />
            </button>
          </Tooltip>
        </div>
      )}

      {/* Thanh cuộn lát cắt (kéo được) */}
      {totalSlices > 1 && (
        <div
          ref={sliderTrackRef}
          onMouseDown={(e) => {
            e.stopPropagation();
            draggingSlider.current = true;
            seekSlider(e.clientY);
          }}
          style={{
            position: 'absolute',
            right: 6,
            top: 48,
            bottom: 48,
            width: 12,
            background: 'rgba(30, 41, 59, 0.55)',
            borderRadius: 6,
            cursor: 'pointer',
            zIndex: 15,
          }}
        >
          <Tooltip title={`Ảnh ${currentIndex + 1}/${totalSlices}`} placement="left" open={draggingSlider.current || undefined}>
            <div
              style={{
                position: 'absolute',
                left: -2,
                top: `calc(${sliderPercent}% - 9px)`,
                width: 16,
                height: 18,
                background: '#0ea5e9',
                borderRadius: 4,
                boxShadow: '0 0 6px rgba(14,165,233,0.7)',
              }}
            />
          </Tooltip>
        </div>
      )}

      {/* Trạng thái trống */}
      {!loading && instancesCount === 0 && (
        <div style={{ textAlign: 'center', color: '#94a3b8', padding: '0 16px' }}>
          <p style={{ fontSize: 15, marginBottom: 6, color: '#e2e8f0', fontWeight: 600 }}>
            {patientDiagnoseId ? 'Chưa có ảnh DICOM cho ca này' : 'Chế độ đọc PACS độc lập (không liên kết bệnh nhân)'}
          </p>
          <p style={{ fontSize: 12, marginBottom: 14, color: '#64748b' }}>
            {patientDiagnoseId
              ? 'Tải lên file .dcm hoặc .zip xuất từ máy chụp / PACS'
              : 'Chọn trực tiếp file .dcm / .dicom từ máy để xem và đo đạc'}
          </p>
          <Upload
            multiple
            showUploadList={false}
            beforeUpload={onUploadDicom}
            accept={patientDiagnoseId ? '.dcm,.dicom,.zip' : '.dcm,.dicom,.pdf,.png,.jpg,.jpeg,.mp4'}
          >
            <Button type="primary" icon={<UploadOutlined />}>
              {patientDiagnoseId ? 'Tải lên file DICOM (.dcm / .zip)' : 'Mở file DICOM từ máy (.dcm)'}
            </Button>
          </Upload>
        </div>
      )}
    </div>
  );
}
