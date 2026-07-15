import React from "react";
import { Spin, Tooltip } from "antd";
import {
  InfoCircleOutlined,
  ContainerOutlined,
  FileTextOutlined,
  MessageOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  UserAddOutlined,
  SwapOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";
import styles from "./NotificationBell.module.scss";

dayjs.extend(relativeTime);
dayjs.locale("vi");

export const NOTIFICATION_TYPE_CONFIG = {
  system: {
    label: "Hệ thống",
    icon: <InfoCircleOutlined />,
    color: "#3b82f6",
    bgColor: "#eff6ff",
    badgeBg: "#dbeafe",
    badgeColor: "#1d4ed8",
  },
  package: {
    label: "Gói dịch vụ",
    icon: <ContainerOutlined />,
    color: "#f59e0b",
    bgColor: "#fffbeb",
    badgeBg: "#fef3c7",
    badgeColor: "#b45309",
  },
  diagnosis: {
    label: "Ca bệnh",
    icon: <FileTextOutlined />,
    color: "#0891b2",
    bgColor: "#ecfeff",
    badgeBg: "#cffafe",
    badgeColor: "#0e7490",
  },
  chat: {
    label: "Tin nhắn",
    icon: <MessageOutlined />,
    color: "#16a34a",
    bgColor: "#f0fdf4",
    badgeBg: "#dcfce7",
    badgeColor: "#15803d",
  },
  alert: {
    label: "Cảnh báo",
    icon: <WarningOutlined />,
    color: "#dc2626",
    bgColor: "#fef2f2",
    badgeBg: "#fee2e2",
    badgeColor: "#b91c1c",
  },
  status_change: {
    label: "Cập nhật",
    icon: <SwapOutlined />,
    color: "#7c3aed",
    bgColor: "#f5f3ff",
    badgeBg: "#ede9fe",
    badgeColor: "#6d28d9",
  },
  new_patient: {
    label: "Ca mới",
    icon: <UserAddOutlined />,
    color: "#0f766e",
    bgColor: "#f0fdfa",
    badgeBg: "#ccfbf1",
    badgeColor: "#0f766e",
  },
};

const NotificationItem = ({ item, onClick }) => {
  const { id, title, message, createdAt, is_read, type, action_url } = item;
  const cfg = NOTIFICATION_TYPE_CONFIG[type] || NOTIFICATION_TYPE_CONFIG.system;

  return (
    <div
      className={`${styles.item} ${!is_read ? styles.itemUnread : styles.itemRead}`}
      onClick={() => onClick(id, action_url)}
    >
      {/* Avatar */}
      <div className={styles.avatarWrap}>
        <div
          className={styles.avatar}
          style={{ background: cfg.bgColor, color: cfg.color }}
        >
          {cfg.icon}
        </div>
        {!is_read && <span className={styles.unreadDot} />}
      </div>

      {/* Content */}
      <div className={styles.content}>
        <div className={styles.titleLine}>
          <span
            className={`${styles.itemTitle} ${is_read ? styles.itemTitleRead : ""}`}
          >
            {title}
          </span>
          <span
            className={styles.typeBadge}
            style={{ background: cfg.badgeBg, color: cfg.badgeColor }}
          >
            {cfg.label}
          </span>
        </div>

        {message && (
          <Tooltip title={message} placement="topLeft">
            <div className={styles.itemMessage}>{message}</div>
          </Tooltip>
        )}

        <div className={styles.itemFooter}>
          <span className={styles.itemTime}>
            {dayjs(createdAt).fromNow()}
          </span>
          {is_read && (
            <CheckCircleOutlined
              style={{ fontSize: 11, color: "#94a3b8" }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;
