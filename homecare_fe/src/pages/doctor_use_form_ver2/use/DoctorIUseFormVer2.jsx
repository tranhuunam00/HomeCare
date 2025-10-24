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
import { QuestionCircleOutlined } from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";

import { toast } from "react-toastify";

import styles from "./DoctorIUseFormVer2.module.scss";
import ImageBlock from "../../formver2/component/ImageBlock";
import FormActionBar, {
  KEY_ACTION_BUTTON,
} from "../../formver2/component/FormActionBar";
import CustomSunEditor from "../../../components/Suneditor/CustomSunEditor";
import PrintPreviewVer2NotDataDiagnose from "../../formver2/PreviewVer2/PrintPreviewVer2NotDataDiagnose";
import useVietnamAddress from "../../../hooks/useVietnamAddress";
import API_CALL from "../../../services/axiosClient";
import {
  buildFormDataDoctorUseFormVer2,
  buildPrompt,
  mapApiToForm,
} from "../../formver2/utils";
import {
  sortTemplateServices,
  TRANSLATE_LANGUAGE,
  translateLabel,
  USER_ROLE,
} from "../../../constant/app";
import { useGlobalAuth } from "../../../contexts/AuthContext";
import HistoryModal from "./items/HistoryModal";
import ImageWithCaptionInput from "../../products/ImageWithCaptionInput/ImageWithCaptionInput";
import PatientInfoSection from "./items/PatientInfoForm";
import TranslateListRecords from "./items/TranslateListRecords";
import { APPROVAL_STATUS } from "../../../components/ApprovalStatusTag";

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

