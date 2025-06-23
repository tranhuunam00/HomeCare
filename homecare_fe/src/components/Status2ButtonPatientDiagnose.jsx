import { useMemo } from "react";
import { Button, Row, Col } from "antd";
import { useNavigate } from "react-router-dom";
import { PATIENT_DIAGNOSE_COLOR } from "../constant/app";

const StatusButtonPatientDiagnose = ({ id, status }) => {
  const navigate = useNavigate();

  const buttonStatus = useMemo(() => {
    return {
      canRead: status === 1 || status === 2,
      isReading: status === 2,
      canConfirm: status === 3,
      canPrint: status === 4,
    };
  }, [status]);

  const getStyle = (enabled, color) => ({
    backgroundColor: enabled ? color : "#d9d9d9",
    borderColor: enabled ? color : "#aaa",
    color: enabled ? "#fff" : "#888",
    opacity: enabled ? 1 : 0.8,
  });

  return (
    <Row gutter={24} style={{ marginTop: 16 }}>
      <Col span={4}>
        <Button
          type="primary"
          disabled={!buttonStatus.canRead}
          onClick={() => navigate("/home/patients-diagnose/use/" + id)}
          style={getStyle(buttonStatus.canRead, PATIENT_DIAGNOSE_COLOR[1])}
        >
          Đọc kết quả
        </Button>
      </Col>
      <Col span={4}>
        <Button
          type="primary"
          disabled={!buttonStatus.isReading}
          onClick={() => navigate("/home/patients-diagnose/use/" + id)}
          style={getStyle(buttonStatus.isReading, PATIENT_DIAGNOSE_COLOR[2])}
        >
          Đang đọc
        </Button>
      </Col>
      <Col span={5}>
        <Button
          type="dashed"
          danger
          onClick={() => navigate("/home/patients-diagnose/use/" + id)}
          disabled={!buttonStatus.canConfirm}
          style={getStyle(buttonStatus.canConfirm, PATIENT_DIAGNOSE_COLOR[3])}
        >
          Xác nhận kết quả
        </Button>
      </Col>
      <Col span={3}>
        <Button
          type="default"
          disabled={!buttonStatus.canPrint}
          style={getStyle(buttonStatus.canPrint, PATIENT_DIAGNOSE_COLOR[4])}
          onClick={() => navigate("/home/patients-diagnose/use/" + id)}
        >
          In kết quả
        </Button>
      </Col>
    </Row>
  );
};

export default StatusButtonPatientDiagnose;
