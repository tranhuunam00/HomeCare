import { useCallback, useEffect, useMemo, useState } from "react";
import { Modal, Button, Space, Select, Divider, Input, Tabs, Grid, Tag } from "antd";
import { ReloadOutlined, CloseOutlined } from "@ant-design/icons";
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
import DradsStateDiagram from "./DradsStateDiagram";
import API_CALL from "../../../../services/axiosClient";
import TextArea from "antd/es/input/TextArea";

const { useBreakpoint } = Grid;

const DEFAULT_NODE_STYLE = {
  background: "#ffffff",
  border: "#0b6b4f",
  text: "#000000",
};

const DEFAULT_DRADS_NODES = [
  {
    id: "step-his",
    type: "custom",
    position: { x: 40, y: 40 },
    data: {
      label: "Đồng bộ từ HIS",
      style: { background: "#eff6ff", border: "#2563eb", text: "#1e3a8a" },
      action: {
        type: "notify",
        payload: {
          message: "Chỉ định chụp được đồng bộ tự động từ HIS/PACS vào danh sách hàng chờ Worklist.",
        },
      },
    },
  },
  {
    id: "step-manual",
    type: "custom",
    position: { x: 40, y: 150 },
    data: {
      label: "Nhập thủ công",
      style: { background: "#eff6ff", border: "#2563eb", text: "#1e3a8a" },
      action: { type: "navigate", payload: { mode: "preset", path: "/home/patients-diagnose/new", url: "" } },
    },
  },
  {
    id: "step-profile",
    type: "custom",
    position: { x: 280, y: 270 },
    data: {
      label: "Cập nhật thông tin, chữ ký",
      style: { background: "#fefce8", border: "#ca8a04", text: "#713f12" },
      action: { type: "navigate", payload: { mode: "preset", path: "/home/account", url: "" } },
    },
  },
  {
    id: "step-print-header",
    type: "custom",
    position: { x: 280, y: 370 },
    data: {
      label: "Cấu hình mẫu header in",
      style: { background: "#fefce8", border: "#ca8a04", text: "#713f12" },
      action: { type: "navigate", payload: { mode: "preset", path: "/home/templates-print", url: "" } },
    },
  },
  {
    id: "step-worklist",
    type: "custom",
    position: { x: 280, y: 95 },
    data: {
      label: "Danh sách worklist",
      style: { background: "#ecfdf5", border: "#0b6b4f", text: "#064e3b" },
      action: { type: "navigate", payload: { mode: "preset", path: "/home/patients-diagnose", url: "" } },
    },
  },
  {
    id: "step-claim",
    type: "custom",
    position: { x: 530, y: 95 },
    data: {
      label: "Nhận đọc ca",
      style: { background: "#fff7ed", border: "#ea580c", text: "#7c2d12" },
      action: {
        type: "notify",
        payload: {
          message: "Bác sĩ chọn ca từ Worklist và nhận đọc ca để bắt đầu chẩn đoán.",
        },
      },
    },
  },
  {
    id: "step-read",
    type: "custom",
    position: { x: 760, y: 95 },
    data: {
      label: "Đọc và Lưu Nháp",
      style: { background: "#fff7ed", border: "#ea580c", text: "#7c2d12" },
      action: {
        type: "notify",
        payload: {
          message: "Soạn thảo kết quả theo mẫu D-RADS, hệ thống tự động lưu nháp liên tục.",
        },
      },
    },
  },
  {
    id: "step-consult",
    type: "custom",
    position: { x: 760, y: 230 },
    data: {
      label: "Hội chẩn chuyên khoa",
      style: { background: "#faf5ff", border: "#9333ea", text: "#581c87" },
      action: {
        type: "notify",
        payload: {
          message: "Với ca khó, bác sĩ có thể mời bác sĩ hội chẩn (BS2) cùng xem xét trước khi kết luận.",
        },
      },
    },
  },
  {
    id: "step-approve",
    type: "custom",
    position: { x: 1000, y: 95 },
    data: {
      label: "Phê duyệt",
      style: { background: "#eef2ff", border: "#4f46e5", text: "#312e81" },
      action: {
        type: "notify",
        payload: {
          message: "Bác sĩ duyệt / Trưởng khoa rà soát nội dung và ký số phê duyệt kết quả.",
        },
      },
    },
  },
  {
    id: "step-print-send",
    type: "custom",
    position: { x: 1230, y: 40 },
    data: {
      label: "IN và gửi đến bệnh nhân",
      style: { background: "#ecfdf5", border: "#10b981", text: "#064e3b" },
      action: {
        type: "notify",
        payload: {
          message: "In phiếu kết quả chuẩn mẫu bệnh viện hoặc gửi PDF trực tiếp đến bệnh nhân.",
        },
      },
    },
  },
  {
    id: "step-sync-his",
    type: "custom",
    position: { x: 1230, y: 150 },
    data: {
      label: "Đồng bộ lại HIS",
      style: { background: "#ecfdf5", border: "#10b981", text: "#064e3b" },
      action: {
        type: "notify",
        payload: {
          message: "Kết quả và trạng thái hoàn tất được đồng bộ ngược về hệ thống HIS.",
        },
      },
    },
  },
];

