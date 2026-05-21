import React, { useState, useEffect } from "react";
import { Modal, Table, Button } from "antd";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import API_CALL from "../../../services/axiosClient";
import { languageTag } from "../../formver2/list/FormVer2List";

export default function TranslateListRecordsVer3({
  open,
  onClose,
  id_patient_diagnose,
  selectedDoctorUseFormVer3,
  setLanguageTransslate,
  setSelectedDoctorUseFormVer3,
}) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open || !id_patient_diagnose) return;

    const fetchHistory = async () => {
      setLoading(true);
      try {
        const res = await API_CALL.get("/doctorUseFormVer3", {
          params: {
            id_patient_diagnose: id_patient_diagnose,
            page: 1,
            limit: 100,
          },
        });
        const rows = res.data.data.data?.filter((a) => !a.deletedAt) || [];

        const latestByLanguage = Object.values(
          rows.reduce((acc, item) => {
            const lang = item.language || "unknown";

            // nếu chưa có hoặc id lớn hơn => lấy mới hơn
            if (!acc[lang] || item.id > acc[lang].id) {
              acc[lang] = item;
            }

            return acc;
          }, {}),
        );

        // sort mới nhất lên đầu
        latestByLanguage.sort((a, b) => b.id - a.id);

        setData(latestByLanguage);
      } catch (err) {
        toast.error("Không tải được lịch sử thay đổi");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [open, id_patient_diagnose]);

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      width: 80,
      render: (val) => (
        <span
          style={
            val == selectedDoctorUseFormVer3?.id
              ? { fontWeight: "bold", color: "#d46b08" }
              : {}
          }
        >
          {val}
        </span>
      ),
    },
    {
      title: "Người thay đổi",
      dataIndex: ["id_doctor_doctor", "full_name"],
    },
    {
      title: "Ngôn ngữ",
      dataIndex: "language",
      key: "language",
      width: 150,
      align: "center",
      render: (lang) => languageTag(lang),
    },
    {
      title: "Ngày thay đổi",
      dataIndex: "updatedAt",
      render: (val) => (val ? dayjs(val).format("DD/MM/YYYY HH:mm") : "-"),
    },
    {
      title: "Prev ID",
      dataIndex: "prev_id",
      width: 100,
    },
    {
      title: "Hành động",
      key: "action",
      align: "center",
      width: 150,
      render: (_, record) => (
        <Button
          type="link"
          onClick={() => {
            onClose();
            setSelectedDoctorUseFormVer3(record);
            setLanguageTransslate(record.language);
          }}
        >
          Xem chi tiết
        </Button>
      ),
    },
  ];

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={900}
      title="Danh sách bản dịch"
    >
      <Table
        rowKey="id"
        loading={loading}
        dataSource={data}
        columns={columns}
        pagination={false}
      />
    </Modal>
  );
}
