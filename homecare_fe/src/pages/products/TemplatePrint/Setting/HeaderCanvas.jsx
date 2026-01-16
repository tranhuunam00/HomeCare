import React, { useRef } from "react";
import { Rnd } from "react-rnd";
import styles from "./HeaderCanvas.module.scss";

const HeaderCanvas = ({ blocks = [], onChange }) => {
  const canvasRef = useRef(null);

  const updateBlock = (id, data) => {
    const newBlocks = blocks.map((b) => (b.id === id ? { ...b, ...data } : b));
    onChange(newBlocks);
  };

  return (
    <div className={styles.canvas} ref={canvasRef}>
      {blocks.map(
        (block) =>
          block.visible && (
            <Rnd
              key={block.id}
              bounds="parent" // OK vì canvas fixed size
              position={{
                x: block.x,
                y: block.y,
              }}
              size={{
                width: block.width,
                height: block.height,
              }}
              style={{ zIndex: block.zIndex ?? 1 }}
              onDragStop={(e, d) =>
                updateBlock(block.id, {
                  x: d.x,
                  y: d.y,
                })
              }
              onResizeStop={(e, dir, ref, delta, pos) =>
                updateBlock(block.id, {
                  width: ref.offsetWidth,
                  height: ref.offsetHeight,
                  x: pos.x,
                  y: pos.y,
                })
              }
              enableResizing
              dragGrid={[1, 1]}
              resizeGrid={[1, 1]}
            >
              <div className={styles.block}>
                {block.type === "image" ? (
                  block.value ? (
                    <img src={block.value} alt="" />
                  ) : (
                    <div className={styles.placeholder}>{block.label}</div>
                  )
                ) : (
                  <div className={styles.text} style={block.style}>
                    {block.value}
                  </div>
                )}
              </div>
            </Rnd>
          )
      )}
    </div>
  );
};

export default HeaderCanvas;