const DEFAULT_DRADS_EDGES = [
  { id: "e-his-wl", source: "step-his", target: "step-worklist", animated: true },
  { id: "e-man-wl", source: "step-manual", target: "step-worklist", animated: true },
  { id: "e-wl-claim", source: "step-worklist", target: "step-claim", animated: true },
  { id: "e-prof-claim", source: "step-profile", target: "step-claim", animated: true },
  { id: "e-hdr-claim", source: "step-print-header", target: "step-claim", animated: true },
  { id: "e-claim-read", source: "step-claim", target: "step-read", animated: true },
  { id: "e-read-consult", source: "step-read", target: "step-consult", animated: true },
  { id: "e-consult-read", source: "step-consult", target: "step-read", animated: true },
  { id: "e-read-approve", source: "step-read", target: "step-approve", animated: true },
  { id: "e-app-print", source: "step-approve", target: "step-print-send", animated: true },
  { id: "e-app-his", source: "step-approve", target: "step-sync-his", animated: true },
];

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
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const canEdit = user?.id_role === USER_ROLE.ADMIN;

  /* ================= STATE ================= */
  const [mode, setMode] = useState(canEdit ? "edit" : "run"); // edit | run
  const [nodes, setNodes, onNodesChange] = useNodesState(DEFAULT_DRADS_NODES);
  const [edges, setEdges, onEdgesChange] = useEdgesState(DEFAULT_DRADS_EDGES);
  const [selectedNodeType, setSelectedNodeType] = useState("custom");
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [flowName, setFlowName] = useState("FLOW-DRADS");
  const [flowId, setFlowId] = useState(null);
  const [openColor, setOpenColor] = useState(null); // background | border | null
  const [selectedEdgeId, setSelectedEdgeId] = useState(null);
  const [explanation, setExplanation] = useState(null);

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

    const activeMode = mode || (path ? "preset" : "custom");

    if (activeMode === "preset" && path) {
      onClose?.();
      navigate(path);
      return;
    }

    if (activeMode === "custom" && url) {
      if (url.startsWith("http")) {
        window.open(url, "_blank");
      } else {
        onClose?.();
        navigate(url);
      }
      return;
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

    // Show workflow explanation for doctors
    const label = node.data?.label || "Tên bước";
    const message = node.data?.action?.payload?.message || "";
    const actionType = node.data?.action?.type;

    let desc = message;
    if (!desc) {
      if (actionType === "navigate") {
        desc = `Hành động: Chuyển hướng đến trang chức năng: ${node.data.action.payload.path || node.data.action.payload.url}`;
      } else {
        desc = "Không có mô tả bổ sung cho bước này.";
      }
    }

    setExplanation({
      title: label,
      type: "node",
      desc: desc,
      action: node.data?.action
    });
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
      return;
    }

    // Explain connection in run mode
    const sourceNode = nodes.find(n => n.id === edge.source);
    const targetNode = nodes.find(n => n.id === edge.target);

    const sourceLabel = sourceNode?.data?.label || "Bước trước";
    const targetLabel = targetNode?.data?.label || "Bước sau";

    let desc = `Đường chuyển tiếp quy trình từ bước "${sourceLabel}" sang bước "${targetLabel}".`;

    // Interactive descriptions matching standard D-RADS flow
    if (sourceLabel.includes("Đồng bộ từ HIS") && targetLabel.includes("Danh sách worklist")) {
      desc = "Dữ liệu chỉ định chụp được đồng bộ tự động từ hệ thống HIS vào danh sách hàng chờ (Worklist) của D-RADS.";
    } else if (sourceLabel.includes("Nhập thủ công") && targetLabel.includes("Danh sách worklist")) {
      desc = "Lễ tân hoặc bác sĩ tự nhập tay thông tin ca bệnh trực tiếp trên D-RADS để đưa vào danh sách chờ.";
    } else if (sourceLabel.includes("Danh sách worklist") && targetLabel.includes("Nhận đọc ca")) {
      desc = "Bác sĩ chọn ca bệnh từ danh sách chờ và thực hiện nhận đọc ca để bắt đầu chẩn đoán hình ảnh.";
    } else if (sourceLabel.includes("Nhận đọc ca") && targetLabel.includes("Đọc và Lưu Nháp")) {
      desc = "Sau khi nhận đọc ca, bác sĩ mở giao diện và tiến hành soạn thảo kết quả. Hệ thống sẽ tự động lưu nháp liên tục.";
    } else if (sourceLabel.includes("Đọc và Lưu Nháp") && targetLabel.includes("Phê duyệt")) {
      desc = "Bác sĩ hoàn thành chẩn đoán (Đọc xong), phiếu kết quả được gửi lên hàng chờ phê duyệt của Trưởng khoa.";
    } else if (sourceLabel.includes("Phê duyệt") && targetLabel.includes("IN và gửi đến bệnh nhân")) {
      desc = "Sau khi ca bệnh được phê duyệt thành công, kết quả sẽ được in ra giấy và gửi file PDF đến tài khoản của bệnh nhân.";
    } else if (sourceLabel.includes("Phê duyệt") && targetLabel.includes("Đồng bộ lại HIS")) {
      desc = "Kết quả chẩn đoán và hình ảnh sau khi duyệt sẽ được đồng bộ ngược lại hệ thống HIS để kết thúc ca khám.";
    } else if (sourceLabel.includes("Cập nhật thông tin, chữ ký") && targetLabel.includes("Nhận đọc ca")) {
      desc = "Bác sĩ cần cấu hình đầy đủ thông tin cá nhân và chữ ký số trước khi thực hiện nhận đọc ca để đảm bảo tính pháp lý trên phiếu kết quả.";
    } else if (sourceLabel.includes("Cấu hình mẫu header in") && targetLabel.includes("Nhận đọc ca")) {
      desc = "Thiết lập mẫu phôi in ấn (Header/Footer phòng khám) sẽ được áp dụng trực tiếp khi in kết quả chẩn đoán của ca bệnh.";
    } else if (sourceLabel.includes("Danh sách báo cáo") && targetLabel.includes("Tổng số ca đọc trong tháng")) {
      desc = "Luồng dữ liệu tổng hợp hiệu suất: báo cáo tổng số lượng ca đã thực hiện chẩn đoán trong tháng.";
    } else if (sourceLabel.includes("Danh sách báo cáo") && targetLabel.includes("Biểu đồ")) {
      desc = "Vẽ biểu đồ thống kê trực quan lượng ca chẩn đoán theo thời gian hoặc theo loại dịch vụ.";
    }

    setExplanation({
      title: `${sourceLabel} ➜ ${targetLabel}`,
      type: "edge",
      desc: desc,
      sourceLabel,
      targetLabel
    });
  };

  /* ================= LOAD FLOW ================= */
  useEffect(() => {
    if (!open) return;
    if (!canEdit) {
      setMode("run");
    }

    const fetchFlow = async () => {
      try {
        const res = await API_CALL.get(`/flows/byName/${flowName}`, {
          silent: true,
        });
        const flow = res.data?.data;
        if (flow && Array.isArray(flow.nodes) && flow.nodes.length > 0) {
          setFlowId(flow.id);
          setFlowName(flow.name || "FLOW-DRADS");
          setNodes(flow.nodes);
          setEdges(flow.edges || []);
        } else {
          setFlowId(flow?.id || null);
          setNodes(DEFAULT_DRADS_NODES);
          setEdges(DEFAULT_DRADS_EDGES);
        }
      } catch {
        setNodes(DEFAULT_DRADS_NODES);
        setEdges(DEFAULT_DRADS_EDGES);
      }
    };

    fetchFlow();
  }, [open, canEdit]);

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width="92%"
      title="QUY TRÌNH D-RADS"
      destroyOnClose
      className="flow-modal-custom"
    >
      <Tabs
        defaultActiveKey="1"
        items={[
          {
            key: "1",
            label: "Thiết lập Quy trình",
            children: (
              <>
                {/* ===== TOOLBAR ===== */}
                <Space wrap size="small" style={{ marginBottom: 10, width: "100%" }}>
                  {canEdit && (
                    <Button
                      size="small"
                      type={mode === "edit" ? "primary" : "default"}
                      onClick={() => setMode("edit")}
                    >
                      Chỉnh sửa
                    </Button>
                  )}
                  <Button
                    size="small"
                    type={mode === "run" ? "primary" : "default"}
                    onClick={() => setMode("run")}
                  >
                    Xem &amp; Chạy
                  </Button>

                  {mode === "run" && (
                    <Tag color="green" style={{ margin: 0 }}>
                      Bấm vào từng bước hoặc đường nối để xem hướng dẫn &amp; mở nhanh
                    </Tag>
                  )}

                  {canEdit && mode === "edit" && (
                    <>
                      <Divider type="vertical" />

                      <Select
                        size="small"
                        style={{ width: isMobile ? 140 : 170 }}
                        value={selectedNodeType}
                        onChange={setSelectedNodeType}
                        options={NODE_OPTIONS}
                      />

                      <Button size="small" type="primary" onClick={addNode}>
                        + Node
                      </Button>

                      <Button
                        size="small"
                        danger
                        disabled={!selectedNodeId}
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
                        Xóa Node
                      </Button>

                      <Button
                        size="small"
                        danger
                        disabled={!selectedEdgeId}
                        onClick={() => {
                          setEdges((eds) => eds.filter((e) => e.id !== selectedEdgeId));
                          setSelectedEdgeId(null);
                        }}
                      >
                        Xóa Edge
                      </Button>

                      <Button
                        size="small"
                        icon={<ReloadOutlined />}
                        onClick={() => {
                          setNodes(DEFAULT_DRADS_NODES);
                          setEdges(DEFAULT_DRADS_EDGES);
                          setSelectedNodeId(null);
                          setSelectedEdgeId(null);
                          toast.info("Đã nạp lại mẫu quy trình chuẩn D-RADS");
                        }}
                      >
                        Mẫu chuẩn
                      </Button>

                      <Input
                        size="small"
                        style={{ width: isMobile ? 130 : 170 }}
                        value={flowName}
                        onChange={(e) => setFlowName(e.target.value)}
                      />

                      <Button
                        size="small"
                        type="primary"
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
                        {flowId ? "Cập nhật" : "Lưu"}
                      </Button>
                    </>
                  )}
                </Space>

                {/* ===== CONFIG PANEL ===== */}
                {mode === "edit" && canEdit && selectedNode && (
                  <div
                    style={{
                      position: "fixed",
                      right: isMobile ? 12 : 24,
                      top: isMobile ? "auto" : 110,
                      bottom: isMobile ? 12 : "auto",
                      zIndex: 20,
                      width: isMobile ? "calc(100vw - 24px)" : 340,
                      maxHeight: isMobile ? "52vh" : "75vh",
                      overflowY: "auto",
                      background: "#fff",
                      borderRadius: 12,
                      boxShadow: "0 8px 24px rgba(0,0,0,0.16)",
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <div
                      style={{
                        padding: "10px 14px",
                        borderBottom: "1px solid #f0f0f0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <b>Cấu hình bước</b>
                      <Button
                        size="small"
                        type="text"
                        icon={<CloseOutlined />}
                        onClick={() => setSelectedNodeId(null)}
                      />
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
                                  payload: { mode, path: "", url: "" },
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
                <div style={{ height: isMobile ? "58vh" : "66vh" }}>
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
                    fitViewOptions={{ padding: 0.2 }}
                  >
                    {!isMobile && <MiniMap />}
                    <Controls />
                    <Background />
                  </ReactFlow>
                </div>
              </>
            ),
          },
          {
            key: "2",
            label: "Sơ đồ Trạng thái",
            children: <DradsStateDiagram />,
          },
        ]}
      />

      {/* ===== EXPLANATION MODAL FOR RUN MODE ===== */}
      <Modal
        title={
          <span style={{ fontSize: 16, fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
            {explanation?.type === "node" ? "Chi tiết bước quy trình" : "Chi tiết kết nối chuyển tiếp"}
          </span>
        }
        open={!!explanation}
        onCancel={() => setExplanation(null)}
        footer={[
          explanation?.type === "node" && explanation?.action?.type === "navigate" && (
            <Button
              key="execute"
              type="primary"
              onClick={() => {
                const action = explanation.action;
                setExplanation(null);
                runNodeAction({ data: { action } });
              }}
            >
              Mở chức năng
            </Button>
          ),
          <Button key="close" onClick={() => setExplanation(null)}>
            Đóng
          </Button>
        ]}
        width={480}
        centered
      >
        <div style={{ padding: "10px 0" }}>
          <h3 style={{ fontSize: 18, marginBottom: 12, color: "#1677ff" }}>
            {explanation?.title}
          </h3>
          <p style={{ fontSize: 14, lineHeight: 1.6, color: "#333", whiteSpace: "pre-line" }}>
            {explanation?.desc}
          </p>
        </div>
      </Modal>
    </Modal>
  );
};

export default FlowModal;
