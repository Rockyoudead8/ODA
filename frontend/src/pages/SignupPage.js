// import React, { useState, useContext } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { MapPin, CheckCircle } from "lucide-react";
// import { UserContext } from "../UserContext"; 

// function SignupPage() {
//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");
//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState("");
  
//   const navigate = useNavigate();
//   const { setUser } = useContext(UserContext);

//   const handleGoogleLogin = () => {
//     window.location.href = "http://localhost:8000/api/auth/google";
//   };
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");
//     setSuccess("");

//     if (password !== confirmPassword) {
//       setError("Passwords do not match!");
//       return;
//     }

//     try {
//       const response = await fetch("http://localhost:8000/api/auth/signup", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         credentials: "include",
//         body: JSON.stringify({ name, email, password }),
//       });

//       const data = await response.json();
//       console.log(data);

//       if (response.ok) {
//         setUser(data.user); // Update global user context immediately
//         setSuccess("Account created successfully! Redirecting...");

//         setTimeout(() => {
//           navigate("/Check"); 
//         }, 1000);
//       } else {
//         setError(data.message || "Failed to create account.");
//       }
//     } catch (err) {
//       console.error("Signup error:", err);
//       setError("Something went wrong. Please check your connection.");
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-100 p-4">
//       <div className="bg-white shadow-2xl rounded-xl p-6 sm:p-10 w-full max-w-md border-t-8 border-pink-500 transform transition duration-500 hover:shadow-pink-300/50">
        
//         <div className="flex flex-col items-center mb-6 sm:mb-8">
//           <MapPin className="w-10 h-10 text-pink-500 mb-2" />
//           <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-800 tracking-tight">
//             Create Your Account
//           </h2>
//           <p className="text-sm sm:text-base text-gray-500 mt-1">Join the virtual walk community!</p>
//         </div>

//         {error && (
//           <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-4 text-sm">
//             {error}
//           </div>
//         )}

//         {success && (
//           <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg relative mb-4 text-sm flex items-center">
//             <CheckCircle className="w-5 h-5 mr-2" />
//             {success}
//           </div>
//         )}

//         <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
//           <div className="relative">
//             <input
//               type="text"
//               placeholder="    Full Name"
//               value={name}
//               onChange={(e) => setName(e.target.value)}
//               className="w-full p-3 sm:p-4 pl-12 border border-indigo-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-400 transition"
//               required
//             />
//           </div>

//           <div className="relative">
//             <input
//               type="email"
//               placeholder="    Email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               className="w-full p-3 sm:p-4 pl-12 border border-indigo-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-400 transition"
//               required
//             />
//           </div>

//           <div className="relative">
//             <input
//               type="password"
//               placeholder="    Password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               className="w-full p-3 sm:p-4 pl-12 border border-indigo-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-400 transition"
//               required
//             />
//           </div>

//           <div className="relative">
//             <input
//               type="password"
//               placeholder="     Confirm Password"
//               value={confirmPassword}
//               onChange={(e) => setConfirmPassword(e.target.value)}
//               className="w-full p-3 sm:p-4 pl-12 border border-indigo-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-400 transition"
//               required
//             />
//           </div>

//           <button
//             type="submit"
//             className="w-full bg-pink-500 text-white font-bold p-3 sm:p-4 rounded-lg hover:bg-pink-600 transition duration-300 shadow-md shadow-pink-300 hover:shadow-lg"
//           >
//             Sign Up
//           </button>

//           {/* 🟢 Signup with Google */}
//           <button
//             type="button"
//             onClick={handleGoogleLogin}
//             className="w-full flex items-center justify-center bg-white border border-gray-300 text-gray-700 font-semibold p-3 sm:p-4 rounded-lg hover:bg-gray-50 transition duration-300 shadow-md hover:shadow-lg mt-2"
//           >
//             <img
//               src="https://developers.google.com/identity/images/g-logo.png"
//               alt="Google"
//               className="w-5 h-5 mr-2"
//             />
//             Signup with Google
//           </button>
//         </form>

//         <p className="text-center text-sm mt-6 text-gray-600">
//           Already have an account?{" "}
//           <Link to="/" className="font-semibold text-indigo-500 hover:text-indigo-600 hover:underline transition">
//             Login here
//           </Link>
//         </p>
//       </div>
//     </div>
//   );
// }

// export default SignupPage;


// new version with added OTP functionality
import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MapPin, CheckCircle } from "lucide-react";
import { UserContext } from "../UserContext";

function SignupPage() {

  const [step, setStep] = useState(1); // step1 = signup, step2 = OTP
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:8000/api/auth/google";
  };

  // STEP 1 → request OTP
  const handleSignup = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    try {

      const response = await fetch("http://localhost:8000/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("OTP sent to your email.");
        setStep(2);
      } else {
        setError(data.message || "Failed to send OTP.");
      }

    } catch (err) {
      console.error(err);
      setError("Something went wrong.");
    }
  };

  // STEP 2 → verify OTP
  const verifyOtp = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    try {

      const response = await fetch("http://localhost:8000/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, email, password, otp }),
      });

      const data = await response.json();

      if (response.ok) {

        setUser(data.user);

        setSuccess("Account created successfully!");

        setTimeout(() => {
          navigate("/Check");
        }, 1000);

      } else {
        setError(data.message || "Invalid OTP");
      }

    } catch (err) {
      console.error(err);
      setError("Verification failed.");
    }
  };

  return (

    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-100 p-4">

      <div className="bg-white shadow-2xl rounded-xl p-6 sm:p-10 w-full max-w-md border-t-8 border-pink-500">

        <div className="flex flex-col items-center mb-6">
          <MapPin className="w-10 h-10 text-pink-500 mb-2" />
          <h2 className="text-3xl font-extrabold text-gray-800">
            Create Your Account
          </h2>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-4 flex items-center">
            <CheckCircle className="w-5 h-5 mr-2" />
            {success}
          </div>
        )}

        {/* STEP 1 FORM */}
        {step === 1 && (

          <form onSubmit={handleSignup} className="space-y-5">

            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 border rounded-lg"
              required
            />

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border rounded-lg"
              required
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border rounded-lg"
              required
            />

            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-3 border rounded-lg"
              required
            />

            <button
              type="submit"
              className="w-full bg-pink-500 text-white font-bold p-3 rounded-lg"
            >
              Send OTP
            </button>

          </form>
        )}

        {/* STEP 2 OTP FORM */}

        {step === 2 && (

          <form onSubmit={verifyOtp} className="space-y-5">

            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full p-3 border rounded-lg"
              required
            />

            <button
              type="submit"
              className="w-full bg-green-500 text-white font-bold p-3 rounded-lg"
            >
              Verify OTP
            </button>

          </form>

        )}

        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center border p-3 mt-4 rounded-lg"
        >
          <img
            src="https://developers.google.com/identity/images/g-logo.png"
            className="w-5 h-5 mr-2"
            alt="Google"
          />
          Signup with Google
        </button>

        <p className="text-center text-sm mt-6">
          Already have an account? <Link to="/">Login here</Link>
        </p>

      </div>
    </div>
  );
}

export default SignupPage;