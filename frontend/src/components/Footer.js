import React from "react";
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

function Footer() {
  return (
    <footer className="bg-blue-500 text-white py-10 px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Logo + About */}
        <div>
          <h2 className="text-2xl font-bold">YourLogo</h2>
          <p className="mt-3 text-sm text-blue-100">
            Bringing immersive AI-powered experiences to your city.  
            Explore stories, sounds, and adventures like never before.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            <li><a href="/" className="hover:underline">Home</a></li>
            <li><a href="/about" className="hover:underline">About</a></li>
            <li><a href="/services" className="hover:underline">Services</a></li>
            <li><a href="/contact" className="hover:underline">Contact</a></li>
          </ul>
        </div>

        {/* User Links */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Account</h3>
          <ul className="space-y-2 text-sm">
            <li><a href="/login" className="hover:underline">Login</a></li>
            <li><a href="/signup" className="hover:underline">Signup</a></li>
            <li><a href="/profile" className="hover:underline">Profile</a></li>
          </ul>
        </div>

        {/* Social Media */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Follow Us</h3>
          <div className="flex space-x-4">
            <a href="#" className="hover:text-blue-200"><Facebook /></a>
            <a href="#" className="hover:text-blue-200"><Twitter /></a>
            <a href="#" className="hover:text-blue-200"><Instagram /></a>
            <a href="#" className="hover:text-blue-200"><Linkedin /></a>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="mt-10 border-t border-blue-400 pt-4 text-center text-sm text-blue-100">
        © {new Date().getFullYear()} YourWebsite. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;
