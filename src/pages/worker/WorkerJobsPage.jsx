import { useState, useEffect } from "react";
import bookingService from "../../services/bookingService";
import { useToast } from "../../context/ToastContext";
import StatusBadge from "../../components/common/StatusBadge";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import EmptyState from "../../components/common/EmptyState";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import {
  Briefcase,
  Calendar,
  Clock,
  MapPin,
  User,
  Phone,
  CheckCircle2,
  XCircle,
  Play,
  CheckCheck,
  AlertTriangle,
  Loader2,
} from "lucide-react";

export const WorkerJobsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Reject confirmation modal
  const [rejectTargetId, setRejectTargetId] = useState(null);

  const { showSuccess, showError } = useToast();

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await bookingService.getWorkerBookings();
      if (res && res.bookings) {
        setBookings(res.bookings);
      }
    } catch (err) {
      showError(err.message || "Failed to load assigned jobs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  // Worker Accepts Incoming Booking
  const handleAcceptJob = async (bookingId) => {
    setActionLoadingId(bookingId);
    try {
      const res = await bookingService.acceptBooking(bookingId);
      showSuccess("Job accepted! The customer has been notified.");
      setBookings((prev) =>
        prev.map((b) => (b._id === bookingId ? { ...b, status: "accepted" } : b))
      );
    } catch (err) {
      showError(err.message || "Failed to accept booking.");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Worker Rejects Incoming Booking
  const handleRejectJob = async () => {
    if (!rejectTargetId) return;
    setActionLoadingId(rejectTargetId);
    try {
      await bookingService.rejectBooking(rejectTargetId);
      showSuccess("Booking declined and returned to cooperative matching pool.");
      setBookings((prev) =>
        prev.map((b) => (b._id === rejectTargetId ? { ...b, status: "rejected" } : b))
      );
      setRejectTargetId(null);
    } catch (err) {
      showError(err.message || "Failed to decline booking.");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Worker Updates Status: 'in-progress' or 'completed'
  const handleUpdateStatus = async (bookingId, newStatus) => {
    setActionLoadingId(bookingId);
    try {
      const res = await bookingService.updateBookingStatus(bookingId, newStatus);
      if (newStatus === "completed") {
        showSuccess(
          "Service completed! Monthly job count updated & cooperative earnings credited."
        );
      } else {
        showSuccess("Service marked as In Progress. Customer notified.");
      }
      setBookings((prev) =>
        prev.map((b) => (b._id === bookingId ? { ...b, status: newStatus } : b))
      );
    } catch (err) {
      showError(err.message || "Failed to update job status.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const filterTabs = [
    { key: "all", label: "All Dispatches", count: bookings.length },
    {
      key: "pending",
      label: "Incoming Requests",
      count: bookings.filter((b) => b.status === "pending").length,
    },
    {
      key: "active",
      label: "Accepted & In Progress",
      count: bookings.filter((b) => ["accepted", "in-progress"].includes(b.status)).length,
    },
    {
      key: "completed",
      label: "Completed Jobs",
      count: bookings.filter((b) => b.status === "completed").length,
    },
    {
      key: "cancelled",
      label: "Declined / Cancelled",
      count: bookings.filter((b) => ["rejected", "cancelled"].includes(b.status)).length,
    },
  ];

  const filteredJobs = bookings.filter((b) => {
    if (activeTab === "pending") return b.status === "pending";
    if (activeTab === "active") return ["accepted", "in-progress"].includes(b.status);
    if (activeTab === "completed") return b.status === "completed";
    if (activeTab === "cancelled") return ["rejected", "cancelled"].includes(b.status);
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">
          Assigned Jobs & Work Dispatches
        </h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Accept new dispatches, update service progress, and log completed jobs for salary increments
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 bg-white p-1.5 rounded-2xl border border-gray-100 shadow-2xs scrollbar-none">
        {filterTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === tab.key
                ? "bg-emerald-700 text-white shadow-xs"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                activeTab === tab.key ? "bg-emerald-800 text-white" : "bg-gray-200 text-gray-700"
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Jobs List */}
      {loading ? (
        <div className="py-20">
          <LoadingSpinner text="Fetching your dispatches..." />
        </div>
      ) : filteredJobs.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No jobs found"
          description="There are currently no bookings in this view."
        />
      ) : (
        <div className="space-y-4">
          {filteredJobs.map((b) => {
            const isLoadingThis = actionLoadingId === b._id;

            return (
              <div
                key={b._id}
                className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs hover:shadow-sm transition space-y-4"
              >
                {/* Top header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-800">
                      {b.service?.category}
                    </span>
                    <h3 className="text-base font-bold text-gray-900">{b.service?.name}</h3>
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
                      <span className="text-gray-400 block text-[10px] uppercase font-bold">
                        Scheduled Slot
                      </span>
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
                    <User className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-gray-400 block text-[10px] uppercase font-bold">
                        Household Customer
                      </span>
                      <span className="font-bold text-gray-900">
                        {b.customer?.name} ({b.customer?.phone})
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-gray-400 block text-[10px] uppercase font-bold">
                        Address Location
                      </span>
                      <span className="line-clamp-1">{b.address}</span>
                    </div>
                  </div>
                </div>

                {b.description && (
                  <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <span className="font-bold text-gray-800">Customer Note: </span>
                    {b.description}
                  </div>
                )}

                {/* Worker Action Buttons Bar */}
                <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-[11px] text-gray-400 font-mono">
                    ID: {b._id.slice(-8).toUpperCase()}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* State 1: Pending Acceptance */}
                    {b.status === "pending" && (
                      <>
                        <button
                          type="button"
                          disabled={isLoadingThis}
                          onClick={() => setRejectTargetId(b._id)}
                          className="px-3.5 py-1.5 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-bold transition cursor-pointer"
                        >
                          Decline
                        </button>
                        <button
                          type="button"
                          disabled={isLoadingThis}
                          onClick={() => handleAcceptJob(b._id)}
                          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:bg-emerald-400 text-white text-xs font-bold shadow-xs transition cursor-pointer"
                        >
                          {isLoadingThis && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Accept Dispatch</span>
                        </button>
                      </>
                    )}

                    {/* State 2: Accepted -> Ready to start */}
                    {b.status === "accepted" && (
                      <button
                        type="button"
                        disabled={isLoadingThis}
                        onClick={() => handleUpdateStatus(b._id, "in-progress")}
                        className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-xs font-bold shadow-xs transition cursor-pointer"
                      >
                        {isLoadingThis && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Start Service</span>
                      </button>
                    )}

                    {/* State 3: In Progress -> Ready to complete */}
                    {b.status === "in-progress" && (
                      <button
                        type="button"
                        disabled={isLoadingThis}
                        onClick={() => handleUpdateStatus(b._id, "completed")}
                        className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:bg-emerald-400 text-white text-xs font-bold shadow-xs transition cursor-pointer"
                      >
                        {isLoadingThis && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                        <CheckCheck className="w-4 h-4" />
                        <span>Mark Completed (Logs Salary)</span>
                      </button>
                    )}

                    {/* State 4: Completed */}
                    {b.status === "completed" && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Job Completed & Salary Recorded</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Decline Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!rejectTargetId}
        onClose={() => setRejectTargetId(null)}
        onConfirm={handleRejectJob}
        title="Decline Dispatch?"
        message="Are you sure you want to decline this job? It will be re-routed immediately to another cooperative member in your cluster."
        confirmText="Yes, Decline Dispatch"
        confirmColor="rose"
      />
    </div>
  );
};

export default WorkerJobsPage;
