import {
  Input,
  InputNumber,
  Checkbox,
  Select,
  DatePicker,
  Upload,
  Button,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";

const { Option } = Select;

export const renderDynamicAntdFields = (
  fields,
  inputsRender = {},
  setInputsRender,
  setInputsRenderTrans
) => {
  const groupedFields = {};

  // Gom nhóm theo group
  fields.forEach((field) => {
    const groupName = field.group || "__no_group__";
    if (!groupedFields[groupName]) {
      groupedFields[groupName] = [];
    }
    groupedFields[groupName].push(field);
  });

  const renderField = (field) => {
    const name = `field_${field.index}`;
    const value =
      inputsRender[field.raw] ||
      (field.type === "image"
        ? { url: field.defaultValue }
        : field.defaultValue);

    const commonStyle = {
      fontSize: 11,
      marginBottom: 8,
      width: 600,
      marginRight: 30,
    };

    const updateValue = (value) => {
      setInputsRender({
        ...inputsRender,
        [field.raw]: value,
      });
      if (setInputsRenderTrans) {
        setInputsRenderTrans((prev) => ({ ...prev, [field.raw]: value }));
      }
    };

    switch (field.type) {
      case "text":
        return (
          <div key={name} style={commonStyle}>
            <div style={{ fontWeight: 600, fontStyle: "italic" }}>
              {field.label}
            </div>
            <Input
              value={value}
              size="small"
              placeholder={field.label}
              onChange={(e) => updateValue(e.target.value)}
              style={{ fontSize: 11 }}
            />
          </div>
        );

      case "textarea":
        return (
          <div key={name} style={commonStyle}>
            <div style={{ fontWeight: 600, fontStyle: "italic" }}>
              {field.label}
            </div>
            <Input.TextArea
              size="small"
              value={value}
              placeholder={field.label}
              autoSize={{ minRows: 2, maxRows: 4 }}
              onChange={(e) => updateValue(e.target.value)}
              style={{ fontSize: 11 }}
            />
          </div>
        );

      case "number":
        return (
          <div key={name} style={commonStyle}>
            <div style={{ fontWeight: 600, fontStyle: "italic" }}>
              {field.label}
            </div>
            <InputNumber
              value={value}
              size="small"
              style={{ width: "100%", fontSize: 11 }}
              placeholder={field.label}
              onChange={(val) => updateValue(val)}
            />
          </div>
        );

      case "checkbox":
        return (
          <div key={name} style={{ ...commonStyle }}>
            <Checkbox
              style={{ fontSize: 11 }}
              onChange={(e) => updateValue(e.target.checked)}
            >
              {field.label}
            </Checkbox>
          </div>
        );

      case "select":
        return (
          <div key={name} style={commonStyle}>
            <div>{field.label}</div>
            <Select
              size="small"
              style={{ width: "100%", fontSize: 11 }}
              placeholder={`Chọn ${field.label}`}
              onChange={(val) => updateValue(val)}
            >
              <Option value="option1">Option 1</Option>
              <Option value="option2">Option 2</Option>
              <Option value="option3">Option 3</Option>
            </Select>
          </div>
        );

      case "date":
        return (
          <div key={name} style={commonStyle}>
            <div>{field.label}</div>
            <DatePicker
              size="small"
              style={{ width: "100%", fontSize: 11 }}
              onChange={(date, dateString) => updateValue(dateString)}
            />
          </div>
        );

      case "image":
        return (
          <div
            key={name}
            style={{
              fontSize: 11,
              marginBottom: 8,
              width: 150,
              marginRight: 30,
            }}
          >
            <div style={{ fontWeight: 150, fontStyle: "italic" }}>
              {field.label}
            </div>
            {value?.url && (
              <div style={{ marginBottom: 8 }}>
                <img
                  src={value.url?.trim()}
                  alt="Ảnh mặc định"
                  style={{
                    width: 120,
                    height: 80,
                    objectFit: "cover",
                    borderRadius: 4,
                  }}
                />
              </div>
            )}

            <Upload
              beforeUpload={(file) => {
                const previewUrl = URL.createObjectURL(file);
                updateValue({
                  ...file,
                  url: previewUrl,
                  originFileObj: file,
                });
                return false;
              }}
              listType="picture"
              maxCount={1}
              defaultFileList={value ? [value] : []}
            >
              <Button
                size="small"
                icon={<UploadOutlined />}
                style={{ fontSize: 11 }}
              >
                Tải lên ảnh
              </Button>
            </Upload>
          </div>
        );

      default:
        return null;
    }
  };

  // Render theo nhóm
  return Object.entries(groupedFields).map(([groupName, groupFields]) => (
    <div key={groupName} style={{ marginBottom: 24 }}>
      {groupName !== "__no_group__" && (
        <div style={{ fontWeight: 700, marginBottom: 8 }}>
          <strong>{groupName}</strong>
        </div>
      )}
      <div style={{ display: "flex", flexWrap: "wrap" }}>
        {groupFields.map((field) => renderField(field))}
      </div>
    </div>
  ));
};
