import React, { useEffect, useState, useMemo } from "react";
import { Line, Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { MapPin, UploadCloud, Loader2, X, CheckCircle } from 'lucide-react';

ChartJS.register(
  LineElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  ArcElement,
  Tooltip,
  Legend
);

const simulateUploadCity = (cityName) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, message: `${cityName} uploaded successfully for review!` });
    }, 2000);
  });
};

const Check = () => {
  const [userData, setUserData] = useState(null);
  const [quizResults, setQuizResults] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [newCityName, setNewCityName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState({ type: '', text: '' });

  const fetchUserData = async () => {
    const userId = typeof localStorage !== 'undefined' ? localStorage.getItem("userId") : null;
    if (!userId) {
      setError("User ID not found");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/api/auth/get_user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const data = await response.json();
      if (response.ok) setUserData(data.user);
      else setError(data.error || "User not found");

      const quizRes = await fetch("http://localhost:8000/api/submit_quiz/get_quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const quizData = await quizRes.json();
      if (quizRes.ok) setQuizResults(quizData || []);
      else console.warn("Quiz fetch error:", quizData.error);
    } catch (err) {
      console.error("Unknown error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleUploadCity = async (e) => {
    e.preventDefault();
    if (!newCityName.trim()) return;

    setIsUploading(true);
    setUploadMessage({ type: '', text: '' });

    try {
      const result = await simulateUploadCity(newCityName.trim());
      setUploadMessage({ type: 'success', text: result.message });
      setNewCityName('');
      setTimeout(() => setIsUploadModalOpen(false), 2000);
    } catch (err) {
      setUploadMessage({ type: 'error', text: 'Upload failed. Please try again.' });
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
        <div className="text-red-700 text-xl p-8 bg-white rounded-xl shadow-lg border-t-4 border-red-500">
          Error: {error}
        </div>
      </div>
    );
  }

  const primaryIndigo = "rgba(99, 102, 241, 1)";
  const secondaryPink = "rgba(236, 72, 153, 1)";
  const tertiaryTeal = "rgba(20, 184, 166, 1)";

  const lineData = {
    labels: quizResults.map((q, i) => `Quiz ${i + 1}`),
    datasets: [
      {
        label: "Score",
        data: quizResults.map(q => q.score),
        fill: true,
        backgroundColor: primaryIndigo.replace(", 1)", ", 0.2)"),
        borderColor: primaryIndigo,
        tension: 0.4,
        pointRadius: 5,
        pointHoverRadius: 7,
      },
    ],
  };

  const pieData = {
    labels: ["History", "Culture", "Others"],
    datasets: [
      {
        label: "Performance Categories",
        data: [40, 30, 30],
        backgroundColor: [primaryIndigo, secondaryPink, tertiaryTeal],
        borderWidth: 2,
        borderColor: "#ffffff",
      },
    ],
  };

  const cityNames = userData.visitedCities || [];
  const visitCounts = cityNames.map(() => 1);
  const barData = {
    labels: cityNames,
    datasets: [
      {
        label: "Cities Visited",
        data: visitCounts,
        backgroundColor: secondaryPink.replace(", 1)", ", 0.8)"),
        borderColor: secondaryPink,
        borderWidth: 1,
        borderRadius: 6,
        barThickness: 30,
      },
    ],
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
                        setNewCityName('');
                        setUploadMessage({ type: '', text: '' });
                    }}
                    className="p-1 rounded-full text-gray-500 hover:bg-gray-100 transition"
                    disabled={isUploading}
                >
                    <X className="w-6 h-6" />
                </button>
            </div>
            
            <form onSubmit={handleUploadCity} className="space-y-5">
                <p className="text-gray-600">If your city is missing from our list, please submit it below for our team to review and add.</p>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City Name (e.g., Vancouver, Canada)</label>
                    <input
                        type="text"
                        value={newCityName}
                        onChange={(e) => {
                            setNewCityName(e.target.value);
                            setUploadMessage({ type: '', text: '' });
                        }}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 transition duration-150 shadow-sm"
                        placeholder="Enter City and Country"
                        required
                        disabled={isUploading || uploadMessage.type === 'success'}
                    />
                </div>

                {uploadMessage.text && (
                    <div className={`flex items-center p-3 rounded-lg ${uploadMessage.type === 'success' ? 'bg-teal-50 text-teal-800 border border-teal-300' : 'bg-red-50 text-red-800 border border-red-300'}`}>
                        {uploadMessage.type === 'success' ? <CheckCircle className="w-5 h-5 mr-2" /> : <X className="w-5 h-5 mr-2" />}
                        <p className="text-sm font-medium">{uploadMessage.text}</p>
                    </div>
                )}

                <div className="flex justify-end space-x-3 pt-2">
                    <button
                        type="button"
                        onClick={() => {
                            setIsUploadModalOpen(false);
                            setNewCityName('');
                            setUploadMessage({ type: '', text: '' });
                        }}
                        className="px-4 py-2 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition font-semibold shadow-sm"
                        disabled={isUploading}
                    >
                        Close
                    </button>
                    <button
                        type="submit"
                        className="px-6 py-2 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition font-semibold flex items-center justify-center shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isUploading || !newCityName.trim() || uploadMessage.type === 'success'}
                    >
                        {isUploading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        {isUploading ? 'Submitting...' : 'Submit Suggestion'}
                    </button>
                </div>
            </form>
        </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 p-4 sm:p-8 lg:p-12 text-gray-800 font-['Inter']">
      
      {isUploadModalOpen && <UploadCityModal />}

      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-extrabold mb-10 text-indigo-900 tracking-tight border-b-4 border-pink-300 pb-2">
          Dashboard: {userData.name || "Explorer"}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          
          {/* User Profile Section (Col 1 or 1/4) */}
          <div className="lg:col-span-1 bg-white p-6 sm:p-8 rounded-3xl shadow-2xl border-t-8 border-indigo-500 h-fit">
            <h2 className="text-2xl font-bold mb-6 text-indigo-700 flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-pink-500" /> User Profile
            </h2>
            <div className="flex flex-col items-center">
              <img
                className="w-32 h-32 rounded-full mb-6 object-cover border-4 border-pink-500 shadow-xl transition transform hover:scale-105"
                src="https://placehold.co/128x128/E5E7EB/4B5563?text=User"
                alt="Profile"
              />
              <div className="w-full space-y-4">
                {[
                  { label: "Name", value: userData.name },
                  { label: "Email", value: userData.email },
                  { label: "Joined On", value: new Date(userData.createdAt).toLocaleDateString() },
                  { label: "Visited Cities", value: userData.visitedCities?.length || 0 },
                ].map((field, index) => (
                  <div key={index}>
                    <label className="text-sm font-medium text-gray-500 block mb-1">{field.label}</label>
                    <input className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-800 shadow-inner focus:ring-indigo-500" value={field.value} readOnly />
                  </div>
                ))}
                
                <div>
                  <label className="text-sm font-medium text-gray-500 block mb-1">Bio</label>
                  <textarea className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl shadow-inner focus:ring-indigo-500" rows={2} defaultValue="Traveler & History enthusiast." />
                </div>
              </div>

              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="mt-6 w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-semibold rounded-xl shadow-md text-white bg-teal-600 hover:bg-teal-700 transition duration-150 ease-in-out transform hover:scale-[1.01]"
              >
                <UploadCloud className="w-5 h-5 mr-2" />
                Suggest a City
              </button>
            </div>
          </div>

          {/* Charts and Summary Section (Col 2-4 or 3/4) */}
          <div className="lg:col-span-2 xl:col-span-3 space-y-8">
            
            {/* Quiz Performance */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-2xl border border-gray-100">
              <h2 className="text-2xl font-bold mb-6 text-indigo-700">Quiz Performance Over Time</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-4 border border-gray-100 rounded-2xl shadow-inner transition hover:shadow-lg">
                  <h3 className="text-lg font-semibold mb-3 text-gray-700">Recent Scores</h3>
                  <Line data={lineData} options={{ maintainAspectRatio: true, responsive: true }} />
                </div>
                <div className="p-4 border border-gray-100 rounded-2xl shadow-inner transition hover:shadow-lg">
                  <h3 className="text-lg font-semibold mb-3 text-gray-700">Category Breakdown</h3>
                  <Pie data={pieData} options={{ maintainAspectRatio: true, responsive: true }} />
                </div>
              </div>
            </div>

            {/* City Exploration */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-2xl border border-gray-100">
              <h2 className="text-2xl font-bold mb-6 text-indigo-700">City Exploration Summary</h2>
              <div className="flex flex-col xl:flex-row items-center gap-8">
                
                <div className="flex flex-col items-center justify-center p-8 bg-pink-50 rounded-2xl shadow-inner w-full xl:w-1/3 min-h-[180px] border-l-4 border-pink-500">
                  <span className="text-6xl font-black text-pink-600 drop-shadow-md">{userData.visitedCities?.length || 0}</span>
                  <span className="text-lg font-extrabold text-pink-800 mt-3 text-center tracking-wide">Cities Explored</span>
                  <p className="text-xs text-gray-500 mt-1">A growing virtual journey.</p>
                </div>
                
                <div className="w-full xl:w-2/3 p-4 border border-gray-100 rounded-2xl shadow-inner transition hover:shadow-lg">
                  <h3 className="text-lg font-semibold mb-3 text-gray-700">Recent Visit Count</h3>
                  <Bar data={barData} options={{ maintainAspectRatio: true, responsive: true }} />
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}

export default Check;
