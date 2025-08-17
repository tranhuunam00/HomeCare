// CreateFormVer2.jsx – chỉ lo phần tạo form (React + AntD)
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
  HolderOutlined,
  PlusOutlined,
} from "@ant-design/icons";

const { Text } = Typography;
const { TextArea } = Input;

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
  // ❌ bỏ kéo thả cột
  maxCols = 5,
  onPreview,
  onAutosaveDraft,
}) {
  const [form] = Form.useForm();
  const isAdmin = mode === "admin";

  const onFinish = () => {};

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

  const initialValues = useMemo(() => {
    const v = { rows: {} };
    rows.forEach((r) => {
      v.rows[r.id] = {
        label: r.label ?? "",
        inputs: r.inputs && r.inputs.length ? r.inputs : [""],
      };
    });
    return v;
  }, [rows]);

  const labelCols = Math.max(
    1,
    Math.min(maxCols, columnLabels.length || maxCols)
  );

  return (
    <>
      {/* ========== COLUMN LABELS (thụt trái như inputs) ========== */}
      <Row style={{ marginBottom: 12 }} gutter={[12, 8]} align="top">
        <Col xs={24} md={6}>
          <Text strong></Text>
        </Col>
        <Col xs={24} md={18}>
          <div
            style={{
              background: "#fff",
              border: "1px solid #f0f0f0",
              borderRadius: 10,
              padding: 12,
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${labelCols}, minmax(0, 1fr))`,
                gap: 12,
              }}
            >
              {Array.from({ length: labelCols }).map((_, i) => (
                <Input
                  key={i}
                  value={columnLabels?.[i] ?? ""}
                  placeholder={`Nhãn cột ${i + 1}`}
                  onChange={(e) =>
                    isAdmin &&
                    setColumnLabels?.((prev) => {
                      const copy = [...(prev || [])];
                      for (let k = copy.length; k < labelCols; k++)
                        copy[k] = "";
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

      {/* ========================= FORM ========================= */}
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        onValuesChange={handleValuesChange}
        initialValues={initialValues}
      >
        <Space direction="vertical" style={{ width: "100%" }} size={12}>
          {rows.map((row, idx) => {
            const card = (
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
                <Row gutter={[12, 8]} align="top">
                  {/* Tiêu đề */}
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
                        initialValue={row.label}
                        rules={[{ required: true, message: "Nhập tiêu đề" }]}
                        style={{ flex: 1, marginBottom: 8 }}
                      >
                        <Input placeholder="Short text:" disabled={!isAdmin} />
                      </Form.Item>
                    </Space>
                  </Col>

                  {/* Inputs theo số cột của hàng */}
                  <Col xs={24} md={18}>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: `repeat(${
                          row.inputs?.length || 1
                        }, minmax(0, 1fr))`,
                        gap: 12,
                      }}
                    >
                      {(row.inputs || []).map((_, i) => {
                        const isLast = i === (row.inputs?.length ?? 1) - 1;
                        return (
                          <div key={i}>
                            <Form.Item
                              name={["rows", row.id, "inputs", i]}
                              label={
                                <Space wrap>
                                  {/* X — xóa cột */}
                                  {isAdmin && row.inputs.length > 1 && (
                                    <Tooltip title="Xóa cột này">
                                      <Button
                                        size="small"
                                        type="text"
                                        danger
                                        icon={<CloseOutlined />}
                                        onClick={() => {
                                          removeColumn?.(row.id, i);
                                          const v = form.getFieldsValue();
                                          const rowV = v?.rows?.[row.id];
                                          if (rowV?.inputs?.length) {
                                            const copy = [...rowV.inputs];
                                            copy.splice(i, 1);
                                            form.setFieldsValue({
                                              ...v,
                                              rows: {
                                                ...v.rows,
                                                [row.id]: {
                                                  ...rowV,
                                                  inputs: copy,
                                                },
                                              },
                                            });
                                          }
                                        }}
                                      />
                                    </Tooltip>
                                  )}

                                  {/* + — thêm cột, chỉ ở cột cuối */}
                                  {isAdmin && isLast && (
                                    <Tooltip
                                      title={
                                        row.inputs.length >= maxCols
                                          ? `Tối đa ${maxCols} cột`
                                          : "Thêm cột"
                                      }
                                    >
                                      <Button
                                        size="small"
                                        type="text"
                                        icon={<PlusOutlined />}
                                        disabled={row.inputs.length >= maxCols}
                                        onClick={() => {
                                          addColumn?.(row.id);
                                          const v = form.getFieldsValue();
                                          const rowV = v?.rows?.[row.id] || {};
                                          const nextInputs = Array.isArray(
                                            rowV.inputs
                                          )
                                            ? [...rowV.inputs, ""]
                                            : [""];
                                          form.setFieldsValue({
                                            ...v,
                                            rows: {
                                              ...v.rows,
                                              [row.id]: {
                                                ...rowV,
                                                inputs: nextInputs,
                                              },
                                            },
                                          });
                                        }}
                                      />
                                    </Tooltip>
                                  )}
                                </Space>
                              }
                              initialValue={row.inputs?.[i] ?? ""}
                              rules={[
                                { required: true, message: "Nhập nội dung" },
                              ]}
                              style={{ marginBottom: 8 }}
                            >
                              {/* Enter để xuống dòng & auto giãn */}
                              <TextArea
                                placeholder="Short text"
                                autoSize={{ minRows: 1, maxRows: 10 }}
                              />
                            </Form.Item>
                          </div>
                        );
                      })}
                    </div>
                  </Col>
                </Row>
              </div>
            );

            // Wrapper hàng: card bên trái, cột thao tác (xóa) bên phải, KHÔNG chồng lên nội dung
            return (
              <React.Fragment key={`${row.id}-frag`}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 8,
                    width: "100%",
                  }}
                >
                  <div style={{ flex: 1 }}>{card}</div>

                  {/* ===== XÓA HÀNG: đặt ngoài phạm vi card, sát bên phải ===== */}
                  {isAdmin && (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                        alignItems: "flex-end",
                      }}
                      onMouseDown={(e) => e.stopPropagation()}
                    >
                      <Popconfirm
                        title="Xóa hàng này?"
                        okText="Xóa"
                        cancelText="Hủy"
                        onConfirm={() => removeRow?.(row.id)}
                      >
                        <Button
                          danger
                          icon={<DeleteOutlined />}
                          size="small"
                        ></Button>
                      </Popconfirm>
                    </div>
                  )}
                </div>

                {/* Divider giữa các hàng */}
                {idx < rows.length - 1 && (
                  <Divider style={{ margin: "8px 0 0" }} />
                )}

                {/* ===== THÊM HÀNG: chỉ hiển thị ở HÀNG CUỐI ===== */}
                {isAdmin && idx === rows.length - 1 && (
                  <div
                    style={{
                      marginTop: 8,
                      display: "flex",
                      justifyContent: "flex-end",
                      width: "100%",
                    }}
                  >
                    <Tooltip title="Thêm hàng mới">
                      <Button
                        type="dashed"
                        icon={<PlusOutlined />}
                        size="small"
                        onClick={addRow}
                      >
                        Thêm hàng
                      </Button>
                    </Tooltip>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </Space>
      </Form>
    </>
  );
}
