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
} from "@ant-design/icons";
import styles from "./FormActionBar.module.scss";
import { useNavigate } from "react-router-dom";

export default function FormActionBar({ onAction, onPrint, onReset }) {
  const navigate = useNavigate();

  const items = [
    {
      key: "reset",
      label: "RESET",
      icon: <ReloadOutlined />,
      onClick: onReset,
    },
    { key: "save", label: "SAVE", icon: <SaveOutlined /> },
    { key: "edit", label: "EDIT", icon: <EditOutlined /> },
    { key: "approve", label: "APPROVE", icon: <CheckCircleOutlined /> },
    { key: "preview", label: "PREVIEW", icon: <EyeOutlined /> },
    {
      key: "export",
      label: "EXPORT",
      icon: <ExportOutlined />,
      onClick: onPrint,
    },
    { key: "print", label: "PRINT", icon: <PrinterOutlined /> },
    {
      key: "exit",
      label: "EXIT",
      icon: <LogoutOutlined />,
      onClick: () => {
        navigate(-1);
      },
    },
  ];
  return (
    <div className={styles.actionBar}>
      <div className={styles.actionGrid}>
        {items.map((it) => (
          <Button
            key={it.key}
            className={`${styles.btn} ${styles[it.key]}`}
            icon={it.icon}
            block
            onClick={() => (it.onClick ? it.onClick() : onAction?.(it.key))}
          >
            {it.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
