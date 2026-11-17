import React, { useMemo, useRef, useEffect, useState } from 'react';
import { Modal, Button, Tag, Row, Col, Space, message } from 'antd';
import { DotChartOutlined, CheckCircleOutlined, ReloadOutlined } from '@ant-design/icons';

/**
 * Tính toán histogram và thông số thống kê pixel (HU trên CT hoặc giá trị mức xám)
 */
function computeHistogram(rawPixels, meta, binCount = 128) {
  if (!rawPixels || !rawPixels.length) return null;
  const slope = meta?.rescaleSlope || 1;
  const intercept = meta?.rescaleIntercept || 0;

  // Lấy mẫu nếu ảnh quá lớn để mượt mà (tối đa ~100k điểm)
  const step = Math.max(1, Math.floor(rawPixels.length / 120000));
  let min = Infinity;
  let max = -Infinity;
  let sum = 0;
  let sampleCount = 0;

  for (let i = 0; i < rawPixels.length; i += step) {
    const val = rawPixels[i] * slope + intercept;
    if (val < min) min = val;
    if (val > max) max = val;
    sum += val;
    sampleCount++;
  }

  if (sampleCount === 0 || min >= max) return null;

  const mean = sum / sampleCount;

  // Tính SD và thu thập bins
  let varSum = 0;
  const bins = new Uint32Array(binCount);
  const range = max - min;
  const samples = [];

  for (let i = 0; i < rawPixels.length; i += step) {
    const val = rawPixels[i] * slope + intercept;
    varSum += (val - mean) * (val - mean);
    samples.push(val);
    const b = Math.min(binCount - 1, Math.max(0, Math.floor(((val - min) / range) * binCount)));
    bins[b]++;
  }

  const sd = Math.sqrt(varSum / sampleCount);

  // Tính Median và Percentiles (P5, P95)
  samples.sort((a, b) => a - b);
  const median = samples[Math.floor(samples.length / 2)];
  const p5 = samples[Math.floor(samples.length * 0.05)];
  const p95 = samples[Math.floor(samples.length * 0.95)];

  // Tìm đỉnh histogram (max count) để chuẩn hóa vẽ
  let maxBinCount = 0;
  for (let i = 0; i < binCount; i++) {
    if (bins[i] > maxBinCount) maxBinCount = bins[i];
  }

  return { min, max, mean, median, sd, p5, p95, bins, binCount, maxBinCount, sampleCount };
}

