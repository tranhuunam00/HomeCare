import {
  PlusCircleOutlined,
  FileSearchOutlined,
  ReadOutlined,
  CheckCircleOutlined,
  PrinterOutlined,
} from "@ant-design/icons";
import { data, useNavigate } from "react-router-dom";
import CustomSteps from "./CustomSteps/CustomSteps";
import API_CALL from "../services/axiosClient";
import {
  PATIENT_DIAGNOSE_STATUS,
  PATIENT_DIAGNOSE_STATUS_NAME,
} from "../constant/app";
import { toast } from "react-toastify";
import { useGlobalAuth } from "../contexts/AuthContext";
import { Button } from "antd";

const GroupProcessPatientDiagnoiseFormVer2 = ({
  patientDiagnose,
  setPatientDiagnose,
}) => {
  const { id, status, id_doctor_in_processing } = patientDiagnose;
  const { doctor, templateServices } = useGlobalAuth();
  const navigate = useNavigate();

  const onCheckandCreate = async () => {
    try {
      if (
        templateServices
          .find((t) => t.id == patientDiagnose.id_template_service)
          ?.name.toLowerCase()
          .includes("d-sono")
      ) {
        const sonoResult = await API_CALL.get(`/sono`, {
          params: {
            id_patient_diagnose: id,
            id_doctor: doctor.id,
          },
        });

        if (sonoResult.data.data.data.data?.length) {
          navigate(`/home/sono/bung/${sonoResult.data.data.data.data[0].id}`);
        } else {
          navigate(`/home/sono/use/patient-diagnose/${id}`);
        }
      } else {
        const doctorUseDFormVer2 = await API_CALL.get(`/doctor-use-form-ver2`, {
          params: {
            id_patient_diagnose: id,
            id_doctor: doctor.id,
            orderBy: "id",
            orderDir: "DESC",
          },
        });

        if (doctorUseDFormVer2.data.data.items?.length) {
          navigate(
            `/home/doctor-use-form-drad/detail/${doctorUseDFormVer2.data.data.items[0].id}`
          );
        } else {
          navigate(`/home/form-drad/use/patient-diagnose/${id}`);
        }
      }
    } catch (error) {
      toast.error("Không cập nhật được trạng thái đọc ca bệnh");
    }
  };

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

          await onCheckandCreate();
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
          await onCheckandCreate();
        } catch (error) {
          toast.error("Không cập nhật được trạng thái đọc ca bệnh");
        }
      },
    },
    {
      title: "Xác nhận kết quả",
      icon: <CheckCircleOutlined />,
      onStepClick: async () => {
        try {
          await onCheckandCreate();
        } catch (error) {
          toast.error("Không cập nhật được trạng thái đọc ca bệnh");
        }
      },
    },
    {
      title: "In kết quả",
      icon: <PrinterOutlined />,
      onStepClick: async () => {
        try {
          await onCheckandCreate();
        } catch (error) {
          toast.error("Lỗi lấy thông tin");
        }
      },
    },
  ];

  const handleCancelReading = async (
    changedStatus = PATIENT_DIAGNOSE_STATUS_NAME.NEW
  ) => {
    try {
      await API_CALL.put(`/patient-diagnose/${id}`, {
        ...patientDiagnose,
        status: changedStatus, // hoặc trạng thái bạn muốn
      });
      setPatientDiagnose({ ...patientDiagnose, status: changedStatus });
      navigate(`/home/patients-diagnose`);
      toast.success("Đã hủy đọc ca bệnh");
    } catch (error) {
      toast.error("Không hủy được ca bệnh");
    }
  };
  return (
    <div>
      <CustomSteps steps={steps} current={status} />

      {status === PATIENT_DIAGNOSE_STATUS_NAME.IN_PROCESS &&
        id_doctor_in_processing === doctor.id && (
          <div style={{ marginTop: 16 }}>
            <Button
              danger
              type="primary"
              onClick={() => {
                const ok = window.confirm(
                  "Bạn có chắc chắn muốn hủy đọc kết quả?\n\nNếu hủy, ca sẽ được trả về trạng thái MỚI."
                );

                if (ok) {
                  handleCancelReading();
                }
              }}
            >
              Hủy đọc kết quả
            </Button>
          </div>
        )}

      {status === PATIENT_DIAGNOSE_STATUS_NAME.VERIFY &&
        id_doctor_in_processing === doctor.id && (
          <div style={{ marginTop: 16 }}>
            <Button
              danger
              type="primary"
              onClick={() => {
                const ok = window.confirm(
                  "Bạn có chắc chắn muốn hủy kết quả đã duyệt\n\nNếu hủy, ca sẽ được trả về trạng thái CHỜ DUYỆT."
                );

                if (ok) {
                  handleCancelReading(PATIENT_DIAGNOSE_STATUS_NAME.WAITING);
                }
              }}
            >
              Hủy duyệt
            </Button>
          </div>
        )}
    </div>
  );
};

export default GroupProcessPatientDiagnoiseFormVer2;
