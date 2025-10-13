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
  phoneNumber: "Điện thoại",
  email: "Email",
  symptoms: "Triệu chứng",
  progress: "Diễn biến",
  medical_history: "Tiền sử bệnh",
  compare_link: "So sánh",
  old_date: "Có kết quả cũ",
  section_title: "THÔNG TIN HÀNH CHÍNH",
  image_section: "HÌNH ẢNH MINH HỌA",
  doctor: "BÁC SĨ THỰC HIỆN",
  time: "Thời gian hoàn thành",
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

export const getLabelFromValue = (options, value) => {
  if (Array.isArray(value) && value.length > 0) {
    return `
      <ul style="padding-left: 16px; margin: 0;">
        ${value
          .map(
            (v) =>
              `<li style="margin-bottom: 6px;">${
                options.find((o) => o.value === v)?.label || v
              }</li>`
          )
          .join("")}
      </ul>
    `;
  }

  if (typeof value === "string" || typeof value === "number") {
    const label = options.find((o) => o.value === value)?.label || value;
    return `${label}`;
  }

  return "--";
};

export const genAITextToHtml = (geminiResponse) => {
  return `<tr>
                <td>Khuyến nghị</td>
                <td>
                  <div style="
                    background: #fafafa;
                    padding: 12px;
                    margin-top: 8px;
                    border: 1px solid #eee;
                    white-space: pre-wrap;
                    font-family: Arial, sans-serif;
                    font-size: 13px;
                  ">
                    ${geminiResponse
                      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") // giữ định dạng đậm
                      .replace(/^\* /gm, "• ") // dấu bullet
                      .replace(/\n/g, "<br>")}
                  </div>
                </td>
              </tr>`;
};
export const STYLE_COPY = `
<style>
        table {
          width: 100%;
          border-collapse: collapse;
          font-family: Arial, sans-serif;
        }
        th, td {
          border: 1px solid #ccc;
          padding: 2px 6px;
          text-align: left;
          font-size: 14px;
          vertical-align: middle;
          word-wrap: break-word;
          white-space: pre-wrap;
        }
        th {
          background-color: #f5f5f5;
        }
        caption {
          caption-side: top;
          font-weight: bold;
          font-size: 16px;
          margin-bottom: 10px;
          text-align: left;
        }
        p {
          font-size: 14px;
        }
      </style>
      `;
export const ACADEMIC_TITLES = [
  { label: "Giáo sư", value: "GS" },
  { label: "Phó Giáo sư", value: "PGS" },
  { label: "Không có", value: "" },
];

export const DEGREES = [
  { label: "Tiến sĩ", value: "TS" },
  { label: "Thạc sĩ", value: "ThS" },
  { label: "BSCKI", value: "BSCKI" },
  { label: "BSCKII", value: "BSCKII" },
  { label: "Cử nhân", value: "CN" },
  { label: "Không có", value: "" },
];

export const TRANSLATE_LANGUAGE = {
  VI: "vi",
  ENG: "en",
};

// languageConstants.js
export const FORM_LABELS = {
  vi: {
    administrativeInfo: "THÔNG TIN HÀNH CHÍNH",
    fullName: "Họ tên",
    gender: "Giới tính",
    age: "Tuổi",
    nationality: "Quốc tịch",
    phone: "Điện thoại",
    email: "Email",
    patientId: "Mã số bệnh nhân PID",
    sid: "SID",
    province: "Tỉnh/Thành phố",
    district: "Phường/Xã",
    address: "Địa chỉ",
    clinical: "Lâm sàng",
    department: "Phân hệ",
    division: "Chuyên khoa",
    codeForm: "Mã số định danh mẫu",
    bodyPart: "Bộ phận",
    resultTemplate: "Mẫu đọc kết quả",
    resultPrint: "Mẫu in kết quả",
    language: "Ngôn ngữ",
    formName: "Tên mẫu",
    formResult: "Kết luận của mẫu",
    createdAt: "Ngày thực hiện",
    createdUser: "Người thực hiện",

    // --- Radiology / Report sections ---
    technicalProtocol: "QUY TRÌNH KỸ THUẬT",
    imagingFindings: "MÔ TẢ HÌNH ẢNH",
    impression: "KẾT LUẬN, CHẨN ĐOÁN",
    icd10Classification: "Phân loại ICD-10",
    gradingClassification: "Phân độ, phân loại",
    differentialDiagnosis: "Chẩn đoán phân biệt",
    recommendationsCounseling: "KHUYẾN NGHỊ & TƯ VẤN",
    illustrativeImages: "HÌNH ẢNH MINH HỌA",
    doctor: "BÁC SỸ THỰC HIỆN",
    time: "Thời gian",
    Result_Report: "Phiếu kết quả",
  },
  en: {
    Result_Report: "Result Report",
    administrativeInfo: "Administrative Information",
    time: "Completed time",
    fullName: "Full Name",
    gender: "Gender",
    age: "Age",
    nationality: "Nationality",
    phone: "Phone",
    email: "Email",
    patientId: "Patient ID (PID)",
    sid: "SID",
    province: "Province/City",
    district: "Ward/District",
    address: "Address",
    clinical: "Clinical Symptoms",
    department: "Department",
    division: "Department",
    codeForm: "Code",
    formResult: "Form Result",

    bodyPart: "Body Part",
    resultTemplate: "Result Template",
    resultPrint: "Result Print",
    language: "Language",
    formName: "Form name",
    createdAt: "Created date",
    createdUser: "Created user",

    // --- Radiology / Report sections ---
    technicalProtocol: "Technical Protocol",
    imagingFindings: "Imaging Findings",
    impression: "Conclusion, Impression",
    icd10Classification: "ICD-10 Classification",
    gradingClassification: "Grading / Classification",
    differentialDiagnosis: "Differential Diagnosis",
    recommendationsCounseling: "Recommendations & Counseling",
    illustrativeImages: "Illustrative Images",
  },
};
export const translateLabel = (lang = "vi", key, uppercase = true) => {
  let text = FORM_LABELS?.[lang]?.[key] || key;
  return uppercase ? text.toUpperCase() : text;
};

export const sortTemplateServices = (templateServices = []) => {
  const priorityOrder = [
    "Siêu âm",
    "Chụp XQ",
    "Chụp MSCT",
    "Chụp MRI",
    "Nội soi và TDCN",
    "Can thiệp SA",
    "Can thiệp CT",
    "Can thiệp DSA",
  ];

  return [...templateServices].sort((a, b) => {
    const indexA = priorityOrder.indexOf(a.name);
    const indexB = priorityOrder.indexOf(b.name);

    if (indexA !== -1 && indexB !== -1) return indexA - indexB;
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;
    return a.name.localeCompare(b.name);
  });
};
