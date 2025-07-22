import { useNavigate } from "react-router-dom";
import { Steps, message } from "antd";
import {
  PlusCircleOutlined,
  FileSearchOutlined,
  LoadingOutlined,
  CheckCircleOutlined,
  PrinterOutlined,
  SolutionOutlined,
  ReadOutlined,
} from "@ant-design/icons";

const StatusButtonPatientDiagnose = ({ id, status }) => {
  const navigate = useNavigate();

  const steps = [
    {
      title: "Tạo bản ghi",
      icon: <PlusCircleOutlined />,
      statusValue: 0, // luôn click được
      alwaysEnabled: true,
    },
    {
      title: "Đọc kết quả",
      icon: <FileSearchOutlined />,
      statusValue: 1,
    },
    {
      title: "Đang đọc",
      icon: <ReadOutlined />,
      statusValue: 2,
    },
    {
      title: "Xác nhận kết quả",
      icon: <CheckCircleOutlined />,
      statusValue: 3,
    },
    {
      title: "In kết quả",
      icon: <PrinterOutlined />,
      statusValue: 4,
    },
  ];

  // Tìm step tương ứng với status để xác định current
  const currentStepIndex = steps.findIndex(
    (step) => step.statusValue === status
  );
  const safeCurrent = currentStepIndex >= 0 ? currentStepIndex : 0;

  const handleStepClick = (stepIndex) => {
    const clickedStep = steps[stepIndex];

    if (clickedStep.alwaysEnabled || clickedStep.statusValue <= status) {
      navigate("/home/patients-diagnose/use/" + id);
    } else {
      message.warning(
        "Không thể chuyển bước này khi chưa hoàn tất bước trước."
      );
    }
  };

  return (
    <div style={{ marginTop: 16 }}>
      <Steps
        current={safeCurrent}
        onChange={handleStepClick}
        items={steps.map((step) => ({
          title: step.title,
          icon: step.icon,
        }))}
        responsive={false}
        size="small"
      />
    </div>
  );
};

export default StatusButtonPatientDiagnose;
