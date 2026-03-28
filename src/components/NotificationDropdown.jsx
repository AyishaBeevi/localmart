import { useEffect, useState } from "react";
import API from "../utils/api";
import { Link } from "react-router-dom";
import { MessageCircle, Heart, Bell } from "lucide-react";
import socket from "../socket";

function NotificationDropdown({ refreshUnread }) {

  const [notifications, setNotifications] = useState([]);

  /* -------- FETCH INITIAL -------- */

  const fetchNotifications = async () => {
    try {
      const res = await API.get("/notifications");
      setNotifications(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  /* -------- SOCKET REALTIME -------- */

  useEffect(() => {

    const handleNewNotification = (notification) => {

      setNotifications(prev => {

        const exists = prev.find(n => n._id === notification._id);
        if (exists) return prev;

        return [notification, ...prev].slice(0, 20);

      });

      if (refreshUnread) refreshUnread();

    };

    socket.on("newNotification", handleNewNotification);

    return () => {
      socket.off("newNotification", handleNewNotification);
    };

  }, []);

  /* -------- MARK READ -------- */

  const markRead = async (id) => {

    try {

      await API.put(`/notifications/${id}/read`);

      setNotifications(prev =>
        prev.map(n =>
          n._id === id ? { ...n, read: true } : n
        )
      );

      if (refreshUnread) refreshUnread();

    } catch (err) {
      console.log(err);
    }

  };

  /* -------- ICON -------- */

  const getIcon = (type) => {

    switch (type) {

      case "message":
        return <MessageCircle size={16} />;

      case "like":
        return <Heart size={16} />;

      default:
        return <Bell size={16} />;

    }

  };

  /* -------- TIME AGO -------- */

  const timeAgo = (date) => {

    const seconds = Math.floor(
      (new Date() - new Date(date)) / 1000
    );

    const intervals = {
      year: 31536000,
      month: 2592000,
      day: 86400,
      hour: 3600,
      minute: 60
    };

    for (let key in intervals) {

      const interval = Math.floor(seconds / intervals[key]);

      if (interval >= 1) {
        return `${interval} ${key}${interval > 1 ? "s" : ""} ago`;
      }

    }

    return "Just now";

  };

  return (

    <div className="absolute right-0 mt-3 w-80 bg-white border rounded-lg shadow-lg overflow-hidden">

      <div className="px-4 py-3 border-b font-semibold">
        Notifications
      </div>

      <div className="max-h-80 overflow-y-auto">

        {notifications.length === 0 && (
          <p className="p-4 text-textMuted text-sm">
            No notifications
          </p>
        )}

        {notifications.map(n => (

          <Link
            key={n._id}
            to={n.link}
            onClick={() => markRead(n._id)}
            className={`flex gap-3 px-4 py-3 border-b hover:bg-gray-50 ${
              !n.read ? "bg-gray-100" : ""
            }`}
          >

            <div className="text-gray-600 mt-1">
              {getIcon(n.type)}
            </div>

            <div className="flex-1">

              <p className="text-sm">
                {n.text}
              </p>

              <span className="text-xs text-gray-400">
                {timeAgo(n.createdAt)}
              </span>

            </div>

          </Link>

        ))}

      </div>

      {notifications.length > 0 && (
        <Link
          to="/notifications"
          className="block text-center py-2 text-sm hover:bg-gray-50"
        >
          View all notifications
        </Link>
      )}

    </div>

  );

}

export default NotificationDropdown;