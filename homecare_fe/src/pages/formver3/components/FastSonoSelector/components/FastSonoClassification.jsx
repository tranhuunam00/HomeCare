import React from 'react';
import { CLASSIFICATION_TYPES, TIRADS_GRADES, BIRADS_GRADES } from '../fastSono.constants';
import styles from '../FastSonoSelector.module.scss';

export default function FastSonoClassification({
  activeTemplate,
  selectedGrade,
  onSelectGrade,
  isEdit,
}) {
  if (!activeTemplate?.hasClassification) return null;

  const isTirads = activeTemplate.classificationType === CLASSIFICATION_TYPES.TIRADS;
  const isBirads = activeTemplate.classificationType === CLASSIFICATION_TYPES.BIRADS;
  const gradeList = isTirads ? TIRADS_GRADES : BIRADS_GRADES;

  return (
    <div className={styles.classificationCard}>
      <div className={styles.cardTitle}>
        <span>
          {isTirads
            ? 'Thang điểm phân loại TI-RADS (Tuyến giáp)'
            : isBirads
            ? 'Thang điểm phân loại BI-RADS (Tuyến vú)'
            : 'Thang điểm phân loại lâm sàng'}
        </span>
      </div>

      <div className={styles.gradesGrid}>
        {gradeList.map((item) => {
          const isActive = selectedGrade === item.grade;
          return (
            <button
              key={item.grade}
              type="button"
              disabled={!isEdit}
              className={`${styles.gradeBtn} ${isActive ? styles.activeGrade : ''}`}
              onClick={() => onSelectGrade(item.grade)}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {selectedGrade && (
        <div className={styles.gradeDesc}>
          {gradeList.find((g) => g.grade === selectedGrade)?.desc}
        </div>
      )}
    </div>
  );
}
