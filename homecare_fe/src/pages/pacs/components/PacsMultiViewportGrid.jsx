import React, { useState, useEffect, useLayoutEffect, useRef, useCallback, useMemo, memo } from 'react';
import { Tooltip, Dropdown } from 'antd';
import { DownOutlined, FullscreenOutlined } from '@ant-design/icons';
import { renderDicomToCanvas } from '../services/dicomDecoder';
import { getOrientationLabels, transformOrientationLabels } from '../services/dicomImageCore';
import { renderAnnotationsToCanvas } from '../utils/annotation.renderer';
import { MAX_VIEWPORTS, findLayout, getLayoutCellCount } from '../constants/pacs.constants';
import { getPlaneGeometry, computeReferenceLine, findNearestSlice, planeCenter, areParallel } from '../utils/referenceGeometry';

const HUD_FONT = { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace', fontSize: 10.5, lineHeight: '14px', textShadow: '0 0 3px #000, 0 0 2px #000' };
const DEFAULT_VIEW = Object.freeze({ zoom: 1, pan: { x: 0, y: 0 }, rotation: 0, flipH: false, flipV: false });

/** Metadata đầy đủ nhất đang có cho 1 lát: meta đã giải mã (chính xác) > metadata máy chủ */
const bestMeta = (cached, inst) => (cached?.meta ? { ...inst, ...cached.meta } : inst);

/** Thanh tiêu đề ô: chọn series, số lát, phóng to 1x1 */
function CellHeader({ index, isActive, seriesList, seriesTitle, slicePos, sliceTotal, onChangeSeries, onMaximize }) {
  const items = useMemo(
    () =>
      seriesList.map((s) => ({
        key: s.seriesUid,
        label: (
          <span style={{ display: 'flex', justifyContent: 'space-between', gap: 16, minWidth: 220 }}>
            <span>{s.title}</span>
            <span style={{ color: '#38bdf8', fontFamily: 'monospace' }}>{s.instances.length} ảnh</span>
          </span>
        ),
        onClick: () => onChangeSeries(index, s.seriesUid),
      })),
    [seriesList, index, onChangeSeries]
  );
  return (
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
      onMouseDown={(e) => e.stopPropagation()}
    >
      <span style={{ fontSize: 9.5, fontWeight: 800, color: isActive ? '#fbbf24' : '#64748b', minWidth: 14 }}>{index + 1}</span>
      <Dropdown menu={{ items }} trigger={['click']}>
        <button type="button" className="pacs-cell-series-btn">
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{seriesTitle || 'Chọn series'}</span>
          <DownOutlined style={{ fontSize: 8, color: '#94a3b8', flexShrink: 0 }} />
        </button>
      </Dropdown>
      <span style={{ marginLeft: 'auto', fontSize: 10.5, color: '#38bdf8', fontFamily: 'monospace', fontWeight: 700 }}>
        {sliceTotal ? `${slicePos + 1}/${sliceTotal}` : ''}
      </span>
      <Tooltip title="Mở ô này ở chế độ 1x1">
        <button type="button" className="pacs-icon-btn" onClick={() => onMaximize(index)}>
          <FullscreenOutlined />
        </button>
      </Tooltip>
    </div>
  );
}

/**
 * Ô KHÔNG được chọn: chỉ hiển thị (nhẹ) - ảnh, số đo đã lưu, đường tham chiếu, HUD.
 * Bấm vào ô -> ô thành ô đang chọn và dùng khung nhìn đầy đủ (đo đạc, xoay/lật, kính lúp...).
 */
const PassiveCell = memo(function PassiveCell({
  index,
  inst,
  cached,
  preview,
  voi,
  invert,
  colorLut,
  isSmooth,
  view,
  activeGeom,
  annotations,
  onActivate,
  onWheel,
  onDoubleClick,
}) {
  const areaRef = useRef(null);
  const canvasRef = useRef(null);
  const overlayRef = useRef(null);
  const [area, setArea] = useState({ w: 0, h: 0 });

  const meta = useMemo(() => bestMeta(cached, inst), [cached, inst]);
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

  const display = useMemo(() => {
    if (!W || !H || !area.w || !area.h) return null;
    const physW = W * spCol;
    const physH = H * spRow;
    const fit = Math.min((area.w - 8) / physW, (area.h - 8) / physH);
    return { w: Math.max(1, Math.round(physW * fit)), h: Math.max(1, Math.round(physH * fit)) };
  }, [W, H, spRow, spCol, area.w, area.h]);

  // Ảnh
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

  // Số đo đã lưu + đường tham chiếu (toạ độ pixel ảnh, nét ~1.5px màn hình)
  const refLine = useMemo(() => {
    if (!activeGeom || !meta) return null;
    const g = getPlaneGeometry(meta);
    return g ? computeReferenceLine(activeGeom, g) : null;
  }, [activeGeom, meta]);
  useEffect(() => {
    const c = overlayRef.current;
    if (!c || !W || !H || !display) return;
    const pxPerScreen = W / (display.w * view.zoom);
    renderAnnotationsToCanvas(c, annotations || [], null, { columns: W, rows: H }, pxPerScreen);
    if (!refLine) return;
    const ctx = c.getContext('2d');
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
  }, [annotations, refLine, W, H, display, view.zoom]);

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

  const labels = transformOrientationLabels(getOrientationLabels(meta), view);
  const loc = Number.isFinite(meta?.sliceLocation) ? meta.sliceLocation : meta?.imagePositionPatient?.[2];

  return (
    <div
      ref={areaRef}
      onMouseDown={(e) => onActivate(e, index)}
      onDoubleClick={() => onDoubleClick(index)}
      onContextMenu={(e) => e.preventDefault()}
      style={{ position: 'relative', flex: 1, minHeight: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', cursor: 'pointer', background: '#000' }}
    >
      <div
        style={{
          position: 'relative',
          width: display?.w,
          height: display?.h,
          visibility: display && (hasFull || preview) ? 'visible' : 'hidden',
          transform: `translate(${view.pan.x}px, ${view.pan.y}px) scale(${view.zoom}) rotate(${view.rotation}deg) scaleX(${view.flipH ? -1 : 1}) scaleY(${view.flipV ? -1 : 1})`,
          transformOrigin: 'center center',
        }}
      >
        <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', imageRendering: isSmooth ? 'auto' : 'pixelated' }} />
        <canvas ref={overlayRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} />
      </div>

      {!hasFull && !preview && inst && <div style={{ position: 'absolute', color: '#475569', fontSize: 11 }}>Đang tải ảnh…</div>}

      {labels && (
        <>
          <span style={{ ...HUD_FONT, position: 'absolute', top: 2, left: '50%', transform: 'translateX(-50%)', color: '#fde68a', fontWeight: 700 }}>{labels.top}</span>
          <span style={{ ...HUD_FONT, position: 'absolute', bottom: 2, left: '50%', transform: 'translateX(-50%)', color: '#fde68a', fontWeight: 700 }}>{labels.bottom}</span>
          <span style={{ ...HUD_FONT, position: 'absolute', left: 4, top: '50%', transform: 'translateY(-50%)', color: '#fde68a', fontWeight: 700 }}>{labels.left}</span>
          <span style={{ ...HUD_FONT, position: 'absolute', right: 4, top: '50%', transform: 'translateY(-50%)', color: '#fde68a', fontWeight: 700 }}>{labels.right}</span>
        </>
      )}
      <div style={{ ...HUD_FONT, position: 'absolute', top: 4, left: 6, color: '#cbd5e1', pointerEvents: 'none' }}>
        <div>{meta?.modality || ''}{Number.isFinite(meta?.sliceThickness) ? ` · Dày ${meta.sliceThickness} mm` : ''}</div>
        {Number.isFinite(loc) && <div>Vị trí {Number(loc).toFixed(1)} mm</div>}
      </div>
      <div style={{ ...HUD_FONT, position: 'absolute', bottom: 4, left: 6, color: '#cbd5e1', pointerEvents: 'none' }}>
        W {Math.round(voi?.width ?? meta?.windowWidth ?? 0)} / L {Math.round(voi?.center ?? meta?.windowCenter ?? 0)}
        {annotations?.length ? <span style={{ color: '#4ade80' }}> · {annotations.length} số đo</span> : null}
      </div>
      <div style={{ ...HUD_FONT, position: 'absolute', top: 4, right: 6, pointerEvents: 'none' }}>
        {hasFull ? (
          <span style={{ color: cached?.decodeInfo?.lossy ? '#fbbf24' : '#4ade80' }}>{cached?.decodeInfo?.lossy ? 'NÉN MẤT DỮ LIỆU' : 'ẢNH GỐC'}</span>
        ) : preview ? (
          <span style={{ color: '#fbbf24' }}>XEM TRƯỚC</span>
        ) : null}
      </div>
    </div>
  );
});

/**
 * Lưới nhiều khung. Ô đang chọn hiển thị `activeViewport` (chính khung nhìn đầy đủ của chế độ 1x1:
 * đo đạc, xoay/lật, kính lúp, HU, WW/WL...) - phần tử này giữ nguyên (không mount lại) khi đổi ô,
 * chỉ đổi vị trí lưới. Các ô còn lại hiển thị nhẹ.
 */
export default function PacsMultiViewportGrid({
  layout = '1x2',
  seriesList = [],
  dicomCache = {},
  previewCache = {},
  requestInstance,
  voiBySeries = {},
  activeViewport = 0,
  setActiveViewport,
  invert = false,
  colorLut = 'default',
  isSmooth = true,
  currentIndex = 0,
  onActiveSliceChange,
  onMaximize,
  sync = { scroll: true, window: false, zoomPan: false, refLines: true },
  setVoiBySeries,
  annotations = {},
  activeView,
  onActiveViewChange,
  activeViewportElement,
}) {
  const layoutDef = findLayout(layout);
  const cellCount = getLayoutCellCount(layoutDef);
  const av = Math.min(activeViewport, cellCount - 1);

  /* ---------- Tra cứu series / vị trí ---------- */
  const seriesByUid = useMemo(() => new Map(seriesList.map((s) => [s.seriesUid, s])), [seriesList]);
  const locateGlobal = useMemo(() => {
    const m = new Map();
    seriesList.forEach((s) => s.instances.forEach((inst, pos) => m.set(inst.globalIndex, { seriesUid: s.seriesUid, pos })));
    return m;
  }, [seriesList]);
  const instsOf = useCallback((uid) => seriesByUid.get(uid)?.instances || [], [seriesByUid]);

  /* ---------- Trạng thái từng ô (series, lát, khung nhìn) ---------- */
  const [cells, setCells] = useState(() =>
    Array.from({ length: MAX_VIEWPORTS }, (_, i) => {
      const s = seriesList[i % Math.max(1, seriesList.length)];
      return { seriesUid: s?.seriesUid || null, slicePos: s ? Math.floor((s.instances.length - 1) / 2) : 0, view: DEFAULT_VIEW };
    })
  );
  const cellsRef = useRef(cells);
  cellsRef.current = cells;

  useEffect(() => {
    if (!seriesList.length) return;
    setCells((prev) => {
      let changed = false;
      const next = prev.map((c, i) => {
        if (c.seriesUid && seriesByUid.has(c.seriesUid)) return c;
        changed = true;
        const s = seriesList[i % seriesList.length];
        return { ...c, seriesUid: s.seriesUid, slicePos: Math.floor((s.instances.length - 1) / 2), view: DEFAULT_VIEW };
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

  /* ---------- Đổi ô đang chọn: cất khung nhìn (zoom/pan/xoay/lật) của ô cũ, nạp của ô mới ---------- */
  const activeViewRef = useRef(activeView);
  activeViewRef.current = activeView;
  const prevAvRef = useRef(av);
  useEffect(() => {
    const prev = prevAvRef.current;
    if (prev === av) return;
    prevAvRef.current = av;
    const saved = activeViewRef.current;
    setCells((cs) => cs.map((c, j) => (j === prev && saved ? { ...c, view: saved } : c)));
    onActiveViewChange?.(cellsRef.current[av]?.view || DEFAULT_VIEW);
  }, [av, onActiveViewChange]);

  // Đồng bộ zoom/kéo: khung nhìn của ô đang chọn áp sang các ô khác
  useEffect(() => {
    if (!sync.zoomPan || !activeView) return;
    setCells((cs) => {
      let changed = false;
      const next = cs.map((c, j) => {
        if (j === av || j >= cellCount) return c;
        if (c.view.zoom === activeView.zoom && c.view.pan.x === activeView.pan.x && c.view.pan.y === activeView.pan.y) return c;
        changed = true;
        return { ...c, view: { ...c.view, zoom: activeView.zoom, pan: activeView.pan } };
      });
      return changed ? next : cs;
    });
  }, [sync.zoomPan, activeView, av, cellCount]);

  /**
   * Ô đang chọn LUÔN phản chiếu currentIndex của trang (dải lát, phím mũi tên, cine... dùng chung).
   * Khi ô đang chọn đổi lát -> các ô khác đồng bộ: cùng hướng cắt = lát gần nhất theo VỊ TRÍ (mm),
   * không có hình học (X-quang) = cùng bước nhảy, khác hướng cắt = giữ nguyên (đã có đường tham chiếu).
   */
  const lastActive = useRef({ viewport: -1, globalIdx: -1, seriesUid: null, pos: 0 });
  // Cần căn lại toàn bộ các ô theo ô đang chọn: lúc vào lưới, bật đồng bộ, đổi bố cục, đổi series của 1 ô
  const needAlignRef = useRef(true);
  const [alignTick, setAlignTick] = useState(0);
  const requestAlign = useCallback(() => {
    needAlignRef.current = true;
    setAlignTick((t) => t + 1);
  }, []);
  useEffect(() => {
    if (sync.scroll) requestAlign();
  }, [sync.scroll, cellCount, requestAlign]);
  useEffect(() => {
    const loc = locateGlobal.get(currentIndex);
    if (!loc) return;
    const prevCells = cellsRef.current;
    const last = lastActive.current;
    const moved = last.viewport === av && last.globalIdx !== currentIndex;
    const next = prevCells.slice();
    if (next[av].seriesUid !== loc.seriesUid || next[av].slicePos !== loc.pos) next[av] = { ...next[av], seriesUid: loc.seriesUid, slicePos: loc.pos };

    const align = needAlignRef.current;
    needAlignRef.current = false;
    if ((moved || align) && sync.scroll) {
      const srcInsts = instsOf(loc.seriesUid);
      const srcGeom = getPlaneGeometry(bestMeta(dicomCache[currentIndex], srcInsts[loc.pos]));
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
        } else if (delta && moved) {
          pos = Math.max(0, Math.min(insts.length - 1, c.slicePos + delta));
        }
        if (pos !== null && pos !== c.slicePos) next[j] = { ...c, slicePos: pos };
      }
    }
    lastActive.current = { viewport: av, globalIdx: currentIndex, seriesUid: loc.seriesUid, pos: loc.pos };
    if (next.some((c, i) => c !== prevCells[i])) setCells(next);
    // dicomCache chỉ dùng để lấy hình học chính xác hơn - không cần chạy lại khi cache đổi
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, av, cellCount, locateGlobal, instsOf, sync.scroll, alignTick]);

  useEffect(() => {
    if (activeViewport >= cellCount) setActiveViewport?.(0);
  }, [activeViewport, cellCount, setActiveViewport]);

  /** Kích hoạt ô i ở lát pos (đi qua currentIndex của trang để mọi thành phần cùng cập nhật) */
  const goto = useCallback(
    (i, pos) => {
      const c = cellsRef.current[i];
      const insts = instsOf(c?.seriesUid);
      if (!insts.length) return;
      const p = Math.max(0, Math.min(insts.length - 1, pos));
      if (i !== av) {
        lastActive.current = { viewport: i, globalIdx: globalOf(c), seriesUid: c.seriesUid, pos: c.slicePos };
        setActiveViewport?.(i);
      }
      onActiveSliceChange?.(insts[p].globalIndex);
    },
    [av, instsOf, globalOf, setActiveViewport, onActiveSliceChange]
  );

  // Ưu tiên tải lát đang hiện ở các ô
  useEffect(() => {
    for (let i = 0; i < cellCount; i++) {
      const g = globalOf(cells[i]);
      if (g !== undefined && !dicomCache[g]) requestInstance?.(g, i === av ? 0 : 1);
    }
  }, [cells, cellCount, dicomCache, globalOf, requestInstance, av]);

  /* ---------- Đồng bộ WW/WL giữa các series cùng modality ---------- */
  const activeUid = cells[av]?.seriesUid;
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

  /* ---------- Chuột trên ô không được chọn: bấm = chọn ô, cuộn = chọn + đổi lát ---------- */
  const handleActivate = useCallback((e, i) => goto(i, cellsRef.current[i].slicePos), [goto]);
  const handleWheel = useCallback((e, i) => goto(i, cellsRef.current[i].slicePos + (e.deltaY > 0 ? 1 : -1)), [goto]);
  const handleMaximize = useCallback(
    (i) => {
      const g = globalOf(cellsRef.current[i]);
      if (g !== undefined) onMaximize?.(g, i === av ? activeViewRef.current : cellsRef.current[i].view);
    },
    [globalOf, onMaximize, av]
  );
  const changeCellSeries = useCallback(
    (i, uid) => {
      const s = seriesByUid.get(uid);
      if (!s) return;
      const pos = Math.floor((s.instances.length - 1) / 2);
      setCells((prev) => prev.map((c, j) => (j === i ? { ...c, seriesUid: uid, slicePos: pos, view: DEFAULT_VIEW } : c)));
      if (i === av) {
        onActiveViewChange?.(DEFAULT_VIEW);
        onActiveSliceChange?.(s.instances[pos].globalIndex);
      }
      requestAlign(); // ô vừa đổi series -> về đúng vị trí (mm) của ô đang chọn
    },
    [seriesByUid, av, onActiveViewChange, onActiveSliceChange, requestAlign]
  );

  /* ---------- Đường tham chiếu từ lát của ô đang chọn ---------- */
  const activeGlobal = globalOf(cells[av]);
  const activeInst = instsOf(cells[av]?.seriesUid)[cells[av]?.slicePos];
  const activeCached = activeGlobal !== undefined ? dicomCache[activeGlobal] : undefined;
  const activeGeom = useMemo(() => (sync.refLines && activeInst ? getPlaneGeometry(bestMeta(activeCached, activeInst)) : null), [sync.refLines, activeInst, activeCached]);

  const gridStyle = useMemo(() => {
    let areaRows;
    if (layoutDef.areas) {
      const letters = [];
      layoutDef.areas.join(' ').split(/\s+/).forEach((l) => !letters.includes(l) && letters.push(l));
      areaRows = layoutDef.areas.map((row) => row.split(/\s+/).map((l) => `c${letters.indexOf(l)}`).join(' '));
    } else {
      areaRows = Array.from({ length: layoutDef.rows }, (_, r) => Array.from({ length: layoutDef.cols }, (_, c) => `c${r * layoutDef.cols + c}`).join(' '));
    }
    return {
      gridTemplateAreas: areaRows.map((r) => `"${r}"`).join(' '),
      gridTemplateColumns: `repeat(${layoutDef.cols}, minmax(0, 1fr))`,
      gridTemplateRows: `repeat(${layoutDef.rows}, minmax(0, 1fr))`,
    };
  }, [layoutDef]);

  const cellFrame = (i, isActive) => ({
    gridArea: `c${i}`,
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    minHeight: 0,
    overflow: 'hidden',
    outline: `${isActive ? 2 : 1}px solid ${isActive ? '#f59e0b' : '#1e293b'}`,
    outlineOffset: -1,
    background: '#000',
  });

  const headerProps = (i) => {
    const series = seriesByUid.get(cells[i]?.seriesUid);
    const total = series?.instances.length || 0;
    return {
      index: i,
      isActive: i === av,
      seriesList,
      seriesTitle: series?.title,
      slicePos: Math.max(0, Math.min(total - 1, cells[i]?.slicePos || 0)),
      sliceTotal: total,
      onChangeSeries: changeCellSeries,
      onMaximize: handleMaximize,
    };
  };

  return (
    <div style={{ flex: 1, minWidth: 0, minHeight: 0, display: 'grid', gap: 2, padding: 2, backgroundColor: '#020617', ...gridStyle }}>
      {/* Ô đang chọn: khung nhìn đầy đủ. key cố định -> chỉ đổi vị trí, không mount lại canvas */}
      <div key="active" data-pacs-cell={av} data-active="1" style={cellFrame(av, true)}>
        <CellHeader {...headerProps(av)} />
        <div style={{ flex: 1, minHeight: 0, display: 'flex' }}>{activeViewportElement}</div>
      </div>

      {Array.from({ length: cellCount }, (_, i) => {
        if (i === av) return null;
        const cell = cells[i];
        const insts = instsOf(cell?.seriesUid);
        const pos = Math.max(0, Math.min(insts.length - 1, cell?.slicePos || 0));
        const inst = insts[pos];
        const g = inst?.globalIndex;
        return (
          <div key={`cell-${i}`} data-pacs-cell={i} style={cellFrame(i, false)}>
            <CellHeader {...headerProps(i)} />
            <PassiveCell
              index={i}
              inst={inst}
              cached={g !== undefined ? dicomCache[g] : undefined}
              preview={g !== undefined ? previewCache[g] : undefined}
              voi={voiBySeries[cell?.seriesUid]}
              invert={invert}
              colorLut={colorLut}
              isSmooth={isSmooth}
              view={cell.view}
              activeGeom={activeGeom}
              annotations={inst?.key ? annotations[inst.key] : undefined}
              onActivate={handleActivate}
              onWheel={handleWheel}
              onDoubleClick={handleMaximize}
            />
          </div>
        );
      })}
    </div>
  );
}
