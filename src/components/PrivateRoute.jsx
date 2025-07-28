// src/components/PrivateRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";

export default function PrivateRoute({ allowedRoles, children }) {
  const role = sessionStorage.getItem("userRole");
  return allowedRoles.includes(role) ? children : <Navigate to="/" />;
}
