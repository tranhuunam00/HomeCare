// DFormVer2Detail.jsx (bản vá tập trung vào load/save & field mapping)
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Form,
  Input,
  Select,
  Button,
  Row,
  Col,
  Image,
  Typography,
  Tooltip,
  message,
} from "antd";
import { QuestionCircleOutlined } from "@ant-design/icons";
import { useParams } from "react-router-dom";
import dayjs from "dayjs";
import API_CALL from "../../../services/axiosClient";
import { handleAction } from "../utils";
import { useGlobalAuth } from "../../../contexts/AuthContext";
import ImageBlock from "../component/ImageBlock";
import AdminFormVer2 from "../component/AdminFormVer2";
import FormActionBar from "../component/FormActionBar";

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const LANGUAGE_OPTIONS = [
  { label: "VI", value: "vi" },
  { label: "EN", value: "en" },
];

// ------------ Helpers date/ids ------------
const generateAutoId = () => `DFORM-tự động sinh`;
const todayLabel = () => dayjs().format("DD/MM/YYYY");

// ---------- MAP FROM SERVER -> FORM ----------
function mapFromServer(srv) {
  // Ảnh
  const left = srv.image_form_ver2s?.find((i) => i.kind === "left");
  const right = srv.image_form_ver2s?.find((i) => i.kind === "right");

  return {
    id_template_service: srv.id_template_service,
    id_exam_part: srv.id_exam_part,
    language: srv.language,
    tenMau: srv.ten_mau ?? "",
    ketLuan: srv.ket_luan ?? "",
    quyTrinh: srv.quy_trinh_url ?? "",
    icd10: srv.icd10 ?? "",
    phanDoLoai: srv.phan_do_loai ?? "",
    chanDoanPhanBiet: srv.chan_doan_phan_biet ?? "",
    khuyenNghi: srv.khuyen_nghi ?? "",
    ngayThucHien: dayjs(srv.ngay_thuc_hien).format("DD/MM/YYYY"),
    ImageLeftDesc: left?.desc ?? "",
    ImageLeftLink: left?.url ?? "",
    ImageRightDesc: right?.desc ?? "",
    ImageRightLink: right?.url ?? "",
  };
}

// ---------- MAP FORM -> SERVER PAYLOAD ----------
function mapToServer(values, extra = {}) {
  const {
    id_template_service,
    id_exam_part, // tên đúng theo BE
    language,
    tenMau,
    ketLuan,
    quyTrinh,
    icd10,
    phanDoLoai,
    chanDoanPhanBiet,
    khuyenNghi,
    ImageLeftDesc,
    ImageLeftLink,
    ImageRightDesc,
    ImageRightLink,
  } = values;

  return {
    // các field theo snake_case của BE
    id_template_service,
    id_exam_part,
    language,
    ten_mau: tenMau,
    ket_luan: ketLuan,
    quy_trinh_url: quyTrinh,
    icd10,
    phan_do_loai: phanDoLoai,
    chan_doan_phan_biet: chanDoanPhanBiet,
    khuyen_nghi: khuyenNghi,
    ngay_thuc_hien: dayjs().format("YYYY-MM-DD"),
    // ảnh: khớp structure BE
    image_form_ver2s: [
      {
        kind: "left",
        type: "image",
        url: ImageLeftLink || "",
        desc: ImageLeftDesc || "",
      },
      {
        kind: "right",
        type: "image",
        url: ImageRightLink || "",
        desc: ImageRightDesc || "",
      },
    ],
    // bảng: tuỳ backend của bạn, hiện BE trả table_form_ver2s=[], nếu cần gửi thì map từ tables ở extra
    table_form_ver2s: extra.tables ?? [],
    // các phần bổ sung khác (autoCode, nguoiThucHien...) nếu BE có nhận:
    ...extra.append,
  };
}

