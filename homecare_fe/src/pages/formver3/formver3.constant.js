import dayjs from "dayjs";
import { getAge } from "../../constant/app";

export const IMAGE_QUALITY_OPTIONS = [
  { value: "good", label: "Đạt yêu cầu" },
  { value: "limited", label: "Đạt yêu cầu, có hạn chế" },
  { value: "bad", label: "Không đạt" },
];

export const ADDITIONAL_ACTION_OPTIONS = [
  { value: "no", label: "Không" },
  { value: "extra", label: "Chụp thêm" },
  { value: "redo", label: "Chụp lại" },
];
export const CONTRAST_INJECTION_OPTIONS = [
  { value: "no", label: "Không" },
  { value: "yes", label: "Có" },
];

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

export const buildDradv3FormValues = ({ dradsDetail, patientDiagnose }) => {
  return {
    benh_nhan_ho_ten: dradsDetail?.benh_nhan_ho_ten ?? patientDiagnose.name,

    benh_nhan_gioi_tinh:
      dradsDetail?.benh_nhan_gioi_tinh ?? patientDiagnose.gender,

    benh_nhan_tuoi: dradsDetail?.benh_nhan_tuoi ?? getAge(patientDiagnose.dob),

    benh_nhan_quoc_tich:
      dradsDetail?.benh_nhan_quoc_tich ?? patientDiagnose.countryCode,

    benh_nhan_dien_thoai:
      dradsDetail?.benh_nhan_dien_thoai ?? patientDiagnose.phoneNumber,

    benh_nhan_email: dradsDetail?.benh_nhan_email ?? patientDiagnose.email,

    benh_nhan_pid: dradsDetail?.benh_nhan_pid ?? patientDiagnose.PID,

    benh_nhan_sid: dradsDetail?.benh_nhan_sid ?? patientDiagnose.SID,

    benh_nhan_lam_sang:
      dradsDetail?.benh_nhan_lam_sang ?? patientDiagnose.Indication,

    benh_nhan_dia_chi_so_nha:
      dradsDetail?.benh_nhan_dia_chi_so_nha ?? patientDiagnose.address,

    benh_nhan_dia_chi_xa_phuong:
      dradsDetail?.benh_nhan_dia_chi_xa_phuong ?? patientDiagnose.ward_code,

    benh_nhan_dia_chi_tinh_thanh_pho:
      dradsDetail?.benh_nhan_dia_chi_tinh_thanh_pho ??
      patientDiagnose.province_code,

    id_template_service:
      dradsDetail?.id_template_service ?? patientDiagnose.id_template_service,

    id_exam_part: dradsDetail?.id_exam_part ?? patientDiagnose.id_exam_part,

    ket_luan: dradsDetail?.ket_luan ?? "",
    khuyen_nghi: dradsDetail?.khuyen_nghi ?? "",
    icd10: dradsDetail?.icd10 ?? "",
    ket_qua_chan_doan: dradsDetail?.ket_qua_chan_doan ?? "",
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
    imageQuality: data?.imageQuatity,
    additionalAction: data?.addtionalImpletement,

    implementMethod: data?.implementMethod,

    // --- chẩn đoán ---
    icd10: data?.icd10_classification,
    phan_do_loai: data?.classify,
    chan_doan_phan_biet: data?.DifferenceDiagnostic,
    khuyen_nghi: data?.recommendation,
  };
};
