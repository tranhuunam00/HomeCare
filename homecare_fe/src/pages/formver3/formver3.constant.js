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
