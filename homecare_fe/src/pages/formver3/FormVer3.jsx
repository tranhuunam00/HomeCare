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
import { useGlobalAuth } from "../../contexts/AuthContext";
import API_CALL from "../../services/axiosClient"; // axios instance của bạn
import FormActionBar, {
  KEY_ACTION_BUTTON,
} from "../formver2/component/FormActionBar";

import { toast } from "react-toastify";
import CustomSunEditor from "../../components/Suneditor/CustomSunEditor";

import styles from "./FormVer3.module.scss";
import {
  TRANSLATE_LANGUAGE,
  translateLabel,
  USER_ROLE,
} from "../../constant/app";
import { buildFormData, mapApiToForm } from "../formver2/utils";

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

  const editId = id_formVer3 ?? idFromParam;
  const [loading, setLoading] = useState();
  const [isEdit, setIsEdit] = useState(!editId);

  const { examParts, templateServices, user, doctor, formVer3Names } =
    useGlobalAuth();

  const navigate = useNavigate();

  const [filteredFormVer3Names, setFilteredFormVer3Names] = useState([]);

  const selectedTemplateServiceId = Form.useWatch("id_template_service", form);
  const selectedExamPartId = Form.useWatch("id_exam_part", form);

  // Lọc local từ formVer3Names đã có sẵn trong context

  const pendingAction = useRef(null);
  const ngayThucHienISO = useMemo(() => toISODate(new Date()), []);
  const [previewOpen, setPreviewOpen] = useState(false);

  const [languageTranslate, setLanguageTransslate] = useState(
    TRANSLATE_LANGUAGE.VI
  );

  const currentFormVer3Name = useMemo(() => {
    return null;
  }, []);

  const filteredExamParts = useMemo(() => {
    if (!selectedTemplateServiceId) return [];
    return (examParts || []).filter(
      (p) => Number(p.id_template_service) === Number(selectedTemplateServiceId)
    );
  }, [examParts, selectedTemplateServiceId]);

  const onFinish = async (values) => {};

  const onFinishFailed = (err) => {
    console.log("[onFinishFailed] errors:", err?.errorFields);
    toast.error("Vui lòng kiểm tra các trường còn thiếu/không hợp lệ.");
  };

  const restoreFromSnapshot = () => {
    form.resetFields();
  };

  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: 0 }}>
      <Title level={3} style={{ textAlign: "center", marginBottom: 24 }}>
        {editId
          ? "CẬP NHẬT BỘ MẪU KẾT QUẢ D-FORM"
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
            ImageLeftDesc: "Cấu trúc giải phẫu",
            ImageRightDesc: "Quy trình kỹ thuật",
            ImageRightDescLink: "https://home-care.vn/",
            ImageLeftDescLink: "https://home-care.vn/",
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
                  disabled={!isEdit}
                  allowClear
                  onChange={() => {
                    // Clear các field phụ thuộc khi đổi phân hệ
                    form.setFieldsValue({
                      id_exam_part: undefined,
                      id_formver3_name: undefined,
                    });
                    setFilteredFormVer3Names([]);
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
                  disabled={!isEdit || !selectedTemplateServiceId}
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
            {"Kỹ thuật thực hiện".toUpperCase()}
          </Title>

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
    </div>
  );
}
