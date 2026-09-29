// src/pages/Notifications.jsx
import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./Notifications.css";

const Notifications = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = sessionStorage.getItem("token");

      if (!token) {
        setError("Please login to view notifications");
        setLoading(false);
        return;
      }

      console.log("Fetching notifications...");

      const response = await fetch("https://project-management-backend-alpha.vercel.app/api/notifications", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Response status:", response.status);

      if (response.status === 401) {
        setError("Session expired. Please login again.");
        sessionStorage.removeItem("token");
        navigate("/login");
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Notifications fetched:", data);
      setNotifications(data);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      // Set empty array instead of showing error
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const token = sessionStorage.getItem("token");

      await fetch(`https://project-management-backend-alpha.vercel.app/api/notifications/${notificationId}/read`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Update local state
      setNotifications(notifications.map(n =>
        n._id === notificationId ? { ...n, isRead: true } : n
      ));
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = sessionStorage.getItem("token");

      await fetch("https://project-management-backend-alpha.vercel.app/api/notifications/mark-all-read", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Update all to read
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error("Error marking all as read:", err);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      const token = sessionStorage.getItem("token");

      await fetch(`https://project-management-backend-alpha.vercel.app/api/notifications/${notificationId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Remove from local state
      setNotifications(notifications.filter(n => n._id !== notificationId));
    } catch (err) {
      console.error("Error deleting notification:", err);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "project_assigned": return "📁";
      case "task_assigned": return "✅";
      case "task_completed": return "🎉";
      case "message": return "💬";
      case "deadline": return "⏰";
      default: return "🔔";
    }
  };

  const getTimeAgo = (dateString) => {
    if (!dateString) return "";

    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  // Calculate unread count
  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (loading) {
    return (
      <div className="notifications-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="notifications-container">
      {/* Header */}
      <div className="notifications-header">
        <div className="header-left">
          <h2>🔔 Notifications</h2>
          {unreadCount > 0 && (
            <span className="unread-badge">{unreadCount} new</span>
          )}
        </div>
        <div className="header-actions">
          <button className="refresh-btn" onClick={fetchNotifications}>
            🔄 Refresh
          </button>
          {unreadCount > 0 && (
            <button className="mark-all-btn" onClick={markAllAsRead}>
              ✓ Mark all read
            </button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔕</div>
          <h3>No Notifications</h3>
          <p>You're all caught up! Check back later for updates.</p>
        </div>
      ) : (
        <div className="notifications-list">
          {notifications.map((notification) => (
            <div
              key={notification._id}
              className={`notification-item ${!notification.isRead ? "unread" : ""}`}
            >
              {/* Icon */}
              <div className="notification-icon">
                {getNotificationIcon(notification.type)}
              </div>

              {/* Content */}
              <div className="notification-content">
                <div className="notification-header">
                  <h4>{notification.title || "Notification"}</h4>
                  <span className="notification-time">
                    {getTimeAgo(notification.createdAt)}
                  </span>
                </div>
                <p className="notification-message">
                  {notification.message || notification.text || "No message"}
                </p>

                {/* Action Button if available */}
                {notification.actionUrl && (
                  <button
                    className="notification-action"
                    onClick={() => navigate(notification.actionUrl)}
                  >
                    View Details →
                  </button>
                )}
              </div>

              {/* Actions */}
              <div className="notification-actions">
                {!notification.isRead && (
                  <button
                    className="action-btn mark-read"
                    onClick={() => markAsRead(notification._id)}
                    title="Mark as read"
                  >
                    ✓
                  </button>
                )}
                <button
                  className="action-btn delete"
                  onClick={() => deleteNotification(notification._id)}
                  title="Delete"
                >
                  🗑️
                </button>
              </div>

              {/* Unread Indicator */}
              {!notification.isRead && <div className="unread-dot"></div>}
            </div>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      {notifications.length > 0 && (
        <div className="notifications-footer">
          <button
            className="clear-all"
            onClick={() => setNotifications([])}
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
};

export default Notifications;