import React, { useEffect, useState } from "react";
import { Button, Spin, Typography } from "antd";
import API_CALL from "../../../services/axiosClient";
import { toast } from "react-toastify";
import { DoctorSignFileStatus } from "../../../constant/app";

const { Text } = Typography;

export default function SignedFilesBox({ id_patient_diagnose }) {
  const [signedFiles, setSignedFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id_patient_diagnose) return;

    const fetchSignedFiles = async () => {
      try {
        setLoading(true);
        const res = await API_CALL.get("/doctor-sign/doctor-sign-files", {
          params: {
            id_patient_diagnose,
            status: DoctorSignFileStatus.SUCCESS,
            page: 1,
            limit: 10,
          },
        });

        console.log("res--------", res);

        setSignedFiles(res?.data?.data?.data || []);
      } catch (err) {
        console.error(err);
        toast.error("Không tải được danh sách file đã ký");
      } finally {
        setLoading(false);
      }
    };

    fetchSignedFiles();
  }, [id_patient_diagnose]);

  if (loading) return <Spin />;

  if (!signedFiles.length) return null;

  return (
    <div
      style={{
        marginTop: 24,
        padding: 16,
        border: "1px solid #52c41a",
        borderRadius: 8,
        background: "#f6ffed",
      }}
    >
      <Text strong style={{ color: "#389e0d" }}>
        📎 FILE ĐÃ KÝ SỐ
      </Text>

      {signedFiles.map((item, index) => (
        <div
          key={item.id}
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 10,
            alignItems: "center",
          }}
        >
          <Text>
            {index + 1}. {item.file_name}
          </Text>

          <Button
            size="small"
            onClick={() => window.open(item.signed_pdf_url, "_blank")}
          >
            Xem PDF
          </Button>
        </div>
      ))}
    </div>
  );
}
