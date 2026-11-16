import React from 'react';
import { Tooltip, Button, Upload } from 'antd';
import { UploadOutlined, ReloadOutlined } from '@ant-design/icons';

export default function PacsSidebarHistory({
  study,
  currentMeta,
  instances = [],
  displaySlicePos = 0,
  displaySliceTotal = 1,
  onUploadDicom,
  onReloadStudy,
}) {
  return (
    <div style={{ padding: '8px 10px', borderBottom: '1px solid #1e293b' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 6,
        }}
      >
        <span
          style={{
            fontWeight: '700',
            color: '#94a3b8',
            fontSize: '11px',
            textTransform: 'uppercase',
          }}
        >
          History
        </span>
        <div style={{ display: 'flex', gap: 4 }}>
          <Upload showUploadList={false} beforeUpload={onUploadDicom} accept=".dcm,.zip">
            <Tooltip title="Tải thêm file DICOM">
              <Button
                size="small"
                type="text"
                icon={<UploadOutlined />}
                style={{ color: '#38bdf8', padding: '0 4px', height: 20 }}
              />
            </Tooltip>
          </Upload>
          <Tooltip title="Tải lại danh sách">
            <Button
              size="small"
              type="text"
              icon={<ReloadOutlined />}
              onClick={onReloadStudy}
              style={{ color: '#94a3b8', padding: '0 4px', height: 20 }}
            />
          </Tooltip>
        </div>
      </div>

      {instances.length > 0 && (
        <div
          style={{
            border: '1.5px solid #f59e0b',
            borderRadius: 4,
            backgroundColor: '#111827',
            padding: 6,
            cursor: 'pointer',
            position: 'relative',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            {(currentMeta?.modality || study?.modality) && (
              <span
                style={{
                  backgroundColor: '#b45309',
                  color: '#fff',
                  fontSize: '10px',
                  fontWeight: '700',
                  padding: '1px 4px',
                  borderRadius: 2,
                }}
              >
                {currentMeta?.modality || study?.modality}
              </span>
            )}
            <span style={{ fontSize: '10px', color: '#cbd5e1', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {currentMeta ? currentMeta.studyDate || '' : study?.dbPatient?.studyDate || study?.studyDate || ''}
            </span>
            <span
              style={{
                marginLeft: 'auto',
                backgroundColor: '#ef4444',
                color: '#fff',
                fontSize: '10px',
                fontWeight: '700',
                padding: '0 4px',
                borderRadius: 2,
              }}
            >
              {displaySlicePos + 1}/{displaySliceTotal}
            </span>
          </div>

          <div style={{ fontSize: '10px', color: '#94a3b8', lineHeight: '14px' }}>
            {(currentMeta ? currentMeta.patientName : study?.dbPatient?.patientName || study?.patientName) && (
              <div style={{ color: '#f8fafc', fontWeight: '600' }}>
                {currentMeta ? currentMeta.patientName : study?.dbPatient?.patientName || study?.patientName}
              </div>
            )}
            {(currentMeta
              ? currentMeta.patientAge || currentMeta.patientSex
              : study?.dbPatient?.patientAge || study?.dbPatient?.patientGender) && (
              <div>
                {(currentMeta
                  ? [currentMeta.patientAge, currentMeta.patientSex]
                  : [study?.dbPatient?.patientAge, study?.dbPatient?.patientGender]
                )
                  .filter(Boolean)
                  .join(' • ')}
              </div>
            )}
            {(currentMeta ? currentMeta.patientId : study?.dbPatient?.patientId || study?.patientId) && (
              <div>
                PID: {currentMeta ? currentMeta.patientId : study?.dbPatient?.patientId || study?.patientId}
              </div>
            )}
            {!currentMeta && study?.dbPatient?.patientSid && (
              <div>SID: {study.dbPatient.patientSid}</div>
            )}
            <div>File: DICOM ({displaySliceTotal} {displaySliceTotal === 1 ? 'slice' : 'slices'})</div>
          </div>
        </div>
      )}
    </div>
  );
}
