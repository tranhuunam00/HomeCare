import React from "react";
import { Rnd } from "react-rnd";
import styles from "./HeaderCanvas.module.scss";

const HeaderCanvas = ({ blocks = [], onChange }) => {
  const updateBlock = (id, data) => {
    const newBlocks = blocks.map((b) => (b.id === id ? { ...b, ...data } : b));
    console.log("newBlocks", newBlocks);
    onChange(newBlocks);
  };

  console.log("blocks", blocks);
  return (
    <div className={styles.canvas}>
      {blocks.map(
        (block) =>
          block.visible && (
            <Rnd
              key={block.id}
              bounds="parent"
              size={{
                width: block.width,
                height: block.height,
              }}
              position={{
                x: block.x,
                y: block.y,
              }}
              style={{
                zIndex: block.zIndex ?? 1,
              }}
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
              enableResizing={{
                top: true,
                right: true,
                bottom: true,
                left: true,
                topRight: true,
                bottomRight: true,
                bottomLeft: true,
                topLeft: true,
              }}
              dragGrid={[1, 1]}
              resizeGrid={[1, 1]}
            >
              <div className={styles.block}>
                {block.type === "image" ? (
                  block.value ? (
                    <img
                      src={block.value}
                      alt={block.label}
                      className={styles.image}
                    />
                  ) : (
                    <div className={styles.placeholder}>
                      {block.label || "IMAGE"}
                    </div>
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
