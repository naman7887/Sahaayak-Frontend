import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import API_URL from "../config/api";

function WorkerDashboard() {
  const [worker, setWorker] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  const loadWorkerDashboard = async () => {
    try {
      setError("");

      const [profileRes, bookingsRes] = await Promise.all([
        fetch(`${API_URL}/api/workers/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        fetch(`${API_URL}/api/bookings/worker`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);

      if (!profileRes.ok || !bookingsRes.ok) {
        throw new Error("Unable to load dashboard");
      }

      const profileData = await profileRes.json();
      const bookingsData = await bookingsRes.json();

      setWorker(
        profileData.worker ||
          profileData.profile ||
          profileData.data ||
          null
      );

      setBookings(
        bookingsData.bookings ||
          bookingsData.data ||
          []
      );
    } catch (err) {
      console.error(err);
      setError("Unable to load your dashboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkerDashboard();

    const interval = setInterval(() => {
      loadWorkerDashboard();
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const updateBooking = async (bookingId, action, status = null) => {
    try {
      setActionLoading(bookingId);
      setError("");

      let url = "";
      let method = "PATCH";

      if (action === "accept") {
        url = `${API_URL}/api/bookings/${bookingId}/accept`;
      }

      if (action === "reject") {
        url = `${API_URL}/api/bookings/${bookingId}/reject`;
      }

      if (action === "status") {
        url = `${API_URL}/api/bookings/${bookingId}/status`;
      }

      const options = {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      };

      if (status) {
        options.body = JSON.stringify({ status });
      }

      const response = await fetch(url, options);

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "Action failed");
      }

      await loadWorkerDashboard();
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong.");
    } finally {
      setActionLoading("");
    }
  };

  const completedBookings = useMemo(() => {
    const now = new Date();

    return bookings.filter((booking) => {
      if (booking.status !== "completed") return false;

      const date = new Date(booking.scheduledDate);

      return (
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
      );
    });
  }, [bookings]);

  const activeBookings = useMemo(
    () =>
      bookings.filter(
        (booking) =>
          booking.status === "accepted" ||
          booking.status === "in_progress"
      ),
    [bookings]
  );

  const pendingBookings = useMemo(
    () => bookings.filter((booking) => booking.status === "pending"),
    [bookings]
  );

  const totalEarnings = completedBookings.reduce(
    (total, booking) => total + Number(booking.price || 0),
    0
  );

  const salaryObject =
    worker?.salary ||
    worker?.salaryDetails ||
    worker?.earnings ||
    {};

  const monthlyJobLimit =
    Number(
      salaryObject.monthlyJobLimit ??
        worker?.monthlyJobLimit ??
        worker?.jobLimit
    ) || null;

  const salaryCap =
    salaryObject.salaryCap ??
    salaryObject.monthlySalaryCap ??
    worker?.salaryCap ??
    worker?.monthlySalaryCap ??
    null;

  const backendFinalSalary =
    salaryObject.finalSalary ??
    worker?.finalSalary ??
    salaryObject.currentSalary ??
    worker?.currentSalary ??
    null;

  const backendExtraJobs =
    salaryObject.extraJobs ??
    worker?.extraJobs ??
    null;

  const currentSalary =
    backendFinalSalary !== null &&
    backendFinalSalary !== undefined
      ? Number(backendFinalSalary)
      : totalEarnings;

  const monthlyJobsDone = completedBookings.length;

  const extraJobs =
    backendExtraJobs !== null &&
    backendExtraJobs !== undefined
      ? Number(backendExtraJobs)
      : monthlyJobLimit
      ? Math.max(monthlyJobsDone - monthlyJobLimit, 0)
      : null;

  const salaryProgress =
    monthlyJobLimit && monthlyJobLimit > 0
      ? Math.min((monthlyJobsDone / monthlyJobLimit) * 100, 100)
      : 0;

  const rating =
    worker?.rating ??
    worker?.averageRating ??
    worker?.user?.rating ??
    null;

  const hasLocation =
    worker?.location &&
    Array.isArray(worker.location.coordinates) &&
    worker.location.coordinates.length === 2;

  const hasService = Boolean(worker?.occupation);

  const hasSkills =
    Array.isArray(worker?.skills) &&
    worker.skills.length > 0;

  const profileCompleted =
    hasService && hasSkills && hasLocation;

  const formatDate = (dateString) => {
    if (!dateString) return "Date not available";

    const date = new Date(dateString);

    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return "";

    const date = new Date(dateString);

    return date.toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const getCustomerName = (booking) => {
    if (booking.customer?.name) return booking.customer.name;
    if (booking.customer?.user?.name) return booking.customer.user.name;
    return "Customer";
  };

  const getServiceName = (booking) => {
    if (booking.service?.name) return booking.service.name;
    return "Service Request";
  };

  const getAddress = (booking) => {
    if (booking.address) return booking.address;
    return "Location provided by customer";
  };

  const getStatusLabel = (status) => {
    if (status === "pending") return "Pending";
    if (status === "accepted") return "Accepted";
    if (status === "in_progress") return "In Progress";
    if (status === "completed") return "Completed";
    if (status === "rejected") return "Rejected";
    if (status === "cancelled") return "Cancelled";
    return status || "Unknown";
  };

  const getNextStatus = (status) => {
    if (status === "accepted") return "in_progress";
    if (status === "in_progress") return "completed";
    return null;
  };

  if (loading) {
    return (
      <>
        <style>{styles}</style>

        <main className="modern-worker-page">
          <div className="worker-loading">
            <div className="worker-loader"></div>
            <p>Loading your dashboard...</p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <style>{styles}</style>

      <main className="modern-worker-page">

        {/* HEADER */}
        <header className="worker-topbar">
          <div>
            <p className="worker-eyebrow">WORKER DASHBOARD</p>

            <h1>
              Good morning
              {worker?.user?.name || worker?.name
                ? `, ${worker?.user?.name || worker?.name}`
                : ""}
              .
            </h1>

            <p className="worker-subtitle">
              Here's what's happening with your work today.
            </p>
          </div>

          <div
            className={`availability-pill ${
              worker?.availability ? "available" : "offline"
            }`}
          >
            <span></span>
            {worker?.availability ? "Available for work" : "Currently offline"}
          </div>
        </header>

        {error && (
          <div className="worker-error">
            {error}
          </div>
        )}

        {/* SUMMARY CARDS */}
        <section className="worker-summary-grid">

          <div className="worker-stat-card primary-stat">
            <div className="stat-top">
              <span>ACTIVE JOBS</span>
              <span className="stat-symbol">↗</span>
            </div>

            <strong>{activeBookings.length}</strong>

            <p>
              {activeBookings.length === 1
                ? "Job currently in progress"
                : "Jobs currently in progress"}
            </p>
          </div>

          <div className="worker-stat-card">
            <div className="stat-top">
              <span>MONTHLY JOBS DONE</span>
              <span className="stat-symbol">✓</span>
            </div>

            <strong>{monthlyJobsDone}</strong>

            <p>
              Completed this month
            </p>
          </div>

          <div className="worker-stat-card">
            <div className="stat-top">
              <span>RATING</span>
              <span className="stat-symbol">★</span>
            </div>

            <strong>
              {rating !== null && rating !== undefined
                ? Number(rating).toFixed(1)
                : "—"}
            </strong>

            <p>
              Based on customer feedback
            </p>
          </div>

          <div className="worker-stat-card">
            <div className="stat-top">
              <span>MONTHLY EARNINGS</span>
              <span className="stat-symbol">₹</span>
            </div>

            <strong>
              ₹{totalEarnings.toLocaleString("en-IN")}
            </strong>

            <p>
              From completed services
            </p>
          </div>

        </section>

        {/* SALARY + PROFILE */}
        <section className="worker-middle-grid">

          {/* SALARY CAP */}
          <div className="salary-cap-card">

            <div className="salary-heading">
              <div>
                <p className="section-label">SALARY CAP</p>
                <h2>Monthly earnings overview</h2>
              </div>

              <div className="salary-icon">
                ₹
              </div>
            </div>

            <div className="salary-main">

              <div>
                <span className="salary-small-label">
                  CURRENT ESTIMATED SALARY
                </span>

                <strong className="salary-value">
                  ₹{currentSalary.toLocaleString("en-IN")}
                </strong>
              </div>

              <div className="salary-cap-value">
                <span>Salary Cap</span>

                <strong>
                  {salaryCap !== null &&
                  salaryCap !== undefined
                    ? `₹${Number(salaryCap).toLocaleString(
                        "en-IN"
                      )}`
                    : "Configured by Sahaayak"}
                </strong>
              </div>

            </div>

            <div className="salary-progress-area">

              <div className="salary-progress-header">
                <span>Monthly Jobs Done</span>

                <strong>
                  {monthlyJobLimit
                    ? `${monthlyJobsDone} / ${monthlyJobLimit}`
                    : `${monthlyJobsDone}`}
                </strong>
              </div>

              <div className="salary-progress">
                <div
                  style={{
                    width: `${salaryProgress}%`,
                  }}
                ></div>
              </div>

              <div className="salary-bottom">

                <span>
                  {monthlyJobLimit
                    ? `${Math.round(
                        salaryProgress
                      )}% of monthly jobs done`
                    : "Monthly job target configured by Sahaayak"}
                </span>

                {extraJobs !== null &&
                  extraJobs > 0 && (
                    <span className="extra-jobs">
                      +{extraJobs} extra{" "}
                      {extraJobs === 1 ? "job" : "jobs"}
                    </span>
                  )}

              </div>

            </div>

          </div>

          {/* PROFILE */}
          <section className="worker-profile-card">

            <div className="profile-card-icon">
              👤
            </div>

            <div className="profile-card-content">

              <p className="section-label">
                PROFESSIONAL PROFILE
              </p>

              <h2>My Worker Profile</h2>

              <p>
                Manage your service, skills, location and
                professional information.
              </p>

              <Link
                to="/worker-profile"
                className="profile-card-button"
              >
                View Profile
                <span>→</span>
              </Link>

            </div>

          </section>

        </section>

        {/* PROFILE WARNING */}
        {!profileCompleted && (
          <section className="profile-warning">

            <div className="warning-icon">
              !
            </div>

            <div className="warning-content">
              <strong>Complete your worker profile</strong>

              <p>
                Add your service, skills and location so
                Sahaayak can match you with nearby jobs.
              </p>
            </div>

            <Link
              to="/worker-profile"
              className="warning-button"
            >
              Complete Now →
            </Link>

          </section>
        )}

        {/* REQUESTS */}
        <section className="requests-section">

          <div className="section-header">

            <div>
              <p className="section-label">
                WORK QUEUE
              </p>

              <h2>Current Requests</h2>
            </div>

            <span className="request-count">
              {pendingBookings.length +
                activeBookings.length}{" "}
              active
            </span>

          </div>

          {pendingBookings.length === 0 &&
          activeBookings.length === 0 ? (
            <div className="empty-requests">

              <div className="empty-icon">
                ✓
              </div>

              <h3>No active requests</h3>

              <p>
                New service requests assigned to you
                will appear here.
              </p>

            </div>
          ) : (
            <div className="booking-list">

              {[...pendingBookings, ...activeBookings].map(
                (booking) => {

                  const nextStatus =
                    getNextStatus(booking.status);

                  return (
                    <article
                      className="worker-booking-card"
                      key={booking._id}
                    >

                      <div className="booking-main">

                        <div className="booking-title-row">

                          <h3>
                            {getServiceName(booking)}
                          </h3>

                          <span
                            className={`booking-status ${booking.status}`}
                          >
                            <span></span>
                            {getStatusLabel(
                              booking.status
                            )}
                          </span>

                        </div>

                        <div className="booking-meta">

                          <span>
                            👤 {getCustomerName(booking)}
                          </span>

                          <span>
                            📅{" "}
                            {formatDate(
                              booking.scheduledDate
                            )}
                          </span>

                          <span>
                            ⏰{" "}
                            {formatTime(
                              booking.scheduledDate
                            )}
                          </span>

                        </div>

                        <div className="booking-address">
                          <span>📍</span>

                          <span>
                            {getAddress(booking)}
                          </span>
                        </div>

                      </div>

                      <div className="booking-side">

                        <strong className="booking-price">
                          ₹
                          {Number(
                            booking.price || 0
                          ).toLocaleString("en-IN")}
                        </strong>

                        <div className="booking-actions">

                          {booking.status ===
                            "pending" && (
                            <>
                              <button
                                className="booking-button accept"
                                disabled={
                                  actionLoading ===
                                  booking._id
                                }
                                onClick={() =>
                                  updateBooking(
                                    booking._id,
                                    "accept"
                                  )
                                }
                              >
                                {actionLoading ===
                                booking._id
                                  ? "..."
                                  : "Accept"}
                              </button>

                              <button
                                className="booking-button reject"
                                disabled={
                                  actionLoading ===
                                  booking._id
                                }
                                onClick={() =>
                                  updateBooking(
                                    booking._id,
                                    "reject"
                                  )
                                }
                              >
                                Reject
                              </button>
                            </>
                          )}

                          {nextStatus && (
                            <button
                              className="booking-button update"
                              disabled={
                                actionLoading ===
                                booking._id
                              }
                              onClick={() =>
                                updateBooking(
                                  booking._id,
                                  "status",
                                  nextStatus
                                )
                              }
                            >
                              {actionLoading ===
                              booking._id
                                ? "Updating..."
                                : nextStatus ===
                                  "in_progress"
                                ? "Start Job →"
                                : "Mark Complete →"}
                            </button>
                          )}

                        </div>

                      </div>

                    </article>
                  );
                }
              )}

            </div>
          )}

        </section>

        {/* COMPLETED WORK */}
        <section className="completed-section">

          <div className="section-header">

            <div>
              <p className="section-label">
                RECENT WORK
              </p>

              <h2>Completed Services</h2>
            </div>

            <span className="completed-total">
              {completedBookings.length} this month
            </span>

          </div>

          {completedBookings.length === 0 ? (
            <div className="simple-empty">
              No completed services this month yet.
            </div>
          ) : (
            <div className="completed-list">

              {completedBookings
                .slice(0, 5)
                .map((booking) => (
                  <div
                    className="completed-row"
                    key={booking._id}
                  >

                    <div className="completed-service">
                      <div className="completed-check">
                        ✓
                      </div>

                      <div>
                        <strong>
                          {getServiceName(booking)}
                        </strong>

                        <span>
                          {formatDate(
                            booking.scheduledDate
                          )}
                        </span>
                      </div>
                    </div>

                    <strong className="completed-price">
                      +₹
                      {Number(
                        booking.price || 0
                      ).toLocaleString("en-IN")}
                    </strong>

                  </div>
                ))}

            </div>
          )}

        </section>

        {/* WELFARE */}
        <section className="worker-support">

          <div>
            <p className="section-label">
              WORKER SUPPORT
            </p>

            <h2>
              Need help or want to know your benefits?
            </h2>

            <p>
              Access welfare programs, worker resources
              and official government information.
            </p>
          </div>

          <Link
            to="/worker-welfare"
            className="support-button"
          >
            View Welfare & Benefits →
          </Link>

        </section>

        <footer className="worker-footer">
          <span>SAHAAYAK</span>
          <span>
            Connecting local workers with meaningful
            opportunities.
          </span>
        </footer>

      </main>
    </>
  );
}

const styles = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@500;600;700&display=swap');

.modern-worker-page {
  min-height: 100vh;
  background: #ffffe3;
  color: #4a4a4a;
  padding: 42px 7%;
  font-family: 'Inter', sans-serif;
}

.modern-worker-page * {
  box-sizing: border-box;
}

.worker-topbar {
  max-width: 1250px;
  margin: 0 auto 38px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 30px;
}

.worker-eyebrow,
.section-label {
  margin: 0 0 8px;
  color: #6d8196;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1.8px;
}

.worker-topbar h1 {
  margin: 0;
  color: #41474d;
  font-family: 'Poppins', sans-serif;
  font-size: clamp(28px, 4vw, 42px);
  line-height: 1.1;
  font-weight: 600;
  letter-spacing: -1px;
}

.worker-subtitle {
  margin: 10px 0 0;
  color: #7b8490;
  font-size: 14px;
}

.availability-pill {
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 10px 16px;
  border: 1px solid #d8ddd8;
  border-radius: 999px;
  background: rgba(255,255,255,.72);
  color: #68736f;
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
}

.availability-pill span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #9da59f;
}

.availability-pill.available span {
  background: #6f9678;
}

.worker-error {
  max-width: 1250px;
  margin: 0 auto 20px;
  padding: 13px 16px;
  border: 1px solid #e2c8c1;
  border-radius: 12px;
  background: #fff7f4;
  color: #925d52;
  font-size: 12px;
}

.worker-summary-grid {
  max-width: 1250px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.worker-stat-card {
  min-height: 190px;
  padding: 24px;
  border: 1px solid #e4e3d8;
  border-radius: 22px;
  background: rgba(255,255,255,.76);
  box-shadow: 0 10px 30px rgba(74,74,74,.045);
  transition: transform .2s ease, box-shadow .2s ease;
}

.worker-stat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 16px 36px rgba(74,74,74,.08);
}

.primary-stat {
  background: #6d8196;
  border-color: #6d8196;
  color: white;
}

.stat-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-top span:first-child {
  font-size: 9px;
  letter-spacing: 1.4px;
  font-weight: 800;
  color: #7d858d;
}

.primary-stat .stat-top span:first-child {
  color: rgba(255,255,255,.72);
}

.stat-symbol {
  font-size: 15px;
  color: #8e9ba6;
}

.primary-stat .stat-symbol {
  color: rgba(255,255,255,.8);
}

.worker-stat-card strong {
  display: block;
  margin-top: 32px;
  font-family: 'Poppins', sans-serif;
  font-size: 42px;
  line-height: 1;
  font-weight: 600;
  color: #464d53;
}

.primary-stat strong {
  color: white;
}

.worker-stat-card p {
  margin: 12px 0 0;
  color: #8b9298;
  font-size: 11px;
}

.primary-stat p {
  color: rgba(255,255,255,.72);
}

.worker-middle-grid {
  max-width: 1250px;
  margin: 18px auto 0;
  display: grid;
  grid-template-columns: minmax(0, 1.7fr) minmax(280px, .8fr);
  gap: 18px;
}

.salary-cap-card {
  min-height: 280px;
  padding: 29px;
  border: 1px solid #dddcd0;
  border-radius: 22px;
  background: #f7f6ec;
  box-shadow: 0 10px 30px rgba(74,74,74,.035);
}

.salary-heading {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.salary-heading h2,
.worker-profile-card h2,
.section-header h2,
.worker-support h2 {
  margin: 0;
  font-family: 'Poppins', sans-serif;
  color: #464c51;
  font-weight: 600;
}

.salary-heading h2 {
  font-size: 20px;
}

.salary-icon {
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 13px;
  background: #6d8196;
  color: white;
  font-family: 'Poppins', sans-serif;
  font-size: 17px;
}

.salary-main {
  margin-top: 30px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 30px;
}

.salary-small-label,
.salary-cap-value span {
  display: block;
  margin-bottom: 7px;
  color: #858d91;
  font-size: 9px;
  letter-spacing: 1.1px;
  font-weight: 800;
}

.salary-value {
  color: #454c52;
  font-family: 'Poppins', sans-serif;
  font-size: 36px;
  line-height: 1;
}

.salary-cap-value {
  text-align: right;
}

.salary-cap-value strong {
  color: #66727b;
  font-size: 13px;
  font-weight: 700;
}

.salary-progress-area {
  margin-top: 30px;
}

.salary-progress-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 9px;
  color: #707a80;
  font-size: 11px;
  font-weight: 600;
}

.salary-progress-header strong {
  color: #59656e;
}

.salary-progress {
  width: 100%;
  height: 8px;
  overflow: hidden;
  border-radius: 99px;
  background: #e0e0d4;
}

.salary-progress div {
  height: 100%;
  border-radius: inherit;
  background: #6d8196;
  transition: width .4s ease;
}

.salary-bottom {
  margin-top: 9px;
  display: flex;
  justify-content: space-between;
  gap: 10px;
  color: #90979a;
  font-size: 10px;
}

.extra-jobs {
  color: #806c57;
  font-weight: 700;
}

.worker-profile-card {
  min-height: 280px;
  padding: 29px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border: 1px solid #e1e1d6;
  border-radius: 22px;
  background: white;
  box-shadow: 0 10px 30px rgba(74,74,74,.045);
}

.profile-card-icon {
  width: 45px;
  height: 45px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
  background: #f0efe6;
  font-size: 21px;
}

.profile-card-content {
  margin-top: 28px;
}

.worker-profile-card h2 {
  font-size: 19px;
}

.worker-profile-card p:not(.section-label) {
  max-width: 280px;
  margin: 8px 0 20px;
  color: #858d91;
  font-size: 11px;
  line-height: 1.7;
}

.profile-card-button,
.warning-button,
.support-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  text-decoration: none;
  cursor: pointer;
  font-size: 11px;
  font-weight: 700;
}

.profile-card-button {
  color: #6d8196;
}

.profile-card-button span {
  transition: transform .2s ease;
}

.profile-card-button:hover span {
  transform: translateX(4px);
}

.profile-warning {
  max-width: 1250px;
  margin: 18px auto 0;
  padding: 18px 21px;
  display: flex;
  align-items: center;
  gap: 15px;
  border: 1px solid #e3d7bc;
  border-radius: 17px;
  background: #fbf7e9;
}

.warning-icon {
  width: 34px;
  height: 34px;
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #e7d8ad;
  color: #716043;
  font-weight: 800;
}

.warning-content {
  flex: 1;
}

.warning-content strong {
  display: block;
  color: #5d5d54;
  font-size: 12px;
}

.warning-content p {
  margin: 4px 0 0;
  color: #88877b;
  font-size: 10px;
}

.warning-button {
  padding: 9px 14px;
  border-radius: 9px;
  background: #6d8196;
  color: white;
}

.requests-section,
.completed-section {
  max-width: 1250px;
  margin: 55px auto 0;
}

.section-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 17px;
}

.section-header h2 {
  font-size: 23px;
}

.request-count,
.completed-total {
  color: #8a9295;
  font-size: 10px;
  font-weight: 700;
}

.booking-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.worker-booking-card {
  padding: 23px 25px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 30px;
  border: 1px solid #e2e1d8;
  border-radius: 18px;
  background: white;
  box-shadow: 0 7px 24px rgba(74,74,74,.035);
  transition: transform .2s ease, box-shadow .2s ease;
}

.worker-booking-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 28px rgba(74,74,74,.065);
}

.booking-main {
  min-width: 0;
  flex: 1;
}

.booking-title-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.booking-title-row h3 {
  margin: 0;
  color: #4a5055;
  font-family: 'Poppins', sans-serif;
  font-size: 16px;
  font-weight: 600;
}

.booking-status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 9px;
  border-radius: 99px;
  background: #f2f2ec;
  color: #777e80;
  font-size: 9px;
  font-weight: 800;
}

.booking-status span {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #9b9d96;
}

.booking-status.pending {
  background: #faf5e8;
  color: #8a7448;
}

.booking-status.pending span {
  background: #c0a15b;
}

.booking-status.accepted {
  background: #edf3f0;
  color: #617a6c;
}

.booking-status.accepted span {
  background: #789884;
}

.booking-status.in_progress {
  background: #edf1f5;
  color: #64788a;
}

.booking-status.in_progress span {
  background: #70889d;
}

.booking-meta {
  margin-top: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  color: #8a9194;
  font-size: 10px;
}

.booking-address {
  margin-top: 10px;
  display: flex;
  align-items: flex-start;
  gap: 7px;
  color: #737b7f;
  font-size: 10px;
}

.booking-address span:first-child {
  flex: 0 0 auto;
}

.booking-side {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 17px;
}

.booking-price {
  color: #4e565b;
  font-family: 'Poppins', sans-serif;
  font-size: 18px;
  font-weight: 600;
}

.booking-actions {
  display: flex;
  gap: 7px;
}

.booking-button {
  min-width: 82px;
  padding: 9px 13px;
  border: 1px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
  font-size: 10px;
  font-weight: 700;
  transition: .2s ease;
}

.booking-button:disabled {
  opacity: .55;
  cursor: not-allowed;
}

.booking-button.accept {
  background: #6d8196;
  color: white;
}

.booking-button.accept:hover {
  background: #5e7185;
}

.booking-button.reject {
  border-color: #ddd9d2;
  background: white;
  color: #7b7e7e;
}

.booking-button.reject:hover {
  background: #f8f7f1;
}

.booking-button.update {
  background: #6d8196;
  color: white;
  min-width: 125px;
}

.empty-requests,
.simple-empty {
  border: 1px dashed #d8d7cd;
  border-radius: 18px;
  background: rgba(255,255,255,.5);
  text-align: center;
}

.empty-requests {
  padding: 55px 20px;
}

.empty-icon {
  width: 44px;
  height: 44px;
  margin: 0 auto 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #edf2ed;
  color: #718b77;
  font-weight: 800;
}

.empty-requests h3 {
  margin: 0;
  color: #62696c;
  font-family: 'Poppins', sans-serif;
  font-size: 16px;
}

.empty-requests p {
  margin: 7px 0 0;
  color: #969b9c;
  font-size: 11px;
}

.simple-empty {
  padding: 30px;
  color: #929899;
  font-size: 11px;
}

.completed-list {
  border: 1px solid #e4e3da;
  border-radius: 18px;
  background: white;
  overflow: hidden;
}

.completed-row {
  padding: 16px 21px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  border-bottom: 1px solid #eeeee7;
}

.completed-row:last-child {
  border-bottom: none;
}

.completed-service {
  display: flex;
  align-items: center;
  gap: 12px;
}

.completed-check {
  width: 31px;
  height: 31px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 9px;
  background: #edf2ed;
  color: #718b77;
  font-size: 12px;
  font-weight: 800;
}

.completed-service strong {
  display: block;
  color: #5c6366;
  font-size: 11px;
}

.completed-service span {
  display: block;
  margin-top: 4px;
  color: #999f9f;
  font-size: 9px;
}

.completed-price {
  color: #6b7d70;
  font-size: 12px;
}

.worker-support {
  max-width: 1250px;
  margin: 55px auto 0;
  padding: 29px 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 30px;
  border-radius: 20px;
  background: #e9e9dd;
}

.worker-support h2 {
  margin-top: 0;
  font-size: 18px;
}

.worker-support p:not(.section-label) {
  margin: 7px 0 0;
  color: #858b8b;
  font-size: 10px;
}

.support-button {
  padding: 12px 17px;
  border-radius: 9px;
  background: #6d8196;
  color: white;
  white-space: nowrap;
}

.worker-footer {
  max-width: 1250px;
  margin: 48px auto 0;
  padding-top: 22px;
  border-top: 1px solid #e1e0d6;
  display: flex;
  justify-content: space-between;
  gap: 20px;
  color: #969c9d;
  font-size: 9px;
}

.worker-footer span:first-child {
  color: #6d8196;
  font-weight: 800;
  letter-spacing: 1.4px;
}

.worker-loading {
  min-height: 70vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #858d91;
  font-size: 12px;
}

.worker-loader {
  width: 30px;
  height: 30px;
  margin-bottom: 15px;
  border: 3px solid #deded3;
  border-top-color: #6d8196;
  border-radius: 50%;
  animation: worker-spin .8s linear infinite;
}

@keyframes worker-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 1050px) {
  .worker-summary-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .worker-middle-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 700px) {
  .modern-worker-page {
    padding: 28px 18px;
  }

  .worker-topbar {
    flex-direction: column;
    margin-bottom: 28px;
  }

  .availability-pill {
    margin-top: 0;
  }

  .worker-summary-grid {
    grid-template-columns: 1fr;
  }

  .worker-stat-card {
    min-height: 160px;
  }

  .worker-stat-card strong {
    margin-top: 25px;
    font-size: 36px;
  }

  .salary-cap-card,
  .worker-profile-card {
    min-height: auto;
    padding: 23px;
  }

  .salary-main {
    align-items: flex-start;
    flex-direction: column;
    gap: 20px;
  }

  .salary-cap-value {
    text-align: left;
  }

  .profile-warning {
    align-items: flex-start;
    flex-wrap: wrap;
  }

  .warning-content {
    min-width: calc(100% - 50px);
  }

  .warning-button {
    margin-left: 49px;
  }

  .section-header {
    align-items: flex-start;
    flex-direction: column;
    gap: 5px;
  }

  .worker-booking-card {
    align-items: flex-start;
    flex-direction: column;
    gap: 20px;
  }

  .booking-side {
    width: 100%;
    align-items: flex-start;
  }

  .booking-actions {
    width: 100%;
  }

  .booking-button {
    flex: 1;
  }

  .worker-support {
    align-items: flex-start;
    flex-direction: column;
    padding: 24px;
  }

  .support-button {
    width: 100%;
  }

  .worker-footer {
    flex-direction: column;
  }
}
`;

export default WorkerDashboard;