import React from 'react';
import { Button, Tooltip, Input, Tag } from 'antd';
import { EditOutlined, ReloadOutlined, CopyOutlined } from '@ant-design/icons';
import styles from '../FastSonoSelector.module.scss';

export default function FastSonoNarrativeBox({
  isManualEdit,
  userEditedNarrative,
  liveNarrative,
  isEdit,
  onNarrativeUserEdit,
  onRestoreAutoNarrative,
  onCopyNarrative,
  onApplyToDiagnosisSummary,
}) {
  return (
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
              <Button size="small" icon={<ReloadOutlined />} onClick={onRestoreAutoNarrative}>
                Sinh lại từ chip
              </Button>
            </Tooltip>
          )}
          <Tooltip title="Sao chép văn bản mô tả">
            <Button size="small" icon={<CopyOutlined />} onClick={onCopyNarrative}>
              Sao chép
            </Button>
          </Tooltip>
          <Tooltip title="Tự động trích xuất kết luận bệnh lý vào ô Kết luận chẩn đoán [Alt + Enter]">
            <Button
              size="small"
              type="primary"
              style={{ background: '#0b6b4f', borderColor: '#0b6b4f' }}
              onClick={onApplyToDiagnosisSummary}
            >
              Bắn vào Kết luận [Alt+Enter]
            </Button>
          </Tooltip>
        </div>
      </div>

      <Input.TextArea
        value={userEditedNarrative !== null ? userEditedNarrative : liveNarrative}
        onChange={(e) => onNarrativeUserEdit(e.target.value)}
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
  );
}
