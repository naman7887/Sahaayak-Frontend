import { useState, useEffect } from "react";
import trainingService from "../../services/trainingService";
import { useToast } from "../../context/ToastContext";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import EmptyState from "../../components/common/EmptyState";
import Modal from "../../components/common/Modal";
import {
  GraduationCap,
  Award,
  Clock,
  CheckCircle2,
  ExternalLink,
  PlusCircle,
  Loader2,
  Upload,
} from "lucide-react";

export const WorkerTrainingPage = () => {
  const [catalog, setCatalog] = useState([]);
  const [myEnrollments, setMyEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("catalog"); // 'catalog' or 'my'
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Status update modal
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);
  const [certUrl, setCertUrl] = useState("");
  const [newStatus, setNewStatus] = useState("completed");
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const { showSuccess, showError } = useToast();

  const fetchTrainingData = async () => {
    try {
      setLoading(true);
      const [catRes, myRes] = await Promise.allSettled([
        trainingService.getTrainingPrograms(),
        trainingService.getMyTrainings(),
      ]);

      if (catRes.status === "fulfilled" && catRes.value?.trainingPrograms) {
        setCatalog(catRes.value.trainingPrograms);
      }
      if (myRes.status === "fulfilled" && myRes.value?.enrollments) {
        setMyEnrollments(myRes.value.enrollments);
      }
    } catch (err) {
      showError("Failed to fetch training programs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainingData();
  }, []);

  const handleEnroll = async (programId) => {
    setActionLoadingId(programId);
    try {
      const res = await trainingService.enrollInTraining(programId);
      showSuccess(res.message || "Enrolled successfully! Upskilling helps increase your base tier.");
      fetchTrainingData();
      setActiveTab("my");
    } catch (err) {
      showError(err.message || "Failed to enroll in training.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleUpdateStatusSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEnrollment) return;

    setUpdatingStatus(true);
    try {
      const res = await trainingService.updateMyTrainingStatus(selectedEnrollment._id, {
        status: newStatus,
        certificateUrl: certUrl || selectedEnrollment.certificateUrl || "https://sahaayak.gov.in/certs/verified.pdf",
      });

      showSuccess(res.message || "Training status and certificate recorded! Skills synced to profile.");
      setSelectedEnrollment(null);
      fetchTrainingData();
    } catch (err) {
      showError(err.message || "Failed to update training status.");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const isEnrolled = (programId) => {
    return myEnrollments.some((e) => e.trainingProgram?._id === programId && e.status !== "cancelled");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
            Cooperative Skill Academy
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-900">
            Skills & Certifications
          </span>
        </div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">
          Artisan Upskilling & Certification Programs
        </h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Free skill training programs funded by cooperative development funds. Certified skills sync directly to your profile.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-gray-100 shadow-2xs">
        <button
          onClick={() => setActiveTab("catalog")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === "catalog"
              ? "bg-emerald-700 text-white shadow-xs"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          }`}
        >
          Available Courses ({catalog.length})
        </button>
        <button
          onClick={() => setActiveTab("my")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === "my"
              ? "bg-emerald-700 text-white shadow-xs"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          }`}
        >
          <span>My Enrolled Programs</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              activeTab === "my" ? "bg-emerald-800 text-white" : "bg-gray-200 text-gray-700"
            }`}
          >
            {myEnrollments.length}
          </span>
        </button>
      </div>

      {loading ? (
        <div className="py-20">
          <LoadingSpinner text="Fetching training curriculum..." />
        </div>
      ) : activeTab === "catalog" ? (
        /* Catalog View */
        catalog.length === 0 ? (
          <EmptyState
            icon={GraduationCap}
            title="No training programs available"
            description="Upcoming upskilling batches will be announced soon by the cooperative federation."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {catalog.map((prog) => {
              const alreadyEnrolled = isEnrolled(prog._id);
              const isActionLoading = actionLoadingId === prog._id;

              return (
                <div
                  key={prog._id}
                  className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs hover:shadow-md transition flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-purple-50 text-purple-800">
                        {prog.provider || "Cooperative Training Center"}
                      </span>
                      {prog.isFree && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-100 text-emerald-800">
                          100% Free / Subsidized
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{prog.title}</h3>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {prog.description || "Upskilling module focused on safety, compliance, and tools."}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100 text-xs">
                      <div>
                        <span className="text-gray-400 block text-[10px] uppercase font-bold">Duration</span>
                        <span className="font-bold text-gray-800">{prog.duration || "4 Weeks"}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[10px] uppercase font-bold">Certification</span>
                        <span className="font-bold text-emerald-800">{prog.certification || "Official Certificate"}</span>
                      </div>
                    </div>

                    {/* Skills list */}
                    {Array.isArray(prog.skills) && prog.skills.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-[11px] font-bold text-gray-700">Skills Acquired:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {prog.skills.map((s, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 text-[11px] font-medium"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Enroll button */}
                  <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-[11px] text-gray-400">
                      {prog.eligibility ? `Eligibility: ${prog.eligibility}` : "All verified workers"}
                    </span>

                    {alreadyEnrolled ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Enrolled</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        disabled={isActionLoading}
                        onClick={() => handleEnroll(prog._id)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:bg-emerald-400 text-white text-xs font-bold shadow-xs transition cursor-pointer"
                      >
                        {isActionLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                        <span>Enroll Now</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        /* My Enrollments View */
        myEnrollments.length === 0 ? (
          <EmptyState
            icon={GraduationCap}
            title="No training enrollments yet"
            description="Browse the course catalog and enroll in certification modules to boost your artisan ranking."
            actionText="Browse Courses"
            onAction={() => setActiveTab("catalog")}
          />
        ) : (
          <div className="space-y-4">
            {myEnrollments.map((enr) => (
              <div
                key={enr._id}
                className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-gray-900">
                      {enr.trainingProgram?.title || "Cooperative Training Course"}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        enr.status === "completed"
                          ? "bg-emerald-100 text-emerald-800"
                          : enr.status === "in-progress"
                          ? "bg-indigo-100 text-indigo-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {enr.status}
                    </span>
                  </div>

                  <div className="text-xs text-gray-500 flex flex-wrap items-center gap-3">
                    <span>Provider: {enr.trainingProgram?.provider}</span>
                    <span>•</span>
                    <span>Duration: {enr.trainingProgram?.duration}</span>
                    <span>•</span>
                    <span>Enrolled: {new Date(enr.enrolledAt).toLocaleDateString("en-IN")}</span>
                  </div>

                  {enr.certificateUrl && (
                    <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold pt-1">
                      <Award className="w-4 h-4" />
                      <a
                        href={enr.certificateUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="underline hover:text-emerald-900"
                      >
                        View Official Skill Certificate
                      </a>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedEnrollment(enr);
                      setNewStatus(enr.status || "completed");
                      setCertUrl(enr.certificateUrl || "");
                    }}
                    className="px-3.5 py-1.5 rounded-xl border border-emerald-300 text-emerald-800 hover:bg-emerald-50 text-xs font-bold transition cursor-pointer"
                  >
                    Update Status & Certificate
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Update Enrollment Status Modal */}
      <Modal
        isOpen={!!selectedEnrollment}
        onClose={() => setSelectedEnrollment(null)}
        title="Update Training & Certificate Status"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleUpdateStatusSubmit} className="space-y-4">
          <div className="p-3 bg-gray-50 rounded-xl text-xs space-y-1">
            <span className="text-gray-400 uppercase font-bold block">Course Name</span>
            <div className="font-bold text-gray-900">
              {selectedEnrollment?.trainingProgram?.title}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
              Enrollment Status
            </label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-gray-200 text-xs bg-white font-medium"
            >
              <option value="enrolled">Enrolled</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed (Adds skills to profile)</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
              Certificate URL / Document Link
            </label>
            <input
              type="url"
              value={certUrl}
              onChange={(e) => setCertUrl(e.target.value)}
              placeholder="https://example.com/certificate.pdf"
              className="w-full p-2.5 rounded-xl border border-gray-200 text-xs"
            />
            <p className="text-[10px] text-gray-400 mt-1">
              Provide link to your completion certificate (synced with profile).
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setSelectedEnrollment(null)}
              className="px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updatingStatus}
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 disabled:bg-emerald-400 rounded-xl shadow-sm transition flex items-center gap-2"
            >
              {updatingStatus && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>Save Status</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default WorkerTrainingPage;
