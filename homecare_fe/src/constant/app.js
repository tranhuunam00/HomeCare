import React from "react";
import { toast } from "react-toastify";
import API_CALL from "../services/axiosClient";
import { TRANSLATE_MULTI_REPORT } from "./translate.report";
import dayjs from "dayjs";
import {
  FileTextOutlined,
  TeamOutlined,
  SyncOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileDoneOutlined,
} from "@ant-design/icons";

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
  1: "Chưa đọc",
  2: "Hội chẩn",
  3: "Đang đọc",
  4: "Đọc xong",
  5: "Đang duyệt",
  6: "Duyệt xong",
};

export const PATIENT_DIAGNOSE_STATUS_NAME = {
  NEW: 1,
  CONSULTATION: 2,
  IN_PROCESSING: 3,
  READ_DONE: 4,
  WAIT_VERIFY: 5,
  VERIFIED: 6,
};

export const PATIENT_DIAGNOSE_STATUS_CODE = {
  NEW: 1,
  CONSULTATION: 2,
  IN_PROCESSING: 3,
  READ_DONE: 4,
  WAIT_VERIFY: 5,
  VERIFIED: 6,
};
export const PATIENT_DIAGNOSE_COLOR = {
  1: "#f43f5e", // Chưa đọc - Rose red
  2: "#d97706", // Hội chẩn - Amber gold
  3: "#f97316", // Đang đọc - Active orange
  4: "#0284c7", // Đọc xong - Sky blue
  5: "#8b5cf6", // Đang duyệt - Violet purple
  6: "#10b981", // Duyệt xong - Emerald green
};

export const getPatientDiagnoseIcon = (status, styleProps = {}) => {
  const style = { fontSize: 13, ...styleProps.style };
  const { spin, ...rest } = styleProps;
  switch (Number(status)) {
    case 1:
      return React.createElement(FileTextOutlined, { style, ...rest });
    case 2:
      return React.createElement(TeamOutlined, { style, ...rest });
    case 3:
      return React.createElement(SyncOutlined, { spin, style, ...rest });
    case 4:
      return React.createElement(CheckCircleOutlined, { style, ...rest });
    case 5:
      return React.createElement(ClockCircleOutlined, { style, ...rest });
    case 6:
      return React.createElement(FileDoneOutlined, { style, ...rest });
    default:
      return null;
  }
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
              }</li>`,
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
  { label: "Bác sĩ", value: "BS" },
  { label: "Không có", value: "" },
];

export const TRANSLATE_LANGUAGE = {
  VI: "vi",
  ENG: "en",
};

export const translateLabel = (lang = "vi", key, uppercase = true) => {
  let text = TRANSLATE_MULTI_REPORT?.[lang]?.[key] || key;
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

export const getSonoTemplateService = (templateServices) => {
  return templateServices.find((t) => t.code.toUpperCase().includes("SASK"));
};

export const getExamPartSono = (examParts, sonoTemplateService) => {
  return examParts.filter(
    (e) => e.id_template_service === sonoTemplateService?.id,
  );
};

export const generateSorter = (dataIndex) => (a, b) => {
  const v1 = a[dataIndex];
  const v2 = b[dataIndex];

  if (typeof v1 === "number") return v1 - v2;
  if (dayjs(v1).isValid()) return dayjs(v1).diff(dayjs(v2));

  return String(v1 || "").localeCompare(String(v2 || ""));
};

export const DoctorSignFileStatus = {
  WAITING: 1,
  FAIL: 2,
  SUCCESS: 3,
};
