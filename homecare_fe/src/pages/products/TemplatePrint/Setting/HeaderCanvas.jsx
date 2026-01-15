import { Rnd } from "react-rnd";
import styles from "./HeaderCanvas.module.scss";

const HeaderCanvas = ({ blocks, onChange }) => {
  const updateBlock = (id, data) => {
    onChange(blocks.map((b) => (b.id === id ? { ...b, ...data } : b)));
  };

  return (
    <div className={styles.canvas}>
      {blocks.map(
        (block) =>
          block.visible && (
            <Rnd
              key={block.id}
              bounds="parent"
              size={{ width: block.width, height: block.height }}
              position={{ x: block.x, y: block.y }}
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
            >
              <div className={styles.block}>
                {block.type === "image" ? (
                  block.value ? (
                    <img
                      src={block.value}
                      alt="logo"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                      }}
                    />
                  ) : (
                    <div className={styles.placeholder}>LOGO</div>
                  )
                ) : (
                  <div className={styles.text}>{block.value}</div>
                )}
              </div>
            </Rnd>
          )
      )}
    </div>
  );
};

export default HeaderCanvas;
