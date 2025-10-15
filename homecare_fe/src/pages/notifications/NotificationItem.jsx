import React from "react";
import { List, Avatar, Tag, Tooltip } from "antd";
import {
  ExclamationCircleOutlined,
  MessageOutlined,
  AlertOutlined,
  UserOutlined,
  FileTextOutlined,
  BellOutlined,
  ContainerOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";
import styles from "./NotificationBell.module.scss";

dayjs.extend(relativeTime);
dayjs.locale("vi");

/**
 * @param {Object} props
 * @param {Object} props.item - notification object
 * @param {Function} props.onClick - callback khi click vào item
 */
const NotificationItem = ({ item, onClick }) => {
  const {
    id,
    title,
    message,
    createdAt,
    is_read,
    priority,
    type,
    icon,
    action_url,
  } = item;

  // Chọn icon theo type hoặc custom icon
  const renderIcon = () => {
    // Nếu icon là URL hợp lệ
    if (icon && icon.startsWith("http")) {
      return <Avatar src={icon} />;
    }

    // Nếu icon là tên biểu tượng từ backend
    switch (icon || type) {
      case "gift":
        return (
          <Avatar
            style={{ backgroundColor: "#fadb14" }}
            icon={<BellOutlined />}
          />
        );
      case "package":
        return (
          <Avatar
            style={{ backgroundColor: "#fa8c16" }}
            icon={<ContainerOutlined />}
          />
        );
      case "check-circle":
        return (
          <Avatar
            style={{ backgroundColor: "#52c41a" }}
            icon={<FileTextOutlined />}
          />
        );
      case "x-circle":
        return (
          <Avatar
            style={{ backgroundColor: "#f5222d" }}
            icon={<AlertOutlined />}
          />
        );
      case "diagnosis":
        return (
          <Avatar
            style={{ backgroundColor: "#13c2c2" }}
            icon={<FileTextOutlined />}
          />
        );
      case "chat":
        return (
          <Avatar
            style={{ backgroundColor: "#1677ff" }}
            icon={<MessageOutlined />}
          />
        );
      default:
        return (
          <Avatar style={{ backgroundColor: "#ccc" }} icon={<BellOutlined />} />
        );
    }
  };

  // Chọn màu theo priority
  const priorityColor =
    priority === "high" ? "red" : priority === "normal" ? "blue" : "default";

  return (
    <List.Item
      className={`${styles.item} ${!is_read ? styles.unread : ""}`}
      onClick={() => onClick(id, action_url)}
    >
      <List.Item.Meta
        avatar={renderIcon()}
        title={
          <div className={styles.title}>
            <Tooltip title={title}>
              <span>{title}</span>
            </Tooltip>
          </div>
        }
        description={
          <>
            <div className={styles.message}>{message}</div>
            <div className={styles.meta}>
              <Tag color={priorityColor}>{priority}</Tag>
              <span>{dayjs(createdAt).fromNow()}</span>
            </div>
          </>
        }
      />
    </List.Item>
  );
};

export default NotificationItem;
