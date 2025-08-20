import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Form,
  Input,
  Select,
  Button,
  Typography,
  Row,
  Col,
  message,
  Tooltip,
  Spin,
} from "antd";
import { QuestionCircleOutlined } from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import ImageBlock from "./component/ImageBlock";
import AdminFormVer2 from "./component/AdminFormVer2";
import FormActionBar from "./component/FormActionBar";
import { useGlobalAuth } from "../../contexts/AuthContext";
import API_CALL from "../../services/axiosClient"; // axios instance của bạn
import { buildFormData, mapApiToForm, normalizeTablesFromApi } from "./utils";
import { toast } from "react-toastify";

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

/* ============== CONSTS ============== */
const LANGUAGE_OPTIONS = [
  { label: "VI", value: "vi" },
  { label: "EN", value: "en" },
];

// random-ish auto code (bạn có thể giữ cách cũ nếu muốn)
const generateAutoId = () => `Tự động`;

const toISODate = (d = new Date()) => new Date(d).toISOString().slice(0, 10); // YYYY-MM-DD

/* ============== MAPPERS ============== */
// Map API → Form initialValues

export default function DFormVer2({
  id_form_ver2,
  isDoctor = false,
  onFormChange,
  onTablesChange,
  onPrint,
}) {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id: idFromParam } = useParams();
  const editId = id_form_ver2 ?? idFromParam;
  const isEdit = editId != null && editId !== "";

  const pendingAction = useRef(null);
  const autoId = useMemo(() => generateAutoId(), []);
  const ngayThucHienISO = useMemo(() => toISODate(new Date()), []);

  const { examParts, templateServices } = useGlobalAuth();

  // preview images (chỉ để xem), dữ liệu save lấy từ form
  const [ImageLeftUrl, setImageLeftUrl] = useState(
    "https://via.placeholder.com/640x360?text=Minh+hoa+giai+phau"
  );
  const [ImageRightUrl, setImageRightUrl] = useState(
    "https://via.placeholder.com/640x360?text=Minh+hoa+quy+trinh+thuc+hi%C3%AAn"
  );

  const [tablesData, setTablesData] = useState([]);
  const [loading, setLoading] = useState(isEdit);

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

  // ====== Fetch when edit ======
  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        setLoading(true);
        const res = await API_CALL.get(
          `/form-ver2/${editId}?withTables=true&withImages=true&includeDeleted=false`
        );
        const apiData = res?.data?.data?.data; // theo response bạn gửi
        if (!apiData) throw new Error("Không đọc được dữ liệu form");
        // fill form
        form.setFieldsValue(mapApiToForm(apiData));
        setTablesData(normalizeTablesFromApi(apiData?.table_form_ver2s));

        // ảnh để xem trước (không bắt buộc)
        const left = apiData?.image_form_ver2s?.find((x) => x.kind === "left");
        const right = apiData?.image_form_ver2s?.find(
          (x) => x.kind === "right"
        );
        if (left?.url) setImageLeftUrl(left.url);
        if (right?.url) setImageRightUrl(right.url);
        // bảng (nếu có)
      } catch (e) {
        console.error(e);
        message.error("Không tải được dữ liệu. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    })();
  }, [isEdit, editId, form]);

  const onFinish = async (values) => {
    try {
      const fd = buildFormData(values, {
        tablesData,
        autoId,
        ngayThucHienISO,
      });

      if (isEdit) {
        await API_CALL.patchForm(`/form-ver2/${editId}`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Đã cập nhật mẫu thành công");
      } else {
        const res = await API_CALL.postForm(`/form-ver2`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        const newId = res?.data?.data?.data?.id;
        toast.success("Đã tạo mẫu thành công");
        if (newId) navigate(`/form-ver2/${newId}`);
      }

      switch (pendingAction.current) {
        case "approve":
          toast.success("Đã APPROVE");
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
  };

  const onFinishFailed = (err) => {
    console.log("[onFinishFailed] errors:", err?.errorFields);
    toast.error("Vui lòng kiểm tra các trường còn thiếu/không hợp lệ.");
  };

  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: 0 }}>
      <Title level={3} style={{ textAlign: "center", marginBottom: 24 }}>
        {isEdit
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
          initialValues={{ language: "vi" }}
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
                label="Kỹ thuật (1)"
                name="id_template_service"
                rules={[{ required: true, message: "Chọn kỹ thuật" }]}
              >
                <Select placeholder="Chọn kỹ thuật" disabled={isDoctor}>
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
                name="id_exam_part" // ✅ key đúng BE
                rules={[{ required: true, message: "Chọn bộ phận" }]}
              >
                <Select
                  placeholder="Chọn bộ phận thăm khám"
                  disabled={isDoctor}
                >
                  {examParts.map((s) => (
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

          <Row gutter={16}>
            <Col xs={24} md={24}>
              <Form.Item
                label="Tên mẫu (5)"
                name="tenMau"
                rules={[{ required: true, message: "Nhập tên mẫu" }]}
              >
                <Input placeholder="VD: Siêu âm bụng tổng quát nam" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={24}>
              <Form.Item label="Kết luận của mẫu (6)" name="ketLuan">
                <Input placeholder="VD: U máu gan" />
              </Form.Item>
            </Col>
          </Row>

          {/* Thông tin hệ thống */}
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item label="Ngày thực hiện (7)">
                <Input value={ngayThucHienISO} readOnly disabled />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Người thực hiện (8)">
                <Input value="Login" readOnly disabled />
              </Form.Item>
            </Col>
          </Row>

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
                title="Minh hoạ giải phẫu (cố định, có mô tả & link)"
                onChange={(value) => {
                  setImageLeftUrl(value);
                }}
              />
            </Col>
            <Col xs={24} md={12}>
              <ImageBlock
                form={form}
                namePrefix="ImageRight"
                src={ImageRightUrl}
                title="Minh hoạ quy trình thực hiện (cố định, có mô tả & link)"
                onChange={(value) => {
                  setImageRightUrl(value);
                }}
              />
            </Col>
          </Row>

          {/* Quy trình */}
          <Title level={4} style={{ color: "#2f6db8", margin: "24px 0 16px" }}>
            QUY TRÌNH KỸ THUẬT
          </Title>
          <Form.Item
            name="quyTrinh"
            label="Mô tả quy trình"
            tooltip="Short text"
          >
            <TextArea
              autoSize={{ minRows: 4, maxRows: 10 }}
              placeholder="Nhập mô tả quy trình kỹ thuật..."
            />
          </Form.Item>

          {/* Bảng mô tả hình ảnh */}
          <Title level={4} style={{ color: "#2f6db8", margin: "24px 0 16px" }}>
            MÔ TẢ HÌNH ẢNH
          </Title>
          <AdminFormVer2
            value={tablesData} // state ở cha
            onChange={(next) => {
              // giữ nguyên id theo tid (nếu CreateFormVer2 tạo object mới)
              setTablesData((prev) => {
                const prevByTid = new Map(prev.map((t) => [t.tid, t]));
                return next.map((t) => ({ ...prevByTid.get(t.tid), ...t }));
              });
            }}
          />

          {/* Kết luận */}
          <Title level={4} style={{ color: "#2f6db8", margin: "24px 0 16px" }}>
            KẾT LUẬN, CHẨN ĐOÁN
          </Title>
          <Form.Item
            name="ketQuaChanDoan"
            rules={[{ required: true, message: "Nhập kết luận" }]}
          >
            <TextArea style={{ height: 200 }} placeholder="VD: U máu gan" />
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
            <Input placeholder="Link/Code ICD-10" />
          </Form.Item>

          <Form.Item label="Phân độ, phân loại" name="phanDoLoai">
            <Input placeholder="Short text" />
          </Form.Item>

          <Form.Item label="Chẩn đoán phân biệt" name="chanDoanPhanBiet">
            <Input placeholder="Short text" />
          </Form.Item>

          <Title level={4} style={{ color: "#2f6db8", margin: "24px 0 16px" }}>
            KHUYẾN NGHỊ & TƯ VẤN (10)
          </Title>
          <Form.Item name="khuyenNghi" tooltip="Có thể tích hợp ChatGPT D-RADS">
            <TextArea
              autoSize={{ minRows: 4, maxRows: 10 }}
              placeholder="Nhập khuyến nghị & tư vấn..."
            />
          </Form.Item>

          {/* Action bar */}
          <FormActionBar
            onAction={(key) => {
              pendingAction.current = key;
              form.submit();
            }}
            onPrint={onPrint}
            onReset={() => form.resetFields()}
          />
        </Form>
      )}
    </div>
  );
}
