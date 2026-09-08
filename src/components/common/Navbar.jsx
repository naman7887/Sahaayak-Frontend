import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { useNotifications } from "../../context/NotificationContext";
import LanguageSelector from "./LanguageSelector";
import {
  ShieldCheck,
  Zap,
  Menu,
  X,
  Bell,
  User,
  LogOut,
  Briefcase,
  LayoutDashboard,
  CalendarCheck,
  Cpu,
} from "lucide-react";

export const Navbar = () => {
  const { user, isAuthenticated, role, logout } = useAuth();
  const { t } = useLanguage();
  const { unreadCount } = useNotifications();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getDashboardPath = () => {
    if (role === "admin") return "/admin";
    if (role === "worker") return "/worker";
    return "/customer";
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-xs">
      {/* Top emergency micro-bar */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="bg-amber-400 text-gray-900 text-[10px] font-extrabold px-1.5 py-0.5 rounded tracking-wider uppercase">
              SIH 2026
            </span>
            <span className="hidden sm:inline text-emerald-100">
              National Cooperative Gig Services Federation Platform
            </span>
          </div>
          <Link
            to={isAuthenticated && role === "customer" ? "/customer/book?emergency=true" : "/services"}
            className="flex items-center gap-1.5 font-bold text-amber-300 hover:text-amber-200 transition"
          >
            <Zap className="w-3.5 h-3.5 fill-amber-300" />
            <span>{t("nav_emergency")} (15 Min Dispatch)</span>
          </Link>
        </div>
      </div>

      {/* Main navigation bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center shadow-md shadow-emerald-700/20 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xl font-black tracking-tight text-gray-900 flex items-center gap-1">
                <span>{t("app_name")}</span>
                <span className="text-[11px] font-semibold uppercase px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 tracking-wider">
                  Coop
                </span>
              </div>
              <p className="text-[10px] font-medium text-gray-500 hidden md:block">
                Fair Wages • Social Security • Trusted Services
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6">
            <Link
              to="/"
              className="text-sm font-semibold text-gray-700 hover:text-emerald-700 transition"
            >
              {t("nav_home")}
            </Link>
            <Link
              to="/services"
              className="text-sm font-semibold text-gray-700 hover:text-emerald-700 transition"
            >
              {t("nav_services")}
            </Link>
            <Link
              to="/schemes"
              className="text-sm font-semibold text-gray-700 hover:text-emerald-700 transition"
            >
              {t("nav_schemes")}
            </Link>
            <Link
              to="/insurance"
              className="text-sm font-semibold text-gray-700 hover:text-emerald-700 transition"
            >
              {t("nav_insurance")}
            </Link>

            {/* Role-specific quick links */}
            {role === "customer" && (
              <Link
                to="/customer/bookings"
                className="text-sm font-semibold text-emerald-700 hover:text-emerald-800 transition flex items-center gap-1"
              >
                <CalendarCheck className="w-4 h-4" />
                <span>My Bookings</span>
              </Link>
            )}
            {role === "worker" && (
              <Link
                to="/worker/jobs"
                className="text-sm font-semibold text-emerald-700 hover:text-emerald-800 transition flex items-center gap-1"
              >
                <Briefcase className="w-4 h-4" />
                <span>My Jobs</span>
              </Link>
            )}
            {role === "admin" && (
              <Link
                to="/admin/ai"
                className="text-sm font-semibold text-purple-700 hover:text-purple-800 transition flex items-center gap-1"
              >
                <Cpu className="w-4 h-4" />
                <span>AI Workforce Plan</span>
              </Link>
            )}
          </nav>

          {/* Right Action Icons & Auth Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            <LanguageSelector />

            {isAuthenticated ? (
              <>
                {/* Notification Bell */}
                <Link
                  to={role === "worker" ? "/worker/notifications" : "/customer/notifications"}
                  className="relative p-2 text-gray-500 hover:text-emerald-700 hover:bg-gray-100 rounded-xl transition"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </Link>

                {/* Dashboard Button */}
                <Link
                  to={getDashboardPath()}
                  className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-semibold text-gray-800 bg-gray-100 hover:bg-gray-200/80 rounded-xl transition"
                >
                  <LayoutDashboard className="w-4 h-4 text-emerald-700" />
                  <span>{user?.name?.split(" ")[0]}</span>
                  <span className="text-[10px] uppercase font-extrabold px-1.5 py-0.5 rounded bg-white text-gray-600 border border-gray-200">
                    {role}
                  </span>
                </Link>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-gray-700 hover:text-emerald-800 hover:bg-gray-100 rounded-xl transition"
                >
                  {t("nav_login")}
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-sm hover:shadow-md transition"
                >
                  {t("nav_register")}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger button */}
          <div className="flex sm:hidden items-center gap-2">
            <LanguageSelector />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-700 hover:bg-gray-100 rounded-xl transition"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-gray-100 bg-white px-4 pt-3 pb-6 space-y-3">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-semibold text-gray-800 hover:text-emerald-700"
          >
            {t("nav_home")}
          </Link>
          <Link
            to="/services"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-semibold text-gray-800 hover:text-emerald-700"
          >
            {t("nav_services")}
          </Link>
          <Link
            to="/schemes"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-semibold text-gray-800 hover:text-emerald-700"
          >
            {t("nav_schemes")}
          </Link>
          <Link
            to="/insurance"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-semibold text-gray-800 hover:text-emerald-700"
          >
            {t("nav_insurance")}
          </Link>

          {isAuthenticated ? (
            <div className="pt-3 border-t border-gray-100 space-y-2">
              <Link
                to={getDashboardPath()}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 py-2 text-base font-bold text-emerald-800"
              >
                <LayoutDashboard className="w-5 h-5" />
                <span>Dashboard ({user?.name})</span>
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-rose-700 bg-rose-50 rounded-xl"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div className="pt-3 border-t border-gray-100 flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 text-sm font-semibold text-gray-800 bg-gray-100 rounded-xl"
              >
                {t("nav_login")}
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 text-sm font-semibold text-white bg-emerald-700 rounded-xl"
              >
                {t("nav_register")}
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
