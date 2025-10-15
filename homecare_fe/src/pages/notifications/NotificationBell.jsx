import React, { useState, useEffect, useRef } from "react";
import {
  Badge,
  Dropdown,
  List,
  Spin,
  Button,
  Tag,
  Avatar,
  Space,
  Radio,
  message,
} from "antd";
import { BellOutlined, CheckOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import API_CALL from "../../services/axiosClient";
import styles from "./NotificationBell.module.scss";
import NotificationItem from "./NotificationItem";
import { useGlobalAuth } from "../../contexts/AuthContext";

const NotificationBell = () => {
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [filter, setFilter] = useState("all"); // "all" | "unread"

  const dropdownRef = useRef(null);
  const { user, notifications, setNotifications, unreadCount, setUnreadCount } =
    useGlobalAuth();

  // Fetch notification list
  const fetchNotifications = async (pageNum = 1) => {
    if (loading) return;
    setLoading(true);

    const limit = 20;
    const offset = (pageNum - 1) * limit;

    try {
      const res = await API_CALL.get(
        `/notification?limit=${limit}&offset=${offset}&user_id=${user?.id}`
      );

      const records = res.data.data.data || [];
      const total = res.data.data?.total || 0;

      setNotifications((prev) => {
        const newData = pageNum === 1 ? records : [...prev, ...records];
        const nextOffset = offset + records.length;
        setHasMore(nextOffset < total);
        setUnreadCount(newData.filter((n) => !n.is_read).length);
        return newData;
      });

      setPage(pageNum);
    } catch (err) {
      console.error("Fetch notifications error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Đóng dropdown khi click ngoài
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setVisible(false);
      }
    };
    if (visible) document.addEventListener("mousedown", handleClickOutside);
    else document.removeEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [visible]);

  // Đánh dấu 1 cái đã đọc
  const markAsRead = async (id, actionUrl) => {
    try {
      await API_CALL.patch(`/notification/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(prev - 1, 0));
      // if (actionUrl) window.open(actionUrl, "_blank");
    } catch (err) {
      console.error("Mark read failed:", err);
    }
  };

  // Đánh dấu tất cả là đã đọc
  const markAllAsRead = async () => {
    try {
      await API_CALL.patch("/notification/read-all");
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, is_read: true, read_at: new Date() }))
      );
      setUnreadCount(0);
      message.success("Tất cả thông báo đã được đánh dấu là đã đọc");
    } catch (err) {
      console.error("Mark all as read failed:", err);
      message.error("Không thể đánh dấu tất cả là đã đọc");
    }
  };

  // Lọc danh sách hiển thị
  const filteredNotifications =
    filter === "unread"
      ? notifications.filter((n) => !n.is_read)
      : notifications;

  const menuContent = (
    <div className={styles.dropdownContainer} ref={dropdownRef}>
      <div className={styles.header}>
        <Space size={8}>
          <Radio.Group
            size="small"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            optionType="button"
            buttonStyle="solid"
          >
            <Radio.Button value="all">Tất cả</Radio.Button>
            <Radio.Button value="unread">Chưa đọc</Radio.Button>
          </Radio.Group>
        </Space>
        {unreadCount > 0 && (
          <Button
            type="link"
            size="small"
            icon={<CheckOutlined />}
            onClick={markAllAsRead}
          >
            Đánh dấu tất cả
          </Button>
        )}
      </div>

      <List
        className={styles.list}
        dataSource={filteredNotifications}
        renderItem={(item) => (
          <NotificationItem item={item} onClick={markAsRead} />
        )}
      />
      {loading && <Spin style={{ display: "block", margin: "8px auto" }} />}
      {hasMore && !loading && (
        <Button type="link" block onClick={() => fetchNotifications(page + 1)}>
          Xem thêm
        </Button>
      )}
      {!hasMore && <div className={styles.footer}>Hết thông báo</div>}
    </div>
  );

  return (
    <Dropdown
      overlay={menuContent}
      trigger={["click"]}
      open={visible}
      onOpenChange={(open) => setVisible(open)}
      placement="bottomRight"
      arrow
    >
      <Badge count={unreadCount} overflowCount={99}>
        <BellOutlined className={styles.bellIcon} />
      </Badge>
    </Dropdown>
  );
};

export default NotificationBell;
