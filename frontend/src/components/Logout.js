import React from "react";

const LogoutButton = () => {
  const handleLogout = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/auth/logout", {
        method: "GET",
        credentials: "include",
      });
    console.log(res);
    } catch (err) {
      console.error("Error logging out:", err);
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
    >
      Logout
    </button>
  );
};

export default LogoutButton;
