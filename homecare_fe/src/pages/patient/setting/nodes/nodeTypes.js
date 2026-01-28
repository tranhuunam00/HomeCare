// src/components/flow/nodeTypes.js

import CustomNode from "./CustomNode";
import ResizableNode from "./ResizableNode";
import ResizableNodeSelected from "./ResizableNodeSelected";

export const nodeTypes = {
  custom: CustomNode,
  resizable: ResizableNode,
};

export const NODE_OPTIONS = [
  {
    label: "Custom Node",
    value: "custom",
    defaultLabel: "Custom Node",
  },
  {
    label: "Resizable Node",
    value: "resizable",
    defaultLabel: "Resizable Node",
  },
];
