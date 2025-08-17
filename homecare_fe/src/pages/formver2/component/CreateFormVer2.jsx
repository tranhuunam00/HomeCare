// CreateFormVer2.jsx (chỉ lo phần tạo form)
import React from "react";
import {
  Button,
  Col,
  Divider,
  Form,
  Input,
  Popconfirm,
  Row,
  Space,
  Tooltip,
  Typography,
} from "antd";
import {
  CloseOutlined,
  DeleteOutlined,
  EyeOutlined,
  HolderOutlined,
  PlusOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

export default function CreateFormVer2({
  rows,
  addRow,
  removeRow,
  addColumn,
  removeColumn,
  // DnD hàng
  onRowDragStart,
  onRowDragOver,
  onRowDrop,
  onRowDragEnd,
  // DnD cột
  onColDragStart,
  onColDragOver,
  onColDrop,
  onColDragEnd,
  maxCols = 5,
  onPreview,
}) {
  const [form] = Form.useForm();

  // submit (nếu cần lưu)
  const onFinish = (values) => {
    console.log("Submit:", values.rows);
  };

  // tạo dữ liệu preview theo thứ tự layout hiện tại
  const handlePreview = async () => {
    await form.validateFields();
    const values = form.getFieldsValue();
    const ordered = rows.map((r) => {
      const payload = values?.rows?.[r.id] || {};
      return {
        id: r.id,
        label: payload.label ?? "",
        inputs: Array.isArray(payload.inputs) ? payload.inputs : [],
      };
    });
    onPreview?.(ordered);
  };

  // hàm sync thứ tự inputs trong Form khi DnD cột
  const syncInputsOrder = (rowId, from, to) => {
    const v = form.getFieldsValue();
    const rowV = v?.rows?.[rowId];
    if (!rowV?.inputs) return;
    const next = { ...v };
    const copy = [...rowV.inputs];
    const [m] = copy.splice(from, 1);
    copy.splice(to, 0, m);
    next.rows[rowId].inputs = copy;
    form.setFieldsValue(next);
  };

  return (
    <Form form={form} layout="vertical" onFinish={onFinish}>
      <Space direction="vertical" style={{ width: "100%" }} size={12}>
        {rows.map((row, idx) => (
          <div
            key={row.id}
            draggable
            onDragStart={(e) => onRowDragStart(e, row.id)}
            onDragOver={onRowDragOver}
            onDrop={(e) => onRowDrop(e, row.id)}
            onDragEnd={onRowDragEnd}
            style={{
              padding: 12,
              border: "1px solid #f0f0f0",
              borderRadius: 10,
              background: "#fff",
              cursor: "grab",
            }}
          >
            <Row gutter={[12, 8]} align="middle">
              {/* Tiêu đề + handle hàng */}
              <Col xs={24} md={6}>
                <Space align="start" style={{ width: "100%" }}>
                  <Tooltip title="Kéo để sắp xếp hàng">
                    <HolderOutlined style={{ fontSize: 18, color: "#999" }} />
                  </Tooltip>
                  <Form.Item
                    name={["rows", row.id, "label"]}
                    label={<Text strong>Tiêu đề</Text>}
                    initialValue={row.label}
                    rules={[{ required: true, message: "Nhập tiêu đề" }]}
                    style={{ flex: 1, marginBottom: 0 }}
                  >
                    <Input placeholder="Short text:" />
                  </Form.Item>
                </Space>
              </Col>

              {/* Các input – dùng CSS Grid để luôn đủ n cột */}
              <Col xs={24} md={18}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: `repeat(${
                      row.inputs.length || 1
                    }, minmax(0, 1fr))`,
                    gap: 12,
                  }}
                >
                  {(row.inputs || []).map((_, i) => (
                    <div
                      key={i}
                      onDragOver={onColDragOver}
                      onDrop={(e) =>
                        onColDrop(e, row.id, i, (from, to) =>
                          syncInputsOrder(row.id, from, to)
                        )
                      }
                    >
                      <Form.Item
                        name={["rows", row.id, "inputs", i]}
                        label={
                          <Space>
                            <Tooltip title="Kéo để sắp xếp cột">
                              <Button
                                size="small"
                                type="text"
                                icon={<HolderOutlined />}
                                draggable
                                onDragStart={(e) =>
                                  onColDragStart(e, row.id, i)
                                }
                                onDragEnd={onColDragEnd}
                                style={{ cursor: "grab" }}
                              />
                            </Tooltip>
                            {i === 0 ? (
                              <Text strong>Giá trị</Text>
                            ) : (
                              <span>&nbsp;</span>
                            )}
                            {row.inputs.length > 1 && (
                              <Tooltip title="Xóa cột này">
                                <Button
                                  size="small"
                                  type="text"
                                  danger
                                  icon={<CloseOutlined />}
                                  onClick={() => removeColumn(row.id, i)}
                                />
                              </Tooltip>
                            )}
                          </Space>
                        }
                        initialValue="Short text"
                        rules={[{ required: true, message: "Nhập nội dung" }]}
                        style={{ marginBottom: 0 }}
                      >
                        <Input placeholder="Short text" />
                      </Form.Item>
                    </div>
                  ))}
                </div>

                {/* Thêm cột */}
                <div style={{ marginTop: 8 }}>
                  <Tooltip
                    title={
                      row.inputs.length >= maxCols
                        ? `Tối đa ${maxCols} cột`
                        : "Thêm cột"
                    }
                  >
                    <Button
                      type="dashed"
                      icon={<PlusOutlined />}
                      size="small"
                      onClick={() => addColumn(row.id)}
                      disabled={row.inputs.length >= maxCols}
                    >
                      Thêm cột
                    </Button>
                  </Tooltip>
                </div>
              </Col>

              {/* Xóa hàng */}
              <Col xs={24} style={{ textAlign: "right", marginTop: 8 }}>
                <Popconfirm
                  title="Xóa hàng này?"
                  okText="Xóa"
                  cancelText="Hủy"
                  onConfirm={() => removeRow(row.id)}
                >
                  <Button danger icon={<DeleteOutlined />} size="small">
                    Xóa hàng
                  </Button>
                </Popconfirm>
              </Col>
            </Row>

            {idx < rows.length - 1 && (
              <Divider style={{ margin: "12px 0 0" }} />
            )}
          </div>
        ))}

        {/* Action của Form */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 8,
          }}
        >
          <Button type="dashed" icon={<PlusOutlined />} onClick={addRow}>
            Thêm hàng
          </Button>

          <Space>
            <Button icon={<EyeOutlined />} onClick={handlePreview}>
              Xem kết quả
            </Button>
            <Button type="primary" htmlType="submit">
              Lưu mô tả
            </Button>
          </Space>
        </div>
      </Space>
    </Form>
  );
}
