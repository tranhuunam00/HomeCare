import { Button, Form } from "antd";
import { useNavigate } from "react-router-dom";

const PATIENT_DIAGNOSE_COLOR = {
  1: "blue",
  2: "gold",
  3: "orange",
  4: "green",
};

const CompletionActionsDiagnose = ({
  status,
  handlePrint,
  handleRead,
  handleConfirm,
}) => {
  const navigate = useNavigate();

  return (
    <>
      <h2>Thao tác hoàn thành</h2>
      <Form.Item style={{ marginTop: 24 }}>
        {/* Nút Huỷ luôn có */}
        <Button
          style={{ marginLeft: 8 }}
          onClick={() => navigate("/home/templates-print")}
        >
          Hủy
        </Button>

        {/* Trạng thái 1: Chỉ hiện Đọc kết quả */}
        {status === 1 && (
          <Button style={{ marginLeft: 8 }} type="primary" onClick={handleRead}>
            Đọc kết quả
          </Button>
        )}

        {/* Trạng thái 2: Chỉ hiện Đang đọc */}
        {status === 2 && (
          <Button style={{ marginLeft: 8 }} type="primary" onClick={handleRead}>
            Đang đọc
          </Button>
        )}

        {/* Trạng thái 3: Chỉ hiện Xác nhận */}
        {status === 3 && (
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
        {status === 4 ||
          (status === 1 && (
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
          ))}
      </Form.Item>
    </>
  );
};

export default CompletionActionsDiagnose;
