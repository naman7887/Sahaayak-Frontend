import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import bookingService from "../../services/bookingService";
import { useToast } from "../../context/ToastContext";
import StatusBadge from "../../components/common/StatusBadge";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import EmptyState from "../../components/common/EmptyState";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import ReviewModal from "../../components/customer/ReviewModal";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Phone,
  CalendarCheck,
  AlertCircle,
  CreditCard,
  Star,
  XCircle,
  PlusCircle,
} from "lucide-react";

export const CustomerBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [cancelTargetId, setCancelTargetId] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [reviewBooking, setReviewBooking] = useState(null);

  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await bookingService.getMyBookings();
      if (res && res.bookings) {
        setBookings(res.bookings);
      }
    } catch (err) {
      showError(err.message || "Failed to load bookings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancelBooking = async () => {
    if (!cancelTargetId) return;
    setCancelling(true);
    try {
      const res = await bookingService.cancelBooking(cancelTargetId);
      showSuccess(res.message || "Booking cancelled successfully.");
      setBookings((prev) =>
        prev.map((b) => (b._id === cancelTargetId ? { ...b, status: "cancelled" } : b))
      );
      setCancelTargetId(null);
    } catch (err) {
      showError(err.message || "Failed to cancel booking.");
    } finally {
      setCancelling(false);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (statusFilter === "all") return true;
    return b.status === statusFilter;
  });

  const filterTabs = [
    { key: "all", label: "All Bookings", count: bookings.length },
    { key: "pending", label: "Pending Match", count: bookings.filter((b) => b.status === "pending").length },
    { key: "accepted", label: "Assigned", count: bookings.filter((b) => b.status === "accepted").length },
    { key: "in-progress", label: "In Progress", count: bookings.filter((b) => b.status === "in-progress").length },
    { key: "completed", label: "Completed", count: bookings.filter((b) => b.status === "completed").length },
    { key: "cancelled", label: "Cancelled", count: bookings.filter((b) => b.status === "cancelled").length },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">My Service Bookings</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Track real-time artisan dispatches, service status, and receipts
          </p>
        </div>
        <Link
          to="/customer/book"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-sm transition"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Book New Service</span>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 bg-white p-1.5 rounded-2xl border border-gray-100 shadow-2xs scrollbar-none">
        {filterTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
              statusFilter === tab.key
                ? "bg-emerald-700 text-white shadow-xs"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                statusFilter === tab.key ? "bg-emerald-800 text-white" : "bg-gray-200 text-gray-700"
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="py-20">
          <LoadingSpinner text="Loading your bookings..." />
        </div>
      ) : filteredBookings.length === 0 ? (
        <EmptyState
          icon={CalendarCheck}
          title="No bookings in this tab"
          description="You don't have any bookings matching this status filter."
          actionText="Book a Service"
          onAction={() => navigate("/customer/book")}
        />
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((b) => (
            <div
              key={b._id}
              className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs hover:shadow-sm transition space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-800">
                    {b.service?.category || "Service"}
                  </span>
                  <h3 className="text-base font-bold text-gray-900">
                    {b.service?.name || "Household Service"}
                  </h3>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-black text-gray-900">₹{b.price}</span>
                  <StatusBadge status={b.status} />
                </div>
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-gray-600">
                <div className="flex items-start gap-2">
                  <Calendar className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-bold">Scheduled Time</span>
                    <span className="font-semibold text-gray-800">
                      {new Date(b.scheduledDate).toLocaleString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-bold">Delivery Address</span>
                    <span className="line-clamp-1">{b.address}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <User className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-bold">Assigned Artisan</span>
                    {b.worker ? (
                      <span className="font-bold text-gray-900 flex items-center gap-1">
                        {b.worker.name} ({b.worker.phone || "Verified"})
                      </span>
                    ) : (
                      <span className="text-amber-700 italic">Matching nearby artisan...</span>
                    )}
                  </div>
                </div>
              </div>

              {b.description && (
                <div className="text-xs text-gray-500 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                  <span className="font-semibold text-gray-700">Notes: </span>
                  {b.description}
                </div>
              )}

              {/* Actions Footer */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                <div className="text-[11px] text-gray-400 font-mono">
                  ID: {b._id.slice(-8).toUpperCase()}
                </div>

                <div className="flex items-center gap-2">
                  {/* Cancel action (only pending or accepted) */}
                  {["pending", "accepted"].includes(b.status) && (
                    <button
                      onClick={() => setCancelTargetId(b._id)}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-700 hover:bg-rose-50 border border-rose-200 transition cursor-pointer"
                    >
                      Cancel Booking
                    </button>
                  )}

                  {/* Completed actions: Pay & Review */}
                  {b.status === "completed" && (
                    <>
                      <button
                        onClick={() => navigate(`/customer/payments?booking=${b._id}`)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-700 hover:bg-emerald-50 border border-emerald-300 transition"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Pay Digital Bill</span>
                      </button>

                      <button
                        onClick={() => setReviewBooking(b)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-amber-700 hover:bg-amber-50 border border-amber-300 transition"
                      >
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        <span>Rate Artisan</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirmation Dialog for Cancellation */}
      <ConfirmDialog
        isOpen={!!cancelTargetId}
        onClose={() => setCancelTargetId(null)}
        onConfirm={handleCancelBooking}
        loading={cancelling}
        title="Cancel Booking?"
        message="Are you sure you want to cancel this booking? If a worker was already assigned, they will be notified immediately."
        confirmText="Yes, Cancel Booking"
        confirmColor="rose"
      />

      {/* Review Modal */}
      <ReviewModal
        isOpen={!!reviewBooking}
        onClose={() => setReviewBooking(null)}
        booking={reviewBooking}
        onReviewSubmitted={() => fetchBookings()}
      />
    </div>
  );
};

export default CustomerBookingsPage;
