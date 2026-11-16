import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Button, Empty, Spin, Tooltip, message } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import styles from './FastSonoSelector.module.scss';
import {
  initDefaultSelectedMap,
  toggleFindingOption,
  countTotalAbnormalities,
  filterOptionsByGender,
  generateBulletedNarrative,
  generateConclusionText,
  generateHTMLNarrative,
  generateSingleOrganNarrative,
  updateOrganInNarrative,
} from './fastSonoEngine';
import { CLASSIFICATION_TYPES } from './fastSono.constants';
import { fetchClinicalTemplateByServiceAndPart } from '../../../../services/clinicalTemplateService';
import FastSonoTopBar from './components/FastSonoTopBar';
import FastSonoOrganTabs from './components/FastSonoOrganTabs';
import FastSonoClassification from './components/FastSonoClassification';
import FastSonoNarrativeBox from './components/FastSonoNarrativeBox';

/**
 * FastSonoSelector - Organism Component
 * Chọn nhanh mô tả siêu âm 5 tầng phả hệ (Kế thừa D-SONO, tích hợp chuẩn vào HomeCare)
 */
const FastSonoSelector = ({
  idTemplateService,
  idExamPart,
  examPartName = '',
  serviceName = '',
  gender = '',
  isEdit = true,
  initialSelectedMap = null,
  initialGrade = '',
  initialNarrativeText = '',
  isManualEdited = false,
  onNarrativeChange,
  onConclusionChange,
  onSelectedMapChange,
}) => {
  const [activeTemplate, setActiveTemplate] = useState(null);
  const [loadingTemplate, setLoadingTemplate] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!idExamPart) {
      setActiveTemplate(null);
      return;
    }

    setLoadingTemplate(true);
    fetchClinicalTemplateByServiceAndPart(idTemplateService, idExamPart, {
      examPartName,
      serviceName,
    })
      .then((tpl) => {
        if (!cancelled) setActiveTemplate(tpl || null);
      })
      .finally(() => {
        if (!cancelled) setLoadingTemplate(false);
      });

    return () => {
      cancelled = true;
    };
  }, [idTemplateService, idExamPart, examPartName, serviceName]);

  const [activeOrganKey, setActiveOrganKey] = useState(() => activeTemplate?.organs?.[0]?.key || '');

  useEffect(() => {
    if (activeTemplate?.organs?.length > 0) {
      const exists = activeTemplate.organs.some((o) => o.key === activeOrganKey);
      if (!exists) {
        setActiveOrganKey(activeTemplate.organs[0].key);
      }
    }
  }, [activeTemplate, activeOrganKey]);

  const [selectedMap, setSelectedMap] = useState(() => {
    if (initialSelectedMap && Object.keys(initialSelectedMap).length > 0) {
      return initialSelectedMap;
    }
    return initDefaultSelectedMap(activeTemplate);
  });

  const [selectedGrade, setSelectedGrade] = useState(() => {
    if (initialGrade) return initialGrade;
    if (activeTemplate?.classificationType === CLASSIFICATION_TYPES.TIRADS) return 'TR1';
    if (activeTemplate?.classificationType === CLASSIFICATION_TYPES.BIRADS) return '1';
    return '';
  });

  const currentOrgan = useMemo(() => {
    return activeTemplate?.organs?.find((o) => o.key === activeOrganKey) || activeTemplate?.organs?.[0];
  }, [activeTemplate, activeOrganKey]);

  const visibleOptions = useMemo(() => {
    if (!currentOrgan) return [];
    const rawOptions = currentOrgan.options || [];
    const filtered = filterOptionsByGender(rawOptions, gender);
    return filtered.length > 0 ? filtered : rawOptions;
  }, [currentOrgan, gender]);

  const currentSelectedIds = selectedMap[currentOrgan?.key || ''] || ['NORMAL'];

  const totalAbnormal = useMemo(() => {
    return countTotalAbnormalities(activeTemplate?.organs || [], selectedMap);
  }, [activeTemplate?.organs, selectedMap]);

  const liveNarrative = useMemo(() => {
    return generateBulletedNarrative(activeTemplate?.organs || [], selectedMap, gender);
  }, [activeTemplate?.organs, selectedMap, gender]);

  const liveHTMLNarrative = useMemo(() => {
    return generateHTMLNarrative(activeTemplate?.organs || [], selectedMap, gender);
  }, [activeTemplate?.organs, selectedMap, gender]);

  const liveConclusion = useMemo(() => {
    return generateConclusionText(
      activeTemplate?.organs || [],
      selectedMap,
      activeTemplate?.classificationType,
      selectedGrade,
      { title: activeTemplate?.title, examPartName, serviceName }
    );
  }, [activeTemplate?.organs, activeTemplate?.title, selectedMap, activeTemplate?.classificationType, selectedGrade, examPartName, serviceName]);

  const abnormalCodes = useMemo(() => {
    const codes = [];
    if (activeTemplate?.organs) {
      for (const organ of activeTemplate.organs) {
        const selectedIds = selectedMap[organ.key] || ['NORMAL'];
        for (const optId of selectedIds) {
          const opt = organ.options?.find((o) => o.id === optId);
          if (opt && !opt.isNormal) codes.push(`${organ.key}:${opt.id}`);
        }
      }
    }
    return codes;
  }, [activeTemplate?.organs, selectedMap]);

  const stripHtml = (html) => (html ? html.replace(/<[^>]*>?/gm, '').trim() : '');

  const [userEditedNarrative, setUserEditedNarrative] = useState(() => {
    if (initialNarrativeText && isManualEdited) return stripHtml(initialNarrativeText);
    return null;
  });
  const [isManualEdit, setIsManualEdit] = useState(() => Boolean(isManualEdited));

  useEffect(() => {
    if (!isManualEdit) setUserEditedNarrative(liveNarrative);
  }, [liveNarrative, isManualEdit]);

  const convertPlainTextToHTML = (text) => {
    if (!text) return '';
    return text.split('\n').filter((l) => l.trim().length > 0).map((l) => `<p>${l.trim()}</p>`).join('');
  };

  const currentTemplateCode = activeTemplate?.templateCode || activeTemplate?.code || (idExamPart ? String(idExamPart) : '');
  const isFirstMount = useRef(true);

  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    if (!isManualEdit && onNarrativeChange) {
      onNarrativeChange(liveNarrative, liveHTMLNarrative, false);
    }
    if (onSelectedMapChange) {
      onSelectedMapChange(selectedMap, selectedGrade, currentTemplateCode, abnormalCodes);
    }
  }, [liveNarrative, liveHTMLNarrative, selectedMap, selectedGrade, currentTemplateCode, abnormalCodes, isManualEdit]);

  const handleNarrativeUserEdit = (val) => {
    setUserEditedNarrative(val);
    setIsManualEdit(true);
    if (onNarrativeChange) onNarrativeChange(val, convertPlainTextToHTML(val), true);
  };

  const handleRestoreAutoNarrative = () => {
    setIsManualEdit(false);
    setUserEditedNarrative(liveNarrative);
    if (onNarrativeChange) onNarrativeChange(liveNarrative, liveHTMLNarrative, false);
    message.info('Đã khôi phục văn bản mô tả tự sinh theo các chip đã chọn.');
  };

  const handleToggleChip = useCallback((optionId) => {
    if (!isEdit || !currentOrgan) return;
    const nextSelected = toggleFindingOption(currentSelectedIds, currentOrgan, optionId);

    setSelectedMap((prev) => ({ ...prev, [currentOrgan.key]: nextSelected }));

    if (isManualEdit && userEditedNarrative) {
      const organLabel = currentOrgan.label || currentOrgan.name || currentOrgan.title || currentOrgan.key || 'Bộ phận';
      const newOrganNarrative = generateSingleOrganNarrative(currentOrgan, nextSelected, gender);
      const updatedText = updateOrganInNarrative(userEditedNarrative, organLabel, newOrganNarrative);
      setUserEditedNarrative(updatedText);
      if (onNarrativeChange) onNarrativeChange(updatedText, convertPlainTextToHTML(updatedText), true);
    }
  }, [isEdit, currentOrgan, currentSelectedIds, isManualEdit, userEditedNarrative, gender, onNarrativeChange]);

  const handleResetAllNormal = () => {
    if (!isEdit) return;
    setIsManualEdit(false);
    setSelectedMap(initDefaultSelectedMap(activeTemplate));
    if (activeTemplate?.classificationType === CLASSIFICATION_TYPES.TIRADS) setSelectedGrade('TR1');
    else if (activeTemplate?.classificationType === CLASSIFICATION_TYPES.BIRADS) setSelectedGrade('1');
  };

  const handleApplyToDiagnosisSummary = useCallback(() => {
    if (onConclusionChange) {
      onConclusionChange(liveConclusion);
      message.success(`Đã bắn kết luận [Alt+Enter]: "${liveConclusion}"`);
    }
  }, [onConclusionChange, liveConclusion]);

  const handleCopyNarrative = () => {
    const textToCopy = isManualEdit && userEditedNarrative !== null ? userEditedNarrative : liveNarrative;
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(textToCopy);
      message.success('Đã sao chép văn bản mô tả!');
    }
  };

  // Keyboard shortcut listener
  useEffect(() => {
    if (!isEdit) return;
    const handleKeyDown = (e) => {
      const targetTag = e.target?.tagName?.toLowerCase();
      if (['input', 'textarea', 'select'].includes(targetTag) || e.target?.isContentEditable) return;

      if (e.altKey && e.key === 'Enter') {
        e.preventDefault();
        handleApplyToDiagnosisSummary();
        return;
      }
      if (e.altKey && (e.key === 'r' || e.key === 'R')) {
        e.preventDefault();
        handleResetAllNormal();
        return;
      }
      if (!e.ctrlKey && !e.metaKey && !e.altKey && e.key >= '1' && e.key <= '9') {
        const chipIndex = parseInt(e.key, 10) - 1;
        if (visibleOptions && chipIndex < visibleOptions.length) {
          e.preventDefault();
          handleToggleChip(visibleOptions[chipIndex].id);
        }
        return;
      }
      if (!e.ctrlKey && !e.metaKey && !e.altKey && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) {
        if (activeTemplate?.organs?.length > 1) {
          e.preventDefault();
          const currentIdx = activeTemplate.organs.findIndex((o) => o.key === activeOrganKey);
          if (currentIdx !== -1) {
            let nextIdx = e.key === 'ArrowRight' ? currentIdx + 1 : currentIdx - 1;
            if (nextIdx >= activeTemplate.organs.length) nextIdx = 0;
            if (nextIdx < 0) nextIdx = activeTemplate.organs.length - 1;
            setActiveOrganKey(activeTemplate.organs[nextIdx].key);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEdit, visibleOptions, activeTemplate, activeOrganKey, handleApplyToDiagnosisSummary, handleToggleChip]);

  if (loadingTemplate) {
    return (
      <div className={styles.fastSonoContainer} style={{ alignItems: 'center', padding: 24 }}>
        <Spin size="small" tip="Đang tải mẫu lâm sàng theo Phân hệ & Bộ phận..." />
      </div>
    );
  }

  if (!activeTemplate) {
    return (
      <div className={styles.fastSonoContainer} style={{ padding: 20 }}>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <span style={{ color: '#64748b', fontSize: 13 }}>
              {idExamPart
                ? `Chưa có cấu hình chọn nhanh (D-SONO) cho bộ phận "${examPartName || idExamPart}".`
                : 'Vui lòng chọn Phân hệ và Bộ phận thăm khám trước.'}
            </span>
          }
        />
      </div>
    );
  }

  return (
    <div className={styles.fastSonoContainer}>
      <FastSonoTopBar activeTemplate={activeTemplate} examPartName={examPartName} totalAbnormal={totalAbnormal} />

      <FastSonoOrganTabs
        organs={activeTemplate?.organs || []}
        activeOrganKey={activeOrganKey}
        onSelectOrgan={setActiveOrganKey}
        selectedMap={selectedMap}
      />

      {currentOrgan && (
        <div className={styles.organContentSection}>
          <div className={styles.organHeaderRow}>
            <div className={styles.organTitle}>
              <span>{currentOrgan.label || currentOrgan.name || currentOrgan.title || currentOrgan.key}</span>
              {gender && <span className={styles.genderBadge}>Đã lọc theo: {gender}</span>}
            </div>
            <span className={styles.subHint}>Chạm để chọn · Nhiều lựa chọn bệnh lý</span>
          </div>

          <div className={styles.chipsGrid}>
            {visibleOptions.map((opt, idx) => {
              const isSelected = currentSelectedIds.includes(opt.id);
              let chipClass = opt.isNormal
                ? isSelected ? styles.chipNormalSelected : styles.chipNormalUnselected
                : isSelected ? styles.chipAbnormalSelected : styles.chipAbnormalUnselected;
              const hotkeyNum = idx < 9 ? idx + 1 : null;

              return (
                <button
                  key={opt.id}
                  type="button"
                  disabled={!isEdit}
                  className={`${styles.findingChip} ${chipClass}`}
                  onClick={() => handleToggleChip(opt.id)}
                  title={hotkeyNum ? `Phím tắt: [${hotkeyNum}]` : undefined}
                >
                  {hotkeyNum && <span className={styles.chipHotkeyBadge}>{hotkeyNum}</span>}
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <FastSonoClassification
        activeTemplate={activeTemplate}
        selectedGrade={selectedGrade}
        onSelectGrade={setSelectedGrade}
        isEdit={isEdit}
      />

      <FastSonoNarrativeBox
        isManualEdit={isManualEdit}
        userEditedNarrative={userEditedNarrative}
        liveNarrative={liveNarrative}
        isEdit={isEdit}
        onNarrativeUserEdit={handleNarrativeUserEdit}
        onRestoreAutoNarrative={handleRestoreAutoNarrative}
        onCopyNarrative={handleCopyNarrative}
        onApplyToDiagnosisSummary={handleApplyToDiagnosisSummary}
      />

      <div className={styles.bottomActionBar}>
        <Tooltip title="Đưa toàn bộ cơ quan về trạng thái bình thường [Alt + R]">
          <Button danger size="small" icon={<ReloadOutlined />} disabled={!isEdit} onClick={handleResetAllNormal}>
            Đặt lại tất cả về bình thường [Alt+R]
          </Button>
        </Tooltip>
        <span style={{ fontSize: 11, color: '#94a3b8' }}>
          * Chạm vào nút hoặc bấm phím số [1..9] để tự sinh mô tả y khoa chuẩn.
        </span>
      </div>
    </div>
  );
};

export default FastSonoSelector;
