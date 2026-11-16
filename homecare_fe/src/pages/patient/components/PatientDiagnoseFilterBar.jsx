import React from 'react';
import { Button, Tooltip, Select, DatePicker } from 'antd';
import { SettingOutlined, ReloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { PATIENT_DIAGNOSE_STATUS_FILTER } from '../constant.patient';

const { RangePicker } = DatePicker;

const DATE_OPTIONS = [
  { label: 'Tất cả', value: null },
  { label: 'Hôm nay', value: 'today' },
  { label: 'Hôm qua', value: 'yesterday' },
  { label: 'Tuần này', value: 'this_week' },
  { label: 'Phạm vi', value: 'range' },
];

export default function PatientDiagnoseFilterBar({
  pendingFilters,
  setPendingFilters,
  setPage,
  setOpenColumnModal,
  deviceIsMobile,
}) {
  const handleClearFilters = () => {
    setPendingFilters({
      name: null,
      PID: null,
      SID: null,
      id_clinic: [],
      status: [],
      id_template_service: null,
      date_type: null,
      from_date: null,
      to_date: null,
    });
    setPage(1);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        background: '#ffffff',
        padding: '6px 8px',
        borderRadius: '6px',
        border: '1px solid #e2e8f0',
        marginBottom: '10px',
        width: '100%',
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          flexWrap: deviceIsMobile ? 'nowrap' : 'wrap',
          gap: '6px',
          width: '100%',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            flexWrap: deviceIsMobile ? 'nowrap' : 'wrap',
            flex: deviceIsMobile ? '1 1 0' : undefined,
            minWidth: 0,
            overflowX: deviceIsMobile ? 'auto' : undefined,
            scrollbarWidth: 'none',
          }}
        >
          {DATE_OPTIONS.map(({ label, value }) => {
            const isActive = pendingFilters.date_type === value;
            return (
              <Button
                key={value}
                size="small"
                onClick={() => {
                  setPendingFilters({
                    ...pendingFilters,
                    date_type: value,
                    ...(value !== 'range' && { from_date: null, to_date: null }),
                  });
                }}
                style={{
                  fontSize: deviceIsMobile ? '11px' : '12px',
                  height: deviceIsMobile ? 26 : 28,
                  padding: deviceIsMobile ? '0 8px' : '0 10px',
                  flexShrink: 0,
                  borderRadius: '4px',
                  border: isActive ? '1px solid #2563eb' : '1px solid #e2e8f0',
                  background: isActive ? '#2563eb' : '#f8fafc',
                  color: isActive ? '#ffffff' : '#475569',
                  fontWeight: isActive ? '600' : '500',
                  boxShadow: isActive ? '0 1px 3px rgba(37, 99, 235, 0.2)' : 'none',
                }}
              >
                {label}
              </Button>
            );
          })}
        </div>

        {!deviceIsMobile && pendingFilters.date_type === 'range' && (
          <RangePicker
            size="small"
            style={{ width: 210, height: 28, fontSize: '12px', borderRadius: '4px', borderColor: '#cbd5e1' }}
            onChange={(dates) =>
              setPendingFilters({
                ...pendingFilters,
                from_date: dates?.[0] ? dayjs(dates[0]).format('YYYY-MM-DD') : null,
                to_date: dates?.[1] ? dayjs(dates[1]).format('YYYY-MM-DD') : null,
              })
            }
          />
        )}

        {!deviceIsMobile && (
          <Select
            mode="multiple"
            size="small"
            allowClear
            maxTagCount="responsive"
            placeholder="Trạng thái"
            value={Array.isArray(pendingFilters.status) ? pendingFilters.status : []}
            onChange={(values) => setPendingFilters({ ...pendingFilters, status: values })}
            style={{ minWidth: 165, maxWidth: 230, height: 28 }}
            options={Object.entries(PATIENT_DIAGNOSE_STATUS_FILTER).map(([key, label]) => ({
              value: Number(key),
              label,
            }))}
          />
        )}

        {!deviceIsMobile && (
          <Tooltip title="Xóa tất cả bộ lọc">
            <Button
              size="small"
              icon={<ReloadOutlined style={{ fontSize: '12px' }} />}
              onClick={handleClearFilters}
              style={{ height: 28, fontSize: '12px', borderRadius: '4px', borderColor: '#cbd5e1', color: '#475569' }}
            >
              Xóa lọc
            </Button>
          </Tooltip>
        )}

        {!deviceIsMobile && <div style={{ flex: 1 }} />}

        <Tooltip title="Cấu hình cột">
          <Button
            size="small"
            onClick={() => setOpenColumnModal(true)}
            icon={<SettingOutlined style={{ fontSize: '14px', color: '#475569' }} />}
            style={{
              height: deviceIsMobile ? 26 : 28,
              width: deviceIsMobile ? 26 : 28,
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '4px',
              borderColor: '#cbd5e1',
              background: '#f8fafc',
            }}
          />
        </Tooltip>
      </div>

      {deviceIsMobile && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', width: '100%', flexWrap: 'wrap' }}>
          <Select
            mode="multiple"
            size="small"
            allowClear
            maxTagCount="responsive"
            placeholder="Trạng thái"
            value={Array.isArray(pendingFilters.status) ? pendingFilters.status : []}
            onChange={(values) => setPendingFilters({ ...pendingFilters, status: values })}
            style={{ flex: '1 1 0', minWidth: 0, height: 28 }}
            options={Object.entries(PATIENT_DIAGNOSE_STATUS_FILTER).map(([key, label]) => ({
              value: Number(key),
              label,
            }))}
          />
          <Button
            size="small"
            icon={<ReloadOutlined style={{ fontSize: '12px' }} />}
            onClick={handleClearFilters}
            style={{ height: 28, flexShrink: 0, fontSize: '11px', borderRadius: '4px', borderColor: '#cbd5e1', color: '#475569' }}
          >
            Xóa lọc
          </Button>
          {pendingFilters.date_type === 'range' && (
            <RangePicker
              size="small"
              style={{ width: '100%', height: 28, fontSize: '12px', borderRadius: '4px', borderColor: '#cbd5e1' }}
              onChange={(dates) =>
                setPendingFilters({
                  ...pendingFilters,
                  from_date: dates?.[0] ? dayjs(dates[0]).format('YYYY-MM-DD') : null,
                  to_date: dates?.[1] ? dayjs(dates[1]).format('YYYY-MM-DD') : null,
                })
              }
            />
          )}
        </div>
      )}
    </div>
  );
}
