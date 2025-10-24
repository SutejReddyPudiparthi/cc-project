import React, { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "./AuthContext";

export default function PrivateRoute({ children, roles = [] }) {
  const { user, loadingUser } = useContext(AuthContext);
  const location = useLocation();

  if (loadingUser) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user || !user.loggedIn) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (roles.length > 0) {
    const userRoles = user.roles || user.role || [];
    const roleList = Array.isArray(userRoles)
      ? userRoles
      : String(userRoles).split(",");

    const allowed = roles.some((r) => roleList.includes(r));
    if (!allowed) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
}
