import { NavLink, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  UserCheck,
  Wrench,
  Banknote,
  Sparkles,
  GraduationCap,
  ShieldCheck,
  Network,
  Cpu,
  ShieldAlert,
} from "lucide-react";

export const AdminLayout = () => {
  const navItems = [
    { to: "/admin", label: "Federation Overview", icon: LayoutDashboard, end: true },
    { to: "/admin/workers", label: "Worker Verifications", icon: UserCheck },
    { to: "/admin/services", label: "Services & Pricing", icon: Wrench },
    { to: "/admin/salaries", label: "Payroll & Salary Security", icon: Banknote },
    { to: "/admin/schemes", label: "Welfare Schemes", icon: Sparkles },
    { to: "/admin/training", label: "Skill & Training Programs", icon: GraduationCap },
    { to: "/admin/insurance", label: "Insurance Plans", icon: ShieldAlert },
    { to: "/admin/cooperatives", label: "Cooperatives & Societies", icon: Network },
    { to: "/admin/ai", label: "AI Workforce & Forecasting", icon: Cpu },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Admin header */}
      <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-emerald-950 to-teal-950 text-white shadow-md flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Federation Administration Panel
            </span>
          </div>
          <h1 className="text-2xl font-black">Cooperative Command Center</h1>
          <p className="text-xs text-gray-300 mt-1">
            Worker Verification • Service Governance • AI Demand Allocation • Cooperative Oversight
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 border border-white/10 text-xs font-semibold text-emerald-200">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Admin Role Authorized</span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Admin Sidebar */}
        <aside className="w-full lg:w-64 shrink-0">
          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm sticky top-24">
            <div className="px-3 py-2 mb-3 border-b border-gray-100">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                Administration
              </span>
              <p className="text-xs text-gray-500">Platform & Cooperative Controls</p>
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
                      `flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition ${
                        isActive
                          ? "bg-slate-900 text-white shadow-sm"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                      }`
                    }
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Admin Content Area */}
        <div className="flex-1 min-w-0">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
