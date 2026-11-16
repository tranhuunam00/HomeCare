import React from 'react';
import { CheckCircleOutlined, WarningOutlined, ThunderboltOutlined } from '@ant-design/icons';
import styles from '../FastSonoSelector.module.scss';

export default function FastSonoTopBar({ activeTemplate, examPartName, totalAbnormal }) {
  if (!activeTemplate) return null;

  return (
    <div className={styles.topBar}>
      <div className={styles.templateSelectGroup}>
        <span className={styles.templateLabel}>
          <ThunderboltOutlined style={{ color: '#0b6b4f', marginRight: 4 }} />
          Mẫu lâm sàng: <strong>{activeTemplate.title}</strong>
        </span>
        {examPartName && (
          <span style={{ fontSize: 11, color: '#64748b', fontStyle: 'italic' }}>
            (Bộ phận: {examPartName})
          </span>
        )}
      </div>

      <div
        className={`${styles.badgeAbnormalCount} ${
          totalAbnormal === 0 ? styles.normal : styles.abnormal
        }`}
      >
        {totalAbnormal === 0 ? (
          <>
            <CheckCircleOutlined /> Tất cả bình thường
          </>
        ) : (
          <>
            <WarningOutlined /> {totalAbnormal} bất thường ghi nhận
          </>
        )}
      </div>
    </div>
  );
}
