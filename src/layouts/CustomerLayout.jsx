import { NavLink, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarCheck,
  CreditCard,
  FileText,
  ShieldCheck,
  Gift,
  Bell,
  User,
  PlusCircle,
} from "lucide-react";
import { useNotifications } from "../context/NotificationContext";

export const CustomerLayout = () => {
  const { unreadCount } = useNotifications();

  const navItems = [
    { to: "/customer", label: "Dashboard", icon: LayoutDashboard, end: true },
    { to: "/customer/book", label: "Book a Service", icon: PlusCircle },
    { to: "/customer/bookings", label: "My Bookings", icon: CalendarCheck },
    { to: "/customer/payments", label: "Payments & Receipts", icon: CreditCard },
    { to: "/customer/invoices", label: "Digital Invoices", icon: FileText },
    { to: "/customer/insurance", label: "Insurance Protection", icon: ShieldCheck },
    { to: "/customer/welfare", label: "Welfare Schemes", icon: Gift },
    { to: "/customer/notifications", label: "Notifications", icon: Bell, badge: unreadCount },
    { to: "/customer/profile", label: "My Profile", icon: User },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Customer Sidebar */}
        <aside className="w-full lg:w-64 shrink-0">
          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm sticky top-24">
            <div className="px-3 py-2 mb-3 border-b border-gray-100">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                Customer Space
              </span>
              <p className="text-xs text-gray-500">Manage bookings & household services</p>
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

        {/* Main Customer Content Area */}
        <div className="flex-1 min-w-0">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default CustomerLayout;
