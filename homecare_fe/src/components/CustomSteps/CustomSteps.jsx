import React from "react";
import "./CustomSteps.scss";

const CustomSteps = ({ steps = [], current = 0 }) => {
  return (
    <div className="custom-steps">
      {steps.map((step, index) => {
        const isActive = index === current;
        const isCompleted = index < current;

        return (
          <div key={index} className="step-wrapper">
            <div
              className={`step-item 
                ${isActive ? "active" : ""} 
                ${isCompleted ? "completed" : ""}`}
              onClick={() => (current == index ? step.onStepClick() : null)}
            >
              <div className="step-icon">{step.icon}</div>
              <div className="step-title">{step.title}</div>
            </div>

            {/* Arrow except last step */}
            {index < steps.length - 1 && (
              <div
                className={
                  "arrow " +
                  (isCompleted ? "completed" : isActive ? "active" : "disabled")
                }
              >
                →
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default CustomSteps;
