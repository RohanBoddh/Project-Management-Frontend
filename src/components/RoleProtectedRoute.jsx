import { Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

function RoleProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useContext(AuthContext);

  if (loading) return null;

  if (!user) return <Navigate to="/login" />;

  if (!allowedRoles.includes(user.role))
    return <Navigate to="/dashboard" />;

  return children;
}

export default RoleProtectedRoute;
