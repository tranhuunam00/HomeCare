import dayjs from "dayjs";
import { getAge } from "../../constant/app";

export const IMAGE_QUALITY_OPTIONS = [
  { value: "good", label: "Đạt yêu cầu" },
  { value: "limited", label: "Đạt yêu cầu, có hạn chế" },
  { value: "bad", label: "Không đạt" },
];

export const APPROVAL_FORMVER3_STATUS = {
  DRAFT: 1,
  APPROVED: 2,
  REJECTED: 3,
};

export const APPROVAL_FORMVER3_STATUS_NAME = {
  1: "draft",
  2: "approved",
  3: "rejected",
};

export const ADDITIONAL_ACTION_OPTIONS = [
  { value: "no", label: "no" },
  { value: "extra", label: "Chụp thêm" },
  { value: "redo", label: "Chụp lại" },
];
export const CONTRAST_INJECTION_OPTIONS = [
  { value: "no", label: "no" },
  { value: "yes", label: "yes" },
];

export const getOptionLabel = (options = [], value) => {
  return options.find((opt) => opt.value == value)?.label || "";
};

export const DEFAULT_IMAGING_ROWS = [
  { id: 1, name: "Phổi", status: "normal", description: "" },
  { id: 2, name: "Màng phổi", status: "normal", description: "" },
  { id: 3, name: "Trung thất", status: "normal", description: "" },
  { id: 4, name: "Xương sườn", status: "normal", description: "" },
  { id: 5, name: "Xương đòn", status: "normal", description: "" },
  { id: 6, name: "Xương cột sống", status: "normal", description: "" },
  { id: 7, name: "Phần mềm thành ngực", status: "normal", description: "" },
];

export const defaultVisibleKeys = [
  "stt",
  "id",
  "code",
  "ten_mau",
  "id_exam_part",
  "advanced_sample",
  "status",
  "id_template_service",
  "language",
  "ngay_thuc_hien",
  "doctor_name",
  "actions",
  "ket_luan",
  "icd10",
];

export const STATUS_FORMVER3_MAP = {
  1: { text: "Nháp", color: "default" },
  2: { text: "Đã duyệt", color: "blue" },
  3: { text: "Đã ký", color: "green" },
  4: { text: "Hủy", color: "red" },
};
/* ============== CONSTS ============== */
export const LANGUAGE_OPTIONS = [
  { label: "Vietnamese (Việt Nam)", value: "vi" },
  { label: "English", value: "en" },
  { label: "Chinese (Simplified)", value: "zh" },
  { label: "Chinese (Traditional)", value: "zh-TW" },
  { label: "Japanese", value: "ja" },
  { label: "Korean", value: "ko" },
  { label: "French", value: "fr" },
  { label: "German", value: "de" },
  { label: "Spanish", value: "es" },
  { label: "Italian", value: "it" },
  { label: "Portuguese", value: "pt" },
  { label: "Russian", value: "ru" },
  { label: "Dutch", value: "nl" },
  { label: "Polish", value: "pl" },
  { label: "Swedish", value: "sv" },
  { label: "Norwegian", value: "no" },
  { label: "Danish", value: "da" },
  { label: "Finnish", value: "fi" },
  { label: "Greek", value: "el" },
  { label: "Czech", value: "cs" },
  { label: "Hungarian", value: "hu" },
  { label: "Romanian", value: "ro" },
  { label: "Bulgarian", value: "bg" },
  { label: "Slovak", value: "sk" },
  { label: "Slovenian", value: "sl" },
  { label: "Croatian", value: "hr" },
  { label: "Ukrainian", value: "uk" },
  { label: "Serbian", value: "sr" },
  { label: "Lithuanian", value: "lt" },
  { label: "Latvian", value: "lv" },
  { label: "Estonian", value: "et" },
  { label: "Spanish (Latin America)", value: "es-419" },
  { label: "Portuguese (Brazil)", value: "pt-BR" },
  { label: "Haitian Creole", value: "ht" },
  { label: "Arabic", value: "ar" },
  { label: "Persian (Farsi)", value: "fa" },
  { label: "Turkish", value: "tr" },
  { label: "Hebrew", value: "he" },
  { label: "Urdu", value: "ur" },
  { label: "Hindi", value: "hi" },
  { label: "Bengali", value: "bn" },
  { label: "Tamil", value: "ta" },
  { label: "Telugu", value: "te" },
  { label: "Malayalam", value: "ml" },
  { label: "Punjabi", value: "pa" },
  { label: "Thai", value: "th" },
  { label: "Indonesian", value: "id" },
  { label: "Malay", value: "ms" },
  { label: "Khmer (Cambodia)", value: "km" },
  { label: "Lao", value: "lo" },
  { label: "Burmese (Myanmar)", value: "my" },
  { label: "Filipino (Tagalog)", value: "fil" },
  { label: "Swahili", value: "sw" },
  { label: "Amharic", value: "am" },
  { label: "Afrikaans", value: "af" },
  { label: "Yoruba", value: "yo" },
  { label: "Igbo", value: "ig" },
  { label: "Hausa", value: "ha" },
  { label: "Icelandic", value: "is" },
  { label: "Irish (Gaelic)", value: "ga" },
  { label: "Maltese", value: "mt" },
  { label: "Welsh (Cymraeg)", value: "cy" },
];

