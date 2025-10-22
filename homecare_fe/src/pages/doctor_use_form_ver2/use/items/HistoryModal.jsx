import React, { useState, useEffect } from "react";
import { Modal, Table } from "antd";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import API_CALL from "../../../../services/axiosClient";

export default function HistoryModal({ open, onClose, idRoot, idCurrent }) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);

  useEffect(() => {
    if (!open || !idRoot) return;

    const fetchHistory = async () => {
      setLoading(true);
      try {
        const res = await API_CALL.get("/doctor-use-form-ver2", {
          params: {
            id_root: idRoot,
            includeDeleted: true,
            page: 1,
            limit: 100,
          },
        });
        setData(res.data.data?.items || []);
      } catch (err) {
        toast.error("Không tải được lịch sử thay đổi");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [open, idRoot]);

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      width: 80,
      render: (val) => (
        <span
          style={
            val == idCurrent ? { fontWeight: "bold", color: "#d46b08" } : {}
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
      title: "ID gốc",
      dataIndex: "id_root",
      width: 100,
    },
  ];

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={900}
      title="Lịch sử thay đổi"
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
