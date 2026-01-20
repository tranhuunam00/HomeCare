// HeaderCanvas/editors/ImageEditor.jsx
import { Input, Select, Space } from "antd";

const ImageEditor = ({ block, onChange }) => {
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
      <h4 style={{ marginBottom: 12 }}>Image settings</h4>

      {/* Position & Size */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 12, color: "#666", marginBottom: 4 }}>
          Position & Size (px)
        </div>

        <Space style={{ marginBottom: 6 }}>
          <Input
            type="number"
            size="small"
            value={block.x}
            onChange={(e) =>
              onChange(block.id, {
                x: Number(e.target.value),
              })
            }
            style={{ width: 100 }}
            addonBefore="X"
          />

          <Input
            type="number"
            size="small"
            value={block.y}
            onChange={(e) =>
              onChange(block.id, {
                y: Number(e.target.value),
              })
            }
            style={{ width: 100 }}
            addonBefore="Y"
          />
        </Space>

        <Space>
          <Input
            type="number"
            size="small"
            min={1}
            value={block.width}
            onChange={(e) =>
              onChange(block.id, {
                width: Number(e.target.value),
              })
            }
            style={{ width: 100 }}
            addonBefore="W"
          />

          <Input
            type="number"
            size="small"
            min={1}
            value={block.height}
            onChange={(e) =>
              onChange(block.id, {
                height: Number(e.target.value),
              })
            }
            style={{ width: 100 }}
            addonBefore="H"
          />
        </Space>
      </div>

      {/* Opacity & Border radius */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 12, color: "#666", marginBottom: 4 }}>
          Opacity / Radius
        </div>

        <Space>
          <Input
            type="number"
            size="small"
            min={0}
            max={1}
            step={0.1}
            value={style.opacity ?? 1}
            onChange={(e) => updateStyle("opacity", Number(e.target.value))}
            style={{ width: 100 }}
            addonAfter="α"
          />

          <Input
            type="number"
            size="small"
            min={0}
            max={100}
            value={style.borderRadius || 0}
            onChange={(e) =>
              updateStyle("borderRadius", Number(e.target.value))
            }
            style={{ width: 100 }}
            addonAfter="px"
          />
        </Space>
      </div>

      {/* Object fit */}
      <div>
        <div style={{ fontSize: 12, color: "#666", marginBottom: 4 }}>
          Object fit
        </div>

        <Select
          size="small"
          value={style.objectFit || "contain"}
          style={{ width: "100%" }}
          onChange={(v) => updateStyle("objectFit", v)}
          options={[
            { label: "Contain", value: "contain" },
            { label: "Cover", value: "cover" },
            { label: "Fill", value: "fill" },
          ]}
        />
      </div>
    </>
  );
};

export default ImageEditor;
