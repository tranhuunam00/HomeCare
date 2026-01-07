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
} from "antd";
import { QuestionCircleOutlined, ReloadOutlined } from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import styles from "./DoctorIUseFormVer3.module.scss";
import { useGlobalAuth } from "../../../../contexts/AuthContext";
import API_CALL from "../../../../services/axiosClient";
import useVietnamAddress from "../../../../hooks/useVietnamAddress";
import {
  getAge,
  sortTemplateServices,
  TRANSLATE_LANGUAGE,
  translateLabel,
  USER_ROLE,
} from "../../../../constant/app";
import { APPROVAL_STATUS } from "../../../../components/ApprovalStatusTag";
import { toISODate } from "../../../doctor_use_form_ver2/use/util";

import FormActionBar, {
  KEY_ACTION_BUTTON,
} from "../../../formver2/component/FormActionBar";
import PatientInfoSection from "../../../doctor_use_form_ver2/use/items/PatientInfoForm";
import ImageWithCaptionInput from "../../../products/ImageWithCaptionInput/ImageWithCaptionInput";
import HistoryModal from "../../../doctor_use_form_ver2/use/items/HistoryModal";
import TranslateListRecords from "../../../doctor_use_form_ver2/use/items/TranslateListRecords";
import SmartCASignModal from "../../../doctor_use_form_ver2/SmartCASignModal/SmartCASignModal";
import {
  buildDradv3FormValues,
  LANGUAGE_OPTIONS,
} from "../../formver3.constant";
import AdvancedSampleSection from "../../components/AdvancedSampleSection";

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

