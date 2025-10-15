import React, { useState, useEffect, useRef } from "react";
import { Badge, Dropdown, List, Spin, Button, Tag, Avatar } from "antd";
import { BellOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
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

  const dropdownRef = useRef(null);
  const { user, notifications, setNotifications, unreadCount, setUnreadCount } =
    useGlobalAuth();

  // Fetch notification list
  const fetchNotifications = async (pageNum = 1) => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await API_CALL.get(
        `/notification?page=${pageNum}&limit=20&user_id=${user?.id}`
      );
      const data = res.data.data.data || [];
      console.log("data", data);
      setNotifications((prev) => (pageNum === 1 ? data : [...prev, ...data]));
      setHasMore(data.length === 20);
      setUnreadCount(data.filter((n) => !n.is_read).length);
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

  // Đánh dấu đã đọc
  const markAsRead = async (id, actionUrl) => {
    try {
      await API_CALL.patch(`/notification/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(prev - 1, 0));
      if (actionUrl) window.open(actionUrl, "_blank");
    } catch (err) {
      console.error("Mark read failed:", err);
    }
  };

  const menuContent = (
    <div className={styles.dropdownContainer} ref={dropdownRef}>
      <div className={styles.header}>
        <span>Thông báo</span>
        {unreadCount > 0 && <Tag color="blue">{unreadCount} chưa đọc</Tag>}
      </div>

      <List
        className={styles.list}
        dataSource={notifications}
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
