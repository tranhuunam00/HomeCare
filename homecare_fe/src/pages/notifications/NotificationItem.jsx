import React from "react";
import { List, Avatar, Tag, Tooltip, Badge } from "antd";
import {
  MessageOutlined,
  AlertOutlined,
  FileTextOutlined,
  BellOutlined,
  ContainerOutlined,
  GiftOutlined,
  InfoCircleOutlined,
  CheckCircleFilled,
  EyeOutlined,
} from "@ant-design/icons";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";

import styles from "./NotificationBell.module.scss";

dayjs.extend(relativeTime);
dayjs.locale("vi");

const TYPE_CONFIG = {
  system: {
    icon: <InfoCircleOutlined />,
    color: "#1677ff",
    bg: "#e6f4ff",
    label: "Hệ thống",
  },

  package: {
    icon: <ContainerOutlined />,
    color: "#fa8c16",
    bg: "#fff7e6",
    label: "Gói dịch vụ",
  },

  diagnosis: {
    icon: <FileTextOutlined />,
    color: "#13c2c2",
    bg: "#e6fffb",
    label: "Ca bệnh",
  },

  chat: {
    icon: <MessageOutlined />,
    color: "#52c41a",
    bg: "#f6ffed",
    label: "Tin nhắn",
  },

  alert: {
    icon: <AlertOutlined />,
    color: "#f5222d",
    bg: "#fff2f0",
    label: "Cảnh báo",
  },
};

const PRIORITY_CONFIG = {
  low: {
    color: "default",
    label: "Thấp",
  },

  normal: {
    color: "blue",
    label: "Bình thường",
  },

  high: {
    color: "red",
    label: "Quan trọng",
  },
};

const NotificationItem = ({ item, onClick }) => {
  const { id, title, message, createdAt, is_read, priority, type, action_url } =
    item;

  const typeConfig = TYPE_CONFIG[type] || TYPE_CONFIG.system;

  const priorityConfig = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.normal;

  return (
    <List.Item
      className={`${styles.item} ${!is_read ? styles.unread : styles.read}`}
      onClick={() => onClick(id, action_url)}
      style={{
        background: !is_read ? typeConfig.bg : "#fff",
      }}
    >
      <List.Item.Meta
        avatar={
          <Badge dot={!is_read}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Avatar
                style={{
                  backgroundColor: typeConfig.color,
                  marginBottom: 10,
                  marginLeft: 5,
                }}
                icon={typeConfig.icon}
              />
              {item.is_read ? (
                <CheckCircleFilled style={{ color: "#52c41a" }} />
              ) : item.is_seen ? (
                <EyeOutlined style={{ color: "#999" }} />
              ) : (
                <Badge status="error" />
              )}
            </div>
          </Badge>
        }
        title={
          <div className={styles.titleRow}>
            <Tooltip title={title}>
              <span
                className={styles.title}
                style={{
                  fontWeight: !is_read ? 700 : 500,
                }}
              >
                {title}
              </span>
            </Tooltip>

            <Tag color={typeConfig.color}>{typeConfig.label}</Tag>
          </div>
        }
        description={
          <>
            <div className={styles.message}>{message}</div>

            <div className={styles.meta}>
              <Tag color={priorityConfig.color}>{priorityConfig.label}</Tag>

              <span className={styles.time}>{dayjs(createdAt).fromNow()}</span>
            </div>
          </>
        }
      />
    </List.Item>
  );
};

export default NotificationItem;
