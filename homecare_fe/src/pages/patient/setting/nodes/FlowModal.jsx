import { useCallback, useEffect, useMemo, useState } from "react";
import { Modal, Button, Space, Select, Divider, Input, Row } from "antd";
import { nanoid } from "nanoid";
import {
  ReactFlow,
  addEdge,
  Background,
  useNodesState,
  useEdgesState,
  MiniMap,
  Controls,
} from "@xyflow/react";
import { useNavigate } from "react-router-dom";
import "@xyflow/react/dist/style.css";

import {
  nodeTypes,
  NODE_OPTIONS,
  ACTION_OPTIONS,
  ACTION_FACTORY,
  NAVIGATE_OPTIONS,
} from "./nodeTypes";
import { useGlobalAuth } from "../../../../contexts/AuthContext";
import { USER_ROLE } from "../../../../constant/app";
import { toast } from "react-toastify";
import API_CALL from "../../../../services/axiosClient";
import Title from "antd/es/skeleton/Title";
import TextArea from "antd/es/input/TextArea";

const DEFAULT_NODE_STYLE = {
  background: "#ffffff",
  border: "#1677ff",
  text: "#000000",
};

/* ================= SMALL UI ================= */
const ColorPreview = ({ color, onClick }) => (
  <div
    onClick={onClick}
    style={{
      width: 26,
      height: 26,
      borderRadius: "50%",
      background: color,
      border: "1px solid #d9d9d9",
      cursor: "pointer",
    }}
  />
);

