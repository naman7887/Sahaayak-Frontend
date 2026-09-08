import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API_URL from "../config/api";

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "customer",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleRoleChange = (role) => {
    setForm({
      ...form,
      role,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (
      !form.name.trim() ||
      !form.email.trim() ||
      !form.phone.trim() ||
      !form.password
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/api/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: form.name.trim(),
            email: form.email.trim(),
            phone: form.phone.trim(),
            password: form.password,
            role: form.role,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to create account."
        );
      }

      const token = data.token || data.accessToken;

      if (token) {
        localStorage.setItem("token", token);
      }

      if (data.user) {
        localStorage.setItem(
          "user",
          JSON.stringify(data.user)
        );
      }

      setSuccess(
        "Account created successfully. Redirecting..."
      );

      const role = data.user?.role || form.role;

      setTimeout(() => {
        if (role === "worker") {
          navigate("/worker-dashboard");
        } else {
          navigate("/dashboard");
        }
      }, 700);

    } catch (err) {
      console.error("Registration error:", err);
      setError(
        err.message || "Unable to create your account."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{styles}</style>

      <div className="register-page-new">

        <div className="register-shell">

          {/* LEFT */}
          <div className="register-info">

            <Link to="/" className="register-logo">
              SAHAAYAK
            </Link>

            <div className="register-info-content">

              <span className="register-eyebrow">
                JOIN THE COMMUNITY
              </span>

              <h1>
                Better services.
                <br />
                Stronger communities.
              </h1>

              <p>
                Sahaayak connects customers with trusted
                local professionals while creating fair
                opportunities for skilled workers.
              </p>

              <div className="register-benefits">

                <div>
                  <span>01</span>
                  <section>
                    <strong>For Customers</strong>
                    <p>
                      Find reliable local help quickly.
                    </p>
                  </section>
                </div>

                <div>
                  <span>02</span>
                  <section>
                    <strong>For Workers</strong>
                    <p>
                      Get relevant jobs near you.
                    </p>
                  </section>
                </div>

                <div>
                  <span>03</span>
                  <section>
                    <strong>Smart Matching</strong>
                    <p>
                      Location and skill-based matching.
                    </p>
                  </section>
                </div>

              </div>

            </div>

          </div>

          {/* FORM */}
          <div className="register-form-side">

            <div className="register-form-card">

              <div className="register-heading">
                <span>CREATE ACCOUNT</span>

                <h2>Get started with Sahaayak</h2>

                <p>
                  Choose how you'd like to use the platform.
                </p>
              </div>

              {error && (
                <div className="register-error">
                  <span>!</span>
                  {error}
                </div>
              )}

              {success && (
                <div className="register-success">
                  <span>✓</span>
                  {success}
                </div>
              )}

              <form onSubmit={handleSubmit}>

                <label>
                  Full Name
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    autoComplete="name"
                  />
                </label>

                <div className="register-row">

                  <label>
                    Email
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      autoComplete="email"
                    />
                  </label>

                  <label>
                    Phone
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="Phone number"
                      autoComplete="tel"
                    />
                  </label>

                </div>

                <label>
                  Password
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Minimum 6 characters"
                    autoComplete="new-password"
                  />
                </label>

                <div className="role-heading">
                  <span>ACCOUNT TYPE</span>
                </div>

                <div className="role-grid">

                  <button
                    type="button"
                    className={
                      form.role === "customer"
                        ? "role-card selected"
                        : "role-card"
                    }
                    onClick={() =>
                      handleRoleChange("customer")
                    }
                  >
                    <div className="role-icon">
                      ◉
                    </div>

                    <div>
                      <strong>Customer</strong>
                      <small>
                        Find and book services
                      </small>
                    </div>

                    <span className="role-check">
                      {form.role === "customer"
                        ? "✓"
                        : ""}
                    </span>
                  </button>

                  <button
                    type="button"
                    className={
                      form.role === "worker"
                        ? "role-card selected"
                        : "role-card"
                    }
                    onClick={() =>
                      handleRoleChange("worker")
                    }
                  >
                    <div className="role-icon">
                      ✦
                    </div>

                    <div>
                      <strong>Worker</strong>
                      <small>
                        Offer your professional skills
                      </small>
                    </div>

                    <span className="role-check">
                      {form.role === "worker"
                        ? "✓"
                        : ""}
                    </span>
                  </button>

                </div>

                <button
                  type="submit"
                  className="register-submit"
                  disabled={loading}
                >
                  {loading
                    ? "Creating account..."
                    : "Create Account"}

                  {!loading && <span>→</span>}
                </button>

              </form>

              <p className="register-login">
                Already have an account?{" "}
                <Link to="/login">
                  Sign in
                </Link>
              </p>

            </div>

          </div>

        </div>

      </div>
    </>
  );
}

const styles = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@500;600;700&display=swap');

.register-page-new {
  min-height: calc(100vh - 72px);
  background: #ffffe3;
  padding: 35px 25px;
  font-family: 'Inter', sans-serif;
  color: #4a4a4a;
  display: flex;
  align-items: center;
  justify-content: center;
}

.register-page-new * {
  box-sizing: border-box;
}

.register-shell {
  width: 1160px;
  max-width: 100%;
  min-height: 720px;
  background: white;
  border: 1px solid #e2e2d7;
  border-radius: 30px;
  overflow: hidden;
  display: grid;
  grid-template-columns: .82fr 1.18fr;
  box-shadow: 0 18px 55px rgba(74,74,74,.08);
}

.register-info {
  position: relative;
  overflow: hidden;
  background: #6d8196;
  color: white;
  padding: 43px;
}

.register-info::before {
  content: "";
  position: absolute;
  width: 440px;
  height: 440px;
  border: 1px solid rgba(255,255,255,.13);
  border-radius: 50%;
  left: -270px;
  bottom: -180px;
}

.register-info::after {
  content: "";
  position: absolute;
  width: 280px;
  height: 280px;
  border: 1px solid rgba(255,255,255,.12);
  border-radius: 50%;
  right: -150px;
  top: -100px;
}

.register-logo {
  position: relative;
  z-index: 2;
  color: white;
  text-decoration: none;
  font-family: 'Poppins', sans-serif;
  font-size: 19px;
  letter-spacing: 2px;
  font-weight: 700;
}

.register-info-content {
  position: relative;
  z-index: 2;
  margin-top: 150px;
}

.register-eyebrow {
  color: #dfe5e3;
  font-size: 9px;
  letter-spacing: 1.7px;
  font-weight: 700;
}

.register-info h1 {
  font-family: 'Poppins', sans-serif;
  font-size: 36px;
  line-height: 1.18;
  margin: 12px 0 18px;
}

.register-info-content > p {
  max-width: 390px;
  color: #e2e7e5;
  font-size: 13px;
  line-height: 1.75;
}

.register-benefits {
  margin-top: 42px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.register-benefits > div {
  display: flex;
  gap: 13px;
  align-items: flex-start;
}

.register-benefits > div > span {
  font-family: 'Poppins', sans-serif;
  font-size: 11px;
  color: #d7dfdc;
  padding-top: 2px;
}

.register-benefits strong {
  font-size: 12px;
}

.register-benefits p {
  margin: 4px 0 0;
  color: #dbe2df;
  font-size: 11px;
}

.register-form-side {
  padding: 45px 55px;
  display: flex;
  align-items: center;
}

.register-form-card {
  width: 100%;
  max-width: 610px;
  margin: auto;
}

.register-heading > span,
.role-heading span {
  color: #6d8196;
  font-size: 9px;
  letter-spacing: 1.5px;
  font-weight: 700;
}

.register-heading h2 {
  font-family: 'Poppins', sans-serif;
  color: #3f464c;
  font-size: 25px;
  margin: 7px 0;
}

.register-heading p {
  color: #8c8c85;
  font-size: 12px;
  margin: 0 0 25px;
}

.register-form-card form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.register-form-card label {
  font-size: 11px;
  color: #5d615f;
  font-weight: 700;
}

.register-form-card input {
  width: 100%;
  display: block;
  margin-top: 6px;
  padding: 12px 13px;
  border: 1px solid #dcdcd1;
  border-radius: 10px;
  background: #fcfcf6;
  color: #4a4a4a;
  outline: none;
  font-family: inherit;
  font-size: 12px;
}

.register-form-card input:focus {
  border-color: #6d8196;
  background: white;
}

.register-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 13px;
}

.role-heading {
  margin-top: 5px;
  margin-bottom: -5px;
}

.role-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.role-card {
  border: 1px solid #deded3;
  border-radius: 13px;
  background: #fcfcf6;
  padding: 14px;
  display: grid;
  grid-template-columns: 38px 1fr 20px;
  align-items: center;
  gap: 9px;
  text-align: left;
  cursor: pointer;
  transition: .2s;
  color: #4a4a4a;
}

.role-card:hover {
  border-color: #aebbc5;
  transform: translateY(-1px);
}

.role-card.selected {
  border-color: #6d8196;
  background: #f0f2f0;
  box-shadow: 0 0 0 2px rgba(109,129,150,.08);
}

.role-icon {
  width: 35px;
  height: 35px;
  border-radius: 10px;
  background: #e9edf0;
  color: #667c90;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.role-card strong {
  display: block;
  font-size: 12px;
}

.role-card small {
  display: block;
  margin-top: 3px;
  color: #96968e;
  font-size: 9px;
}

.role-check {
  color: #6d8196;
  font-weight: 700;
  font-size: 15px;
}

.register-submit {
  border: none;
  border-radius: 11px;
  background: #6d8196;
  color: white;
  padding: 14px;
  margin-top: 5px;
  font-family: 'Poppins', sans-serif;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 13px;
  transition: .2s;
}

.register-submit:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(74,74,74,.14);
}

.register-submit:disabled {
  opacity: .65;
  cursor: wait;
  transform: none;
}

.register-submit span {
  font-size: 18px;
}

.register-login {
  text-align: center;
  color: #92928b;
  font-size: 11px;
  margin: 19px 0 0;
}

.register-login a {
  color: #6d8196;
  font-weight: 700;
  text-decoration: none;
}

.register-error,
.register-success {
  padding: 10px 12px;
  border-radius: 9px;
  margin-bottom: 17px;
  font-size: 11px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.register-error {
  background: #f3ebe8;
  color: #806860;
}

.register-success {
  background: #e9eee9;
  color: #637762;
}

.register-error span,
.register-success span {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
}

.register-error span {
  background: #806860;
}

.register-success span {
  background: #6d806b;
}

@media (max-width: 900px) {
  .register-shell {
    grid-template-columns: 1fr;
  }

  .register-info {
    display: none;
  }

  .register-form-side {
    padding: 40px 30px;
  }
}

@media (max-width: 600px) {
  .register-page-new {
    padding: 15px;
  }

  .register-form-side {
    padding: 30px 20px;
  }

  .register-row,
  .role-grid {
    grid-template-columns: 1fr;
  }
}
`;

export default Register;