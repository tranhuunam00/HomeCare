import React from 'react';
import styles from '../FastSonoSelector.module.scss';

export default function FastSonoOrganTabs({
  organs = [],
  activeOrganKey,
  onSelectOrgan,
  selectedMap = {},
}) {
  return (
    <div className={styles.organTabsContainer} role="tablist">
      {organs.map((organ) => {
        const isActive = organ.key === activeOrganKey;
        const organSelected = selectedMap[organ.key] || ['NORMAL'];
        const hasAbnormal = organSelected.some((id) => {
          const opt = organ.options?.find((o) => o.id === id);
          return opt && !opt.isNormal;
        });

        return (
          <button
            key={organ.key}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={`${styles.organTabBtn} ${isActive ? styles.activeTab : ''}`}
            onClick={() => onSelectOrgan(organ.key)}
          >
            <span>{organ.label || organ.name || organ.title || organ.key}</span>
            {hasAbnormal && <span className={styles.abnormalDot} />}
          </button>
        );
      })}
    </div>
  );
}