const FlowModal = ({ open, onClose }) => {
  const navigate = useNavigate();
  const { user } = useGlobalAuth();

  /* ================= STATE ================= */
  const [mode, setMode] = useState("edit"); // edit | run
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNodeType, setSelectedNodeType] = useState("custom");
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [flowName, setFlowName] = useState("FLOW-DRADS");
  const [flowId, setFlowId] = useState(null);
  const [openColor, setOpenColor] = useState(null); // background | border | null
  const [selectedEdgeId, setSelectedEdgeId] = useState(null);

  const canEdit = user?.id_role === USER_ROLE.ADMIN;

  const selectedNode = useMemo(() => {
    const node = nodes.find((n) => n.id === selectedNodeId);
    if (!node) return null;

    return {
      ...node,
      data: {
        ...node.data,
        style: {
          ...DEFAULT_NODE_STYLE,
          ...(node.data?.style || {}),
        },
      },
    };
  }, [nodes, selectedNodeId]);
  /* ================= CONNECTION ================= */
  const onConnect = useCallback((params) => {
    setEdges((eds) => addEdge({ ...params, animated: true }, eds));
  }, []);

  /* ================= ADD NODE ================= */
  const addNode = () => {
    if (!canEdit || mode !== "edit") return;

    const option = NODE_OPTIONS.find((o) => o.value === selectedNodeType);

    setNodes((nds) => [
      ...nds,
      {
        id: nanoid(),
        type: selectedNodeType,
        position: { x: Math.random() * 300, y: Math.random() * 200 },
        data: {
          label: option?.defaultLabel || "New Node",
          style: { ...DEFAULT_NODE_STYLE },
          action: { type: "none", payload: {} },
        },
      },
    ]);
  };

  /* ================= ACTION RUNNER ================= */
  const runNodeAction = (node) => {
    const action = node?.data?.action;
    if (!action || action.type === "none") return;
    const { mode, path, url } = action.payload;

    if (mode === "preset" && path) {
      navigate(path);
      return;
    }

    if (mode === "custom" && url) {
      if (url.startsWith("http")) {
        window.open(url, "_blank");
      } else {
        navigate(url);
      }
    }
    if (action.type === "notify")
      toast.info(action.payload.message || "Thông báo");
  };

  /* ================= NODE CLICK ================= */
  const handleNodeClick = (_, node) => {
    if (mode === "edit" && canEdit) {
      setSelectedNodeId(node.id);
      return;
    }
    runNodeAction(node);
  };

  const handlePaneClick = () => {
    if (mode === "edit" && canEdit) setSelectedNodeId(null);
  };

  /* ================= UPDATE NODE ================= */
  const updateNodeData = (updater) => {
    setNodes((nds) =>
      nds.map((n) =>
        n.id === selectedNodeId
          ? { ...n, data: { ...n.data, ...updater(n.data) } }
          : n,
      ),
    );
  };

  const handleEdgeClick = (_, edge) => {
    if (mode === "edit" && canEdit) {
      setSelectedEdgeId(edge.id);
    }
  };

  /* ================= LOAD FLOW ================= */
  useEffect(() => {
    if (!open) return;

    const fetchFlow = async () => {
      try {
        const res = await API_CALL.get(`/flows/byName/${flowName}`);
        const flow = res.data.data;
        if (!flow) return;

        setFlowId(flow.id);
        setFlowName(flow.name);
        setNodes(flow.nodes || []);
        setEdges(flow.edges || []);
      } catch {
        setNodes([]);
        setEdges([]);
      }
    };

    fetchFlow();
  }, [open]);

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width="92%"
      title="QUY TRÌNH D-RADS"
      destroyOnClose
    >
      {/* ===== TOOLBAR ===== */}
      <Space wrap style={{ marginBottom: 12 }}>
        <Button
          type={mode === "edit" && canEdit ? "primary" : "default"}
          onClick={() => setMode("edit")}
          disabled={!canEdit}
        >
          ✏️ Edit
        </Button>
        <Button
          type={mode === "run" ? "primary" : "default"}
          onClick={() => setMode("run")}
        >
          ▶️ Run
        </Button>

        <Divider type="vertical" />

        <Select
          style={{ width: 200 }}
          value={selectedNodeType}
          onChange={setSelectedNodeType}
          options={NODE_OPTIONS}
          disabled={!canEdit || mode !== "edit"}
        />

        <Button
          type="primary"
          onClick={addNode}
          disabled={!canEdit || mode !== "edit"}
        >
          ➕ Add Node
        </Button>

        <Button
          danger
          disabled={!selectedNodeId || !canEdit || mode !== "edit"}
          onClick={() => {
            setNodes((nds) => nds.filter((n) => n.id !== selectedNodeId));
            setEdges((eds) =>
              eds.filter(
                (e) =>
                  e.source !== selectedNodeId && e.target !== selectedNodeId,
              ),
            );
            setSelectedNodeId(null);
          }}
        >
          🗑 Delete Node
        </Button>

        <Button
          danger
          disabled={!selectedEdgeId || !canEdit || mode !== "edit"}
          onClick={() => {
            setEdges((eds) => eds.filter((e) => e.id !== selectedEdgeId));
            setSelectedEdgeId(null);
          }}
        >
          ❌ Delete Edge
        </Button>

        <Input
          style={{ width: 220 }}
          value={flowName}
          onChange={(e) => setFlowName(e.target.value)}
          disabled={!canEdit}
        />

        <Button
          type="primary"
          disabled={!canEdit || mode !== "edit"}
          onClick={async () => {
            const payload = {
              name: flowName,
              description: "Workflow D-RADS",
              nodes,
              edges,
              status: "draft",
            };

            try {
              if (flowId) {
                await API_CALL.put(`/flows/${flowId}`, payload);
                toast.success("Cập nhật workflow thành công");
              } else {
                const res = await API_CALL.post("/flows", payload);
                setFlowId(res.data.data.id);
                toast.success("Tạo workflow thành công");
              }
              onClose?.();
            } catch {
              toast.error("Lưu workflow thất bại");
            }
          }}
        >
          💾 {flowId ? "Cập nhật" : "Lưu"}
        </Button>
      </Space>

      {/* ===== CONFIG PANEL ===== */}
      {mode === "edit" && canEdit && selectedNode && (
        <div
          style={{
            position: "fixed",
            right: 24,
            top: 110,
            zIndex: 20,
            width: 360,
            background: "#fff",
            borderRadius: 12,
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
          }}
        >
          <div style={{ padding: 14, borderBottom: "1px solid #f0f0f0" }}>
            <b>⚙️ Node Configuration</b>
          </div>

          <div style={{ padding: 14 }}>
            <Space direction="vertical" style={{ width: "100%" }} size="middle">
              <TextArea
                value={selectedNode.data.label}
                onChange={(e) =>
                  updateNodeData(() => ({ label: e.target.value }))
                }
                placeholder="Node title"
                autoSize={{ minRows: 1, maxRows: 3 }}
              />

              <div
                style={{
                  display: "flex",
                  justifyItems: "center",
                  gap: 10,
                }}
              >
                <h4>Dạng hành động: </h4>
                <Select
                  style={{
                    width: 150,
                  }}
                  value={selectedNode.data.action.type}
                  options={ACTION_OPTIONS}
                  onChange={(type) =>
                    updateNodeData(() => ({
                      action:
                        ACTION_FACTORY[type]?.create() ||
                        ACTION_FACTORY.none.create(),
                    }))
                  }
                />
              </div>

              {selectedNode.data.action.type === "navigate" && (
                <Select
                  style={{ width: 200 }}
                  value={selectedNode.data.action.payload.mode}
                  options={[
                    { label: "Route có sẵn", value: "preset" },
                    { label: "Link bất kỳ", value: "custom" },
                  ]}
                  onChange={(mode) =>
                    updateNodeData(() => ({
                      action: {
                        type: "navigate",
                        payload: { mode, path: "", url: "" }, // reset cái còn lại
                      },
                    }))
                  }
                />
              )}

              {selectedNode.data.action.type === "navigate" &&
                selectedNode.data.action.payload.mode === "preset" && (
                  <Select
                    style={{ width: 200 }}
                    placeholder="Chọn route"
                    options={NAVIGATE_OPTIONS}
                    value={selectedNode.data.action.payload.path}
                    onChange={(path) =>
                      updateNodeData(() => ({
                        action: {
                          type: "navigate",
                          payload: {
                            mode: "preset",
                            path,
                            url: "",
                          },
                        },
                      }))
                    }
                  />
                )}

              {selectedNode.data.action.type === "navigate" &&
                selectedNode.data.action.payload.mode === "custom" && (
                  <Input
                    placeholder="Nhập link bất kỳ"
                    value={selectedNode.data.action.payload.url}
                    onChange={(e) =>
                      updateNodeData(() => ({
                        action: {
                          type: "navigate",
                          payload: {
                            mode: "custom",
                            url: e.target.value,
                            path: "",
                          },
                        },
                      }))
                    }
                  />
                )}

              {selectedNode.data.action.type === "notify" && (
                <TextArea
                  value={selectedNode.data.action.payload.message}
                  onChange={(e) =>
                    updateNodeData(() => ({
                      action: {
                        type: "notify",
                        payload: { message: e.target.value },
                      },
                    }))
                  }
                  placeholder="Nội dung thông báo"
                  autoSize={{ minRows: 1, maxRows: 5 }}
                />
              )}

              <Divider />

              <div>
                <div style={{ fontSize: 12, color: "#666", marginBottom: 6 }}>
                  Colors
                </div>

                <Space>
                  <div>
                    <div style={{ fontSize: 11, marginBottom: 4 }}>Nền</div>
                    <ColorPreview
                      color={selectedNode.data.style?.background}
                      onClick={() => setOpenColor("background")}
                    />
                  </div>

                  <div>
                    <div style={{ fontSize: 11, marginBottom: 4 }}>Viền</div>
                    <ColorPreview
                      color={selectedNode.data.style?.border}
                      onClick={() => setOpenColor("border")}
                    />
                  </div>

                  <div>
                    <div style={{ fontSize: 11, marginBottom: 4 }}>Chữ</div>
                    <ColorPreview
                      color={selectedNode.data.style?.text}
                      onClick={() => setOpenColor("text")}
                    />
                  </div>
                </Space>

                {openColor && (
                  <Input
                    type="color"
                    style={{ marginTop: 8, width: 60 }}
                    value={
                      selectedNode.data.style &&
                      selectedNode.data.style[openColor]
                    }
                    onChange={(e) =>
                      updateNodeData(() => ({
                        style: {
                          ...selectedNode.data.style,
                          [openColor]: e.target.value,
                        },
                      }))
                    }
                  />
                )}
              </div>
            </Space>
          </div>
        </div>
      )}

      {/* ===== CANVAS ===== */}
      <div style={{ height: "70vh", marginTop: 12 }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={handleNodeClick}
          onEdgeClick={handleEdgeClick}
          onPaneClick={() => {
            handlePaneClick();
            setSelectedEdgeId(null);
          }}
          nodesDraggable={mode === "edit" && canEdit}
          nodesConnectable={mode === "edit" && canEdit}
          fitView
        >
          <MiniMap />
          <Controls />
          <Background />
        </ReactFlow>
      </div>
    </Modal>
  );
};

export default FlowModal;
