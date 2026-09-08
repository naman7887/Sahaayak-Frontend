import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API_URL from "../../config/api";

function CustomerProfile() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [notifications, setNotifications] = useState(
    localStorage.getItem("customerNotifications") !== "false"
  );

  const [form, setForm] = useState({
    name: "",
    phone: "",
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const [userResponse, bookingResponse] = await Promise.all([
        fetch(`${API_URL}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),

        fetch(`${API_URL}/api/bookings/my`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);

      if (userResponse.status === 401 || bookingResponse.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      const userData = await userResponse.json();
      const bookingData = await bookingResponse.json();

      const currentUser = userData.user || userData;

      setUser(currentUser);

      setForm({
        name: currentUser?.name || "",
        phone: currentUser?.phone || "",
      });

      setBookings(
        bookingData.bookings ||
          bookingData.data ||
          []
      );
    } catch (error) {
      console.error("Profile loading error:", error);
      setMessage("Unable to load profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage("");

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/api/auth/me`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update profile");
      }

      setUser((prev) => ({
        ...prev,
        ...form,
      }));

      setMessage("Profile updated successfully.");
    } catch (error) {
      console.error(error);
      setMessage(error.message || "Could not update profile.");
    } finally {
      setSaving(false);
    }
  };

  const toggleNotifications = () => {
    const newValue = !notifications;

    setNotifications(newValue);
    localStorage.setItem(
      "customerNotifications",
      String(newValue)
    );
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const completedJobs = bookings.filter(
    (booking) => booking.status === "completed"
  ).length;

  const activeJobs = bookings.filter(
    (booking) =>
      booking.status === "pending" ||
      booking.status === "accepted" ||
      booking.status === "in-progress"
  ).length;

  const cancelledJobs = bookings.filter(
    (booking) => booking.status === "cancelled"
  ).length;

  const getStatusText = (status) => {
    const statusMap = {
      pending: "Pending",
      accepted: "Accepted",
      "in-progress": "In Progress",
      completed: "Completed",
      cancelled: "Cancelled",
      rejected: "Rejected",
    };

    return statusMap[status] || status;
  };

  const getStatusClass = (status) => {
    if (status === "completed") return "cp-status completed";
    if (status === "cancelled" || status === "rejected") {
      return "cp-status cancelled";
    }
    if (status === "accepted" || status === "in-progress") {
      return "cp-status active";
    }

    return "cp-status pending";
  };

  if (loading) {
    return (
      <>
        <style>{styles}</style>

        <div className="cp-loading">
          <div className="cp-loader"></div>
          <h2>Loading your profile</h2>
          <p>Please wait a moment...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{styles}</style>

      <div className="cp-page">

        {/* Header */}
        <header className="cp-header">
          <div>
            <Link to="/dashboard" className="cp-back">
              ← Back to Dashboard
            </Link>

            <div className="cp-title-row">
              <div className="cp-avatar">
                {user?.name?.charAt(0)?.toUpperCase() || "C"}
              </div>

              <div>
                <p className="cp-eyebrow">CUSTOMER ACCOUNT</p>
                <h1>{user?.name || "Customer"}</h1>
                <p className="cp-subtitle">
                  Manage your account and service history
                </p>
              </div>
            </div>
          </div>

          <div className="cp-header-badge">
            <span className="cp-dot"></span>
            Customer
          </div>
        </header>

        {/* Navigation */}
        <div className="cp-tabs">
          <button
            className={activeTab === "overview" ? "active" : ""}
            onClick={() => setActiveTab("overview")}
          >
            Overview
          </button>

          <button
            className={activeTab === "history" ? "active" : ""}
            onClick={() => setActiveTab("history")}
          >
            Service History
          </button>

          <button
            className={activeTab === "settings" ? "active" : ""}
            onClick={() => setActiveTab("settings")}
          >
            Account Settings
          </button>
        </div>

        {/* OVERVIEW */}
        {activeTab === "overview" && (
          <main className="cp-content">

            <section className="cp-stats">

              <div className="cp-stat-card">
                <div className="cp-stat-icon">📋</div>
                <div>
                  <span>Total Requests</span>
                  <strong>{bookings.length}</strong>
                </div>
              </div>

              <div className="cp-stat-card">
                <div className="cp-stat-icon">⚡</div>
                <div>
                  <span>Active Services</span>
                  <strong>{activeJobs}</strong>
                </div>
              </div>

              <div className="cp-stat-card">
                <div className="cp-stat-icon">✓</div>
                <div>
                  <span>Completed</span>
                  <strong>{completedJobs}</strong>
                </div>
              </div>

              <div className="cp-stat-card">
                <div className="cp-stat-icon">↗</div>
                <div>
                  <span>Cancelled</span>
                  <strong>{cancelledJobs}</strong>
                </div>
              </div>

            </section>

            <section className="cp-grid">

              {/* Profile card */}
              <div className="cp-card cp-profile-card">
                <div className="cp-card-heading">
                  <div>
                    <span className="cp-section-label">
                      YOUR PROFILE
                    </span>
                    <h2>Personal Information</h2>
                  </div>

                  <button
                    className="cp-small-btn"
                    onClick={() => setActiveTab("settings")}
                  >
                    Edit
                  </button>
                </div>

                <div className="cp-info-list">

                  <div className="cp-info">
                    <span>Name</span>
                    <strong>{user?.name || "Not provided"}</strong>
                  </div>

                  <div className="cp-info">
                    <span>Email</span>
                    <strong>{user?.email || "Not provided"}</strong>
                  </div>

                  <div className="cp-info">
                    <span>Phone</span>
                    <strong>{user?.phone || "Not provided"}</strong>
                  </div>

                  <div className="cp-info">
                    <span>Account Type</span>
                    <strong>Customer</strong>
                  </div>

                </div>
              </div>

              {/* Quick actions */}
              <div className="cp-card cp-action-card">
                <span className="cp-section-label">
                  QUICK ACTIONS
                </span>

                <h2>Need a service?</h2>

                <p>
                  Find trusted local professionals for your
                  household and community needs.
                </p>

                <Link
                  to="/find-services"
                  className="cp-primary-btn"
                >
                  Find a Service →
                </Link>

                <Link
                  to="/dashboard"
                  className="cp-secondary-btn"
                >
                  View Dashboard
                </Link>
              </div>

            </section>

            {/* Recent services */}
            <section className="cp-card cp-recent-card">

              <div className="cp-card-heading">
                <div>
                  <span className="cp-section-label">
                    RECENT ACTIVITY
                  </span>
                  <h2>Recent Services</h2>
                </div>

                <button
                  className="cp-text-btn"
                  onClick={() => setActiveTab("history")}
                >
                  View all →
                </button>
              </div>

              {bookings.length === 0 ? (
                <div className="cp-empty">
                  <div className="cp-empty-icon">🛠</div>
                  <h3>No services yet</h3>
                  <p>
                    Your completed and active services will
                    appear here.
                  </p>

                  <Link
                    to="/find-services"
                    className="cp-primary-btn"
                  >
                    Find a Service
                  </Link>
                </div>
              ) : (
                <div className="cp-service-list">
                  {bookings.slice(0, 4).map((booking) => (
                    <div
                      className="cp-service-row"
                      key={booking._id}
                    >
                      <div className="cp-service-icon">
                        🔧
                      </div>

                      <div className="cp-service-main">
                        <h3>
                          {booking.service?.name ||
                            "Service Request"}
                        </h3>

                        <p>
                          {booking.address ||
                            "Address not available"}
                        </p>
                      </div>

                      <div className="cp-service-date">
                        {booking.scheduledDate
                          ? new Date(
                              booking.scheduledDate
                            ).toLocaleDateString()
                          : "Date unavailable"}
                      </div>

                      <span
                        className={getStatusClass(
                          booking.status
                        )}
                      >
                        {getStatusText(booking.status)}
                      </span>
                    </div>
                  ))}
                </div>
              )}

            </section>

          </main>
        )}

        {/* SERVICE HISTORY */}
        {activeTab === "history" && (
          <main className="cp-content">

            <section className="cp-card">

              <div className="cp-card-heading">
                <div>
                  <span className="cp-section-label">
                    SERVICE HISTORY
                  </span>
                  <h2>All Your Requests</h2>
                </div>

                <Link
                  to="/find-services"
                  className="cp-small-primary"
                >
                  + New Service
                </Link>
              </div>

              {bookings.length === 0 ? (
                <div className="cp-empty">
                  <div className="cp-empty-icon">📋</div>
                  <h3>No service history</h3>
                  <p>
                    You haven't requested a service yet.
                  </p>

                  <Link
                    to="/find-services"
                    className="cp-primary-btn"
                  >
                    Find a Service
                  </Link>
                </div>
              ) : (
                <div className="cp-history-list">

                  {bookings.map((booking) => (
                    <div
                      className="cp-history-card"
                      key={booking._id}
                    >
                      <div className="cp-history-top">

                        <div className="cp-history-service">
                          <div className="cp-history-icon">
                            🔧
                          </div>

                          <div>
                            <h3>
                              {booking.service?.name ||
                                "Service Request"}
                            </h3>

                            <p>
                              {booking.service?.category ||
                                "Household Service"}
                            </p>
                          </div>
                        </div>

                        <span
                          className={getStatusClass(
                            booking.status
                          )}
                        >
                          {getStatusText(booking.status)}
                        </span>

                      </div>

                      <div className="cp-history-details">

                        <div>
                          <span>DATE</span>
                          <strong>
                            {booking.scheduledDate
                              ? new Date(
                                  booking.scheduledDate
                                ).toLocaleDateString()
                              : "—"}
                          </strong>
                        </div>

                        <div>
                          <span>ADDRESS</span>
                          <strong>
                            {booking.address || "—"}
                          </strong>
                        </div>

                        <div>
                          <span>PROVIDER</span>
                          <strong>
                            {booking.worker?.name ||
                              booking.worker?.user?.name ||
                              "Being assigned"}
                          </strong>
                        </div>

                        <div>
                          <span>PRICE</span>
                          <strong>
                            {booking.price
                              ? `₹${booking.price}`
                              : "—"}
                          </strong>
                        </div>

                      </div>
                    </div>
                  ))}

                </div>
              )}

            </section>

          </main>
        )}

        {/* SETTINGS */}
        {activeTab === "settings" && (
          <main className="cp-content">

            <section className="cp-settings-grid">

              <div className="cp-card">

                <span className="cp-section-label">
                  ACCOUNT
                </span>

                <h2>Personal Details</h2>

                <p className="cp-card-description">
                  Keep your contact information up to date
                  for smoother service bookings.
                </p>

                <div className="cp-form">

                  <label>
                    Full Name
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          name: e.target.value,
                        })
                      }
                      placeholder="Enter your name"
                    />
                  </label>

                  <label>
                    Phone Number
                    <input
                      type="text"
                      value={form.phone}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          phone: e.target.value,
                        })
                      }
                      placeholder="Enter phone number"
                    />
                  </label>

                  <label>
                    Email Address
                    <input
                      type="email"
                      value={user?.email || ""}
                      disabled
                    />
                    <small>
                      Email is linked to your account.
                    </small>
                  </label>

                  <button
                    className="cp-save-btn"
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving
                      ? "Saving..."
                      : "Save Changes"}
                  </button>

                  {message && (
                    <div className="cp-message">
                      {message}
                    </div>
                  )}

                </div>
              </div>

              <div className="cp-card">

                <span className="cp-section-label">
                  PREFERENCES
                </span>

                <h2>Notifications</h2>

                <p className="cp-card-description">
                  Control how you receive updates about your
                  service requests.
                </p>

                <div className="cp-preference">
                  <div>
                    <strong>Service Updates</strong>
                    <p>
                      Booking, worker and service status
                      notifications.
                    </p>
                  </div>

                  <button
                    className={`cp-toggle ${
                      notifications ? "on" : ""
                    }`}
                    onClick={toggleNotifications}
                  >
                    <span></span>
                  </button>
                </div>

                <div className="cp-account-box">
                  <div>
                    <strong>Account Security</strong>
                    <p>
                      Your account is protected by
                      Sahaayak authentication.
                    </p>
                  </div>

                  <span className="cp-secure">
                    ✓ Secure
                  </span>
                </div>

              </div>

            </section>

            <section className="cp-danger-card">

              <div>
                <span className="cp-section-label">
                  ACCOUNT
                </span>

                <h2>Sign Out</h2>

                <p>
                  Sign out from your Sahaayak account on
                  this device.
                </p>
              </div>

              <button
                className="cp-logout-btn"
                onClick={handleLogout}
              >
                Sign Out
              </button>

            </section>

          </main>
        )}

        <footer className="cp-footer">
          <strong>Sahaayak</strong>
          <span>Reliable help. Right when you need it.</span>
        </footer>

      </div>
    </>
  );
}

