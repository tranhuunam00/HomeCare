import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Modal, Progress } from 'antd';
import { LoadingOutlined, InfoCircleOutlined } from '@ant-design/icons';
import axios from 'axios';
import { decodeInWorker } from '../services/decodeWorkerPool';
import PacsMprToolbar from './mpr/PacsMprToolbar';
import PacsMpr1x2View from './mpr/PacsMpr1x2View';
import PacsMpr2x2View from './mpr/PacsMpr2x2View';
import PacsMpr3DMaxView from './mpr/PacsMpr3DMaxView';
import PacsMprSinglePlaneView from './mpr/PacsMprSinglePlaneView';

const SINGLE_PLANES = ['AXIAL', 'CORONAL', 'SAGITTAL'];
const HOTKEY_LAYOUTS = { a: 'AXIAL', c: 'CORONAL', s: 'SAGITTAL', v: '3D_MAX' };
import { describeVolume, getVolumeValueRange } from '../services/pacsVolumeEngine';

// Ngưỡng bề mặt mặc định (HU) theo preset 3D cho CT
const CT_THRESHOLDS = { bone_shaded: 300, vascular: 180, soft_tissue: -400, bone: 200, grayscale: -1000, rainbow: -1000 };
const DEFAULT_ROT = { angleX: 0, angleY: 0 }; // nhìn thẳng từ phía trước, đầu hướng lên

/**
 * VR-PACS 3D Volume & Multi-Planar Reconstruction (MPR) Tool
 * Computes isotropic Axial, Sagittal, Coronal planes and 3D Ray-Casted Shaded Volume Rendering.
 */
