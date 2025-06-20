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
  inputsRender,
  setInputsRender
) => {
  return fields.map((field) => {
    const name = `field_${field.index}`;
    const commonStyle = { fontSize: 11, marginBottom: 8 };

    const updateValue = (value) => {
      setInputsRender((prev) => ({
        ...prev,
        [field.raw]: value,
      }));
    };

    switch (field.type) {
      case "text":
        return (
          <div key={name} style={commonStyle}>
            <div>{field.label}</div>
            <Input
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
            <div>{field.label}</div>
            <Input.TextArea
              size="small"
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
            <div>{field.label}</div>
            <InputNumber
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
      case "file":
        return (
          <div key={name} style={commonStyle}>
            <div>{field.label}</div>
            <Upload
              beforeUpload={() => false}
              listType="picture"
              onChange={(info) => updateValue(info.fileList)}
              style={{ fontSize: 11 }}
            >
              <Button
                size="small"
                icon={<UploadOutlined />}
                style={{ fontSize: 11 }}
              >
                Tải lên {field.type === "image" ? "ảnh" : "file"}
              </Button>
            </Upload>
          </div>
        );

      default:
        return null;
    }
  });
};