export const buildDradv3FormValues = ({
  doctorUseFormVer3,
  patientDiagnose,
}) => {
  return {
    benh_nhan_ho_ten:
      doctorUseFormVer3?.benh_nhan_ho_ten ?? patientDiagnose.name,

    benh_nhan_gioi_tinh:
      doctorUseFormVer3?.benh_nhan_gioi_tinh ?? patientDiagnose.gender,

    benh_nhan_tuoi:
      doctorUseFormVer3?.benh_nhan_tuoi ?? getAge(patientDiagnose.dob),

    benh_nhan_quoc_tich:
      doctorUseFormVer3?.benh_nhan_quoc_tich ?? patientDiagnose.countryCode,

    benh_nhan_dien_thoai:
      doctorUseFormVer3?.benh_nhan_dien_thoai ?? patientDiagnose.phoneNumber,

    benh_nhan_email:
      doctorUseFormVer3?.benh_nhan_email ?? patientDiagnose.email,

    benh_nhan_pid: doctorUseFormVer3?.benh_nhan_pid ?? patientDiagnose.PID,

    benh_nhan_sid: doctorUseFormVer3?.benh_nhan_sid ?? patientDiagnose.SID,

    benh_nhan_lam_sang:
      doctorUseFormVer3?.benh_nhan_lam_sang ||
      patientDiagnose.Indication ||
      patientDiagnose.clinical_information,

    benh_nhan_dia_chi_so_nha:
      doctorUseFormVer3?.benh_nhan_dia_chi_so_nha ?? patientDiagnose.address,

    benh_nhan_dia_chi_xa_phuong:
      doctorUseFormVer3?.benh_nhan_dia_chi_xa_phuong ??
      patientDiagnose.ward_code,

    benh_nhan_dia_chi_tinh_thanh_pho:
      doctorUseFormVer3?.benh_nhan_dia_chi_tinh_thanh_pho ??
      patientDiagnose.province_code,

    id_template_service:
      doctorUseFormVer3?.id_template_service ??
      patientDiagnose.id_template_service,

    id_exam_part:
      doctorUseFormVer3?.id_exam_part ?? patientDiagnose.id_exam_part,

    ket_luan: doctorUseFormVer3?.ket_luan ?? "",
    khuyen_nghi: doctorUseFormVer3?.recommendation ?? "",
    icd10: doctorUseFormVer3?.icd10_classification ?? "",
    implementMethod: doctorUseFormVer3?.implementMethod ?? "",
    contrastInjection: doctorUseFormVer3?.contrastInjection ?? "",
    imageQuatity: doctorUseFormVer3?.imageQuatity ?? "",
    additionalAction: doctorUseFormVer3?.addtionalImpletement ?? "",
    phan_do_loai: doctorUseFormVer3?.classify,
    chan_doan_phan_biet: doctorUseFormVer3?.DifferenceDiagnostic,
    imagingDiagnosisSummary: doctorUseFormVer3?.imagingDiagnosisSummary || "",
    language: doctorUseFormVer3?.language || "vi",
  };
};

export const buildFormVer3Values = (data) => {
  return {
    // --- liên kết / cấu hình ---
    id_template_service: data?.id_template_service,
    id_exam_part: data?.id_exam_part,
    id_formver3_name: data?.id_formver3_name,

    // --- meta ---
    language: data?.language || "vi",
    createdAt: data?.createdAt
      ? dayjs(data.createdAt).format("YYYY-MM-DD")
      : undefined,
    doctor_name: data?.id_doctor_doctor?.full_name,

    // --- kỹ thuật ---
    advancedSample: data?.advanced_sample ? "yes" : "no",
    contrastInjection: data?.contrastInjection,
    imageQuatity: data?.imageQuatity,
    additionalAction: data?.addtionalImpletement,

    implementMethod: data?.implementMethod,

    // --- chẩn đoán ---
    icd10: data?.icd10_classification,
    phan_do_loai: data?.classify,
    chan_doan_phan_biet: data?.DifferenceDiagnostic,
    khuyen_nghi: data?.recommendation,
    imagingDiagnosisSummary: data.imagingDiagnosisSummary || "",
  };
};

