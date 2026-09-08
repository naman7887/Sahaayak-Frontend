import { useState, useEffect } from "react";
import schemeService from "../../services/schemeService";
import { useToast } from "../../context/ToastContext";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import EmptyState from "../../components/common/EmptyState";
import {
  Sparkles,
  Award,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  ShieldCheck,
} from "lucide-react";

export const WorkerSchemesPage = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  const { showError } = useToast();

  useEffect(() => {
    const fetchRecommended = async () => {
      try {
        setLoading(true);
        const res = await schemeService.getRecommendedSchemes();
        if (res && res.schemes) {
          setRecommendations(res.schemes);
        }
      } catch (err) {
        showError(err.message || "Failed to load smart scheme recommendations.");
      } finally {
        setLoading(false);
      }
    };
    fetchRecommended();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
            Smart Matching Engine
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-600" />
            Profile Auto-Matched
          </span>
        </div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">
          Recommended Welfare & Social Security Schemes
        </h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Based on your verified trade, experience, location, and demographic profile under the Cooperative Worker Welfare Framework.
        </p>
      </div>

      {loading ? (
        <div className="py-20">
          <LoadingSpinner text="Analyzing your profile against government welfare databases..." />
        </div>
      ) : recommendations.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="No smart scheme matches yet"
          description="Complete your worker profile details (trade, age, location) to get personalized welfare recommendations."
        />
      ) : (
        <div className="space-y-6">
          {recommendations.map((rec) => {
            const scheme = rec.scheme || rec;
            const score = rec.eligibilityScore !== undefined ? rec.eligibilityScore : 90;
            const isEligible = rec.eligible !== undefined ? rec.eligible : true;

            return (
              <div
                key={scheme._id}
                className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-xs hover:shadow-md transition space-y-5"
              >
                {/* Scheme title & score */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-800">
                        {scheme.category || "Social Security"}
                      </span>
                      <span className="text-xs text-gray-400">
                        Provider: {scheme.provider || "Government"}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mt-1">{scheme.title}</h3>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-gray-400 block">
                        Match Score
                      </span>
                      <span className="text-lg font-black text-emerald-700">{score}%</span>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                        isEligible
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                          : "bg-amber-100 text-amber-800 border border-amber-200"
                      }`}
                    >
                      {isEligible ? "High Match" : "Partial Match"}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-600 leading-relaxed">{scheme.description}</p>

                {/* Benefits */}
                {scheme.benefits && (
                  <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 text-xs text-emerald-950 space-y-1">
                    <span className="font-bold block">Entitlement Benefits:</span>
                    <p className="leading-relaxed">{scheme.benefits}</p>
                  </div>
                )}

                {/* Match Reasons & Warnings */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  {Array.isArray(rec.reasons) && rec.reasons.length > 0 && (
                    <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 space-y-1">
                      <span className="font-bold text-gray-700 block">Why you qualify:</span>
                      <ul className="space-y-1 text-gray-600">
                        {rec.reasons.map((r, i) => (
                          <li key={i} className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>{r}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {Array.isArray(rec.warnings) && rec.warnings.length > 0 && (
                    <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-100 space-y-1">
                      <span className="font-bold text-amber-900 block">Eligibility Notes:</span>
                      <ul className="space-y-1 text-amber-800">
                        {rec.warnings.map((w, i) => (
                          <li key={i} className="flex items-center gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span>{w}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Action footer */}
                <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-[11px] text-gray-400">
                    Official Scheme Notification • Managed by Cooperative Federation
                  </div>

                  {scheme.applicationUrl ? (
                    <a
                      href={scheme.applicationUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs transition"
                    >
                      <span>Apply on Official Portal</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  ) : (
                    <span className="text-xs font-bold text-emerald-700">
                      Assistance available at local society desk
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default WorkerSchemesPage;
