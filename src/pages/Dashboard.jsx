import { useEffect, useState } from "react";
import API_URL from "../config/api";

function Dashboard() {
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [reviewBooking, setReviewBooking] = useState(null);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);

  const token = localStorage.getItem("token");

  const fetchDashboard = async (showRefresh = false) => {
    try {
      if (showRefresh) setRefreshing(true);
      else setLoading(true);

      setError("");

      if (!token) {
        window.location.href = "/login";
        return;
      }

      const [userResponse, bookingsResponse] = await Promise.all([
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
      const bookingData = await bookingsResponse.json();

      if (!userResponse.ok) {
        localStorage.removeItem("token");
        window.location.href = "/login";
        return;
      }

      if (!bookingsResponse.ok) {
        setError(
          bookingData.message || "Unable to load bookings."
        );
      }

      setUser(userData.user);
      setBookings(bookingData.bookings || []);
    } catch (err) {
      console.error("Dashboard error:", err);
      setError("Unable to connect to the server.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboard();

    const interval = setInterval(() => {
      fetchDashboard(true);
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const getStatusText = (status) => {
    switch (status) {
      case "pending":
        return "Waiting for Provider";
      case "accepted":
        return "Provider Accepted";
      case "in-progress":
        return "Service In Progress";
      case "completed":
        return "Completed";
      case "rejected":
        return "Request Rejected";
      case "cancelled":
        return "Cancelled";
      default:
        return status;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "pending":
        return "sd-status-pending";
      case "accepted":
        return "sd-status-accepted";
      case "in-progress":
        return "sd-status-progress";
      case "completed":
        return "sd-status-completed";
      case "rejected":
        return "sd-status-rejected";
      case "cancelled":
        return "sd-status-cancelled";
      default:
        return "";
    }
  };

  const formatDate = (value) => {
    if (!value) return "Date unavailable";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "Date unavailable";
    }

    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (value) => {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "";

    return date.toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const submitReview = async () => {
    if (!reviewBooking) return;

    if (!reviewBooking.worker) {
      alert("There is no assigned provider for this booking.");
      return;
    }

    if (rating === 0) {
      alert("Please select a rating.");
      return;
    }

    try {
      setReviewLoading(true);

      const response = await fetch(`${API_URL}/api/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          worker: reviewBooking.worker._id,
          booking: reviewBooking._id,
          rating,
          comment: reviewText.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Unable to submit review.");
        return;
      }

      alert("Thank you! Your review has been submitted.");

      setReviewBooking(null);
      setRating(0);
      setReviewText("");

      fetchDashboard(true);
    } catch (err) {
      console.error("Review error:", err);
      alert("Unable to connect to the server.");
    } finally {
      setReviewLoading(false);
    }
  };

  const activeBookings = bookings.filter(
    (booking) =>
      !["completed", "cancelled", "rejected"].includes(
        booking.status
      )
  );

  const completedBookings = bookings.filter(
    (booking) => booking.status === "completed"
  );

  const goServices = () => {
    window.location.href = "/find-services";
  };

  if (loading) {
    return (
      <>
        <style>{dashboardStyles}</style>

        <div className="sd-loading-page">
          <div className="sd-loader-ring">
            <span>🤝</span>
          </div>

          <p>SAHAAYAK</p>
          <h2>Preparing your space...</h2>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{dashboardStyles}</style>

      <main className="sd-page">

        {/* =====================================================
            TOP NAV
        ===================================================== */}

        <nav className="sd-nav">
          <div
            className="sd-logo"
            onClick={() => {
              window.location.href = "/";
            }}
          >
            SAHAAYAK
          </div>

          <div className="sd-nav-links">
            <button onClick={goServices}>
              Services
            </button>

            <button
              onClick={() =>
                document
                  .getElementById("sd-bookings")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              My Bookings
            </button>

            <button
              onClick={() =>
                document
                  .getElementById("sd-support")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Support
            </button>
          </div>

          <button
            className="sd-nav-profile"
            onClick={() => {
              window.location.href = "/profile";
            }}
          >
            <span>
              {(user?.name || "C").charAt(0).toUpperCase()}
            </span>

            {user?.name || "Customer"}
          </button>
        </nav>


        {/* =====================================================
            HERO
        ===================================================== */}

        <section className="sd-hero">

          <div className="sd-hero-left">

            <p className="sd-eyebrow">
              SAHAAYAK · CUSTOMER SPACE
            </p>

            <h1>
              Welcome back,
              <br />
              <span>{user?.name || "Customer"}.</span>
            </h1>

            <p className="sd-hero-description">
              Everything you need to manage your local
              services, bookings and trusted providers.
            </p>

            <div className="sd-hero-actions">
              <button
                className="sd-primary-btn"
                onClick={goServices}
              >
                Find a Service
                <span>→</span>
              </button>

              <button
                className="sd-secondary-btn"
                onClick={() =>
                  document
                    .getElementById("sd-bookings")
                    ?.scrollIntoView({
                      behavior: "smooth",
                    })
                }
              >
                View My Bookings
              </button>
            </div>

          </div>


          {/* =================================================
              ANIMATED HERO VISUAL
              ================================================= */}

          <div className="sd-hero-visual">

            <div className="sd-orbit sd-orbit-one"></div>
            <div className="sd-orbit sd-orbit-two"></div>
            <div className="sd-orbit sd-orbit-three"></div>

            <div className="sd-hero-glow"></div>

            <div className="sd-float-icon sd-float-one">
              ⚡
            </div>

            <div className="sd-float-icon sd-float-two">
              🔧
            </div>

            <div className="sd-float-icon sd-float-three">
              📍
            </div>

            <div className="sd-float-icon sd-float-four">
              ⭐
            </div>

            <div className="sd-hero-card">

              <div className="sd-card-shine"></div>

              <div className="sd-card-top">

                <div className="sd-handshake">
                  🤝
                </div>

                <div className="sd-live">
                  <i></i>
                  LIVE
                </div>

              </div>

              <div className="sd-card-body">

                <p>
                  YOUR SAHAAYAK NETWORK
                </p>

                <h2>
                  Local help,
                  <br />
                  matched intelligently.
                </h2>

                <span>
                  Smart matching considers service,
                  location, availability and verification.
                </span>

              </div>

              <div className="sd-card-footer">

                <div className="sd-card-line line-long"></div>
                <div className="sd-card-line line-medium"></div>
                <div className="sd-card-line line-small"></div>

              </div>

            </div>

          </div>

        </section>


        {/* =====================================================
            ERROR
        ===================================================== */}

        {error && (
          <div className="sd-error">
            <span>!</span>
            {error}
          </div>
        )}


        {/* =====================================================
            QUICK STATS
        ===================================================== */}

        <section className="sd-stats">

          <div className="sd-stat-card">
            <div className="sd-stat-icon">📋</div>
            <div>
              <small>Total Bookings</small>
              <strong>{bookings.length}</strong>
            </div>
          </div>

          <div className="sd-stat-card">
            <div className="sd-stat-icon">↗</div>
            <div>
              <small>Active Requests</small>
              <strong>{activeBookings.length}</strong>
            </div>
          </div>

          <div className="sd-stat-card">
            <div className="sd-stat-icon">✓</div>
            <div>
              <small>Completed Services</small>
              <strong>{completedBookings.length}</strong>
            </div>
          </div>

          <div className="sd-stat-card">
            <div className="sd-stat-icon">★</div>
            <div>
              <small>Community Network</small>
              <strong>Local</strong>
            </div>
          </div>

        </section>


        {/* =====================================================
            SERVICES
        ===================================================== */}

        <section className="sd-section">

          <div className="sd-section-heading">

            <div>
              <p className="sd-eyebrow">
                POPULAR CATEGORIES
              </p>

              <h2>
                What do you need help with?
              </h2>
            </div>

            <button
              className="sd-text-button"
              onClick={goServices}
            >
              Explore all services →
            </button>

          </div>


          <div className="sd-service-grid">

            {[
              ["⚡", "Electrician"],
              ["🔧", "Plumber"],
              ["🪚", "Carpenter"],
              ["🧹", "Cleaning"],
              ["🎨", "Painting"],
              ["🌱", "Gardening"],
            ].map(([icon, name]) => (

              <button
                className="sd-service-card"
                key={name}
                onClick={() => {
                  window.location.href =
                    `/find-services?category=${encodeURIComponent(
                      name
                    )}`;
                }}
              >

                <div className="sd-service-icon">
                  {icon}
                </div>

                <div>
                  <strong>{name}</strong>
                  <small>Local services</small>
                </div>

                <span className="sd-service-arrow">
                  →
                </span>

              </button>

            ))}

          </div>

        </section>


        {/* =====================================================
            BOOKINGS
        ===================================================== */}

        <section
          className="sd-section sd-booking-section"
          id="sd-bookings"
        >

          <div className="sd-section-heading">

            <div>
              <p className="sd-eyebrow">
                YOUR ACTIVITY
              </p>

              <h2>
                My Bookings
              </h2>

              <p>
                Track your service requests in real time.
              </p>
            </div>

            <button
              className="sd-refresh-button"
              onClick={() => fetchDashboard(true)}
              disabled={refreshing}
            >
              {refreshing ? "Refreshing..." : "↻ Refresh"}
            </button>

          </div>


          {bookings.length === 0 ? (

            <div className="sd-empty">

              <div className="sd-empty-icon">
                📋
              </div>

              <h3>
                No bookings yet
              </h3>

              <p>
                Book your first local service and we'll
                find a suitable provider for you.
              </p>

              <button
                className="sd-primary-btn"
                onClick={goServices}
              >
                Find a Service →
              </button>

            </div>

          ) : (

            <div className="sd-bookings-list">

              {bookings.map((booking) => {

                const serviceName =
                  booking.service?.name ||
                  "Service Request";

                const workerName =
                  booking.worker?.name ||
                  booking.worker?.user?.name ||
                  null;

                return (

                  <article
                    className="sd-booking-card"
                    key={booking._id}
                  >

                    <div className="sd-booking-main">

                      <div className="sd-booking-icon">
                        🔧
                      </div>

                      <div className="sd-booking-info">

                        <div className="sd-booking-title-row">

                          <h3>
                            {serviceName}
                          </h3>

                          <span
                            className={`sd-status ${getStatusClass(
                              booking.status
                            )}`}
                          >
                            {getStatusText(
                              booking.status
                            )}
                          </span>

                        </div>

                        <p>
                          📍 {booking.address}
                        </p>

                        <p>
                          📅 {formatDate(
                            booking.scheduledDate
                          )}

                          <span> • </span>

                          ⏰ {formatTime(
                            booking.scheduledDate
                          )}
                        </p>

                        {booking.description && (
                          <div className="sd-description">
                            {booking.description}
                          </div>
                        )}

                      </div>

                    </div>


                    <div className="sd-booking-right">

                      {workerName ? (

                        <div className="sd-worker">

                          <small>
                            ASSIGNED PROVIDER
                          </small>

                          <strong>
                            👤 {workerName}
                          </strong>

                        </div>

                      ) : booking.status === "pending" ? (

                        <div className="sd-matching">
                          <span className="sd-matching-dot"></span>
                          🤖 Finding the best provider...
                        </div>

                      ) : null}


                      <div className="sd-price">
                        ₹{booking.price || 0}
                      </div>


                      {booking.status === "completed" &&
                        booking.worker && (

                          <button
                            className="sd-review-button"
                            onClick={() => {
                              setReviewBooking(booking);
                              setRating(0);
                              setReviewText("");
                            }}
                          >
                            ⭐ Rate Provider
                          </button>

                        )}

                    </div>

                  </article>

                );
              })}

            </div>

          )}

        </section>


        {/* =====================================================
            SMART MATCHING
        ===================================================== */}

        <section className="sd-smart-section">

          <div className="sd-smart-icon">
            🤖
          </div>

          <div className="sd-smart-content">

            <p className="sd-eyebrow">
              POWERED BY SMART MATCHING
            </p>

            <h2>
              We find the right provider for you.
            </h2>

            <p>
              Sahaayak considers service type,
              provider availability, verification,
              location and other matching factors
              to connect you with a suitable local worker.
            </p>

          </div>

          <div className="sd-smart-status">
            <span></span>
            Matching system active
          </div>

        </section>


        {/* =====================================================
            WHY SAHAAYAK
        ===================================================== */}

        <section className="sd-section">

          <div className="sd-section-heading">

            <div>
              <p className="sd-eyebrow">
                WHY SAHAAYAK?
              </p>

              <h2>
                Simple, trusted and community focused.
              </h2>
            </div>

          </div>


          <div className="sd-feature-grid">

            <div className="sd-feature-card">

              <div className="sd-feature-icon">
                ✓
              </div>

              <h3>
                Verified Providers
              </h3>

              <p>
                Providers are reviewed and verified
                before receiving service requests.
              </p>

            </div>


            <div className="sd-feature-card">

              <div className="sd-feature-icon">
                ⚡
              </div>

              <h3>
                Smart Matching
              </h3>

              <p>
                Our system automatically finds suitable
                available providers near you.
              </p>

            </div>


            <div className="sd-feature-card">

              <div className="sd-feature-icon">
                🤝
              </div>

              <h3>
                Community First
              </h3>

              <p>
                Connect with local service professionals
                and support your community.
              </p>

            </div>

          </div>

        </section>


        {/* =====================================================
            EMERGENCY
        ===================================================== */}

        <section className="sd-emergency">

          <div className="sd-emergency-left">

            <div className="sd-emergency-icon">
              🚨
            </div>

            <div>

              <p>
                NEED URGENT HELP?
              </p>

              <h3>
                Get local assistance when you need it.
              </h3>

              <span>
                Quickly find an available provider
                for urgent household requirements.
              </span>

            </div>

          </div>

          <button
            onClick={goServices}
          >
            Find Help →
          </button>

        </section>


        {/* =====================================================
            SUPPORT
        ===================================================== */}

        <section
          className="sd-support"
          id="sd-support"
        >

          <div>

            <p className="sd-eyebrow">
              SAHAAYAK SUPPORT
            </p>

            <h2>
              Need a little help?
            </h2>

            <p>
              We're building a simpler way to connect
              households with trusted local professionals.
            </p>

          </div>

          <div className="sd-support-pills">

            <span>🛡 Trusted</span>
            <span>📍 Local</span>
            <span>⚡ Fast</span>
            <span>🤝 Community</span>

          </div>

        </section>


        {/* =====================================================
            FOOTER
        ===================================================== */}

        <footer className="sd-footer">

          <div className="sd-logo">
            SAHAAYAK
          </div>

          <span>
            Reliable local services. Right when you need them.
          </span>

          <span>
            © 2026 Sahaayak
          </span>

        </footer>


        {/* =====================================================
            REVIEW MODAL
        ===================================================== */}

        {reviewBooking && (

          <div className="sd-modal-overlay">

            <div className="sd-review-modal">

              <button
                className="sd-modal-close"
                onClick={() => {
                  setReviewBooking(null);
                }}
              >
                ×
              </button>

              <div className="sd-review-icon">
                ⭐
              </div>

              <p className="sd-eyebrow">
                YOUR EXPERIENCE
              </p>

              <h2>
                Rate Your Provider
              </h2>

              <p className="sd-review-question">
                How was your experience with{" "}
                <strong>
                  {reviewBooking.worker?.name ||
                    reviewBooking.worker?.user?.name ||
                    "your provider"}
                </strong>
                ?
              </p>

              <div className="sd-stars">

                {[1, 2, 3, 4, 5].map((star) => (

                  <button
                    key={star}
                    className={
                      star <= rating
                        ? "sd-star active"
                        : "sd-star"
                    }
                    onClick={() => setRating(star)}
                  >
                    ★
                  </button>

                ))}

              </div>

              <p className="sd-rating-label">
                {rating === 0
                  ? "Select a rating"
                  : `${rating} out of 5`}
              </p>

              <textarea
                value={reviewText}
                onChange={(e) =>
                  setReviewText(e.target.value)
                }
                placeholder="Tell us about your experience..."
                rows="4"
              />

              <button
                className="sd-submit-review"
                onClick={submitReview}
                disabled={reviewLoading}
              >
                {reviewLoading
                  ? "Submitting..."
                  : "Submit Review"}
              </button>

            </div>

          </div>

        )}

      </main>
    </>
  );
}


const dashboardStyles = `

@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@500;600;700&display=swap');

* {
  box-sizing: border-box;
}

.sd-page {
  min-height: 100vh;
  background: #FFFFE3;
  color: #4A4A4A;
  font-family: 'Inter', sans-serif;
  overflow-x: hidden;
}

.sd-page button {
  font-family: inherit;
}


/* =========================================================
   NAV
   ========================================================= */

.sd-nav {
  height: 82px;
  padding: 0 7%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(74,74,74,.08);
  background: rgba(255,255,227,.88);
  backdrop-filter: blur(16px);
  position: sticky;
  top: 0;
  z-index: 50;
}

.sd-logo {
  font-family: 'Poppins', sans-serif;
  font-size: 17px;
  font-weight: 700;
  letter-spacing: 3px;
  color: #6D8196;
  cursor: pointer;
}

.sd-nav-links {
  display: flex;
  gap: 32px;
}

.sd-nav-links button {
  border: 0;
  background: transparent;
  color: #646464;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: .25s;
}

.sd-nav-links button:hover {
  color: #6D8196;
}

.sd-nav-profile {
  border: 1px solid #d8d8d0;
  background: #fff;
  border-radius: 999px;
  padding: 7px 14px 7px 7px;
  display: flex;
  align-items: center;
  gap: 9px;
  font-weight: 600;
  color: #4A4A4A;
  cursor: pointer;
}

.sd-nav-profile span {
  width: 31px;
  height: 31px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: #6D8196;
  color: #fff;
}


/* =========================================================
   HERO
   ========================================================= */

.sd-hero {
  width: min(1200px, 86%);
  min-height: 570px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  gap: 50px;
}

.sd-hero-left {
  position: relative;
  z-index: 4;
}

.sd-eyebrow {
  margin: 0 0 18px;
  color: #6D8196;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 2.2px;
}

.sd-hero h1 {
  margin: 0;
  font-family: 'Poppins', sans-serif;
  font-size: clamp(52px, 6vw, 78px);
  line-height: .98;
  letter-spacing: -3px;
  color: #444;
  font-weight: 600;
}

.sd-hero h1 span {
  color: #6D8196;
}

.sd-hero-description {
  max-width: 590px;
  margin: 31px 0 0;
  font-size: 17px;
  line-height: 1.8;
  color: #707070;
}

.sd-hero-actions {
  display: flex;
  gap: 14px;
  margin-top: 36px;
}

.sd-primary-btn,
.sd-secondary-btn {
  border-radius: 13px;
  padding: 16px 23px;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  transition: .25s ease;
}

.sd-primary-btn {
  border: 0;
  color: #fff;
  background: #6D8196;
  box-shadow: 0 13px 30px rgba(109,129,150,.24);
}

.sd-primary-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 18px 36px rgba(109,129,150,.3);
}

.sd-primary-btn span {
  margin-left: 13px;
  font-size: 18px;
}

.sd-secondary-btn {
  border: 1px solid #cfcfc6;
  color: #444;
  background: rgba(255,255,255,.45);
}

.sd-secondary-btn:hover {
  border-color: #6D8196;
  color: #6D8196;
  transform: translateY(-2px);
}


/* =========================================================
   ANIMATED HERO
   ========================================================= */

.sd-hero-visual {
  position: relative;
  min-height: 470px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sd-hero-glow {
  position: absolute;
  width: 310px;
  height: 310px;
  border-radius: 50%;
  background: rgba(109,129,150,.16);
  filter: blur(65px);
  animation: sdGlow 5s ease-in-out infinite;
}

.sd-orbit {
  position: absolute;
  border: 1px solid rgba(109,129,150,.18);
  border-radius: 50%;
  pointer-events: none;
}

.sd-orbit-one {
  width: 430px;
  height: 430px;
  animation: sdSpin 18s linear infinite;
}

.sd-orbit-two {
  width: 530px;
  height: 530px;
  border-style: dashed;
  border-color: rgba(109,129,150,.12);
  animation: sdSpinReverse 27s linear infinite;
}

.sd-orbit-three {
  width: 350px;
  height: 350px;
  border-color: rgba(109,129,150,.11);
  animation: sdSpin 13s linear infinite;
}

.sd-hero-card {
  position: relative;
  z-index: 5;
  width: min(420px, 85%);
  min-height: 345px;
  padding: 37px;
  border-radius: 31px;
  background: #6D8196;
  color: white;
  overflow: hidden;
  box-shadow:
    0 35px 70px rgba(74,74,74,.18),
    0 0 0 1px rgba(255,255,255,.08);
  animation: sdCardFloat 5s ease-in-out infinite;
}

.sd-card-shine {
  position: absolute;
  width: 230px;
  height: 230px;
  right: -100px;
  top: -100px;
  border-radius: 50%;
  background: rgba(255,255,255,.13);
  animation: sdShine 6s ease-in-out infinite;
}

.sd-card-top {
  position: relative;
  z-index: 2;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sd-handshake {
  width: 72px;
  height: 72px;
  border-radius: 23px;
  background: rgba(255,255,255,.13);
  display: grid;
  place-items: center;
  font-size: 34px;
  animation: sdHandshake 3s ease-in-out infinite;
}

.sd-live {
  padding: 9px 13px;
  border-radius: 999px;
  background: rgba(255,255,255,.13);
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1px;
}

.sd-live i {
  width: 6px;
  height: 6px;
  display: block;
  border-radius: 50%;
  background: #fff;
  animation: sdLive 1.4s ease-in-out infinite;
}

.sd-card-body {
  position: relative;
  z-index: 2;
  margin-top: 43px;
}

.sd-card-body p {
  margin: 0 0 16px;
  color: rgba(255,255,255,.68);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1.8px;
}

.sd-card-body h2 {
  margin: 0;
  font-family: 'Poppins', sans-serif;
  font-size: 31px;
  line-height: 1.18;
  font-weight: 600;
}

.sd-card-body span {
  display: block;
  max-width: 330px;
  margin-top: 22px;
  color: rgba(255,255,255,.78);
  font-size: 12px;
  line-height: 1.65;
}

.sd-card-footer {
  position: absolute;
  z-index: 2;
  bottom: 28px;
  left: 37px;
  right: 37px;
  display: flex;
  gap: 7px;
}

.sd-card-line {
  height: 3px;
  border-radius: 5px;
  background: rgba(255,255,255,.2);
  animation: sdLines 3s ease-in-out infinite;
}

.line-long {
  width: 45%;
}

.line-medium {
  width: 25%;
  animation-delay: .4s;
}

.line-small {
  width: 15%;
  animation-delay: .8s;
}


/* FLOATING ICONS */

.sd-float-icon {
  position: absolute;
  z-index: 8;
  width: 47px;
  height: 47px;
  display: grid;
  place-items: center;
  background: white;
  border: 1px solid #deded6;
  border-radius: 15px;
  box-shadow: 0 14px 30px rgba(74,74,74,.13);
  font-size: 19px;
}

.sd-float-one {
  top: 48px;
  left: 6%;
  animation: sdFloatOne 4s ease-in-out infinite;
}

.sd-float-two {
  right: 2%;
  top: 28%;
  animation: sdFloatTwo 5s ease-in-out infinite;
}

.sd-float-three {
  bottom: 60px;
  left: 7%;
  animation: sdFloatThree 4.5s ease-in-out infinite;
}

.sd-float-four {
  right: 8%;
  bottom: 13%;
  animation: sdFloatFour 5.5s ease-in-out infinite;
}


/* =========================================================
   ERROR
   ========================================================= */

.sd-error {
  width: min(1200px, 86%);
  margin: 0 auto 30px;
  padding: 14px 18px;
  border: 1px solid #dfc7c7;
  border-radius: 13px;
  background: #fff8f8;
  color: #9c5a5a;
  display: flex;
  align-items: center;
  gap: 10px;
}

.sd-error span {
  width: 24px;
  height: 24px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: #9c5a5a;
  color: #fff;
  font-weight: 800;
}


/* =========================================================
   STATS
   ========================================================= */

.sd-stats {
  width: min(1200px, 86%);
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 17px;
}

.sd-stat-card {
  min-height: 115px;
  padding: 23px;
  border: 1px solid #deded6;
  border-radius: 20px;
  background: rgba(255,255,255,.72);
  display: flex;
  align-items: center;
  gap: 17px;
  transition: .25s;
}

.sd-stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 15px 35px rgba(74,74,74,.08);
}

.sd-stat-icon {
  width: 50px;
  height: 50px;
  flex-shrink: 0;
  display: grid;
  place-items: center;
  border-radius: 16px;
  background: #eef1f2;
  color: #6D8196;
  font-size: 21px;
}

.sd-stat-card small {
  display: block;
  margin-bottom: 5px;
  color: #858585;
  font-size: 11px;
  font-weight: 600;
}

.sd-stat-card strong {
  font-family: 'Poppins', sans-serif;
  font-size: 22px;
  color: #484848;
}


/* =========================================================
   SECTIONS
   ========================================================= */

.sd-section {
  width: min(1200px, 86%);
  margin: 100px auto 0;
}

.sd-section-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 30px;
}

.sd-section-heading h2 {
  margin: 0;
  font-family: 'Poppins', sans-serif;
  font-size: 32px;
  line-height: 1.2;
  color: #484848;
}

.sd-section-heading > div > p:last-child {
  margin: 9px 0 0;
  color: #858585;
  font-size: 14px;
}

.sd-text-button {
  border: 0;
  background: transparent;
  color: #6D8196;
  font-weight: 700;
  cursor: pointer;
}


/* =========================================================
   SERVICES
   ========================================================= */

.sd-service-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 17px;
}

.sd-service-card {
  position: relative;
  min-height: 110px;
  padding: 22px;
  border: 1px solid #deded6;
  border-radius: 21px;
  background: #fff;
  display: flex;
  align-items: center;
  gap: 16px;
  text-align: left;
  cursor: pointer;
  transition: .3s ease;
  overflow: hidden;
}

.sd-service-card::after {
  content: "";
  position: absolute;
  width: 90px;
  height: 90px;
  right: -45px;
  bottom: -45px;
  border-radius: 50%;
  background: #eef1f2;
  transition: .3s;
}

.sd-service-card:hover {
  transform: translateY(-5px);
  border-color: #b8c2ca;
  box-shadow: 0 18px 40px rgba(74,74,74,.09);
}

.sd-service-card:hover::after {
  transform: scale(1.5);
}

.sd-service-icon {
  position: relative;
  z-index: 2;
  width: 54px;
  height: 54px;
  flex-shrink: 0;
  display: grid;
  place-items: center;
  border-radius: 17px;
  background: #eef1f2;
  font-size: 23px;
}

.sd-service-card strong,
.sd-service-card small {
  position: relative;
  z-index: 2;
  display: block;
}

.sd-service-card strong {
  font-size: 15px;
  color: #4a4a4a;
}

.sd-service-card small {
  margin-top: 5px;
  color: #999;
  font-size: 11px;
}

.sd-service-arrow {
  position: relative;
  z-index: 3;
  margin-left: auto;
  color: #6D8196;
  font-size: 20px;
}


/* =========================================================
   BOOKINGS
   ========================================================= */

.sd-booking-section {
  scroll-margin-top: 100px;
}

.sd-refresh-button {
  padding: 11px 16px;
  border: 1px solid #d3d3ca;
  border-radius: 11px;
  background: white;
  color: #555;
  font-weight: 700;
  cursor: pointer;
}

.sd-refresh-button:disabled {
  opacity: .55;
  cursor: default;
}

.sd-bookings-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.sd-booking-card {
  padding: 23px;
  border: 1px solid #deded6;
  border-radius: 22px;
  background: rgba(255,255,255,.8);
  display: flex;
  justify-content: space-between;
  gap: 25px;
  transition: .25s;
}

.sd-booking-card:hover {
  box-shadow: 0 18px 40px rgba(74,74,74,.08);
  transform: translateY(-2px);
}

.sd-booking-main {
  display: flex;
  gap: 17px;
  min-width: 0;
}

.sd-booking-icon {
  width: 55px;
  height: 55px;
  flex-shrink: 0;
  display: grid;
  place-items: center;
  border-radius: 17px;
  background: #eef1f2;
  font-size: 22px;
}

.sd-booking-info {
  min-width: 0;
}

.sd-booking-title-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.sd-booking-info h3 {
  margin: 0;
  font-family: 'Poppins', sans-serif;
  font-size: 18px;
  color: #454545;
}

.sd-booking-info p {
  margin: 7px 0 0;
  color: #858585;
  font-size: 12px;
}

.sd-description {
  max-width: 600px;
  margin-top: 10px;
  padding: 9px 11px;
  border-left: 3px solid #aebbc5;
  color: #777;
  background: #f7f7f2;
  font-size: 12px;
}

.sd-status {
  display: inline-flex;
  align-items: center;
  padding: 6px 9px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 800;
}

.sd-status-pending {
  background: #f7f0d9;
  color: #8c7540;
}

.sd-status-accepted {
  background: #e8f0f4;
  color: #5f7587;
}

.sd-status-progress {
  background: #e7eff0;
  color: #55747a;
}

.sd-status-completed {
  background: #e8f0e8;
  color: #648064;
}

.sd-status-rejected,
.sd-status-cancelled {
  background: #f3e9e9;
  color: #936c6c;
}

.sd-booking-right {
  min-width: 190px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;
  gap: 10px;
}

.sd-worker {
  text-align: right;
}

.sd-worker small {
  display: block;
  margin-bottom: 4px;
  color: #999;
  font-size: 9px;
  letter-spacing: 1px;
  font-weight: 800;
}

.sd-worker strong {
  font-size: 13px;
  color: #555;
}

.sd-price {
  font-family: 'Poppins', sans-serif;
  color: #6D8196;
  font-size: 20px;
  font-weight: 700;
}

.sd-matching {
  padding: 8px 11px;
  border-radius: 10px;
  background: #f3f5f5;
  color: #6f777b;
  font-size: 11px;
}

.sd-matching-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  margin-right: 6px;
  border-radius: 50%;
  background: #6D8196;
  animation: sdLive 1.5s infinite;
}

.sd-review-button {
  border: 1px solid #c8d0d5;
  border-radius: 9px;
  padding: 8px 12px;
  background: white;
  color: #65798a;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
}


/* =========================================================
   EMPTY
   ========================================================= */

.sd-empty {
  padding: 65px 25px;
  border: 1px dashed #cfcfc5;
  border-radius: 25px;
  text-align: center;
  background: rgba(255,255,255,.45);
}

.sd-empty-icon {
  width: 70px;
  height: 70px;
  margin: 0 auto 18px;
  display: grid;
  place-items: center;
  border-radius: 22px;
  background: #eef1f2;
  font-size: 28px;
}

.sd-empty h3 {
  margin: 0;
  font-family: 'Poppins', sans-serif;
  font-size: 22px;
}

.sd-empty p {
  max-width: 420px;
  margin: 10px auto 25px;
  color: #888;
  font-size: 13px;
  line-height: 1.6;
}


/* =========================================================
   SMART MATCHING
   ========================================================= */

.sd-smart-section {
  width: min(1200px, 86%);
  margin: 100px auto 0;
  padding: 38px;
  border-radius: 28px;
  background: #6D8196;
  color: white;
  display: flex;
  align-items: center;
  gap: 25px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 25px 50px rgba(109,129,150,.2);
}

.sd-smart-section::after {
  content: "";
  position: absolute;
  width: 300px;
  height: 300px;
  right: -100px;
  top: -130px;
  border-radius: 50%;
  border: 1px solid rgba(255,255,255,.13);
}

.sd-smart-icon {
  width: 75px;
  height: 75px;
  flex-shrink: 0;
  display: grid;
  place-items: center;
  border-radius: 23px;
  background: rgba(255,255,255,.13);
  font-size: 32px;
}

.sd-smart-content {
  position: relative;
  z-index: 2;
}

.sd-smart-content .sd-eyebrow {
  color: rgba(255,255,255,.62);
}

.sd-smart-content h2 {
  margin: 0;
  font-family: 'Poppins', sans-serif;
  font-size: 28px;
}

.sd-smart-content p:last-child {
  max-width: 700px;
  margin: 10px 0 0;
  color: rgba(255,255,255,.76);
  font-size: 13px;
  line-height: 1.7;
}

.sd-smart-status {
  margin-left: auto;
  white-space: nowrap;
  padding: 10px 14px;
  border-radius: 999px;
  background: rgba(255,255,255,.11);
  color: rgba(255,255,255,.8);
  font-size: 10px;
  font-weight: 700;
}

.sd-smart-status span {
  display: inline-block;
  width: 6px;
  height: 6px;
  margin-right: 7px;
  border-radius: 50%;
  background: white;
  animation: sdLive 1.5s infinite;
}


/* =========================================================
   FEATURES
   ========================================================= */

.sd-feature-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
}

.sd-feature-card {
  padding: 30px;
  border: 1px solid #deded6;
  border-radius: 23px;
  background: rgba(255,255,255,.72);
  transition: .3s;
}

.sd-feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 18px 40px rgba(74,74,74,.08);
}

.sd-feature-icon {
  width: 54px;
  height: 54px;
  display: grid;
  place-items: center;
  border-radius: 17px;
  background: #eef1f2;
  color: #6D8196;
  font-size: 21px;
  font-weight: 800;
}

.sd-feature-card h3 {
  margin: 21px 0 9px;
  font-family: 'Poppins', sans-serif;
  font-size: 18px;
}

.sd-feature-card p {
  margin: 0;
  color: #858585;
  font-size: 13px;
  line-height: 1.7;
}


/* =========================================================
   EMERGENCY
   ========================================================= */

.sd-emergency {
  width: min(1200px, 86%);
  margin: 70px auto 0;
  padding: 28px 30px;
  border: 1px solid #e1d3c5;
  border-radius: 22px;
  background: #fff9f1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 25px;
}

.sd-emergency-left {
  display: flex;
  align-items: center;
  gap: 17px;
}

.sd-emergency-icon {
  width: 54px;
  height: 54px;
  display: grid;
  place-items: center;
  border-radius: 17px;
  background: #f4e8da;
  font-size: 23px;
}

.sd-emergency p {
  margin: 0 0 5px;
  color: #9a7656;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 1.5px;
}

.sd-emergency h3 {
  margin: 0;
  font-family: 'Poppins', sans-serif;
  font-size: 18px;
}

.sd-emergency span {
  display: block;
  margin-top: 5px;
  color: #888;
  font-size: 12px;
}

.sd-emergency button {
  padding: 13px 19px;
  border: 0;
  border-radius: 11px;
  background: #6D8196;
  color: white;
  font-weight: 700;
  cursor: pointer;
}


/* =========================================================
   SUPPORT
   ========================================================= */

.sd-support {
  width: min(1200px, 86%);
  margin: 90px auto 0;
  padding: 45px;
  border: 1px solid #deded6;
  border-radius: 27px;
  background: rgba(255,255,255,.55);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 30px;
}

.sd-support h2 {
  margin: 0;
  font-family: 'Poppins', sans-serif;
  font-size: 30px;
}

.sd-support p:last-child {
  max-width: 520px;
  margin: 10px 0 0;
  color: #858585;
  font-size: 13px;
  line-height: 1.7;
}

.sd-support-pills {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
}

.sd-support-pills span {
  padding: 10px 13px;
  border: 1px solid #deded6;
  border-radius: 999px;
  background: white;
  color: #6d8196;
  font-size: 11px;
  font-weight: 700;
}


/* =========================================================
   FOOTER
   ========================================================= */

.sd-footer {
  width: min(1200px, 86%);
  margin: 70px auto 0;
  padding: 30px 0 35px;
  border-top: 1px solid #deded6;
  display: flex;
  align-items: center;
  gap: 25px;
  color: #999;
  font-size: 11px;
}

.sd-footer span:nth-last-child(1) {
  margin-left: auto;
}


/* =========================================================
   REVIEW MODAL
   ========================================================= */

.sd-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: rgba(45,45,45,.42);
  backdrop-filter: blur(7px);
  display: grid;
  place-items: center;
  padding: 20px;
}

.sd-review-modal {
  width: min(470px, 100%);
  padding: 38px;
  border-radius: 27px;
  background: #FFFFE3;
  box-shadow: 0 30px 80px rgba(0,0,0,.2);
  position: relative;
  animation: sdModal .3s ease;
}

.sd-modal-close {
  position: absolute;
  top: 17px;
  right: 18px;
  width: 32px;
  height: 32px;
  border: 0;
  border-radius: 50%;
  background: #efefea;
  font-size: 21px;
  color: #777;
  cursor: pointer;
}

.sd-review-icon {
  width: 65px;
  height: 65px;
  display: grid;
  place-items: center;
  margin-bottom: 20px;
  border-radius: 20px;
  background: #eef1f2;
  font-size: 27px;
}

.sd-review-modal h2 {
  margin: 0;
  font-family: 'Poppins', sans-serif;
  font-size: 28px;
}

.sd-review-question {
  color: #777;
  font-size: 13px;
  line-height: 1.6;
}

.sd-stars {
  display: flex;
  gap: 5px;
  margin: 20px 0 5px;
}

.sd-star {
  border: 0;
  background: transparent;
  color: #d3d3cc;
  font-size: 35px;
  cursor: pointer;
  transition: .2s;
}

.sd-star:hover,
.sd-star.active {
  color: #6D8196;
  transform: scale(1.1);
}

.sd-rating-label {
  color: #888;
  font-size: 11px;
}

.sd-review-modal textarea {
  width: 100%;
  margin-top: 15px;
  padding: 14px;
  border: 1px solid #d5d5cc;
  border-radius: 13px;
  background: white;
  resize: vertical;
  outline: none;
  font-family: inherit;
}

.sd-review-modal textarea:focus {
  border-color: #6D8196;
}

.sd-submit-review {
  width: 100%;
  margin-top: 14px;
  padding: 14px;
  border: 0;
  border-radius: 12px;
  background: #6D8196;
  color: white;
  font-weight: 700;
  cursor: pointer;
}

.sd-submit-review:disabled {
  opacity: .6;
}


/* =========================================================
   LOADING
   ========================================================= */

.sd-loading-page {
  min-height: 100vh;
  background: #FFFFE3;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-family: 'Inter', sans-serif;
}

.sd-loading-page p {
  margin-top: 25px;
  color: #6D8196;
  font-size: 11px;
  letter-spacing: 3px;
  font-weight: 800;
}

.sd-loading-page h2 {
  margin: 0;
  font-family: 'Poppins', sans-serif;
  color: #555;
}

.sd-loader-ring {
  width: 85px;
  height: 85px;
  display: grid;
  place-items: center;
  border: 2px solid rgba(109,129,150,.15);
  border-top-color: #6D8196;
  border-radius: 50%;
  animation: sdSpin 1.1s linear infinite;
}

.sd-loader-ring span {
  font-size: 30px;
  animation: sdSpinReverse 1.1s linear infinite;
}


/* =========================================================
   ANIMATIONS
   ========================================================= */

@keyframes sdCardFloat {
  0%, 100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-9px);
  }
}

@keyframes sdHandshake {
  0%, 100% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.08);
  }
}

@keyframes sdGlow {
  0%, 100% {
    transform: scale(1);
    opacity: .65;
  }

  50% {
    transform: scale(1.25);
    opacity: 1;
  }
}

@keyframes sdShine {
  0%, 100% {
    transform: translate(0,0);
  }

  50% {
    transform: translate(-35px,35px);
  }
}

@keyframes sdLive {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }

  50% {
    transform: scale(1.7);
    opacity: .45;
  }
}

