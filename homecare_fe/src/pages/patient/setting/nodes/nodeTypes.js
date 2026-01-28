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

export const ACTION_FACTORY = {
  none: {
    label: "Không làm gì",
    create: () => ({
      type: "none",
      payload: {},
    }),
  },

  navigate: {
    label: "Chuyển màn",
    create: () => ({
      type: "navigate",
      payload: { path: "/" },
    }),
  },

  notify: {
    label: "Thông báo",
    create: () => ({
      type: "notify",
      payload: { message: "" },
    }),
  },
};

export const ACTION_OPTIONS = Object.entries(ACTION_FACTORY).map(
  ([value, cfg]) => ({
    value,
    label: cfg.label,
  }),
);

export const NAVIGATE_OPTIONS = [
  {
    label: "Home",
    value: "/",
  },
  {
    label: "Danh sách ca",
    value: "/home/patients-diagnose",
  },

  {
    label: "Tạo mới ca",
    value: "/home/patients-diagnose/create",
  },
];
