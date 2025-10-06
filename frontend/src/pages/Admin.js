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
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUserData = async () => {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        setError("User ID not found in localStorage");
        return;
      }

      try {
        const response = await fetch("http://localhost:8000/api/auth/get_user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        });

        const data = await response.json();

        if (response.ok) {
          setUserData(data.user);
        } else {
          setError(data.error || "User not found");
        }
      } catch (err) {
        console.error("Unknown error:", err);
        setError("Something went wrong. Please try again.");
      }
    };

    fetchUserData();
  }, []);


  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-600 text-xl p-8 bg-red-100 rounded-lg border border-red-300">
          Error: {error}
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center text-gray-700 p-8">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500 mx-auto mb-3"></div>
          Loading user data...
        </div>
      </div>
    );
  }

  const primaryIndigo = "rgba(99, 102, 241, 1)";
  const secondaryPink = "rgba(236, 72, 153, 1)";
  const tertiaryTeal = "rgba(20, 184, 166, 1)";

  const quizData = {
    labels: ["0", "30", "60", "90", "120", "150", "180"],
    datasets: [
      {
        label: "Score",
        data: [20, 35, 30, 50, 45, 60, 80],
        fill: true,
        backgroundColor: primaryIndigo.replace(', 1)', ', 0.2)'),
        borderColor: primaryIndigo,
        tension: 0.4,
        pointBackgroundColor: primaryIndigo,
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: primaryIndigo,
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
        borderWidth: 1,
        borderColor: '#ffffff',
      },
    ],
  };

  const cityNames = userData.visitedCities || [];
  const visitCounts = cityNames.map(() => 1);

  const barData = {
    labels: cityNames,
    datasets: [
      {
        label: "Visited Cities",
        data: visitCounts,
        backgroundColor: secondaryPink.replace(', 1)', ', 0.8)'),
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
          Welcome, {userData.name || 'Explorer'}!
        </h1>
        

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

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
                  <input
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    value={userData.name}
                    readOnly
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 block mb-1">Email</label>
                  <input
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    value={userData.email}
                    readOnly
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 block mb-1">Joined On</label>
                  <input
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    value={new Date(userData.createdAt).toLocaleDateString()}
                    readOnly
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 block mb-1">Visited Cities</label>
                  <input
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    value={userData.citiesVisited || 0}
                    readOnly
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 block mb-1">Bio</label>
                  <textarea
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 resize-none focus:ring-indigo-500 focus:border-indigo-500 transition"
                    rows={2}
                    defaultValue="Traveler & History enthusiast."
                  />
                </div>
                <button className="bg-pink-500 hover:bg-pink-600 px-6 py-3 rounded-xl text-white font-semibold mt-4 w-full shadow-lg transition transform hover:scale-[1.01] active:scale-[0.99]">
                  Save Changes
                </button>
              </div>
            </div>
            <div className="bg-indigo-50 p-6 rounded-xl shadow-inner text-gray-700 mt-8 h-auto">
              <h1 className="text-xl font-bold mb-4 text-indigo-700">Contribute</h1>
              <p className="text-sm">Want to upload your own City location and content? Help us grow the community!</p>
              <button className="bg-indigo-500 hover:bg-indigo-600 px-4 py-2 rounded-lg text-white font-medium mt-3 w-full transition shadow-md">
                Upload New City
              </button>
            </div>
          </div>

          <div className="col-span-1 lg:col-span-2 space-y-8">
            
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl border border-gray-200">
              <h2 className="text-2xl font-bold mb-6 text-indigo-700">Quiz Performance Over Time</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-4 border border-gray-100 rounded-xl shadow-sm">

                  <Line data={quizData} options={{ maintainAspectRatio: true, responsive: true }} />
                </div>
                <div className="p-4 border border-gray-100 rounded-xl shadow-sm">
                  <Pie data={pieData} options={{ maintainAspectRatio: true, responsive: true }} />
                </div>
              </div>
            </div>


            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl border border-gray-200">
              <h2 className="text-2xl font-bold mb-6 text-indigo-700">City Exploration Summary</h2>

              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="flex flex-col items-center justify-center p-6 bg-pink-50 rounded-xl shadow-inner w-full md:w-1/3 min-h-[150px]">
                  <span className="text-5xl font-black text-pink-600">
                    {userData.citiesVisited || 0}
                  </span>
                  <span className="text-lg font-medium text-pink-800 mt-2 text-center">
                    Unique Cities Explored
                  </span>
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