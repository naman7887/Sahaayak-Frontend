import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import bookingService from "../../services/bookingService";
import salaryService from "../../services/salaryService";
import workerService from "../../services/workerService";
import reviewService from "../../services/reviewService";
import StatCard from "../../components/common/StatCard";
import StatusBadge from "../../components/common/StatusBadge";
import RatingStars from "../../components/common/RatingStars";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import {
  Briefcase,
  IndianRupee,
  Star,
  Clock,
  CalendarCheck,
  CheckCircle2,
  AlertCircle,
  GraduationCap,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

export const WorkerDashboard = () => {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [workerProfile, setWorkerProfile] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [salary, setSalary] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadWorkerData = async () => {
      try {
        setLoading(true);
        const [profRes, bookRes, salRes] = await Promise.allSettled([
          workerService.getMyProfile(),
          bookingService.getWorkerBookings(),
          salaryService.getMyCurrentSalary(),
        ]);

        if (profRes.status === "fulfilled" && profRes.value?.worker) {
          setWorkerProfile(profRes.value.worker);
          // Load worker reviews
          try {
            const revRes = await reviewService.getWorkerReviews(profRes.value.worker._id);
            if (revRes && revRes.reviews) setReviews(revRes.reviews);
          } catch {
            // quiet
          }
        }

        if (bookRes.status === "fulfilled" && bookRes.value?.bookings) {
          setBookings(bookRes.value.bookings);
        }

        if (salRes.status === "fulfilled" && salRes.value?.salary) {
          setSalary(salRes.value.salary);
        }
      } catch (err) {
        console.error("Worker dashboard error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadWorkerData();
  }, []);

  const pendingBookings = bookings.filter((b) => b.status === "pending");
  const activeJobs = bookings.filter((b) => ["accepted", "in-progress"].includes(b.status));
  const completedJobs = bookings.filter((b) => b.status === "completed");

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / reviews.length
      : workerProfile?.rating || 5.0;

  if (loading) {
    return (
      <div className="py-24">
        <LoadingSpinner text="Loading your artisan workspace..." />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Jobs"
          value={activeJobs.length}
          subtitle={`${pendingBookings.length} incoming requests`}
          icon={Briefcase}
          color="emerald"
        />

        <StatCard
          title="Current Month Salary"
          value={salary ? `₹${salary.finalSalary?.toLocaleString("en-IN")}` : "₹18,000"}
          subtitle={
            salary
              ? `${salary.completedJobs || 0}/${salary.monthlyJobLimit || 30} jobs completed`
              : "Base guarantee active"
          }
          icon={IndianRupee}
          color="indigo"
        />

        <StatCard
          title="Artisan Rating"
          value={`${averageRating.toFixed(1)} ★`}
          subtitle={`Based on ${reviews.length} customer reviews`}
          icon={Star}
          color="amber"
        />

        <StatCard
          title="Total Lifetime Jobs"
          value={workerProfile?.totalJobs || completedJobs.length}
          subtitle="Cooperative recorded jobs"
          icon={CheckCircle2}
          color="blue"
        />
      </div>

      {/* Action Required: Incoming Job Dispatches */}
      {pendingBookings.length > 0 && (
        <div className="p-5 rounded-3xl bg-amber-50 border border-amber-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
              <h3 className="text-base font-bold text-amber-950">
                Incoming Dispatches Awaiting Your Confirmation ({pendingBookings.length})
              </h3>
            </div>
            <Link
              to="/worker/jobs"
              className="text-xs font-bold text-amber-900 hover:text-amber-950 flex items-center gap-1"
            >
              <span>Review Dispatches</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <p className="text-xs text-amber-800">
            Accepting quickly ensures maximum customer satisfaction and maintains your priority dispatch ranking in your cooperative society.
          </p>
        </div>
      )}

      {/* Salary & Income Security Snapshot */}
      <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                Cooperative Income Security Model
              </span>
            </div>
            <h2 className="text-lg font-bold text-gray-900 mt-1">
              Monthly Guaranteed Base & Incentive Pay
            </h2>
          </div>
          <Link
            to="/worker/salary"
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800"
          >
            Full Salary Breakdown →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-1">
            <span className="text-gray-500 block text-[10px] uppercase font-bold">Guaranteed Base</span>
            <div className="text-base font-black text-gray-900">
              ₹{salary ? salary.baseSalary : "15,000"}
            </div>
            <span className="text-[10px] text-emerald-600 font-semibold">Protected wage floor</span>
          </div>

          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-1">
            <span className="text-gray-500 block text-[10px] uppercase font-bold">Job Limit Cap</span>
            <div className="text-base font-black text-gray-900">
              {salary ? salary.monthlyJobLimit : 30} Jobs
            </div>
            <span className="text-[10px] text-gray-500">Overtime kicks in after cap</span>
          </div>

          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-1">
            <span className="text-gray-500 block text-[10px] uppercase font-bold">Overtime Incentive</span>
            <div className="text-base font-black text-emerald-700">
              + ₹{salary ? salary.overtimePay : 0}
            </div>
            <span className="text-[10px] text-gray-500">₹250/job above cap</span>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 space-y-1">
            <span className="text-emerald-800 block text-[10px] uppercase font-bold">Net Estimate</span>
            <div className="text-lg font-black text-emerald-900">
              ₹{salary ? salary.finalSalary : "15,000"}
            </div>
            <span className="text-[10px] font-bold text-emerald-700 uppercase">
              Status: {salary?.status || "Pending Calculation"}
            </span>
          </div>
        </div>
      </div>

      {/* Active Jobs List */}
      <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Assigned Today & In-Progress Jobs</h2>
            <p className="text-xs text-gray-500">Your live queue of active dispatches</p>
          </div>
          <Link
            to="/worker/jobs"
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800"
          >
            Manage All Jobs ({bookings.length})
          </Link>
        </div>

        {activeJobs.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-xs">
            No active jobs right now. Make sure your availability is set to ONLINE to receive dispatches.
          </div>
        ) : (
          <div className="space-y-3">
            {activeJobs.map((b) => (
              <div
                key={b._id}
                className="p-4 rounded-2xl bg-gray-50/80 border border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-gray-900">{b.service?.name}</span>
                    <StatusBadge status={b.status} />
                  </div>
                  <div className="text-xs text-gray-600 flex flex-wrap items-center gap-3">
                    <span className="flex items-center gap-1 font-medium">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      {new Date(b.scheduledDate).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <span>•</span>
                    <span>Customer: {b.customer?.name} ({b.customer?.phone})</span>
                    <span>•</span>
                    <span className="text-gray-500">{b.address}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-sm font-black text-gray-900">₹{b.price}</span>
                  <Link
                    to="/worker/jobs"
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-700 text-white text-xs font-bold shadow-xs hover:bg-emerald-800 transition"
                  >
                    Action
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          to="/worker/training"
          className="p-5 rounded-2xl bg-white border border-gray-100 shadow-xs hover:shadow-md transition flex items-center gap-4 group"
        >
          <div className="p-3 rounded-xl bg-purple-50 text-purple-700 group-hover:scale-105 transition-transform">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-900">Skill Certifications</h4>
            <p className="text-xs text-gray-500">Enroll in free upskilling programs</p>
          </div>
        </Link>

        <Link
          to="/worker/schemes"
          className="p-5 rounded-2xl bg-white border border-gray-100 shadow-xs hover:shadow-md transition flex items-center gap-4 group"
        >
          <div className="p-3 rounded-xl bg-amber-50 text-amber-700 group-hover:scale-105 transition-transform">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-900">Welfare Schemes</h4>
            <p className="text-xs text-gray-500">Smart AI-matched entitlements</p>
          </div>
        </Link>

        <Link
          to="/worker/profile"
          className="p-5 rounded-2xl bg-white border border-gray-100 shadow-xs hover:shadow-md transition flex items-center gap-4 group"
        >
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-900">Artisan Profile</h4>
            <p className="text-xs text-gray-500">Update trade, skills & service radius</p>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default WorkerDashboard;
