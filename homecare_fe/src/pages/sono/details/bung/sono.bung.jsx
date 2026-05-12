import React, { useState, useRef, useEffect } from "react";
import {
  Select,
  InputNumber,
  Button,
  Card,
  Row,
  Col,
  Radio,
  Divider,
  Form,
  Spin,
  Modal,
} from "antd";
import { BUNG_STRUCTURE_OPTIONS } from "./bung.constants";
import API_CALL from "../../../../services/axiosClient";
import { toast } from "react-toastify";
import { TUYEN_GIAP_STRUCTURE_OPTIONS } from "../tuyengiap/tuyengiap.constants";
import { TUYEN_VU_STRUCTURE_OPTIONS } from "../tuyenvu/tuyenvu.constants";
import {
  getExamPartSono,
  getSonoTemplateService,
  TRANSLATE_LANGUAGE,
  translateLabel,
  USER_ROLE,
} from "../../../../constant/app";
import useVietnamAddress from "../../../../hooks/useVietnamAddress";
import PatientInfoSection from "../../../doctor_use_form_ver2/use/items/PatientInfoForm";
import FormActionBar, {
  KEY_ACTION_BUTTON,
} from "../../../formver2/component/FormActionBar";
import { useGlobalAuth } from "../../../../contexts/AuthContext";
import { useNavigate, useParams } from "react-router-dom";
import PreviewSono from "../../preview/PreviewSono";
import { LANGUAGE_OPTIONS } from "../../../doctor_use_form_ver2/use/DoctorIUseFormVer2";
import { ThamKhaoLinkHomeCare } from "../../../advance/component_common/Thamkhao";
import { Grid } from "antd";
import SmartCASignModal from "../../../doctor_use_form_ver2/SmartCASignModal/SmartCASignModal";
import { calculateAge } from "../../../formver3/formver3.constant";
const { useBreakpoint } = Grid;
const { Option } = Select;

export const SONO_STATUS = {
  PENDING: "draft",
  APPROVED: "approved",
};

const FIELD1_OPTIONS = [
  "Bụng tổng quát",
  "Tuyến giáp và vùng cổ",
  "Tuyến vú và hố nách",
];

const groupConclusionsByField = (list = []) => {
  const grouped = {};

  list.forEach((item) => {
    if (!grouped[item.field1]) grouped[item.field1] = [];
    grouped[item.field1].push(item);
  });

  return grouped;
};

