import React, { useMemo } from "react";
import {
  getHeaderTemplate,
  mapHeaderInfoToBlocks,
} from "../Setting/constant.setting.print";

const CANVAS_WIDTH = 794;
const CANVAS_HEIGHT = 180;

const PrintHeaderFromCustom = ({ printTemplate }) => {
  const blocks = useMemo(() => {
    if (!printTemplate) return [];

    if (printTemplate.custom) {
      try {
        return JSON.parse(printTemplate.custom);
      } catch {
        console.warn("Invalid custom header JSON");
      }
    }

    const templateCode = printTemplate.code_header || 1;
    const template = getHeaderTemplate(templateCode);

    return mapHeaderInfoToBlocks(printTemplate, template);
  }, [printTemplate?.custom, printTemplate?.code_header, printTemplate?.id]);

  const canvasHeight = useMemo(() => {
    if (!blocks.length) return 0;
    return Math.max(
      ...blocks.filter((b) => b.visible).map((b) => b.y + b.height),
    );
  }, [blocks]);

  if (!blocks?.length) return null;

  return (
    <>
      <div
        style={{
          position: "relative",
          width: CANVAS_WIDTH,
          height: canvasHeight,
          margin: "0 auto 20px",
        }}
      >
        {blocks
          .filter((b) => b.visible)
          .map((b) => (
            <div
              key={b.id}
              style={{
                position: "absolute",
                left: b.x,
                top: b.y,
                width: b.width,
                height: b.height,
                boxSizing: "border-box",
              }}
            >
              {b.type === "image" ? (
                b.value ? (
                  <img
                    src={b.value}
                    alt=""
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: b.style?.objectFit || "cover",
                      opacity: b.style?.opacity ?? 1,
                      borderRadius: b.style?.borderRadius || 0,
                    }}
                  />
                ) : null
              ) : (
                <div
                  style={{
                    fontSize: b.fontSize || 12,
                    lineHeight: 1.4,
                    whiteSpace: "pre-line",
                    wordBreak: "break-word",
                    textAlign: b?.style?.textAlign,
                    fontWeight: b.style?.fontWeight,
                    fontStyle: b.style?.fontStyle,
                    textDecoration: b.style?.textDecoration,
                    textTransform: b.style?.textTransform,
                    letterSpacing: b.style?.letterSpacing,
                    opacity: b.style?.opacity,
                    fontFamily: b.style?.fontFamily,
                    color: b.style?.color,
                  }}
                >
                  {b.value || ""}
                </div>
              )}
            </div>
          ))}
      </div>
    </>
  );
};

export default PrintHeaderFromCustom;
