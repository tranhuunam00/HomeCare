import {
  Input,
  InputNumber,
  Checkbox,
  Select,
  Form,
  DatePicker,
  Upload,
  Button,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";

const { Option } = Select;

/**
 * Render Ant Design form items từ danh sách field động
 * @param {Array} fields - danh sách field gồm { type, label, raw, index }
 * @returns JSX[]
 */
export const renderDynamicAntdFields = (fields) => {
  return fields.map((field) => {
    const name = `field_${field.index}`;

    switch (field.type) {
      case "text":
        return (
          <Form.Item label={field.label} name={name} key={name}>
            <Input placeholder={field.label} />
          </Form.Item>
        );

      case "textarea":
        return (
          <Form.Item label={field.label} name={name} key={name}>
            <Input.TextArea
              placeholder={field.label}
              autoSize={{ minRows: 3, maxRows: 6 }}
            />
          </Form.Item>
        );

      case "number":
        return (
          <Form.Item label={field.label} name={name} key={name}>
            <InputNumber placeholder={field.label} style={{ width: "100%" }} />
          </Form.Item>
        );

      case "checkbox":
        return (
          <Form.Item name={name} valuePropName="checked" key={name}>
            <Checkbox>{field.label}</Checkbox>
          </Form.Item>
        );

      case "select":
        return (
          <Form.Item label={field.label} name={name} key={name}>
            <Select placeholder={`Chọn ${field.label}`}>
              <Option value="option1">Option 1</Option>
              <Option value="option2">Option 2</Option>
              <Option value="option3">Option 3</Option>
            </Select>
          </Form.Item>
        );

      case "date":
        return (
          <Form.Item label={field.label} name={name} key={name}>
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>
        );

      case "image":
      case "file":
        return (
          <Form.Item
            label={field.label}
            name={name}
            key={name}
            valuePropName="fileList"
            getValueFromEvent={(e) => e?.fileList}
          >
            <Upload beforeUpload={() => false} listType="picture">
              <Button icon={<UploadOutlined />}>
                Tải lên {field.type === "image" ? "ảnh" : "file"}
              </Button>
            </Upload>
          </Form.Item>
        );

      default:
        return null;
    }
  });
};
