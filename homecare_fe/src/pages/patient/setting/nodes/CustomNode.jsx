import { memo, useState } from "react";
import { Handle, Position } from "@xyflow/react";
import styles from "./FlowModal.module.scss";

const CustomNode = ({ data, selected }) => {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(data.label);

  return (
    <div
      className={`${styles.customNode} ${selected ? styles.selected : ""}`}
      onDoubleClick={() => setEditing(true)}
    >
      <Handle type="target" position={Position.Left} />

      {editing ? (
        <input
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={() => {
            data.label = value;
            setEditing(false);
          }}
          className={styles.nodeInput}
        />
      ) : (
        <div>{data.label}</div>
      )}

      <Handle type="source" position={Position.Right} />
    </div>
  );
};

export default memo(CustomNode);
