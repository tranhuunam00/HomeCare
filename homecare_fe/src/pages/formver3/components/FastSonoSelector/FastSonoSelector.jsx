import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Button, Empty, Spin, Tooltip, message } from 'antd';
import {
  CheckCircleOutlined,
  WarningOutlined,
  ReloadOutlined,
  CopyOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import styles from './FastSonoSelector.module.scss';
import {
  initDefaultSelectedMap,
  toggleFindingOption,
  countTotalAbnormalities,
  filterOptionsByGender,
  generateBulletedNarrative,
  generateConclusionText,
  generateHTMLNarrative,
} from './fastSonoEngine';
import {
  CLASSIFICATION_TYPES,
  TIRADS_GRADES,
  BIRADS_GRADES,
} from './fastSono.constants';
import {
  fetchClinicalTemplateByServiceAndPart,
} from '../../../../services/clinicalTemplateService';

/**
 * FastSonoSelector - Organism Component
 * Chọn nhanh mô tả siêu âm 5 tầng phả hệ (Kế thừa D-SONO, tích hợp chuẩn vào HomeCare)
 */
const FastSonoSelector = ({
  idTemplateService,
  idExamPart,
  examPartName = '',
  gender = '',
  isEdit = true,
  initialSelectedMap = null,
  initialGrade = '',
  onNarrativeChange,
  onConclusionChange,
  onSelectedMapChange,
}) => {
  // 1. Truy vấn trực tiếp mẫu 5 tầng theo Phân hệ (idTemplateService) và Bộ phận (idExamPart)
  const [activeTemplate, setActiveTemplate] = useState(null);
  const [loadingTemplate, setLoadingTemplate] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!idExamPart) {
      setActiveTemplate(null);
      return;
    }

    setLoadingTemplate(true);
    fetchClinicalTemplateByServiceAndPart(idTemplateService, idExamPart)
      .then((tpl) => {
        if (!cancelled) {
          setActiveTemplate(tpl || null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingTemplate(false);
      });

    return () => {
      cancelled = true;
    };
  }, [idTemplateService, idExamPart]);

  // Tab cơ quan đang hoạt động
  const [activeOrganKey, setActiveOrganKey] = useState(() => {
    return activeTemplate?.organs?.[0]?.key || '';
  });

  useEffect(() => {
    if (activeTemplate?.organs?.length > 0) {
      const exists = activeTemplate.organs.some((o) => o.key === activeOrganKey);
      if (!exists) {
        setActiveOrganKey(activeTemplate.organs[0].key);
      }
    }
  }, [activeTemplate, activeOrganKey]);

  // Trạng thái chọn các chips theo từng cơ quan { ORGAN_KEY: ['NORMAL', ...] }
  const [selectedMap, setSelectedMap] = useState(() => {
    if (initialSelectedMap && Object.keys(initialSelectedMap).length > 0) {
      return initialSelectedMap;
    }
    return initDefaultSelectedMap(activeTemplate);
  });

  // Điểm phân loại (TI-RADS hoặc BI-RADS)
  const [selectedGrade, setSelectedGrade] = useState(() => {
    if (initialGrade) return initialGrade;
    if (activeTemplate?.classificationType === CLASSIFICATION_TYPES.TIRADS) return 'TR1';
    if (activeTemplate?.classificationType === CLASSIFICATION_TYPES.BIRADS) return '1';
    return '';
  });

  // Cơ quan đang được chọn tab
  const currentOrgan = useMemo(() => {
    return (
      activeTemplate?.organs?.find((o) => o.key === activeOrganKey) ||
      activeTemplate?.organs?.[0]
    );
  }, [activeTemplate, activeOrganKey]);

  // Lọc options theo giới tính bệnh nhân
  const visibleOptions = useMemo(() => {
    if (!currentOrgan) return [];
    return filterOptionsByGender(currentOrgan.options || [], gender);
  }, [currentOrgan, gender]);

  const currentSelectedIds = selectedMap[currentOrgan?.key || ''] || ['NORMAL'];

  // Tính tổng số tổn thương bất thường
  const totalAbnormal = useMemo(() => {
    return countTotalAbnormalities(activeTemplate?.organs || [], selectedMap);
  }, [activeTemplate?.organs, selectedMap]);

  // Tự động sinh câu văn mô tả & kết luận
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
      selectedGrade
    );
  }, [activeTemplate?.organs, selectedMap, activeTemplate?.classificationType, selectedGrade]);

  // Đồng bộ ra ngoài cha mỗi khi lựa chọn thay đổi
  const currentTemplateCode =
    activeTemplate?.templateCode ||
    activeTemplate?.code ||
    (idExamPart ? String(idExamPart) : "");

  const isFirstMount = useRef(true);
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    if (onNarrativeChange) {
      onNarrativeChange(liveNarrative, liveHTMLNarrative);
    }
    if (onSelectedMapChange) {
      onSelectedMapChange(selectedMap, selectedGrade, currentTemplateCode);
    }
  }, [liveNarrative, liveHTMLNarrative, selectedMap, selectedGrade, currentTemplateCode]);

  // Xử lý khi bấm nút chip
  const handleToggleChip = (optionId) => {
    if (!isEdit || !currentOrgan) return;
    const nextSelected = toggleFindingOption(currentSelectedIds, currentOrgan, optionId);
    setSelectedMap((prev) => ({
      ...prev,
      [currentOrgan.key]: nextSelected,
    }));
  };

  // Đặt lại tất cả các cơ quan về Bình thường
  const handleResetAllNormal = () => {
    if (!isEdit) return;
    const resetMap = initDefaultSelectedMap(activeTemplate);
    setSelectedMap(resetMap);
    if (activeTemplate?.classificationType === CLASSIFICATION_TYPES.TIRADS) {
      setSelectedGrade('TR1');
    } else if (activeTemplate?.classificationType === CLASSIFICATION_TYPES.BIRADS) {
      setSelectedGrade('1');
    }
  };

  // Đẩy kết luận tự sinh vào ô Kết luận chẩn đoán của form
  const handleApplyToDiagnosisSummary = () => {
    if (onConclusionChange) {
      onConclusionChange(liveConclusion);
      message.success('Đã áp dụng kết luận tự sinh vào ô Kết luận chẩn đoán!');
    }
  };

  const handleCopyNarrative = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(liveNarrative);
      message.success('Đã sao chép văn bản mô tả!');
    }
  };

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
      {/* 1. Top Bar: Tên Mẫu Lâm Sàng theo Phân hệ & Bộ phận & Badge Thống kê */}
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

      {/* 2. Dải Tab cơ quan cuộn ngang (Tầng 2 - Bộ phận trong mẫu) */}
      <div className={styles.organTabsContainer} role="tablist">
        {activeTemplate?.organs?.map((organ) => {
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
              onClick={() => setActiveOrganKey(organ.key)}
            >
              <span>{organ.label}</span>
              {hasAbnormal && <span className={styles.abnormalDot} />}
            </button>
          );
        })}
      </div>

      {/* 3. Lưới Chips Dạng kết quả (Tầng 3) */}
      {currentOrgan && (
        <div className={styles.organContentSection}>
          <div className={styles.organHeaderRow}>
            <div className={styles.organTitle}>
              <span>{currentOrgan.label}</span>
              {gender && (
                <span className={styles.genderBadge}>
                  Đã lọc theo: {gender}
                </span>
              )}
            </div>
            <span className={styles.subHint}>Chạm để chọn · Nhiều lựa chọn bệnh lý</span>
          </div>

          <div className={styles.chipsGrid}>
            {visibleOptions.map((opt) => {
              const isSelected = currentSelectedIds.includes(opt.id);
              let chipClass = '';
              if (opt.isNormal) {
                chipClass = isSelected
                  ? styles.chipNormalSelected
                  : styles.chipNormalUnselected;
              } else {
                chipClass = isSelected
                  ? styles.chipAbnormalSelected
                  : styles.chipAbnormalUnselected;
              }

              return (
                <button
                  key={opt.id}
                  type="button"
                  disabled={!isEdit}
                  className={`${styles.findingChip} ${chipClass}`}
                  onClick={() => handleToggleChip(opt.id)}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. Thang điểm phân loại (Tầng 4 - TI-RADS / BI-RADS) nếu có */}
      {activeTemplate?.hasClassification && (
        <div className={styles.classificationCard}>
          <div className={styles.cardTitle}>
            <span>
              {activeTemplate.classificationType === CLASSIFICATION_TYPES.TIRADS
                ? 'Thang điểm phân loại TI-RADS (Tuyến giáp)'
                : activeTemplate.classificationType === CLASSIFICATION_TYPES.BIRADS
                ? 'Thang điểm phân loại BI-RADS (Tuyến vú)'
                : 'Thang điểm phân loại lâm sàng'}
            </span>
          </div>

          <div className={styles.gradesGrid}>
            {(activeTemplate.classificationType === CLASSIFICATION_TYPES.TIRADS
              ? TIRADS_GRADES
              : BIRADS_GRADES
            ).map((item) => {
              const isActive = selectedGrade === item.grade;
              return (
                <button
                  key={item.grade}
                  type="button"
                  disabled={!isEdit}
                  className={`${styles.gradeBtn} ${isActive ? styles.activeGrade : ''}`}
                  onClick={() => setSelectedGrade(item.grade)}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          {selectedGrade && (
            <div className={styles.gradeDesc}>
              {activeTemplate.classificationType === CLASSIFICATION_TYPES.TIRADS
                ? TIRADS_GRADES.find((g) => g.grade === selectedGrade)?.desc
                : BIRADS_GRADES.find((g) => g.grade === selectedGrade)?.desc}
            </div>
          )}
        </div>
      )}

      {/* 5. Câu mô tả & Kết luận tự sinh (Tầng 5 - Live-injection) */}
      <div className={styles.narrativePreviewBox}>
        <div className={styles.previewHeader}>
          <span className={styles.previewTitle}>
            Văn bản mô tả y khoa tự sinh (Live-injection)
          </span>
          <div style={{ display: 'flex', gap: 6 }}>
            <Tooltip title="Sao chép văn bản mô tả">
              <Button
                size="small"
                icon={<CopyOutlined />}
                onClick={handleCopyNarrative}
              >
                Sao chép
              </Button>
            </Tooltip>
            <Tooltip title="Tự động bắn kết luận vào ô Kết luận chẩn đoán">
              <Button
                size="small"
                type="primary"
                style={{ background: '#0b6b4f', borderColor: '#0b6b4f' }}
                onClick={handleApplyToDiagnosisSummary}
              >
                Bắn vào Kết luận
              </Button>
            </Tooltip>
          </div>
        </div>

        <div className={styles.previewBody}>{liveNarrative}</div>
      </div>

      {/* 6. Bottom Action Bar: Nút Reset */}
      <div className={styles.bottomActionBar}>
        <Button
          danger
          size="small"
          icon={<ReloadOutlined />}
          disabled={!isEdit}
          onClick={handleResetAllNormal}
        >
          Đặt lại tất cả về bình thường
        </Button>
        <span style={{ fontSize: 11, color: '#94a3b8' }}>
          * Chạm vào các nút bệnh lý để tự sinh mô tả y khoa chuẩn.
        </span>
      </div>
    </div>
  );
};

export default FastSonoSelector;