export default function DFormVer2Detail() {
  const [form] = Form.useForm();
  const { id } = useParams(); // /form-ver2/:id
  const pendingAction = useRef(null);

  const autoId = useMemo(() => generateAutoId(), []);
  const { examParts = [], templateServices = [] } = useGlobalAuth() || {};

  const [tablesData, setTablesData] = useState([]);
  const [loading, setLoading] = useState(false);

  // ------------ LOAD FORM BY ID ------------
  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        setLoading(true);
        const res = await API_CALL.get(`/form-ver2/${id}`, {
          params: { withTables: true, withImages: true, includeDeleted: false },
        });
        const srv = res?.data?.data?.data;
        if (!srv) return;

        // fill form
        const fv = mapFromServer(srv);
        form.setFieldsValue(fv);

        // nếu BE trả table_form_ver2s theo schema riêng, bạn chuyển về schema AdminFormVer2 của bạn ở đây:
        // (hiện sample BE trả mảng rỗng)
        setTablesData(srv.table_form_ver2s ?? []);
      } catch (e) {
        console.error(e);
        message.error("Không tải được dữ liệu mẫu.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // ------------ SUBMIT ------------
  const onFinish = async (values) => {
    try {
      const payload = mapToServer(values, {
        tables: tablesData,
        append: {
          autoCode: autoId,
          nguoiThucHien: "Login",
        },
      });

      // Lưu theo hành động
      const isUpdate = Boolean(id);
      const url = isUpdate ? `/api/form-ver2/${id}` : `/api/form-ver2`;
      const method = isUpdate ? "put" : "post";

      const rs = await API_CALL[method](url, payload);
      message.success("Đã lưu mẫu");

      // log để bạn so sánh
      // console.log("FE submit:", values);
      // console.log("Mapped payload → BE:", payload);
      // console.log("Server response:", rs?.data);
    } catch (e) {
      console.error(e);
      message.error("Lưu thất bại. Vui lòng kiểm tra lại.");
    } finally {
      // hành vi phụ theo nút bấm
      switch (pendingAction.current) {
        case "approve":
          message.success("Đã APPROVE");
          break;
        case "export":
          message.success("Đã EXPORT (demo)");
          break;
        case "print":
          window.print();
          break;
        default:
          break;
      }
      pendingAction.current = null;
    }
  };

  const onFinishFailed = (err) => {
    console.log("[onFinishFailed] errors:", err?.errorFields);
    message.error("Vui lòng kiểm tra các trường còn thiếu/không hợp lệ.");
  };

  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: 16 }}>
      <Title level={3} style={{ textAlign: "center", marginBottom: 24 }}>
        PHẦN MỀM NHẬP LIỆU BỘ MẪU KẾT QUẢ D-FORM
      </Title>

      <Form
        form={form}
        layout="horizontal"
        labelAlign="left"
        labelCol={{ flex: "0 0 180px" }}
        wrapperCol={{ flex: "1 0 0" }}
        colon={false}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        initialValues={{ language: "vi", ngayThucHien: todayLabel() }}
      >
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              label="Kỹ thuật (1)"
              name="id_template_service"
              rules={[{ required: true, message: "Chọn kỹ thuật" }]}
            >
              <Select placeholder="Chọn kỹ thuật">
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
              label="Bộ phận (2)"
              name="id_exam_part" // ⬅️ tên đúng với BE
              rules={[{ required: true, message: "Chọn bộ phận" }]}
            >
              <Select placeholder="Chọn bộ phận thăm khám">
                {examParts.map((s) => (
                  <Option key={s.id} value={s.id}>
                    {s.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              label="Ngôn ngữ (3)"
              name="language"
              rules={[{ required: true }]}
            >
              <Select options={LANGUAGE_OPTIONS} placeholder="VI / EN" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label="Mã số định danh mẫu (4)">
              <Input value={autoId} readOnly disabled />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          label="Tên mẫu (5)"
          name="tenMau"
          rules={[{ required: true, message: "Nhập tên mẫu" }]}
        >
          <Input placeholder="VD: Nội soi tiêu hóa" />
        </Form.Item>

        <Form.Item label="Kết luận của mẫu (6)" name="ketLuan">
          <Input placeholder="Short text" />
        </Form.Item>

        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item label="Ngày thực hiện (7)" name="ngayThucHien">
              <Input readOnly disabled />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label="Người thực hiện (8)">
              <Input value="Login" readOnly disabled />
            </Form.Item>
          </Col>
        </Row>

        <Title
          level={4}
          style={{ color: "#2f6db8", marginTop: 24, marginBottom: 16 }}
        >
          NỘI DUNG THỰC HIỆN
        </Title>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <ImageBlock
              form={form}
              namePrefix="ImageLeft"
              src="https://via.placeholder.com/640x360?text=Minh+hoa+giai+phau"
              title="Minh hoạ giải phẫu"
            />
          </Col>
          <Col xs={24} md={12}>
            <ImageBlock
              form={form}
              namePrefix="ImageRight"
              src="https://via.placeholder.com/640x360?text=Minh+hoa+quy+trinh+thuc+hien"
              title="Minh hoạ quy trình thực hiện"
            />
          </Col>
        </Row>

        <Title
          level={4}
          style={{ color: "#2f6db8", marginTop: 24, marginBottom: 16 }}
        >
          QUY TRÌNH KỸ THUẬT
        </Title>
        <Form.Item name="quyTrinh" label="Mô tả quy trình">
          <TextArea
            autoSize={{ minRows: 4, maxRows: 10 }}
            placeholder="Nhập mô tả quy trình..."
          />
        </Form.Item>

        <Title
          level={4}
          style={{ color: "#2f6db8", marginTop: 24, marginBottom: 16 }}
        >
          MÔ TẢ HÌNH ẢNH
        </Title>
        <AdminFormVer2 onChange={setTablesData} value={tablesData} />

        <Title
          level={4}
          style={{ color: "#2f6db8", marginTop: 24, marginBottom: 16 }}
        >
          KẾT LUẬN, CHẨN ĐOÁN
        </Title>
        <Form.Item label="Kết luận (6)" name="ketLuan">
          <Input placeholder="Short text" />
        </Form.Item>

        <Form.Item
          label={
            <span>
              Phân loại ICD-10
              <Tooltip title="Tra cứu ICD-10">
                <a
                  href="https://icd.kcb.vn/icd-10/icd10"
                  target="_blank"
                  rel="noreferrer"
                  style={{ marginLeft: 4 }}
                >
                  <QuestionCircleOutlined />
                </a>
              </Tooltip>
            </span>
          }
          name="icd10"
        >
          <Input placeholder="Link/Code ICD-10" />
        </Form.Item>

        <Form.Item label="Phân độ, phân loại" name="phanDoLoai">
          <Input placeholder="Short text" />
        </Form.Item>
        <Form.Item label="Chẩn đoán phân biệt" name="chanDoanPhanBiet">
          <Input placeholder="Short text" />
        </Form.Item>

        <Title
          level={4}
          style={{ color: "#2f6db8", marginTop: 24, marginBottom: 16 }}
        >
          KHUYẾN NGHỊ & TƯ VẤN (10)
        </Title>
        <Form.Item name="khuyenNghi">
          <TextArea
            autoSize={{ minRows: 4, maxRows: 10 }}
            placeholder="Nhập khuyến nghị & tư vấn..."
          />
        </Form.Item>

        <FormActionBar
          onAction={(key) => handleAction({ key, form, pendingAction })}
        />
      </Form>

      {loading && (
        <div style={{ textAlign: "center", marginTop: 12 }}>
          <Image
            width={24}
            preview={false}
            src="https://i.gifer.com/ZZ5H.gif"
          />
        </div>
      )}
    </div>
  );
}