export default function DoctorUseDFormVer3({
  onFormChange,
  onPrint,
  isUse = false,
}) {
  const [form] = Form.useForm();
  const {
    examParts,
    templateServices,
    user,
    doctor,
    setIsReadingForm,
    setExamParts,
    setTemplateServices,
  } = useGlobalAuth();

  const [reloading, setReloading] = useState(false);
  const [signModalOpen, setSignModalOpen] = useState(false);
  const { provinces, wards, setSelectedProvince } = useVietnamAddress();
  const navigate = useNavigate();
  const { id, patient_diagnose_id } = useParams();
  const [idEdit, setIdEdit] = useState(id);
  const [idPatientDiagnose, setIdPatientDiagnose] =
    useState(patient_diagnose_id);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [translateOpen, setTranslateOpen] = useState(false);
  const [patientDiagnose, setPatientDiagnose] = useState(null);
  const [imageList, setImageList] = useState([{}, {}, {}]);
  const [filteredFormVer3Names, setFilteredFormVer3Names] = useState([]);
  const [languageTranslate, setLanguageTransslate] = useState(
    TRANSLATE_LANGUAGE.VI
  );
  const [status, setStatus] = useState(APPROVAL_STATUS.DRAFT);
  const [initialSnap, setInitialSnap] = useState({
    formValues: null,
    apiData: null,
  });
  const [formVer3, setFormVer3] = useState();
  const [printTemplateList, setPrintTemplateList] = useState([]);
  const [printTemplate, setPrintTemplate] = useState(null);

  const [selectedIDs, setSelectedIDs] = useState({
    id_template_service: null,
    id_exam_part: null,
    id_formver3_name: null,
  });

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

  useEffect(() => {
    try {
      if (selectedIDs.id_template_service || selectedIDs.id_exam_part) {
        setFilteredFormVer3Names([]);
      }

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
            item.id_template_service == selectedIDs.id_template_service &&
            item.id_exam_part == selectedIDs.id_exam_part &&
            item.isUsed == true
          );
        });

        setFilteredFormVer3Names(filterDatas);
      };
      fetchDataFormver3Names();
    } catch (error) {
      console.log("error", error);
      toast.error("Không thể tải danh sách tên mẫu FORM V3`");
    }
  }, [selectedIDs]);

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

  useEffect(() => {
    const fetchPatientDiagnose = async () => {
      try {
        setLoading(true);
        const apiCalls = [
          API_CALL.get("/patient-diagnose/" + idPatientDiagnose),
        ];
        if (id) {
          apiCalls.push(
            API_CALL.get("/doctor-use-form-ver3/detail", {
              params: { id: id, withFormVer3: true },
            })
          );
        }
        const [diagnoseRes, dradsRes] = await Promise.all(apiCalls);
        const patientDiagnoseData =
          diagnoseRes.data.data?.data || diagnoseRes.data.data || [];
        const dradsDetail =
          dradsRes?.data?.data?.data || dradsRes?.data?.data || null;

        const formValues = buildDradv3FormValues({
          dradsDetail,
          patientDiagnose: patientDiagnoseData,
        });

        setSelectedProvince(patientDiagnoseData.province_code);
        setSelectedIDs({
          id_template_service: patientDiagnoseData.id_template_service,
          id_exam_part: patientDiagnoseData.id_exam_part,
          id_formver3_name: dradsDetail?.id_formver3_form_ver3,
        });
        form.setFieldsValue(formValues);
        setPatientDiagnose(patientDiagnoseData);
      } catch (error) {
        console.error(error);
        toast.error("Không thể tải thông tin ca bệnh");
      } finally {
        setLoading(false);
      }
    };

    if (idPatientDiagnose) fetchPatientDiagnose();
  }, [idPatientDiagnose, id]);

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
  const [previewOpen, setPreviewOpen] = useState(false);

  const [loading, setLoading] = useState();

  const [isEdit, setIsEdit] = useState(!idEdit);

  const filteredExamParts = useMemo(() => {
    if (!selectedIDs.id_template_service) return [];
    return (examParts || []).filter(
      (p) =>
        Number(p.id_template_service) ===
        Number(selectedIDs.id_template_service)
    );
  }, [examParts, selectedIDs]);

  const onFinish = async (values) => {};

  const restoreFromSnapshot = () => {};

  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: 0 }}>
      <Title
        level={3}
        style={{
          textAlign: "center",
          marginBottom: 8,
          color: "rgba(18, 119, 49, 1)",
        }}
      >
        PHẦN MỀM D-RADS | ĐỌC KẾT QUẢ | V3
      </Title>

      {loading ? (
        <div style={{ textAlign: "center", padding: 40 }}>
          <Spin />
        </div>
      ) : (
        <Form
          form={form}
          layout="horizontal"
          labelAlign="left"
          labelCol={{ flex: "0 0 180px" }}
          wrapperCol={{ flex: "1 0 0" }}
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
          {/* Hàng 1 */}
          <Title level={4} style={{ color: "#2f6db8", margin: "24px 0 16px" }}>
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
          <Divider />

          <Row gutter={16}>
            <Col xs={24} md={9}>
              <Form.Item
                label={translateLabel(languageTranslate, "department", false)}
                name="id_template_service"
                rules={[{ required: true, message: "Chọn kỹ thuật" }]}
                labelCol={{ flex: "0 0 90px" }}
              >
                <Select
                  placeholder="Chọn kỹ thuật"
                  disabled={!isEdit || patientDiagnose?.id}
                  allowClear
                  onChange={(value) => {
                    form.setFieldsValue({
                      id_exam_part: undefined,
                      id_formver3_name: undefined,
                    });
                    setSelectedIDs((prev) => ({
                      ...prev,
                      id_template_service: value,
                      id_exam_part: null,
                      id_formver3_name: null,
                    }));
                    setFilteredFormVer3Names([]);
                  }}
                >
                  {sortTemplateServices(templateServices).map((s) => (
                    <Option key={s.id} value={s.id}>
                      {s.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col xs={2} md={1}>
              <Tooltip title="Tải lại phân hệ & bộ phận">
                <Button
                  icon={<ReloadOutlined />}
                  loading={reloading}
                  onClick={reloadTemplateAndExamPart}
                />
              </Tooltip>
            </Col>

            <Col xs={24} md={7}>
              <Form.Item
                label={translateLabel(languageTranslate, "bodyPart", false)}
                name="id_exam_part"
                rules={[{ required: true, message: "Chọn bộ phận" }]}
                labelCol={{ flex: "0 0 90px" }}
              >
                <Select
                  placeholder="Chọn bộ phận thăm khám"
                  disabled={
                    !isEdit ||
                    !selectedIDs.id_template_service ||
                    patientDiagnose?.id
                  }
                  allowClear
                  onChange={(value) => {
                    form.setFieldsValue({ id_formver3_name: undefined });
                    setSelectedIDs((prev) => ({
                      ...prev,
                      id_exam_part: value,
                      id_formver3_name: null,
                    }));
                    setFilteredFormVer3Names([]);
                  }}
                  notFoundContent={
                    selectedIDs.id_template_service
                      ? "Không có bộ phận cho phân hệ này"
                      : "Chọn Phân hệ trước"
                  }
                >
                  {filteredExamParts
                    .sort((a, b) => (a.name > b.name ? 1 : -1))
                    .map((s) => (
                      <Option key={s.id} value={s.id}>
                        {s.name}
                      </Option>
                    ))}
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} md={6}>
              <Form.Item
                label={translateLabel(languageTranslate, "language", false)}
                name="language"
                rules={[{ required: true }]}
                labelCol={{ flex: "0 0 90px" }}
              >
                <Select
                  disabled={!isEdit}
                  placeholder="VI / EN"
                  onChange={(lang) => setLanguageTransslate(lang)}
                >
                  {LANGUAGE_OPTIONS.map((opt) => (
                    <Option
                      key={opt.value}
                      value={opt.value}
                      disabled={
                        idEdit || (!idEdit && !["vi", "en"].includes(opt.value))
                      }
                    >
                      {opt.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={24}>
              <Form.Item
                labelCol={{ flex: "0 0 270px" }}
                label={translateLabel(
                  languageTranslate,
                  "resultTemplate",
                  false
                )}
                name="id_formver3_name"
                rules={[{ required: true, message: "Chọn tên mẫu" }]}
              >
                <Select
                  disabled={
                    !isEdit ||
                    !selectedIDs.id_template_service ||
                    !selectedIDs.id_exam_part
                  }
                  placeholder={
                    !selectedIDs.id_template_service ||
                    !selectedIDs.id_exam_part
                      ? "Chọn Phân hệ & Bộ phận trước"
                      : "Chọn tên mẫu"
                  }
                  showSearch
                  optionFilterProp="children"
                  notFoundContent={
                    selectedIDs.id_template_service && selectedIDs.id_exam_part
                      ? "Không có tên mẫu phù hợp"
                      : "Chưa đủ điều kiện để chọn"
                  }
                  onChange={async (id_formver3_name) => {
                    try {
                      setLoading(true);
                      const res = await API_CALL.get(
                        `/formVer3?id_formver3_name=${id_formver3_name}`
                      );
                      setFormVer3(res.data.data.items[0]);
                    } catch (e) {
                      toast.error("Không tải được dữ liệu. Vui lòng thử lại.");
                    } finally {
                      setLoading(false);
                    }
                  }}
                >
                  {filteredFormVer3Names.map((item) => (
                    <Option key={item.id} value={item.id}>
                      {item.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            label={translateLabel(languageTranslate, "resultPrint", false)}
            name="id_print_template"
            rules={[{ required: true, message: "Chọn mẫu in" }]}
            labelCol={{ flex: "0 0 270px" }}
          >
            <Select
              disabled={!isEdit}
              showSearch
              allowClear
              style={{ width: "100%" }}
              placeholder="Chọn mẫu in"
              optionFilterProp="children"
              onChange={(val) => {
                const printT = printTemplateList.find((t) => t.id == val);
                setPrintTemplate(printT);
                form.setFieldsValue({ id_print_template: printT?.id });
              }}
              filterOption={(input, option) =>
                option?.children?.toLowerCase()?.includes(input.toLowerCase())
              }
            >
              {printTemplateList.map((tpl) => (
                <Option key={tpl.id} value={tpl.id}>
                  {tpl.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Title level={4} style={{ color: "#2f6db8", margin: "24px 0 16px" }}>
            {translateLabel(
              languageTranslate,
              "technicalProtocol",
              false
            ).toUpperCase()}
          </Title>

          <Form.Item name="quy_trinh_url" label="" tooltip="Short text">
            <TextArea
              disabled={!isEdit}
              autoSize={{ minRows: 4, maxRows: 10 }}
              placeholder="Nhập mô tả quy trình kỹ thuật..."
            />
          </Form.Item>

          {/* Ảnh minh hoạ */}
          <Title level={4} style={{ color: "#2f6db8", margin: "24px 0 16px" }}>
            {translateLabel(
              languageTranslate,
              "imagingFindings",
              false
            ).toUpperCase()}
          </Title>

          {/* Kết luận */}
          <Title level={4} style={{ color: "#2f6db8", margin: "24px 0 16px" }}>
            {translateLabel(
              languageTranslate,
              "impression",
              false
            ).toUpperCase()}
          </Title>
          <Form.Item
            name="ket_qua_chan_doan"
            rules={[{ required: true, message: "Nhập kết luận" }]}
          >
            <TextArea
              disabled={!isEdit}
              style={{ height: 200, fontWeight: "bold" }}
              placeholder="VD: U máu gan"
            />
          </Form.Item>

          <AdvancedSampleSection isEdit={isEdit} />

          <Form.Item
            label={
              <span>
                {translateLabel(
                  languageTranslate,
                  "icd10Classification",
                  false
                )}
                <Tooltip title="Tra cứu ICD-10">
                  <a
                    href="https://icd.kcb.vn/icd-10/icd10"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ marginLeft: 4 }}
                  >
                    <QuestionCircleOutlined />
                  </a>
                </Tooltip>
              </span>
            }
            name="icd10"
          >
            <Input disabled={!isEdit} placeholder="Link/Code ICD-10" />
          </Form.Item>

          <Form.Item
            label={translateLabel(
              languageTranslate,
              "gradingClassification",
              false
            )}
            name="phan_do_loai"
          >
            <Input disabled={!isEdit} placeholder="Short text" />
          </Form.Item>

          <Form.Item
            label={translateLabel(
              languageTranslate,
              "differentialDiagnosis",
              false
            )}
            name="chan_doan_phan_biet"
          >
            <Input disabled={!isEdit} placeholder="Short text" />
          </Form.Item>

          <Title level={4} style={{ color: "#2f6db8", margin: "24px 0 16px" }}>
            {translateLabel(
              languageTranslate,
              "recommendationsCounseling",
              false
            ).toUpperCase()}
          </Title>
          <Form.Item
            disabled={!isEdit}
            name="khuyen_nghi"
            tooltip="Có thể tích hợp ChatGPT D-RADS"
          >
            <TextArea
              disabled={!isEdit}
              autoSize={{ minRows: 4, maxRows: 10 }}
              placeholder="Nhập khuyến nghị & tư vấn..."
            />
          </Form.Item>

          <Title level={4} style={{ color: "#2f6db8", margin: "24px 0 16px" }}>
            {translateLabel(
              languageTranslate,
              "illustrativeImages",
              false
            ).toUpperCase()}
          </Title>
          <Form.Item label="">
            <ImageWithCaptionInput
              disabled={!isEdit}
              max={4}
              value={imageList}
              onChange={setImageList}
              valueTrans={imageList}
              onChangeTrans={setImageList}
            />
          </Form.Item>

          {/* Action bar */}
          {(initialSnap.apiData?.id_doctor == doctor.id ||
            user.id_role == USER_ROLE.ADMIN ||
            !idEdit) && (
            <FormActionBar
              languageTranslate={languageTranslate}
              approvalStatus={status}
              actionKeys={
                patientDiagnose?.id_doctor_in_processing &&
                patientDiagnose?.id_doctor_in_processing != doctor.id
                  ? [KEY_ACTION_BUTTON.preview, KEY_ACTION_BUTTON.sign]
                  : [
                      KEY_ACTION_BUTTON.reset,
                      KEY_ACTION_BUTTON.save,
                      KEY_ACTION_BUTTON.edit,
                      KEY_ACTION_BUTTON.approve,
                      KEY_ACTION_BUTTON.preview,
                      KEY_ACTION_BUTTON.AI,
                      KEY_ACTION_BUTTON.translate_multi,
                      KEY_ACTION_BUTTON.translate_en,
                      KEY_ACTION_BUTTON.sign,
                      KEY_ACTION_BUTTON.exit,
                    ]
              }
              onSign={() => setSignModalOpen(true)}
              onExit={() => {
                if (!window.confirm("Bạn có chắc muốn thoát không?")) {
                  return;
                }
                navigate(`/home/doctor-use-form-drad`);
              }}
              onApprove={async () => {}}
              onAction={(key) => {
                if (
                  !window.confirm("Bạn có chắc muốn lưu lại dữ liệu không?")
                ) {
                  return;
                }
                pendingAction.current = key;
                form.submit();
              }}
              onPrint={onPrint}
              onReset={restoreFromSnapshot}
              onPreview={() => setPreviewOpen(!previewOpen)}
              isEdit={isEdit}
              onEdit={() => {
                if (isEdit == true) {
                  setIsEdit(false);
                } else {
                  setIsEdit(
                    initialSnap.apiData?.id_doctor == doctor.id ||
                      user.id_role == USER_ROLE.ADMIN ||
                      !idEdit
                  );
                }
              }}
              editId={idEdit}
            />
          )}

          <Title level={4} style={{ margin: "24px 0 16px" }}>
            <a
              style={{
                fontStyle: "italic",
                color: "#b17b16ff",
                textDecoration: "underline",
                cursor: "pointer",
              }}
              onClick={() => setHistoryOpen(true)}
            >
              LỊCH SỬ THAY ĐỔI
            </a>
          </Title>

          <Title level={4} style={{ margin: "24px 0 16px" }}>
            <a
              style={{
                fontStyle: "italic",
                color: "#b17b16ff",
                textDecoration: "underline",
                cursor: "pointer",
              }}
              onClick={() => setTranslateOpen(true)}
            >
              CÁC BẢN DỊCH
            </a>
          </Title>
        </Form>
      )}

      <HistoryModal
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        idRoot={initialSnap.apiData?.id_root || idEdit}
        idCurrent={idEdit}
        language={languageTranslate}
      />

      <TranslateListRecords
        open={translateOpen}
        onClose={() => setTranslateOpen(false)}
        idRoot={initialSnap.apiData?.id_root || idEdit}
        idCurrent={idEdit}
        language={languageTranslate}
      />

      <SmartCASignModal
        open={signModalOpen}
        onClose={() => setSignModalOpen(false)}
        id_doctor_use_form_ver3={idEdit}
      />
    </div>
  );
}
