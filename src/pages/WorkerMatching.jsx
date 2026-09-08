import { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import API_URL from "../config/api";

const CATEGORY_ICONS = {
  Electrician: "⚡",
  Plumber: "🔧",
  Carpenter: "🪚",
  Painter: "🎨",
  Cleaner: "🧹",
  "Appliance Repair": "🔩",
  Mason: "🧱",
  Gardener: "🌱",
  "AC & Refrigeration": "❄️",
};

function WorkerMatching() {
  const navigate = useNavigate();
  const location = useLocation();

  const params = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );

  const serviceId = params.get("service");
  const date = params.get("date");
  const time = params.get("time");
  const address = params.get("address");
  const lat = params.get("lat");
  const lng = params.get("lng");
  const description = params.get("description") || "";

  const [service, setService] = useState(null);
  const [worker, setWorker] = useState(null);

  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);

  const [error, setError] = useState("");
  const [noWorker, setNoWorker] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    findWorker();
  }, []);

  const findWorker = async () => {
    try {
      setLoading(true);
      setError("");
      setNoWorker(false);

      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      if (!serviceId || !lat || !lng) {
        setError("Service or location information is missing.");
        setLoading(false);
        return;
      }

      // Load service details
      const serviceResponse = await fetch(
        `${API_URL}/api/services/${serviceId}`
      );

      const serviceData = await serviceResponse.json();

      if (!serviceResponse.ok) {
        throw new Error(
          serviceData.message || "Unable to load service"
        );
      }

      setService(serviceData.service || serviceData);

      // Find actual matching worker
      const matchResponse = await fetch(
        `${API_URL}/api/bookings/preview-match`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            service: serviceId,
            location: {
              type: "Point",
              coordinates: [
                Number(lng),
                Number(lat),
              ],
            },
          }),
        }
      );

      const matchData = await matchResponse.json();

      if (!matchResponse.ok) {
        throw new Error(
          matchData.message || "Matching failed"
        );
      }

      if (
        !matchData.success ||
        !matchData.matchingWorkerFound ||
        !matchData.worker
      ) {
        setNoWorker(true);
        return;
      }

      setWorker(matchData.worker);
    } catch (err) {
      console.error("Worker matching error:", err);
      setError(
        err.message ||
          "Something went wrong while finding a worker."
      );
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 900);
    }
  };

  const createBooking = async () => {
    try {
      setBooking(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const scheduledDate = new Date(
        `${date}T${time}`
      ).toISOString();

      const response = await fetch(
        `${API_URL}/api/bookings`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            service: serviceId,
            scheduledDate,
            address,
            location: {
              type: "Point",
              coordinates: [
                Number(lng),
                Number(lat),
              ],
            },
            description,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to create booking"
        );
      }

      setSuccess(true);

      setTimeout(() => {
        navigate("/dashboard");
      }, 1800);
    } catch (err) {
      console.error("Booking error:", err);

      setError(
        err.message ||
          "Unable to confirm your booking."
      );
    } finally {
      setBooking(false);
    }
  };

  const workerName =
    worker?.name ||
    worker?.user?.name ||
    "Sahaayak Professional";

  const workerRating =
    worker?.rating ??
    worker?.averageRating ??
    0;

  const workerJobs =
    worker?.totalJobs ??
    worker?.completedJobs ??
    0;

  const workerExperience =
    worker?.experience ??
    worker?.experienceYears ??
    0;

  const workerOccupation =
    worker?.occupation ||
    service?.category ||
    "Service Professional";

  const workerInitial =
    workerName.charAt(0).toUpperCase();

  if (success) {
    return (
      <div className="wm-page">
        <div className="wm-success">
          <div className="wm-success-circle">
            ✓
          </div>

          <div className="wm-success-tag">
            BOOKING CONFIRMED
          </div>

          <h1>Your Sahaayak is on the way.</h1>

          <p>
            Your service request has been successfully
            created and assigned to {workerName}.
          </p>

          <div className="wm-success-card">
            <div className="wm-success-avatar">
              {workerInitial}
            </div>

            <div>
              <strong>{workerName}</strong>
              <span>{workerOccupation}</span>
            </div>
          </div>

          <span className="wm-redirect">
            Taking you to your dashboard...
          </span>
        </div>

        <style>{styles}</style>
      </div>
    );
  }

  return (
    <div className="wm-page">
      {/* NAVBAR */}
      <nav className="wm-nav">
        <button
          className="wm-back"
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>

        <div className="wm-logo">
          SAHAAYAK
        </div>

        <button
          className="wm-home"
          onClick={() => navigate("/")}
        >
          Home
        </button>
      </nav>

      <main className="wm-container">
        {/* LOADING */}
        {loading && (
          <section className="wm-loading">
            <div className="wm-animation">
              <div className="wm-ring wm-ring-one" />
              <div className="wm-ring wm-ring-two" />

              <div className="wm-center">
                {CATEGORY_ICONS[
                  service?.category
                ] || "🛠️"}
              </div>
            </div>

            <div className="wm-loading-label">
              SMART MATCHING
            </div>

            <h1>
              Finding your Sahaayak
            </h1>

            <p>
              Looking for the best available professional
              near you...
            </p>

            <div className="wm-progress">
              <span />
            </div>

            <div className="wm-steps">
              <div className="active">
                <b>✓</b>
                <span>Checking location</span>
              </div>

              <div className="active">
                <b>✓</b>
                <span>Checking availability</span>
              </div>

              <div>
                <b>03</b>
                <span>Choosing best match</span>
              </div>
            </div>
          </section>
        )}

        {/* ERROR */}
        {!loading && error && (
          <section className="wm-state">
            <div className="wm-state-icon">!</div>

            <div className="wm-loading-label">
              MATCHING ERROR
            </div>

            <h1>We couldn't find your Sahaayak.</h1>

            <p>{error}</p>

            <div className="wm-actions">
              <button
                className="wm-secondary-btn"
                onClick={() => navigate(-1)}
              >
                ← Change details
              </button>

              <button
                className="wm-primary-btn"
                onClick={findWorker}
              >
                Try again →
              </button>
            </div>
          </section>
        )}

        {/* NO WORKER */}
        {!loading && !error && noWorker && (
          <section className="wm-state">
            <div className="wm-state-icon muted">
              📍
            </div>

            <div className="wm-loading-label">
              NO MATCH FOUND
            </div>

            <h1>
              No nearby Sahaayak is available.
            </h1>

            <p>
              We couldn't find an available verified
              professional for this service within the
              current matching area.
            </p>

            <div className="wm-no-worker-card">
              <strong>
                What you can do
              </strong>

              <span>
                Try a different service time or check
                your service location.
              </span>
            </div>

            <button
              className="wm-primary-btn single"
              onClick={() => navigate(-1)}
            >
              Change booking details →
            </button>
          </section>
        )}

        {/* MATCH FOUND */}
        {!loading &&
          !error &&
          !noWorker &&
          worker && (
            <>
              <section className="wm-heading">
                <div>
                  <div className="wm-loading-label">
                    MATCH FOUND
                  </div>

                  <h1>
                    We found your Sahaayak.
                  </h1>

                  <p>
                    Based on your location, service and
                    worker availability.
                  </p>
                </div>

                <div className="wm-match-badge">
                  <span>✓</span>
                  Best match
                </div>
              </section>

              <section className="wm-grid">
                {/* WORKER */}
                <div className="wm-worker-card">
                  <div className="wm-worker-top">
                    <div className="wm-avatar">
                      {workerInitial}
                    </div>

                    <div className="wm-worker-info">
                      <span className="wm-verified">
                        ✓ VERIFIED PROFESSIONAL
                      </span>

                      <h2>{workerName}</h2>

                      <p>{workerOccupation}</p>
                    </div>
                  </div>

                  <div className="wm-stats">
                    <div>
                      <strong>
                        {Number(workerRating).toFixed(1)}
                      </strong>
                      <span>Rating</span>
                    </div>

                    <div>
                      <strong>
                        {workerJobs}
                      </strong>
                      <span>Jobs done</span>
                    </div>

                    <div>
                      <strong>
                        {workerExperience}
                      </strong>
                      <span>Years exp.</span>
                    </div>
                  </div>

                  <div className="wm-reasons">
                    <h3>
                      Why this worker?
                    </h3>

                    <div className="wm-reason">
                      <span>✓</span>
                      <div>
                        <strong>
                          Available
                        </strong>
                        <small>
                          Available for your requested
                          service time.
                        </small>
                      </div>
                    </div>

                    <div className="wm-reason">
                      <span>⌖</span>
                      <div>
                        <strong>
                          Nearby
                        </strong>
                        <small>
                          Selected using your service
                          location.
                        </small>
                      </div>
                    </div>

                    <div className="wm-reason">
                      <span>★</span>
                      <div>
                        <strong>
                          Trusted
                        </strong>
                        <small>
                          Worker rating and completed jobs
                          are considered.
                        </small>
                      </div>
                    </div>
                  </div>
                </div>

                {/* BOOKING SUMMARY */}
                <div className="wm-summary-card">
                  <div className="wm-summary-heading">
                    <span>
                      YOUR REQUEST
                    </span>

                    <div>
                      02 <small>/ 02</small>
                    </div>
                  </div>

                  <div className="wm-service-summary">
                    <div className="wm-service-icon">
                      {CATEGORY_ICONS[
                        service?.category
                      ] || "🛠️"}
                    </div>

                    <div>
                      <span>
                        {service?.category}
                      </span>

                      <strong>
                        {service?.name}
                      </strong>
                    </div>
                  </div>

                  <div className="wm-details">
                    <div>
                      <span>DATE</span>
                      <strong>
                        {date || "Not specified"}
                      </strong>
                    </div>

                    <div>
                      <span>TIME</span>
                      <strong>
                        {time || "Not specified"}
                      </strong>
                    </div>

                    <div className="full">
                      <span>ADDRESS</span>
                      <strong>
                        {address || "Not specified"}
                      </strong>
                    </div>

                    {description && (
                      <div className="full">
                        <span>JOB DETAILS</span>
                        <strong>
                          {description}
                        </strong>
                      </div>
                    )}
                  </div>

                  <div className="wm-price">
                    <span>
                      Starting service price
                    </span>

                    <strong>
                      ₹
                      {service?.basePrice ??
                        service?.price ??
                        "—"}
                    </strong>
                  </div>

                  {error && (
                    <div className="wm-booking-error">
                      {error}
                    </div>
                  )}

                  <button
                    className="wm-confirm-btn"
                    onClick={createBooking}
                    disabled={booking}
                  >
                    {booking ? (
                      <>
                        <span className="wm-small-spinner" />
                        Confirming...
                      </>
                    ) : (
                      <>
                        Confirm booking
                        <span>→</span>
                      </>
                    )}
                  </button>

                  <p className="wm-note">
                    You are not charged until the service
                    request is confirmed.
                  </p>
                </div>
              </section>
            </>
          )}
      </main>

      <footer className="wm-footer">
        <strong>SAHAAYAK</strong>

        <span>
          Reliable help. Right when you need it.
        </span>

        <span>
          © {new Date().getFullYear()}
        </span>
      </footer>

      <style>{styles}</style>
    </div>
  );
}

