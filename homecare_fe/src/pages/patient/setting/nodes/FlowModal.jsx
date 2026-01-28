import { useCallback } from "react";
import { Modal, Button, Space } from "antd";
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

import "@xyflow/react/dist/style.css";
import { nodeTypes } from "./nodeTypes";

const FlowModal = ({ open, onClose }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const onConnect = useCallback((params) => {
    setEdges((eds) => addEdge({ ...params, animated: true }, eds));
  }, []);

  const addNode = () => {
    setNodes((nds) => [
      ...nds,
      {
        id: nanoid(),
        type: "custom",
        data: { label: "New Node" },
        position: {
          x: Math.random() * 500,
          y: Math.random() * 300,
        },
      },
    ]);
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width="90%"
      title="Flow Editor"
      destroyOnClose
    >
      <Space style={{ marginBottom: 12 }}>
        <Button type="primary" onClick={addNode}>
          ➕ Add Node
        </Button>
      </Space>

      <div style={{ height: "70vh" }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
          nodesConnectable
          nodesDraggable
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
