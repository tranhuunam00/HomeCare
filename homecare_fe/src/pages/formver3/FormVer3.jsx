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
  Checkbox,
  Radio,
} from "antd";
import { QuestionCircleOutlined } from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import { useGlobalAuth } from "../../contexts/AuthContext";
import API_CALL from "../../services/axiosClient"; // axios instance của bạn
import FormActionBar, {
  KEY_ACTION_BUTTON,
} from "../formver2/component/FormActionBar";
import dayjs from "dayjs";

import { toast } from "react-toastify";
import CustomSunEditor from "../../components/Suneditor/CustomSunEditor";

import styles from "./FormVer3.module.scss";
import {
  TRANSLATE_LANGUAGE,
  translateLabel,
  USER_ROLE,
} from "../../constant/app";
import {
  ADDITIONAL_ACTION_OPTIONS,
  buildFormVer3Values,
  CAN_THIEP_GROUP_CODE,
  CONTRAST_INJECTION_OPTIONS,
  DEFAULT_IMAGING_ROWS,
  IMAGE_QUALITY_OPTIONS,
} from "./formver3.constant";
import AdvancedSampleSection from "./components/AdvancedSampleSection";
import ImagingStructureTable from "./components/ImagingStructureTable3.jsx";
import ImagingDiagnosisSection from "./components/ImagingDiagnosisSection";
import PrintPreviewVer2NotDataDiagnose from "../formver2/PreviewVer2/PrintPreviewVer2NotDataDiagnose.jsx";
import PrintPreviewVer3NotDataDiagnose from "./components/PrintPreviewVer3NotDataDiagnose.jsx";
import ReloadTSAndExamPartsButton from "../../components/ReloadTSAndExamPartsButton.jsx";
import ImagingStructureTextTable from "./components/ImagingStructureTextTable.jsx";

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const LANGUAGE_OPTIONS = [{ label: "VI", value: "vi" }];

const toISODate = (d = new Date()) => new Date(d).toISOString().slice(0, 10); // YYYY-MM-DD

/* ============== MAPPERS ============== */
// Map API → Form initialValues

