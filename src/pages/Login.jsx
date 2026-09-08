import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API_URL from "../config/api";

function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!form.email || !form.password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: form.email.trim(),
          password: form.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Invalid email or password."
        );
      }

      const token = data.token || data.accessToken;

      if (!token) {
        throw new Error("Login succeeded but no token was returned.");
      }

      localStorage.setItem("token", token);

      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      const role = data.user?.role;

      if (role === "worker") {
        navigate("/worker-dashboard");
      } else if (role === "admin") {
        navigate("/admin-dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "Unable to login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{styles}</style>

      <div className="auth-page">
        <div className="auth-container">

          <div className="auth-form-side">
            <div className="auth-card">

              <Link to="/" className="auth-logo">
                SAHAAYAK
              </Link>

              <span className="auth-eyebrow">
                WELCOME BACK
              </span>

              <h1>Sign in to Sahaayak</h1>

              <p className="auth-subtitle">
                Access your services, bookings and account.
              </p>

              {error && (
                <div className="auth-error">
                  <span>!</span>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>

                <label>
                  Email Address
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
                  Password
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                  />
                </label>

                <button
                  type="submit"
                  className="auth-submit"
                  disabled={loading}
                >
                  {loading ? "Signing in..." : "Sign In"}
                  {!loading && <span>→</span>}
                </button>

              </form>

              <p className="auth-switch">
                Don't have an account?{" "}
                <Link to="/register">
                  Create one
                </Link>
              </p>

            </div>
          </div>

          <div className="auth-visual">

            <div className="visual-orbit orbit-one"></div>
            <div className="visual-orbit orbit-two"></div>

            <div className="visual-content">

              <div className="visual-symbol">
                ⌖
              </div>

              <span>LOCAL • TRUSTED • CONNECTED</span>

              <h2>
                Reliable help.
                <br />
                Right when
                <br />
                you need it.
              </h2>

              <p>
                Connect with verified local professionals
                and get household services without the hassle.
              </p>

              <div className="visual-points">
                <div>
                  <strong>✓</strong>
                  Verified workers
                </div>

                <div>
                  <strong>⌖</strong>
                  Smart local matching
                </div>

                <div>
                  <strong>★</strong>
                  Trusted service
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </>
  );
}

const styles = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@500;600;700&display=swap');

.auth-page {
  min-height: calc(100vh - 72px);
  background: #ffffe3;
  padding: 45px 25px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Inter', sans-serif;
  color: #4a4a4a;
}

.auth-page * {
  box-sizing: border-box;
}

.auth-container {
  width: 1080px;
  max-width: 100%;
  min-height: 650px;
  background: white;
  border: 1px solid #e2e2d7;
  border-radius: 30px;
  overflow: hidden;
  display: grid;
  grid-template-columns: 1fr 1fr;
  box-shadow: 0 18px 55px rgba(74,74,74,.08);
}

.auth-form-side {
  padding: 55px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.auth-card {
  width: 100%;
  max-width: 430px;
}

.auth-logo {
  display: inline-block;
  color: #6d8196;
  text-decoration: none;
  font-family: 'Poppins', sans-serif;
  font-weight: 700;
  font-size: 19px;
  letter-spacing: 2px;
  margin-bottom: 55px;
}

.auth-eyebrow {
  display: block;
  color: #6d8196;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1.6px;
  margin-bottom: 8px;
}

.auth-card h1 {
  font-family: 'Poppins', sans-serif;
  color: #3f464c;
  font-size: 30px;
  margin: 0 0 8px;
}

.auth-subtitle {
  color: #8a8a83;
  font-size: 13px;
  line-height: 1.6;
  margin: 0 0 27px;
}

.auth-card form {
  display: flex;
  flex-direction: column;
  gap: 17px;
}

.auth-card label {
  color: #5e6260;
  font-size: 12px;
  font-weight: 700;
}

.auth-card input {
  display: block;
  width: 100%;
  margin-top: 7px;
  padding: 14px;
  border: 1px solid #dcdcd1;
  border-radius: 11px;
  background: #fcfcf6;
  color: #4a4a4a;
  font-family: inherit;
  font-size: 13px;
  outline: none;
}

.auth-card input:focus {
  border-color: #6d8196;
  background: white;
}

.auth-submit {
  margin-top: 5px;
  border: none;
  border-radius: 11px;
  padding: 15px;
  background: #6d8196;
  color: white;
  font-family: 'Poppins', sans-serif;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 13px;
  transition: .2s;
}

.auth-submit:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(74,74,74,.14);
}

.auth-submit:disabled {
  opacity: .65;
  cursor: wait;
  transform: none;
}

.auth-submit span {
  font-size: 18px;
}

.auth-switch {
  text-align: center;
  margin-top: 22px;
  color: #92928b;
  font-size: 12px;
}

.auth-switch a {
  color: #6d8196;
  font-weight: 700;
  text-decoration: none;
}

.auth-error {
  padding: 11px 13px;
  margin-bottom: 18px;
  border-radius: 10px;
  background: #f3ebe8;
  color: #806860;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 9px;
}

.auth-error span {
  width: 19px;
  height: 19px;
  border-radius: 50%;
  background: #806860;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
}

.auth-visual {
  position: relative;
  overflow: hidden;
  background: #6d8196;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 55px;
}

.visual-content {
  position: relative;
  z-index: 2;
  max-width: 390px;
}

.visual-symbol {
  width: 62px;
  height: 62px;
  border-radius: 19px;
  background: rgba(255,255,255,.14);
  border: 1px solid rgba(255,255,255,.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 29px;
  margin-bottom: 27px;
}

.visual-content > span {
  font-size: 9px;
  letter-spacing: 1.6px;
  font-weight: 700;
  color: #dce2df;
}

.visual-content h2 {
  font-family: 'Poppins', sans-serif;
  font-size: 38px;
  line-height: 1.18;
  margin: 12px 0 18px;
}

.visual-content > p {
  color: #e3e8e5;
  font-size: 13px;
  line-height: 1.7;
  max-width: 350px;
}

.visual-points {
  margin-top: 35px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.visual-points div {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12px;
  color: #edf0ee;
}

.visual-points strong {
  width: 27px;
  height: 27px;
  border-radius: 9px;
  background: rgba(255,255,255,.13);
  display: flex;
  align-items: center;
  justify-content: center;
}

.visual-orbit {
  position: absolute;
  border: 1px solid rgba(255,255,255,.13);
  border-radius: 50%;
}

.orbit-one {
  width: 430px;
  height: 430px;
  right: -220px;
  top: -100px;
}

.orbit-two {
  width: 300px;
  height: 300px;
  right: -140px;
  top: -35px;
}

@media (max-width: 800px) {
  .auth-container {
    grid-template-columns: 1fr;
  }

  .auth-visual {
    display: none;
  }

  .auth-form-side {
    padding: 40px 25px;
  }

  .auth-logo {
    margin-bottom: 40px;
  }
}

@media (max-width: 500px) {
  .auth-page {
    padding: 15px;
  }

  .auth-form-side {
    padding: 30px 20px;
  }

  .auth-card h1 {
    font-size: 26px;
  }
}
`;

export default Login;