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
  buildFormData,
  buildFormDataDoctorUseFormVer2,
  buildPrompt,
  mapApiToForm,
  normalizeTablesFromApi,
} from "../../formver2/utils";
import { USER_ROLE } from "../../../constant/app";
import { useGlobalAuth } from "../../../contexts/AuthContext";
import dayjs from "dayjs";

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
  const { examParts, templateServices, user, doctor, formVer2Names } =
    useGlobalAuth();
  const { provinces, wards, setSelectedProvince } = useVietnamAddress();
  const editId = null;
  const navigate = useNavigate();
  const { id } = useParams();
  const [idEdit, setIdEdit] = useState(id);
  const [dataInit, setDataInit] = useState();

  const [filteredFormVer2Names, setFilteredFormVer2Names] = useState([]);

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
        setDataInit(apiData);
        // Map API -> form values
        const formValues = {
          doctor_use_form_ver2_name: apiData.ten_mau,
          id_template_service: apiData.id_template_service,
          id_exam_part: apiData.id_exam_part,
          language: apiData.language,
          id_formver2_name: apiData.id_formver2_form_ver2?.id_formver2_name,
          id_print_template: apiData.id_print_template,
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
        };
        setSelectedProvince(apiData.benh_nhan_dia_chi_tinh_thanh_pho);

        // fill vào form
        form.setFieldsValue(formValues);

        // fill ảnh
        const left = apiData.image_doctor_use_form_ver2s?.find(
          (x) => x.kind === "left"
        )?.url;
        const right = apiData.image_doctor_use_form_ver2s?.find(
          (x) => x.kind === "right"
        )?.url;

        setImageLeftUrl(left || "");
        setImageRightUrl(right || "");
        setImageDescEditor(apiData.imageDescEditor || "");

        setInitialSnap({
          formValues,
          apiData,
          left,
          right,
          imageDesc: apiData.imageDescEditor,
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
    if (!selectedTemplateServiceId) {
      setPrintTemplate();
      setPrintTemplateList([]);
      form.setFieldValue("id_print_template", null);
    }
    const fetchTemplates = async () => {
      try {
        const [printRes] = await Promise.all([
          API_CALL.get("/print-template", {
            params: {
              page: 1,
              limit: 1000,
              id_template_service: +selectedTemplateServiceId || -1,
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

    if (selectedTemplateServiceId) {
      fetchTemplates();
    }
  }, [selectedTemplateServiceId]);

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
        (n.isUsed == isUse || n.id == currentId)
    );

    setFilteredFormVer2Names(filtered);
  }, [
    formVer2Names,
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

  const [loading, setLoading] = useState(idFormVer2);
  const [isEdit, setIsEdit] = useState(!idFormVer2);

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
        const tables = normalizeTablesFromApi(apiData?.table_form_ver2s);
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

        setInitialSnap({ formValues, tables, imageDesc, left, right, apiData });
      } catch (e) {
        toast.error("Không tải được dữ liệu. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    })();
  }, [form, idFormVer2]);

  const onFinish = async (values) => {
    if (isUse) {
      try {
        setLoading(true);
        const fd = buildFormDataDoctorUseFormVer2(values, {
          imageDescEditor,
          id_formver2: idFormVer2 || dataInit?.id_formver2,
          doctor,
          ngayThucHienISO: dataInit?.ngay_thuc_hien || ngayThucHienISO,
        });
        const res = await API_CALL.postForm(`/doctor-use-form-ver2`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Lưu chế độ sử dụng thành công");
      } catch (error) {
        toast.error("Lưu thất bại ", error);
      } finally {
        setLoading(false);
      }
      return;
    }
  };

  const onFinishFailed = (err) => {
    console.log("[onFinishFailed] errors:", err?.errorFields);
    toast.error("Vui lòng kiểm tra các trường còn thiếu/không hợp lệ.");
  };

  const restoreFromSnapshot = () => {
    if (!initialSnap) return;
    const { formValues, imageDesc, left, right } = initialSnap;

    form.resetFields();
    form.setFieldsValue(formValues);

    setImageDescEditor(imageDesc);
    setImageLeftUrl(left);
    setImageRightUrl(right);
  };

  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: 0 }}>
      <Title level={3} style={{ textAlign: "center", marginBottom: 24 }}>
        BỘ MẪU KẾT QUẢ D-FORM
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
            THÔNG TIN BỆNH NHÂN
          </Title>

          {isUse && (
            <>
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Họ tên"
                    name="benh_nhan_ho_ten"
                    rules={[
                      { required: true, message: "Nhập họ tên bệnh nhân" },
                    ]}
                  >
                    <Input placeholder="VD: Nguyễn Văn A" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Giới tính"
                    name="benh_nhan_gioi_tinh"
                    rules={[{ required: true, message: "Chọn giới tính" }]}
                  >
                    <Select placeholder="Chọn giới tính">
                      <Option value="Nam">Nam</Option>
                      <Option value="Nữ">Nữ</Option>
                      <Option value="Khác">Khác</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Tuổi"
                    name="benh_nhan_tuoi"
                    rules={[{ required: true, message: "Nhập tuổi bệnh nhân" }]}
                  >
                    <Input type="number" placeholder="VD: 45" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item label="Quốc tịch" name="benh_nhan_quoc_tich">
                    <Input placeholder="VD: Việt Nam" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item label="Điện thoại" name="benh_nhan_dien_thoai">
                    <Input placeholder="SĐT liên hệ" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item label="Email" name="benh_nhan_email">
                    <Input type="email" placeholder="Email liên hệ" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="PID (Mã định danh)"
                    name="benh_nhan_pid"
                    required
                  >
                    <Input
                      onChange={(e) => {
                        form.setFieldValue(
                          "benh_nhan_sid",
                          `${e.target.value}-${dayjs().format("DDMMYY-HHmmss")}`
                        );
                      }}
                      placeholder="CCCD"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item label="SID" name="benh_nhan_sid" required>
                    <Input disabled={true} placeholder="PID-DATE-TIME" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="benh_nhan_dia_chi_tinh_thanh_pho"
                    label="Tỉnh/Thành phố"
                    rules={[{ required: true }]}
                  >
                    <Select
                      placeholder="Chọn Tỉnh / Thành phố"
                      onChange={(val) => {
                        form.setFieldsValue({
                          benh_nhan_dia_chi_tinh_thanh_pho: val,
                          benh_nhan_dia_chi_xa_phuong: undefined,
                        });
                        setSelectedProvince(val);
                      }}
                    >
                      {provinces.map((prov) => (
                        <Option key={prov.code} value={prov.code}>
                          {prov.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="benh_nhan_dia_chi_xa_phuong"
                    label="Phường/Xã"
                    rules={[{ required: true }]}
                  >
                    <Select
                      onChange={(val) => {
                        form.setFieldsValue({
                          benh_nhan_dia_chi_xa_phuong: val,
                        });
                      }}
                      placeholder="Chọn Xã / Phường"
                      disabled={!wards.length}
                    >
                      {wards.map((ward) => (
                        <Option key={ward.code} value={ward.code}>
                          {ward.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item
                label="Địa chỉ (số nhà)"
                name="benh_nhan_dia_chi_so_nha"
              >
                <Input placeholder="VD: 123 Lê Lợi" />
              </Form.Item>

              <Form.Item label="Lâm sàng" name="benh_nhan_lam_sang">
                <TextArea
                  autoSize={{ minRows: 3, maxRows: 6 }}
                  placeholder="Nhập triệu chứng lâm sàng..."
                />
              </Form.Item>
            </>
          )}
          <Title level={4} style={{ color: "#2f6db8", margin: "24px 0 16px" }}>
            THÔNG TIN MẪU FORM VER 2
          </Title>

          <Row gutter={16}>
            <Col xs={24} md={24}>
              <Form.Item
                label="Tên kết quả"
                name="doctor_use_form_ver2_name"
                required
              >
                <Input
                  disabled={!isEdit}
                  placeholder="VD: Kết quả bệnh nhân A ngày "
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Phân hệ"
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
                      id_formver2_name: undefined,
                    });
                    setFilteredFormVer2Names([]);
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
                label="Bộ phận"
                name="id_exam_part"
                rules={[{ required: true, message: "Chọn bộ phận" }]}
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
                label="Ngôn ngữ"
                name="language"
                rules={[{ required: true }]}
              >
                <Select
                  disabled={!isEdit}
                  options={LANGUAGE_OPTIONS}
                  placeholder="VI / EN"
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Mã số định danh mẫu">
                <Input
                  value={currentFormVer2Name?.code || ""}
                  readOnly
                  disabled
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={24}>
              <Form.Item
                label="Tên FormVer 2"
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
            label="Mẫu header in"
            name="id_print_template"
            rules={[{ required: true, message: "Chọn mẫu in" }]}
          >
            <Select
              disabled={!selectedTemplateServiceId}
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
              {printTemplateList
                .filter(
                  (t) => t.id_template_service == selectedTemplateServiceId
                )
                .map((tpl) => (
                  <Option key={tpl.id} value={tpl.id}>
                    {tpl.name}
                  </Option>
                ))}
            </Select>
          </Form.Item>

          <Row gutter={16}>
            <Col xs={24} md={24}>
              <Form.Item label="Kết luận của mẫu" name="ket_luan">
                <Input disabled={!isEdit} placeholder="VD: U máu gan" />
              </Form.Item>
            </Col>
          </Row>

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
            NỘI DUNG THỰC HIỆN
          </Title>

          <Row gutter={[16, 16]} style={{ justifyContent: "space-between" }}>
            <Col xs={24} md={12}>
              <ImageBlock
                form={form}
                namePrefix="ImageLeft"
                src={ImageLeftUrl}
                title="Ảnh minh họa 1"
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
                title="Ảnh minh họa 2"
                onChange={(value) => {
                  setImageRightUrl(value);
                }}
                disabled={!isEdit}
              />
            </Col>
          </Row>

          {/* Quy trình */}
          <Title level={4} style={{ color: "#2f6db8", margin: "24px 0 16px" }}>
            QUY TRÌNH KỸ THUẬT
          </Title>
          <Form.Item name="quy_trinh_url" label="" tooltip="Short text">
            <TextArea
              disabled={!isEdit}
              autoSize={{ minRows: 4, maxRows: 10 }}
              placeholder="Nhập mô tả quy trình kỹ thuật..."
            />
          </Form.Item>

          <CustomSunEditor
            value={imageDescEditor}
            onChange={setImageDescEditor}
            className={styles.formVer2Editor}
            disabled={!isEdit}
          />

          {/* Kết luận */}
          <Title level={4} style={{ color: "#2f6db8", margin: "24px 0 16px" }}>
            KẾT LUẬN, CHẨN ĐOÁN
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
                Phân loại ICD-10
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

          <Form.Item label="Phân độ, phân loại" name="phan_do_loai">
            <Input disabled={!isEdit} placeholder="Short text" />
          </Form.Item>

          <Form.Item label="Chẩn đoán phân biệt" name="chan_doan_phan_biet">
            <Input disabled={!isEdit} placeholder="Short text" />
          </Form.Item>

          <Title level={4} style={{ color: "#2f6db8", margin: "24px 0 16px" }}>
            KHUYẾN NGHỊ & TƯ VẤN
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
              keys={[
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
                      currentFormVer2Name,
                      imageDescHTML: imageDescEditor || "", // lấy từ state của bạn
                    });

                    const url = `https://api.home-care.vn/chatgpt/ask-gemini-recommendation?prompt=${encodeURIComponent(
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
          currentFormVer2Name={currentFormVer2Name}
          editId={editId}
        />
      </Modal>
    </div>
  );
}
