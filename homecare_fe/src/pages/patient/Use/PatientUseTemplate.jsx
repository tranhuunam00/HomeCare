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
  Row,
  Col,
} from "antd";
import { useNavigate } from "react-router-dom";
import API_CALL from "../../../services/axiosClient";
import { useParams } from "react-router-dom";
import dayjs from "dayjs";
import { UploadOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";
import { useGlobalAuth } from "../../../contexts/AuthContext";
import useVietnamAddress from "../../../hooks/useVietnamAddress";
import ImageWithCaptionInput from "../../products/ImageWithCaptionInput/ImageWithCaptionInput";
import { renderDynamicAntdFields } from "../../../components/RenderInputFormTemplate";
import { extractDynamicFieldsFromHtml } from "../../../constant/app";

export const replaceInputsInHtml = (html, inputsRender) => {
  const fields = extractDynamicFieldsFromHtml(html);
  let result = html;

  fields.forEach((field) => {
    const replacement = inputsRender[field.raw] ?? ""; // Nếu không có thì ""
    result = result.replaceAll(field.raw, replacement);
  });

  return result;
};

const calculateAge = (dob) => {
  if (!dob) return "";
  const today = dayjs();
  const birthDate = dayjs(dob);
  return today.diff(birthDate, "year");
};
const { Title } = Typography;
const { Option } = Select;

const PatientUseTemplate = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [printTemplate, setPrintTemplate] = useState({});
  const [template, setTemplate] = useState({});

  const { id_patient_diagnose } = useParams();
  const [idTemplate, setIdTemplate] = useState();
  const [imageList, setImageList] = useState([]);
  const [combinedHtml, setCombinedHtml] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [patientDiagnose, setPatientDiagnose] = useState();
  const [printTemplateList, setPrintTemplateList] = useState([]);
  const { templateServices, user, doctor } = useGlobalAuth();
  const [idTemplateService, setIdTemplateService] = useState();

  const [inputsRender, setInputsRender] = useState([]);
  const [inputsAddon, setInputsAddon] = useState([]);

  console.log("inputsRender", inputsRender);

  // Lấy danh sách tất cả template
  useEffect(() => {
    API_CALL.get("/print-template", {
      params: {
        page: 1,
        limit: 1000,
        id_template_service: +idTemplateService,
      },
    })
      .then((res) => {
        const data = res.data.data?.data || res.data.data || [];
        setPrintTemplateList(data);
      })
      .catch(() => message.error("Không thể tải danh sách template"));
  }, [idTemplateService]);

  useEffect(() => {
    API_CALL.get(`/templates/${idTemplate}`)
      .then((res) => {
        const data = res.data.data?.data || res.data.data || {};
        setTemplate(data);
      })
      .catch(() => message.error("Không thể tải danh sách template"));
  }, [idTemplate]);

  useEffect(() => {
    const html = `
    <style>
      table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
      th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
      h3 {margin-bottom: 20px; margin-top: 40px;}
    </style>
    <h3>QUY TRÌNH VÀ KĨ THUẬT</h3>
    ${replaceInputsInHtml(template?.description || "", inputsRender)}
    <h3>KẾT LUẬN CHẨN ĐOÁN</h3>
    ${replaceInputsInHtml(template?.result || "", inputsRender)}
    <h3>KHUYẾN NGHỊ</h3>
    ${replaceInputsInHtml(template?.recommendation || "", inputsRender)}
  `;
    setCombinedHtml(html);
  }, [template, inputsRender]);

  const printRef = useRef();

  const handleUploadPDF = () => {
    if (!selectedFile) {
      message.warning("Vui lòng chọn file PDF trước khi tải lên!");
      return;
    }

    const formData = new FormData();
    formData.append("pdf", selectedFile); // File cần upload
    formData.append("name", form.getFieldValue("name") || "");
    formData.append("status", 1);
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
  const {
    provinces,
    districts,
    setSelectedProvince,
    wards,
    setSelectedDistrict,
  } = useVietnamAddress();

  console.log("patientDiagnose", patientDiagnose);
  useEffect(() => {
    setSelectedProvince(patientDiagnose?.province_code);
    setSelectedDistrict(patientDiagnose?.district_code);
  }, [patientDiagnose]);

  console.log("wards", wards);
  useEffect(() => {
    if (id_patient_diagnose) {
      setLoading(true);
      API_CALL.get(`/patient-diagnose/${id_patient_diagnose}`)
        .then((res) => {
          const data = res.data.data;
          setPatientDiagnose(data);
        })
        .catch(() => message.error("Không thể tải dữ liệu chi tiết"))
        .finally(() => setLoading(false));
    }
  }, [id_patient_diagnose]);

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
            th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
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

  return (
    <div style={{ display: "flex" }}>
      <Card style={{ width: 600, margin: "0" }}>
        <Title level={3}>Phiếu kết quả</Title>

        <div style={{ marginBottom: 20 }}>
          <Select
            showSearch
            allowClear
            style={{ width: 400 }}
            value={idTemplateService}
            placeholder="Chọn dịch vụ"
            optionFilterProp="children"
            onChange={(val) => {
              setIdTemplateService(val);
              setIdTemplate(null);
              setTemplate(null);
              setPrintTemplate(null);
            }}
            filterOption={(input, option) =>
              option.children.toLowerCase().includes(input.toLowerCase())
            }
          >
            {templateServices.map((tpl) => (
              <Option key={tpl.id} value={tpl.id}>
                {tpl.name}
              </Option>
            ))}
          </Select>
        </div>

        <div style={{ marginBottom: 20 }}>
          <Select
            showSearch
            allowClear
            style={{ width: 400 }}
            value={printTemplate?.id}
            placeholder="Chọn template cần xem trước"
            optionFilterProp="children"
            onChange={(val) => {
              const printT = printTemplateList.find((t) => t.id == val);
              setPrintTemplate(printT);
              setIdTemplate(printT.id_template);
            }}
            filterOption={(input, option) =>
              option.children.toLowerCase().includes(input.toLowerCase())
            }
          >
            {printTemplateList
              .filter((t) => t.id_template_service == idTemplateService)
              .map((tpl) => (
                <Option key={tpl.id} value={tpl.id}>
                  {tpl.name}
                </Option>
              ))}
          </Select>
        </div>

        <Spin spinning={loading}>
          <Card style={{ fontSize: 11, padding: 8 }}>
            <div style={{ marginBottom: 8, fontSize: 11 }}>
              <div style={{ marginBottom: 4 }}>Triệu chứng</div>
              <Input.TextArea
                size="small"
                rows={2}
                name="symptoms"
                onChange={(e) =>
                  setInputsAddon({
                    ...inputsAddon,
                    [e.target.name]: e.target.value,
                  })
                }
                style={{ fontSize: 11 }}
              />
            </div>

            <div style={{ marginBottom: 8, fontSize: 11 }}>
              <div style={{ marginBottom: 4 }}>Diễn biến</div>
              <Input
                size="small"
                name="progress"
                onChange={(e) =>
                  setInputsAddon({
                    ...inputsAddon,
                    [e.target.name]: e.target.value,
                  })
                }
                style={{ fontSize: 11 }}
              />
            </div>

            <div style={{ marginBottom: 8, fontSize: 11 }}>
              <div style={{ marginBottom: 4 }}>Tiền sử bệnh</div>
              <Input
                size="small"
                name="medical_history"
                onChange={(e) =>
                  setInputsAddon({
                    ...inputsAddon,
                    [e.target.name]: e.target.value,
                  })
                }
                style={{ fontSize: 11 }}
              />
            </div>

            <Row gutter={12}>
              <Col span={16}>
                <div style={{ marginBottom: 8, fontSize: 11 }}>
                  <div style={{ marginBottom: 4 }}>Link so sánh:</div>
                  <Input
                    size="small"
                    name="compare_link"
                    onChange={(e) =>
                      setInputsAddon({
                        ...inputsAddon,
                        [e.target.name]: e.target.value,
                      })
                    }
                    style={{ fontSize: 11 }}
                  />
                </div>
              </Col>
              <Col span={8}>
                <div style={{ marginBottom: 8, fontSize: 11 }}>
                  <div style={{ marginBottom: 4 }}>Có kết quả cũ:</div>
                  <Input
                    size="small"
                    name="old_date"
                    onChange={(e) =>
                      setInputsAddon({
                        ...inputsAddon,
                        [e.target.name]: e.target.value,
                      })
                    }
                    style={{ fontSize: 11 }}
                  />
                </div>
              </Col>
            </Row>
          </Card>

          <Card style={{ width: 500 }}>
            <h2>Chỗ nhập liệu</h2>

            <h4>Mô tả và kĩ thuật</h4>
            {renderDynamicAntdFields(
              extractDynamicFieldsFromHtml(template?.description || ""),
              inputsRender,
              setInputsRender
            )}
            <h4>Kết quả</h4>
            {renderDynamicAntdFields(
              extractDynamicFieldsFromHtml(template?.result || ""),
              inputsRender,
              setInputsRender
            )}
            <h4>Khuyến nghị</h4>
            {renderDynamicAntdFields(
              extractDynamicFieldsFromHtml(template?.recommendation || ""),
              inputsRender,
              setInputsRender
            )}
          </Card>

          <Form.Item label="Hình ảnh minh họa">
            <ImageWithCaptionInput value={imageList} onChange={setImageList} />
          </Form.Item>

          <h2>Thao tác hoàn thành</h2>
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
              // disabled={!idTemplate}
            >
              In
            </Button>
          </Form.Item>

          <Card title="Tải file PDF đã in" style={{ marginTop: 24 }}>
            <Upload
              name="file"
              accept=".pdf"
              beforeUpload={(file) => {
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
        <Card bordered={false} className={`a4-page`}>
          <header
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
                printTemplate?.logo_url ||
                "https://via.placeholder.com/150x100?text=Logo"
              }
              alt="Logo"
              width={100}
              height={100}
            />
            <div style={{ maxWidth: "350px" }}>
              <p style={{ fontWeight: 600, color: "red", fontSize: 16 }}>
                {printTemplate?.clinic_name || "[Tên phòng khám]"}
              </p>
              <p style={{ fontSize: 14 }}>
                <strong>Khoa:</strong> {printTemplate?.department_name || "-"}
              </p>
              <p style={{ fontSize: 14 }}>
                <strong>Địa chỉ:</strong> {printTemplate?.address || "-"}
              </p>
            </div>
            <div style={{ maxWidth: "280px" }}>
              <p style={{ fontSize: 14 }}>
                <strong>Website:</strong>{" "}
                <i>{printTemplate?.website || "http://..."}</i>
              </p>
              <p style={{ fontSize: 14 }}>
                <strong>Hotline:</strong> {printTemplate?.phone || "..."}
              </p>
              <p style={{ fontSize: 14 }}>
                <strong>Email:</strong>
                <i>{printTemplate?.email || "example@email.com"}</i>
              </p>
            </div>
          </header>
          <div>
            <h3>THÔNG TIN HÀNH CHÍNH</h3>
            <div
              style={{
                marginBottom: 10,
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 14,
                }}
              >
                <div style={{ width: 90 }}>
                  <p
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      margin: 0,
                      padding: 0,
                    }}
                  >
                    Họ và tên:
                  </p>
                </div>
                <p style={{ fontSize: 14, margin: 0, padding: 0 }}>
                  {patientDiagnose?.name}
                </p>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 14,
                }}
              >
                <div style={{ width: 90 }}>
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
                <p style={{ margin: 0, padding: 0 }}>
                  {patientDiagnose?.gender}
                </p>
              </div>
            </div>

            <div
              style={{
                marginBottom: 10,
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 14,
                }}
              >
                <div style={{ width: 90 }}>
                  <p
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      margin: 0,
                      padding: 0,
                    }}
                  >
                    Năm sinh:
                  </p>
                </div>
                <p style={{ fontSize: 14, margin: 0, padding: 0 }}>
                  {dayjs(patientDiagnose?.dob).format("YYYY")}
                </p>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 14,
                  margin: 0,
                  padding: 0,
                }}
              >
                <div style={{ width: 70 }}>
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
                  {calculateAge(patientDiagnose?.dob)}
                </p>
              </div>
            </div>

            <div
              style={{
                marginBottom: 10,
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              {/* Quốc gia */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 14,
                }}
              >
                <div style={{ width: 80 }}>
                  <p
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      margin: 0,
                      padding: 0,
                    }}
                  >
                    Quốc gia:
                  </p>
                </div>
                <p style={{ fontSize: 14, margin: 0, padding: 0 }}>Việt Nam</p>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 14,
                }}
              >
                <div style={{ width: 130 }}>
                  <p
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      margin: 0,
                      padding: 0,
                    }}
                  >
                    Tỉnh/Thành phố:
                  </p>
                </div>
                <p style={{ fontSize: 14, margin: 0, padding: 0 }}>
                  {provinces.find(
                    (s) => s.code == patientDiagnose?.province_code
                  )?.name || "-"}
                </p>
              </div>
              <div style={{ width: 60 }}>
                <p
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    margin: 0,
                    padding: 0,
                  }}
                >
                  Quận/Huyện:
                </p>
              </div>
              <p style={{ fontSize: 14, margin: 0, padding: 0 }}>
                {districts.find((s) => s.code == patientDiagnose?.district_code)
                  ?.name || "-"}
              </p>
            </div>
            <div
              style={{
                marginBottom: 10,
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 14,
                }}
              >
                <div style={{ width: 100 }}>
                  <p
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      margin: 0,
                      padding: 0,
                    }}
                  >
                    Xã/Phường:
                  </p>
                </div>
                <p style={{ fontSize: 14, margin: 0, padding: 0 }}>
                  {wards.find((s) => s.code == patientDiagnose?.ward_code)
                    ?.name || "-"}
                </p>
              </div>

              {/* Số nhà */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 14,
                }}
              >
                <div style={{ width: 90 }}>
                  <p
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      margin: 0,
                      padding: 0,
                    }}
                  >
                    Số nhà:
                  </p>
                </div>
                <p style={{ fontSize: 14, margin: 0, padding: 0 }}>
                  {patientDiagnose?.address || "-"}
                </p>
              </div>
            </div>
            <div
              style={{
                marginBottom: 10,
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 14,
                }}
              >
                <div style={{ width: 110 }}>
                  <p
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      margin: 0,
                      padding: 0,
                    }}
                  >
                    Số điện thoại
                  </p>
                </div>
                <p style={{ fontSize: 14, margin: 0, padding: 0 }}>
                  {patientDiagnose?.phoneNumber}
                </p>
              </div>

              {/* Số nhà */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 14,
                }}
              >
                <div style={{ width: 60 }}>
                  <p
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      margin: 0,
                      padding: 0,
                    }}
                  >
                    Email:
                  </p>
                </div>
                <p style={{ fontSize: 14, margin: 0, padding: 0 }}>
                  {patientDiagnose?.email || "-"}
                </p>
              </div>
            </div>

            <div
              style={{
                marginBottom: 10,
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 14,
                }}
              >
                <div style={{ width: 110 }}>
                  <p
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      margin: 0,
                      padding: 0,
                    }}
                  >
                    Triệu chứng:
                  </p>
                </div>
                <p style={{ fontSize: 14, margin: 0, padding: 0 }}>
                  {inputsAddon?.symptoms}
                </p>
              </div>
            </div>
            <div
              style={{
                marginBottom: 10,
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 14,
                }}
              >
                <div style={{ width: 100 }}>
                  <p
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      margin: 0,
                      padding: 0,
                    }}
                  >
                    Diễn biến:
                  </p>
                </div>
                <p style={{ fontSize: 14, margin: 0, padding: 0 }}>
                  {inputsAddon?.progress}
                </p>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 14,
                }}
              >
                <div style={{ width: 110 }}>
                  <p
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      margin: 0,
                      padding: 0,
                    }}
                  >
                    Tiền xử bệnh:
                  </p>
                </div>
                <p style={{ fontSize: 14, margin: 0, padding: 0 }}>
                  {inputsAddon?.medical_history}
                </p>
              </div>
            </div>

            <div
              style={{
                marginBottom: 10,
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 14,
                }}
              >
                <div style={{ width: 80 }}>
                  <p
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      margin: 0,
                      padding: 0,
                    }}
                  >
                    So sánh:
                  </p>
                </div>
                <p style={{ fontSize: 14, margin: 0, padding: 0 }}>
                  {inputsAddon?.compare_link}
                </p>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 14,
                }}
              >
                <div style={{ width: 120 }}>
                  <p
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      margin: 0,
                      padding: 0,
                    }}
                  >
                    Có kết quả cũ:
                  </p>
                </div>
                <p style={{ fontSize: 14, margin: 0, padding: 0 }}>
                  {inputsAddon?.old_date}
                </p>
              </div>
            </div>
          </div>

          <div
            className="print-content"
            dangerouslySetInnerHTML={{ __html: combinedHtml }}
          />
          <h3>HÌNH ẢNH MINH HỌA</h3>
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
                  width={150}
                  height={150}
                />
                <p style={{ width: 150 }}>{item.caption}</p>
              </section>
            ))}
          </div>
          <h3>BÁC SĨ THỰC HIỆN</h3>

          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <section>
              <div style={{ display: "flex", marginBottom: 10, fontSize: 14 }}>
                <div style={{ width: 150 }}>
                  <strong>Họ và tên:</strong>
                </div>
                {doctor.full_name}
              </div>
              <div style={{ display: "flex", marginBottom: 10, fontSize: 14 }}>
                <div style={{ width: 150 }}>
                  <strong>Điện thoại:</strong>
                </div>
                {doctor.phone_number}
              </div>
              <div style={{ display: "flex", marginBottom: 10, fontSize: 14 }}>
                <div style={{ width: 150 }}>
                  <strong>Thời gian:</strong>
                </div>
                {dayjs().format("DD-MM-YYYY HH:mm")}
              </div>
              <div style={{ display: "flex", marginBottom: 10, fontSize: 14 }}>
                <div style={{ width: 150 }}>
                  <strong>Chữ ký số:</strong>
                </div>
                digital signed by Tran Van A
              </div>
            </section>
            <section>
              <img src={doctor.avatar_url} alt="" width={100} height={100} />
            </section>
            <section>
              <img src={doctor.signature_url} alt="" width={100} height={100} />
            </section>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PatientUseTemplate;
