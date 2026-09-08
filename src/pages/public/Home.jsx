import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import { useAuth } from "../../context/AuthContext";
import serviceService from "../../services/serviceService";
import {
  ShieldCheck,
  Zap,
  ArrowRight,
  IndianRupee,
  HeartHandshake,
  Cpu,
  CheckCircle2,
  Users,
  Building,
  Clock,
  MapPin,
} from "lucide-react";

export const Home = () => {
  const { t } = useLanguage();
  const { isAuthenticated, role } = useAuth();
  const [popularServices, setPopularServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await serviceService.getAllServices();
        if (res && res.services) {
          setPopularServices(res.services.slice(0, 6));
        }
      } catch (err) {
        console.error("Home service fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  const getBookLink = (serviceId) => {
    if (!isAuthenticated) return `/login?redirect=/customer/book?service=${serviceId}`;
    if (role === "customer") return `/customer/book?service=${serviceId}`;
    return `/services/${serviceId}`;
  };

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50/60 via-white to-white pt-12 pb-20 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 text-emerald-900 border border-emerald-200 text-xs font-bold tracking-wide">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>{t("hero_badge")}</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 tracking-tight leading-tight">
                {t("hero_title")}
              </h1>

              <p className="text-lg text-gray-600 leading-relaxed max-w-2xl">
                {t("hero_subtitle")}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <Link
                  to="/services"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-base font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-md hover:shadow-lg transition"
                >
                  <span>{t("hero_cta_book")}</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>

                <Link
                  to="/register?role=worker"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-base font-bold text-gray-800 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl shadow-xs transition"
                >
                  <span>{t("hero_cta_join")}</span>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="pt-6 border-t border-gray-100 grid grid-cols-3 gap-4 text-left">
                <div>
                  <div className="text-2xl font-black text-emerald-800">100%</div>
                  <div className="text-xs text-gray-500 font-medium">Verified Workers</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-emerald-800">₹ Guaranteed</div>
                  <div className="text-xs text-gray-500 font-medium">Base Income Protection</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-emerald-800">15 Min</div>
                  <div className="text-xs text-gray-500 font-medium">Emergency Dispatch</div>
                </div>
              </div>
            </div>

            {/* Hero Right Visual: Emergency Service Card */}
            <div className="lg:col-span-5">
              <div className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 text-white shadow-2xl border border-emerald-800/40">
                <div className="flex items-center justify-between mb-6">
                  <span className="px-3 py-1 rounded-full bg-amber-400 text-gray-950 text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 fill-current" />
                    Priority Dispatch
                  </span>
                  <span className="text-xs text-emerald-300 font-semibold">24/7 Available</span>
                </div>

                <h3 className="text-2xl font-black mb-3">{t("emergency_title")}</h3>
                <p className="text-sm text-emerald-100/90 leading-relaxed mb-6">
                  {t("emergency_desc")}
                </p>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 text-sm text-emerald-50 bg-white/10 p-2.5 rounded-xl">
                    <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
                    <span>Instant nearby GPS artisan allocation</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-emerald-50 bg-white/10 p-2.5 rounded-xl">
                    <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
                    <span>Standardized, regulated cooperative tariff</span>
                  </div>
                </div>

                <Link
                  to={isAuthenticated && role === "customer" ? "/customer/book?emergency=true" : "/services"}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-amber-400 hover:bg-amber-300 text-gray-950 font-black rounded-xl shadow-lg transition"
                >
                  <Zap className="w-5 h-5 fill-current" />
                  <span>{t("emergency_btn")}</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Pillars of Cooperative Model */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl font-black text-gray-900 mb-4">
            How Sahaayak Re-engineers the Gig Economy
          </h2>
          <p className="text-base text-gray-600 leading-relaxed">
            Eliminating extractive private middlemen through a legally recognized Cooperative Federation model that provides true social security.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Pillar 1 */}
          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-6">
              <IndianRupee className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              {t("coop_pillar_1_title")}
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              {t("coop_pillar_1_desc")}
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-6">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              {t("coop_pillar_2_title")}
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              {t("coop_pillar_2_desc")}
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center mb-6">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              {t("coop_pillar_3_title")}
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              {t("coop_pillar_3_desc")}
            </p>
          </div>
        </div>
      </section>

      {/* Popular Services Section (Real backend data) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-black text-gray-900 mb-2">
              {t("services_title")}
            </h2>
            <p className="text-sm text-gray-600">
              {t("services_subtitle")}
            </p>
          </div>
          <Link
            to="/services"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-700 hover:text-emerald-800"
          >
            <span>View All Services</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-48 bg-gray-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularServices.map((service) => (
              <div
                key={service._id}
                className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800">
                      {service.category}
                    </span>
                    <span className="text-sm font-black text-gray-900">
                      ₹{service.basePrice}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{service.name}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed mb-4">
                    {service.description || "Standard verified cooperative service."}
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    <span>~{service.estimatedDuration || 60} mins</span>
                  </div>
                  <Link
                    to={getBookLink(service._id)}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition"
                  >
                    {t("btn_book_now")}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Cooperative Federation Assurance CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-emerald-800 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl">
            <h3 className="text-2xl sm:text-3xl font-black">
              Are you a skilled artisan or domestic worker?
            </h3>
            <p className="text-sm text-emerald-100 leading-relaxed">
              Join your local Cooperative Society under the Sahaayak Federation. Enjoy guaranteed minimum monthly pay, free upskilling programs, accidental insurance, and direct government scheme integration.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 shrink-0">
            <Link
              to="/register?role=worker"
              className="px-6 py-3.5 bg-white text-emerald-900 font-bold rounded-xl shadow-md hover:bg-emerald-50 transition text-center"
            >
              Enroll as Cooperative Worker
            </Link>
            <Link
              to="/schemes"
              className="px-6 py-3.5 bg-emerald-900 text-white border border-emerald-700 font-bold rounded-xl hover:bg-emerald-950 transition text-center"
            >
              Check Welfare Schemes
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
