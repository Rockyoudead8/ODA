import React, { useState, useEffect } from "react";
import { Award, Zap, ChevronDown, User, Loader2 } from "lucide-react";

const Leaderboard = ({ listingId }) => {
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sortKey, setSortKey] = useState("total");
    const [sortDirection, setSortDirection] = useState("desc");

    useEffect(() => {
        if (!listingId) return;

        const fetchLeaderboard = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(`http://localhost:8000/api/leaderboard/${listingId}`);
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || "Failed to fetch leaderboard");

                setLeaderboard(data);
            } catch (err) {
                console.error("Leaderboard fetch error:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboard();
    }, [listingId]);

    const sortedLeaderboard = React.useMemo(() => {
        if (!leaderboard.length) return [];
        return [...leaderboard].sort((a, b) => {
            if (a[sortKey] < b[sortKey]) return sortDirection === "asc" ? -1 : 1;
            if (a[sortKey] > b[sortKey]) return sortDirection === "asc" ? 1 : -1;
            return 0;
        });
    }, [leaderboard, sortKey, sortDirection]);

    const handleSort = (key) => {
        if (key === sortKey) setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        else {
            setSortKey(key);
            setSortDirection("desc");
        }
    };

    const getRankStyle = (rank) => {
        if (rank === 1) return "bg-yellow-500 text-yellow-900 border-yellow-700 shadow-xl border-4";
        if (rank === 2) return "bg-gray-300 text-gray-800 border-gray-500 shadow-lg border-2";
        if (rank === 3) return "bg-amber-700 text-amber-50 border-amber-900 shadow-md border-2";
        return "bg-gray-100 text-gray-600 border-gray-300";
    };

    if (loading) return <Loader2 className="animate-spin w-10 h-10 text-indigo-600 mx-auto" />;
    if (error) return <div className="text-red-600 text-center">{error}</div>;

    return (
        <div className="w-full h-full flex flex-col font-['Inter']">
            <div className="text-center mb-4 p-4 bg-white rounded-t-2xl">
                <Zap className="w-8 h-8 text-pink-600 mx-auto mb-1" />
                <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Global Explorers</h1>
            </div>


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
                            <Award className="w-5 h-5 mb-1 text-white fill-current" />
                            <h3 className="text-sm sm:text-lg font-black">{rank === 1 ? "CHAMPION" : `Rank ${rank}`}</h3>
                            <p className="text-xs sm:text-sm font-bold truncate mt-0">
                                {user.name || "Anonymous"}
                            </p>

                            <p className="text-[10px] sm:text-xs font-medium mt-0">Total: {user.total}</p>
                        </div>
                    );
                })}

            </div>


            <div className="flex-grow overflow-y-auto bg-white rounded-b-2xl shadow-inner border-t-4 border-pink-500">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-indigo-50/70 sticky top-0 backdrop-blur-sm z-10">
                        <tr>
                            <th>  </th>
                            <th>Name</th>
                            <th className="cursor-pointer" onClick={() => handleSort("total")}>Total <ChevronDown /></th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedLeaderboard.map((user, index) => (
                            <tr key={user.id}>
                                <td>{index + 1}</td>
                                <td className="flex items-center">
                                    <User className="w-4 h-4 text-teal-500 mr-2" />
                                    {user.name || "Anonymous"}
                                </td>
                                <td>{user.total}</td>
                            </tr>
                        ))}

                    </tbody>

                </table>
            </div>
        </div>
    );
};

export default Leaderboard;
