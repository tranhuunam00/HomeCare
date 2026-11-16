import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Form,
  Input,
  Select,
  Button,
  Typography,
  Row,
  Col,
  Tooltip,
  Spin,
  Modal,
  Divider,
  Switch,
  Segmented,
  Grid,
  Checkbox,
  Tag,
  Avatar,
} from "antd";
import {
  QuestionCircleOutlined,
  ReloadOutlined,
  EyeOutlined,
  UserOutlined,
  TeamOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import styles from "./DoctorIUseFormVer3.module.scss";
import { useGlobalAuth } from "../../../../contexts/AuthContext";
import API_CALL from "../../../../services/axiosClient";
import useVietnamAddress from "../../../../hooks/useVietnamAddress";
import usePatientDiagnoseStatus from "../../../../hooks/usePatientDiagnoseStatus";
import useConfirmAction from "../../../../hooks/useConfirmAction";
import ConfirmActionModal from "../../../../components/ConfirmActionModal/ConfirmActionModal";
import {
  PATIENT_DIAGNOSE_STATUS_CODE,
  sortTemplateServices,
  TRANSLATE_LANGUAGE,
  translateLabel,
  USER_ROLE,
} from "../../../../constant/app";
import { APPROVAL_STATUS } from "../../../../components/ApprovalStatusTag";

import FormActionBar, {
  KEY_ACTION_BUTTON,
} from "../../../formver2/component/FormActionBar.jsx";
import PatientInfoSection from "../../../doctor_use_form_ver2/use/items/PatientInfoForm";
import HistoryModal from "../../../doctor_use_form_ver2/use/items/HistoryModal";
import TranslateListRecords from "../../../doctor_use_form_ver2/use/items/TranslateListRecords";
import SmartCASignModal from "../../../doctor_use_form_ver2/SmartCASignModal/SmartCASignModal";
import {
  APPROVAL_FORMVER3_STATUS_NAME,
  buildDradv3FormValues,
  buildFormDataDoctorUseFormVer3,
  buildFormVer3Values,
  CAN_THIEP_GROUP_CODE,
  DEFAULT_IMAGING_ROWS,
  getServiceLabel,
  LANGUAGE_OPTIONS,
  PATIENT_FIELDS,
  TEMPLATE_GROUP_RENDER_MAP,
  generateTextFromStructuredRows,
} from "../../formver3.constant";
import AdvancedSampleSection from "../../components/AdvancedSampleSection";
import ImagingDiagnosisSection from "../../components/ImagingDiagnosisSection";
import { handlePrint } from "../../../formver2/utils.js";
import TranslateListRecordsVer3 from "../../components/TranslateListRecordsVer3.jsx";
import useLatestDoctorUseFormVer3 from "../../useLatestDoctorUseFormVer3.js";
import VoiceCursorDictation from "../../components/VoiceCursorDictation.jsx";

import CaseDoctorsSection from "../components/CaseDoctorsSection";
import ProcedureSection from "../components/ProcedureSection";
import ImagingFindingsSection from "../components/ImagingFindingsSection";
import IllustrativeImagesSection from "../components/IllustrativeImagesSection";
import PrintPreviewModal from "../components/PrintPreviewModal";
import useDoctorFormHotkeys from "../hooks/useDoctorFormHotkeys";
import {
  parseImageDescriptionState,
  dataURLtoFile,
  DEFAULT_FAST_SONO_DATA,
} from "../doctorUseFormVer3.utils";

export { parseImageDescriptionState };

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

export default function DoctorUseDFormVer3({
  onFormChange,
  isUse = false,
  doctorUseFormVer3Id,
  onStatusChange,
  onOpenConsultation,
  initEditMode = false,
  onNextPatient,
}) {
  const printRef = useRef(null);
  const [form] = Form.useForm();
  const [autoAdvanceNextCase, setAutoAdvanceNextCase] = useState(() => {
    try {
      return localStorage.getItem("HC_AUTO_ADVANCE_NEXT_CASE") === "true";
    } catch {
      return false;
    }
  });

  const handleToggleAutoAdvance = (checked) => {
    setAutoAdvanceNextCase(checked);
    try {
      localStorage.setItem("HC_AUTO_ADVANCE_NEXT_CASE", String(checked));
    } catch {}
  };
  const {
    examParts,
    templateServices,
    doctor,
    setExamParts,
    setTemplateServices,
    selectedPatientDiagnose,
    setSelectedPatientDiagnose,
    previewOpen,
    setPreviewOpen,
    languageTranslate,
    setLanguageTransslate,
  } = useGlobalAuth();

  const printSourceRef = useRef(null);
  const { transitionStatus } = usePatientDiagnoseStatus();
  const { confirmState, openConfirm } = useConfirmAction();
  const screens = Grid.useBreakpoint();
  const isMobile = screens.md === false;

  const [reloading, setReloading] = useState(false);
  const [signModalOpen, setSignModalOpen] = useState(false);
  const { provinces, wards, setSelectedProvince } = useVietnamAddress();
  const { is_print } = useParams();

  const [idEdit, setIdEdit] = useState(doctorUseFormVer3Id);

  const [patientDiagnose, setPatientDiagnose] = useState(null);
  const [imageList, setImageList] = useState([{}, {}, {}]);
  const [filteredFormVer3Names, setFilteredFormVer3Names] = useState([]);

  const [diagnosisSummary, setDiagnosisSummary] = useState(
    form.getFieldValue("imagingDiagnosisSummary"),
  );

  const [initialSnap, setInitialSnap] = useState({
    formValues: null,
    apiData: null,
    patientDiagnose: null,
  });
  const [formVer3, setFormVer3] = useState();
  const [printTemplateList, setPrintTemplateList] = useState([]);
  const [printTemplate, setPrintTemplate] = useState(null);

  const [selectedIDs, setSelectedIDs] = useState({
    id_template_service: null,
    id_exam_part: null,
    id_formver3_name: null,
  });

  // Thông tin 3 dạng bác sĩ trong ca khám (Đọc ca, Hội chẩn, Duyệt kết quả)
  const readingDoctor = useMemo(() => {
    return (
      patientDiagnose?.id_doctor_in_processing_doctor ||
      initialSnap?.apiData?.id_doctor_doctor ||
      (patientDiagnose?.id_doctor_in_processing === doctor?.id ? doctor : null) ||
      patientDiagnose?.id_receive_doctor_doctor ||
      (patientDiagnose?.status === PATIENT_DIAGNOSE_STATUS_CODE.IN_PROCESSING ? doctor : null)
    );
  }, [patientDiagnose, initialSnap?.apiData, doctor]);

  const consultingDoctor = useMemo(() => {
    return (
      patientDiagnose?.id_consulting_doctor_doctor ||
      selectedPatientDiagnose?.id_consulting_doctor_doctor ||
      null
    );
  }, [patientDiagnose, selectedPatientDiagnose]);

  const verifyDoctor = useMemo(() => {
    return (
      patientDiagnose?.id_verify_doctor_doctor ||
      selectedPatientDiagnose?.id_verify_doctor_doctor ||
      null
    );
  }, [patientDiagnose, selectedPatientDiagnose]);

  const activeDoctorsCount = [readingDoctor, consultingDoctor, verifyDoctor].filter(Boolean).length;
  const doctorColSpan = activeDoctorsCount === 1 ? 24 : activeDoctorsCount === 2 ? 12 : 8;

  const [imagingRows, setImagingRows] = useState(DEFAULT_IMAGING_ROWS);
  // imagingMode: 'STRUCTURED_TABLE' (Bảng cấu trúc) | 'FAST_SONO' (Chọn nhanh D-SONO 5 tầng) | 'FREE_TEXT' (Văn bản tự do)
  const [imagingMode, setImagingMode] = useState("STRUCTURED_TABLE");
  const [fastSonoData, setFastSonoData] = useState({
    selectedMap: null,
    grade: "",
    templateCode: "",
    isManualEdited: false,
    plainNarrative: "",
    abnormalCodes: [],
  });
  // isFreeText: chế độ văn bản tự do (SunEditor hoặc D-SONO text) thay cho bảng cấu trúc
  const [isFreeText, setIsFreeText] = useState(false);
  const [freeTextContent, setFreeTextContent] = useState("");

  const { record } = useLatestDoctorUseFormVer3(
    selectedPatientDiagnose?.id,
    languageTranslate,
  );

  useEffect(() => {
    if (record?.id && record?.id != idEdit) {
      setIdEdit(record.id);
    }
  }, [record?.id, idEdit]);

  const processedKeyEventIdsRef = useRef(new Set());
  const isEditRef = useRef(false);

  // Lắng nghe BroadcastChannel & postMessage & localStorage từ PACS Viewer khi bấm "Chụp ảnh key"
  useEffect(() => {
    const handleKeyImageMessage = (data) => {
      if (!data || data.type !== "KEY_IMAGE_CAPTURED") return;

      // Chỉ đồng bộ khi bác sĩ đang ở trạng thái sửa (Sửa đọc, Sửa duyệt, Tạo mới / Đang sửa)
      if (!isEditRef.current) return;

      const eventKey =
        data.eventId ||
        `${data.timestamp || ""}_${data.caption || ""}_${data.dataUrl?.slice(-32) || ""}`;
      if (processedKeyEventIdsRef.current.has(eventKey)) {
        return;
      }
      processedKeyEventIdsRef.current.add(eventKey);
      if (processedKeyEventIdsRef.current.size > 50) {
        const firstKey = processedKeyEventIdsRef.current.values().next().value;
        processedKeyEventIdsRef.current.delete(firstKey);
      }

      const incomingId = data.patient_diagnose_id || data.patientDiagnoseId;
      const currentId = patientDiagnose?.id || selectedPatientDiagnose?.id || doctorUseFormVer3Id;
      if (incomingId && currentId && String(incomingId) !== String(currentId)) {
        return;
      }

      if (data.dataUrl) {
        try {
          const fileName = `pacs_key_${Date.now()}.png`;
          const fileObj = dataURLtoFile(data.dataUrl, fileName);

          setImageList((prev) => {
            const currentList = Array.isArray(prev) ? [...prev] : [];
            const emptyIdx = currentList.findIndex(
              (item) => !item.url && !item.rawUrl && !item.file
            );

            const newItem = {
              file: fileObj,
              url: data.dataUrl,
              rawUrl: data.dataUrl,
              caption: data.caption || "Ảnh chụp PACS Viewer",
            };

            if (emptyIdx !== -1) {
              currentList[emptyIdx] = newItem;
              return [...currentList];
            } else {
              return [...currentList, newItem];
            }
          });

          toast.success("Đã đồng bộ ảnh chụp từ PACS Viewer vào Hình ảnh minh họa!");
        } catch (err) {
          console.error("Lỗi khi đồng bộ ảnh key từ PACS:", err);
        }
      }
    };

    let bc;
    try {
      bc = new BroadcastChannel("homecare_pacs_channel");
      bc.onmessage = (event) => {
        handleKeyImageMessage(event.data);
      };
    } catch (e) {
      console.warn("BroadcastChannel not supported", e);
    }

    const onWindowMessage = (event) => {
      handleKeyImageMessage(event.data);
    };
    window.addEventListener("message", onWindowMessage);

    const onStorageChange = (e) => {
      if (e.key === "homecare_pacs_latest_key_image" && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          handleKeyImageMessage(parsed);
        } catch (err) {
          // ignore
        }
      }
    };
    window.addEventListener("storage", onStorageChange);

    return () => {
      if (bc) bc.close();
      window.removeEventListener("message", onWindowMessage);
      window.removeEventListener("storage", onStorageChange);
    };
  }, [patientDiagnose?.id, selectedPatientDiagnose?.id, doctorUseFormVer3Id]);

  // Sync trạng thái từ global context về local state để tránh stale status gây lỗi chuyển trạng thái
  useEffect(() => {
    if (
      selectedPatientDiagnose?.status !== undefined &&
      patientDiagnose?.status !== undefined &&
      selectedPatientDiagnose.status !== patientDiagnose.status
    ) {
      setPatientDiagnose((prev) => {
        if (!prev) return prev;
        return { ...prev, status: selectedPatientDiagnose.status };
      });
    }
  }, [selectedPatientDiagnose?.status]);

  useEffect(() => {
    if (formVer3 && !idEdit) {
      form.setFieldsValue(buildFormVer3Values(formVer3));
      const parsedState = parseImageDescriptionState(formVer3.imageDescription);
      setImagingMode(parsedState.mode);
      setIsFreeText(parsedState.isFreeText);
      setFreeTextContent(parsedState.content);
      setFastSonoData(parsedState.fastSonoData);
      setImagingRows(parsedState.rows);
    }
  }, [formVer3, idEdit]);
  const abnormalFindings = useMemo(() => {
    return imagingRows
      .filter(
        (r) =>
          r.status === "abnormal" &&
          r.description &&
          r.description.trim() !== "",
      )
      .map((r) => r.description.trim());
  }, [imagingRows]);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const [printRes] = await Promise.all([
          API_CALL.get("/print-template", {
            params: {
              page: 1,
              limit: 1000,
              id_clinic: doctor.id_clinic,
            },
          }),
        ]);

        const printData = printRes.data.data?.data || printRes.data.data || [];

        setPrintTemplateList(printData);
      } catch (error) {
        console.error(error);
        toast.error("Không thể tải danh sách template");
      }
    };

    fetchTemplates();
  }, []);

  const checkEnglishVersion = async () => {
    const res = await API_CALL.get("/doctorUseFormVer3", {
      params: {
        id_patient_diagnose: selectedPatientDiagnose?.id,
        language: "en",
        page: 1,
        limit: 1,
      },
    });

    return res?.data?.data?.data || [];
  };

  const selectedTemplateService = useMemo(() => {
    if (!selectedIDs?.id_template_service) return null;
    return templateServices?.find(
      (ts) => Number(ts.id) === Number(selectedIDs.id_template_service),
    );
  }, [selectedIDs.id_template_service, templateServices]);

  const isCanThiepGroup = useMemo(() => {
    return selectedTemplateService?.code
      ? CAN_THIEP_GROUP_CODE.includes(selectedTemplateService.code)
      : false;
  }, [selectedTemplateService]);

  const fetchDataFormver3Names = async () => {
    const data = await API_CALL.get("/formVer3_name", {
      params: {
        id_template_service: selectedIDs.id_template_service,
        id_exam_part: selectedIDs.id_exam_part,
        page: 1,
        limit: 1000,
      },
    });
    const filterDatas = data.data.data.items.filter((item) => {
      return (
        (item.id_template_service == selectedIDs.id_template_service &&
          item.id_exam_part == selectedIDs.id_exam_part &&
          item.isUsed == true &&
          item.isApproved == true) ||
        item.id === 999999
      );
    });

    setFilteredFormVer3Names(filterDatas);
  };
  useEffect(() => {
    try {
      if (!selectedIDs.id_template_service || !selectedIDs.id_exam_part) {
        setFilteredFormVer3Names([]);
      }
      fetchDataFormver3Names();
    } catch (error) {
      console.log("error", error);
      toast.error("Không thể tải danh sách tên mẫu FORM V3`");
    }
  }, [selectedIDs.id_exam_part, selectedIDs.id_template_service]);

  const reloadTemplateAndExamPart = async () => {
    try {
      setReloading(true);

      const [tsRes, epRes] = await Promise.all([
        API_CALL.get("/ts", { params: { page: 1, limit: 1000 } }),
        API_CALL.get("/ts/exam-parts", { params: { page: 1, limit: 1000 } }),
      ]);

      setTemplateServices(tsRes.data.data.data || []);
      setExamParts(epRes.data.data.data || []);
      toast.success("Đã tải lại Phân hệ & Bộ phận");
    } catch (e) {
      toast.error("Không thể tải lại danh sách");
    } finally {
      setReloading(false);
    }
  };

  const onApprove = async () => {
    if (isEdit) {
      toast.warning("Vui lòng lưu lại trước khi phê duyệt");
      return;
    }

    await transitionStatus({
      patientDiagnoseId: patientDiagnose.id,
      newStatus: PATIENT_DIAGNOSE_STATUS_CODE.VERIFIED,
      confirmMessage: "Bạn có chắc chắn muốn phê duyệt kết quả này không?",
      successMessage: "Phê duyệt kết quả thành công",
      localSetState: setPatientDiagnose,
      onStatusChange,
    });
  };

  useEffect(() => {
    const fetchDataFromServerWhenHaveIDs = async () => {
      try {
        setLoading(true);
        const apiCalls = [
          API_CALL.get("/patient-diagnose/" + selectedPatientDiagnose?.id),
        ];
        if (idEdit) {
          apiCalls.push(API_CALL.get("/doctorUseFormVer3/detail/" + idEdit));
        }

        const [diagnoseRes, dradsRes] = await Promise.all(apiCalls);

        const doctorUseFormVer3Server =
          dradsRes?.data?.data?.data || dradsRes?.data?.data || null;
        const patientDiagnoseData =
          diagnoseRes?.data?.data?.data ||
          diagnoseRes?.data?.data ||
          doctorUseFormVer3Server?.id_patient_diagnose_patient_diagnose ||
          null;

        const formValues = buildDradv3FormValues({
          doctorUseFormVer3: doctorUseFormVer3Server,
          patientDiagnose: patientDiagnoseData,
        });

        setSelectedProvince(patientDiagnoseData.province_code);
        setSelectedIDs({
          id_template_service: patientDiagnoseData.id_template_service,
          id_exam_part: patientDiagnoseData.id_exam_part,
          id_formver3_name:
            doctorUseFormVer3Server?.id_formver3_formver3?.id_formver3_name,
        });

        if (!idEdit) {
          setInitialSnap({
            patientDiagnose: patientDiagnoseData,
          });
        }
        if (idEdit) {
          formValues.id_formver3_name =
            doctorUseFormVer3Server?.id_formver3_formver3?.id_formver3_name;
          const descImages =
            doctorUseFormVer3Server.image_doctor_use_form_ver3s
              ?.filter((x) => x.kind == "hinh_anh_mo_ta" || x.kind == "desc") // chỉ lấy ảnh mô tả
              ?.map((x, idx) => ({
                url: x.url,
                caption: x.desc || "",
                rawUrl: x.url,
                file: undefined, // ảnh từ API thì chưa có file local
              })) || [];

          setImageList(descImages);

          const parsedState = parseImageDescriptionState(
            doctorUseFormVer3Server.imageDescription,
          );
          setImagingMode(parsedState.mode);
          setIsFreeText(parsedState.isFreeText);
          setFreeTextContent(parsedState.content);
          setFastSonoData(parsedState.fastSonoData);
          setImagingRows(parsedState.rows);
          setFormVer3(doctorUseFormVer3Server?.id_formver3_formver3);
          setInitialSnap({
            formValues: form.getFieldsValue(),
            apiData: doctorUseFormVer3Server,
            patientDiagnose: patientDiagnoseData,
          });

          if (
            doctorUseFormVer3Server.language &&
            doctorUseFormVer3Server.language !== languageTranslate
          ) {
            setLanguageTransslate(doctorUseFormVer3Server.language);
          }
        }

        setPatientDiagnose(
          patientDiagnoseData ||
            doctorUseFormVer3Server?.id_patient_diagnose_patient_diagnose,
        );

        form.setFieldsValue(formValues);
      } catch (error) {
        console.log(
          "[fetchDataFromServerWhenHaveIDs] error-------",
          error.message || error,
        );
        toast.error("Không thể tải thông tin ca bệnh");
      } finally {
        setLoading(false);
      }
    };

    fetchDataFromServerWhenHaveIDs();
  }, [selectedPatientDiagnose.id, idEdit]);

  useEffect(() => {
    if (
      printTemplateList.length > 0 &&
      !form.getFieldValue("id_print_template")
    ) {
      const firstTpl = printTemplateList[0];
      form.setFieldsValue({ id_print_template: firstTpl.id });
      setPrintTemplate(firstTpl);
    }
  }, [printTemplateList]);

  const pendingAction = useRef(null);

  const [loading, setLoading] = useState();

  const [isEdit, setIsEdit] = useState(initEditMode || !idEdit);

  useEffect(() => {
    isEditRef.current = isEdit;
  }, [isEdit]);

  useEffect(() => {
    setIsEdit(initEditMode || !idEdit);
  }, [initEditMode, idEdit]);

  // Xử lý xác nhận chuyển trạng thái ĐỌC XONG (Tự động Lưu + Đọc xong 1 chạm [Alt+D])
  const handleDocXong = () => {
    if (!patientDiagnose?.id) return;

    if (isEdit) {
      openConfirm({
        title: "Xác nhận đọc xong [Alt+D]",
        message: "Hệ thống sẽ TỰ ĐỘNG LƯU kết quả chẩn đoán và chuyển sang trạng thái ĐỌC XONG. Bạn có muốn tiếp tục?",
        onConfirm: () => {
          pendingAction.current = "SAVE_THEN_READ_DONE";
          form.submit();
        },
      });
    } else {
      openConfirm({
        title: "Xác nhận đọc xong [Alt+D]",
        message: "Bạn có chắc muốn chuyển ca này sang trạng thái ĐỌC XONG?",
        onConfirm: () =>
          transitionStatus({
            patientDiagnoseId: patientDiagnose.id,
            newStatus: PATIENT_DIAGNOSE_STATUS_CODE.READ_DONE,
            successMessage: "Đã chuyển sang trạng thái ĐỌC XONG",
            localSetState: setPatientDiagnose,
            onStatusChange: (status) => {
              onStatusChange && onStatusChange(status);
              if (autoAdvanceNextCase && onNextPatient) {
                setTimeout(() => {
                  onNextPatient();
                }, 400);
              }
            },
          }),
      });
    }
  };

  // Bộ lắng nghe phím tắt toàn cục cho màn hình đọc ca lâm sàng
  useDoctorFormHotkeys({
    onSave: () => {
      if (!isEditRef.current) {
        setIsEdit(true);
        toast.info("Đã bật chế độ chỉnh sửa");
        return;
      }
      pendingAction.current = KEY_ACTION_BUTTON.save;
      form.submit();
    },
    onReadDone: handleDocXong,
    onTogglePreview: () => setPreviewOpen((prev) => !prev),
    onClosePreview: () => setPreviewOpen(false),
    isPreviewOpen: previewOpen,
  });

  const filteredExamParts = useMemo(() => {
    if (!selectedIDs.id_template_service) return [];
    return (examParts || []).filter(
      (p) =>
        Number(p.id_template_service) ===
        Number(selectedIDs.id_template_service),
    );
  }, [examParts, selectedIDs]);

  const handleFormVer3Select = async (id_formver3_name) => {
    try {
      setLoading(true);
      const res = await API_CALL.get(
        `/formVer3?id_formver3_name=${id_formver3_name}`,
      );
      const templateData = res.data?.data?.items?.[0] || res.data?.data?.[0];
      if (templateData) {
        setFormVer3(templateData);
        setSelectedIDs((prev) => ({
          ...prev,
          id_formver3_name: id_formver3_name,
        }));

        form.setFieldsValue(buildFormVer3Values(templateData));

        const parsedState = parseImageDescriptionState(
          templateData.imageDescription,
        );
        setImagingMode(parsedState.mode);
        setIsFreeText(parsedState.isFreeText);
        setFreeTextContent(parsedState.content);
        setFastSonoData(parsedState.fastSonoData);
        setImagingRows(parsedState.rows);
      }
    } catch (e) {
      toast.error("Không tải được dữ liệu. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const onFinish = async (values) => {
    try {
      // Serialize imageDescription theo mode
      let imageDescriptionJson = undefined;
      if (imagingMode === "FAST_SONO") {
        imageDescriptionJson = JSON.stringify({
          isFreeText: true,
          isFastSono: true,
          text: freeTextContent,
          fastSonoData: {
            ...fastSonoData,
            isManualEdited: Boolean(fastSonoData?.isManualEdited),
            plainNarrative: fastSonoData?.plainNarrative || "",
            abnormalCodes: fastSonoData?.abnormalCodes || [],
            conclusionSummary: diagnosisSummary || form.getFieldValue("imagingDiagnosisSummary") || "",
          },
        });
      } else if (imagingMode === "FREE_TEXT") {
        imageDescriptionJson = JSON.stringify({
          isFreeText: true,
          text: freeTextContent,
        });
      }

      const formPayload = buildFormDataDoctorUseFormVer3(values, {
        id_patient_diagnose: patientDiagnose?.id,
        imageList,
        formVer3,
        imagingRows: isFreeText ? undefined : imagingRows,
        abnormalFindings: isFreeText ? [] : abnormalFindings,
        imageDescriptionJson,
      });
      const currentAction = pendingAction.current;
      if (
        currentAction === KEY_ACTION_BUTTON.save ||
        currentAction === KEY_ACTION_BUTTON.save_duyet ||
        currentAction === "SAVE_THEN_READ_DONE"
      ) {
        const res = await API_CALL.postForm(`/doctorUseFormVer3`, formPayload, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        const newData = res?.data?.data || res?.data;

        if (newData?.id) {
          toast.success("Lưu thành công");
          setIdEdit(newData.id);

          setIsEdit(false);
          setInitialSnap({
            formValues: form.getFieldsValue(),
            apiData: newData,
          });

          // Nếu là luồng Tự động Lưu + Đọc xong 1 chạm [Alt+D]
          if (currentAction === "SAVE_THEN_READ_DONE") {
            await transitionStatus({
              patientDiagnoseId: patientDiagnose.id,
              newStatus: PATIENT_DIAGNOSE_STATUS_CODE.READ_DONE,
              successMessage: "Đã lưu kết quả và chuyển sang trạng thái ĐỌC XONG thành công!",
              localSetState: setPatientDiagnose,
              onStatusChange: (status) => {
                onStatusChange && onStatusChange(status);
                if (autoAdvanceNextCase && onNextPatient) {
                  setTimeout(() => {
                    onNextPatient();
                  }, 400);
                }
              },
            });
            return;
          }
        } else {
          toast.warning("Lưu thành công nhưng không nhận được ID");
        }
      }
    } catch (error) {
      toast.error(error.message || error);
    } finally {
      setLoading(false);
      pendingAction.current = null;
    }
  };
  const restoreFromSnapshot = () => {
    openConfirm({
      title: "Xác nhận hoàn tác",
      message: "Toàn bộ dữ liệu sẽ quay về trạng thái gốc từ hệ thống. Bạn có chắc muốn hoàn tác?",
      onConfirm: async () => {
        doRestore();
      },
    });
  };
  const doRestore = () => {
    if (!idEdit) {
      const patientSnap = initialSnap.patientDiagnose;

      if (!patientSnap) {
        toast.error("Không tìm thấy dữ liệu bệnh nhân gốc");
        return;
      }

      // 🔹 rebuild form chỉ từ patient snapshot
      const patientOnlyValues = buildDradv3FormValues({
        patientDiagnose: patientSnap,
        doctorUseFormVer3: null,
      });

      form.resetFields();
      form.setFieldsValue(patientOnlyValues);
      setImageList([{}, {}, {}]);
      setImagingRows(DEFAULT_IMAGING_ROWS);
      setFormVer3(null);
      setSelectedIDs({
        id_template_service: null,
        id_exam_part: null,
        id_formver3_name: null,
      });

      toast.success("Đã reset form tạo mới");
      return;
    }

    if (idEdit && isEdit && initialSnap?.apiData) {
      const apiData = initialSnap.apiData;

      // 🔹 rebuild form values từ API
      const formValues = buildDradv3FormValues({
        doctorUseFormVer3: apiData,
        patientDiagnose:
          apiData.id_patient_diagnose_patient_diagnose || patientDiagnose,
      });

      formValues.id_formver3_name =
        apiData.id_formver3_formver3?.id_formver3_name;

      form.setFieldsValue(formValues);

      try {
        const rows = JSON.parse(apiData.imageDescription || "[]");
        setImagingRows(
          Array.isArray(rows) && rows.length ? rows : DEFAULT_IMAGING_ROWS,
        );
      } catch {
        setImagingRows(DEFAULT_IMAGING_ROWS);
      }

      const descImages =
        apiData.image_doctor_use_form_ver3s
          ?.filter((x) => x.kind === "hinh_anh_mo_ta" || x.kind === "desc")
          ?.map((x) => ({
            url: x.url,
            caption: x.desc || "",
            rawUrl: x.url,
            file: undefined,
          })) || [];

      setImageList(descImages);
      setFormVer3(apiData.id_formver3_formver3);

      setSelectedIDs({
        id_template_service:
          apiData.id_patient_diagnose_patient_diagnose?.id_template_service,
        id_exam_part:
          apiData.id_patient_diagnose_patient_diagnose?.id_exam_part,
        id_formver3_name: apiData.id_formver3_formver3?.id_formver3_name,
      });

      toast.success("Đã hoàn tác về dữ liệu gốc từ hệ thống");
    }
  };

  return (
    <div
      className={styles.doctorFormWrap}
      style={{
        maxWidth: 1100,
        margin: "0 auto",
        padding: isMobile ? "4px 4px 100px" : "30px 0 250px",
      }}
    >
      {loading ? (
        <div style={{ textAlign: "center", padding: 40 }}>
          <Spin />
        </div>
      ) : (
        <Form
          form={form}
          size="small"
          layout="vertical"
          colon={false}
          onFinish={onFinish}
          requiredMark={(label, { required }) =>
            required ? (
              <span>
                {label}
                <span style={{ color: "red", marginLeft: 4 }}>*</span>
              </span>
            ) : (
              label
            )
          }
          initialValues={{
            language: "vi",
            doctor_name: doctor?.full_name,
            benh_nhan_quoc_tich: "Việt Nam",
          }}
          onValuesChange={(_, allValues) => {
            onFormChange?.({
              ...allValues,
            });
          }}
        >
          {/* <Title level={4} style={{ color: "#2f6db8", margin: "24px 0 16px" }}>
            {translateLabel(languageTranslate, "administrativeInfo")}
          </Title>

          {isUse && (
            <PatientInfoSection
              form={form}
              languageTranslate={languageTranslate}
              isEdit={isEdit}
              provinces={provinces}
              wards={wards}
              setSelectedProvince={setSelectedProvince}
              translateLabel={translateLabel}
            />
          )}
          <Divider /> */}

          {/* 1. Khối thông tin 3 dạng Bác sĩ trong ca (Bác sĩ đọc, Bác sĩ hội chẩn, Bác sĩ duyệt) */}
          <CaseDoctorsSection
            readingDoctor={readingDoctor}
            consultingDoctor={consultingDoctor}
            verifyDoctor={verifyDoctor}
            isMobile={isMobile}
          />

          {/* 2. Khối Kỹ thuật thực hiện */}
          <ProcedureSection
            form={form}
            isEdit={isEdit}
            isMobile={isMobile}
            languageTranslate={languageTranslate}
            translateLabel={translateLabel}
            reloading={reloading}
            onReload={() => {
              reloadTemplateAndExamPart();
              if (selectedIDs.id_template_service && selectedIDs.id_exam_part) {
                fetchDataFormver3Names();
              }
            }}
            templateServices={templateServices}
            sortTemplateServices={sortTemplateServices}
            getServiceLabel={getServiceLabel}
            selectedIDs={selectedIDs}
            setSelectedIDs={setSelectedIDs}
            filteredExamParts={filteredExamParts}
            setFilteredFormVer3Names={setFilteredFormVer3Names}
            filteredFormVer3Names={filteredFormVer3Names}
            imagingMode={imagingMode}
            patientDiagnose={patientDiagnose}
            idEdit={idEdit}
            printTemplateList={printTemplateList}
            setPrintTemplate={setPrintTemplate}
            onFormVer3Select={handleFormVer3Select}
            LANGUAGE_OPTIONS={LANGUAGE_OPTIONS}
          />
          <AdvancedSampleSection
            isEdit={isEdit}
            isAdvanceSample={false}
            languageTranslate={languageTranslate}
          />

          <ImagingFindingsSection
            isMobile={isMobile}
            isEdit={isEdit}
            isCanThiepGroup={isCanThiepGroup}
            languageTranslate={languageTranslate}
            translateLabel={translateLabel}
            imagingMode={imagingMode}
            setImagingMode={setImagingMode}
            setIsFreeText={setIsFreeText}
            freeTextContent={freeTextContent}
            setFreeTextContent={setFreeTextContent}
            generateTextFromStructuredRows={generateTextFromStructuredRows}
            imagingRows={imagingRows}
            setImagingRows={setImagingRows}
            selectedIDs={selectedIDs}
            form={form}
            examParts={examParts}
            templateServices={templateServices}
            patientDiagnose={patientDiagnose}
            fastSonoData={fastSonoData}
            setFastSonoData={setFastSonoData}
            setDiagnosisSummary={setDiagnosisSummary}
            abnormalFindings={abnormalFindings}
          />

          <ImagingDiagnosisSection
            isEdit={isEdit}
            form={form}
            languageTranslate={languageTranslate}
            translateLabel={translateLabel}
            setDiagnosisSummary={setDiagnosisSummary}
            diagnosisSummary={diagnosisSummary}
          />

          <IllustrativeImagesSection
            isMobile={isMobile}
            isEdit={isEdit}
            languageTranslate={languageTranslate}
            translateLabel={translateLabel}
            patientDiagnose={patientDiagnose}
            selectedPatientDiagnose={selectedPatientDiagnose}
            imageList={imageList}
            setImageList={setImageList}
          />

          {/* Tùy chọn Tự động chuyển ca tiếp theo */}
          {onNextPatient && (
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
                marginBottom: 10,
                padding: "6px 12px",
                background: "#f8fafc",
                borderRadius: 6,
                border: "1px dashed #cbd5e1",
              }}
            >
              <Checkbox
                checked={autoAdvanceNextCase}
                onChange={(e) => handleToggleAutoAdvance(e.target.checked)}
                style={{ fontSize: 13, color: "#1e293b", fontWeight: 500 }}
              >
                ⏭ Tự động chuyển sang ca chờ đọc tiếp theo sau khi [Đọc xong]
              </Checkbox>
            </div>
          )}

          {/* Action bar */}
          {
            <FormActionBar
              patientDiagnose={patientDiagnose}
              languageTranslate={languageTranslate}
              onSign={() => setSignModalOpen(true)}
              onConsultation={onOpenConsultation}
              onTuChoiConsultation={async () => {
                openConfirm({
                  title: "Xác nhận từ chối hội chẩn",
                  message: "Bạn có chắc muốn từ chối hội chẩn? Nếu từ chối, ca sẽ rollback về trạng thái ĐANG ĐỌC của Bác sĩ chính.",
                  onConfirm: () =>
                    transitionStatus({
                      patientDiagnoseId: patientDiagnose.id,
                      newStatus: PATIENT_DIAGNOSE_STATUS_CODE.IN_PROCESSING,
                      successMessage: "Từ chối hội chẩn thành công",
                      localSetState: setPatientDiagnose,
                      onStatusChange,
                      additionalPayload: { is_consultation_reject: true },
                    }),
                });
              }}
              onPrint={() => {
                printSourceRef.current = "manual";

                setPreviewOpen(true);

                setTimeout(() => {
                  if (printRef.current) {
                    handlePrint(printRef);
                  }
                }, 300);
              }}
              onExit={() => {
                setSelectedPatientDiagnose(null);
              }}
              onApprove={onApprove}
              onAction={(key) => {
                openConfirm({
                  title: "Xác nhận lưu",
                  message: "Bạn có chắc muốn lưu lại dữ liệu không?",
                  onConfirm: async () => {
                    pendingAction.current = key;
                    form.submit();
                  },
                });
              }}
              onReset={restoreFromSnapshot}
              onPreview={() => setPreviewOpen(!previewOpen)}
              isEdit={isEdit}
              onEdit={async () => {
                setIsEdit(!isEdit);
                if (
                  patientDiagnose?.status ===
                  PATIENT_DIAGNOSE_STATUS_CODE.READ_DONE
                ) {
                  await transitionStatus({
                    patientDiagnoseId: patientDiagnose.id,
                    newStatus: PATIENT_DIAGNOSE_STATUS_CODE.IN_PROCESSING,
                    successMessage: "Đã chuyển sang trạng thái ĐANG ĐỌC",
                    localSetState: setPatientDiagnose,
                    onStatusChange,
                  });
                }
              }}
              onEditDuyet={async () => {
                setIsEdit(!isEdit);
                if (
                  patientDiagnose?.status ===
                  PATIENT_DIAGNOSE_STATUS_CODE.VERIFIED
                ) {
                  await transitionStatus({
                    patientDiagnoseId: patientDiagnose.id,
                    newStatus: PATIENT_DIAGNOSE_STATUS_CODE.WAIT_VERIFY,
                    successMessage: null,
                    localSetState: setPatientDiagnose,
                    onStatusChange,
                  });
                }
              }}
              editId={idEdit}
              onDocXong={handleDocXong}
              onHuyDoc={async () => {
                const newStatus = patientDiagnose.id_consulting_doctor
                  ? PATIENT_DIAGNOSE_STATUS_CODE.CONSULTATION
                  : PATIENT_DIAGNOSE_STATUS_CODE.NEW;

                const newStatusLabel = newStatus === PATIENT_DIAGNOSE_STATUS_CODE.CONSULTATION ? "Hội Chẩn" : "Mới";

                openConfirm({
                  title: "Xác nhận hủy đọc",
                  message: `Bạn có chắc muốn chuyển về trạng thái ${newStatusLabel}?`,
                  onConfirm: () =>
                    transitionStatus({
                      patientDiagnoseId: patientDiagnose.id,
                      newStatus,
                      successMessage: `Đã về trạng thái ${newStatusLabel}`,
                      localSetState: setPatientDiagnose,
                      onStatusChange,
                    }),
                });
              }}
              onNhanDuyet={async () => {
                await transitionStatus({
                  patientDiagnoseId: patientDiagnose.id,
                  newStatus: PATIENT_DIAGNOSE_STATUS_CODE.WAIT_VERIFY,
                  successMessage: null,
                  localSetState: setPatientDiagnose,
                  onStatusChange,
                });
              }}
              onHuyDuyet={async () => {
                await transitionStatus({
                  patientDiagnoseId: patientDiagnose.id,
                  newStatus: PATIENT_DIAGNOSE_STATUS_CODE.READ_DONE,
                  successMessage: null,
                  localSetState: setPatientDiagnose,
                  onStatusChange,
                });
              }}
              onTraCa={async () => {
                openConfirm({
                  title: "Xác nhận trả ca",
                  message: "Bạn có chắc chắn muốn từ chối duyệt và trả ca này về trạng thái Đang đọc?",
                  onConfirm: () =>
                    transitionStatus({
                      patientDiagnoseId: patientDiagnose.id,
                      newStatus: PATIENT_DIAGNOSE_STATUS_CODE.IN_PROCESSING,
                      successMessage: "Đã trả ca về trạng thái ĐANG ĐỌC",
                      localSetState: setPatientDiagnose,
                      onStatusChange,
                    }),
                });
              }}
              onTranslate={async () => {
                if (!idEdit) {
                  toast.warning("Chưa có form để dịch");
                  return;
                }

                try {
                  setLoading(true);
                  const enRecords = await checkEnglishVersion();
                  setLoading(false);

                  const doTranslate = async () => {
                    try {
                      setLoading(true);
                      const res = await API_CALL.post(
                        `/doctorUseFormVer3/${idEdit}/translate`,
                      );
                      const newRecord = res?.data?.data || res?.data;
                      toast.success(
                        "Tạo bản dịch tiếng Anh thành công. Vui lòng vào phần Các Bản Dịch để kiểm tra",
                      );
                      console.log(
                        "newRecord.language",
                        newRecord.language,
                        newRecord.id,
                      );
                      setIdEdit(newRecord.id);
                      toast.success("qua");
                    } catch (error) {
                      console.error("[translate] error", error);
                      toast.error(
                        error?.response?.data?.message ||
                          "Không thể tạo bản dịch tiếng Anh",
                      );
                    } finally {
                      setLoading(false);
                    }
                  };

                  if (enRecords.length > 0) {
                    openConfirm({
                      title: "Xác nhận tạo bản dịch",
                      message:
                        "Đã tồn tại bản dịch tiếng Anh.\n\n" +
                        "Bạn có thể xem trong mục 'CÁC BẢN DỊCH'.\n\n" +
                        "Bạn có muốn tạo thêm một bản dịch mới không?",
                      onConfirm: doTranslate,
                    });
                  } else {
                    openConfirm({
                      title: "Xác nhận dịch",
                      message: "Bạn có chắc chắn muốn tạo bản dịch tiếng Anh cho kết quả này không?",
                      onConfirm: doTranslate,
                    });
                  }
                } catch (error) {
                  console.error("[translate] error", error);
                  toast.error(
                    error?.response?.data?.message ||
                      "Không thể tạo bản dịch tiếng Anh",
                  );
                  setLoading(false);
                }
              }}
              // onTranslateMulti={({ targetLang, sourceLang }) =>
              //   handleTranslateToLanguage({
              //     setLanguageTransslate,
              //     form,
              //     setLoading,

              //     initialSnap,
              //     doctor,
              //     imageList,
              //     setImageList,

              //     toast,
              //     idEdit,
              //     setIdEdit,
              //     navigate,
              //     targetLang: targetLang,
              //     sourceLang: sourceLang,
              //   })
              // }
            />
          }
          <VoiceCursorDictation form={form} isMobile={isMobile} />
        </Form>
      )}

      <SmartCASignModal
        open={signModalOpen}
        onClose={() => setSignModalOpen(false)}
        id_doctor_use_form_ver3={idEdit}
      />

      <PrintPreviewModal
        open={previewOpen}
        onCancel={() => setPreviewOpen(false)}
        isMobile={isMobile}
        printRef={printRef}
        printSourceRef={printSourceRef}
        is_print={is_print}
        handlePrint={handlePrint}
        status={status}
        imagingRows={imagingRows}
        isFreeText={isFreeText}
        freeTextContent={freeTextContent}
        form={form}
        initialSnap={initialSnap}
        examParts={examParts}
        templateServices={templateServices}
        idEdit={idEdit}
        imageList={imageList}
        isUse={isUse}
        printTemplateList={printTemplateList}
        printTemplate={printTemplate}
        languageTranslate={languageTranslate}
        setPreviewOpen={setPreviewOpen}
        patientDiagnose={patientDiagnose}
      />
      <ConfirmActionModal {...confirmState} />
    </div>
  );
}
