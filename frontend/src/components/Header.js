import React from "react";
import { Link } from "react-router-dom"; 
import { Search, User, LogIn, UserPlus } from "lucide-react";

function Header() {
  return (
    <header className="bg-yellow-100 top-0 left-0 w-full h-20 flex items-center px-6 shadow-md">
      {/* Logo Section */}
      <div className="flex-shrink-0 text-2xl font-bold text-gray-800">
        <Link to="/Hero">YourLogo</Link>
      </div>

  
      <div className="flex-grow"></div>

      {/* Nav Options */}
      <nav className="flex items-center gap-6 text-gray-700 font-medium">
        <Link to="/" className="flex items-center gap-1 hover:text-black">
          <LogIn size={18} /> Login
        </Link>

        <Link to="/signup" className="flex items-center gap-1 hover:text-black">
          <UserPlus size={18} /> Signup
        </Link>

        <Link to="/Admin" className="flex items-center gap-1 hover:text-black">
          <User size={18} /> Profile
        </Link>

        {/* Search box */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search..."
            className="pl-3 pr-8 py-1 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
          <Search className="w-4 h-4 absolute right-2 top-2 text-gray-500" />
        </div>
      </nav>
    </header>
  );
}

export default Header;