const styles = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@500;600;700&display=swap');

.cp-page {
  min-height: 100vh;
  background: #ffffe3;
  color: #4a4a4a;
  font-family: 'Inter', sans-serif;
  padding-bottom: 50px;
}

.cp-page * {
  box-sizing: border-box;
}

.cp-page h1,
.cp-page h2,
.cp-page h3 {
  font-family: 'Poppins', sans-serif;
  margin: 0;
}

.cp-header {
  max-width: 1180px;
  margin: auto;
  padding: 42px 28px 30px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 30px;
}

.cp-back {
  display: inline-block;
  color: #6d8196;
  text-decoration: none;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 25px;
}

.cp-back:hover {
  text-decoration: underline;
}

.cp-title-row {
  display: flex;
  align-items: center;
  gap: 18px;
}

.cp-avatar {
  width: 68px;
  height: 68px;
  border-radius: 20px;
  background: #6d8196;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Poppins', sans-serif;
  font-size: 27px;
  font-weight: 700;
  box-shadow: 0 12px 25px rgba(74, 74, 74, 0.12);
}

.cp-eyebrow,
.cp-section-label {
  font-size: 11px;
  letter-spacing: 1.5px;
  font-weight: 700;
  color: #6d8196;
}

.cp-header h1 {
  font-size: 32px;
  color: #3f464c;
  margin: 3px 0 5px;
}

