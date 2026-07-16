import React from "react";
import { Tooltip } from "antd";
import "./CustomSteps.scss";
import { CloseOutlined } from "@ant-design/icons";
import { PATIENT_DIAGNOSE_STATUS_CODE, getPatientDiagnoseIcon } from "../../constant/app";

const CustomSteps = ({
  steps = [],
  current = 0,
  onClose,
  is_consultation_doctor,
}) => {
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
        const isActive = index == current;
        const isCompleted = index < current;

        const isNotConsultation =
          !is_consultation_doctor &&
          current + 1 > PATIENT_DIAGNOSE_STATUS_CODE.CONSULTATION;

        const isConsultationStep = step.key === PATIENT_DIAGNOSE_STATUS_CODE.CONSULTATION;
        const isSkipped = isNotConsultation && isConsultationStep;
        const isUpcoming = index > current;

        const backgroundColor = isSkipped
          ? "#f3f4f6"
          : isActive
            ? step.color
            : isCompleted
              ? `${step.color}15`
              : "#f9fafb";

        const borderColor = isSkipped
          ? "#cbd5e1"
          : isUpcoming
            ? "#d1d5db"
            : step.color;

        const borderStyle = isUpcoming ? "dashed" : "solid";

        const iconColor = isSkipped
          ? "#94a3b8"
          : isActive
            ? "#fff"
            : isCompleted
              ? step.color
              : "#9ca3af";

        const stepContent = (
          <div
            className={`step-item ${isActive ? "active" : ""} ${isCompleted ? "completed" : ""}`}
            onClick={() => (isActive ? step.onStepClick?.() : null)}
            style={{
              "--step-color": step.color,
              background: backgroundColor,
              border: `1px ${borderStyle} ${borderColor}`,
              cursor: isActive ? "pointer" : "default",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: isActive ? 26 : 22,
              height: isActive ? 26 : 22,
              borderRadius: isActive ? "50%" : "4px",
              boxShadow: isActive ? `0 2px 6px ${step.color}44` : "none",
              zIndex: isActive ? 3 : 1,
            }}
          >
            {getPatientDiagnoseIcon(step.key, { style: { color: iconColor, fontSize: isActive ? 14 : 12 }, spin: isActive })}
          </div>
        );

        return (
          <div key={index} className="step-wrapper" style={{ display: "inline-flex", alignItems: "center" }}>
            <Tooltip
              title={isActive ? "Ấn để thao tác chi tiết" : step.title}
              placement="top"
            >
              {stepContent}
            </Tooltip>

            {index < steps.length - 1 && (
              <div 
                className={`arrow ${isCompleted ? "completed" : "disabled"}`} 
                style={{ 
                  color: isCompleted ? step.color : "#d1d5db",
                  fontWeight: isCompleted ? "bold" : "normal",
                  marginLeft: 4,
                  marginRight: 4,
                }} 
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default CustomSteps;
