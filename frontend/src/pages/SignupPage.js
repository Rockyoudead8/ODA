import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MapPin, CheckCircle, Eye, EyeOff, Mail, User, Lock, KeyRound } from "lucide-react";
import { UserContext } from "../UserContext";
import { BACKEND_URL } from '../utils/config';

function SignupPage() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);

  const handleGoogleLogin = () => {
    window.location.href = `${BACKEND_URL}/api/auth/google`;
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    if (password !== confirmPassword) { setError("Passwords do not match!"); return; }
    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await response.json();
      if (response.ok) { setSuccess("OTP sent to your email."); setStep(2); }
      else setError(data.message || "Failed to send OTP.");
    } catch { setError("Something went wrong."); }
    finally { setLoading(false); }
  };

  const verifyOtp = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, email, password, otp }),
      });
      const data = await response.json();
      if (response.ok) {
        setUser(data.user);
        setSuccess("Account created successfully!");
        setTimeout(() => navigate("/Check"), 1000);
      } else setError(data.message || "Invalid OTP");
    } catch { setError("Verification failed."); }
    finally { setLoading(false); }
  };

  const inputStyle = {
    width: "100%", padding: "12px 16px 12px 42px", background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(139,92,246,0.25)", borderRadius: "12px", color: "#e2d9ff",
    fontSize: "0.95rem", outline: "none", boxSizing: "border-box", transition: "all 0.2s",
  };
  const iconStyle = { position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#7c3aed", width: "17px", height: "17px" };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #0a0a0f 0%, #0f0a1a 50%, #0a0f1a 100%)", padding: "24px", position: "relative", overflow: "hidden" }}>
      {/* Glows */}
      <div style={{ position: "absolute", top: "-10%", left: "-10%", width: "500px", height: "500px", background: "radial-gradient(circle, rgba(124,58,237,0.1) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "-10%", right: "-5%", width: "450px", height: "450px", background: "radial-gradient(circle, rgba(236,72,153,0.07) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />

      <div style={{ width: "100%", maxWidth: "440px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(139,92,246,0.25)", borderRadius: "24px", padding: "40px 36px", backdropFilter: "blur(20px)", boxShadow: "0 30px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)", position: "relative", zIndex: 1 }}>

        {/* Top accent */}
        <div style={{ position: "absolute", top: 0, left: "20%", right: "20%", height: "2px", background: "linear-gradient(90deg, transparent, #ec4899, #7c3aed, transparent)", borderRadius: "0 0 4px 4px" }} />

        {/* Header */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "28px" }}>
          <div style={{ width: "56px", height: "56px", borderRadius: "16px", background: "linear-gradient(135deg, #ec4899, #7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 24px rgba(236,72,153,0.4)", marginBottom: "16px" }}>
            <MapPin style={{ width: "26px", height: "26px", color: "#fff" }} />
          </div>
          <h2 style={{ fontSize: "1.75rem", fontWeight: 800, background: "linear-gradient(135deg, #e2d9ff, #ec4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", margin: "0 0 6px", textAlign: "center" }}>
            {step === 1 ? "Create Account" : "Verify Email"}
          </h2>
          <p style={{ fontSize: "0.875rem", color: "#64748b", margin: 0, textAlign: "center" }}>
            {step === 1 ? "Join the Shaharnaama community" : `We sent a code to ${email}`}
          </p>
        </div>

        {/* Step indicator */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "24px" }}>
          {[1, 2].map((s) => (
            <div key={s} style={{ height: "4px", width: s === step ? "32px" : "16px", borderRadius: "2px", background: s <= step ? "linear-gradient(90deg, #7c3aed, #ec4899)" : "rgba(139,92,246,0.2)", transition: "all 0.3s" }} />
          ))}
        </div>

        {/* Messages */}
        {error && (
          <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "10px", padding: "11px 14px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
            <p style={{ color: "#fca5a5", fontSize: "0.875rem", margin: 0 }}>{error}</p>
          </div>
        )}
        {success && (
          <div style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: "10px", padding: "11px 14px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
            <CheckCircle style={{ width: "16px", height: "16px", color: "#6ee7b7", flexShrink: 0 }} />
            <p style={{ color: "#6ee7b7", fontSize: "0.875rem", margin: 0 }}>{success}</p>
          </div>
        )}

        {/* Step 1 Form */}
        {step === 1 && (
          <form onSubmit={handleSignup} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {[
              { label: "Full Name", value: name, setter: setName, type: "text", placeholder: "Your name", Icon: User },
              { label: "Email", value: email, setter: setEmail, type: "email", placeholder: "you@example.com", Icon: Mail },
            ].map(({ label, value, setter, type, placeholder, Icon }) => (
              <div key={label}>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#7c3aed", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "6px" }}>{label}</label>
                <div style={{ position: "relative" }}>
                  <Icon style={iconStyle} />
                  <input type={type} placeholder={placeholder} value={value} onChange={(e) => setter(e.target.value)} required style={inputStyle}
                    onFocus={(e) => { e.target.style.border = "1px solid rgba(139,92,246,0.7)"; e.target.style.boxShadow = "0 0 0 3px rgba(139,92,246,0.12)"; }}
                    onBlur={(e) => { e.target.style.border = "1px solid rgba(139,92,246,0.25)"; e.target.style.boxShadow = "none"; }}
                  />
                </div>
              </div>
            ))}

            <div>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#7c3aed", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "6px" }}>Password</label>
              <div style={{ position: "relative" }}>
                <Lock style={iconStyle} />
                <input type={showPassword ? "text" : "password"} placeholder="Min 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ ...inputStyle, paddingRight: "44px" }}
                  onFocus={(e) => { e.target.style.border = "1px solid rgba(139,92,246,0.7)"; e.target.style.boxShadow = "0 0 0 3px rgba(139,92,246,0.12)"; }}
                  onBlur={(e) => { e.target.style.border = "1px solid rgba(139,92,246,0.25)"; e.target.style.boxShadow = "none"; }}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#64748b", cursor: "pointer", padding: 0 }}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#7c3aed", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "6px" }}>Confirm Password</label>
              <div style={{ position: "relative" }}>
                <Lock style={iconStyle} />
                <input type="password" placeholder="Repeat password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required style={inputStyle}
                  onFocus={(e) => { e.target.style.border = "1px solid rgba(139,92,246,0.7)"; e.target.style.boxShadow = "0 0 0 3px rgba(139,92,246,0.12)"; }}
                  onBlur={(e) => { e.target.style.border = "1px solid rgba(139,92,246,0.25)"; e.target.style.boxShadow = "none"; }}
                />
              </div>
            </div>

            <button type="submit" disabled={loading} style={{ width: "100%", marginTop: "6px", padding: "13px", background: loading ? "rgba(236,72,153,0.4)" : "linear-gradient(135deg, #ec4899, #a78bfa)", border: "1px solid rgba(236,72,153,0.4)", borderRadius: "12px", color: "#fff", fontWeight: 700, fontSize: "0.95rem", cursor: loading ? "not-allowed" : "pointer", boxShadow: "0 4px 20px rgba(236,72,153,0.3)", transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
              onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.boxShadow = "0 6px 28px rgba(236,72,153,0.5)"; e.currentTarget.style.transform = "translateY(-1px)"; } }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 4px 20px rgba(236,72,153,0.3)"; e.currentTarget.style.transform = "none"; }}
            >
              {loading ? <><div style={{ width: "16px", height: "16px", border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} /> Sending OTP...</> : "Send OTP →"}
            </button>
          </form>
        )}

        {/* Step 2 OTP */}
        {step === 2 && (
          <form onSubmit={verifyOtp} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.2)", borderRadius: "12px", padding: "14px 16px", textAlign: "center" }}>
              <p style={{ color: "#94a3b8", fontSize: "0.85rem", margin: 0 }}>Check your inbox at <strong style={{ color: "#c4b5fd" }}>{email}</strong></p>
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#7c3aed", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "6px" }}>Enter OTP</label>
              <div style={{ position: "relative" }}>
                <KeyRound style={iconStyle} />
                <input type="text" placeholder="6-digit code" value={otp} onChange={(e) => setOtp(e.target.value)} required maxLength={6} style={{ ...inputStyle, letterSpacing: "0.3em", textAlign: "center", fontSize: "1.2rem", fontWeight: 700, padding: "14px 16px" }}
                  onFocus={(e) => { e.target.style.border = "1px solid rgba(139,92,246,0.7)"; e.target.style.boxShadow = "0 0 0 3px rgba(139,92,246,0.12)"; }}
                  onBlur={(e) => { e.target.style.border = "1px solid rgba(139,92,246,0.25)"; e.target.style.boxShadow = "none"; }}
                />
              </div>
            </div>
            <button type="submit" disabled={loading} style={{ width: "100%", padding: "13px", background: loading ? "rgba(16,185,129,0.4)" : "linear-gradient(135deg, #10b981, #6ee7b7)", border: "1px solid rgba(16,185,129,0.4)", borderRadius: "12px", color: "#fff", fontWeight: 700, fontSize: "0.95rem", cursor: loading ? "not-allowed" : "pointer", boxShadow: "0 4px 20px rgba(16,185,129,0.25)", transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
              onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 28px rgba(16,185,129,0.4)"; } }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(16,185,129,0.25)"; }}
            >
              {loading ? <><div style={{ width: "16px", height: "16px", border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} /> Verifying...</> : <><CheckCircle size={16} /> Verify & Create Account</>}
            </button>
            <button type="button" onClick={() => { setStep(1); setError(""); setSuccess(""); setOtp(""); }} style={{ background: "none", border: "none", color: "#64748b", fontSize: "0.85rem", cursor: "pointer", textAlign: "center", padding: "4px" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#a78bfa")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#64748b")}
            >
              ← Back to signup
            </button>
          </form>
        )}

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "20px 0" }}>
          <div style={{ flex: 1, height: "1px", background: "rgba(139,92,246,0.15)" }} />
          <span style={{ fontSize: "0.78rem", color: "#4b5563" }}>or</span>
          <div style={{ flex: 1, height: "1px", background: "rgba(139,92,246,0.15)" }} />
        </div>

        <button type="button" onClick={handleGoogleLogin}
          style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", padding: "12px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#cbd5e1", fontWeight: 600, fontSize: "0.9rem", cursor: "pointer", transition: "all 0.2s" }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.09)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}
        >
          <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google" style={{ width: "18px", height: "18px" }} />
          Continue with Google
        </button>

        <p style={{ textAlign: "center", fontSize: "0.875rem", color: "#475569", marginTop: "20px" }}>
          Already have an account?{" "}
          <Link to="/" style={{ color: "#a78bfa", fontWeight: 700, textDecoration: "none" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#c4b5fd")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#a78bfa")}
          >
            Sign in
          </Link>
        </p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } } input::placeholder { color: #334155; }`}</style>
    </div>
  );
}

export default SignupPage;
