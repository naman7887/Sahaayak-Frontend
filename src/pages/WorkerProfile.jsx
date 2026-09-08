import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API_URL from "../config/api";

const SKILLS_BY_SERVICE = {
  Electrician: [
    "Fan Installation",
    "Switch & Socket Repair",
    "Wiring",
    "Electrical Maintenance",
  ],
  Plumber: [
    "Pipe Repair",
    "Tap Repair",
    "Leakage Repair",
    "Bathroom Plumbing",
  ],
  Carpenter: [
    "Furniture Repair",
    "Woodwork",
    "Door Repair",
    "Furniture Assembly",
  ],
  Painter: [
    "Wall Painting",
    "Interior Painting",
    "Exterior Painting",
    "Wall Finishing",
  ],
  Cleaner: [
    "Home Cleaning",
    "Deep Cleaning",
    "Kitchen Cleaning",
    "Bathroom Cleaning",
  ],
  "Appliance Repair": [
    "Appliance Repair",
    "Washing Machine Repair",
    "Refrigerator Repair",
    "General Maintenance",
  ],
  Mason: [
    "Masonry Work",
    "Brickwork",
    "Wall Repair",
    "Construction Work",
  ],
  Gardener: [
    "Gardening",
    "Lawn Maintenance",
    "Plant Care",
    "Garden Cleaning",
  ],
  "AC & Refrigeration": [
    "AC Repair",
    "AC Installation",
    "AC Maintenance",
    "Cooling System Repair",
  ],
};

const SERVICES = [
  "Electrician",
  "Plumber",
  "Carpenter",
  "Painter",
  "Cleaner",
  "Appliance Repair",
  "Mason",
  "Gardener",
  "AC & Refrigeration",
  "Other",
];