export function buildFormDataDoctorUseFormVer3(values, extra) {
  const fd = new FormData();

  if (extra.imageList?.length) {
    const meta = extra.imageList.map((item, idx) => {
      const hasFile = item.file;
      return {
        url: !hasFile ? item.url || item.rawUrl : "",
        caption: item.caption || "",
        isChange: hasFile,
        fileField: hasFile ? `ImageDescFiles` : undefined,
      };
    });

    fd.append("imageDescMeta", JSON.stringify(meta));

    extra.imageList.forEach((item, idx) => {
      if (item.file) {
        fd.append(`ImageDescFiles`, item.file);
      }
    });
  }
  if (extra?.id_patient_diagnose)
    fd.append("id_patient_diagnose", extra?.id_patient_diagnose);

  if (extra?.formVer3)
    fd.append("id_formver3", String(extra.formVer3.id ?? ""));

  if (extra?.imagingRows)
    fd.append("imageDescription", JSON.stringify(extra?.imagingRows));
  if (extra?.abnormalFindings)
    fd.append("unUsualDescription", extra.abnormalFindings.join("; "));

  // ----------------------------------------

  fd.append("id_template_service", String(values.id_template_service ?? ""));
  fd.append("id_exam_part", String(values.id_exam_part ?? ""));
  fd.append("id_print_template", String(values.id_print_template ?? ""));

  fd.append("language", values.language);
  fd.append("implementMethod", values.implementMethod);
  fd.append("contrastInjection", values.contrastInjection);
  fd.append("imageQuatity", values.imageQuatity);

  fd.append("addtionalImpletement", values.additionalAction);
  fd.append("DifferenceDiagnostic", values.chan_doan_phan_biet);
  fd.append("classify", values.phan_do_loai);

  fd.append("recommendation", values.khuyen_nghi ?? "");
  fd.append("icd10_classification", values.icd10 ?? "");
  fd.append("imagingDiagnosisSummary", values.imagingDiagnosisSummary ?? "");

  // ---- Thông tin bệnh nhân
  fd.append("benh_nhan_ho_ten", values.benh_nhan_ho_ten ?? "");
  fd.append("benh_nhan_gioi_tinh", values.benh_nhan_gioi_tinh ?? "");
  fd.append("benh_nhan_tuoi", String(values.benh_nhan_tuoi ?? ""));
  fd.append("benh_nhan_dia_chi_so_nha", values.benh_nhan_dia_chi_so_nha ?? "");
  fd.append(
    "benh_nhan_dia_chi_xa_phuong",
    values.benh_nhan_dia_chi_xa_phuong ?? "",
  );
  fd.append(
    "benh_nhan_dia_chi_tinh_thanh_pho",
    values.benh_nhan_dia_chi_tinh_thanh_pho ?? "",
  );
  fd.append("benh_nhan_quoc_tich", values.benh_nhan_quoc_tich ?? "");
  fd.append("benh_nhan_dien_thoai", values.benh_nhan_dien_thoai ?? "");
  fd.append("benh_nhan_email", values.benh_nhan_email ?? "");
  fd.append("benh_nhan_pid", values.benh_nhan_pid ?? "");
  fd.append("benh_nhan_sid", values.benh_nhan_sid ?? "");
  fd.append("benh_nhan_lam_sang", values.benh_nhan_lam_sang ?? "");

  return fd;
}

export const ADVANCED_SAMPLE_STATUS_MAP = {
  1: { text: "Nháp", color: "orange" },
  2: { text: "Đã chính thức", color: "green" },
};

const ADVANCED_SAMPLE_MAP = {
  yes: { text: "Có", color: "green" },
  no: { text: "Không", color: "default" },
};

export const formatIndentedList = (items = []) =>
  items
    .map((item, index) => {
      // thụt các dòng xuống trong cùng 1 item
      const formatted = item?.replace(/\n/g, "\n   ");
      return `${index + 1}. ${formatted}`;
    })
    .join("\n");

export const PATIENT_FIELDS = [
  "benh_nhan_ho_ten",
  "benh_nhan_ngay_sinh",
  "benh_nhan_gioi_tinh",
  "benh_nhan_dia_chi",
  "benh_nhan_quoc_tich",
  "benh_nhan_cccd",
  "benh_nhan_phone",
  "province_code",
  "ward_code",
];

export const CAN_THIEP_GROUP_CODE = ["CTSA", "CTCT", "CTXA"];

export const TEMPLATE_GROUP_RENDER_MAP = {
  CAN_THIEP: CAN_THIEP_GROUP_CODE,
};

export const getServiceLabel = (s, languageTranslate) =>
  languageTranslate === "vi" ? s.name : s.name_en || s.name;

export const examPartName = (selectedExamPart, languageTranslate) => {
  return languageTranslate === "vi"
    ? selectedExamPart?.name
    : selectedExamPart?.name_en || selectedExamPart?.name;
};
