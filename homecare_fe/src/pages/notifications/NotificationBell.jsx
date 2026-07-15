import React, { useState, useEffect, useRef } from "react";
import { Badge, Dropdown, Spin, Button, Tooltip } from "antd";
import {
  BellOutlined,
  CheckOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import API_CALL from "../../services/axiosClient";
import styles from "./NotificationBell.module.scss";
import NotificationItem from "./NotificationItem";
import { useGlobalAuth } from "../../contexts/AuthContext";

const TABS = [
  { key: "all", label: "Tất cả" },
  { key: "unread", label: "Chưa đọc" },
  { key: "diagnosis", label: "Ca bệnh" },
  { key: "package", label: "Gói dịch vụ" },
];

const NotificationBell = () => {
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  const dropdownRef = useRef(null);
  const { user, notifications, setNotifications, unreadCount, setUnreadCount } =
    useGlobalAuth();

  const fetchNotifications = async (pageNum = 1, tab = activeTab) => {
    if (loading) return;
    setLoading(true);
    const limit = 15;
    const offset = (pageNum - 1) * limit;

    try {
      let url = `/notification?limit=${limit}&offset=${offset}&user_id=${user?.id}`;
      if (tab === "unread") url += "&is_read=false";
      else if (tab !== "all") url += `&type=${tab}`;

      const res = await API_CALL.get(url);
      const records = res.data.data?.data || res.data.data || [];
      const total = res.data.data?.total || res.data.total || 0;

      setNotifications((prev) => {
        const merged = pageNum === 1 ? records : [...prev, ...records];
        const unique = Array.from(
          new Map(merged.map((item) => [item.id, item])).values()
        );
        setHasMore(offset + records.length < total);
        setUnreadCount(unique.filter((n) => !n.is_read).length);
        return unique;
      });
      setPage(pageNum);
    } catch (err) {
      console.error("Fetch notifications error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) fetchNotifications(1, activeTab);
  }, [user?.id]);

  // Refetch khi đổi tab
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setPage(1);
    fetchNotifications(1, tab);
  };

  // Click outside close
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

  const markAsRead = async (id, actionUrl) => {
    try {
      await API_CALL.patch(`/notification/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(prev - 1, 0));
    } catch (err) {
      console.error("Mark read failed:", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await API_CALL.patch("/notification/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Mark all as read failed:", err);
    }
  };

  // Filter for display
  const displayList =
    activeTab === "unread"
      ? notifications.filter((n) => !n.is_read)
      : activeTab === "all"
      ? notifications
      : notifications.filter((n) => n.type === activeTab);

  const menuContent = (
    <div className={styles.panel} ref={dropdownRef}>
      {/* Header */}
      <div className={styles.panelHeader}>
        <div className={styles.panelHeaderLeft}>
          <span className={styles.panelTitle}>Thông báo</span>
          <span className={styles.panelSubtitle}>
            {unreadCount > 0 ? `${unreadCount} chưa đọc` : "Tất cả đã đọc"}
          </span>
        </div>
        <div className={styles.panelHeaderRight}>
          <Tooltip title="Làm mới">
            <Button
              type="text"
              size="small"
              icon={<ReloadOutlined spin={loading} />}
              onClick={() => fetchNotifications(1, activeTab)}
              style={{ color: "#94a3b8", width: 28, height: 28, padding: 0 }}
            />
          </Tooltip>
          {unreadCount > 0 && (
            <Tooltip title="Đánh dấu tất cả đã đọc">
              <Button
                type="text"
                size="small"
                icon={<CheckOutlined />}
                onClick={markAllAsRead}
                style={{ color: "#3b82f6", width: 28, height: 28, padding: 0 }}
              />
            </Tooltip>
          )}
        </div>
      </div>

      {/* Filter tabs */}
      <div className={styles.filterTabs}>
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`${styles.filterTab} ${activeTab === tab.key ? styles.active : ""}`}
            onClick={() => handleTabChange(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className={styles.list}>
        {displayList.length === 0 && !loading ? (
          <div className={styles.empty}>
            <BellOutlined style={{ fontSize: 32, color: "#e2e8f0" }} />
            <span>Không có thông báo nào</span>
          </div>
        ) : (
          displayList.map((item) => (
            <NotificationItem key={item.id} item={item} onClick={markAsRead} />
          ))
        )}
        {loading && (
          <div style={{ display: "flex", justifyContent: "center", padding: 16 }}>
            <Spin size="small" />
          </div>
        )}
      </div>

      {/* Footer */}
      <div className={styles.panelFooter}>
        {hasMore && !loading && (
          <Button
            type="link"
            size="small"
            onClick={() => fetchNotifications(page + 1, activeTab)}
            style={{ fontSize: 12, color: "#3b82f6" }}
          >
            Xem thêm
          </Button>
        )}
        {!hasMore && displayList.length > 0 && (
          <span style={{ fontSize: 11, color: "#94a3b8" }}>
            Đã hiển thị tất cả
          </span>
        )}
      </div>
    </div>
  );

  return (
    <Dropdown
      overlay={menuContent}
      trigger={["click"]}
      open={visible}
      onOpenChange={(open) => setVisible(open)}
      placement="bottomRight"
      arrow={false}
    >
      <Tooltip title="Thông báo">
        <Badge count={unreadCount} overflowCount={99} size="small">
          <div className={styles.bellWrap}>
            <BellOutlined className={styles.bellIcon} />
          </div>
        </Badge>
      </Tooltip>
    </Dropdown>
  );
};

export default NotificationBell;