export default function DFormVer3({ id_formVer3 }) {
  const [form] = Form.useForm();
  const { id: idFromParam } = useParams();
  const [editId, setEditId] = useState(id_formVer3 ?? idFromParam);
  const [loading, setLoading] = useState();
  const [isEdit, setIsEdit] = useState(!editId);

  const [selectedIds, setSelectedIds] = useState({
    id_template_service: null,
    id_exam_part: null,
    id_formver3_name: null,
  });
  const [diagnosisSummary, setDiagnosisSummary] = useState(
    form.getFieldValue("imagingDiagnosisSummary"),
  );

  const { examParts, templateServices, user, doctor, formVer3Names } =
    useGlobalAuth();

  const navigate = useNavigate();
  const [initialSnap, setInitialSnap] = useState({
    formValues: null,
    apiData: null,
  });

  const [imagingRows, setImagingRows] = useState(DEFAULT_IMAGING_ROWS);

  const selectedTemplateService = useMemo(() => {
    if (!selectedIds.id_template_service) return null;
    return templateServices?.find(
      (ts) => Number(ts.id) === Number(selectedIds.id_template_service),
    );
  }, [selectedIds.id_template_service, templateServices]);

  const isCanThiepGroup = useMemo(() => {
    return selectedTemplateService?.code
      ? CAN_THIEP_GROUP_CODE.includes(selectedTemplateService.code)
      : false;
  }, [selectedTemplateService]);

  useEffect(() => {
    if (!editId) return;

    const fetchDetail = async () => {
      try {
        setLoading(true);

        const res = await API_CALL.get(`/formVer3/${editId}`);
        const data = res?.data?.data.data;
        if (!data) return;

        const values = buildFormVer3Values(data);
        form.setFieldsValue(values);
        /* ===== set state phụ thuộc ===== */
        setSelectedIds({
          id_template_service: data.id_template_service,
          id_exam_part: data.id_exam_part,
          id_formver3_name: data.id_formver3_name,
        });

        /* ===== imaging rows ===== */
        try {
          const rows = JSON.parse(data.imageDescription || "[]");

          setImagingRows(
            Array.isArray(rows) && rows.length ? rows : DEFAULT_IMAGING_ROWS,
          );
        } catch {
          setImagingRows(DEFAULT_IMAGING_ROWS);
        }

        /* ===== snapshot ===== */
        setInitialSnap({
          formValues: form.getFieldsValue(),
          apiData: data,
        });

        setIsEdit(false);
      } catch (err) {
        console.error(err);
        toast.error("Không tải được dữ liệu FormVer3");
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [editId, templateServices, examParts]);

  useEffect(() => {
    form.setFieldsValue({
      imagingStructures: imagingRows,
    });
  }, [imagingRows]);

  const [filteredFormVer3Names, setFilteredFormVer3Names] = useState([]);

  // Lọc local từ formVer3Names đã có sẵn trong context

  const pendingAction = useRef(null);
  const ngayThucHienISO = useMemo(() => toISODate(new Date()), []);
  const [previewOpen, setPreviewOpen] = useState(false);

  const [languageTranslate, setLanguageTransslate] = useState(
    TRANSLATE_LANGUAGE.VI,
  );

  const filteredExamParts = useMemo(() => {
    if (!selectedIds.id_template_service) return [];
    return (examParts || []).filter(
      (p) =>
        Number(p.id_template_service) ===
        Number(selectedIds.id_template_service),
    );
  }, [selectedIds]);

  const onFinish = async (values) => {
    try {
      setLoading(true);

      const payload = {
        id_template_service: values.id_template_service,
        id_exam_part: values.id_exam_part,
        id_formver3_name: values.id_formver3_name,

        implementMethod: values.implementMethod,
        contrastInjection: values.contrastInjection,
        imageQuatity: values.imageQuatity,
        addtionalImpletement: values.additionalAction,

        advanced_sample: values.advancedSample === "yes",
        icd10_classification: values.icd10 || null,

        imageDescription: JSON.stringify(imagingRows),

        unUsualDescription: abnormalFindings.join("; "),

        DifferenceDiagnostic: values.chan_doan_phan_biet || "",
        classify: values.phan_do_loai || "",
        recommendation: values.khuyen_nghi || "",
        imagingDiagnosisSummary: values.imagingDiagnosisSummary || "",
      };

      if (pendingAction.current === KEY_ACTION_BUTTON.save) {
        if (!editId) {
          const res = await API_CALL.post("/formVer3", payload);

          const newId = res?.data?.data?.id || res?.data?.id;

          if (!newId) {
            toast.error("Không nhận được ID sau khi lưu");
            return;
          }
          toast.success("Tạo mới Form D-RADS V3 thành công");
          setEditId(newId);
          navigate(`/home/form-drad-v3/detail/${newId}`);
          return;
        }

        if (editId && isEdit) {
          await API_CALL.patch(`/formVer3/${editId}`, payload);
          toast.success("Cập nhật FormVer3 thành công");
          setIsEdit(false);
          return;
        }

        toast.info("Vui lòng ấn EDIT trước khi lưu");
        return;
      }
    } catch (err) {
      console.error(err);
      toast.error(
        err?.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại",
      );
    } finally {
      setLoading(false);
      pendingAction.current = null;
    }
  };

  const onFinishFailed = (err) => {
    console.log("[onFinishFailed] errors:", err?.errorFields);
    toast.error("Vui lòng kiểm tra các trường còn thiếu/không hợp lệ.");
  };

  const onApprove = async () => {
    if (!editId) return;

    const ok = window.confirm("Bạn có chắc muốn DUYỆT kết quả này không?");
    if (!ok) return;

    try {
      setLoading(true);

      await API_CALL.patch(`/formVer3/${editId}/approve`);

      toast.success("Duyệt FormVer3 thành công");

      // Reload lại detail để sync data mới
      const res = await API_CALL.get(`/formVer3/${editId}`);
      const data = res?.data?.data?.data;

      if (data) {
        form.setFieldsValue({
          ...initialSnap.formValues,
        });

        setInitialSnap({
          formValues: form.getFieldsValue(),
          apiData: data,
        });

        setIsEdit(false);
      }
    } catch (err) {
      console.error(err);
      toast.error("Không thể duyệt FormVer3");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Chưa đủ điều kiện → clear
    if (!selectedIds.id_template_service || !selectedIds.id_exam_part) {
      setFilteredFormVer3Names([]);
      return;
    }

    const fetchFormVer3Names = async () => {
      try {
        setLoading(true);

        const res = await API_CALL.get("/formVer3_name", {
          params: {
            id_template_service: selectedIds.id_template_service,
            id_exam_part: selectedIds.id_exam_part,
            isUsed: !editId ? false : undefined,
            limit: 50,
          },
        });

        const list = res?.data?.data?.items || [];
        // Optional: auto select nếu chỉ có 1 mẫu
        if (!editId && list.length == 1) {
          form.setFieldsValue({
            id_formver3_name: list[0].id,
          });
        }
        setFilteredFormVer3Names(list);
      } catch (err) {
        console.error(err);
        toast.error("Không tải được danh sách tên mẫu");
        setFilteredFormVer3Names([]);
      } finally {
        setLoading(false);
      }
    };
    fetchFormVer3Names();
  }, [selectedIds]);

  const restoreFromSnapshot = () => {
    const ok = window.confirm("Bạn có chắc muốn reset toàn bộ dữ liệu không?");
    if (!ok) return;

    // 🟢 CASE CREATE
    if (!editId) {
      form.resetFields();
      setImagingRows(DEFAULT_IMAGING_ROWS);
      return;
    }

    // 🟢 CASE EDIT → reset về dữ liệu load ban đầu
    if (initialSnap?.formValues && initialSnap?.apiData) {
      form.setFieldsValue(initialSnap.formValues);

      // imagingRows phải set riêng
      try {
        const rows = JSON.parse(initialSnap.apiData.imageDescription || "[]");
        setImagingRows(
          Array.isArray(rows) && rows.length ? rows : DEFAULT_IMAGING_ROWS,
        );
      } catch {
        setImagingRows(DEFAULT_IMAGING_ROWS);
      }

      setIsEdit(false);
    }
  };

  const currentFormVer3Name = useMemo(() => {
    const selectedId = form.getFieldValue("id_formver3_name");
    if (!selectedId) return null;

    return filteredFormVer3Names.find((item) => item.id === selectedId);
  }, [filteredFormVer3Names, form]);
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

  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: 0 }}>
      <Title level={3} style={{ textAlign: "center", marginBottom: 24 }}>
        {editId
          ? "CẬP NHẬT BỘ MẪU KẾT QUẢ D-FORM V.3"
          : "TẠO MỚI BỘ MẪU KẾT QUẢ D-FORM V.3"}
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
          onFinishFailed={onFinishFailed}
          initialValues={{
            language: "vi",
            createdAt: ngayThucHienISO,
            doctor_name: doctor?.full_name,
            advancedSample: "no",
            additionalAction: ADDITIONAL_ACTION_OPTIONS[0].value,
            contrastInjection: CONTRAST_INJECTION_OPTIONS[0].value,
            imageQuatity: IMAGE_QUALITY_OPTIONS[0].value,
          }}
        >
          {/* Hàng 1 */}

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={translateLabel(languageTranslate, "department", false)}
                name="id_template_service"
                rules={[{ required: true, message: "Chọn kỹ thuật" }]}
              >
                <Select
                  placeholder="Chọn kỹ thuật"
                  disabled={!isEdit}
                  allowClear
                  onChange={(val) => {
                    // Clear các field phụ thuộc khi đổi phân hệ
                    form.setFieldsValue({
                      id_exam_part: undefined,
                      id_formver3_name: undefined,
                    });
                    setFilteredFormVer3Names([]);
                    setSelectedIds((s) => ({ ...s, id_template_service: val }));
                  }}
                >
                  {templateServices.map((s) => (
                    <Option key={s.id} value={s.id}>
                      {s.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={1}>
              <ReloadTSAndExamPartsButton />
            </Col>
            <Col span={11}>
              <Form.Item
                label={translateLabel(languageTranslate, "bodyPart", false)}
                name="id_exam_part"
                rules={[{ required: true, message: "Chọn bộ phận" }]}
              >
                <Select
                  placeholder="Chọn bộ phận thăm khám"
                  disabled={!isEdit || !selectedIds.id_template_service}
                  allowClear
                  onChange={(val) => {
                    form.setFieldsValue({ id_formver3_name: undefined });
                    setSelectedIds((s) => ({ ...s, id_exam_part: val }));
                  }}
                  notFoundContent={
                    selectedIds.id_template_service
                      ? "Không có bộ phận cho phân hệ này"
                      : "Chọn Phân hệ trước"
                  }
                >
                  {filteredExamParts.map((s) => (
                    <Option key={s.id} value={s.id}>
                      {s.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={24}>
              <Form.Item
                label={translateLabel(languageTranslate, "formName", false)}
                name="id_formver3_name"
                rules={[{ required: true, message: "Chọn tên mẫu" }]}
              >
                <Select
                  disabled={
                    !isEdit ||
                    !selectedIds.id_template_service ||
                    !selectedIds.id_exam_part
                  }
                  placeholder={
                    !selectedIds.id_template_service ||
                    !selectedIds.id_exam_part
                      ? "Chọn Phân hệ & Bộ phận trước"
                      : "Chọn tên mẫu"
                  }
                  showSearch
                  optionFilterProp="children"
                  notFoundContent={
                    selectedIds.id_template_service && selectedIds.id_exam_part
                      ? "Không có tên mẫu phù hợp"
                      : "Chưa đủ điều kiện để chọn"
                  }
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
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label={translateLabel(languageTranslate, "language", false)}
                name="language"
                rules={[{ required: true }]}
              >
                <Select
                  onChange={(lang) => {
                    setLanguageTransslate(lang);
                  }}
                  disabled={!isEdit}
                  options={LANGUAGE_OPTIONS}
                  placeholder="VI / US"
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label={translateLabel(languageTranslate, "codeForm", false)}
              >
                <Input
                  value={currentFormVer3Name?.code || ""}
                  readOnly
                  disabled
                  placeholder="Tự động theo mẫu đã chọn"
                />
              </Form.Item>
            </Col>
          </Row>
          {/* Thông tin hệ thống */}
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label={translateLabel(languageTranslate, "createdAt", false)}
                name={"createdAt"}
              >
                <Input value={ngayThucHienISO} readOnly disabled />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label={translateLabel(languageTranslate, "createdUser", false)}
                name="doctor_name"
              >
                <Input readOnly disabled />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="NHÓM KẾT QUẢ"
            name="advancedSample"
            tooltip="Dùng cho việc phân quyền trong các gói"
            rules={[{ required: true, message: "Chọn thông tin mẫu nâng cao" }]}
          >
            <Radio.Group disabled={!isEdit}>
              <Radio value="no">Bình thường</Radio>
              <Radio value="yes">Bất thường</Radio>
            </Radio.Group>
          </Form.Item>

          <Title level={4} style={{ color: "#2f6db8", margin: "24px 0 16px" }}>
            {"Quy trình kỹ thuật".toUpperCase()}
          </Title>

          <Form.Item
            name="implementMethod"
            label="Kỹ thuật thực hiện"
            labelCol={""}
          >
            <TextArea
              disabled={!isEdit}
              autoSize={{ minRows: 4, maxRows: 10 }}
              placeholder="Nhập mô tả kỹ thuật thực hiện"
            />
          </Form.Item>
          <AdvancedSampleSection isEdit={isEdit} />

          {/* Bảng mô tả hình ảnh */}
          <Title level={4} style={{ color: "#2f6db8", margin: "24px 0 16px" }}>
            {translateLabel(
              languageTranslate,
              "imagingFindings",
              false,
            ).toUpperCase()}
          </Title>
          {isCanThiepGroup ? (
            <ImagingStructureTextTable
              rows={imagingRows}
              setRows={setImagingRows}
              isEdit={isEdit}
            />
          ) : (
            <ImagingStructureTable
              rows={imagingRows}
              setRows={setImagingRows}
              isEdit={isEdit}
              setDiagnosisSummary={setDiagnosisSummary}
              abnormalFindings={abnormalFindings}
              form={form}
            />
          )}
          {/* Kết luận */}

          <ImagingDiagnosisSection
            isEdit={isEdit}
            form={form}
            languageTranslate={languageTranslate}
            translateLabel={translateLabel}
            setDiagnosisSummary={setDiagnosisSummary}
            diagnosisSummary={diagnosisSummary}
          />

          {(initialSnap.apiData?.id_doctor == doctor.id ||
            user.id_role == USER_ROLE.ADMIN ||
            !editId) && (
            <FormActionBar
              actionKeys={[
                KEY_ACTION_BUTTON.reset,
                KEY_ACTION_BUTTON.save,
                KEY_ACTION_BUTTON.edit,
                KEY_ACTION_BUTTON.approve,
                KEY_ACTION_BUTTON.preview,
                KEY_ACTION_BUTTON.AI,
                KEY_ACTION_BUTTON.exit,
              ]}
              onAction={(key) => {
                pendingAction.current = key;
                form.submit();
              }}
              onApprove={onApprove}
              onPrint={() => {}}
              onReset={restoreFromSnapshot}
              onPreview={() => setPreviewOpen(!previewOpen)}
              isEdit={isEdit}
              onEdit={() => {
                if (isEdit) {
                  setIsEdit(false);
                } else {
                  setIsEdit(
                    initialSnap.apiData?.id_doctor == doctor.id ||
                      user.id_role == USER_ROLE.ADMIN ||
                      !editId,
                  );
                }
              }}
              editId={editId}
              onGenAi={async () => {}}
            />
          )}
        </Form>
      )}

      <Modal
        open={previewOpen}
        onCancel={() => setPreviewOpen(false)}
        footer={null}
        width={1100}
      >
        <PrintPreviewVer3NotDataDiagnose
          formSnapshot={form.getFieldsValue()}
          selectedExamPart={examParts?.find(
            (ex) => ex.id == form.getFieldValue("id_exam_part"),
          )}
          selectedTemplateService={templateServices?.find(
            (ex) => ex.id == form.getFieldValue("id_template_service"),
          )}
          initialSnap={initialSnap}
          editId={editId}
          imagingRows={imagingRows}
        />
      </Modal>
    </div>
  );
}
