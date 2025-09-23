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

export const KEY_ACTION_BUTTON = {
  reset: "reset",
  save: "save",
  edit: "edit",
  approve: "approve",
  preview: "preview",
  export: "export",
  AI: "AI",
  print: "print",
  exit: "exit",
};

export default function FormActionBar({
  onAction,
  onPrint,
  onReset,
  onPreview,
  onGenAi,
  keys,
  onEdit,
  isEdit = false,
  editId,
  onExit = undefined,
}) {
  const navigate = useNavigate();
  const emptyF = () => {};
  const items = [
    {
      key: "reset",
      label: "RESET",
      icon: <ReloadOutlined />,
      onClick: onReset ?? emptyF,
    },
    {
      key: "save",
      label: "SAVE",
      icon: <SaveOutlined />,
      disabled: editId && !isEdit,
    },
    {
      key: "edit",
      label: "EDIT",
      icon: <EditOutlined />,
      onClick: onEdit,
      disabled: !editId,
    },
    {
      key: "approve",
      label: "APPROVE",
      icon: <CheckCircleOutlined />,
      disabled: !isEdit || !editId,
    },
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
      disabled: !editId,
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
        if (onExit) {
          onExit();
        } else {
          navigate(-1);
        }
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
      disabled={it.disabled}
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