.cp-subtitle {
  margin: 0;
  color: #7c7c78;
  font-size: 14px;
}

.cp-header-badge {
  padding: 10px 15px;
  border: 1px solid #d8d8ca;
  border-radius: 30px;
  background: rgba(255,255,255,0.7);
  font-size: 13px;
  font-weight: 600;
}

.cp-dot {
  width: 8px;
  height: 8px;
  background: #78947e;
  border-radius: 50%;
  display: inline-block;
  margin-right: 7px;
}

.cp-tabs {
  max-width: 1180px;
  margin: 0 auto 30px;
  padding: 0 28px;
  display: flex;
  gap: 8px;
  border-bottom: 1px solid #deded2;
}

.cp-tabs button {
  border: none;
  background: transparent;
  padding: 15px 18px;
  color: #85857f;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  border-bottom: 3px solid transparent;
}

.cp-tabs button:hover {
  color: #6d8196;
}

.cp-tabs button.active {
  color: #4a4a4a;
  border-bottom-color: #6d8196;
}

.cp-content {
  max-width: 1180px;
  margin: auto;
  padding: 0 28px;
}

.cp-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 18px;
}

.cp-stat-card {
  background: white;
  border: 1px solid #e2e2d7;
  border-radius: 20px;
  padding: 22px;
  display: flex;
  align-items: center;
  gap: 15px;
  box-shadow: 0 8px 25px rgba(74,74,74,0.05);
}

