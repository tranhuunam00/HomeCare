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
  buildFormDataDoctorUseFormVer3,
  buildFormVer3Values,
  DEFAULT_IMAGING_ROWS,
  LANGUAGE_OPTIONS,
} from "../../formver3.constant";
import AdvancedSampleSection from "../../components/AdvancedSampleSection";
import ImagingStructureTable from "../../components/ImagingStructureTable3.jsx";
import ImagingDiagnosisSection from "../../components/ImagingDiagnosisSection";

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
  const { patient_diagnose_id, id_doctor_use_formver3 } = useParams();
  const [idEdit, setIdEdit] = useState(id_doctor_use_formver3);
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

  const [imagingRows, setImagingRows] = useState(DEFAULT_IMAGING_ROWS);

  useEffect(() => {
    if (formVer3 && !idEdit) {
      form.setFieldsValue(buildFormVer3Values(formVer3));
      try {
        const rows = JSON.parse(formVer3.imageDescription || "[]");

        setImagingRows(
          Array.isArray(rows) && rows.length ? rows : DEFAULT_IMAGING_ROWS
        );
      } catch {
        setImagingRows(DEFAULT_IMAGING_ROWS);
      }
    }
  }, [formVer3]);
  const abnormalFindings = useMemo(() => {
    return imagingRows
      .filter(
        (r) =>
          r.status === "abnormal" &&
          r.description &&
          r.description.trim() !== ""
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
    const fetchDataFromServerWhenHaveIDs = async () => {
      try {
        setLoading(true);
        const apiCalls = [
          idPatientDiagnose
            ? API_CALL.get("/patient-diagnose/" + idPatientDiagnose)
            : null,
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

          console.log("descImages", descImages);
          setImageList(descImages);
          try {
            const rows = JSON.parse(
              doctorUseFormVer3Server.imageDescription || "[]"
            );
            setImagingRows(
              Array.isArray(rows) && rows.length ? rows : DEFAULT_IMAGING_ROWS
            );
          } catch {
            setImagingRows(DEFAULT_IMAGING_ROWS);
          }
          setFormVer3(doctorUseFormVer3Server?.id_formver3_formver3);
          setInitialSnap({
            formValues: form.getFieldsValue(),
            apiData: doctorUseFormVer3Server,
          });
        }

        setPatientDiagnose(
          patientDiagnoseData ||
            doctorUseFormVer3Server?.id_patient_diagnose_patient_diagnose
        );

        console.log("formValues", formValues);
        form.setFieldsValue(formValues);
      } catch (error) {
        console.log(
          "[fetchDataFromServerWhenHaveIDs] error-------",
          error.message || error
        );
        toast.error("Không thể tải thông tin ca bệnh");
      } finally {
        setLoading(false);
      }
    };

    fetchDataFromServerWhenHaveIDs();
  }, [idPatientDiagnose, idEdit]);

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

  const onFinish = async (values) => {
    try {
      const formPayload = buildFormDataDoctorUseFormVer3(values, {
        id_patient_diagnose: patientDiagnose?.id,
        imageList,
        formVer3,
        imagingRows,
        abnormalFindings,
      });

      if (pendingAction.current === KEY_ACTION_BUTTON.save) {
        const res = await API_CALL.postForm(`/doctorUseFormVer3`, formPayload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
    } catch (error) {
      toast.error(error.message || error);
    } finally {
      setLoading(false);
      pendingAction.current = null;
    }
  };

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
                      setSelectedIDs((prev) => ({
                        ...prev,
                        id_formver3_name: id_formver3_name,
                      }));
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
            {"Kỹ thuật thực hiện".toUpperCase()}
          </Title>

          <Form.Item name="implementMethod" label="" tooltip="Short text">
            <TextArea
              disabled={!isEdit}
              autoSize={{ minRows: 4, maxRows: 10 }}
              placeholder="Nhập mô tả quy trình kỹ thuật..."
            />
          </Form.Item>
          <AdvancedSampleSection isEdit={isEdit} isAdvanceSample={false} />

          {/* Ảnh minh hoạ */}
          <Title level={4} style={{ color: "#2f6db8", margin: "24px 0 16px" }}>
            {translateLabel(
              languageTranslate,
              "imagingFindings",
              false
            ).toUpperCase()}
          </Title>

          <ImagingStructureTable
            rows={imagingRows}
            setRows={setImagingRows}
            isEdit={isEdit}
          />

          <ImagingDiagnosisSection
            abnormalFindings={abnormalFindings}
            isEdit={isEdit}
            languageTranslate={languageTranslate}
            translateLabel={translateLabel}
          />

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
        </Form>
      )}

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
