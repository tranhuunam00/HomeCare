import React, { memo } from 'react';
import { Button, Tooltip } from 'antd';
import { CloseOutlined, IdcardOutlined } from '@ant-design/icons';
import DoctorUseDFormVer3 from '../../formver3/doctor_use_formver3/use/DoctorIUseFormVer3';

/**
 * Bảng ĐỌC KẾT QUẢ (reporting) chia đôi màn hình cạnh viewer DICOM.
 *
 * TỐI ƯU "VỪA ĐỌC VỪA XEM":
 * Form báo cáo (DoctorUseDFormVer3 ~744 dòng + SunEditor) rất nặng. Trước đây nó được
 * render INLINE trong PacsViewerPage nên mỗi lần kéo WW/WL, pan, cuộn lát hay chỉ di
 * chuột (probe HU) — các thao tác bắn tới 60 lần/giây — toàn trang re-render kéo theo
 * cả form này, gây giật khi bác sĩ vừa gõ báo cáo vừa xem ảnh.
 *
 * Tách ra component memo hoá với props ỔN ĐỊNH (chuỗi + callback useCallback) -> form
 * chỉ render 1 lần khi mở, mọi tương tác trên ảnh không còn đụng tới nó.
 */
function PacsReportingPanel({ patientDiagnoseId, patientName, onClose, onOpenPatientInfo }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        background: '#ffffff',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 14px',
          background: '#0b101b',
          borderBottom: '1px solid #1e293b',
          color: '#f8fafc',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontWeight: 700, fontSize: '13px', color: '#38bdf8' }}>
            BÁO CÁO KẾT QUẢ CHẨN ĐOÁN (D-RADS)
          </span>
          {patientName && (
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>· {patientName}</span>
          )}
          <Tooltip title="Xem thông tin bệnh nhân & ca chụp">
            <Button
              size="small"
              icon={<IdcardOutlined />}
              onClick={onOpenPatientInfo}
              style={{ backgroundColor: '#131b2e', borderColor: '#334155', color: '#38bdf8', fontWeight: 600 }}
            >
              Thông tin BN
            </Button>
          </Tooltip>
        </div>
        <Button
          size="small"
          type="text"
          icon={<CloseOutlined />}
          onClick={onClose}
          style={{ color: '#94a3b8' }}
        >
          Thu gọn
        </Button>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px' }}>
        <DoctorUseDFormVer3
          patient_diagnose_id={patientDiagnoseId}
          isUse={true}
          initEditMode={true}
          isSplitScreen={true}
        />
      </div>
    </div>
  );
}

export default memo(PacsReportingPanel);