.cp-stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: #f0f0e7;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.cp-stat-card span {
  display: block;
  color: #888881;
  font-size: 12px;
  margin-bottom: 5px;
}

.cp-stat-card strong {
  font-family: 'Poppins', sans-serif;
  font-size: 25px;
  color: #3f464c;
}

.cp-grid {
  display: grid;
  grid-template-columns: 1.45fr 1fr;
  gap: 18px;
  margin-bottom: 18px;
}

.cp-card {
  background: white;
  border: 1px solid #e2e2d7;
  border-radius: 24px;
  padding: 28px;
  box-shadow: 0 10px 30px rgba(74,74,74,0.05);
}

.cp-card-heading {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
  margin-bottom: 25px;
}

.cp-card h2 {
  color: #3f464c;
  font-size: 21px;
  margin-top: 5px;
}

.cp-small-btn,
.cp-text-btn {
  border: none;
  background: transparent;
  color: #6d8196;
  font-weight: 700;
  cursor: pointer;
}

.cp-small-btn {
  padding: 9px 15px;
  border: 1px solid #d7d7ca;
  border-radius: 10px;
}

.cp-info-list {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
}

.cp-info {
  padding: 15px;
  background: #fafaf2;
  border-radius: 13px;
}

.cp-info span {
  display: block;
  color: #91918a;
  font-size: 11px;
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: .7px;
}

.cp-info strong {
  font-size: 14px;
  color: #50545a;
  word-break: break-word;
}

.cp-action-card {
  background: #6d8196;
  color: white;
}

.cp-action-card .cp-section-label {
  color: #e7e9e7;
}

.cp-action-card h2 {
  color: white;
  font-size: 25px;
  margin-top: 8px;
}

.cp-action-card p {
  color: #eef0ef;
  line-height: 1.6;
  font-size: 14px;
  margin: 12px 0 25px;
}

.cp-primary-btn,
.cp-secondary-btn {
  display: block;
  text-align: center;
  text-decoration: none;
  padding: 13px 17px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 700;
  transition: .2s;
}

