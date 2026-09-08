import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import serviceService from "../../services/serviceService";
import { useAuth } from "../../context/AuthContext";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import {
  ShieldCheck,
  Clock,
  IndianRupee,
  CheckCircle2,
  ArrowLeft,
  Calendar,
  AlertCircle,
} from "lucide-react";

export const ServiceDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, role } = useAuth();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const res = await serviceService.getServiceById(id);
        if (res && res.service) {
          setService(res.service);
        } else {
          setError("Service not found.");
        }
      } catch (err) {
        setError(err.message || "Failed to load service details.");
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="py-24">
        <LoadingSpinner text="Loading service details..." />
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-gray-900">{error || "Service Not Found"}</h2>
        <Link
          to="/services"
          className="inline-flex items-center gap-2 text-sm font-bold text-emerald-700 hover:text-emerald-800"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Services</span>
        </Link>
      </div>
    );
  }

  const getBookLink = () => {
    if (!isAuthenticated) return `/login?redirect=/customer/book?service=${service._id}`;
    if (role === "customer") return `/customer/book?service=${service._id}`;
    return "/customer";
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 transition cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back</span>
      </button>

      {/* Main card */}
      <div className="bg-white rounded-3xl border border-gray-100 p-8 sm:p-10 shadow-sm space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-100 pb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-100 text-emerald-800">
              {service.category}
            </span>
            <h1 className="text-3xl font-black text-gray-900 mt-2">{service.name}</h1>
          </div>

          <div className="text-right">
            <span className="text-xs text-gray-500 font-medium">Standard Cooperative Base Fee</span>
            <div className="text-3xl font-black text-emerald-800">₹{service.basePrice}</div>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-3">
          <h3 className="text-base font-bold text-gray-900">Service Scope & Description</h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            {service.description || "Delivered by vetted and background-verified cooperative members."}
          </p>
        </div>

        {/* Details Checklist */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-gray-50 border border-gray-100">
            <Clock className="w-5 h-5 text-emerald-600" />
            <div>
              <div className="text-xs text-gray-500 font-medium">Estimated Duration</div>
              <div className="text-sm font-bold text-gray-900">
                ~{service.estimatedDuration || 60} Minutes
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-2xl bg-gray-50 border border-gray-100">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <div>
              <div className="text-xs text-gray-500 font-medium">Workforce Guarantee</div>
              <div className="text-sm font-bold text-gray-900">100% Cooperative Verified</div>
            </div>
          </div>
        </div>

        {/* Standard Cooperative Assurances */}
        <div className="p-6 rounded-2xl bg-emerald-50/70 border border-emerald-200/60 space-y-3">
          <h4 className="text-sm font-bold text-emerald-950 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-700" />
            <span>Sahaayak Cooperative Quality Assurances</span>
          </h4>
          <ul className="space-y-2 text-xs text-emerald-900">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Direct digital payment to worker with zero commissions cut by third-party brokers.</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Background and police verified cooperative artisan dispatched based on real-time GPS proximity.</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Official GST-compliant digital invoice generated upon job completion.</span>
            </li>
          </ul>
        </div>

        {/* Action button */}
        <div className="flex items-center justify-between pt-4">
          <Link
            to="/services"
            className="text-sm font-semibold text-gray-600 hover:text-gray-900"
          >
            ← Browse Other Services
          </Link>

          <Link
            to={getBookLink()}
            className="px-8 py-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold shadow-md hover:shadow-lg transition"
          >
            Schedule & Book Now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetailsPage;
