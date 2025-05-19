import React from "react";
import { Navigate, Outlet } from "react-router-dom";

interface ProtectedRouteProps {
  allowedRoles: string[]; // Allowed roles for this route
}

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const isLoggedIn = window.localStorage.getItem("loggedIn") === "true";
  const userRole = window.localStorage.getItem("userRole");

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />; // Redirect to login if not logged in
  }

  if (!allowedRoles.includes(userRole || "")) {
    return <Navigate to="/" replace />; // Redirect to home if role is not allowed
  }

  return <Outlet />;
};

export default ProtectedRoute;
