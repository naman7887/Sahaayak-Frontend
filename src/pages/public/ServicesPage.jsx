import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import serviceService from "../../services/serviceService";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import EmptyState from "../../components/common/EmptyState";
import {
  Search,
  Clock,
  IndianRupee,
  ShieldCheck,
  CheckCircle2,
  Wrench,
  Zap,
} from "lucide-react";

export const ServicesPage = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const { isAuthenticated, role } = useAuth();
  const { t } = useLanguage();

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const res = await serviceService.getAllServices();
        if (res && res.services) {
          setServices(res.services);
        }
      } catch (err) {
        setError(err.message || "Failed to load services");
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  // Compute unique categories
  const categories = ["All", ...new Set(services.map((s) => s.category).filter(Boolean))];

  // Filtered services
  const filteredServices = services.filter((s) => {
    const matchesCategory = selectedCategory === "All" || s.category === selectedCategory;
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.description && s.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const getBookLink = (serviceId) => {
    if (!isAuthenticated) return `/login?redirect=/customer/book?service=${serviceId}`;
    if (role === "customer") return `/customer/book?service=${serviceId}`;
    return `/services/${serviceId}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-100 text-emerald-800">
          Cooperative Trades Catalog
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
          Verified Household & Community Services
        </h1>
        <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
          Standardized pricing, zero hidden costs, background-checked cooperative artisans, and guaranteed social security for gig workers.
        </p>
      </div>

      {/* Search & Category Filter Toolbar */}
      <div className="bg-white p-4 sm:p-6 rounded-3xl border border-gray-100 shadow-xs space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for electricians, plumbers, domestic assistance, carpentry..."
            className="w-full pl-12 pr-4 py-3 rounded-2xl border border-gray-200 text-sm text-gray-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                selectedCategory === cat
                  ? "bg-emerald-700 text-white shadow-xs"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200/80 hover:text-gray-900"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Services Grid */}
      {loading ? (
        <div className="py-16">
          <LoadingSpinner text="Fetching verified cooperative services..." />
        </div>
      ) : error ? (
        <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm text-center">
          {error}
        </div>
      ) : filteredServices.length === 0 ? (
        <EmptyState
          icon={Wrench}
          title="No services found"
          description="We couldn't find any services matching your search or category filter."
          actionText="Clear Filters"
          onAction={() => {
            setSelectedCategory("All");
            setSearchQuery("");
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <div
              key={service._id}
              className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs hover:shadow-md transition flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800">
                    {service.category}
                  </span>
                  <div className="text-right">
                    <span className="text-xs text-gray-400 font-medium">Standard Tariff</span>
                    <div className="text-lg font-black text-gray-900">₹{service.basePrice}</div>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-gray-900">{service.name}</h3>

                <p className="text-sm text-gray-500 line-clamp-3 leading-relaxed">
                  {service.description || "Delivered by background-verified cooperative members."}
                </p>

                <div className="flex items-center gap-4 text-xs text-gray-500 pt-1">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    <span>~{service.estimatedDuration || 60} mins</span>
                  </div>
                  <div className="flex items-center gap-1 text-emerald-700 font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Verified Cooperative</span>
                  </div>
                </div>
              </div>

              <div className="pt-5 mt-4 border-t border-gray-100 flex items-center justify-between gap-3">
                <Link
                  to={`/services/${service._id}`}
                  className="text-xs font-bold text-gray-600 hover:text-gray-900 transition"
                >
                  Details & FAQs
                </Link>

                <Link
                  to={getBookLink(service._id)}
                  className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs transition"
                >
                  {t("btn_book_now")}
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ServicesPage;
