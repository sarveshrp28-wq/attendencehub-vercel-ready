import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ROLE_HOME } from "../lib/constants";
import LoadingScreen from "./LoadingScreen";

const ProtectedRoute = ({ allow = [] }) => {
  const { session, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingScreen label="Checking access..." />;
  }

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!allow.includes(role)) {
    const fallback = ROLE_HOME[role] || "/unauthorized";
    return <Navigate to={fallback} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