function WorkerProfile() {
  const [user, setUser] = useState(null);
  const [worker, setWorker] = useState(null);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const token = localStorage.getItem("token");

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const [userResponse, workerResponse] = await Promise.all([
        fetch(`${API_URL}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),

        fetch(`${API_URL}/api/workers/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);

      const userData = await userResponse.json();
      const workerData = await workerResponse.json();

      if (!userResponse.ok) {
        throw new Error(
          userData.message || "Unable to load user."
        );
      }

      if (!workerResponse.ok) {
        throw new Error(
          workerData.message ||
            "Unable to load worker profile."
        );
      }

      setUser(userData.user);
      setWorker(workerData.worker);
      setSelectedSkills(workerData.worker.skills || []);
    } catch (err) {
      console.error(err);
      setError(
        err.message || "Unable to load worker profile."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const availableSkills =
    SKILLS_BY_SERVICE[worker?.occupation] || [
      worker?.occupation || "General Service",
    ];

  const toggleSkill = (skill) => {
    setSelectedSkills((current) => {
      if (current.includes(skill)) {
        return current.filter((item) => item !== skill);
      }

      return [...current, skill];
    });

    setSuccess("");
  };

  const changeOccupation = (occupation) => {
    setWorker({
      ...worker,
      occupation,
    });

    setSelectedSkills(occupation ? [] : []);
    setSuccess("");
  };

  const updateWorkerField = (field, value) => {
    setWorker({
      ...worker,
      [field]: value,
    });

    setSuccess("");
  };

  const updateProfile = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!worker.occupation) {
      setError("Please select your primary service.");
      return;
    }

    if (selectedSkills.length === 0) {
      setError("Please select at least one skill.");
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(
        `${API_URL}/api/workers/profile`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            occupation: worker.occupation,
            skills: selectedSkills,
            experience: Number(worker.experience || 0),
            serviceRadius: Number(
              worker.serviceRadius || 10
            ),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to update worker profile."
        );
      }

      setWorker(data.worker);
      setSelectedSkills(data.worker.skills || []);

      setSuccess(
        "Your professional profile has been updated successfully."
      );
    } catch (err) {
      console.error(err);
      setError(
        err.message || "Unable to update your profile."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <style>{styles}</style>

        <main className="wp-page">
          <div className="wp-loading">
            <div className="wp-loader"></div>
            <p>Loading your profile...</p>
          </div>
        </main>
      </>
    );
  }

  if (error && !worker) {
    return (
      <>
        <style>{styles}</style>

        <main className="wp-page">
          <div className="wp-error-page">
            <div className="wp-error-icon">!</div>
            <h2>Profile unavailable</h2>
            <p>{error}</p>
            <button onClick={fetchProfile}>
              Try Again
            </button>
          </div>
        </main>
      </>
    );
  }

  const profileChecks = [
    {
      label: "Primary service",
      complete: Boolean(worker?.occupation),
    },
    {
      label: "Skills",
      complete: selectedSkills.length > 0,
    },
    {
      label: "Service location",
      complete:
        worker?.location &&
        Array.isArray(worker.location.coordinates) &&
        worker.location.coordinates.length === 2,
    },
  ];

  const completedItems = profileChecks.filter(
    (item) => item.complete
  ).length;

  const profileProgress = Math.round(
    (completedItems / profileChecks.length) * 100
  );

  return (
    <>
      <style>{styles}</style>

      <main className="wp-page">

        {/* HEADER */}
        <header className="wp-header">

          <div className="wp-header-left">

            <Link
              to="/worker-dashboard"
              className="wp-back"
            >
              ← Dashboard
            </Link>

            <p className="wp-eyebrow">
              SAHAAYAK WORKER ACCOUNT
            </p>

            <h1>Professional Profile</h1>

            <p className="wp-header-description">
              Keep your professional information updated
              so Sahaayak can find the right jobs for you.
            </p>

          </div>

          <div
            className={`wp-verification ${
              worker?.verificationStatus
            }`}
          >
            <span></span>

            {worker?.verificationStatus ===
            "verified"
              ? "Verified Worker"
              : worker?.verificationStatus ===
                "rejected"
              ? "Verification Rejected"
              : "Verification Pending"}
          </div>

        </header>

        {/* MAIN GRID */}
        <div className="wp-layout">

          {/* LEFT PROFILE PANEL */}
          <aside className="wp-sidebar">

            <div className="wp-profile-card">

              <div className="wp-avatar">
                {(user?.name || "W")
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <h2>
                {user?.name || "Service Provider"}
              </h2>

              <p className="wp-role">
                {worker?.occupation ||
                  "Service Provider"}
              </p>

              <div className="wp-rating">
                <span>★</span>

                {Number(worker?.rating || 0).toFixed(
                  1
                )}

                <small>
                  {worker?.totalJobs || 0} jobs
                </small>
              </div>

              <div className="wp-divider"></div>

              {/* PROFILE COMPLETION */}
              <div className="wp-completion">

                <div className="wp-completion-top">
                  <span>Profile completion</span>

                  <strong>
                    {profileProgress}%
                  </strong>
                </div>

                <div className="wp-progress">
                  <div
                    style={{
                      width: `${profileProgress}%`,
                    }}
                  ></div>
                </div>

                <div className="wp-check-list">

                  {profileChecks.map((item) => (
                    <div
                      key={item.label}
                      className={
                        item.complete
                          ? "wp-check complete"
                          : "wp-check"
                      }
                    >
                      <span>
                        {item.complete ? "✓" : "○"}
                      </span>

                      {item.label}
                    </div>
                  ))}

                </div>

              </div>

              <div className="wp-divider"></div>

              {/* QUICK STATS */}
              <div className="wp-mini-stats">

                <div>
                  <strong>
                    {worker?.experience || 0}
                  </strong>
                  <span>Years experience</span>
                </div>

                <div>
                  <strong>
                    {worker?.serviceRadius || 10}
                  </strong>
                  <span>KM service radius</span>
                </div>

              </div>

              {/* CONTACT */}
              <div className="wp-contact">

                <div>
                  <span>Email</span>
                  <strong>
                    {user?.email ||
                      "Not available"}
                  </strong>
                </div>

                <div>
                  <span>Phone</span>
                  <strong>
                    {user?.phone ||
                      "Not available"}
                  </strong>
                </div>

              </div>

            </div>

          </aside>

          {/* RIGHT CONTENT */}
          <section className="wp-content">

            {/* ALERTS */}
            {error && (
              <div className="wp-alert error">
                <span>!</span>
                <div>
                  <strong>Something needs attention</strong>
                  <p>{error}</p>
                </div>
              </div>
            )}

            {success && (
              <div className="wp-alert success">
                <span>✓</span>
                <div>
                  <strong>Profile saved</strong>
                  <p>{success}</p>
                </div>
              </div>
            )}

            {/* PROFESSIONAL INFO */}
            <form
              className="wp-form-card"
              onSubmit={updateProfile}
            >

              <div className="wp-card-header">

                <div>
                  <p className="wp-section-label">
                    PROFESSIONAL DETAILS
                  </p>

                  <h2>
                    Tell customers what you do
                  </h2>

                  <p>
                    These details are used by Sahaayak's
                    smart matching system.
                  </p>
                </div>

                <div className="wp-card-number">
                  01
                </div>

              </div>

              {/* SERVICE */}
              <div className="wp-field-section">

                <div className="wp-field-title">
                  <div className="wp-field-icon">
                    ⚒
                  </div>

                  <div>
                    <label>
                      Primary Service
                    </label>

                    <small>
                      Choose the type of work you
                      specialize in.
                    </small>
                  </div>
                </div>

                <div className="wp-service-grid">

                  {SERVICES.map((service) => (
                    <button
                      type="button"
                      key={service}
                      className={`wp-service-option ${
                        worker?.occupation === service
                          ? "selected"
                          : ""
                      }`}
                      onClick={() =>
                        changeOccupation(service)
                      }
                    >
                      <span>
                        {service === "Electrician"
                          ? "⚡"
                          : service === "Plumber"
                          ? "🔧"
                          : service === "Carpenter"
                          ? "🪚"
                          : service === "Painter"
                          ? "🎨"
                          : service === "Cleaner"
                          ? "🧹"
                          : service ===
                            "Appliance Repair"
                          ? "🔌"
                          : service === "Mason"
                          ? "🧱"
                          : service === "Gardener"
                          ? "🌱"
                          : service ===
                            "AC & Refrigeration"
                          ? "❄️"
                          : "✦"}
                      </span>

                      <strong>{service}</strong>

                      {worker?.occupation ===
                        service && (
                        <b>✓</b>
                      )}
                    </button>
                  ))}

                </div>

              </div>

              {/* EXPERIENCE + RADIUS */}
              <div className="wp-input-grid">

                <div className="wp-input-group">

                  <label>
                    Years of Experience
                  </label>

                  <div className="wp-input-with-suffix">

                    <input
                      type="number"
                      min="0"
                      max="50"
                      value={worker?.experience ?? 0}
                      onChange={(e) =>
                        updateWorkerField(
                          "experience",
                          e.target.value
                        )
                      }
                    />

                    <span>YEARS</span>

                  </div>

                  <small>
                    Your total professional experience.
                  </small>

                </div>

                <div className="wp-input-group">

                  <label>
                    Service Radius
                  </label>

                  <div className="wp-input-with-suffix">

                    <input
                      type="number"
                      min="1"
                      max="50"
                      value={
                        worker?.serviceRadius ?? 10
                      }
                      onChange={(e) =>
                        updateWorkerField(
                          "serviceRadius",
                          e.target.value
                        )
                      }
                    />

                    <span>KM</span>

                  </div>

                  <small>
                    Maximum distance for accepting jobs.
                  </small>

                </div>

              </div>

              {/* SKILLS */}
              <div className="wp-field-section skills-section">

                <div className="wp-field-title">

                  <div className="wp-field-icon">
                    ✦
                  </div>

                  <div>
                    <label>
                      Your Skills
                    </label>

                    <small>
                      Select every service you are
                      qualified to provide.
                    </small>
                  </div>

                </div>

                {worker?.occupation ? (
                  <div className="wp-skills-grid">

                    {availableSkills.map((skill) => {
                      const selected =
                        selectedSkills.includes(skill);

                      return (
                        <button
                          type="button"
                          key={skill}
                          className={`wp-skill ${
                            selected ? "selected" : ""
                          }`}
                          onClick={() =>
                            toggleSkill(skill)
                          }
                        >
                          <span>
                            {selected ? "✓" : "+"}
                          </span>

                          {skill}
                        </button>
                      );
                    })}

                  </div>
                ) : (
                  <div className="wp-skill-empty">
                    Select your primary service first
                    to see relevant skills.
                  </div>
                )}

                <div className="wp-skills-footer">
                  <span>
                    {selectedSkills.length}{" "}
                    {selectedSkills.length === 1
                      ? "skill"
                      : "skills"}{" "}
                    selected
                  </span>

                  {selectedSkills.length > 0 && (
                    <span className="skills-ready">
                      ✓ Ready for matching
                    </span>
                  )}
                </div>

              </div>

              {/* LOCATION INFO */}
              <div className="wp-location-box">

                <div className="wp-location-icon">
                  📍
                </div>

                <div>
                  <strong>
                    Service Location
                  </strong>

                  <p>
                    Your saved location is used by
                    Sahaayak's smart matching system
                    to find nearby jobs.
                  </p>

                  {worker?.location &&
                  Array.isArray(
                    worker.location.coordinates
                  ) &&
                  worker.location.coordinates
                    .length === 2 ? (
                    <span className="location-ready">
                      ✓ Location configured
                    </span>
                  ) : (
                    <span className="location-missing">
                      ○ Location not configured
                    </span>
                  )}
                </div>

              </div>

              {/* SAVE */}
              <div className="wp-save-row">

                <div>
                  <strong>
                    Ready to update your profile?
                  </strong>

                  <p>
                    Your changes will be used for future
                    job matching.
                  </p>
                </div>

                <button
                  type="submit"
                  className="wp-save-button"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : "Save Profile"}
                  <span>→</span>
                </button>

              </div>

            </form>

            {/* SMART MATCHING */}
            <section className="wp-matching-card">

              <div className="wp-matching-icon">
                ✦
              </div>

              <div className="wp-matching-content">

                <p className="wp-section-label">
                  SMART MATCHING
                </p>

                <h2>
                  Better profile. Better
                  opportunities.
                </h2>

                <p>
                  Sahaayak considers your service,
                  skills, location, availability,
                  rating and service radius when
                  finding suitable jobs.
                </p>

              </div>

              <div className="wp-matching-points">

                <span>
                  <b>01</b>
                  Service
                </span>

                <span>
                  <b>02</b>
                  Skills
                </span>

                <span>
                  <b>03</b>
                  Location
                </span>

                <span>
                  <b>04</b>
                  Availability
                </span>

              </div>

            </section>

          </section>

        </div>

        <footer className="wp-footer">
          <strong>SAHAAYAK</strong>
          <span>
            Connecting skilled workers with local
            opportunities.
          </span>
        </footer>

      </main>
    </>
  );
}

const styles = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@500;600;700&display=swap');

.wp-page {
  min-height: 100vh;
  padding: 42px 7%;
  background: #ffffe3;
  color: #4a4a4a;
  font-family: 'Inter', sans-serif;
}

.wp-page * {
  box-sizing: border-box;
}

.wp-header {
  max-width: 1250px;
  margin: 0 auto 34px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 30px;
}

.wp-header-left {
  min-width: 0;
}

.wp-back {
  display: inline-block;
  margin-bottom: 22px;
  color: #7d8589;
  text-decoration: none;
  font-size: 11px;
  font-weight: 600;
  transition: .2s ease;
}

.wp-back:hover {
  color: #6d8196;
}

.wp-eyebrow,
.wp-section-label {
  margin: 0 0 8px;
  color: #6d8196;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 1.7px;
}

.wp-header h1 {
  margin: 0;
  color: #42494f;
  font-family: 'Poppins', sans-serif;
  font-size: clamp(30px, 4vw, 42px);
  line-height: 1.1;
  font-weight: 600;
  letter-spacing: -.8px;
}

.wp-header-description {
  max-width: 560px;
  margin: 10px 0 0;
  color: #858d91;
  font-size: 12px;
  line-height: 1.7;
}

.wp-verification {
  margin-top: 48px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border: 1px solid #dddcd3;
  border-radius: 99px;
  background: rgba(255,255,255,.7);
  color: #777e81;
  font-size: 10px;
  font-weight: 700;
  white-space: nowrap;
}

.wp-verification span {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #c0a15b;
}

.wp-verification.verified {
  color: #647a6b;
}

.wp-verification.verified span {
  background: #789884;
}

.wp-verification.rejected span {
  background: #a9786d;
}

.wp-layout {
  max-width: 1250px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 300px minmax(0, 1fr);
  gap: 20px;
  align-items: start;
}

.wp-sidebar {
  position: sticky;
  top: 20px;
}

.wp-profile-card {
  padding: 27px;
  border: 1px solid #e1e0d7;
  border-radius: 22px;
  background: white;
  box-shadow: 0 10px 30px rgba(74,74,74,.045);
}

.wp-avatar {
  width: 68px;
  height: 68px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 18px;
  border-radius: 20px;
  background: #6d8196;
  color: white;
  font-family: 'Poppins', sans-serif;
  font-size: 27px;
}

.wp-profile-card h2 {
  margin: 0;
  color: #454c51;
  font-family: 'Poppins', sans-serif;
  font-size: 20px;
  font-weight: 600;
}

.wp-role {
  margin: 5px 0 13px;
  color: #8a9295;
  font-size: 11px;
}

.wp-rating {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #626c71;
  font-size: 12px;
  font-weight: 700;
}

.wp-rating > span {
  color: #9b8150;
}

.wp-rating small {
  margin-left: 4px;
  color: #9a9fa0;
  font-size: 9px;
  font-weight: 500;
}

.wp-divider {
  height: 1px;
  margin: 22px 0;
  background: #edede6;
}

.wp-completion-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 9px;
  color: #747c80;
  font-size: 10px;
  font-weight: 600;
}