const UltrasoundBungForm = () => {
  const navigate = useNavigate();
  const { id, patient_diagnose_id } = useParams();
  const [form] = Form.useForm();
  const { doctor, user, printTemplateGlobal, examParts, templateServices } =
    useGlobalAuth();
  const [idExamPart, setIdExamPart] = useState(null);
  const [sonoTemplateService, setSonoTemplateService] = useState(null);
  const [sonoExamParts, setSonoExamParts] = useState([]);
  const [field1, setField1] = useState(null);
  const [signModalOpen, setSignModalOpen] = useState(false);

  const screens = useBreakpoint();

  const deviceIsMobile = !screens.md;
  const formItemLayout = {
    layout: deviceIsMobile ? "vertical" : "horizontal",
    labelCol: {
      xs: { span: 24 },
      md: { span: 8 },
    },
    wrapperCol: {
      xs: { span: 24 },
      md: { span: 16 },
    },
  };

  useEffect(() => {
    const sonoTemplateServiceDB = getSonoTemplateService(
      templateServices || [],
    );
    setSonoTemplateService(sonoTemplateServiceDB);
    const sonoExamPartsDB = getExamPartSono(examParts, sonoTemplateServiceDB);
    setSonoExamParts(sonoExamPartsDB);
  }, [examParts, templateServices]);

  const [idPatientDiagnose, setIdPatientDiagnose] =
    useState(patient_diagnose_id);

  // current selected field1

  // rowsByField: mỗi field1 có một bộ rows riêng
  const [rowsByField, setRowsByField] = useState({
    [FIELD1_OPTIONS[0]]: [],
    [FIELD1_OPTIONS[1]]: [],
    [FIELD1_OPTIONS[2]]: [],
  });

  // rows: shortcut cho workspace hiện tại (rowsByField[field1])
  const [rows, setRows] = useState([]);

  // final conclusions
  const [list, setList] = useState([]);

  const [loadingAI, setLoadingAI] = useState(false);
  const [isEdit, setIsEdit] = useState(true);
  const [isApproved, setIsApproved] = useState(false);
  const [printTemplate, setPrintTemplate] = useState(null);
  const [initialSnap, setInitialSnap] = useState({});
  const [patientDiagnoseInitial, setPatientDiagnoseInitial] = useState(null);
  const [idEdit, setIdEdit] = useState(id);
  const [openPreview, setOpenPreview] = useState(false);
  const [patientDiagnose, setPatientDiagnose] = useState(null);

  // voice
  const recognitionRef = useRef(null);
  const [voiceList, setVoiceList] = useState([]);
  const [isRecording, setIsRecording] = useState(false);

  // address
  const { provinces, wards, setSelectedProvince } = useVietnamAddress();

  // ========= Helper: determine STRUCT by field1 =========
  const getSTRUCT = (f) =>
    f === FIELD1_OPTIONS[0]
      ? BUNG_STRUCTURE_OPTIONS
      : f === FIELD1_OPTIONS[1]
        ? TUYEN_GIAP_STRUCTURE_OPTIONS
        : TUYEN_VU_STRUCTURE_OPTIONS;

  // ========= map server data into form and rowsByField =========
  const mapSonoDataToForm = (data) => {
    let parsed = {};

    try {
      parsed = JSON.parse(data.ket_qua_chan_doan || "{}");
    } catch {
      parsed = {};
    }

    // Field hiện tại
    const f1 = parsed.field1 || FIELD1_OPTIONS[0];
    setField1(f1);

    setList(Array.isArray(parsed.list) ? parsed.list : []);
    form.setFieldsValue({ field_1: f1 });

    // Parse full rowsByField
    const fullRows = parsed.rowsByField || {
      "Bụng tổng quát": [],
      "Tuyến giáp và vùng cổ": [],
      "Tuyến vú và hố nách": [],
    };

    setRowsByField(fullRows);

    // Set rows theo field hiện tại
    setRows(fullRows[f1] || []);

    // Set form fields khác
    form.setFieldsValue({
      ...data,
      id_print_template: data.id_print_template,
    });

    if (data.id_patient_diagnose)
      setIdPatientDiagnose(data.id_patient_diagnose);
  };

  useEffect(() => {
    if (!id) return;
    const fetchDetail = async () => {
      try {
        setLoadingAI(true);
        const res = await API_CALL.get(`/sono/${id}`);
        const data = res.data.data.data;
        setInitialSnap(data);
        setIdEdit(id);
        mapSonoDataToForm(data);
      } catch (err) {
        console.error(err);
        toast.error("Không tải được chi tiết phiếu siêu âm!");
      } finally {
        setLoadingAI(false);
      }
    };
    fetchDetail();
    // eslint-disable-next-line
  }, [id]);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const [diagnoseRes, sonoRes] = await Promise.all([
          API_CALL.get("/patient-diagnose/" + idPatientDiagnose, {}),
          id ? API_CALL.get("/sono/" + id) : Promise.resolve(null),
        ]);

        const patientDiagnose =
          diagnoseRes.data.data?.data || diagnoseRes.data.data || [];
        const sonoDetail = sonoRes?.data?.data?.data || null;

        const formValues = {
          benh_nhan_ho_ten:
            sonoDetail?.benh_nhan_ho_ten || patientDiagnose.name,
          benh_nhan_gioi_tinh:
            sonoDetail?.benh_nhan_gioi_tinh || patientDiagnose.gender,
          benh_nhan_tuoi:
            sonoDetail?.benh_nhan_tuoi ||
            calculateAge(patientDiagnose.dob, patientDiagnose.birth_year),
          benh_nhan_quoc_tich:
            sonoDetail?.benh_nhan_quoc_tich || patientDiagnose.countryCode,
          benh_nhan_dien_thoai:
            sonoDetail?.benh_nhan_dien_thoai || patientDiagnose.phoneNumber,
          benh_nhan_email: sonoDetail?.benh_nhan_email || patientDiagnose.email,
          benh_nhan_pid: sonoDetail?.benh_nhan_pid || patientDiagnose.PID,
          benh_nhan_sid: sonoDetail?.benh_nhan_sid || patientDiagnose.SID,
          benh_nhan_lam_sang:
            sonoDetail?.benh_nhan_lam_sang || patientDiagnose.Indication,
          benh_nhan_dia_chi_so_nha:
            sonoDetail?.benh_nhan_dia_chi_so_nha || patientDiagnose.address,
          benh_nhan_dia_chi_xa_phuong:
            sonoDetail?.benh_nhan_dia_chi_xa_phuong ||
            patientDiagnose.ward_code,
          benh_nhan_dia_chi_tinh_thanh_pho:
            sonoDetail?.benh_nhan_dia_chi_tinh_thanh_pho ||
            patientDiagnose.province_code,
        };

        setSelectedProvince(formValues.benh_nhan_dia_chi_tinh_thanh_pho);
        setPatientDiagnose(sonoDetail || patientDiagnose);
        setPatientDiagnoseInitial(formValues);

        setIsApproved(
          sonoDetail?.status === SONO_STATUS.APPROVED ? true : false,
        );
        setIdExamPart(
          sonoDetail?.id_exam_part || patientDiagnose?.id_exam_part,
        );

        // 4. Đưa dữ liệu vào form
        form.setFieldsValue(formValues);

        console.log("Dữ liệu hiển thị Form:", formValues);
      } catch (error) {
        console.error(error);
        toast.error("Không thể tải thông tin ca bệnh");
      }
    };

    if (idPatientDiagnose) fetchTemplates();
  }, [idPatientDiagnose, id]);

  useEffect(() => {
    const printT = printTemplateGlobal.find(
      (t) => t.id == initialSnap.id_print_template,
    );
    setPrintTemplate(printT);
    form.setFieldsValue({
      id_print_template: printT?.id || null,
    });
  }, [printTemplateGlobal, initialSnap]);

  // init speech recognition if supported
  if (
    !recognitionRef.current &&
    typeof window !== "undefined" &&
    "webkitSpeechRecognition" in window
  ) {
    const recog = new window.webkitSpeechRecognition();
    recog.continuous = true;
    recog.interimResults = false;
    recog.lang = "vi-VN";
    recognitionRef.current = recog;
  }

  // ---------- VOICE ----------
  const startVoice = () => {
    const recognition = recognitionRef.current;
    if (!recognition) {
      toast.error("Trình duyệt không hỗ trợ giọng nói");
      return;
    }
    setIsRecording(true);
    setVoiceList([]);
    recognition.start();
    recognition.onresult = (event) => {
      const text = event.results[event.results.length - 1][0].transcript;
      setVoiceList((prev) => [...prev, text]);
    };
  };

  const stopVoice = () => {
    const recognition = recognitionRef.current;
    if (!recognition) return;
    recognition.stop();
    setIsRecording(false);
  };

  const analyzeVoice = async () => {
    if (voiceList.length === 0) return toast.warning("Chưa có nội dung!");
    const finalText = voiceList.join(". ");
    try {
      setLoadingAI(true);
      toast.loading("Đang phân tích giọng nói...", { autoClose: 1200 });
      const res = await API_CALL.post(
        "/sono/analyze",
        { text: finalText },
        { timeout: 120000 },
      );
      const aiData = res.data?.data?.data || res.data?.data || [];
      const mapped = aiData.map((item) => ({
        field1: item.field1 || field1,
        structure: item.structure,
        status: item.status,
        position: item.position,
        size: item.size ? `${item.size} mm` : null,
        text: `${item.structure} – ${item.status}${
          item.position ? " – " + item.position : ""
        }${item.size ? ` – (${item.size} mm)` : ""}`,
      }));

      // Merge AI results into list (auto add/update)
      mapped.forEach((m) => {
        addOrUpdateListItem(m.structure, m.status, m.position, m.size);
      });

      toast.success("Phân tích AI thành công!");
    } catch (err) {
      console.error(err);
      toast.error("AI không phân tích được!");
    } finally {
      setLoadingAI(false);
    }
  };

  // ---------- Workspace logic: init workspace when selecting field1 ----------
  const initWorkspaceForField = (f) => {
    const STRUCT = getSTRUCT(f) || {};
    const parents = Object.keys(STRUCT).map((structureKey) => ({
      structure: structureKey,
      statuses: ["Không thấy bất thường"],
      children: [
        { status: "Không thấy bất thường", position: null, size: null },
      ],
    }));
    setRowsByField((prev) => ({ ...prev, [f]: parents }));
    setRows(parents);
  };

  const handleReset = () => {
    if (
      !window.confirm(
        "Bạn có chắc chắn muốn reset dữ liệu siêu âm về trạng thái ban đầu không?",
      )
    ) {
      return;
    }

    // ===============================
    // CASE 1: EDIT → reset về DB
    // ===============================
    if (idEdit && initialSnap?.ket_qua_chan_doan) {
      mapSonoDataToForm(initialSnap);
      setVoiceList([]);
      return;
    }

    // ===============================
    // CASE 2: CREATE nhưng CÓ patient_diagnose_id
    // → giữ thông tin bệnh nhân
    // ===============================
    if (!idEdit && idPatientDiagnose) {
      const defaultField = field1 || FIELD1_OPTIONS[0];
      const STRUCT = getSTRUCT(defaultField);

      const emptyRows = Object.keys(STRUCT).map((key) => ({
        structure: key,
        statuses: ["Không thấy bất thường"],
        children: [
          { status: "Không thấy bất thường", position: null, size: null },
        ],
      }));

      form.setFieldsValue({
        ...patientDiagnoseInitial,
        field_1: defaultField,
        id_template_service: "D-SONO",
        language: "vi",
      });

      setList([]);
      setRows(emptyRows);
      setRowsByField((prev) => ({
        ...prev,
        [defaultField]: emptyRows,
      }));
      setVoiceList([]);

      return;
    }

    // ===============================
    // CASE 3: CREATE + KHÔNG patient
    // ===============================
    form.resetFields();
    setList([]);
    setRows([]);
    setRowsByField({
      [FIELD1_OPTIONS[0]]: [],
      [FIELD1_OPTIONS[1]]: [],
      [FIELD1_OPTIONS[2]]: [],
    });
    setVoiceList([]);
  };

  const handleField1Change = (val) => {
    setField1(val);
    form.setFieldsValue({ field_1: val });

    // Nếu field đã có dữ liệu → load lại
    const existing = rowsByField[val];
    if (existing && existing.length > 0) {
      setRows(existing);
    } else {
      // tạo mới theo cấu trúc
      const STRUCT = getSTRUCT(val);
      const newRows = Object.keys(STRUCT).map((key) => ({
        structure: key,
        statuses: ["Không thấy bất thường"],
        children: [
          { status: "Không thấy bất thường", position: null, size: null },
        ],
      }));

      setRows(newRows);

      setRowsByField((prev) => ({
        ...prev,
        [val]: newRows,
      }));
    }
  };

  // ---------- list utilities (conclusions) ----------
  const addOrUpdateListItem = (structure, status, position, size) => {
    setList((prev) => {
      const idx = prev.findIndex(
        (it) => it.structure === structure && it.status === status,
      );
      const text = `Hình ảnh siêu âm ${field1 || ""}   ${status}${
        position ? ` tại ${position}` : ""
      }`;
      if (idx === -1) {
        return [
          ...prev,
          {
            id: Date.now().toString() + Math.random(),
            field1,
            structure,
            status,
            position,
            size,
            text,
          },
        ];
      } else {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], position, size, text };
        return updated;
      }
    });
  };

  const removeListItemByKey = (structure, status) => {
    setList((prev) =>
      prev.filter(
        (it) => !(it.structure === structure && it.status === status),
      ),
    );
  };

  // ---------- rows mutation helpers: every mutation must update rows and rowsByField ----------
  const commitRowsUpdate = (updatedRows) => {
    setRows(updatedRows);
    setRowsByField((prev) => ({
      ...prev,
      [field1]: updatedRows,
    }));
  };
  // parent status change: selectedStatuses is array
  const onStatusChange = (selectedStatuses, parentIndex) => {
    const NORMAL = "Không thấy bất thường";
    if (selectedStatuses.includes(NORMAL) && selectedStatuses.length > 1) {
      selectedStatuses = selectedStatuses.filter((s) => s !== NORMAL);
    }

    if (selectedStatuses.length === 0) {
      selectedStatuses = [NORMAL];
    }

    const updated = [...rows];
    const parent = { ...updated[parentIndex] };
    const oldStatuses = parent.statuses || [];

    parent.statuses = selectedStatuses;

    // preserve child data if status existed previously
    parent.children = selectedStatuses.map((st) => {
      const oldChild = (parent.children || []).find((c) => c.status === st);
      return oldChild
        ? { ...oldChild }
        : { status: st, position: null, size: null };
    });

    updated[parentIndex] = parent;
    commitRowsUpdate(updated);

    // sync list
    selectedStatuses.forEach((st) => {
      const exists = list.some(
        (item) => item.structure === parent.structure && item.status === st,
      );
      if (!exists) addOrUpdateListItem(parent.structure, st, null, null);
    });

    // remove list items for statuses unselected
    oldStatuses
      .filter((st) => !selectedStatuses.includes(st))
      .forEach((removedStatus) => {
        removeListItemByKey(parent.structure, removedStatus);
      });
  };

  // update child value (position/size) -> auto update list
  const updateChild = (pIdx, cIdx, field, value) => {
    const updated = [...rows];
    const parent = { ...updated[pIdx] };
    const child = { ...parent.children[cIdx], [field]: value };
    parent.children[cIdx] = child;
    updated[pIdx] = parent;
    commitRowsUpdate(updated);

    // update list item for this child
    addOrUpdateListItem(
      parent.structure,
      child.status,
      child.position,
      child.size,
    );
  };

  // change structure value for a parent slot (keeps statuses/children cleared)
  const changeParentStructure = (pIdx, newStructure) => {
    const updated = [...rows];
    updated[pIdx] = {
      structure: newStructure,
      statuses: ["Không thấy bất thường"],
      children: [
        { status: "Không thấy bất thường", position: null, size: null },
      ],
    };
    commitRowsUpdate(updated);
  };

  // remove parent and associated list items
  const removeParent = (pIdx) => {
    const toRemove = rows[pIdx];
    if (toRemove && toRemove.statuses) {
      toRemove.statuses.forEach((st) =>
        removeListItemByKey(toRemove.structure, st),
      );
    }
    const updated = rows.filter((_, i) => i !== pIdx);
    commitRowsUpdate(updated);
  };

  // remove single list item from conclusion panel (also unselect status in parent)
  const removeListItem = (index) => {
    const item = list[index];
    if (!item) return;

    // 1) Remove from LIST
    setList((prev) => prev.filter((_, i) => i !== index));

    // 2) Remove from đúng rowsByField của field1 item
    setRowsByField((prev) => {
      const copy = { ...prev };
      const rowsOfField = [...copy[item.field1]];

      const pIdx = rowsOfField.findIndex((p) => p.structure === item.structure);

      if (pIdx !== -1) {
        rowsOfField[pIdx].statuses = rowsOfField[pIdx].statuses.filter(
          (s) => s !== item.status,
        );

        rowsOfField[pIdx].children = rowsOfField[pIdx].children.filter(
          (c) => c.status !== item.status,
        );
      }

      copy[item.field1] = rowsOfField;
      return copy;
    });

    // 3) Nếu item nằm ở field1 hiện tại → cập nhật rows hiển thị
    if (item.field1 === field1) {
      const newRows = rows.filter(
        (p) =>
          !(p.structure === item.structure && p.statuses.includes(item.status)),
      );
      setRows(newRows);
    }
  };

  // Save logic
  const handleSave = async (status = SONO_STATUS.PENDING) => {
    try {
      setLoadingAI(true);
      const values = await form.validateFields();
      const payload = {
        ...values,
        status: status,
        ket_qua_chan_doan: JSON.stringify({
          field1,
          rowsByField,
          list,
        }),
        id: idEdit,
        id_patient_diagnose: idPatientDiagnose,
      };

      const res = await API_CALL.post("/sono", payload);

      if (status === SONO_STATUS.APPROVED) {
        setInitialSnap({});
        setIdEdit(null);
        navigate(`/home/sono/bung`);
        return;
      }

      setInitialSnap(res.data.data.data);
      const newId = +res.data.data.data.id;
      setIdEdit(newId);
      toast.success("Lưu thành công!");
      navigate(`/home/sono/bung/${newId}`);
    } catch (err) {
      console.error(err);
      toast.error("Lưu thất bại! Vui lòng kiểm tra lại thông tin nhập");
    } finally {
      setLoadingAI(false);
    }
  };

  // determine STRUCT by current field1 (cached)
  const [STRUCT, setSTRUCT] = useState({});

  useEffect(() => {
    if (!field1) return;

    const struct = getSTRUCT(field1);
    setSTRUCT(struct);

    const existing = rowsByField[field1];
    if (!existing || existing.length === 0) {
      initWorkspaceForField(field1);
    } else {
      setRows(existing);
    }
  }, [field1]);

  useEffect(() => {
    const checkF1 = sonoExamParts.find((s) => s.id == idExamPart)?.name;
    console.log("checkF1", checkF1);
    if (checkF1) {
      form.setFieldsValue({
        id_template_service: "D-SONO",
        language: "vi",
        field_1: checkF1,
      });
      setField1(checkF1);
    } else {
      const defaultField = FIELD1_OPTIONS[0];
      setField1(defaultField);
      const existing = rowsByField[defaultField];
      if (!existing || existing.length === 0)
        initWorkspaceForField(defaultField);
      else setRows(existing);
      form.setFieldsValue({
        field_1: defaultField,
        id_template_service: "D-SONO",
        language: "vi",
      });
    }
  }, [idExamPart, sonoExamParts]);

  // ---------- Render ----------
  return (
    <div
      style={{
        maxWidth: 1100,
        margin: "0 auto",
        padding: 0,
      }}
    >
      <Form
        form={form}
        layout="horizontal"
        labelAlign="left"
        labelCol={{ flex: "0 0 180px" }}
        wrapperCol={{ flex: "1 0 0" }}
        colon={false}
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
          id_template_service: "D-SONO",
          language: "vi",
        }}
      >
        <Card styles={{ body: { padding: deviceIsMobile ? 5 : 24 } }}>
          <ThamKhaoLinkHomeCare
            name={"D-SONO"}
            title={"BÁO CÁO KẾT QUẢ SIÊU ÂM THÔNG MINH"}
            isMobile={deviceIsMobile}
          />

          <PatientInfoSection
            form={form}
            isEdit={isEdit}
            languageTranslate={TRANSLATE_LANGUAGE.VI}
            provinces={provinces}
            wards={wards}
            setSelectedProvince={setSelectedProvince}
            translateLabel={translateLabel}
            isMobile={deviceIsMobile}
            isApproved={isApproved}
          />

          <Row gutter={[24, deviceIsMobile ? 0 : 24]} justify={"space-between"}>
            <Col xs={24} md={8}>
              <Form.Item
                {...formItemLayout}
                label={"Phân hệ"}
                name="id_template_service"
                rules={[{ required: true, message: "Chọn kỹ thuật" }]}
                style={{ marginBottom: deviceIsMobile ? 40 : 24 }}
              >
                <Select
                  placeholder="Chọn kỹ thuật"
                  disabled={!isEdit || isApproved}
                  allowClear
                >
                  <Option key={"D-SONO"} value={"D-SONO"}>
                    {"D-SONO"}
                  </Option>
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item
                {...formItemLayout}
                label={"Bộ phận"}
                name="field_1"
                rules={[{ required: true, message: "Chọn bộ phận" }]}
                style={{ marginBottom: deviceIsMobile ? 40 : 24 }}
              >
                <Select
                  placeholder="Chọn bộ phận"
                  disabled={!isEdit || isApproved}
                  allowClear
                  value={field1}
                  onChange={(v) => handleField1Change(v)}
                >
                  {FIELD1_OPTIONS.map((o) => (
                    <Option key={o} value={o}>
                      {o}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item
                {...formItemLayout}
                label={"Ngôn ngữ"}
                name="language"
                rules={[{ required: true }]}
                style={{ marginBottom: deviceIsMobile ? 40 : 24 }}
              >
                <Select disabled={!isEdit || isApproved} placeholder="VI / EN">
                  {LANGUAGE_OPTIONS.map((opt) => (
                    <Option
                      key={opt.value}
                      value={opt.value}
                      disabled={
                        idEdit || (!idEdit && !["vi"].includes(opt.value))
                      }
                    >
                      {opt.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[24, deviceIsMobile ? 16 : 0]}>
            <Col xs={24} md={12}>
              <Form.Item
                {...formItemLayout}
                label={translateLabel(
                  TRANSLATE_LANGUAGE.VI,
                  "resultPrint",
                  false,
                )}
                name="id_print_template"
                rules={[{ required: true, message: "Chọn mẫu in" }]}
                // labelCol={{ flex: "0 0 150px" }}
                style={{
                  marginBottom: deviceIsMobile ? 16 : 24,
                }}
              >
                <Select
                  disabled={!isEdit || isApproved}
                  showSearch
                  allowClear
                  style={{ width: "100%" }}
                  placeholder="Chọn mẫu in"
                  optionFilterProp="children"
                  onChange={(val) => {
                    const printT = printTemplateGlobal.find((t) => t.id == val);
                    setPrintTemplate(printT);
                    form.setFieldsValue({ id_print_template: printT?.id });
                  }}
                  filterOption={(input, option) =>
                    option?.children
                      ?.toLowerCase()
                      ?.includes(input.toLowerCase())
                  }
                >
                  {printTemplateGlobal.map((tpl) => (
                    <Option key={tpl.id} value={tpl.id}>
                      {tpl.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {!field1 && (
            <div style={{ marginTop: 32, textAlign: "center" }}>
              <img
                src="/images/sono_start.png"
                style={{ maxWidth: 260, opacity: 0.7 }}
              />
              <p>
                <i>Vui lòng chọn vùng khảo sát để bắt đầu.</i>
              </p>
            </div>
          )}

          {field1 && (
            <>
              <Card
                title="MÔ TẢ HÌNH ẢNH"
                style={{
                  marginTop: 24,
                }}
                styles={{
                  header: {
                    paddingRight: deviceIsMobile ? 0 : 24,
                    paddingLeft: deviceIsMobile ? 0 : 24,
                    minHeight: "unset",
                  },
                  body: { padding: deviceIsMobile ? 5 : 24 },
                }}
              >
                {rows.map((parent, pIdx) => {
                  const structureOptions = STRUCT ? Object.keys(STRUCT) : [];
                  const statusOptions =
                    parent.structure && STRUCT && STRUCT[parent.structure]
                      ? STRUCT[parent.structure].status
                      : [];
                  const positionOptions =
                    parent.structure && STRUCT && STRUCT[parent.structure]
                      ? STRUCT[parent.structure].position
                      : [];

                  return (
                    <Card
                      key={pIdx}
                      size="small"
                      style={{
                        marginBottom: 12,
                        background: "#fafafa",
                      }}
                    >
                      <Row
                        gutter={[12, deviceIsMobile ? 12 : 0]}
                        align="middle"
                      >
                        <Col xs={24} md={8}>
                          {pIdx === 0 && <b>Cấu trúc</b>}
                          <Select
                            style={{ width: "100%", marginTop: 4 }}
                            disabled
                            value={parent.structure}
                            onChange={(v) => changeParentStructure(pIdx, v)}
                            options={structureOptions.map((s) => ({
                              label: s,
                              value: s,
                            }))}
                          />
                        </Col>

                        <Col xs={24} md={16}>
                          {pIdx === 0 && <b>Trạng thái (chọn nhiều)</b>}
                          <Select
                            mode="multiple"
                            allowClear
                            placeholder="Chọn trạng thái (multi)"
                            style={{ width: "100%", marginTop: 4 }}
                            value={parent.statuses}
                            disabled={
                              !parent.structure || isApproved || !isEdit
                            }
                            onChange={(vals) => onStatusChange(vals, pIdx)}
                            options={statusOptions.map((s) => ({
                              label: s,
                              value: s,
                            }))}
                          />
                        </Col>
                      </Row>

                      {parent.children && parent.children.length > 0 && (
                        <>
                          <Divider style={{ margin: "8px 0" }} />
                          {parent.children.map((child, cIdx) => {
                            const isNormal =
                              child.status === "Không thấy bất thường";
                            const needSize =
                              parent.structure &&
                              STRUCT &&
                              STRUCT[parent.structure] &&
                              STRUCT[parent.structure].needSize.includes(
                                child.status,
                              );

                            return !isNormal ? (
                              <Row
                                gutter={[12, 12]}
                                key={cIdx}
                                style={{
                                  marginBottom: 16,
                                  padding: deviceIsMobile ? "12px" : "0",
                                  border: deviceIsMobile
                                    ? "1px solid #eee"
                                    : "none",
                                  borderRadius: 8,
                                }}
                              >
                                <Col
                                  xs={24}
                                  md={16}
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                  }}
                                >
                                  <div style={{ fontWeight: 600 }}>
                                    <p style={{ margin: 0 }}>{child.status}</p>
                                  </div>
                                </Col>

                                <Col xs={24} md={9}>
                                  <div
                                    style={{
                                      display: "flex",
                                      flexDirection: deviceIsMobile
                                        ? "column"
                                        : "row", // Dọc trên mobile
                                      alignItems: deviceIsMobile
                                        ? "flex-start"
                                        : "center",
                                      gap: 4,
                                    }}
                                  >
                                    <div
                                      style={{
                                        width: deviceIsMobile ? "auto" : 80,
                                        flexShrink: 0,
                                      }}
                                    >
                                      Ở vị trí:
                                    </div>
                                    <Select
                                      style={{ width: "100%" }}
                                      placeholder="Chọn vị trí"
                                      value={child.position}
                                      disabled={
                                        child.status ===
                                          "Không thấy bất thường" ||
                                        isApproved ||
                                        !isEdit
                                      }
                                      options={positionOptions.map((p) => ({
                                        label: p,
                                        value: p,
                                      }))}
                                      onChange={(v) =>
                                        updateChild(pIdx, cIdx, "position", v)
                                      }
                                    />
                                  </div>
                                </Col>

                                <Col xs={24} md={9}>
                                  <div
                                    style={{
                                      display: "flex",
                                      flexDirection: deviceIsMobile
                                        ? "column"
                                        : "row", // Dọc trên mobile
                                      alignItems: deviceIsMobile
                                        ? "flex-start"
                                        : "center",
                                      gap: 4,
                                    }}
                                  >
                                    <div
                                      style={{
                                        width: deviceIsMobile ? "auto" : 100,
                                        flexShrink: 0,
                                      }}
                                    >
                                      {" "}
                                      {/* Giảm từ 220 xuống 100 trên Desktop */}
                                      Kích thước:
                                    </div>
                                    {needSize ? (
                                      <InputNumber
                                        style={{ width: "100%" }}
                                        min={1}
                                        placeholder="mm"
                                        value={child.size}
                                        onChange={(v) =>
                                          updateChild(pIdx, cIdx, "size", v)
                                        }
                                      />
                                    ) : (
                                      <InputNumber
                                        style={{ width: "100%" }}
                                        disabled
                                        placeholder="Không yêu cầu"
                                      />
                                    )}
                                  </div>
                                </Col>
                              </Row>
                            ) : null;
                          })}
                        </>
                      )}
                    </Card>
                  );
                })}
              </Card>

              {/* Voice */}
              {!isRecording ? (
                <Button
                  block
                  onClick={startVoice}
                  disabled={isApproved || !isEdit}
                >
                  🎤 Bắt đầu ghi âm
                </Button>
              ) : (
                <Button block danger onClick={stopVoice}>
                  ⛔ Dừng ghi âm
                </Button>
              )}

              <Card title="Bạn đã nói" style={{ marginTop: 16 }}>
                {voiceList.length === 0 ? (
                  <i>Chưa có âm thanh nào.</i>
                ) : (
                  voiceList.map((txt, idx) => <p key={idx}>• {txt}</p>)
                )}
              </Card>

              <Button
                type="primary"
                block
                style={{ marginTop: 16 }}
                disabled={voiceList.length === 0}
                onClick={analyzeVoice}
                loading={loadingAI}
              >
                Phân tích AI
              </Button>

              <Card title="KẾT LUẬN, CHẨN ĐOÁN" style={{ marginTop: 24 }}>
                {list.length === 0 ? (
                  <i>Không thấy hình ảnh bất thường</i>
                ) : (
                  Object.entries(
                    list.reduce((acc, item) => {
                      if (!acc[item.field1]) acc[item.field1] = [];
                      acc[item.field1].push(item);
                      return acc;
                    }, {}),
                  ).map(([field, items], groupIdx) => (
                    <div key={groupIdx} style={{ marginBottom: 16 }}>
                      {/* dòng dẫn */}
                      <p style={{ fontWeight: 600 }}>
                        • Hình ảnh siêu âm {field}
                      </p>

                      {/* từng mô tả */}
                      {items.map((item) => {
                        const globalIndex = list.findIndex(
                          (x) => x.id === item.id,
                        );

                        return (
                          <div
                            key={item.id}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              padding: "6px 0",
                              borderBottom: "1px dashed #ddd",
                            }}
                          >
                            <span style={{ flex: 1, marginLeft: 16 }}>
                              {item.text
                                .replace(`Hình ảnh siêu âm ${field}`, "")
                                .trim()}
                            </span>

                            <Button
                              danger
                              size="small"
                              onClick={() => removeListItem(globalIndex)}
                              disabled={!isEdit || isApproved}
                            >
                              X
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  ))
                )}
              </Card>
            </>
          )}
        </Card>

        <FormActionBar
          languageTranslate={TRANSLATE_LANGUAGE.VI}
          approvalStatus={initialSnap.status}
          onAction={() => handleSave(SONO_STATUS.PENDING)}
          editId={idEdit}
          onSign={() => setSignModalOpen(true)}
          onPreview={() => {
            form
              .validateFields()
              .then(() => setOpenPreview(true))
              .catch(() => setOpenPreview(true));
          }}
          onExit={() => {
            if (!window.confirm("Bạn có chắc muốn thoát không?")) return;
            navigate(`/home/`);
          }}
          isEdit={isEdit}
          onReset={handleReset}
          onEdit={() => {
            if (isEdit === true) setIsEdit(false);
            else setIsEdit(user.id_role == USER_ROLE.ADMIN || !idEdit);
          }}
          onApprove={async () => {
            try {
              const res = await API_CALL.patch("/sono/" + id + "/approve");
              toast.success("Phê duyệt thành công!");
              navigate(`/home/patients-diagnose`);
            } catch (error) {
              toast.error("Phê duyệt thất bại!");
            }
          }}
          actionKeys={
            patientDiagnose?.id_doctor_in_processing &&
            patientDiagnose?.id_doctor_in_processing != doctor.id
              ? [KEY_ACTION_BUTTON.preview]
              : [
                  KEY_ACTION_BUTTON.reset,
                  KEY_ACTION_BUTTON.save,
                  KEY_ACTION_BUTTON.edit,
                  KEY_ACTION_BUTTON.approve,
                  KEY_ACTION_BUTTON.preview,
                  KEY_ACTION_BUTTON.sign,
                  KEY_ACTION_BUTTON.verifySign,
                  KEY_ACTION_BUTTON.exit,
                ]
          }
        />

        {openPreview && (
          <Modal
            width={900}
            open={openPreview}
            onCancel={() => setOpenPreview(false)}
            footer={null}
            style={{ top: 20 }}
          >
            <PreviewSono
              // pass the current live state (no need to parse JSON in preview)
              formSnapshot={{ ...initialSnap, ...form.getFieldsValue() }}
              rows={rows}
              field1={field1}
              ket_qua_chan_doan={list}
              doctor={doctor}
              languageTranslate={TRANSLATE_LANGUAGE.VI}
              approvalStatus={initialSnap.status}
              editId={idEdit}
              printTemplate={printTemplate}
              rowsByField={rowsByField}
            />
          </Modal>
        )}
      </Form>

      <SmartCASignModal
        open={signModalOpen}
        onClose={() => setSignModalOpen(false)}
        id_sono_result={idEdit}
      />
    </div>
  );
};

export default UltrasoundBungForm;
