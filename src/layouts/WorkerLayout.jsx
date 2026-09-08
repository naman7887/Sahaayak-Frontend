import { NavLink, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  Briefcase,
  IndianRupee,
  GraduationCap,
  Sparkles,
  ShieldAlert,
  Bell,
  UserCheck,
} from "lucide-react";
import AvailabilityToggle from "../components/worker/AvailabilityToggle";
import { useNotifications } from "../context/NotificationContext";
import { useAuth } from "../context/AuthContext";

export const WorkerLayout = () => {
  const { unreadCount } = useNotifications();
  const { user } = useAuth();

  const navItems = [
    { to: "/worker", label: "Overview", icon: LayoutDashboard, end: true },
    { to: "/worker/jobs", label: "My Jobs & Bookings", icon: Briefcase },
    { to: "/worker/salary", label: "Guaranteed Income & Salary", icon: IndianRupee },
    { to: "/worker/training", label: "Upskilling & Certificates", icon: GraduationCap },
    { to: "/worker/schemes", label: "Smart Welfare Schemes", icon: Sparkles },
    { to: "/worker/insurance", label: "Insurance Cover", icon: ShieldAlert },
    { to: "/worker/notifications", label: "Alerts & Dispatches", icon: Bell, badge: unreadCount },
    { to: "/worker/profile", label: "Skills & Verification", icon: UserCheck },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Worker Header banner with Availability toggle */}
      <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
              Cooperative Worker Member
            </span>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-800 text-emerald-100">
              {user?.isVerified ? "Verified Artisan" : "Verification in Progress"}
            </span>
          </div>
          <h1 className="text-2xl font-black">{user?.name}</h1>
          <p className="text-xs text-emerald-200/80 mt-1">
            Protected under National Cooperative Gig Worker Fair Compensation Charter
          </p>
        </div>

        <div className="shrink-0">
          <AvailabilityToggle />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Worker Sidebar */}
        <aside className="w-full lg:w-64 shrink-0">
          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm sticky top-24">
            <div className="px-3 py-2 mb-3 border-b border-gray-100">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                Worker Controls
              </span>
              <p className="text-xs text-gray-500">Jobs, earnings & welfare</p>
            </div>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition ${
                        isActive
                          ? "bg-emerald-700 text-white shadow-sm"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                      }`
                    }
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                    {item.badge > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Worker Content Area */}
        <div className="flex-1 min-w-0">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default WorkerLayout;
