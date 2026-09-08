import { useEffect, useState } from "react";
import "./WorkerWelfare.css";

function WorkerWelfare() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await fetch(
          "http://localhost:5000/api/auth/me",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (response.ok) {
          setUser(data.user);
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchUser();
  }, []);

  const openLink = (url) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="welfare-page">

      <div className="welfare-header">
        <div>
          <p className="welfare-eyebrow">
            Sahaayak Worker Support
          </p>

          <h1>Worker Welfare & Benefits</h1>

          <p>
            Access government welfare schemes, insurance,
            pension support and skill-development opportunities.
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
          <h2>{user?.name || "Service Provider"}</h2>
          <p>
            {user?.phone || "Registered Sahaayak worker"}
          </p>
        </div>

        <div className="welfare-profile-status">
          <span>●</span>
          Worker Support Active
        </div>
      </div>

      {/* BENEFITS */}
      <section className="welfare-section">

        <div className="welfare-section-heading">
          <div>
            <h2>Worker Support</h2>
            <p>
              Important resources for financial security,
              protection and professional growth.
            </p>
          </div>
        </div>

        <div className="welfare-grid">

          <div className="welfare-card">
            <div className="welfare-card-icon">💰</div>

            <h3>Financial & Pension</h3>

            <p>
              Explore pension and financial-security programs
              available to eligible unorganised workers.
            </p>

            <button
              onClick={() =>
                openLink("https://maandhan.in/")
              }
            >
              Explore PM-SYM →
            </button>
          </div>

          <div className="welfare-card">
            <div className="welfare-card-icon">🏥</div>

            <h3>Insurance Protection</h3>

            <p>
              Access official information about government
              accident and life insurance schemes.
            </p>

            <button
              onClick={() =>
                openLink("https://jansuraksha.gov.in/")
              }
            >
              View Insurance →
            </button>
          </div>

          <div className="welfare-card">
            <div className="welfare-card-icon">🎓</div>

            <h3>Skill Development</h3>

            <p>
              Find government-backed courses, certifications
              and training opportunities.
            </p>

            <button
              onClick={() =>
                openLink("https://www.skillindiadigital.gov.in/")
              }
            >
              Find Training →
            </button>
          </div>

          <div className="welfare-card">
            <div className="welfare-card-icon">📄</div>

            <h3>e-Shram Registration</h3>

            <p>
              Register or update your profile on the official
              National Database of Unorganised Workers.
            </p>

            <button
              onClick={() =>
                openLink("https://eshram.gov.in/")
              }
            >
              Visit e-Shram →
            </button>
          </div>

        </div>
      </section>

      {/* GOVERNMENT SCHEMES */}
      <section className="welfare-section">

        <div className="welfare-section-heading">
          <div>
            <h2>Government Schemes</h2>
            <p>
              Official resources for commonly relevant worker schemes.
            </p>
          </div>
        </div>

        <div className="scheme-list">

          <div className="scheme-card">
            <div className="scheme-icon">👴</div>

            <div className="scheme-content">
              <h3>PM-SYM</h3>

              <span>
                Pradhan Mantri Shram Yogi Maandhan
              </span>

              <p>
                Pension scheme for eligible unorganised workers.
              </p>
            </div>

            <button
              onClick={() =>
                openLink("https://maandhan.in/")
              }
            >
              Official Site ↗
            </button>
          </div>

          <div className="scheme-card">
            <div className="scheme-icon">🛡️</div>

            <div className="scheme-content">
              <h3>PMSBY</h3>

              <span>
                Pradhan Mantri Suraksha Bima Yojana
              </span>

              <p>
                Government-backed accident insurance scheme.
              </p>
            </div>

            <button
              onClick={() =>
                openLink("https://jansuraksha.gov.in/")
              }
            >
              Official Site ↗
            </button>
          </div>

          <div className="scheme-card">
            <div className="scheme-icon">❤️</div>

            <div className="scheme-content">
              <h3>PMJJBY</h3>

              <span>
                Pradhan Mantri Jeevan Jyoti Bima Yojana
              </span>

              <p>
                Government-backed life insurance scheme.
              </p>
            </div>

            <button
              onClick={() =>
                openLink("https://jansuraksha.gov.in/")
              }
            >
              Official Site ↗
            </button>
          </div>

          <div className="scheme-card">
            <div className="scheme-icon">🧑‍🔧</div>

            <div className="scheme-content">
              <h3>e-Shram</h3>

              <span>
                National Database of Unorganised Workers
              </span>

              <p>
                Registration and worker-support information
                from the Ministry of Labour & Employment.
              </p>
            </div>

            <button
              onClick={() =>
                openLink("https://eshram.gov.in/")
              }
            >
              Official Site ↗
            </button>
          </div>

        </div>
      </section>

      {/* QUICK LINKS */}
      <section className="welfare-section">

        <div className="welfare-section-heading">
          <div>
            <h2>Quick Access</h2>
            <p>
              Direct access to official worker resources.
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
              <small>Registration & worker services</small>
            </div>
            <b>↗</b>
          </button>

          <button
            onClick={() =>
              openLink("https://www.skillindiadigital.gov.in/")
            }
          >
            <span>🎓</span>
            <div>
              <strong>Skill India Digital</strong>
              <small>Courses & certifications</small>
            </div>
            <b>↗</b>
          </button>

          <button
            onClick={() =>
              openLink("https://jansuraksha.gov.in/")
            }
          >
            <span>🛡️</span>
            <div>
              <strong>Jan Suraksha</strong>
              <small>Insurance schemes</small>
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
              <small>Pension & social security</small>
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
            For e-Shram assistance, the official portal provides
            a multilingual helpdesk.
          </p>
        </div>

        <button
          onClick={() =>
            openLink("https://www.eshram.gov.in/helpdesk")
          }
        >
          Get Help ↗
        </button>

      </div>

      <p className="welfare-disclaimer">
        Sahaayak provides links to official government resources.
        Eligibility, benefits and application requirements are
        determined by the respective government authorities.
      </p>

    </div>
  );
}

export default WorkerWelfare;