.wp-completion-top strong {
  color: #6d8196;
}

.wp-progress {
  width: 100%;
  height: 6px;
  overflow: hidden;
  border-radius: 99px;
  background: #e8e8df;
}

.wp-progress div {
  height: 100%;
  border-radius: inherit;
  background: #6d8196;
  transition: width .3s ease;
}

.wp-check-list {
  margin-top: 15px;
  display: flex;
  flex-direction: column;
  gap: 9px;
}

.wp-check {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #999f9f;
  font-size: 10px;
}

.wp-check span {
  width: 17px;
  height: 17px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #f0f0e9;
  color: #9a9f9f;
  font-size: 8px;
}

.wp-check.complete {
  color: #68736e;
}

.wp-check.complete span {
  background: #edf2ed;
  color: #718b77;
}

.wp-mini-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.wp-mini-stats div {
  padding: 12px;
  border-radius: 12px;
  background: #f6f5ec;
}

.wp-mini-stats strong {
  display: block;
  color: #555e63;
  font-family: 'Poppins', sans-serif;
  font-size: 18px;
}

.wp-mini-stats span {
  display: block;
  margin-top: 3px;
  color: #949a9c;
  font-size: 8px;
  line-height: 1.4;
}

.wp-contact {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.wp-contact div {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.wp-contact span {
  color: #9a9fa0;
  font-size: 8px;
  text-transform: uppercase;
  letter-spacing: .8px;
  font-weight: 700;
}

.wp-contact strong {
  color: #687075;
  font-size: 9px;
  font-weight: 600;
  word-break: break-word;
}

.wp-content {
  min-width: 0;
}

.wp-alert {
  margin-bottom: 15px;
  padding: 14px 17px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-radius: 14px;
}

.wp-alert > span {
  width: 28px;
  height: 28px;
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-weight: 800;
  font-size: 11px;
}

.wp-alert strong {
  display: block;
  font-size: 11px;
}

.wp-alert p {
  margin: 3px 0 0;
  font-size: 9px;
}

.wp-alert.error {
  border: 1px solid #e5d0c9;
  background: #fff7f4;
  color: #895f56;
}

.wp-alert.error > span {
  background: #eeddd7;
}

.wp-alert.success {
  border: 1px solid #d5dfd6;
  background: #f4f8f3;
  color: #64786a;
}

.wp-alert.success > span {
  background: #e1ece2;
}

.wp-form-card {
  overflow: hidden;
  border: 1px solid #dfded5;
  border-radius: 22px;
  background: white;
  box-shadow: 0 10px 30px rgba(74,74,74,.04);
}

.wp-card-header {
  padding: 27px 29px 25px;
  display: flex;
  justify-content: space-between;
  gap: 20px;
  border-bottom: 1px solid #ecece5;
}

.wp-card-header h2 {
  margin: 0;
  color: #474e53;
  font-family: 'Poppins', sans-serif;
  font-size: 20px;
  font-weight: 600;
}

.wp-card-header > div:first-child > p:last-child {
  margin: 7px 0 0;
  color: #909697;
  font-size: 10px;
  line-height: 1.6;
}

.wp-card-number {
  color: #c2c4be;
  font-family: 'Poppins', sans-serif;
  font-size: 22px;
  font-weight: 600;
}

.wp-field-section {
  padding: 26px 29px;
  border-bottom: 1px solid #ecece5;
}

.wp-field-title {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 19px;
}

.wp-field-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 11px;
  background: #f1f0e8;
  color: #6d8196;
  font-size: 15px;
}

.wp-field-title label {
  display: block;
  color: #555d61;
  font-size: 11px;
  font-weight: 700;
}

.wp-field-title small {
  display: block;
  margin-top: 3px;
  color: #969c9d;
  font-size: 9px;
}

.wp-service-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 9px;
}

