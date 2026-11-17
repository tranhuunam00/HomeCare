import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import API_CALL from "../../../../services/axiosClient";
import { useGlobalAuth } from "../../../../contexts/AuthContext";
import {
  DEFAULT_IMAGING_ROWS,
  buildDradv3FormValues,
  buildFormVer3Values,
} from "../../formver3.constant";
import { parseImageDescriptionState } from "../doctorUseFormVer3.utils";

export default function useDoctorFormData({
  form,
  selectedPatientDiagnose,
  patientDiagnoseId: propPatientDiagnoseId,
  doctorUseFormVer3Id,
  languageTranslate,
  setLanguageTransslate,
  setSelectedProvince,
}) {
  const { printTemplateGlobal, doctor } = useGlobalAuth();
  const [loading, setLoading] = useState(false);
  const [idEdit, setIdEdit] = useState(doctorUseFormVer3Id);
  const [patientDiagnose, setPatientDiagnose] = useState(null);
  const [imageList, setImageList] = useState([{}, {}, {}]);
  const [filteredFormVer3Names, setFilteredFormVer3Names] = useState([]);
  const [imagingRows, setImagingRows] = useState(DEFAULT_IMAGING_ROWS);
  const [imagingMode, setImagingMode] = useState("STRUCTURED_TABLE");
  const [fastSonoData, setFastSonoData] = useState({
    selectedMap: null,
    grade: "",
    templateCode: "",
    isManualEdited: false,
    plainNarrative: "",
    abnormalCodes: [],
  });
  const [isFreeText, setIsFreeText] = useState(false);
  const [freeTextContent, setFreeTextContent] = useState("");
  const [formVer3, setFormVer3] = useState();
  const [printTemplateList, setPrintTemplateList] = useState([]);
  const [printTemplate, setPrintTemplate] = useState(null);
  const [selectedIDs, setSelectedIDs] = useState({
    id_template_service: null,
    id_exam_part: null,
    id_formver3_name: null,
  });
  const [initialSnap, setInitialSnap] = useState({
    formValues: null,
    apiData: null,
    patientDiagnose: null,
  });

  // Fetch print templates
  useEffect(() => {
    if (Array.isArray(printTemplateGlobal) && printTemplateGlobal.length > 0) {
      setPrintTemplateList(printTemplateGlobal);
    }
    const fetchTemplates = async () => {
      try {
        const clinicId = doctor?.id_clinic;
        const res = await API_CALL.get("/print-template", {
          params: {
            page: 1,
            limit: 1000,
            ...(clinicId ? { id_clinic: clinicId } : {}),
          },
        });
        const list = res.data?.data?.data || res.data?.data || [];
        if (Array.isArray(list) && list.length > 0) {
          setPrintTemplateList(list);
        }
      } catch (e) {
        console.error("fetch print templates error", e);
      }
    };
    fetchTemplates();
  }, [doctor?.id_clinic, printTemplateGlobal]);

  // Fetch formver3 names
  useEffect(() => {
    const fetchDataFormver3Names = async () => {
      try {
        if (!selectedIDs.id_template_service || !selectedIDs.id_exam_part) {
          setFilteredFormVer3Names([]);
          return;
        }
        const data = await API_CALL.get("/formVer3_name", {
          params: {
            id_template_service: selectedIDs.id_template_service,
            id_exam_part: selectedIDs.id_exam_part,
            page: 1,
            limit: 1000,
          },
        });
        const filterDatas = (data.data?.data?.items || []).filter((item) => {
          return (
            (item.id_template_service == selectedIDs.id_template_service &&
              item.id_exam_part == selectedIDs.id_exam_part &&
              item.isUsed == true &&
              item.isApproved == true) ||
            item.id === 999999
          );
        });
        setFilteredFormVer3Names(filterDatas);
      } catch (error) {
        toast.error("Không thể tải danh sách tên mẫu FORM V3");
      }
    };
    fetchDataFormver3Names();
  }, [selectedIDs.id_exam_part, selectedIDs.id_template_service]);

  // Main data loader
  useEffect(() => {
    const activePatientDiagnoseId = propPatientDiagnoseId || selectedPatientDiagnose?.id;
    if (!activePatientDiagnoseId) return;

    const fetchDataFromServerWhenHaveIDs = async () => {
      try {
        setLoading(true);
        const apiCalls = [
          API_CALL.get("/patient-diagnose/" + activePatientDiagnoseId),
        ];
        if (idEdit) {
          apiCalls.push(API_CALL.get("/doctorUseFormVer3/detail/" + idEdit));
        } else {
          apiCalls.push(
            API_CALL.get("/doctorUseFormVer3", {
              params: {
                id_patient_diagnose: activePatientDiagnoseId,
                orderBy: "id",
                orderDir: "DESC",
                page: 1,
                limit: 1,
              },
            })
              .then((res) => {
                const latest = res.data?.data?.data?.[0] || res.data?.data?.[0];
                if (latest?.id) {
                  setIdEdit(latest.id);
                  return API_CALL.get("/doctorUseFormVer3/detail/" + latest.id);
                }
                return null;
              })
              .catch(() => null)
          );
        }

        const [diagnoseRes, dradsRes] = await Promise.all(apiCalls);
        const doctorUseFormVer3Server = dradsRes?.data?.data?.data || dradsRes?.data?.data || null;
        const patientDiagnoseData =
          diagnoseRes?.data?.data?.data ||
          diagnoseRes?.data?.data ||
          doctorUseFormVer3Server?.id_patient_diagnose_patient_diagnose ||
          null;

        const formValues = buildDradv3FormValues({
          doctorUseFormVer3: doctorUseFormVer3Server,
          patientDiagnose: patientDiagnoseData,
        });

        if (patientDiagnoseData?.province_code && setSelectedProvince) {
          setSelectedProvince(patientDiagnoseData.province_code);
        }

        setSelectedIDs({
          id_template_service: patientDiagnoseData?.id_template_service,
          id_exam_part: patientDiagnoseData?.id_exam_part,
          id_formver3_name: doctorUseFormVer3Server?.id_formver3_formver3?.id_formver3_name,
        });

        if (!idEdit && !doctorUseFormVer3Server) {
          setInitialSnap({ patientDiagnose: patientDiagnoseData });
        } else {
          formValues.id_formver3_name = doctorUseFormVer3Server?.id_formver3_formver3?.id_formver3_name;
          const descImages =
            doctorUseFormVer3Server?.image_doctor_use_form_ver3s
              ?.filter((x) => x.kind == "hinh_anh_mo_ta" || x.kind == "desc")
              ?.map((x) => ({
                url: x.url,
                caption: x.desc || "",
                rawUrl: x.url,
                file: undefined,
              })) || [];

          setImageList(descImages);

          const parsedState = parseImageDescriptionState(doctorUseFormVer3Server?.imageDescription);
          setImagingMode("STRUCTURED_TABLE");
          setIsFreeText(false);
          setFreeTextContent(parsedState.content);
          setFastSonoData(parsedState.fastSonoData);
          setImagingRows(parsedState.rows);
          setFormVer3(doctorUseFormVer3Server?.id_formver3_formver3);
          setInitialSnap({
            formValues: form.getFieldsValue(),
            apiData: doctorUseFormVer3Server,
            patientDiagnose: patientDiagnoseData,
          });

          if (doctorUseFormVer3Server?.language && doctorUseFormVer3Server.language !== languageTranslate) {
            setLanguageTransslate(doctorUseFormVer3Server.language);
          }
        }

        setPatientDiagnose(patientDiagnoseData || doctorUseFormVer3Server?.id_patient_diagnose_patient_diagnose);
        form.setFieldsValue(formValues);
      } catch (error) {
        toast.error("Không thể tải thông tin ca bệnh");
      } finally {
        setLoading(false);
      }
    };

    fetchDataFromServerWhenHaveIDs();
  }, [propPatientDiagnoseId, selectedPatientDiagnose?.id, idEdit]);

  // Tự fill mẫu in nếu chưa chọn (lần đọc đầu): ưu tiên mẫu khớp phân hệ của ca → mẫu active → mẫu đầu tiên
  useEffect(() => {
    if (loading || !patientDiagnose || !printTemplateList?.length) return;
    const current = form.getFieldValue("id_print_template");
    const existing = current && printTemplateList.find((t) => t.id == current);
    if (existing) {
      if (!printTemplate || printTemplate.id != existing.id) setPrintTemplate(existing);
      return;
    }
    const active = printTemplateList.filter((t) => t.is_active !== false);
    const pool = active.length ? active : printTemplateList;
    const picked =
      pool.find((t) => t.id_template_service && t.id_template_service == patientDiagnose.id_template_service) ||
      pool[0];
    if (picked) {
      form.setFieldsValue({ id_print_template: picked.id });
      setPrintTemplate(picked);
    }
  }, [loading, patientDiagnose, printTemplateList]);

  // Select form template
  const handleFormVer3Select = async (id_formver3_name) => {
    try {
      setLoading(true);
      const res = await API_CALL.get(`/formVer3?id_formver3_name=${id_formver3_name}`);
      const templateData = res.data?.data?.items?.[0] || res.data?.data?.[0];
      if (templateData) {
        setFormVer3(templateData);
        setSelectedIDs((prev) => ({
          ...prev,
          id_formver3_name: id_formver3_name,
        }));
        form.setFieldsValue(buildFormVer3Values(templateData));
        const parsedState = parseImageDescriptionState(templateData.imageDescription);
        setImagingMode(parsedState.mode);
        setIsFreeText(parsedState.isFreeText);
        setFreeTextContent(parsedState.content);
        setFastSonoData(parsedState.fastSonoData);
        setImagingRows(parsedState.rows);
      }
    } catch (e) {
      toast.error("Không tải được dữ liệu mẫu.");
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    setLoading,
    idEdit,
    setIdEdit,
    patientDiagnose,
    setPatientDiagnose,
    imageList,
    setImageList,
    filteredFormVer3Names,
    imagingRows,
    setImagingRows,
    imagingMode,
    setImagingMode,
    fastSonoData,
    setFastSonoData,
    isFreeText,
    setIsFreeText,
    freeTextContent,
    setFreeTextContent,
    formVer3,
    setFormVer3,
    printTemplateList,
    setPrintTemplateList,
    printTemplate,
    setPrintTemplate,
    selectedIDs,
    setSelectedIDs,
    initialSnap,
    setInitialSnap,
    handleFormVer3Select,
  };
}
