import { useState, useEffect } from "react";
import schemeService from "../../services/schemeService";
import welfareService from "../../services/welfareService";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import EmptyState from "../../components/common/EmptyState";
import {
  Sparkles,
  Gift,
  Search,
  ExternalLink,
  FileCheck,
  Building2,
  CheckCircle2,
} from "lucide-react";

export const SchemesPage = () => {
  const [schemes, setSchemes] = useState([]);
  const [welfareList, setWelfareList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [schemeRes, welfareRes] = await Promise.allSettled([
          schemeService.getAllSchemes(),
          welfareService.getAllWelfare(),
        ]);

        if (schemeRes.status === "fulfilled" && schemeRes.value?.schemes) {
          setSchemes(schemeRes.value.schemes);
        }
        if (welfareRes.status === "fulfilled" && welfareRes.value?.welfareSchemes) {
          setWelfareList(welfareRes.value.welfareSchemes);
        }
      } catch (err) {
        console.error("Schemes fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Combine or filter
  const allItems = [
    ...schemes.map((s) => ({ ...s, typeTag: "Smart Scheme" })),
    ...welfareList.map((w) => ({ ...w, typeTag: "Welfare Scheme" })),
  ];

  const filteredItems = allItems.filter((item) => {
    const title = item.title || "";
    const description = item.description || "";
    const category = item.category || "";
    const matchesSearch =
      title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeTab === "smart") return matchesSearch && item.typeTag === "Smart Scheme";
    if (activeTab === "welfare") return matchesSearch && item.typeTag === "Welfare Scheme";
    return matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-blue-100 text-blue-800">
          Social Security & Government Entitlements
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
          Cooperative Worker Welfare Schemes
        </h1>
        <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
          Explore verified central, state, and cooperative welfare benefits designed to provide social protection, healthcare, and pension to gig artisans.
        </p>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 sm:p-6 rounded-3xl border border-gray-100 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search schemes or benefits..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
          />
        </div>

        {/* Tab pills */}
        <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-xl w-full sm:w-auto">
          <button
            onClick={() => setActiveTab("all")}
            className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === "all" ? "bg-white text-gray-900 shadow-xs" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            All Entitlements ({allItems.length})
          </button>
          <button
            onClick={() => setActiveTab("smart")}
            className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === "smart" ? "bg-white text-gray-900 shadow-xs" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Smart Schemes ({schemes.length})
          </button>
          <button
            onClick={() => setActiveTab("welfare")}
            className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === "welfare" ? "bg-white text-gray-900 shadow-xs" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Welfare ({welfareList.length})
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="py-20">
          <LoadingSpinner text="Fetching government welfare databases..." />
        </div>
      ) : filteredItems.length === 0 ? (
        <EmptyState
          icon={Gift}
          title="No schemes found"
          description="There are currently no welfare schemes matching your search criteria."
          actionText="Reset Search"
          onAction={() => setSearchQuery("")}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item._id}
              className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs hover:shadow-md transition flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800">
                    {item.category || "General Welfare"}
                  </span>
                  <span className="text-[11px] font-semibold text-gray-500">
                    Provider: {item.provider || "Government"}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-gray-900">{item.title}</h3>

                <p className="text-sm text-gray-600 leading-relaxed">{item.description}</p>

                {/* Benefits */}
                {item.benefits && (
                  <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 space-y-1">
                    <span className="text-xs font-bold text-gray-700">Benefits:</span>
                    <p className="text-xs text-gray-600 leading-relaxed">{item.benefits}</p>
                  </div>
                )}

                {/* Eligibility */}
                {item.eligibility && (
                  <div className="text-xs text-gray-500 flex items-start gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-gray-700">Eligibility:</strong> {item.eligibility}
                    </span>
                  </div>
                )}

                {/* Documents */}
                {Array.isArray(item.requiredDocuments) && item.requiredDocuments.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-xs text-gray-400 mr-1">Required:</span>
                    {item.requiredDocuments.map((doc, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 text-[11px] font-medium"
                      >
                        {doc}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Action */}
              <div className="pt-5 mt-5 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-700">
                  Cooperative Assistance Desk Available
                </span>
                {item.applicationUrl ? (
                  <a
                    href={item.applicationUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gray-900 hover:bg-black text-white text-xs font-bold transition"
                  >
                    <span>Apply Official Portal</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                ) : (
                  <span className="text-xs text-gray-400">Apply via Local Cooperative Desk</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SchemesPage;