.wp-service-option {
  position: relative;
  min-height: 72px;
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 9px;
  border: 1px solid #e4e3dc;
  border-radius: 13px;
  background: #fafaf5;
  color: #666e72;
  cursor: pointer;
  text-align: left;
  transition: .2s ease;
}

.wp-service-option:hover {
  border-color: #bbc5cc;
  transform: translateY(-1px);
}

.wp-service-option > span {
  width: 31px;
  height: 31px;
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 9px;
  background: #efeee5;
  font-size: 14px;
}

.wp-service-option strong {
  font-size: 9px;
  line-height: 1.3;
}

.wp-service-option b {
  position: absolute;
  top: 7px;
  right: 8px;
  color: #6d8196;
  font-size: 10px;
}

.wp-service-option.selected {
  border-color: #6d8196;
  background: #f1f4f5;
  box-shadow: inset 0 0 0 1px #6d8196;
}

.wp-service-option.selected > span {
  background: #6d8196;
}

.wp-input-grid {
  padding: 25px 29px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  border-bottom: 1px solid #ecece5;
}

.wp-input-group label {
  display: block;
  margin-bottom: 8px;
  color: #555d61;
  font-size: 10px;
  font-weight: 700;
}

.wp-input-with-suffix {
  height: 45px;
  display: flex;
  align-items: center;
  border: 1px solid #deded7;
  border-radius: 11px;
  background: #fbfbf7;
  overflow: hidden;
}

