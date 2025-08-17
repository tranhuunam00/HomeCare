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

const items = [
  { key: "reset", label: "RESET", icon: <ReloadOutlined /> },
  { key: "save", label: "SAVE", icon: <SaveOutlined /> },
  { key: "edit", label: "EDIT", icon: <EditOutlined /> },
  { key: "approve", label: "APPROVE", icon: <CheckCircleOutlined /> },
  { key: "preview", label: "PREVIEW", icon: <EyeOutlined /> },
  { key: "export", label: "EXPORT", icon: <ExportOutlined /> },
  { key: "print", label: "PRINT", icon: <PrinterOutlined /> },
  { key: "exit", label: "EXIT", icon: <LogoutOutlined /> },
];

export default function FormActionBar({ onAction }) {
  return (
    <div className={styles.actionBar}>
      <div className={styles.actionGrid}>
        {items.map((it) => (
          <Button
            key={it.key}
            className={`${styles.btn} ${styles[it.key]}`}
            icon={it.icon}
            block
            onClick={() => onAction?.(it.key)}
          >
            {it.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
