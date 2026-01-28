import { useCallback, useMemo, useState } from "react";
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

const FlowModal = ({ open, onClose }) => {
  const navigate = useNavigate();

  /* ================= STATE ================= */
  const [mode, setMode] = useState("edit"); // edit | run
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNodeType, setSelectedNodeType] = useState("custom");
  const [selectedNodeId, setSelectedNodeId] = useState(null);

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
    const option = NODE_OPTIONS.find((o) => o.value === selectedNodeType);
    const id = nanoid();

    setNodes((nds) => [
      ...nds,
      {
        id,
        type: selectedNodeType,
        position: {
          x: Math.random() * 100,
          y: Math.random() * 100,
        },
        data: {
          label: option?.defaultLabel || "New Node",
          action: {
            type: "navigate",
            payload: { path: "/" },
          },
        },
      },
    ]);
  };

  /* ================= ACTION RUNNER ================= */
  const runNodeAction = (node) => {
    const action = node?.data?.action;
    if (!action) return;

    switch (action.type) {
      case "navigate":
        navigate(action.payload.path);
        break;

      default:
        console.warn("Unknown action:", action);
    }
  };

  /* ================= NODE CLICK ================= */
  const handleNodeClick = (_, node) => {
    if (mode === "edit") {
      setSelectedNodeId(node.id);
      return;
    }
    runNodeAction(node);
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

  const handlePaneClick = () => {
    if (mode === "edit") {
      setSelectedNodeId(null);
    }
  };

  console.log("nodes", nodes);
  console.log("se", selectedNode);
  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width="92%"
      title="Workflow Builder"
      destroyOnClose
    >
      {/* ===== TOOLBAR ===== */}
      <Space wrap style={{ marginBottom: 12 }}>
        <Button
          type={mode === "edit" ? "primary" : "default"}
          onClick={() => setMode("edit")}
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
          disabled={mode !== "edit"}
        />

        <Button type="primary" onClick={addNode} disabled={mode !== "edit"}>
          ➕ Add Node
        </Button>

        <Button
          danger
          disabled={!selectedNodeId || mode !== "edit"}
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
      </Space>

      {/* ===== CONFIG PANEL ===== */}
      {mode === "edit" && selectedNode && (
        <div
          style={{
            position: "fixed",
            backgroundColor: "#e6effc98",
            zIndex: 10,
          }}
        >
          <Space direction="vertical" style={{ width: 360 }}>
            <h4>Node ID: {selectedNode.id}</h4>
            {/* ===== EDIT NODE LABEL ===== */}
            <div>
              <div style={{ marginBottom: 4, fontWeight: 500 }}>Node Name</div>
              <Input
                value={selectedNode.data.label}
                onChange={(e) =>
                  updateNodeData(() => ({
                    label: e.target.value,
                  }))
                }
                placeholder="Enter node name"
              />
            </div>

            {/* ===== ACTION CONFIG ===== */}
            <div>
              <div style={{ marginBottom: 4, fontWeight: 500 }}>
                Action → Navigate to
              </div>
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
                style={{ width: "100%" }}
                options={[
                  { label: "Home", value: "/" },
                  { label: "Danh sách ca", value: "/home/patients-diagnose" },
                ]}
              />
            </div>
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
          nodesDraggable={mode === "edit"}
          nodesConnectable={mode === "edit"}
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
