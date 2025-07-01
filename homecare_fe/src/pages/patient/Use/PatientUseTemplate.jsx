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
import {
  EyeInvisibleOutlined,
  EyeOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { toast } from "react-toastify";
import { useGlobalAuth } from "../../../contexts/AuthContext";
import useVietnamAddress from "../../../hooks/useVietnamAddress";
import ImageWithCaptionInput from "../../products/ImageWithCaptionInput/ImageWithCaptionInput";
import { renderDynamicAntdFields } from "../../../components/RenderInputFormTemplate";
import {
  extractDynamicFieldsFromHtml,
  LANGUAGES,
  PATIENT_DIAGNOSE_STATUS_CODE,
} from "../../../constant/app";
import CompletionActionsDiagnose from "../../../components/CompletionActionsDiagnose";
import StatusButtonPatientDiagnose from "../../../components/Status2ButtonPatientDiagnose.jsx";
import PrintPreview from "./PrintPreview.jsx";
import AddonInputSection from "./InputsAdon.jsx";

const urlToFile = async (url, fallbackName = "image") => {
  const res = await fetch(url);
  const blob = await res.blob();

  // Ưu tiên lấy extension từ Content-Type
  const typeFromMime = blob.type?.split("/")[1] || "jpg";
  const extFromUrl = url.split(".").pop().split("?")[0];
  const ext = extFromUrl?.length <= 5 ? extFromUrl : typeFromMime;

  const filename = `${fallbackName}.${ext}`;
  return new File([blob], filename, { type: blob.type });
};

export const replaceInputsInHtml = (html, inputsRender) => {
  const fields = extractDynamicFieldsFromHtml(html);
  let result = html;

  fields.forEach((field) => {
    const value = inputsRender[field.raw];
    let replacement = "";

    if (field.type == "image" || field.type == "file") {
      const url = value?.thumbUrl || value?.url || field.defaultValue || "";
      if (url) {
        if (field.type === "image") {
          replacement = `
            <div style="display: flex; justify-content: center; align-items: center; height: 100%; min-height: 200px;">
              <img src="${url}" alt="${field.label}" style="width: 300px; height: 200px; object-fit: cover;" />
            </div>
          `;
        }
      }
    } else {
      replacement = value || field.defaultValue || "";
    }

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
  const [loading, setLoading] = React.useState(false);
  const [printTemplate, setPrintTemplate] = useState({});
  const [idPrintTemplate, setIdPrintTemplate] = useState();

  const [idTemplate, setIdTemplate] = useState();
  const { id_patient_diagnose } = useParams();
  const [combinedHtml, setCombinedHtml] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [patientDiagnose, setPatientDiagnose] = useState();

  const [printTemplateList, setPrintTemplateList] = useState([]);
  const [templates, setTemplates] = useState([]);

  const { templateServices, doctor } = useGlobalAuth();
  const [idTemplateService, setIdTemplateService] = useState();

  const [template, setTemplate] = useState({});
  const [imageList, setImageList] = useState([]);
  const [inputsRender, setInputsRender] = useState([]);
  const [inputsAddon, setInputsAddon] = useState([]);

  const [isOpenPreview, setIsOpenPreview] = useState(true);
  const [htmlTranslate, setHtmlTranslate] = useState("");
  const [isTrans, setIsTrans] = useState("");

  const [imageListTrans, setImageListTrans] = useState([]);
  const [inputsRenderTrans, setInputsRenderTrans] = useState([]);
  const [inputsAddonTrans, setInputsAddonTrans] = useState([]);
  const [isTranslateAll, setIsTranslateAll] = useState();

  useEffect(() => {
    setImageListTrans(imageList);
  }, [imageList]);
  useEffect(() => {
    setInputsRenderTrans(inputsRender);
  }, [inputsRender]);
  useEffect(() => {
    setInputsAddonTrans(inputsAddon);
  }, [inputsAddon]);

  const handleTranslateInputs = async () => {
    setLoading(true);
    // 🧩 Tạo payload từ dữ liệu gốc
    const payloadsAddon = inputsAddon;
    const payloadsImage = {
      texts: imageList.map((i) => i.caption),
    };

    // 🔍 Chỉ lấy key dạng {{{text:...}}}
    const textObjectToTranslate = Object.fromEntries(
      Object.entries(inputsRender).filter(([key]) => key.includes("{{{text:"))
    );

    const payloadsRender = textObjectToTranslate;

    try {
      const [translatedAddon, translatedImageCaptions, translatedRender] =
        await Promise.all([
          API_CALL.post("translate/object", payloadsAddon),
          API_CALL.post("translate/text-array", payloadsImage),
          API_CALL.post("translate/object", payloadsRender),
        ]);

      // ✅ Cập nhật kết quả dịch
      setInputsAddonTrans(translatedAddon.data.data);

      const updatedImageList = imageList.map((img, idx) => ({
        ...img,
        caption: translatedImageCaptions.data.data[idx],
      }));

      console.log("updatedImageList", updatedImageList);
      setImageListTrans(updatedImageList);

      const newInputRenderTrans = {
        ...inputsRender,
        ...translatedRender.data.data,
      };
      setInputsRenderTrans(newInputRenderTrans);
      setIsTranslateAll(true);
      toast.success("Vui lòng ấn vào Hoàn thành dịch để dịch full bản ");
    } catch (err) {
      toast.error("❌ Lỗi dịch nội dung:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleTranslate = async (htmltext) => {
    try {
      setLoading(true);

      const payload = {
        text: htmltext,
      };
      const htmlR = await API_CALL.post("translate/html-text", payload, {
        timeout: 120000,
      });
      console.log("html", htmlR);
      setHtmlTranslate(htmlR?.data?.data);
    } catch (error) {
      console.log(error);
      toast.error("lỗi");
    } finally {
      setLoading(false);
    }
  };

  const normalizeDoctorPrintTemplateData = (template) => {
    const imageList = [];
    const inputsRender = {};
    const inputsAddon = JSON.parse(template.inputsAddon || "{}");

    template.doctor_print_template_images?.forEach((img) => {
      if (img.type === "ADDON") {
        imageList.push({
          caption: img.description || "-",
          url: img.link,
          file: {
            uid: `uploaded-${img.id}`,
            name: img.link.split("/").pop(),
            url: img.link,
          },
        });
      } else if (img.type === "REPLACE" && img.replace) {
        inputsRender[img.replace] = {
          url: img.link,
          name: img.link.split("/").pop(),
        };
      }
    });

    // Gộp với inputsRender từ text
    try {
      const renderObj = JSON.parse(template.inputsRender || "{}");
      Object.assign(inputsRender, renderObj);
    } catch (e) {
      console.warn("Lỗi parse inputsRender", e);
    }

    return {
      imageList,
      inputsRender,
      inputsAddon,
    };
  };

  console.log("templatesData", templates);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const [printRes, templatesRes] = await Promise.all([
          API_CALL.get("/print-template", {
            params: {
              page: 1,
              limit: 1000,
              id_template_service: +idTemplateService || -1,
              id_clinic: patientDiagnose?.id_clinic,
            },
          }),
          API_CALL.get("/templates", {
            params: {
              page: 1,
              limit: 1000,
              id_template_service: +idTemplateService || -1,
            },
          }),
        ]);

        const printData = printRes.data.data?.data || printRes.data.data || [];
        const templatesData =
          templatesRes.data.data?.data || templatesRes.data.data || [];

        if (printRes?.length == 0) {
          toast.error("Không có mẫu in nào phù hợp cho phòng khám");
        }
        setPrintTemplateList(printData);
        setTemplates(templatesData);
      } catch (error) {
        message.error("Không thể tải danh sách template");
      }
    };

    fetchTemplates();
  }, [idTemplateService]);

  useEffect(() => {
    const doctor_print_templates =
      patientDiagnose?.doctor_print_templates?.find(
        (d) => d.status == patientDiagnose?.status
      );
    const exist = printTemplateList?.find(
      (p) => p.id == doctor_print_templates?.id_print_template
    );

    // console.log("exist", exist);
    // console.log(
    //   "printTemplateList, patientDiagnose",
    //   printTemplateList,
    //   patientDiagnose
    // );
    setPrintTemplate(exist);
    setIdPrintTemplate(exist?.id);
  }, [printTemplateList, patientDiagnose]);

  useEffect(() => {
    if (idTemplate) {
      API_CALL.get(`/templates/${idTemplate}`)
        .then((res) => {
          const data = res.data.data?.data || res.data.data || {};
          setTemplate(data);
        })
        .catch(() => message.error("Không thể tải danh sách template"));
    }
  }, [idTemplate]);

  useEffect(() => {
    const html = `
    <style>
      table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
      th, td { border: 0px solid #ccc; padding: 8px; text-align: left; }
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

  useEffect(() => {
    const html = `
    <style>
      table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
      th, td { border: 0px solid #ccc; padding: 8px; text-align: left; }
      h3 {margin-bottom: 20px; margin-top: 40px;}
    </style>
    <h3>QUY TRÌNH VÀ KĨ THUẬT</h3>
    ${replaceInputsInHtml(template?.description || "", inputsRenderTrans)}
    <h3>KẾT LUẬN CHẨN ĐOÁN</h3>
    ${replaceInputsInHtml(template?.result || "", inputsRenderTrans)}
    <h3>KHUYẾN NGHỊ</h3>
    ${replaceInputsInHtml(template?.recommendation || "", inputsRenderTrans)}
  `;
    setHtmlTranslate(html);
  }, [template, inputsRenderTrans]);

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

  useEffect(() => {
    setSelectedProvince(patientDiagnose?.province_code);
    setSelectedDistrict(patientDiagnose?.district_code);
  }, [patientDiagnose]);

  useEffect(() => {
    if (id_patient_diagnose) {
      setLoading(true);
      API_CALL.get(`/patient-diagnose/${id_patient_diagnose}`)
        .then((res) => {
          const data = res.data.data;
          setPatientDiagnose(data);

          const doctor_print_templates = data?.doctor_print_templates?.find(
            (d) => d.status == data?.status
          );
          if (doctor_print_templates) {
            const { imageList, inputsRender, inputsAddon } =
              normalizeDoctorPrintTemplateData(doctor_print_templates);

            setIdTemplateService(doctor_print_templates?.id_template_service);
            setImageList(imageList);
            setInputsAddon(inputsAddon);
            setInputsRender(inputsRender);

            setIdTemplate(doctor_print_templates.id_template);
          }
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
            th, td { border: 0px solid #ccc; padding: 8px; text-align: left; }
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

  const updateStatusPatientDiagnose = async (status) => {
    try {
      await API_CALL.put("/patient-diagnose/" + patientDiagnose.id, {
        status: status,
      });
      toast.success("Thành công");
      return true;
    } catch (err) {
      console.error("Lỗi Update:", err);
      toast.error(err);
      return false;
    }
  };

  const createDoctorPrintTemplate = async (status = 1) => {
    try {
      const formData = new FormData();

      formData.append("id_print_template", printTemplate?.id);
      formData.append("id_template_service", idTemplateService);
      formData.append("id_patient_diagnose", id_patient_diagnose);
      formData.append("id_template", idTemplate);

      formData.append("status", status);
      formData.append(
        "name",
        `Phiếu ${new Date().toLocaleDateString("vi-VN")}`
      );
      formData.append("inputsAddon", JSON.stringify(inputsAddon));

      // Xử lý imageList
      const descriptionsArr = [];
      for (const item of imageList) {
        let file = item.file;
        if (!file?.size && item.url) {
          file = await urlToFile(item.url, `image_${Date.now()}`);
        }
        if (file) {
          formData.append("images", file);
          descriptionsArr.push(item.caption || "-");
        }
      }
      formData.append(
        "descriptions",
        JSON.stringify(descriptionsArr.join("{{D}}"))
      );

      // Xử lý inputsRender
      const replaceLabels = [];
      const inputsRenderJson = {};

      for (const [key, val] of Object.entries(inputsRender)) {
        if (key.includes("{{{image:")) {
          let file = val.originFileObj;
          if (!file && val?.url) {
            file = await urlToFile(val.url, `replace_${Date.now()}`);
          }
          if (file) {
            formData.append("replaceImage", file);
          }
          replaceLabels.push(key);
        } else {
          inputsRenderJson[key] = val;
        }
      }

      formData.append("inputsRender", JSON.stringify(inputsRenderJson));
      formData.append(
        "replaceFields",
        JSON.stringify(replaceLabels.join("{{D}}"))
      );

      // Gửi API
      const res = await API_CALL.post("/doctor-print-template", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Tạo mới thành công!");
      return res;
    } catch (err) {
      console.error("Lỗi khi tạo:", err);
      toast.error("Tạo thất bại");
      return false;
    }
  };

  console.log("imageListTrans", imageListTrans, imageList);
  return (
    <Spin spinning={loading}>
      <div style={{ display: "flex" }}>
        {patientDiagnose?.status != PATIENT_DIAGNOSE_STATUS_CODE.VERIFY ? (
          <Card style={{ width: isOpenPreview ? 600 : "100%", margin: "0" }}>
            <StatusButtonPatientDiagnose
              id={patientDiagnose?.id}
              status={patientDiagnose?.status || 1}
            />
            <Button
              type={isOpenPreview ? "default" : "primary"} // màu khác nhau
              danger={isOpenPreview} // nếu đang mở thì dùng màu đỏ nhẹ
              style={{
                marginTop: 16,
                display: "flex",
                alignItems: "center",
                gap: 8,
                height: 32,
                padding: "0 12px",
                fontSize: 14,
              }}
              onClick={() => setIsOpenPreview(!isOpenPreview)}
              icon={isOpenPreview ? <EyeInvisibleOutlined /> : <EyeOutlined />}
            >
              {isOpenPreview ? "Tắt preview" : "Mở preview"}
            </Button>

            <Title level={3}>
              Hiện có: {patientDiagnose?.doctor_print_templates?.length || 0}{" "}
              bản ghi{" "}
            </Title>
            <CompletionActionsDiagnose
              statusCode={patientDiagnose?.status}
              handleRead={async () => {
                const res = await updateStatusPatientDiagnose(2);
                if (res) {
                  setPatientDiagnose({ ...patientDiagnose, status: 2 });
                }
              }}
              handleCancelRead={async () => {
                const res = await updateStatusPatientDiagnose(1);
                if (res) {
                  setPatientDiagnose({ ...patientDiagnose, status: 1 });
                }
              }}
              handleConfirm={async () => {
                const confirm = window.confirm(
                  "Bạn có chắc chắn muốn chốt kết quả không?\nSau khi chốt sẽ không thể sửa."
                );
                if (confirm) {
                  try {
                    const data = await createDoctorPrintTemplate(
                      PATIENT_DIAGNOSE_STATUS_CODE.VERIFY
                    );

                    if (data) {
                      toast.success("Chốt kết quả thành công!");
                      setPatientDiagnose({
                        ...patientDiagnose,
                        status: PATIENT_DIAGNOSE_STATUS_CODE.VERIFY,
                      });
                      navigate("/home/patients-diagnose");
                    }
                  } catch (error) {
                    console.error("Lỗi khi chốt kết quả:", error);
                    toast.error("Chốt kết quả thất bại!");
                  }
                }
              }}
              handlePrint={handlePrint}
              handleSend={async () => {
                const confirm = window.confirm(
                  "Bạn có chắc chắn muốn chốt kết quả không?\nSau khi chốt sẽ không thể sửa."
                );
                if (confirm) {
                  try {
                    const data = await createDoctorPrintTemplate(
                      PATIENT_DIAGNOSE_STATUS_CODE.WAIT
                    );

                    if (data) {
                      toast.success("Chốt kết quả thành công!");
                      setPatientDiagnose({
                        ...patientDiagnose,
                        status: PATIENT_DIAGNOSE_STATUS_CODE.WAIT,
                      });
                      navigate("/home/patients-diagnose");
                    }
                  } catch (error) {
                    console.error("Lỗi khi chốt kết quả:", error);
                    toast.error("Chốt kết quả thất bại!");
                  }
                }
              }}
            />
            <Title level={3}>Phiếu kết quả</Title>

            <div style={{ marginBottom: 20 }}>
              <Select
                disabled={
                  patientDiagnose?.status == PATIENT_DIAGNOSE_STATUS_CODE.NEW
                }
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
                  setTemplates([]);
                  setPrintTemplate(null);
                  setPrintTemplateList([]);
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
                value={idPrintTemplate}
                placeholder="Chọn mẫu in"
                optionFilterProp="children"
                onChange={(val) => {
                  const printT = printTemplateList.find((t) => t.id == val);
                  setPrintTemplate(printT);
                  setIdPrintTemplate(printT?.id);
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

            <div style={{ marginBottom: 20 }}>
              <Select
                showSearch
                allowClear
                style={{ width: 400 }}
                value={idTemplate}
                placeholder="Chọn mẫu form"
                optionFilterProp="children"
                onChange={(val) => {
                  const temp = templates.find((t) => t.id == val);
                  setIdTemplate(temp?.id);
                  setTemplate(temp);
                }}
                filterOption={(input, option) =>
                  option.children.toLowerCase().includes(input.toLowerCase())
                }
              >
                {templates
                  .filter((t) => t.id_template_service == idTemplateService)
                  .map((tpl) => (
                    <Option key={tpl.id} value={tpl.id}>
                      {tpl.name}
                    </Option>
                  ))}
              </Select>
            </div>

            <AddonInputSection
              inputsAddon={inputsAddon}
              setInputsAddon={setInputsAddon}
              template={template}
              inputsRender={inputsRender}
              setInputsRender={setInputsRender}
              imageList={imageList}
              setImageList={setImageList}
              renderDynamicAntdFields={renderDynamicAntdFields}
              extractDynamicFieldsFromHtml={extractDynamicFieldsFromHtml}
            />

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
          </Card>
        ) : (
          <Card style={{ width: 600, margin: "0" }}>
            <CompletionActionsDiagnose
              isTranslateAll={isTranslateAll}
              statusCode={patientDiagnose?.status}
              handlePrint={handlePrint}
              handleTranslate={async () => {
                const confirmed = window.confirm(
                  "Bạn có chắc chắn muốn bắt đầu dịch nội dung không?"
                );
                if (!confirmed) return;

                setIsTrans(true);
                toast.success("Bắt đầu dịch");
                await handleTranslateInputs();
              }}
              handleTranslateAll={async () => {
                await handleTranslate(`
                        <style>
                          table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
                          th, td { border: 0px solid #ccc; padding: 8px; text-align: left; }
                          h3 {margin-bottom: 20px; margin-top: 40px;}
                        </style>
                        <h3>QUY TRÌNH VÀ KĨ THUẬT</h3>
                        ${replaceInputsInHtml(
                          template?.description || "",
                          inputsRenderTrans
                        )}
                        <h3>KẾT LUẬN CHẨN ĐOÁN</h3>
                        ${replaceInputsInHtml(
                          template?.result || "",
                          inputsRenderTrans
                        )}
                        <h3>KHUYẾN NGHỊ</h3>
                        ${replaceInputsInHtml(
                          template?.recommendation || "",
                          inputsRenderTrans
                        )}
                      `);
              }}
            />
            {isTrans && (
              <AddonInputSection
                inputsAddon={inputsAddonTrans}
                setInputsAddon={setInputsAddonTrans}
                template={template}
                inputsRender={inputsRenderTrans}
                setInputsRender={setInputsRenderTrans}
                imageList={imageListTrans}
                setImageList={setImageListTrans}
                renderDynamicAntdFields={renderDynamicAntdFields}
                extractDynamicFieldsFromHtml={extractDynamicFieldsFromHtml}
              />
            )}
          </Card>
        )}

        {isOpenPreview && !isTrans && (
          <PrintPreview
            printRef={printRef}
            printTemplate={printTemplate}
            patientDiagnose={patientDiagnose}
            inputsAddon={inputsAddon}
            combinedHtml={combinedHtml}
            imageList={imageList}
            doctor={doctor}
            provinces={provinces}
            districts={districts}
            wards={wards}
            calculateAge={calculateAge}
            lang={LANGUAGES.vi}
          />
        )}

        {isTrans &&
          patientDiagnose.status == PATIENT_DIAGNOSE_STATUS_CODE.VERIFY && (
            <PrintPreview
              printRef={printRef}
              printTemplate={printTemplate}
              patientDiagnose={patientDiagnose}
              inputsAddon={inputsAddonTrans}
              combinedHtml={htmlTranslate}
              imageList={imageListTrans}
              doctor={doctor}
              provinces={provinces}
              districts={districts}
              wards={wards}
              calculateAge={calculateAge}
              lang={LANGUAGES.en}
            />
          )}
      </div>
    </Spin>
  );
};

export default PatientUseTemplate;
