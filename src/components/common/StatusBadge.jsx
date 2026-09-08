export const StatusBadge = ({ status = "", type = "booking" }) => {
  const normalized = String(status).toLowerCase();

  const configMap = {
    // Booking
    pending: { label: "Pending", bg: "bg-amber-100 text-amber-800 border-amber-300" },
    accepted: { label: "Accepted", bg: "bg-blue-100 text-blue-800 border-blue-300" },
    "in-progress": { label: "In Progress", bg: "bg-indigo-100 text-indigo-800 border-indigo-300" },
    completed: { label: "Completed", bg: "bg-emerald-100 text-emerald-800 border-emerald-300" },
    cancelled: { label: "Cancelled", bg: "bg-rose-100 text-rose-800 border-rose-300" },
    rejected: { label: "Declined", bg: "bg-gray-100 text-gray-700 border-gray-300" },

    // Verification
    verified: { label: "Verified Member", bg: "bg-emerald-100 text-emerald-800 border-emerald-300" },
    unverified: { label: "Unverified", bg: "bg-amber-100 text-amber-800 border-amber-300" },

    // Payment
    paid: { label: "Paid", bg: "bg-emerald-100 text-emerald-800 border-emerald-300" },
    failed: { label: "Failed", bg: "bg-rose-100 text-rose-800 border-rose-300" },
    refunded: { label: "Refunded", bg: "bg-purple-100 text-purple-800 border-purple-300" },

    // Availability
    online: { label: "Available", bg: "bg-emerald-100 text-emerald-800 border-emerald-300" },
    offline: { label: "Offline", bg: "bg-gray-100 text-gray-700 border-gray-300" },
  };

  const current = configMap[normalized] || {
    label: status || "Unknown",
    bg: "bg-gray-100 text-gray-800 border-gray-200",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${current.bg}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-75" />
      {current.label}
    </span>
  );
};

export default StatusBadge;
