import { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import styles from "./FlowModal.module.scss";

const CustomNode = ({ data, selected }) => {
  return (
    <div className={`${styles.customNode} ${selected ? styles.selected : ""}`}>
      <Handle type="target" position={Position.Left} />

      <div className={styles.label}>{data.label}</div>

      <Handle type="source" position={Position.Right} />
    </div>
  );
};

export default memo(CustomNode);
