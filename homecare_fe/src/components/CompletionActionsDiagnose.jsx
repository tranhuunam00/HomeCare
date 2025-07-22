import { Button, Form, Space, Tooltip } from "antd";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PATIENT_DIAGNOSE_STATUS_NAME } from "../constant/app";
import {
  EyeOutlined,
  StopOutlined,
  CheckOutlined,
  PrinterOutlined,
  CloseCircleOutlined,
  TranslationOutlined,
  RollbackOutlined,
  UpOutlined,
  DownOutlined,
} from "@ant-design/icons";

// Màu chuẩn theo status
const PATIENT_DIAGNOSE_COLOR = {
  1: "#1890ff", // blue
  2: "#faad14", // gold
  3: "#fa8c16", // orange
  4: "#52c41a", // green
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
  handleCancelResult,
  handleCancelVerify,
  handleReset,
}) => {
  const navigate = useNavigate();
  const [status, setStatus] = useState(1);

  useEffect(() => setStatus(statusCode), [statusCode]);

  return (
    <>
      <Form.Item>
        <Space wrap>
          {/* ⬅️ Quay lại */}
          <Button
            icon={<RollbackOutlined />}
            style={{
              backgroundColor: "#8c8c8c",
              color: "#fff",
              border: "none",
            }}
            onClick={() => navigate("/home/patients-diagnose")}
          >
            Hủy
          </Button>

          {/* 🧾 Đọc kết quả (status = 1) */}
          {status === PATIENT_DIAGNOSE_STATUS_NAME.NEW && (
            <Button
              icon={<EyeOutlined />}
              style={{
                backgroundColor: PATIENT_DIAGNOSE_COLOR[1],
                color: "#fff",
                border: "none",
              }}
              onClick={handleRead}
            >
              Đọc kết quả
            </Button>
          )}

          {/* 🔄 Đang đọc (status = 2) */}
          {status === PATIENT_DIAGNOSE_STATUS_NAME.IN_PROCESS && !isTrans && (
            <>
              <Button
                icon={<StopOutlined />}
                style={{
                  backgroundColor: "#f5222d",
                  color: "#fff",
                  border: "none",
                }}
                onClick={handleCancelRead}
              >
                Hủy đang đọc
              </Button>
              <Button
                icon={<CheckOutlined />}
                style={{
                  backgroundColor: PATIENT_DIAGNOSE_COLOR[2],
                  color: "#fff",
                  border: "none",
                }}
                onClick={handleSend}
              >
                Chốt kết quả
              </Button>
            </>
          )}

          {/* ✅ Xác nhận (status = 3) */}
          {status === PATIENT_DIAGNOSE_STATUS_NAME.WAITING && (
            <>
              <Button
                icon={<CheckOutlined />}
                style={{
                  backgroundColor: PATIENT_DIAGNOSE_COLOR[3],
                  color: "#fff",
                  border: "none",
                }}
                onClick={handleConfirm}
              >
                Xác nhận kết quả
              </Button>
              <Button
                icon={<CloseCircleOutlined />}
                style={{
                  backgroundColor: "#f5222d",
                  color: "#fff",
                  border: "none",
                }}
                onClick={handleCancelResult}
              >
                Hủy kết quả đã đọc
              </Button>
            </>
          )}

          {/* 🖨 In kết quả (status = 4) */}
          {status === 4 && (
            <>
              <Button
                icon={<PrinterOutlined />}
                style={{
                  backgroundColor: PATIENT_DIAGNOSE_COLOR[4],
                  color: "#fff",
                  border: "none",
                }}
                onClick={handlePrint}
              >
                In kết quả
              </Button>
              <Button
                icon={<CloseCircleOutlined />}
                style={{
                  backgroundColor: "#f5222d",
                  color: "#fff",
                  border: "none",
                }}
                onClick={handleCancelVerify}
              >
                Hủy kết quả đã duyệt
              </Button>
            </>
          )}

          <Button
            type="primary"
            shape="circle"
            icon={<UpOutlined />}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            style={{
              position: "fixed",
              bottom: 24,
              right: 24,
              zIndex: 1000,
              backgroundColor: "#1890ff",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
            }}
            title="Lên đầu trang"
          />

          <Button
            type="primary"
            shape="circle"
            icon={<DownOutlined />}
            onClick={() =>
              window.scrollTo({
                top: document.body.scrollHeight,
                behavior: "smooth",
              })
            }
            style={{
              position: "fixed",
              top: 24,
              right: 24,
              zIndex: 1000,
              backgroundColor: "#1890ff",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
            }}
            title="Kéo xuống cuối trang"
          />

          {/* 🌐 Dịch kết quả (status 2 hoặc 3) */}
          {(status === PATIENT_DIAGNOSE_STATUS_NAME.IN_PROCESS ||
            status === PATIENT_DIAGNOSE_STATUS_NAME.WAITING) &&
            isTrans && (
              <Button
                icon={<TranslationOutlined />}
                style={{
                  backgroundColor: "#3b5998",
                  color: "#fff",
                  border: "none",
                }}
                onClick={handleTranslate}
              >
                Dịch sang tiếng Anh
              </Button>
            )}
        </Space>
      </Form.Item>
    </>
  );
};

export default CompletionActionsDiagnose;
