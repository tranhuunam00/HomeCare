// HeaderCanvas/editors/ImageEditor.jsx
import { Slider, Select } from "antd";

const ImageEditor = ({ block, onChange }) => {
  const style = block.style || {};

  const updateStyle = (key, value) => {
    onChange(block.id, {
      style: { ...style, [key]: value },
    });
  };

  return (
    <>
      <h4>Image settings</h4>

      {/* Opacity */}
      <label>Opacity</label>
      <Slider
        min={0}
        max={1}
        step={0.05}
        value={style.opacity ?? 1}
        onChange={(v) => updateStyle("opacity", v)}
      />

      {/* Object fit */}
      <label>Object fit</label>
      <Select
        value={style.objectFit || "contain"}
        style={{ width: "100%" }}
        onChange={(v) => updateStyle("objectFit", v)}
        options={[
          { label: "Contain", value: "contain" },
          { label: "Cover", value: "cover" },
        ]}
      />

      {/* Border radius */}
      <label>Border radius</label>
      <Slider
        min={0}
        max={50}
        value={style.borderRadius || 0}
        onChange={(v) => updateStyle("borderRadius", v)}
      />
    </>
  );
};

export default ImageEditor;
