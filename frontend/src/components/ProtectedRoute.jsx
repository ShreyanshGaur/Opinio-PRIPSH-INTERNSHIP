import { useContext } from "react";
import { Navigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { token, loading } = useContext(AuthContext);

  // 1. Wait until we are sure about the auth state
  if (loading) {
    return <div className="text-center mt-20 text-gray-500">Loading...</div>;
  }

  // 2. If no token, kick them out
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // 3. If allowed, show the protected page
  return children;
};

export default ProtectedRoute;