export default function PacsMprModal({
  open,
  onClose,
  instances = [],
  dicomCache = {},
  setDicomCache,
  apiEndpoint = 'http://localhost:3001',
  getAuthHeaders = () => ({}),
  caseId,
  patientName = 'Bệnh nhân',
  modality = 'MR',
  // inline=true: render MPR thẳng vào viewport chính (không bọc Modal popup)
  inline = false,
}) {
  // "Đang hoạt động": với modal là khi mở; với inline là luôn (chỉ mount khi cần)
  const isActive = inline || open;
  const [downloadProgress, setDownloadProgress] = useState({
    loading: false,
    loaded: 0,
    total: 0,
    percent: 0,
  });

  const [localCache, setLocalCache] = useState(dicomCache);

  useEffect(() => {
    setLocalCache((prev) => ({ ...prev, ...dicomCache }));
  }, [dicomCache]);

  // Giữ nguyên tham chiếu mảng khi các lát không đổi -> khối voxel không bị dựng lại khi viewer tải nền series khác
  const validSlicesRef = useRef([]);
  const validSlices = useMemo(() => {
    const next = instances
      .map((inst, idx) => localCache[inst?.globalIndex ?? idx])
      .filter((item) => item && item.rawPixels && item.meta && item.decodeInfo?.ok !== false && !item.meta.isColor);
    const prev = validSlicesRef.current;
    if (prev.length === next.length && next.every((x, i) => x === prev[i])) return prev;
    validSlicesRef.current = next;
    return next;
  }, [instances, localCache]);

  const numSlices = validSlices.length;
  const sampleMeta = validSlices[0]?.meta || {};
  const rows = sampleMeta.rows || 256;
  const cols = sampleMeta.columns || 256;

  const [layoutMode, setLayoutMode] = useState('1x2');

  const [active2DPlane, setActive2DPlane] = useState('AXIAL');
  const [isControlsMinimized, setIsControlsMinimized] = useState(false);

  const [crosshair, setCrosshair] = useState({ x: 128, y: 128, z: 0 });
  const [rot3D, setRot3D] = useState(DEFAULT_ROT);
  const [threshold3D, setThreshold3D] = useState(CT_THRESHOLDS.bone_shaded);
  const [colorMode3D, setColorMode3DRaw] = useState('bone_shaded');
  const [isDragging3D, setIsDragging3D] = useState(false);

  // Phím tắt A / C / S / V: chuyển nhanh sang Axial / Coronal / Sagittal / 3D Volume
  useEffect(() => {
    if (!isActive) return undefined;
    const onKey = (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const tag = e.target?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || e.target?.isContentEditable) return;
      const next = HOTKEY_LAYOUTS[e.key?.toLowerCase()];
      if (next) {
        e.preventDefault();
        setLayoutMode(next);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isActive]);

  // Background fetch missing slices
  useEffect(() => {
    if (!isActive || instances.length <= 20) return;
    let isCancelled = false;

    const fetchAllSlices = async () => {
      const missingIndices = [];
      instances.forEach((inst, idx) => {
        const cacheKey = inst?.globalIndex ?? idx;
        if (!localCache[cacheKey]?.rawPixels) {
          missingIndices.push({ cacheKey, instance: inst });
        }
      });

      if (missingIndices.length === 0) {
        setDownloadProgress({ loading: false, loaded: instances.length, total: instances.length, percent: 100 });
        return;
      }

      setDownloadProgress({
        loading: true,
        loaded: instances.length - missingIndices.length,
        total: instances.length,
        percent: Math.round(((instances.length - missingIndices.length) / instances.length) * 100),
      });

      // Tải/giải mã song song nhiều hơn (giải mã đã ra khỏi luồng giao diện); cập nhật state theo lô lớn
      const batchSize = 8;
      const COMMIT_EVERY = 32;
      let completed = instances.length - missingIndices.length;
      let newSlices = {};

      for (let i = 0; i < missingIndices.length; i += batchSize) {
        if (isCancelled) break;
        const chunk = missingIndices.slice(i, i + batchSize);

        await Promise.all(
          chunk.map(async ({ cacheKey, instance }) => {
            try {
              const res = await axios.get(
                `${apiEndpoint}/api/pacs/instances/${instance.sopInstanceUid}/file${caseId ? `?patientDiagnoseId=${encodeURIComponent(caseId)}` : ''}`,
                { responseType: 'arraybuffer', headers: getAuthHeaders() }
              );
              // Giải nén trong Web Worker; buffer tải riêng cho MPR -> chuyển hẳn (không copy)
              const parsed = await decodeInWorker(res.data, instance.frameIndex || 0, { transfer: true });
              // Lát không giải mã chính xác được -> không đưa vào khối dựng hình
              if (parsed?.rawPixels && parsed.decodeInfo?.ok !== false && !parsed.meta?.isColor) {
                newSlices[cacheKey] = parsed;
              }
              completed++;
            } catch (err) {
              console.warn(`Lỗi tải lát cắt #${cacheKey}:`, err);
            }
          })
        );

        const isLast = i + batchSize >= missingIndices.length;
        if (!isCancelled && (isLast || Object.keys(newSlices).length >= COMMIT_EVERY)) {
          const commit = newSlices;
          newSlices = {};
          setLocalCache((prev) => ({ ...prev, ...commit }));
          if (setDicomCache) {
            setDicomCache((prev) => ({ ...prev, ...commit }));
          }
          setDownloadProgress({
            loading: completed < instances.length,
            loaded: completed,
            total: instances.length,
            percent: Math.round((completed / instances.length) * 100),
          });
        }
      }

      if (!isCancelled) {
        setDownloadProgress((prev) => ({ ...prev, loading: false, percent: 100 }));
      }
    };

    fetchAllSlices();
    return () => {
      isCancelled = true;
    };
  }, [isActive, instances, apiEndpoint, caseId, getAuthHeaders, setDicomCache]); // eslint-disable-line react-hooks/exhaustive-deps -- localCache chỉ đọc lúc mở

  // Synchronize crosshairs to center on slices loaded
  useEffect(() => {
    if (numSlices > 0) {
      setCrosshair({
        x: Math.floor(cols / 2),
        y: Math.floor(rows / 2),
        z: Math.floor(numSlices / 2),
      });
    }
  }, [numSlices, cols, rows]);

  // 3D Mouse Drag handling
  const lastMousePos = useRef({ x: 0, y: 0 });

  const handleMouseDown3D = (e) => {
    setIsDragging3D(true);
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove3D = (e) => {
    if (!isDragging3D) return;
    const dx = e.clientX - lastMousePos.current.x;
    const dy = e.clientY - lastMousePos.current.y;
    lastMousePos.current = { x: e.clientX, y: e.clientY };

    setRot3D((prev) => ({
      angleY: (prev.angleY + dx * 0.9) % 360,
      angleX: Math.max(-85, Math.min(85, prev.angleX - dy * 0.9)),
    }));
  };

  const handleMouseUp3D = () => {
    setIsDragging3D(false);
  };

  const handleReset3D = () => {
    setRot3D(DEFAULT_ROT);
    setColorMode3D('bone_shaded');
    if (numSlices > 0) {
      setCrosshair({
        x: Math.floor(cols / 2),
        y: Math.floor(rows / 2),
        z: Math.floor(numSlices / 2),
      });
    }
  };

  // Hình học khối & dải giá trị (CT: HU; MR: cường độ tín hiệu, không có HU)
  const isLoadingSlices = downloadProgress.loading;
  const volumeInfo = useMemo(() => (!isLoadingSlices && numSlices > 1 ? describeVolume(validSlices) : null), [isLoadingSlices, numSlices, validSlices]);
  const valueRange = useMemo(() => (!isLoadingSlices && numSlices > 1 ? getVolumeValueRange(validSlices) : null), [isLoadingSlices, numSlices, validSlices]);
  const isCT = (valueRange?.modality || modality) === 'CT';
  const thresholdRange = isCT ? [-1000, 2000] : valueRange ? [valueRange.min, valueRange.max] : [0, 1000];
  const thresholdUnit = isCT ? 'HU' : 'giá trị';

  const setColorMode3D = (mode) => {
    setColorMode3DRaw(mode);
    if (isCT) setThreshold3D(CT_THRESHOLDS[mode] ?? 300);
    else if (valueRange) setThreshold3D(Math.round(valueRange.min + (valueRange.max - valueRange.min) * 0.25));
  };

  // MR: đặt ngưỡng ban đầu theo dải tín hiệu thực tế
  useEffect(() => {
    if (valueRange && !isCT) setThreshold3D(Math.round(valueRange.min + (valueRange.max - valueRange.min) * 0.25));
  }, [valueRange, isCT]);

  const content = (
    <div
      style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}
      onMouseUp={handleMouseUp3D}
    >
        <PacsMprToolbar
          patientName={patientName}
          modality={modality}
          numSlices={numSlices}
          layoutMode={layoutMode}
          setLayoutMode={setLayoutMode}
          colorMode3D={colorMode3D}
          setColorMode3D={setColorMode3D}
          threshold3D={threshold3D}
          setThreshold3D={setThreshold3D}
          thresholdRange={thresholdRange}
          thresholdUnit={thresholdUnit}
          onReset3D={handleReset3D}
          isControlsMinimized={isControlsMinimized}
          setIsControlsMinimized={setIsControlsMinimized}
          onClose={onClose}
        />

        {volumeInfo && (
          <div
            style={{
              backgroundColor: volumeInfo.irregular || volumeInfo.tilt || !volumeInfo.calibrated ? '#422006' : '#0b1220',
              borderBottom: '1px solid #1e293b',
              padding: '4px 16px',
              fontSize: 11.5,
              color: volumeInfo.irregular || volumeInfo.tilt || !volumeInfo.calibrated ? '#fde68a' : '#94a3b8',
              fontFamily: 'monospace',
              display: 'flex',
              gap: 16,
              flexWrap: 'wrap',
            }}
          >
            <span>
              Voxel {volumeInfo.sx.toFixed(3)} × {volumeInfo.sy.toFixed(3)} × {volumeInfo.sz.toFixed(3)} mm ({volumeInfo.spacingSource})
            </span>
            <span>
              Kích thước khối {volumeInfo.extentMm.map((v) => v.toFixed(0)).join(' × ')} mm · {volumeInfo.n} lát
            </span>
            {!volumeInfo.calibrated && <span>⚠ Không có Pixel Spacing - tỉ lệ hình học không đảm bảo</span>}
            {volumeInfo.irregular && <span>⚠ Khoảng cách lát không đều (thiếu lát?) - MPR nội suy theo vị trí thật</span>}
            {volumeInfo.tilt && <span>⚠ Lát cắt nghiêng (gantry tilt) - MPR chưa hiệu chỉnh nghiêng</span>}
          </div>
        )}

        {numSlices > 0 && numSlices <= 4 && (
          <div
            style={{
              backgroundColor: '#172554',
              borderBottom: '1px solid #1e3a8a',
              padding: '6px 16px',
              fontSize: '12px',
              color: '#93c5fd',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <InfoCircleOutlined style={{ color: '#60a5fa' }} />
            <span>
              Ca chụp này hiện có {numSlices} lát cắt (ảnh 2D lát cắt ít). Hệ thống đã tự động nội suy
              không gian để các mặt cắt Sagittal & Coronal hiển thị đầy đặn.
            </span>
          </div>
        )}

        {downloadProgress.loading ? (
          <div
            style={{
              flex: 1,
              backgroundColor: '#0a0f1d',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 24,
            }}
          >
            <div
              style={{
                backgroundColor: '#0f172a',
                border: '1.5px solid #38bdf8',
                borderRadius: 12,
                boxShadow: '0 8px 32px rgba(0,0,0,0.8), 0 0 20px rgba(56, 189, 248, 0.3)',
                padding: '28px 36px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                maxWidth: 480,
                width: '100%',
              }}
            >
              <LoadingOutlined style={{ fontSize: 36, color: '#38bdf8', marginBottom: 16 }} spin />
              <div
                style={{
                  fontWeight: '800',
                  color: '#f8fafc',
                  fontSize: '15px',
                  letterSpacing: '0.5px',
                  marginBottom: 6,
                }}
              >
                ĐANG TẢI & NỘI SUY DỮ LIỆU KHÔNG GIAN 3D
              </div>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: 18, textAlign: 'center' }}>
                Đang nạp các lát cắt DICOM từ máy chủ PACS để tái tạo các mặt phẳng Axial, Sagittal, Coronal...
              </div>

              <Progress
                percent={downloadProgress.percent}
                status="active"
                strokeColor={{ '0%': '#0284c7', '100%': '#38bdf8' }}
                trailColor="#1e293b"
                style={{ width: '100%', marginBottom: 10 }}
              />

              <div style={{ fontSize: '11px', color: '#38bdf8', fontFamily: 'monospace' }}>
                Đã xử lý: {downloadProgress.loaded} / {downloadProgress.total} lát cắt ({downloadProgress.percent}%)
              </div>
            </div>
          </div>
        ) : layoutMode === '1x2' ? (
          <PacsMpr1x2View
            validSlices={validSlices}
            rot3D={rot3D}
            crosshair={crosshair}
            setCrosshair={setCrosshair}
            active2DPlane={active2DPlane}
            setActive2DPlane={setActive2DPlane}
            cols={cols}
            rows={rows}
            numSlices={numSlices}
            threshold3D={threshold3D}
            colorMode3D={colorMode3D}
            onMouseDown3D={handleMouseDown3D}
            onMouseMove3D={handleMouseMove3D}
            onMouseUp3D={handleMouseUp3D}
            isDragging3D={isDragging3D}
          />
        ) : SINGLE_PLANES.includes(layoutMode) ? (
          <PacsMprSinglePlaneView
            plane={layoutMode}
            validSlices={validSlices}
            crosshair={crosshair}
            setCrosshair={setCrosshair}
            cols={cols}
            rows={rows}
            numSlices={numSlices}
          />
        ) : layoutMode === '3D_MAX' ? (
          <PacsMpr3DMaxView
            validSlices={validSlices}
            rot3D={rot3D}
            cols={cols}
            rows={rows}
            numSlices={numSlices}
            threshold3D={threshold3D}
            colorMode3D={colorMode3D}
            onMouseDown3D={handleMouseDown3D}
            onMouseMove3D={handleMouseMove3D}
            onMouseUp3D={handleMouseUp3D}
            isDragging3D={isDragging3D}
          />
        ) : (
          <PacsMpr2x2View
            validSlices={validSlices}
            crosshair={crosshair}
            setCrosshair={setCrosshair}
            cols={cols}
            rows={rows}
            numSlices={numSlices}
            rot3D={rot3D}
            threshold3D={threshold3D}
            colorMode3D={colorMode3D}
            onMouseDown3D={handleMouseDown3D}
            onMouseMove3D={handleMouseMove3D}
            onMouseUp3D={handleMouseUp3D}
            isDragging3D={isDragging3D}
          />
        )}
    </div>
  );

  // Inline: hiển thị MPR thẳng trong viewport chính (không popup)
  if (inline) {
    return (
      <div
        className="pacs-root pacs-mpr-inline"
        style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#000', overflow: 'hidden' }}
      >
        {content}
      </div>
    );
  }

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width="96vw"
      style={{ top: '2vh', padding: 0 }}
      styles={{ body: { padding: 0, height: '94vh', display: 'flex', flexDirection: 'column', backgroundColor: '#000' } }}
      closable={false}
      rootClassName="pacs-root pacs-mpr-modal"
      destroyOnClose
    >
      {content}
    </Modal>
  );
}
