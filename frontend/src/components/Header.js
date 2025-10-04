import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, User, LogIn, UserPlus } from "lucide-react";

function Header() {

  return (
    <header className="bg-yellow-100 top-0 left-0 w-full h-20 flex items-center px-6 shadow-md">
   
      <div className="flex-shrink-0 text-2xl font-bold text-gray-800">
        <Link to="/Hero">YourLogo</Link>
      </div>


      <div className="flex-grow"></div>


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
      </nav>
    </header>
  );
}

export default Header;
