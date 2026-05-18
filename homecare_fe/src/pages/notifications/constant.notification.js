import {
  InfoCircleOutlined,
  GiftOutlined,
  FileTextOutlined,
  MessageOutlined,
  WarningOutlined,
} from "@ant-design/icons";

export const NOTIFICATION_TYPE = {
  SYSTEM: "system",
  PACKAGE: "package",
  DIAGNOSIS: "diagnosis",
  CHAT: "chat",
  ALERT: "alert",
};

export const notificationTypeConfig = {
  [NOTIFICATION_TYPE.SYSTEM]: {
    label: "Hệ thống",
    icon: InfoCircleOutlined,
    color: "#1677ff",
    bgUnread: "#e6f4ff",
  },

  [NOTIFICATION_TYPE.PACKAGE]: {
    label: "Gói dịch vụ",
    icon: GiftOutlined,
    color: "#722ed1",
    bgUnread: "#f9f0ff",
  },

  [NOTIFICATION_TYPE.DIAGNOSIS]: {
    label: "Ca bệnh",
    icon: FileTextOutlined,
    color: "#13c2c2",
    bgUnread: "#e6fffb",
  },

  [NOTIFICATION_TYPE.CHAT]: {
    label: "Tin nhắn",
    icon: MessageOutlined,
    color: "#52c41a",
    bgUnread: "#f6ffed",
  },

  [NOTIFICATION_TYPE.ALERT]: {
    label: "Cảnh báo",
    icon: WarningOutlined,
    color: "#ff4d4f",
    bgUnread: "#fff2f0",
  },
};
