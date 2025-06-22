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

export const PATIENT_DIAGNOSE_COLOR = {
  1: "Blue",
  2: "#808000",
  3: "Orange",
  4: "Green",
};
export function extractDynamicFieldsFromHtml(htmlString) {
  const regex =
    /\{\{\{(text|number|checkbox|select|textarea|image|file|date):\s*([^\}=]+?)(?:=([^\}]+))?\s*\}\}\}/g;

  const matches = [...htmlString.matchAll(regex)];

  return matches.map((match, index) => ({
    type: match[1].toLowerCase(),
    label: match[2].trim(),
    defaultValue: match[3]?.trim() || "", // nếu không có thì trả ""
    raw: match[0],
    index,
  }));
}
