import { memo } from "react";
import { Handle, Position, NodeResizer } from "@xyflow/react";
import styles from "./ResizableNode.module.scss";

const ResizableNode = ({ data, selected }) => {
  return (
    <div className={`${styles.node} ${selected ? styles.selected : ""}`}>
      <NodeResizer minWidth={120} minHeight={40} className={styles.resizer} />

      <Handle
        type="target"
        position={Position.Left}
        className={styles.handle}
      />

      <div className={styles.header}>Node</div>

      <div className={styles.content}>{data.label}</div>

      <Handle
        type="source"
        position={Position.Right}
        className={styles.handle}
      />
    </div>
  );
};

export default memo(ResizableNode);
