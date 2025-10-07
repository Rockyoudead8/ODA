import React, { useState, useEffect } from 'react';
import { Award, Zap, ChevronDown, User, Loader2 } from 'lucide-react';

// Mock data to simulate fetching from a leaderboard API
const MOCK_LEADERBOARD_DATA = [
  { id: 1, name: "Traveler Jane", score: 5200, city: "Paris" },
  { id: 2, name: "History Buff", score: 4850, city: "London" },
  { id: 3, name: "Explorer Max", score: 4500, city: "Tokyo" },
  { id: 4, name: "City Walker", score: 3900, city: "New York" },
  { id: 5, name: "Globe Trotter", score: 3250, city: "Rome" },
  { id: 6, name: "Quiz Master", score: 3100, city: "Berlin" },
  { id: 7, name: "Digital Nomad", score: 2800, city: "Dubai" },
  { id: 8, name: "Local Guide", score: 2550, city: "Sydney" },
  { id: 9, name: "Virtual Tourist", score: 2100, city: "Hong Kong" },
  { id: 10, name: "Urban Mapper", score: 1950, city: "Seoul" },
].sort((a, b) => b.score - a.score); // Ensure data is sorted by score

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortKey, setSortKey] = useState('score');
  const [sortDirection, setSortDirection] = useState('desc');

  // Simulate fetching data from the backend
  useEffect(() => {
    // In a real application, replace this with a fetch call:
    // fetch("http://localhost:8000/api/leaderboard/get_top_users")
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network delay

      try {
        setLeaderboard(MOCK_LEADERBOARD_DATA);
      } catch (e) {
        setError("Failed to load leaderboard data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const sortedLeaderboard = React.useMemo(() => {
    if (!leaderboard.length) return [];
    
    // Sort logic is simple since mock data is already sorted by score
    // Added for general component robustness
    return [...leaderboard].sort((a, b) => {
      if (a[sortKey] < b[sortKey]) return sortDirection === 'asc' ? -1 : 1;
      if (a[sortKey] > b[sortKey]) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [leaderboard, sortKey, sortDirection]);

  const handleSort = (key) => {
    if (key === sortKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('desc');
    }
  };

  const getRankStyle = (rank) => {
    if (rank === 1) return "bg-yellow-500 text-yellow-900 border-yellow-700 shadow-xl border-4";
    if (rank === 2) return "bg-gray-300 text-gray-800 border-gray-500 shadow-lg border-2";
    if (rank === 3) return "bg-amber-700 text-amber-50 border-amber-900 shadow-md border-2";
    return "bg-gray-100 text-gray-600 border-gray-300";
  };

  const getRankIcon = (rank) => {
    if (rank <= 3) return <Award className="w-5 h-5 fill-current" />;
    return rank;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[300px] bg-indigo-50 rounded-xl">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
        <p className="ml-3 text-lg font-medium text-indigo-700">Loading Leaderboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-full min-h-[300px] bg-red-50 p-6 rounded-xl">
        <div className="text-red-600 text-xl p-8 bg-white rounded-xl shadow-lg border border-red-300">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col font-['Inter']">
      
      {/* Header (Always visible) */}
      <div className="text-center mb-4 p-4 bg-white rounded-t-2xl">
        <Zap className="w-8 h-8 text-pink-600 mx-auto mb-1" />
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
          Global Explorers
        </h1>
      </div>

      {/* Top 3 Podium Cards (Always visible) */}
      <div className="grid grid-cols-3 gap-2 px-2 sm:px-4 mb-6 flex-shrink-0">
        {[2, 1, 3].map(rank => {
          const user = sortedLeaderboard[rank - 1];
          if (!user) return <div key={rank} className="p-4 rounded-xl"></div>;

          const rankStyle = getRankStyle(rank);
          const sizeClass = rank === 1 ? "scale-105" : "scale-100";

          return (
            <div 
              key={rank} 
              className={`flex flex-col items-center p-2 sm:p-3 rounded-xl text-center transition-all duration-300 ${rankStyle} ${sizeClass}`}
              style={{ order: rank === 1 ? 2 : rank === 2 ? 1 : 3 }} 
            >
              <div className="mb-1">
                  <Award className={`w-5 h-5 ${rank === 1 ? 'text-white fill-yellow-400' : rank === 2 ? 'text-gray-500' : 'text-amber-200 fill-amber-900'}`} />
              </div>
              <h3 className="text-sm sm:text-lg font-black">{rank === 1 ? 'CHAMPION' : `Rank ${rank}`}</h3>
              <p className={`text-xs sm:text-sm font-bold truncate mt-0 ${rank > 1 ? 'text-gray-800' : 'text-gray-900'}`}>{user.name.split(' ')[0]}</p>
              <p className="text-[10px] sm:text-xs font-medium mt-0">Score: <span className="font-extrabold">{user.score}</span></p>
            </div>
          );
        })}
      </div>


      {/* Leaderboard Table Container (Scrollable) */}
      <div className="flex-grow overflow-y-auto bg-white rounded-b-2xl shadow-inner border-t-4 border-pink-500">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-indigo-50/70 sticky top-0 backdrop-blur-sm z-10">
            <tr>
              {/* Rank Header */}
              <th scope="col" className="px-4 py-2 text-left text-xs font-bold text-gray-700 uppercase tracking-wider w-[10%]">
                #
              </th>
              
              {/* Name Header */}
              <th scope="col" className="px-4 py-2 text-left text-xs font-bold text-gray-700 uppercase tracking-wider w-[60%]">
                Name
              </th>
              
              {/* Score Header (Clickable for Sorting) */}
              <th scope="col" 
                  className="px-4 py-2 text-left text-xs font-bold text-gray-700 uppercase tracking-wider cursor-pointer hover:text-indigo-600 transition w-[30%]"
                  onClick={() => handleSort('score')}
              >
                <div className="flex items-center">
                  Score
                  <ChevronDown className={`w-3 h-3 ml-1 transform ${sortKey === 'score' && sortDirection === 'desc' ? 'rotate-0' : 'rotate-180'} transition-transform ${sortKey === 'score' ? 'opacity-100 text-indigo-600' : 'opacity-30'}`} />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sortedLeaderboard.slice(3).map((user, index) => {
              const rank = index + 4;
              return (
                <tr 
                  key={user.id} 
                  className="hover:bg-indigo-50/50 transition duration-150 ease-in-out odd:bg-white even:bg-gray-50"
                >
                  {/* Rank Cell */}
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-500">
                    {rank}
                  </td>
                  
                  {/* Name Cell */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center">
                      <User className="w-4 h-4 text-teal-500 mr-2" />
                      <div className="text-sm font-medium text-gray-900 truncate max-w-[150px]">{user.name}</div>
                    </div>
                    <p className="text-[10px] text-gray-500 ml-6 truncate max-w-[150px]">Last: {user.city}</p>
                  </td>
                  
                  {/* Score Cell */}
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-extrabold text-indigo-700">
                    {user.score} <Zap className="w-3 h-3 inline-block text-pink-500 ml-1" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {sortedLeaderboard.length <= 3 && (
           <div className="p-4 text-center text-gray-500 text-sm">
              Only the top 3 explorers are currently displayed.
           </div>
        )}
      </div>
    </div>
  );
}

export default Leaderboard;
