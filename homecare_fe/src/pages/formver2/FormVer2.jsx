// ImageDescription.jsx
import React, { useRef, useState } from "react";
import {
  Form,
  Input,
  Button,
  Row,
  Col,
  Typography,
  Space,
  Popconfirm,
  Divider,
  Modal,
  Tooltip,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  EyeOutlined,
  HolderOutlined,
  CloseOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;
const mkId = () => Math.random().toString(36).slice(2, 9);
const MAX_COLS = 5;

export default function ImageDescription() {
  const [form] = Form.useForm();

  const [rows, setRows] = useState([
    { id: mkId(), inputs: [""], label: "Short text:" },
    { id: mkId(), inputs: ["", ""], label: "Short text:" },
    { id: mkId(), inputs: ["", "", ""], label: "Short text:" },
  ]);

  // Preview
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState([]);

  // Drag & Drop HÀNG
  const dragRowSrcIdRef = useRef(null);

  // Drag & Drop CỘT (trong 1 hàng)
  const dragColRef = useRef({ rowId: null, colIndex: null });

  // ---------- Helpers reorder ----------
  const reorderArray = (arr, from, to) => {
    const copy = [...arr];
    const [item] = copy.splice(from, 1);
    copy.splice(to, 0, item);
    return copy;
  };

  // ---------- HÀNG: CRUD + DnD ----------
  const addRow = () =>
    setRows((prev) => [
      ...prev,
      { id: mkId(), inputs: [""], label: "Short text:" },
    ]);

  const removeRow = (id) => setRows((prev) => prev.filter((r) => r.id !== id));

  const onRowDragStart = (e, rowId) => {
    dragRowSrcIdRef.current = rowId;
    e.dataTransfer.effectAllowed = "move";
  };
  const onRowDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };
  const onRowDrop = (e, targetId) => {
    e.preventDefault();
    const srcId = dragRowSrcIdRef.current;
    if (!srcId || srcId === targetId) return;

    setRows((prev) => {
      const srcIndex = prev.findIndex((r) => r.id === srcId);
      const targetIndex = prev.findIndex((r) => r.id === targetId);
      if (srcIndex < 0 || targetIndex < 0) return prev;
      const next = [...prev];
      const [moved] = next.splice(srcIndex, 1);
      next.splice(targetIndex, 0, moved);
      return next;
    });

    dragRowSrcIdRef.current = null;
  };
  const onRowDragEnd = () => (dragRowSrcIdRef.current = null);

  // ---------- CỘT: CRUD + DnD ----------
  const addColumn = (rowId) => {
    setRows((prev) =>
      prev.map((r) =>
        r.id === rowId && r.inputs.length < MAX_COLS
          ? { ...r, inputs: [...r.inputs, ""] }
          : r
      )
    );
  };

  const removeColumn = (rowId, colIndex) => {
    setRows((prev) =>
      prev.map((r) => {
        if (r.id !== rowId) return r;
        if (r.inputs.length <= 1) return r; // luôn giữ ít nhất 1 cột
        const nextInputs = r.inputs.filter((_, i) => i !== colIndex);
        return { ...r, inputs: nextInputs };
      })
    );

    // Đồng bộ form values sau khi xóa cột
    const v = form.getFieldsValue();
    const rowV = v?.rows?.[rowId];
    if (rowV?.inputs) {
      const next = { ...v };
      const newInputs = [...rowV.inputs];
      newInputs.splice(colIndex, 1);
      next.rows[rowId].inputs = newInputs;
      form.setFieldsValue(next);
    }
  };

  // DnD cột: bắt đầu kéo
  const onColDragStart = (e, rowId, colIndex) => {
    dragColRef.current = { rowId, colIndex };
    e.dataTransfer.effectAllowed = "move";
  };
  // DnD cột: cho phép kéo qua
  const onColDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };
  // DnD cột: thả vào vị trí mục tiêu
  const onColDrop = (e, rowId, targetIndex) => {
    e.preventDefault();
    const { rowId: srcRowId, colIndex: srcIndex } = dragColRef.current || {};
    if (srcRowId == null || srcIndex == null) return;
    if (srcRowId !== rowId || srcIndex === targetIndex) {
      dragColRef.current = { rowId: null, colIndex: null };
      return;
    }

    // Reorder trong state
    setRows((prev) =>
      prev.map((r) => {
        if (r.id !== rowId) return r;
        return { ...r, inputs: reorderArray(r.inputs, srcIndex, targetIndex) };
      })
    );

    // Đồng bộ form values để giữ dữ liệu đúng thứ tự
    const v = form.getFieldsValue();
    const rowV = v?.rows?.[rowId];
    if (rowV?.inputs) {
      const next = { ...v };
      next.rows[rowId].inputs = reorderArray(
        rowV.inputs,
        srcIndex,
        targetIndex
      );
      form.setFieldsValue(next);
    }

    dragColRef.current = { rowId: null, colIndex: null };
  };
  const onColDragEnd = () => {
    dragColRef.current = { rowId: null, colIndex: null };
  };

  // ---------- Submit & Preview ----------
  const onFinish = (values) => {
    console.log("Submit:", values.rows);
  };

  const handlePreview = async () => {
    try {
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
      setPreviewData(ordered);
      setPreviewOpen(true);
    } catch {}
  };

  return (
    <div style={{ maxWidth: 1400, margin: "0 auto", padding: 16 }}>
      <Title level={3} style={{ marginBottom: 24, color: "#2f6db8" }}>
        MÔ TẢ HÌNH ẢNH
      </Title>

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
                {/* Handle kéo-thả HÀNG + Tiêu đề */}
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

                {/* Khu inputs linh hoạt + nút thêm cột */}
                <Col xs={24} md={18}>
                  <Row gutter={[12, 8]}>
                    {(row.inputs || []).map((_, i) => (
                      <Col
                        key={i}
                        xs={24}
                        md={Math.max(
                          6,
                          Math.floor(24 / (row.inputs.length || 1))
                        )}
                        onDragOver={onColDragOver}
                        onDrop={(e) => onColDrop(e, row.id, i)}
                      >
                        <Form.Item
                          name={["rows", row.id, "inputs", i]}
                          label={
                            <Space>
                              {/* Handle kéo-thả CỘT */}
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
                      </Col>
                    ))}

                    {/* Thêm cột */}
                    <Col xs={24}>
                      <Tooltip
                        title={
                          row.inputs.length >= MAX_COLS
                            ? `Tối đa ${MAX_COLS} cột`
                            : "Thêm cột"
                        }
                      >
                        <Button
                          type="dashed"
                          icon={<PlusOutlined />}
                          size="small"
                          onClick={() => addColumn(row.id)}
                          disabled={row.inputs.length >= MAX_COLS}
                        >
                          Thêm cột
                        </Button>
                      </Tooltip>
                    </Col>
                  </Row>
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

          {/* Hành động */}
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

      {/* Modal Preview: mỗi hàng chia đúng số cột riêng */}
      <Modal
        title="Kết quả mô tả"
        open={previewOpen}
        onCancel={() => setPreviewOpen(false)}
        footer={<Button onClick={() => setPreviewOpen(false)}>Đóng</Button>}
        width={1100}
      >
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              tableLayout: "fixed",
              border: "1px solid #d9d9d9",
            }}
          >
            <thead>
              <tr>
                <th
                  style={{
                    border: "1px solid #d9d9d9",
                    padding: "8px",
                    width: "260px",
                    background: "#fafafa",
                    textAlign: "left",
                  }}
                >
                  Tiêu đề
                </th>
                <th
                  style={{
                    border: "1px solid #d9d9d9",
                    padding: "8px",
                    background: "#fafafa",
                    textAlign: "left",
                  }}
                >
                  Giá trị
                </th>
              </tr>
            </thead>
            <tbody>
              {previewData.map((r) => {
                const n = Math.max(1, r.inputs?.length || 0);
                return (
                  <tr key={r.id}>
                    <td
                      style={{
                        border: "1px solid #d9d9d9",
                        padding: "8px",
                        verticalAlign: "top",
                        width: "260px",
                        fontWeight: 600,
                      }}
                    >
                      {r.label || ""}
                    </td>
                    <td style={{ padding: 0, border: "1px solid #d9d9d9" }}>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: `repeat(${n}, 1fr)`,
                          gap: "0px",
                          width: "100%",
                        }}
                      >
                        {(r.inputs && r.inputs.length ? r.inputs : [""]).map(
                          (val, i) => (
                            <div
                              key={i}
                              style={{
                                borderRight:
                                  i < n - 1 ? "1px solid #d9d9d9" : "none",
                                padding: "8px",
                                minHeight: 40,
                                wordBreak: "break-word",
                              }}
                            >
                              {val || ""}
                            </div>
                          )
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Modal>
    </div>
  );
}
