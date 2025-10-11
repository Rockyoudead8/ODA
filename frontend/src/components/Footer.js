import React from "react";
import { Facebook, Twitter, Instagram, Linkedin, MapPin } from "lucide-react";

function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-10 sm:py-12 px-4 sm:px-6 lg:px-8 border-t-4 border-pink-500">
      <div className="max-w-7xl mx-auto">

        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-y-10 gap-x-8">
   
          <div className="sm:col-span-3 lg:col-span-2">
            <div className="flex items-center text-3xl font-extrabold text-indigo-400 tracking-wider mb-4">
              <MapPin className="w-7 h-7 text-pink-500 mr-2" />
              <span className="font-sans">शहरनामा "Shaharnaama"</span>
            </div>
            <p className="mt-3 text-sm text-gray-400 leading-relaxed max-w-sm">
              “हर शहर की अपनी कहानी है — शहरनामा उसे सुनाता है।”

              "Every city has a story — Shaharnaama brings it to life."
            </p>
          </div>

         
          <div>
            <h3 className="text-lg font-bold mb-4 text-indigo-300">Quick Links</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><a href="/Hero" className="hover:text-pink-400 transition">Home</a></li>
              <li><a href="/listings/search" className="hover:text-pink-400 transition">Explore</a></li>
              <li><a href="#" className="hover:text-pink-400 transition">How It Works</a></li>
              <li><a href="#" className="hover:text-pink-400 transition">Support</a></li>
            </ul>
          </div>

          
          <div>
            <h3 className="text-lg font-bold mb-4 text-indigo-300">Account</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><a href="/" className="hover:text-pink-400 transition">Login</a></li>
              <li><a href="/signup" className="hover:text-pink-400 transition">Sign Up</a></li>
              <li><a href="/Admin" className="hover:text-pink-400 transition">Profile</a></li>
            </ul>
          </div>

      
          <div>
            <h3 className="text-lg font-bold mb-4 text-indigo-300">Connect</h3>
            <div className="flex space-x-5">
              <a href="#" className="text-gray-400 hover:text-pink-500 transition" aria-label="Facebook"><Facebook size={24} /></a>
              <a href="#" className="text-gray-400 hover:text-pink-500 transition" aria-label="Twitter"><Twitter size={24} /></a>
              <a href="#" className="text-gray-400 hover:text-pink-500 transition" aria-label="Instagram"><Instagram size={24} /></a>
              <a href="#" className="text-gray-400 hover:text-pink-500 transition" aria-label="LinkedIn"><Linkedin size={24} /></a>
            </div>
          </div>
        </div>


        <div className="mt-10 sm:mt-12 border-t border-gray-700 pt-6 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} शहरनामा "Shaharnaama"
        </div>
      </div>
    </footer>
  );
}

export default Footer;