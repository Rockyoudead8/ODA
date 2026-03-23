import React from "react";
import { Facebook, Twitter, Instagram, Linkedin, MapPin, Heart } from "lucide-react";

function Footer() {
  return (
    <footer
      style={{
        background: "rgba(8,8,14,0.97)",
        borderTop: "1px solid rgba(139,92,246,0.2)",
        padding: "48px 24px 32px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Subtle top accent line */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "2px",
          background: "linear-gradient(90deg, transparent 0%, #7c3aed 30%, #ec4899 70%, transparent 100%)",
        }}
      />

      {/* Background glow */}
      <div
        style={{
          position: "absolute",
          bottom: "-40px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "600px",
          height: "200px",
          background: "radial-gradient(ellipse, rgba(124,58,237,0.06) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div style={{ maxWidth: "1280px", margin: "0 auto", position: "relative", zIndex: 1 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "40px 32px",
            marginBottom: "48px",
          }}
        >
          {/* Brand column */}
          <div style={{ gridColumn: "span 2", minWidth: "240px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "10px",
                  background: "linear-gradient(135deg, #7c3aed, #ec4899)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 16px rgba(124,58,237,0.4)",
                  flexShrink: 0,
                }}
              >
                <MapPin style={{ width: "18px", height: "18px", color: "#fff" }} />
              </div>
              <div>
                <div
                  style={{
                    fontSize: "1.2rem",
                    fontWeight: 800,
                    background: "linear-gradient(135deg, #e2d9ff, #a78bfa)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    lineHeight: 1.2,
                  }}
                >
                  शहरनामा
                </div>
                <div style={{ fontSize: "0.72rem", color: "#6b7280", letterSpacing: "0.05em" }}>
                  "Shaharnaama"
                </div>
              </div>
            </div>
            <p style={{ fontSize: "0.85rem", color: "#4b5563", lineHeight: 1.8, maxWidth: "300px", fontStyle: "italic" }}>
              "हर शहर की अपनी कहानी है — शहरनामा उसे सुनाता है।"
            </p>
            <p style={{ fontSize: "0.8rem", color: "#374151", marginTop: "6px", maxWidth: "300px" }}>
              Every city has a story — Shaharnaama brings it to life.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3
              style={{
                fontSize: "0.7rem",
                fontWeight: 700,
                color: "#6d28d9",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                marginBottom: "20px",
                margin: "0 0 20px 0",
              }}
            >
              Quick Links
            </h3>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
              {[{ href: "/Hero", label: "Home" }, { href: "/listings/search", label: "Explore" }, { href: "#", label: "How It Works" }, { href: "#", label: "Support" }].map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    style={{ color: "#4b5563", fontSize: "0.875rem", textDecoration: "none", transition: "color 0.2s", display: "inline-flex", alignItems: "center", gap: "6px" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#a78bfa")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#4b5563")}
                  >
                    <span style={{ width: "4px", height: "4px", background: "#6d28d9", borderRadius: "50%", flexShrink: 0 }} />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3
              style={{
                fontSize: "0.7rem",
                fontWeight: 700,
                color: "#6d28d9",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                margin: "0 0 20px 0",
              }}
            >
              Account
            </h3>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
              {[{ href: "/", label: "Login" }, { href: "/signup", label: "Sign Up" }, { href: "/Admin", label: "Profile" }].map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    style={{ color: "#4b5563", fontSize: "0.875rem", textDecoration: "none", transition: "color 0.2s", display: "inline-flex", alignItems: "center", gap: "6px" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#a78bfa")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#4b5563")}
                  >
                    <span style={{ width: "4px", height: "4px", background: "#6d28d9", borderRadius: "50%", flexShrink: 0 }} />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h3
              style={{
                fontSize: "0.7rem",
                fontWeight: 700,
                color: "#6d28d9",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                margin: "0 0 20px 0",
              }}
            >
              Connect
            </h3>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              {[{ Icon: Facebook, label: "Facebook" }, { Icon: Twitter, label: "Twitter" }, { Icon: Instagram, label: "Instagram" }, { Icon: Linkedin, label: "LinkedIn" }].map(({ Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  style={{
                    width: "38px",
                    height: "38px",
                    borderRadius: "10px",
                    background: "rgba(139,92,246,0.1)",
                    border: "1px solid rgba(139,92,246,0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#6b7280",
                    transition: "all 0.2s",
                    textDecoration: "none",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(139,92,246,0.25)";
                    e.currentTarget.style.borderColor = "rgba(167,139,250,0.5)";
                    e.currentTarget.style.color = "#a78bfa";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(139,92,246,0.1)";
                    e.currentTarget.style.borderColor = "rgba(139,92,246,0.2)";
                    e.currentTarget.style.color = "#6b7280";
                    e.currentTarget.style.transform = "none";
                  }}
                >
                  <Icon size={17} />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            borderTop: "1px solid rgba(139,92,246,0.12)",
            paddingTop: "24px",
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <span style={{ fontSize: "0.8rem", color: "#374151" }}>
            © {new Date().getFullYear()} शहरनामा "Shaharnaama"
          </span>
          <span style={{ fontSize: "0.8rem", color: "#374151", display: "flex", alignItems: "center", gap: "4px" }}>
            · Made with <Heart style={{ width: "12px", height: "12px", color: "#ec4899", fill: "#ec4899", display: "inline" }} /> for explorers
          </span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
