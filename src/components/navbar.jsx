import { useEffect, useState } from "react";

function Navbar() {
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationLoading, setNotificationLoading] = useState(false);

  const token = localStorage.getItem("token");

  const fetchUser = async () => {
    if (!token) {
      setUser(null);
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/me",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
      } else {
        localStorage.removeItem("token");
        setUser(null);
      }
    } catch (error) {
      console.error("Navbar user error:", error);
    }
  };

  const fetchNotifications = async () => {
    if (!token) return;

    try {
      setNotificationLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/notifications",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setNotifications(data.notifications || []);
      }
    } catch (error) {
      console.error("Notification error:", error);
    } finally {
      setNotificationLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
    fetchNotifications();

    if (!token) return;

    const interval = setInterval(() => {
      fetchNotifications();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter(
    (notification) => !notification.isRead
  ).length;

  const markNotificationRead = async (notificationId) => {
    try {
      await fetch(
        `http://localhost:5000/api/notifications/${notificationId}/read`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setNotifications((previous) =>
        previous.map((notification) =>
          notification._id === notificationId
            ? {
                ...notification,
                isRead: true,
              }
            : notification
        )
      );
    } catch (error) {
      console.error(
        "Mark notification error:",
        error
      );
    }
  };

  const markAllRead = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/notifications/read-all",
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        setNotifications((previous) =>
          previous.map((notification) => ({
            ...notification,
            isRead: true,
          }))
        );
      }
    } catch (error) {
      console.error(
        "Mark all notifications error:",
        error
      );
    }
  };

  const handleNotificationClick = async (
    notification
  ) => {
    if (!notification.isRead) {
      await markNotificationRead(notification._id);
    }

    if (notification.booking) {
      setShowNotifications(false);

      if (user?.role === "worker") {
        window.location.href = "/worker-dashboard";
      } else {
        window.location.href = "/dashboard";
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("pendingWorkerProfile");

    setUser(null);
    setNotifications([]);

    window.location.href = "/";
  };

  const formatNotificationTime = (value) => {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    const now = new Date();
    const diff =
      Math.floor((now - date) / 1000);

    if (diff < 60) {
      return "Just now";
    }

    if (diff < 3600) {
      return `${Math.floor(diff / 60)}m ago`;
    }

    if (diff < 86400) {
      return `${Math.floor(diff / 3600)}h ago`;
    }

    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    });
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "booking":
        return "📋";

      case "payment":
        return "💳";

      case "verification":
        return "✓";

      case "system":
        return "🔔";

      default:
        return "🔔";
    }
  };

  return (
    <nav className="navbar">

      <div
        className="logo"
        onClick={() => {
          window.location.href = "/";
        }}
        style={{ cursor: "pointer" }}
      >
        Sahaayak
      </div>

      <div className="nav-links">
        <a href="/">Home</a>
        <a href="/find-services">Find Services</a>
        <a href="/register">Become a Provider</a>
        <a href="/">About</a>
      </div>

      <div className="nav-buttons">

        {user ? (
          <>

            {/* NOTIFICATION BELL */}

            <div className="notification-wrapper">

              <button
                className="notification-bell"
                onClick={() => {
                  setShowNotifications(
                    !showNotifications
                  );

                  if (!showNotifications) {
                    fetchNotifications();
                  }
                }}
              >
                🔔

                {unreadCount > 0 && (
                  <span className="notification-badge">
                    {unreadCount > 9
                      ? "9+"
                      : unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="notification-dropdown">

                  <div className="notification-header">

                    <div>
                      <strong>
                        Notifications
                      </strong>

                      {unreadCount > 0 && (
                        <span>
                          {unreadCount} unread
                        </span>
                      )}
                    </div>

                    {unreadCount > 0 && (
                      <button
                        onClick={markAllRead}
                        className="mark-all-btn"
                      >
                        Mark all read
                      </button>
                    )}

                  </div>

                  <div className="notification-list">

                    {notificationLoading ? (
                      <div className="notification-empty">
                        Loading...
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="notification-empty">
                        <div>🔔</div>

                        <strong>
                          No notifications
                        </strong>

                        <p>
                          You're all caught up.
                        </p>
                      </div>
                    ) : (
                      notifications
                        .slice(0, 10)
                        .map((notification) => (
                          <button
                            key={notification._id}
                            className={`notification-item ${
                              notification.isRead
                                ? ""
                                : "notification-unread"
                            }`}
                            onClick={() =>
                              handleNotificationClick(
                                notification
                              )
                            }
                          >

                            <div className="notification-icon">
                              {getNotificationIcon(
                                notification.type
                              )}
                            </div>

                            <div className="notification-content">

                              <strong>
                                {notification.title}
                              </strong>

                              <p>
                                {notification.message}
                              </p>

                              <small>
                                {formatNotificationTime(
                                  notification.createdAt
                                )}
                              </small>

                            </div>

                            {!notification.isRead && (
                              <span className="unread-dot" />
                            )}

                          </button>
                        ))
                    )}

                  </div>

                </div>
              )}

            </div>

            <a
              href={
                user.role === "worker"
                  ? "/worker-dashboard"
                  : user.role === "admin"
                  ? "/admin-dashboard"
                  : "/dashboard"
              }
              className="user-name"
            >
              👤 {user.name}
            </a>

            <button
              className="logout-nav-btn"
              onClick={handleLogout}
            >
              Logout
            </button>

          </>
        ) : (
          <>
            <a
              href="/login"
              className="login-btn"
            >
              Login
            </a>

            <a
              href="/register"
              className="signup-btn"
            >
              Sign Up
            </a>
          </>
        )}

      </div>

    </nav>
  );
}

export default Navbar;