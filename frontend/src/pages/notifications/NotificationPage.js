import React, { useEffect, useState, useContext, useCallback } from "react";
import {
  getNotifications,
  markNotificationRead,
  deleteNotification,
} from "../../api/api";
import { AuthContext } from "../../auth/AuthContext";
import { FaTrash } from "react-icons/fa";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const NotificationPage = () => {
  const { user, setUnreadCount } = useContext(AuthContext);
  const userId = user?.userId;
  const [notifications, setNotifications] = useState([]);

  // Fetch notifications (always fresh)
  const fetchNotifications = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await getNotifications(userId);
      const data = res.data || [];

      // Remove duplicates based on notificationId
      const uniqueData = Array.from(
        new Map(data.map((item) => [item.notificationId, item])).values()
      );
      setNotifications(uniqueData);

      // Update unread count globally
      const unread = uniqueData.filter((n) => !n.isRead).length;
      setUnreadCount(unread);
    } catch (err) {
      console.error("Fetch notifications failed:", err);
      toast.error("Failed to load notifications");
    }
  }, [userId, setUnreadCount]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkRead = async (id) => {
    try {
      await markNotificationRead(id);

      setNotifications((prev) =>
        prev.map((n) => (n.notificationId === id ? { ...n, isRead: true } : n))
      );

      // Update unread count globally
      setUnreadCount((prev) => (prev > 0 ? prev - 1 : 0));
      toast.success("Notification marked as read");
    } catch (err) {
      console.error("Mark as read failed:", err);
      toast.error("Failed to mark notification as read");
    }
  };

  const handleDelete = async (id) => {
    try {
      const deletedNotification = notifications.find(
        (n) => n.notificationId === id
      );

      await deleteNotification(id);

      setNotifications((prev) => prev.filter((n) => n.notificationId !== id));

      if (deletedNotification && !deletedNotification.isRead) {
        setUnreadCount((prev) => (prev > 0 ? prev - 1 : 0));
      }
      toast.success("Notification deleted successfully");
    } catch (err) {
      console.error("Delete notification failed:", err);
      toast.error("Failed to delete notification");
    }
  };

  return (
    <div className="container mt-5">
      <h3>Your Notifications</h3>
      {notifications.length === 0 ? (
        <p>No notifications available.</p>
      ) : (
        <ul className="list-group mt-3">
          {notifications.map((n) => (
            <li
              key={n.notificationId}
              className={`list-group-item d-flex justify-content-between align-items-center ${
                n.isRead ? "text-muted" : "fw-bold"
              }`}
            >
              <div>
                <h6>{n.title}</h6>
                <p className="mb-1">{n.message}</p>
                <small>{new Date(n.createdAt).toLocaleString()}</small>
              </div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                {!n.isRead && (
                  <button
                    className="btn btn-sm btn-success"
                    onClick={() => handleMarkRead(n.notificationId)}
                  >
                    Mark as Read
                  </button>
                )}
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDelete(n.notificationId)}
                  title="Delete Notification"
                >
                  <FaTrash />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default NotificationPage;
