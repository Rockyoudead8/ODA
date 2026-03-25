import React, { createContext, useState, useEffect } from "react";
import { BACKEND_URL } from './utils/config';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkStatus = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/status`, {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error("Status check failed:", err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, loading, checkStatus }}>
      {children}
    </UserContext.Provider>
  );
};