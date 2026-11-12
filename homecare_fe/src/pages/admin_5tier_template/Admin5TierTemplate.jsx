import React, { useState, useEffect, useMemo } from 'react';
import {
  Card,
  Button,
  Input,
  Radio,
  Select,
  Modal,
  Tag,
  Tooltip,
  Popconfirm,
  message,
  Divider,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SettingOutlined,
  ReloadOutlined,
  SaveOutlined,
  ApartmentOutlined,
  CheckCircleOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import styles from './Admin5TierTemplate.module.scss';
import {
  getAllClinicalTemplates,
  fetchClinicalTemplatesFromDB,
  upsertClinicalTemplateToDB,
  generateDefault5TierForExamPart,
} from '../../services/clinicalTemplateService';
import { CLASSIFICATION_TYPES } from '../formver3/components/FastSonoSelector/fastSono.constants';
import { useGlobalAuth } from '../../contexts/AuthContext';

const { TextArea } = Input;
const { Option } = Select;

const Admin5TierTemplate = () => {
  const { templateServices, examParts } = useGlobalAuth();

  // 1. Danh sách Template 5 Tầng (lưu DB) + Phân hệ (Cấp 1) + Bộ phận (Cấp 2)
  const [templates, setTemplates] = useState([]);
  const [selectedServiceId, setSelectedServiceId] = useState(null);
  const [selectedExamPartId, setSelectedExamPartId] = useState(null);
  const [selectedOrganKey, setSelectedOrganKey] = useState('');
  const [selectedOptionId, setSelectedOptionId] = useState('');

  // Form State cho Tầng 5 (Chi tiết câu mô tả tự sinh)
  const [editingOption, setEditingOption] = useState({
    id: '',
    label: '',
    isNormal: true,
    text: '',
    conclusion: '',
    gender: 'ALL',
  });

  // Modal Cài thang điểm (Tầng 4)
  const [isClassificationModalOpen, setIsClassificationModalOpen] = useState(false);
  const [selectedClassification, setSelectedClassification] = useState(CLASSIFICATION_TYPES.NONE);

  // Modal Thêm Bộ phận (Tầng 2)
  const [isAddOrganModalOpen, setIsAddOrganModalOpen] = useState(false);
  const [newOrganForm, setNewOrganForm] = useState({ key: '', label: '', defaultNormalText: '' });

  // Modal Thêm Dạng kết quả (Tầng 3)
  const [isAddOptionModalOpen, setIsAddOptionModalOpen] = useState(false);
  const [newOptionForm, setNewOptionForm] = useState({
    id: '',
    label: '',
    isNormal: false,
    text: '',
    conclusion: '',
    gender: 'ALL',
  });

  // Load danh sách ban đầu từ Database HomeCare
  const [loading, setLoading] = useState(false);
  const reloadTemplates = async () => {
    setLoading(true);
    try {
      const list = await fetchClinicalTemplatesFromDB();
      setTemplates(list);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reloadTemplates();
  }, []);

  // Tự động chọn Phân hệ đầu tiên (Cấp 1)
  useEffect(() => {
    if (templateServices?.length > 0 && !selectedServiceId) {
      setSelectedServiceId(templateServices[0].id);
    }
  }, [templateServices, selectedServiceId]);

  // Danh sách Bộ phận thuộc Phân hệ đang chọn (Cấp 2)
  const filteredExamParts = useMemo(() => {
    if (!examParts || !selectedServiceId) return [];
    return examParts.filter(
      (ep) => String(ep.id_template_service) === String(selectedServiceId),
    );
  }, [examParts, selectedServiceId]);

  // Tự động chọn Bộ phận đầu tiên khi đổi Phân hệ
  useEffect(() => {
    if (filteredExamParts.length > 0) {
      const stillExists = filteredExamParts.some(
        (ep) => String(ep.id) === String(selectedExamPartId),
      );
      if (!stillExists) {
        setSelectedExamPartId(filteredExamParts[0].id);
      }
    } else {
      setSelectedExamPartId(null);
    }
  }, [filteredExamParts, selectedExamPartId]);

  const activeService = useMemo(
    () => templateServices?.find((s) => String(s.id) === String(selectedServiceId)) || null,
    [templateServices, selectedServiceId],
  );

  const activeExamPart = useMemo(
    () => filteredExamParts.find((ep) => String(ep.id) === String(selectedExamPartId)) || null,
    [filteredExamParts, selectedExamPartId],
  );

  // Tự động sinh đầy đủ Tầng 3, 4, 5 cho các bộ phận (exam_parts) của HomeCare
  const handleAutoGenerateForAllExamParts = async () => {
    if (!examParts || examParts.length === 0) {
      message.info('Chưa có danh sách bộ phận thăm khám trong HomeCare.');
      return;
    }

    setLoading(true);
    try {
      let createdCount = 0;
      for (const ep of examParts) {
        const service = templateServices?.find((s) => s.id === ep.id_template_service) || {};
        const generated = generateDefault5TierForExamPart(ep, service);
        if (generated) {
          await upsertClinicalTemplateToDB(generated);
          createdCount++;
        }
      }
      await reloadTemplates();
      message.success(`Đã tự động khởi tạo thành công ${createdCount} mẫu 5 tầng cho các bộ phận của HomeCare!`);
    } catch (err) {
      message.error('Lỗi khi tự sinh mẫu: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Mẫu 5 tầng gắn với Bộ phận đang chọn (nếu DB chưa có thì dùng bản sinh mặc định để sửa & lưu)
  const activeTemplate = useMemo(() => {
    if (!activeExamPart) return null;
    const expectedCode = `TPL_${activeExamPart.code || `EP_${activeExamPart.id}`}`;
    const found = templates.find(
      (t) =>
        (t.id_exam_part && String(t.id_exam_part) === String(activeExamPart.id)) ||
        t.code === expectedCode,
    );
    return found || generateDefault5TierForExamPart(activeExamPart, activeService || {});
  }, [templates, activeExamPart, activeService]);

  // Cơ quan / Nhóm trong Bộ phận đang chọn
  const activeOrgan = useMemo(() => {
    return (
      activeTemplate?.organs?.find((o) => o.key === selectedOrganKey) ||
      activeTemplate?.organs?.[0] ||
      null
    );
  }, [activeTemplate, selectedOrganKey]);

  // Helper cập nhật state + lưu vào DB (kể cả khi mẫu trước đó là bản nháp tự sinh)
  const persistTemplateUpdate = async (updatedTemplate) => {
    if (!updatedTemplate?.code) return;
    setTemplates((prev) => {
      const exists = prev.some((t) => t.code === updatedTemplate.code);
      return exists
        ? prev.map((t) => (t.code === updatedTemplate.code ? updatedTemplate : t))
        : [...prev, updatedTemplate];
    });
    await upsertClinicalTemplateToDB(updatedTemplate);
  };

  // Khi chuyển template hoặc cơ quan, tự động cập nhật editingOption
  useEffect(() => {
    if (activeOrgan?.options?.length > 0) {
      const opt =
        activeOrgan.options.find((o) => o.id === selectedOptionId) ||
        activeOrgan.options[0];
      setSelectedOptionId(opt.id);
      setEditingOption({
        id: opt.id || '',
        label: opt.label || '',
        isNormal: Boolean(opt.isNormal),
        text: opt.text || '',
        conclusion: opt.conclusion || '',
        gender: opt.gender || 'ALL',
      });
    } else {
      setSelectedOptionId('');
      setEditingOption({
        id: '',
        label: '',
        isNormal: true,
        text: '',
        conclusion: '',
        gender: 'ALL',
      });
    }
  }, [activeOrgan, selectedOrganKey]);

  // Lưu câu mô tả Tầng 5 VÀO DATABASE HOMECARE
  const handleSaveTier5 = async () => {
    if (!activeTemplate || !activeOrgan || !editingOption.id) {
      message.warning('Vui lòng chọn dạng kết quả để lưu');
      return;
    }

    const updatedOrgans = activeTemplate.organs.map((org) => {
      if (org.key !== activeOrgan.key) return org;

      const updatedOptions = org.options.map((opt) => {
        if (opt.id !== editingOption.id) return opt;
        return {
          ...opt,
          label: editingOption.label,
          isNormal: editingOption.isNormal,
          text: editingOption.text,
          conclusion: editingOption.conclusion,
          gender: editingOption.gender,
        };
      });

      return { ...org, options: updatedOptions };
    });

    const updatedTemplate = { ...activeTemplate, organs: updatedOrgans };
    await persistTemplateUpdate(updatedTemplate);
    message.success('Đã lưu bền vững câu mô tả & kết luận tự sinh vào Database HomeCare!');
  };

  // Thêm dạng kết quả / mẫu bệnh (Cấp 3) VÀO DATABASE HOMECARE
  const handleAddOption = async () => {
    if (!activeTemplate || !activeOrgan) return;
    if (!newOptionForm.label || !newOptionForm.text) {
      message.error('Vui lòng nhập tên nút bấm và câu mô tả!');
      return;
    }

    const generatedId =
      newOptionForm.id.trim() ||
      `${activeOrgan.key}_${Date.now().toString(36).toUpperCase()}`;

    const newOpt = {
      id: generatedId,
      label: newOptionForm.label,
      isNormal: newOptionForm.isNormal,
      text: newOptionForm.text,
      conclusion: newOptionForm.conclusion || newOptionForm.label,
      gender: newOptionForm.gender || 'ALL',
    };

    const updatedOrgans = activeTemplate.organs.map((org) => {
      if (org.key !== activeOrgan.key) return org;
      return { ...org, options: [...(org.options || []), newOpt] };
    });
    const updatedTemplate = { ...activeTemplate, organs: updatedOrgans };

    await persistTemplateUpdate(updatedTemplate);
    setSelectedOptionId(generatedId);
    setEditingOption(newOpt);
    setIsAddOptionModalOpen(false);
    setNewOptionForm({ id: '', label: '', isNormal: false, text: '', conclusion: '', gender: 'ALL' });
    message.success('Đã thêm mẫu bệnh mới và lưu vào Database HomeCare!');
  };

  // Xóa dạng kết quả / mẫu bệnh VÀO DATABASE HOMECARE
  const handleDeleteOption = async (optionId) => {
    if (!activeTemplate || !activeOrgan) return;
    const updatedOrgans = activeTemplate.organs.map((org) => {
      if (org.key !== activeOrgan.key) return org;
      return { ...org, options: org.options.filter((o) => o.id !== optionId) };
    });
    const updatedTemplate = { ...activeTemplate, organs: updatedOrgans };

    await persistTemplateUpdate(updatedTemplate);
    message.success('Đã xóa mẫu bệnh và cập nhật Database!');
  };

  // Thêm cơ quan / nhóm trong bộ phận VÀO DATABASE HOMECARE
  const handleAddOrgan = async () => {
    if (!activeTemplate) return;
    if (!newOrganForm.label) {
      message.error('Vui lòng nhập tên cơ quan / nhóm!');
      return;
    }

    const generatedKey =
      newOrganForm.key.trim().toUpperCase() ||
      `ORGAN_${Date.now().toString(36).toUpperCase()}`;

    const newOrgan = {
      key: generatedKey,
      label: newOrganForm.label,
      defaultNormalText:
        newOrganForm.defaultNormalText ||
        `${newOrganForm.label} hình thái và cấu trúc bình thường.`,
      options: [
        {
          id: 'NORMAL',
          label: 'Bình thường',
          isNormal: true,
          text:
            newOrganForm.defaultNormalText ||
            `${newOrganForm.label} hình thái và cấu trúc bình thường.`,
        },
      ],
    };

    const updatedTemplate = {
      ...activeTemplate,
      organs: [...(activeTemplate.organs || []), newOrgan],
    };

    await persistTemplateUpdate(updatedTemplate);
    setSelectedOrganKey(generatedKey);
    setIsAddOrganModalOpen(false);
    setNewOrganForm({ key: '', label: '', defaultNormalText: '' });
    message.success('Đã thêm cơ quan mới và lưu Database!');
  };

  // Cập nhật thang điểm (Tầng 4) VÀO DATABASE HOMECARE
  const handleSaveClassification = async () => {
    if (!activeTemplate) return;
    const hasClass = selectedClassification !== CLASSIFICATION_TYPES.NONE;
    const updatedTemplate = {
      ...activeTemplate,
      classificationType: selectedClassification,
      hasClassification: hasClass,
    };

    await persistTemplateUpdate(updatedTemplate);
    setIsClassificationModalOpen(false);
    message.success('Đã cập nhật thang điểm phân loại và lưu Database!');
  };

  return (
    <div className={styles.adminContainer}>
      {/* Header */}
      <div className={styles.headerCard}>
        <div>
          <div className={styles.headerTitle}>
            <ApartmentOutlined style={{ color: '#0b6b4f' }} />
            Cấu hình Mẫu Lâm sàng & Mẫu Text Mô tả Tự sinh (5 Tầng Phả Hệ)
          </div>
          <div className={styles.headerSubtitle}>
            Admin tự thiết lập: Dịch vụ / Chỉ định (Tầng 1) → Bộ phận (Tầng 2) → Dạng kết quả (Tầng 3) → Thang điểm (Tầng 4) → Câu mô tả tự sinh (Tầng 5).
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Button
            type="primary"
            icon={<ApartmentOutlined />}
            loading={loading}
            style={{ background: '#0b6b4f', borderColor: '#0b6b4f' }}
            onClick={handleAutoGenerateForAllExamParts}
          >
            Tự động sinh 5 tầng cho các bộ phận HomeCare
          </Button>
          <Button icon={<ReloadOutlined />} loading={loading} onClick={reloadTemplates}>
            Làm mới
          </Button>
        </div>
      </div>

      {/* 4 Cột Phả Hệ */}
      <div className={styles.columnsGrid}>
        {/* CỘT 1: PHÂN HỆ (CẤP 1) */}
        <div className={styles.colCard}>
          <div className={styles.colHeader}>
            <span className={styles.colTitle}>
              1. PHÂN HỆ ({templateServices?.length || 0})
            </span>
          </div>

          <div className={styles.itemsList}>
            {(templateServices || []).map((service) => {
              const isSelected = String(service.id) === String(selectedServiceId);
              const partCount = (examParts || []).filter(
                (ep) => String(ep.id_template_service) === String(service.id),
              ).length;
              return (
                <div
                  key={service.id}
                  className={`${styles.itemCard} ${isSelected ? styles.activeItem : ''}`}
                  onClick={() => {
                    setSelectedServiceId(service.id);
                    setSelectedOrganKey('');
                  }}
                >
                  <div className={styles.itemTitle}>
                    <span>{service.name}</span>
                    {service.code && (
                      <Tag color="cyan" style={{ fontSize: 10, margin: 0 }}>
                        {service.code}
                      </Tag>
                    )}
                  </div>
                  <div className={styles.itemSub}>
                    {partCount} bộ phận thăm khám
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CỘT 2: BỘ PHẬN THUỘC PHÂN HỆ (CẤP 2) */}
        <div className={styles.colCard}>
          <div className={styles.colHeader}>
            <span className={styles.colTitle}>
              2. BỘ PHẬN ({filteredExamParts.length})
            </span>
          </div>

          <div className={styles.itemsList}>
            {filteredExamParts.map((ep) => {
              const isSelected = String(ep.id) === String(selectedExamPartId);
              const expectedCode = `TPL_${ep.code || `EP_${ep.id}`}`;
              const savedTpl = templates.find(
                (t) =>
                  (t.id_exam_part && String(t.id_exam_part) === String(ep.id)) ||
                  t.code === expectedCode,
              );
              const optionCount = (savedTpl?.organs || []).reduce(
                (sum, org) => sum + (org.options?.length || 0),
                0,
              );
              return (
                <div
                  key={ep.id}
                  className={`${styles.itemCard} ${isSelected ? styles.activeItem : ''}`}
                  onClick={() => {
                    setSelectedExamPartId(ep.id);
                    setSelectedOrganKey('');
                  }}
                >
                  <div className={styles.itemTitle}>
                    <span>{ep.name}</span>
                    <Tag color={savedTpl ? 'green' : 'default'} style={{ fontSize: 10, margin: 0 }}>
                      {savedTpl ? `${optionCount} mẫu` : 'Mặc định'}
                    </Tag>
                  </div>
                  <div className={styles.itemSub}>
                    {savedTpl?.hasClassification && (
                      <Tag color="orange" style={{ fontSize: 10, marginRight: 6 }}>
                        {savedTpl.classificationType}
                      </Tag>
                    )}
                    {isSelected && activeTemplate && (
                      <Button
                        size="small"
                        type="link"
                        icon={<SettingOutlined />}
                        style={{ padding: 0, fontSize: 11, height: 'auto' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedClassification(
                            activeTemplate.classificationType || CLASSIFICATION_TYPES.NONE,
                          );
                          setIsClassificationModalOpen(true);
                        }}
                      >
                        Cài thang điểm
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
            {filteredExamParts.length === 0 && (
              <div style={{ color: '#94a3b8', fontSize: 12, padding: 12, textAlign: 'center' }}>
                Phân hệ này chưa có bộ phận nào
              </div>
            )}
          </div>
        </div>

        {/* CỘT 3: MẪU BỆNH / CƠ QUAN THUỘC BỘ PHẬN (CẤP 3) */}
        <div className={styles.colCard}>
          <div className={styles.colHeader}>
            <span className={styles.colTitle}>
              3. MẪU BỆNH ({activeOrgan?.options?.length || 0})
            </span>
            <div style={{ display: 'flex', gap: 4 }}>
              <Button
                size="small"
                icon={<PlusOutlined />}
                disabled={!activeTemplate}
                onClick={() => setIsAddOrganModalOpen(true)}
              >
                Cơ quan
              </Button>
              <Button
                type="primary"
                size="small"
                icon={<PlusOutlined />}
                disabled={!activeOrgan}
                style={{ background: '#0b6b4f', borderColor: '#0b6b4f' }}
                onClick={() => setIsAddOptionModalOpen(true)}
              >
                Mẫu bệnh
              </Button>
            </div>
          </div>

          {activeTemplate?.organs?.length > 1 && (
            <div
              style={{
                display: 'flex',
                gap: 4,
                overflowX: 'auto',
                paddingBottom: 6,
                marginBottom: 4,
                borderBottom: '1px solid #f1f5f9',
              }}
            >
              {activeTemplate.organs.map((org) => {
                const isOrgActive = org.key === activeOrgan?.key;
                return (
                  <Button
                    key={org.key}
                    size="small"
                    type={isOrgActive ? 'primary' : 'default'}
                    style={
                      isOrgActive
                        ? { background: '#0b6b4f', borderColor: '#0b6b4f', fontSize: 11 }
                        : { fontSize: 11 }
                    }
                    onClick={() => setSelectedOrganKey(org.key)}
                  >
                    {org.label} ({org.options?.length || 0})
                  </Button>
                );
              })}
            </div>
          )}

          <div className={styles.itemsList}>
            {activeOrgan?.options?.map((opt) => {
              const isSelected = opt.id === selectedOptionId;
              return (
                <div
                  key={opt.id}
                  className={`${styles.itemCard} ${isSelected ? styles.activeItem : ''}`}
                  onClick={() => {
                    setSelectedOptionId(opt.id);
                    setEditingOption({ ...opt });
                  }}
                >
                  <div className={styles.itemTitle}>
                    <span>{opt.label}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {opt.isNormal ? (
                        <span className={styles.chipTagNormal}>Bình thường</span>
                      ) : (
                        <span className={styles.chipTagAbnormal}>Bệnh lý</span>
                      )}
                      {!opt.isNormal && (
                        <Popconfirm
                          title="Xóa dạng kết quả này?"
                          onConfirm={(e) => {
                            e.stopPropagation();
                            handleDeleteOption(opt.id);
                          }}
                        >
                          <DeleteOutlined
                            style={{ color: '#ef4444', fontSize: 12 }}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </Popconfirm>
                      )}
                    </div>
                  </div>
                  <div className={styles.itemSub}>"{opt.text}"</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CỘT 4: CẤU HÌNH CÂU MÔ TẢ & KẾT LUẬN TỰ SINH (TẦNG 5) */}
        <div className={styles.editorFormCard}>
          <div className={styles.colHeader}>
            <div>
              <span className={styles.colTitle}>
                Cấu hình Câu mô tả & Kết luận tự sinh (Tầng 5)
              </span>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                {activeService?.name} → {activeExamPart?.name} → {activeOrgan?.label} → {editingOption.label || 'Chưa chọn'}
              </div>
            </div>
            {editingOption.isNormal ? (
              <Tag color="success">Dạng Bình thường</Tag>
            ) : (
              <Tag color="warning">Dạng Bệnh lý</Tag>
            )}
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>
              Tên hiển thị nút bấm (Chip Label):
            </label>
            <Input
              value={editingOption.label}
              placeholder="Ví dụ: Gan nhiễm mỡ"
              onChange={(e) => setEditingOption({ ...editingOption, label: e.target.value })}
            />
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>
              Phân loại tính chất lựa chọn:
            </label>
            <Radio.Group
              value={editingOption.isNormal}
              onChange={(e) => setEditingOption({ ...editingOption, isNormal: e.target.value })}
            >
              <Radio value={true}>
                <CheckCircleOutlined style={{ color: '#0b6b4f' }} /> Bình thường
              </Radio>
              <Radio value={false}>
                <WarningOutlined style={{ color: '#d97706' }} /> Bệnh lý / Bất thường
              </Radio>
            </Radio.Group>
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>
              Áp dụng cho đối tượng bệnh nhân:
            </label>
            <Radio.Group
              value={editingOption.gender}
              onChange={(e) => setEditingOption({ ...editingOption, gender: e.target.value })}
            >
              <Radio value="ALL">Cả 2 giới (Tất cả)</Radio>
              <Radio value="MALE">Chỉ Nam</Radio>
              <Radio value="FEMALE">Chỉ Nữ</Radio>
            </Radio.Group>
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>
              Câu văn y khoa tự động bắn vào "MÔ TẢ HÌNH ẢNH":
            </label>
            <TextArea
              rows={4}
              value={editingOption.text}
              placeholder="Nhập câu văn y khoa tự động sinh khi bấm chọn nút này..."
              onChange={(e) => setEditingOption({ ...editingOption, text: e.target.value })}
            />
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>
              Câu văn tự động bắn vào "KẾT LUẬN CHẨN ĐOÁN":
            </label>
            <TextArea
              rows={2}
              value={editingOption.conclusion}
              placeholder="Nhập câu kết luận ngắn gọn tự sinh..."
              onChange={(e) => setEditingOption({ ...editingOption, conclusion: e.target.value })}
            />
          </div>

          <Button
            type="primary"
            icon={<SaveOutlined />}
            size="large"
            style={{ background: '#0b6b4f', borderColor: '#0b6b4f', marginTop: 8 }}
            onClick={handleSaveTier5}
          >
            Lưu cấu hình câu mô tả
          </Button>
        </div>
      </div>

      {/* MODAL CÀI ĐẶT THANG ĐIỂM (TẦNG 4) */}
      <Modal
        title={`Cài đặt Thang điểm phân loại cho mẫu: ${activeTemplate?.title}`}
        open={isClassificationModalOpen}
        onOk={handleSaveClassification}
        onCancel={() => setIsClassificationModalOpen(false)}
        okText="Lưu thang điểm"
        cancelText="Hủy"
      >
        <p style={{ fontSize: 13, color: '#64748b' }}>
          Chọn thang điểm phân loại chuyên khoa được nhúng tự động vào phiếu khám:
        </p>
        <Radio.Group
          value={selectedClassification}
          onChange={(e) => setSelectedClassification(e.target.value)}
          style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}
        >
          <Radio value={CLASSIFICATION_TYPES.NONE}>Không áp dụng thang điểm</Radio>
          <Radio value={CLASSIFICATION_TYPES.TIRADS}>
            TI-RADS (Phân loại tổn thương Tuyến giáp TR1 - TR5)
          </Radio>
          <Radio value={CLASSIFICATION_TYPES.BIRADS}>
            BI-RADS (Phân loại tổn thương Tuyến vú 1 - 6)
          </Radio>
          <Radio value={CLASSIFICATION_TYPES.ORADS}>
            O-RADS (Phân loại tổn thương Buồng trứng / Phụ khoa)
          </Radio>
        </Radio.Group>
      </Modal>

      {/* MODAL THÊM BỘ PHẬN (TẦNG 2) */}
      <Modal
        title={`Thêm Bộ phận thăm khám vào mẫu: ${activeTemplate?.title}`}
        open={isAddOrganModalOpen}
        onOk={handleAddOrgan}
        onCancel={() => setIsAddOrganModalOpen(false)}
        okText="Thêm bộ phận"
        cancelText="Hủy"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>
              Tên bộ phận: *
            </label>
            <Input
              placeholder="Ví dụ: Tuyến thượng thận"
              value={newOrganForm.label}
              onChange={(e) => setNewOrganForm({ ...newOrganForm, label: e.target.value })}
            />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>
              Mã bộ phận (Key):
            </label>
            <Input
              placeholder="Tự sinh nếu để trống (Ví dụ: ADRENAL_GLANDS)"
              value={newOrganForm.key}
              onChange={(e) => setNewOrganForm({ ...newOrganForm, key: e.target.value })}
            />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>
              Câu mô tả bình thường mặc định:
            </label>
            <TextArea
              rows={3}
              placeholder="Ví dụ: Hai tuyến thượng thận không to, không thấy khối bất thường."
              value={newOrganForm.defaultNormalText}
              onChange={(e) => setNewOrganForm({ ...newOrganForm, defaultNormalText: e.target.value })}
            />
          </div>
        </div>
      </Modal>

      {/* MODAL THÊM DẠNG KẾT QUẢ / CHIP (TẦNG 3) */}
      <Modal
        title={`Thêm Dạng kết quả mới cho: ${activeOrgan?.label}`}
        open={isAddOptionModalOpen}
        onOk={handleAddOption}
        onCancel={() => setIsAddOptionModalOpen(false)}
        okText="Thêm dạng kết quả"
        cancelText="Hủy"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>
              Tên hiển thị nút bấm (Chip Label): *
            </label>
            <Input
              placeholder="Ví dụ: Gan nhiễm mỡ độ II"
              value={newOptionForm.label}
              onChange={(e) => setNewOptionForm({ ...newOptionForm, label: e.target.value })}
            />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>
              Tính chất:
            </label>
            <Radio.Group
              value={newOptionForm.isNormal}
              onChange={(e) => setNewOptionForm({ ...newOptionForm, isNormal: e.target.value })}
            >
              <Radio value={false}>Bệnh lý / Bất thường</Radio>
              <Radio value={true}>Bình thường</Radio>
            </Radio.Group>
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>
              Áp dụng theo giới tính:
            </label>
            <Radio.Group
              value={newOptionForm.gender}
              onChange={(e) => setNewOptionForm({ ...newOptionForm, gender: e.target.value })}
            >
              <Radio value="ALL">Cả 2 giới</Radio>
              <Radio value="MALE">Chỉ Nam</Radio>
              <Radio value="FEMALE">Chỉ Nữ</Radio>
            </Radio.Group>
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>
              Câu văn y khoa tự sinh vào "Mô tả hình ảnh": *
            </label>
            <TextArea
              rows={3}
              placeholder="Ví dụ: Nhu mô gan tăng âm vừa, giảm âm vùng sâu vừa..."
              value={newOptionForm.text}
              onChange={(e) => setNewOptionForm({ ...newOptionForm, text: e.target.value })}
            />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>
              Câu kết luận gợi ý (tự sinh vào mục Kết luận):
            </label>
            <Input
              placeholder="Ví dụ: Hình ảnh gan nhiễm mỡ độ II."
              value={newOptionForm.conclusion}
              onChange={(e) => setNewOptionForm({ ...newOptionForm, conclusion: e.target.value })}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Admin5TierTemplate;

