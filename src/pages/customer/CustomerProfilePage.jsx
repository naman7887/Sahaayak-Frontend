import { useEffect, useMemo, useState } from "react";
import API_URL from "../config/api";

function CustomerProfile() {
  const token = localStorage.getItem("token");

  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [notifications, setNotifications] = useState(
    localStorage.getItem("sahaayak_notifications") !== "false"
  );

  const [emailUpdates, setEmailUpdates] = useState(
    localStorage.getItem("sahaayak_email_updates") !== "false"
  );

  const [activeTab, setActiveTab] = useState("overview");

  const loadProfile = async () => {
    try {
      setLoading(true);

      if (!token) {
        window.location.href = "/login";
        return;
      }

      const [userResponse, bookingResponse] =
        await Promise.all([
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

      const userData = await userResponse.json();
      const bookingData = await bookingResponse.json();

      if (!userResponse.ok) {
        localStorage.removeItem("token");
        window.location.href = "/login";
        return;
      }

      setUser(userData.user);
      setBookings(bookingData.bookings || []);
    } catch (error) {
      console.error("Profile error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const updateNotificationSetting = (value) => {
    setNotifications(value);
    localStorage.setItem(
      "sahaayak_notifications",
      String(value)
    );
  };

  const updateEmailSetting = (value) => {
    setEmailUpdates(value);
    localStorage.setItem(
      "sahaayak_email_updates",
      String(value)
    );
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return "—";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) return "—";

    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (dateValue) => {
    if (!dateValue) return "";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) return "";

    return date.toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const getStatus = (status) => {
    const values = {
      pending: ["Waiting", "pending"],
      accepted: ["Accepted", "accepted"],
      "in-progress": ["In Progress", "progress"],
      completed: ["Completed", "completed"],
      rejected: ["Rejected", "rejected"],
      cancelled: ["Cancelled", "cancelled"],
    };

    return values[status] || [status || "Unknown", "pending"];
  };

  const completedCount = useMemo(
    () =>
      bookings.filter(
        (booking) => booking.status === "completed"
      ).length,
    [bookings]
  );

  const activeCount = useMemo(
    () =>
      bookings.filter(
        (booking) =>
          ![
            "completed",
            "cancelled",
            "rejected",
          ].includes(booking.status)
      ).length,
    [bookings]
  );

  const totalSpent = useMemo(
    () =>
      bookings
        .filter((booking) => booking.status === "completed")
        .reduce(
          (sum, booking) =>
            sum + Number(booking.price || 0),
          0
        ),
    [bookings]
  );

  const firstLetter = (
    user?.name || "C"
  )
    .charAt(0)
    .toUpperCase();

  if (loading) {
    return (
      <>
        <style>{styles}</style>

        <div className="cp-loading">
          <div className="cp-loader">
            🤝
          </div>

          <span>SAHAAYAK</span>

          <h2>
            Loading your profile...
          </h2>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{styles}</style>

      <main className="cp-page">

        {/* =================================================
            NAV
        ================================================= */}

        <nav className="cp-nav">

          <button
            className="cp-back"
            onClick={() => {
              window.location.href =
                "/dashboard";
            }}
          >
            ← Dashboard
          </button>

          <div className="cp-logo">
            SAHAAYAK
          </div>

          <button
            className="cp-home"
            onClick={() => {
              window.location.href = "/";
            }}
          >
            Home
          </button>

        </nav>


        {/* =================================================
            HEADER
        ================================================= */}

        <section className="cp-header">

          <div>

            <p className="cp-eyebrow">
              SAHAAYAK · CUSTOMER ACCOUNT
            </p>

            <h1>
              Your profile,
              <br />
              <span>your Sahaayak journey.</span>
            </h1>

            <p className="cp-header-text">
              Manage your account preferences and
              keep track of every service you've
              booked through Sahaayak.
            </p>

          </div>

          <div className="cp-header-badge">
            <span>●</span>
            Customer Account
          </div>

        </section>


        {/* =================================================
            PROFILE OVERVIEW
        ================================================= */}

        <section className="cp-profile-overview">

          <div className="cp-avatar">
            {firstLetter}
          </div>

          <div className="cp-user-main">

            <div className="cp-user-name-row">

              <h2>
                {user?.name || "Customer"}
              </h2>

              <span className="cp-verified">
                ✓ VERIFIED ACCOUNT
              </span>

            </div>

            <p>
              {user?.email ||
                "Email not available"}
            </p>

            <small>
              Member since{" "}
              {formatDate(user?.createdAt)}
            </small>

          </div>

          <div className="cp-mini-stats">

            <div>
              <strong>
                {bookings.length}
              </strong>

              <span>
                Total bookings
              </span>
            </div>

            <div>
              <strong>
                {completedCount}
              </strong>

              <span>
                Completed
              </span>
            </div>

            <div>
              <strong>
                ₹{totalSpent}
              </strong>

              <span>
                Total spent
              </span>
            </div>

          </div>

        </section>


        {/* =================================================
            TABS
        ================================================= */}

        <div className="cp-tabs">

          <button
            className={
              activeTab === "overview"
                ? "active"
                : ""
            }
            onClick={() =>
              setActiveTab("overview")
            }
          >
            Overview
          </button>

          <button
            className={
              activeTab === "history"
                ? "active"
                : ""
            }
            onClick={() =>
              setActiveTab("history")
            }
          >
            Service History
            <span>
              {bookings.length}
            </span>
          </button>

          <button
            className={
              activeTab === "settings"
                ? "active"
                : ""
            }
            onClick={() =>
              setActiveTab("settings")
            }
          >
            Account Settings
          </button>

        </div>


        {/* =================================================
            OVERVIEW
        ================================================= */}

        {activeTab === "overview" && (

          <section className="cp-overview-grid">

            <div className="cp-card cp-account-card">

              <div className="cp-card-heading">

                <div>
                  <p className="cp-eyebrow">
                    ACCOUNT DETAILS
                  </p>

                  <h3>
                    Personal information
                  </h3>
                </div>

                <div className="cp-heading-icon">
                  👤
                </div>

              </div>

              <div className="cp-detail-list">

                <div>
                  <span>FULL NAME</span>
                  <strong>
                    {user?.name || "Not available"}
                  </strong>
                </div>

                <div>
                  <span>EMAIL ADDRESS</span>
                  <strong>
                    {user?.email || "Not available"}
                  </strong>
                </div>

                <div>
                  <span>PHONE NUMBER</span>
                  <strong>
                    {user?.phone || "Not available"}
                  </strong>
                </div>

                <div>
                  <span>ACCOUNT ROLE</span>
                  <strong>
                    {user?.role || "customer"}
                  </strong>
                </div>

              </div>

            </div>


            <div className="cp-card cp-preferences-card">

              <div className="cp-card-heading">

                <div>
                  <p className="cp-eyebrow">
                    PREFERENCES
                  </p>

                  <h3>
                    Stay connected
                  </h3>
                </div>

                <div className="cp-heading-icon">
                  🔔
                </div>

              </div>

              <div className="cp-setting">

                <div>
                  <strong>
                    Booking notifications
                  </strong>

                  <span>
                    Receive updates about your
                    service requests.
                  </span>
                </div>

                <button
                  className={
                    notifications
                      ? "cp-toggle on"
                      : "cp-toggle"
                  }
                  onClick={() =>
                    updateNotificationSetting(
                      !notifications
                    )
                  }
                >
                  <i></i>
                </button>

              </div>

              <div className="cp-setting">

                <div>
                  <strong>
                    Email updates
                  </strong>

                  <span>
                    Receive useful updates about
                    your Sahaayak account.
                  </span>
                </div>

                <button
                  className={
                    emailUpdates
                      ? "cp-toggle on"
                      : "cp-toggle"
                  }
                  onClick={() =>
                    updateEmailSetting(
                      !emailUpdates
                    )
                  }
                >
                  <i></i>
                </button>

              </div>

            </div>


            <div className="cp-card cp-activity-card">

              <div className="cp-card-heading">

                <div>
                  <p className="cp-eyebrow">
                    RECENT ACTIVITY
                  </p>

                  <h3>
                    Your latest services
                  </h3>
                </div>

                <button
                  className="cp-view-all"
                  onClick={() =>
                    setActiveTab("history")
                  }
                >
                  View all →
                </button>

              </div>

              {bookings.length === 0 ? (

                <div className="cp-empty-small">
                  <span>📋</span>

                  <strong>
                    No services yet
                  </strong>

                  <p>
                    Your booking history will
                    appear here.
                  </p>
                </div>

              ) : (

                <div className="cp-recent-list">

                  {bookings
                    .slice(0, 4)
                    .map((booking) => {

                      const [
                        statusText,
                        statusClass,
                      ] = getStatus(
                        booking.status
                      );

                      return (

                        <div
                          className="cp-recent-item"
                          key={booking._id}
                        >

                          <div className="cp-recent-icon">
                            🔧
                          </div>

                          <div className="cp-recent-info">

                            <strong>
                              {booking.service?.name ||
                                "Service Request"}
                            </strong>

                            <span>
                              {formatDate(
                                booking.scheduledDate
                              )}{" "}
                              •{" "}
                              {formatTime(
                                booking.scheduledDate
                              )}
                            </span>

                          </div>

                          <div
                            className={`cp-status ${statusClass}`}
                          >
                            {statusText}
                          </div>

                        </div>

                      );
                    })}

                </div>

              )}

            </div>


            <div className="cp-card cp-network-card">

              <div className="cp-network-animation">

                <div className="cp-network-orbit one"></div>
                <div className="cp-network-orbit two"></div>

                <div className="cp-network-center">
                  🤝
                </div>

                <span className="cp-network-dot d1">
                  ⚡
                </span>

                <span className="cp-network-dot d2">
                  🔧
                </span>

                <span className="cp-network-dot d3">
                  ⭐
                </span>

              </div>

              <div>

                <p className="cp-eyebrow">
                  SAHAAYAK NETWORK
                </p>

                <h3>
                  Local help,
                  <br />
                  intelligently connected.
                </h3>

                <p>
                  Your services are matched using
                  location, availability, verification
                  and service requirements.
                </p>

              </div>

            </div>

          </section>

        )}


        {/* =================================================
            HISTORY
        ================================================= */}

        {activeTab === "history" && (

          <section className="cp-history">

            <div className="cp-history-header">

              <div>

                <p className="cp-eyebrow">
                  SERVICE HISTORY
                </p>

                <h2>
                  Everything you've booked.
                </h2>

                <p>
                  A complete record of your
                  Sahaayak services.
                </p>

              </div>

              <button
                className="cp-book-btn"
                onClick={() => {
                  window.location.href =
                    "/find-services";
                }}
              >
                + Book a Service
              </button>

            </div>


            {bookings.length === 0 ? (

              <div className="cp-history-empty">

                <div>
                  📋
                </div>

                <h3>
                  Your service history is empty.
                </h3>

                <p>
                  Once you book a local service,
                  it will appear here.
                </p>

                <button
                  className="cp-book-btn"
                  onClick={() => {
                    window.location.href =
                      "/find-services";
                  }}
                >
                  Find a Service →
                </button>

              </div>

            ) : (

              <div className="cp-history-list">

                {bookings.map((booking) => {

                  const [
                    statusText,
                    statusClass,
                  ] = getStatus(
                    booking.status
                  );

                  const workerName =
                    booking.worker?.name ||
                    booking.worker?.user?.name;

                  return (

                    <article
                      className="cp-history-card"
                      key={booking._id}
                    >

                      <div className="cp-history-icon">
                        🔧
                      </div>

                      <div className="cp-history-main">

                        <div className="cp-history-title">

                          <div>

                            <span>
                              {booking.service?.category ||
                                "LOCAL SERVICE"}
                            </span>

                            <h3>
                              {booking.service?.name ||
                                "Service Request"}
                            </h3>

                          </div>

                          <div
                            className={`cp-status ${statusClass}`}
                          >
                            {statusText}
                          </div>

                        </div>


                        <div className="cp-history-details">

                          <div>
                            <span>DATE</span>
                            <strong>
                              {formatDate(
                                booking.scheduledDate
                              )}
                            </strong>
                          </div>

                          <div>
                            <span>TIME</span>
                            <strong>
                              {formatTime(
                                booking.scheduledDate
                              )}
                            </strong>
                          </div>

                          <div>
                            <span>PROVIDER</span>
                            <strong>
                              {workerName ||
                                "Being matched"}
                            </strong>
                          </div>

                          <div>
                            <span>PRICE</span>
                            <strong>
                              ₹{booking.price || 0}
                            </strong>
                          </div>

                        </div>


                        <div className="cp-history-address">
                          📍{" "}
                          {booking.address ||
                            "Address unavailable"}
                        </div>

                        {booking.description && (

                          <div className="cp-history-description">
                            <strong>
                              Request:
                            </strong>{" "}
                            {booking.description}
                          </div>

                        )}

                      </div>

                    </article>

                  );
                })}

              </div>

            )}

          </section>

        )}


        {/* =================================================
            SETTINGS
        ================================================= */}

        {activeTab === "settings" && (

          <section className="cp-settings">

            <div className="cp-settings-main">

              <div className="cp-card">

                <div className="cp-card-heading">

                  <div>
                    <p className="cp-eyebrow">
                      PROFILE
                    </p>

                    <h3>
                      Account information
                    </h3>
                  </div>

                </div>

                <div className="cp-settings-fields">

                  <div className="cp-field">
                    <label>
                      Full Name
                    </label>

                    <input
                      value={user?.name || ""}
                      disabled
                    />

                    <small>
                      Your registered account name.
                    </small>
                  </div>

                  <div className="cp-field">
                    <label>
                      Email Address
                    </label>

                    <input
                      value={user?.email || ""}
                      disabled
                    />

                    <small>
                      Your registered email address.
                    </small>
                  </div>

                  <div className="cp-field">
                    <label>
                      Phone Number
                    </label>

                    <input
                      value={user?.phone || ""}
                      disabled
                    />

                    <small>
                      Your registered contact number.
                    </small>
                  </div>

                  <div className="cp-field">
                    <label>
                      Account Type
                    </label>

                    <input
                      value={
                        user?.role
                          ? user.role
                              .charAt(0)
                              .toUpperCase() +
                            user.role.slice(1)
                          : "Customer"
                      }
                      disabled
                    />
                  </div>

                </div>

                <div className="cp-info-note">
                  <span>ℹ</span>

                  <p>
                    Profile identity details are managed
                    through your Sahaayak account. Your
                    service preferences can be controlled
                    below.
                  </p>
                </div>

              </div>


              <div className="cp-card">

                <div className="cp-card-heading">

                  <div>
                    <p className="cp-eyebrow">
                      NOTIFICATIONS
                    </p>

                    <h3>
                      Communication preferences
                    </h3>
                  </div>

                </div>

                <div className="cp-large-setting">

                  <div className="cp-large-setting-icon">
                    🔔
                  </div>

                  <div>

                    <strong>
                      Booking notifications
                    </strong>

                    <p>
                      Get notified when your booking
                      status or assigned provider changes.
                    </p>

                  </div>

                  <button
                    className={
                      notifications
                        ? "cp-toggle on"
                        : "cp-toggle"
                    }
                    onClick={() =>
                      updateNotificationSetting(
                        !notifications
                      )
                    }
                  >
                    <i></i>
                  </button>

                </div>

                <div className="cp-large-setting">

                  <div className="cp-large-setting-icon">
                    ✉️
                  </div>

                  <div>

                    <strong>
                      Email updates
                    </strong>

                    <p>
                      Receive important account and
                      service updates through email.
                    </p>

                  </div>

                  <button
                    className={
                      emailUpdates
                        ? "cp-toggle on"
                        : "cp-toggle"
                    }
                    onClick={() =>
                      updateEmailSetting(
                        !emailUpdates
                      )
                    }
                  >
                    <i></i>
                  </button>

                </div>

              </div>

            </div>


            <aside className="cp-settings-side">

              <div className="cp-security-card">

                <div className="cp-security-icon">
                  🛡️
                </div>

                <p className="cp-eyebrow">
                  ACCOUNT SECURITY
                </p>

                <h3>
                  Your account stays protected.
                </h3>

                <p>
                  Sahaayak uses authenticated access
                  to keep your bookings and account
                  information secure.
                </p>

                <div className="cp-security-status">
                  <span>✓</span>
                  Authentication active
                </div>

              </div>


              <div className="cp-danger-card">

                <p className="cp-eyebrow">
                  SESSION
                </p>

                <h3>
                  Sign out
                </h3>

                <p>
                  End your current Sahaayak session
                  on this device.
                </p>

                <button
                  onClick={() => {
                    localStorage.removeItem(
                      "token"
                    );

                    window.location.href =
                      "/login";
                  }}
                >
                  Sign out
                </button>

              </div>

            </aside>

          </section>

        )}

      </main>
    </>
  );
}


const styles = `

@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@500;600;700&display=swap');

* {
  box-sizing: border-box;
}

.cp-page {
  min-height: 100vh;
  background: #FFFFE3;
  color: #4A4A4A;
  font-family: 'Inter', sans-serif;
}

.cp-page button,
.cp-page input {
  font-family: inherit;
}


/* NAV */

.cp-nav {
  height: 78px;
  padding: 0 7%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(74,74,74,.09);
  background: rgba(255,255,227,.9);
  backdrop-filter: blur(14px);
  position: sticky;
  top: 0;
  z-index: 30;
}

.cp-logo {
  color: #6D8196;
  font-family: 'Poppins', sans-serif;
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 3px;
}

.cp-back,
.cp-home {
  border: 0;
  background: transparent;
  color: #6D8196;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}


/* HEADER */

.cp-header {
  width: min(1160px, 86%);
  margin: 0 auto;
  padding: 65px 0 45px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 30px;
}

.cp-eyebrow {
  margin: 0 0 12px;
  color: #6D8196;
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 1.9px;
}

.cp-header h1 {
  margin: 0;
  font-family: 'Poppins', sans-serif;
  font-size: clamp(38px, 5vw, 58px);
  line-height: 1.03;
  letter-spacing: -2px;
  color: #464646;
}

.cp-header h1 span {
  color: #6D8196;
}

.cp-header-text {
  max-width: 600px;
  margin: 22px 0 0;
  color: #858585;
  font-size: 14px;
  line-height: 1.75;
}

.cp-header-badge {
  padding: 11px 15px;
  border: 1px solid #d2d9dd;
  border-radius: 999px;
  background: #f1f3f3;
  color: #65798a;
  font-size: 10px;
  font-weight: 800;
  white-space: nowrap;
}

.cp-header-badge span {
  margin-right: 7px;
}


/* PROFILE OVERVIEW */

.cp-profile-overview {
  width: min(1160px, 86%);
  margin: 0 auto;
  padding: 27px;
  border: 1px solid #d8d8d0;
  border-radius: 25px;
  background: rgba(255,255,255,.8);
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 15px 40px rgba(74,74,74,.06);
}

.cp-avatar {
  width: 82px;
  height: 82px;
  flex-shrink: 0;
  border-radius: 25px;
  background: #6D8196;
  color: white;
  display: grid;
  place-items: center;
  font-family: 'Poppins', sans-serif;
  font-size: 32px;
  font-weight: 700;
  box-shadow: 0 12px 25px rgba(109,129,150,.2);
}

.cp-user-main {
  min-width: 220px;
}

.cp-user-name-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.cp-user-main h2 {
  margin: 0;
  font-family: 'Poppins', sans-serif;
  font-size: 24px;
}

.cp-user-main p {
  margin: 5px 0;
  color: #777;
  font-size: 12px;
}

.cp-user-main small {
  color: #aaa;
  font-size: 10px;
}

.cp-verified {
  padding: 5px 8px;
  border-radius: 999px;
  background: #e9f0eb;
  color: #687c6d;
  font-size: 8px;
  font-weight: 900;
}

.cp-mini-stats {
  margin-left: auto;
  display: flex;
  gap: 30px;
}

.cp-mini-stats div {
  min-width: 80px;
}

.cp-mini-stats strong {
  display: block;
  font-family: 'Poppins', sans-serif;
  font-size: 21px;
}

.cp-mini-stats span {
  color: #999;
  font-size: 9px;
}


/* TABS */

.cp-tabs {
  width: min(1160px, 86%);
  margin: 35px auto 0;
  border-bottom: 1px solid #d9d9d1;
  display: flex;
  gap: 30px;
}

.cp-tabs button {
  position: relative;
  padding: 13px 2px 15px;
  border: 0;
  background: transparent;
  color: #999;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.cp-tabs button.active {
  color: #6D8196;
}

.cp-tabs button.active::after {
  content: "";
  position: absolute;
  height: 2px;
  left: 0;
  right: 0;
  bottom: -1px;
  background: #6D8196;
}

.cp-tabs button span {
  margin-left: 6px;
  padding: 3px 6px;
  border-radius: 999px;
  background: #eef1f2;
  color: #6D8196;
  font-size: 8px;
}


/* CARDS */

.cp-overview-grid {
  width: min(1160px, 86%);
  margin: 35px auto 90px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.cp-card {
  padding: 28px;
  border: 1px solid #dcdcd4;
  border-radius: 23px;
  background: rgba(255,255,255,.75);
  box-shadow: 0 12px 32px rgba(74,74,74,.045);
}

.cp-card-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 15px;
  margin-bottom: 25px;
}

.cp-card-heading h3 {
  margin: 0;
  font-family: 'Poppins', sans-serif;
  font-size: 20px;
}

.cp-heading-icon {
  width: 43px;
  height: 43px;
  border-radius: 14px;
  background: #eef1f2;
  display: grid;
  place-items: center;
  font-size: 19px;
}

.cp-detail-list {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.cp-detail-list div {
  padding-bottom: 13px;
  border-bottom: 1px solid #e6e6df;
}

.cp-detail-list span,
.cp-history-details span {
  display: block;
  color: #aaa;
  font-size: 8px;
  font-weight: 900;
  letter-spacing: 1px;
  margin-bottom: 6px;
}

.cp-detail-list strong {
  font-size: 12px;
  word-break: break-word;
}


/* PREFERENCES */

.cp-setting {
  padding: 17px 0;
  border-top: 1px solid #e5e5df;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
}

.cp-setting strong {
  display: block;
  font-size: 12px;
}

.cp-setting span {
  display: block;
  margin-top: 5px;
  color: #999;
  font-size: 10px;
  line-height: 1.5;
}


/* TOGGLE */

.cp-toggle {
  width: 44px;
  height: 24px;
  flex-shrink: 0;
  padding: 3px;
  border: 0;
  border-radius: 999px;
  background: #d5d5cf;
  cursor: pointer;
  transition: .25s;
}

.cp-toggle i {
  display: block;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: white;
  transition: .25s;
}

.cp-toggle.on {
  background: #6D8196;
}

.cp-toggle.on i {
  transform: translateX(20px);
}


/* ACTIVITY */

.cp-activity-card {
  min-height: 350px;
}

.cp-view-all {
  border: 0;
  background: transparent;
  color: #6D8196;
  font-size: 10px;
  font-weight: 800;
  cursor: pointer;
}

.cp-recent-list {
  display: flex;
  flex-direction: column;
}

.cp-recent-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 0;
  border-top: 1px solid #e6e6df;
}

.cp-recent-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: #eef1f2;
  display: grid;
  place-items: center;
}

.cp-recent-info {
  flex: 1;
}

.cp-recent-info strong,
.cp-recent-info span {
  display: block;
}

.cp-recent-info strong {
  font-size: 12px;
}

.cp-recent-info span {
  margin-top: 4px;
  color: #aaa;
  font-size: 9px;
}

.cp-status {
  padding: 6px 9px;
  border-radius: 999px;
  font-size: 8px;
  font-weight: 900;
  white-space: nowrap;
}

.cp-status.pending {
  background: #f5eedc;
  color: #907a48;
}

.cp-status.accepted,
.cp-status.progress {
  background: #e8eef2;
  color: #62788a;
}

.cp-status.completed {
  background: #e8f0e9;
  color: #657d69;
}

.cp-status.rejected,
.cp-status.cancelled {
  background: #f3e9e9;
  color: #956d6d;
}


/* EMPTY */

.cp-empty-small {
  text-align: center;
  padding: 35px 10px;
}

.cp-empty-small span {
  font-size: 30px;
}

.cp-empty-small strong {
  display: block;
  margin-top: 12px;
  font-family: 'Poppins', sans-serif;
}

.cp-empty-small p {
  color: #999;
  font-size: 11px;
}


/* NETWORK CARD */

.cp-network-card {
  background: #6D8196;
  color: white;
  display: flex;
  align-items: center;
  gap: 25px;
  overflow: hidden;
  position: relative;
}

.cp-network-card .cp-eyebrow {
  color: rgba(255,255,255,.62);
}

.cp-network-card h3 {
  font-family: 'Poppins', sans-serif;
  font-size: 23px;
  line-height: 1.25;
  margin: 0;
}

.cp-network-card > div:last-child > p:last-child {
  color: rgba(255,255,255,.72);
  font-size: 11px;
  line-height: 1.6;
  max-width: 350px;
}

.cp-network-animation {
  width: 125px;
  height: 125px;
  flex-shrink: 0;
  position: relative;
  display: grid;
  place-items: center;
}

.cp-network-center {
  width: 55px;
  height: 55px;
  border-radius: 18px;
  background: rgba(255,255,255,.13);
  display: grid;
  place-items: center;
  font-size: 25px;
  position: relative;
  z-index: 4;
  animation: cpPulse 2.5s ease-in-out infinite;
}

.cp-network-orbit {
  position: absolute;
  border: 1px solid rgba(255,255,255,.25);
  border-radius: 50%;
}

.cp-network-orbit.one {
  width: 85px;
  height: 85px;
  animation: cpSpin 8s linear infinite;
}

.cp-network-orbit.two {
  width: 120px;
  height: 120px;
  border-style: dashed;
  animation: cpSpinReverse 13s linear infinite;
}

.cp-network-dot {
  position: absolute;
  width: 27px;
  height: 27px;
  border-radius: 9px;
  background: white;
  color: #6D8196;
  display: grid;
  place-items: center;
  font-size: 12px;
  z-index: 5;
}

.cp-network-dot.d1 {
  top: 0;
  left: 48px;
}

.cp-network-dot.d2 {
  bottom: 10px;
  left: 2px;
}

.cp-network-dot.d3 {
  right: 0;
  bottom: 20px;
}


/* HISTORY */

.cp-history {
  width: min(1160px, 86%);
  margin: 35px auto 90px;
}

.cp-history-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 20px;
  margin-bottom: 27px;
}

.cp-history-header h2 {
  margin: 0;
  font-family: 'Poppins', sans-serif;
  font-size: 31px;
}

.cp-history-header p:last-child {
  margin: 8px 0 0;
  color: #888;
  font-size: 12px;
}

.cp-book-btn {
  border: 0;
  border-radius: 11px;
  padding: 13px 17px;
  background: #6D8196;
  color: white;
  font-weight: 800;
  font-size: 11px;
  cursor: pointer;
  white-space: nowrap;
}

.cp-history-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.cp-history-card {
  padding: 22px;
  border: 1px solid #dcdcd4;
  border-radius: 21px;
  background: rgba(255,255,255,.78);
  display: flex;
  gap: 18px;
  transition: .25s;
}

.cp-history-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 15px 35px rgba(74,74,74,.07);
}

.cp-history-icon {
  width: 56px;
  height: 56px;
  flex-shrink: 0;
  border-radius: 17px;
  background: #eef1f2;
  display: grid;
  place-items: center;
  font-size: 22px;
}

.cp-history-main {
  width: 100%;
}

.cp-history-title {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
}

.cp-history-title span {
  color: #6D8196;
  font-size: 8px;
  font-weight: 900;
  letter-spacing: 1.3px;
}

.cp-history-title h3 {
  margin: 5px 0 0;
  font-family: 'Poppins', sans-serif;
  font-size: 17px;
}

.cp-history-details {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
  margin-top: 19px;
  padding-top: 15px;
  border-top: 1px solid #e5e5df;
}

.cp-history-details strong {
  font-size: 11px;
}

.cp-history-address {
  margin-top: 15px;
  color: #777;
  font-size: 11px;
}

.cp-history-description {
  margin-top: 10px;
  padding: 9px 11px;
  background: #f7f7f2;
  border-left: 3px solid #b0bdc6;
  color: #888;
  font-size: 10px;
}

.cp-history-empty {
  padding: 75px 20px;
  border: 1px dashed #cfcfc7;
  border-radius: 23px;
  text-align: center;
}

.cp-history-empty > div {
  font-size: 38px;
}

.cp-history-empty h3 {
  margin: 15px 0 7px;
  font-family: 'Poppins', sans-serif;
}

.cp-history-empty p {
  color: #999;
  font-size: 12px;
  margin-bottom: 20px;
}


/* SETTINGS */

.cp-settings {
  width: min(1160px, 86%);
  margin: 35px auto 90px;
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 20px;
}

.cp-settings-main {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.cp-settings-fields {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
}

.cp-field label {
  display: block;
  margin-bottom: 7px;
  font-size: 10px;
  font-weight: 800;
}

.cp-field input {
  width: 100%;
  padding: 13px;
  border: 1px solid #d8d8d0;
  border-radius: 10px;
  background: #f6f6f1;
  color: #666;
  outline: none;
  font-size: 12px;
}

.cp-field small {
  display: block;
  margin-top: 6px;
  color: #aaa;
  font-size: 9px;
}

.cp-info-note {
  display: flex;
  gap: 10px;
  margin-top: 25px;
  padding: 13px;
  border-radius: 11px;
  background: #eef1f2;
}

.cp-info-note span {
  color: #6D8196;
  font-weight: 900;
}

.cp-info-note p {
  margin: 0;
  color: #777;
  font-size: 10px;
  line-height: 1.5;
}

.cp-large-setting {
  padding: 20px 0;
  border-top: 1px solid #e4e4de;
  display: flex;
  align-items: center;
  gap: 15px;
}

.cp-large-setting-icon {
  width: 45px;
  height: 45px;
  flex-shrink: 0;
  border-radius: 14px;
  background: #eef1f2;
  display: grid;
  place-items: center;
}

.cp-large-setting > div:nth-child(2) {
  flex: 1;
}

.cp-large-setting strong {
  font-size: 12px;
}

.cp-large-setting p {
  margin: 5px 0 0;
  color: #999;
  font-size: 10px;
  line-height: 1.5;
}


/* SECURITY */

.cp-settings-side {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.cp-security-card {
  padding: 28px;
  border-radius: 23px;
  background: #6D8196;
  color: white;
}

.cp-security-icon {
  width: 55px;
  height: 55px;
  border-radius: 17px;
  background: rgba(255,255,255,.13);
  display: grid;
  place-items: center;
  font-size: 24px;
  margin-bottom: 23px;
}

.cp-security-card .cp-eyebrow {
  color: rgba(255,255,255,.62);
}

.cp-security-card h3 {
  font-family: 'Poppins', sans-serif;
  font-size: 21px;
  line-height: 1.3;
  margin: 0;
}

.cp-security-card > p:not(.cp-eyebrow) {
  color: rgba(255,255,255,.72);
  font-size: 11px;
  line-height: 1.6;
}

.cp-security-status {
  padding: 11px;
  border-radius: 10px;
  background: rgba(255,255,255,.1);
  font-size: 9px;
  font-weight: 800;
}

.cp-security-status span {
  margin-right: 7px;
}

.cp-danger-card {
  padding: 25px;
  border: 1px solid #dfd5d1;
  border-radius: 21px;
  background: #fffaf8;
}

.cp-danger-card h3 {
  margin: 0;
  font-family: 'Poppins', sans-serif;
}

.cp-danger-card p:not(.cp-eyebrow) {
  color: #999;
  font-size: 10px;
  line-height: 1.6;
}

.cp-danger-card button {
  width: 100%;
  padding: 11px;
  border: 1px solid #cdaead;
  border-radius: 10px;
  background: white;
  color: #956b6b;
  font-weight: 800;
  cursor: pointer;
}


/* LOADING */

.cp-loading {
  min-height: 100vh;
  background: #FFFFE3;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.cp-loader {
  width: 78px;
  height: 78px;
  display: grid;
  place-items: center;
  border: 2px solid rgba(109,129,150,.15);
  border-top-color: #6D8196;
  border-radius: 50%;
  font-size: 28px;
  animation: cpSpin 1s linear infinite;
}

.cp-loading > span {
  margin-top: 22px;
  color: #6D8196;
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 3px;
}

.cp-loading h2 {
  margin-top: 9px;
  font-family: 'Poppins', sans-serif;
  font-size: 20px;
}


/* ANIMATIONS */

@keyframes cpSpin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

@keyframes cpSpinReverse {
  from {
    transform: rotate(360deg);
  }

  to {
    transform: rotate(0deg);
  }
}

@keyframes cpPulse {
  0%, 100% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.08);
  }
}


/* RESPONSIVE */

@media (max-width: 900px) {

  .cp-profile-overview {
    flex-wrap: wrap;
  }

  .cp-mini-stats {
    width: 100%;
    margin-left: 0;
    padding-top: 20px;
    border-top: 1px solid #e5e5df;
    justify-content: space-between;
  }

  .cp-overview-grid {
    grid-template-columns: 1fr;
  }

  .cp-settings {
    grid-template-columns: 1fr;
  }

}

@media (max-width: 650px) {

  .cp-nav {
    padding: 0 5%;
  }

  .cp-header,
  .cp-profile-overview,
  .cp-tabs,
  .cp-overview-grid,
  .cp-history,
  .cp-settings {
    width: 90%;
  }

  .cp-header {
    padding-top: 40px;
    flex-direction: column;
    align-items: flex-start;
  }

  .cp-header h1 {
    font-size: 39px;
  }

  .cp-profile-overview {
    align-items: flex-start;
  }

  .cp-mini-stats {
    gap: 10px;
  }

  .cp-mini-stats div {
    min-width: 0;
  }

  .cp-tabs {
    gap: 17px;
    overflow-x: auto;
  }

  .cp-tabs button {
    white-space: nowrap;
  }

  .cp-card {
    padding: 21px;
  }

  .cp-detail-list,
  .cp-settings-fields {
    grid-template-columns: 1fr;
  }

  .cp-network-card {
    flex-direction: column;
    align-items: flex-start;
  }

  .cp-history-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .cp-history-card {
    flex-direction: column;
  }

  .cp-history-details {
    grid-template-columns: 1fr 1fr;
  }

  .cp-history-title {
    flex-direction: column;
    gap: 10px;
  }

  .cp-large-setting {
    align-items: flex-start;
  }

}

`;

export default CustomerProfile;