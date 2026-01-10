import React, { useEffect } from "react";
import { Modal, Form, Input, Select, Row, Col } from "antd";

const { Option } = Select;

export const FormVer3NameModal = ({
  open,
  onCancel,
  onSubmit,
  editingRecord, // null = tạo mới | object = chỉnh sửa
  templateServices = [],
  examParts = [],
  defaultValues,
}) => {
  const [form] = Form.useForm();
  const isEdit = !!editingRecord;

  useEffect(() => {
    if (!open) return;

    if (editingRecord) {
      form.setFieldsValue(editingRecord);
    } else {
      form.setFieldsValue(defaultValues || {});
    }
  }, [open, editingRecord, defaultValues, form]);

  const handleFinish = (values) => {
    onSubmit(values, editingRecord?.id);
  };

  return (
    <Modal
      title={isEdit ? "Chỉnh sửa tên mẫu" : "Thêm tên mẫu mới"}
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      okText={isEdit ? "Cập nhật" : "Thêm"}
      cancelText="Huỷ"
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Form.Item
          name="name"
          label="Tên mẫu"
          rules={[
            { required: true, message: "Vui lòng nhập tên mẫu" },
            { max: 255, message: "Tối đa 255 ký tự" },
          ]}
        >
          <Input placeholder="VD: Mẫu siêu âm tuyến giáp" />
        </Form.Item>

        <Form.Item
          name="code"
          label="Mã định danh (Code)"
          rules={[
            { required: true, message: "Vui lòng nhập code" },
            { max: 30, message: "Tối đa 30 ký tự theo cú pháp DRAD-" },
            {
              pattern: /^DRAD-[A-Za-z0-9-]+(\s\[[A-Za-z]{2}\])?$/,
              message:
                "Code phải bắt đầu bằng DRAD-, chỉ gồm A–Z, 0–9, dấu gạch nối (-), và có thể có [US], [VN]",
            },
          ]}
        >
          <Input
            placeholder="DRAD-IRSA-06"
            allowClear
            onChange={(e) =>
              form.setFieldsValue({ code: e.target.value.toUpperCase() })
            }
            onBlur={(e) => {
              let v = (e.target.value || "").trim().toUpperCase();
              if (v && !v.startsWith("DRAD-"))
                v = `DRAD-${v.replace(/^DRAD-?/i, "")}`;
              form.setFieldsValue({ code: v });
            }}
          />
        </Form.Item>

        <Row gutter={12}>
          <Col span={12}>
            <Form.Item
              name="id_template_service"
              label="Phân hệ"
              rules={[{ required: true, message: "Vui lòng chọn phân hệ" }]}
            >
              <Select
                placeholder="Chọn phân hệ…"
                allowClear
                showSearch
                optionFilterProp="children"
                onChange={() =>
                  form.setFieldsValue({ id_exam_part: undefined })
                }
              >
                {templateServices.map((s) => (
                  <Option key={s.id} value={s.id}>
                    {s.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item shouldUpdate>
              {({ getFieldValue }) => {
                const serviceId = getFieldValue("id_template_service");
                return (
                  <Form.Item
                    name="id_exam_part"
                    label="Bộ phận"
                    rules={[
                      { required: true, message: "Vui lòng chọn bộ phận" },
                    ]}
                  >
                    <Select
                      placeholder="Chọn bộ phận…"
                      allowClear
                      showSearch
                      optionFilterProp="children"
                      disabled={!serviceId}
                    >
                      {examParts
                        .filter(
                          (p) =>
                            String(p.id_template_service) === String(serviceId)
                        )
                        .map((p) => (
                          <Option key={p.id} value={p.id}>
                            {p.name}
                          </Option>
                        ))}
                    </Select>
                  </Form.Item>
                );
              }}
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};
