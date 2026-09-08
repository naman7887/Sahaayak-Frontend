import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import serviceService from "../../services/serviceService";
import bookingService from "../../services/bookingService";
import { useToast } from "../../context/ToastContext";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import {
  Calendar,
  Clock,
  MapPin,
  Zap,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Navigation,
  Loader2,
  ArrowRight,
} from "lucide-react";

export const BookServicePage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showSuccess, showError, showInfo } = useToast();

  const preselectedServiceId = searchParams.get("service") || "";
  const isEmergencyParam = searchParams.get("emergency") === "true";

  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);

  const [selectedService, setSelectedService] = useState(preselectedServiceId);
  const [scheduledDate, setScheduledDate] = useState("");
  const [address, setAddress] = useState("");
  const [coordinates, setCoordinates] = useState([77.1025, 28.7041]); // Default [longitude, latitude] (Delhi NCR)
  const [isEmergency, setIsEmergency] = useState(isEmergencyParam);
  const [description, setDescription] = useState("");

  const [detectingLocation, setDetectingLocation] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [bookingSuccessData, setBookingSuccessData] = useState(null);

  // Set default schedule time: tomorrow at 10:00 AM or 20 mins from now if emergency
  useEffect(() => {
    const now = new Date();
    if (isEmergency) {
      const emergencyTime = new Date(now.getTime() + 20 * 60000);
      setScheduledDate(emergencyTime.toISOString().slice(0, 16));
    } else {
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60000);
      tomorrow.setHours(10, 0, 0, 0);
      setScheduledDate(tomorrow.toISOString().slice(0, 16));
    }
  }, [isEmergency]);

  // Fetch available services
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoadingServices(true);
        const res = await serviceService.getAllServices();
        if (res && res.services) {
          setServices(res.services);
          if (!selectedService && res.services.length > 0) {
            setSelectedService(res.services[0]._id);
          }
        }
      } catch (err) {
        showError("Failed to fetch services catalog.");
      } finally {
        setLoadingServices(false);
      }
    };
    fetchServices();
  }, []);

  // Update selection if query param changes
  useEffect(() => {
    if (preselectedServiceId) {
      setSelectedService(preselectedServiceId);
    }
  }, [preselectedServiceId]);

  // Geolocation auto-detect
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      showError("Geolocation is not supported by your browser.");
      return;
    }

    setDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lng = Math.round(pos.coords.longitude * 10000) / 10000;
        const lat = Math.round(pos.coords.latitude * 10000) / 10000;
        setCoordinates([lng, lat]);
        setDetectingLocation(false);
        showSuccess(`Location detected: [${lng}, ${lat}]`);
        if (!address) {
          setAddress("Current detected location coordinates");
        }
      },
      (err) => {
        setDetectingLocation(false);
        showInfo("Could not auto-detect location. Default coordinates applied.");
      },
      { timeout: 10000 }
    );
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();

    if (!selectedService) {
      showError("Please select a service.");
      return;
    }
    if (!scheduledDate) {
      showError("Please choose a scheduled date and time.");
      return;
    }
    if (!address) {
      showError("Please provide your service address.");
      return;
    }

    const bookingTime = new Date(scheduledDate);
    if (bookingTime <= new Date()) {
      showError("Scheduled date must be in the future.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        service: selectedService,
        scheduledDate: bookingTime.toISOString(),
        address,
        location: {
          type: "Point",
          coordinates: coordinates,
        },
        description: isEmergency
          ? `[EMERGENCY DISPATCH] ${description}`
          : description,
      };

      const response = await bookingService.createBooking(payload);
      if (response && response.success) {
        setBookingSuccessData(response);
        showSuccess(response.message || "Booking created successfully!");
      }
    } catch (err) {
      showError(err.message || "Failed to create booking.");
    } finally {
      setSubmitting(false);
    }
  };

  const activeServiceObj = services.find((s) => s._id === selectedService);

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
            Household Booking Desk
          </span>
          {isEmergency && (
            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-amber-400 text-gray-950 flex items-center gap-1">
              <Zap className="w-3 h-3 fill-current" />
              Emergency Mode
            </span>
          )}
        </div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">
          Schedule Cooperative Service
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Automated geospatial matching assigns the nearest certified cooperative artisan.
        </p>
      </div>

      {/* Confirmation Banner if Booking Just Created */}
      {bookingSuccessData && (
        <div className="p-6 rounded-3xl bg-emerald-50 border border-emerald-200 text-emerald-950 shadow-sm space-y-4">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-emerald-600 text-white shrink-0">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-emerald-950">
                {bookingSuccessData.matchingWorkerFound
                  ? "Cooperative Artisan Matched & Assigned!"
                  : "Booking Registered in Cooperative Queue"}
              </h3>
              <p className="text-sm text-emerald-800 leading-relaxed">
                {bookingSuccessData.message}
              </p>
              {bookingSuccessData.booking?.worker && (
                <div className="pt-2 text-xs font-semibold text-emerald-900">
                  Assigned Artisan: <strong>{bookingSuccessData.booking.worker.name}</strong> • Contact:{" "}
                  <strong>{bookingSuccessData.booking.worker.phone}</strong>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => navigate("/customer/bookings")}
              className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs transition"
            >
              Go to My Bookings
            </button>
            <button
              onClick={() => {
                setBookingSuccessData(null);
                setDescription("");
              }}
              className="px-4 py-2.5 rounded-xl bg-white border border-emerald-300 text-emerald-800 text-xs font-bold hover:bg-emerald-100/50 transition"
            >
              Book Another Service
            </button>
          </div>
        </div>
      )}

      {/* Booking Form Card */}
      <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-10 shadow-xs">
        <form onSubmit={handleBookingSubmit} className="space-y-6">
          {/* Emergency Toggle Card */}
          <div
            onClick={() => setIsEmergency(!isEmergency)}
            className={`p-4 rounded-2xl border transition cursor-pointer flex items-center justify-between gap-4 ${
              isEmergency
                ? "bg-amber-50/80 border-amber-300 text-amber-950 shadow-xs"
                : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100/80"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`p-2.5 rounded-xl ${
                  isEmergency ? "bg-amber-400 text-gray-950" : "bg-gray-200 text-gray-600"
                }`}
              >
                <Zap className="w-5 h-5 fill-current" />
              </div>
              <div>
                <div className="text-sm font-bold">Urgent / Emergency Dispatch</div>
                <div className="text-xs text-gray-500">
                  Dispatches nearest available on-duty artisan immediately (15–20 min SLA).
                </div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={isEmergency}
              onChange={() => {}}
              className="w-5 h-5 accent-amber-500 rounded cursor-pointer"
            />
          </div>

          {/* Service Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
              Select Trade / Service
            </label>
            {loadingServices ? (
              <div className="h-12 bg-gray-100 rounded-xl animate-pulse" />
            ) : (
              <select
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                className="w-full p-3.5 rounded-xl border border-gray-200 text-sm text-gray-900 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
              >
                {services.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name} ({s.category}) — ₹{s.basePrice} (approx. {s.estimatedDuration || 60}m)
                  </option>
                ))}
              </select>
            )}
            {activeServiceObj && (
              <div className="mt-2 flex items-center justify-between text-xs text-gray-500 bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100">
                <span>
                  Standard Cooperative Tariff: <strong>₹{activeServiceObj.basePrice}</strong>
                </span>
                <span>
                  Est. Duration: <strong>~{activeServiceObj.estimatedDuration || 60} mins</strong>
                </span>
              </div>
            )}
          </div>

          {/* Schedule Date & Time */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
              Service Appointment Date & Time
            </label>
            <div className="relative">
              <Calendar className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="datetime-local"
                required
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
              />
            </div>
          </div>

          {/* Address & GPS Coordinates */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                Service Delivery Address
              </label>
              <button
                type="button"
                onClick={handleDetectLocation}
                disabled={detectingLocation}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 transition cursor-pointer"
              >
                {detectingLocation ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Detecting GPS...</span>
                  </>
                ) : (
                  <>
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Auto-Detect My GPS Location</span>
                  </>
                )}
              </button>
            </div>

            <div className="relative">
              <MapPin className="w-5 h-5 text-gray-400 absolute left-3.5 top-3.5 pointer-events-none" />
              <textarea
                rows="2"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="House/Flat No., Building, Street, Landmark, City..."
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            {/* Geo Coordinates feedback */}
            <div className="flex items-center gap-2 text-xs text-gray-400 font-mono">
              <span>Geo Coordinates for Proximity Match:</span>
              <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                [{coordinates[0]}, {coordinates[1]}]
              </span>
            </div>
          </div>

          {/* Problem description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
              Service Notes & Details (Optional)
            </label>
            <textarea
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the issue (e.g. circuit tripping in kitchen, leaking pipe under washbasin, door hinge loose)..."
              className="w-full p-3.5 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 px-6 bg-emerald-700 hover:bg-emerald-800 disabled:bg-emerald-400 text-white text-base font-bold rounded-xl shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Running Geospatial Match & Booking...</span>
              </>
            ) : (
              <>
                <span>Confirm & Match Cooperative Artisan</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BookServicePage;
