import React, { useState, useEffect, useLayoutEffect, useRef, useCallback, useMemo, memo } from 'react';
import { Tooltip, Dropdown } from 'antd';
import { DownOutlined, FullscreenOutlined } from '@ant-design/icons';
import { renderDicomToCanvas } from '../services/dicomDecoder';
import { getOrientationLabels } from '../services/dicomImageCore';
import { PACS_TOOLS, MAX_VIEWPORTS, findLayout, getLayoutCellCount } from '../constants/pacs.constants';
import { getPlaneGeometry, computeReferenceLine, findNearestSlice, planeCenter, areParallel } from '../utils/referenceGeometry';

const MEASURE_TOOLS = [PACS_TOOLS.LENGTH, PACS_TOOLS.ANGLE, PACS_TOOLS.ROI_ELLIPSE, PACS_TOOLS.ROI_RECT];
const HUD_FONT = { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace', fontSize: 10.5, lineHeight: '14px', textShadow: '0 0 3px #000, 0 0 2px #000' };

/** Metadata đầy đủ nhất đang có cho 1 lát: meta đã giải mã (chính xác) > metadata máy chủ */
const bestMeta = (cached, inst) => (cached?.meta ? { ...inst, ...cached.meta } : inst);

/**
 * 1 ô của lưới: tự khớp ảnh theo tỉ lệ VẬT LÝ trong ô, vẽ ảnh + đường tham chiếu + HUD.
 * Toàn bộ thao tác chuột do lưới cha xử lý (để đồng bộ giữa các ô).
 */
const GridCell = memo(function GridCell({
  index,
  isActive,
  inst,
  cached,
  preview,
  voi,
  invert,
  colorLut,
  isSmooth,
  zoom,
  pan,
  refLine,
  slicePos,
  sliceTotal,
  seriesTitle,
  seriesMenuItems,
  activeTool,
  onMouseDown,
  onWheel,
  onDoubleClick,
  onSeek,
}) {
  const areaRef = useRef(null);
  const canvasRef = useRef(null);
  const lineCanvasRef = useRef(null);
  const [area, setArea] = useState({ w: 0, h: 0 });

  const meta = bestMeta(cached, inst);
  const hasFull = !!(cached?.rawPixels && cached?.meta && cached.decodeInfo?.ok !== false);
  const W = meta?.columns || 0;
  const H = meta?.rows || 0;
  const spOk = Array.isArray(meta?.pixelSpacing) && meta.pixelSpacing[0] > 0 && meta.pixelSpacing[1] > 0;
  const spRow = spOk ? meta.pixelSpacing[0] : 1;
  const spCol = spOk ? meta.pixelSpacing[1] : 1;

  useLayoutEffect(() => {
    const el = areaRef.current;
    if (!el) return undefined;
    const measure = () => setArea((prev) => (prev.w === el.clientWidth && prev.h === el.clientHeight ? prev : { w: el.clientWidth, h: el.clientHeight }));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Khớp theo tỉ lệ vật lý (cột × spacing cột : hàng × spacing hàng)
  const display = useMemo(() => {
    if (!W || !H || !area.w || !area.h) return null;
    const physW = W * spCol;
    const physH = H * spRow;
    const fit = Math.min((area.w - 22) / physW, (area.h - 8) / physH);
    return { w: Math.max(1, Math.round(physW * fit)), h: Math.max(1, Math.round(physH * fit)) };
  }, [W, H, spRow, spCol, area.w, area.h]);

  // Vẽ ảnh
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (hasFull) {
      renderDicomToCanvas(canvas, cached.rawPixels, cached.meta, {
        windowCenter: voi?.center ?? cached.meta.windowCenter,
        windowWidth: voi?.width ?? cached.meta.windowWidth,
        invert,
        colorLut,
        isSmooth,
      });
    } else if (preview && W && H) {
      renderDicomToCanvas(canvas, preview, { rows: H, columns: W }, { invert, isSmooth });
    } else {
      canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
    }
  }, [hasFull, cached, preview, W, H, voi?.center, voi?.width, invert, colorLut, isSmooth]);

  // Đường tham chiếu: vẽ theo toạ độ pixel ảnh, nét luôn ~1.5px trên màn hình
  useEffect(() => {
    const c = lineCanvasRef.current;
    if (!c || !W || !H) return;
    if (c.width !== W) c.width = W;
    if (c.height !== H) c.height = H;
    const ctx = c.getContext('2d');
    ctx.clearRect(0, 0, W, H);
    if (!refLine || !display) return;
    const pxPerScreen = W / (display.w * zoom);
    ctx.save();
    ctx.strokeStyle = 'rgba(250, 204, 21, 0.9)';
    ctx.lineWidth = 1.5 * pxPerScreen;
    ctx.shadowColor = 'rgba(0,0,0,0.9)';
    ctx.shadowBlur = 2 * pxPerScreen;
    ctx.beginPath();
    ctx.moveTo(refLine[0].x, refLine[0].y);
    ctx.lineTo(refLine[1].x, refLine[1].y);
    ctx.stroke();
    ctx.restore();
  }, [refLine, W, H, display, zoom]);

  // Wheel non-passive (chặn cuộn trang / zoom trình duyệt)
  const wheelRef = useRef(onWheel);
  wheelRef.current = onWheel;
  useEffect(() => {
    const el = areaRef.current;
    if (!el) return undefined;
    const h = (e) => {
      e.preventDefault();
      wheelRef.current?.(e, index);
    };
    el.addEventListener('wheel', h, { passive: false });
    return () => el.removeEventListener('wheel', h);
  }, [index]);

  const labels = getOrientationLabels(meta);
  const loc = Number.isFinite(meta?.sliceLocation) ? meta.sliceLocation : meta?.imagePositionPatient?.[2];
  const cursor = activeTool === PACS_TOOLS.WW_WL ? 'ns-resize' : activeTool === PACS_TOOLS.ZOOM ? 'zoom-in' : 'grab';
  const accent = isActive ? '#f59e0b' : '#1e293b';

  return (
    <div
      onMouseDown={(e) => onMouseDown(e, index)}
      onDoubleClick={() => onDoubleClick(index)}
      onContextMenu={(e) => e.preventDefault()}
      style={{
        gridArea: `c${index}`,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
        minHeight: 0,
        backgroundColor: '#000',
        overflow: 'hidden',
        outline: `${isActive ? 2 : 1}px solid ${accent}`,
        outlineOffset: -1,
        userSelect: 'none',
      }}
    >
      {/* Thanh tiêu đề ô */}
      <div
        style={{
          height: 24,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '0 6px',
          background: isActive ? 'rgba(245, 158, 11, 0.14)' : '#0b1220',
          borderBottom: '1px solid #1e293b',
        }}
      >
        <span style={{ fontSize: 9.5, fontWeight: 800, color: isActive ? '#fbbf24' : '#64748b', minWidth: 14 }}>{index + 1}</span>
        <Dropdown menu={{ items: seriesMenuItems }} trigger={['click']}>
          <button type="button" className="pacs-cell-series-btn" onMouseDown={(e) => e.stopPropagation()}>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{seriesTitle || 'Chọn series'}</span>
            <DownOutlined style={{ fontSize: 8, color: '#94a3b8', flexShrink: 0 }} />
          </button>
        </Dropdown>
        <span style={{ marginLeft: 'auto', fontSize: 10.5, color: '#38bdf8', fontFamily: 'monospace', fontWeight: 700 }}>
          {sliceTotal ? `${slicePos + 1}/${sliceTotal}` : ''}
        </span>
        <Tooltip title="Mở ô này ở chế độ 1x1 (hoặc nháy đúp vào ảnh)">
          <button type="button" className="pacs-icon-btn" onMouseDown={(e) => e.stopPropagation()} onClick={() => onDoubleClick(index)}>
            <FullscreenOutlined />
          </button>
        </Tooltip>
      </div>

      {/* Vùng ảnh */}
      <div ref={areaRef} style={{ position: 'relative', flex: 1, minHeight: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', cursor }}>
        <div
          style={{
            position: 'relative',
            width: display?.w,
            height: display?.h,
            visibility: display && (hasFull || preview) ? 'visible' : 'hidden',
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'center center',
          }}
        >
          <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', imageRendering: isSmooth ? 'auto' : 'pixelated' }} />
          <canvas ref={lineCanvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} />
        </div>

        {!hasFull && !preview && inst && <div style={{ position: 'absolute', color: '#475569', fontSize: 11 }}>Đang tải ảnh…</div>}

        {/* Nhãn hướng */}
        {labels && (
          <>
            <span style={{ ...HUD_FONT, position: 'absolute', top: 2, left: '50%', transform: 'translateX(-50%)', color: '#fde68a', fontWeight: 700 }}>{labels.top}</span>
            <span style={{ ...HUD_FONT, position: 'absolute', bottom: 2, left: '50%', transform: 'translateX(-50%)', color: '#fde68a', fontWeight: 700 }}>{labels.bottom}</span>
            <span style={{ ...HUD_FONT, position: 'absolute', left: 4, top: '50%', transform: 'translateY(-50%)', color: '#fde68a', fontWeight: 700 }}>{labels.left}</span>
            <span style={{ ...HUD_FONT, position: 'absolute', right: 20, top: '50%', transform: 'translateY(-50%)', color: '#fde68a', fontWeight: 700 }}>{labels.right}</span>
          </>
        )}

        {/* HUD góc */}
        <div style={{ ...HUD_FONT, position: 'absolute', top: 4, left: 6, color: '#cbd5e1', pointerEvents: 'none' }}>
          <div>{meta?.modality || ''}{Number.isFinite(meta?.sliceThickness) ? ` · Dày ${meta.sliceThickness} mm` : ''}</div>
          {Number.isFinite(loc) && <div>Vị trí {Number(loc).toFixed(1)} mm</div>}
        </div>
        <div style={{ ...HUD_FONT, position: 'absolute', bottom: 4, left: 6, color: '#cbd5e1', pointerEvents: 'none' }}>
          <div>
            W {Math.round(voi?.width ?? meta?.windowWidth ?? 0)} / L {Math.round(voi?.center ?? meta?.windowCenter ?? 0)}
          </div>
          <div>Zoom {Math.round(zoom * 100)}%</div>
        </div>
        <div style={{ ...HUD_FONT, position: 'absolute', top: 4, right: 20, pointerEvents: 'none', textAlign: 'right' }}>
          {hasFull ? (
            <span style={{ color: cached?.decodeInfo?.lossy ? '#fbbf24' : '#4ade80' }}>{cached?.decodeInfo?.lossy ? 'NÉN MẤT DỮ LIỆU' : 'ẢNH GỐC'}</span>
          ) : preview ? (
            <span style={{ color: '#fbbf24' }}>XEM TRƯỚC</span>
          ) : null}
        </div>

        {/* Thanh cuộn lát */}
        {sliceTotal > 1 && (
          <div
            className="pacs-cell-scroll"
            onMouseDown={(e) => {
              e.stopPropagation();
              const track = e.currentTarget;
              const seek = (y) => {
                const r = track.getBoundingClientRect();
                onSeek(index, Math.round(Math.max(0, Math.min(1, (y - r.top) / r.height)) * (sliceTotal - 1)));
              };
              seek(e.clientY);
              const move = (ev) => seek(ev.clientY);
              const up = () => {
                window.removeEventListener('mousemove', move);
                window.removeEventListener('mouseup', up);
              };
              window.addEventListener('mousemove', move);
              window.addEventListener('mouseup', up);
            }}
          >
            <div style={{ position: 'absolute', left: -1, width: 10, height: 14, borderRadius: 3, background: isActive ? '#f59e0b' : '#0ea5e9', top: `calc(${(slicePos / (sliceTotal - 1)) * 100}% - 7px)` }} />
          </div>
        )}
      </div>
    </div>
  );
});

export default function PacsMultiViewportGrid({
  layout = '1x2',
  seriesList = [],
  dicomCache = {},
  previewCache = {},
  requestInstance,
  voiBySeries = {},
  setVoiBySeries,
  activeViewport = 0,
  setActiveViewport,
  activeTool = PACS_TOOLS.PAN,
  invert = false,
  colorLut = 'default',
  isSmooth = true,
  currentIndex = 0,
  onActiveSliceChange,
  onMaximize,
  sync = { scroll: true, window: false, zoomPan: false, refLines: true },
}) {
  const layoutDef = findLayout(layout);
  const cellCount = getLayoutCellCount(layoutDef);

  /* ---------- Tra cứu series / vị trí ---------- */
  const seriesByUid = useMemo(() => new Map(seriesList.map((s) => [s.seriesUid, s])), [seriesList]);
  const locateGlobal = useMemo(() => {
    const m = new Map();
    seriesList.forEach((s) => s.instances.forEach((inst, pos) => m.set(inst.globalIndex, { seriesUid: s.seriesUid, pos })));
    return m;
  }, [seriesList]);
  const instsOf = useCallback((uid) => seriesByUid.get(uid)?.instances || [], [seriesByUid]);

  /* ---------- Trạng thái từng ô ---------- */
  const [cells, setCells] = useState(() =>
    Array.from({ length: MAX_VIEWPORTS }, (_, i) => {
      const s = seriesList[i % Math.max(1, seriesList.length)];
      return { seriesUid: s?.seriesUid || null, slicePos: s ? Math.floor((s.instances.length - 1) / 2) : 0, zoom: 1, pan: { x: 0, y: 0 } };
    })
  );
  const cellsRef = useRef(cells);
  cellsRef.current = cells;

  // Series bị xoá / danh sách đổi -> gán lại series hợp lệ
  useEffect(() => {
    if (!seriesList.length) return;
    setCells((prev) => {
      let changed = false;
      const next = prev.map((c, i) => {
        if (c.seriesUid && seriesByUid.has(c.seriesUid)) return c;
        changed = true;
        const s = seriesList[i % seriesList.length];
        return { ...c, seriesUid: s.seriesUid, slicePos: Math.floor((s.instances.length - 1) / 2) };
      });
      return changed ? next : prev;
    });
  }, [seriesList, seriesByUid]);

  const globalOf = useCallback(
    (cell) => {
      const insts = instsOf(cell?.seriesUid);
      if (!insts.length) return undefined;
      return insts[Math.max(0, Math.min(insts.length - 1, cell.slicePos))].globalIndex;
    },
    [instsOf]
  );
  const geomOf = useCallback((globalIdx, inst) => getPlaneGeometry(bestMeta(dicomCache[globalIdx], inst)), [dicomCache]);

  /**
   * Ô đang chọn LUÔN phản chiếu currentIndex của trang (dải lát, phím mũi tên, cine, preset... dùng chung).
   * Khi ô đang chọn đổi lát -> các ô khác đồng bộ: cùng hướng cắt = lát gần nhất theo VỊ TRÍ (mm),
   * không có hình học (X-quang) = cùng bước nhảy, khác hướng cắt = giữ nguyên (đã có đường tham chiếu).
   */
  const lastActive = useRef({ viewport: -1, globalIdx: -1, seriesUid: null, pos: 0 });
  useEffect(() => {
    const loc = locateGlobal.get(currentIndex);
    if (!loc) return;
    const prevCells = cellsRef.current;
    const av = Math.min(activeViewport, cellCount - 1);
    const last = lastActive.current;
    const moved = last.viewport === av && last.globalIdx !== currentIndex;
    const next = prevCells.slice();
    next[av] = { ...next[av], seriesUid: loc.seriesUid, slicePos: loc.pos };

    if (moved && sync.scroll) {
      const srcInsts = instsOf(loc.seriesUid);
      const srcGeom = geomOf(currentIndex, srcInsts[loc.pos]);
      const delta = last.seriesUid === loc.seriesUid ? loc.pos - last.pos : 0;
      for (let j = 0; j < cellCount; j++) {
        if (j === av) continue;
        const c = next[j];
        const insts = instsOf(c.seriesUid);
        if (insts.length <= 1) continue;
        let pos = null;
        const tgtGeom = getPlaneGeometry(insts[0]);
        if (c.seriesUid !== loc.seriesUid && srcGeom && tgtGeom) {
          if (areParallel(srcGeom, tgtGeom)) pos = findNearestSlice(insts, planeCenter(srcGeom), srcGeom)?.index ?? null;
        } else if (delta) {
          pos = Math.max(0, Math.min(insts.length - 1, c.slicePos + delta));
        }
        if (pos !== null && pos !== c.slicePos) next[j] = { ...c, slicePos: pos };
      }
    }
    lastActive.current = { viewport: av, globalIdx: currentIndex, seriesUid: loc.seriesUid, pos: loc.pos };
    if (next.some((c, i) => c !== prevCells[i])) setCells(next);
  }, [currentIndex, activeViewport, cellCount, locateGlobal, instsOf, geomOf, sync.scroll]);

  // Ô đang chọn vượt quá số ô của bố cục mới -> về ô 1
  useEffect(() => {
    if (activeViewport >= cellCount) setActiveViewport?.(0);
  }, [activeViewport, cellCount, setActiveViewport]);

  /** Kích hoạt ô i ở lát pos: đi qua currentIndex của trang để mọi thành phần cùng cập nhật */
  const goto = useCallback(
    (i, pos) => {
      const c = cellsRef.current[i];
      const insts = instsOf(c?.seriesUid);
      if (!insts.length) return;
      const p = Math.max(0, Math.min(insts.length - 1, pos));
      if (i !== activeViewport) {
        // Đổi ô: đánh dấu vị trí cũ của ô này để lần cuộn đầu tiên vẫn đồng bộ các ô khác
        lastActive.current = { viewport: i, globalIdx: globalOf(c), seriesUid: c.seriesUid, pos: c.slicePos };
        setActiveViewport?.(i);
      }
      onActiveSliceChange?.(insts[p].globalIndex);
    },
    [activeViewport, instsOf, globalOf, setActiveViewport, onActiveSliceChange]
  );

  // Ưu tiên tải lát đang hiện ở mọi ô
  useEffect(() => {
    for (let i = 0; i < cellCount; i++) {
      const g = globalOf(cells[i]);
      if (g !== undefined && !dicomCache[g]) requestInstance?.(g, i === activeViewport ? 0 : 1);
    }
  }, [cells, cellCount, dicomCache, globalOf, requestInstance, activeViewport]);

  /* ---------- Đồng bộ WW/WL giữa các series cùng modality ---------- */
  const activeUid = cells[Math.min(activeViewport, cellCount - 1)]?.seriesUid;
  const activeVoi = activeUid ? voiBySeries[activeUid] : undefined;
  useEffect(() => {
    if (!sync.window || !activeUid || !setVoiBySeries) return;
    const modality = instsOf(activeUid)[0]?.modality;
    const targets = [...new Set(cells.slice(0, cellCount).map((c) => c.seriesUid))].filter((u) => u && u !== activeUid && instsOf(u)[0]?.modality === modality);
    if (!targets.length) return;
    setVoiBySeries((prev) => {
      let changed = false;
      const next = { ...prev };
      for (const u of targets) {
        if (!activeVoi) {
          if (next[u]) {
            delete next[u];
            changed = true;
          }
        } else if (next[u]?.center !== activeVoi.center || next[u]?.width !== activeVoi.width) {
          next[u] = { ...activeVoi };
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [sync.window, activeUid, activeVoi, cells, cellCount, instsOf, setVoiBySeries]);

  /* ---------- Chuột ---------- */
  const drag = useRef(null);

  const patchCells = useCallback(
    (i, fn) => {
      setCells((prev) => prev.map((c, j) => (j === i || (sync.zoomPan && j < cellCount) ? fn(c) : c)));
    },
    [sync.zoomPan, cellCount]
  );

  const handleMouseDown = useCallback(
    (e, i) => {
      if (i !== activeViewport) goto(i, cellsRef.current[i].slicePos);
      const c = cellsRef.current[i];
      const g = globalOf(c);
      const meta = bestMeta(dicomCache[g], instsOf(c.seriesUid)[c.slicePos]);
      const voi = voiBySeries[c.seriesUid] || { center: meta?.windowCenter ?? 127.5, width: meta?.windowWidth ?? 256 };
      let mode = 'pan';
      if (e.button === 2 || (e.button === 0 && activeTool === PACS_TOOLS.WW_WL)) mode = 'voi';
      else if (e.button === 0 && activeTool === PACS_TOOLS.ZOOM) mode = 'zoom';
      const range = Number.isFinite(meta?.maxPixelValue) && Number.isFinite(meta?.minPixelValue) ? meta.maxPixelValue - meta.minPixelValue : 1024;
      drag.current = { i, mode, x: e.clientX, y: e.clientY, pan: { ...c.pan }, voi, uid: c.seriesUid, sens: Math.max(1, range / 600) };

      const move = (ev) => {
        const d = drag.current;
        if (!d) return;
        const dx = ev.clientX - d.x;
        const dy = ev.clientY - d.y;
        if (d.mode === 'pan') {
          patchCells(d.i, (cc) => ({ ...cc, pan: { x: d.pan.x + dx, y: d.pan.y + dy } }));
        } else if (d.mode === 'zoom') {
          d.y = ev.clientY;
          patchCells(d.i, (cc) => ({ ...cc, zoom: Math.max(0.2, Math.min(16, cc.zoom * (1 - dy * 0.01))) }));
        } else if (d.uid) {
          const width = Math.max(1, Math.round(d.voi.width + dx * d.sens));
          const center = Math.round(d.voi.center - dy * d.sens);
          setVoiBySeries?.((prev) => ({ ...prev, [d.uid]: { center, width, source: 'user' } }));
        }
      };
      const up = () => {
        drag.current = null;
        window.removeEventListener('mousemove', move);
        window.removeEventListener('mouseup', up);
      };
      window.addEventListener('mousemove', move);
      window.addEventListener('mouseup', up);
    },
    [activeViewport, goto, globalOf, dicomCache, instsOf, voiBySeries, activeTool, patchCells, setVoiBySeries]
  );

  const handleWheel = useCallback(
    (e, i) => {
      if (e.ctrlKey || activeTool === PACS_TOOLS.ZOOM) {
        const f = e.deltaY < 0 ? 1.1 : 1 / 1.1;
        patchCells(i, (c) => ({ ...c, zoom: Math.max(0.2, Math.min(16, c.zoom * f)) }));
        return;
      }
      const c = cellsRef.current[i];
      goto(i, c.slicePos + (e.deltaY > 0 ? 1 : -1));
    },
    [activeTool, patchCells, goto]
  );

  const handleSeek = useCallback((i, pos) => goto(i, pos), [goto]);
  const handleDoubleClick = useCallback(
    (i) => {
      const g = globalOf(cellsRef.current[i]);
      if (g !== undefined) onMaximize?.(g);
    },
    [globalOf, onMaximize]
  );

  const changeCellSeries = useCallback(
    (i, uid) => {
      const s = seriesByUid.get(uid);
      if (!s) return;
      const pos = Math.floor((s.instances.length - 1) / 2);
      setCells((prev) => prev.map((c, j) => (j === i ? { ...c, seriesUid: uid, slicePos: pos, zoom: 1, pan: { x: 0, y: 0 } } : c)));
      if (i === activeViewport) onActiveSliceChange?.(s.instances[pos].globalIndex);
    },
    [seriesByUid, activeViewport, onActiveSliceChange]
  );

  /* ---------- Đường tham chiếu từ lát của ô đang chọn ---------- */
  const av = Math.min(activeViewport, cellCount - 1);
  const activeCell = cells[av];
  const activeGlobal = globalOf(activeCell);
  const activeGeom = useMemo(() => {
    if (!sync.refLines || activeGlobal === undefined) return null;
    const c = cells[av];
    return geomOf(activeGlobal, instsOf(c.seriesUid)[c.slicePos]);
  }, [sync.refLines, activeGlobal, cells, av, geomOf, instsOf]);

  const gridStyle = layoutDef.areas
    ? (() => {
        const letters = [];
        layoutDef.areas.join(' ').split(/\s+/).forEach((l) => !letters.includes(l) && letters.push(l));
        return {
          gridTemplateAreas: layoutDef.areas.map((row) => `"${row.split(/\s+/).map((l) => `c${letters.indexOf(l)}`).join(' ')}"`).join(' '),
          gridTemplateColumns: `repeat(${layoutDef.cols}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${layoutDef.rows}, minmax(0, 1fr))`,
        };
      })()
    : {
        gridTemplateAreas: Array.from({ length: layoutDef.rows }, (_, r) => `"${Array.from({ length: layoutDef.cols }, (_, c) => `c${r * layoutDef.cols + c}`).join(' ')}"`).join(' '),
        gridTemplateColumns: `repeat(${layoutDef.cols}, minmax(0, 1fr))`,
        gridTemplateRows: `repeat(${layoutDef.rows}, minmax(0, 1fr))`,
      };

  return (
    <div style={{ flex: 1, minWidth: 0, minHeight: 0, display: 'grid', gap: 2, padding: 2, backgroundColor: '#020617', ...gridStyle }}>
      {Array.from({ length: cellCount }, (_, i) => {
        const cell = cells[i];
        const series = seriesByUid.get(cell?.seriesUid);
        const insts = series?.instances || [];
        const pos = Math.max(0, Math.min(insts.length - 1, cell?.slicePos || 0));
        const inst = insts[pos];
        const g = inst?.globalIndex;
        let refLine = null;
        if (activeGeom && i !== av && inst) {
          const geom = geomOf(g, inst);
          refLine = geom ? computeReferenceLine(activeGeom, geom) : null;
        }
        return (
          <GridCell
            key={i}
            index={i}
            isActive={i === av}
            inst={inst}
            cached={g !== undefined ? dicomCache[g] : undefined}
            preview={g !== undefined ? previewCache[g] : undefined}
            voi={voiBySeries[cell?.seriesUid]}
            invert={invert}
            colorLut={colorLut}
            isSmooth={isSmooth}
            zoom={cell?.zoom || 1}
            pan={cell?.pan || { x: 0, y: 0 }}
            refLine={refLine}
            slicePos={pos}
            sliceTotal={insts.length}
            seriesTitle={series?.title}
            seriesMenuItems={seriesList.map((s) => ({
              key: s.seriesUid,
              label: (
                <span style={{ display: 'flex', justifyContent: 'space-between', gap: 16, minWidth: 220 }}>
                  <span>{s.title}</span>
                  <span style={{ color: '#38bdf8', fontFamily: 'monospace' }}>{s.instances.length} ảnh</span>
                </span>
              ),
              onClick: () => changeCellSeries(i, s.seriesUid),
            }))}
            activeTool={MEASURE_TOOLS.includes(activeTool) || activeTool === PACS_TOOLS.MAGNIFY ? PACS_TOOLS.PAN : activeTool}
            onMouseDown={handleMouseDown}
            onWheel={handleWheel}
            onDoubleClick={handleDoubleClick}
            onSeek={handleSeek}
          />
        );
      })}
    </div>
  );
}
