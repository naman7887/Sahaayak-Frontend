import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import API_URL from "../config/api";

function AdminDashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("pending");

  const token = localStorage.getItem("token");

  const loadDashboard = async (refresh = false) => {
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const [userResponse, workersResponse] = await Promise.all([
        fetch(`${API_URL}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),

        fetch(`${API_URL}/api/workers`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);

      const userData = await userResponse.json();
      const workersData = await workersResponse.json();

      if (!userResponse.ok) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      if (!workersResponse.ok) {
        throw new Error(
          workersData.message || "Unable to load workers."
        );
      }

      setUser(userData.user);

      setWorkers(
        workersData.workers ||
          workersData.data ||
          []
      );
    } catch (err) {
      console.error("Admin dashboard error:", err);
      setError(
        err.message || "Unable to connect to the server."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboard();

    const interval = setInterval(() => {
      loadDashboard(true);
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const updateVerification = async (workerId, status) => {
    try {
      setActionLoading(workerId);
      setError("");

      const response = await fetch(
        `${API_URL}/api/workers/${workerId}/verification`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            verificationStatus: status,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to update verification."
        );
      }

      await loadDashboard(true);
    } catch (err) {
      console.error("Verification error:", err);
      setError(
        err.message || "Unable to update worker verification."
      );
    } finally {
      setActionLoading(null);
    }
  };

  const filteredWorkers = useMemo(() => {
    return workers.filter((worker) => {
      const status =
        worker.verificationStatus || "pending";

      const matchesFilter =
        filter === "all" || status === filter;

      const text = `
        ${worker.name || ""}
        ${worker.user?.name || ""}
        ${worker.email || ""}
        ${worker.user?.email || ""}
        ${worker.occupation || ""}
        ${worker.skills?.join(" ") || ""}
      `.toLowerCase();

      return (
        matchesFilter &&
        text.includes(search.toLowerCase())
      );
    });
  }, [workers, filter, search]);

  const pendingCount = workers.filter(
    (worker) =>
      (worker.verificationStatus || "pending") === "pending"
  ).length;

  const verifiedCount = workers.filter(
    (worker) =>
      worker.verificationStatus === "verified"
  ).length;

  const rejectedCount = workers.filter(
    (worker) =>
      worker.verificationStatus === "rejected"
  ).length;

  const availableCount = workers.filter(
    (worker) => worker.availability === true
  ).length;

  const getWorkerName = (worker) =>
    worker.name ||
    worker.user?.name ||
    "Unnamed Worker";

  const getWorkerEmail = (worker) =>
    worker.email ||
    worker.user?.email ||
    "Email unavailable";

  const getStatusLabel = (status) => {
    if (status === "verified") return "Verified";
    if (status === "rejected") return "Rejected";
    return "Pending Review";
  };

  const getStatusClass = (status) => {
    if (status === "verified") return "verified";
    if (status === "rejected") return "rejected";
    return "pending";
  };

  if (loading) {
    return (
      <>
        <style>{styles}</style>

        <div className="admin-loading-page">
          <div className="admin-loading-card">
            <div className="loading-mark">S</div>
            <div>
              <strong>Loading Admin Console</strong>
              <span>Preparing Sahaayak operations...</span>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{styles}</style>

      <div className="admin-page-new">

        {/* HEADER */}

        <header className="admin-topbar">

          <div className="admin-brand">
            <div className="admin-brand-mark">
              S
            </div>

            <div>
              <strong>SAHAAYAK</strong>
              <span>ADMIN CONSOLE</span>
            </div>
          </div>

          <div className="admin-top-actions">

            <div className="admin-user">
              <div className="admin-avatar">
                {(user?.name || "A")
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div>
                <strong>
                  {user?.name || "Administrator"}
                </strong>

                <span>Platform Administrator</span>
              </div>
            </div>

            <button
              className="admin-logout"
              onClick={() => {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                navigate("/login");
              }}
            >
              Sign out
            </button>

          </div>

        </header>

        <main className="admin-main">

          {/* HERO */}

          <section className="admin-intro">

            <div>
              <span className="admin-eyebrow">
                PLATFORM OVERVIEW
              </span>

              <h1>
                Good morning,{" "}
                {user?.name?.split(" ")[0] || "Admin"}.
              </h1>

              <p>
                Manage providers, verify workers and
                keep the Sahaayak network trusted.
              </p>
            </div>

            <button
              className="admin-refresh"
              onClick={() => loadDashboard(true)}
              disabled={refreshing}
            >
              <span>↻</span>
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>

          </section>

          {/* ERROR */}

          {error && (
            <div className="admin-error">
              <span>!</span>
              {error}
            </div>
          )}

          {/* STATS */}

          <section className="admin-stats">

            <div className="admin-stat-card highlight">
              <div className="stat-top">
                <span>Pending Reviews</span>
                <div>!</div>
              </div>

              <strong>{pendingCount}</strong>

              <p>
                Workers waiting for verification
              </p>
            </div>

            <div className="admin-stat-card">
              <div className="stat-top">
                <span>Verified Workers</span>
                <div>✓</div>
              </div>

              <strong>{verifiedCount}</strong>

              <p>
                Approved service providers
              </p>
            </div>

            <div className="admin-stat-card">
              <div className="stat-top">
                <span>Available Now</span>
                <div>◉</div>
              </div>

              <strong>{availableCount}</strong>

              <p>
                Workers currently accepting jobs
              </p>
            </div>

            <div className="admin-stat-card">
              <div className="stat-top">
                <span>Rejected</span>
                <div>×</div>
              </div>

              <strong>{rejectedCount}</strong>

              <p>
                Applications not approved
              </p>
            </div>

          </section>

          {/* WORKER MANAGEMENT */}

          <section className="admin-workspace">

            <div className="workspace-header">

              <div>
                <span className="admin-eyebrow">
                  WORKER MANAGEMENT
                </span>

                <h2>
                  Provider verification
                </h2>

                <p>
                  Review worker profiles before they
                  become active on the platform.
                </p>
              </div>

              <div className="worker-count">
                {filteredWorkers.length}{" "}
                {filteredWorkers.length === 1
                  ? "worker"
                  : "workers"}
              </div>

            </div>

            {/* CONTROLS */}

            <div className="admin-controls">

              <div className="admin-search">
                <span>⌕</span>

                <input
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  placeholder="Search workers, skills or occupation..."
                />
              </div>

              <div className="filter-tabs">

                {[
                  ["pending", "Pending"],
                  ["verified", "Verified"],
                  ["rejected", "Rejected"],
                  ["all", "All Workers"],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    className={
                      filter === value
                        ? "active"
                        : ""
                    }
                    onClick={() =>
                      setFilter(value)
                    }
                  >
                    {label}

                    {value !== "all" && (
                      <span>
                        {value === "pending"
                          ? pendingCount
                          : value === "verified"
                          ? verifiedCount
                          : rejectedCount}
                      </span>
                    )}
                  </button>
                ))}

              </div>

            </div>

            {/* WORKERS */}

            {filteredWorkers.length === 0 ? (

              <div className="admin-empty">

                <div className="empty-icon">
                  ✓
                </div>

                <h3>
                  No workers found
                </h3>

                <p>
                  {search
                    ? "Try a different search term."
                    : filter === "pending"
                    ? "There are no workers waiting for verification."
                    : "No workers match this filter."}
                </p>

              </div>

            ) : (

              <div className="admin-workers">

                {filteredWorkers.map((worker) => {

                  const status =
                    worker.verificationStatus ||
                    "pending";

                  const name =
                    getWorkerName(worker);

                  const initials = name
                    .split(" ")
                    .map((word) => word[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase();

                  return (
                    <article
                      className="admin-worker"
                      key={worker._id}
                    >

                      <div className="worker-main">

                        <div className="worker-avatar">
                          {initials}
                        </div>

                        <div className="worker-identity">

                          <div className="worker-name-row">

                            <h3>{name}</h3>

                            <span
                              className={`worker-status ${getStatusClass(
                                status
                              )}`}
                            >
                              <i></i>
                              {getStatusLabel(status)}
                            </span>

                          </div>

                          <p>
                            {getWorkerEmail(worker)}
                          </p>

                          <div className="worker-meta">

                            <span>
                              ◈{" "}
                              {worker.occupation ||
                                "Service Provider"}
                            </span>

                            <span>
                              ★{" "}
                              {Number(
                                worker.rating || 0
                              ).toFixed(1)}
                            </span>

                            <span>
                              {worker.totalJobs || 0} jobs
                            </span>

                            <span>
                              {worker.experience || 0} yrs
                              experience
                            </span>

                          </div>

                        </div>

                      </div>

                      <div className="worker-details">

                        <div className="detail-block">
                          <span>SKILLS</span>

                          <div className="skill-list">

                            {(worker.skills || [])
                              .slice(0, 3)
                              .map((skill) => (
                                <span key={skill}>
                                  {skill}
                                </span>
                              ))}

                            {(!worker.skills ||
                              worker.skills.length === 0) && (
                              <span>
                                No skills listed
                              </span>
                            )}

                          </div>
                        </div>

                        <div className="detail-block">
                          <span>LOCATION</span>

                          <strong>
                            {worker.location?.coordinates
                              ? "Location available"
                              : "Not provided"}
                          </strong>
                        </div>

                        <div className="detail-block">
                          <span>AVAILABILITY</span>

                          <strong
                            className={
                              worker.availability
                                ? "available-text"
                                : "offline-text"
                            }
                          >
                            {worker.availability
                              ? "Available"
                              : "Offline"}
                          </strong>
                        </div>

                      </div>

                      <div className="worker-actions">

                        {status === "pending" && (
                          <>
                            <button
                              className="reject-btn"
                              disabled={
                                actionLoading ===
                                worker._id
                              }
                              onClick={() =>
                                updateVerification(
                                  worker._id,
                                  "rejected"
                                )
                              }
                            >
                              Reject
                            </button>

                            <button
                              className="approve-btn"
                              disabled={
                                actionLoading ===
                                worker._id
                              }
                              onClick={() =>
                                updateVerification(
                                  worker._id,
                                  "verified"
                                )
                              }
                            >
                              {actionLoading ===
                              worker._id
                                ? "Updating..."
                                : "Approve Worker →"}
                            </button>
                          </>
                        )}

                        {status === "verified" && (
                          <button
                            className="review-btn"
                            onClick={() =>
                              updateVerification(
                                worker._id,
                                "rejected"
                              )
                            }
                            disabled={
                              actionLoading ===
                              worker._id
                            }
                          >
                            Revoke Verification
                          </button>
                        )}

                        {status === "rejected" && (
                          <button
                            className="approve-btn"
                            onClick={() =>
                              updateVerification(
                                worker._id,
                                "verified"
                              )
                            }
                            disabled={
                              actionLoading ===
                              worker._id
                            }
                          >
                            Verify Worker →
                          </button>
                        )}

                      </div>

                    </article>
                  );
                })}

              </div>
            )}

          </section>

          {/* PLATFORM NOTE */}

          <section className="admin-note">

            <div className="note-symbol">
              S
            </div>

            <div>
              <span>SAHAAYAK OPERATIONS</span>

              <h3>
                A trusted network starts with verified people.
              </h3>

              <p>
                Keep worker information accurate and
                verification decisions consistent to
                maintain reliable local services.
              </p>
            </div>

          </section>

        </main>

        <footer className="admin-footer">
          <span>SAHAAYAK</span>
          <p>
            Cooperative local services platform
          </p>
        </footer>

      </div>
    </>
  );
}

const styles = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@500;600;700&display=swap');

.admin-page-new {
  min-height: calc(100vh - 72px);
  background: #ffffe3;
  color: #4a4a4a;
  font-family: 'Inter', sans-serif;
}

.admin-page-new * {
  box-sizing: border-box;
}

.admin-topbar {
  height: 78px;
  padding: 0 6%;
  background: rgba(255,255,255,.9);
  border-bottom: 1px solid #e7e7dc;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.admin-brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.admin-brand-mark {
  width: 38px;
  height: 38px;
  border-radius: 11px;
  background: #6d8196;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Poppins', sans-serif;
  font-weight: 700;
}

.admin-brand strong {
  display: block;
  color: #4a4a4a;
  font-family: 'Poppins', sans-serif;
  letter-spacing: 1.5px;
  font-size: 14px;
}

.admin-brand span {
  display: block;
  margin-top: 2px;
  color: #999990;
  font-size: 8px;
  letter-spacing: 1.5px;
  font-weight: 700;
}

.admin-top-actions {
  display: flex;
  align-items: center;
  gap: 22px;
}

.admin-user {
  display: flex;
  align-items: center;
  gap: 10px;
}

.admin-avatar {
  width: 35px;
  height: 35px;
  border-radius: 50%;
  background: #e5e9eb;
  color: #64798c;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 12px;
}

.admin-user strong {
  display: block;
  font-size: 11px;
  color: #555b5c;
}

.admin-user span {
  display: block;
  margin-top: 2px;
  font-size: 9px;
  color: #9a9a92;
}

.admin-logout {
  border: 1px solid #deded3;
  background: white;
  border-radius: 9px;
  padding: 9px 14px;
  color: #6f7473;
  font-size: 10px;
  font-weight: 700;
  cursor: pointer;
}

.admin-main {
  max-width: 1220px;
  margin: auto;
  padding: 48px 25px 60px;
}

.admin-intro {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 30px;
}

.admin-eyebrow {
  display: block;
  color: #6d8196;
  font-size: 9px;
  letter-spacing: 1.7px;
  font-weight: 700;
}

.admin-intro h1 {
  margin: 8px 0 8px;
  font-family: 'Poppins', sans-serif;
  color: #40474b;
  font-size: 31px;
}

.admin-intro p {
  margin: 0;
  color: #8c8d87;
  font-size: 12px;
}

.admin-refresh {
  border: 1px solid #dcdcd1;
  background: white;
  border-radius: 10px;
  padding: 11px 16px;
  color: #64798c;
  font-weight: 700;
  font-size: 11px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
}

.admin-refresh span {
  font-size: 17px;
}

.admin-refresh:disabled {
  opacity: .55;
}

.admin-error {
  margin-bottom: 22px;
  padding: 12px 15px;
  background: #f3ebe8;
  border: 1px solid #eadbd6;
  color: #806860;
  border-radius: 11px;
  font-size: 11px;
  display: flex;
  align-items: center;
  gap: 9px;
}

.admin-error span {
  width: 19px;
  height: 19px;
  border-radius: 50%;
  background: #806860;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
}

.admin-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  margin-bottom: 30px;
}

.admin-stat-card {
  background: white;
  border: 1px solid #e5e5da;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 8px 25px rgba(74,74,74,.045);
}

.admin-stat-card.highlight {
  background: #6d8196;
  border-color: #6d8196;
  color: white;
}

.stat-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-top > span {
  color: #8c8e89;
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .7px;
}

.highlight .stat-top > span {
  color: #dfe5e3;
}

.stat-top > div {
  width: 25px;
  height: 25px;
  border-radius: 8px;
  background: #eef0ed;
  color: #6d8196;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
}

.highlight .stat-top > div {
  background: rgba(255,255,255,.14);
  color: white;
}

.admin-stat-card > strong {
  display: block;
  margin-top: 16px;
  color: #42494d;
  font-family: 'Poppins', sans-serif;
  font-size: 28px;
}

.highlight > strong {
  color: white;
}

.admin-stat-card > p {
  margin: 3px 0 0;
  color: #a0a098;
  font-size: 9px;
}

.highlight > p {
  color: #dce2df;
}

.admin-workspace {
  background: white;
  border: 1px solid #e3e3d8;
  border-radius: 20px;
  padding: 28px;
  box-shadow: 0 10px 30px rgba(74,74,74,.05);
}

.workspace-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 23px;
}

.workspace-header h2 {
  font-family: 'Poppins', sans-serif;
  font-size: 22px;
  color: #454b4f;
  margin: 6px 0 5px;
}

.workspace-header p {
  margin: 0;
  color: #94948d;
  font-size: 11px;
}

.worker-count {
  color: #6d8196;
  background: #f0f2f0;
  border-radius: 20px;
  padding: 8px 12px;
  font-size: 9px;
  font-weight: 700;
}

.admin-controls {
  padding: 14px;
  background: #fafaf5;
  border: 1px solid #e8e8de;
  border-radius: 13px;
  display: flex;
  justify-content: space-between;
  gap: 15px;
  margin-bottom: 18px;
}

.admin-search {
  min-width: 280px;
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  background: white;
  border: 1px solid #deded4;
  border-radius: 9px;
  padding: 0 11px;
}

.admin-search span {
  color: #8e989e;
  font-size: 20px;
}

.admin-search input {
  width: 100%;
  border: none;
  outline: none;
  background: transparent;
  padding: 11px 4px;
  color: #555b5d;
  font-family: inherit;
  font-size: 10px;
}

.filter-tabs {
  display: flex;
  gap: 5px;
  align-items: center;
}

.filter-tabs button {
  border: none;
  background: transparent;
  color: #90918b;
  border-radius: 8px;
  padding: 9px 10px;
  font-size: 9px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
}

.filter-tabs button.active {
  background: #6d8196;
  color: white;
}

.filter-tabs button span {
  margin-left: 5px;
  opacity: .7;
}

.admin-workers {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.admin-worker {
  border: 1px solid #e6e6dc;
  border-radius: 15px;
  padding: 17px;
  transition: .2s;
}

.admin-worker:hover {
  border-color: #c7d0d5;
  box-shadow: 0 7px 22px rgba(74,74,74,.055);
}

.worker-main {
  display: flex;
  align-items: center;
  gap: 13px;
}

.worker-avatar {
  width: 46px;
  height: 46px;
  flex-shrink: 0;
  border-radius: 14px;
  background: #edf0ef;
  color: #6d8196;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Poppins', sans-serif;
  font-size: 12px;
  font-weight: 700;
}

.worker-identity {
  flex: 1;
}

.worker-name-row {
  display: flex;
  align-items: center;
  gap: 9px;
}

.worker-name-row h3 {
  margin: 0;
  color: #484e51;
  font-family: 'Poppins', sans-serif;
  font-size: 13px;
}

.worker-identity > p {
  margin: 3px 0 8px;
  color: #999a93;
  font-size: 9px;
}

.worker-status {
  padding: 4px 7px;
  border-radius: 20px;
  font-size: 8px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 4px;
}

.worker-status i {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  display: block;
}

.worker-status.pending {
  background: #f3eee3;
  color: #887658;
}

.worker-status.pending i {
  background: #a68d63;
}

.worker-status.verified {
  background: #e9eee9;
  color: #647762;
}

.worker-status.verified i {
  background: #6d806b;
}

.worker-status.rejected {
  background: #f3e9e6;
  color: #806860;
}

.worker-status.rejected i {
  background: #806860;
}

.worker-meta {
  display: flex;
  gap: 13px;
  flex-wrap: wrap;
}

.worker-meta span {
  color: #8c8d87;
  font-size: 9px;
}

.worker-details {
  margin: 16px 0;
  padding: 13px;
  background: #fafaf5;
  border-radius: 10px;
  display: grid;
  grid-template-columns: 1.5fr 1fr 1fr;
  gap: 15px;
}

.detail-block > span {
  display: block;
  color: #a0a098;
  font-size: 7px;
  letter-spacing: 1px;
  font-weight: 700;
  margin-bottom: 6px;
}

.detail-block > strong {
  color: #666b6b;
  font-size: 9px;
  font-weight: 600;
}

.skill-list {
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
}

.skill-list span {
  background: #edf0ef;
  color: #687b8c;
  border-radius: 6px;
  padding: 4px 6px;
  font-size: 8px;
}

.available-text {
  color: #6d806b !important;
}

.offline-text {
  color: #999a93 !important;
}

.worker-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.worker-actions button {
  border-radius: 8px;
  padding: 9px 13px;
  font-size: 9px;
  font-weight: 700;
  cursor: pointer;
}

.reject-btn {
  border: 1px solid #ded2ce;
  background: white;
  color: #806860;
}

.approve-btn {
  border: 1px solid #6d8196;
  background: #6d8196;
  color: white;
}

.review-btn {
  border: 1px solid #d7d7ce;
  background: white;
  color: #767a78;
}

.worker-actions button:disabled {
  opacity: .55;
  cursor: wait;
}

.admin-empty {
  padding: 55px 20px;
  text-align: center;
  border: 1px dashed #dcdcd2;
  border-radius: 14px;
}

.empty-icon {
  width: 48px;
  height: 48px;
  margin: auto;
  border-radius: 15px;
  background: #edf0ed;
  color: #6d806b;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.admin-empty h3 {
  font-family: 'Poppins', sans-serif;
  color: #555b5d;
  font-size: 15px;
  margin: 13px 0 5px;
}

.admin-empty p {
  color: #999a93;
  font-size: 10px;
  margin: 0;
}

.admin-note {
  margin-top: 25px;
  padding: 22px 25px;
  border: 1px solid #e0e0d5;
  border-radius: 17px;
  background: #f8f8ef;
  display: flex;
  gap: 16px;
  align-items: center;
}

.note-symbol {
  width: 42px;
  height: 42px;
  flex-shrink: 0;
  border-radius: 13px;
  background: #6d8196;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Poppins', sans-serif;
  font-weight: 700;
}

.admin-note span {
  color: #6d8196;
  font-size: 8px;
  letter-spacing: 1.3px;
  font-weight: 700;
}

.admin-note h3 {
  color: #555b5d;
  font-family: 'Poppins', sans-serif;
  font-size: 13px;
  margin: 4px 0;
}

.admin-note p {
  color: #96978f;
  font-size: 9px;
  margin: 0;
}

.admin-footer {
  padding: 25px 6%;
  border-top: 1px solid #e7e7dc;
  display: flex;
  justify-content: space-between;
  color: #9a9a92;
  font-size: 9px;
}

.admin-footer span {
  color: #6d8196;
  font-family: 'Poppins', sans-serif;
  font-weight: 700;
  letter-spacing: 1.5px;
}

.admin-footer p {
  margin: 0;
}

.admin-loading-page {
  min-height: calc(100vh - 72px);
  background: #ffffe3;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Inter', sans-serif;
}

.admin-loading-card {
  display: flex;
  align-items: center;
  gap: 13px;
  background: white;
  border: 1px solid #e3e3d8;
  padding: 18px 22px;
  border-radius: 15px;
}

.loading-mark {
  width: 38px;
  height: 38px;
  background: #6d8196;
  color: white;
  border-radius: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Poppins', sans-serif;
  font-weight: 700;
}

.admin-loading-card strong {
  display: block;
  color: #555b5d;
  font-size: 11px;
}

.admin-loading-card span {
  display: block;
  margin-top: 3px;
  color: #999a93;
  font-size: 9px;
}

@media (max-width: 950px) {
  .admin-stats {
    grid-template-columns: repeat(2, 1fr);
  }

  .admin-controls {
    flex-direction: column;
  }

  .filter-tabs {
    overflow-x: auto;
  }
}

@media (max-width: 700px) {
  .admin-topbar {
    padding: 0 20px;
  }

  .admin-user {
    display: none;
  }

  .admin-intro {
    align-items: flex-start;
    flex-direction: column;
    gap: 18px;
  }

  .admin-stats {
    grid-template-columns: 1fr;
  }

  .workspace-header {
    align-items: flex-start;
    flex-direction: column;
    gap: 12px;
  }

  .worker-details {
    grid-template-columns: 1fr;
  }

  .worker-actions {
    justify-content: stretch;
  }

  .worker-actions button {
    flex: 1;
  }

  .admin-main {
    padding: 35px 15px;
  }

  .admin-workspace {
    padding: 18px;
  }

  .admin-footer {
    padding: 20px;
  }
}
`;

export default AdminDashboard;