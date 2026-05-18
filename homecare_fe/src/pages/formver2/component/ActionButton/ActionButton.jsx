import React from "react";
import { Button, Tooltip } from "antd";
import clsx from "clsx";
import styles from "./ActionButton.module.scss";

export default function ActionButton({
  icon,
  children,
  onClick,
  disabled,
  tooltip,
  color = "blue",
  block = true,
  className,
}) {
  const btn = (
    <Button
      icon={icon}
      block={block}
      disabled={disabled}
      onClick={onClick}
      className={clsx(styles.btn, styles[color], className)}
    >
      {children}
    </Button>
  );

  if (tooltip) {
    return (
      <Tooltip title={tooltip}>
        <span style={{ display: "block" }}>{btn}</span>
      </Tooltip>
    );
  }

  return btn;
}
