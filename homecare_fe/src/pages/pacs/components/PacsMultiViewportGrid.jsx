import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Tooltip, Dropdown, Slider, Button } from 'antd';
import {
  LinkOutlined,
  DisconnectOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
  DownOutlined,
} from '@ant-design/icons';
import { renderDicomToCanvas } from '../services/dicomDecoder';
import { PACS_TOOLS } from '../constants/pacs.constants';

export default function PacsMultiViewportGrid({
  layout = '1x2',
  seriesList = [],
  instances = [],
  dicomCache = {},
  activeViewport = 0,
  setActiveViewport,
  activeTool = PACS_TOOLS.PAN,
  windowCenter = 40,
  windowWidth = 400,
  invert = false,
  colorLut = 'default',
  patientName = '',
  patientId = '',
  study = null,
  onMaximizeTo1x1,
}) {
  // Number of viewports needed
  const cellCount = layout === '2x2' ? 4 : 2;

  // Sync scroll toggle
  const [syncScroll, setSyncScroll] = useState(true);

  // Per-viewport states: seriesUid, slicePos, zoom, pan
  const [cellsState, setCellsState] = useState(() => {
    return [0, 1, 2, 3].map((idx) => ({
      seriesUid: seriesList[idx]?.seriesUid || seriesList[0]?.seriesUid || null,
      slicePos: 0,
      zoom: 1.0,
      pan: { x: 0, y: 0 },
    }));
  });

  // Keep cell series valid if seriesList changes
  useEffect(() => {
    if (!seriesList.length) return;
    setCellsState((prev) =>
      prev.map((cell, idx) => {
        if (!cell.seriesUid || !seriesList.some((s) => s.seriesUid === cell.seriesUid)) {
          return {
            ...cell,
            seriesUid: seriesList[idx]?.seriesUid || seriesList[0]?.seriesUid || null,
            slicePos: 0,
          };
        }
        return cell;
      })
    );
  }, [seriesList]);

  // Update active viewport's series when parent changes activeSeriesUid externally
  const updateCellSeries = (viewportIdx, nextSeriesUid) => {
    setCellsState((prev) =>
      prev.map((cell, idx) =>
        idx === viewportIdx ? { ...cell, seriesUid: nextSeriesUid, slicePos: 0 } : cell
      )
    );
  };

  // Canvas refs for each viewport cell
  const canvasRefs = useRef({});

  // Helper to get instances for a cell
  const getCellInstances = useCallback(
    (seriesUid) => {
      const found = seriesList.find((s) => s.seriesUid === seriesUid);
      if (found && found.instances?.length) return found.instances;
      if (seriesList[0]?.instances?.length) return seriesList[0].instances;
      return instances;
    },
    [seriesList, instances]
  );

  // Redraw canvases
  useEffect(() => {
    for (let i = 0; i < cellCount; i++) {
      const canvas = canvasRefs.current[i];
      if (!canvas) continue;
      const cell = cellsState[i];
      const cellInsts = getCellInstances(cell?.seriesUid);
      if (!cellInsts || cellInsts.length === 0) continue;

      const safePos = Math.max(0, Math.min(cellInsts.length - 1, cell.slicePos || 0));
      const targetInst = cellInsts[safePos];
      const globalIdx = targetInst?.globalIndex ?? safePos;
      const cached = dicomCache[globalIdx];

      if (cached?.rawPixels && cached?.meta) {
        renderDicomToCanvas(canvas, cached.rawPixels, cached.meta, {
          windowCenter,
          windowWidth,
          invert,
          colorLut,
        });
      }
    }
  }, [cellsState, cellCount, dicomCache, getCellInstances, windowCenter, windowWidth, invert, colorLut]);

  // Handle Wheel on a viewport
  const handleCellWheel = (e, viewportIdx) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 1 : -1;

    setCellsState((prev) => {
      return prev.map((cell, idx) => {
        // If syncScroll is ON, scroll all visible cells; otherwise scroll only the target cell
        if (syncScroll || idx === viewportIdx) {
          const insts = getCellInstances(cell.seriesUid);
          if (insts.length <= 1) return cell;
          const nextPos = Math.max(0, Math.min(insts.length - 1, cell.slicePos + delta));
          return { ...cell, slicePos: nextPos };
        }
        return cell;
      });
    });
  };

  // Drag interaction for Pan / Zoom / WW_WL
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const dragCellIdx = useRef(0);

  const handleCellMouseDown = (e, viewportIdx) => {
    setActiveViewport(viewportIdx);
    isDragging.current = true;
    dragCellIdx.current = viewportIdx;
    dragStart.current = { x: e.clientX, y: e.clientY };
  };

  const handleCellMouseMove = (e) => {
    if (!isDragging.current) return;
    const idx = dragCellIdx.current;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    dragStart.current = { x: e.clientX, y: e.clientY };

    if (activeTool === PACS_TOOLS.PAN) {
      setCellsState((prev) =>
        prev.map((cell, i) =>
          i === idx ? { ...cell, pan: { x: cell.pan.x + dx, y: cell.pan.y + dy } } : cell
        )
      );
    } else if (activeTool === PACS_TOOLS.ZOOM) {
      const zoomFactor = dy < 0 ? 1.02 : 0.98;
      setCellsState((prev) =>
        prev.map((cell, i) =>
          i === idx ? { ...cell, zoom: Math.max(0.4, Math.min(5.0, cell.zoom * zoomFactor)) } : cell
        )
      );
    }
  };

  const handleCellMouseUp = () => {
    isDragging.current = false;
  };

  return (
    <div
      style={{
        flex: 1,
        backgroundColor: '#000000',
        display: 'grid',
        gridTemplateColumns: layout === '1x2' || layout === '2x2' ? '1fr 1fr' : '1fr',
        gridTemplateRows: layout === '2x1' || layout === '2x2' ? '1fr 1fr' : '1fr',
        gap: 3,
        padding: 3,
        position: 'relative',
        overflow: 'hidden',
        minHeight: 0,
      }}
      onMouseMove={handleCellMouseMove}
      onMouseUp={handleCellMouseUp}
    >
      {/* Sync Scroll & Global Grid Controls Floating Pill */}
      <div
        style={{
          position: 'absolute',
          top: 8,
          right: 12,
          zIndex: 30,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          backgroundColor: 'rgba(15, 23, 42, 0.85)',
          padding: '3px 8px',
          borderRadius: 6,
          border: '1px solid #334155',
          boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
        }}
      >
        <Tooltip title="Đồng bộ cuộn lát cắt giữa các khung hình (Dành cho so sánh T1 vs T2 hoặc CT Trước/Sau tiêm)">
          <Button
            size="small"
            type={syncScroll ? 'primary' : 'default'}
            icon={syncScroll ? <LinkOutlined /> : <DisconnectOutlined />}
            onClick={() => setSyncScroll((prev) => !prev)}
            style={{
              fontSize: '11px',
              backgroundColor: syncScroll ? '#0284c7' : '#1e293b',
              borderColor: syncScroll ? '#38bdf8' : '#334155',
              color: '#ffffff',
            }}
          >
            {syncScroll ? '🔗 Đồng bộ cuộn: BẬT' : 'Liên kết cuộn: TẮT'}
          </Button>
        </Tooltip>

        <span style={{ fontSize: '10px', color: '#94a3b8', fontFamily: 'monospace' }}>
          Bố cục: {layout}
        </span>
      </div>

      {/* Render Viewport Cells */}
      {[...Array(cellCount)].map((_, i) => {
        const cell = cellsState[i] || {};
        const cellInsts = getCellInstances(cell.seriesUid);
        const totalSlices = cellInsts.length;
        const currentPos = Math.max(0, Math.min(totalSlices - 1, cell.slicePos || 0));
        const currentInst = cellInsts[currentPos];
        const currentMeta = dicomCache[currentInst?.globalIndex ?? currentPos]?.meta || {};
        const isActive = activeViewport === i;

        // Series options for quick selection in cell
        const seriesMenuItems = seriesList.map((s, sIdx) => ({
          key: s.seriesUid,
          label: (
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, minWidth: 200 }}>
              <span>
                #{sIdx + 1}. {s.seriesDescription || `Series ${sIdx + 1}`}
              </span>
              <span style={{ color: '#38bdf8', fontFamily: 'monospace' }}>
                {s.instances?.length || 0} ảnh
              </span>
            </div>
          ),
          onClick: () => updateCellSeries(i, s.seriesUid),
        }));

        return (
          <div
            key={i}
            onClick={() => setActiveViewport(i)}
            onDoubleClick={() => onMaximizeTo1x1 && onMaximizeTo1x1(cell.seriesUid)}
            onWheel={(e) => handleCellWheel(e, i)}
            onMouseDown={(e) => handleCellMouseDown(e, i)}
            style={{
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: '#05070e',
              overflow: 'hidden',
              border: isActive ? '2px solid #38bdf8' : '1px solid #1e293b',
              borderRadius: 3,
              userSelect: 'none',
              cursor: activeTool === PACS_TOOLS.PAN ? 'grab' : 'default',
            }}
          >
            {/* Viewport Top Header */}
            <div
              style={{
                height: 28,
                backgroundColor: isActive ? 'rgba(14, 165, 233, 0.2)' : 'rgba(15, 23, 42, 0.75)',
                borderBottom: isActive ? '1px solid #0284c7' : '1px solid #1e293b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 8px',
                zIndex: 10,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span
                  style={{
                    backgroundColor: isActive ? '#0284c7' : '#1e293b',
                    color: '#ffffff',
                    fontSize: '9px',
                    fontWeight: '800',
                    padding: '1px 5px',
                    borderRadius: 2,
                  }}
                >
                  Ô {i + 1}
                </span>

                {/* Series Switcher Dropdown */}
                <Dropdown menu={{ items: seriesMenuItems }} trigger={['click']}>
                  <button
                    type="button"
                    style={{
                      background: 'none',
                      border: '1px solid #334155',
                      borderRadius: 3,
                      color: '#f8fafc',
                      fontSize: '11px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      padding: '2px 6px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      maxWidth: 180,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <span>{currentMeta.seriesDescription || `Nhóm ${cell.seriesUid ? i + 1 : 'Trống'}`}</span>
                    <DownOutlined style={{ fontSize: 9, color: '#94a3b8' }} />
                  </button>
                </Dropdown>

                <span style={{ fontSize: '10px', color: '#94a3b8', fontFamily: 'monospace' }}>
                  {currentMeta.modality || 'DICOM'}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '11px', color: '#38bdf8', fontFamily: 'monospace', fontWeight: '700' }}>
                  #{currentPos + 1}/{totalSlices || 1}
                </span>
                <Tooltip title="Nhấp đúp chuột để phóng to toàn màn hình">
                  <span style={{ color: '#64748b', fontSize: '11px', cursor: 'pointer' }}>
                    <FullscreenOutlined />
                  </span>
                </Tooltip>
              </div>
            </div>

            {/* Central Canvas Container */}
            <div
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              <div
                style={{
                  transform: `translate(${cell.pan.x}px, ${cell.pan.y}px) scale(${cell.zoom})`,
                  transformOrigin: 'center center',
                  transition: isDragging.current ? 'none' : 'transform 0.05s ease-out',
                }}
              >
                <canvas
                  ref={(el) => {
                    canvasRefs.current[i] = el;
                  }}
                  style={{
                    display: 'block',
                    maxWidth: '85%',
                    maxHeight: '85%',
                    imageRendering: 'pixelated',
                  }}
                />
              </div>

              {/* Patient Corner HUD (Micro) */}
              <div
                style={{
                  position: 'absolute',
                  top: 4,
                  left: 6,
                  fontSize: '9px',
                  color: '#94a3b8',
                  fontFamily: 'monospace',
                  pointerEvents: 'none',
                  lineHeight: '13px',
                }}
              >
                <div style={{ color: '#f8fafc', fontWeight: '700' }}>{patientName || currentMeta.patientName || ''}</div>
                <div>{patientId || currentMeta.patientId || ''}</div>
              </div>

              <div
                style={{
                  position: 'absolute',
                  bottom: 4,
                  right: 28,
                  fontSize: '9px',
                  color: '#64748b',
                  fontFamily: 'monospace',
                  pointerEvents: 'none',
                }}
              >
                WL: {windowCenter} WW: {windowWidth} | Zoom: {Math.round(cell.zoom * 100)}%
              </div>

              {/* Vertical Slice Scrub Slider on the right */}
              {totalSlices > 1 && (
                <div
                  style={{
                    position: 'absolute',
                    right: 4,
                    top: 10,
                    bottom: 10,
                    width: 14,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Slider
                    vertical
                    reverse
                    min={0}
                    max={totalSlices - 1}
                    value={currentPos}
                    onChange={(nextPos) => {
                      setCellsState((prev) =>
                        prev.map((c, idx) => (idx === i ? { ...c, slicePos: nextPos } : c))
                      );
                    }}
                    tooltip={{ formatter: (v) => `Lát cắt #${v + 1}/${totalSlices}` }}
                    style={{ margin: 0, padding: 0 }}
                  />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