const styles = `
.wm-page {
  min-height: 100vh;
  background: #FFFFE3;
  color: #4A4A4A;
  font-family: 'Inter', sans-serif;
}

.wm-page *,
.wm-page *::before,
.wm-page *::after {
  box-sizing: border-box;
}

.wm-nav {
  height: 76px;
  padding: 0 6%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #CBCBCB;
  background: rgba(255,255,227,.94);
  backdrop-filter: blur(10px);
  position: sticky;
  top: 0;
  z-index: 20;
}

.wm-logo {
  font-family: 'Poppins', sans-serif;
  font-size: 23px;
  font-weight: 700;
  letter-spacing: 1.5px;
}

.wm-back,
.wm-home {
  border: none;
  background: transparent;
  color: #6D8196;
  font-weight: 700;
  cursor: pointer;
}

.wm-container {
  width: min(1080px, 90%);
  margin: auto;
  min-height: calc(100vh - 145px);
  padding: 55px 0 70px;
}

.wm-loading {
  min-height: 650px;
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: center;
  text-align: center;
}

.wm-animation {
  width: 180px;
  height: 180px;
  position: relative;
  display: grid;
  place-items: center;
  margin-bottom: 25px;
}

.wm-ring {
  position: absolute;
  border: 1px solid #AEBBC4;
  border-radius: 50%;
}

.wm-ring-one {
  width: 115px;
  height: 115px;
  animation: wm-spin 5s linear infinite;
}

.wm-ring-two {
  width: 175px;
  height: 175px;
  border-style: dashed;
  animation: wm-spin-reverse 8s linear infinite;
}

.wm-center {
  width: 72px;
  height: 72px;
  border-radius: 22px;
  background: #FFFFFF;
  border: 1px solid #CBD3D9;
  box-shadow: 0 12px 30px rgba(74,74,74,.1);
  display: grid;
  place-items: center;
  font-size: 32px;
  z-index: 2;
  animation: wm-pulse 1.8s ease-in-out infinite;
}

@keyframes wm-spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes wm-spin-reverse {
  to {
    transform: rotate(-360deg);
  }
}

@keyframes wm-pulse {
  50% {
    transform: scale(1.08);
  }
}

.wm-loading-label,
.wm-summary-heading > span {
  color: #6D8196;
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 1.7px;
}

.wm-loading h1,
.wm-state h1 {
  font-family: 'Poppins', sans-serif;
  font-size: clamp(30px, 4vw, 46px);
  margin: 9px 0;
}

.wm-loading p,
.wm-state p {
  margin: 0;
  color: #888;
  font-size: 14px;
}

.wm-progress {
  width: 300px;
  height: 4px;
  margin: 27px 0;
  overflow: hidden;
  background: #E2E2DC;
  border-radius: 10px;
}

.wm-progress span {
  display: block;
  height: 100%;
  width: 55%;
  background: #6D8196;
  animation: wm-progress 1.5s ease-in-out infinite;
}

@keyframes wm-progress {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(280%);
  }
}

.wm-steps {
  display: flex;
  gap: 22px;
  justify-content: center;
  flex-wrap: wrap;
}

.wm-steps div {
  display: flex;
  align-items: center;
  gap: 7px;
  color: #AAA;
  font-size: 11px;
}

.wm-steps b {
  width: 23px;
  height: 23px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: #E8E8E2;
  font-size: 9px;
}

.wm-steps .active {
  color: #6D8196;
}

.wm-steps .active b {
  background: #DCE3E8;
}

.wm-state {
  min-height: 600px;
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: center;
  text-align: center;
  max-width: 650px;
  margin: auto;
}

.wm-state-icon {
  width: 72px;
  height: 72px;
  border-radius: 22px;
  background: #F0E8E8;
  color: #8A6666;
  display: grid;
  place-items: center;
  font-size: 28px;
  font-weight: 900;
  margin-bottom: 25px;
}

.wm-state-icon.muted {
  background: #EEF1F3;
  color: #6D8196;
}

.wm-actions {
  display: flex;
  gap: 12px;
  margin-top: 30px;
}

.wm-primary-btn,
.wm-secondary-btn {
  padding: 13px 20px;
  border-radius: 11px;
  font-weight: 800;
  cursor: pointer;
  font-family: inherit;
}

.wm-primary-btn {
  border: none;
  background: #6D8196;
  color: #FFFFFF;
}

.wm-secondary-btn {
  border: 1px solid #C7C7C1;
  background: #FFFFFF;
  color: #6D8196;
}

.wm-primary-btn.single {
  margin-top: 25px;
}

.wm-no-worker-card {
  margin-top: 28px;
  padding: 18px 25px;
  border-radius: 15px;
  background: #FFFFFF;
  border: 1px solid #CBCBCB;
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-width: 430px;
}

.wm-no-worker-card strong {
  font-family: 'Poppins', sans-serif;
}

.wm-no-worker-card span {
  color: #888;
  font-size: 12px;
}

.wm-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 30px;
}

.wm-heading h1 {
  font-family: 'Poppins', sans-serif;
  font-size: clamp(30px, 4vw, 44px);
  margin: 7px 0;
}

.wm-heading p {
  margin: 0;
  color: #888;
  font-size: 13px;
}

.wm-match-badge {
  padding: 10px 15px;
  background: #EEF2EF;
  border: 1px solid #CDD7D0;
  border-radius: 999px;
  color: #657A6C;
  font-size: 11px;
  font-weight: 800;
  white-space: nowrap;
}

.wm-match-badge span {
  margin-right: 6px;
}

.wm-grid {
  display: grid;
  grid-template-columns: 1.05fr .95fr;
  gap: 25px;
}

.wm-worker-card,
.wm-summary-card {
  background: #FFFFFF;
  border: 1px solid #CBCBCB;
  border-radius: 24px;
  box-shadow: 0 14px 40px rgba(74,74,74,.07);
}

.wm-worker-card {
  padding: 32px;
}

.wm-worker-top {
  display: flex;
  align-items: center;
  gap: 20px;
}

.wm-avatar {
  width: 86px;
  height: 86px;
  flex-shrink: 0;
  border-radius: 25px;
  background: #EEF1F3;
  border: 1px solid #CBD3D9;
  display: grid;
  place-items: center;
  font-family: 'Poppins', sans-serif;
  font-size: 34px;
  font-weight: 700;
  color: #6D8196;
}

.wm-worker-info h2 {
  margin: 5px 0 3px;
  font-family: 'Poppins', sans-serif;
  font-size: 25px;
}

.wm-worker-info p {
  margin: 0;
  color: #777;
  font-size: 13px;
}

.wm-verified {
  color: #657A6C;
  font-size: 9px;
  font-weight: 900;
  letter-spacing: 1px;
}

.wm-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  margin: 30px 0;
  padding: 20px 0;
  border-top: 1px solid #E1E1DB;
  border-bottom: 1px solid #E1E1DB;
}

.wm-stats div {
  text-align: center;
  border-right: 1px solid #E1E1DB;
}

.wm-stats div:last-child {
  border: none;
}

.wm-stats strong {
  display: block;
  font-family: 'Poppins', sans-serif;
  font-size: 23px;
}

.wm-stats span {
  color: #999;
  font-size: 10px;
}

.wm-reasons h3 {
  font-family: 'Poppins', sans-serif;
  font-size: 17px;
  margin: 0 0 15px;
}

.wm-reason {
  display: flex;
  gap: 12px;
  padding: 12px;
  border-radius: 12px;
  background: #FAFAF5;
  margin-bottom: 9px;
}

.wm-reason > span {
  width: 30px;
  height: 30px;
  flex-shrink: 0;
  border-radius: 9px;
  background: #E9EDF0;
  color: #6D8196;
  display: grid;
  place-items: center;
  font-size: 12px;
  font-weight: 900;
}

.wm-reason strong,
.wm-reason small {
  display: block;
}

.wm-reason strong {
  font-size: 12px;
}

.wm-reason small {
  margin-top: 3px;
  color: #999;
  font-size: 10px;
}

.wm-summary-card {
  padding: 30px;
}

.wm-summary-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 23px;
}

.wm-summary-heading > div {
  color: #6D8196;
  font-weight: 900;
  font-size: 13px;
}

.wm-summary-heading small {
  color: #AAA;
}

.wm-service-summary {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 17px;
  border-radius: 15px;
  background: #EEF1F3;
  border: 1px solid #D2D8DC;
}

.wm-service-icon {
  width: 48px;
  height: 48px;
  border-radius: 13px;
  background: #FFFFFF;
  display: grid;
  place-items: center;
  font-size: 23px;
}

.wm-service-summary span,
.wm-service-summary strong {
  display: block;
}

.wm-service-summary span {
  color: #6D8196;
  font-size: 10px;
  font-weight: 800;
}

.wm-service-summary strong {
  margin-top: 3px;
  font-family: 'Poppins', sans-serif;
  font-size: 16px;
}

.wm-details {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin: 23px 0;
}

.wm-details div {
  padding-bottom: 14px;
  border-bottom: 1px solid #E4E4DE;
}

.wm-details div.full {
  grid-column: 1 / -1;
}

.wm-details span {
  display: block;
  color: #AAA;
  font-size: 9px;
  font-weight: 900;
  letter-spacing: 1px;
  margin-bottom: 5px;
}

.wm-details strong {
  font-size: 12px;
  line-height: 1.5;
}

.wm-price {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 0;
}

.wm-price span {
  color: #888;
  font-size: 11px;
}

.wm-price strong {
  font-family: 'Poppins', sans-serif;
  font-size: 25px;
}

.wm-confirm-btn {
  width: 100%;
  border: none;
  border-radius: 13px;
  padding: 16px;
  background: #6D8196;
  color: #FFFFFF;
  font-family: inherit;
  font-size: 13px;
  font-weight: 900;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
}

.wm-confirm-btn:hover {
  background: #5D7185;
}

.wm-confirm-btn:disabled {
  opacity: .7;
  cursor: wait;
}

.wm-small-spinner {
  width: 17px;
  height: 17px;
  border: 2px solid rgba(255,255,255,.4);
  border-top-color: #FFFFFF;
  border-radius: 50%;
  animation: wm-spin 0.7s linear infinite;
}

.wm-note {
  text-align: center;
  color: #AAA;
  font-size: 9px;
  margin: 12px 0 0;
}

.wm-booking-error {
  padding: 11px;
  margin-bottom: 10px;
  border-radius: 9px;
  background: #F4EAEA;
  color: #8A6666;
  font-size: 11px;
  font-weight: 700;
}

.wm-success {
  min-height: 75vh;
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: center;
  text-align: center;
  max-width: 550px;
  margin: auto;
}

.wm-success-circle {
  width: 82px;
  height: 82px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: #E7EEE9;
  border: 1px solid #C8D5CC;
  color: #657A6C;
  font-size: 35px;
  font-weight: 900;
  margin-bottom: 25px;
}

.wm-success h1 {
  font-family: 'Poppins', sans-serif;
  font-size: 38px;
  margin: 9px 0;
}

.wm-success p {
  color: #888;
  line-height: 1.6;
  font-size: 13px;
}

.wm-success-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 20px;
  margin: 25px 0;
  background: #FFFFFF;
  border: 1px solid #CBCBCB;
  border-radius: 16px;
  text-align: left;
}

.wm-success-avatar {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: #EEF1F3;
  color: #6D8196;
  display: grid;
  place-items: center;
  font-weight: 800;
}

.wm-success-card strong,
.wm-success-card span {
  display: block;
}

.wm-success-card strong {
  font-family: 'Poppins', sans-serif;
}

.wm-success-card span {
  color: #888;
  font-size: 11px;
  margin-top: 3px;
}

.wm-redirect {
  color: #AAA;
  font-size: 10px;
}

.wm-footer {
  min-height: 69px;
  padding: 20px 6%;
  border-top: 1px solid #CBCBCB;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #999;
  font-size: 10px;
}

.wm-footer strong {
  color: #6D8196;
  letter-spacing: 1px;
}

@media (max-width: 850px) {
  .wm-grid {
    grid-template-columns: 1fr;
  }

  .wm-summary-card {
    order: -1;
  }
}

@media (max-width: 600px) {
  .wm-nav {
    padding: 0 5%;
  }

  .wm-logo {
    font-size: 19px;
  }

  .wm-container {
    width: 92%;
    padding-top: 30px;
  }

  .wm-heading {
    align-items: flex-start;
    flex-direction: column;
  }

  .wm-worker-card,
  .wm-summary-card {
    padding: 21px;
    border-radius: 20px;
  }

  .wm-worker-top {
    align-items: flex-start;
  }

  .wm-avatar {
    width: 70px;
    height: 70px;
    border-radius: 19px;
  }

  .wm-worker-info h2 {
    font-size: 21px;
  }

  .wm-stats {
    margin: 22px 0;
  }

  .wm-actions {
    flex-direction: column;
    width: 100%;
  }

  .wm-primary-btn,
  .wm-secondary-btn {
    width: 100%;
  }

  .wm-details {
    grid-template-columns: 1fr;
  }

  .wm-details div.full {
    grid-column: auto;
  }

  .wm-footer {
    flex-direction: column;
    gap: 7px;
  }

  .wm-success h1 {
    font-size: 30px;
  }
}
`;

export default WorkerMatching;