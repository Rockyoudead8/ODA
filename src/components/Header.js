import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "../UserContext";
import { User, LogIn, UserPlus, MapPin, Menu, X, LogOut, MessageCircle, Users } from "lucide-react";

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/auth/logout", {
        method: "GET",
        credentials: "include",
      });
      if (response.ok) {
        setUser(null);
        navigate("/Hero");
      }
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const navItems = [
    { to: "/Community", label: "Community", Icon: Users },
    user && { to: "/Chat", label: "Chat", Icon: MessageCircle },
    user && { to: "/Admin", label: "Profile", Icon: User },
    !user && { to: "/", label: "Login", Icon: LogIn },
    !user && { to: "/signup", label: "Sign Up", Icon: UserPlus, isButton: true },
    user && { label: "Logout", Icon: LogOut, onClick: handleLogout },
  ].filter(Boolean);

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        width: "100%",
        background: "rgba(10,10,15,0.88)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(139,92,246,0.2)",
        boxShadow: "0 4px 30px rgba(0,0,0,0.5)",
      }}
    >
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 24px",
        }}
      >
        {/* Logo */}
        <Link
          to="/Hero"
          onClick={() => setIsMenuOpen(false)}
          style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none", flexShrink: 0 }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          <div
            style={{
              width: "34px", height: "34px", borderRadius: "10px",
              background: "linear-gradient(135deg, #7c3aed, #ec4899)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 16px rgba(124,58,237,0.4)",
            }}
          >
            <MapPin style={{ width: "17px", height: "17px", color: "#fff" }} />
          </div>
          <span
            style={{
              fontSize: "1.25rem", fontWeight: 800,
              background: "linear-gradient(135deg, #e2d9ff, #a78bfa)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            }}
          >
            शहरनामा
          </span>
          <span style={{ fontSize: "0.72rem", color: "#4b5563", fontWeight: 500, letterSpacing: "0.05em" }}>
            "Shaharnaama"
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav style={{ display: "flex", alignItems: "center", gap: "4px" }} className="hidden md:flex">
          {navItems.map((item, index) =>
            item.onClick ? (
              <button
                key={index}
                onClick={item.onClick}
                style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", borderRadius: "10px", background: "transparent", border: "none", color: "#94a3b8", fontSize: "0.88rem", fontWeight: 500, cursor: "pointer", transition: "all 0.2s" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(139,92,246,0.12)"; e.currentTarget.style.color = "#c4b5fd"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#94a3b8"; }}
              >
                <item.Icon size={16} /> {item.label}
              </button>
            ) : item.isButton ? (
              <Link
                key={index}
                to={item.to}
                style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 18px", borderRadius: "10px", background: "linear-gradient(135deg, rgba(124,58,237,0.9), rgba(167,139,250,0.9))", border: "1px solid rgba(167,139,250,0.4)", color: "#ede9fe", fontSize: "0.88rem", fontWeight: 600, textDecoration: "none", boxShadow: "0 4px 14px rgba(109,40,217,0.3)", transition: "all 0.2s", marginLeft: "6px" }}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 6px 20px rgba(109,40,217,0.5)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 4px 14px rgba(109,40,217,0.3)"; e.currentTarget.style.transform = "none"; }}
              >
                <item.Icon size={16} /> {item.label}
              </Link>
            ) : (
              <Link
                key={index}
                to={item.to}
                style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", borderRadius: "10px", color: "#94a3b8", fontSize: "0.88rem", fontWeight: 500, textDecoration: "none", transition: "all 0.2s" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(139,92,246,0.12)"; e.currentTarget.style.color = "#c4b5fd"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#94a3b8"; }}
              >
                <item.Icon size={16} /> {item.label}
              </Link>
            )
          )}
        </nav>

        {/* Mobile menu button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          style={{ padding: "8px", background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.25)", borderRadius: "10px", color: "#a78bfa", cursor: "pointer" }}
          className="md:hidden"
          aria-label="Toggle Menu"
        >
          {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        style={{ overflow: "hidden", maxHeight: isMenuOpen ? "400px" : "0", opacity: isMenuOpen ? 1 : 0, transition: "max-height 0.3s ease, opacity 0.3s ease", background: "rgba(10,10,15,0.97)", borderTop: "1px solid rgba(139,92,246,0.15)" }}
        className="md:hidden"
      >
        <nav style={{ display: "flex", flexDirection: "column", padding: "12px 16px 20px", gap: "4px" }}>
          {navItems.map((item, index) =>
            item.onClick ? (
              <button key={index} onClick={() => { setIsMenuOpen(false); item.onClick(); }}
                style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", borderRadius: "12px", background: "transparent", border: "none", color: "#94a3b8", fontSize: "1rem", fontWeight: 500, cursor: "pointer", textAlign: "left" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(139,92,246,0.12)"; e.currentTarget.style.color = "#c4b5fd"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#94a3b8"; }}
              >
                <item.Icon size={18} /> {item.label}
              </button>
            ) : (
              <Link key={index} to={item.to} onClick={() => setIsMenuOpen(false)}
                style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", borderRadius: "12px", textDecoration: "none", fontSize: "1rem", fontWeight: 500, transition: "all 0.2s", ...(item.isButton ? { background: "linear-gradient(135deg, rgba(124,58,237,0.8), rgba(167,139,250,0.8))", color: "#ede9fe", border: "1px solid rgba(167,139,250,0.3)", marginTop: "8px" } : { color: "#94a3b8" }) }}
                onMouseEnter={(e) => { if (!item.isButton) { e.currentTarget.style.background = "rgba(139,92,246,0.12)"; e.currentTarget.style.color = "#c4b5fd"; } }}
                onMouseLeave={(e) => { if (!item.isButton) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#94a3b8"; } }}
              >
                <item.Icon size={18} /> {item.label}
              </Link>
            )
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;