.wp-input-with-suffix:focus-within {
  border-color: #9aaab7;
  box-shadow: 0 0 0 3px rgba(109,129,150,.08);
}

.wp-input-with-suffix input {
  width: 100%;
  height: 100%;
  min-width: 0;
  padding: 0 13px;
  border: none;
  outline: none;
  background: transparent;
  color: #555d61;
  font-size: 12px;
  font-weight: 600;
}

.wp-input-with-suffix span {
  padding: 0 13px;
  color: #9a9fa0;
  font-size: 8px;
  font-weight: 800;
  letter-spacing: .7px;
}

.wp-input-group > small {
  display: block;
  margin-top: 7px;
  color: #9a9fa0;
  font-size: 8px;
}

.skills-section {
  padding-bottom: 24px;
}

.wp-skills-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.wp-skill {
  min-height: 43px;
  padding: 9px 11px;
  display: flex;
  align-items: center;
  gap: 9px;
  border: 1px solid #e3e2da;
  border-radius: 10px;
  background: #fbfbf7;
  color: #777e81;
  cursor: pointer;
  text-align: left;
  font-family: 'Inter', sans-serif;
  font-size: 9px;
  font-weight: 600;
  transition: .2s ease;
}

.wp-skill span {
  width: 19px;
  height: 19px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  background: #efeee6;
  color: #999f9f;
  font-size: 10px;
}

