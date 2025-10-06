import React, { useEffect, useState } from "react";
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

function Admin() {
  const [userData, setUserData] = useState(null);
  const [quizResults, setQuizResults] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        setError("User ID not found in localStorage");
        setLoading(false);
        return;
      }

      try {
        // Fetch user info
        const response = await fetch("http://localhost:8000/api/auth/get_user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        });
        const data = await response.json();
        if (response.ok) setUserData(data.user);
        else setError(data.error || "User not found");

        // Fetch quiz results
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

    fetchUserData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center text-gray-700 p-8">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500 mx-auto mb-3"></div>
          Loading data...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-600 text-xl p-8 bg-red-100 rounded-lg border border-red-300">
          Error: {error}
        </div>
      </div>
    );
  }

  const primaryIndigo = "rgba(99, 102, 241, 1)";
  const secondaryPink = "rgba(236, 72, 153, 1)";
  const tertiaryTeal = "rgba(20, 184, 166, 1)";

  // Line chart for quiz performance
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
        pointBackgroundColor: primaryIndigo,
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: primaryIndigo,
      },
    ],
  };

  // Pie chart (categories placeholder, can be enhanced)
  const pieData = {
    labels: ["History", "Culture", "Others"],
    datasets: [
      {
        label: "Performance Categories",
        data: [40, 30, 30],
        backgroundColor: [primaryIndigo, secondaryPink, tertiaryTeal],
        borderWidth: 1,
        borderColor: "#ffffff",
      },
    ],
  };

  // Bar chart for visited cities
  const cityNames = userData.visitedCities || [];
  const visitCounts = cityNames.map(() => 1);
  const barData = {
    labels: cityNames,
    datasets: [
      {
        label: "Visited Cities",
        data: visitCounts,
        backgroundColor: secondaryPink.replace(", 1)", ", 0.8)"),
        borderColor: secondaryPink,
        borderWidth: 1,
        borderRadius: 8,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 p-4 sm:p-6 lg:p-8 text-gray-800">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-extrabold mb-8 text-indigo-800 tracking-tight">
          Welcome, {userData.name || "Explorer"}!
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* User Profile Section */}
          <div className="col-span-1 bg-white p-6 sm:p-8 rounded-2xl shadow-xl border border-gray-200">
            <h2 className="text-2xl font-bold mb-6 text-indigo-700">User Profile</h2>
            <div className="flex flex-col items-center">
              <img
                className="w-28 h-28 rounded-full mb-6 object-cover border-4 border-pink-500 shadow-md"
                src="https://placehold.co/120x120/E5E7EB/4B5563?text=User"
                alt="Profile"
              />
              <div className="w-full space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500 block mb-1">Name</label>
                  <input className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg" value={userData.name} readOnly />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 block mb-1">Email</label>
                  <input className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg" value={userData.email} readOnly />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 block mb-1">Joined On</label>
                  <input className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg" value={new Date(userData.createdAt).toLocaleDateString()} readOnly />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 block mb-1">Visited Cities</label>
                  <input className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg" value={userData.visitedCities?.length || 0} readOnly />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 block mb-1">Bio</label>
                  <textarea className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg" rows={2} defaultValue="Traveler & History enthusiast." />
                </div>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="col-span-1 lg:col-span-2 space-y-8">
            {/* Quiz Performance */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl border border-gray-200">
              <h2 className="text-2xl font-bold mb-6 text-indigo-700">Quiz Performance</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-4 border border-gray-100 rounded-xl shadow-sm">
                  <Line data={lineData} options={{ maintainAspectRatio: true, responsive: true }} />
                </div>
                <div className="p-4 border border-gray-100 rounded-xl shadow-sm">
                  <Pie data={pieData} options={{ maintainAspectRatio: true, responsive: true }} />
                </div>
              </div>
            </div>

            {/* City Exploration */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl border border-gray-200">
              <h2 className="text-2xl font-bold mb-6 text-indigo-700">City Exploration Summary</h2>
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="flex flex-col items-center justify-center p-6 bg-pink-50 rounded-xl shadow-inner w-full md:w-1/3 min-h-[150px]">
                  <span className="text-5xl font-black text-pink-600">{userData.visitedCities?.length || 0}</span>
                  <span className="text-lg font-medium text-pink-800 mt-2 text-center">Unique Cities Explored</span>
                </div>
                <div className="w-full md:w-2/3 p-4 border border-gray-100 rounded-xl shadow-sm">
                  <h3 className="text-lg font-semibold mb-3 text-gray-700">Recent Visits</h3>
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

export default Admin;
