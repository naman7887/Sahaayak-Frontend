import { useState, useEffect } from "react";
import insuranceService from "../../services/insuranceService";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import EmptyState from "../../components/common/EmptyState";
import {
  ShieldAlert,
  ShieldCheck,
  IndianRupee,
  CheckCircle2,
  ExternalLink,
  FileText,
} from "lucide-react";

export const InsurancePage = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInsurance = async () => {
      try {
        setLoading(true);
        const res = await insuranceService.getAllPlans();
        if (res && res.plans) {
          setPlans(res.plans);
        }
      } catch (err) {
        setError(err.message || "Failed to load insurance plans.");
      } finally {
        setLoading(false);
      }
    };
    fetchInsurance();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-100 text-emerald-800">
          Cooperative Risk Protection
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
          Accidental & Health Insurance Protection
        </h1>
        <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
          Subsidized group coverage for cooperative artisans and their families, ensuring zero catastrophic financial loss from workplace injuries.
        </p>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="py-20">
          <LoadingSpinner text="Fetching active insurance schemes..." />
        </div>
      ) : error ? (
        <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm text-center">
          {error}
        </div>
      ) : plans.length === 0 ? (
        <EmptyState
          icon={ShieldAlert}
          title="No active insurance plans"
          description="Cooperative insurance plans are currently being configured for your zone."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan._id}
              className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs hover:shadow-md transition flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800">
                    {plan.provider || "Cooperative Partner"}
                  </span>
                  <span className="text-xs font-semibold text-gray-500">
                    {plan.premiumFrequency || "Yearly"}
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-gray-900">{plan.planName}</h3>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                    {plan.description || "Comprehensive coverage for registered cooperative workers."}
                  </p>
                </div>

                {/* Cover & Premium */}
                <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-gray-50 border border-gray-100">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-gray-400">Total Cover</span>
                    <div className="text-base font-black text-emerald-800">
                      ₹{Number(plan.coverageAmount || 0).toLocaleString("en-IN")}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-gray-400">Annual Premium</span>
                    <div className="text-base font-black text-gray-900">
                      ₹{Number(plan.premiumAmount || 0).toLocaleString("en-IN")}
                    </div>
                  </div>
                </div>

                {/* Benefits */}
                {Array.isArray(plan.benefits) && plan.benefits.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-xs font-bold text-gray-700">Covered Benefits:</span>
                    <ul className="space-y-1 text-xs text-gray-600">
                      {plan.benefits.slice(0, 3).map((b, i) => (
                        <li key={i} className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Footer action */}
              <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-[11px] font-medium text-gray-500">
                  {plan.eligibility ? `Eligibility: ${plan.eligibility}` : "Cooperative members"}
                </span>
                {plan.applicationUrl ? (
                  <a
                    href={plan.applicationUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition"
                  >
                    <span>Details</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                ) : (
                  <span className="text-xs text-emerald-700 font-semibold">Available via Desk</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InsurancePage;
