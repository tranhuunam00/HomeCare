import {
  PlusCircleOutlined,
  FileSearchOutlined,
  ReadOutlined,
  CheckCircleOutlined,
  PrinterOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import CustomSteps from "./CustomSteps/CustomSteps";
import API_CALL from "../services/axiosClient";
import {
  PATIENT_DIAGNOSE_STATUS,
  PATIENT_DIAGNOSE_STATUS_NAME,
} from "../constant/app";
import { toast } from "react-toastify";
import { useGlobalAuth } from "../contexts/AuthContext";
import { Button } from "antd";

const GroupProcessPatientDiagnoiseFormVer2 = ({ patientDiagnose }) => {
  const { id, status, id_doctor_in_processing } = patientDiagnose;
  const { doctor } = useGlobalAuth();
  const navigate = useNavigate();

  const steps = [
    {
      title: "Tạo bản ghi",
      icon: <PlusCircleOutlined />,
      onStepClick: () => {},
    },
    {
      title: "Đọc kết quả",
      icon: <FileSearchOutlined />,
      onStepClick: async () => {
        try {
          const updateStatus = await API_CALL.put(`/patient-diagnose/${id}`, {
            ...patientDiagnose,
            status: PATIENT_DIAGNOSE_STATUS_NAME.IN_PROCESS,
          });
          toast.success("Đã cập nhật trạng thái đọc ca bệnh");

          navigate(`/home/form-drad/use/patient-diagnose/${id}`);
          console.log("hehe");
        } catch (error) {
          toast.error("Không cập nhật được trạng thái đọc ca bệnh");
        }
      },
    },
    {
      title: "Đang đọc",
      icon: <ReadOutlined />,
      onStepClick: async () => {
        try {
          const doctorUseDFormVer2 = await API_CALL.get(
            `/doctor-use-form-ver2`,
            {
              params: {
                id_patient_diagnose: id,
                id_doctor: doctor.id,
                orderBy: "id",
                orderDir: "DESC",
              },
            }
          );

          if (doctorUseDFormVer2.data.data.items?.length) {
            navigate(
              `/home/doctor-use-form-drad/detail/${doctorUseDFormVer2.data.data.items[0].id}`
            );
          } else {
            navigate(`/home/form-drad/use/patient-diagnose/${id}`);
          }
          console.log("hehe");
        } catch (error) {
          toast.error("Không cập nhật được trạng thái đọc ca bệnh");
        }
      },
    },
    {
      title: "Xác nhận kết quả",
      icon: <CheckCircleOutlined />,
      onStepClick: () => {},
    },
    {
      title: "In kết quả",
      icon: <PrinterOutlined />,
      onStepClick: async () => {
        try {
          const doctorUseDFormVer2 = await API_CALL.get(
            `/doctor-use-form-ver2`,
            {
              params: {
                id_patient_diagnose: id,
                id_doctor: doctor.id,
                orderBy: "id",
                orderDir: "DESC",
              },
            }
          );

          if (doctorUseDFormVer2.data.data.items?.length) {
            navigate(
              `/home/doctor-use-form-drad/detail/${doctorUseDFormVer2.data.data.items[0].id}`
            );
          } else {
            toast.error("Lỗi lấy thông tin");
          }
        } catch (error) {
          toast.error("Lỗi lấy thông tin");
        }
      },
    },
  ];

  const handleCancelReading = async () => {
    try {
      await API_CALL.put(`/patient-diagnose/${id}`, {
        ...patientDiagnose,
        status: PATIENT_DIAGNOSE_STATUS_NAME.NEW, // hoặc trạng thái bạn muốn
      });
      navigate(`/home/patients-diagnose`);
      toast.success("Đã hủy đọc ca bệnh");
    } catch (error) {
      toast.error("Không hủy được ca bệnh");
    }
  };
  return (
    <div>
      <CustomSteps steps={steps} current={status} />

      {status == PATIENT_DIAGNOSE_STATUS_NAME.IN_PROCESS &&
        id_doctor_in_processing == doctor.id && (
          <div style={{ marginTop: 16, textAlign: "center" }}>
            <Button danger type="primary" onClick={handleCancelReading}>
              Hủy đọc kết quả
            </Button>
          </div>
        )}
    </div>
  );
};

export default GroupProcessPatientDiagnoiseFormVer2;
