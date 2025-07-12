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
import CustomSunEditor from "../../../components/Suneditor/CustomSunEditor.jsx";

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
  const [relatedTemplates, setRelatedTemplates] = useState([]);

  const [relatedTemplateChoose, setRelatedTemplatesChoose] = useState([]);
  const [relatedTemplateChooseId, setRelatedTemplatesChooseId] = useState();

  const { id_patient_diagnose } = useParams();
  const [combinedHtml, setCombinedHtml] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [patientDiagnose, setPatientDiagnose] = useState();

  const [printTemplateList, setPrintTemplateList] = useState([]);
  const [templates, setTemplates] = useState([]);

  const { templateServices, doctor, examParts } = useGlobalAuth();
  const [idTemplateService, setIdTemplateService] = useState();

  const [template, setTemplate] = useState({});
  const [imageList, setImageList] = useState([]);
  const [inputsRender, setInputsRender] = useState({});
  const [inputsAddon, setInputsAddon] = useState([]);

  const [isOpenPreview, setIsOpenPreview] = useState(true);

  const [htmlTranslate, setHtmlTranslate] = useState("");
  const [isTrans, setIsTrans] = useState("");

  const [imageListTrans, setImageListTrans] = useState([]);
  const [inputsRenderTrans, setInputsRenderTrans] = useState({});
  const [inputsAddonTrans, setInputsAddonTrans] = useState([]);
  const [isTranslateAll, setIsTranslateAll] = useState();

  // useEffect(() => {
  //   setImageListTrans(imageList);
  // }, [imageList]);
  // useEffect(() => {
  //   setInputsRenderTrans(inputsRender);
  // }, [inputsRender]);
  // useEffect(() => {
  //   setInputsAddonTrans(inputsAddon);
  // }, [inputsAddon]);

  const handleTranslateInputs = async () => {
    setLoading(true);
    // 🧩 Tạo payload từ dữ liệu gốc
    const payloadsAddon = inputsAddonTrans;
    const payloadsImage = {
      texts: imageList.map((i) => i.caption),
    };

    // 🔍 Chỉ lấy key dạng {{{text:...}}}
    const textObjectToTranslate = Object.fromEntries(
      Object.entries(inputsRenderTrans).filter(([key]) =>
        key.includes("{{{text:")
      )
    );

    const payloadsRender = textObjectToTranslate;

    try {
      const [translatedAddon, translatedImageCaptions, translatedRender] =
        await Promise.all([
          API_CALL.post("translate/object", payloadsAddon, { timeout: 120000 }),
          API_CALL.post("translate/text-array", payloadsImage, {
            timeout: 120000,
          }),
          API_CALL.post("translate/object", payloadsRender, {
            timeout: 120000,
          }),
        ]);
      // ✅ Cập nhật kết quả dịch
      setInputsAddonTrans(translatedAddon.data.data);

      const updatedImageList = imageList.map((img, idx) => ({
        ...img,
        caption: translatedImageCaptions.data.data[idx],
      }));

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

  const normalizeDoctorPrintTemplateData = (template) => {
    const imageList = [];
    const inputsRender = {};
    const inputsAddon = JSON.parse(template.inputsAddon || "{}");

    const inputsAddonTrans = JSON.parse(template.inputsAddonTrans || "{}");
    const inputsRenderTrans = {};
    const imageListTrans = [];

    template.doctor_print_template_images?.forEach((img) => {
      console.log("img", img);
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
        imageListTrans.push({
          caption: img.translateTe || "-",
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
        inputsRenderTrans[img.replace] = {
          url: img.link,
          name: img.link.split("/").pop(),
        };
      }
    });

    // Gộp với inputsRender từ text
    try {
      const renderObj = JSON.parse(template.inputsRender || "{}");
      const renderObjTrans = JSON.parse(template.inputsRenderTrans || "{}");

      Object.assign(inputsRender, renderObj);
      Object.assign(inputsRenderTrans, renderObjTrans);
    } catch (e) {
      console.warn("Lỗi parse inputsRender", e);
    }

    return {
      imageList,
      inputsRender,
      inputsAddon,
      inputsAddonTrans,
      imageListTrans,
      inputsRenderTrans,
    };
  };

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
  console.log("inputsRender", inputsRender);
  useEffect(() => {
    if (idTemplate) {
      API_CALL.get(`/templates/${idTemplate}`)
        .then((res) => {
          const data = res.data.data?.data || res.data.data || {};
          setTemplate(data);

          const a = extractDynamicFieldsFromHtml(data?.description || "");
          const b = extractDynamicFieldsFromHtml(data?.result || "");
          const c = extractDynamicFieldsFromHtml(data?.recommendation || "");

          const mergedFields = [...a, ...b, ...c]
            .filter((d) => d.type == "text")
            .reduce((acc, field) => {
              acc[field.raw] = field.defaultValue;
              return acc;
            }, {});

          if (
            patientDiagnose.status == PATIENT_DIAGNOSE_STATUS_CODE.INPROCESS
          ) {
            setInputsRender({
              ...inputsRender,
              ...mergedFields,
            });
            setInputsRenderTrans({
              ...inputsRender,
              ...mergedFields,
            });
          }
        })
        .catch(() => message.error("Không thể tải danh sách template"));

      API_CALL.get(`/templates/by-id-or-parent?id=${idTemplate}`)
        .then((res) => {
          setRelatedTemplates(res.data?.data || []);
        })
        .catch(() => message.error("Không thể tải danh sách bản sao template"));
    }
  }, [idTemplate]);

  useEffect(() => {
    if (relatedTemplateChooseId) {
      API_CALL.get(`/templates/${relatedTemplateChooseId}`)
        .then((res) => {
          const data = res.data.data?.data || res.data.data || {};
          setRelatedTemplatesChoose(data);
        })
        .catch(() => message.error("Không thể tải danh sách template"));
    }
  }, [relatedTemplateChooseId]);

  useEffect(() => {
    const html = `
    <style>
      table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
      th, td { border: 0px solid #ccc; padding: 8px; text-align: left; }
      h3 {margin-bottom: 20px; margin-top: 40px;}
    </style>
    <h3 style="color: #4299d4">QUY TRÌNH VÀ KĨ THUẬT</h3>
    ${replaceInputsInHtml(template?.description || "", inputsRender)}
    <h3 style="color: #4299d4">KẾT LUẬN CHẨN ĐOÁN</h3>
    ${replaceInputsInHtml(template?.result || "", inputsRender)}
    <h3 style="color: #4299d4">KHUYẾN NGHỊ</h3>
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
    <h3 style="color: #4299d4">MEDICAL AND PROTOCOL</h3>
    ${replaceInputsInHtml(
      relatedTemplateChoose?.description || "",
      inputsRenderTrans
    )}
    <h3 style="color: #4299d4">RESULT</h3>
    ${replaceInputsInHtml(
      relatedTemplateChoose?.result || "",
      inputsRenderTrans
    )}
    <h3 style="color: #4299d4">RECOMMENDATION</h3>
    ${replaceInputsInHtml(
      relatedTemplateChoose?.recommendation || "",
      inputsRenderTrans
    )}
  `;
    setHtmlTranslate(html);
  }, [relatedTemplateChoose, inputsRenderTrans]);

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

  console.log("----------inputsRenderTrans--------", inputsRenderTrans);

  useEffect(() => {
    if (id_patient_diagnose) {
      setLoading(true);
      API_CALL.get(`/patient-diagnose/${id_patient_diagnose}`)
        .then((res) => {
          const data = res.data.data;
          setPatientDiagnose(data);
          setIdTemplateService(data?.id_template_service);
          setInputsRender({
            "{{{text: Bộ phận thăm khám}}}": examParts?.find(
              (ex) => data?.id_exam_part == ex.id
            )?.name,
          });
          const doctor_print_templates = data?.doctor_print_templates?.find(
            (d) => d.status == data?.status
          );
          if (doctor_print_templates) {
            const {
              imageList,
              inputsRender,
              inputsAddon,
              inputsRenderTrans,
              inputsAddonTrans,
              imageListTrans,
            } = normalizeDoctorPrintTemplateData(doctor_print_templates);

            console.log("doctor_print_templates", doctor_print_templates);

            setIdTemplateService(doctor_print_templates?.id_template_service);
            setRelatedTemplatesChooseId(
              doctor_print_templates?.id_template_translate
            );

            setImageList(imageList);
            setInputsAddon(inputsAddon);
            setInputsRender(inputsRender);

            setInputsRenderTrans(inputsRenderTrans);
            setInputsAddonTrans(inputsAddonTrans);
            setImageListTrans(imageListTrans);

            setIdTemplate(doctor_print_templates.id_template);
            setHtmlTranslate(doctor_print_templates.htmlTranslate);
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
            th, td { border: 0px solid #ccc; padding: 8px; text-align: left; font-size: 13px}
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
      formData.append("inputsAddonTrans", JSON.stringify(inputsAddonTrans));
      formData.append("id_template_translate", relatedTemplateChoose?.id);

      // Xử lý imageList
      const descriptionsArr = [];
      const descriptionsArrTrans = [];

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

      for (const item of imageListTrans) {
        let file = item.file;
        if (!file?.size && item.url) {
          file = await urlToFile(item.url, `image_${Date.now()}`);
        }
        if (file) {
          descriptionsArrTrans.push(item.caption || "-");
        }
      }
      formData.append(
        "descriptions",
        JSON.stringify(descriptionsArr.join("{{D}}"))
      );
      formData.append(
        "descriptionsTrans",
        JSON.stringify(descriptionsArrTrans.join("{{D}}"))
      );
      // Xử lý inputsRender
      const replaceLabels = [];
      const inputsRenderJson = {};
      const inputsRenderJsonTrans = {};

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

      for (const [key, val] of Object.entries(inputsRenderTrans)) {
        if (!key.includes("{{{image:")) {
          inputsRenderJsonTrans[key] = val;
        }
      }

      formData.append("inputsRender", JSON.stringify(inputsRenderJson));
      formData.append(
        "inputsRenderTrans",
        JSON.stringify(inputsRenderJsonTrans)
      );

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

  const renderDiagnoseContent = () => {
    switch (+patientDiagnose?.status) {
      default:
        return (
          <Card style={{ width: isOpenPreview ? 600 : "100%", margin: "0" }}>
            <StatusButtonPatientDiagnose
              id={patientDiagnose?.id}
              status={patientDiagnose?.status || 1}
            />

            <Title level={3}>
              Hiện có: {patientDiagnose?.doctor_print_templates?.length || 0}{" "}
              bản ghi{" "}
            </Title>
            <CompletionActionsDiagnose
              isTrans={isTrans}
              isOpenPreview={isOpenPreview}
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
              handleTranslate={async () => {
                const confirmed = window.confirm(
                  "Bạn có chắc chắn muốn bắt đầu dịch nội dung không?"
                );
                if (!confirmed) return;

                setIsTrans(true);
                toast.success("Bắt đầu dịch");
                await handleTranslateInputs();
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
              <p>
                <strong>Bộ phận thăm khám: </strong>
                {
                  examParts?.find(
                    (ex) => ex.id == patientDiagnose?.id_exam_part
                  )?.name
                }
              </p>
            </div>

            <AddonInputSection
              inputsAddon={!isTrans ? inputsAddon : inputsAddonTrans}
              setInputsAddon={!isTrans ? setInputsAddon : setInputsAddonTrans}
              setInputsAddonTrans={setInputsAddonTrans}
              template={template}
              inputsRender={!isTrans ? inputsRender : inputsRenderTrans}
              setInputsRender={
                !isTrans ? setInputsRender : setInputsRenderTrans
              }
              setInputsRenderTrans={setInputsRenderTrans}
              imageList={!isTrans ? imageList : imageListTrans}
              imageListTrans={imageListTrans}
              setImageList={!isTrans ? setImageList : setImageListTrans}
              setImageListTrans={setImageListTrans}
              renderDynamicAntdFields={renderDynamicAntdFields}
              extractDynamicFieldsFromHtml={extractDynamicFieldsFromHtml}
            />
          </Card>
        );
      case PATIENT_DIAGNOSE_STATUS_CODE.VERIFY:
        return (
          <Card style={{ width: 600, margin: "0" }}>
            <CompletionActionsDiagnose
              isTranslateAll={isTranslateAll}
              statusCode={patientDiagnose?.status}
              handlePrint={handlePrint}
            />
          </Card>
        );
    }
  };
  return (
    <Spin spinning={loading}>
      <div style={{ display: "flex" }}>
        <h2 style={{ marginRight: 50 }}>WORK SPACE</h2>

        <Button
          type={isOpenPreview ? "default" : "primary"} // màu khác nhau
          danger={isOpenPreview} // nếu đang mở thì dùng màu đỏ nhẹ
          style={{
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

        <Button
          type={isTrans ? "default" : "primary"} // màu khác nhau
          danger={isTrans} // nếu đang mở thì dùng màu đỏ nhẹ
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            height: 32,
            padding: "0 12px",
            fontSize: 14,
          }}
          onClick={() => setIsTrans(!isTrans)}
          icon={isTrans ? <EyeInvisibleOutlined /> : <EyeOutlined />}
        >
          {!isTrans ? "Bật chế độ dịch" : "Tắt chế độ dịch"}
        </Button>

        {isTrans &&
          patientDiagnose?.status != PATIENT_DIAGNOSE_STATUS_CODE.VERIFY && (
            <div style={{ marginBottom: 20 }}>
              <Select
                showSearch
                allowClear
                style={{ width: 400 }}
                value={relatedTemplateChoose?.name}
                placeholder="Chọn bản dịch template"
                optionFilterProp="children"
                onChange={(val) => {
                  const selected = relatedTemplates.find((t) => t.id === val);
                  setRelatedTemplatesChoose(selected);
                  setRelatedTemplatesChooseId(selected.id);
                }}
                filterOption={(input, option) =>
                  option.children.toLowerCase().includes(input.toLowerCase())
                }
              >
                {relatedTemplates
                  .filter((t) => t.id_template_service === idTemplateService)
                  .filter((t) => t.id !== Number(idTemplate)) // ẩn bản chính
                  .map((tpl) => (
                    <Option key={tpl.id} value={tpl.id}>
                      {tpl.name} ({tpl.language})
                    </Option>
                  ))}
              </Select>
            </div>
          )}

        {isTrans && (
          <p
            style={{
              textAlign: "center",
              lineHeight: "30px",
              marginLeft: 40,
              fontWeight: 500,
            }}
          >
            {!relatedTemplates?.length && "Chưa có bản dịch nào!"}
          </p>
        )}
      </div>

      <div style={{ display: "flex" }}>
        {renderDiagnoseContent()}

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
            serviceName={
              templateServices?.find((s) => s.id == idTemplateService)?.name
            }
          />
        )}

        {isTrans && isOpenPreview && (
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
            serviceName={
              templateServices?.find((s) => s.id == idTemplateService)?.name
            }
          />
        )}
      </div>
    </Spin>
  );
};

export default PatientUseTemplate;
