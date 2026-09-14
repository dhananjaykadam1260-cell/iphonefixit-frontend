import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, adminOnly = false }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  if (adminOnly && role !== "ROLE_ADMIN") {
    return <Navigate to="/admin" replace />;
  }

  return children;
}

export default ProtectedRoute;
