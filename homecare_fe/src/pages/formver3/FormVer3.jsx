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
} from "antd";
import { QuestionCircleOutlined } from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import ImageBlock from "./component/ImageBlock";
import AdminFormVer2 from "./component/AdminFormVer2";
import FormActionBar, { KEY_ACTION_BUTTON } from "./component/FormActionBar";
import { useGlobalAuth } from "../../contexts/AuthContext";
import API_CALL from "../../services/axiosClient"; // axios instance của bạn
import {
  buildFormData,
  buildPrompt,
  mapApiToForm,
  normalizeTablesFromApi,
} from "./utils";
import { toast } from "react-toastify";
import CustomSunEditor from "../../components/Suneditor/CustomSunEditor";

import styles from "./FormVer2.module.scss";
import PrintPreviewVer2NotDataDiagnose from "./PreviewVer2/PrintPreviewVer2NotDataDiagnose";
import {
  TRANSLATE_LANGUAGE,
  translateLabel,
  USER_ROLE,
} from "../../constant/app";

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

/* ============== CONSTS ============== */
const LANGUAGE_OPTIONS = [
  { label: "VI", value: "vi" },
  { label: "EN", value: "en" },
];

const toISODate = (d = new Date()) => new Date(d).toISOString().slice(0, 10); // YYYY-MM-DD

/* ============== MAPPERS ============== */
// Map API → Form initialValues

