import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Modal, Progress } from 'antd';
import { CloseOutlined, LoadingOutlined, InfoCircleOutlined } from '@ant-design/icons';
import axios from 'axios';
import { parseDicomBuffer } from '../services/dicomDecoder';
import PacsMprToolbar from './mpr/PacsMprToolbar';
import PacsMpr1x2View from './mpr/PacsMpr1x2View';
import PacsMpr2x2View from './mpr/PacsMpr2x2View';
import PacsMpr3DMaxView from './mpr/PacsMpr3DMaxView';

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
  patientName = 'Bệnh nhân',
  modality = 'MR',
}) {
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

  const validSlices = useMemo(() => {
    return instances
      .map((inst, idx) => localCache[inst?.globalIndex ?? idx])
      .filter((item) => item && item.rawPixels && item.meta);
  }, [instances, localCache]);

  const numSlices = validSlices.length;
  const sampleMeta = validSlices[0]?.meta || {};
  const rows = sampleMeta.rows || 256;
  const cols = sampleMeta.columns || 256;

  const [layoutMode, setLayoutMode] = useState('1x2');
  const [active2DPlane, setActive2DPlane] = useState('AXIAL');
  const [isControlsMinimized, setIsControlsMinimized] = useState(false);

  const [crosshair, setCrosshair] = useState({ x: 128, y: 128, z: 0 });
  const [rot3D, setRot3D] = useState({ angleX: 18, angleY: 35 });
  const [threshold3D, setThreshold3D] = useState(modality === 'MR' ? 25 : 35);
  const [colorMode3D, setColorMode3D] = useState('bone_shaded');
  const [isDragging3D, setIsDragging3D] = useState(false);

  // Background fetch missing slices
  useEffect(() => {
    if (!open || instances.length <= 20) return;
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

      const batchSize = 4;
      let completed = instances.length - missingIndices.length;
      const newSlices = {};

      for (let i = 0; i < missingIndices.length; i += batchSize) {
        if (isCancelled) break;
        const chunk = missingIndices.slice(i, i + batchSize);

        await Promise.all(
          chunk.map(async ({ cacheKey, instance }) => {
            try {
              const res = await axios.get(
                `${apiEndpoint}/api/pacs/instances/${instance.sopInstanceUid}/file`,
                { responseType: 'arraybuffer', headers: getAuthHeaders() }
              );
              const parsed = parseDicomBuffer(res.data);
              newSlices[cacheKey] = parsed;
              completed++;
            } catch (err) {
              console.warn(`Lỗi tải lát cắt #${cacheKey}:`, err);
            }
          })
        );

        if (!isCancelled) {
          setLocalCache((prev) => ({ ...prev, ...newSlices }));
          if (setDicomCache) {
            setDicomCache((prev) => ({ ...prev, ...newSlices }));
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
  }, [open, instances, apiEndpoint, getAuthHeaders, setDicomCache]);

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
    setRot3D({ angleX: 18, angleY: 35 });
    setThreshold3D(modality === 'MR' ? 25 : 35);
    setColorMode3D('bone_shaded');
    if (numSlices > 0) {
      setCrosshair({
        x: Math.floor(cols / 2),
        y: Math.floor(rows / 2),
        z: Math.floor(numSlices / 2),
      });
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width="96vw"
      style={{ top: '2vh', padding: 0 }}
      styles={{ body: { padding: 0, height: '94vh', display: 'flex', flexDirection: 'column', backgroundColor: '#000' } }}
      closeIcon={<CloseOutlined style={{ color: '#fff', fontSize: 16 }} />}
      destroyOnClose
    >
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
          onReset3D={handleReset3D}
          isControlsMinimized={isControlsMinimized}
          setIsControlsMinimized={setIsControlsMinimized}
        />

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
    </Modal>
  );
}
