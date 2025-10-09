import React, { createContext, useState, useEffect } from "react";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); 

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/auth/status", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        if (res.ok) {
          const data = await res.json();
          console.log("User found:", data.user);
          setUser(data.user);
        } else {
          console.log("User not logged in");
          setUser(null);
        }
      } catch (err) {
        console.error("Status check failed:", err);
        setUser(null);
      } finally {
        setLoading(false); 
      }
    };

    checkStatus();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, loading }}>
      {children}
    </UserContext.Provider>
  );
};
