import React from "react";
import { Tooltip, Popover } from "antd";
import { FileTextOutlined, PictureOutlined } from "@ant-design/icons";
import styles from "./LabelWithHint.module.scss";

const LabelWithHint = ({ text, note, image }) => {
  return (
    <div className={styles.wrapper}>
      <span>{text}</span>

      {/* TEXT NOTE */}
      {note && (
        <Tooltip title={note}>
          <FileTextOutlined className={styles.icon} />
        </Tooltip>
      )}

      {/* IMAGE */}
      {image && (
        <Popover
          content={
            <img
              src={image}
              alt="hint"
              style={{ width: 350, borderRadius: 6 }}
            />
          }
          trigger="click"
        >
          <PictureOutlined className={styles.iconImage} />
        </Popover>
      )}
    </div>
  );
};

export default LabelWithHint;
