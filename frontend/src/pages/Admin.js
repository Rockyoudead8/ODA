import React, { useEffect, useState } from "react";
import { Line, Pie } from "react-chartjs-2";
import { Chart as ChartJS, LineElement, BarElement, CategoryScale, LinearScale, PointElement, ArcElement, Tooltip, Legend } from "chart.js";
import { MapPin, UploadCloud, Loader2, X, CheckCircle, Award, Target, BookOpen } from "lucide-react";
import { motion } from "framer-motion";
import UserVisitedMap from "../components/UserVisitedMap";

ChartJS.register(LineElement, BarElement, CategoryScale, LinearScale, PointElement, ArcElement, Tooltip, Legend);

const simulateUploadCity = (cityName) => new Promise((resolve) => setTimeout(() => resolve({ success: true, message: `${cityName} uploaded successfully!` }), 2000));

const StatCard = ({ icon, title, value, color, detail }) => (
  <motion.div
    className={`bg-white p-6 rounded-2xl shadow-lg border-l-4 ${color}`}
    whileHover={{ scale: 1.05, boxShadow: "0px 10px 20px rgba(0,0,0,0.1)" }}
    transition={{ type: "spring", stiffness: 300 }}
  >
    <div className="flex items-center gap-4">
      <div className={`p-3 rounded-full bg-opacity-10 ${color.replace('border-', 'bg-').replace('-500', '-100')}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
        {detail && <p className="text-xs text-gray-400">{detail}</p>}
      </div>
    </div>
  </motion.div>
);

const Admin = () => {
  const [userData, setUserData] = useState(null);
  const [quizResults, setQuizResults] = useState([]);
  const [visitedCitiesWithCoords, setVisitedCitiesWithCoords] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [newCityName, setNewCityName] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // get logged-in user info from session
        const userRes = await fetch("http://localhost:8000/api/auth/get_user", {
          method: "GET", // session-based auth
          credentials: "include",
        });
        const userData = await userRes.json();
        if (userRes.ok) setUserData(userData.user);
        else setError(userData.error || "User not found");

        // get quiz results for logged-in user
        const quizRes = await fetch("http://localhost:8000/api/submit_quiz/get_quiz", {
          method: "GET", // adjust backend to use session user
          credentials: "include",
        });
        const quizData = await quizRes.json();
        if (quizRes.ok) setQuizResults(quizData || []);
      } catch (err) {
        console.error("Unknown error:", err);
        setError("Something went wrong.");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);


  useEffect(() => {
    const fetchCityCoords = async () => {
      if (userData?.visitedCities?.length > 0) {
        try {
          const res = await fetch('http://localhost:8000/api/geocode-cities', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cities: userData.visitedCities }),
          });
          const coordsData = await res.json();
          if (res.ok) {
            setVisitedCitiesWithCoords(coordsData);
          } else {
            console.error("Failed to get coordinates from backend:", coordsData.error);
          }
        } catch (err) {
          console.error("Failed to geocode cities with Gemini:", err);
        }
      }
    };

    if (userData) {
      fetchCityCoords();
    }
  }, [userData]);

  const handleUploadCity = async (e) => {
    e.preventDefault();
    if (!newCityName.trim()) return;
    setIsUploading(true);
    setUploadMessage({ type: "", text: "" });
    try {
      const result = await simulateUploadCity(newCityName.trim());
      setUploadMessage({ type: "success", text: result.message });
      setNewCityName("");
      setTimeout(() => setIsUploadModalOpen(false), 2000);
    } catch (err) {
      setUploadMessage({ type: "error", text: "Upload failed." });
    } finally {
      setIsUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-indigo-50">
        <div className="text-center text-gray-700 p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-indigo-500 mx-auto mb-3"></div>
          <p className="text-lg font-semibold">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-red-50">
        <div className="text-red-700 text-xl p-8 bg-white rounded-xl shadow-lg border-t-4 border-red-500">Error: {error}</div>
      </div>
    );
  }

  const cityPerformance = quizResults.reduce((acc, result) => {
    const { city, score } = result;
    if (!acc[city]) acc[city] = { totalScore: 0, count: 0 };
    acc[city].totalScore += score;
    acc[city].count++;
    return acc;
  }, {});

  const totalQuizzes = quizResults.length;
  const overallAvgScore = totalQuizzes > 0 ? (quizResults.reduce((sum, q) => sum + q.score, 0) / totalQuizzes).toFixed(1) : 0;

  let bestCity = "N/A";
  if (Object.keys(cityPerformance).length > 0) {
    bestCity = Object.keys(cityPerformance).reduce((a, b) =>
      (cityPerformance[a].totalScore / cityPerformance[a].count) > (cityPerformance[b].totalScore / cityPerformance[b].count) ? a : b
    );
  }

  const lineData = { labels: quizResults.map((q, i) => `Quiz ${i + 1}`), datasets: [{ label: "Score", data: quizResults.map(q => q.score), fill: true, backgroundColor: 'rgba(99, 102, 241, 0.2)', borderColor: 'rgba(99, 102, 241, 1)', tension: 0.4 }] };

  const pieData = {
    labels: Object.keys(cityPerformance),
    datasets: [{
      label: 'Average Score',
      data: Object.keys(cityPerformance).map(city => (cityPerformance[city].totalScore / cityPerformance[city].count).toFixed(2)),
      backgroundColor: ['rgba(99, 102, 241, 0.8)', 'rgba(236, 72, 153, 0.8)', 'rgba(52, 211, 153, 0.8)', 'rgba(251, 146, 60, 0.8)', 'rgba(168, 85, 247, 0.8)'],
      borderColor: '#fff',
      borderWidth: 2,
    }],
  };

  const UploadCityModal = () => (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-2xl w-full max-w-lg transform transition-all duration-300 scale-100 border-t-4 border-teal-500">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-teal-700 flex items-center">
            <UploadCloud className="w-6 h-6 mr-2" /> Suggest a City
          </h3>
          <button
            onClick={() => {
              setIsUploadModalOpen(false);
              setNewCityName("");
              setUploadMessage({ type: "", text: "" });
            }}
            className="p-1 rounded-full text-gray-500 hover:bg-gray-100 transition"
            disabled={isUploading}
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleUploadCity} className="space-y-5">
          <p className="text-gray-600">
            If your city is missing from our list, please submit it below for our team to review and add.
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City Name (e.g., Vancouver, Canada)
            </label>
            <input
              type="text"
              value={newCityName}
              onChange={(e) => {
                setNewCityName(e.target.value);
                setUploadMessage({ type: "", text: "" });
              }}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 transition duration-150 shadow-sm"
              placeholder="Enter City and Country"
              required
              disabled={isUploading || uploadMessage.type === "success"}
            />
          </div>
          {uploadMessage.text && (
            <div className={`flex items-center p-3 rounded-lg ${uploadMessage.type === "success" ? "bg-teal-50 text-teal-800 border border-teal-300" : "bg-red-50 text-red-800 border border-red-300"}`}>
              {uploadMessage.type === "success" ? <CheckCircle className="w-5 h-5 mr-2" /> : <X className="w-5 h-5 mr-2" />}
              <p className="text-sm font-medium">{uploadMessage.text}</p>
            </div>
          )}
          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setIsUploadModalOpen(false);
                setNewCityName("");
                setUploadMessage({ type: "", text: "" });
              }}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition font-semibold shadow-sm"
              disabled={isUploading}
            >
              Close
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition font-semibold flex items-center justify-center shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isUploading || !newCityName.trim() || uploadMessage.type === "success"}
            >
              {isUploading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isUploading ? "Submitting..." : "Submit Suggestion"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8 lg:p-12 text-gray-800 font-sans">
      {isUploadModalOpen && <UploadCityModal />}
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-10 text-gray-900 tracking-tight">
            Welcome back, <span className="text-indigo-600">{userData.name || "Explorer"}</span>!
          </h1>
        </motion.div>
        <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          <motion.div
            className="lg:col-span-1 bg-white p-6 sm:p-8 rounded-2xl shadow-xl h-fit"
            initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-indigo-500" /> My Profile
            </h2>
            <div className="flex flex-col items-center">
              <div className="relative mb-6">
                <img className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-xl" src="https://placehold.co/128x128/E5E7EB/4B5563?text=User" alt="Profile" />
                <div className="absolute inset-0 rounded-full border-2 border-indigo-500 animate-pulse"></div>
              </div>
              <div className="w-full space-y-3">
                {[
                  { label: "Name", value: userData.name },
                  { label: "Email", value: userData.email },
                  { label: "Joined On", value: new Date(userData.createdAt).toLocaleDateString() },
                ].map((field) => (
                  <div key={field.label} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <label className="text-xs font-medium text-gray-500">{field.label}</label>
                    <p className="font-semibold text-gray-800">{field.value}</p>
                  </div>
                ))}
              </div>
              <button onClick={() => setIsUploadModalOpen(true)} className="mt-8 w-full flex items-center justify-center px-6 py-3 font-semibold rounded-lg shadow-md text-white bg-indigo-600 hover:bg-indigo-700 transition">
                <UploadCloud className="w-5 h-5 mr-2" /> Suggest a City
              </button>
            </div>
          </motion.div>
          <motion.div
            className="lg:col-span-2 xl:col-span-3 space-y-8"
            initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard icon={<BookOpen className="w-6 h-6 text-indigo-500" />} title="Total Quizzes Taken" value={totalQuizzes} color="border-indigo-500" />
              <StatCard icon={<Target className="w-6 h-6 text-pink-500" />} title="Overall Average Score" value={`${overallAvgScore}%`} color="border-pink-500" detail={`out of ${totalQuizzes} quizzes`} />
              <StatCard icon={<Award className="w-6 h-6 text-teal-500" />} title="Best Performing City" value={bestCity} color="border-teal-500" />
            </div>
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl">
              <h2 className="text-2xl font-bold mb-6 text-gray-800">Performance Analysis</h2>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <h3 className="text-lg font-semibold mb-3 text-gray-700 text-center">Scores Over Time</h3>
                  <Line data={lineData} options={{ maintainAspectRatio: true, responsive: true }} />
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <h3 className="text-lg font-semibold mb-3 text-gray-700 text-center">Average Score by City</h3>
                  {pieData.labels.length > 0 ? (
                    <div className="max-w-[350px] mx-auto"><Pie data={pieData} options={{ maintainAspectRatio: true, responsive: true }} /></div>
                  ) : (<p className="text-center text-gray-500 h-full flex items-center justify-center">No quiz data yet.</p>)}
                </div>
              </div>
            </div>

            <UserVisitedMap visitedCities={visitedCitiesWithCoords} />

          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default Admin;