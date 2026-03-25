import React from "react";
import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Linkedin, MapPin, Heart } from "lucide-react";

function Footer() {
  return (
    <footer className="relative overflow-hidden"
      style={{
        background: "rgba(8,8,14,0.97)",
        borderTop: "1px solid rgba(139,92,246,0.2)",
      }}
    >
      {/* Top gradient accent */}
      <div className="absolute top-0 left-0 right-0 h-0.5"
        style={{ background: "linear-gradient(90deg, transparent 0%, #7c3aed 30%, #ec4899 70%, transparent 100%)" }} />

      {/* Background glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[400px] sm:w-[600px] h-[200px] pointer-events-none"
        style={{ background: "radial-gradient(ellipse, rgba(124,58,237,0.06) 0%, transparent 70%)" }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 pb-8 relative z-10">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 mb-12">

          {/* Brand — full width on smallest, 2 cols on sm */}
          <div className="col-span-2 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-[10px] shrink-0 flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)", boxShadow: "0 4px 16px rgba(124,58,237,0.4)" }}>
                <MapPin className="w-4.5 h-4.5 text-white" style={{ width: 18, height: 18 }} />
              </div>
              <div>
                <div className="text-lg font-extrabold leading-tight"
                  style={{ background: "linear-gradient(135deg, #e2d9ff, #a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                  शहरनामा
                </div>
                <div className="text-xs text-gray-600 tracking-wide">"Shaharnaama"</div>
              </div>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed italic max-w-xs">
              "हर शहर की अपनी कहानी है — शहरनामा उसे सुनाता है।"
            </p>
            <p className="text-xs text-gray-700 mt-1.5 max-w-xs">
              Every city has a story — Shaharnaama brings it to life.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xs font-bold text-violet-700 tracking-[0.15em] uppercase mb-5">Quick Links</h3>
            <ul className="space-y-3">
              {[
                { to: "/Hero", label: "Home" },
                { to: "/Community", label: "Community" },
                { to: "/Admin", label: "Profile" },
              ].map((link) => (
                <li key={link.label}>
                  <Link to={link.to}
                    className="flex items-center gap-2 text-sm text-gray-600 no-underline transition-colors duration-200 hover:text-violet-400">
                    <span className="w-1 h-1 rounded-full bg-violet-800 shrink-0" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="text-xs font-bold text-violet-700 tracking-[0.15em] uppercase mb-5">Account</h3>
            <ul className="space-y-3">
              {[
                { to: "/", label: "Login" },
                { to: "/Signup", label: "Sign Up" },
                { to: "/Admin", label: "Profile" },
              ].map((link) => (
                <li key={link.label}>
                  <Link to={link.to}
                    className="flex items-center gap-2 text-sm text-gray-600 no-underline transition-colors duration-200 hover:text-violet-400">
                    <span className="w-1 h-1 rounded-full bg-violet-800 shrink-0" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h3 className="text-xs font-bold text-violet-700 tracking-[0.15em] uppercase mb-5">Connect</h3>
            <div className="flex flex-wrap gap-3">
              {[
                { Icon: Facebook, label: "Facebook" },
                { Icon: Twitter, label: "Twitter" },
                { Icon: Instagram, label: "Instagram" },
                { Icon: Linkedin, label: "LinkedIn" },
              ].map(({ Icon, label }) => (
                <a key={label} href="#" aria-label={label}
                  className="w-9 h-9 rounded-[10px] flex items-center justify-center text-gray-500 transition-all duration-200 hover:-translate-y-0.5"
                  style={{ background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(139,92,246,0.25)"; e.currentTarget.style.borderColor = "rgba(167,139,250,0.5)"; e.currentTarget.style.color = "#a78bfa"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(139,92,246,0.1)"; e.currentTarget.style.borderColor = "rgba(139,92,246,0.2)"; e.currentTarget.style.color = ""; }}
                >
                  <Icon size={17} />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t pt-6 flex flex-col sm:flex-row items-center justify-center gap-1.5 text-center"
          style={{ borderColor: "rgba(139,92,246,0.12)" }}>
          <span className="text-xs text-gray-700">© {new Date().getFullYear()} शहरनामा "Shaharnaama"</span>
          <span className="text-xs text-gray-700 flex items-center gap-1">
            · Made with <Heart className="w-3 h-3 text-pink-500 fill-pink-500" /> for explorers
          </span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;