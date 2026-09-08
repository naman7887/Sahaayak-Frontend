import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import API_URL from "../config/api";

function FindServices() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [services, setServices] = useState([]);
  const [search, setSearch] = useState(
    searchParams.get("search") || ""
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const categories = [
    {
      name: "Electrician",
      icon: "⚡",
      description: "Electrical repairs & installation",
    },
    {
      name: "Plumber",
      icon: "🚰",
      description: "Pipes, taps & plumbing",
    },
    {
      name: "Carpenter",
      icon: "🪚",
      description: "Furniture & woodwork",
    },
    {
      name: "Painter",
      icon: "🎨",
      description: "Walls & home painting",
    },
    {
      name: "Cleaner",
      icon: "🧹",
      description: "Home & deep cleaning",
    },
    {
      name: "AC & Refrigeration",
      icon: "❄️",
      description: "AC repair & maintenance",
    },
    {
      name: "Gardener",
      icon: "🌱",
      description: "Garden & plant care",
    },
    {
      name: "Mason",
      icon: "🧱",
      description: "Construction & masonry",
    },
  ];

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/services`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to load services."
        );
      }

      setServices(
        data.services ||
          data.data ||
          []
      );
    } catch (err) {
      console.error("Services error:", err);

      setError(
        err.message ||
          "Unable to load services."
      );
    } finally {
      setLoading(false);
    }
  };

  const filteredServices = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    if (!query) return services;

    return services.filter((service) => {
      const name =
        service.name?.toLowerCase() || "";

      const category =
        service.category?.toLowerCase() || "";

      const description =
        service.description?.toLowerCase() || "";

      return (
        name.includes(query) ||
        category.includes(query) ||
        description.includes(query)
      );
    });
  }, [services, search]);

  const chooseCategory = (category) => {
    setSearch(category);
  };

  const openService = (service) => {
    navigate(
      `/service-details?service=${encodeURIComponent(
        service._id
      )}`
    );
  };

  const popularServices = [
    "Electrician",
    "Plumber",
    "Carpenter",
    "Cleaner",
  ];

  return (
    <>
      <style>{styles}</style>

      <main className="fs-page">

        {/* HEADER */}
        <header className="fs-header">

          <button
            className="fs-logo"
            onClick={() => navigate("/")}
          >
            SAHAAYAK
          </button>

          <nav className="fs-nav">
            <button
              onClick={() =>
                document
                  .getElementById("fs-services")
                  ?.scrollIntoView({
                    behavior: "smooth",
                  })
              }
            >
              Explore
            </button>

            <button
              onClick={() =>
                document
                  .getElementById("fs-how")
                  ?.scrollIntoView({
                    behavior: "smooth",
                  })
              }
            >
              How it works
            </button>
          </nav>

          <button
            className="fs-location"
            onClick={() =>
              navigate("/dashboard")
            }
          >
            <span>◉</span>
            My Dashboard
          </button>

        </header>

        {/* HERO */}
        <section className="fs-hero">

          <div className="fs-hero-copy">

            <p className="fs-eyebrow">
              FIND YOUR SAHAAYAK
            </p>

            <h1>
              Find the right help.
              <br />
              <span>Right around you.</span>
            </h1>

            <p className="fs-hero-description">
              Trusted local professionals for
              everyday household and community
              services.
            </p>

          </div>

          {/* SEARCH */}
          <div className="fs-search-wrapper">

            <div className="fs-search">

              <span className="fs-search-icon">
                ⌕
              </span>

              <input
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="What service do you need?"
              />

              {search && (
                <button
                  className="fs-clear"
                  onClick={() =>
                    setSearch("")
                  }
                >
                  ×
                </button>
              )}

              <span className="fs-search-location">
                ◉ Near you
              </span>

            </div>

          </div>

        </section>

        {/* POPULAR */}
        <section className="fs-popular">

          <div className="fs-section-mini">
            POPULAR RIGHT NOW
          </div>

          <div className="fs-popular-list">

            {popularServices.map(
              (category) => (
                <button
                  key={category}
                  className={
                    search === category
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    chooseCategory(category)
                  }
                >
                  {category}
                </button>
              )
            )}

          </div>

        </section>

        {/* CATEGORY SECTION */}
        <section
          className="fs-categories"
          id="fs-services"
        >

          <div className="fs-section-heading">

            <div>
              <p className="fs-eyebrow">
                EXPLORE SERVICES
              </p>

              <h2>
                What can we help with?
              </h2>
            </div>

            <span>
              {search
                ? `${filteredServices.length} services found`
                : `${services.length} services available`}
            </span>

          </div>

          <div className="fs-category-grid">

            {categories.map(
              (category, index) => (
                <button
                  key={category.name}
                  className={`fs-category-card ${
                    search === category.name
                      ? "selected"
                      : ""
                  }`}
                  style={{
                    animationDelay: `${
                      index * 60
                    }ms`,
                  }}
                  onClick={() =>
                    chooseCategory(
                      category.name
                    )
                  }
                >

                  <div className="fs-category-icon">
                    {category.icon}
                  </div>

                  <div className="fs-category-content">

                    <strong>
                      {category.name}
                    </strong>

                    <span>
                      {category.description}
                    </span>

                  </div>

                  <span className="fs-arrow">
                    →
                  </span>

                </button>
              )
            )}

          </div>

        </section>

        {/* SERVICES */}
        <section className="fs-service-section">

          <div className="fs-service-heading">

            <div>
              <p className="fs-eyebrow">
                AVAILABLE SERVICES
              </p>

              <h2>
                {search
                  ? `Services for "${search}"`
                  : "Choose a service"}
              </h2>
            </div>

            {!loading &&
              search &&
              filteredServices.length > 0 && (
                <button
                  className="fs-show-all"
                  onClick={() =>
                    setSearch("")
                  }
                >
                  Show all
                </button>
              )}

          </div>

          {loading ? (
            <div className="fs-loading">

              <div className="fs-spinner"></div>

              <p>
                Loading available services...
              </p>

            </div>
          ) : error ? (
            <div className="fs-error">

              <div>!</div>

              <h3>
                Couldn't load services
              </h3>

              <p>{error}</p>

              <button
                onClick={loadServices}
              >
                Try Again
              </button>

            </div>
          ) : filteredServices.length === 0 ? (
            <div className="fs-empty">

              <div className="fs-empty-icon">
                ⌕
              </div>

              <h3>
                No matching services
              </h3>

              <p>
                We couldn't find a service
                matching "{search}".
              </p>

              <button
                onClick={() =>
                  setSearch("")
                }
              >
                Browse all services
              </button>

            </div>
          ) : (
            <div className="fs-service-grid">

              {filteredServices.map(
                (service, index) => (
                  <article
                    key={service._id}
                    className="fs-service-card"
                    style={{
                      animationDelay: `${
                        index * 70
                      }ms`,
                    }}
                  >

                    <div className="fs-service-top">

                      <div className="fs-service-symbol">
                        {getServiceIcon(
                          service.category,
                          service.name
                        )}
                      </div>

                      <span className="fs-service-category">
                        {service.category}
                      </span>

                    </div>

                    <h3>
                      {service.name}
                    </h3>

                    <p>
                      {service.description ||
                        `Professional ${service.category?.toLowerCase() || "home"} service from a trusted local provider.`}
                    </p>

                    <div className="fs-service-bottom">

                      <div>

                        <span>
                          STARTING FROM
                        </span>

                        <strong>
                          ₹
                          {Number(
                            service.basePrice ||
                              0
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </strong>

                      </div>

                      <button
                        onClick={() =>
                          openService(
                            service
                          )
                        }
                      >
                        View
                        <span>→</span>
                      </button>

                    </div>

                  </article>
                )
              )}

            </div>
          )}

        </section>

        {/* HOW IT WORKS */}
        <section
          className="fs-how"
          id="fs-how"
        >

          <div className="fs-how-heading">

            <p className="fs-eyebrow">
              HOW SAHAAYAK WORKS
            </p>

            <h2>
              From request to
              <span> reliable help.</span>
            </h2>

          </div>

          <div className="fs-how-grid">

            <div className="fs-how-item">

              <div className="fs-how-number">
                01
              </div>

              <div>
                <h3>
                  Choose a service
                </h3>

                <p>
                  Tell us what kind of help
                  you need.
                </p>
              </div>

            </div>

            <div className="fs-how-line"></div>

            <div className="fs-how-item">

              <div className="fs-how-number">
                02
              </div>

              <div>
                <h3>
                  Share your location
                </h3>

                <p>
                  We use your location to
                  find nearby providers.
                </p>
              </div>

            </div>

            <div className="fs-how-line"></div>

            <div className="fs-how-item">

              <div className="fs-how-number">
                03
              </div>

              <div>
                <h3>
                  Smart matching
                </h3>

                <p>
                  Sahaayak selects a suitable
                  verified worker.
                </p>
              </div>

            </div>

          </div>

        </section>

        {/* CTA */}
        <section className="fs-cta">

          <div>
            <p className="fs-eyebrow">
              READY WHEN YOU ARE
            </p>

            <h2>
              Your service.
              <br />
              Your location.
              <br />
              <span>Your Sahaayak.</span>
            </h2>
          </div>

          <button
            onClick={() =>
              document
                .getElementById(
                  "fs-services"
                )
                ?.scrollIntoView({
                  behavior: "smooth",
                })
            }
          >
            Start a request
            <span>→</span>
          </button>

        </section>

        {/* FOOTER */}
        <footer className="fs-footer">

          <strong>
            SAHAAYAK
          </strong>

          <span>
            Connecting communities with
            trusted local services.
          </span>

        </footer>

      </main>
    </>
  );
}

function getServiceIcon(
  category = "",
  name = ""
) {
  const text =
    `${category} ${name}`.toLowerCase();

  if (text.includes("electric"))
    return "⚡";

  if (text.includes("plumb"))
    return "🚰";

  if (text.includes("carpent"))
    return "🪚";

  if (text.includes("paint"))
    return "🎨";

  if (text.includes("clean"))
    return "🧹";

  if (
    text.includes("ac") ||
    text.includes("refriger")
  )
    return "❄️";

  if (text.includes("garden"))
    return "🌱";

  if (text.includes("mason"))
    return "🧱";

  if (text.includes("appliance"))
    return "🔧";

  return "✦";
}

const styles = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@500;600;700&display=swap');

.fs-page {
  min-height: 100vh;
  background: #ffffe3;
  color: #4a4a4a;
  font-family: 'Inter', sans-serif;
}

.fs-page * {
  box-sizing: border-box;
}

.fs-header {
  height: 72px;
  padding: 0 7%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #e5e4d9;
  background: rgba(255,255,227,.88);
}

.fs-logo {
  padding: 0;
  border: none;
  background: transparent;
  color: #6d8196;
  font-family: 'Poppins', sans-serif;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 2px;
  cursor: pointer;
}

.fs-nav {
  display: flex;
  gap: 32px;
}

.fs-nav button {
  padding: 8px 0;
  border: none;
  background: transparent;
  color: #747c80;
  font-size: 11px;
  cursor: pointer;
}

.fs-nav button:hover {
  color: #6d8196;
}

.fs-location {
  padding: 9px 13px;
  display: flex;
  align-items: center;
  gap: 7px;
  border: 1px solid #dedfd7;
  border-radius: 20px;
  background: white;
  color: #727b80;
  font-size: 9px;
  font-weight: 600;
  cursor: pointer;
}

.fs-location span {
  color: #6d8196;
}

.fs-hero {
  padding: 88px 7% 45px;
  text-align: center;
}

.fs-hero-copy {
  max-width: 700px;
  margin: auto;
}

.fs-eyebrow {
  margin: 0 0 10px;
  color: #6d8196;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 1.8px;
}

.fs-hero h1 {
  margin: 0;
  color: #454d52;
  font-family: 'Poppins', sans-serif;
  font-size: clamp(38px, 6vw, 58px);
  line-height: 1.05;
  letter-spacing: -1.8px;
  font-weight: 600;
}

.fs-hero h1 span {
  color: #6d8196;
}

.fs-hero-description {
  max-width: 500px;
  margin: 17px auto 0;
  color: #8a9294;
  font-size: 12px;
  line-height: 1.7;
}

.fs-search-wrapper {
  max-width: 800px;
  margin: 36px auto 0;
}

.fs-search {
  height: 64px;
  padding: 8px 10px 8px 20px;
  display: flex;
  align-items: center;
  gap: 13px;
  border: 1px solid #d7d9d3;
  border-radius: 15px;
  background: white;
  box-shadow: 0 12px 30px rgba(74,74,74,.06);
}

.fs-search-icon {
  color: #6d8196;
  font-size: 25px;
  line-height: 1;
}

.fs-search input {
  flex: 1;
  min-width: 0;
  border: none;
  outline: none;
  background: transparent;
  color: #4a4a4a;
  font-family: 'Inter', sans-serif;
  font-size: 12px;
}

.fs-search input::placeholder {
  color: #a2a7a7;
}

.fs-clear {
  border: none;
  background: transparent;
  color: #9da2a3;
  font-size: 20px;
  cursor: pointer;
}

.fs-search-location {
  padding: 10px 13px;
  border-left: 1px solid #e7e7e0;
  color: #758083;
  font-size: 9px;
  font-weight: 600;
  white-space: nowrap;
}

.fs-popular {
  max-width: 1120px;
  margin: 0 auto;
  padding: 22px 30px;
  display: flex;
  align-items: center;
  gap: 25px;
  border-top: 1px solid #e3e2d9;
  border-bottom: 1px solid #e3e2d9;
}

.fs-section-mini {
  color: #9b9f9e;
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 1.3px;
  white-space: nowrap;
}

.fs-popular-list {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.fs-popular-list button {
  padding: 8px 13px;
  border: 1px solid #dfdfd7;
  border-radius: 99px;
  background: white;
  color: #747c80;
  font-size: 9px;
  cursor: pointer;
  transition: .2s ease;
}

.fs-popular-list button:hover,
.fs-popular-list button.active {
  border-color: #aab7c1;
  background: #eef1f2;
  color: #617487;
}

.fs-categories,
.fs-service-section {
  max-width: 1120px;
  margin: auto;
  padding: 70px 30px 0;
}

.fs-section-heading,
.fs-service-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 25px;
}

.fs-section-heading h2,
.fs-service-heading h2 {
  margin: 0;
  color: #555d61;
  font-family: 'Poppins', sans-serif;
  font-size: 27px;
  font-weight: 600;
}

.fs-section-heading > span {
  color: #a0a5a5;
  font-size: 9px;
}

.fs-category-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 13px;
}

.fs-category-card {
  position: relative;
  min-height: 128px;
  padding: 19px;
  display: flex;
  align-items: flex-start;
  gap: 13px;
  border: 1px solid #deded6;
  border-radius: 15px;
  background: white;
  text-align: left;
  cursor: pointer;
  overflow: hidden;
  animation: fs-rise .45s ease both;
  transition: .25s ease;
}

.fs-category-card::after {
  content: "";
  position: absolute;
  right: -30px;
  bottom: -40px;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: #f4f4ec;
  transition: .3s ease;
}

.fs-category-card:hover,
.fs-category-card.selected {
  border-color: #b8c2c9;
  transform: translateY(-3px);
  box-shadow: 0 12px 25px rgba(74,74,74,.055);
}

.fs-category-card:hover::after,
.fs-category-card.selected::after {
  transform: scale(1.4);
}

.fs-category-icon {
  position: relative;
  z-index: 1;
  width: 42px;
  height: 42px;
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: #f4f4ed;
  font-size: 20px;
}

.fs-category-content {
  position: relative;
  z-index: 1;
  min-width: 0;
  padding-top: 3px;
}

.fs-category-content strong {
  display: block;
  color: #596166;
  font-family: 'Poppins', sans-serif;
  font-size: 12px;
}

.fs-category-content span {
  display: block;
  margin-top: 5px;
  color: #969d9e;
  font-size: 8px;
  line-height: 1.5;
}

.fs-arrow {
  position: absolute;
  z-index: 2;
  right: 16px;
  bottom: 14px;
  color: #8c989f;
  font-size: 13px;
  transition: .2s ease;
}

.fs-category-card:hover .fs-arrow {
  transform: translateX(4px);
  color: #6d8196;
}

.fs-service-section {
  padding-top: 80px;
}

.fs-service-heading {
  align-items: center;
}

.fs-show-all {
  padding: 7px 11px;
  border: none;
  background: transparent;
  color: #6d8196;
  font-size: 9px;
  font-weight: 700;
  cursor: pointer;
}

.fs-service-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
}

.fs-service-card {
  padding: 21px;
  border: 1px solid #deded6;
  border-radius: 16px;
  background: white;
  animation: fs-rise .45s ease both;
  transition: .25s ease;
}

.fs-service-card:hover {
  transform: translateY(-3px);
  border-color: #c1c9ce;
  box-shadow: 0 14px 30px rgba(74,74,74,.055);
}

.fs-service-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.fs-service-symbol {
  width: 43px;
  height: 43px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: #f3f3ec;
  font-size: 20px;
}

.fs-service-category {
  color: #929a9c;
  font-size: 8px;
  font-weight: 700;
  text-align: right;
}

.fs-service-card h3 {
  margin: 18px 0 7px;
  color: #535b60;
  font-family: 'Poppins', sans-serif;
  font-size: 15px;
}

.fs-service-card > p {
  min-height: 40px;
  margin: 0;
  color: #959b9c;
  font-size: 9px;
  line-height: 1.6;
}

.fs-service-bottom {
  margin-top: 20px;
  padding-top: 14px;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 10px;
  border-top: 1px solid #eeeeea;
}

.fs-service-bottom span:first-child {
  display: block;
  margin-bottom: 4px;
  color: #a0a5a5;
  font-size: 7px;
  font-weight: 800;
  letter-spacing: .8px;
}

.fs-service-bottom strong {
  color: #566066;
  font-family: 'Poppins', sans-serif;
  font-size: 17px;
}

.fs-service-bottom button {
  padding: 9px 12px;
  display: flex;
  align-items: center;
  gap: 7px;
  border: 1px solid #d5d9da;
  border-radius: 8px;
  background: #f7f7f2;
  color: #68767e;
  font-size: 8px;
  font-weight: 700;
  cursor: pointer;
  transition: .2s ease;
}

.fs-service-bottom button:hover {
  background: #6d8196;
  border-color: #6d8196;
  color: white;
}

.fs-service-bottom button span {
  margin: 0;
  color: inherit;
  font-size: 11px;
}

.fs-loading {
  min-height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  border: 1px dashed #d8d8cf;
  border-radius: 16px;
  color: #969d9e;
  font-size: 10px;
}

.fs-spinner {
  width: 30px;
  height: 30px;
  margin-bottom: 13px;
  border: 2px solid #e2e3dc;
  border-top-color: #6d8196;
  border-radius: 50%;
  animation: fs-spin .8s linear infinite;
}

.fs-error,
.fs-empty {
  padding: 50px 25px;
  text-align: center;
  border: 1px dashed #d8d8cf;
  border-radius: 16px;
  background: rgba(255,255,255,.4);
}

.fs-error > div,
.fs-empty-icon {
  width: 43px;
  height: 43px;
  margin: 0 auto 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: #f0f0e8;
  color: #7b8990;
  font-size: 17px;
}

.fs-error h3,
.fs-empty h3 {
  margin: 0;
  color: #596166;
  font-family: 'Poppins', sans-serif;
  font-size: 15px;
}

.fs-error p,
.fs-empty p {
  margin: 7px auto 17px;
  color: #999f9f;
  font-size: 9px;
}

.fs-error button,
.fs-empty button {
  padding: 10px 15px;
  border: none;
  border-radius: 8px;
  background: #6d8196;
  color: white;
  font-size: 9px;
  font-weight: 700;
  cursor: pointer;
}

.fs-how {
  max-width: 1120px;
  margin: 100px auto 0;
  padding: 60px 30px;
  border-top: 1px solid #e0dfd6;
  border-bottom: 1px solid #e0dfd6;
}

.fs-how-heading h2 {
  margin: 0;
  color: #555d61;
  font-family: 'Poppins', sans-serif;
  font-size: 28px;
  font-weight: 600;
}

.fs-how-heading h2 span {
  color: #6d8196;
}

.fs-how-grid {
  margin-top: 35px;
  display: grid;
  grid-template-columns: 1fr auto 1fr auto 1fr;
  align-items: center;
  gap: 18px;
}

.fs-how-item {
  display: flex;
  align-items: flex-start;
  gap: 13px;
}

.fs-how-number {
  color: #6d8196;
  font-family: 'Poppins', sans-serif;
  font-size: 18px;
  font-weight: 600;
}

.fs-how-item h3 {
  margin: 0;
  color: #626a6e;
  font-family: 'Poppins', sans-serif;
  font-size: 12px;
}

.fs-how-item p {
  margin: 5px 0 0;
  color: #999f9f;
  font-size: 8px;
  line-height: 1.5;
}

.fs-how-line {
  width: 38px;
  height: 1px;
  background: #d8d9d3;
}

.fs-cta {
  max-width: 1120px;
  margin: auto;
  padding: 80px 30px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 30px;
}

.fs-cta h2 {
  margin: 0;
  color: #555d61;
  font-family: 'Poppins', sans-serif;
  font-size: 29px;
  line-height: 1.15;
  font-weight: 600;
}

.fs-cta h2 span {
  color: #6d8196;
}

.fs-cta button {
  min-width: 165px;
  padding: 14px 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 13px;
  border: none;
  border-radius: 10px;
  background: #6d8196;
  color: white;
  font-size: 10px;
  font-weight: 800;
  cursor: pointer;
  transition: .2s ease;
}

.fs-cta button:hover {
  background: #5d7185;
  transform: translateY(-2px);
}

.fs-cta button span {
  font-size: 14px;
}

.fs-footer {
  padding: 25px 7%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  border-top: 1px solid #e2e1d8;
  color: #9ba0a0;
  font-size: 8px;
}

.fs-footer strong {
  color: #6d8196;
  font-family: 'Poppins', sans-serif;
  letter-spacing: 1.5px;
}

@keyframes fs-rise {
  from {
    opacity: 0;
    transform: translateY(12px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fs-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 900px) {
  .fs-category-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .fs-service-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .fs-how-grid {
    grid-template-columns: 1fr;
    gap: 22px;
  }

  .fs-how-line {
    display: none;
  }
}

@media (max-width: 650px) {
  .fs-header {
    padding: 0 20px;
  }

  .fs-nav {
    display: none;
  }

  .fs-location {
    font-size: 8px;
  }

  .fs-hero {
    padding: 60px 20px 35px;
  }

  .fs-search {
    height: auto;
    min-height: 58px;
    flex-wrap: wrap;
    padding: 12px 15px;
  }

  .fs-search input {
    min-width: 150px;
  }

  .fs-search-location {
    width: 100%;
    padding: 8px 0 0;
    border-left: none;
    border-top: 1px solid #eeeeea;
  }

  .fs-popular {
    margin: 0 20px;
    padding: 20px 0;
    align-items: flex-start;
    flex-direction: column;
    gap: 12px;
  }

  .fs-categories,
  .fs-service-section,
  .fs-how {
    padding-left: 20px;
    padding-right: 20px;
  }

  .fs-section-heading,
  .fs-service-heading {
    align-items: flex-start;
    flex-direction: column;
    gap: 8px;
  }

  .fs-category-grid,
  .fs-service-grid {
    grid-template-columns: 1fr;
  }

  .fs-category-card {
    min-height: 105px;
  }

  .fs-cta {
    padding: 60px 20px;
    align-items: flex-start;
    flex-direction: column;
  }

  .fs-footer {
    padding: 25px 20px;
    align-items: flex-start;
    flex-direction: column;
  }
}
`;

export default FindServices;