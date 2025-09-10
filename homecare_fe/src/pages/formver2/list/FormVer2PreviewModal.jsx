// src/pages/formver2/components/FormVer2PreviewModal.jsx
import React, { useEffect, useState } from "react";
import { Modal, Spin } from "antd";
import API_CALL from "../../../services/axiosClient";
import PrintPreviewVer2NotDataDiagnose from "../PreviewVer2/PrintPreviewVer2NotDataDiagnose";

export default function FormVer2PreviewModal({ open, onClose, id }) {
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState(null);

  useEffect(() => {
    if (!id || !open) return;
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const res = await API_CALL.get(
          `/form-ver2/${id}?withTables=true&withImages=true&includeDeleted=false`
        );
        setDetail(res?.data?.data?.data || null);
      } catch (e) {
        console.error("Lỗi khi load chi tiết form:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id, open]);
  console.log("detail", detail);
  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={1100}
      destroyOnClose
    >
      {loading ? (
        <div style={{ textAlign: "center", padding: 40 }}>
          <Spin />
        </div>
      ) : detail ? (
        <PrintPreviewVer2NotDataDiagnose
          formSnapshot={detail}
          selectedExamPart={detail?.id_exam_part_exam_part}
          selectedTemplateService={detail?.id_template_service_template_service}
          ImageLeftUrl={
            detail?.image_form_ver2s?.find((x) => x.kind === "left")?.url
          }
          ImageRightUrl={
            detail?.image_form_ver2s?.find((x) => x.kind === "right")?.url
          }
          imageDescEditor={
            detail?.imageDescEditor ? JSON.parse(detail.imageDescEditor) : ""
          }
          initialSnap={detail}
          currentFormVer2Name={detail?.id_formver2_name_form_ver2_name}
          editId={id}
        />
      ) : (
        <div style={{ textAlign: "center", padding: 40 }}>Không có dữ liệu</div>
      )}
    </Modal>
  );
}
