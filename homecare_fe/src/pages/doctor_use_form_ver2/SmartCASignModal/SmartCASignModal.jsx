import React, { useEffect, useState } from "react";
import { Modal, Upload, Button, Spin, Typography } from "antd";
import { UploadOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";
import API_CALL from "../../../services/axiosClient";
import { DoctorSignFileStatus } from "../../../constant/app";

const { Text } = Typography;

export default function SmartCASignModal({
  open,
  onClose,
  id_sono_result,
  id_doctor_use_form_ver2,
}) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [signedSuccess, setSignedSuccess] = useState(false);
  const [signedFileUrl, setSignedFileUrl] = useState(null);
  const [signedFiles, setSignedFiles] = useState([]);
  const [loadingFiles, setLoadingFiles] = useState(false);

  useEffect(() => {
    if (!open) return;

    const fetchSignedFiles = async () => {
      try {
        setLoadingFiles(true);

        const res = await API_CALL.get("/doctor-sign/doctor-sign-files", {
          params: {
            id_sono_result,
            id_doctor_use_form_ver2,
            status: DoctorSignFileStatus.SUCCESS,
            page: 1,
            limit: 10,
          },
        });

        setSignedFiles(res?.data?.data?.data || []);
      } catch (err) {
        console.error(err);
        toast.error("Không tải được danh sách file đã ký");
      } finally {
        setLoadingFiles(false);
      }
    };

    fetchSignedFiles();
  }, [open, id_sono_result, id_doctor_use_form_ver2]);

  const hasOldSignedFiles = signedFiles.length > 0;

  /* ================== UPLOAD & SIGN ================== */
  const handleSign = async () => {
    if (!file) {
      toast.error("Vui lòng chọn file PDF");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("files", file);
      if (id_sono_result) formData.append("id_sono_result", id_sono_result);
      if (id_doctor_use_form_ver2)
        formData.append("id_doctor_use_form_ver2", id_doctor_use_form_ver2);

      const res = await API_CALL.post("/doctor-sign/smartca-sign", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res?.data?.success) {
        toast.success("Ký file thành công");
        setSignedSuccess(true);
      } else {
        throw new Error(res?.data?.message || "Ký thất bại");
      }
    } catch (err) {
      console.error(err);
      toast.error("Ký file thất bại");
    } finally {
      setLoading(false);
    }
  };

  /* ================== VERIFY ================== */
  const handleVerify = async () => {
    try {
      setLoading(true);

      const res = await API_CALL.post("/doctor-sign/smartca-sign-verify", {
        id_sono_result,
        id_doctor_use_form_ver2,
      });

      if (res?.data?.success) {
        toast.success("Xác thực chữ ký thành công");
        setSignedFileUrl(res.data.data); // 👈 URL file đã ký
      } else {
        throw new Error(res?.message || "Verify thất bại");
      }
    } catch (err) {
      console.error(err);
      toast.error("Verify chữ ký thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      title="Ký số SmartCA"
      onCancel={onClose}
      footer={null}
      destroyOnClose
    >
      <Spin spinning={loading}>
        {hasOldSignedFiles && (
          <div
            style={{
              marginBottom: 16,
              padding: 12,
              border: "1px solid #1890ff",
              borderRadius: 6,
              background: "#f0f8ff",
            }}
          >
            <Text strong style={{ color: "#1890ff" }}>
              📎 File đã ký trước đó
            </Text>

            {signedFiles.map((item, index) => (
              <div
                key={item.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: 8,
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
                  Xem
                </Button>
              </div>
            ))}
          </div>
        )}

        <Upload
          accept="application/pdf"
          maxCount={1}
          beforeUpload={(f) => {
            setFile(f);
            return false;
          }}
          onRemove={() => setFile(null)}
        >
          <Button icon={<UploadOutlined />}>Chọn file PDF</Button>
        </Upload>

        {file && (
          <Text type="secondary" style={{ display: "block", marginTop: 8 }}>
            File: {file.name}
          </Text>
        )}

        <div style={{ marginTop: 24, display: "flex", gap: 12 }}>
          <Button
            type="primary"
            onClick={handleSign}
            disabled={!file || signedSuccess}
          >
            Ký file
          </Button>

          {signedSuccess && (
            <Button icon={<CheckCircleOutlined />} onClick={handleVerify}>
              Verify chữ ký
            </Button>
          )}
        </div>
        {signedFileUrl && (
          <div
            style={{
              marginTop: 16,
              padding: 12,
              border: "1px dashed #52c41a",
              borderRadius: 6,
            }}
          >
            <Text type="success" strong>
              File đã ký thành công
            </Text>

            <div style={{ marginTop: 8 }}>
              <a href={signedFileUrl} target="_blank" rel="noopener noreferrer">
                {signedFileUrl}
              </a>
            </div>

            <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
              <Button onClick={() => window.open(signedFileUrl, "_blank")}>
                Mở file
              </Button>

              <Button danger onClick={onClose}>
                Đóng
              </Button>
            </div>
          </div>
        )}
      </Spin>
    </Modal>
  );
}
