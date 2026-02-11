import React from "react";
import { useAuth } from "../context/AuthContext";

const RoleGate = ({ allow = [], children }) => {
  const { role } = useAuth();
  if (!allow.includes(role)) return null;
  return <>{children}</>;
};

export default RoleGate;
