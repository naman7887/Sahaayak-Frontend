import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { useNotifications } from "../../context/NotificationContext";
import bookingService from "../../services/bookingService";
import serviceService from "../../services/serviceService";
import paymentService from "../../services/paymentService";
import StatCard from "../../components/common/StatCard";
import StatusBadge from "../../components/common/StatusBadge";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import {
  CalendarCheck,
  Zap,
  CreditCard,
  PlusCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

export const CustomerDashboard = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const [bookRes, payRes, servRes] = await Promise.allSettled([
          bookingService.getMyBookings(),
          paymentService.getMyPayments(),
          serviceService.getAllServices(),
        ]);

        if (bookRes.status === "fulfilled" && bookRes.value?.bookings) {
          setBookings(bookRes.value.bookings);
        }
        if (payRes.status === "fulfilled" && payRes.value?.payments) {
          setPayments(payRes.value.payments);
        }
        if (servRes.status === "fulfilled" && servRes.value?.services) {
          setServices(servRes.value.services.slice(0, 4));
        }
      } catch (err) {
        console.error("Customer dashboard load error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const activeBookings = bookings.filter((b) =>
    ["pending", "accepted", "in-progress"].includes(b.status)
  );
  const completedBookings = bookings.filter((b) => b.status === "completed");
  const totalSpent = payments
    .filter((p) => p.paymentStatus === "paid")
    .reduce((acc, curr) => acc + (curr.amount || 0), 0);

  if (loading) {
    return (
      <div className="py-24">
        <LoadingSpinner text="Preparing your customer dashboard..." />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-800 to-teal-900 text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-500/30 text-emerald-200 border border-emerald-400/20">
              Verified Household Account
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">
            Welcome, {user?.name}!
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100 max-w-xl leading-relaxed">
            Every booking you make directly supports a verified cooperative artisan with guaranteed fair wages and social security.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Link
            to="/customer/book"
            className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-white text-emerald-900 text-xs font-bold shadow-md hover:bg-emerald-50 transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Book a Service</span>
          </Link>

          <Link
            to="/customer/book?emergency=true"
            className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-gray-950 text-xs font-black shadow-md transition"
          >
            <Zap className="w-4 h-4 fill-current" />
            <span>15-Min Emergency</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Bookings"
          value={activeBookings.length}
          subtitle="In progress or assigned"
          icon={CalendarCheck}
          color="emerald"
        />
        <StatCard
          title="Completed Jobs"
          value={completedBookings.length}
          subtitle="Fulfilled by cooperative"
          icon={CheckCircle2}
          color="blue"
        />
        <StatCard
          title="Total Spent"
          value={`₹${totalSpent.toLocaleString("en-IN")}`}
          subtitle="Direct to cooperative workers"
          icon={CreditCard}
          color="indigo"
        />
        <StatCard
          title="Unread Alerts"
          value={unreadCount}
          subtitle="Dispatch & status updates"
          icon={Sparkles}
          color={unreadCount > 0 ? "rose" : "emerald"}
        />
      </div>

      {/* Active Bookings Section */}
      <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Current Ongoing Services</h2>
            <p className="text-xs text-gray-500">Live progress of your active bookings</p>
          </div>
          <Link
            to="/customer/bookings"
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800"
          >
            View All ({bookings.length})
          </Link>
        </div>

        {activeBookings.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-xs">
            No active jobs in progress. Book a service whenever you need assistance!
          </div>
        ) : (
          <div className="space-y-3">
            {activeBookings.map((b) => (
              <div
                key={b._id}
                className="p-4 rounded-2xl bg-gray-50/80 border border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-gray-900">{b.service?.name}</span>
                    <StatusBadge status={b.status} />
                  </div>
                  <div className="text-xs text-gray-500 flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(b.scheduledDate).toLocaleString("en-IN", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <span>•</span>
                    <span>{b.worker?.name ? `Artisan: ${b.worker.name}` : "Matching nearest artisan..."}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-sm font-black text-gray-900">₹{b.price}</span>
                  <Link
                    to="/customer/bookings"
                    className="px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-100 transition"
                  >
                    Manage
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recommended Services Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Popular Household Services</h2>
          <Link
            to="/services"
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800"
          >
            Explore Catalog →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {services.map((s) => (
            <div
              key={s._id}
              className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs hover:shadow-sm transition flex flex-col justify-between"
            >
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-800">
                  {s.category}
                </span>
                <h3 className="text-sm font-bold text-gray-900">{s.name}</h3>
                <div className="text-xs font-black text-gray-800">₹{s.basePrice}</div>
              </div>

              <div className="pt-4 mt-3 border-t border-gray-100 flex items-center justify-between">
                <span className="text-[11px] text-gray-400">~{s.estimatedDuration || 60}m</span>
                <Link
                  to={`/customer/book?service=${s._id}`}
                  className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition"
                >
                  Book
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
