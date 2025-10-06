import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, User, LogIn, UserPlus, MapPin } from "lucide-react";

function Header() {

  return (
    <header className="sticky top-0 z-50 w-full flex items-center justify-between px-8 py-4 shadow-xl bg-white/95 backdrop-blur-sm border-b border-indigo-100">
   
    
      <div className="flex-shrink-0 text-3xl font-extrabold text-indigo-700 tracking-wider">
        <Link to="/Hero" className="flex items-center gap-2 transition duration-200 hover:text-pink-600">
          <MapPin className="w-6 h-6 text-pink-500" />
          <span className="font-sans">VirtualWalk</span>
        </Link>
      </div>


 
      <nav className="flex items-center gap-8 text-gray-700 font-semibold">
        
  
        <Link 
          to="/Explore" 
          className="flex items-center gap-2 p-2 rounded-lg transition duration-200 hover:text-indigo-600 hover:bg-indigo-50"
        >
          <Search size={20} /> Explore
        </Link>

        {/* Auth Links */}
        <Link 
          to="/" 
          className="flex items-center gap-2 p-2 rounded-lg transition duration-200 hover:text-indigo-600 hover:bg-indigo-50"
        >
          <LogIn size={20} /> Login
        </Link>

        <Link 
          to="/signup" 
          className="flex items-center gap-2 px-4 py-2 border-2 border-pink-400 rounded-xl text-pink-600 font-bold transition duration-200 hover:bg-pink-50 hover:shadow-md"
        >
          <UserPlus size={20} /> Sign Up
        </Link>

        <Link 
          to="/Admin" 
          className="flex items-center gap-2 p-2 rounded-lg transition duration-200 hover:text-indigo-600 hover:bg-indigo-50"
        >
          <User size={20} /> Profile
        </Link>
      </nav>
    </header>
  );
}

export default Header;