export default function DFormVer3({
  id_form_ver3,
  isDoctor = false,
  onFormChange,
  onTablesChange,
  onPrint,
}) {
  const [form] = Form.useForm();
  const { examParts, templateServices, user, doctor, formVer3Names } =
    useGlobalAuth();

  const navigate = useNavigate();
  const { id: idFromParam } = useParams();

  const [filteredFormVer3Names, setFilteredFormVer3Names] = useState([]);

  const [initialSnap, setInitialSnap] = useState({
    formValues: null,
    tables: null,
    imageDesc: null,
    left: null,
    right: null,
    apiData: null,
  });

  const editId = id_form_ver3 ?? idFromParam;

  const selectedTemplateServiceId = Form.useWatch("id_template_service", form);
  const selectedExamPartId = Form.useWatch("id_exam_part", form);
  const selectedFormVer3NameId = Form.useWatch("id_formver3_name", form);

  const currentFormVer3Name = useMemo(() => {
    const byPick = (formVer3Names || []).find(
      (n) => n.id === selectedFormVer3NameId
    );
    if (byPick) return byPick;

    // fallback cho case edit khi chưa đổi select
    const snap = initialSnap?.apiData?.id_formver3_name_form_ver2_name;
    return snap ? { id: snap.id, name: snap.name, code: snap.code } : null;
  }, [selectedFormVer3NameId, formVer3Names, initialSnap]);
  // Lọc local từ formVer3Names đã có sẵn trong context
  useEffect(() => {
    if (!selectedTemplateServiceId || !selectedExamPartId) {
      setFilteredFormVer3Names([]);
      return;
    }

    const currentId = initialSnap?.apiData?.id_formver3_name_form_ver2_name?.id;
    const filtered = (formVer3Names || []).filter(
      (n) =>
        Number(n.id_template_service) === Number(selectedTemplateServiceId) &&
        Number(n.id_exam_part) === Number(selectedExamPartId) &&
        (!n.isUsed || n.id == currentId)
    );

    setFilteredFormVer3Names(filtered);
  }, [
    formVer3Names,
    selectedTemplateServiceId,
    selectedExamPartId,
    initialSnap,
  ]);

  const pendingAction = useRef(null);
  const ngayThucHienISO = useMemo(() => toISODate(new Date()), []);
  const [previewOpen, setPreviewOpen] = useState(false);

  // preview images (chỉ để xem), dữ liệu save lấy từ form
  const [ImageLeftUrl, setImageLeftUrl] = useState("");
  const [ImageRightUrl, setImageRightUrl] = useState("");

  const [imageDescEditor, setImageDescEditor] = useState("");

  const [tablesData, setTablesData] = useState([]);
  const [loading, setLoading] = useState(editId);
  const [isEdit, setIsEdit] = useState(!editId);

  const [languageTranslate, setLanguageTransslate] = useState(
    TRANSLATE_LANGUAGE.VI
  );

  useEffect(() => {
    onTablesChange?.(tablesData);
  }, [tablesData, onTablesChange]);

  useEffect(() => {
    onFormChange?.({
      ...form.getFieldsValue(),
      ImageLeftUrl,
      ImageRightUrl,
    });
  }, [ImageLeftUrl, ImageRightUrl]);

  const filteredExamParts = useMemo(() => {
    if (!selectedTemplateServiceId) return [];
    return (examParts || []).filter(
      (p) => Number(p.id_template_service) === Number(selectedTemplateServiceId)
    );
  }, [examParts, selectedTemplateServiceId]);

  // ====== Fetch when edit ======
  useEffect(() => {
    if (!editId) return;
    (async () => {
      setLoading(true);
      try {
        const res = await API_CALL.get(
          `/form-ver2/${editId}?withTables=true&withImages=true&includeDeleted=false`
        );
        const apiData = res?.data?.data?.data;
        if (!apiData) throw new Error("Không đọc được dữ liệu form");

        const formValues = mapApiToForm(apiData);
        setLanguageTransslate(apiData?.language || "vi");
        const imageDesc = apiData?.imageDescEditor
          ? JSON.parse(apiData.imageDescEditor)
          : "";

        const left =
          apiData?.image_form_ver2s?.find((x) => x.kind === "left")?.url || "";
        const right =
          apiData?.image_form_ver2s?.find((x) => x.kind === "right")?.url || "";
        // set form state hiển thị
        form.setFieldsValue(formValues);
        setImageDescEditor(imageDesc);
        setImageLeftUrl(left);
        setImageRightUrl(right);

        setInitialSnap({ formValues, imageDesc, left, right, apiData });
      } catch (e) {
        toast.error("Không tải được dữ liệu. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    })();
  }, [editId, form]);

  const onFinish = async (values) => {
    if (!isDoctor) {
      try {
        if (!editId) {
          const leftFile = values.ImageLeftFile?.[0]?.originFileObj;
          const rightFile = values.ImageRightFile?.[0]?.originFileObj;

          if (!leftFile || !rightFile) {
            toast.error(
              "Vui lòng tải lên đủ 2 ảnh (trái và phải) trước khi lưu"
            );
            return; // dừng luôn
          }
        }

        const fd = buildFormData(values, {
          tablesData,
          ngayThucHienISO,
          imageDescEditor,
        });

        if (editId) {
          await API_CALL.patchForm(`/form-ver2/${editId}`, fd, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          toast.success("Đã cập nhật mẫu thành công");
        } else {
          const res = await API_CALL.postForm(`/form-ver2`, fd, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          const newId = res?.data?.data?.data?.formId;
          toast.success("Đã tạo mẫu thành công");
          if (newId) {
            navigate(`/home/form-drad/detail/${newId}`);
            window.location.reload();
          }
        }

        switch (pendingAction.current) {
          case "approve":
            toast.success("Đã APPROVE");
            navigate(`/home/form-drad`);
            window.location.reload();

            break;
          case "export":
            toast.success("Đã EXPORT (payload form-data đã gửi)");
            break;
          case "print":
            window.print();
            break;
        }
      } catch (e) {
        console.error(e);
        toast.error("Lưu thất bại. Kiểm tra dữ liệu hoặc thử lại sau.");
      } finally {
        pendingAction.current = null;
      }
    }
  };

  const onFinishFailed = (err) => {
    console.log("[onFinishFailed] errors:", err?.errorFields);
    toast.error("Vui lòng kiểm tra các trường còn thiếu/không hợp lệ.");
  };

  const restoreFromSnapshot = () => {
    if (!initialSnap) return;
    const { formValues, tables, imageDesc, left, right } = initialSnap;

    form.resetFields();
    form.setFieldsValue(formValues);

    setTablesData(tables);
    setImageDescEditor(imageDesc);
    setImageLeftUrl(left);
    setImageRightUrl(right);
  };

  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: 0 }}>
      <Title level={3} style={{ textAlign: "center", marginBottom: 24 }}>
        {editId
          ? "CẬP NHẬT BỘ MẪU KẾT QUẢ D-FORM"
          : "TẠO MỚI BỘ MẪU KẾT QUẢ D-FORM"}
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
            ImageLeftDesc: "Cấu trúc giải phẫu",
            ImageRightDesc: "Quy trình kỹ thuật",
            ImageRightDescLink: "https://home-care.vn/",
            ImageLeftDescLink: "https://home-care.vn/",
          }}
          onValuesChange={(_, allValues) => {
            onFormChange?.({
              ...allValues,
              ImageLeftUrl,
              ImageRightUrl,
            });
          }}
        >
          {/* Hàng 1 */}
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label={translateLabel(languageTranslate, "department", false)}
                name="id_template_service"
                rules={[{ required: true, message: "Chọn kỹ thuật" }]}
              >
                <Select
                  placeholder="Chọn kỹ thuật"
                  disabled={isDoctor || !isEdit}
                  allowClear
                  onChange={() => {
                    // Clear các field phụ thuộc khi đổi phân hệ
                    form.setFieldsValue({
                      id_exam_part: undefined,
                      id_formver3_name: undefined,
                    });
                    setFilteredFormVer3Names([]); // làm sạch danh sách tên mẫu lọc theo
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
            <Col xs={24} md={12}>
              <Form.Item
                label={translateLabel(languageTranslate, "bodyPart", false)}
                name="id_exam_part"
                rules={[{ required: true, message: "Chọn bộ phận" }]}
              >
                <Select
                  placeholder="Chọn bộ phận thăm khám"
                  disabled={isDoctor || !isEdit || !selectedTemplateServiceId}
                  allowClear
                  onChange={() => {
                    form.setFieldsValue({ id_formver3_name: undefined });
                  }}
                  notFoundContent={
                    selectedTemplateServiceId
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

          {/* Hàng 2 */}
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
                />
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
                    !isEdit || !selectedTemplateServiceId || !selectedExamPartId
                  }
                  placeholder={
                    !selectedTemplateServiceId || !selectedExamPartId
                      ? "Chọn Phân hệ & Bộ phận trước"
                      : "Chọn tên mẫu"
                  }
                  showSearch
                  optionFilterProp="children"
                  notFoundContent={
                    selectedTemplateServiceId && selectedExamPartId
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
            <Col xs={24} md={24}>
              <Form.Item
                label={translateLabel(languageTranslate, "formResult", false)}
                name="ket_luan"
              >
                <Input disabled={!isEdit} placeholder="VD: U máu gan" />
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

          {/* Ảnh minh hoạ */}
          <Title level={4} style={{ color: "#2f6db8", margin: "24px 0 16px" }}>
            {translateLabel(
              languageTranslate,
              "technicalProtocol",
              false
            ).toUpperCase()}
          </Title>

          <Row gutter={[16, 16]} style={{ justifyContent: "space-between" }}>
            <Col xs={24} md={12}>
              <ImageBlock
                form={form}
                namePrefix="ImageLeft"
                src={ImageLeftUrl}
                title=""
                onChange={(value) => {
                  setImageLeftUrl(value);
                }}
                disabled={!isEdit}
              />
            </Col>
            <Col xs={24} md={12}>
              <ImageBlock
                form={form}
                namePrefix="ImageRight"
                src={ImageRightUrl}
                title=""
                onChange={(value) => {
                  setImageRightUrl(value);
                }}
                disabled={!isEdit}
              />
            </Col>
          </Row>

          <Form.Item name="quy_trinh_url" label="" tooltip="Short text">
            <TextArea
              disabled={!isEdit}
              autoSize={{ minRows: 4, maxRows: 10 }}
              placeholder="Nhập mô tả quy trình kỹ thuật..."
            />
          </Form.Item>

          {/* Bảng mô tả hình ảnh */}
          <Title level={4} style={{ color: "#2f6db8", margin: "24px 0 16px" }}>
            {translateLabel(
              languageTranslate,
              "imagingFindings",
              false
            ).toUpperCase()}
          </Title>
          {/* <AdminFormVer2
            value={tablesData} // state ở cha
            onChange={(next) => {
              // giữ nguyên id theo tid (nếu CreateFormVer2 tạo object mới)
              setTablesData((prev) => {
                const prevByTid = new Map(prev.map((t) => [t.tid, t]));
                return next.map((t) => ({ ...prevByTid.get(t.tid), ...t }));
              });
            }}
          /> */}
          <CustomSunEditor
            value={imageDescEditor}
            onChange={setImageDescEditor}
            className={styles.formVer2Editor}
            disabled={!isEdit}
          />

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
              style={{ height: 200 }}
              placeholder="VD: U máu gan"
            />
          </Form.Item>

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

          {/* Action bar */}
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
                      !editId
                  );
                }
              }}
              editId={editId}
              onGenAi={async () => {
                const handleGenAi = async () => {
                  try {
                    const v = form.getFieldsValue();
                    const selectedExamPart = examParts?.find(
                      (ex) => ex.id == form.getFieldValue("id_exam_part")
                    );
                    const selectedTemplateService = templateServices?.find(
                      (ex) => ex.id == form.getFieldValue("id_template_service")
                    );

                    const prompt = buildPrompt({
                      v,
                      selectedExamPart,
                      selectedTemplateService,
                      currentFormVer3Name,
                      imageDescHTML: imageDescEditor || "", // lấy từ state của bạn
                    });

                    const url = `https://api.home-care.vn/api/chatgpt/ask-gemini-recommendation?prompt=${encodeURIComponent(
                      prompt
                    )}`;
                    const res = await API_CALL.get(url);
                    form.setFieldsValue({ khuyenNghi: res.data.data });
                  } catch (e) {
                    console.error(e);
                    toast.error("Gọi AI thất bại.");
                  }
                };

                await handleGenAi();
              }}
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
        <PrintPreviewVer2NotDataDiagnose
          formSnapshot={form.getFieldsValue()}
          selectedExamPart={examParts?.find(
            (ex) => ex.id == form.getFieldValue("id_exam_part")
          )}
          selectedTemplateService={templateServices?.find(
            (ex) => ex.id == form.getFieldValue("id_template_service")
          )}
          ImageLeftUrl={ImageLeftUrl}
          ImageRightUrl={ImageRightUrl}
          imageDescEditor={imageDescEditor}
          initialSnap={initialSnap}
          currentFormVer3Name={currentFormVer3Name}
          editId={editId}
        />
      </Modal>
    </div>
  );
}
