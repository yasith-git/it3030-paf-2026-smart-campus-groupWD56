import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const LoginPage = () => {
  const { fetchCurrentUser } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await axios.post(
        "http://localhost:8080/api/auth/login",
        formData,
        { withCredentials: true }
      );

      await fetchCurrentUser();
      window.location.href = "/";
    } catch (err) {
      console.log("LOGIN ERROR:", err);

      if (err.response && err.response.data) {
        if (typeof err.response.data === "string") {
          setError(err.response.data);
        } else if (err.response.data.message) {
          setError(err.response.data.message);
        } else {
          setError("Login failed");
        }
      } else {
        setError("Invalid email or password");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:8080/oauth2/authorization/google";
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Left Side - Login Form */}
        <div style={styles.formSection}>
          {/* Back arrow — top-left of panel */}
          <button
            onClick={() => navigate('/')}
            title="Back to Home"
            style={{
              position: 'absolute',
              top: '24px',
              left: '24px',
              background: 'none',
              border: 'none',
              padding: '4px',
              cursor: 'pointer',
              color: 'rgba(240,249,255,0.6)',
              fontSize: '1.5rem',
              lineHeight: 1,
              transition: 'color 0.2s',
              zIndex: 10,
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#38bdf8'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(240,249,255,0.6)'; }}
          >
            ←
          </button>
          <div style={styles.formContainer}>
            <div style={styles.formHeader}>
              <h2 style={styles.formTitle}>Welcome Back</h2>
              <p style={styles.formSubtitle}>
                Sign in to your NovaCampus account
              </p>
            </div>

            <form onSubmit={handleLogin} style={styles.form}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Email Address</label>
                <input
                  type="email"
                  name="email"
                  placeholder="you@campus.edu"
                  value={formData.email}
                  onChange={handleChange}
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Password</label>
                <input
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  style={styles.input}
                  required
                />
              </div>

              {error && <div style={styles.errorMessage}>{error}</div>}

              <button
                type="submit"
                style={styles.loginButton}
                disabled={loading}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 10px 30px rgba(56,189,248,0.5)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(56,189,248,0.4)';
                }}
              >
                {loading ? <span style={styles.loadingSpinner}></span> : 'Sign In →'}
              </button>
            </form>

            {/* Divider */}
            <div style={styles.divider}>
              <span style={styles.dividerLine}></span>
              <span style={styles.dividerText}>OR</span>
              <span style={styles.dividerLine}></span>
            </div>

            {/* Google Login Button */}
            <button
              type="button"
              style={styles.googleButton}
              onClick={handleGoogleLogin}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <svg style={styles.googleIcon} viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>
          </div>
        </div>

        {/* Right Side - Brand Panel */}
        <div style={styles.brandSection}>
          <div style={styles.brandContent}>
            <div style={{
              position: 'absolute', top: '-60px', right: '-60px',
              width: '220px', height: '220px', borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(56,189,248,0.18) 0%, rgba(14,165,233,0.06) 60%, transparent 80%)',
              pointerEvents: 'none',
            }} />
            <div style={{
              position: 'absolute', bottom: '-40px', left: '-40px',
              width: '160px', height: '160px', borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(99,102,241,0.14) 0%, transparent 70%)',
              pointerEvents: 'none',
            }} />
            <div style={styles.logo}>
              <svg width="52" height="52" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="lp-logoGrad" x1="4" y1="2" x2="34" y2="36" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#7dd3fc"/>
                    <stop offset="50%" stopColor="#0ea5e9"/>
                    <stop offset="100%" stopColor="#38bdf8"/>
                  </linearGradient>
                  <linearGradient id="lp-logoShine" x1="0" y1="0" x2="38" y2="38" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="rgba(255,255,255,0.35)"/>
                    <stop offset="100%" stopColor="rgba(255,255,255,0.05)"/>
                  </linearGradient>
                </defs>
                <path d="M19 2 L34 10.5 L34 27.5 L19 36 L4 27.5 L4 10.5 Z" fill="url(#lp-logoGrad)"/>
                <path d="M19 5 L31 12 L31 26 L19 33 L7 26 L7 12 Z" fill="none" stroke="url(#lp-logoShine)" strokeWidth="1"/>
                <path d="M12 26 L12 12 L26 26 L26 12" stroke="white" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                <circle cx="26" cy="10" r="2.5" fill="#7dd3fc" opacity="0.9"/>
              </svg>
              <span style={styles.logoText}>NovaCampus</span>
            </div>
            <h1 style={styles.brandTitle}>
              Smart Campus
              <span style={styles.brandAccent}> Operations Hub</span>
            </h1>
            <p style={styles.brandDescription}>
              Streamline your campus experience — book resources, track incidents, and manage everything in one powerful platform.
            </p>
            <div style={styles.brandFeatures}>
              {[
                ['🏛️', 'Resource Booking'],
                ['🔔', 'Real-time Alerts'],
                ['🛠️', 'Incident Tracking'],
                ['📊', 'Admin Analytics'],
              ].map(([icon, label], i) => (
                <div key={i} style={styles.brandFeature}>
                  <span style={{ fontSize: '1rem' }}>{icon}</span> {label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "transparent",
    fontFamily: "'Plus Jakarta Sans','Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    padding: "20px",
  },

  container: {
    display: "flex",
    maxWidth: "1200px",
    width: "100%",
    background: "transparent",
    backdropFilter: "blur(24px)",
    WebkitBackdropFilter: "blur(24px)",
    borderRadius: "32px",
    overflow: "hidden",
    boxShadow: "0 25px 50px rgba(0,0,0,0.4), 0 0 0 1px rgba(56,189,248,0.12)",
    border: "1px solid rgba(56,189,248,0.15)",
  },

  // Left Side Styles - Matching AdminUserPage color scheme
  brandSection: {
    flex: 1,
    background: "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.07) 100%)",
    padding: "48px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
  },

  brandContent: {
    position: "relative",
    zIndex: 2,
  },

  logo: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "48px",
  },

  logoText: {
    fontSize: "4rem",
    fontWeight: "700",
    background: "linear-gradient(135deg, #ffffff, rgba(240,249,255,0.55))",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },

  brandTitle: {
    fontSize: "2.2rem",
    fontWeight: "700",
    color: '#f0f9ff',
    marginBottom: "20px",
    lineHeight: "1.3",
    letterSpacing: "-0.02em",
  },

  brandAccent: {
    display: "block",
    color: '#f0f9ff',
  },

  brandDescription: {
    fontSize: "1rem",
    color: "rgba(240,249,255,0.55)",
    lineHeight: "1.6",
    marginBottom: "32px",
  },

  brandFeatures: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },

  brandFeature: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    color: "rgba(240,249,255,0.75)",
    fontSize: "0.9rem",
    "& span": {
      color: "#38bdf8",
      fontWeight: "bold",
      fontSize: "1.1rem",
    },
  },

  // Right Side Styles
  formSection: {
    flex: 1,
    padding: "48px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "transparent",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    position: "relative",
  },

  formContainer: {
    width: "100%",
    maxWidth: "400px",
  },

  formHeader: {
    marginBottom: "32px",
    textAlign: "center",
  },

  formTitle: {
    fontSize: "2.5rem",
    fontWeight: "700",
    color: "#f0f9ff",
    marginBottom: "8px",
    letterSpacing: "-0.02em",
  },

  formSubtitle: {
    fontSize: "0.875rem",
    color: "rgba(240,249,255,0.5)",
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },

  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },

  label: {
    fontSize: "0.875rem",
    fontWeight: "600",
    color: "rgba(240,249,255,0.8)",
    letterSpacing: "0.3px",
  },

  input: {
    padding: "12px 16px",
    borderRadius: "12px",
    border: "1px solid rgba(56,189,248,0.25)",
    fontSize: "0.875rem",
    transition: "all 0.2s ease",
    outline: "none",
    fontFamily: "inherit",
    background: "transparent",
    color: "#f0f9ff",
  },

  loginButton: {
    padding: "14px",
    borderRadius: "12px",
    border: "none",
    background: "linear-gradient(135deg, #0ea5e9, #38bdf8)",
    boxShadow: "0 4px 20px rgba(56,189,248,0.4)",
    color: '#ffffff',
    fontWeight: "600",
    fontSize: "0.875rem",
    cursor: "pointer",
    transition: "all 0.2s ease",
    fontFamily: "inherit",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    width: "100%",
  },

  divider: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    margin: "24px 0",
  },

  dividerLine: {
    flex: 1,
    height: "1px",
    backgroundColor: "rgba(255,255,255,0.12)",
  },

  dividerText: {
    color: "rgba(240,249,255,0.55)",
    fontSize: "12px",
    fontWeight: "500",
  },

  googleButton: {
    width: "100%",
    padding: "12px 16px",
    borderRadius: "12px",
    border: "1px solid rgba(255,255,255,0.15)",
    background: "rgba(255,255,255,0.04)",
    cursor: "pointer",
    fontWeight: "500",
    fontSize: "0.875rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
    transition: "all 0.2s ease",
    fontFamily: "inherit",
    color: "rgba(240,249,255,0.85)",
  },

  googleIcon: {
    width: "20px",
    height: "20px",
  },

  errorMessage: {
    padding: "12px",
    background: "rgba(248,113,113,0.1)",
    border: "1px solid rgba(248,113,113,0.28)",
    borderRadius: "12px",
    color: "#fca5a5",
    fontSize: "0.875rem",
    textAlign: "center",
  },

  loadingSpinner: {
    width: "20px",
    height: "20px",
    border: "2px solid rgba(255, 255, 255, 0.3)",
    borderTopColor: "#ffffff",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
};

// Add global animations
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  input:focus {
    outline: none;
    border-color: rgba(56,189,248,0.5);
    box-shadow: 0 0 0 3px rgba(56,189,248,0.12);
    background: rgba(56,189,248,0.05);
  }
  
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;
document.head.appendChild(styleSheet);

export default LoginPage;