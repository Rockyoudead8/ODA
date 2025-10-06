import React from "react";
import { Facebook, Twitter, Instagram, Linkedin, MapPin } from "lucide-react";

function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-12 px-6 border-t-4 border-pink-500">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-10">
   
        <div className="md:col-span-2">
          <div className="flex items-center text-3xl font-extrabold text-indigo-400 tracking-wider mb-4">
             <MapPin className="w-7 h-7 text-pink-500 mr-2" />
            <span className="font-sans">VirtualWalk</span>
          </div>
          <p className="mt-3 text-sm text-gray-400 leading-relaxed">
            Bringing immersive AI-powered experiences to your city.  
            Explore stories, sounds, and adventures like never before.
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

        {/* User Links */}
        <div>
          <h3 className="text-lg font-bold mb-4 text-indigo-300">Account</h3>
          <ul className="space-y-3 text-sm text-gray-400">
            <li><a href="/" className="hover:text-pink-400 transition">Login</a></li>
            <li><a href="/signup" className="hover:text-pink-400 transition">Sign Up</a></li>
            <li><a href="/Admin" className="hover:text-pink-400 transition">Profile</a></li>
          </ul>
        </div>

        {/* Social Media */}
        <div>
          <h3 className="text-lg font-bold mb-4 text-indigo-300">Connect</h3>
          <div className="flex space-x-5">
            <a href="#" className="text-gray-400 hover:text-pink-500 transition"><Facebook size={24} /></a>
            <a href="#" className="text-gray-400 hover:text-pink-500 transition"><Twitter size={24} /></a>
            <a href="#" className="text-gray-400 hover:text-pink-500 transition"><Instagram size={24} /></a>
            <a href="#" className="text-gray-400 hover:text-pink-500 transition"><Linkedin size={24} /></a>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="mt-12 border-t border-gray-700 pt-6 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} VirtualWalk. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;
