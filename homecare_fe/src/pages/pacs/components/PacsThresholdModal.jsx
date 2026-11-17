import React, { useState } from 'react';
import { Modal, Button, Radio, Slider, Space, Tag, message } from 'antd';
import { BgColorsOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';

export const THRESHOLD_PRESETS = [
  {
    key: 'none',
    label: 'Tắt cắt ngưỡng (Hiển thị gốc)',
    desc: 'Không tô màu nổi bật',
    colorHex: '#94a3b8',
    colorRgb: null,
    min: 0,
    max: 0,
  },
  {
    key: 'hemorrhage',
    label: 'Xuất huyết não / Máu tụ cấp',
    desc: 'Dải tỷ trọng máu tụ nội sọ (55 – 85 HU)',
    colorHex: '#ef4444',
    colorRgb: [239, 68, 68],
    min: 55,
    max: 85,
  },
  {
    key: 'bone',
    label: 'Xương & Vôi hóa',
    desc: 'Tỷ trọng cấu trúc xương / canxi hóa (> 300 HU)',
    colorHex: '#eab308',
    colorRgb: [234, 179, 8],
    min: 300,
    max: 3000,
  },
  {
    key: 'contrast',
    label: 'Mạch máu ngấm thuốc cản quang',
    desc: 'Vùng lòng mạch thuốc cản quang CTA/CTV (> 160 HU)',
    colorHex: '#f97316',
    colorRgb: [249, 115, 22],
    min: 160,
    max: 600,
  },
  {
    key: 'soft_tissue',
    label: 'Mô mềm / Khối u',
    desc: 'Tổ chức mô mềm gan, cơ, khối u (20 – 55 HU)',
    colorHex: '#a855f7',
    colorRgb: [168, 85, 247],
    min: 20,
    max: 55,
  },
  {
    key: 'lung',
    label: 'Nhu mô phổi & Khí',
    desc: 'Khí tự do / Nhu mô phế nang (< -500 HU)',
    colorHex: '#06b6d4',
    colorRgb: [6, 182, 212],
    min: -1000,
    max: -500,
  },
];

export default function PacsThresholdModal({
  open,
  onClose,
  activeThreshold,
  onSelectThreshold,
}) {
  const currentKey = activeThreshold?.key || 'none';
  const [selectedKey, setSelectedKey] = useState(currentKey);

  const handleApply = (key) => {
    setSelectedKey(key);
    const item = THRESHOLD_PRESETS.find((p) => p.key === key);
    if (!item || item.key === 'none') {
      onSelectThreshold?.(null);
      message.info('Đã tắt cắt ngưỡng tô màu');
    } else {
      onSelectThreshold?.({
        key: item.key,
        name: item.label,
        min: item.min,
        max: item.max,
        color: item.colorRgb,
        colorHex: item.colorHex,
      });
      message.success(`Đã áp dụng cắt ngưỡng: ${item.label} (${item.min} – ${item.max} HU)`);
    }
    onClose?.();
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={520}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#059669' }}>
          <BgColorsOutlined style={{ fontSize: 18 }} />
          <span>Cắt ngưỡng mật độ & Tô màu tổn thương (Threshold Tint)</span>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
        <div style={{ fontSize: 12, color: '#64748b' }}>
          Chọn vùng mật độ (HU) cần tự động tô màu nổi bật trên phim để phát hiện nhanh tổn thương:
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {THRESHOLD_PRESETS.map((p) => {
            const isSelected = (activeThreshold?.key || 'none') === p.key;
            return (
              <div
                key={p.key}
                onClick={() => handleApply(p.key)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: 6,
                  border: isSelected ? `2px solid ${p.colorHex}` : '1px solid #e2e8f0',
                  background: isSelected ? 'rgba(56, 189, 248, 0.06)' : '#ffffff',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: '50%',
                      backgroundColor: p.colorHex,
                      display: 'inline-block',
                      boxShadow: '0 0 4px rgba(0,0,0,0.2)',
                    }}
                  />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{p.label}</div>
                    <div style={{ fontSize: 11, color: '#64748b' }}>{p.desc}</div>
                  </div>
                </div>

                <div>
                  {isSelected ? (
                    <Tag color="success" icon={<CheckCircleOutlined />}>Đang chọn</Tag>
                  ) : (
                    <Button size="small" type="link">Chọn</Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
          <Button onClick={onClose}>Đóng</Button>
        </div>
      </div>
    </Modal>
  );
}
