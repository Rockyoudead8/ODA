import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { UserContext } from "../UserContext";

function ProtectedRoute({ children }) {
  const { user, loading } = useContext(UserContext);

  if (loading) {
    return <div>Checking authentication...</div>;
  }
  // If there's no user, redirect and pass a message in the state
  if (!user) {
    return (
      <Navigate
        to="/"
        replace
        state={{ message: "You must log in to access that feature." }}
      />
    );
  }

  return children;
}

export default ProtectedRoute;