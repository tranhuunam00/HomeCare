import React, { memo, useEffect, useRef } from 'react';
import { Tooltip } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';

/**
 * Right-side scrollable slice thumbnail strip scoped to the active series/cluster.
 * Includes a collapse/expand toggle button so the doctor can hide or show it anytime.
 */
function PacsSliceStrip({
  isOpen = true,
  onToggleOpen,
  activeSeries,
  currentIndex = 0,
  activeSlicePos = 0,
  sliceThumbnails = {},
  onSelectSlice,
}) {
  const seriesInstances = activeSeries?.instances || [];
  const activeItemRef = useRef(null);

  // Cuộn nhanh 250 lát: KHÔNG dùng smooth (animation chồng nhau gây giật), gom 1 lần/khung hình,
  // chỉ cuộn khi ô đang chọn ra khỏi vùng nhìn thấy
  const scrollRafRef = useRef(null);
  useEffect(() => {
    if (!isOpen) return undefined;
    if (scrollRafRef.current) cancelAnimationFrame(scrollRafRef.current);
    scrollRafRef.current = requestAnimationFrame(() => {
      scrollRafRef.current = null;
      const el = activeItemRef.current;
      const box = el?.parentElement;
      if (!el || !box) return;
      const top = el.offsetTop; // khung cuộn là position: relative
      if (top < box.scrollTop || top + el.offsetHeight > box.scrollTop + box.clientHeight) {
        box.scrollTop = top - box.clientHeight / 2 + el.offsetHeight / 2;
      }
    });
    return () => scrollRafRef.current && cancelAnimationFrame(scrollRafRef.current);
  }, [currentIndex, isOpen]);

  if (!isOpen) {
    return (
      <div
        style={{
          width: 24,
          minWidth: 24,
          backgroundColor: '#0a0f1d',
          borderLeft: '1px solid #1e293b',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          paddingTop: 8,
          userSelect: 'none',
          zIndex: 10,
        }}
      >
        <Tooltip title={`Mở danh sách hình (${seriesInstances.length} ảnh)`} placement="left">
          <button
            type="button"
            onClick={onToggleOpen}
            style={{
              width: 20,
              height: 36,
              borderRadius: 4,
              border: '1px solid #334155',
              backgroundColor: '#111827',
              color: '#38bdf8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
            }}
          >
            <LeftOutlined style={{ fontSize: 11 }} />
          </button>
        </Tooltip>
      </div>
    );
  }

  return (
    <div
      style={{
        width: 112,
        minWidth: 112,
        backgroundColor: '#0a0f1d',
        borderLeft: '1px solid #1e293b',
        display: 'flex',
        flexDirection: 'column',
        userSelect: 'none',
        zIndex: 10,
      }}
    >
      {/* Header with cluster indicator & collapse button */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '6px 6px',
          borderBottom: '1px solid #1e293b',
          backgroundColor: '#0f172a',
          gap: 4,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: '10px',
              fontWeight: 700,
              color: '#f59e0b',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            Cụm {activeSeries?.seriesIndex || 1}
          </div>
          <div style={{ fontSize: '10px', color: '#94a3b8', fontFamily: 'monospace' }}>
            {seriesInstances.length > 0 ? `${activeSlicePos + 1}/${seriesInstances.length}` : '0/0'}
          </div>
        </div>

        <Tooltip title="Đóng danh sách hình" placement="left">
          <button
            type="button"
            onClick={onToggleOpen}
            style={{
              width: 22,
              height: 22,
              borderRadius: 4,
              border: '1px solid #334155',
              backgroundColor: '#111827',
              color: '#cbd5e1',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              padding: 0,
            }}
          >
            <RightOutlined style={{ fontSize: 11 }} />
          </button>
        </Tooltip>
      </div>

      {/* Scrollable slice thumbnails strictly for the active series */}
      <div
        style={{
          flex: 1,
          position: 'relative',
          overflowY: 'auto',
          padding: '6px',
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
        }}
      >
        {seriesInstances.map((inst, idx) => (
          <SliceItem
            key={inst.sopInstanceUid ? `${inst.sopInstanceUid}#${inst.frameIndex || 0}` : `${inst.globalIndex}-${idx}`}
            globalIndex={inst.globalIndex}
            idx={idx}
            isSelected={inst.globalIndex === currentIndex}
            thumbSrc={sliceThumbnails[inst.globalIndex]}
            onSelectSlice={onSelectSlice}
            itemRef={inst.globalIndex === currentIndex ? activeItemRef : null}
          />
        ))}

        {seriesInstances.length === 0 && (
          <div style={{ color: '#64748b', fontSize: '11px', textAlign: 'center', marginTop: 16 }}>
            Không có ảnh
          </div>
        )}
      </div>
    </div>
  );
}

const SliceItem = memo(function SliceItem({ globalIndex, idx, isSelected, thumbSrc, onSelectSlice, itemRef }) {
  return (
    <div
      ref={itemRef}
      onClick={() => onSelectSlice(globalIndex)}
      style={{
        width: '100%',
        height: 82,
        flexShrink: 0,
        backgroundColor: '#000000',
        border: isSelected ? '2px solid #f59e0b' : '1px solid #1e293b',
        borderRadius: 4,
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: isSelected ? '0 0 8px rgba(245, 158, 11, 0.35)' : 'none',
        contentVisibility: 'auto',
        containIntrinsicSize: '82px',
      }}
    >
      {thumbSrc ? (
        <img
          src={thumbSrc}
          alt={`Ảnh ${idx + 1}`}
          draggable={false}
          loading="lazy"
          decoding="async"
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        />
      ) : (
        <span style={{ color: '#64748b', fontSize: '10px', fontFamily: 'monospace' }}>#{idx + 1}</span>
      )}
      <span
        style={{
          position: 'absolute',
          bottom: 3,
          right: 4,
          backgroundColor: isSelected ? '#f59e0b' : 'rgba(15, 23, 42, 0.85)',
          color: isSelected ? '#000000' : '#e2e8f0',
          fontSize: '10px',
          fontWeight: 700,
          padding: '0 4px',
          borderRadius: 2,
          lineHeight: '14px',
          fontFamily: 'monospace',
        }}
      >
        {idx + 1}
      </span>
    </div>
  );
});

export default memo(PacsSliceStrip);
