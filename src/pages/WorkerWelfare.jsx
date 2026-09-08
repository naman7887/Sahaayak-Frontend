import { useEffect, useState } from "react";
import "./WorkerWelfare.css";
import API_URL from "../config/api";

function WorkerWelfare() {
  const [user, setUser] = useState(null);

  const [salary, setSalary] = useState(null);
  const [salaryHistory, setSalaryHistory] = useState([]);
  const [trainings, setTrainings] = useState([]);
  const [schemes, setSchemes] = useState([]);
  const [insurancePlans, setInsurancePlans] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getToken = () =>
    localStorage.getItem("sahaayak_token") ||
    localStorage.getItem("token");

  const authHeaders = () => {
    const token = getToken();

    return token
      ? {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        }
      : {};
  };

  useEffect(() => {
    loadWelfareData();
  }, []);

  const loadWelfareData = async () => {
    setLoading(true);
    setError("");

    const headers = authHeaders();

    if (!headers.Authorization) {
      setError("Please login as a worker to view welfare information.");
      setLoading(false);
      return;
    }

    try {
      const results = await Promise.allSettled([
        fetch(`${API_URL}/api/auth/me`, {
          headers,
        }),

        fetch(`${API_URL}/api/worker-salaries/my`, {
          headers,
        }),

        fetch(`${API_URL}/api/worker-salaries/my/history`, {
          headers,
        }),

        fetch(`${API_URL}/api/worker-trainings/my`, {
          headers,
        }),

        fetch(`${API_URL}/api/schemes/recommended`, {
          headers,
        }),

        fetch(`${API_URL}/api/insurance`, {
          headers,
        }),
      ]);

      // USER
      if (results[0].status === "fulfilled") {
        const response = results[0].value;

        if (response.ok) {
          const data = await response.json();
          setUser(data.user || null);
        }
      }

      // CURRENT SALARY
      if (results[1].status === "fulfilled") {
        const response = results[1].value;

        if (response.ok) {
          const data = await response.json();
          setSalary(data.salary || null);
        }
      }

      // SALARY HISTORY
      if (results[2].status === "fulfilled") {
        const response = results[2].value;

        if (response.ok) {
          const data = await response.json();
          setSalaryHistory(data.salaries || []);
        }
      }

      // TRAININGS
      if (results[3].status === "fulfilled") {
        const response = results[3].value;

        if (response.ok) {
          const data = await response.json();
          setTrainings(data.trainings || []);
        }
      }

      // RECOMMENDED SCHEMES
      if (results[4].status === "fulfilled") {
        const response = results[4].value;

        if (response.ok) {
          const data = await response.json();

          setSchemes(
            data.schemes ||
              data.recommendedSchemes ||
              []
          );
        }
      }

      // INSURANCE
      if (results[5].status === "fulfilled") {
        const response = results[5].value;

        if (response.ok) {
          const data = await response.json();

          setInsurancePlans(
            data.insurancePlans ||
              data.plans ||
              data.insurance ||
              []
          );
        }
      }
    } catch (err) {
      console.error("Worker welfare error:", err);
      setError("Unable to load welfare information.");
    } finally {
      setLoading(false);
    }
  };

  const openLink = (url) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) {
      return "₹0";
    }

    return `₹${Number(amount).toLocaleString("en-IN")}`;
  };

  const getTrainingName = (training) => {
    return (
      training?.trainingId?.title ||
      training?.trainingId?.name ||
      training?.training?.title ||
      training?.training?.name ||
      "Training Program"
    );
  };

  const getTrainingStatus = (training) => {
    return (
      training?.status ||
      "enrolled"
    );
  };

  const getSchemeName = (scheme) => {
    return (
      scheme?.name ||
      scheme?.schemeName ||
      scheme?.title ||
      "Government Scheme"
    );
  };

  return (
    <div className="welfare-page">

      {/* HEADER */}
      <div className="welfare-header">
        <div>
          <p className="welfare-eyebrow">
            Sahaayak Worker Support
          </p>

          <h1>Worker Welfare & Benefits</h1>

          <p>
            Manage your salary, training, government schemes
            and insurance benefits in one place.
          </p>
        </div>

        <div className="welfare-header-icon">
          🛡️
        </div>
      </div>

      {/* PROFILE */}
      <div className="welfare-profile">
        <div className="welfare-avatar">
          {(user?.name || "W").charAt(0).toUpperCase()}
        </div>

        <div>
          <span>Worker Profile</span>

          <h2>
            {user?.name || "Service Provider"}
          </h2>

          <p>
            {user?.phone || "Registered Sahaayak worker"}
          </p>
        </div>

        <div className="welfare-profile-status">
          <span>●</span>
          Worker Support Active
        </div>
      </div>

      {loading && (
        <div className="welfare-card">
          <h3>Loading welfare information...</h3>
          <p>
            Fetching your salary, training, schemes and insurance details.
          </p>
        </div>
      )}

      {error && !loading && (
        <div className="welfare-card">
          <h3>Unable to load some information</h3>
          <p>{error}</p>

          <button onClick={loadWelfareData}>
            Try Again
          </button>
        </div>
      )}

      {/* FINANCIAL OVERVIEW */}
      {!loading && (
        <section className="welfare-section">

          <div className="welfare-section-heading">
            <div>
              <h2>Financial Overview</h2>

              <p>
                Your current salary and work-performance information.
              </p>
            </div>
          </div>

          <div className="welfare-grid">

            <div className="welfare-card">
              <div className="welfare-card-icon">
                💰
              </div>

              <h3>Current Salary</h3>

              <p className="welfare-value">
                {formatCurrency(
                  salary?.finalSalary ||
                  salary?.baseSalary
                )}
              </p>

              <small>
                {salary
                  ? `${salary.month || ""} ${salary.year || ""}`
                  : "Current month"}
              </small>
            </div>

            <div className="welfare-card">
              <div className="welfare-card-icon">
                💼
              </div>

              <h3>Completed Jobs</h3>

              <p className="welfare-value">
                {salary?.completedJobs || 0}
              </p>

              <small>
                Monthly completed services
              </small>
            </div>

            <div className="welfare-card">
              <div className="welfare-card-icon">
                ⏱️
              </div>

              <h3>Extra Jobs</h3>

              <p className="welfare-value">
                {salary?.extraJobs || 0}
              </p>

              <small>
                Jobs beyond monthly limit
              </small>
            </div>

            <div className="welfare-card">
              <div className="welfare-card-icon">
                📈
              </div>

              <h3>Overtime Pay</h3>

              <p className="welfare-value">
                {formatCurrency(
                  salary?.overtimePay
                )}
              </p>

              <small>
                Additional earnings
              </small>
            </div>

          </div>
        </section>
      )}

      {/* SALARY HISTORY */}
      {!loading && salaryHistory.length > 0 && (
        <section className="welfare-section">

          <div className="welfare-section-heading">
            <div>
              <h2>Salary History</h2>

              <p>
                Previous monthly salary records.
              </p>
            </div>
          </div>

          <div className="scheme-list">

            {salaryHistory.map((item, index) => (
              <div
                className="scheme-card"
                key={item._id || index}
              >
                <div className="scheme-icon">
                  💵
                </div>

                <div className="scheme-content">
                  <h3>
                    {item.month || "Month"}{" "}
                    {item.year || ""}
                  </h3>

                  <span>
                    Completed Jobs:{" "}
                    {item.completedJobs || 0}
                  </span>

                  <p>
                    Final Salary:{" "}
                    <strong>
                      {formatCurrency(item.finalSalary)}
                    </strong>
                  </p>
                </div>

                <span>
                  {item.status || "pending"}
                </span>
              </div>
            ))}

          </div>
        </section>
      )}

      {/* TRAINING */}
      <section className="welfare-section">

        <div className="welfare-section-heading">
          <div>
            <h2>My Training</h2>

            <p>
              Training programs and skill-development opportunities.
            </p>
          </div>
        </div>

        {trainings.length === 0 ? (
          <div className="welfare-card">
            <div className="welfare-card-icon">
              🎓
            </div>

            <h3>No Training Enrollments</h3>

            <p>
              You are not enrolled in any training programs yet.
            </p>
          </div>
        ) : (
          <div className="scheme-list">

            {trainings.map((training, index) => (
              <div
                className="scheme-card"
                key={training._id || index}
              >
                <div className="scheme-icon">
                  🎓
                </div>

                <div className="scheme-content">

                  <h3>
                    {getTrainingName(training)}
                  </h3>

                  <span>
                    Training Program
                  </span>

                  <p>
                    Status:{" "}
                    <strong>
                      {getTrainingStatus(training)}
                    </strong>
                  </p>

                </div>
              </div>
            ))}

          </div>
        )}
      </section>

      {/* RECOMMENDED SCHEMES */}
      <section className="welfare-section">

        <div className="welfare-section-heading">
          <div>
            <h2>Recommended Government Schemes</h2>

            <p>
              Schemes recommended based on your worker profile.
            </p>
          </div>
        </div>

        {schemes.length === 0 ? (
          <div className="welfare-card">
            <div className="welfare-card-icon">
              🏛️
            </div>

            <h3>No Recommendations Available</h3>

            <p>
              Complete your worker profile to receive more
              personalized scheme recommendations.
            </p>
          </div>
        ) : (
          <div className="scheme-list">

            {schemes.map((scheme, index) => (
              <div
                className="scheme-card"
                key={scheme._id || index}
              >
                <div className="scheme-icon">
                  🏛️
                </div>

                <div className="scheme-content">
                  <h3>
                    {getSchemeName(scheme)}
                  </h3>

                  <p>
                    {scheme.description ||
                      scheme.details ||
                      "Government welfare scheme recommended for you."}
                  </p>
                </div>

                {scheme.applicationUrl && (
                  <button
                    onClick={() =>
                      openLink(scheme.applicationUrl)
                    }
                  >
                    Apply ↗
                  </button>
                )}
              </div>
            ))}

          </div>
        )}
      </section>

      {/* INSURANCE */}
      <section className="welfare-section">

        <div className="welfare-section-heading">
          <div>
            <h2>Insurance Protection</h2>

            <p>
              Insurance plans available through Sahaayak.
            </p>
          </div>
        </div>

        {insurancePlans.length === 0 ? (
          <div className="welfare-card">

            <div className="welfare-card-icon">
              🏥
            </div>

            <h3>No Insurance Plans Available</h3>

            <p>
              Insurance plans will appear here when they are
              made available by the cooperative administration.
            </p>

          </div>
        ) : (
          <div className="welfare-grid">

            {insurancePlans.map((plan, index) => (
              <div
                className="welfare-card"
                key={plan._id || index}
              >

                <div className="welfare-card-icon">
                  🛡️
                </div>

                <h3>
                  {plan.planName ||
                    plan.name ||
                    "Insurance Plan"}
                </h3>

                <p>
                  {plan.description ||
                    "Worker insurance protection plan."}
                </p>

                {plan.provider && (
                  <small>
                    Provider: {plan.provider}
                  </small>
                )}

                {plan.coverageAmount && (
                  <p>
                    Coverage:{" "}
                    <strong>
                      {formatCurrency(plan.coverageAmount)}
                    </strong>
                  </p>
                )}

                {plan.premiumAmount && (
                  <p>
                    Premium:{" "}
                    <strong>
                      {formatCurrency(plan.premiumAmount)}
                    </strong>
                  </p>
                )}

                {plan.applicationUrl && (
                  <button
                    onClick={() =>
                      openLink(plan.applicationUrl)
                    }
                  >
                    View Plan ↗
                  </button>
                )}

              </div>
            ))}

          </div>
        )}

      </section>

      {/* GOVERNMENT RESOURCES */}
      <section className="welfare-section">

        <div className="welfare-section-heading">
          <div>
            <h2>Government Resources</h2>

            <p>
              Official portals for worker welfare and social security.
            </p>
          </div>
        </div>

        <div className="quick-links">

          <button
            onClick={() =>
              openLink("https://eshram.gov.in/")
            }
          >
            <span>📋</span>

            <div>
              <strong>e-Shram Portal</strong>

              <small>
                Registration & worker services
              </small>
            </div>

            <b>↗</b>
          </button>

          <button
            onClick={() =>
              openLink(
                "https://www.skillindiadigital.gov.in/"
              )
            }
          >
            <span>🎓</span>

            <div>
              <strong>Skill India Digital</strong>

              <small>
                Courses & certifications
              </small>
            </div>

            <b>↗</b>
          </button>

          <button
            onClick={() =>
              openLink(
                "https://jansuraksha.gov.in/"
              )
            }
          >
            <span>🛡️</span>

            <div>
              <strong>Jan Suraksha</strong>

              <small>
                Insurance schemes
              </small>
            </div>

            <b>↗</b>
          </button>

          <button
            onClick={() =>
              openLink("https://maandhan.in/")
            }
          >
            <span>💰</span>

            <div>
              <strong>Maandhan</strong>

              <small>
                Pension & social security
              </small>
            </div>

            <b>↗</b>
          </button>

        </div>

      </section>

      {/* SUPPORT */}
      <div className="welfare-support-banner">

        <div className="welfare-support-icon">
          💬
        </div>

        <div>
          <h2>Need Worker Support?</h2>

          <p>
            Access official government support resources
            for unorganised workers.
          </p>
        </div>

        <button
          onClick={() =>
            openLink(
              "https://eshram.gov.in/"
            )
          }
        >
          Get Help ↗
        </button>

      </div>

      <p className="welfare-disclaimer">
        Sahaayak provides links to official government
        resources. Eligibility, benefits and application
        requirements are determined by the respective
        authorities.
      </p>

    </div>
  );
}

export default WorkerWelfare;