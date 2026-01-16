import React, { useEffect, useRef, useState } from "react";
import { Rnd } from "react-rnd";
import { Button, Select } from "antd";
import styles from "./HeaderCanvas.module.scss";
import {
  DEFAULT_HEADER_BLOCKS,
  getHeaderTemplate,
  HEADER_BLOCKS_STORAGE_KEY,
  mapHeaderInfoToBlocks,
} from "./constant.setting.print";

const HeaderCanvas = ({ headerInfo }) => {
  const [history, setHistory] = useState([]);
  const [templateCode, setTemplateCode] = useState(
    headerInfo?.code_header || 1
  );

  const pushHistory = (blocks) => {
    setHistory((prev) => [...prev, JSON.stringify(blocks)]);
  };

  const canvasRef = useRef(null);
  const [headerBlocks, setHeaderBlocks] = useState(DEFAULT_HEADER_BLOCKS);

  console.log("headerBlocks", headerBlocks);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(HEADER_BLOCKS_STORAGE_KEY);
    if (saved) {
      try {
        setHeaderBlocks(JSON.parse(saved));
      } catch {}
    }
    setReady(true);
  }, []);
  useEffect(() => {
    if (headerInfo) {
      const template = getHeaderTemplate(templateCode);
      const mapped = mapHeaderInfoToBlocks(headerInfo, template);
      setHeaderBlocks(mapped);
    }
  }, [headerInfo]);

  /* ================= UPDATE ================= */
  const updateBlock = (id, data) => {
    setHeaderBlocks((prev) => {
      pushHistory(prev); // lưu snapshot trước khi đổi
      return prev.map((b) => (b.id === id ? { ...b, ...data } : b));
    });
  };

  const undo = () => {
    setHistory((prev) => {
      if (!prev.length) return prev;

      const last = prev[prev.length - 1];
      setHeaderBlocks(JSON.parse(last));

      return prev.slice(0, -1);
    });
  };

  const changeTemplate = (code) => {
    const template = getHeaderTemplate(code);
    const mapped = mapHeaderInfoToBlocks(headerInfo, template);

    setTemplateCode(code);
    setHeaderBlocks(mapped);
    setHistory([]);
    localStorage.removeItem(HEADER_BLOCKS_STORAGE_KEY);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault();
        undo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  /* ================= AUTO HEIGHT TEXT ================= */
  const handleTextInput = (id, el) => {
    const height = el.scrollHeight + 8;
    updateBlock(id, { height });
  };

  /* ================= PREVIEW ================= */
  const openPreview = () => {
    const win = window.open("", "_blank", "width=900,height=1200");
    if (!win) return;

    const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8"/>
<title>Print Preview</title>
<style>
  @page { size: A4; margin: 0; }
  body { margin:0; font-family: Arial, sans-serif; }
  .page { width:794px; margin:0 auto; }
  .canvas {
    position: relative;
    width:794px;
    height:180px;
    background-color: red;
  }
  .block {
    position:absolute;
    box-sizing:border-box;
  }
  .text {
    font-size:12px;
    line-height:1.4;
    white-space:pre-line;
    word-break:break-word;
  }
  img {
    width:100%;
    height:100%;
    object-fit:contain;
  }
</style>
</head>
<body>
  <div class="page">
    <div class="canvas">
      ${headerBlocks
        .filter((b) => b.visible)
        .map(
          (b) => `
        <div class="block"
          style="
            left:${b.x}px;
            top:${b.y}px;
            width:${b.width}px;
            height:${b.height}px;
          "
        >
          ${
            b.type === "image"
              ? b.value
                ? `<img src="${b.value}" />`
                : ""
              : `<div class="text">${b.value ?? ""}</div>`
          }
        </div>
      `
        )
        .join("")}
    </div>
  </div>

<script>
  window.onload = () => setTimeout(() => window.print(), 300);
</script>
</body>
</html>
    `;

    win.document.open();
    win.document.write(html);
    win.document.close();
  };

  const resetHeader = () => {
    const template = getHeaderTemplate(templateCode);

    const initial = mapHeaderInfoToBlocks(headerInfo, template);
    setHeaderBlocks(initial);
    setHistory([]);
    localStorage.removeItem(HEADER_BLOCKS_STORAGE_KEY);
  };

  if (!ready) return null;

  /* ================= RENDER ================= */
  return (
    <>
      <div
        className={styles.canvas}
        ref={canvasRef}
        style={{ position: "relative" }}
      >
        {headerBlocks.map(
          (block) =>
            block.visible && (
              <Rnd
                key={block.id}
                position={{ x: block.x, y: block.y }}
                size={{ width: block.width, height: block.height }}
                bounds="parent"
                onDragStop={(e, d) => updateBlock(block.id, { x: d.x, y: d.y })}
                onResizeStop={(e, dir, ref, delta, pos) =>
                  updateBlock(block.id, {
                    width: ref.offsetWidth,
                    height: ref.offsetHeight,
                    x: pos.x,
                    y: pos.y,
                  })
                }
                enableResizing
              >
                <div className={styles.block}>
                  {block.type === "image" ? (
                    block.value ? (
                      <img
                        src={block.value}
                        alt=""
                        width={block.width}
                        height={block.height}
                      />
                    ) : (
                      <div className={styles.placeholder}>{block.label}</div>
                    )
                  ) : (
                    <div
                      className={styles.text}
                      contentEditable
                      suppressContentEditableWarning
                      onInput={(e) =>
                        handleTextInput(block.id, e.currentTarget)
                      }
                    >
                      {block.value}
                    </div>
                  )}
                </div>
              </Rnd>
            )
        )}
      </div>

      <div style={{ textAlign: "right", marginTop: 16 }}>
        <Button onClick={undo} disabled={!history.length}>
          ⬅ Lùi (Ctrl + Z)
        </Button>

        <Button danger style={{ marginLeft: 8 }} onClick={resetHeader}>
          Reset
        </Button>

        <Select
          value={templateCode}
          style={{ width: 220 }}
          onChange={changeTemplate}
          options={[
            { label: "Mẫu 1 – Có logo", value: 1 },
            { label: "Mẫu 2 – Không logo", value: 2 },
          ]}
        />

        <Button
          type="primary"
          style={{ marginLeft: 8 }}
          onClick={() =>
            localStorage.setItem(
              HEADER_BLOCKS_STORAGE_KEY,
              JSON.stringify(headerBlocks)
            )
          }
        >
          Lưu
        </Button>

        <Button style={{ marginLeft: 8 }} onClick={openPreview}>
          Preview & In
        </Button>
      </div>
    </>
  );
};

export default HeaderCanvas;
