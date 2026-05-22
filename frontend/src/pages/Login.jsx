import { useState } from "react";
import { ArrowRight, BarChart3, Boxes, ShieldCheck } from "lucide-react";
import "./Login.css";

export default function Login({ setIsLoggedIn }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Please enter email and password");
      return;
    }

    if (mode === "signup" && !confirmPassword) {
      alert("Please confirm your password");
      return;
    }

    if (mode === "signup" && password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    // simple auth flow (no backend yet)
    if (email && password) {
      setIsLoggedIn(true);
    }
  };

  return (
    <div className="login-shell">
      <div className="login-layout">
        <section className="intro-panel">
          <div className="intro-content">
            <div className="intro-copy">
              <h2>Welcome to Inventra</h2>
              <p>
                Manage stock, assignments, and asset visibility from one clean
                dashboard built for fast-moving operations teams.
              </p>

              <div className="intro-highlights">
                <div className="intro-card">
                  <div className="intro-icon">
                    <Boxes size={20} />
                  </div>
                  <div>
                    <h3>Inventory Control</h3>
                    <p>
                      Track availability, stock levels, and asset movement with
                      clarity.
                    </p>
                  </div>
                </div>

                <div className="intro-card">
                  <div className="intro-icon">
                    <BarChart3 size={20} />
                  </div>
                  <div>
                    <h3>Operational Insights</h3>
                    <p>
                      Monitor assignments and usage trends through a focused
                      dashboard.
                    </p>
                  </div>
                </div>

                <div className="intro-card">
                  <div className="intro-icon">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <h3>Reliable Workflows</h3>
                    <p>
                      Keep teams aligned with a consistent, professional asset
                      workflow.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="intro-glow intro-glow-one" />
            <div className="intro-glow intro-glow-two" />
          </div>
        </section>

        <section className="auth-panel">
          <div className="auth-card">
            <div className="auth-surface">
              <div className="auth-brand">
                <div className="auth-brand-icon">I</div>
                <div>
                  <div className="auth-brand-name">Inventra</div>
                  <p className="auth-brand-text">Inventory operations, simplified.</p>
                </div>
              </div>

              <div className="auth-kicker">Secure workspace access</div>

              <div className="auth-tabs" role="tablist" aria-label="Authentication tabs">
                <button
                  type="button"
                  className={`auth-tab ${mode === "login" ? "active" : ""}`}
                  onClick={() => setMode("login")}
                >
                  Login
                </button>
                <button
                  type="button"
                  className={`auth-tab ${mode === "signup" ? "active" : ""}`}
                  onClick={() => setMode("signup")}
                >
                  Sign Up
                </button>
              </div>

              <div className="auth-heading">
                <h1>{mode === "login" ? "Welcome back" : "Create your account"}</h1>
                <p>
                  {mode === "login"
                    ? "Sign in to access your inventory dashboard."
                    : "Set up your Inventra workspace in just a few steps."}
                </p>
              </div>

              <form className="auth-form" onSubmit={handleLogin}>
                <label className="auth-field">
                  <span>Email</span>
                  <input
                    type="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </label>

                <label className="auth-field">
                  <span>Password</span>
                  <input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </label>

                <div
                  className={`confirm-password-wrap ${
                    mode === "signup" ? "visible" : ""
                  }`}
                >
                  {mode === "signup" ? (
                    <label className="auth-field">
                      <span>Confirm Password</span>
                      <input
                        type="password"
                        placeholder="Confirm your password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </label>
                  ) : null}
                </div>

                <label className="remember-row">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span>Remember me</span>
                </label>

                <button type="submit" className="auth-submit">
                  <span>{mode === "login" ? "Login" : "Sign Up"}</span>
                  <ArrowRight size={18} />
                </button>
              </form>

              <p className="auth-footer">
                {mode === "login"
                  ? "Use your workspace credentials to continue."
                  : "Create an account to start managing assets with confidence."}
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}