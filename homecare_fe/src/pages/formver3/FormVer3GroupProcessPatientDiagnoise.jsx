import {
  PlusCircleOutlined,
  FileSearchOutlined,
  ReadOutlined,
  CheckCircleOutlined,
  PrinterOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { data, useNavigate } from "react-router-dom";

import { toast } from "react-toastify";
import { Button } from "antd";
import CustomSteps from "../../components/CustomSteps/CustomSteps";
import API_CALL from "../../services/axiosClient";
import { PATIENT_DIAGNOSE_STATUS_NAME } from "../../constant/app";
import { useGlobalAuth } from "../../contexts/AuthContext";

const FormVer3GroupProcessPatientDiagnoise = ({
  patientDiagnose,
  setPatientDiagnose,
  onStatusChange,
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
            // id_doctor: doctor.id,
          },
        });

        if (sonoResult.data.data.data.data?.length) {
          navigate(`/home/sono/bung/${sonoResult.data.data.data.data[0].id}`);
        } else {
          navigate(`/home/sono/use/patient-diagnose/${id}`);
        }
      } else {
        const doctorUseDFormVer3 = await API_CALL.get(`/doctorUseFormVer3`, {
          params: {
            id_patient_diagnose: id,
            // id_doctor: doctor.id,
            orderBy: "id",
            orderDir: "DESC",
          },
        });

        if (doctorUseDFormVer3.data.data.data?.length) {
          navigate(
            `/home/doctor-use-formver3/detail/${doctorUseDFormVer3.data.data.data[0].id}/${patientDiagnose.status == PATIENT_DIAGNOSE_STATUS_NAME.VERIFY}`,
          );
        } else {
          navigate(`/home/form-drad-v3/use/patient-diagnose/${id}`);
        }
      }
    } catch (error) {
      toast.error("Không cập nhật được trạng thái đọc ca bệnh");
    }
  };

  const steps = [
    {
      title: "Khởi tạo",
      onStepClick: () => {},
    },
    {
      title: "Chọn đọc",
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
      onStepClick: async () => {
        try {
          await onCheckandCreate();
        } catch (error) {
          toast.error("Không cập nhật được trạng thái đọc ca bệnh");
        }
      },
    },
    {
      title: "Chờ xác nhận",
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
    changedStatus = PATIENT_DIAGNOSE_STATUS_NAME.NEW,
  ) => {
    try {
      await API_CALL.put(`/patient-diagnose/${id}`, {
        ...patientDiagnose,
        status: changedStatus, // hoặc trạng thái bạn muốn
      });
      setPatientDiagnose({ ...patientDiagnose, status: changedStatus });
      if (onStatusChange) {
        onStatusChange();
      }
      navigate(`/home/patients-diagnose`);
      toast.success("Đã hủy đọc ca bệnh");
    } catch (error) {
      toast.error("Không hủy được ca bệnh");
    }
  };
  return (
    <div>
      {/* <h3 style={{ margin: 0, padding: 0 }}>Phiên bản 3</h3> */}
      <div
        style={{
          position: "fixed",
          zIndex: 3,
          display: "flex",
          justifyContent: "center",
          bottom: 0,
          flexDirection: "column",
          background: "#ffffff",
        }}
      >
        <CustomSteps steps={steps} current={status} />
        {(status === PATIENT_DIAGNOSE_STATUS_NAME.IN_PROCESS ||
          status === PATIENT_DIAGNOSE_STATUS_NAME.WAITING) &&
          id_doctor_in_processing === doctor.id && (
            <div style={{ marginTop: 16 }}>
              <Button
                style={{
                  height: 45,
                  padding: "16px 18px",
                  borderRadius: 14,
                  fontWeight: 800,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: "#c14728",
                  background: "rgba(14,165,233,0.06)",
                }}
                onClick={() => {
                  const ok = window.confirm(
                    "Bạn có chắc chắn muốn hủy đọc kết quả?\n\nNếu hủy, ca sẽ được trả về trạng thái MỚI.",
                  );
                  if (ok) handleCancelReading();
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
                style={{
                  height: 45,
                  padding: "16px 18px",
                  borderRadius: 14,
                  fontWeight: 800,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: "#b91c1c",
                  border: "1px solid rgba(185,28,28,0.35)",
                  background: "rgba(185,28,28,0.06)",
                }}
                onClick={() => {
                  const ok = window.confirm(
                    "Bạn có chắc chắn muốn hủy kết quả đã duyệt?\n\nNếu hủy, ca sẽ được trả về trạng thái CHỜ DUYỆT.",
                  );
                  if (ok)
                    handleCancelReading(PATIENT_DIAGNOSE_STATUS_NAME.WAITING);
                }}
              >
                Hủy duyệt
              </Button>
            </div>
          )}
      </div>
    </div>
  );
};

export default FormVer3GroupProcessPatientDiagnoise;
