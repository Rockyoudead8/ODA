import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MapPin, CheckCircle } from "lucide-react";
import { UserContext } from "../UserContext"; 

function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:8000/api/auth/google";
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();
      console.log(data);

      if (response.ok) {
        setUser(data.user); // Update global user context immediately
        setSuccess("Account created successfully! Redirecting...");

        setTimeout(() => {
          navigate("/Check"); 
        }, 1000);
      } else {
        setError(data.message || "Failed to create account.");
      }
    } catch (err) {
      console.error("Signup error:", err);
      setError("Something went wrong. Please check your connection.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-100 p-4">
      <div className="bg-white shadow-2xl rounded-xl p-6 sm:p-10 w-full max-w-md border-t-8 border-pink-500 transform transition duration-500 hover:shadow-pink-300/50">
        
        <div className="flex flex-col items-center mb-6 sm:mb-8">
          <MapPin className="w-10 h-10 text-pink-500 mb-2" />
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-800 tracking-tight">
            Create Your Account
          </h2>
          <p className="text-sm sm:text-base text-gray-500 mt-1">Join the virtual walk community!</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-4 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg relative mb-4 text-sm flex items-center">
            <CheckCircle className="w-5 h-5 mr-2" />
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
          <div className="relative">
            <input
              type="text"
              placeholder="    Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 sm:p-4 pl-12 border border-indigo-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-400 transition"
              required
            />
          </div>

          <div className="relative">
            <input
              type="email"
              placeholder="    Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 sm:p-4 pl-12 border border-indigo-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-400 transition"
              required
            />
          </div>

          <div className="relative">
            <input
              type="password"
              placeholder="    Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 sm:p-4 pl-12 border border-indigo-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-400 transition"
              required
            />
          </div>

          <div className="relative">
            <input
              type="password"
              placeholder="     Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-3 sm:p-4 pl-12 border border-indigo-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-400 transition"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-pink-500 text-white font-bold p-3 sm:p-4 rounded-lg hover:bg-pink-600 transition duration-300 shadow-md shadow-pink-300 hover:shadow-lg"
          >
            Sign Up
          </button>

          {/* 🟢 Signup with Google */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center bg-white border border-gray-300 text-gray-700 font-semibold p-3 sm:p-4 rounded-lg hover:bg-gray-50 transition duration-300 shadow-md hover:shadow-lg mt-2"
          >
            <img
              src="https://developers.google.com/identity/images/g-logo.png"
              alt="Google"
              className="w-5 h-5 mr-2"
            />
            Signup with Google
          </button>
        </form>

        <p className="text-center text-sm mt-6 text-gray-600">
          Already have an account?{" "}
          <Link to="/" className="font-semibold text-indigo-500 hover:text-indigo-600 hover:underline transition">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}

export default SignupPage;
