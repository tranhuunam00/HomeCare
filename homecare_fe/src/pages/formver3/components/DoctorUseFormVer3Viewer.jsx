import React, { useEffect, useState } from "react";
import { Spin, Alert, Card, ConfigProvider } from "antd";
import { useParams } from "react-router-dom";
import { useGlobalAuth } from "../../../contexts/AuthContext";
import {
  buildDradv3FormValues,
  DEFAULT_IMAGING_ROWS,
} from "../formver3.constant";
import API_CALL from "../../../services/axiosClient";
import PrintPreviewVer3NotDataDiagnose from "./PrintPreviewVer3NotDataDiagnose";

export default function DoctorUseFormVer3Viewer({ id_doctor_use_formver3 }) {
  const { examParts, templateServices, doctor } = useGlobalAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [formSnapshot, setFormSnapshot] = useState(null);
  const [imagingRows, setImagingRows] = useState(DEFAULT_IMAGING_ROWS);
  const [imageList, setImageList] = useState([]);
  const [printTemplate, setPrintTemplate] = useState(null);
  const [selectedExamPart, setSelectedExamPart] = useState(null);
  const [selectedTemplateService, setSelectedTemplateService] = useState(null);
  const [doctorInfo, setDoctorInfo] = useState(null);
  const [approvalStatus, setApprovalStatus] = useState(null);

  useEffect(() => {
    const fetchPreviewData = async () => {
      try {
        setLoading(true);

        const res = await API_CALL.get(
          `/doctorUseFormVer3/detail/${id_doctor_use_formver3}`,
        );

        const apiData = res?.data?.data?.data || res?.data?.data;
        if (!apiData) throw new Error("Không tìm thấy dữ liệu");

        /* ========= 1. Build snapshot (GIỐNG Preview) ========= */
        const snapshot = buildDradv3FormValues({
          doctorUseFormVer3: apiData,
          patientDiagnose: apiData.id_patient_diagnose_patient_diagnose || null,
        });

        setFormSnapshot({
          ...snapshot,
          createdAt: apiData.createdAt,
        });

        /* ========= 2. Imaging rows ========= */
        try {
          const rows = JSON.parse(apiData.imageDescription || "[]");
          setImagingRows(
            Array.isArray(rows) && rows.length ? rows : DEFAULT_IMAGING_ROWS,
          );
        } catch {
          setImagingRows(DEFAULT_IMAGING_ROWS);
        }

        /* ========= 3. Images ========= */
        const images =
          apiData.image_doctor_use_form_ver3s
            ?.filter((x) => x.kind === "hinh_anh_mo_ta" || x.kind === "desc")
            ?.map((x) => ({
              url: x.url,
              caption: x.desc || "",
              rawUrl: x.url,
            })) || [];

        setImageList(images);

        /* ========= 4. Template + Exam part ========= */
        const patientDiagnose = apiData.id_patient_diagnose_patient_diagnose;

        setSelectedTemplateService(
          templateServices.find(
            (t) => t.id == patientDiagnose?.id_template_service,
          ),
        );

        setSelectedExamPart(
          examParts.find((e) => e.id == patientDiagnose?.id_exam_part),
        );

        /* ========= 5. Print template + doctor ========= */
        setPrintTemplate(apiData.id_print_template_print_template || null);
        setDoctorInfo(apiData.id_doctor_doctor || doctor);
        setApprovalStatus(apiData.status);
      } catch (e) {
        console.error(e);
        setError(e.message || "Không thể tải dữ liệu");
      } finally {
        setLoading(false);
      }
    };

    if (id_doctor_use_formver3) {
      fetchPreviewData();
    }
  }, [id_doctor_use_formver3, examParts, templateServices]);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: 40 }}>
        <Spin />
      </div>
    );
  }

  if (error) {
    return <Alert type="error" message={error} />;
  }

  return (
    <ConfigProvider
      theme={{
        token: {
          bodyPadding: 10,
        },
      }}
    >
      <Card>
        <PrintPreviewVer3NotDataDiagnose
          approvalStatus={approvalStatus}
          imagingRows={imagingRows}
          formSnapshot={formSnapshot}
          selectedExamPart={selectedExamPart}
          selectedTemplateService={selectedTemplateService}
          imageList={imageList}
          isUse={true}
          doctor={doctorInfo}
          printTemplate={printTemplate}
          languageTranslate={formSnapshot?.language || "vi"}
          isOnLyContent={true}
        />
      </Card>
    </ConfigProvider>
  );
}
