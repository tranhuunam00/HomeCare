import React, { useRef } from 'react';
import { Tooltip, Spin, Upload, Button } from 'antd';
import {
  UploadOutlined,
  LineOutlined,
  SunOutlined,
  CameraOutlined,
  ReloadOutlined,
  AimOutlined,
  AppstoreOutlined,
  LinkOutlined,
  DisconnectOutlined,
  ExpandOutlined,
  CompressOutlined,
  SlidersOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
} from '@ant-design/icons';
import PacsCornerHud from './PacsCornerHud';
import { PACS_TOOLS } from '../constants/pacs.constants';

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
  onWheel,
  onReset,
  onZoomIn,
  onZoomOut,
  onDoubleClickZoom,
  isExpanded = false,
  onToggleExpand,
  onCaptureKeyImage,
  onUploadDicom,
  currentMeta,
  study,
  patientDiagnoseId,
  seriesIndex = 1,
  currentIndex,
  setCurrentIndex,
  totalSlices = 1,
  colorLut,
  setColorLut,
  windowWidth,
  windowCenter,
  instancesCount = 0,
}) {
  const isActive = activeViewport === viewportIndex;
  const sliderTrackRef = useRef(null);

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
        return 'all-scroll';
      case PACS_TOOLS.ZOOM:
        return 'ns-resize';
      default:
        return 'default';
    }
  };

  // Vertical Cine Slider Drag / Click
  const handleSliderClick = (e) => {
    if (totalSlices <= 1 || !sliderTrackRef.current) return;
    const rect = sliderTrackRef.current.getBoundingClientRect();
    const offsetY = Math.max(0, Math.min(rect.height, e.clientY - rect.top));
    const ratio = offsetY / rect.height;
    const nextIndex = Math.round(ratio * (totalSlices - 1));
    setCurrentIndex(nextIndex);
  };

  const sliderPercent = totalSlices > 1 ? (currentIndex / (totalSlices - 1)) * 100 : 0;

  return (
    <div
      onClick={() => setActiveViewport(viewportIndex)}
      onDoubleClick={onDoubleClickZoom}
      onWheel={onWheel}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onContextMenu={(e) => e.preventDefault()}
      style={{
        position: 'relative',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000000',
        overflow: 'hidden',
        border: isActive ? '1.5px solid #f59e0b' : '1.5px solid #1e293b',
        cursor: getCursor(),
        userSelect: 'none',
      }}
    >
      {loading && (
        <div style={{ position: 'absolute', zIndex: 30 }}>
          <Spin size="large" />
        </div>
      )}

      {/* Top Clinical Exam Banner Bar (Like in Image 1) */}
      {currentMeta && (
        <div
          style={{
            position: 'absolute',
            top: 6,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            border: '1px solid rgba(51, 65, 85, 0.5)',
            borderRadius: 4,
            padding: '2px 14px',
            fontSize: '11px',
            fontFamily: 'monospace',
            color: '#cbd5e1',
            pointerEvents: 'none',
            zIndex: 15,
            whiteSpace: 'nowrap',
          }}
        >
          {currentMeta.modality && <span>{currentMeta.modality}</span>}
          {currentMeta.seriesDescription && <span>{currentMeta.seriesDescription}</span>}
          <span>{currentMeta.columns || 0}×{currentMeta.rows || 0}</span>
          <span>Zoom {Math.round((zoom || 1) * 100)}%</span>
        </div>
      )}

      {/* Canvas Transformation Wrapper */}
      <div
        style={{
          position: 'relative',
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom}) rotate(${rotation}deg) scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1})`,
          transformOrigin: 'center center',
          transition: isInteracting?.current ? 'none' : 'transform 0.05s ease-out',
        }}
      >
        {/* Base DICOM Image Canvas */}
        <canvas
          ref={imageCanvasRef}
          style={{
            display: 'block',
            maxWidth: '85vh',
            maxHeight: '85vh',
            imageRendering: 'pixelated',
          }}
        />

        {/* Overlay Annotations Canvas */}
        <canvas
          ref={annotationCanvasRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
          }}
        />
      </div>

      {/* Left Floating Micro-Tools (Crosshair, Contrast, Fullscreen) */}
      <div
        style={{
          position: 'absolute',
          left: 8,
          top: '50%',
          transform: 'translateY(-50%)',
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          backgroundColor: 'rgba(15, 23, 42, 0.8)',
          padding: '4px',
          borderRadius: 4,
          border: '1px solid rgba(51, 65, 85, 0.6)',
          zIndex: 15,
        }}
      >
        <Tooltip title="Tâm ngắm (Crosshair)" placement="right">
          <button
            onClick={() => setActiveTool(PACS_TOOLS.PAN)}
            style={{
              background: 'none',
              border: 'none',
              color: activeTool === PACS_TOOLS.PAN ? '#38bdf8' : '#94a3b8',
              cursor: 'pointer',
              padding: 4,
            }}
          >
            <AimOutlined />
          </button>
        </Tooltip>

        <Tooltip title="Cửa sổ tương phản (WW/WL)" placement="right">
          <button
            onClick={() => setActiveTool(PACS_TOOLS.WW_WL)}
            style={{
              background: activeTool === PACS_TOOLS.WW_WL ? '#0284c7' : 'none',
              border: 'none',
              borderRadius: 3,
              color: activeTool === PACS_TOOLS.WW_WL ? '#ffffff' : '#94a3b8',
              cursor: 'pointer',
              padding: 4,
            }}
          >
            <SlidersOutlined />
          </button>
        </Tooltip>

        <Tooltip title="Phóng to (+)" placement="right">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onZoomIn?.();
            }}
            style={{
              background: 'none',
              border: 'none',
              color: '#38bdf8',
              cursor: 'pointer',
              padding: 4,
            }}
          >
            <ZoomInOutlined />
          </button>
        </Tooltip>

        <Tooltip title="Thu nhỏ (-)" placement="right">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onZoomOut?.();
            }}
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: 4,
            }}
          >
            <ZoomOutOutlined />
          </button>
        </Tooltip>

        <Tooltip title={isExpanded ? 'Thu gọn khung nhìn' : 'Mở rộng toàn khung nhìn'} placement="right">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand?.();
            }}
            style={{
              background: isExpanded ? '#0284c7' : 'none',
              border: 'none',
              borderRadius: 3,
              color: isExpanded ? '#ffffff' : '#94a3b8',
              cursor: 'pointer',
              padding: 4,
            }}
          >
            {isExpanded ? <CompressOutlined /> : <ExpandOutlined />}
          </button>
        </Tooltip>
      </div>

      {/* Right Floating Micro-Tools */}
      <div
        style={{
          position: 'absolute',
          right: 28,
          top: '50%',
          transform: 'translateY(-50%)',
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          backgroundColor: 'rgba(15, 23, 42, 0.8)',
          padding: '4px',
          borderRadius: 4,
          border: '1px solid rgba(51, 65, 85, 0.6)',
          zIndex: 15,
        }}
      >
        <Tooltip title="Đo khoảng cách (Line mm)" placement="left">
          <button
            onClick={() => setActiveTool(PACS_TOOLS.LENGTH)}
            style={{
              background: 'none',
              border: 'none',
              color: activeTool === PACS_TOOLS.LENGTH ? '#22c55e' : '#94a3b8',
              cursor: 'pointer',
              padding: 4,
            }}
          >
            <LineOutlined />
          </button>
        </Tooltip>

        <Tooltip title="Độ tương phản (WW/WL)" placement="left">
          <button
            onClick={() => setActiveTool(PACS_TOOLS.WW_WL)}
            style={{
              background: 'none',
              border: 'none',
              color: activeTool === PACS_TOOLS.WW_WL ? '#38bdf8' : '#94a3b8',
              cursor: 'pointer',
              padding: 4,
            }}
          >
            <SunOutlined />
          </button>
        </Tooltip>

        <Tooltip title="Đồng bộ khung nhìn (Sync)" placement="left">
          <button
            style={{
              background: 'none',
              border: 'none',
              color: '#0284c7',
              cursor: 'pointer',
              padding: 4,
            }}
          >
            <LinkOutlined />
          </button>
        </Tooltip>

        <Tooltip title="Chụp ảnh Key" placement="left">
          <button
            onClick={onCaptureKeyImage}
            style={{
              background: 'none',
              border: 'none',
              color: '#4ade80',
              cursor: 'pointer',
              padding: 4,
            }}
          >
            <CameraOutlined />
          </button>
        </Tooltip>
      </div>

      {/* Vertical Cine Slider on the Right Border (As in Image 1) */}
      {totalSlices > 1 && (
        <div
          ref={sliderTrackRef}
          onClick={handleSliderClick}
          style={{
            position: 'absolute',
            right: 6,
            top: 60,
            bottom: 60,
            width: 14,
            backgroundColor: 'rgba(30, 41, 59, 0.6)',
            borderRadius: 7,
            cursor: 'pointer',
            zIndex: 15,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          {/* Slider Thumb with ↕ Arrow */}
          <div
            style={{
              position: 'absolute',
              top: `calc(${sliderPercent}% - 12px)`,
              width: 18,
              height: 24,
              backgroundColor: '#0284c7',
              borderRadius: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontSize: '12px',
              fontWeight: '900',
              boxShadow: '0 0 6px rgba(2, 132, 199, 0.8)',
              cursor: 'ns-resize',
              userSelect: 'none',
            }}
          >
            ↕
          </div>
        </div>
      )}

      {/* 4-Corner Clinical Monospace HUD Overlays */}
      <PacsCornerHud
        currentMeta={currentMeta}
        study={study}
        patientDiagnoseId={patientDiagnoseId}
        seriesIndex={seriesIndex}
        currentIndex={currentIndex}
        totalSlices={totalSlices}
        colorLut={colorLut}
        setColorLut={setColorLut}
        zoom={zoom}
        windowWidth={windowWidth}
        windowCenter={windowCenter}
      />

      {/* Scale Bar Indicator at bottom left (As in Image 1: 0/1 Eh:A5 Cm:1) */}
      <div
        style={{
          position: 'absolute',
          bottom: 28,
          left: 10,
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          fontSize: '10px',
          fontFamily: 'monospace',
          color: '#cbd5e1',
          pointerEvents: 'none',
          textShadow: '1px 1px 2px #000',
        }}
      >
        <div style={{ display: 'flex', gap: 2 }}>
          <div style={{ width: 4, height: 4, backgroundColor: '#ffffff' }} />
          <div style={{ width: 4, height: 4, backgroundColor: '#ffffff' }} />
          <div style={{ width: 4, height: 4, backgroundColor: '#ffffff' }} />
          <div style={{ width: 4, height: 4, backgroundColor: '#ffffff' }} />
        </div>
        <span>0/1 Eh:A5 Cm:1</span>
      </div>

      {/* Empty State */}
      {!loading && instancesCount === 0 && (
        <div style={{ textAlign: 'center', color: '#94a3b8', padding: '0 16px' }}>
          <p style={{ fontSize: '15px', marginBottom: 6, color: '#e2e8f0', fontWeight: 600 }}>
            {patientDiagnoseId
              ? 'Chưa có file ảnh DICOM cho ca này'
              : 'Chế độ đọc PACS độc lập (Không liên kết bệnh nhân)'}
          </p>
          {!patientDiagnoseId && (
            <p style={{ fontSize: '12px', marginBottom: 14, color: '#64748b' }}>
              Chọn trực tiếp nhiều file .dcm / .dicom từ máy để xem và đo đạc ngay
            </p>
          )}
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
