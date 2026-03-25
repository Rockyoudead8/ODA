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
    !user && { to: "/Signup", label: "Sign Up", Icon: UserPlus, isButton: true },
    user && { label: "Logout", Icon: LogOut, onClick: handleLogout },
  ].filter(Boolean);

  return (
    <header className="sticky top-0 z-50 w-full"
      style={{
        background: "rgba(10,10,15,0.88)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(139,92,246,0.2)",
        boxShadow: "0 4px 30px rgba(0,0,0,0.5)",
      }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 py-3.5">
        {/* Logo */}
        <Link
          to="/Hero"
          onClick={() => setIsMenuOpen(false)}
          className="flex items-center gap-2.5 no-underline shrink-0 opacity-100 hover:opacity-85 transition-opacity"
        >
          <div className="w-8 h-8 rounded-[10px] flex items-center justify-center shrink-0"
            style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)", boxShadow: "0 4px 16px rgba(124,58,237,0.4)" }}>
            <MapPin className="w-4 h-4 text-white" />
          </div>
          <div>
          <span className="text-xl font-extrabold"
            style={{ background: "linear-gradient(135deg, #e2d9ff, #a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
            शहरनामा
          </span>
          <span className="hidden sm:block text-xs text-gray-600 font-medium tracking-wide">"Shaharnaama"</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item, index) =>
            item.onClick ? (
              <button
                key={index}
                onClick={item.onClick}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-[10px] bg-transparent border-none text-slate-400 text-sm font-medium cursor-pointer transition-all duration-200 hover:bg-violet-500/12 hover:text-violet-300"
              >
                <item.Icon size={15} /> {item.label}
              </button>
            ) : item.isButton ? (
              <Link
                key={index}
                to={item.to}
                className="flex items-center gap-1.5 px-4 py-2 rounded-[10px] text-violet-100 text-sm font-semibold no-underline ml-1.5 transition-all duration-200"
                style={{
                  background: "linear-gradient(135deg, rgba(124,58,237,0.9), rgba(167,139,250,0.9))",
                  border: "1px solid rgba(167,139,250,0.4)",
                  boxShadow: "0 4px 14px rgba(109,40,217,0.3)",
                }}
              >
                <item.Icon size={15} /> {item.label}
              </Link>
            ) : (
              <Link
                key={index}
                to={item.to}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-[10px] text-slate-400 text-sm font-medium no-underline transition-all duration-200 hover:bg-violet-500/12 hover:text-violet-300"
              >
                <item.Icon size={15} /> {item.label}
              </Link>
            )
          )}
        </nav>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden p-2 rounded-[10px] text-violet-400 cursor-pointer transition-colors"
          style={{ background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.25)" }}
          aria-label="Toggle Menu"
        >
          {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className="md:hidden overflow-hidden transition-all duration-300 ease-in-out"
        style={{
          maxHeight: isMenuOpen ? "400px" : "0",
          opacity: isMenuOpen ? 1 : 0,
          background: "rgba(10,10,15,0.97)",
          borderTop: isMenuOpen ? "1px solid rgba(139,92,246,0.15)" : "none",
        }}
      >
        <nav className="flex flex-col px-4 py-3 pb-5 gap-1">
          {navItems.map((item, index) =>
            item.onClick ? (
              <button key={index}
                onClick={() => { setIsMenuOpen(false); item.onClick(); }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-transparent border-none text-slate-400 text-base font-medium cursor-pointer text-left transition-colors hover:bg-violet-500/12 hover:text-violet-300"
              >
                <item.Icon size={18} /> {item.label}
              </button>
            ) : (
              <Link key={index} to={item.to} onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl no-underline text-base font-medium transition-all duration-200"
                style={item.isButton ? {
                  background: "linear-gradient(135deg, rgba(124,58,237,0.8), rgba(167,139,250,0.8))",
                  color: "#ede9fe",
                  border: "1px solid rgba(167,139,250,0.3)",
                  marginTop: "8px",
                } : { color: "#94a3b8" }}
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