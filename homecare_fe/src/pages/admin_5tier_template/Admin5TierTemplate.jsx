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

  // 1. Danh sách Template 5 Tầng
  const [templates, setTemplates] = useState([]);
  const [selectedTemplateCode, setSelectedTemplateCode] = useState('');
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
      if (list.length > 0 && !selectedTemplateCode) {
        setSelectedTemplateCode(list[0].code);
        if (list[0].organs?.length > 0) {
          setSelectedOrganKey(list[0].organs[0].key);
          if (list[0].organs[0].options?.length > 0) {
            const firstOpt = list[0].organs[0].options[0];
            setSelectedOptionId(firstOpt.id);
            setEditingOption({ ...firstOpt });
          }
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reloadTemplates();
  }, []);

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

  // Template đang chọn (Tầng 1)
  const activeTemplate = useMemo(() => {
    return templates.find((t) => t.code === selectedTemplateCode) || templates[0];
  }, [templates, selectedTemplateCode]);

  // Bộ phận đang chọn (Tầng 2)
  const activeOrgan = useMemo(() => {
    return (
      activeTemplate?.organs?.find((o) => o.key === selectedOrganKey) ||
      activeTemplate?.organs?.[0]
    );
  }, [activeTemplate, selectedOrganKey]);

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

    const updatedTemplates = templates.map((tpl) => {
      if (tpl.code !== activeTemplate.code) return tpl;
      return updatedTemplate;
    });

    setTemplates(updatedTemplates);
    await upsertClinicalTemplateToDB(updatedTemplate);
    message.success('Đã lưu bền vững câu mô tả & kết luận tự sinh vào Database HomeCare!');
  };

  // Thêm dạng kết quả (Tầng 3) VÀO DATABASE HOMECARE
  const handleAddOption = async () => {
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

    let updatedTemplate = null;
    const updatedTemplates = templates.map((tpl) => {
      if (tpl.code !== activeTemplate.code) return tpl;
      const updatedOrgans = tpl.organs.map((org) => {
        if (org.key !== activeOrgan.key) return org;
        return { ...org, options: [...org.options, newOpt] };
      });
      updatedTemplate = { ...tpl, organs: updatedOrgans };
      return updatedTemplate;
    });

    setTemplates(updatedTemplates);
    if (updatedTemplate) {
      await upsertClinicalTemplateToDB(updatedTemplate);
    }
    setSelectedOptionId(generatedId);
    setEditingOption(newOpt);
    setIsAddOptionModalOpen(false);
    setNewOptionForm({ id: '', label: '', isNormal: false, text: '', conclusion: '', gender: 'ALL' });
    message.success('Đã thêm dạng kết quả mới và lưu vào Database HomeCare!');
  };

  // Xóa dạng kết quả VÀO DATABASE HOMECARE
  const handleDeleteOption = async (optionId) => {
    let updatedTemplate = null;
    const updatedTemplates = templates.map((tpl) => {
      if (tpl.code !== activeTemplate.code) return tpl;
      const updatedOrgans = tpl.organs.map((org) => {
        if (org.key !== activeOrgan.key) return org;
        return { ...org, options: org.options.filter((o) => o.id !== optionId) };
      });
      updatedTemplate = { ...tpl, organs: updatedOrgans };
      return updatedTemplate;
    });

    setTemplates(updatedTemplates);
    if (updatedTemplate) {
      await upsertClinicalTemplateToDB(updatedTemplate);
    }
    message.success('Đã xóa dạng kết quả và cập nhật Database!');
  };

  // Thêm bộ phận (Tầng 2) VÀO DATABASE HOMECARE
  const handleAddOrgan = async () => {
    if (!newOrganForm.label) {
      message.error('Vui lòng nhập tên bộ phận!');
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

    let updatedTemplate = null;
    const updatedTemplates = templates.map((tpl) => {
      if (tpl.code !== activeTemplate.code) return tpl;
      updatedTemplate = { ...tpl, organs: [...(tpl.organs || []), newOrgan] };
      return updatedTemplate;
    });

    setTemplates(updatedTemplates);
    if (updatedTemplate) {
      await upsertClinicalTemplateToDB(updatedTemplate);
    }
    setSelectedOrganKey(generatedKey);
    setIsAddOrganModalOpen(false);
    setNewOrganForm({ key: '', label: '', defaultNormalText: '' });
    message.success('Đã thêm bộ phận mới và lưu Database!');
  };

  // Cập nhật thang điểm (Tầng 4) VÀO DATABASE HOMECARE
  const handleSaveClassification = async () => {
    const hasClass = selectedClassification !== CLASSIFICATION_TYPES.NONE;
    let updatedTemplate = null;
    const updatedTemplates = templates.map((tpl) => {
      if (tpl.code !== activeTemplate.code) return tpl;
      updatedTemplate = {
        ...tpl,
        classificationType: selectedClassification,
        hasClassification: hasClass,
      };
      return updatedTemplate;
    });

    setTemplates(updatedTemplates);
    if (updatedTemplate) {
      await upsertClinicalTemplateToDB(updatedTemplate);
    }
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
        {/* CỘT 1: MẪU CHỈ ĐỊNH / DỊCH VỤ (TẦNG 1) */}
        <div className={styles.colCard}>
          <div className={styles.colHeader}>
            <span className={styles.colTitle}>
              1. MẪU DỊCH VỤ ({templates.length})
            </span>
          </div>

          <div className={styles.itemsList}>
            {templates.map((tpl) => {
              const isSelected = tpl.code === activeTemplate?.code;
              return (
                <div
                  key={tpl.code}
                  className={`${styles.itemCard} ${isSelected ? styles.activeItem : ''}`}
                  onClick={() => {
                    setSelectedTemplateCode(tpl.code);
                    if (tpl.organs?.length > 0) {
                      setSelectedOrganKey(tpl.organs[0].key);
                    }
                  }}
                >
                  <div className={styles.itemTitle}>
                    <span>{tpl.title}</span>
                    <Tag color="cyan" style={{ fontSize: 10, margin: 0 }}>
                      {tpl.code}
                    </Tag>
                  </div>
                  <div className={styles.itemSub}>
                    {tpl.organs?.length || 0} bộ phận thăm khám
                    {tpl.hasClassification && (
                      <Tag color="orange" style={{ marginLeft: 6, fontSize: 10 }}>
                        {tpl.classificationType}
                      </Tag>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
                    <Button
                      size="small"
                      type="link"
                      icon={<SettingOutlined />}
                      style={{ padding: 0, fontSize: 11 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedClassification(tpl.classificationType || CLASSIFICATION_TYPES.NONE);
                        setIsClassificationModalOpen(true);
                      }}
                    >
                      Cài thang điểm
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CỘT 2: BỘ PHẬN TRONG MẪU (TẦNG 2) */}
        <div className={styles.colCard}>
          <div className={styles.colHeader}>
            <span className={styles.colTitle}>
              2. BỘ PHẬN ({activeTemplate?.organs?.length || 0})
            </span>
            <Button
              type="primary"
              size="small"
              icon={<PlusOutlined />}
              style={{ background: '#0b6b4f', borderColor: '#0b6b4f' }}
              onClick={() => setIsAddOrganModalOpen(true)}
            >
              Thêm
            </Button>
          </div>

          <div className={styles.itemsList}>
            {activeTemplate?.organs?.map((organ) => {
              const isSelected = organ.key === activeOrgan?.key;
              return (
                <div
                  key={organ.key}
                  className={`${styles.itemCard} ${isSelected ? styles.activeItem : ''}`}
                  onClick={() => setSelectedOrganKey(organ.key)}
                >
                  <div className={styles.itemTitle}>
                    <span>{organ.label}</span>
                    <span style={{ fontSize: 11, color: '#94a3b8' }}>
                      {organ.options?.length || 0} dạng
                    </span>
                  </div>
                  <div className={styles.itemSub}>
                    Mặc định: "{organ.defaultNormalText?.slice(0, 40)}..."
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CỘT 3: DẠNG KẾT QUẢ / CHIPS CỦA BỘ PHẬN (TẦNG 3) */}
        <div className={styles.colCard}>
          <div className={styles.colHeader}>
            <span className={styles.colTitle}>
              3. DẠNG KẾT QUẢ ({activeOrgan?.options?.length || 0})
            </span>
            <Button
              type="primary"
              size="small"
              icon={<PlusOutlined />}
              style={{ background: '#0b6b4f', borderColor: '#0b6b4f' }}
              onClick={() => setIsAddOptionModalOpen(true)}
            >
              Thêm
            </Button>
          </div>

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
                {activeTemplate?.title} → {activeOrgan?.label} → {editingOption.label || 'Chưa chọn'}
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

