// AdminDashboard.jsx
import React from 'react';
import { Line, Pie, Bar } from 'react-chartjs-2';
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
} from 'chart.js';

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

function AdminDashboard() {
  // Sample data
  const quizData = {
    labels: ['0', '30', '60', '90', '120', '150', '180'],
    datasets: [
      {
        label: 'Score',
        data: [20, 35, 30, 50, 45, 60, 80],
        fill: true,
        backgroundColor: 'rgba(94,234,212,0.2)',
        borderColor: 'rgba(94,234,212,1)',
      },
    ],
  };

  const pieData = {
    labels: ['History', 'Culture', 'Others'],
    datasets: [
      {
        label: 'Performance Categories',
        data: [40, 30, 30],
        backgroundColor: ['#34D399', '#60A5FA', '#FBBF24'],
        borderWidth: 1,
      },
    ],
  };

  const barData = {
    labels: ['Kyoto', 'Tokyo', 'Osaka'],
    datasets: [
      {
        label: 'Visited %',
        data: [30, 19, 33],
        backgroundColor: '#4ade80',
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-6 text-white">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Info */}
        <div className="col-span-1 bg-gray-900 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">User Profile</h2>
          <div className="flex flex-col items-center">
            <img
              className="w-24 h-24 rounded-full mb-4"
              src="https://randomuser.me/api/portraits/women/79.jpg"
              alt="Profile"
            />
            <div className="w-full space-y-3">
              <div>
                <label className="text-sm">Name</label>
                <input
                  className="w-full p-2 bg-gray-800 rounded text-white"
                  value="Kira Tanaka"
                  readOnly
                />
              </div>
              <div>
                <label className="text-sm">Email</label>
                <input
                  className="w-full p-2 bg-gray-800 rounded text-white"
                  value="kira.tanaka@email.com"
                  readOnly
                />
              </div>
              <div>
                <label className="text-sm">Location</label>
                <input
                  className="w-full p-2 bg-gray-800 rounded text-white"
                  value="Kyoto, Japan"
                  readOnly
                />
              </div>
              <div>
                <label className="text-sm">Bio</label>
                <textarea
                  className="w-full p-2 bg-gray-800 rounded text-white"
                  rows={2}
                  defaultValue="Traveler & History enthusiast."
                />
              </div>
              <button className="bg-purple-500 hover:bg-purple-600 px-4 py-2 rounded text-white mt-2 w-full">
                Save Changes
              </button>
            </div>
          </div>
        </div>

        {/* Activity Panel */}
        <div className="col-span-2 space-y-6">
          {/* Quiz Performance */}
          <div className="bg-gray-900 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Quiz Performance</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Line data={quizData} />
              </div>
              <div>
                <Pie data={pieData} />
              </div>
            </div>
          </div>

          {/* Visited Cities */}
          <div className="bg-gray-900 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Visited Cities</h2>
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="text-4xl font-bold">12</div>
              <div className="text-sm">Unique Cities Explored</div>
              <div className="w-full">
                <Bar data={barData} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
