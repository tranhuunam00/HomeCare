import { Button, Form } from "antd";
import { useState } from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PATIENT_DIAGNOSE_STATUS_NAME } from "../constant/app";

const PATIENT_DIAGNOSE_COLOR = {
  1: "blue",
  2: "gold",
  3: "orange",
  4: "green",
};

const CompletionActionsDiagnose = ({
  statusCode,
  handlePrint,
  handleRead,
  handleConfirm,
  handleCancelRead,
  handleSend,
  handleTranslate,
  isTrans = false,
}) => {
  const navigate = useNavigate();
  const [status, setStatus] = useState(1);
  useEffect(() => setStatus(statusCode), [statusCode]);
  return (
    <>
      <h2>Thao tác hoàn thành</h2>
      <Form.Item style={{ marginTop: 24 }}>
        {/* Nút Huỷ luôn có */}
        <Button
          style={{ marginLeft: 8 }}
          onClick={() => navigate("/home/patients-diagnose")}
        >
          Hủy
        </Button>

        {/* Trạng thái 1: Chỉ hiện Đọc kết quả */}
        {status === PATIENT_DIAGNOSE_STATUS_NAME.NEW && (
          <Button style={{ marginLeft: 8 }} type="primary" onClick={handleRead}>
            Đọc kết quả
          </Button>
        )}

        {/* Trạng thái 2: Chỉ hiện Đang đọc */}
        {status === PATIENT_DIAGNOSE_STATUS_NAME.IN_PROCESS && !isTrans && (
          <Button
            style={{ marginLeft: 8 }}
            type="primary"
            danger
            onClick={handleCancelRead}
          >
            Hủy Đang đọc
          </Button>
        )}

        {/* Trạng thái 2: Chỉ hiện Đang đọc */}
        {status === PATIENT_DIAGNOSE_STATUS_NAME.IN_PROCESS && !isTrans && (
          <Button style={{ marginLeft: 8 }} type="primary" onClick={handleSend}>
            Chốt kết quả
          </Button>
        )}

        {/* Trạng thái 3: Chỉ hiện Xác nhận */}
        {status === PATIENT_DIAGNOSE_STATUS_NAME.WAITING && (
          <Button
            style={{ marginLeft: 8 }}
            type="dashed"
            danger
            onClick={handleConfirm}
          >
            Xác nhận kết quả
          </Button>
        )}

        {/* Trạng thái 4: Chỉ hiện In */}
        {status === 4 && (
          <Button
            style={{
              marginLeft: 8,
              backgroundColor: PATIENT_DIAGNOSE_COLOR[4],
              color: "#fff",
              border: "none",
            }}
            onClick={handlePrint}
          >
            In kết quả
          </Button>
        )}

        {(status == PATIENT_DIAGNOSE_STATUS_NAME.IN_PROCESS ||
          status == PATIENT_DIAGNOSE_STATUS_NAME.WAITING) &&
          isTrans && (
            <Button
              style={{
                marginLeft: 8,
                backgroundColor: PATIENT_DIAGNOSE_COLOR[4],
                color: "#fff",
                border: "none",
              }}
              onClick={handleTranslate}
            >
              Bắt đầu dịch
            </Button>
          )}
      </Form.Item>
    </>
  );
};

export default CompletionActionsDiagnose;
