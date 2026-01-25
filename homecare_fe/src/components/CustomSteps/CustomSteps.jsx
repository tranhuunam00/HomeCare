import React from "react";
import { Tooltip } from "antd";
import "./CustomSteps.scss";

const CustomSteps = ({ steps = [], current = 0 }) => {
  return (
    <div className="custom-steps">
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
              <Tooltip title="Ấn vào để thao tác" placement="top">
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
