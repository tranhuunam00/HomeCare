import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, Divider, Select, Spin } from "antd";
import dayjs from "dayjs";
import API_CALL from "../../services/axiosClient";
import { useGlobalAuth } from "../../contexts/AuthContext";
import useSelectById from "../../hooks/useSelectById";
import { toast } from "react-toastify";
import StatusButtonPatientDiagnose from "../../components/Status2ButtonPatientDiagnose";
import DFormVer2 from "../formver2/FormVer2";
import Title from "antd/es/skeleton/Title";
import PrintPreviewVer2 from "./PreviewVer2/PreviewVer2";
import { handlePrint } from "../formver2/utils";

const DoctorChooseForm = () => {
  const { id } = useParams();
  const printRef = useRef();

  const [data, setData] = useState(null);
  const navigate = useNavigate();
  const { examParts, templateServices } = useGlobalAuth();
  const [dataFormVer2List, setDataFormVer2List] = useState([]);
  const [printTemplateList, setPrintTemplateList] = useState([]);

  const [idFormVer2Choose, setIdFormVer2Choose] = useState();
  const [idTemplatePrintChoose, setIdTemplatePrintChoose] = useState();

  const [formSnapshot, setFormSnapshot] = useState({});
  const [tablesSnapshot, setTablesSnapshot] = useState([]);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await API_CALL.get(`/patient-diagnose/${id}`);
        setData(res.data.data);
      } catch (err) {
        console.error("Không thể lấy dữ liệu bệnh nhân:", err);
      }
    };
    if (id) fetchDetail();
  }, [id]);

  useEffect(() => {
    const idExam = data?.id_exam_part;
    const idTpl = data?.id_template_service;

    if (!idExam || !idTpl) return;

    const controller = new AbortController();

    (async () => {
      try {
        const res = await API_CALL.get("/form-ver2", {
          params: {
            id_exam_part: Number(idExam),
            id_template_service: Number(idTpl),
          },
          signal: controller.signal,
        });

        console.log("res.data?.data", res.data?.data);
        setDataFormVer2List(res.data?.data?.items ?? []);
      } catch (err) {
        if (err.name !== "CanceledError") {
          console.error("Không thể lấy form ver2:", err);
        }
      }
    })();

    return () => controller.abort();
  }, [data?.id_exam_part, data?.id_template_service]);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const [printRes] = await Promise.all([
          API_CALL.get("/print-template", {
            params: {
              page: 1,
              limit: 1000,
              id_template_service: +data?.id_template_service || -1,
              id_clinic: data?.id_clinic,
            },
          }),
        ]);

        const printData = printRes.data.data?.data || printRes.data.data || [];

        if (printRes?.length == 0) {
          toast.error("Không có mẫu in nào phù hợp cho phòng khám");
        }
        setPrintTemplateList(printData);
      } catch (error) {
        toast.error("Không thể tải danh sách template");
      }
    };

    if (data?.id_template_service) fetchTemplates();
  }, [data?.id_template_service]);

  const idExamPart = data?.id_exam_part ?? null;
  const idTemplateService = data?.id_template_service ?? null;

  const { selected: selectedExamPart, activeList: activeExamParts } =
    useSelectById(examParts, idExamPart);

  const {
    selected: selectedTemplateService,
    activeList: activeTemplateServices,
  } = useSelectById(templateServices, idTemplateService);

  // Sau khi gọi hooks, mới render theo điều kiện
  if (!data) return <Spin />;

  console.log("data?.id_form_ver2", data?.id_form_ver2);
  return (
    <div style={{ padding: "2rem" }}>
      <Card title="WORK SPACE" bordered>
        <StatusButtonPatientDiagnose id={data?.id} status={data?.status || 1} />
      </Card>
      <h3 style={{ marginTop: 30 }}>CHỌN FORM</h3>
      <Select
        title="Vui lòng chọn form"
        style={{ width: 400 }}
        placeholder="Chọn form-ver2"
        value={idFormVer2Choose ?? undefined}
        onChange={(val) => setIdFormVer2Choose(val)}
        allowClear
        showSearch
        optionFilterProp="label"
        options={dataFormVer2List?.map((f) => ({
          label: f.ten_mau || f.name || `Form #${f.id}`,
          value: f.id,
        }))}
      />
      <h3 style={{ marginTop: 30 }}>CHỌN MẪU IN</h3>
      <Select
        title="Vui lòng chọn form"
        style={{ width: 400 }}
        placeholder="Chọn form-ver2"
        value={idTemplatePrintChoose ?? undefined}
        onChange={(val) => setIdTemplatePrintChoose(val)}
        allowClear
        showSearch
        optionFilterProp="label"
        options={printTemplateList?.map((f) => ({
          label: f.name,
          value: f.id,
        }))}
      />
      <Divider />
      <div style={{ display: "flex" }}>
        <DFormVer2
          id_form_ver2={idFormVer2Choose}
          isDoctor={true}
          onFormChange={setFormSnapshot}
          onTablesChange={setTablesSnapshot}
          onPrint={() => handlePrint(printRef)}
        />
        <PrintPreviewVer2
          printRef={printRef}
          patientDiagnose={data}
          printTemplate={printTemplateList?.find(
            (t) => t.id == idTemplatePrintChoose
          )}
          formSnapshot={formSnapshot}
          tablesSnapshot={tablesSnapshot}
          selectedExamPart={selectedExamPart}
          selectedTemplateService={selectedTemplateService}
        />
      </div>
    </div>
  );
};

export default DoctorChooseForm;