.wp-skill:hover {
  border-color: #bfc8ce;
}

.wp-skill.selected {
  border-color: #8799a8;
  background: #f0f3f4;
  color: #59666e;
}

.wp-skill.selected span {
  background: #6d8196;
  color: white;
}

.wp-skill-empty {
  padding: 20px;
  border: 1px dashed #dcdcd4;
  border-radius: 11px;
  background: #fafaf6;
  color: #9a9f9f;
  text-align: center;
  font-size: 9px;
}

.wp-skills-footer {
  margin-top: 13px;
  display: flex;
  justify-content: space-between;
  color: #999f9f;
  font-size: 8px;
  font-weight: 600;
}

.skills-ready {
  color: #718b77;
}

.wp-location-box {
  margin: 22px 29px;
  padding: 17px;
  display: flex;
  gap: 13px;
  border: 1px solid #dfe2dc;
  border-radius: 14px;
  background: #f7f8f3;
}

.wp-location-icon {
  width: 34px;
  height: 34px;
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: #e9ede7;
  font-size: 15px;
}

.wp-location-box strong {
  color: #596268;
  font-size: 10px;
}

.wp-location-box p {
  max-width: 500px;
  margin: 4px 0 8px;
  color: #909798;
  font-size: 8px;
  line-height: 1.6;
}

