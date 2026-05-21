import React from "react";
import { Resizable } from "react-resizable";
import "react-resizable/css/styles.css";

import "./ResizableTitle.scss";

const ResizableTitle = (props) => {
  const { onResize, width, ...restProps } = props;

  if (!width) {
    return <th {...restProps} />;
  }

  return (
    <Resizable
      width={width}
      height={0}
      handle={
        <span
          className="react-resizable-handle"
          onClick={(e) => {
            e.stopPropagation();
          }}
        />
      }
      onResize={onResize}
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
