import { useState, useEffect } from "react";
import workerService from "../../services/workerService";
import { useToast } from "../../context/ToastContext";
import { Power, CheckCircle2 } from "lucide-react";

export const AvailabilityToggle = ({ initialStatus, onToggle }) => {
  const [available, setAvailable] = useState(false);
  const [loading, setLoading] = useState(false);
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    if (typeof initialStatus === "boolean") {
      setAvailable(initialStatus);
    } else {
      // Fetch current worker profile
      const fetchStatus = async () => {
        try {
          const res = await workerService.getMyProfile();
          if (res && res.worker) {
            setAvailable(!!res.worker.availability);
          }
        } catch {
          // not set yet
        }
      };
      fetchStatus();
    }
  }, [initialStatus]);

  const handleToggle = async () => {
    setLoading(true);
    const nextState = !available;
    try {
      const res = await workerService.updateAvailability(nextState);
      if (res && res.success) {
        setAvailable(res.availability);
        showSuccess(
          res.availability
            ? "You are now ONLINE. You can receive incoming service dispatches!"
            : "You are now OFFLINE. Dispatches paused."
        );
        if (onToggle) onToggle(res.availability);
      }
    } catch (err) {
      showError(err.message || "Failed to update availability status.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-3 bg-white px-3.5 py-2 rounded-xl border border-gray-200 shadow-2xs">
      <div className="flex items-center gap-2">
        <span
          className={`w-2.5 h-2.5 rounded-full ${
            available ? "bg-emerald-500 animate-ping" : "bg-gray-400"
          }`}
        />
        <span className="text-xs font-bold text-gray-700">
          {available ? "Online for Jobs" : "Offline"}
        </span>
      </div>
      <button
        type="button"
        disabled={loading}
        onClick={handleToggle}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
          available ? "bg-emerald-600" : "bg-gray-300"
        } ${loading ? "opacity-50 cursor-wait" : ""}`}
        title="Toggle Job Availability"
      >
        <span
          aria-hidden="true"
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
            available ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
};

export default AvailabilityToggle;
