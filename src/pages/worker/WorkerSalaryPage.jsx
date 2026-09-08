import { useState, useEffect } from "react";
import salaryService from "../../services/salaryService";
import { useToast } from "../../context/ToastContext";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import EmptyState from "../../components/common/EmptyState";
import StatCard from "../../components/common/StatCard";
import {
  IndianRupee,
  ShieldCheck,
  Award,
  TrendingUp,
  Clock,
  CheckCircle2,
  Calendar,
  AlertCircle,
} from "lucide-react";

export const WorkerSalaryPage = () => {
  const [currentSalary, setCurrentSalary] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const { showError } = useToast();

  useEffect(() => {
    const fetchSalaryData = async () => {
      try {
        setLoading(true);
        const [currRes, histRes] = await Promise.allSettled([
          salaryService.getMyCurrentSalary(),
          salaryService.getMySalaryHistory(),
        ]);

        if (currRes.status === "fulfilled" && currRes.value?.salary) {
          setCurrentSalary(currRes.value.salary);
        }
        if (histRes.status === "fulfilled" && histRes.value?.history) {
          setHistory(histRes.value.history);
        }
      } catch (err) {
        showError(err.message || "Failed to load salary details.");
      } finally {
        setLoading(false);
      }
    };
    fetchSalaryData();
  }, []);

  if (loading) {
    return (
      <div className="py-24">
        <LoadingSpinner text="Fetching official cooperative payroll records..." />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
            Social Security & Compensation
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-900">
            SIH Problem Statement SIH26089
          </span>
        </div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">
          Guaranteed Monthly Income & Overtime Payroll
        </h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Income security system guaranteeing baseline floor earnings regardless of platform demand drops
        </p>
      </div>

      {/* Hero Salary Breakdown Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 text-white shadow-lg space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
              Current Month Pay Cycle
            </span>
            <div className="text-3xl sm:text-4xl font-black text-white mt-1">
              ₹{currentSalary ? currentSalary.finalSalary?.toLocaleString("en-IN") : "15,000"}
            </div>
            <p className="text-xs text-emerald-200/80 mt-1">
              Net Payable (Base Salary + Overtime Pay + Bonuses + Adjustments)
            </p>
          </div>

          <div className="text-right sm:border-l sm:pl-6 border-white/10">
            <span className="text-[10px] uppercase font-bold text-emerald-300 block">Payout Status</span>
            <span
              className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-bold uppercase ${
                currentSalary?.status === "paid"
                  ? "bg-emerald-400 text-emerald-950"
                  : "bg-amber-400 text-gray-950"
              }`}
            >
              {currentSalary?.status || "Pending End-of-Month"}
            </span>
            {currentSalary?.paidAt && (
              <div className="text-[10px] text-emerald-200 mt-1 font-mono">
                Disbursed: {new Date(currentSalary.paidAt).toLocaleDateString("en-IN")}
              </div>
            )}
          </div>
        </div>

        {/* 4 Pillars of Current Pay */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-white/10 border border-white/10 space-y-1">
            <span className="text-[10px] uppercase font-bold text-emerald-200 block">Base Guarantee</span>
            <div className="text-xl font-black text-white">
              ₹{currentSalary?.baseSalary || 15000}
            </div>
            <span className="text-[10px] text-emerald-300">Protected wage floor</span>
          </div>

          <div className="p-4 rounded-2xl bg-white/10 border border-white/10 space-y-1">
            <span className="text-[10px] uppercase font-bold text-emerald-200 block">Job Progress</span>
            <div className="text-xl font-black text-white">
              {currentSalary?.completedJobs || 0} / {currentSalary?.monthlyJobLimit || 30}
            </div>
            <span className="text-[10px] text-emerald-300">Monthly baseline quota</span>
          </div>

          <div className="p-4 rounded-2xl bg-white/10 border border-white/10 space-y-1">
            <span className="text-[10px] uppercase font-bold text-emerald-200 block">Extra Jobs (Overtime)</span>
            <div className="text-xl font-black text-amber-300">
              +{currentSalary?.extraJobs || 0} Jobs
            </div>
            <span className="text-[10px] text-emerald-300">
              ₹{currentSalary?.overtimePay || 0} earned
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white/10 border border-white/10 space-y-1">
            <span className="text-[10px] uppercase font-bold text-emerald-200 block">Bonus & Adjustments</span>
            <div className="text-xl font-black text-white">
              +₹{(currentSalary?.performanceBonus || 0) + (currentSalary?.adjustment || 0)}
            </div>
            <span className="text-[10px] text-emerald-300">Merit & cooperative share</span>
          </div>
        </div>
      </div>

      {/* Transparent Calculation Explainer */}
      <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-700" />
          <span>Transparent Cooperative Salary Calculation Engine</span>
        </h3>

        <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 text-xs font-mono space-y-2 text-gray-700">
          <div>
            <strong>Final Salary</strong> = Base Salary (₹{currentSalary?.baseSalary || 15000}) +
            Overtime Pay (₹{currentSalary?.overtimePay || 0}) + Performance Bonus (₹
            {currentSalary?.performanceBonus || 0}) + Adjustments (₹{currentSalary?.adjustment || 0})
          </div>
          <div>
            <strong>Overtime Pay</strong> = Extra Jobs ({currentSalary?.extraJobs || 0}) × Rate per Extra
            Job (₹{currentSalary?.overtimeRate || 250})
          </div>
          <div>
            <strong>Extra Jobs</strong> = max(0, Completed Jobs [{currentSalary?.completedJobs || 0}] −
            Monthly Cap [{currentSalary?.monthlyJobLimit || 30}])
          </div>
        </div>
      </div>

      {/* Salary History Table */}
      <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div>
            <h3 className="text-base font-bold text-gray-900">Historical Disbursal Records</h3>
            <p className="text-xs text-gray-500">Official logs of previous monthly disbursements</p>
          </div>
        </div>

        {history.length === 0 ? (
          <div className="text-center py-8 text-xs text-gray-400">
            No historical records yet. Current month is your active cycle.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/80 border-b border-gray-100 font-bold uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="p-3">Month</th>
                  <th className="p-3">Base (₹)</th>
                  <th className="p-3">Jobs Completed</th>
                  <th className="p-3">Extra (OT)</th>
                  <th className="p-3">Final Salary (₹)</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Disbursed Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {history.map((h) => (
                  <tr key={h._id} className="hover:bg-gray-50/50 transition">
                    <td className="p-3 font-bold text-gray-900">{h.month}</td>
                    <td className="p-3 font-medium">₹{h.baseSalary}</td>
                    <td className="p-3 font-medium">
                      {h.completedJobs} / {h.monthlyJobLimit}
                    </td>
                    <td className="p-3 font-bold text-emerald-700">+{h.extraJobs}</td>
                    <td className="p-3 font-black text-sm text-gray-900">₹{h.finalSalary}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          h.status === "paid"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {h.status}
                      </span>
                    </td>
                    <td className="p-3 text-gray-500">
                      {h.paidAt
                        ? new Date(h.paidAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkerSalaryPage;
