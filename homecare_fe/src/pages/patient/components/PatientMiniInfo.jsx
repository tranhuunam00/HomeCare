import React from 'react';
import { Row, Col, Divider } from 'antd';
import { calculateAge } from '../../formver3/formver3.constant';

export default function PatientMiniInfo({ patient, templateServices, examParts, isMobile = false }) {
  const displayData = {
    name: (patient?.name || '')?.toUpperCase(),
    gender: patient?.gender || '-',
    birth_year: patient?.birth_year || '',
    age: calculateAge(patient?.dob, patient?.birth_year) || '-',
    phone: patient?.phoneNumber || '-',
    PID: patient?.PID || '-',
    SID: patient?.SID || '-',
    CCCD: patient?.CCCD || '-',
    email: patient?.email || '-',
    clinical: patient?.Indication || 'Không có thông tin lâm sàng',
  };

  const indicationName = templateServices?.find(
    (t) => t.id == patient?.id_template_service
  )?.name || '-';

  const examPartName = examParts?.find(
    (t) => t.id == patient?.id_exam_part
  )?.name || '-';

  return (
    <div style={{ width: isMobile ? '100%' : 400, maxWidth: '100%', boxSizing: 'border-box', padding: isMobile ? '0' : '4px', fontFamily: 'Inter, sans-serif' }}>
      <div style={{
        background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
        padding: isMobile ? '10px 12px' : '12px 14px',
        borderRadius: '6px',
        marginBottom: '10px',
        border: '1px solid #bfdbfe'
      }}>
        <span style={{ color: '#2563eb', fontSize: '9px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          BỆNH NHÂN
        </span>
        <h4 style={{ margin: '2px 0 6px 0', fontSize: '15px', fontWeight: '700', color: '#1e3a8a' }}>
          {displayData.name}
        </h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: isMobile ? '6px 14px' : '16px', fontSize: '11px', color: '#1e40af' }}>
          <span>Giới tính: <strong>{displayData.gender}</strong></span>
          <span>Năm sinh: <strong>{displayData.birth_year}</strong></span>
          <span>Tuổi: <strong>{displayData.age}</strong></span>
        </div>
      </div>

      <Row gutter={[10, 8]} style={{ padding: '0 4px' }}>
        <Col xs={12} md={8}>
          <span style={{ color: '#8c8c8c', display: 'block', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.3px', marginBottom: 2 }}>PID</span>
          <span style={{ fontSize: '11px', fontWeight: '600', color: '#262626', wordBreak: 'break-word' }}>{displayData.PID}</span>
        </Col>
        <Col xs={12} md={8}>
          <span style={{ color: '#8c8c8c', display: 'block', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.3px', marginBottom: 2 }}>SID</span>
          <span style={{ fontSize: '11px', fontWeight: '600', color: '#262626', wordBreak: 'break-all', lineHeight: 1.1 }}>{displayData.SID}</span>
        </Col>
        <Col xs={12} md={8}>
          <span style={{ color: '#8c8c8c', display: 'block', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.3px', marginBottom: 2 }}>CCCD</span>
          <span style={{ fontSize: '11px', fontWeight: '600', color: '#262626', wordBreak: 'break-word' }}>{displayData.CCCD}</span>
        </Col>

        <Col xs={12} md={8}>
          <span style={{ color: '#8c8c8c', display: 'block', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.3px', marginBottom: 2 }}>Mã ca (ID)</span>
          <span style={{ fontSize: '11px', fontWeight: '600', color: '#262626' }}>{patient?.id}</span>
        </Col>
        <Col xs={12} md={8}>
          <span style={{ color: '#8c8c8c', display: 'block', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.3px', marginBottom: 2 }}>SĐT</span>
          <span style={{ fontSize: '11px', fontWeight: '600', color: '#262626' }}>{displayData.phone}</span>
        </Col>
        <Col xs={12} md={8}>
          <span style={{ color: '#8c8c8c', display: 'block', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.3px', marginBottom: 2 }}>Email</span>
          <span style={{ fontSize: '11px', fontWeight: '600', color: '#262626', wordBreak: 'break-all', lineHeight: 1.1 }}>{displayData.email}</span>
        </Col>

        <Col xs={12} md={12}>
          <span style={{ color: '#8c8c8c', display: 'block', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.3px', marginBottom: 2 }}>Chỉ định</span>
          <span style={{ fontSize: '11px', fontWeight: '600', color: '#262626' }}>{indicationName}</span>
        </Col>
        <Col xs={12} md={12}>
          <span style={{ color: '#8c8c8c', display: 'block', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.3px', marginBottom: 2 }}>Bộ phận khám</span>
          <span style={{ fontSize: '11px', fontWeight: '600', color: '#262626' }}>{examPartName}</span>
        </Col>
      </Row>

      <Divider style={{ margin: '10px 0' }} />

      <div style={{ padding: '0 4px' }}>
        <span style={{ color: '#c2410c', display: 'block', fontSize: '9px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>
          Thông tin lâm sàng
        </span>
        <div style={{
          background: '#fff7ed',
          border: '1px solid #ffedd5',
          borderRadius: '6px',
          padding: '8px 10px',
          fontSize: '11px',
          color: '#c2410c',
          fontWeight: '500',
          lineHeight: '1.4'
        }}>
          {displayData.clinical}
        </div>
      </div>
    </div>
  );
}