@keyframes sdLines {
  0%, 100% {
    opacity: .25;
    transform: scaleX(1);
  }

  50% {
    opacity: .7;
    transform: scaleX(1.08);
  }
}

@keyframes sdSpin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

@keyframes sdSpinReverse {
  from {
    transform: rotate(360deg);
  }

  to {
    transform: rotate(0deg);
  }
}

@keyframes sdFloatOne {
  0%, 100% {
    transform: translate(0,0) rotate(-4deg);
  }

  50% {
    transform: translate(8px,-16px) rotate(5deg);
  }
}

@keyframes sdFloatTwo {
  0%, 100% {
    transform: translate(0,0) rotate(3deg);
  }

  50% {
    transform: translate(-10px,13px) rotate(-5deg);
  }
}

@keyframes sdFloatThree {
  0%, 100% {
    transform: translate(0,0);
  }

  50% {
    transform: translate(8px,-14px);
  }
}

@keyframes sdFloatFour {
  0%, 100% {
    transform: translate(0,0) rotate(4deg);
  }

  50% {
    transform: translate(-9px,-12px) rotate(-4deg);
  }
}

@keyframes sdModal {
  from {
    opacity: 0;
    transform: translateY(15px) scale(.97);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}


/* =========================================================
   RESPONSIVE
   ========================================================= */

@media (max-width: 950px) {

  .sd-hero {
    grid-template-columns: 1fr;
    padding: 65px 0 30px;
  }

  .sd-hero-left {
    text-align: center;
  }

  .sd-hero-description {
    margin-left: auto;
    margin-right: auto;
  }

  .sd-hero-actions {
    justify-content: center;
  }

  .sd-hero-visual {
    min-height: 430px;
  }

  .sd-stats {
    grid-template-columns: repeat(2, 1fr);
  }

  .sd-service-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .sd-feature-grid {
    grid-template-columns: 1fr;
  }

  .sd-smart-section {
    flex-wrap: wrap;
  }

  .sd-smart-status {
    margin-left: 0;
  }

}

@media (max-width: 650px) {

  .sd-nav {
    padding: 0 5%;
  }

  .sd-nav-links {
    display: none;
  }

  .sd-nav-profile {
    font-size: 0;
    padding: 5px;
  }

  .sd-nav-profile span {
    width: 34px;
    height: 34px;
  }

  .sd-hero {
    width: 90%;
  }

  .sd-hero h1 {
    font-size: 48px;
    letter-spacing: -2px;
  }

  .sd-hero-description {
    font-size: 15px;
  }

  .sd-hero-actions {
    flex-direction: column;
  }

  .sd-primary-btn,
  .sd-secondary-btn {
    width: 100%;
  }

  .sd-hero-visual {
    min-height: 380px;
  }

  .sd-hero-card {
    min-height: 310px;
    padding: 28px;
  }

  .sd-card-body {
    margin-top: 31px;
  }

  .sd-card-body h2 {
    font-size: 26px;
  }

  .sd-orbit-one {
    width: 360px;
    height: 360px;
  }

  .sd-orbit-two {
    width: 440px;
    height: 440px;
  }

  .sd-orbit-three {
    width: 300px;
    height: 300px;
  }

  .sd-float-icon {
    width: 38px;
    height: 38px;
    font-size: 15px;
  }

  .sd-stats {
    width: 90%;
    grid-template-columns: 1fr 1fr;
  }

  .sd-stat-card {
    min-height: 100px;
    padding: 15px;
  }

  .sd-stat-icon {
    width: 42px;
    height: 42px;
  }

  .sd-section,
  .sd-smart-section,
  .sd-emergency,
  .sd-support,
  .sd-footer {
    width: 90%;
  }

  .sd-section {
    margin-top: 70px;
  }

  .sd-section-heading {
    align-items: flex-start;
    flex-direction: column;
  }

  .sd-service-grid {
    grid-template-columns: 1fr;
  }

  .sd-booking-card {
    flex-direction: column;
  }

  .sd-booking-right {
    min-width: 0;
    align-items: flex-start;
    width: 100%;
  }

  .sd-worker {
    text-align: left;
  }

  .sd-smart-section {
    padding: 27px;
  }

  .sd-smart-content h2 {
    font-size: 23px;
  }

  .sd-emergency {
    align-items: flex-start;
    flex-direction: column;
  }

  .sd-emergency button {
    width: 100%;
  }

  .sd-support {
    flex-direction: column;
    align-items: flex-start;
    padding: 30px;
  }

  .sd-support-pills {
    justify-content: flex-start;
  }

  .sd-footer {
    flex-wrap: wrap;
  }

  .sd-footer span:nth-last-child(1) {
    margin-left: 0;
  }

}

`;

export default Dashboard;