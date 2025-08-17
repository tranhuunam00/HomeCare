// CreateFormVer2.jsx (chỉ lo phần tạo form)
import React, { useMemo } from "react";
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
  mode = "admin", // 'admin' | 'user'
  rows,
  columnLabels = [],
  setColumnLabels, // only used in admin
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
  onAutosaveDraft,
}) {
  const [form] = Form.useForm();
  const isAdmin = mode === "admin";

  // submit (nếu cần lưu backend)
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
        label: payload.label ?? r.label ?? "",
        inputs: Array.isArray(payload.inputs) ? payload.inputs : [],
      };
    });
    onPreview?.(ordered);
  };

  // autosave draft when user typing (USER mode)
  const handleValuesChange = (_, allValues) => {
    if (!isAdmin) {
      const ordered = rows.map((r) => {
        const payload = allValues?.rows?.[r.id] || {};
        return {
          id: r.id,
          label: r.label,
          inputs: Array.isArray(payload.inputs) ? payload.inputs : [],
        };
      });
      onAutosaveDraft?.(ordered);
    }
  };

  // ensure initial values reflect current rows defaults
  const initialValues = useMemo(() => {
    const v = { rows: {} };
    rows.forEach((r) => {
      v.rows[r.id] = {
        label: r.label,
        inputs: r.inputs && r.inputs.length ? r.inputs : [""],
      };
    });
    return v;
  }, [rows]);

  return (
    <>
      {/* ========== COLUMN LABELS ========== */}
      <Row style={{ marginBottom: 12 }} gutter={[12, 8]} align="top">
        <Col xs={24} md={6}>
          <Text strong>Nhãn cột (tự động bằng số cột tối đa)</Text>
        </Col>
        <Col xs={24} md={18}>
          {/* Use CSS Grid to force all labels on one row (e.g., 5 cols) */}
          <div
            style={{
              background: "#fff",
              border: "1px solid #f0f0f0",
              borderRadius: 10,
              padding: 12,
            }}
          >
            <Text strong>Nhãn cột (tự động bằng số cột tối đa)</Text>
            <div
              style={{
                marginTop: 8,
                display: "grid",
                gridTemplateColumns: `repeat(${Math.max(
                  1,
                  columnLabels.length
                )}, minmax(0, 1fr))`,
                gap: 12,
              }}
            >
              {columnLabels.map((lbl, i) => (
                <Input
                  key={i}
                  value={lbl}
                  placeholder={`Nhãn cột ${i + 1}`}
                  onChange={(e) =>
                    isAdmin &&
                    setColumnLabels?.((prev) => {
                      const copy = [...prev];
                      copy[i] = e.target.value;
                      return copy;
                    })
                  }
                  disabled={!isAdmin}
                />
              ))}
            </div>
          </div>
        </Col>
      </Row>

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        onValuesChange={handleValuesChange}
        initialValues={initialValues}
      >
        <Space direction="vertical" style={{ width: "100%" }} size={12}>
          {rows.map((row, idx) => (
            <div
              key={row.id}
              draggable={isAdmin}
              onDragStart={
                isAdmin ? (e) => onRowDragStart?.(e, row.id) : undefined
              }
              onDragOver={isAdmin ? onRowDragOver : undefined}
              onDrop={isAdmin ? (e) => onRowDrop?.(e, row.id) : undefined}
              onDragEnd={isAdmin ? onRowDragEnd : undefined}
              style={{
                padding: 12,
                border: "1px solid #f0f0f0",
                borderRadius: 10,
                background: "#fff",
                cursor: isAdmin ? "grab" : "default",
              }}
            >
              <Row gutter={[12, 8]} align="middle">
                {/* Tiêu đề + handle hàng */}
                <Col xs={24} md={6}>
                  <Space align="start" style={{ width: "100%" }}>
                    {isAdmin && (
                      <Tooltip title="Kéo để sắp xếp hàng">
                        <HolderOutlined
                          style={{ fontSize: 18, color: "#999" }}
                        />
                      </Tooltip>
                    )}
                    <Form.Item
                      name={["rows", row.id, "label"]}
                      label={<Text strong>Tiêu đề</Text>}
                      initialValue={row.label}
                      rules={[{ required: true, message: "Nhập tiêu đề" }]}
                      style={{ flex: 1, marginBottom: 0 }}
                    >
                      <Input placeholder="Short text:" disabled={!isAdmin} />
                    </Form.Item>
                  </Space>
                </Col>

                {/* Các input – grid luôn n cột của hàng (không bắt buộc nMax) */}
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
                        onDragOver={isAdmin ? onColDragOver : undefined}
                        onDrop={
                          isAdmin
                            ? (e) =>
                                onColDrop?.(e, row.id, i, (from, to) => {
                                  // sync order inside Form when DnD
                                  const v = form.getFieldsValue();
                                  const rowV = v?.rows?.[row.id];
                                  if (!rowV?.inputs) return;
                                  const copy = [...rowV.inputs];
                                  const [m] = copy.splice(from, 1);
                                  copy.splice(to, 0, m);
                                  form.setFieldsValue({
                                    ...v,
                                    rows: {
                                      ...v.rows,
                                      [row.id]: { ...rowV, inputs: copy },
                                    },
                                  });
                                })
                            : undefined
                        }
                      >
                        <Form.Item
                          name={["rows", row.id, "inputs", i]}
                          label={
                            <Space>
                              {isAdmin && (
                                <Tooltip title="Kéo để sắp xếp cột">
                                  <Button
                                    size="small"
                                    type="text"
                                    icon={<HolderOutlined />}
                                    draggable
                                    onDragStart={(e) =>
                                      onColDragStart?.(e, row.id, i)
                                    }
                                    onDragEnd={onColDragEnd}
                                    style={{ cursor: "grab" }}
                                  />
                                </Tooltip>
                              )}
                              <Text type="secondary">
                                {columnLabels?.[i] || `Cột ${i + 1}`}
                              </Text>
                              {isAdmin && row.inputs.length > 1 && (
                                <Tooltip title="Xóa cột này">
                                  <Button
                                    size="small"
                                    type="text"
                                    danger
                                    icon={<CloseOutlined />}
                                    onClick={() => removeColumn?.(row.id, i)}
                                  />
                                </Tooltip>
                              )}
                            </Space>
                          }
                          initialValue={row.inputs?.[i] ?? ""}
                          rules={[{ required: true, message: "Nhập nội dung" }]}
                          style={{ marginBottom: 0 }}
                        >
                          <Input placeholder="Short text" />
                        </Form.Item>
                      </div>
                    ))}
                  </div>

                  {/* Thêm cột */}
                  {isAdmin && (
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
                          onClick={() => addColumn?.(row.id)}
                          disabled={row.inputs.length >= maxCols}
                        >
                          Thêm cột
                        </Button>
                      </Tooltip>
                    </div>
                  )}
                </Col>

                {/* Xóa hàng */}
                {isAdmin && (
                  <Col xs={24} style={{ textAlign: "right", marginTop: 8 }}>
                    <Popconfirm
                      title="Xóa hàng này?"
                      okText="Xóa"
                      cancelText="Hủy"
                      onConfirm={() => removeRow?.(row.id)}
                    >
                      <Button danger icon={<DeleteOutlined />} size="small">
                        Xóa hàng
                      </Button>
                    </Popconfirm>
                  </Col>
                )}
              </Row>

              {idx < rows.length - 1 && (
                <Divider style={{ margin: "12px 0 0" }} />
              )}
            </div>
          ))}

          {/* Action */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 8,
            }}
          >
            {isAdmin ? (
              <Button type="dashed" icon={<PlusOutlined />} onClick={addRow}>
                Thêm hàng
              </Button>
            ) : (
              <span />
            )}

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
    </>
  );
}
