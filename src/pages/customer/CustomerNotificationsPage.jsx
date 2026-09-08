import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useNotifications } from "../../context/NotificationContext";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import EmptyState from "../../components/common/EmptyState";
import {
  Bell,
  CheckCheck,
  CalendarCheck,
  CreditCard,
  GraduationCap,
  Info,
  Clock,
} from "lucide-react";

export const CustomerNotificationsPage = () => {
  const { notifications, loading, fetchNotifications, markAsRead, markAllAsRead } =
    useNotifications();

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const getTypeIcon = (type) => {
    switch (type) {
      case "booking":
        return <CalendarCheck className="w-5 h-5 text-emerald-600" />;
      case "payment":
        return <CreditCard className="w-5 h-5 text-blue-600" />;
      case "training":
        return <GraduationCap className="w-5 h-5 text-purple-600" />;
      default:
        return <Info className="w-5 h-5 text-amber-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Notification Center</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Real-time updates regarding your service bookings, worker dispatches, and payments
          </p>
        </div>

        {notifications.some((n) => !n.isRead) && (
          <button
            onClick={markAllAsRead}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200/80 text-xs font-bold text-gray-700 transition cursor-pointer"
          >
            <CheckCheck className="w-4 h-4 text-emerald-700" />
            <span>Mark All As Read</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="py-20">
          <LoadingSpinner text="Loading notifications..." />
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="All caught up!"
          description="You don't have any notifications right now."
        />
      ) : (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-xs divide-y divide-gray-100 overflow-hidden">
          {notifications.map((n) => (
            <div
              key={n._id}
              className={`p-5 flex items-start gap-4 transition ${
                !n.isRead ? "bg-emerald-50/40" : "hover:bg-gray-50/50"
              }`}
            >
              <div className="p-2.5 rounded-xl bg-gray-100 shrink-0">
                {getTypeIcon(n.type)}
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <span>{n.title}</span>
                    {!n.isRead && (
                      <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
                    )}
                  </h4>
                  <span className="text-[11px] text-gray-400 font-medium shrink-0">
                    {new Date(n.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                <p className="text-xs text-gray-600 leading-relaxed">{n.message}</p>

                <div className="pt-2 flex items-center gap-3">
                  {n.booking && (
                    <Link
                      to="/customer/bookings"
                      className="text-xs font-bold text-emerald-700 hover:text-emerald-800"
                    >
                      View Booking →
                    </Link>
                  )}
                  {!n.isRead && (
                    <button
                      onClick={() => markAsRead(n._id)}
                      className="text-[11px] font-semibold text-gray-500 hover:text-gray-800 cursor-pointer"
                    >
                      Mark as read
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomerNotificationsPage;