.cp-primary-btn {
  background: white;
  color: #5e7185;
}

.cp-primary-btn:hover {
  transform: translateY(-2px);
}

.cp-secondary-btn {
  color: white;
  border: 1px solid rgba(255,255,255,.35);
  margin-top: 9px;
}

.cp-recent-card {
  margin-bottom: 18px;
}

.cp-service-list {
  border-top: 1px solid #ededdf;
}

.cp-service-row {
  display: grid;
  grid-template-columns: 46px 1fr auto auto;
  align-items: center;
  gap: 15px;
  padding: 17px 0;
  border-bottom: 1px solid #ededdf;
}

.cp-service-icon,
.cp-history-icon {
  width: 44px;
  height: 44px;
  background: #f1f1e9;
  border-radius: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cp-service-main h3 {
  font-size: 15px;
  color: #50545a;
}

.cp-service-main p {
  font-size: 12px;
  color: #96968e;
  margin: 4px 0 0;
}

.cp-service-date {
  font-size: 12px;
  color: #85857f;
}

.cp-status {
  font-size: 11px;
  font-weight: 700;
  padding: 7px 10px;
  border-radius: 20px;
  white-space: nowrap;
}

.cp-status.completed {
  background: #e7eee7;
  color: #617963;
}

.cp-status.active {
  background: #e8edf1;
  color: #60778b;
}

.cp-status.pending {
  background: #f1eee2;
  color: #8a7952;
}

.cp-status.cancelled {
  background: #eee8e6;
  color: #856d67;
}

.cp-empty {
  text-align: center;
  padding: 55px 20px;
}

.cp-empty-icon {
  width: 65px;
  height: 65px;
  margin: 0 auto 15px;
  border-radius: 20px;
  background: #f1f1e8;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 27px;
}

.cp-empty h3 {
  font-size: 19px;
  color: #4b5055;
}

.cp-empty p {
  color: #8a8a83;
  font-size: 13px;
  margin-bottom: 20px;
}

.cp-empty .cp-primary-btn {
  display: inline-block;
  background: #6d8196;
  color: white;
}

.cp-history-list {
  display: flex;
  flex-direction: column;
  gap: 13px;
}

.cp-history-card {
  border: 1px solid #e6e6da;
  border-radius: 17px;
  padding: 20px;
  background: #fdfdf7;
}

.cp-history-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
}

.cp-history-service {
  display: flex;
  align-items: center;
  gap: 13px;
}

.cp-history-service h3 {
  font-size: 16px;
  color: #4d5358;
}

.cp-history-service p {
  margin: 4px 0 0;
  color: #909089;
  font-size: 12px;
}

.cp-history-details {
  margin-top: 18px;
  padding-top: 17px;
  border-top: 1px solid #e7e7dc;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
}

.cp-history-details span {
  display: block;
  font-size: 10px;
  letter-spacing: 1px;
  color: #999990;
  margin-bottom: 6px;
}

.cp-history-details strong {
  display: block;
  font-size: 12px;
  color: #555a5e;
  line-height: 1.4;
}

.cp-small-primary {
  text-decoration: none;
  background: #6d8196;
  color: white;
  padding: 10px 14px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 700;
}

.cp-settings-grid {
  display: grid;
  grid-template-columns: 1.3fr 1fr;
  gap: 18px;
}

.cp-card-description {
  color: #888881;
  font-size: 13px;
  line-height: 1.6;
  max-width: 600px;
}

.cp-form {
  margin-top: 25px;
  display: flex;
  flex-direction: column;
  gap: 17px;
}

.cp-form label {
  color: #62635f;
  font-size: 12px;
  font-weight: 700;
}

.cp-form input {
  width: 100%;
  margin-top: 7px;
  padding: 13px 14px;
  border: 1px solid #dcdcd1;
  border-radius: 11px;
  outline: none;
  background: #fcfcf6;
  color: #4a4a4a;
  font-family: inherit;
}

.cp-form input:focus {
  border-color: #6d8196;
}

.cp-form input:disabled {
  background: #f0f0e8;
  cursor: not-allowed;
}

.cp-form small {
  display: block;
  margin-top: 5px;
  color: #999990;
  font-weight: 400;
}

.cp-save-btn {
  border: none;
  background: #6d8196;
  color: white;
  padding: 13px;
  border-radius: 11px;
  font-weight: 700;
  cursor: pointer;
}