export default function PacsHistogramModal({
  open,
  onClose,
  rawPixels,
  meta,
  windowCenter,
  windowWidth,
  onApplyWwWl,
}) {
  const canvasRef = useRef(null);
  const unit = meta?.modality === 'CT' ? 'HU' : 'px';

  const stats = useMemo(() => {
    if (!open || !rawPixels) return null;
    return computeHistogram(rawPixels, meta, 128);
  }, [open, rawPixels, meta]);

  // Vẽ biểu đồ histogram lên canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !stats) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Nền tối y tế
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, w, h);

    // Lưới trục tọa độ
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    for (let i = 1; i <= 4; i++) {
      const y = (h / 5) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Vẽ vùng cửa sổ hiện tại (Window Center / Width)
    if (windowCenter !== undefined && windowWidth !== undefined && stats.max > stats.min) {
      const range = stats.max - stats.min;
      const wlMin = windowCenter - windowWidth / 2;
      const wlMax = windowCenter + windowWidth / 2;
      const x1 = Math.max(0, Math.min(w, ((wlMin - stats.min) / range) * w));
      const x2 = Math.max(0, Math.min(w, ((wlMax - stats.min) / range) * w));

      ctx.fillStyle = 'rgba(56, 189, 248, 0.12)';
      ctx.fillRect(x1, 0, x2 - x1, h);

      ctx.strokeStyle = '#38bdf8';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(x1, 0);
      ctx.lineTo(x1, h);
      ctx.moveTo(x2, 0);
      ctx.lineTo(x2, h);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Vẽ các cột histogram
    const { bins, binCount, maxBinCount } = stats;
    const barW = w / binCount;

    const grad = ctx.createLinearGradient(0, h, 0, 0);
    grad.addColorStop(0, '#0284c7');
    grad.addColorStop(0.7, '#38bdf8');
    grad.addColorStop(1, '#a5f3fc');

    ctx.fillStyle = grad;
    for (let i = 0; i < binCount; i++) {
      const barH = (bins[i] / (maxBinCount || 1)) * (h - 10);
      ctx.fillRect(i * barW, h - barH, Math.max(1, barW - 0.5), barH);
    }
  }, [stats, windowCenter, windowWidth]);

  const handleApplyOptimal = () => {
    if (!stats || !onApplyWwWl) return;
    const width = Math.round(stats.p95 - stats.p5);
    const center = Math.round((stats.p95 + stats.p5) / 2);
    onApplyWwWl({ width: Math.max(1, width), center });
    message.success(`Đã áp dụng cửa sổ tối ưu: W ${width} / L ${center} ${unit}`);
    onClose?.();
  };

  const handleApplyFullRange = () => {
    if (!stats || !onApplyWwWl) return;
    const width = Math.round(stats.max - stats.min);
    const center = Math.round((stats.max + stats.min) / 2);
    onApplyWwWl({ width: Math.max(1, width), center });
    message.success(`Đã áp dụng toàn dải: W ${width} / L ${center} ${unit}`);
    onClose?.();
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={640}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#0284c7' }}>
          <DotChartOutlined style={{ fontSize: 18 }} />
          <span>Biểu đồ phân bố tần số điểm ảnh (DICOM Histogram)</span>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Canvas vẽ đồ thị */}
        <div style={{ position: 'relative', width: '100%', height: 200, borderRadius: 6, overflow: 'hidden', border: '1px solid #334155' }}>
          <canvas ref={canvasRef} width={600} height={200} style={{ width: '100%', height: '100%', display: 'block' }} />
          {stats && (
            <div style={{ position: 'absolute', bottom: 4, left: 8, right: 8, display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#94a3b8', pointerEvents: 'none' }}>
              <span>{Math.round(stats.min)} {unit}</span>
              <span style={{ color: '#38bdf8' }}>Cửa sổ hiện tại (W {windowWidth} / L {windowCenter})</span>
              <span>{Math.round(stats.max)} {unit}</span>
            </div>
          )}
        </div>

        {/* Thông số thống kê */}
        {stats ? (
          <Row gutter={[10, 10]}>
            <Col span={8}>
              <div style={{ background: '#f8fafc', padding: '8px 10px', borderRadius: 6, border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: 11, color: '#64748b' }}>Thấp nhất (Min)</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>{Math.round(stats.min)} {unit}</div>
              </div>
            </Col>
            <Col span={8}>
              <div style={{ background: '#f8fafc', padding: '8px 10px', borderRadius: 6, border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: 11, color: '#64748b' }}>Cao nhất (Max)</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>{Math.round(stats.max)} {unit}</div>
              </div>
            </Col>
            <Col span={8}>
              <div style={{ background: '#f8fafc', padding: '8px 10px', borderRadius: 6, border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: 11, color: '#64748b' }}>Trung bình (Mean)</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#0284c7' }}>{stats.mean.toFixed(1)} {unit}</div>
              </div>
            </Col>
            <Col span={8}>
              <div style={{ background: '#f8fafc', padding: '8px 10px', borderRadius: 6, border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: 11, color: '#64748b' }}>Trung vị (Median)</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>{Math.round(stats.median)} {unit}</div>
              </div>
            </Col>
            <Col span={8}>
              <div style={{ background: '#f8fafc', padding: '8px 10px', borderRadius: 6, border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: 11, color: '#64748b' }}>Độ lệch chuẩn (SD)</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#6366f1' }}>±{stats.sd.toFixed(1)}</div>
              </div>
            </Col>
            <Col span={8}>
              <div style={{ background: '#f8fafc', padding: '8px 10px', borderRadius: 6, border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: 11, color: '#64748b' }}>Dải 5% - 95%</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{Math.round(stats.p5)} → {Math.round(stats.p95)}</div>
              </div>
            </Col>
          </Row>
        ) : (
          <div style={{ textAlign: 'center', padding: '20px 0', color: '#94a3b8' }}>
            Đang tải dữ liệu điểm ảnh lát cắt...
          </div>
        )}

        {/* Thao tác áp dụng cửa sổ */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8, borderTop: '1px solid #f1f5f9', paddingTop: 12 }}>
          <Button onClick={onClose}>Đóng</Button>
          <Button icon={<ReloadOutlined />} onClick={handleApplyFullRange} disabled={!stats}>
            Toàn dải Min/Max
          </Button>
          <Button type="primary" icon={<CheckCircleOutlined />} onClick={handleApplyOptimal} disabled={!stats}>
            Áp dụng cửa sổ tối ưu (P5 - P95)
          </Button>
        </div>
      </div>
    </Modal>
  );
}
