import { useState } from "react";
import { loginApi, signupApi } from "../api/api";
import "./Login.css";

export default function Login({ setIsLoggedIn, onLoginSuccess }) {
  const [mode, setMode] = useState("login");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const persistAuth = (token, user) => {
    const activeStorage = rememberMe ? localStorage : sessionStorage;
    const otherStorage = rememberMe ? sessionStorage : localStorage;

    activeStorage.setItem("token", token);
    activeStorage.setItem("user", JSON.stringify(user));

    otherStorage.removeItem("token");
    otherStorage.removeItem("user");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (mode === "signup") {
      if (
        !formData.name.trim() ||
        !formData.email.trim() ||
        !formData.password ||
        !formData.confirmPassword
      ) {
        setError("Please fill all fields");
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match");
        return;
      }
    } else {
      if (!formData.email.trim() || !formData.password) {
        setError("Email and password are required");
        return;
      }
    }

    try {
      setLoading(true);

      if (mode === "signup") {
        const result = await signupApi({
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password,
        });

        persistAuth(result.token, result.user);
      } else {
        const result = await loginApi({
          email: formData.email.trim(),
          password: formData.password,
        });

        persistAuth(result.token, result.user);
      }

      onLoginSuccess?.();
      setIsLoggedIn(true);
    } catch (err) {
      setError(err.message || "Authentication failed");
      alert(err.message || "Authentication failed");
    } finally {
      setLoading(false);
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
                  <div className="intro-icon">I</div>
                  <div>
                    <h3>Inventory Control</h3>
                    <p>
                      Track availability, stock levels, and asset movement with
                      clarity.
                    </p>
                  </div>
                </div>

                <div className="intro-card">
                  <div className="intro-icon">A</div>
                  <div>
                    <h3>Operational Insights</h3>
                    <p>
                      Monitor assignments and usage trends through a focused
                      dashboard.
                    </p>
                  </div>
                </div>

                <div className="intro-card">
                  <div className="intro-icon">W</div>
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
                  onClick={() => {
                    setMode("login");
                    setError("");
                  }}
                >
                  Login
                </button>
                <button
                  type="button"
                  className={`auth-tab ${mode === "signup" ? "active" : ""}`}
                  onClick={() => {
                    setMode("signup");
                    setError("");
                  }}
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

              <form className="auth-form" onSubmit={handleSubmit}>
                {mode === "signup" ? (
                  <label className="auth-field">
                    <span>Name</span>
                    <input
                      type="text"
                      name="name"
                      placeholder="Enter your name"
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </label>
                ) : null}

                <label className="auth-field">
                  <span>Email</span>
                  <input
                    type="email"
                    name="email"
                    placeholder="name@company.com"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </label>

                <label className="auth-field">
                  <span>Password</span>
                  <input
                    type="password"
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
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
                        name="confirmPassword"
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
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

                {error ? <p className="error-text">{error}</p> : null}

                <button type="submit" className="auth-submit" disabled={loading}>
                  <span>{loading ? "Please wait..." : mode === "login" ? "Login" : "Sign Up"}</span>
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



// import { loginApi, signupApi } from "../api/api";
// import { useState } from "react"
// import "./Login.css";

// export default function Login({ setIsLoggedIn }) {
//   const [isSignup, setIsSignup] = useState(false);

//   const [formData, setFormData] = useState({
//     name: "",
//     email: "",
//     password: "",
//     confirmPassword: "",
//   });

//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);

//   const handleChange = (e) => {
//     setFormData((prev) => ({
//       ...prev,
//       [e.target.name]: e.target.value,
//     }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");

//     if (!formData.email || !formData.password) {
//       setError("Email and password are required");
//       return;
//     }

//     if (isSignup) {
//       if (!formData.name) {
//         setError("Name is required");
//         return;
//       }
//       if (formData.password !== formData.confirmPassword) {
//         setError("Passwords do not match");
//         return;
//       }
//     }

//     try {
//       setLoading(true);

//       if (isSignup) {
//         const result = await signupApi({
//           name: formData.name,
//           email: formData.email,
//           password: formData.password,
//         });
//         localStorage.setItem("token", result.token);
//         localStorage.setItem("user", JSON.stringify(result.user));
//       } else {
//         const result = await loginApi({
//           email: formData.email,
//           password: formData.password,
//         });
//         localStorage.setItem("token", result.token);
//         localStorage.setItem("user", JSON.stringify(result.user));
//       }

//       setIsLoggedIn(true);
//     } catch (err) {
//       setError(err.message || "Authentication failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="login-page">
//       <div className="login-left">
//         <div className="login-intro">
//           <h1>Welcome to Inventra</h1>
//           <p>Smart inventory management for stock, assets, and assignments.</p>
//         </div>
//       </div>

//       <div className="login-right">
//         <div className="auth-card">
//           <div className="tab-switch">
//             <button
//               className={!isSignup ? "active" : ""}
//               onClick={() => setIsSignup(false)}
//               type="button"
//             >
//               Login
//             </button>
//             <button
//               className={isSignup ? "active" : ""}
//               onClick={() => setIsSignup(true)}
//               type="button"
//             >
//               Sign Up
//             </button>
//           </div>

//           <form onSubmit={handleSubmit}>
//             {isSignup && (
//               <input
//                 type="text"
//                 name="name"
//                 placeholder="Full Name"
//                 value={formData.name}
//                 onChange={handleChange}
//               />
//             )}

//             <input
//               type="email"
//               name="email"
//               placeholder="Email"
//               value={formData.email}
//               onChange={handleChange}
//             />

//             <input
//               type="password"
//               name="password"
//               placeholder="Password"
//               value={formData.password}
//               onChange={handleChange}
//             />

//             {isSignup && (
//               <input
//                 type="password"
//                 name="confirmPassword"
//                 placeholder="Confirm Password"
//                 value={formData.confirmPassword}
//                 onChange={handleChange}
//               />
//             )}

//             {error && <p className="error-text">{error}</p>}

//             <button type="submit" disabled={loading}>
//               {loading ? "Please wait..." : isSignup ? "Create Account" : "Login"}
//             </button>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// }

// // import { useState } from "react";
// // import { ArrowRight, BarChart3, Boxes, ShieldCheck } from "lucide-react";
// // import "./Login.css";

// // export default function Login({ setIsLoggedIn }) {
// //   const [mode, setMode] = useState("login");
// //   const [email, setEmail] = useState("");
// //   const [password, setPassword] = useState("");
// //   const [confirmPassword, setConfirmPassword] = useState("");
// //   const [rememberMe, setRememberMe] = useState(false);

// //   const handleLogin = (e) => {
// //     e.preventDefault();

// //     if (!email || !password) {
// //       alert("Please enter email and password");
// //       return;
// //     }

// //     if (mode === "signup" && !confirmPassword) {
// //       alert("Please confirm your password");
// //       return;
// //     }

// //     if (mode === "signup" && password !== confirmPassword) {
// //       alert("Passwords do not match");
// //       return;
// //     }

// //     // simple auth flow (no backend yet)
// //     if (email && password) {
// //       setIsLoggedIn(true);
// //     }
// //   };

// //   return (
// //     <div className="login-shell">
// //       <div className="login-layout">
// //         <section className="intro-panel">
// //           <div className="intro-content">
// //             <div className="intro-copy">
// //               <h2>Welcome to Inventra</h2>
// //               <p>
// //                 Manage stock, assignments, and asset visibility from one clean
// //                 dashboard built for fast-moving operations teams.
// //               </p>

// //               <div className="intro-highlights">
// //                 <div className="intro-card">
// //                   <div className="intro-icon">
// //                     <Boxes size={20} />
// //                   </div>
// //                   <div>
// //                     <h3>Inventory Control</h3>
// //                     <p>
// //                       Track availability, stock levels, and asset movement with
// //                       clarity.
// //                     </p>
// //                   </div>
// //                 </div>

// //                 <div className="intro-card">
// //                   <div className="intro-icon">
// //                     <BarChart3 size={20} />
// //                   </div>
// //                   <div>
// //                     <h3>Operational Insights</h3>
// //                     <p>
// //                       Monitor assignments and usage trends through a focused
// //                       dashboard.
// //                     </p>
// //                   </div>
// //                 </div>

// //                 <div className="intro-card">
// //                   <div className="intro-icon">
// //                     <ShieldCheck size={20} />
// //                   </div>
// //                   <div>
// //                     <h3>Reliable Workflows</h3>
// //                     <p>
// //                       Keep teams aligned with a consistent, professional asset
// //                       workflow.
// //                     </p>
// //                   </div>
// //                 </div>
// //               </div>
// //             </div>

// //             <div className="intro-glow intro-glow-one" />
// //             <div className="intro-glow intro-glow-two" />
// //           </div>
// //         </section>

// //         <section className="auth-panel">
// //           <div className="auth-card">
// //             <div className="auth-surface">
// //               <div className="auth-brand">
// //                 <div className="auth-brand-icon">I</div>
// //                 <div>
// //                   <div className="auth-brand-name">Inventra</div>
// //                   <p className="auth-brand-text">Inventory operations, simplified.</p>
// //                 </div>
// //               </div>

// //               <div className="auth-kicker">Secure workspace access</div>

// //               <div className="auth-tabs" role="tablist" aria-label="Authentication tabs">
// //                 <button
// //                   type="button"
// //                   className={`auth-tab ${mode === "login" ? "active" : ""}`}
// //                   onClick={() => setMode("login")}
// //                 >
// //                   Login
// //                 </button>
// //                 <button
// //                   type="button"
// //                   className={`auth-tab ${mode === "signup" ? "active" : ""}`}
// //                   onClick={() => setMode("signup")}
// //                 >
// //                   Sign Up
// //                 </button>
// //               </div>

// //               <div className="auth-heading">
// //                 <h1>{mode === "login" ? "Welcome back" : "Create your account"}</h1>
// //                 <p>
// //                   {mode === "login"
// //                     ? "Sign in to access your inventory dashboard."
// //                     : "Set up your Inventra workspace in just a few steps."}
// //                 </p>
// //               </div>

// //               <form className="auth-form" onSubmit={handleLogin}>
// //                 <label className="auth-field">
// //                   <span>Email</span>
// //                   <input
// //                     type="email"
// //                     placeholder="name@company.com"
// //                     value={email}
// //                     onChange={(e) => setEmail(e.target.value)}
// //                   />
// //                 </label>

// //                 <label className="auth-field">
// //                   <span>Password</span>
// //                   <input
// //                     type="password"
// //                     placeholder="Enter your password"
// //                     value={password}
// //                     onChange={(e) => setPassword(e.target.value)}
// //                   />
// //                 </label>

// //                 <div
// //                   className={`confirm-password-wrap ${
// //                     mode === "signup" ? "visible" : ""
// //                   }`}
// //                 >
// //                   {mode === "signup" ? (
// //                     <label className="auth-field">
// //                       <span>Confirm Password</span>
// //                       <input
// //                         type="password"
// //                         placeholder="Confirm your password"
// //                         value={confirmPassword}
// //                         onChange={(e) => setConfirmPassword(e.target.value)}
// //                       />
// //                     </label>
// //                   ) : null}
// //                 </div>

// //                 <label className="remember-row">
// //                   <input
// //                     type="checkbox"
// //                     checked={rememberMe}
// //                     onChange={(e) => setRememberMe(e.target.checked)}
// //                   />
// //                   <span>Remember me</span>
// //                 </label>

// //                 <button type="submit" className="auth-submit">
// //                   <span>{mode === "login" ? "Login" : "Sign Up"}</span>
// //                   <ArrowRight size={18} />
// //                 </button>
// //               </form>

// //               <p className="auth-footer">
// //                 {mode === "login"
// //                   ? "Use your workspace credentials to continue."
// //                   : "Create an account to start managing assets with confidence."}
// //               </p>
// //             </div>
// //           </div>
// //         </section>
// //       </div>
// //     </div>
// //   );
// // }