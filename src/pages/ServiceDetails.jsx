import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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

function ServiceDetails() {
  const location = useLocation();
  const navigate = useNavigate();

  const params = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );

  const serviceId = params.get("service");
  const existingLat = params.get("lat");
  const existingLng = params.get("lng");

  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");

  const [lat, setLat] = useState(existingLat || "");
  const [lng, setLng] = useState(existingLng || "");
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationMessage, setLocationMessage] = useState("");

  useEffect(() => {
    const loadService = async () => {
      if (!serviceId) {
        setError("No service was selected.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/api/services/${serviceId}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load service");
        }

        setService(data.service || data);
      } catch (err) {
        console.error("Service details error:", err);
        setError(err.message || "Unable to load service details.");
      } finally {
        setLoading(false);
      }
    };

    loadService();
  }, [serviceId]);

  const getLocation = () => {
    if (!navigator.geolocation) {
      setLocationMessage("Location is not supported by this browser.");
      return;
    }

    setLocationLoading(true);
    setLocationMessage("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLat(position.coords.latitude);
        setLng(position.coords.longitude);
        setLocationLoading(false);
        setLocationMessage("Location captured successfully.");
      },
      () => {
        setLocationLoading(false);
        setLocationMessage(
          "Unable to access your location. Please allow location permission."
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleContinue = (e) => {
    e.preventDefault();

    if (!date || !time || !address.trim()) {
      setError("Please enter the date, time and service address.");
      return;
    }

    if (!lat || !lng) {
      setError("Please use your current location before continuing.");
      return;
    }

    setError("");

    const query = new URLSearchParams({
      service: serviceId,
      date,
      time,
      address: address.trim(),
      lat: String(lat),
      lng: String(lng),
      description: description.trim(),
    });

    navigate(`/worker-matching?${query.toString()}`);
  };

  const icon =
    CATEGORY_ICONS[service?.category] ||
    service?.icon ||
    "🛠️";

  if (loading) {
    return (
      <div className="sd-page">
        <div className="sd-loading">
          <div className="sd-loader">🛠️</div>
          <h2>Loading service</h2>
          <p>Preparing the details for you...</p>
        </div>

        <style>{styles}</style>
      </div>
    );
  }

  if (error && !service) {
    return (
      <div className="sd-page">
        <nav className="sd-nav">
          <button
            className="sd-back-btn"
            onClick={() => navigate(-1)}
          >
            ← Back
          </button>

          <div className="sd-brand">SAHAAYAK</div>

          <button
            className="sd-home-btn"
            onClick={() => navigate("/")}
          >
            Home
          </button>
        </nav>

        <div className="sd-error-screen">
          <div className="sd-error-icon">!</div>
          <h2>Service unavailable</h2>
          <p>{error}</p>

          <button
            className="sd-primary-btn"
            onClick={() => navigate("/find-services")}
          >
            Browse Services
          </button>
        </div>

        <style>{styles}</style>
      </div>
    );
  }

  return (
    <div className="sd-page">
      {/* NAVBAR */}
      <nav className="sd-nav">
        <button
          className="sd-back-btn"
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>

        <div className="sd-brand">SAHAAYAK</div>

        <div className="sd-nav-links">
          <button onClick={() => navigate("/find-services")}>
            Services
          </button>
          <button onClick={() => navigate("/")}>
            Home
          </button>
        </div>
      </nav>

      {/* MAIN */}
      <main className="sd-container">
        {/* SERVICE HEADER */}
        <section className="sd-service-header">
          <div className="sd-service-icon">
            {icon}
          </div>

          <div className="sd-title-area">
            <div className="sd-category">
              {service?.category || "Home Service"}
            </div>

            <h1>{service?.name || "Service"}</h1>

            <p>
              {service?.description ||
                "Professional local assistance whenever you need it."}
            </p>

            <div className="sd-trust-row">
              <span>
                ✓ Verified professionals
              </span>

              <span>
                📍 Nearby workers
              </span>

              <span>
                ★ Trusted service
              </span>
            </div>
          </div>

          <div className="sd-price-box">
            <span>Starting from</span>

            <strong>
              ₹{service?.basePrice ?? service?.price ?? "—"}
            </strong>

            <small>
              {service?.estimatedDuration
                ? `${service.estimatedDuration} min`
                : service?.duration
                ? `${service.duration} min`
                : "Flexible duration"}
            </small>
          </div>
        </section>

        {/* CONTENT */}
        <section className="sd-content">
          {/* LEFT INFORMATION */}
          <div className="sd-info-column">
            <div className="sd-info-card">
              <div className="sd-card-heading">
                <span className="sd-heading-icon">✓</span>
                <div>
                  <h2>What you can expect</h2>
                  <p>Simple, reliable service through Sahaayak.</p>
                </div>
              </div>

              <div className="sd-expect-list">
                <div className="sd-expect-item">
                  <div>01</div>
                  <span>
                    Your request is matched with an available
                    local professional.
                  </span>
                </div>

                <div className="sd-expect-item">
                  <div>02</div>
                  <span>
                    The closest suitable worker is prioritised
                    using smart matching.
                  </span>
                </div>

                <div className="sd-expect-item">
                  <div>03</div>
                  <span>
                    Track the service and get it completed at
                    your preferred time.
                  </span>
                </div>
              </div>
            </div>

            <div className="sd-info-card sd-safety-card">
              <div className="sd-safety-icon">🛡️</div>

              <div>
                <h3>Verified local professionals</h3>
                <p>
                  Sahaayak connects you with workers based on
                  service category, availability and location.
                </p>
              </div>
            </div>

            <div className="sd-info-card sd-match-card">
              <div className="sd-match-top">
                <span className="sd-match-icon">◎</span>

                <div>
                  <h3>Smart worker matching</h3>
                  <p>
                    We'll find the best available professional
                    near your service location.
                  </p>
                </div>
              </div>

              <div className="sd-match-points">
                <span>Location</span>
                <span>Availability</span>
                <span>Service</span>
                <span>Ratings</span>
              </div>
            </div>
          </div>

          {/* BOOKING FORM */}
          <div className="sd-booking-card">
            <div className="sd-form-header">
              <div>
                <span>BOOK A SERVICE</span>
                <h2>Tell us when and where</h2>
              </div>

              <div className="sd-step">
                1 <span>/ 2</span>
              </div>
            </div>

            <form onSubmit={handleContinue}>
              {/* DATE + TIME */}
              <div className="sd-field-row">
                <div className="sd-field">
                  <label>
                    Preferred date
                  </label>

                  <input
                    type="date"
                    value={date}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </div>

                <div className="sd-field">
                  <label>
                    Preferred time
                  </label>

                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* ADDRESS */}
              <div className="sd-field">
                <div className="sd-label-row">
                  <label>
                    Service address
                  </label>

                  <span>Required</span>
                </div>

                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter the address where the service is required"
                  rows="3"
                  required
                />
              </div>

              {/* LOCATION */}
              <div className="sd-location-box">
                <div className="sd-location-left">
                  <div className="sd-location-icon">
                    📍
                  </div>

                  <div>
                    <strong>
                      Your service location
                    </strong>

                    <p>
                      {lat && lng
                        ? "Location coordinates captured"
                        : "Required for smart worker matching"}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  className="sd-location-btn"
                  onClick={getLocation}
                  disabled={locationLoading}
                >
                  {locationLoading
                    ? "Locating..."
                    : lat && lng
                    ? "Update"
                    : "Use my location"}
                </button>
              </div>

              {locationMessage && (
                <div
                  className={`sd-location-message ${
                    locationMessage.includes("successfully")
                      ? "success"
                      : "warning"
                  }`}
                >
                  {locationMessage}
                </div>
              )}

              {/* DESCRIPTION */}
              <div className="sd-field">
                <div className="sd-label-row">
                  <label>
                    Additional details
                  </label>

                  <span>Optional</span>
                </div>

                <textarea
                  value={description}
                  onChange={(e) =>
                    setDescription(e.target.value)
                  }
                  placeholder="Tell the worker anything useful about the job..."
                  rows="3"
                />
              </div>

              {error && (
                <div className="sd-form-error">
                  <span>!</span>
                  {error}
                </div>
              )}

              {/* SUMMARY */}
              <div className="sd-summary">
                <div>
                  <span>Service</span>
                  <strong>
                    {service?.name}
                  </strong>
                </div>

                <div>
                  <span>Starting price</span>
                  <strong>
                    ₹{service?.basePrice ?? service?.price ?? "—"}
                  </strong>
                </div>
              </div>

              <button
                type="submit"
                className="sd-continue-btn"
              >
                <span>Find my Sahaayak</span>
                <span>→</span>
              </button>

              <p className="sd-form-note">
                Your request will be matched with an available
                professional based on your location and service.
              </p>
            </form>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="sd-footer">
        <div>
          <strong>SAHAAYAK</strong>
          <span>
            Reliable help. Right when you need it.
          </span>
        </div>

        <span>
          © {new Date().getFullYear()} Sahaayak
        </span>
      </footer>

      <style>{styles}</style>
    </div>
  );
}

const styles = `
.sd-page {
  min-height: 100vh;
  background: #FFFFE3;
  color: #4A4A4A;
  font-family: 'Inter', sans-serif;
}

.sd-page *,
.sd-page *::before,
.sd-page *::after {
  box-sizing: border-box;
}

.sd-nav {
  height: 76px;
  padding: 0 6%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(255,255,227,0.94);
  border-bottom: 1px solid #CBCBCB;
  position: sticky;
  top: 0;
  z-index: 20;
  backdrop-filter: blur(10px);
}

.sd-brand {
  font-family: 'Poppins', sans-serif;
  font-size: 24px;
  font-weight: 700;
  letter-spacing: 1.5px;
  color: #4A4A4A;
}

.sd-back-btn,
.sd-home-btn,
.sd-nav-links button {
  border: none;
  background: transparent;
  color: #6D8196;
  font-weight: 600;
  cursor: pointer;
  font-size: 14px;
}

.sd-back-btn:hover,
.sd-home-btn:hover,
.sd-nav-links button:hover {
  color: #4A4A4A;
}

.sd-nav-links {
  display: flex;
  align-items: center;
  gap: 26px;
}

.sd-container {
  width: min(1180px, 90%);
  margin: 0 auto;
  padding: 48px 0 70px;
}

.sd-service-header {
  display: grid;
  grid-template-columns: 100px 1fr 210px;
  gap: 28px;
  align-items: center;
  padding: 34px;
  background: #FFFFFF;
  border: 1px solid #CBCBCB;
  border-radius: 24px;
  box-shadow: 0 14px 40px rgba(74,74,74,0.07);
}

.sd-service-icon {
  width: 100px;
  height: 100px;
  border-radius: 24px;
  display: grid;
  place-items: center;
  font-size: 48px;
  background: #EEF1F3;
  border: 1px solid #CBCBCB;
}

.sd-category {
  color: #6D8196;
  font-size: 12px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1.6px;
  margin-bottom: 8px;
}

.sd-title-area h1 {
  margin: 0 0 8px;
  font-family: 'Poppins', sans-serif;
  font-size: clamp(30px, 4vw, 44px);
  color: #4A4A4A;
  line-height: 1.1;
}

.sd-title-area p {
  margin: 0;
  max-width: 650px;
  color: #777;
  line-height: 1.7;
  font-size: 15px;
}

.sd-trust-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 18px;
}

.sd-trust-row span {
  padding: 7px 11px;
  border-radius: 999px;
  background: #F5F5F0;
  border: 1px solid #D8D8D2;
  color: #667585;
  font-size: 11px;
  font-weight: 700;
}

.sd-price-box {
  align-self: stretch;
  border-left: 1px solid #D5D5CF;
  padding-left: 24px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.sd-price-box span {
  font-size: 12px;
  color: #888;
}

.sd-price-box strong {
  font-family: 'Poppins', sans-serif;
  font-size: 31px;
  color: #4A4A4A;
  margin: 4px 0;
}

.sd-price-box small {
  color: #6D8196;
  font-weight: 600;
}

.sd-content {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(420px, 500px);
  gap: 28px;
  margin-top: 30px;
  align-items: start;
}

.sd-info-column {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.sd-info-card {
  background: #FFFFFF;
  border: 1px solid #CBCBCB;
  border-radius: 22px;
  padding: 28px;
  box-shadow: 0 10px 30px rgba(74,74,74,0.05);
}

.sd-card-heading {
  display: flex;
  gap: 15px;
  align-items: center;
  margin-bottom: 25px;
}

.sd-heading-icon {
  width: 42px;
  height: 42px;
  border-radius: 13px;
  display: grid;
  place-items: center;
  background: #E8EDF0;
  color: #6D8196;
  font-weight: 900;
}

.sd-card-heading h2 {
  margin: 0;
  font-family: 'Poppins', sans-serif;
  font-size: 21px;
}

.sd-card-heading p {
  margin: 4px 0 0;
  color: #888;
  font-size: 13px;
}

.sd-expect-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.sd-expect-item {
  display: flex;
  align-items: center;
  gap: 17px;
  padding: 15px;
  background: #FAFAF5;
  border: 1px solid #E3E3DC;
  border-radius: 15px;
}

.sd-expect-item div {
  min-width: 35px;
  color: #6D8196;
  font-size: 12px;
  font-weight: 800;
}

.sd-expect-item span {
  color: #666;
  font-size: 14px;
  line-height: 1.5;
}

.sd-safety-card {
  display: flex;
  align-items: center;
  gap: 18px;
  background: #F4F6F3;
}

.sd-safety-icon {
  width: 48px;
  height: 48px;
  flex-shrink: 0;
  border-radius: 15px;
  background: #FFFFFF;
  display: grid;
  place-items: center;
  font-size: 22px;
  border: 1px solid #D7DAD5;
}

.sd-safety-card h3,
.sd-match-card h3 {
  margin: 0 0 6px;
  font-family: 'Poppins', sans-serif;
  font-size: 17px;
}

.sd-safety-card p,
.sd-match-card p {
  margin: 0;
  color: #777;
  font-size: 13px;
  line-height: 1.6;
}

.sd-match-card {
  background: #EEF1F3;
  border-color: #CBD3D9;
}

.sd-match-top {
  display: flex;
  gap: 15px;
}

.sd-match-icon {
  width: 45px;
  height: 45px;
  flex-shrink: 0;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: #FFFFFF;
  color: #6D8196;
  font-size: 25px;
}

.sd-match-points {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  margin-top: 22px;
  border-top: 1px solid #CCD3D8;
  padding-top: 16px;
}

.sd-match-points span {
  text-align: center;
  font-size: 11px;
  font-weight: 700;
  color: #6D8196;
}

.sd-booking-card {
  background: #FFFFFF;
  border: 1px solid #CBCBCB;
  border-radius: 24px;
  padding: 30px;
  box-shadow: 0 14px 40px rgba(74,74,74,0.08);
  position: sticky;
  top: 100px;
}

.sd-form-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 22px;
  margin-bottom: 24px;
  border-bottom: 1px solid #E0E0DA;
}

.sd-form-header > div:first-child span {
  color: #6D8196;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1.5px;
}

.sd-form-header h2 {
  margin: 6px 0 0;
  font-family: 'Poppins', sans-serif;
  font-size: 22px;
}

.sd-step {
  color: #6D8196;
  font-weight: 800;
}

.sd-step span {
  color: #AAA;
  font-weight: 500;
}

.sd-field-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.sd-field {
  margin-bottom: 18px;
}

.sd-field label {
  display: block;
  margin-bottom: 8px;
  color: #555;
  font-size: 12px;
  font-weight: 800;
}

.sd-label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.sd-label-row span {
  color: #999;
  font-size: 10px;
  font-weight: 600;
}

.sd-field input,
.sd-field textarea {
  width: 100%;
  border: 1px solid #D1D1CB;
  border-radius: 12px;
  padding: 13px 14px;
  background: #FCFCF8;
  color: #4A4A4A;
  font-family: inherit;
  font-size: 13px;
  outline: none;
  transition: 0.2s ease;
}

.sd-field input:focus,
.sd-field textarea:focus {
  border-color: #6D8196;
  box-shadow: 0 0 0 3px rgba(109,129,150,0.1);
  background: #FFFFFF;
}

.sd-field textarea {
  resize: vertical;
  min-height: 82px;
}

.sd-location-box {
  margin-bottom: 18px;
  padding: 14px;
  border-radius: 14px;
  border: 1px solid #CDD5DB;
  background: #F0F3F4;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.sd-location-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.sd-location-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: #FFFFFF;
  display: grid;
  place-items: center;
}

.sd-location-left strong {
  display: block;
  font-size: 13px;
}

.sd-location-left p {
  margin: 3px 0 0;
  color: #888;
  font-size: 10px;
}

.sd-location-btn {
  border: 1px solid #AEBBC4;
  background: #FFFFFF;
  color: #6D8196;
  border-radius: 9px;
  padding: 9px 11px;
  font-size: 11px;
  font-weight: 800;
  cursor: pointer;
  white-space: nowrap;
}

.sd-location-btn:hover {
  background: #6D8196;
  color: #FFFFFF;
}

.sd-location-btn:disabled {
  opacity: 0.6;
  cursor: wait;
}

.sd-location-message {
  margin: -8px 0 18px;
  font-size: 11px;
  font-weight: 700;
}

.sd-location-message.success {
  color: #64796B;
}

.sd-location-message.warning {
  color: #987A55;
}

.sd-form-error {
  display: flex;
  gap: 9px;
  align-items: center;
  padding: 11px 13px;
  margin-bottom: 18px;
  border-radius: 10px;
  background: #F5EEEE;
  border: 1px solid #E2CFCF;
  color: #8A6666;
  font-size: 12px;
  font-weight: 600;
}

.sd-form-error span {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: #E8D6D6;
  font-weight: 900;
}

.sd-summary {
  display: flex;
  justify-content: space-between;
  gap: 15px;
  padding: 15px;
  margin-bottom: 15px;
  background: #F7F7F2;
  border: 1px solid #E1E1DA;
  border-radius: 13px;
}

.sd-summary div {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.sd-summary span {
  color: #999;
  font-size: 10px;
  font-weight: 700;
}

.sd-summary strong {
  font-size: 13px;
  color: #4A4A4A;
}

.sd-continue-btn,
.sd-primary-btn {
  width: 100%;
  border: none;
  border-radius: 13px;
  padding: 15px 18px;
  background: #6D8196;
  color: #FFFFFF;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-family: inherit;
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
  transition: 0.2s ease;
}

.sd-continue-btn:hover,
.sd-primary-btn:hover {
  background: #5D7185;
  transform: translateY(-1px);
}

.sd-form-note {
  margin: 12px 5px 0;
  text-align: center;
  color: #999;
  font-size: 10px;
  line-height: 1.5;
}

.sd-footer {
  border-top: 1px solid #CBCBCB;
  padding: 24px 6%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #999;
  font-size: 11px;
}

.sd-footer div {
  display: flex;
  align-items: center;
  gap: 12px;
}

.sd-footer strong {
  color: #6D8196;
  letter-spacing: 1px;
}

.sd-loading,
.sd-error-screen {
  min-height: 75vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 30px;
}

.sd-loader {
  width: 85px;
  height: 85px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: #EEF1F3;
  border: 1px solid #CBD3D9;
  font-size: 38px;
  animation: sd-pulse 1.5s ease-in-out infinite;
}

.sd-loading h2,
.sd-error-screen h2 {
  margin: 22px 0 7px;
  font-family: 'Poppins', sans-serif;
}

.sd-loading p,
.sd-error-screen p {
  margin: 0 0 20px;
  color: #888;
  font-size: 13px;
}

.sd-error-icon {
  width: 65px;
  height: 65px;
  border-radius: 50%;
  background: #F1E7E7;
  color: #8A6666;
  display: grid;
  place-items: center;
  font-size: 28px;
  font-weight: 800;
}

.sd-primary-btn {
  width: auto;
  justify-content: center;
  padding: 13px 22px;
}

@keyframes sd-pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }

  50% {
    transform: scale(1.08);
    opacity: 0.75;
  }
}

@media (max-width: 950px) {
  .sd-service-header {
    grid-template-columns: 80px 1fr;
  }

  .sd-service-icon {
    width: 80px;
    height: 80px;
    font-size: 38px;
  }

  .sd-price-box {
    grid-column: 2;
    border-left: none;
    border-top: 1px solid #D5D5CF;
    padding: 18px 0 0;
    flex-direction: row;
    align-items: center;
    gap: 10px;
  }

  .sd-price-box strong {
    margin: 0;
  }

  .sd-content {
    grid-template-columns: 1fr;
  }

  .sd-booking-card {
    position: static;
  }
}

@media (max-width: 650px) {
  .sd-nav {
    padding: 0 5%;
    height: 68px;
  }

  .sd-brand {
    font-size: 19px;
  }

  .sd-nav-links {
    display: none;
  }

  .sd-container {
    width: 92%;
    padding-top: 25px;
  }

  .sd-service-header {
    grid-template-columns: 1fr;
    padding: 23px;
    gap: 18px;
  }

  .sd-service-icon {
    width: 68px;
    height: 68px;
    font-size: 32px;
  }

  .sd-price-box {
    grid-column: auto;
  }

  .sd-title-area h1 {
    font-size: 30px;
  }

  .sd-trust-row {
    flex-direction: column;
    align-items: flex-start;
  }

  .sd-field-row {
    grid-template-columns: 1fr;
    gap: 0;
  }

  .sd-booking-card,
  .sd-info-card {
    padding: 21px;
  }

  .sd-location-box {
    align-items: flex-start;
    flex-direction: column;
  }

  .sd-location-btn {
    width: 100%;
  }

  .sd-summary {
    flex-direction: column;
  }

  .sd-match-points {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .sd-footer {
    flex-direction: column;
    gap: 10px;
    text-align: center;
  }

  .sd-footer div {
    flex-direction: column;
    gap: 5px;
  }
}
`;

export default ServiceDetails;