import React, { useMemo } from 'react';
import { Spin, Tooltip } from 'antd';
import { WarningFilled, CheckCircleFilled, LoadingOutlined, StopOutlined } from '@ant-design/icons';
import {
  getOrientationLabels,
  transformOrientationLabels,
  getImagePlane,
  describeCalibration,
} from '../services/dicomImageCore';

/**
 * Lớp thông tin chồng trên khung xem (chuẩn hiển thị chẩn đoán):
 *  - 4 góc: bệnh nhân / ca chụp / series-lát / thông số hiển thị
 *  - Nhãn hướng giải phẫu 4 cạnh (cập nhật theo xoay/lật)
 *  - Thước tỉ lệ (chỉ khi có hiệu chuẩn)
 *  - Trạng thái ảnh: GỐC / XEM TRƯỚC / không hỗ trợ
 */

const hudText = {
  color: '#e5e7eb',
  fontSize: 11.5,
  lineHeight: '16px',
  fontFamily: "'JetBrains Mono', 'SFMono-Regular', Consolas, monospace",
  textShadow: '0 0 3px #000, 0 0 2px #000, 1px 1px 1px #000',
  pointerEvents: 'none',
  whiteSpace: 'nowrap',
};

const chip = (bg, fg, border) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 5,
  padding: '1px 7px',
  borderRadius: 3,
  fontSize: 10.5,
  fontWeight: 700,
  letterSpacing: 0.3,
  background: bg,
  color: fg,
  border: `1px solid ${border}`,
  textShadow: 'none',
  fontFamily: 'Inter, system-ui, sans-serif',
});

const VOI_SOURCE_LABEL = {
  dicom: 'DICOM',
  auto: 'Tự động',
  preset: 'Preset',
  user: 'Chỉnh tay',
  color: 'Ảnh màu',
  none: '',
};

function niceScaleLength(mmPerScreenPx) {
  // Chọn độ dài thước "đẹp" hiển thị khoảng 70-160px
  const candidates = [1, 2, 5, 10, 20, 50, 100, 200, 500];
  for (const mm of candidates) {
    const px = mm / mmPerScreenPx;
    if (px >= 70) return { mm, px };
  }
  const mm = 500;
  return { mm, px: mm / mmPerScreenPx };
}

const SAVE_LABELS = {
  saving: 'Đang lưu số đo…',
  retrying: 'Đang thử lưu lại…',
  saved: 'Đã lưu số đo lên máy chủ',
  error: 'CHƯA LƯU được số đo',
  'offline-restore': 'Chưa tải được số đo từ máy chủ',
};
const SAVE_COLORS = { saving: '#94a3b8', retrying: '#fbbf24', saved: '#4ade80', error: '#f87171', 'offline-restore': '#fbbf24' };

