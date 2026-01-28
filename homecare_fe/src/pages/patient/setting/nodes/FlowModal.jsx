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

  const selectedNode = useMemo(
    () => nodes.find((n) => n.id === selectedNodeId),
    [nodes, selectedNodeId],
  );

  /* ================= CONNECTION ================= */
  const onConnect = useCallback((params) => {
    setEdges((eds) => addEdge({ ...params, animated: true }, eds));
  }, []);

  const canEdit = user?.id_role == USER_ROLE.ADMIN;
  /* ================= ADD NODE ================= */
  const addNode = () => {
    if (!canEdit || mode !== "edit") return;

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
    if (mode === "edit" && canEdit) {
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
    if (mode === "edit" && canEdit) {
      setSelectedNodeId(null);
    }
  };

  useEffect(() => {
    if (!open) return; // chỉ load khi modal mở

    const fetchFlowByName = async () => {
      try {
        const res = await API_CALL.get(
          `/flows/byName/${flowName || "FLOW-DRADS"}`,
        );

        const flow = res.data.data;
        console.log("flow", flow);
        if (!flow) return;
        setFlowId(flow.id);

        setFlowName(flow.name || "FLOW-DRADS");
        setNodes(flow.nodes || []);
        setEdges(flow.edges || []);
      } catch (error) {
        console.warn("Flow not found, start with empty flow");
        setNodes([]);
        setEdges([]);
      }
    };

    fetchFlowByName();
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
          disabled={mode !== "edit" || !canEdit}
        />

        <Button
          type="primary"
          onClick={addNode}
          disabled={mode !== "edit" || !canEdit}
        >
          ➕ Add Node
        </Button>

        <Button
          danger
          disabled={!selectedNodeId || mode !== "edit" || !canEdit}
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
          placeholder="Flow name"
        />

        <Button
          type="primary"
          disabled={!canEdit}
          onClick={async () => {
            if (!canEdit) return;

            const payload = {
              name: flowName || "FLOW-DRADS",
              description: "Quy trình điều hướng D-RADS",
              nodes,
              edges,
              status: "draft",
            };

            try {
              let res;

              if (flowId) {
                // 🔁 UPDATE
                res = await API_CALL.put(`/flows/${flowId}`, payload);
                toast.success("Cập nhật workflow thành công");
              } else {
                // 🆕 CREATE
                res = await API_CALL.post("/flows", payload);
                setFlowId(res.data.data?.id); // ✅ lưu lại id sau khi tạo
                toast.success("Tạo workflow thành công");
              }

              onClose?.();
            } catch (error) {
              console.error("SAVE FLOW ERROR:", error);
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