.location-ready,
.location-missing {
  font-size: 8px;
  font-weight: 700;
}

.location-ready {
  color: #718b77;
}

.location-missing {
  color: #9b8060;
}

.wp-save-row {
  padding: 20px 29px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  background: #f8f8f2;
  border-top: 1px solid #ecece5;
}

.wp-save-row strong {
  color: #5c6468;
  font-size: 10px;
}

.wp-save-row p {
  margin: 4px 0 0;
  color: #969c9d;
  font-size: 8px;
}

.wp-save-button {
  min-width: 145px;
  padding: 12px 18px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 9px;
  border: none;
  border-radius: 9px;
  background: #6d8196;
  color: white;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
  font-size: 10px;
  font-weight: 700;
  transition: .2s ease;
}

.wp-save-button:hover {
  background: #5e7185;
  transform: translateY(-1px);
}

.wp-save-button:disabled {
  opacity: .6;
  cursor: not-allowed;
  transform: none;
}

.wp-save-button span {
  font-size: 14px;
}

.wp-matching-card {
  margin-top: 18px;
  padding: 25px 27px;
  display: grid;
  grid-template-columns: 42px 1fr auto;
  align-items: center;
  gap: 18px;
  border: 1px solid #dcdcd1;
  border-radius: 20px;
  background: #e9e9dd;
}

.wp-matching-icon {
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 13px;
  background: #6d8196;
  color: white;
  font-size: 17px;
}

.wp-matching-content h2 {
  margin: 0;
  color: #50585d;
  font-family: 'Poppins', sans-serif;
  font-size: 17px;
  font-weight: 600;
}

