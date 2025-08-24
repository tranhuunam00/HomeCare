// FormActionBar.jsx
import React from "react";
import { Button } from "antd";
import {
  ReloadOutlined,
  SaveOutlined,
  EditOutlined,
  CheckCircleOutlined,
  EyeOutlined,
  ExportOutlined,
  PrinterOutlined,
  LogoutOutlined,
  GatewayOutlined,
} from "@ant-design/icons";
import styles from "./FormActionBar.module.scss";
import { useNavigate } from "react-router-dom";

export default function FormActionBar({
  onAction,
  onPrint,
  onReset,
  onPreview,
  onGenAi,
  keys,
}) {
  console.log("keys", keys);
  const navigate = useNavigate();
  const emptyF = () => {};
  const items = [
    {
      key: "reset",
      label: "RESET",
      icon: <ReloadOutlined />,
      onClick: onReset ?? emptyF,
    },
    { key: "save", label: "SAVE", icon: <SaveOutlined /> },
    { key: "edit", label: "EDIT", icon: <EditOutlined /> },
    { key: "approve", label: "APPROVE", icon: <CheckCircleOutlined /> },
    {
      key: "preview",
      label: "PREVIEW",
      icon: <EyeOutlined />,
      onClick: onPreview ?? emptyF,
    },
    {
      key: "export",
      label: "EXPORT",
      icon: <ExportOutlined />,
      onClick: onPrint ?? emptyF,
    },
    {
      key: "AI",
      label: "AI GEN",
      icon: <GatewayOutlined />,
      onClick: onGenAi || emptyF,
    },

    {
      key: "print",
      label: "IN",
      icon: <PrinterOutlined />,
      onClick: onPrint || emptyF,
    },

    {
      key: "exit",
      label: "EXIT",
      icon: <LogoutOutlined />,
      onClick: () => {
        navigate(-1);
      },
    },
  ];

  const genButtonC = (it) => (
    <Button
      key={it.key}
      className={`${styles.btn} ${styles[it.key]}`}
      icon={it.icon}
      block
      onClick={() => (it.onClick ? it.onClick() : onAction?.(it.key))}
    >
      {it.label}
    </Button>
  );
  return (
    <div className={styles.actionBar}>
      <div className={styles.actionGrid}>
        {!keys?.length
          ? items.map((it) => genButtonC(it))
          : items
              .filter((i) => keys.includes(i.key))
              .map((it) => genButtonC(it))}
      </div>
    </div>
  );
}