export default function PacsViewportOverlay({
  meta,
  instance,
  study,
  hasFull,
  hasPreview,
  loadError,
  decodeInfo,
  seriesLabel,
  slicePos = 0,
  sliceTotal = 1,
  windowCenter,
  windowWidth,
  voiSource,
  zoom = 1,
  rotation = 0,
  flipH = false,
  flipV = false,
  invert = false,
  probe,
  displaySize, // { width, height } kích thước layout ảnh (px) trước zoom
  measurementCount = 0,
  saveStatus,
}) {
  const db = study?.dbPatient;
  const m = meta || {};
  const inst = instance || {};

  const orientation = useMemo(() => {
    const base = getOrientationLabels(meta || instance || {});
    return transformOrientationLabels(base, { rotation, flipH, flipV });
  }, [meta, instance, rotation, flipH, flipV]);

  const calibration = describeCalibration(meta || (inst.pixelSpacing ? inst : null));
  const plane = getImagePlane(meta || inst);

  // Thông tin bệnh nhân: ưu tiên hồ sơ HomeCare (DICOM có thể đã bị ẩn danh / mã hoá bởi PACS nguồn)
  const patientName = db?.patientName || m.patientName || '';
  const patientId = db?.patientId || m.patientId || '';
  const sexAge = [db?.patientGender || m.patientSex, db?.patientAge || m.patientAge].filter(Boolean).join(' · ');
  const dob = db?.patientBirthYear ? `NS ${db.patientBirthYear}` : m.patientBirthDate ? `NS ${m.patientBirthDate}` : '';

  const modality = m.modality || inst.modality || '';
  const frameText = (inst.frameCount || 1) > 1 ? ` · Frame ${(inst.frameIndex || 0) + 1}/${inst.frameCount}` : '';
  const thickness = m.sliceThickness ?? inst.sliceThickness;
  const location = m.sliceLocation ?? inst.sliceLocation;

  // Thước tỉ lệ
  let scaleBar = null;
  const spacing = meta?.pixelSpacing;
  if (spacing && displaySize?.width && m.columns) {
    const screenPxPerImagePx = (displaySize.width * zoom) / m.columns;
    const mmPerScreenPx = spacing[1] / screenPxPerImagePx;
    scaleBar = niceScaleLength(mmPerScreenPx);
  }

  const isUnsupported = decodeInfo && decodeInfo.ok === false;

  return (
    <>
      {/* ===== Góc trên trái: Bệnh nhân ===== */}
      <div style={{ ...hudText, position: 'absolute', top: 8, left: 52, zIndex: 12 }}>
        {patientName && <div style={{ fontWeight: 700, fontSize: 12.5, color: '#fff' }}>{patientName}</div>}
        {patientId && <div>PID: {patientId}</div>}
        {(sexAge || dob) && <div>{[sexAge, dob].filter(Boolean).join(' · ')}</div>}
        {(m.studyDate || db?.studyDate) && <div>{[m.studyDate || db?.studyDate, m.studyTime].filter(Boolean).join(' ')}</div>}
        {m.accessionNumber && <div>Acc: {m.accessionNumber}</div>}
        {m.institutionName && /^[\p{L}\p{N}\s.,\-()]+$/u.test(m.institutionName) && <div style={{ opacity: 0.8 }}>{m.institutionName}</div>}
      </div>

      {/* ===== Góc trên phải: Ca chụp / Series / Lát ===== */}
      <div style={{ ...hudText, position: 'absolute', top: 8, right: 34, textAlign: 'right', zIndex: 12 }}>
        <div style={{ fontWeight: 700, color: '#fff' }}>
          {[modality, m.studyDescription].filter(Boolean).join(' · ')}
        </div>
        {seriesLabel && <div>{seriesLabel}</div>}
        <div style={{ color: '#fde68a', fontWeight: 700 }}>
          Ảnh {slicePos + 1}/{sliceTotal}
          {frameText}
        </div>
        {plane && <div>{plane}{m.bodyPartExamined ? ` · ${m.bodyPartExamined}` : ''}</div>}
        {Number.isFinite(location) && <div>Vị trí: {location.toFixed(2)} mm</div>}
        {Number.isFinite(thickness) && <div>Độ dày lát: {thickness} mm</div>}
        {modality === 'MR' && (Number.isFinite(m.repetitionTime) || Number.isFinite(m.echoTime)) && (
          <div>
            TR {m.repetitionTime ?? '-'} · TE {m.echoTime ?? '-'}
            {m.magneticFieldStrength ? ` · ${m.magneticFieldStrength}T` : ''}
          </div>
        )}
        {(modality === 'DX' || modality === 'CR') && (m.viewPosition || m.laterality) && (
          <div>{[m.viewPosition, m.laterality && `Bên ${m.laterality}`].filter(Boolean).join(' · ')}</div>
        )}
        {(m.kvp || m.exposureMas) && <div>{[m.kvp && `${m.kvp} kV`, m.exposureMas && `${m.exposureMas} mAs`].filter(Boolean).join(' · ')}</div>}
      </div>

      {/* ===== Góc dưới trái: Hiển thị & đầu dò ===== */}
      <div style={{ ...hudText, position: 'absolute', bottom: 8, left: 52, zIndex: 12 }}>
        {probe && (
          <div style={{ color: '#a5f3fc' }}>
            ({probe.x}, {probe.y}){' '}
            {probe.rgb
              ? `RGB ${probe.rgb.join(', ')}`
              : `${Number.isInteger(probe.value) ? probe.value : probe.value.toFixed(1)}${probe.unit ? ` ${probe.unit}` : ''}`}
          </div>
        )}
        {!m.isColor && Number.isFinite(windowWidth) && (
          <div>
            W {Math.round(windowWidth)} / L {Math.round(windowCenter)}
            {VOI_SOURCE_LABEL[voiSource] ? <span style={{ opacity: 0.7 }}> · {VOI_SOURCE_LABEL[voiSource]}</span> : null}
            {invert ? <span style={{ color: '#fca5a5' }}> · Đảo màu</span> : null}
          </div>
        )}
        <div>
          Zoom {Math.round(zoom * 100)}%
          {rotation ? ` · Xoay ${rotation}°` : ''}
          {flipH ? ' · Lật ngang' : ''}
          {flipV ? ' · Lật dọc' : ''}
        </div>
      </div>

      {/* ===== Góc dưới phải: Ma trận, hiệu chuẩn, chất lượng ảnh ===== */}
      <div
        style={{
          ...hudText,
          position: 'absolute',
          bottom: 8,
          right: 34,
          textAlign: 'right',
          zIndex: 12,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: 2,
        }}
      >
        <div style={{ display: 'flex', gap: 4, marginBottom: 2 }}>
          {isUnsupported ? (
            <span style={chip('rgba(127,29,29,0.9)', '#fecaca', '#ef4444')}>
              <StopOutlined /> KHÔNG HIỂN THỊ
            </span>
          ) : hasFull ? (
            <Tooltip title={`Dữ liệu gốc ${m.bitsStored || ''}-bit từ file DICOM - dùng để đọc & đo đạc`}>
              <span style={{ ...chip('rgba(6,78,59,0.88)', '#bbf7d0', '#10b981'), pointerEvents: 'auto' }}>
                <CheckCircleFilled /> ẢNH GỐC{m.bitsStored ? ` ${m.bitsStored}-BIT` : ''}
              </span>
            </Tooltip>
          ) : hasPreview ? (
            <Tooltip title="Ảnh JPEG 8-bit để cuộn nhanh. Không dùng để chẩn đoán / đo đạc. Ảnh gốc đang được tải.">
              <span style={{ ...chip('rgba(120,53,15,0.9)', '#fde68a', '#f59e0b'), pointerEvents: 'auto' }}>
                <LoadingOutlined /> XEM TRƯỚC · đang tải ảnh gốc
              </span>
            </Tooltip>
          ) : null}
          {m.lossyCompression && hasFull && (
            <Tooltip title={`Ảnh đã nén mất dữ liệu (${m.transferSyntaxName}${m.lossyCompressionRatio ? `, tỉ lệ ${m.lossyCompressionRatio}:1` : ''}). Cân nhắc khi đánh giá chi tiết nhỏ.`}>
              <span style={{ ...chip('rgba(127,29,29,0.85)', '#fecaca', '#f87171'), pointerEvents: 'auto' }}>
                <WarningFilled /> NÉN MẤT DỮ LIỆU
              </span>
            </Tooltip>
          )}
        </div>
        {m.columns ? (
          <div>
            {m.columns}×{m.rows}
            {m.transferSyntaxName && !m.isNonDicom ? <span style={{ opacity: 0.65 }}> · {m.transferSyntaxName}</span> : null}
          </div>
        ) : null}
        {(meta || inst.pixelSpacing) && (
          <div style={{ color: calibration.warning ? '#fcd34d' : undefined }}>
            {calibration.warning && <WarningFilled style={{ marginRight: 4 }} />}
            {calibration.label}
          </div>
        )}
        {measurementCount > 0 && <div style={{ opacity: 0.75 }}>{measurementCount} số đo trên lát này</div>}
        {saveStatus && saveStatus.state !== 'idle' && (
          <div style={{ color: SAVE_COLORS[saveStatus.state] || '#94a3b8' }} title={saveStatus.message || ''}>
            ● {SAVE_LABELS[saveStatus.state] || ''}
            {saveStatus.state === 'saved' && saveStatus.at ? ` ${new Date(saveStatus.at).toLocaleTimeString('vi-VN')}` : ''}
          </div>
        )}
      </div>

      {/* ===== Nhãn hướng giải phẫu ===== */}
      {orientation && hasFull !== undefined && (
        <>
          {[
            ['top', { top: 6, left: '50%', transform: 'translateX(-50%)' }],
            ['bottom', { bottom: 30, left: '50%', transform: 'translateX(-50%)' }],
            ['left', { left: 52, top: '50%', transform: 'translateY(-50%)' }],
            ['right', { right: 34, top: '50%', transform: 'translateY(-50%)' }],
          ].map(([side, pos]) =>
            orientation[side] ? (
              <div
                key={side}
                style={{
                  ...hudText,
                  position: 'absolute',
                  ...pos,
                  fontSize: 15,
                  fontWeight: 800,
                  color: '#fef3c7',
                  zIndex: 11,
                  marginTop: side === 'top' ? 0 : undefined,
                  // Tránh đè lên HUD góc
                  ...(side === 'left' || side === 'right' ? { marginTop: 0 } : {}),
                }}
              >
                {orientation[side]}
              </div>
            ) : null
          )}
        </>
      )}

      {/* ===== Thước tỉ lệ ===== */}
      {scaleBar && hasFull && (
        <div
          style={{
            position: 'absolute',
            bottom: 10,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 11,
            pointerEvents: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              width: scaleBar.px,
              height: 6,
              borderLeft: '1.5px solid #e5e7eb',
              borderRight: '1.5px solid #e5e7eb',
              borderBottom: '1.5px solid #e5e7eb',
              boxShadow: '0 1px 2px #000',
            }}
          />
          <div style={{ ...hudText, fontSize: 10.5, marginTop: 1 }}>
            {scaleBar.mm >= 10 ? `${scaleBar.mm / 10} cm` : `${scaleBar.mm} mm`}
          </div>
        </div>
      )}

      {/* ===== Trạng thái trung tâm ===== */}
      {isUnsupported && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 20,
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              maxWidth: 440,
              background: 'rgba(24, 10, 10, 0.92)',
              border: '1px solid #7f1d1d',
              borderRadius: 8,
              padding: '16px 20px',
              color: '#fecaca',
              textAlign: 'center',
              fontSize: 13,
              lineHeight: 1.55,
              boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
            }}
          >
            <StopOutlined style={{ fontSize: 26, color: '#f87171', marginBottom: 8 }} />
            <div style={{ fontWeight: 700, color: '#fff', marginBottom: 4 }}>Không hiển thị ảnh này</div>
            <div>{decodeInfo.reason}</div>
            <div style={{ marginTop: 8, fontSize: 11.5, color: '#fca5a5', opacity: 0.85 }}>
              Viewer không vẽ ảnh khi không giải mã chính xác được, để tránh sai lệch chẩn đoán.
            </div>
          </div>
        </div>
      )}

      {!isUnsupported && loadError && !hasFull && (
        <div style={{ position: 'absolute', bottom: 64, left: '50%', transform: 'translateX(-50%)', zIndex: 20 }}>
          <span style={chip('rgba(127,29,29,0.92)', '#fecaca', '#ef4444')}>
            <WarningFilled /> Lỗi tải ảnh gốc: {loadError}
          </span>
        </div>
      )}

      {!isUnsupported && !hasFull && !hasPreview && !loadError && instance && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            zIndex: 20,
            pointerEvents: 'none',
            color: '#94a3b8',
            fontSize: 12,
          }}
        >
          <Spin indicator={<LoadingOutlined style={{ fontSize: 28, color: '#38bdf8' }} spin />} />
          Đang tải ảnh...
        </div>
      )}
    </>
  );
}
