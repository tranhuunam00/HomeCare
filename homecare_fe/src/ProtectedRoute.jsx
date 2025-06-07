import { Navigate } from "react-router-dom";
import STORAGE from "./services/storage";

const ProtectedRoute = ({ children }) => {
  const token = STORAGE.get("TOKEN");

  if (!token) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
