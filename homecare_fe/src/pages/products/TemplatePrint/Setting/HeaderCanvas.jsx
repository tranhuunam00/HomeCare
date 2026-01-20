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
import API_CALL from "../../../../services/axiosClient";
import { toast } from "react-toastify";
import EditorPanel from "./editor/EditorPanel";

const HeaderCanvas = ({ headerInfo }) => {
  const [history, setHistory] = useState([]);
  const [isReset, setIsReset] = useState(false);
  const [templateCode, setTemplateCode] = useState(
    headerInfo?.code_header || 1,
  );

  const editingRef = useRef(null); // id đang edit

  const pushHistory = (blocks) => {
    setHistory((prev) => [...prev, JSON.stringify(blocks)]);
  };

  const canvasRef = useRef(null);
  const [headerBlocks, setHeaderBlocks] = useState(DEFAULT_HEADER_BLOCKS);
  const [selectedId, setSelectedId] = useState(null);
  const selectedBlock = headerBlocks.find((b) => b.id === selectedId);

  const [lastSavedBlocks, setLastSavedBlocks] = useState(null);

  console.log("headerBlocks", headerBlocks);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!headerInfo?.id) return;

    let blocks;

    if (headerInfo.custom) {
      try {
        blocks = JSON.parse(headerInfo.custom);
      } catch {
        blocks = DEFAULT_HEADER_BLOCKS;
      }
    } else {
      const template = getHeaderTemplate(templateCode);
      blocks = mapHeaderInfoToBlocks(headerInfo, template);
    }

    setHeaderBlocks(blocks);

    setLastSavedBlocks(JSON.parse(JSON.stringify(blocks)));

    setReady(true);
  }, [headerInfo?.id]);

  useEffect(() => {
    if (!headerInfo) return;

    if (headerInfo.custom) return;

    const template = getHeaderTemplate(templateCode);
    const mapped = mapHeaderInfoToBlocks(headerInfo, template);
    setHeaderBlocks(mapped);
  }, [headerInfo, templateCode]);

  /* ================= UPDATE ================= */
  const updateBlock = (id, data) => {
    setHeaderBlocks((prev) => {
      pushHistory(prev);

      return prev.map((b) => {
        if (b.id !== id) return b;

        return {
          ...b,
          ...data,
          style: {
            ...b.style,
            ...data.style, // ⭐ merge style chuẩn
          },
        };
      });
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
    const value = el.innerText;
    const height = el.scrollHeight + 8;

    updateBlock(id, {
      value,
      height,
    });
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
  margin-top: 300px;
    position: relative;
    width:794px;
    height:180px;
    background-color: #6a83f150;
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
      `,
        )
        .join("")}
    </div>
  </div>

// <script>
//   window.onload = () => setTimeout(() => window.print(), 300);
// </script>
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
    setIsReset(true);
  };

  const saveHeaderToApi = async () => {
    const ok = window.confirm("Bạn có muốn lưu cấu hình header không?");
    if (!ok) return;

    try {
      const payload = {
        custom: isReset ? null : JSON.stringify(headerBlocks),
      };

      await API_CALL.put(`/print-template/${headerInfo.id}`, payload);

      toast.success("Lưu cấu hình header thành công!");
      setLastSavedBlocks(JSON.parse(JSON.stringify(headerBlocks)));

      setIsReset(false);
    } catch (err) {
      console.error(err);
      toast.error("Lưu cấu hình header thất bại");
    }
  };

  const resetToLastSaved = () => {
    if (!lastSavedBlocks) {
      toast.info("Chưa có bản lưu nào");
      return;
    }

    const ok = window.confirm(
      "Quay lại bản đã lưu gần nhất? Mọi thay đổi chưa lưu sẽ mất.",
    );
    if (!ok) return;

    setHeaderBlocks(JSON.parse(JSON.stringify(lastSavedBlocks)));
    setHistory([]);
  };
  if (!ready) return null;

  /* ================= RENDER ================= */
  return (
    <div className={styles.editorLayout}>
      <div className={styles.canvasWrapper}>
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
                  onClick={() => setSelectedId(block.id)}
                  position={{ x: block.x, y: block.y }}
                  size={{ width: block.width, height: block.height }}
                  bounds="parent"
                  onDragStop={(e, d) =>
                    updateBlock(block.id, { x: d.x, y: d.y })
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
                >
                  <div className={styles.block}>
                    {block.type === "image" ? (
                      block.value ? (
                        <img
                          src={block.value}
                          alt=""
                          width={block.width}
                          height={block.height}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: block.style?.objectFit || "contain",
                            opacity: block.style?.opacity ?? 1,
                            borderRadius: block.style?.borderRadius || 0,
                          }}
                        />
                      ) : (
                        <div className={styles.placeholder}>{block.label}</div>
                      )
                    ) : (
                      <div
                        ref={(el) => {
                          if (!el) return;

                          // chỉ sync từ state → DOM khi KHÔNG đang edit
                          if (editingRef.current !== block.id) {
                            el.innerText = block.value || "";
                          }
                        }}
                        className={styles.text}
                        contentEditable
                        suppressContentEditableWarning
                        onFocus={() => {
                          editingRef.current = block.id;
                        }}
                        onBlur={(e) => {
                          editingRef.current = null;

                          // đảm bảo sync lại value lần cuối khi blur
                          updateBlock(block.id, {
                            value: e.currentTarget.innerText,
                            height: e.currentTarget.scrollHeight + 8,
                          });
                        }}
                        onInput={(e) =>
                          handleTextInput(block.id, e.currentTarget)
                        }
                        style={{
                          fontSize: block.style?.fontSize,
                          fontWeight: block.style?.fontWeight,
                          fontStyle: block.style?.fontStyle,
                          textDecoration: block.style?.textDecoration,
                          textTransform: block.style?.textTransform,
                          letterSpacing: block.style?.letterSpacing,
                          opacity: block.style?.opacity,
                          fontFamily: block.style?.fontFamily,
                          color: block.style?.color,
                          textAlign: block.style?.textAlign,
                          lineHeight: block.style?.lineHeight,
                          whiteSpace: block.style?.whiteSpace || "pre-line",
                        }}
                      />
                    )}
                  </div>
                </Rnd>
              ),
          )}
        </div>

        <div style={{ textAlign: "right", marginTop: 16 }}>
          <Button onClick={undo} disabled={!history.length}>
            ⬅ Lùi (Ctrl + Z)
          </Button>

          <Button danger style={{ marginLeft: 8 }} onClick={resetHeader}>
            Reset
          </Button>

          <Button
            style={{ marginLeft: 8 }}
            onClick={resetToLastSaved}
            disabled={!lastSavedBlocks}
          >
            ↩️ Quay về bản đã lưu
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
            onClick={saveHeaderToApi}
          >
            Lưu
          </Button>
          <Button style={{ marginLeft: 8 }} onClick={openPreview}>
            Preview & In
          </Button>
        </div>
      </div>

      <div className={styles.editorPanel}>
        <EditorPanel block={selectedBlock} onChange={updateBlock} />
      </div>
    </div>
  );
};

export default HeaderCanvas;
