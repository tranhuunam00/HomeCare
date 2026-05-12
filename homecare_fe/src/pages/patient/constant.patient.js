import API_CALL from "../../services/axiosClient";
export const PATIENT_DIAGNOSE_STATUS_FILTER = {
  1: "Chưa đọc",
  2: "Đang đọc",
  3: "Chờ duyệt",
  4: "Đã duyệt",
};

export const PATIENT_DIAGNOSE_COLOR = {
  1: "#0b56e3d3", // New
  2: "#F59E0B", // Reading
  3: "#8317c6ff", // Waiting
  4: "#10B981", // Done
};
