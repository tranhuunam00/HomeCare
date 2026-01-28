import { useCallback, useEffect, useMemo, useState } from "react";
import { Modal, Button, Space, Select, Divider, Input } from "antd";
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

import { nodeTypes, NODE_OPTIONS } from "./nodeTypes";
import { useGlobalAuth } from "../../../../contexts/AuthContext";
import { USER_ROLE } from "../../../../constant/app";
import { toast } from "react-toastify";
import API_CALL from "../../../../services/axiosClient";

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

  const canEdit = user?.id_role === USER_ROLE.ADMIN;

  const selectedNode = useMemo(
    () => nodes.find((n) => n.id === selectedNodeId),
    [nodes, selectedNodeId],
  );

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
        position: {
          x: Math.random() * 300,
          y: Math.random() * 200,
        },
        data: {
          label: option?.defaultLabel || "New Node",
          style: {
            background: "#ffffff",
            border: "#1677ff",
            text: "#000000",
          },
          action: {
            type: "none", // none | navigate | notify
            payload: {},
          },
        },
      },
    ]);
  };

  /* ================= ACTION RUNNER ================= */
  const runNodeAction = (node) => {
    const action = node?.data?.action;
    if (!action || action.type === "none") return;

    switch (action.type) {
      case "navigate":
        navigate(action.payload.path);
        break;

      case "notify":
        toast.info(action.payload.message || "Thông báo");
        break;

      default:
        console.warn("Unknown action:", action);
    }
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
        <div style={{ position: "fixed", zIndex: 10, background: "#eef3ff" }}>
          <Space direction="vertical" style={{ width: 360, padding: 12 }}>
            <b>Node ID: {selectedNode.id}</b>

            <Input
              value={selectedNode.data.label}
              onChange={(e) =>
                updateNodeData(() => ({ label: e.target.value }))
              }
              placeholder="Node name"
            />

            {/* Action */}
            <Select
              value={selectedNode.data.action.type}
              onChange={(type) =>
                updateNodeData(() => ({
                  action:
                    type === "none"
                      ? { type: "none", payload: {} }
                      : type === "navigate"
                        ? { type: "navigate", payload: { path: "/" } }
                        : { type: "notify", payload: { message: "" } },
                }))
              }
              options={[
                { label: "Không làm gì", value: "none" },
                { label: "Navigate", value: "navigate" },
                { label: "Notify", value: "notify" },
              ]}
            />

            {selectedNode.data.action.type === "navigate" && (
              <Select
                value={selectedNode.data.action.payload.path}
                onChange={(path) =>
                  updateNodeData(() => ({
                    action: {
                      type: "navigate",
                      payload: { path },
                    },
                  }))
                }
                options={[
                  { label: "Home", value: "/" },
                  {
                    label: "Danh sách ca",
                    value: "/home/patients-diagnose",
                  },
                ]}
              />
            )}

            {selectedNode.data.action.type === "notify" && (
              <Input
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
              />
            )}

            {/* Color */}
            <Space>
              <Input
                type="color"
                value={selectedNode.data.style?.background}
                onChange={(e) =>
                  updateNodeData(() => ({
                    style: {
                      ...selectedNode.data.style,
                      background: e.target.value,
                    },
                  }))
                }
              />
              <Input
                type="color"
                value={selectedNode.data.style?.border}
                onChange={(e) =>
                  updateNodeData(() => ({
                    style: {
                      ...selectedNode.data?.style,
                      border: e.target.value,
                    },
                  }))
                }
              />
            </Space>
          </Space>
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
          onPaneClick={handlePaneClick}
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