.wp-matching-content > p:last-child {
  max-width: 560px;
  margin: 6px 0 0;
  color: #858c8d;
  font-size: 9px;
  line-height: 1.6;
}

.wp-matching-points {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 7px;
  max-width: 220px;
}

.wp-matching-points span {
  padding: 7px 9px;
  border-radius: 8px;
  background: rgba(255,255,255,.58);
  color: #7d8587;
  font-size: 8px;
  font-weight: 700;
}

.wp-matching-points b {
  margin-right: 4px;
  color: #6d8196;
}

.wp-footer {
  max-width: 1250px;
  margin: 45px auto 0;
  padding-top: 20px;
  display: flex;
  justify-content: space-between;
  border-top: 1px solid #e1e0d6;
  color: #989e9f;
  font-size: 8px;
}

.wp-footer strong {
  color: #6d8196;
  letter-spacing: 1.4px;
}

.wp-loading {
  min-height: 75vh;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  color: #8b9294;
  font-size: 11px;
}

.wp-loader {
  width: 30px;
  height: 30px;
  margin-bottom: 14px;
  border: 3px solid #e0e0d7;
  border-top-color: #6d8196;
  border-radius: 50%;
  animation: wp-spin .8s linear infinite;
}

@keyframes wp-spin {
  to {
    transform: rotate(360deg);
  }
}

.wp-error-page {
  min-height: 70vh;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  text-align: center;
}

.wp-error-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #f0e0da;
  color: #95675c;
  font-weight: 800;
}

.wp-error-page h2 {
  margin: 15px 0 5px;
  font-family: 'Poppins', sans-serif;
  color: #555d61;
}

.wp-error-page p {
  margin: 0 0 18px;
  color: #8d9495;
  font-size: 10px;
}

.wp-error-page button {
  padding: 10px 18px;
  border: none;
  border-radius: 9px;
  background: #6d8196;
  color: white;
  cursor: pointer;
  font-size: 10px;
  font-weight: 700;
}

@media (max-width: 1000px) {
  .wp-layout {
    grid-template-columns: 1fr;
  }

  .wp-sidebar {
    position: static;
  }

  .wp-profile-card {
    display: grid;
    grid-template-columns: auto 1fr;
    column-gap: 18px;
  }

  .wp-avatar {
    grid-row: span 3;
  }

  .wp-divider,
  .wp-completion,
  .wp-mini-stats,
  .wp-contact {
    grid-column: 1 / -1;
  }

  .wp-divider {
    width: 100%;
  }

  .wp-profile-card .wp-divider:first-of-type {
    margin-bottom: 0;
  }

  .wp-profile-card h2 {
    align-self: end;
  }

  .wp-role {
    margin-bottom: 5px;
  }

  .wp-rating {
    align-self: start;
  }
}

@media (max-width: 750px) {
  .wp-page {
    padding: 28px 18px;
  }

  .wp-header {
    flex-direction: column;
  }

  .wp-verification {
    margin-top: 0;
  }

  .wp-service-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .wp-input-grid {
    grid-template-columns: 1fr;
  }

  .wp-matching-card {
    grid-template-columns: 42px 1fr;
  }

  .wp-matching-points {
    grid-column: 1 / -1;
    justify-content: flex-start;
    max-width: none;
  }
}

@media (max-width: 520px) {
  .wp-card-header,
  .wp-field-section,
  .wp-input-grid {
    padding-left: 19px;
    padding-right: 19px;
  }

  .wp-service-grid,
  .wp-skills-grid {
    grid-template-columns: 1fr;
  }

  .wp-location-box {
    margin-left: 19px;
    margin-right: 19px;
  }

  .wp-save-row {
    padding: 18px 19px;
    align-items: stretch;
    flex-direction: column;
  }

  .wp-save-button {
    width: 100%;
  }

  .wp-profile-card {
    display: block;
  }

  .wp-mini-stats {
    display: grid;
  }

  .wp-footer {
    flex-direction: column;
    gap: 8px;
  }
}
`;

export default WorkerProfile;