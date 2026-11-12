import React, { useState } from "react";
import { Resizable } from "react-resizable";
import "react-resizable/css/styles.css";

import "./ResizableTitle.scss";

const ResizableTitle = (props) => {
  const { onResize, onResizeStop, width, ...restProps } = props;
  const [isResizing, setIsResizing] = useState(false);

  if (!width) {
    return <th {...restProps} />;
  }

  return (
    <Resizable
      width={width}
      height={0}
      handle={
        <span
          className={`react-resizable-handle ${isResizing ? "is-resizing" : ""}`}
          title="Kéo để chỉnh độ rộng cột"
          onClick={(e) => {
            e.stopPropagation();
          }}
          onMouseDown={(e) => {
            e.stopPropagation();
          }}
        />
      }
      onResizeStart={() => setIsResizing(true)}
      onResize={onResize}
      onResizeStop={(e, data) => {
        setIsResizing(false);
        onResizeStop?.(e, data);
      }}
      draggableOpts={{
        enableUserSelectHack: false,
      }}
    >
      <th
        {...restProps}
        style={{
          ...restProps.style,
          width,
          minWidth: width,
          maxWidth: width,
        }}
      />
    </Resizable>
  );
};

export default React.memo(ResizableTitle);
