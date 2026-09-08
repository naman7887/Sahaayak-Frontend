import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const categories = [
    ["🔧", "Electrician"],
    ["🚰", "Plumber"],
    ["🪚", "Carpenter"],
    ["🎨", "Painter"],
    ["🧹", "Cleaning"],
    ["❄️", "AC Repair"],
    ["🌱", "Gardening"],
    ["🧱", "Mason"],
  ];

  const searchService = () => {
    if (search.trim()) {
      navigate(`/find-services?search=${encodeURIComponent(search.trim())}`);
    } else {
      navigate("/find-services");
    }
  };

  return (
    <main className="sahaayak-home">

      {/* HERO */}
      <section className="sahaayak-home-hero">
        <div className="sahaayak-hero-inner">

          <div className="sahaayak-hero-content">
            <p className="sahaayak-hero-kicker">
              YOUR COMMUNITY. YOUR SERVICES. YOUR SAHAAYAK.
            </p>

            <h1>
              Reliable help.
              <br />
              <span>Right when you need it.</span>
            </h1>

            <p className="sahaayak-hero-description">
              Trusted local professionals for your everyday
              household and community needs.
            </p>

            <div className="sahaayak-search">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") searchService();
                }}
                placeholder="What do you need?"
              />

              <button onClick={searchService}>
                🔍
              </button>
            </div>

            <button
              className="sahaayak-find-btn"
              onClick={() => navigate("/find-services")}
            >
              Find a Sahaayak
              <span>→</span>
            </button>
          </div>

          {/* NEW ILLUSTRATION */}
          <div className="sahaayak-hero-visual">
            <img
              src="/sahaayak-handyman.png"
              alt="Sahaayak service professional"
              className="sahaayak-handyman-image"
            />
          </div>

        </div>
      </section>


      {/* SERVICES */}
      <section className="sahaayak-services">

        <div className="sahaayak-section-heading">
          <p>EXPLORE</p>

          <h2>What can we help with?</h2>

          <span>
            Find skilled professionals for your everyday needs.
          </span>
        </div>


        <div className="sahaayak-category-grid">

          {categories.map(([icon, name]) => (
            <button
              key={name}
              className="sahaayak-category"
              onClick={() =>
                navigate(
                  `/find-services?search=${encodeURIComponent(name)}`
                )
              }
            >

              <span className="sahaayak-category-icon">
                {icon}
              </span>

              <div className="sahaayak-category-info">
                <strong>{name}</strong>

                <small>
                  Find professionals
                  <span className="category-arrow">→</span>
                </small>
              </div>

            </button>
          ))}

        </div>

      </section>


      {/* WHY SAHAAYAK */}
      <section className="sahaayak-why">

        <div className="sahaayak-section-heading">
          <p>WHY SAHAAYAK?</p>

          <h2>Built around trust.</h2>

          <span>
            Better services for customers. Better opportunities for workers.
          </span>
        </div>

        <div className="sahaayak-why-grid">

          <div className="sahaayak-why-card">
            <div>🤖</div>
            <h3>Smart Matching</h3>
            <p>
              Find suitable workers based on service,
              location and availability.
            </p>
          </div>

          <div className="sahaayak-why-card">
            <div>📍</div>
            <h3>Nearby Workers</h3>
            <p>
              Connect with service providers available
              around your location.
            </p>
          </div>

          <div className="sahaayak-why-card">
            <div>🛡️</div>
            <h3>Verified Providers</h3>
            <p>
              Discover trusted professionals through
              worker verification.
            </p>
          </div>

          <div className="sahaayak-why-card">
            <div>⭐</div>
            <h3>Rated Workers</h3>
            <p>
              Make better choices using customer ratings
              and completed jobs.
            </p>
          </div>

          <div className="sahaayak-why-card">
            <div>🤝</div>
            <h3>Fair Opportunities</h3>
            <p>
              Help local workers access more service
              opportunities in their communities.
            </p>
          </div>

        </div>

      </section>


      {/* HOW IT WORKS */}
      <section className="sahaayak-how">

        <div className="sahaayak-section-heading">
          <p>HOW IT WORKS</p>
          <h2>Simple from start to finish.</h2>
        </div>

        <div className="sahaayak-steps">

          <div className="sahaayak-step">
            <span>01</span>
            <div>
              <h3>Choose a service</h3>
              <p>Tell us what kind of help you need.</p>
            </div>
          </div>

          <div className="sahaayak-step-arrow">→</div>

          <div className="sahaayak-step">
            <span>02</span>
            <div>
              <h3>Smart matching</h3>
              <p>Sahaayak finds suitable nearby workers.</p>
            </div>
          </div>

          <div className="sahaayak-step-arrow">→</div>

          <div className="sahaayak-step">
            <span>03</span>
            <div>
              <h3>Get it done</h3>
              <p>Book the service and get your work completed.</p>
            </div>
          </div>

        </div>

      </section>


      {/* CTA */}
      <section className="sahaayak-cta">

        <div>
          <p>SAHAAYAK</p>

          <h2>
            Built for customers.
            <br />
            Built for local workers.
          </h2>
        </div>

        <div className="sahaayak-cta-actions">
  <button onClick={() => navigate("/find-services")}>
    Find a Service
  </button>

  <span className="sahaayak-cta-divider">|</span>

  <button onClick={() => navigate("/register")}>
    Become a Worker
  </button>
</div>

      </section>


      {/* FOOTER */}
      <footer className="sahaayak-footer">
        <strong>SAHAAYAK</strong>

        <span>
          Connecting communities with trusted local services.
        </span>
      </footer>

    </main>
  );
}

export default Home;