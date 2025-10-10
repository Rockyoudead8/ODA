import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "../UserContext";
import { Search, User, LogIn, UserPlus, MapPin, Menu, X, LogOut } from "lucide-react";

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, setUser } = useContext(UserContext); // use global user
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/auth/logout", {
        method: "GET",
        credentials: "include",
      });
      if (response.ok) {
        setUser(null); // update global state
        navigate("/Hero"); // redirect
      }
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const navItems = [
    { to: "/Explore", label: "Explore", Icon: Search },
    user && { to: "/Admin", label: "Profile", Icon: User },
    !user && { to: "/", label: "Login", Icon: LogIn },
    !user && { to: "/signup", label: "Sign Up", Icon: UserPlus, isButton: true },
    user && { label: "Logout", Icon: LogOut, onClick: handleLogout },
  ].filter(Boolean);
  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-sm shadow-xl border-b border-indigo-100">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
        {/* Logo */}
        <div className="flex-shrink-0 text-2xl sm:text-3xl font-extrabold text-indigo-700 tracking-wider">
          <Link 
            to="/Hero" 
            className="flex items-center gap-2 transition duration-200 hover:text-pink-600"
            onClick={() => setIsMenuOpen(false)}
          >
            <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-pink-500" />
            <span className="font-sans">शहरनामा  "Shaharnaama"</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-4 lg:gap-8 text-gray-700 font-semibold">
          {navItems.map((item, index) =>
            item.onClick ? (
              <button
                key={index}
                onClick={item.onClick}
                className="flex items-center gap-2 p-2 rounded-lg transition duration-200 hover:text-indigo-600 hover:bg-indigo-50"
              >
                <item.Icon size={20} /> {item.label}
              </button>
            ) : (
              <Link
                key={index}
                to={item.to}
                className={`
                  flex items-center gap-2 p-2 rounded-lg transition duration-200 hover:text-indigo-600 hover:bg-indigo-50
                  ${item.isButton 
                    ? 'px-4 py-2 border-2 border-pink-400 rounded-xl text-pink-600 font-bold hover:bg-pink-50 hover:shadow-md' 
                    : ''
                  }
                `}
              >
                <item.Icon size={20} /> {item.label}
              </Link>
            )
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden p-2 text-indigo-700 hover:text-pink-600 transition"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle Menu"
        >
          {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div 
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          isMenuOpen ? 'max-h-96 opacity-100 py-2' : 'max-h-0 opacity-0'
        } bg-white border-t border-indigo-100`}
      >
        <nav className="flex flex-col px-4 pb-4 space-y-2">
          {navItems.map((item, index) =>
            item.onClick ? (
              <button
                key={index}
                onClick={() => {
                  setIsMenuOpen(false);
                  item.onClick();
                }}
                className="flex items-center gap-3 p-3 rounded-lg text-lg font-medium text-gray-700 hover:text-indigo-600 hover:bg-indigo-50"
              >
                <item.Icon size={20} /> {item.label}
              </button>
            ) : (
              <Link
                key={index}
                to={item.to}
                onClick={() => setIsMenuOpen(false)}
                className={`
                  flex items-center gap-3 p-3 rounded-lg text-lg font-medium text-gray-700 hover:text-indigo-600 hover:bg-indigo-50
                  ${item.isButton 
                    ? 'bg-pink-50 text-pink-600 border-2 border-pink-300 hover:bg-pink-100 mt-2' 
                    : ''
                  }
                `}
              >
                <item.Icon size={20} /> {item.label}
              </Link>
            )
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;