.cp-save-btn:disabled {
  opacity: .6;
  cursor: not-allowed;
}

.cp-message {
  padding: 11px 13px;
  background: #edf1eb;
  color: #61745f;
  border-radius: 10px;
  font-size: 12px;
}

.cp-preference {
  margin-top: 25px;
  padding: 17px;
  border: 1px solid #e2e2d7;
  border-radius: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
}

.cp-preference strong {
  font-size: 14px;
  color: #55595d;
}

.cp-preference p {
  margin: 5px 0 0;
  color: #92928b;
  font-size: 12px;
  line-height: 1.5;
}

.cp-toggle {
  width: 47px;
  height: 27px;
  border: none;
  border-radius: 30px;
  padding: 3px;
  background: #c8c8c0;
  cursor: pointer;
  flex-shrink: 0;
  text-align: left;
}

.cp-toggle span {
  width: 21px;
  height: 21px;
  background: white;
  border-radius: 50%;
  display: block;
  transition: .2s;
}

.cp-toggle.on {
  background: #6d8196;
}

.cp-toggle.on span {
  transform: translateX(20px);
}

.cp-account-box {
  margin-top: 15px;
  padding: 17px;
  border-radius: 15px;
  background: #f7f7ee;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
}

.cp-account-box strong {
  font-size: 13px;
}

.cp-account-box p {
  margin: 5px 0 0;
  color: #92928b;
  font-size: 11px;
}

.cp-secure {
  font-size: 11px;
  color: #657864;
  font-weight: 700;
}

.cp-danger-card {
  max-width: 1180px;
  margin: 18px auto 0;
  padding: 25px 28px;
  border: 1px solid #e4dcd7;
  border-radius: 22px;
  background: #fbf8f6;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}

.cp-danger-card h2 {
  font-size: 18px;
  margin-top: 4px;
}

.cp-danger-card p {
  color: #918b87;
  font-size: 12px;
  margin: 6px 0 0;
}

.cp-logout-btn {
  border: 1px solid #c8aaa1;
  background: transparent;
  color: #80645d;
  padding: 11px 18px;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
}

.cp-footer {
  max-width: 1180px;
  margin: 35px auto 0;
  padding: 20px 28px;
  border-top: 1px solid #deded2;
  display: flex;
  justify-content: space-between;
  color: #999990;
  font-size: 12px;
}

.cp-footer strong {
  color: #6d8196;
  font-family: 'Poppins', sans-serif;
}

.cp-loading {
  min-height: 100vh;
  background: #ffffe3;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-family: 'Inter', sans-serif;
  color: #4a4a4a;
}

.cp-loading h2 {
  font-family: 'Poppins', sans-serif;
  margin: 20px 0 5px;
}

.cp-loading p {
  color: #898981;
  font-size: 13px;
}

.cp-loader {
  width: 45px;
  height: 45px;
  border: 4px solid #deded2;
  border-top-color: #6d8196;
  border-radius: 50%;
  animation: cp-spin 1s linear infinite;
}

@keyframes cp-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 900px) {
  .cp-stats {
    grid-template-columns: 1fr 1fr;
  }

  .cp-grid,
  .cp-settings-grid {
    grid-template-columns: 1fr;
  }

  .cp-history-details {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 650px) {
  .cp-header {
    padding: 28px 18px 22px;
    align-items: flex-start;
    flex-direction: column;
  }

  .cp-header h1 {
    font-size: 26px;
  }

  .cp-tabs {
    padding: 0 18px;
    overflow-x: auto;
  }

  .cp-tabs button {
    white-space: nowrap;
    padding: 13px 12px;
  }

  .cp-content {
    padding: 0 18px;
  }

  .cp-stats {
    grid-template-columns: 1fr 1fr;
  }

  .cp-stat-card {
    padding: 16px;
  }

  .cp-stat-icon {
    display: none;
  }

  .cp-stat-card strong {
    font-size: 21px;
  }

  .cp-info-list,
  .cp-history-details {
    grid-template-columns: 1fr;
  }

  .cp-service-row {
    grid-template-columns: 42px 1fr auto;
  }

  .cp-service-date {
    display: none;
  }

  .cp-card {
    padding: 21px;
  }

  .cp-danger-card {
    margin: 18px;
    padding: 21px;
    flex-direction: column;
    align-items: flex-start;
  }

  .cp-footer {
    margin: 25px 18px 0;
    padding: 18px 0;
    flex-direction: column;
    gap: 6px;
  }
}
`;

export default CustomerProfile;