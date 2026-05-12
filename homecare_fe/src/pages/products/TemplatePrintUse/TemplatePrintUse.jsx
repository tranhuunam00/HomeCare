import React, { useEffect, useState, useRef } from "react";
import {
  Form,
  Input,
  Button,
  Card,
  Typography,
  message,
  Spin,
  Select,
  Upload,
} from "antd";
import { useNavigate } from "react-router-dom";
import API_CALL from "../../../services/axiosClient";
import TemplateHeaderEditor from "../TemplatePrint/Header/TemplateHeaderEditor";
import styles from "./TemplatePrintUse.module.scss";
import { useParams } from "react-router-dom";
import TemplatePatientUser from "../TemplatePrint/HeaderPatientUser/TemplatePatientUser";
import dayjs from "dayjs";
import useVietnamAddress from "../../../hooks/useVietnamAddress";
import { useGlobalAuth } from "../../../contexts/AuthContext";
import ImageWithCaptionInput from "../ImageWithCaptionInput/ImageWithCaptionInput";
import CustomSunEditor from "../../../components/Suneditor/CustomSunEditor";
import { UploadOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";
import { calculateAge } from "../../formver3/formver3.constant";

const { Title } = Typography;
const { Option } = Select;

const TemplatePrintUse = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [headerInfo, setHeaderInfo] = useState({});
  const [template, setTemplate] = useState({});
  const [patient, setPatient] = useState({});

  const { id_print_template } = useParams();
  const [idTemplate, setIdTemplate] = useState();
  const [imageList, setImageList] = useState([]);
  const [combinedHtml, setCombinedHtml] = useState("");

  const [selectedFile, setSelectedFile] = useState(null);

  const { user, doctor } = useGlobalAuth();

  const printRef = useRef();

  const handleUploadPDF = () => {
    if (!selectedFile) {
      message.warning("Vui lòng chọn file PDF trước khi tải lên!");
      return;
    }

    const formData = new FormData();
    formData.append("pdf", selectedFile); // File cần upload
    formData.append("id_print_template", id_print_template || "");
    formData.append("name", form.getFieldValue("name") || "");
    formData.append("status", 1); // Có thể ép kiểu .toString() nếu backend yêu cầu string

    API_CALL.post("/doctor-print-template", formData, {
      headers: {
        "Content-Type": "multipart/form-data", // 👈 Bắt buộc để server hiểu đúng
      },
    })
      .then(() => {
        message.success("Tải file PDF thành công!");
        toast.success("Tải thành công");
        setSelectedFile(null);
        navigate("/home/doctor-used");
        // Reset file sau khi upload thành công
      })
      .catch((err) => {
        console.error(err);
        toast.error("Tải file thất bại!", err?.response?.data?.message);
      });
  };
  const { provinces, wards, setSelectedProvince } = useVietnamAddress();

  useEffect(() => {
    setSelectedProvince(patient.province);
  }, [patient.province]);

  useEffect(() => {
    if (id_print_template) {
      setLoading(true);
      API_CALL.get(`/print-template/${id_print_template}`)
        .then((res) => {
          const data = res.data.data;
          form.setFieldsValue(data);
          if (data) {
            setHeaderInfo(data);
            setIdTemplate(data.id_template);
          }
        })
        .catch(() => message.error("Không thể tải dữ liệu chi tiết"))
        .finally(() => setLoading(false));
    }
  }, [id_print_template]);

  // Khi chọn template → load chi tiết

  useEffect(() => {
    if (idTemplate) {
      setLoading(true);
      API_CALL.get(`/templates/${idTemplate}`)
        .then((res) => {
          const data = res.data.data;
          if (data) {
            setTemplate(data);
            form.setFieldsValue({
              description_template: data.description,
              result_template: data.result,
              recommendation_template: data.recommendation,
            });
          }
        })
        .catch(() => message.error("Không thể tải dữ liệu chi tiết"))
        .finally(() => setLoading(false));
    }
  }, [idTemplate]);

  const onFinish = async (values) => {
    const formData = new FormData();

    // Gộp tất cả dữ liệu cần submit
    const payload = { ...headerInfo, ...values, id_template: idTemplate };

    // Đẩy từng key-value vào FormData
    Object.entries(payload).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value);
      }
    });

    try {
      setLoading(true);
      if (id_print_template) {
        await API_CALL.put(`/print-template/${id_print_template}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        message.success("Cập nhật thành công!");
      } else {
        await API_CALL.post("/print-template", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        message.success("Tạo mới thành công!");
      }
      navigate("/home/templates-print");
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };
  const handlePrint = () => {
    const printContents = printRef.current.innerHTML;
    const newWindow = window.open("", "_blank", "width=800,height=600");
    newWindow.document.write(`
      <html>
        <head>
          <title>HOMECARE</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
            th, td { border: 1px solid #ccc; padding: 4px; text-align: left; }
            h3 { margin-top: 24px; }
          </style>
        </head>
        <body>${printContents}</body>
      </html>
    `);
    newWindow.document.close();
    newWindow.focus();
    newWindow.print();
    newWindow.close();
  };

  const handleFormChange = (_, allValues) => {
    const html = `
    <style>
      table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
      th, td { border: 1px solid #ccc; padding: 2px; text-align: left; }
      h3 {margin-bottom: 20px; margin-top: 40px;}
    </style>
    <h3 style="color: #4299d4">QUY TRÌNH VÀ KĨ THUẬT</h3>
    ${allValues.description_template || ""}
    <h3 style="color: #4299d4">MÔ TẢ HÌNH ẢNH</h3>
    ${allValues.result_template || ""}
    <h3 style="color: #4299d4">KẾT LUẬN CHẨN ĐOÁN</h3>
    ${allValues.recommendation_template || ""}
  `;
    setCombinedHtml(html);
  };

  return (
    <div style={{ display: "flex" }}>
      <Card style={{ maxWidth: 1240, margin: "auto" }}>
        <Title level={3}>Sử dụng mẫu in</Title>

        <Spin spinning={loading}>
          <Form
            layout="vertical"
            form={form}
            onFinish={onFinish}
            onValuesChange={handleFormChange}
          >
            <Form.Item label="Tên mẫu" name="name" rules={[{ required: true }]}>
              <Input />
            </Form.Item>

            <h1 style={{ marginBottom: 30 }}>Thông tin bệnh nhân</h1>
            <TemplatePatientUser value={patient} onChange={setPatient} />

            <h1 style={{ marginBottom: 30 }}>Nội dung tổng hợp</h1>

            <Form.Item label="QUY TRÌNH KỸ THUẬT" name="description_template">
              <CustomSunEditor
                value={template?.value}
                onChange={(value) => {
                  form.setFieldValue("description_template", value);
                }}
              />
            </Form.Item>

            <Form.Item label="MÔ TẢ HÌNH ẢNH" name="result_template">
              <CustomSunEditor
                value={template?.value}
                onChange={(value) => {
                  form.setFieldValue("result_template", value);
                }}
              />
            </Form.Item>

            <Form.Item
              label="KẾT LUẬN CHẨN ĐOÁN"
              name="recommendation_template"
            >
              <CustomSunEditor
                value={template?.value}
                onChange={(value) => {
                  form.setFieldValue("recommendation_template", value);
                }}
              />
            </Form.Item>

            <Form.Item label="Hình ảnh minh họa">
              <ImageWithCaptionInput
                value={imageList}
                onChange={setImageList}
                valueTrans={imageList}
                onChangeTrans={setImageList}
              />
            </Form.Item>

            <h1>Thao tác hoàn thành</h1>
            <Form.Item style={{ marginTop: 24 }}>
              <Button
                style={{ marginLeft: 8 }}
                onClick={() => navigate("/home/templates-print")}
              >
                Hủy
              </Button>
              <Button
                style={{ marginLeft: 8 }}
                type="default"
                onClick={handlePrint}
                disabled={!idTemplate}
              >
                In
              </Button>
            </Form.Item>
          </Form>

          <Card title="Tải file PDF đã in" style={{ marginTop: 24 }}>
            <Upload
              name="file"
              accept=".pdf"
              beforeUpload={(file) => {
                console.log(file);
                setSelectedFile(file); // Lưu file vào state
                return false; // Ngăn không upload ngay
              }}
              showUploadList={{
                showRemoveIcon: true,
              }}
              onRemove={() => setSelectedFile(null)}
              fileList={selectedFile ? [selectedFile] : []}
            >
              <Button icon={<UploadOutlined />}>Chọn file PDF</Button>
            </Upload>

            <Button
              type="primary"
              style={{ marginTop: 16 }}
              disabled={!selectedFile}
              onClick={handleUploadPDF}
            >
              Tải lên
            </Button>
          </Card>
        </Spin>
      </Card>
      <div ref={printRef}>
        <Card
          bordered={false}
          className={`a4-page  ${styles["card-print-template"]}`}
        >
          <header
            className={styles.printHeader}
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 20,
              alignItems: "flex-start",
              gap: 20,
            }}
          >
            <img
              style={{
                marginTop: 10,
                objectFit: "cover",
                alignContent: "center",
              }}
              src={
                headerInfo.logo_url ||
                "https://via.placeholder.com/150x100?text=Logo"
              }
              alt="Logo"
              width={100}
              height={100}
            />
            <div style={{ maxWidth: "350px" }}>
              <p
                className={styles.printHeader_name}
                style={{ fontWeight: 600, color: "red", fontSize: 16 }}
              >
                {headerInfo.clinic_name || "[Tên phòng khám]"}
              </p>
              <p style={{ fontSize: 14 }}>
                <strong>Khoa:</strong> {headerInfo.department_name || "-"}
              </p>
              <p style={{ fontSize: 14 }}>
                <strong>Địa chỉ:</strong> {headerInfo.address || "-"}
              </p>
            </div>
            <div style={{ maxWidth: "280px" }}>
              <p style={{ fontSize: 14 }}>
                <strong>Website:</strong>
                <i>{headerInfo.website || "http://..."}</i>
              </p>
              <p style={{ fontSize: 14 }}>
                <strong>Hotline:</strong> {headerInfo.phone || "..."}
              </p>
              <p style={{ fontSize: 14 }}>
                <strong>Email:</strong>
                <i>{headerInfo.email || "example@email.com"}</i>
              </p>
            </div>
          </header>
          <div>
            <h3>THÔNG TIN HÀNH CHÍNH</h3>
            <div
              style={{
                marginBottom: 4,
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 16,
                }}
              >
                <div style={{ width: 150 }}>
                  <p
                    style={{
                      fontSize: 16,
                      fontWeight: 600,
                      margin: 0,
                      padding: 0,
                    }}
                  >
                    Họ và tên:
                  </p>
                </div>
                <p style={{ fontSize: 16, margin: 0, padding: 0 }}>
                  {patient.full_name}
                </p>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 16,
                }}
              >
                <div style={{ width: 150 }}>
                  <p
                    style={{
                      fontWeight: 600,
                      width: 100,
                      margin: 0,
                      padding: 0,
                    }}
                  >
                    Giới tính:
                  </p>
                </div>
                <p style={{ margin: 0, padding: 0 }}>{patient.gender}</p>
              </div>
            </div>

            <div
              style={{
                marginBottom: 4,
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 16,
                }}
              >
                <div style={{ width: 150 }}>
                  <p
                    style={{
                      fontSize: 16,
                      fontWeight: 600,
                      margin: 0,
                      padding: 0,
                    }}
                  >
                    Năm sinh:
                  </p>
                </div>
                <p style={{ fontSize: 16, margin: 0, padding: 0 }}>
                  {dayjs(patient.dob).format("YYYY")}
                </p>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 16,
                  margin: 0,
                  padding: 0,
                }}
              >
                <div style={{ width: 150 }}>
                  <p
                    style={{
                      fontWeight: 600,
                      width: 100,
                      margin: 0,
                      padding: 0,
                    }}
                  >
                    Tuổi:
                  </p>
                </div>
                <p style={{ margin: 0, padding: 0 }}>
                  {calculateAge(patient.dob, patient.birth_year)}
                </p>
              </div>
            </div>

            <div
              style={{
                marginBottom: 4,
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ width: 150 }}>
                  <strong>Địa chỉ:</strong>
                </div>
                <div>
                  <div style={{ width: 150 }}>
                    <strong>Quốc gia</strong>
                  </div>
                  <div>Việt Nam</div>
                </div>
                <div>
                  <div style={{ width: 150 }}>
                    <strong>Tỉnh/Thành phố</strong>
                  </div>
                  <div>
                    {provinces.find((s) => s.code == patient.province)?.name}
                  </div>
                </div>
                <div>
                  <div style={{ width: 150 }}>
                    <strong>Quận/Huyện</strong>
                  </div>
                  <div>{wards.find((s) => s.code == patient.wards)?.name}</div>
                </div>
                <div>
                  <div style={{ width: 150 }}>
                    <strong>Số nhà</strong>
                  </div>
                  <div>{patient.address}</div>
                </div>
              </div>
            </div>

            <div
              style={{
                marginBottom: 4,
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ width: 150 }}>
                  <strong>Điện thoại:</strong>
                </div>
                {patient.phone_number}
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ width: 50 }}>
                  <strong>Email:</strong>
                </div>
                {patient.email}
              </div>
            </div>

            <div
              style={{
                marginBottom: 4,
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ width: 150 }}>
                  <strong>Triệu chứng:</strong>
                </div>
                {patient.symptoms}
              </div>
            </div>
            <div
              style={{
                marginBottom: 4,
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ width: 150 }}>
                  <strong>Diễn biến:</strong>
                </div>
                {patient.progress}
              </div>
            </div>
            <div
              style={{
                marginBottom: 4,
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ width: 150 }}>
                  <strong>Tiền sử bệnh:</strong>
                </div>
                {patient.medical_history}
              </div>
            </div>

            <div
              style={{
                marginBottom: 4,
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ width: 150 }}>
                  <strong>So sánh:</strong>
                </div>
                {patient.compare_link}
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ width: 100 }}>
                  <strong>Có kết quả cũ:</strong>
                </div>
                {patient.old_date}
              </div>
            </div>
          </div>

          <div
            className="print-content"
            dangerouslySetInnerHTML={{ __html: combinedHtml }}
          />

          <h3>BÁC SĨ THỰC HIỆN</h3>

          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <section>
              <div style={{ display: "flex", marginBottom: 10 }}>
                <div style={{ width: 150 }}>
                  <strong>Họ và tên:</strong>
                </div>
                {doctor.full_name}
              </div>
              <div style={{ display: "flex", marginBottom: 10 }}>
                <div style={{ width: 150 }}>
                  <strong>Điện thoại:</strong>
                </div>
                {doctor.phone_number}
              </div>
              <div style={{ display: "flex", marginBottom: 10 }}>
                <div style={{ width: 150 }}>
                  <strong>Thời gian:</strong>
                </div>
                {dayjs().format("DD-MM-YYYY HH:mm")}
              </div>
              <div style={{ display: "flex", marginBottom: 10 }}>
                <div style={{ width: 150 }}>
                  <strong>Chữ ký số:</strong>
                </div>
                {doctor.e_signature_url}
              </div>
            </section>
            <section>
              <img src={doctor?.avatar_url} alt="" width={150} height={150} />
            </section>
            <section>
              <img
                src={doctor?.signature_url}
                alt=""
                width={150}
                height={150}
              />
            </section>
          </div>
          <h3 style="color: #4299d4">HÌNH ẢNH MINH HỌA</h3>
          <div
            style={{
              display: "flex",
              justifyContent: "space-evenly",
              flexWrap: "wrap",
            }}
          >
            {imageList.map((item, idx) => (
              <section key={idx}>
                <img
                  src={item.url}
                  alt={`img-${idx}`}
                  width={250}
                  height={250}
                />
                <p style={{ width: 250 }}>{item.caption}</p>
              </section>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default TemplatePrintUse;
