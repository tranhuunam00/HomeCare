export const ROLE = {
  admin: "ADMIN",
  user: "USER",
};

export const USER_STATUS = {
  REQUEST: 1,
  ACCEPT: 2,
  BAN: 3,
};

export const USER_ROLE = {
  ADMIN: 1,
  DOCTOR: 2,
};

export const USER_ROLE_ID = {
  1: "Quản trị viên",
  2: "Bác sĩ",
};

export const PATIENT_DIAGNOSE_STATUS = {
  1: "Mới",
  2: "Đang đọc",
  3: "Chờ xác nhận",
  4: "Đã xác nhận",
};

export const PATIENT_DIAGNOSE_STATUS_NAME = {
  NEW: 1,
  IN_PROCESS: 2,
  WAITING: 3,
  VERIFY: 4,
  TRANSLATE: 5,
};

export const PATIENT_DIAGNOSE_STATUS_CODE = {
  NEW: 1,
  INPROCESS: 2,
  WAIT: 3,
  VERIFY: 4,
};

export const PATIENT_DIAGNOSE_COLOR = {
  1: "Blue",
  2: "#808000",
  3: "Orange",
  4: "Green",
  5: "#11111",
};
export function extractDynamicFieldsFromHtml(htmlString) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, "text/html");

  const rows = Array.from(doc.querySelectorAll("tr"));
  const result = [];

  let currentGroup = null;
  let index = 0;

  for (const row of rows) {
    // Nếu là dòng nhóm có <strong>
    const strongCell = row.querySelector("td[colspan] strong");
    if (strongCell) {
      currentGroup = strongCell.textContent.trim();
      continue;
    }

    // Tìm tất cả dynamic fields trong dòng
    const regex =
      /\{\{\{(text|number|checkbox|select|textarea|image|file|date):\s*([^\}=]+?)(?:=([^\}]+))?\s*\}\}\}/g;
    const matches = [...row.innerHTML.matchAll(regex)];

    for (const match of matches) {
      result.push({
        type: match[1].toLowerCase(),
        label: match[2].trim(),
        defaultValue: match[3]?.trim() || "",
        raw: match[0],
        index: index++,
        group: currentGroup || null,
      });
    }
  }

  return result;
}

export const ADMIN_INFO_LABELS = {
  full_name: "Họ và tên",
  gender: "Giới tính",
  dob: "Năm sinh",
  age: "Tuổi",
  country: "Quốc gia",
  province: "Tỉnh/Thành phố",
  district: "Quận/Huyện",
  ward: "Xã/Phường",
  address: "Số nhà",
  phoneNumber: "Số điện thoại",
  email: "Email",
  symptoms: "Triệu chứng",
  progress: "Diễn biến",
  medical_history: "Tiền sử bệnh",
  compare_link: "So sánh",
  old_date: "Có kết quả cũ",
  section_title: "THÔNG TIN HÀNH CHÍNH",
  image_section: "HÌNH ẢNH MINH HỌA",
  doctor: "BÁC SĨ THỰC HIỆN",
  time: "Thời gian",
  digital_signature: "Chữ ký số",
  Medical_test_result: "PHIẾU KẾT QUẢ",
};

export const ADMIN_INFO_LABELS_EN = {
  full_name: "Full Name",
  gender: "Gender",
  dob: "Year of Birth",
  age: "Age",
  country: "Country",
  province: "Province/City",
  district: "District",
  ward: "Ward/Commune",
  address: "Address",
  phoneNumber: "Phone Number",
  email: "Email",
  symptoms: "Symptoms",
  progress: "Progress",
  medical_history: "Medical History",
  compare_link: "Comparison",
  old_date: "Previous Result",
  section_title: "ADMINISTRATIVE INFORMATION",
  image_section: "ILLUSTRATIVE IMAGES",
  doctor: "DOCTOR",
  time: "Time",
  digital_signature: "Digital signature",
  Medical_test_result: "MEDICAL REPORT",
};

export const LANGUAGES = {
  vi: "vi",
  en: "en",
};
