import React from "react";
import { Tooltip } from "antd";
import "./CustomSteps.scss";
import { CloseOutlined } from "@ant-design/icons";
import { PATIENT_DIAGNOSE_STATUS_CODE } from "../../constant/app";

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

        const backgroundColor =
          isNotConsultation &&
          step.key === PATIENT_DIAGNOSE_STATUS_CODE.CONSULTATION
            ? "#1a1818"
            : isActive
              ? step.color
              : isCompleted
                ? `${step.color}22`
                : "#e5e7eb";

        const borderColor = step.color;

        const textColor = isActive
          ? "#fff"
          : isCompleted
            ? step.color
            : "#6b7280";

        const stepContent = (
          <div
            className="step-item"
            onClick={() => (isActive ? step.onStepClick?.() : null)}
            style={{
              background: backgroundColor,
              border: `1px solid ${borderColor}`,
              color: textColor,
              cursor: isActive ? "pointer" : "default",
            }}
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

            {index < steps.length - 1 && <div className="arrow" />}
          </div>
        );
      })}
    </div>
  );
};

export default CustomSteps;
