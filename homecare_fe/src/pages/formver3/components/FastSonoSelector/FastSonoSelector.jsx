import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Button, Empty, Spin, Tooltip, message, Input, Tag } from 'antd';
import {
  CheckCircleOutlined,
  WarningOutlined,
  ReloadOutlined,
  CopyOutlined,
  ThunderboltOutlined,
  EditOutlined,
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
    fetchClinicalTemplateByServiceAndPart(idTemplateService, idExamPart, {
      examPartName,
      serviceName,
    })
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
  }, [idTemplateService, idExamPart, examPartName, serviceName]);

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

  // Lọc options theo giới tính bệnh nhân (fallback toàn bộ options nếu lọc ra rỗng)
  const visibleOptions = useMemo(() => {
    if (!currentOrgan) return [];
    const rawOptions = currentOrgan.options || [];
    const filtered = filterOptionsByGender(rawOptions, gender);
    return filtered.length > 0 ? filtered : rawOptions;
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
      selectedGrade,
      {
        title: activeTemplate?.title,
        examPartName,
        serviceName,
      }
    );
  }, [activeTemplate?.organs, activeTemplate?.title, selectedMap, activeTemplate?.classificationType, selectedGrade, examPartName, serviceName]);

  // Trích xuất danh sách mã bệnh lý bất thường (để BE có thể index/query)
  const abnormalCodes = useMemo(() => {
    const codes = [];
    if (activeTemplate?.organs) {
      for (const organ of activeTemplate.organs) {
        const selectedIds = selectedMap[organ.key] || ['NORMAL'];
        for (const optId of selectedIds) {
          const opt = organ.options?.find((o) => o.id === optId);
          if (opt && !opt.isNormal) {
            codes.push(`${organ.key}:${opt.id}`);
          }
        }
      }
    }
    return codes;
  }, [activeTemplate?.organs, selectedMap]);

  // Hàm loại bỏ thẻ HTML để lấy plain text
  const stripHtml = (html) => {
    if (!html) return '';
    return html.replace(/<[^>]*>?/gm, '').trim();
  };

  // Trạng thái chỉnh sửa thủ công văn bản mô tả của bác sĩ (Bảo vệ không bị chip đè)
  const [userEditedNarrative, setUserEditedNarrative] = useState(() => {
    if (initialNarrativeText && isManualEdited) {
      return stripHtml(initialNarrativeText);
    }
    return null;
  });
  const [isManualEdit, setIsManualEdit] = useState(() => Boolean(isManualEdited));

  useEffect(() => {
    if (!isManualEdit) {
      setUserEditedNarrative(liveNarrative);
    }
  }, [liveNarrative, isManualEdit]);

  // Hàm chuyển text xuống dòng sang HTML paragraphs
  const convertPlainTextToHTML = (text) => {
    if (!text) return '';
    const lines = text.split('\n').filter((line) => line.trim().length > 0);
    return lines.map((line) => `<p>${line.trim()}</p>`).join('');
  };

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
    if (!isManualEdit && onNarrativeChange) {
      onNarrativeChange(liveNarrative, liveHTMLNarrative, false);
    }
    if (onSelectedMapChange) {
      onSelectedMapChange(selectedMap, selectedGrade, currentTemplateCode, abnormalCodes);
    }
  }, [liveNarrative, liveHTMLNarrative, selectedMap, selectedGrade, currentTemplateCode, abnormalCodes, isManualEdit]);

  // Xử lý khi bác sĩ trực tiếp chỉnh sửa câu chữ trong ô mô tả
  const handleNarrativeUserEdit = (val) => {
    setUserEditedNarrative(val);
    setIsManualEdit(true);
    if (onNarrativeChange) {
      onNarrativeChange(val, convertPlainTextToHTML(val), true);
    }
  };

  // Khôi phục lại văn bản tự sinh theo đúng các chip đã chọn
  const handleRestoreAutoNarrative = () => {
    setIsManualEdit(false);
    setUserEditedNarrative(liveNarrative);
    if (onNarrativeChange) {
      onNarrativeChange(liveNarrative, liveHTMLNarrative, false);
    }
    message.info('Đã khôi phục văn bản mô tả tự sinh theo các chip đã chọn.');
  };

  // Xử lý khi bấm nút chip
  const handleToggleChip = (optionId) => {
    if (!isEdit || !currentOrgan) return;
    setIsManualEdit(false);
    const nextSelected = toggleFindingOption(currentSelectedIds, currentOrgan, optionId);
    setSelectedMap((prev) => ({
      ...prev,
      [currentOrgan.key]: nextSelected,
    }));
  };

  // Đặt lại tất cả các cơ quan về Bình thường
  const handleResetAllNormal = () => {
    if (!isEdit) return;
    setIsManualEdit(false);
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
      message.success(`Đã bắn kết luận [Alt+Enter]: "${liveConclusion}"`);
    }
  };

  const handleCopyNarrative = () => {
    const textToCopy = isManualEdit && userEditedNarrative !== null ? userEditedNarrative : liveNarrative;
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(textToCopy);
      message.success('Đã sao chép văn bản mô tả!');
    }
  };

  // Lắng nghe phím tắt điều khiển chip & tabs lâm sàng
  useEffect(() => {
    if (!isEdit) return;

    const handleKeyDown = (e) => {
      const targetTag = e.target?.tagName?.toLowerCase();
      const isInputFocused =
        targetTag === 'input' ||
        targetTag === 'textarea' ||
        e.target?.isContentEditable;

      // Alt + Enter: Bắn vào Kết luận (hoạt động mọi nơi kể cả khi đang gõ textarea)
      if (e.altKey && e.key === 'Enter') {
        e.preventDefault();
        handleApplyToDiagnosisSummary();
        return;
      }

      // Alt + R: Đặt lại tất cả về bình thường
      if (e.altKey && e.key.toLowerCase() === 'r') {
        e.preventDefault();
        handleResetAllNormal();
        return;
      }

      // Alt + C: Sao chép văn bản mô tả
      if (e.altKey && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        handleCopyNarrative();
        return;
      }

      // Nếu đang gõ trong input/textarea thì không bắt phím số 1..9 và phím mũi tên
      if (isInputFocused) return;

      // Phím số 1..9: Toggle chip bệnh lý của cơ quan đang chọn
      if (!e.ctrlKey && !e.metaKey && !e.altKey && e.key >= '1' && e.key <= '9') {
        const index = parseInt(e.key, 10) - 1;
        if (visibleOptions && index < visibleOptions.length) {
          e.preventDefault();
          handleToggleChip(visibleOptions[index].id);
        }
        return;
      }

      // Phím mũi tên Trái / Phải: Chuyển tab cơ quan
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
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isEdit,
    visibleOptions,
    activeTemplate,
    activeOrganKey,
    handleApplyToDiagnosisSummary,
    handleResetAllNormal,
    handleToggleChip,
    handleCopyNarrative,
  ]);

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
              <span>{organ.label || organ.name || organ.title || organ.key}</span>
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
              <span>{currentOrgan.label || currentOrgan.name || currentOrgan.title || currentOrgan.key}</span>
              {gender && (
                <span className={styles.genderBadge}>
                  Đã lọc theo: {gender}
                </span>
              )}
            </div>
            <span className={styles.subHint}>Chạm để chọn · Nhiều lựa chọn bệnh lý</span>
          </div>

          <div className={styles.chipsGrid}>
            {visibleOptions.map((opt, idx) => {
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
                  {hotkeyNum && (
                    <span className={styles.chipHotkeyBadge}>{hotkeyNum}</span>
                  )}
                  <span>{opt.label}</span>
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
          <div>
            {isManualEdit && (
              <Tooltip title="Văn bản đã được bác sĩ trực tiếp chỉnh sửa">
                <Tag color="orange" style={{ fontSize: 11, margin: 0, padding: '0 6px', lineHeight: '20px' }}>
                  <EditOutlined style={{ marginRight: 4 }} />
                  Đã sửa tay
                </Tag>
              </Tooltip>
            )}
          </div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
            {isManualEdit && (
              <Tooltip title="Khôi phục lại văn bản tự sinh chuẩn theo các chip đã chọn">
                <Button
                  size="small"
                  icon={<ReloadOutlined />}
                  onClick={handleRestoreAutoNarrative}
                >
                  Sinh lại từ chip
                </Button>
              </Tooltip>
            )}
            <Tooltip title="Sao chép văn bản mô tả">
              <Button
                size="small"
                icon={<CopyOutlined />}
                onClick={handleCopyNarrative}
              >
                Sao chép
              </Button>
            </Tooltip>
            <Tooltip title="Tự động trích xuất kết luận bệnh lý vào ô Kết luận chẩn đoán [Alt + Enter]">
              <Button
                size="small"
                type="primary"
                style={{ background: '#0b6b4f', borderColor: '#0b6b4f' }}
                onClick={handleApplyToDiagnosisSummary}
              >
                Bắn vào Kết luận [Alt+Enter]
              </Button>
            </Tooltip>
          </div>
        </div>

        <Input.TextArea
          value={userEditedNarrative !== null ? userEditedNarrative : liveNarrative}
          onChange={(e) => handleNarrativeUserEdit(e.target.value)}
          disabled={!isEdit}
          autoSize={{ minRows: 4, maxRows: 14 }}
          style={{
            fontSize: 14,
            lineHeight: 1.6,
            borderRadius: 6,
            color: '#1e293b',
            background: '#ffffff',
            padding: '6px 10px',
          }}
          placeholder="Nội dung mô tả y khoa..."
        />
      </div>

      {/* 6. Bottom Action Bar: Nút Reset */}
      <div className={styles.bottomActionBar}>
        <Tooltip title="Đưa toàn bộ cơ quan về trạng thái bình thường [Alt + R]">
          <Button
            danger
            size="small"
            icon={<ReloadOutlined />}
            disabled={!isEdit}
            onClick={handleResetAllNormal}
          >
            Đặt lại tất cả về bình thường [Alt+R]
          </Button>
        </Tooltip>
        <span style={{ fontSize: 11, color: '#94a3b8' }}>
          * Chạm vào nút hoặc bấm phím số [1..9] để tự sinh mô tả y khoa chuẩn.
        </span>
      </div>

      {/* 7. Quick Hotkeys Bar */}
      {isEdit && (
        <div className={styles.hotkeysHelpBar}>
          <span style={{ fontWeight: 600, color: '#334155' }}>⌨ Phím tắt:</span>
          <span className={styles.hotkeyItem}><kbd>1..9</kbd> Chọn nhanh chip</span>
          <span className={styles.hotkeyItem}><kbd>←</kbd><kbd>→</kbd> Đổi cơ quan</span>
          <span className={styles.hotkeyItem}><kbd>Alt+Enter</kbd> Bắn kết luận</span>
          <span className={styles.hotkeyItem}><kbd>Alt+R</kbd> Về bình thường</span>
          <span className={styles.hotkeyItem}><kbd>Ctrl+S</kbd> Lưu nháp</span>
          <span className={styles.hotkeyItem}><kbd>Alt+D</kbd> Đọc xong</span>
        </div>
      )}
    </div>
  );
};

export default FastSonoSelector;

