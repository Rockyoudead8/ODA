import React, { useState, useContext } from "react";
import { MapPin } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "../UserContext";

function LoginPage() {
  const { setUser } = useContext(UserContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:8000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        setUser(data.user);
        navigate("/Hero");
      } else {
        setError(data.error || "Login failed");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred during login.");
    }
  };

  // 🟢 Google Login Handler
  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:8000/api/auth/google";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-100 p-4">
      <div className="bg-white shadow-2xl rounded-xl p-6 sm:p-10 w-full max-w-md border-t-8 border-pink-500 transform transition duration-500 hover:shadow-pink-300/50">
        <div className="flex flex-col items-center mb-6 sm:mb-8">
          <MapPin className="w-10 h-10 text-pink-500 mb-2" />
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-800 tracking-tight">
            Welcome Back!
          </h2>
          <p className="text-sm sm:text-base text-gray-500 mt-1">
            Sign in to continue your virtual walk.
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Email or Username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 sm:p-4 pl-4 border border-indigo-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-400 transition"
              required
            />
          </div>

          <div className="relative">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 sm:p-4 pl-4 border border-indigo-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-400 transition"
              required
            />
          </div>

          <div className="flex justify-between items-center">
            <a
              href="/forgot-password"
              className="text-sm text-indigo-500 hover:text-pink-500 hover:underline transition"
            >
              Forgot Password?
            </a>
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white font-bold p-3 sm:p-4 rounded-lg hover:bg-indigo-700 transition duration-300 shadow-md shadow-indigo-300 hover:shadow-lg"
          >
            Login
          </button>

          {/* 🟢 Login with Google */}
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
            Login with Google
          </button>
        </form>

        <p className="text-center text-sm mt-6 text-gray-600">
          New user?{" "}
          <Link
            to="/Signup"
            className="font-semibold text-pink-500 hover:text-pink-600 hover:underline transition"
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