export default function DoctorUseDFormVer2({
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
    formVer2Names,
    setIsReadingForm,
  } = useGlobalAuth();

  useEffect(() => {
    setIsReadingForm(true);
    return () => {
      setIsReadingForm(false);
    };
  }, []);
  const { provinces, wards, setSelectedProvince } = useVietnamAddress();
  const navigate = useNavigate();
  const { id } = useParams();
  const [idEdit, setIdEdit] = useState(id);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [translateOpen, setTranslateOpen] = useState(false);

  const [imageList, setImageList] = useState([{}, {}, {}]);
  const [filteredFormVer2Names, setFilteredFormVer2Names] = useState([]);
  const [resetKey, setResetKey] = useState(0);
  const [languageTranslate, setLanguageTransslate] = useState(
    TRANSLATE_LANGUAGE.VI
  );
  const [status, setStatus] = useState(APPROVAL_STATUS.DRAFT);

  const [initialSnap, setInitialSnap] = useState({
    formValues: null,
    tables: null,
    imageDesc: null,
    left: null,
    right: null,
    apiData: null,
  });
  const [idFormVer2, setIdFormVer2] = useState();
  const [printTemplateList, setPrintTemplateList] = useState([]);
  const [printTemplate, setPrintTemplate] = useState(null);

  const selectedTemplateServiceId = Form.useWatch("id_template_service", form);
  const selectedExamPartId = Form.useWatch("id_exam_part", form);
  const selectedFormVer2NameId = Form.useWatch("id_formver2_name", form);
  useEffect(() => {
    if (!idEdit) return;

    const fetchDetail = async () => {
      try {
        setLoading(true);
        const res = await API_CALL.get(`/doctor-use-form-ver2/detail`, {
          params: {
            id: idEdit,
            withDoctor: true,
            withClinic: true,
            withFormVer2: true,
            withPatientDiagnose: true,
          },
        });

        const apiData = res?.data?.data?.data;
        if (!apiData) throw new Error("Không đọc được dữ liệu");
        // fill ảnh

        const left = apiData.image_doctor_use_form_ver2s?.find(
          (x) => x.kind === "left"
        );
        const right = apiData.image_doctor_use_form_ver2s?.find(
          (x) => x.kind === "right"
        );

        // Map API -> form values
        const formValues = {
          doctor_use_form_ver2_name: apiData.ten_mau,
          id_template_service: apiData.id_template_service,
          id_exam_part: apiData.id_exam_part,
          language: apiData.language,
          id_formver2_name: apiData.id_formver2_form_ver2?.id_formver2_name,
          id_print_template: +apiData.id_print_template,
          ket_luan: apiData.ket_luan,
          ket_qua_chan_doan: apiData.ket_qua_chan_doan,
          icd10: apiData.icd10,
          phan_do_loai: apiData.phan_do_loai,
          chan_doan_phan_biet: apiData.chan_doan_phan_biet,
          khuyen_nghi: apiData.khuyen_nghi,
          benh_nhan_ho_ten: apiData.benh_nhan_ho_ten,
          benh_nhan_gioi_tinh: apiData.benh_nhan_gioi_tinh,
          benh_nhan_tuoi: apiData.benh_nhan_tuoi,
          benh_nhan_quoc_tich: apiData.benh_nhan_quoc_tich,
          benh_nhan_dien_thoai: apiData.benh_nhan_dien_thoai,
          benh_nhan_email: apiData.benh_nhan_email,
          benh_nhan_pid: apiData.benh_nhan_pid,
          benh_nhan_sid: apiData.benh_nhan_sid,
          benh_nhan_lam_sang: apiData.benh_nhan_lam_sang,
          createdAt: apiData.createdAt,
          doctor_name: apiData.id_doctor_doctor?.full_name,
          ngay_thuc_hien: apiData.ngay_thuc_hien,
          quy_trinh_url: apiData.quy_trinh_url,
          benh_nhan_dia_chi_so_nha: apiData.benh_nhan_dia_chi_so_nha,
          benh_nhan_dia_chi_xa_phuong: apiData.benh_nhan_dia_chi_xa_phuong,
          benh_nhan_dia_chi_tinh_thanh_pho:
            apiData.benh_nhan_dia_chi_tinh_thanh_pho,
          ImageLeftDesc: left?.desc || "",
          ImageLeftDescLink: left?.link || "",
          ImageRightDesc: right?.desc || "",
          ImageRightDescLink: right?.link || "",
          ImageRightUrl: right?.url || "",
          ImageLeftUrl: left?.url || "",
        };
        setSelectedProvince(apiData.benh_nhan_dia_chi_tinh_thanh_pho);
        setLanguageTransslate(apiData.language);
        const descImages =
          apiData.image_doctor_use_form_ver2s
            ?.filter((x) => x.kind === "desc") // chỉ lấy ảnh mô tả
            ?.map((x, idx) => ({
              url: x.url,
              caption: x.desc || "",
              rawUrl: x.url,
              file: undefined, // ảnh từ API thì chưa có file local
            })) || [];

        setImageList(descImages);
        // fill vào form
        form.setFieldsValue(formValues);
        setStatus(apiData.approval_status);
        setImageLeftUrl(left.url || "");
        setImageRightUrl(right.url || "");
        setImageDescEditor(apiData.imageDescEditor || "");
        setPrintTemplate(apiData?.id_print_template_print_template);

        setInitialSnap({
          formValues,
          apiData,
          left: left.url,
          right: right.url,
          imageDesc: apiData.imageDescEditor,
          descImages: [...descImages.map((i) => ({ ...i }))],
        });
      } catch (err) {
        toast.error("Không load được chi tiết form");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [idEdit]);

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
    if (
      printTemplateList.length > 0 &&
      !form.getFieldValue("id_print_template")
    ) {
      const firstTpl = printTemplateList[0];
      form.setFieldsValue({ id_print_template: firstTpl.id });
      setPrintTemplate(firstTpl);
    }
  }, [printTemplateList]);

  const currentFormVer2Name = useMemo(() => {
    const byPick = (formVer2Names || []).find(
      (n) => n.id === selectedFormVer2NameId
    );
    if (byPick) return byPick;

    // fallback cho case edit khi chưa đổi select
    const snap = initialSnap?.apiData?.id_formver2_name_form_ver2_name;
    return snap ? { id: snap.id, name: snap.name, code: snap.code } : null;
  }, [selectedFormVer2NameId, formVer2Names, initialSnap]);
  // Lọc local từ formVer2Names đã có sẵn trong context
  useEffect(() => {
    if (!selectedTemplateServiceId || !selectedExamPartId) {
      setFilteredFormVer2Names([]);
      return;
    }

    const currentId = initialSnap?.apiData?.id_formver2_name_form_ver2_name?.id;
    const filtered = (formVer2Names || []).filter(
      (n) =>
        Number(n.id_template_service) === Number(selectedTemplateServiceId) &&
        Number(n.id_exam_part) === Number(selectedExamPartId) &&
        (n.isUsed == isUse || n.id == currentId) &&
        n.language?.includes(languageTranslate)
    );

    setFilteredFormVer2Names(filtered);
  }, [
    formVer2Names,
    selectedTemplateServiceId,
    selectedExamPartId,
    initialSnap,
    languageTranslate,
  ]);

  const pendingAction = useRef(null);
  const ngayThucHienISO = useMemo(() => toISODate(new Date()), []);
  const [previewOpen, setPreviewOpen] = useState(false);

  // preview images (chỉ để xem), dữ liệu save lấy từ form
  const [ImageLeftUrl, setImageLeftUrl] = useState("");
  const [ImageRightUrl, setImageRightUrl] = useState("");

  const [imageDescEditor, setImageDescEditor] = useState("");

  const [loading, setLoading] = useState();

  const [isEdit, setIsEdit] = useState(!idEdit);

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

  useEffect(() => {
    if (!idFormVer2) return;
    (async () => {
      setLoading(true);
      try {
        const res = await API_CALL.get(
          `/form-ver2/${idFormVer2}?withTables=true&withImages=true&includeDeleted=false`
        );
        const apiData = res?.data?.data?.data;
        if (!apiData) throw new Error("Không đọc được dữ liệu form");

        const formValues = mapApiToForm(apiData);
        const imageDesc = apiData?.imageDescEditor
          ? JSON.parse(apiData.imageDescEditor)
          : "";

        const left =
          apiData?.image_form_ver2s?.find((x) => x.kind === "left")?.url || "";
        const right =
          apiData?.image_form_ver2s?.find((x) => x.kind === "right")?.url || "";
        console.log("formValues", formValues);
        // set form state hiển thị
        form.setFieldsValue(formValues);
        setImageDescEditor(imageDesc);
        setImageLeftUrl(left);
        setImageRightUrl(right);
      } catch (e) {
        toast.error("Không tải được dữ liệu. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    })();
  }, [form, idFormVer2]);

  const onFinish = async (values) => {
    if (!isUse) return;

    try {
      setLoading(true);

      // 🟢 Nếu không phải "Phê duyệt" → thực hiện lưu form
      const fd = buildFormDataDoctorUseFormVer2(values, {
        imageDescEditor,
        id_formver2: idFormVer2 || initialSnap.apiData?.id_formver2,
        doctor,
        ngayThucHienISO: initialSnap.apiData?.ngay_thuc_hien || ngayThucHienISO,
        prev_id: initialSnap?.apiData?.id,
        id_root: initialSnap?.apiData?.id_root || initialSnap?.apiData?.id,
        imageList,
      });

      const res = await API_CALL.postForm(`/doctor-use-form-ver2`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Lưu chế độ sử dụng thành công");

      const newId = res?.data?.data?.data?.data?.id;
      setIdEdit(newId);
      setStatus(false);

      switch (pendingAction.current) {
        case "export":
          toast.success("Đã EXPORT (payload form-data đã gửi)");
          break;
        case "print":
          window.print();
          break;
        default:
          navigate(`/home/doctor-use-form-drad/detail/${newId}`);
          break;
      }
    } catch (error) {
      console.error("error", error);
      toast.error("Lưu thất bại");
    } finally {
      setLoading(false);
    }
  };

  const onFinishFailed = (err) => {
    console.log("[onFinishFailed] errors:", err?.errorFields);
    toast.error("Vui lòng kiểm tra các trường còn thiếu/không hợp lệ.");
  };

  const restoreFromSnapshot = () => {
    if (!window.confirm("Bạn có chắc muốn khôi phục dữ liệu không?")) {
      return;
    }
    if (!idEdit) {
      form.resetFields();
      setImageDescEditor("<p></p>");
      setImageLeftUrl();
      setImageRightUrl();
      setImageList([]);
    } else {
      const { formValues, imageDesc, left, right, descImages } = initialSnap;

      form.setFieldsValue({
        ...formValues,
        ImageLeftFile: [],
        ImageRightFile: [],
      });

      setImageDescEditor(imageDesc);
      setImageLeftUrl(left);
      setImageRightUrl(right);
      setImageList(descImages);
    }
    setResetKey((k) => k + 1);
  };

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
        PHẦN MỀM D-RADS
      </Title>
      <Title
        level={3}
        style={{
          textAlign: "center",
          marginBottom: 8,
          marginTop: 8,
          color: "rgba(18, 119, 49, 1)",
        }}
      >
        ĐỌC KẾT QUẢ
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
          onFinishFailed={onFinishFailed}
          initialValues={{
            language: "vi",
            createdAt: ngayThucHienISO,
            doctor_name: doctor?.full_name,
            ImageLeftDesc: "Cấu trúc giải phẫu",
            ImageRightDesc: "Quy trình kỹ thuật",
            ImageRightDescLink: "https://home-care.vn/",
            ImageLeftDescLink: "https://home-care.vn/",
            benh_nhan_quoc_tich: "Việt Nam",
            ngay_thuc_hien: ngayThucHienISO,
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
          {/* <Row gutter={16}>
            <Col xs={24} md={24}>
              <Form.Item
                label="Tên kết quả"
                name="doctor_use_form_ver2_name"
                rules={[
                  { required: true, message: "Vui lòng nhập tên kết quả" },
                ]}
                required
              >
                <Input
                  disabled={!isEdit}
                  placeholder="VD: Kết quả bệnh nhân A ngày "
                />
              </Form.Item>
            </Col>
          </Row> */}

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
                  disabled={!isEdit}
                  allowClear
                  onChange={() => {
                    form.setFieldsValue({
                      id_exam_part: undefined,
                      id_formver2_name: undefined,
                    });
                    setFilteredFormVer2Names([]);
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

            <Col xs={24} md={9}>
              <Form.Item
                label={translateLabel(languageTranslate, "bodyPart", false)}
                name="id_exam_part"
                rules={[{ required: true, message: "Chọn bộ phận" }]}
                labelCol={{ flex: "0 0 90px" }}
              >
                <Select
                  placeholder="Chọn bộ phận thăm khám"
                  disabled={!isEdit || !selectedTemplateServiceId}
                  allowClear
                  onChange={() => {
                    form.setFieldsValue({ id_formver2_name: undefined });
                  }}
                  notFoundContent={
                    selectedTemplateServiceId
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
                  options={LANGUAGE_OPTIONS}
                  placeholder="VI / EN"
                  onChange={(lang) => setLanguageTransslate(lang)}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={24}>
              <Form.Item
                label={translateLabel(
                  languageTranslate,
                  "resultTemplate",
                  false
                )}
                name="id_formver2_name"
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
                  onChange={async (id_formver2_name) => {
                    if (isUse) {
                      // nếu là đang sử dụng
                      try {
                        const res = await API_CALL.get(
                          `/form-ver2/detail?id_formver2_name=${id_formver2_name}&withTables=false&withImages=false&includeDeleted=false`
                        );
                        setIdFormVer2(res.data.data.data.id);
                      } catch (e) {
                        toast.error(
                          "Không tải được dữ liệu. Vui lòng thử lại."
                        );
                      } finally {
                        setLoading(false);
                      }
                    }
                  }}
                >
                  {filteredFormVer2Names.map((item) => (
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

          {/* <Row gutter={16}>
            <Col xs={24} md={24}>
              <Form.Item label="Kết luận của mẫu" name="ket_luan">
                <Input disabled={!isEdit} placeholder="VD: U máu gan" />
              </Form.Item>
            </Col>
          </Row> */}

          {/* Thông tin hệ thống */}
          {!isUse && (
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item label="Ngày thực hiện" name={"createdAt"}>
                  <Input value={ngayThucHienISO} readOnly disabled />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Người thực hiện" name="doctor_name">
                  <Input readOnly disabled />
                </Form.Item>
              </Col>
            </Row>
          )}

          {/* Ảnh minh hoạ */}
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
                disabledLink={user?.id_role != USER_ROLE.ADMIN}
                key={resetKey}
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
                disabledLink={user?.id_role != USER_ROLE.ADMIN}
              />
            </Col>
          </Row>

          {/* Ảnh minh hoạ */}
          <Title level={4} style={{ color: "#2f6db8", margin: "24px 0 16px" }}>
            {translateLabel(
              languageTranslate,
              "imagingFindings",
              false
            ).toUpperCase()}
          </Title>

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
              style={{ height: 200, fontWeight: "bold" }}
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
              keys={[
                KEY_ACTION_BUTTON.reset,
                KEY_ACTION_BUTTON.save,
                KEY_ACTION_BUTTON.edit,
                KEY_ACTION_BUTTON.approve,
                KEY_ACTION_BUTTON.preview,
                KEY_ACTION_BUTTON.AI,
                KEY_ACTION_BUTTON.exit,
                KEY_ACTION_BUTTON.translate,
              ]}
              onExit={() => {
                if (!window.confirm("Bạn có chắc muốn thoát không?")) {
                  return;
                }
                navigate(`/home/doctor-use-form-drad`);
              }}
              onApprove={async () => {
                try {
                  if (
                    !window.confirm(
                      "Bạn có chắc muốn xác nhận bản ghi này không? Lưu ý khi xác nhận sẽ không thể sửa đổi!"
                    )
                  ) {
                    return;
                  }
                  setLoading(true);
                  await API_CALL.patch(
                    `/doctor-use-form-ver2/${idEdit}/approve`,
                    {
                      approval_status: APPROVAL_STATUS.APPROVED,
                    }
                  );

                  toast.success(`Phê duyệt Form #${idEdit} thành công!`);
                  setStatus(APPROVAL_STATUS.APPROVED);
                } catch (err) {
                  console.error("Approve error:", err);
                  toast.error("Phê duyệt thất bại!");
                } finally {
                  setLoading(false);
                }
              }}
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
              onGenAi={async () => {
                const handleGenAi = async () => {
                  if (
                    !window.confirm(
                      "Bạn có chắc muốn sử dụng tính năng AI không?"
                    )
                  ) {
                    return;
                  }
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
                      currentFormVer2Name,
                      imageDescHTML: imageDescEditor || "", // lấy từ state của bạn
                    });

                    const url = `https://api.home-care.vn/api/chatgpt/ask-gemini-recommendation?prompt=${encodeURIComponent(
                      prompt
                    )}`;
                    const res = await API_CALL.get(url);

                    // Đổ thẳng vào "Khuyến nghị & tư vấn"
                    form.setFieldsValue({ khuyen_nghi: res.data.data });
                  } catch (e) {
                    console.error(e);
                    toast.error("Gọi AI thất bại.");
                  }
                };

                await handleGenAi();
              }}
              onViewTranslate={async () => {
                try {
                  setLoading(true);

                  const existPreviousTranslate = await API_CALL.get(
                    "doctor-use-form-ver2",
                    {
                      params: {
                        id_root:
                          initialSnap?.apiData?.id_root ||
                          initialSnap?.apiData?.id ||
                          -1,
                        includeDeleted: false,
                      },
                    }
                  );
                  const existItems = existPreviousTranslate.data.data.items;
                  if (languageTranslate == TRANSLATE_LANGUAGE.VI) {
                    const existTranslateRecord = existItems.find(
                      (et) =>
                        et.id != idEdit &&
                        et.language != TRANSLATE_LANGUAGE.VI &&
                        !et.deletedAt
                    );
                    if (existTranslateRecord) {
                      navigate(
                        `/home/doctor-use-form-drad/detail/${existTranslateRecord.id}`
                      );
                      setIdEdit(existTranslateRecord.id);
                      return;
                    }
                    setLanguageTransslate(TRANSLATE_LANGUAGE.ENG);
                    form.setFieldValue("language", TRANSLATE_LANGUAGE.ENG);
                  } else {
                    const existTranslateRecord = existItems.find(
                      (et) =>
                        et.id != idEdit &&
                        et.language != TRANSLATE_LANGUAGE.ENG &&
                        !et.deletedAt
                    );
                    if (existTranslateRecord) {
                      navigate(
                        `/home/doctor-use-form-drad/detail/${existTranslateRecord.id}`
                      );
                      setIdEdit(existTranslateRecord.id);

                      return;
                    }
                    setLanguageTransslate(TRANSLATE_LANGUAGE.VI);
                    form.setFieldValue("language", TRANSLATE_LANGUAGE.VI);
                  }
                } catch (error) {
                } finally {
                  setLoading(false);
                }
              }}
              onTranslate={async () => {
                try {
                  if (
                    !window.confirm(
                      "Bạn có chắc muốn dịch bản ghi này từ tiếng Việt sang tiếng Anh không? Hệ thống sẽ tự động tạo bản dịch mới."
                    )
                  ) {
                    return;
                  }

                  const differentLanguageRecords = idEdit
                    ? await API_CALL.get("/doctor-use-form-ver2", {
                        params: {
                          id_root: initialSnap?.apiData?.id_root || idEdit,
                          includeDeleted: false,
                          page: 1,
                          limit: 100,
                          language: "en",
                        },
                      })
                    : null;

                  const records =
                    differentLanguageRecords?.data?.data?.items?.filter(
                      (a) => !a.deletedAt
                    ) || [];
                  console.log("records", records);

                  if (records?.length) {
                    toast.info(
                      `Bạn đã có bản dịch của SID này bằng tiếng Anh rồi! với ID: ${records[0].id}`
                    );
                    return;
                  }

                  setLanguageTransslate("en");
                  form.setFieldValue("language", "en");
                  setLoading(true);

                  const [translatedAddon, translatedImageDescEditor] =
                    await Promise.all([
                      API_CALL.post(
                        "translate/object-google",
                        {
                          ["noidung"]: {
                            quy_trinh_url: form.getFieldValue("quy_trinh_url"),
                            ket_qua_chan_doan:
                              form.getFieldValue("ket_qua_chan_doan"),
                            phan_do_loai: form.getFieldValue("phan_do_loai"),
                            icd10: form.getFieldValue("icd10"),
                            chan_doan_phan_biet: form.getFieldValue(
                              "chan_doan_phan_biet"
                            ),
                            khuyen_nghi: form.getFieldValue("khuyen_nghi"),
                            ImageLeftDesc: form.getFieldValue("ImageLeftDesc"),
                            ImageRightDesc:
                              form.getFieldValue("ImageRightDesc"),
                          },
                          targetLang: "en",
                          sourceLang: "vi",
                        },
                        { timeout: 120000 }
                      ),
                      API_CALL.post(
                        "translate/html-text-google",
                        {
                          text: imageDescEditor,
                          targetLang: "en",
                          sourceLang: "vi",
                        },
                        { timeout: 120000 }
                      ),
                    ]);
                  setImageDescEditor(translatedImageDescEditor.data.data);

                  form.setFieldValue(
                    "quy_trinh_url",
                    translatedAddon.data.data.quy_trinh_url
                  );
                  form.setFieldValue(
                    "ket_qua_chan_doan",
                    translatedAddon.data.data.ket_qua_chan_doan
                  );
                  form.setFieldValue(
                    "phan_do_loai",
                    translatedAddon.data.data.phan_do_loai
                  );
                  form.setFieldValue("icd10", translatedAddon.data.data.icd10);
                  form.setFieldValue(
                    "chan_doan_phan_biet",
                    translatedAddon.data.data.chan_doan_phan_biet
                  );
                  form.setFieldValue(
                    "khuyen_nghi",
                    translatedAddon.data.data.khuyen_nghi
                  );
                  form.setFieldValue(
                    "ImageLeftDesc",
                    translatedAddon.data.data.ImageLeftDesc
                  );
                  form.setFieldValue(
                    "ImageRightDesc",
                    translatedAddon.data.data.ImageRightDesc
                  );

                  // 🟢 3. Build lại giá trị đã dịch
                  const values = {
                    ...form.getFieldsValue(true),
                    language: "en",
                    quy_trinh_url: translatedAddon.data.data.quy_trinh_url,
                    ket_qua_chan_doan:
                      translatedAddon.data.data.ket_qua_chan_doan,
                    phan_do_loai: translatedAddon.data.data.phan_do_loai,
                    icd10: translatedAddon.data.data.icd10,
                    chan_doan_phan_biet:
                      translatedAddon.data.data.chan_doan_phan_biet,
                    khuyen_nghi: translatedAddon.data.data.khuyen_nghi,
                    ImageLeftDesc: translatedAddon.data.data.ImageLeftDesc,
                    ImageRightDesc: translatedAddon.data.data.ImageRightDesc,
                  };

                  // 🟢 4. Dùng buildFormData nhưng bỏ ID gốc để tạo bản mới
                  const fd = buildFormDataDoctorUseFormVer2(values, {
                    id_formver2: idFormVer2 || initialSnap.apiData?.id_formver2,
                    doctor,
                    imageDescEditor: translatedImageDescEditor.data.data,
                    ngayThucHienISO: toISODate(),
                    imageList,
                  });

                  fd.delete("prev_id");
                  fd.delete("id_root");

                  fd.append(
                    "id_root",
                    initialSnap?.apiData?.id_root ||
                      initialSnap?.apiData?.id ||
                      idEdit
                  );

                  toast.info("Đang lưu bản dịch tiếng Anh...");
                  const res = await API_CALL.postForm(
                    `/doctor-use-form-ver2`,
                    fd,
                    {
                      headers: { "Content-Type": "multipart/form-data" },
                    }
                  );

                  const newId = res?.data?.data?.data?.data?.id;
                  if (newId) {
                    toast.success(
                      `Đã dịch và tạo bản mới thành công (ID: ${newId})!`
                    );
                    setStatus(false);
                    setIdEdit(newId);
                    navigate(`/home/doctor-use-form-drad/detail/${newId}`);
                  } else {
                    toast.warning(
                      "Dịch thành công nhưng không nhận được ID mới!"
                    );
                  }
                } catch (error) {
                  console.error("Translate & Save Error:", error);
                  toast.error("Lỗi khi dịch hoặc lưu bản dịch!");
                } finally {
                  setLoading(false);
                }
              }}
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
      <Modal
        open={previewOpen}
        onCancel={() => setPreviewOpen(false)}
        footer={null}
        width={1100}
      >
        <PrintPreviewVer2NotDataDiagnose
          approvalStatus={status}
          formSnapshot={{
            ...form.getFieldsValue(),
            createdAt: initialSnap?.apiData?.createdAt,
          }}
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
          currentFormVer2Name={currentFormVer2Name}
          editId={idEdit}
          imageList={imageList}
          isUse={isUse}
          doctor={initialSnap?.apiData?.id_doctor_doctor || doctor}
          printTemplate={
            printTemplate ||
            initialSnap.apiData?.id_print_template_print_template
          }
          languageTranslate={languageTranslate}
        />
      </Modal>
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
    </div>
  );
}
