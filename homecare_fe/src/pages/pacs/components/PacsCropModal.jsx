import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Modal, Input, Button, Tag, Space, message } from 'antd';
import {
  ScissorOutlined,
  DownloadOutlined,
  SendOutlined,
  ReloadOutlined,
  CloseOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';

/**
 * Modal Cắt vùng ảnh (Crop ROI Snapshot) chuyên sâu lâm sàng.
 * Cho phép bác sĩ chọn chính xác vùng tổn thương, xem trước tức thời,
 * gắn watermark chuẩn y tế và lưu thẳng vào bệnh án & thư viện ảnh key.
 */
export default function PacsCropModal({
  open,
  onClose,
  imageCanvas,
  annotationCanvas,
  metadata = {},
  currentIndex = 0,
  totalSlices = 1,
  windowCenter = 128,
  windowWidth = 255,
  pixelSpacing = null,
  onSaveCrop,
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const previewCanvasRef = useRef(null);

  // Vùng chọn trên toạ độ gốc của ảnh DICOM (canvas pixels)
  const [cropBox, setCropBox] = useState(null);
  const [aspectRatio, setAspectRatio] = useState('free'); // 'free' | '1:1' | '4:3' | '16:9'
  const [caption, setCaption] = useState('');
  const [dragState, setDragState] = useState(null); // { type: 'draw'|'move'|'nw'|'ne'|'se'|'sw', startX, startY, origBox }

  // Offscreen composite canvas lưu toàn bộ ảnh + số đo
  const fullCanvasRef = useRef(null);

  // Khởi tạo composite canvas và crop box mặc định (vùng trung tâm 50%)
  useEffect(() => {
    if (!open || !imageCanvas) return;

    const w = imageCanvas.width || 512;
    const h = imageCanvas.height || 512;

    const off = document.createElement('canvas');
    off.width = w;
    off.height = h;
    const ctx = off.getContext('2d');
    ctx.drawImage(imageCanvas, 0, 0);
    if (annotationCanvas) {
      ctx.drawImage(annotationCanvas, 0, 0);
    }
    fullCanvasRef.current = off;

    // Khởi tạo crop box mặc định ở trung tâm (50% kích thước)
    const initW = Math.round(w * 0.5);
    const initH = Math.round(h * 0.5);
    const initX = Math.round((w - initW) / 2);
    const initY = Math.round((h - initH) / 2);

    const initialBox = { x: initX, y: initY, width: initW, height: initH };
    setCropBox(initialBox);

    // Tạo caption gợi ý
    const mmW = pixelSpacing ? (initW * pixelSpacing[1]).toFixed(1) + 'mm' : `${initW}px`;
    const mmH = pixelSpacing ? (initH * pixelSpacing[0]).toFixed(1) + 'mm' : `${initH}px`;
    setCaption(`Ảnh cắt ROI lát cắt #${currentIndex + 1} (${mmW} × ${mmH})`);
  }, [open, imageCanvas, annotationCanvas, currentIndex, pixelSpacing]);

  // Vẽ tương tác lên canvas hiển thị
  const drawInteraction = useCallback(() => {
    const canvas = canvasRef.current;
    const full = fullCanvasRef.current;
    if (!canvas || !full || !cropBox) return;

    const ctx = canvas.getContext('2d');
    const cw = canvas.width;
    const ch = canvas.height;

    // Xoá và vẽ lại ảnh gốc
    ctx.clearRect(0, 0, cw, 0);
    ctx.drawImage(full, 0, 0, cw, ch);

    // Tỉ lệ scale giữa hiển thị và ảnh thật
    const scaleX = cw / full.width;
    const scaleY = ch / full.height;

    const sx = cropBox.x * scaleX;
    const sy = cropBox.y * scaleY;
    const sw = cropBox.width * scaleX;
    const sh = cropBox.height * scaleY;

    // 1. Phủ mặt nạ tối bên ngoài vùng chọn
    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    // Trên
    ctx.fillRect(0, 0, cw, sy);
    // Dưới
    ctx.fillRect(0, sy + sh, cw, ch - (sy + sh));
    // Trái
    ctx.fillRect(0, sy, sx, sh);
    // Phải
    ctx.fillRect(sx + sw, sy, cw - (sx + sw), sh);

    // 2. Viền khung cắt ROI (màu cam vàng chuẩn y tế)
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.strokeRect(sx, sy, sw, sh);
    ctx.setLineDash([]);

    // 3. Đường lưới 1/3 (Rule of thirds)
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(sx + sw / 3, sy);
    ctx.lineTo(sx + sw / 3, sy + sh);
    ctx.moveTo(sx + (2 * sw) / 3, sy);
    ctx.lineTo(sx + (2 * sw) / 3, sy + sh);
    ctx.moveTo(sx, sy + sh / 3);
    ctx.lineTo(sx + sw, sy + sh / 3);
    ctx.moveTo(sx, sy + (2 * sh) / 3);
    ctx.lineTo(sx + sw, sy + (2 * sh) / 3);
    ctx.stroke();

    // 4. Các điểm kéo góc (Handles)
    const handleSize = 8;
    ctx.fillStyle = '#f59e0b';
    const corners = [
      [sx, sy], // NW
      [sx + sw, sy], // NE
      [sx + sw, sy + sh], // SE
      [sx, sy + sh], // SW
    ];
    corners.forEach(([cx, cy]) => {
      ctx.fillRect(cx - handleSize / 2, cy - handleSize / 2, handleSize, handleSize);
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(cx - handleSize / 2, cy - handleSize / 2, handleSize, handleSize);
    });

    // 5. Cập nhật preview canvas
    const prevCanvas = previewCanvasRef.current;
    if (prevCanvas) {
      prevCanvas.width = Math.max(1, cropBox.width);
      prevCanvas.height = Math.max(1, cropBox.height);
      const pctx = prevCanvas.getContext('2d');
      pctx.drawImage(
        full,
        cropBox.x,
        cropBox.y,
        cropBox.width,
        cropBox.height,
        0,
        0,
        cropBox.width,
        cropBox.height
      );
    }
  }, [cropBox]);

  useEffect(() => {
    drawInteraction();
  }, [drawInteraction]);

  // Xử lý kéo thả chuột trên Canvas
  const handleMouseDown = (e) => {
    const canvas = canvasRef.current;
    const full = fullCanvasRef.current;
    if (!canvas || !full || !cropBox) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * full.width;
    const mouseY = ((e.clientY - rect.top) / rect.height) * full.height;

    // Kiểm tra chạm vào 4 góc
    const handleThreshold = (16 / rect.width) * full.width;
    const { x, y, width: w, height: h } = cropBox;

    let type = 'draw';
    if (Math.abs(mouseX - x) < handleThreshold && Math.abs(mouseY - y) < handleThreshold) {
      type = 'nw';
    } else if (Math.abs(mouseX - (x + w)) < handleThreshold && Math.abs(mouseY - y) < handleThreshold) {
      type = 'ne';
    } else if (Math.abs(mouseX - (x + w)) < handleThreshold && Math.abs(mouseY - (y + h)) < handleThreshold) {
      type = 'se';
    } else if (Math.abs(mouseX - x) < handleThreshold && Math.abs(mouseY - (y + h)) < handleThreshold) {
      type = 'sw';
    } else if (mouseX >= x && mouseX <= x + w && mouseY >= y && mouseY <= y + h) {
      type = 'move';
    }

    setDragState({
      type,
      startX: mouseX,
      startY: mouseY,
      origBox: { ...cropBox },
    });
  };

  const handleMouseMove = (e) => {
    if (!dragState) return;
    const canvas = canvasRef.current;
    const full = fullCanvasRef.current;
    if (!canvas || !full) return;

    const rect = canvas.getBoundingClientRect();
    const curX = Math.max(0, Math.min(full.width, ((e.clientX - rect.left) / rect.width) * full.width));
    const curY = Math.max(0, Math.min(full.height, ((e.clientY - rect.top) / rect.height) * full.height));

    const dx = curX - dragState.startX;
    const dy = curY - dragState.startY;
    const { origBox } = dragState;

    let newBox = { ...origBox };

    if (dragState.type === 'move') {
      const maxX = full.width - origBox.width;
      const maxY = full.height - origBox.height;
      newBox.x = Math.max(0, Math.min(maxX, Math.round(origBox.x + dx)));
      newBox.y = Math.max(0, Math.min(maxY, Math.round(origBox.y + dy)));
    } else if (dragState.type === 'draw') {
      const left = Math.min(dragState.startX, curX);
      const top = Math.min(dragState.startY, curY);
      let w = Math.abs(curX - dragState.startX);
      let h = Math.abs(curY - dragState.startY);

      if (aspectRatio === '1:1') {
        const s = Math.max(w, h);
        w = s;
        h = s;
      } else if (aspectRatio === '4:3') {
        h = Math.round((w * 3) / 4);
      } else if (aspectRatio === '16:9') {
        h = Math.round((w * 9) / 16);
      }

      newBox = {
        x: Math.round(left),
        y: Math.round(top),
        width: Math.max(20, Math.min(full.width - left, Math.round(w))),
        height: Math.max(20, Math.min(full.height - top, Math.round(h))),
      };
    } else if (dragState.type === 'se') {
      let w = origBox.width + dx;
      let h = origBox.height + dy;
      if (aspectRatio === '1:1') {
        const s = Math.max(w, h);
        w = s;
        h = s;
      }
      newBox.width = Math.max(20, Math.min(full.width - origBox.x, Math.round(w)));
      newBox.height = Math.max(20, Math.min(full.height - origBox.y, Math.round(h)));
    } else if (dragState.type === 'sw') {
      const newX = Math.max(0, origBox.x + dx);
      newBox.width = Math.max(20, Math.round(origBox.x + origBox.width - newX));
      newBox.x = Math.round(origBox.x + origBox.width - newBox.width);
      newBox.height = Math.max(20, Math.min(full.height - origBox.y, Math.round(origBox.height + dy)));
    } else if (dragState.type === 'ne') {
      newBox.width = Math.max(20, Math.min(full.width - origBox.x, Math.round(origBox.width + dx)));
      const newY = Math.max(0, origBox.y + dy);
      newBox.height = Math.max(20, Math.round(origBox.y + origBox.height - newY));
      newBox.y = Math.round(origBox.y + origBox.height - newBox.height);
    } else if (dragState.type === 'nw') {
      const newX = Math.max(0, origBox.x + dx);
      const newY = Math.max(0, origBox.y + dy);
      newBox.width = Math.max(20, Math.round(origBox.x + origBox.width - newX));
      newBox.height = Math.max(20, Math.round(origBox.y + origBox.height - newY));
      newBox.x = Math.round(origBox.x + origBox.width - newBox.width);
      newBox.y = Math.round(origBox.y + origBox.height - newBox.height);
    }

    setCropBox(newBox);
  };

  const handleMouseUp = () => {
    if (dragState && cropBox) {
      const mmW = pixelSpacing ? (cropBox.width * pixelSpacing[1]).toFixed(1) + 'mm' : `${cropBox.width}px`;
      const mmH = pixelSpacing ? (cropBox.height * pixelSpacing[0]).toFixed(1) + 'mm' : `${cropBox.height}px`;
      setCaption(`Ảnh cắt ROI lát cắt #${currentIndex + 1} (${mmW} × ${mmH})`);
    }
    setDragState(null);
  };

  // Áp dụng tỉ lệ khung hình
  const applyRatio = (ratio) => {
    setAspectRatio(ratio);
    if (!cropBox || !fullCanvasRef.current) return;
    const full = fullCanvasRef.current;

    if (ratio === 'full') {
      setCropBox({ x: 0, y: 0, width: full.width, height: full.height });
      setAspectRatio('free');
      return;
    }

    let w = cropBox.width;
    let h = cropBox.height;
    if (ratio === '1:1') {
      const s = Math.min(w, h);
      w = s;
      h = s;
    } else if (ratio === '4:3') {
      h = Math.round((w * 3) / 4);
    } else if (ratio === '16:9') {
      h = Math.round((w * 9) / 16);
    }

    // Đảm bảo không tràn viền
    w = Math.min(w, full.width - cropBox.x);
    h = Math.min(h, full.height - cropBox.y);
    setCropBox((prev) => ({ ...prev, width: w, height: h }));
  };

  // Tạo ảnh cắt chất lượng cao với HUD Watermark
  const generateCroppedSnapshot = () => {
    const full = fullCanvasRef.current;
    if (!full || !cropBox) return null;

    const out = document.createElement('canvas');
    out.width = cropBox.width;
    out.height = cropBox.height;
    const ctx = out.getContext('2d');

    // 1. Vẽ vùng đã cắt
    ctx.drawImage(
      full,
      cropBox.x,
      cropBox.y,
      cropBox.width,
      cropBox.height,
      0,
      0,
      cropBox.width,
      cropBox.height
    );

    // 2. Ghi Watermark y tế sắc nét
    ctx.save();
    ctx.fillStyle = '#22c55e';
    ctx.font = 'bold 13px monospace, sans-serif';
    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 4;

    const pName = metadata.patientName || '';
    const pid = metadata.patientId || '';
    if (pName || pid) {
      ctx.fillText(`${pName} | PID: ${pid}`, 12, 22);
    }

    const mmW = pixelSpacing ? (cropBox.width * pixelSpacing[1]).toFixed(1) + 'mm' : `${cropBox.width}px`;
    const mmH = pixelSpacing ? (cropBox.height * pixelSpacing[0]).toFixed(1) + 'mm' : `${cropBox.height}px`;
    const bottomText = `Lát #${currentIndex + 1}/${totalSlices} | ROI: ${mmW}×${mmH} | WW:${Math.round(windowWidth)} WL:${Math.round(windowCenter)}`;
    ctx.font = '11px monospace, sans-serif';
    ctx.fillText(bottomText, 12, cropBox.height - 12);
    ctx.restore();

    return out.toDataURL('image/png');
  };

  // Lưu vào Báo cáo & Thư viện
  const handleConfirmSave = () => {
    const dataUrl = generateCroppedSnapshot();
    if (!dataUrl) {
      message.error('Không thể tạo ảnh cắt ROI');
      return;
    }

    onSaveCrop?.({
      customDataUrl: dataUrl,
      customCaption: caption || `Ảnh cắt ROI lát cắt #${currentIndex + 1}`,
      isCrop: true,
    });
    onClose();
  };

  // Tải ảnh cắt PNG
  const handleDownloadPng = () => {
    const dataUrl = generateCroppedSnapshot();
    if (!dataUrl) return;

    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `PACS_Crop_Slice${currentIndex + 1}_${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    message.success('Đã tải ảnh cắt ROI thành công!');
  };

  const cropMmW = pixelSpacing && cropBox ? (cropBox.width * pixelSpacing[1]).toFixed(1) : null;
  const cropMmH = pixelSpacing && cropBox ? (cropBox.height * pixelSpacing[0]).toFixed(1) : null;

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={900}
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
          padding: '18px 22px',
          color: '#f8fafc',
        },
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #1e293b', paddingBottom: 14, marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              backgroundColor: 'rgba(245, 158, 11, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#f59e0b',
              fontSize: 18,
            }}
          >
            <ScissorOutlined />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: 8 }}>
              Cắt vùng ảnh (Crop ROI Snapshot)
              <Tag color="orange" style={{ margin: 0, fontWeight: 600 }}>
                Lát #{currentIndex + 1}/{totalSlices}
              </Tag>
            </div>
            <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
              Kéo thả chuột trên khung hình để chọn chính xác vùng tổn thương cần lưu vào bệnh án
            </div>
          </div>
        </div>

        {/* Preset Ratios */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, backgroundColor: '#090d16', padding: 3, borderRadius: 6, border: '1px solid #1e293b' }}>
          {[
            { key: 'free', label: 'Tự do' },
            { key: '1:1', label: '1:1' },
            { key: '4:3', label: '4:3' },
            { key: '16:9', label: '16:9' },
            { key: 'full', label: 'Toàn bộ' },
          ].map((r) => (
            <button
              key={r.key}
              onClick={() => applyRatio(r.key)}
              style={{
                border: 'none',
                padding: '4px 8px',
                borderRadius: 4,
                backgroundColor: aspectRatio === r.key ? '#f59e0b' : 'transparent',
                color: aspectRatio === r.key ? '#0f172a' : '#94a3b8',
                fontWeight: aspectRatio === r.key ? 700 : 500,
                fontSize: 11,
                cursor: 'pointer',
              }}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Workspace */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 16 }}>
        {/* Left: Interactive Canvas Viewport */}
        <div
          ref={containerRef}
          style={{
            position: 'relative',
            width: '100%',
            height: 440,
            backgroundColor: '#000',
            borderRadius: 8,
            border: '1px solid #334155',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            userSelect: 'none',
          }}
        >
          <canvas
            ref={canvasRef}
            width={imageCanvas?.width || 512}
            height={imageCanvas?.height || 512}
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain',
              cursor: dragState ? (dragState.type === 'move' ? 'grabbing' : 'crosshair') : 'crosshair',
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          />
        </div>

        {/* Right: Live Preview & Metadata */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Live Cropped Thumbnail Preview */}
          <div style={{ backgroundColor: '#131b2e', border: '1px solid #1e293b', borderRadius: 8, padding: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', marginBottom: 6, textTransform: 'uppercase' }}>
              Xem trước vùng cắt
            </div>
            <div
              style={{
                width: '100%',
                height: 150,
                backgroundColor: '#000',
                borderRadius: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                border: '1px solid #334155',
              }}
            >
              <canvas
                ref={previewCanvasRef}
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                }}
              />
            </div>
          </div>

          {/* Dimensions Stats */}
          <div style={{ backgroundColor: '#131b2e', border: '1px solid #1e293b', borderRadius: 8, padding: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', marginBottom: 6, textTransform: 'uppercase' }}>
              Thông số kích thước
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
                <span>Độ phân giải:</span>
                <span style={{ color: '#f8fafc', fontWeight: 600, fontFamily: 'monospace' }}>
                  {cropBox ? `${cropBox.width} × ${cropBox.height} px` : '--'}
                </span>
              </div>
              {cropMmW && cropMmH && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
                  <span>Kích thước thực:</span>
                  <span style={{ color: '#22c55e', fontWeight: 700, fontFamily: 'monospace' }}>
                    {cropMmW} × {cropMmH} mm
                  </span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
                <span>Tọa độ ROI:</span>
                <span style={{ color: '#94a3b8', fontFamily: 'monospace' }}>
                  {cropBox ? `X:${cropBox.x}, Y:${cropBox.y}` : '--'}
                </span>
              </div>
            </div>
          </div>

          {/* Caption Input */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', marginBottom: 4, textTransform: 'uppercase' }}>
              Mô tả vùng tổn thương
            </div>
            <Input.TextArea
              rows={3}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Nhập ghi chú chẩn đoán (ví dụ: Nốt mờ thùy trên phổi phải kích thước 12x8mm)..."
              style={{
                backgroundColor: '#090d16',
                borderColor: '#334155',
                color: '#f8fafc',
                fontSize: 12,
                borderRadius: 6,
                resize: 'none',
              }}
            />
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #1e293b', paddingTop: 14, marginTop: 14 }}>
        <button
          onClick={handleDownloadPng}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '7px 14px',
            borderRadius: 6,
            backgroundColor: '#1e293b',
            border: '1px solid #334155',
            color: '#38bdf8',
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <DownloadOutlined /> Tải ảnh cắt PNG
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={onClose}
            style={{
              padding: '7px 16px',
              borderRadius: 6,
              backgroundColor: 'transparent',
              border: '1px solid #334155',
              color: '#94a3b8',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Hủy
          </button>
          <button
            onClick={handleConfirmSave}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '7px 18px',
              borderRadius: 6,
              backgroundColor: '#0284c7',
              border: 'none',
              color: '#fff',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(2, 132, 199, 0.4)',
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#0369a1')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#0284c7')}
          >
            <CheckCircleOutlined /> Lưu vào Báo cáo & Thư viện
          </button>
        </div>
      </div>
    </Modal>
  );
}
