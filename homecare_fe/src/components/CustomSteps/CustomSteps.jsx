import React from "react";
import { Tooltip } from "antd";
import "./CustomSteps.scss";
import { CloseOutlined } from "@ant-design/icons";

const CustomSteps = ({ steps = [], current = 0, onClose }) => {
  return (
    <div className="custom-steps">
      {onClose && (
        <Tooltip title="Đóng">
          <div
            style={{
              cursor: "pointer",
              marginRight: 20,
              color: "red",
            }}
            className="close-icon"
            onClick={onClose}
          >
            <CloseOutlined />
          </div>
        </Tooltip>
      )}
      {steps.map((step, index) => {
        const isActive = index === current;
        const isCompleted = index < current;

        const stepContent = (
          <div
            className={`step-item 
              ${isActive ? "active" : ""} 
              ${isCompleted ? "completed" : ""}`}
            onClick={() => (isActive ? step.onStepClick?.() : null)}
          >
            <span className="step-title">{step.title}</span>
          </div>
        );

        return (
          <div key={index} className="step-wrapper">
            {isActive ? (
              <Tooltip title="Ấn để thao tác chi tiết" placement="top">
                {stepContent}
              </Tooltip>
            ) : (
              stepContent
            )}

            {index < steps.length - 1 && (
              <div
                className={`arrow ${
                  isCompleted ? "completed" : isActive ? "active" : "disabled"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default CustomSteps;
