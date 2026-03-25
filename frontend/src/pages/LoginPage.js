import React, { useState, useContext, useEffect } from "react";
import { MapPin, X, Eye, EyeOff, Compass } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { UserContext } from "../UserContext";
import { BACKEND_URL } from '../utils/config';

function LoginPage() {
  const { setUser } = useContext(UserContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [popupMessage, setPopupMessage] = useState("");

  useEffect(() => {
    if (location.state?.message) {
      setPopupMessage(location.state.message);
      navigate(location.pathname, { replace: true, state: {} });
      const timer = setTimeout(() => setPopupMessage(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [location.state, navigate, location.pathname]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        setUser(data.user);
        navigate("/Hero");
      } else {
        setError(data.error || "Login failed");
      }
    } catch (err) {
      setError("An error occurred during login.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${BACKEND_URL}/api/auth/google`;
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #0a0a0f 0%, #0f0a1a 50%, #0a0f1a 100%)", padding: "24px", position: "relative", overflow: "hidden" }}>
      {/* Ambient glows */}
      <div style={{ position: "absolute", top: "-20%", right: "-10%", width: "600px", height: "600px", background: "radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "-10%", left: "-10%", width: "500px", height: "500px", background: "radial-gradient(circle, rgba(236,72,153,0.08) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />

      {/* Popup */}
      {popupMessage && (
        <div style={{ position: "fixed", top: "20px", right: "20px", zIndex: 100, maxWidth: "360px", background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.4)", backdropFilter: "blur(12px)", borderRadius: "12px", padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}>
          <p style={{ color: "#fca5a5", fontSize: "0.875rem", fontWeight: 500, margin: 0 }}>{popupMessage}</p>
          <button onClick={() => setPopupMessage("")} style={{ background: "none", border: "none", color: "#f87171", cursor: "pointer", padding: "2px", flexShrink: 0 }}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* Card */}
      <div style={{ width: "100%", maxWidth: "420px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(139,92,246,0.25)", borderRadius: "24px", padding: "40px 36px", backdropFilter: "blur(20px)", boxShadow: "0 30px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)", position: "relative", zIndex: 1 }}>

        {/* Top accent */}
        <div style={{ position: "absolute", top: 0, left: "20%", right: "20%", height: "2px", background: "linear-gradient(90deg, transparent, #7c3aed, #ec4899, transparent)", borderRadius: "0 0 4px 4px" }} />

        {/* Logo */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "32px" }}>
          <div style={{ width: "56px", height: "56px", borderRadius: "16px", background: "linear-gradient(135deg, #7c3aed, #ec4899)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 24px rgba(124,58,237,0.5)", marginBottom: "16px" }}>
            <MapPin style={{ width: "26px", height: "26px", color: "#fff" }} />
          </div>
          <h2 style={{ fontSize: "1.75rem", fontWeight: 800, background: "linear-gradient(135deg, #e2d9ff, #a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", margin: "0 0 6px", textAlign: "center" }}>
            Welcome Back
          </h2>
          <p style={{ fontSize: "0.875rem", color: "#64748b", margin: 0, textAlign: "center" }}>
            Sign in to continue your journey
          </p>
        </div>

        {/* Error */}
        {error && (
          <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "10px", padding: "12px 14px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
            <X size={14} style={{ color: "#f87171", flexShrink: 0 }} />
            <p style={{ color: "#fca5a5", fontSize: "0.875rem", margin: 0 }}>{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#7c3aed", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "8px" }}>
              Email or Username
            </label>
            <input
              type="text"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: "100%", padding: "12px 16px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(139,92,246,0.25)", borderRadius: "12px", color: "#e2d9ff", fontSize: "0.95rem", outline: "none", boxSizing: "border-box", transition: "all 0.2s" }}
              onFocus={(e) => { e.target.style.border = "1px solid rgba(139,92,246,0.7)"; e.target.style.boxShadow = "0 0 0 3px rgba(139,92,246,0.12)"; }}
              onBlur={(e) => { e.target.style.border = "1px solid rgba(139,92,246,0.25)"; e.target.style.boxShadow = "none"; }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#7c3aed", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "8px" }}>
              Password
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ width: "100%", padding: "12px 44px 12px 16px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(139,92,246,0.25)", borderRadius: "12px", color: "#e2d9ff", fontSize: "0.95rem", outline: "none", boxSizing: "border-box", transition: "all 0.2s" }}
                onFocus={(e) => { e.target.style.border = "1px solid rgba(139,92,246,0.7)"; e.target.style.boxShadow = "0 0 0 3px rgba(139,92,246,0.12)"; }}
                onBlur={(e) => { e.target.style.border = "1px solid rgba(139,92,246,0.25)"; e.target.style.boxShadow = "none"; }}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#64748b", cursor: "pointer", padding: 0 }}>
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          <div style={{ textAlign: "right", marginTop: "-4px" }}>
            <a href="/forgot-password" style={{ fontSize: "0.8rem", color: "#7c3aed", textDecoration: "none" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#a78bfa")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#7c3aed")}
            >
              Forgot Password?
            </a>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ width: "100%", padding: "13px", background: loading ? "rgba(124,58,237,0.5)" : "linear-gradient(135deg, #7c3aed, #a78bfa)", border: "1px solid rgba(167,139,250,0.4)", borderRadius: "12px", color: "#fff", fontWeight: 700, fontSize: "0.95rem", cursor: loading ? "not-allowed" : "pointer", boxShadow: "0 4px 20px rgba(109,40,217,0.35)", transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
            onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.boxShadow = "0 6px 28px rgba(109,40,217,0.55)"; e.currentTarget.style.transform = "translateY(-1px)"; } }}
            onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 4px 20px rgba(109,40,217,0.35)"; e.currentTarget.style.transform = "none"; }}
          >
            {loading ? (
              <><div style={{ width: "16px", height: "16px", border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} /> Signing in...</>
            ) : (
              <><Compass size={17} /> Sign In</>
            )}
          </button>
        </form>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "20px 0" }}>
          <div style={{ flex: 1, height: "1px", background: "rgba(139,92,246,0.15)" }} />
          <span style={{ fontSize: "0.78rem", color: "#4b5563" }}>or continue with</span>
          <div style={{ flex: 1, height: "1px", background: "rgba(139,92,246,0.15)" }} />
        </div>

        {/* Google */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", padding: "12px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#cbd5e1", fontWeight: 600, fontSize: "0.9rem", cursor: "pointer", transition: "all 0.2s" }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.09)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}
        >
          <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google" style={{ width: "18px", height: "18px" }} />
          Continue with Google
        </button>

        <p style={{ textAlign: "center", fontSize: "0.875rem", color: "#475569", marginTop: "24px" }}>
          New to Shaharnaama?{" "}
          <Link to="/Signup" style={{ color: "#a78bfa", fontWeight: 700, textDecoration: "none" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#c4b5fd")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#a78bfa")}
          >
            Create an account
          </Link>
        </p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } } input::placeholder { color: #334155; }`}</style>
    </div>
  );
}

export default LoginPage;
