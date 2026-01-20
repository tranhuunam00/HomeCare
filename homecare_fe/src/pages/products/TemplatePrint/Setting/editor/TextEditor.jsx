// HeaderCanvas/editors/TextEditor.jsx
import { Button, Input, Space } from "antd";
import {
  BoldOutlined,
  ItalicOutlined,
  UnderlineOutlined,
  AlignLeftOutlined,
  AlignCenterOutlined,
  AlignRightOutlined,
} from "@ant-design/icons";

const TextEditor = ({ block, onChange }) => {
  const style = block.style || {};

  const updateStyle = (key, value) => {
    onChange(block.id, {
      style: {
        ...style,
        [key]: value,
      },
    });
  };

  return (
    <>
      <h4 style={{ marginBottom: 12 }}>Text settings</h4>

      {/* Font size + Line height */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 12, color: "#666", marginBottom: 4 }}>
          Font size / Line height
        </div>

        <Space>
          <Input
            type="number"
            size="small"
            min={8}
            max={60}
            value={style.fontSize || 12}
            onChange={(e) => updateStyle("fontSize", Number(e.target.value))}
            style={{ width: 110 }}
            addonAfter="px"
          />

          <Input
            type="number"
            size="small"
            min={1}
            max={3}
            step={0.1}
            value={style.lineHeight || 1.4}
            onChange={(e) => updateStyle("lineHeight", Number(e.target.value))}
            style={{ width: 110 }}
            addonAfter="lh"
          />
        </Space>
      </div>

      {/* Color + Font style + Align */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 12, color: "#666", marginBottom: 4 }}>
          Color / Style / Align
        </div>

        <Space wrap>
          {/* Color */}
          <Input
            type="color"
            value={style.color || "#000000"}
            onChange={(e) => updateStyle("color", e.target.value)}
            style={{ width: 36, padding: 0 }}
          />

          {/* Bold */}
          <Button
            size="small"
            icon={<BoldOutlined />}
            type={style.fontWeight === "bold" ? "primary" : "default"}
            onClick={() =>
              updateStyle(
                "fontWeight",
                style.fontWeight === "bold" ? "normal" : "bold",
              )
            }
          />

          {/* Italic */}
          <Button
            size="small"
            icon={<ItalicOutlined />}
            type={style.fontStyle === "italic" ? "primary" : "default"}
            onClick={() =>
              updateStyle(
                "fontStyle",
                style.fontStyle === "italic" ? "normal" : "italic",
              )
            }
          />

          {/* Underline */}
          <Button
            size="small"
            icon={<UnderlineOutlined />}
            type={style.textDecoration === "underline" ? "primary" : "default"}
            onClick={() =>
              updateStyle(
                "textDecoration",
                style.textDecoration === "underline" ? "none" : "underline",
              )
            }
          />

          {/* Align */}
          <Button
            size="small"
            icon={<AlignLeftOutlined />}
            type={style.textAlign === "left" ? "primary" : "default"}
            onClick={() => updateStyle("textAlign", "left")}
          />
          <Button
            size="small"
            icon={<AlignCenterOutlined />}
            type={style.textAlign === "center" ? "primary" : "default"}
            onClick={() => updateStyle("textAlign", "center")}
          />
          <Button
            size="small"
            icon={<AlignRightOutlined />}
            type={style.textAlign === "right" ? "primary" : "default"}
            onClick={() => updateStyle("textAlign", "right")}
          />
        </Space>
      </div>

      {/* Letter spacing + Opacity */}
      <div>
        <div style={{ fontSize: 12, color: "#666", marginBottom: 4 }}>
          Spacing / Opacity
        </div>

        <Space>
          <Input
            type="number"
            size="small"
            step={0.5}
            value={style.letterSpacing || 0}
            onChange={(e) =>
              updateStyle("letterSpacing", Number(e.target.value))
            }
            style={{ width: 110 }}
            addonAfter="px"
          />

          <Input
            type="number"
            size="small"
            min={0}
            max={1}
            step={0.1}
            value={style.opacity ?? 1}
            onChange={(e) => updateStyle("opacity", Number(e.target.value))}
            style={{ width: 110 }}
            addonAfter="α"
          />
        </Space>
      </div>
    </>
  );
};

export default TextEditor;
